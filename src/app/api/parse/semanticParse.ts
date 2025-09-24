import { OpenAI } from "openai";

const JSON_FORMAT = {
  "basics": {
    "name": "string",
    "email": "string",
    "phone": "string",
    "location": {
      "city": "string",
      "state": "string",
      "country": "string"
    },
    "linkedin": "string",
    "github": "string",
    "portfolio": "string"
  },
  "education": [
    {
      "school": "string",
      "degree": "string",
      "field": "string",
      "start_date": "string",
      "end_date": "string",
      "gpa": "number",
      "achievements": ["string"]
    }
  ],
  "skills": {
    "programming_languages": ["string"],
    "frameworks": ["string"],
    "libraries": ["string"],
    "databases": ["string"],
    "devops_tools": ["string"],
    "cloud_platforms": ["string"],
    "other": ["string"]
  },
  "projects": [
    {
      "name": "string",
      "description": "string",
      "technologies": ["string"],
      "highlights": ["string"],
      "link": "string",
      "github": "string"
    }
  ],
  "experience": [
    {
      "company": "string",
      "position": "string",
      "start_date": "string",
      "end_date": "string",
      "location": "string",
      "responsibilities": ["string"],
      "achievements": ["string"],
      "technologies": ["string"]
    }
  ],
  "achievements": [
    {
      "title": "string",
      "issuer": "string",
      "date": "string",
      "description": "string"
    }
  ],
  "certifications": [
    {
      "name": "string",
      "issuer": "string",
      "date": "string",
      "credential_id": "string",
      "url": "string"
    }
  ],
  "publications": [
    {
      "title": "string",
      "publisher": "string",
      "date": "string",
      "url": "string",
      "summary": "string"
    }
  ],
  "extracurriculars": [
    {
      "organization": "string",
      "role": "string",
      "start_date": "string",
      "end_date": "string",
      "achievements": ["string"]
    }
  ]
}
const SYSTEM_PROMPT = `
You are an resume helper who is able to create structured JSON from user information. 
Given a string, provide a JSON in the following format:
${JSON_FORMAT}
If the user is missing any information in the basics and education category, create a list of the missing features. This list can be empty.
Return the final result as a JSON in this format:
{
  "details": {},
  "missing": [],
}
where "details" is the generated structured output and "missing" is the list of potential missing features from the user.
`

export const extractWithChatGPT = async (content: string) => {
  // Later I will most likely stream these results
  const client = new OpenAI()
  const response = await client.responses.create({
    model: "gpt-4.1-mini",
    input: [
      {role: "system", content: SYSTEM_PROMPT},
      {role: "user", content: `Extract the following resume into the schema: ${content}`},
    ]
  })
  return response.output_text
}