"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: "pending" | "processing" | "completed" | "failed" | string;
  className?: string;
  showIcon?: boolean;
}

export default function StatusBadge({ status, className, showIcon = true }: StatusBadgeProps) {
  const norm = (status || "pending").toLowerCase();

  const configs: Record<string, { label: string; bg: string; text: string; dot: string; border: string }> = {
    pending: {
      label: "Pending",
      bg: "bg-amber-500/10",
      text: "text-amber-400",
      dot: "bg-amber-400 animate-pulse",
      border: "border-amber-500/20",
    },
    processing: {
      label: "Processing",
      bg: "bg-sky-500/10",
      text: "text-sky-400",
      dot: "bg-sky-400 animate-ping",
      border: "border-sky-500/20",
    },
    completed: {
      label: "Completed",
      bg: "bg-emerald-500/10",
      text: "text-emerald-400",
      dot: "bg-emerald-400",
      border: "border-emerald-500/20",
    },
    failed: {
      label: "Failed",
      bg: "bg-rose-500/10",
      text: "text-rose-400",
      dot: "bg-rose-400",
      border: "border-rose-500/20",
    },
  };

  const current = configs[norm] || configs.pending;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-medium border backdrop-blur-sm transition-all",
        current.bg,
        current.text,
        current.border,
        className
      )}
    >
      {showIcon && (
        <span className="relative flex h-2 w-2">
          {norm === "processing" && (
            <span className={cn("animate-ping absolute inline-flex h-full w-full rounded-full opacity-75", current.dot)} />
          )}
          <span className={cn("relative inline-flex rounded-full h-2 w-2", current.dot)} />
        </span>
      )}
      <span className="capitalize">{current.label}</span>
    </span>
  );
}
