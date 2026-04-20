import { getJsonFromS3, putJsonToS3 } from "@/lib/aws/s3"

export type LimitKey = "analyzeMatch" | "tailorResume"

interface DailyCount {
  date: string
  count: number
}

interface UsageData {
  analyzeMatch: DailyCount
  tailorResume: DailyCount
}

const LIMITS: Record<LimitKey, number> = {
  analyzeMatch: 10,
  tailorResume: 10,
}

function isOwner(userId: string): boolean {
  const ownerId = process.env.OWNER_CLERK_USER_ID
  return !!ownerId && userId === ownerId
}

function todayStr(): string {
  return new Date().toISOString().split("T")[0]
}

async function readUsage(userId: string): Promise<UsageData> {
  const today = todayStr()
  const stored = await getJsonFromS3<UsageData>(`uploads/${userId}/usage-limits.json`)
  return {
    analyzeMatch: stored?.analyzeMatch?.date === today ? stored.analyzeMatch : { date: today, count: 0 },
    tailorResume: stored?.tailorResume?.date === today ? stored.tailorResume : { date: today, count: 0 },
  }
}

/** Returns { allowed, remaining } and increments counter if allowed. Owner always allowed. */
export async function checkAndIncrementLimit(
  userId: string,
  key: LimitKey
): Promise<{ allowed: boolean; remaining: number }> {
  if (isOwner(userId)) return { allowed: true, remaining: 999 }

  const usage = await readUsage(userId)
  const limit = LIMITS[key]
  const current = usage[key]

  if (current.count >= limit) {
    return { allowed: false, remaining: 0 }
  }

  usage[key] = { date: todayStr(), count: current.count + 1 }
  await putJsonToS3(`uploads/${userId}/usage-limits.json`, usage)

  return { allowed: true, remaining: limit - usage[key].count }
}

export async function getUsageSummary(userId: string) {
  if (isOwner(userId)) {
    return {
      analyzeMatch: { used: 0, limit: 999, remaining: 999 },
      tailorResume: { used: 0, limit: 999, remaining: 999 },
      isOwner: true,
    }
  }

  const usage = await readUsage(userId)
  return {
    analyzeMatch: {
      used: usage.analyzeMatch.count,
      limit: LIMITS.analyzeMatch,
      remaining: Math.max(0, LIMITS.analyzeMatch - usage.analyzeMatch.count),
    },
    tailorResume: {
      used: usage.tailorResume.count,
      limit: LIMITS.tailorResume,
      remaining: Math.max(0, LIMITS.tailorResume - usage.tailorResume.count),
    },
    isOwner: false,
  }
}
