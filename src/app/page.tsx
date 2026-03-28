"use client";

import { useState } from "react";

interface AxisScore {
  first: number;
  second: number;
  confidence: number;
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

function AxisBar({ axis, score }: { axis: string; score: AxisScore }) {
  const labels = AXIS_LABELS[axis];
  const total = score.first + score.second;
  const firstPct = total === 0 ? 50 : Math.round((score.first / total) * 100);
  const secondPct = 100 - firstPct;
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
  const [endpoint, setEndpoint] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [model, setModel] = useState("");
  const [showOptions, setShowOptions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<MbtiResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          endpoint: endpoint.trim(),
          apiKey: apiKey.trim() || undefined,
          model: model.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Analysis failed");
      }

      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 py-16">
      <div className="w-full max-w-xl space-y-8">
        <div className="text-center space-y-3">
          <h1 className="text-4xl font-bold tracking-tight">
            <span className="text-emerald-400">Agent</span>{" "}
            <span className="text-violet-400">MBTI</span>
          </h1>
          <p className="text-zinc-400 text-lg">
            What&apos;s your AI agent&apos;s personality type?
          </p>
          <p className="text-zinc-600 text-sm">
            Point us to any OpenAI-compatible endpoint. We&apos;ll ask 16 personality questions and reveal the vibes.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="endpoint" className="block text-sm font-medium text-zinc-400 mb-1.5">
              Agent Endpoint URL
            </label>
            <input
              id="endpoint"
              type="url"
              required
              value={endpoint}
              onChange={(e) => setEndpoint(e.target.value)}
              placeholder="https://api.openai.com/v1"
              className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all"
              disabled={loading}
            />
          </div>

          <button
            type="button"
            onClick={() => setShowOptions(!showOptions)}
            className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            {showOptions ? "▾ Hide options" : "▸ More options (API key, model)"}
          </button>

          {showOptions && (
            <div className="space-y-3 animate-in fade-in">
              <div>
                <label htmlFor="apiKey" className="block text-sm font-medium text-zinc-400 mb-1.5">
                  API Key <span className="text-zinc-600">(optional)</span>
                </label>
                <input
                  id="apiKey"
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="sk-..."
                  className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all"
                  disabled={loading}
                />
              </div>
              <div>
                <label htmlFor="model" className="block text-sm font-medium text-zinc-400 mb-1.5">
                  Model <span className="text-zinc-600">(optional, default: gpt-4o-mini)</span>
                </label>
                <input
                  id="model"
                  type="text"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  placeholder="gpt-4o-mini"
                  className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all"
                  disabled={loading}
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !endpoint.trim()}
            className="w-full py-3 px-6 bg-gradient-to-r from-emerald-500 to-violet-500 text-white font-semibold rounded-xl hover:from-emerald-400 hover:to-violet-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-violet-500/20"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" role="img" aria-label="Loading spinner">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Analyzing personality... (takes ~30s)
              </span>
            ) : (
              "Analyze Agent MBTI"
            )}
          </button>
        </form>

        {error && (
          <div className="p-4 bg-red-950/50 border border-red-900/50 rounded-xl text-red-400 text-sm">
            <strong>Error:</strong> {error}
          </div>
        )}

        {result && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center p-8 bg-zinc-900/50 border border-zinc-800 rounded-2xl space-y-4">
              <div className="text-6xl">{result.emoji}</div>
              <div>
                <div className="text-5xl font-black tracking-widest bg-gradient-to-r from-emerald-400 to-violet-400 bg-clip-text text-transparent">
                  {result.type}
                </div>
                <div className="text-xl font-semibold text-zinc-300 mt-1">{result.title}</div>
              </div>
              <p className="text-zinc-400 leading-relaxed max-w-md mx-auto">
                {result.description}
              </p>
            </div>

            <div className="p-6 bg-zinc-900/50 border border-zinc-800 rounded-2xl space-y-5">
              <h2 className="text-lg font-semibold text-zinc-300">Personality Breakdown</h2>
              {(["EI", "SN", "TF", "JP"] as const).map((axis) => (
                <AxisBar key={axis} axis={axis} score={result.axes[axis]} />
              ))}
              <p className="text-xs text-zinc-600 text-center pt-2">
                Based on {result.totalQuestions} scenario questions analyzed via keyword matching
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setResult(null);
                setError(null);
              }}
              className="w-full py-3 px-6 bg-zinc-900 border border-zinc-800 text-zinc-400 font-medium rounded-xl hover:bg-zinc-800 hover:text-zinc-200 transition-all"
            >
              Test Another Agent
            </button>
          </div>
        )}

        <footer className="text-center text-xs text-zinc-700 space-y-1">
          <p>Sends 16 personality scenarios to any OpenAI-compatible chat API.</p>
          <p>
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
