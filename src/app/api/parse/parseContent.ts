import { readFile } from "fs/promises"
import PdfParse from "pdf-parse"
import mammoth from "mammoth"

export async function parseFileContent(filepath: string, filename: string): Promise<string> {
  try {
    const extension = filename.split(".").pop()?.toLowerCase()
    let fileType = "text/plain"
    if (extension === "pdf") {
      fileType = "application/pdf"
    } else if (extension === "doc") {
      fileType = "application/msword"
    } else if (extension === "docx") {
      fileType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    }
    if (fileType === "text/plain") {
      return await readFile(filepath, "utf-8")
    }

    if (fileType === "application/pdf") {
      const buffer = await readFile(filepath)
      const document = (await PdfParse(buffer)).text
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