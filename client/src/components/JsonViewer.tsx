"use client";

import React, { useState } from "react";
import { Check, Copy, ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface JsonViewerProps {
  data: unknown;
  title?: string;
  defaultCollapsed?: boolean;
  className?: string;
}

export default function JsonViewer({
  data,
  title = "Payload JSON",
  defaultCollapsed = false,
  className,
}: JsonViewerProps) {
  const [copied, setCopied] = useState(false);
  const [collapsed, setCollapsed] = useState(defaultCollapsed);

  const jsonString =
    typeof data === "string"
      ? (() => {
          try {
            return JSON.stringify(JSON.parse(data), null, 2);
          } catch {
            return data;
          }
        })()
      : JSON.stringify(data, null, 2);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(jsonString);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  return (
    <div className={cn("rounded-2xl border border-[#EAE3D9] bg-[#FAF5EE] overflow-hidden font-mono text-xs", className)}>
      <div className="flex items-center justify-between px-4 py-2.5 bg-white border-b border-[#EAE3D9]">
        <button
          type="button"
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center gap-2 text-[#5C524C] hover:text-[#201515] font-semibold transition-colors cursor-pointer"
        >
          {collapsed ? <ChevronRight className="w-3.5 h-3.5 text-[#887E78]" /> : <ChevronDown className="w-3.5 h-3.5 text-[#887E78]" />}
          <span>{title}</span>
        </button>

        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] bg-[#FAF5EE] hover:bg-[#F2ECE2] text-[#5C524C] hover:text-[#201515] transition-all cursor-pointer border border-[#EAE3D9]"
          title="Copy JSON"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3 text-[#059669]" />
              <span className="text-[#059669] font-bold">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3 h-3 text-[#887E78]" />
              <span className="font-medium">Copy</span>
            </>
          )}
        </button>
      </div>

      {!collapsed && (
        <pre className="p-4 overflow-x-auto text-[#201515] leading-relaxed max-h-96">
          <code>{jsonString}</code>
        </pre>
      )}
    </div>
  );
}
