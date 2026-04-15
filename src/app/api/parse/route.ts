import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { extractWithChatGPT } from "./semanticParse"
import { parseFileContent } from "./parseContent"
import { getBufferFromS3, objectExistsInS3, getJsonFromS3, putJsonToS3 } from "@/lib/aws/s3"
import type { Resume } from "./resumeSchema"
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { filename } = await request.json()

    if (!filename) {
      return NextResponse.json({ error: "No filename provided" }, { status: 400 })
    }

    const prefix = `uploads/${userId}/`
    if (!filename.startsWith(prefix)) {
      return NextResponse.json({ error: "Invalid file key" }, { status: 403 })
    }

    const fileExists = await objectExistsInS3(filename)
    if (!fileExists) {
      return NextResponse.json({ error: "File not found" }, { status: 404 })
    }

    const fileBuffer = await getBufferFromS3(filename)

    const content = await parseFileContent(fileBuffer, filename)

    console.log(`Parsing resume content, length: ${content.length}`)

    const data = await extractWithChatGPT(content) as Resume | null

    if (!data) {
        throw new Error("Failed to extract data from resume");
    }

    // --- Auto-merge into Master Profile ---
    try {
      const masterKey = `uploads/${userId}/master-profile.json`
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let masterProfile = await getJsonFromS3<any>(masterKey)
      
      if (!masterProfile) {
        // If no master profile exists, this parsed resume becomes the foundation
        await putJsonToS3(masterKey, data)
      } else {
        // Merge!
        let hasChanges = false
        
        // Merge experiences
        if (data.experience && Array.isArray(data.experience)) {
          for (const newExp of data.experience) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const exists = masterProfile.experience?.some((e: any) => 
              e.company?.toLowerCase().trim() === newExp.company?.toLowerCase().trim() &&
              e.position?.toLowerCase().trim() === newExp.position?.toLowerCase().trim()
            )
            if (!exists) {
              if (!masterProfile.experience) masterProfile.experience = []
              masterProfile.experience.push(newExp)
              hasChanges = true
            }
          }
        }

        // Merge projects
        if (data.projects && Array.isArray(data.projects)) {
          for (const newProj of data.projects) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const exists = masterProfile.projects?.some((p: any) => 
              p.name?.toLowerCase().trim() === newProj.name?.toLowerCase().trim()
            )
            if (!exists) {
              if (!masterProfile.projects) masterProfile.projects = []
              masterProfile.projects.push(newProj)
              hasChanges = true
            }
          }
        }

        // Merge skills
        if (data.skills) {
          if (!masterProfile.skills) masterProfile.skills = {}
          const categories = ['programming_languages', 'frameworks', 'databases', 'devops_tools', 'other'] as const
          for (const cat of categories) {
            if (data.skills[cat] && Array.isArray(data.skills[cat])) {
              const currentArray = masterProfile.skills[cat] || []
              const current = new Set(currentArray.map((s: string) => s.toLowerCase().trim()))
              const updated = [...currentArray]
              for (const skill of data.skills[cat]) {
                if (typeof skill === 'string' && !current.has(skill.toLowerCase().trim())) {
                  updated.push(skill)
                  hasChanges = true
                }
              }
              masterProfile.skills[cat] = updated
            }
          }
        }

        if (hasChanges) {
          await putJsonToS3(masterKey, masterProfile)
        }
      }
    } catch (mergeError) {
      console.error("Failed to merge into master profile:", mergeError)
      // Continue anyway, don't fail the upload
    }

    console.log("Parsing completed successfully")
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error parsing resume:", error)
    console.error("Error stack:", error instanceof Error ? error.stack : 'No stack trace');
    return NextResponse.json({ 
      error: "Failed to parse resume",
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
