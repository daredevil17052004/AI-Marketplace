"use client";

import React, { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Zap, ArrowRight, Bot, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export interface AgentCardProps {
  id: string;
  name: string;
  description: string;
  creditCost: number;
  category?: string;
}

export default function AgentCard({
  id,
  name,
  description,
  creditCost,
  category,
}: AgentCardProps) {
  const router = useRouter();
  const cardRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  }

  return (
    <motion.article
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => router.push(`/agents/${id}`)}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      className="group relative bg-white border border-[#EAE3D9] rounded-2xl p-6 flex flex-col gap-4
                 transition-all duration-300 hover:border-[#FFB38A] hover:shadow-[0_16px_36px_rgba(255,79,0,0.09)]
                 cursor-pointer overflow-hidden"
    >
      {/* Aceternity Spotlight background glow */}
      <div
        className="pointer-events-none absolute -inset-px transition-opacity duration-300 rounded-2xl z-0"
        style={{
          opacity: isHovered ? 1 : 0,
          background: `radial-gradient(280px circle at ${mousePos.x}px ${mousePos.y}px, rgba(255, 79, 0, 0.08), transparent 75%)`,
        }}
      />

      {/* Top Header: Category & Cost */}
      <div className="relative z-10 flex items-center justify-between gap-2">
        {category ? (
          <span className="inline-flex items-center text-[11px] font-bold text-[#D43F00] bg-[#FFF2EB] border border-[#FFD6C2] rounded-full px-2.5 py-0.5 tracking-wide uppercase transition-transform group-hover:scale-105">
            {category}
          </span>
        ) : (
          <span className="inline-flex items-center text-[11px] font-bold text-[#5C524C] bg-[#FAF5EE] border border-[#EAE3D9] rounded-full px-2.5 py-0.5 tracking-wide uppercase">
            AI Agent
          </span>
        )}

        <div className="inline-flex items-center gap-1 bg-[#FAF5EE] border border-[#EAE3D9] rounded-full px-2.5 py-0.5 group-hover:border-[#FFD6C2] group-hover:bg-[#FFF2EB] transition-colors">
          <Zap className="w-3 h-3 text-[#FF4F00] fill-[#FF4F00] group-hover:scale-110 transition-transform" />
          <span className="text-xs font-bold text-[#201515]">{creditCost}</span>
          <span className="text-[10px] text-[#887E78]">credit{creditCost !== 1 ? "s" : ""}</span>
        </div>
      </div>

      {/* Agent Icon + Title */}
      <div className="relative z-10 flex items-start gap-3.5">
        <div className="w-10 h-10 rounded-xl bg-[#FFF2EB] border border-[#FFD6C2] flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:bg-[#FF4F00] group-hover:text-white transition-all duration-300">
          <Bot className="w-5 h-5 text-[#FF4F00] group-hover:text-white transition-colors" />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="font-heading text-base font-bold text-[#201515] group-hover:text-[#FF4F00] transition-colors line-clamp-1">
            {name}
          </h2>
          <p className="text-xs text-[#887E78] mt-0.5 font-medium flex items-center gap-1">
            <span>Autonomous Specialist</span>
            <Sparkles className="w-2.5 h-2.5 text-[#FF4F00] opacity-0 group-hover:opacity-100 transition-opacity" />
          </p>
        </div>
      </div>

      {/* Description */}
      <p className="relative z-10 text-sm text-[#5C524C] leading-relaxed line-clamp-3 flex-1 font-normal">
        {description}
      </p>

      {/* Footer CTA */}
      <div className="relative z-10 pt-3 border-t border-[#F2ECE2] flex items-center justify-between">
        <span className="text-xs font-semibold text-[#887E78] group-hover:text-[#201515] transition-colors">
          Instant execution
        </span>
        <button
          id={`run-agent-${id}`}
          onClick={(e) => {
            e.stopPropagation();
            router.push(`/agents/${id}`);
          }}
          className="inline-flex items-center gap-1.5 bg-[#FF4F00] hover:bg-[#E04600] active:scale-95 text-white text-xs font-bold px-4 py-2 rounded-full transition-all shadow-sm group-hover:shadow-[0_4px_16px_rgba(255,79,0,0.35)]"
        >
          <span>Run Agent</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </motion.article>
  );
}
