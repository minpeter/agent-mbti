import { NextRequest } from "next/server";
import { analyzeAgent } from "@/lib/mbti-analyzer";
import { MBTI_TYPE_DESCRIPTIONS } from "@/lib/mbti-questions";

export const maxDuration = 120;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { endpoint, apiKey, model } = body as {
      endpoint?: string;
      apiKey?: string;
      model?: string;
    };

    if (!endpoint) {
      return Response.json({ error: "endpoint is required" }, { status: 400 });
    }

    try {
      new URL(endpoint);
    } catch {
      return Response.json({ error: "Invalid URL format" }, { status: 400 });
    }

    const result = await analyzeAgent(endpoint, apiKey, model);
    const typeInfo = MBTI_TYPE_DESCRIPTIONS[result.type] ?? {
      title: "Unknown",
      description: "Could not determine personality type.",
      emoji: "❓",
    };

    return Response.json({
      type: result.type,
      ...typeInfo,
      axes: result.axes,
      totalQuestions: result.responses.length,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return Response.json({ error: message }, { status: 500 });
  }
}
