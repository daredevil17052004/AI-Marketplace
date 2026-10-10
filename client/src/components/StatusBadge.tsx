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
      bg: "bg-[#FFF8E6]",
      text: "text-[#B45309]",
      dot: "bg-[#D97706] animate-pulse",
      border: "border-[#FDE68A]",
    },
    processing: {
      label: "Processing",
      bg: "bg-[#EFF6FF]",
      text: "text-[#1D4ED8]",
      dot: "bg-[#2563EB] animate-ping",
      border: "border-[#BFDBFE]",
    },
    completed: {
      label: "Completed",
      bg: "bg-[#ECFDF5]",
      text: "text-[#047857]",
      dot: "bg-[#059669]",
      border: "border-[#A7F3D0]",
    },
    failed: {
      label: "Failed",
      bg: "bg-[#FFF1F2]",
      text: "text-[#BE123C]",
      dot: "bg-[#E11D48]",
      border: "border-[#FECDD3]",
    },
  };

  const current = configs[norm] || configs.pending;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold border transition-all shadow-xs",
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
