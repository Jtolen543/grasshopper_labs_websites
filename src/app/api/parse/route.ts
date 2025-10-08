import { type NextRequest, NextResponse } from "next/server"
import { join } from "path"
import { existsSync } from "fs"
import { extractWithChatGPT } from "./semanticParse"
import { extractWithRegex } from "./regexParse"
import { parseFileContent } from "./parseContent"

export async function POST(request: NextRequest) {
  try {
    const { filename, method } = await request.json()

    if (!filename) {
      return NextResponse.json({ error: "No filename provided" }, { status: 400 })
    }

    const filepath = join(process.cwd(), "uploads", filename)

    if (!existsSync(filepath)) {
      return NextResponse.json({ error: "File not found" }, { status: 404 })
    }

    const content = await parseFileContent(filepath, filename)
    
    // Choose parsing method: 'regex' or 'ai' (default)
    let data
    if (method === "regex") {
      data = extractWithRegex(content)
    } else {
      data = await extractWithChatGPT(content)
    }
    
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error parsing resume:", error)
    return NextResponse.json({ error: "Failed to parse resume" }, { status: 500 })
  }
}
