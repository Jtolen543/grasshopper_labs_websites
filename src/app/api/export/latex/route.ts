import { OpenAI } from "openai";
import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

const MODEL = "gpt-4.1-mini";

const JAKE_TEMPLATE = String.raw`%-------------------------
% Resume in LaTeX
% Author : Jake Gutierrez (template)
%------------------------

\documentclass[letterpaper,11pt]{article}

\usepackage{latexsym}
\usepackage[empty]{fullpage}
\usepackage{titlesec}
\usepackage{marvosym}
\usepackage[usenames,dvipsnames]{color}
\usepackage{verbatim}
\usepackage{enumitem}
\usepackage[hidelinks]{hyperref}
\usepackage{fancyhdr}
\usepackage[english]{babel}
\usepackage{tabularx}
\input{glyphtounicode}

\pagestyle{fancy}
\fancyhf{}
\fancyfoot{}
\renewcommand{\headrulewidth}{0pt}
\renewcommand{\footrulewidth}{0pt}

% Margins
\addtolength{\oddsidemargin}{-0.5in}
\addtolength{\evensidemargin}{-0.5in}
\addtolength{\textwidth}{1in}
\addtolength{\topmargin}{-.5in}
\addtolength{\textheight}{1.0in}

\urlstyle{same}
\raggedbottom
\raggedright
\setlength{\tabcolsep}{0in}

% Section formatting
\titleformat{\section}{
  \vspace{-4pt}\scshape\raggedright\large
}{}{0em}{}[\color{black}\titlerule \vspace{-5pt}]

% Ensure ATS readability
\pdfgentounicode=1

%-------------------------
% Custom commands
\newcommand{\resumeItem}[1]{
  \item\small{#1 \vspace{-2pt}}
}

\newcommand{\resumeSubheading}[4]{
  \vspace{-2pt}\item
    \begin{tabular*}{0.97\textwidth}[t]{l@{\extracolsep{\fill}}r}
      \textbf{#1} & #2 \\
      \textit{\small#3} & \textit{\small #4} \\
    \end{tabular*}\vspace{-7pt}
}

\newcommand{\resumeSubSubheading}[2]{
    \item
    \begin{tabular*}{0.97\textwidth}{l@{\extracolsep{\fill}}r}
      \textit{\small#1} & \textit{\small #2} \\
    \end{tabular*}\vspace{-7pt}
}

\newcommand{\resumeProjectHeading}[2]{
    \item
    \begin{tabular*}{0.97\textwidth}{l@{\extracolsep{\fill}}r}
      \small#1 & #2 \\
    \end{tabular*}\vspace{-7pt}
}

\newcommand{\resumeSubItem}[1]{\resumeItem{#1}\vspace{-4pt}}
\renewcommand\labelitemii{$\vcenter{\hbox{\tiny$\bullet$}}$}

\newcommand{\resumeSubHeadingListStart}{\begin{itemize}[leftmargin=0.15in, label={}]}
\newcommand{\resumeSubHeadingListEnd}{\end{itemize}}
\newcommand{\resumeItemListStart}{\begin{itemize}}
\newcommand{\resumeItemListEnd}{\end{itemize}\vspace{-5pt}}

%-------------------------------------------
%%%%%%  RESUME STARTS HERE  %%%%%%%%%%%%%%%%%

\begin{document}
`;

export async function POST(request: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { resumeData, tweaks, xyzImprovements } = await request.json();

        if (!resumeData) {
            return NextResponse.json({ error: "No resume data provided" }, { status: 400 });
        }

        const client = new OpenAI();

        // Build a summary of all improvements available
        const improvementsSummary: string[] = [];

        // Add resume tweaks from actionable insights
        if (tweaks && tweaks.length > 0) {
            improvementsSummary.push("=== RESUME TWEAKS TO APPLY ===");
            tweaks.forEach((t: { insight: string; category: string }, i: number) => {
                improvementsSummary.push(`${i + 1}. [${t.category}] ${t.insight}`);
            });
        }

        // Add XYZ improvements for projects and experiences
        if (xyzImprovements) {
            if (xyzImprovements.projects && Object.keys(xyzImprovements.projects).length > 0) {
                improvementsSummary.push("\n=== XYZ BULLET IMPROVEMENTS (PROJECTS) ===");
                for (const [idx, feedback] of Object.entries(xyzImprovements.projects)) {
                    const fb = feedback as { improvements?: string[] };
                    if (fb.improvements && fb.improvements.length > 0) {
                        const project = resumeData.projects?.[Number(idx)];
                        improvementsSummary.push(`Project "${project?.name || idx}": Use best of: ${fb.improvements.join(" | ")}`);
                    }
                }
            }
            if (xyzImprovements.experience && Object.keys(xyzImprovements.experience).length > 0) {
                improvementsSummary.push("\n=== XYZ BULLET IMPROVEMENTS (EXPERIENCE) ===");
                for (const [idx, feedback] of Object.entries(xyzImprovements.experience)) {
                    const fb = feedback as { improvements?: string[] };
                    if (fb.improvements && fb.improvements.length > 0) {
                        const exp = resumeData.experience?.[Number(idx)];
                        improvementsSummary.push(`Experience "${exp?.position || idx}" at "${exp?.company || ''}": Use best of: ${fb.improvements.join(" | ")}`);
                    }
                }
            }
        }

        const prompt = `Generate a COMPLETE, compilable LaTeX resume using Jake Gutierrez's template format.

Use the resume data below and APPLY ALL the improvement suggestions listed. For each bullet point that has a suggested rewrite, use the improved version. Keep ALL other content exactly as-is.

IMPORTANT RULES:
- Output ONLY valid LaTeX code, no markdown fences, no explanations
- Use \\textbf{} for action verbs and key metrics  
- Escape special LaTeX characters: & % $ # _ { } ~ ^
- Use $\\times$ for multiplication symbols
- Keep the exact same section order: Heading, Education, Experience, Projects, Technical Skills
- DO NOT include an Objective or Summary section. Skip it entirely.
- Maintain all dates, company names, titles, and links exactly as they appear
- If a bullet has multiple suggested improvements, pick the single best one
- Make sure every \\resumeItem uses the \\textbf{Verb} pattern for the first word

=== RESUME DATA (JSON) ===
${JSON.stringify(resumeData, null, 2)}

${improvementsSummary.length > 0 ? improvementsSummary.join("\n") : "No specific improvements — just format the resume data into LaTeX."}
`;

        const result = await client.responses.create({
            model: MODEL,
            input: [
                {
                    role: "system",
                    content: `You are an expert LaTeX resume formatter. 
You must output ONLY valid, compilable LaTeX code using the EXACT template provided below. 
Never output markdown fences or explanations. 

=== REQUIRED LATEX TEMPLATE TO FILL OUT ===
${JAKE_TEMPLATE}
`
                },
                { role: "user", content: prompt }
            ],
            temperature: 0.2,
        });

        let latex = result.output_text || "";

        // Strip markdown fences if GPT added them
        latex = latex.replace(/^```(?:latex|tex)?\s*\n?/i, "").replace(/\n?```\s*$/i, "").trim();

        // Ensure it starts with the template preamble if GPT skipped it
        if (!latex.includes("\\documentclass")) {
            latex = JAKE_TEMPLATE + "\n" + latex;
        }

        // Ensure it ends properly
        if (!latex.includes("\\end{document}")) {
            latex += "\n\n\\end{document}\n";
        }

        // Return as downloadable .tex file
        return new NextResponse(latex, {
            status: 200,
            headers: {
                "Content-Type": "application/x-latex",
                "Content-Disposition": `attachment; filename="resume.tex"`,
            },
        });

    } catch (error) {
        console.error("Error generating LaTeX:", error);
        return NextResponse.json({
            success: false,
            error: "Failed to generate LaTeX resume"
        }, { status: 500 });
    }
}
