"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { fetchJob } from "@/lib/api";
import type { Job } from "@/lib/api";

const STATUS_LABELS: Record<Job["status"], string> = {
  pending: "Pending",
  processing: "Processing",
  completed: "Completed",
  failed: "Failed",
};

const STATUS_COLORS: Record<Job["status"], string> = {
  pending: "text-amber-400 bg-amber-400/10 border-amber-400/20",
  processing: "text-blue-400 bg-blue-400/10 border-blue-400/20",
  completed: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  failed: "text-red-400 bg-red-400/10 border-red-400/20",
};

export default function JobResultPage() {
  const params = useParams<{ jobId: string }>();
  const jobId = params.jobId;
  const router = useRouter();

  const [job, setJob] = useState<Job | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!jobId) return;
    fetchJob(jobId)
      .then(setJob)
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Failed to load job result.")
      )
      .finally(() => setLoading(false));
  }, [jobId]);

  function copyLink() {
    navigator.clipboard.writeText(window.location.href).catch(() => {});
  }

  // ─── Loading skeleton ──────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-10 h-10">
            <div className="absolute inset-0 rounded-full border-4 border-gray-700" />
            <div className="absolute inset-0 rounded-full border-4 border-t-violet-500 animate-spin" />
          </div>
          <p className="text-gray-500 text-sm">Loading job result…</p>
        </div>
      </div>
    );
  }

  // ─── Error state ───────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-white font-semibold text-lg mb-2">Job not found</h1>
          <p className="text-gray-400 text-sm mb-6">{error}</p>
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

  if (!job) return null;

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
          <span className="text-white text-sm font-medium font-mono truncate">{jobId}</span>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-4 py-10 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Job Result</h1>
            <p className="text-gray-500 text-sm font-mono mt-1">{jobId}</p>
          </div>

          <div className="flex items-center gap-2">
            {/* Status badge */}
            <span
              className={`inline-flex items-center text-xs font-semibold border rounded-full px-3 py-1 ${STATUS_COLORS[job.status]}`}
            >
              {STATUS_LABELS[job.status]}
            </span>

            {/* Copy link */}
            <button
              id="copy-link"
              onClick={copyLink}
              title="Copy shareable link"
              className="p-2 rounded-lg bg-gray-800 border border-gray-700 text-gray-400 hover:text-white hover:border-gray-600 transition-all duration-200"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Meta */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-900 border border-gray-800 rounded-xl px-4 py-3">
            <p className="text-xs text-gray-500 mb-0.5">Agent ID</p>
            <p className="text-sm text-gray-200 font-mono truncate">{job.agentId}</p>
          </div>
          {job.createdAt && (
            <div className="bg-gray-900 border border-gray-800 rounded-xl px-4 py-3">
              <p className="text-xs text-gray-500 mb-0.5">Created</p>
              <p className="text-sm text-gray-200">
                {new Date(job.createdAt).toLocaleString()}
              </p>
            </div>
          )}
        </div>

        {/* Output */}
        {job.status === "completed" && (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <h2 className="text-sm font-semibold text-gray-300 mb-4 flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                <svg className="w-2.5 h-2.5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              Output
            </h2>
            <pre className="text-sm text-gray-200 whitespace-pre-wrap break-words leading-relaxed font-mono">
              {job.outputResult ?? "(No output)"}
            </pre>
          </div>
        )}

        {/* Error output */}
        {job.status === "failed" && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6">
            <h2 className="text-sm font-semibold text-red-400 mb-3">Error</h2>
            <p className="text-sm text-red-300/80 leading-relaxed">
              {job.errorMessage ?? "An unexpected error occurred."}
            </p>
          </div>
        )}

        {/* Still running notice */}
        {(job.status === "pending" || job.status === "processing") && (
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-6 text-center">
            <p className="text-blue-400 font-medium text-sm">This job is still running.</p>
            <p className="text-gray-500 text-xs mt-1">Refresh the page to check for updates.</p>
          </div>
        )}

        {/* Run again */}
        <div className="pt-2">
          <Link
            href={`/marketplace/run/${job.agentId}`}
            className="inline-flex items-center gap-2 text-sm text-violet-400 hover:text-violet-300 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Run this agent again
          </Link>
        </div>
      </main>
    </div>
  );
}
