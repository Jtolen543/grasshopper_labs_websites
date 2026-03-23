import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { getJsonFromS3, putJsonToS3 } from "@/lib/aws/s3"
import type { Resume } from "@/app/api/parse/resumeSchema"
import { calculateResumeScoreDetailed } from "@/lib/resumeScoring"
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await request.json()
    if (!id) {
      return NextResponse.json({ success: false, error: "Submission ID is required" }, { status: 400 })
    }

    const metadataKey = `uploads/${userId}/submissions-metadata.json`
    const metadata = await getJsonFromS3<{submissions: any[]}>(metadataKey)

    if (!metadata) {
      return NextResponse.json({ success: false, error: "No submissions found" }, { status: 404 })
    }

    const targetSub = metadata.submissions.find(s => s.id === id)
    if (!targetSub) {
      return NextResponse.json({ success: false, error: "Submission not found" }, { status: 404 })
    }

    if (!targetSub.isStarred) {
      return NextResponse.json({ success: false, error: "Only starred resumes can be restored." }, { status: 400 })
    }

    const targetResumeData = await getJsonFromS3<Resume>(`uploads/${userId}/resume-data-${id}.json`)
    if (!targetResumeData) {
      return NextResponse.json({ success: false, error: "Data for this resume could not be found." }, { status: 404 })
    }

    // Restore the resume data to active
    await putJsonToS3(`uploads/${userId}/resume-data.json`, targetResumeData)

    // Restore the feedback to active (if it exists)
    const targetFeedbackData = await getJsonFromS3<any>(`uploads/${userId}/xyz-feedback-${id}.json`)
    if (targetFeedbackData) {
      await putJsonToS3(`uploads/${userId}/xyz-feedback.json`, targetFeedbackData)
    }

    const accurateScore = calculateResumeScoreDetailed(targetResumeData, targetFeedbackData).totalScore

    // Clone submission as the new active one
    const newRestoredSub = {
      ...targetSub,
      score: accurateScore,
      id: Buffer.from(targetSub.s3Key + Date.now()).toString("base64"),
      uploadedAt: new Date().toISOString(),
      isStarred: false // Allow them to independently star the restored version if they want
    }
    
    metadata.submissions.unshift(newRestoredSub)
    await putJsonToS3(`uploads/${userId}/resume-data-${newRestoredSub.id}.json`, targetResumeData)
    if (targetFeedbackData) {
      await putJsonToS3(`uploads/${userId}/xyz-feedback-${newRestoredSub.id}.json`, targetFeedbackData)
    }
    
    await putJsonToS3(metadataKey, metadata)

    return NextResponse.json({
      success: true,
      message: "Resume restored successfully",
      data: targetResumeData,
      submission: newRestoredSub
    })
  } catch (error) {
    console.error("Error restoring resume:", error)
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
}
