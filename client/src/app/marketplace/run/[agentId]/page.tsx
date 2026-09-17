"use client";

import { useState, useEffect, type FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { fetchAgent, submitJob } from "@/lib/api";
import type { Agent } from "@/lib/api";
import JobStatus from "@/components/JobStatus";

export default function RunAgentPage() {
  const params = useParams<{ agentId: string }>();
  const agentId = params.agentId;
  const router = useRouter();

  const [agent, setAgent] = useState<Agent | null>(null);
  const [agentError, setAgentError] = useState<string | null>(null);
  const [inputText, setInputText] = useState("");
  const [jobId, setJobId] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Load agent details on mount
  useEffect(() => {
    if (!agentId) return;
    fetchAgent(agentId)
      .then(setAgent)
      .catch((err) =>
        setAgentError(err instanceof Error ? err.message : "Failed to load agent.")
      );
  }, [agentId]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!inputText.trim()) return;

    setSubmitError(null);
    setJobId(null);
    setSubmitting(true);

    try {
      const { id: newJobId } = await submitJob(agentId as string, { text: inputText });
      setJobId(newJobId);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Failed to submit job.");
    } finally {
      setSubmitting(false);
    }
  }

  // ─── Error state ──────────────────────────────────────────────────────────

  if (agentError) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-white font-semibold text-lg mb-2">Agent not found</h1>
          <p className="text-gray-400 text-sm mb-6">{agentError}</p>
          <button
            onClick={() => router.push("/marketplace")}
            className="bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-colors"
          >
            ← Back to Marketplace
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Nav */}
      <nav className="sticky top-0 z-30 bg-gray-950/80 backdrop-blur-md border-b border-gray-800">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center gap-3">
          <Link href="/marketplace" className="text-gray-400 hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <span className="text-gray-600">/</span>
          <span className="text-gray-400 text-sm">Marketplace</span>
          <span className="text-gray-600">/</span>
          <span className="text-white text-sm font-medium truncate">
            {agent?.name ?? "Loading…"}
          </span>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-4 py-10 space-y-8">
        {/* Agent header skeleton / real */}
        {!agent ? (
          <div className="animate-pulse space-y-3">
            <div className="h-7 bg-gray-800 rounded-lg w-48" />
            <div className="h-4 bg-gray-800 rounded-lg w-72" />
          </div>
        ) : (
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-white">{agent.name}</h1>
              <p className="text-gray-400 mt-1 text-sm max-w-xl">{agent.description}</p>
            </div>
            <div className="shrink-0 flex items-center gap-1.5 bg-amber-400/10 border border-amber-400/20 rounded-full px-3 py-1">
              <svg className="w-3.5 h-3.5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 2a8 8 0 100 16A8 8 0 0010 2zm.75 4.75a.75.75 0 00-1.5 0v2.5h-2.5a.75.75 0 000 1.5h2.5v2.5a.75.75 0 001.5 0v-2.5h2.5a.75.75 0 000-1.5h-2.5v-2.5z" />
              </svg>
              <span className="text-xs font-semibold text-amber-400">
                {agent.creditCost} credit{agent.creditCost !== 1 ? "s" : ""}
              </span>
            </div>
          </div>
        )}

        {/* Input form */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="agent-input" className="block text-sm font-medium text-gray-300 mb-2">
                Your input
              </label>
              <textarea
                id="agent-input"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Describe what you want the agent to do…"
                rows={6}
                required
                disabled={submitting || Boolean(jobId)}
                className="w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-xl px-4 py-3 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all duration-200 resize-none disabled:opacity-50"
              />
            </div>

            {submitError && (
              <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {submitError}
              </div>
            )}

            {!jobId && (
              <button
                id="run-submit"
                type="submit"
                disabled={submitting || !inputText.trim() || !agent}
                className="bg-violet-600 hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm px-6 py-3 rounded-xl transition-all duration-200 shadow-lg shadow-violet-600/20"
              >
                {submitting ? (
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Submitting…
                  </span>
                ) : "Run Agent →"}
              </button>
            )}
          </form>
        </div>

        {/* Live output */}
        {jobId && (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <h2 className="text-sm font-semibold text-gray-300 mb-2">Live output</h2>
            <JobStatus jobId={jobId} />
          </div>
        )}
      </main>
    </div>
  );
}
