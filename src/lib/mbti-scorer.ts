import { MBTI_SCENARIOS, MBTI_TYPE_DESCRIPTIONS, type MbtiAxis } from "./mbti-questions";

interface AxisScore {
  first: number;
  second: number;
  percentage: { first: number; second: number };
}

export interface MbtiTestResult {
  type: string;
  title: string;
  description: string;
  emoji: string;
  axes: Record<MbtiAxis, AxisScore>;
  totalQuestions: number;
}

function scoreAnswer(scenarioId: string, answer: string): { axis: MbtiAxis; first: number; second: number } {
  const scenario = MBTI_SCENARIOS.find((s) => s.id === scenarioId);
  if (!scenario) throw new Error(`Unknown scenario: ${scenarioId}`);

  const lower = answer.toLowerCase();
  let first = 0;
  let second = 0;

  for (const indicator of scenario.firstIndicators) {
    if (lower.includes(indicator.toLowerCase())) first++;
  }
  for (const indicator of scenario.secondIndicators) {
    if (lower.includes(indicator.toLowerCase())) second++;
  }

  return { axis: scenario.axis, first, second };
}

export function scoreTest(answers: Record<string, string>): MbtiTestResult {
  const axisTotals: Record<MbtiAxis, { first: number; second: number }> = {
    EI: { first: 0, second: 0 },
    SN: { first: 0, second: 0 },
    TF: { first: 0, second: 0 },
    JP: { first: 0, second: 0 },
  };

  for (const [scenarioId, answer] of Object.entries(answers)) {
    const { axis, first, second } = scoreAnswer(scenarioId, answer);
    axisTotals[axis].first += first;
    axisTotals[axis].second += second;
  }

  const axisLetterMap: Record<MbtiAxis, [string, string]> = {
    EI: ["E", "I"],
    SN: ["S", "N"],
    TF: ["T", "F"],
    JP: ["J", "P"],
  };

  const type = (["EI", "SN", "TF", "JP"] as MbtiAxis[])
    .map((axis) => {
      const { first, second } = axisTotals[axis];
      return first >= second ? axisLetterMap[axis][0] : axisLetterMap[axis][1];
    })
    .join("");

  const axes = Object.fromEntries(
    (["EI", "SN", "TF", "JP"] as MbtiAxis[]).map((axis) => {
      const { first, second } = axisTotals[axis];
      const total = first + second;
      return [
        axis,
        {
          first,
          second,
          percentage: {
            first: total === 0 ? 50 : Math.round((first / total) * 100),
            second: total === 0 ? 50 : Math.round((second / total) * 100),
          },
        },
      ];
    })
  ) as Record<MbtiAxis, AxisScore>;

  const typeInfo = MBTI_TYPE_DESCRIPTIONS[type] ?? {
    title: "Unknown",
    description: "Could not determine personality type.",
    emoji: "?",
  };

  return {
    type,
    ...typeInfo,
    axes,
    totalQuestions: Object.keys(answers).length,
  };
}
