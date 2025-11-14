import PdfParse from "pdf-parse"
import mammoth from "mammoth"

export async function parseFileContent(fileBuffer: Buffer, filename: string): Promise<string> {
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
      return fileBuffer.toString("utf-8")
    }
 
    if (fileType === "application/pdf") {
      const document = (await PdfParse(fileBuffer)).text
      return document 
    }

    if (fileType.includes("word") || fileType.includes("document")) {
      const document = (await mammoth.extractRawText({buffer: fileBuffer})).value
      return document
    }

    return ""
  } catch (error) {
    console.error("Error parsing file:", error)
    return ""
  }
}
