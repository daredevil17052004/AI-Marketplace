"use client";

import { useJobStatus } from "@/hooks/useJobStatus";

interface JobStatusProps {
  jobId: string;
}

function Spinner({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center gap-4 py-10">
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 rounded-full border-4 border-gray-700" />
        <div className="absolute inset-0 rounded-full border-4 border-t-violet-500 animate-spin" />
      </div>
      <p className="text-sm text-gray-400 animate-pulse">{label}</p>
    </div>
  );
}

export default function JobStatus({ jobId }: JobStatusProps) {
  const { status, outputResult, errorMessage } = useJobStatus(jobId);

  if (status === "pending") {
    return <Spinner label="Waiting in queue…" />;
  }

  if (status === "processing") {
    return <Spinner label="Agent is processing your request…" />;
  }

  if (status === "failed") {
    return (
      <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 mt-6">
        <div className="flex items-start gap-3">
          <svg className="w-5 h-5 text-red-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="text-red-400 font-semibold text-sm">Job failed</p>
            <p className="text-red-300/70 text-sm mt-0.5">
              {errorMessage ?? "An unexpected error occurred. Please try again."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // completed
  return (
    <div className="mt-6 space-y-3">
      {/* Success header */}
      <div className="flex items-center gap-2">
        <div className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
          <svg className="w-3 h-3 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <span className="text-sm font-medium text-emerald-400">Completed</span>
      </div>

      {/* Output box */}
      <div className="bg-gray-800 border border-gray-700 rounded-2xl p-5">
        <pre className="text-sm text-gray-200 whitespace-pre-wrap break-words leading-relaxed font-mono">
          {outputResult?.text ?? "(No output returned)"}
        </pre>
      </div>

      {/* Job ID link */}
      <p className="text-xs text-gray-600 text-right">
        Job ID:{" "}
        <a
          href={`/marketplace/jobs/${jobId}`}
          className="text-violet-400 hover:text-violet-300 underline underline-offset-2 transition-colors"
        >
          {jobId}
        </a>
      </p>
    </div>
  );
}
