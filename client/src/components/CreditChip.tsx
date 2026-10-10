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
        "group inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-[#FFF2EB] border border-[#FFD6C2] text-[#D43F00] hover:bg-[#FFE6D9] hover:border-[#FFB38A] transition-all shadow-sm",
        className
      )}
      title="View and manage credits"
    >
      <Zap className="w-3.5 h-3.5 text-[#FF4F00] fill-[#FF4F00] group-hover:scale-110 transition-transform" />
      <span className="font-bold">{balance}</span>
      <span className="text-[#9C5A3E] text-[11px] font-normal">credits</span>
    </Link>
  );
}
