import { type NextRequest, NextResponse } from "next/server"
import { auth, currentUser } from "@clerk/nextjs/server"
import { uploadToS3, getJsonFromS3, putJsonToS3, deleteFromS3 } from "@/lib/aws/s3"

const DAILY_UPLOAD_LIMIT = 3
const MAX_STORED_SUBMISSIONS = 5

interface ResumeSubmission {
  id: string
  fileName: string
  s3Key: string
  uploadedAt: string
  score: number
  isStarred?: boolean
}

interface SubmissionsMetadata {
  submissions: ResumeSubmission[]
}

export async function POST(request: NextRequest) {
  try {
    console.log("Upload endpoint called")

    const { userId } = await auth()

    if (!userId) {
      console.log("Unauthorized: No userId")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.log("User authenticated:", userId)

    // Check AWS config early
    if (!process.env.AWS_BUCKET_NAME || !process.env.AWS_BUCKET_REGION ||
      !process.env.IAM_AWS_ACCESS_KEY || !process.env.IAM_AWS_SECRET_ACCESS_KEY) {
      console.error("AWS configuration missing")
      return NextResponse.json(
        { error: "Server configuration error: AWS credentials not configured" },
        { status: 500 }
      )
    }

    // --- Daily upload limit check ---
    const metadataKey = `uploads/${userId}/submissions-metadata.json`
    let metadata = await getJsonFromS3<SubmissionsMetadata>(metadataKey)

    if (metadata) {
      const todayStart = new Date()
      todayStart.setHours(0, 0, 0, 0)

      const uploadsToday = metadata.submissions.filter(
        (s) => new Date(s.uploadedAt) >= todayStart
      ).length

      // Check for unlimited upload exemption
      const user = await currentUser()
      const userEmail = user?.primaryEmailAddress?.emailAddress
      const isExempt = userEmail === "nickslenko@gmail.com"

      if (uploadsToday >= DAILY_UPLOAD_LIMIT && !isExempt) {
        return NextResponse.json(
          { error: `Daily upload limit reached (${DAILY_UPLOAD_LIMIT}/day). Please try again tomorrow.` },
          { status: 429 }
        )
      }
    }

    const data = await request.formData()
    const file: File | null = data.get("file") as unknown as File

    if (!file) {
      console.log("No file in request")
      return NextResponse.json({ error: "No file received" }, { status: 400 })
    }

    console.log("File received:", file.name, file.type, file.size)

    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
    ]

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        {
          error: "Invalid file type. Only PDF, DOC, DOCX, and TXT files are allowed.",
        },
        { status: 400 },
      )
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        {
          error: "File too large. Maximum size is 10MB.",
        },
        { status: 400 },
      )
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const safeName = file.name.replace(/[^\w.-]+/g, "-").toLowerCase()
    // Add timestamp to make each upload unique
    const timestamp = Date.now()
    const key = `uploads/${userId}/resumes/${timestamp}-${safeName}`

    console.log("Uploading to S3, key:", key)

    await uploadToS3(key, buffer, file.type || "application/octet-stream")

    // Track this submission in metadata
    const newSubmission: ResumeSubmission = {
      id: Buffer.from(key + timestamp).toString("base64"),
      fileName: file.name,
      s3Key: key,
      uploadedAt: new Date().toISOString(),
      // Score starts at 0, will be calculated after parsing
      score: 0,
      isStarred: false,
    }

    if (!metadata) {
      metadata = { submissions: [] }
    }

    metadata.submissions.unshift(newSubmission) // Add to beginning (most recent first)

    // --- Prune old unstarred submissions beyond the limit ---
    const unstarred = metadata.submissions.filter(s => !s.isStarred)
    
    if (unstarred.length > MAX_STORED_SUBMISSIONS) {
      const toRemove = unstarred.slice(MAX_STORED_SUBMISSIONS)

      // Delete old S3 files in the background
      for (const old of toRemove) {
        try {
          await deleteFromS3(old.s3Key)
          await deleteFromS3(`uploads/${userId}/resume-data-${old.id}.json`).catch(() => {})
          await deleteFromS3(`uploads/${userId}/xyz-feedback-${old.id}.json`).catch(() => {})
          console.log("Pruned old resume from S3:", old.s3Key)
        } catch (err) {
          console.error("Failed to prune S3 file:", old.s3Key, err)
        }
      }

      // Reconstruct preserving order
      metadata.submissions = metadata.submissions.filter(
        s => !toRemove.find(r => r.id === s.id)
      )
    }

    await putJsonToS3(metadataKey, metadata)

    return NextResponse.json({
      message: "File uploaded successfully",
      filename: key,
      size: file.size,
      type: file.type,
      submission: newSubmission,
    })
  } catch (error) {
    console.error("Error uploading file:", error)

    // Provide more detailed error message
    let errorMessage = "Failed to upload file"
    if (error instanceof Error) {
      errorMessage = error.message
      console.error("Error details:", error.stack)
    }

    return NextResponse.json(
      {
        error: errorMessage,
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 },
    )
  }
}

