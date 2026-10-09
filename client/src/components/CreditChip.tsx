"use client";

import React from "react";
import Link from "next/link";
import { Zap } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

export default function CreditChip({ className }: { className?: string }) {
  const { balance } = useAuth();

  return (
    <Link
      href="/credits"
      className={cn(
        "group inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-violet-950/40 border border-violet-500/30 text-violet-200 hover:border-violet-400 hover:bg-violet-900/50 transition-all shadow-[0_0_15px_-3px_rgba(139,92,246,0.3)]",
        className
      )}
      title="View and manage credits"
    >
      <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400 group-hover:scale-110 transition-transform" />
      <span>{balance}</span>
      <span className="text-violet-400 text-[11px] font-normal">credits</span>
    </Link>
  );
}
