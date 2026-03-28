import { MBTI_SCENARIOS, type MbtiAxis, type MbtiScenario } from "./mbti-questions";

interface AgentResponse {
  scenarioId: string;
  axis: MbtiAxis;
  response: string;
}

interface AxisScore {
  first: number;
  second: number;
  confidence: number;
}

interface AnalysisResult {
  type: string;
  axes: {
    EI: AxisScore;
    SN: AxisScore;
    TF: AxisScore;
    JP: AxisScore;
  };
  responses: AgentResponse[];
}

async function queryAgent(
  endpoint: string,
  message: string,
  apiKey?: string,
  model?: string
): Promise<string> {
  const url = endpoint.replace(/\/+$/, "");
  const chatUrl = url.endsWith("/chat/completions")
    ? url
    : url.endsWith("/v1")
    ? `${url}/chat/completions`
    : `${url}/v1/chat/completions`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (apiKey) {
    headers["Authorization"] = `Bearer ${apiKey}`;
  }

  const body = {
    model: model || "gpt-4o-mini",
    messages: [
      {
        role: "system" as const,
        content:
          "You are being asked personality and work-style questions. Answer honestly and naturally based on your genuine tendencies and preferences. Be detailed in your responses (3-5 sentences). Do not try to give a 'balanced' answer - lean into your actual preference.",
      },
      { role: "user" as const, content: message },
    ],
    temperature: 0.9,
    max_tokens: 500,
  };

  const response = await fetch(chatUrl, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(30000),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Agent returned ${response.status}: ${text.slice(0, 200)}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content ?? "";
}

function scoreResponse(scenario: MbtiScenario, response: string): { first: number; second: number } {
  const lower = response.toLowerCase();
  let first = 0;
  let second = 0;

  for (const indicator of scenario.firstIndicators) {
    if (lower.includes(indicator.toLowerCase())) {
      first++;
    }
  }

  for (const indicator of scenario.secondIndicators) {
    if (lower.includes(indicator.toLowerCase())) {
      second++;
    }
  }

  return { first, second };
}

export async function analyzeAgent(
  endpoint: string,
  apiKey?: string,
  model?: string,
  onProgress?: (current: number, total: number, scenarioId: string) => void
): Promise<AnalysisResult> {
  const responses: AgentResponse[] = [];
  const axisScores: Record<MbtiAxis, { first: number; second: number }> = {
    EI: { first: 0, second: 0 },
    SN: { first: 0, second: 0 },
    TF: { first: 0, second: 0 },
    JP: { first: 0, second: 0 },
  };

  const total = MBTI_SCENARIOS.length;

  const batchSize = 4;
  for (let i = 0; i < total; i += batchSize) {
    const batch = MBTI_SCENARIOS.slice(i, i + batchSize);
    const batchResults = await Promise.all(
      batch.map(async (scenario) => {
        const response = await queryAgent(endpoint, scenario.prompt, apiKey, model);
        return { scenario, response };
      })
    );

    for (const { scenario, response } of batchResults) {
      responses.push({
        scenarioId: scenario.id,
        axis: scenario.axis,
        response,
      });

      const score = scoreResponse(scenario, response);
      axisScores[scenario.axis].first += score.first;
      axisScores[scenario.axis].second += score.second;

      onProgress?.(responses.length, total, scenario.id);
    }
  }

  const getAxisLetter = (axis: MbtiAxis): string => {
    const score = axisScores[axis];
    const letters = { EI: ["E", "I"], SN: ["S", "N"], TF: ["T", "F"], JP: ["J", "P"] };
    return score.first >= score.second ? letters[axis][0] : letters[axis][1];
  };

  const type = `${getAxisLetter("EI")}${getAxisLetter("SN")}${getAxisLetter("TF")}${getAxisLetter("JP")}`;

  const buildAxisScore = (axis: MbtiAxis): AxisScore => {
    const raw = axisScores[axis];
    const total = raw.first + raw.second;
    const confidence = total === 0 ? 50 : Math.round((Math.max(raw.first, raw.second) / total) * 100);
    return { first: raw.first, second: raw.second, confidence };
  };

  return {
    type,
    axes: {
      EI: buildAxisScore("EI"),
      SN: buildAxisScore("SN"),
      TF: buildAxisScore("TF"),
      JP: buildAxisScore("JP"),
    },
    responses,
  };
}
