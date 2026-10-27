"use client";

import React, { useState } from "react";
import {
  Copy,
  Check,
  Download,
  Sparkles,
  FileCode,
  FileText,
  AlignLeft,
} from "lucide-react";
import MarkdownRenderer from "./MarkdownRenderer";
import JsonViewer from "./JsonViewer";

interface FormattedOutputProps {
  outputResult: unknown;
  agentName?: string;
}

export default function FormattedOutput({ outputResult, agentName }: FormattedOutputProps) {
  const [viewMode, setViewMode] = useState<"formatted" | "raw">("formatted");
  const [copied, setCopied] = useState(false);

  // Extract raw text or string representation
  let textOutput = "";
  let isObject = false;

  if (typeof outputResult === "string") {
    textOutput = outputResult;
  } else if (outputResult && typeof outputResult === "object") {
    isObject = true;
    const obj = outputResult as Record<string, unknown>;
    if (typeof obj.text === "string") {
      textOutput = obj.text;
    } else if (typeof obj.response === "string") {
      textOutput = obj.response;
    } else if (typeof obj.result === "string") {
      textOutput = obj.result;
    } else if (typeof obj.output === "string") {
      textOutput = obj.output;
    } else {
      // Stringify object
      textOutput = JSON.stringify(obj, null, 2);
    }
  }

  const wordCount = textOutput ? textOutput.trim().split(/\s+/).filter(Boolean).length : 0;
  const charCount = textOutput.length;

  const handleCopy = async () => {
    try {
      const contentToCopy =
        viewMode === "formatted"
          ? textOutput
          : JSON.stringify(outputResult, null, 2);
      await navigator.clipboard.writeText(contentToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  const handleDownload = () => {
    const ext = viewMode === "formatted" ? "md" : "json";
    const content =
      viewMode === "formatted"
        ? textOutput
        : JSON.stringify(outputResult, null, 2);
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${agentName ? agentName.toLowerCase().replace(/\s+/g, "-") : "agent"}-output.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-3">
      {/* Action Header & Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2">
        {/* Toggle between Formatted and Raw JSON */}
        <div className="inline-flex p-1 rounded-xl bg-[#FAF5EE] border border-[#EAE3D9]">
          <button
            type="button"
            onClick={() => setViewMode("formatted")}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              viewMode === "formatted"
                ? "bg-white text-[#201515] shadow-xs"
                : "text-[#5C524C] hover:text-[#201515]"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-[#FF4F00]" />
            <span>Polished Output</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode("raw")}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              viewMode === "raw"
                ? "bg-white text-[#201515] shadow-xs"
                : "text-[#5C524C] hover:text-[#201515]"
            }`}
          >
            <FileCode className="w-3.5 h-3.5 text-[#887E78]" />
            <span>Raw JSON</span>
          </button>
        </div>

        {/* Stats & Actions */}
        <div className="flex items-center gap-2">
          {viewMode === "formatted" && textOutput && (
            <div className="hidden sm:flex items-center gap-1 text-[11px] text-[#887E78] px-2 py-1 rounded-md bg-[#FAF5EE]">
              <AlignLeft className="w-3 h-3" />
              <span>{wordCount} words</span>
              <span>•</span>
              <span>{charCount} chars</span>
            </div>
          )}

          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#EAE3D9] bg-white hover:bg-[#FAF5EE] text-[#5C524C] hover:text-[#201515] text-xs font-semibold transition-all cursor-pointer shadow-xs"
            title="Copy output"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-[#059669]" />
                <span className="text-[#059669]">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleDownload}
            className="p-1.5 rounded-lg border border-[#EAE3D9] bg-white hover:bg-[#FAF5EE] text-[#5C524C] hover:text-[#201515] transition-all cursor-pointer shadow-xs"
            title="Download file"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Content Rendering */}
      {viewMode === "formatted" ? (
        <div
          data-lenis-prevent
          className="p-5 sm:p-6 rounded-2xl bg-[#FFFDF9] border border-[#EAE3D9] shadow-xs max-h-[460px] sm:max-h-[520px] overflow-y-auto custom-scrollbar overscroll-contain"
        >
          {textOutput ? (
            <MarkdownRenderer content={textOutput} />
          ) : (
            <div className="text-xs text-[#887E78] italic">No output text available.</div>
          )}
        </div>
      ) : (
        <div
          data-lenis-prevent
          className="max-h-[460px] sm:max-h-[520px] overflow-y-auto custom-scrollbar overscroll-contain rounded-2xl"
        >
          <JsonViewer data={outputResult || {}} title="Complete Execution Output" />
        </div>
      )}
    </div>
  );
}
