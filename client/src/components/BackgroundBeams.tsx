"use client";

import React from "react";
import { cn } from "@/lib/utils";

export default function BackgroundBeams({ className }: { className?: string }) {
  return (
    <div className={cn("absolute inset-0 overflow-hidden pointer-events-none z-0", className)}>
      {/* Primary top glow */}
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[550px] bg-gradient-to-b from-violet-600/25 via-fuchsia-600/10 to-transparent blur-[140px] rounded-full animate-pulse-slow" />
      
      {/* Secondary cyan ambient accent */}
      <div className="absolute top-1/3 -left-40 w-[600px] h-[450px] bg-cyan-600/15 blur-[130px] rounded-full pointer-events-none" />

      {/* Tertiary purple bottom accent */}
      <div className="absolute -bottom-20 right-0 w-[650px] h-[500px] bg-purple-600/15 blur-[150px] rounded-full pointer-events-none" />

      {/* Grid overlay */}
      <div className="absolute inset-0 bg-grid-pattern opacity-60 mask-radial-gradient" />
    </div>
  );
}
