import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { getJsonFromS3, putJsonToS3, deleteFromS3 } from "@/lib/aws/s3"

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const { id, starred } = await request.json()
    if (!id || typeof starred !== "boolean") {
      return NextResponse.json({ success: false, error: "Invalid parameters" }, { status: 400 })
    }

    const metadataKey = `uploads/${userId}/submissions-metadata.json`
    const metadata = await getJsonFromS3<{submissions: any[]}>(metadataKey)

    if (!metadata) {
      return NextResponse.json({ success: false, error: "No submissions found" }, { status: 404 })
    }

    const submissionIndex = metadata.submissions.findIndex(s => s.id === id)
    if (submissionIndex === -1) {
      return NextResponse.json({ success: false, error: "Submission not found" }, { status: 404 })
    }

    if (starred) {
      // Check limit
      const currentStarred = metadata.submissions.filter(s => s.isStarred).length
      if (currentStarred >= 3 && !metadata.submissions[submissionIndex].isStarred) {
        return NextResponse.json({ success: false, error: "You can only star up to 3 resumes" }, { status: 400 })
      }
      
      // If it's a past unstarred resume, check if data actually exists still:
      const resumeData = await getJsonFromS3(`uploads/${userId}/resume-data-${id}.json`)
      if (!resumeData) {
        return NextResponse.json({ success: false, error: "Data for this resume has already been deleted to save space and cannot be starred." }, { status: 400 })
      }

      metadata.submissions[submissionIndex].isStarred = true
    } else {
      metadata.submissions[submissionIndex].isStarred = false
      // For storage optimization, delete the past data when unstarred
      await deleteFromS3(`uploads/${userId}/resume-data-${id}.json`).catch(() => {})
      await deleteFromS3(`uploads/${userId}/xyz-feedback-${id}.json`).catch(() => {})
    }

    await putJsonToS3(metadataKey, metadata)

    return NextResponse.json({
      success: true,
      data: metadata.submissions[submissionIndex]
    })
  } catch (error) {
    console.error("Error toggling resume star status:", error)
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
}
