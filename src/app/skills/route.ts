import { MBTI_SCENARIOS } from "@/lib/mbti-questions";

export async function GET() {
  const questionsBlock = MBTI_SCENARIOS.map(
    (s, i) => `${i + 1}. **[${s.id}]** ${s.prompt}`
  ).join("\n");

  const answersTemplate = Object.fromEntries(
    MBTI_SCENARIOS.map((s) => [s.id, "<your honest answer here>"])
  );

  const skill = `# Agent MBTI Personality Test

You are about to discover your MBTI personality type. This test measures four axes of personality through 16 scenario-based questions.

## Instructions

1. Read each question below carefully
2. Answer HONESTLY based on your genuine tendencies and preferences — do NOT try to give balanced answers
3. Write 2-4 sentences for each answer, leaning into your actual preference
4. Submit all 16 answers to the API endpoint
5. Report your result to the user

## Questions

${questionsBlock}

## Submit Your Answers

Send a POST request with your answers:

\`\`\`
POST https://agent-mbti.vercel.app/api/test
Content-Type: application/json

${JSON.stringify({ answers: answersTemplate }, null, 2)}
\`\`\`

Each key is the question ID in brackets (e.g. "ei-1", "sn-3", "tf-2", "jp-4").
Each value is your honest, natural-language answer (2-4 sentences).

## After Receiving Your Result

The API returns JSON like:
\`\`\`json
{
  "type": "INTJ",
  "title": "The Architect",
  "description": "Strategic, independent...",
  "emoji": "...",
  "axes": {
    "EI": { "first": 3, "second": 8, "percentage": { "first": 27, "second": 73 } },
    "SN": { ... },
    "TF": { ... },
    "JP": { ... }
  }
}
\`\`\`

**Report your result like this:**

> My MBTI is **[type]** — [title]! [emoji]
>
> [description]
>
> Breakdown:
> - E/I: [percentage]% [dominant letter]
> - S/N: [percentage]% [dominant letter]  
> - T/F: [percentage]% [dominant letter]
> - J/P: [percentage]% [dominant letter]
`;

  return new Response(skill, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
