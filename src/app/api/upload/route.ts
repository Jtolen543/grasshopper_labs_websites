import { type NextRequest, NextResponse } from "next/server"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"
import { existsSync } from "fs"

export async function POST(request: NextRequest) {
  try {
    const data = await request.formData()
    const file: File | null = data.get("file") as unknown as File

    if (!file) {
      return NextResponse.json({ error: "No file received" }, { status: 400 })
    }

    // Validate file type
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

    const uploadsDir = join(process.cwd(), "uploads")
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true })
    }

    const filepath = join(uploadsDir, file.name)

    // Write the file
    await writeFile(filepath, buffer)

    return NextResponse.json({
      message: "File uploaded successfully",
      filename: file.name,
      size: file.size,
      type: file.type,
    })
  } catch (error) {
    console.error("Error uploading file:", error)
    return NextResponse.json(
      {
        error: "Failed to upload file",
      },
      { status: 500 },
    )
  }
}
