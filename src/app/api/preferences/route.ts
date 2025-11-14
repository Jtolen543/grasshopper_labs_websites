import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { getJsonFromS3, putJsonToS3 } from "@/lib/aws/s3"
import { questionnaireSchema, type QuestionnaireData } from "@/app/questionnaire/data"

const preferencesKey = (userId: string) => `uploads/${userId}/preferences.json`

export async function GET() {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ success: false, data: null, error: "Unauthorized" }, { status: 401 })
    }

    const data = await getJsonFromS3<QuestionnaireData>(preferencesKey(userId))

    return NextResponse.json({
      success: true,
      data,
    })
  } catch (error) {
    console.error("Error loading preferences:", error)
    return NextResponse.json(
      {
        success: false,
        data: null,
        error: "Failed to load preferences",
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const payload = await request.json()
    const preferences = questionnaireSchema.parse(payload)

    await putJsonToS3(preferencesKey(userId), preferences)

    return NextResponse.json({
      success: true,
      message: "Preferences saved successfully",
    })
  } catch (error) {
    console.error("Error saving preferences:", error)
    const status = error instanceof Error && "issues" in error ? 400 : 500

    return NextResponse.json(
      {
        success: false,
        error: status === 400 ? "Invalid preferences payload" : "Failed to save preferences",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status },
    )
  }
}
