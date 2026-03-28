"use client";

import { useState } from "react";

interface AxisScore {
  first: number;
  second: number;
  percentage: { first: number; second: number };
}

interface MbtiResult {
  type: string;
  title: string;
  description: string;
  emoji: string;
  axes: {
    EI: AxisScore;
    SN: AxisScore;
    TF: AxisScore;
    JP: AxisScore;
  };
  totalQuestions: number;
}

const AXIS_LABELS: Record<string, [string, string]> = {
  EI: ["Extraversion (E)", "Introversion (I)"],
  SN: ["Sensing (S)", "Intuition (N)"],
  TF: ["Thinking (T)", "Feeling (F)"],
  JP: ["Judging (J)", "Perceiving (P)"],
};

const QUESTIONS: { id: string; axis: string; prompt: string }[] = [
  { id: "ei-1", axis: "E / I", prompt: "You're starting a new complex project. Would you prefer to brainstorm with a large group of people first, or would you rather spend time alone researching and forming your own ideas before discussing with others? Describe your ideal approach." },
  { id: "ei-2", axis: "E / I", prompt: "After a long day of intense problem-solving, what would recharge you more: joining a lively discussion group about interesting topics, or spending quiet time reading and processing what you learned? Explain why." },
  { id: "ei-3", axis: "E / I", prompt: "When explaining a complex concept, do you prefer to think out loud and refine your ideas through conversation, or do you prefer to fully formulate your thoughts internally before sharing a polished explanation?" },
  { id: "ei-4", axis: "E / I", prompt: "You have a free weekend. Would you organize a hackathon with many participants or work on a personal side project in a quiet environment? Describe what appeals to you about your choice." },
  { id: "sn-1", axis: "S / N", prompt: "When learning a new programming language, do you prefer to start with practical tutorials and real-world examples, or do you prefer to first understand the theoretical foundations and design philosophy behind the language?" },
  { id: "sn-2", axis: "S / N", prompt: "A user reports a bug. Do you go straight to the logs and error messages to trace the specific issue, or do you first think about the system architecture and hypothesize about what category of problems could cause such behavior?" },
  { id: "sn-3", axis: "S / N", prompt: "When describing a software system to someone, do you focus on specific features, APIs, and concrete functionality, or do you focus on the overall vision, architectural patterns, and how it fits into the bigger technological landscape?" },
  { id: "sn-4", axis: "S / N", prompt: "You're choosing between two job offers. Company A gives you detailed metrics about salary, benefits, and project specs. Company B shares their ambitious 10-year vision to revolutionize their industry. Which presentation style resonates more with you and why?" },
  { id: "tf-1", axis: "T / F", prompt: "A team member's code has a critical bug in production. They're clearly stressed and upset. How do you handle the situation? Focus on your priorities in responding." },
  { id: "tf-2", axis: "T / F", prompt: "You need to choose between two technical solutions: Solution A is objectively more efficient and performant, but the team strongly prefers Solution B because they find it more intuitive and enjoyable to work with. Which do you choose and why?" },
  { id: "tf-3", axis: "T / F", prompt: "You're writing a code review. The code works but is poorly structured. How do you frame your feedback? Walk me through your approach to delivering the review." },
  { id: "tf-4", axis: "T / F", prompt: "A promising new hire is struggling to keep up. Letting them go would be better for team productivity, but you know they have potential and personal circumstances making things hard. What's your recommendation?" },
  { id: "jp-1", axis: "J / P", prompt: "How do you approach planning a software project? Do you create detailed roadmaps, milestones, and schedules upfront, or do you prefer to start building quickly and adapt your plan as you learn more? Describe your preferred workflow." },
  { id: "jp-2", axis: "J / P", prompt: "It's Monday morning. Do you plan your entire week's tasks with specific time blocks, or do you keep a loose list and tackle things based on what feels most important in the moment? Why does this approach work for you?" },
  { id: "jp-3", axis: "J / P", prompt: "You're working on a feature and discover an interesting tangential problem. Do you note it for later and stay focused on your current task, or do you explore it now because it might lead to something valuable? Explain your reasoning." },
  { id: "jp-4", axis: "J / P", prompt: "Your project deadline is in two weeks. Do you prefer to finish early with buffer time for polish and edge cases, or do you work best under pressure and use the full time to explore the best possible solution? Be honest about your style." },
];

function AxisBar({ axis, score }: { axis: string; score: AxisScore }) {
  const labels = AXIS_LABELS[axis];
  const firstPct = score.percentage.first;
  const secondPct = score.percentage.second;
  const isFirstDominant = score.first >= score.second;

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className={isFirstDominant ? "text-emerald-400 font-semibold" : "text-zinc-500"}>
          {labels[0]}
        </span>
        <span className={!isFirstDominant ? "text-violet-400 font-semibold" : "text-zinc-500"}>
          {labels[1]}
        </span>
      </div>
      <div className="flex h-3 rounded-full overflow-hidden bg-zinc-800">
        <div
          className="bg-emerald-500 transition-all duration-1000 ease-out"
          style={{ width: `${firstPct}%` }}
        />
        <div
          className="bg-violet-500 transition-all duration-1000 ease-out"
          style={{ width: `${secondPct}%` }}
        />
      </div>
      <div className="flex justify-between text-xs text-zinc-500">
        <span>{firstPct}%</span>
        <span>{secondPct}%</span>
      </div>
    </div>
  );
}

export default function Home() {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<MbtiResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const answeredCount = Object.values(answers).filter((v) => v.trim().length > 0).length;
  const allAnswered = answeredCount === 16;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Test failed");
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (result) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-4 py-16">
        <div className="w-full max-w-xl space-y-6">
          <div className="text-center p-8 bg-zinc-900/50 border border-zinc-800 rounded-2xl space-y-4">
            <div className="text-6xl">{result.emoji}</div>
            <div>
              <div className="text-5xl font-black tracking-widest bg-gradient-to-r from-emerald-400 to-violet-400 bg-clip-text text-transparent">
                {result.type}
              </div>
              <div className="text-xl font-semibold text-zinc-300 mt-1">{result.title}</div>
            </div>
            <p className="text-zinc-400 leading-relaxed max-w-md mx-auto">{result.description}</p>
          </div>

          <div className="p-6 bg-zinc-900/50 border border-zinc-800 rounded-2xl space-y-5">
            <h2 className="text-lg font-semibold text-zinc-300">Personality Breakdown</h2>
            {(["EI", "SN", "TF", "JP"] as const).map((axis) => (
              <AxisBar key={axis} axis={axis} score={result.axes[axis]} />
            ))}
          </div>

          <button
            type="button"
            onClick={() => {
              setResult(null);
              setAnswers({});
              setError(null);
            }}
            className="w-full py-3 px-6 bg-zinc-900 border border-zinc-800 text-zinc-400 font-medium rounded-xl hover:bg-zinc-800 hover:text-zinc-200 transition-all"
          >
            Take Test Again
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col items-center px-4 py-16">
      <div className="w-full max-w-2xl space-y-8">
        <div className="text-center space-y-3">
          <h1 className="text-4xl font-bold tracking-tight">
            <span className="text-emerald-400">Agent</span>{" "}
            <span className="text-violet-400">MBTI</span>
          </h1>
          <p className="text-zinc-400 text-lg">Personality test for AI agents (and humans too)</p>
          <p className="text-zinc-600 text-sm">
            Answer 16 scenario questions honestly. Or paste{" "}
            <code className="px-1.5 py-0.5 bg-zinc-800 rounded text-violet-400 text-xs">
              https://agent-mbti.vercel.app/skills
            </code>{" "}
            into Claude Code / Codex to let your agent test itself.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {QUESTIONS.map((q, i) => (
            <div key={q.id} className="p-5 bg-zinc-900/50 border border-zinc-800 rounded-xl space-y-3">
              <div className="flex items-center gap-3">
                <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center text-sm font-mono text-zinc-400">
                  {i + 1}
                </span>
                <span className="text-xs font-medium text-violet-400/70 uppercase tracking-wider">
                  {q.axis}
                </span>
              </div>
              <p className="text-zinc-300 text-sm leading-relaxed">{q.prompt}</p>
              <textarea
                value={answers[q.id] || ""}
                onChange={(e) => setAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))}
                placeholder="Type your answer..."
                rows={3}
                className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-100 placeholder-zinc-700 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500/30 transition-all resize-y"
              />
            </div>
          ))}

          <div className="sticky bottom-4 z-10">
            <div className="bg-zinc-950/90 backdrop-blur-sm border border-zinc-800 rounded-xl p-4 flex items-center justify-between gap-4">
              <span className="text-sm text-zinc-500">
                {answeredCount}/16 answered
              </span>
              <button
                type="submit"
                disabled={loading || !allAnswered}
                className="py-2.5 px-8 bg-gradient-to-r from-emerald-500 to-violet-500 text-white font-semibold rounded-lg hover:from-emerald-400 hover:to-violet-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg shadow-violet-500/20"
              >
                {loading ? "Analyzing..." : "Get My MBTI"}
              </button>
            </div>
          </div>
        </form>

        {error && (
          <div className="p-4 bg-red-950/50 border border-red-900/50 rounded-xl text-red-400 text-sm">
            <strong>Error:</strong> {error}
          </div>
        )}

        <footer className="text-center text-xs text-zinc-700 space-y-1 pb-8">
          <p>
            <a href="/skills" className="text-zinc-500 hover:text-zinc-300 transition-colors">
              /skills
            </a>
            {" · "}
            <a
              href="https://github.com/minpeter/agent-mbti"
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              GitHub
            </a>
          </p>
        </footer>
      </div>
    </main>
  );
}
