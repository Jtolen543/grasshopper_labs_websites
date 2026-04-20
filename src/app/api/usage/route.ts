import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { getUsageSummary } from "@/lib/usageLimits"

export async function GET(_request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })

    const summary = await getUsageSummary(userId)
    return NextResponse.json({ success: true, data: summary })
  } catch (error) {
    console.error("usage route error:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch usage" }, { status: 500 })
  }
}
