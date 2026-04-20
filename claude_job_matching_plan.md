# Live Job Matching Implementation Plan (RAG Pipeline)

## 📌 Context
Currently, the application uses `gpt-4.1-mini` to evaluate a resume against a *single* job description (via the `/api/match/route.ts` `compare` mode). 
The goal is to scale this up so we can pull 50-100 live job postings based on the user's preferences, algorithmically find the best matches out of that pool, and present them. Running the existing LLM prompt against all 100 jobs is too slow and expensive, so we must use a two-stage Retrieval-Augmented Generation (RAG) architecture.

---

## 🛠️ Technology Stack Recommendations

1. **Job Ingestion (Data Source):** Use the **Jooble API**, **Adzuna API**, or **SerpApi (Google Jobs)** to pull structured JSON job postings.
2. **Embeddings Model:** `text-embedding-3-small` (OpenAI).
3. **Vector Database:** **Use In-Memory array mapping for V1.** You only receive 50-100 jobs directly from the API request per user session, so saving 100 vectors into Pinecone or Supabase is unnecessary overhead. We will do Cosine Similarity directly in Next.js memory.
4. **LLM Re-Ranking Model:** `gpt-4.1-mini` (OpenAI), using the exact same Zod schema prompt already implemented in the `compare` endpoint.

---

## 🚀 Two-Stage Matching Architecture

### Stage 1: Fast Vector Similarity (The Filter)
LLMs are too slow for searching through hundreds of items. We will use math instead.
1. When a user parses their resume, generate a math vector for their `resumeSummary` using the `text-embedding-3-small` model.
2. When the user requests Live Jobs, hit the Job API (e.g. Jooble) with their `preferences`. It returns 100 jobs.
3. Batch generate embeddings for the 100 job descriptions (this takes < 1 second and costs < $0.01).
4. Run a **Cosine Similarity Math Algorithm** to compare the 100 Job Embeddings to the 1 Resume Embedding. Sort the array so the highest scoring jobs are at the top.

### Stage 2: LLM Re-Ranking (The Evaluator)
Math gives us the relevance, but the LLM gives us the human feedback and gap analysis.
1. Take ONLY the **Top 5 to 10** jobs from Stage 1. 
2. Pass these top jobs into our existing `gpt-4.1-mini` `compare` prompt sequentially or in parallel.
3. Return the rich feedback (`overallMatch` score, `skillsMatch`, `strengths`, `gaps`) to the frontend for these top jobs.

---

## 💻 Existing Scaffolding (What is Already Built)
To save time, the groundwork has already been laid out in the project:

### 1. The Embeddings Generator
Look at `src/lib/embeddings.ts`. It exports `generateEmbedding(text: string)`. You can use this to generate the vectors for both the resume summary and the incoming job descriptions.

### 2. The Vector Search Algorithm
Look at `src/lib/vectorSearch.ts`. It exports `searchSimilarDocuments(queryVector, documents, topK)`. You will map the ingested Job API array into this function, and it will instantly sort and return your top 10 matches.

---

## ✅ Claude's Task List

1. [ ] **Integrate Job Source:** Implement a function to call the Job API (e.g. Adzuna/Jooble) taking `preferences` (like industry or location) to return live job listings.
2. [ ] **Embed the Resume:** In `api/resume/route.ts` (or wherever the parsed resume is finalized), call `generateEmbedding` the `resumeSummary` text and attach the `[number]` array to the saved `resume-data.json`.
3. [ ] **Build the Pipeline Endpoint:** Create an endpoint (e.g., `api/match-live/route.ts`) that:
    - Fetches jobs from the API.
    - Loops over the job descriptions and runs `generateEmbedding` on them.
    - Calls `searchSimilarDocuments` using the Resume's saved vector vs the Job Vectors. 
4. [ ] **Wire the LLM:** Take the top 10 results from `searchSimilarDocuments` and process them through the existing `CompareResultSchema` logic in `api/match/route.ts` to get human-readable matching feedback.
