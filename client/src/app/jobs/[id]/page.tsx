"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  RefreshCw,
  Bot,
  Copy,
  Check,
  AlertCircle,
} from "lucide-react";
import StatusBadge from "@/components/StatusBadge";
import JsonViewer from "@/components/JsonViewer";
import FormattedOutput from "@/components/FormattedOutput";
import FormattedInput from "@/components/FormattedInput";
import BackgroundBeams from "@/components/BackgroundBeams";
import { fetchJob, Job } from "@/lib/api";
import { formatDate } from "@/lib/utils";

export default function JobDetailPage() {
  const params = useParams();
  const jobId = params.id as string;

  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState(false);

  useEffect(() => {
    if (!jobId) return;
    let ignore = false;

    fetchJob(jobId)
      .then((data) => {
        if (!ignore) {
          setJob(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!ignore) {
          setError(err instanceof Error ? err.message : "Failed to load job.");
          setLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [jobId]);

  // Polling until terminal status
  useEffect(() => {
    if (!job || !jobId) return;
    if (job.status === "completed" || job.status === "failed") return;

    const interval = setInterval(() => {
      fetchJob(jobId)
        .then((data) => {
          setJob(data);
        })
        .catch(() => {});
    }, 2500);

    return () => clearInterval(interval);
  }, [job, jobId]);

  const copyJobId = async () => {
    if (!jobId) return;
    await navigator.clipboard.writeText(jobId);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  if (loading) {
    return (
      <div className="relative min-h-[calc(100vh-4.5rem)] flex items-center justify-center p-8 bg-[#FFFDF9]">
        <BackgroundBeams />
        <div className="text-center space-y-3 z-10">
          <div className="w-10 h-10 border-4 border-[#EAE3D9] border-t-[#FF4F00] rounded-full animate-spin mx-auto" />
          <p className="text-sm font-semibold text-[#5C524C]">Loading Job Telemetry…</p>
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="relative min-h-[calc(100vh-4.5rem)] flex items-center justify-center p-8 bg-[#FFFDF9]">
        <BackgroundBeams />
        <div className="text-center space-y-4 max-w-md z-10 bg-white border border-[#EAE3D9] p-8 rounded-3xl shadow-sm">
          <AlertCircle className="w-10 h-10 text-[#E11D48] mx-auto" />
          <h2 className="font-heading text-xl font-bold text-[#201515]">Job Not Found</h2>
          <p className="text-xs text-[#5C524C]">{error || "Requested job ID was not found."}</p>
          <Link
            href="/jobs"
            className="btn-zap-secondary inline-flex text-xs px-4 py-2"
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
    <div className="relative min-h-[calc(100vh-4.5rem)] p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-8 bg-[#FFFDF9]">
      <BackgroundBeams />

      {/* Back button & Polling Indicator */}
      <div className="relative z-10 flex items-center justify-between">
        <Link
          href="/jobs"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#5C524C] hover:text-[#201515] transition-colors bg-white border border-[#EAE3D9] px-3.5 py-1.5 rounded-full shadow-xs"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Jobs</span>
        </Link>

        {!isTerminal && (
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE]">
            <RefreshCw className="w-3 h-3 animate-spin text-[#2563EB]" />
            <span>Live polling active…</span>
          </div>
        )}
      </div>

      {/* Metadata Card */}
      <div className="relative z-10">
        <div className="bg-white border border-[#EAE3D9] rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#EAE3D9]">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs text-[#887E78]">
                <span className="font-mono">JOB ID: {job.id}</span>
                <button
                  type="button"
                  onClick={copyJobId}
                  className="p-1 hover:text-[#201515] rounded transition-colors cursor-pointer"
                  title="Copy Job ID"
                >
                  {copiedId ? <Check className="w-3.5 h-3.5 text-[#059669]" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
              <h1 className="font-heading text-2xl font-bold text-[#201515] tracking-tight">
                {job.agentName || job.agentId}
              </h1>
            </div>

            <div className="flex items-center gap-3">
              <StatusBadge status={job.status} className="px-3.5 py-1.5 text-sm" />
              <Link
                href={`/agents/${job.agentId}`}
                className="btn-zap-primary text-xs py-2 px-4"
              >
                <Bot className="w-3.5 h-3.5" />
                <span>Re-run Agent</span>
              </Link>
            </div>
          </div>

          {/* Metric telemetry strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div className="space-y-1">
              <span className="text-[#887E78] uppercase tracking-wider text-[11px] font-bold block">Created At</span>
              <p className="font-medium text-[#201515]">{formatDate(job.createdAt)}</p>
            </div>
            <div className="space-y-1">
              <span className="text-[#887E78] uppercase tracking-wider text-[11px] font-bold block">Completed At</span>
              <p className="font-medium text-[#201515]">{formatDate(job.completedAt)}</p>
            </div>
            <div className="space-y-1">
              <span className="text-[#887E78] uppercase tracking-wider text-[11px] font-bold block">Duration</span>
              <p className="font-mono font-bold text-[#FF4F00]">
                {job.durationMs ? `${job.durationMs}ms` : job.status === "processing" ? "Running…" : "—"}
              </p>
            </div>
            <div className="space-y-1">
              <span className="text-[#887E78] uppercase tracking-wider text-[11px] font-bold block">Engine</span>
              <p className="font-bold text-[#059669]">BullMQ & Gemini</p>
            </div>
          </div>
        </div>
      </div>

      {/* Input / Output Panels */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Payload */}
        <div className="bg-white border border-[#EAE3D9] rounded-3xl p-6 sm:p-8 space-y-4 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-[#EAE3D9]">
            <h3 className="font-heading font-bold text-[#201515] text-base">Input Payload</h3>
            <span className="text-xs font-mono text-[#887E78]">Agent Parameters</span>
          </div>
          <FormattedInput inputPayload={job.inputPayload || {}} />
        </div>

        {/* Output Result */}
        <div className="bg-white border border-[#EAE3D9] rounded-3xl p-6 sm:p-8 space-y-4 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-[#EAE3D9]">
            <h3 className="font-heading font-bold text-[#201515] text-base">Output Result</h3>
            <span className="text-xs font-mono text-[#887E78]">Agent Output</span>
          </div>

          {job.status === "failed" ? (
            <div className="bg-[#FFF1F2] border border-[#FECDD3] rounded-2xl p-5 text-xs text-[#BE123C] space-y-2">
              <p className="font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-[#E11D48]" />
                Error reported during execution:
              </p>
              <p className="leading-relaxed font-mono bg-white/70 p-3 rounded-xl border border-[#FECDD3]">
                {job.errorMessage || "Unknown error occurred during agent execution."}
              </p>
            </div>
          ) : job.status === "completed" ? (
            <FormattedOutput outputResult={job.outputResult} agentName={job.agentName} />
          ) : (
            <div className="flex flex-col items-center justify-center p-12 text-center space-y-3 bg-[#FAF5EE] border border-[#EAE3D9] rounded-2xl">
              <div className="w-8 h-8 border-3 border-[#EAE3D9] border-t-[#FF4F00] rounded-full animate-spin" />
              <p className="text-xs font-semibold text-[#5C524C]">
                Agent is running in the background worker queue…
              </p>
              <p className="text-[11px] text-[#887E78]">
                Real-time updates will stream when the agent completes.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
