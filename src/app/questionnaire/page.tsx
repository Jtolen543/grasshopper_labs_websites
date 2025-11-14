import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import QuestionnaireForm from "./_components/questionnaire-form"
import { getJsonFromS3, objectExistsInS3 } from "@/lib/aws/s3"
import type { QuestionnaireData } from "./data"

export default async function QuestionnairePage() {
  const { userId } = await auth()
  if (!userId) {
    redirect("/sign-in?redirect_url=/questionnaire")
  }

  const resumeKey = `uploads/${userId}/resume-data.json`
  const hasResume = await objectExistsInS3(resumeKey)
  if (!hasResume) {
    redirect("/")
  }

  const preferences = await getJsonFromS3<QuestionnaireData>(`uploads/${userId}/preferences.json`)

  return <QuestionnaireForm initialData={preferences} />
}
