import { OpenAI } from "openai";
import ResumeSchema from "./resumeSchema";
import { z } from "zod";
import { zodTextFormat } from "openai/helpers/zod.mjs";

const ResultSchema = z.object({
  details: ResumeSchema,
  missing: z.array(z.string())
})

const SYSTEM_PROMPT = `
You are a resume helper who creates structured JSON. 
Return:
{
  "details": {},   // must match provided schema
  "missing": []    // required basics/education fields that are absent
}
`

export const extractWithChatGPT = async (content: string) => {
  try {
    const client = new OpenAI()
    const result = await client.responses.parse({
      model: "gpt-4.1-mini",
      input: [
        {role: "system", content: SYSTEM_PROMPT},
        {role: "user", content: `Extract the following resume: ${content}`},
      ],
      text: {
        format: zodTextFormat(ResultSchema, "results")
      }
    })
    return result.output_parsed 
  } catch (e) {
    console.log(e)
  }
}