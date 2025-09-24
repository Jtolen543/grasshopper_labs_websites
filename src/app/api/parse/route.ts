import { type NextRequest, NextResponse } from "next/server"
import { readFile } from "fs/promises"
import { join } from "path"
import { existsSync } from "fs"
import pdf from "pdf-parse"
import mammoth from "mammoth"
import { extractWithProgramming } from "./manualParse"

async function parseFileContent(filepath: string, fileType: string): Promise<string> {
  try {
    if (fileType === "text/plain") {
      return await readFile(filepath, "utf-8")
    }

    if (fileType === "application/pdf") {
      const buffer = await readFile(filepath)
      const document = (await pdf(buffer)).text
      return document 
    }

    if (fileType.includes("word") || fileType.includes("document")) {
      const buffer = await readFile(filepath)
      const document = (await mammoth.extractRawText({buffer})).value
      return document
    }

    return ""
  } catch (error) {
    console.error("Error parsing file:", error)
    return ""
  }
}

export async function POST(request: NextRequest) {
  try {
    const { filename, pipeline } = await request.json()

    if (!filename) {
      return NextResponse.json({ error: "No filename provided" }, { status: 400 })
    }

    const filepath = join(process.cwd(), "uploads", filename)
    console.log(filepath)

    if (!existsSync(filepath)) {
      return NextResponse.json({ error: "File not found" }, { status: 404 })
    }

    const extension = filename.split(".").pop()?.toLowerCase()
    let fileType = "text/plain"

    if (extension === "pdf") {
      fileType = "application/pdf"
    } else if (extension === "doc") {
      fileType = "application/msword"
    } else if (extension === "docx") {
      fileType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    }

    const content = await parseFileContent(filepath, fileType)
    if (pipeline == "AI") {
      return NextResponse.json({
        filename
      })
    } else {
      const data = extractWithProgramming(content)
      return NextResponse.json({
        ...data, filename
      })
    }


  } catch (error) {
    console.error("Error parsing resume:", error)
    return NextResponse.json({ error: "Failed to parse resume" }, { status: 500 })
  }
}
