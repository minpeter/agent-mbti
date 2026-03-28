import { NextRequest } from "next/server";
import { scoreTest } from "@/lib/mbti-scorer";
import { MBTI_SCENARIOS } from "@/lib/mbti-questions";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { answers } = body as { answers?: Record<string, string> };

    if (!answers || typeof answers !== "object") {
      return Response.json(
        { error: "Missing 'answers' object. Expected: { answers: { \"ei-1\": \"your answer\", ... } }" },
        { status: 400 }
      );
    }

    const validIds = new Set(MBTI_SCENARIOS.map((s) => s.id));
    const providedIds = Object.keys(answers);
    const invalidIds = providedIds.filter((id) => !validIds.has(id));

    if (invalidIds.length > 0) {
      return Response.json(
        { error: `Invalid question IDs: ${invalidIds.join(", ")}` },
        { status: 400 }
      );
    }

    if (providedIds.length < 16) {
      return Response.json(
        { error: `Expected 16 answers, got ${providedIds.length}. Missing: ${MBTI_SCENARIOS.filter((s) => !answers[s.id]).map((s) => s.id).join(", ")}` },
        { status: 400 }
      );
    }

    const result = scoreTest(answers);
    return Response.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return Response.json({ error: message }, { status: 500 });
  }
}
