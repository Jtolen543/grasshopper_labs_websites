import { type NextRequest, NextResponse } from "next/server"
import { join } from "path"
import { existsSync } from "fs"
import { extractWithChatGPT } from "./semanticParse"
import { extractWithProgramming } from "./manualParse"
import { parseFileContent } from "./parseContent"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const filename = body.filename
    const method = body.manual ? "Programming" : "LLM"

    if (!filename) {
      return NextResponse.json({ error: "No filename provided" }, { status: 400 })
    }

    const filepath = join(process.cwd(), "uploads", filename)

    if (!existsSync(filepath)) {
      return NextResponse.json({ error: "File not found" }, { status: 404 })
    }

    const content = await parseFileContent(filepath, filename)
    let data;
    if (method === "Programming") data = extractWithProgramming(content)
    else data = await extractWithChatGPT(content)

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error parsing resume:", error)
    return NextResponse.json({ error: "Failed to parse resume" }, { status: 500 })
  }
}
