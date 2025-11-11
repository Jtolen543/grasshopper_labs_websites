import { type NextRequest, NextResponse } from "next/server"
import { writeFile, readFile, mkdir } from "fs/promises"
import { join } from "path"
import { existsSync } from "fs"

const RESUME_DATA_DIR = join(process.cwd(), "data")
const RESUME_DATA_FILE = join(RESUME_DATA_DIR, "resume-data.json")
const MATCHED_COURSES_FILE = join(RESUME_DATA_DIR, "matched-courses.json")

// Ensure data directory exists
async function ensureDataDir() {
  if (!existsSync(RESUME_DATA_DIR)) {
    await mkdir(RESUME_DATA_DIR, { recursive: true })
  }
}

// POST - Save resume data
export async function POST(request: NextRequest) {
  try {
    const resumeData = await request.json()

    await ensureDataDir()
    await writeFile(RESUME_DATA_FILE, JSON.stringify(resumeData, null, 2), "utf-8")

    return NextResponse.json({ 
      success: true, 
      message: "Resume data saved successfully" 
    })
  } catch (error) {
    console.error("Error saving resume data:", error)
    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to save resume data",
        message: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}

// GET - Load resume data
export async function GET() {
  try {
    await ensureDataDir()

    if (!existsSync(RESUME_DATA_FILE)) {
      return NextResponse.json({ 
        success: false, 
        data: null,
        message: "No resume data found" 
      })
    }

    const data = await readFile(RESUME_DATA_FILE, "utf-8")
    const resumeData = JSON.parse(data)

    return NextResponse.json({ 
      success: true, 
      data: resumeData 
    })
  } catch (error) {
    console.error("Error loading resume data:", error)
    return NextResponse.json(
      { 
        success: false, 
        data: null,
        error: "Failed to load resume data",
        message: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}

// DELETE - Clear resume data
export async function DELETE() {
  try {
    if (existsSync(RESUME_DATA_FILE)) {
      await writeFile(RESUME_DATA_FILE, JSON.stringify(null), "utf-8")
    }
    
    // Also clear matched courses when resume is deleted
    if (existsSync(MATCHED_COURSES_FILE)) {
      await writeFile(MATCHED_COURSES_FILE, JSON.stringify(null), "utf-8")
    }

    return NextResponse.json({ 
      success: true, 
      message: "Resume data and matched courses cleared successfully" 
    })
  } catch (error) {
    console.error("Error clearing resume data:", error)
    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to clear resume data",
        message: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}
