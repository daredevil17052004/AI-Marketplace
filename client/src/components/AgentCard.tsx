"use client";

import { useRouter } from "next/navigation";

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

  return (
    <article
      className="group relative bg-gray-900 border border-gray-800 rounded-2xl p-6 flex flex-col gap-4
                 transition-all duration-300 hover:border-violet-500/50 hover:shadow-xl hover:shadow-violet-500/5
                 hover:-translate-y-0.5 cursor-default"
    >
      {/* Category badge */}
      {category && (
        <span className="inline-flex self-start items-center text-xs font-medium text-violet-400 bg-violet-400/10 border border-violet-400/20 rounded-full px-2.5 py-0.5 tracking-wide uppercase">
          {category}
        </span>
      )}

      {/* Agent icon placeholder */}
      <div className="w-10 h-10 rounded-xl bg-violet-600/20 border border-violet-500/20 flex items-center justify-center group-hover:bg-violet-600/30 transition-colors duration-300">
        <svg className="w-5 h-5 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1 1 .03 2.711-1.442 2.464l-1.544-.258a3.75 3.75 0 00-2.432.592l-.776.518c-.814.542-1.904.542-2.718 0l-.776-.518a3.75 3.75 0 00-2.432-.592l-1.544.258c-1.472.247-2.441-1.464-1.442-2.464L5 14.5" />
        </svg>
      </div>

      {/* Name & description */}
      <div className="flex-1">
        <h2 className="text-base font-semibold text-white leading-snug mb-1.5">{name}</h2>
        <p className="text-sm text-gray-400 leading-relaxed line-clamp-3">{description}</p>
      </div>

      {/* Footer: cost + button */}
      <div className="flex items-center justify-between pt-2 border-t border-gray-800">
        <div className="flex items-center gap-1.5">
          <svg className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 2a8 8 0 100 16A8 8 0 0010 2zm.75 4.75a.75.75 0 00-1.5 0v2.5h-2.5a.75.75 0 000 1.5h2.5v2.5a.75.75 0 001.5 0v-2.5h2.5a.75.75 0 000-1.5h-2.5v-2.5z" />
          </svg>
          <span className="text-sm font-medium text-amber-400">{creditCost} credit{creditCost !== 1 ? "s" : ""}</span>
        </div>
        <button
          id={`run-agent-${id}`}
          onClick={() => router.push(`/marketplace/run/${id}`)}
          className="bg-violet-600 hover:bg-violet-700 active:scale-95 text-white text-sm font-semibold px-4 py-1.5 rounded-lg transition-all duration-200 shadow-md shadow-violet-600/20"
        >
          Run →
        </button>
      </div>
    </article>
  );
}
