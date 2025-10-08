import { getResumeObject } from "./resumeSchema"

export const extractWithProgramming = (content: string) => {
  console.log(content)
  const resume = getResumeObject()
  const wordCount = content.split(/\s+/).filter((word) => word.length > 0).length
  const hasContactInfo = /\b[\w._%+-]+@[\w.-]+\.[A-Z|a-z]{2,}\b/.test(content)
  const hasPhoneNumber = /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/.test(content)

  // let gpas = []
  // let match;
  // const regex = /[gG][pP][aA]\s*[:\-]?\s*([0-4](?:\.\d{1,2})?)(?:\s*\/\s*([0-4](?:\.\d{1,2})?))?/g;
  // while ((match = regex.exec(content)) !== null) {
  //   const numerator = match[1]
  //   const denominator = match[2]

  //   const current = parseFloat(numerator)
  //   const scale = denominator ? parseFloat(denominator) : 4.0
  //   gpas.push(`${current}/${scale}`);
  // }

  return {}
}