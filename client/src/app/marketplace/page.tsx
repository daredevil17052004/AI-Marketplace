import { fetchAgents } from "@/lib/api";
import AgentCard from "@/components/AgentCard";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Agent Marketplace — Browse Agents",
  description: "Browse and run AI agents instantly. Pay per use.",
};

// Revalidate the agent list every 60 seconds.
export const revalidate = 60;

export default async function MarketplacePage() {
  let agents: Awaited<ReturnType<typeof fetchAgents>> = [];
  let fetchError: string | null = null;

  try {
    agents = await fetchAgents();
  } catch (err) {
    fetchError = err instanceof Error ? err.message : "Failed to load agents.";
  }

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Top nav */}
      <nav className="sticky top-0 z-30 bg-gray-950/80 backdrop-blur-md border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-white font-bold text-lg tracking-tight">AI Marketplace</span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm text-gray-400 hover:text-white transition-colors px-3 py-1.5"
            >
              Sign in
            </Link>
            <Link
              href="/register"
              className="text-sm bg-violet-600 hover:bg-violet-700 text-white font-medium px-4 py-1.5 rounded-lg transition-colors"
            >
              Get started
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero */}
        <div className="text-center mb-14">
          {/* Glow */}
          <div className="absolute left-1/2 top-32 -translate-x-1/2 w-[800px] h-64 bg-violet-600/8 blur-3xl rounded-full pointer-events-none" />

          <span className="inline-flex items-center text-xs font-semibold text-violet-400 bg-violet-400/10 border border-violet-400/20 rounded-full px-3 py-1 mb-6 uppercase tracking-widest">
            {agents.length} agents available
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight mb-4">
            Run AI Agents,{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400">
              Instantly
            </span>
          </h1>
          <p className="text-gray-400 text-lg max-w-xl mx-auto">
            Browse our curated library of AI agents. Submit a task, get results in seconds — billed by the job.
          </p>
        </div>

        {/* Error state */}
        {fetchError && (
          <div className="max-w-lg mx-auto bg-red-500/10 border border-red-500/20 rounded-2xl p-6 text-center mb-10">
            <svg className="w-8 h-8 text-red-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M5.07 19h13.86a2 2 0 001.73-3L13.73 4a2 2 0 00-3.46 0L3.34 16a2 2 0 001.73 3z" />
            </svg>
            <p className="text-red-400 font-medium">{fetchError}</p>
            <p className="text-gray-500 text-sm mt-1">Make sure the API server is running.</p>
          </div>
        )}

        {/* Empty state */}
        {!fetchError && agents.length === 0 && (
          <div className="text-center py-24">
            <div className="w-16 h-16 rounded-2xl bg-gray-800 border border-gray-700 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <p className="text-gray-500 text-lg">No agents found</p>
            <p className="text-gray-600 text-sm mt-1">Check back soon — more are on the way.</p>
          </div>
        )}

        {/* Agent grid */}
        {agents.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {agents.map((agent) => (
              <AgentCard
                key={agent.id}
                id={agent.id}
                name={agent.name}
                description={agent.description}
                creditCost={agent.creditCost}
                category={agent.category}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
