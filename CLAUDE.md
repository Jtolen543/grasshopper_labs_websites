# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # Start dev server with Turbopack
npm run build      # Production build (Turbopack)
npm run start      # Start production server
npm run lint       # Run ESLint
```

No test suite is configured.

## Architecture Overview

**Next.js 15 App Router** full-stack SaaS for resume analysis. All persistent data lives in **AWS S3** — there is no active database (Drizzle ORM is scaffolded but unused). Authentication is via **Clerk**.

### Data Flow

1. User uploads PDF/DOCX → `POST /api/upload` (stores raw file in S3, enforces 3 uploads/day limit)
2. `POST /api/parse` — extracts text → OpenAI GPT extracts structured data → Zod validates → saves `resume-data.json` to S3
3. `GET /api/resume` — fetches resume data; `ResumeContext` calls this on mount
4. `POST /api/analyze/xyz-batch` — GPT generates XYZ-framework feedback + actionable insights → cached in `xyz-feedback.json` on S3
5. Dashboard computes scores client-side via `src/lib/resumeScoring.ts`

### S3 Key Structure

All keys are prefixed by `uploads/{userId}/`:
- `resume-data.json` — current parsed resume (source of truth)
- `xyz-feedback.json` — cached GPT feedback (XYZ analysis + actionable insights)
- `submissions-metadata.json` — last 10 upload records
- `master-profile.json` — aggregated data across uploads
- `matched-courses.json` — UF course matching cache
- `{submissionId}/resume-data.json` — versioned snapshots

### State Management

`ResumeContext` (`src/contexts/resume-context.tsx`) is the single source of client state:
- Loads resume + XYZ feedback on mount from S3 via API routes
- Triggers lazy generation of XYZ feedback if missing
- Persists UI state (e.g., `showAiFeedback`) in localStorage
- Consumed via the `useResume()` hook — all dashboard/profile components use this

### API Route Conventions

- Auth: every route calls Clerk's `auth()` and returns 401 if unauthenticated
- Response shape: `{ success: boolean, data?: T, error?: string }`
- S3 helpers in `src/lib/aws/s3.ts`: `getJsonFromS3<T>`, `putJsonToS3`, `objectExistsInS3`, `getSignedUrlForObject`

### Resume Schema

Defined with Zod in `src/app/api/parse/resumeSchema.ts`. The `Resume` type is inferred from this schema and is the shared type used across frontend and API routes. Any structural change to the resume must start here.

### Scoring System (`src/lib/resumeScoring.ts`)

Blends quality (60%) and quantity (40%) scores per category. Category weights differ for UF vs non-UF students (coursework is UF-only at 15%). Quality scores come from `src/lib/qualityAnalysis.ts` which uses heuristic analysis per section. The scoring runs entirely client-side.

### XYZ Feedback Model

Uses `gpt-4.1-mini`. Output is Zod-validated — if the schema changes, update both the Zod schema in the route and the `XyzFeedback` type used in context. Feedback is cached in S3; to force regeneration, delete `xyz-feedback.json` for that user.

### Course Matching (`src/lib/courseMatching.ts`)

Fuzzy matching via Levenshtein distance against the UF course catalog. Courses are grouped by CS discipline. Only relevant for UF students (gated by preferences questionnaire).

## Environment Variables

See `.env.example`. Required at runtime:
- `OPENAI_API_KEY` — GPT calls
- `AWS_BUCKET_NAME`, `AWS_BUCKET_REGION`, `IAM_AWS_ACCESS_KEY`, `IAM_AWS_SECRET_ACCESS_KEY` — S3
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY` — Clerk auth

## Path Aliases

`@/*` maps to `./src/*` (configured in `tsconfig.json`).
