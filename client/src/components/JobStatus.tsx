"use client";

import { useJobStatus } from "@/hooks/useJobStatus";
import Link from "next/link";
import { Check, Copy, Sparkles } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";

interface JobStatusProps {
  jobId: string;
}

function Spinner({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center gap-4 py-10">
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 rounded-full border-4 border-[#EAE3D9]" />
        <div className="absolute inset-0 rounded-full border-4 border-t-[#FF4F00] animate-spin" />
      </div>
      <p className="text-sm font-medium text-[#5C524C] animate-pulse flex items-center gap-1.5">
        <Sparkles className="w-3.5 h-3.5 text-[#FF4F00]" />
        <span>{label}</span>
      </p>
    </div>
  );
}

export default function JobStatus({ jobId }: JobStatusProps) {
  const { status, outputResult, errorMessage } = useJobStatus(jobId);
  const [copied, setCopied] = useState(false);

  const textOutput = outputResult === null || outputResult === undefined
    ? ""
    : typeof outputResult === "string"
    ? outputResult
    : typeof outputResult === "object" && "text" in outputResult && typeof (outputResult as { text: string }).text === "string"
    ? (outputResult as { text: string }).text
    : JSON.stringify(outputResult, null, 2);

  const handleCopy = () => {
    if (textOutput) {
      navigator.clipboard.writeText(textOutput);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (status === "pending") {
    return <Spinner label="Waiting in BullMQ queue…" />;
  }

  if (status === "processing") {
    return <Spinner label="Agent is analyzing and executing your request…" />;
  }

  if (status === "failed") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#FFF1F2] border border-[#FECDD3] rounded-2xl p-6 mt-6"
      >
        <div className="flex items-start gap-3">
          <svg className="w-5 h-5 text-[#E11D48] shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="text-[#BE123C] font-semibold text-sm">Execution failed</p>
            <p className="text-[#9F1239] text-sm mt-0.5">
              {errorMessage ?? "An unexpected error occurred. Please try again."}
            </p>
          </div>
        </div>
      </motion.div>
    );
  }

  // completed
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="mt-6 space-y-4"
    >
      {/* Success header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-[#ECFDF5] border border-[#A7F3D0] flex items-center justify-center">
            <svg className="w-3.5 h-3.5 text-[#059669]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <span className="text-sm font-bold text-[#047857]">Execution Complete</span>
        </div>

        {textOutput && (
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#5C524C] hover:text-[#201515] bg-[#FAF5EE] hover:bg-[#F2ECE2] border border-[#EAE3D9] px-3 py-1.5 rounded-full transition-all cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-[#059669]" />
                <span className="text-[#059669]">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Output</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Output box with subtle glowing border */}
      <div className="bg-[#FAF6F0] border border-[#EAE3D9] hover:border-[#FFB38A] rounded-2xl p-6 shadow-inner transition-colors relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#FF4F00]/5 via-transparent to-transparent pointer-events-none" />
        <pre className="text-sm text-[#201515] whitespace-pre-wrap break-words leading-relaxed font-mono relative z-10">
          {textOutput || "(No output returned)"}
        </pre>
      </div>

      {/* Job ID link */}
      <div className="flex items-center justify-between text-xs text-[#887E78]">
        <span>Completed via BullMQ & Gemini</span>
        <span>
          Job ID:{" "}
          <Link
            href={`/jobs/${jobId}`}
            className="text-[#FF4F00] hover:underline font-mono font-medium"
          >
            {jobId}
          </Link>
        </span>
      </div>
    </motion.div>
  );
}
