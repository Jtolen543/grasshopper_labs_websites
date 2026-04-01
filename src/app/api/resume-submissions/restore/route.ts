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

    // Any of the last 10 resumes can be restored now, so no isStarred check.

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
    } else {
      const { deleteFromS3 } = await import("@/lib/aws/s3")
      await deleteFromS3(`uploads/${userId}/xyz-feedback.json`).catch(() => {})
    }

    const accurateScore = calculateResumeScoreDetailed(targetResumeData, targetFeedbackData).totalScore

    // Move the restored submission to the top without counting as a new one
    metadata.submissions = metadata.submissions.filter(s => s.id !== id);
    targetSub.score = accurateScore;
    targetSub.uploadedAt = new Date().toISOString();
    
    metadata.submissions.unshift(targetSub);
    
    // limit to 10
    metadata.submissions = metadata.submissions.slice(0, 10);
    await putJsonToS3(`uploads/${userId}/resume-data-${targetSub.id}.json`, targetResumeData)
    if (targetFeedbackData) {
      await putJsonToS3(`uploads/${userId}/xyz-feedback-${targetSub.id}.json`, targetFeedbackData)
    }
    
    await putJsonToS3(metadataKey, metadata)

    return NextResponse.json({
      success: true,
      message: "Resume restored successfully",
      data: targetResumeData,
      submission: targetSub
    })
  } catch (error) {
    console.error("Error restoring resume:", error)
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
}
