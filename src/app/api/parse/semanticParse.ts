import { OpenAI } from "openai";
import ResumeSchema from "./resumeSchema";
import { z } from "zod";
import { zodTextFormat } from "openai/helpers/zod.mjs";

const ResultSchema = z.object({
  details: ResumeSchema,
  missing: z.array(z.string())
})

const modelPricing = {
  "gpt-4.1-mini": {input: .4, output: 1.6},
  "gpt-5-nano": {input: .05, output: .4},
  "gpt-5-mini": {input: .25, output: 2.0}
}
const MODEL = "gpt-4.1-mini"


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
      model: MODEL,
      input: [
        {role: "system", content: SYSTEM_PROMPT},
        {role: "user", content: `Extract the following resume: ${content}`},
      ],
      text: {
        format: zodTextFormat(ResultSchema, "results")
      }
    })

    if (result.usage) {
      const { input_tokens, output_tokens, total_tokens } = result.usage

      console.log(`Total tokens generated: ${total_tokens}`)

      const inputCost = (input_tokens / 1_000_000) * modelPricing[MODEL]["input"]
      const outputCost = (output_tokens / 1_000_000) * modelPricing[MODEL]["output"]
      const price = inputCost + outputCost

      console.log(`Input tokens: ${input_tokens}, Output tokens: ${output_tokens}`)
      console.log(`Total price of API call: $${price.toFixed(6)}`)
    }

    // Log the full result to understand the structure
    console.log("OpenAI result structure:", JSON.stringify(result, null, 2).substring(0, 1000))
    
    // Extract the parsed data from the OpenAI response
    // The result.output is an array of messages
    let parsedData: z.infer<typeof ResultSchema> | undefined
    
    if (result.output && Array.isArray(result.output) && result.output.length > 0) {
      const firstOutput = result.output[0]
      console.log("First output type:", firstOutput.type)
      
      // For message type, check the content array
      if (firstOutput.type === 'message' && 'content' in firstOutput) {
        const content = firstOutput.content
        console.log("Message content:", JSON.stringify(content).substring(0, 500))
        
        // Content is an array, find the text content
        if (Array.isArray(content)) {
          // Look for either 'text' or 'output_text' type
          const textContent = content.find((item: any) => item.type === 'text' || item.type === 'output_text')
          if (textContent && 'text' in textContent) {
            console.log("Found text content:", textContent.text.substring(0, 500))
            try {
              parsedData = JSON.parse(textContent.text)
              console.log("Successfully parsed JSON from text content")
            } catch (e) {
              console.error("Failed to parse JSON from text content:", e)
            }
          } else {
            console.error("No text or output_text item found in content array")
          }
        } else {
          console.error("Content is not an array:", typeof content)
        }
      } else {
        console.error("First output is not a message or has no content")
      }
    } else {
      console.error("No output array in result")
    }
    
    if (!parsedData) {
      console.error("Could not extract parsed data from OpenAI response")
      return { details: null, missing: ["Failed to extract data from AI response"] }
    }
    
    console.log("AI parsing successful, returning:", JSON.stringify(parsedData).substring(0, 300))
    return parsedData
  } catch (e) {
    console.error("Error in extractWithChatGPT:", e)
    return { details: null, missing: ["AI parsing error: " + (e instanceof Error ? e.message : "Unknown error")] }
  }
}