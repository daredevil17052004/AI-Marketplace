"use client";

import React from "react";
import { cn } from "@/lib/utils";

export default function BackgroundBeams({ className }: { className?: string }) {
  return (
    <div className={cn("absolute inset-0 overflow-hidden pointer-events-none z-0", className)}>
      {/* Warm ambient Zapier orange glow from top */}
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-gradient-to-b from-[#FF4F00]/8 via-[#FF7A38]/4 to-transparent blur-[130px] rounded-full" />
      
      {/* Subtle warm cream glow right */}
      <div className="absolute top-1/4 -right-32 w-[600px] h-[450px] bg-[#FFEBD9]/60 blur-[120px] rounded-full pointer-events-none" />

      {/* Subtle warm glow left */}
      <div className="absolute top-2/3 -left-32 w-[550px] h-[450px] bg-[#FFF2EB]/70 blur-[130px] rounded-full pointer-events-none" />

      {/* Subtle warm grid pattern */}
      <div className="absolute inset-0 bg-warm-grid opacity-60" />
    </div>
  );
}
