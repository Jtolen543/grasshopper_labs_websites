import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { getJsonFromS3, putJsonToS3 } from "@/lib/aws/s3"
import type { Resume } from "@/app/api/parse/resumeSchema"

export async function GET() {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const masterKey = `uploads/${userId}/master-profile.json`
    let masterProfile = await getJsonFromS3<Resume>(masterKey)

    if (!masterProfile) {
        // If they don't have a master profile, try to initialize it from their most recent resume data
        const resumeData = await getJsonFromS3<Resume>(`uploads/${userId}/resume-data.json`)
        
        if (resumeData) {
            masterProfile = resumeData
            // Strip out resume-specific identifiers if necessary, though it's structurally the same
            await putJsonToS3(masterKey, masterProfile)
        } else {
            // Give them a completely blank slate initialized state
            masterProfile = {
                basics: {
                    name: "",
                    email: "",
                    phone: "",
                    location: { city: "", state: "", country: "" },
                    linkedin: "",
                    github: "",
                    portfolio: ""
                },
                education: [],
                experience: [],
                projects: [],
                skills: {
                    programming_languages: [],
                    frameworks: [],
                    libraries: [],
                    databases: [],
                    devops_tools: [],
                    cloud_platforms: [],
                    other: []
                },
                certifications: [],
                achievements: [],
                publications: [],
                extracurriculars: []
            }
        }
    }

    return NextResponse.json({
        success: true,
        data: masterProfile
    })
  } catch (error) {
    console.error("Error fetching master profile:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch master profile" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
    try {
        const { userId } = await auth()
        if (!userId) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
        }

        const data: Resume = await request.json()
        const masterKey = `uploads/${userId}/master-profile.json`
        
        await putJsonToS3(masterKey, data)

        return NextResponse.json({
            success: true,
            data
        })

    } catch (error) {
        console.error("Error saving master profile:", error)
        return NextResponse.json({ success: false, error: "Failed to save master profile" }, { status: 500 })
    }
}
