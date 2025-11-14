import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { extractWithChatGPT } from "./semanticParse"
import { extractWithRegex } from "./regexParse"
import { extractWithHuggingFace } from "./hfParse"
import { parseFileContent } from "./parseContent"
import { getBufferFromS3, objectExistsInS3 } from "@/lib/aws/s3"

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { filename, method } = await request.json()

    if (!filename) {
      return NextResponse.json({ error: "No filename provided" }, { status: 400 })
    }

    const prefix = `uploads/${userId}/`
    if (!filename.startsWith(prefix)) {
      return NextResponse.json({ error: "Invalid file key" }, { status: 403 })
    }

    const fileExists = await objectExistsInS3(filename)
    if (!fileExists) {
      return NextResponse.json({ error: "File not found" }, { status: 404 })
    }

    const fileBuffer = await getBufferFromS3(filename)

    const content = await parseFileContent(fileBuffer, filename)
    
    console.log(`Parsing with method: ${method}, content length: ${content.length}`);
    
    // Choose parsing method: 'regex', 'huggingface', or 'ai' (default)
    let data
    if (method === "regex") {
      data = extractWithRegex(content)
    } else if (method === "huggingface") {
      data = await extractWithHuggingFace(content)
    } else {
      data = await extractWithChatGPT(content)
    }
    
    console.log('Parsing completed successfully');
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error parsing resume:", error)
    console.error("Error stack:", error instanceof Error ? error.stack : 'No stack trace');
    return NextResponse.json({ 
      error: "Failed to parse resume",
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
