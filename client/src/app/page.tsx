"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  Bot,
  Zap,
  ShieldCheck,
  Code2,
  Cpu,
  ArrowRight,
  ChevronRight,
  Terminal,
  Activity,
  Sliders,
  CheckCircle2,
} from "lucide-react";
import BackgroundBeams from "@/components/BackgroundBeams";
import CardSpotlight from "@/components/CardSpotlight";
import NumberTicker from "@/components/NumberTicker";
import { fetchAgents, Agent } from "@/lib/api";

export default function LandingPage() {
  const [featuredAgents, setFeaturedAgents] = useState<Agent[]>([]);

  useEffect(() => {
    fetchAgents().then((agents) => {
      setFeaturedAgents(agents.slice(0, 3));
    });
  }, []);

  return (
    <div className="relative flex flex-col flex-1 overflow-hidden">
      {/* ─── Hero Section ──────────────────────────────────────────────────────── */}
      <section className="relative min-h-[85vh] flex flex-col items-center justify-center text-center px-4 sm:px-6 lg:px-8 pt-16 pb-20">
        <BackgroundBeams />

        <div className="relative z-10 max-w-4xl mx-auto space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold bg-violet-500/10 border border-violet-500/25 text-violet-300 backdrop-blur-md shadow-[0_0_20px_-3px_rgba(139,92,246,0.3)]">
            <Sparkles className="w-3.5 h-3.5 text-violet-400" />
            <span>Next-Gen Autonomous Agent Orchestration</span>
          </div>

          {/* Title */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-[1.1]">
            Deploy Specialized{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400">
              AI Agents
            </span>{" "}
            in Seconds.
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Browse our curated library of production-ready AI agents. Dynamic JSON schema forms, automated job processing, and granular credit metering.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              href="/agents"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 shadow-lg shadow-violet-600/30 hover:shadow-violet-600/50 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 group cursor-pointer"
            >
              <Bot className="w-4 h-4 text-violet-200" />
              <span>Explore Agent Marketplace</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              href="/dashboard"
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl font-semibold text-sm text-gray-200 bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 hover:border-white/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>View Dashboard</span>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </Link>
          </div>

          {/* Micro pill features */}
          <div className="pt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-gray-400">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>50 Free Signup Credits</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>No Credit Card Required</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Dynamic Form Engine</span>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Animated Stats Strip ──────────────────────────────────────────────── */}
      <section className="border-y border-white/[0.08] bg-gray-950/60 backdrop-blur-md py-12 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="space-y-1">
              <div className="text-3xl sm:text-4xl font-extrabold text-white">
                <NumberTicker value={12500} suffix="+" />
              </div>
              <p className="text-xs uppercase tracking-wider text-gray-400 font-medium">Jobs Executed</p>
            </div>
            <div className="space-y-1">
              <div className="text-3xl sm:text-4xl font-extrabold text-violet-400">
                <NumberTicker value={50} suffix="+" />
              </div>
              <p className="text-xs uppercase tracking-wider text-gray-400 font-medium">Specialized Agents</p>
            </div>
            <div className="space-y-1">
              <div className="text-3xl sm:text-4xl font-extrabold text-emerald-400">
                <NumberTicker value={99} suffix=".9%" />
              </div>
              <p className="text-xs uppercase tracking-wider text-gray-400 font-medium">Execution Uptime</p>
            </div>
            <div className="space-y-1">
              <div className="text-3xl sm:text-4xl font-extrabold text-cyan-400">
                <NumberTicker value={450} suffix="ms" />
              </div>
              <p className="text-xs uppercase tracking-wider text-gray-400 font-medium">Avg Job Latency</p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Bento Grid Features ──────────────────────────────────────────────── */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-violet-400">
            Engineered for High-Precision
          </h2>
          <h3 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
            Everything You Need to Run Autonomous Workflows
          </h3>
          <p className="text-sm text-gray-400">
            From flexible runtime schemas to granular pay-per-call metering, explore the full architectural suite.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Dynamic Form Engine */}
          <CardSpotlight className="md:col-span-2 p-8">
            <div className="flex items-center gap-3 text-violet-400 mb-4">
              <div className="p-2.5 rounded-xl bg-violet-500/10 border border-violet-500/20">
                <Sliders className="w-5 h-5" />
              </div>
              <span className="text-xs font-mono uppercase tracking-wider">Dynamic Schema Form Engine</span>
            </div>
            <h4 className="text-xl font-bold text-white mb-2">
              Every Agent Defines Its Own Typed Inputs
            </h4>
            <p className="text-xs sm:text-sm text-gray-400 mb-6 leading-relaxed">
              No static hardcoded forms. Agents specify their schema with required fields, select drop-downs, textareas, and booleans, which render dynamically with instant client-side validation.
            </p>
            <div className="rounded-xl border border-white/10 bg-black/60 p-4 font-mono text-xs text-gray-300">
              <span className="text-violet-400">inputSchema:</span> &#123; fields: [ language: &quot;select&quot;, code: &quot;textarea&quot; ] &#125;
            </div>
          </CardSpotlight>

          {/* Card 2: Live Job Stream & Polling */}
          <CardSpotlight className="p-8">
            <div className="flex items-center gap-3 text-cyan-400 mb-4">
              <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
                <Activity className="w-5 h-5" />
              </div>
              <span className="text-xs font-mono uppercase tracking-wider">Live Job State</span>
            </div>
            <h4 className="text-xl font-bold text-white mb-2">Live Status Polling</h4>
            <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
              Instant transition through Pending, Processing, and Completed with animated pulsing badges and automatic polling termination upon terminal state.
            </p>
          </CardSpotlight>

          {/* Card 3: Transparent Ledger */}
          <CardSpotlight className="p-8">
            <div className="flex items-center gap-3 text-amber-400 mb-4">
              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <Zap className="w-5 h-5" />
              </div>
              <span className="text-xs font-mono uppercase tracking-wider">Credits Ledger</span>
            </div>
            <h4 className="text-xl font-bold text-white mb-2">Granular Credit Ledger</h4>
            <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
              Every run logs a timestamped transaction with exact cost. Never worry about surprise bills with transparent append-only balance accounting.
            </p>
          </CardSpotlight>

          {/* Card 4: Enterprise Sandboxing */}
          <CardSpotlight className="md:col-span-2 p-8">
            <div className="flex items-center gap-3 text-emerald-400 mb-4">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <span className="text-xs font-mono uppercase tracking-wider">Security & Isolation</span>
            </div>
            <h4 className="text-xl font-bold text-white mb-2">Stateless Sandboxed Execution</h4>
            <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
              Worker threads process LLM queries in ephemeral containerized jobs with strict JWT role authentication and input boundary sanitation.
            </p>
          </CardSpotlight>
        </div>
      </section>

      {/* ─── How It Works ──────────────────────────────────────────────────────── */}
      <section className="py-20 border-t border-white/[0.08] bg-gray-950/40 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-semibold text-violet-400 uppercase tracking-widest">Simple Workflow</span>
            <h3 className="text-3xl font-bold text-white tracking-tight">How It Works in 3 Steps</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-violet-500/30 transition-all space-y-4">
              <div className="w-10 h-10 rounded-xl bg-violet-600/20 text-violet-400 flex items-center justify-center font-bold text-base border border-violet-500/30">
                1
              </div>
              <h4 className="text-lg font-bold text-white">Select an Agent</h4>
              <p className="text-xs text-gray-400 leading-relaxed">
                Filter by developer, data, security, or copywriting categories and review credit costs upfront.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-violet-500/30 transition-all space-y-4">
              <div className="w-10 h-10 rounded-xl bg-violet-600/20 text-violet-400 flex items-center justify-center font-bold text-base border border-violet-500/30">
                2
              </div>
              <h4 className="text-lg font-bold text-white">Configure Dynamic Inputs</h4>
              <p className="text-xs text-gray-400 leading-relaxed">
                Supply your prompt, code snippets, or configuration options via the intuitive schema form.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-violet-500/30 transition-all space-y-4">
              <div className="w-10 h-10 rounded-xl bg-violet-600/20 text-violet-400 flex items-center justify-center font-bold text-base border border-violet-500/30">
                3
              </div>
              <h4 className="text-lg font-bold text-white">Inspect Output Results</h4>
              <p className="text-xs text-gray-400 leading-relaxed">
                Watch execution in real-time and review syntax-highlighted JSON or markdown outputs with one-click copy.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Featured Agents ──────────────────────────────────────────────────── */}
      {featuredAgents.length > 0 && (
        <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-12 gap-4">
            <div>
              <span className="text-xs font-semibold uppercase tracking-widest text-violet-400">Featured Agents</span>
              <h3 className="text-3xl font-bold text-white tracking-tight mt-1">Ready to Run Right Now</h3>
            </div>
            <Link
              href="/agents"
              className="text-xs font-medium text-violet-400 hover:text-violet-300 flex items-center gap-1.5 transition-colors"
            >
              <span>Browse All Agents</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredAgents.map((agent) => (
              <CardSpotlight key={agent.id} className="p-6 flex flex-col justify-between group">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-violet-500/10 text-violet-300 border border-violet-500/20">
                      {agent.category || "General"}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-300">
                      <Zap className="w-3.5 h-3.5 fill-amber-300" />
                      {agent.creditCost} credits
                    </span>
                  </div>

                  <h4 className="text-lg font-bold text-white group-hover:text-violet-300 transition-colors">
                    {agent.name}
                  </h4>

                  <p className="text-xs text-gray-400 line-clamp-3 leading-relaxed">
                    {agent.description}
                  </p>
                </div>

                <div className="pt-6 mt-6 border-t border-white/5 flex items-center justify-between">
                  <span className="text-[11px] text-gray-500 font-mono">
                    {agent.inputSchema?.fields?.length || 2} inputs
                  </span>
                  <Link
                    href={`/agents/${agent.id}`}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-violet-400 hover:text-white px-3 py-1.5 rounded-lg bg-violet-600/10 hover:bg-violet-600 transition-all"
                  >
                    <span>Run Agent</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </CardSpotlight>
            ))}
          </div>
        </section>
      )}

      {/* ─── CTA Banner ──────────────────────────────────────────────────────── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto relative z-10">
        <div className="relative rounded-3xl overflow-hidden p-8 sm:p-12 text-center bg-gradient-to-br from-violet-900/40 via-purple-900/20 to-gray-950 border border-violet-500/30 shadow-[0_0_50px_-10px_rgba(139,92,246,0.3)]">
          <div className="absolute inset-0 bg-grid-pattern opacity-30" />
          <div className="relative z-10 space-y-6 max-w-2xl mx-auto">
            <h3 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Start Automating with AI Agents Today
            </h3>
            <p className="text-sm text-violet-200/80 leading-relaxed">
              Create your free account, receive 50 complimentary credits immediately, and execute your first agent in under 60 seconds.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <Link
                href="/register"
                className="w-full sm:w-auto px-8 py-3 rounded-xl font-bold text-sm text-white bg-violet-600 hover:bg-violet-500 shadow-lg shadow-violet-600/30 hover:scale-105 active:scale-95 transition-all"
              >
                Claim 50 Free Credits
              </Link>
              <Link
                href="/agents"
                className="w-full sm:w-auto px-6 py-3 rounded-xl font-medium text-sm text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
              >
                Browse Catalog
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
