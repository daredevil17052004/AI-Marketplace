"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Clock,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Terminal,
  Bot,
  Copy,
  Check,
  Sparkles,
} from "lucide-react";
import CardSpotlight from "@/components/CardSpotlight";
import StatusBadge from "@/components/StatusBadge";
import JsonViewer from "@/components/JsonViewer";
import BackgroundBeams from "@/components/BackgroundBeams";
import { fetchJob, Job } from "@/lib/api";
import { formatDate, cn } from "@/lib/utils";

export default function JobDetailPage() {
  const params = useParams();
  const jobId = params.id as string;

  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState(false);

  const loadJob = async (silent = false) => {
    if (!jobId) return;
    try {
      const data = await fetchJob(jobId);
      setJob(data);
    } catch (err) {
      if (!silent) {
        setError(err instanceof Error ? err.message : "Failed to load job.");
      }
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    loadJob();
  }, [jobId]);

  // Polling until terminal status
  useEffect(() => {
    if (!job) return;
    if (job.status === "completed" || job.status === "failed") return;

    const interval = setInterval(() => {
      loadJob(true);
    }, 2500);

    return () => clearInterval(interval);
  }, [job]);

  const copyJobId = async () => {
    if (!jobId) return;
    await navigator.clipboard.writeText(jobId);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  if (loading) {
    return (
      <div className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center p-8">
        <BackgroundBeams />
        <div className="text-center space-y-3 z-10">
          <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-gray-400">Loading Job Execution Telemetry…</p>
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center p-8">
        <BackgroundBeams />
        <div className="text-center space-y-4 max-w-md z-10">
          <AlertCircle className="w-10 h-10 text-rose-400 mx-auto" />
          <h2 className="text-xl font-bold text-white">Job Not Found</h2>
          <p className="text-xs text-gray-400">{error || "Requested job ID was not found."}</p>
          <Link
            href="/jobs"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 text-white text-xs font-semibold hover:bg-white/20"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Job History</span>
          </Link>
        </div>
      </div>
    );
  }

  const isTerminal = job.status === "completed" || job.status === "failed";

  return (
    <div className="relative min-h-[calc(100vh-4rem)] p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-8">
      <BackgroundBeams />

      {/* Back button & Polling Indicator */}
      <div className="relative z-10 flex items-center justify-between">
        <Link
          href="/jobs"
          className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Jobs</span>
        </Link>

        {!isTerminal && (
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono bg-sky-500/10 text-sky-400 border border-sky-500/20">
            <RefreshCw className="w-3 h-3 animate-spin" />
            <span>Live polling active…</span>
          </div>
        )}
      </div>

      {/* Metadata Spotlight Card */}
      <div className="relative z-10">
        <CardSpotlight className="p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/5">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <span className="font-mono">JOB ID: {job.id}</span>
                <button
                  type="button"
                  onClick={copyJobId}
                  className="p-1 hover:text-white rounded transition-colors cursor-pointer"
                  title="Copy Job ID"
                >
                  {copiedId ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
              <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                <span>{job.agentName || job.agentId}</span>
              </h1>
            </div>

            <div className="flex items-center gap-3">
              <StatusBadge status={job.status} className="px-3.5 py-1.5 text-sm" />
              <Link
                href={`/agents/${job.agentId}`}
                className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl bg-violet-600/20 text-violet-300 hover:bg-violet-600 hover:text-white border border-violet-500/30 transition-all"
              >
                <Bot className="w-3.5 h-3.5" />
                <span>Re-run Agent</span>
              </Link>
            </div>
          </div>

          {/* Metric telemetry strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div className="space-y-1">
              <span className="text-gray-400 uppercase tracking-wider text-[11px] block">Created At</span>
              <p className="font-medium text-white">{formatDate(job.createdAt)}</p>
            </div>
            <div className="space-y-1">
              <span className="text-gray-400 uppercase tracking-wider text-[11px] block">Completed At</span>
              <p className="font-medium text-white">{formatDate(job.completedAt)}</p>
            </div>
            <div className="space-y-1">
              <span className="text-gray-400 uppercase tracking-wider text-[11px] block">Duration</span>
              <p className="font-mono font-medium text-violet-300">
                {job.durationMs ? `${job.durationMs}ms` : job.status === "processing" ? "Running…" : "—"}
              </p>
            </div>
            <div className="space-y-1">
              <span className="text-gray-400 uppercase tracking-wider text-[11px] block">Runtime Engine</span>
              <p className="font-medium text-emerald-400">Sandboxed Node/LLM</p>
            </div>
          </div>
        </CardSpotlight>
      </div>

      {/* Error Banner if failed */}
      {job.status === "failed" && (
        <div className="relative z-10 p-5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-bold text-sm text-rose-200">Execution Error Encountered</h4>
            <p className="text-rose-300/90 leading-relaxed font-mono">
              {job.errorMessage || "The AI agent reported a runtime timeout or failed prompt execution."}
            </p>
          </div>
        </div>
      )}

      {/* Processing Banner if in flight */}
      {job.status === "processing" && (
        <div className="relative z-10 p-6 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-sky-200 text-xs flex items-center gap-4">
          <div className="w-6 h-6 border-2 border-sky-400 border-t-transparent rounded-full animate-spin shrink-0" />
          <div>
            <h4 className="font-bold text-sm text-sky-100">Worker Executing Prompt Pipeline</h4>
            <p className="text-sky-300/80 mt-0.5">
              Processing structured inputs. The page will auto-update as soon as the agent completes.
            </p>
          </div>
        </div>
      )}

      {/* Two Payload Viewers: Input & Output */}
      <div className="relative z-10 space-y-6">
        {/* Output Result */}
        {job.status === "completed" && job.outputResult && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              <span>Agent Output Result</span>
            </div>
            <JsonViewer
              data={job.outputResult}
              title="Execution Output Result"
              className="border-emerald-500/20"
            />
          </div>
        )}

        {/* Input Payload */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-gray-400 text-xs font-semibold uppercase tracking-wider">
            <Terminal className="w-4 h-4" />
            <span>Submitted Input Payload</span>
          </div>
          <JsonViewer
            data={job.inputPayload || {}}
            title="Job Input Parameters"
            defaultCollapsed={job.status === "completed"}
          />
        </div>
      </div>
    </div>
  );
}
