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
    <div className={cn("rounded-xl border border-white/10 bg-gray-950/80 overflow-hidden font-mono text-xs", className)}>
      <div className="flex items-center justify-between px-4 py-2.5 bg-gray-900/60 border-b border-white/5">
        <button
          type="button"
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center gap-2 text-gray-300 hover:text-white font-medium transition-colors cursor-pointer"
        >
          {collapsed ? <ChevronRight className="w-3.5 h-3.5 text-gray-400" /> : <ChevronDown className="w-3.5 h-3.5 text-gray-400" />}
          <span>{title}</span>
        </button>

        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-all cursor-pointer"
          title="Copy JSON"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3 text-emerald-400" />
              <span className="text-emerald-400">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3 h-3 text-gray-400" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {!collapsed && (
        <pre className="p-4 overflow-x-auto text-gray-200 leading-relaxed max-h-96">
          <code>{jsonString}</code>
        </pre>
      )}
    </div>
  );
}
