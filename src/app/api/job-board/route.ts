import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { getJsonFromS3, putJsonToS3 } from "@/lib/aws/s3"

export type JobBucket = "interested" | "applied" | "interviewing" | "offer" | "rejected"

export interface SavedJob {
  id: string
  title: string
  company: string
  location: string
  applyUrl: string
  matchScore: number
  contractType?: string
  bucket: JobBucket
  savedAt: number
}

const s3Key = (userId: string) => `uploads/${userId}/job-board.json`

async function getJobs(userId: string): Promise<SavedJob[]> {
  const data = await getJsonFromS3<{ jobs: SavedJob[] }>(s3Key(userId))
  return data?.jobs || []
}

async function persist(userId: string, jobs: SavedJob[]): Promise<void> {
  await putJsonToS3(s3Key(userId), { jobs })
}

export async function GET() {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    return NextResponse.json({ success: true, data: await getJobs(userId) })
  } catch {
    return NextResponse.json({ success: false, data: [] })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    const job: Omit<SavedJob, "savedAt"> = await request.json()
    const jobs = await getJobs(userId)
    if (jobs.some(j => j.id === job.id)) {
      return NextResponse.json({ success: true, data: jobs })
    }
    const updated = [{ ...job, savedAt: Date.now() }, ...jobs]
    await persist(userId, updated)
    return NextResponse.json({ success: true, data: updated })
  } catch {
    return NextResponse.json({ success: false, error: "Failed to save job" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    const { id, bucket }: { id: string; bucket: JobBucket } = await request.json()
    const jobs = await getJobs(userId)
    const updated = jobs.map(j => (j.id === id ? { ...j, bucket } : j))
    await persist(userId, updated)
    return NextResponse.json({ success: true, data: updated })
  } catch {
    return NextResponse.json({ success: false, error: "Failed to update job" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    const id = new URL(request.url).searchParams.get("id")
    if (!id) return NextResponse.json({ success: false, error: "No id" }, { status: 400 })
    const jobs = await getJobs(userId)
    const updated = jobs.filter(j => j.id !== id)
    await persist(userId, updated)
    return NextResponse.json({ success: true, data: updated })
  } catch {
    return NextResponse.json({ success: false, error: "Failed to remove job" }, { status: 500 })
  }
}
