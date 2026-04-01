import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { getJsonFromS3, putJsonToS3 } from "@/lib/aws/s3"

interface UserSettings {
  dataSharing: boolean
}

const DEFAULT_SETTINGS: UserSettings = {
  dataSharing: false,
}

const settingsKey = (userId: string) => `uploads/${userId}/settings.json`

export async function GET() {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const settings = await getJsonFromS3<UserSettings>(settingsKey(userId))

    return NextResponse.json({
      success: true,
      data: settings ?? DEFAULT_SETTINGS,
    })
  } catch (error) {
    console.error("Error loading settings:", error)
    return NextResponse.json(
      { success: false, error: "Failed to load settings" },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const payload = await request.json()

    const settings: UserSettings = {
      dataSharing: typeof payload.dataSharing === "boolean" ? payload.dataSharing : false,
    }

    await putJsonToS3(settingsKey(userId), settings)

    return NextResponse.json({
      success: true,
      data: settings,
    })
  } catch (error) {
    console.error("Error saving settings:", error)
    return NextResponse.json(
      { success: false, error: "Failed to save settings" },
      { status: 500 }
    )
  }
}
