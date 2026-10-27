"use client";

import React, { useState } from "react";
import { Copy, Check, FileCode, SlidersHorizontal } from "lucide-react";
import JsonViewer from "./JsonViewer";

interface FormattedInputProps {
  inputPayload: Record<string, unknown> | unknown;
}

export default function FormattedInput({ inputPayload }: FormattedInputProps) {
  const [viewMode, setViewMode] = useState<"formatted" | "raw">("formatted");
  const [copied, setCopied] = useState(false);

  const payloadObj =
    inputPayload && typeof inputPayload === "object"
      ? (inputPayload as Record<string, unknown>)
      : {};

  const entries = Object.entries(payloadObj);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(inputPayload, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  return (
    <div className="space-y-3">
      {/* Header Tabs & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2">
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
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#FF4F00]" />
            <span>Parameters</span>
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

        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#EAE3D9] bg-white hover:bg-[#FAF5EE] text-[#5C524C] hover:text-[#201515] text-xs font-semibold transition-all cursor-pointer shadow-xs"
          title="Copy input payload"
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
      </div>

      {/* Content */}
      {viewMode === "formatted" && entries.length > 0 ? (
        <div
          data-lenis-prevent
          className="space-y-3 max-h-[460px] sm:max-h-[520px] overflow-y-auto custom-scrollbar overscroll-contain pr-1"
        >
          {entries.map(([key, val]) => {
            const isLongText = typeof val === "string" && val.length > 60;
            return (
              <div
                key={key}
                className="p-4 rounded-2xl bg-[#FFFDF9] border border-[#EAE3D9] space-y-1.5 shadow-2xs"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-[#887E78] uppercase tracking-wider">
                    {key.replace(/([A-Z])/g, " $1").replace(/_/g, " ")}
                  </span>
                  <span className="text-[10px] font-mono text-[#A89F97] bg-[#FAF5EE] px-1.5 py-0.5 rounded">
                    {typeof val}
                  </span>
                </div>
                {isLongText ? (
                  <p
                    data-lenis-prevent
                    className="text-xs text-[#201515] leading-relaxed whitespace-pre-wrap bg-[#FAF5EE] p-3 rounded-xl border border-[#F0EAE1] max-h-40 overflow-y-auto custom-scrollbar overscroll-contain"
                  >
                    {String(val)}
                  </p>
                ) : (
                  <div className="text-xs font-semibold text-[#201515]">
                    {typeof val === "object" ? JSON.stringify(val) : String(val)}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div
          data-lenis-prevent
          className="max-h-[460px] sm:max-h-[520px] overflow-y-auto custom-scrollbar overscroll-contain rounded-2xl"
        >
          <JsonViewer data={inputPayload || {}} title="Input Parameters JSON" />
        </div>
      )}
    </div>
  );
}
