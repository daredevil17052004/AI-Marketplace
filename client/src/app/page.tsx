"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Sparkles,
  Bot,
  Zap,
  Cpu,
  ArrowRight,
  ChevronRight,
  CheckCircle2,
  Workflow,
  Clock,
  Layers,
  Terminal,
  Database,
  Play,
  RotateCw,
  Gauge,
  Lock,
} from "lucide-react";
import BackgroundBeams from "@/components/BackgroundBeams";
import NumberTicker from "@/components/NumberTicker";
import AgentCard from "@/components/AgentCard";
import { fetchAgents, Agent } from "@/lib/api";
import {
  FlipWords,
  TextGenerateEffect,
  BentoGrid,
  BentoGridItem,
  HoverBorderGradient,
  MovingBorderButton,
  SparklesCore,
  AnimatedTooltip,
} from "@/components/ui";

export default function LandingPage() {
  const [featuredAgents, setFeaturedAgents] = useState<Agent[]>([]);
  const [activeWorkflowTab, setActiveWorkflowTab] = useState<"code" | "summary" | "seo">("code");
  const [isRunningSim, setIsRunningSim] = useState(false);
  const [simStep, setSimStep] = useState(2); // 0=idle, 1=queue, 2=gemini, 3=done

  useEffect(() => {
    fetchAgents().then((agents) => {
      setFeaturedAgents(agents.slice(0, 3));
    });
  }, []);

  const runSimulation = () => {
    if (isRunningSim) return;
    setIsRunningSim(true);
    setSimStep(0);
    setTimeout(() => setSimStep(1), 600);
    setTimeout(() => setSimStep(2), 1600);
    setTimeout(() => {
      setSimStep(3);
      setIsRunningSim(false);
    }, 2800);
  };

  const workflowDemos = {
    code: {
      title: "Code Refactor Specialist",
      tag: "Developer Tools",
      input: "function calc(a,b) { var r = 0; for(var i=0; i<a.length; i++) { r += a[i]*b; } return r; }",
      agentPrompt: "Refactor to idiomatic TypeScript with strict typing, reduce(), and JSDoc...",
      output: "export const computeProductSum = (items: readonly number[], multiplier: number): number => items.reduce((acc, curr) => acc + curr * multiplier, 0);",
      credits: 2,
    },
    summary: {
      title: "Executive Summarizer",
      tag: "Productivity",
      input: "Quarterly review transcripts with 4 departments: sales +24%, support resolution time dropped by 18%, infra migration complete...",
      agentPrompt: "Extract top 3 executive takeaways, strategic wins, and immediate action items...",
      output: "• Sales grew +24% YoY exceeding forecast\n• Support resolution improved 18% with zero escalation breaches\n• Cloud migration finalized ahead of schedule",
      credits: 1,
    },
    seo: {
      title: "SEO Copywriter",
      tag: "Marketing",
      input: "Topic: 'Next.js Turbopack Performance Guide', Audience: Senior Frontend Engineers",
      agentPrompt: "Generate high-ranking meta title, engaging intro, and technical H2 outline...",
      output: "H1: Mastering Next.js Turbopack: Ultra-Fast Builds in 2026\nMeta: Discover how Next.js Turbopack delivers 10x faster HMR and optimized asset pipelines...",
      credits: 3,
    },
  };

  const currentDemo = workflowDemos[activeWorkflowTab];

  const automatorTeam = [
    { id: 1, name: "Sarah Chen", designation: "AI Ops Lead", initials: "SC" },
    { id: 2, name: "Alex Rivera", designation: "Data Engineer", initials: "AR" },
    { id: 3, name: "Liam Patel", designation: "Fullstack Automator", initials: "LP" },
    { id: 4, name: "Elena Rostova", designation: "ML Specialist", initials: "ER" },
  ];

  return (
    <div className="relative flex flex-col flex-1 overflow-hidden bg-[#FFFDF9]">
      {/* ─── Hero Section with Aceternity Sparkles & FlipWords ──────────────────── */}
      <section className="relative min-h-[85vh] flex flex-col items-center justify-center text-center px-4 sm:px-6 lg:px-8 pt-16 pb-20">
        <BackgroundBeams />

        {/* Subtle Aceternity warm Sparkles layer */}
        <div className="absolute inset-0 max-w-5xl mx-auto h-[480px] pointer-events-none">
          <SparklesCore
            minSize={0.6}
            maxSize={2.0}
            particleDensity={35}
            particleColor="#FF4F00"
          />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto space-y-8">
          {/* Animated Eyebrow Badge */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex justify-center"
          >
            <HoverBorderGradient
              as="div"
              className="text-xs font-bold uppercase tracking-wider text-[#5C524C] py-1.5 px-4 flex items-center gap-2"
            >
              <span className="w-4 h-1.5 bg-[#FF4F00] rounded-xs" />
              <span>Autonomous AI Agent Platform</span>
            </HoverBorderGradient>
          </motion.div>

          {/* Title with Degular font and Aceternity FlipWords */}
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-display text-5xl sm:text-7xl lg:text-[5.25rem] font-medium text-[#201515] tracking-tight leading-[1.0]"
          >
            Automate your intellect with{" "}
            <FlipWords
              words={["_AI Agents", "_Pipelines", "_Workflows", "_Autonomous Bots"]}
              duration={2800}
              className="text-[#FF4F00]"
            />
          </motion.h1>

          {/* Subtitle with Aceternity TextGenerateEffect */}
          <div className="max-w-2xl mx-auto">
            <TextGenerateEffect
              words="Browse our curated library of specialized autonomous agents. Dynamic forms, real-time BullMQ queuing, and pay-as-you-go credit metering — handled effortlessly."
              className="text-lg sm:text-xl text-[#36342e] font-normal leading-relaxed"
              duration={0.4}
            />
          </div>

          {/* CTAs with Aceternity animated interaction */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2"
          >
            <Link
              href="/agents"
              className="btn-zap-primary w-full sm:w-auto text-base"
            >
              <span>Explore 4+ Live Agents</span>
              <span className="zap-arrow">
                <ArrowRight className="w-4 h-4" />
              </span>
            </Link>

            <Link
              href="/dashboard"
              className="btn-zap-secondary w-full sm:w-auto text-base"
            >
              <span>View Dashboard</span>
              <span className="zap-arrow">
                <ChevronRight className="w-4 h-4 text-[#887E78]" />
              </span>
            </Link>
          </motion.div>

          {/* Micro trust signals & AnimatedTooltip */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-6 text-xs text-[#605d52] font-semibold"
          >
            <div className="flex items-center gap-2">
              <span className="text-[#887E78] text-[11px]">Trusted by teams:</span>
              <AnimatedTooltip items={automatorTeam} />
            </div>

            <div className="flex flex-wrap items-center justify-center gap-5">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#2ca47e]" />
                <span>100 Free Signup Credits</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#2ca47e]" />
                <span>No Credit Card Required</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#2ca47e]" />
                <span>Real-Time WebSocket Updates</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── Animated Zapier Automation Workflow Interactive Demo ──────────────── */}
      <section className="border-y border-[#EAE3D9] bg-[#FAF5EE] py-16 relative z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white border border-[#EAE3D9] text-[#5C524C]">
              <Workflow className="w-3.5 h-3.5 text-[#FF4F00]" />
              <span>The Autonomous Flow</span>
            </div>
            <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-[#201515]">
              How agent execution works
            </h2>
            <p className="text-sm text-[#5C524C]">
              Just like a Zapier Zap, agents execute in structured, verifiable steps.
            </p>

            {/* Workflow Tabs with animated layout indicator */}
            <div className="inline-flex p-1 bg-white border border-[#EAE3D9] rounded-full mt-4 relative">
              {(["code", "summary", "seo"] as const).map((tab) => {
                const isActive = activeWorkflowTab === tab;
                return (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => {
                      setActiveWorkflowTab(tab);
                      setSimStep(2);
                    }}
                    className={`relative px-4 py-1.5 text-xs font-bold rounded-full transition-colors cursor-pointer z-10 ${
                      isActive ? "text-[#FFFDF9]" : "text-[#5C524C] hover:text-[#201515]"
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeWorkflowPill"
                        className="absolute inset-0 bg-[#201515] rounded-full z-[-1]"
                        transition={{ type: "spring", stiffness: 350, damping: 30 }}
                      />
                    )}
                    {tab === "code" && "Code Refactor"}
                    {tab === "summary" && "Executive Summary"}
                    {tab === "seo" && "SEO Copywriter"}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Connected Flow Pipeline */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            {/* Step 1: Input Trigger */}
            <motion.div
              whileHover={{ y: -3 }}
              className="bg-white border border-[#EAE3D9] rounded-2xl p-6 shadow-sm flex flex-col justify-between space-y-4 relative hover:border-[#FFB38A] transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#D43F00] bg-[#FFF2EB] border border-[#FFD6C2] px-2.5 py-0.5 rounded-full">
                  1. Trigger / Input
                </span>
                <span className="text-xs font-semibold text-[#887E78]">Schema Form</span>
              </div>
              <div className="space-y-2">
                <h3 className="font-heading font-bold text-[#201515] text-base">{currentDemo.title}</h3>
                <div className="p-3 bg-[#FAF5EE] border border-[#EAE3D9] rounded-xl font-mono text-xs text-[#5C524C] line-clamp-3">
                  {currentDemo.input}
                </div>
              </div>
              <div className="flex items-center justify-between text-xs text-[#887E78] pt-2 border-t border-[#F2ECE2]">
                <span>Cost: {currentDemo.credits} credits</span>
                <span className="text-[#059669] font-medium">✓ Validated</span>
              </div>
            </motion.div>

            {/* Step 2: BullMQ & Gemini Reasoning */}
            <motion.div
              whileHover={{ y: -3 }}
              className="bg-white border border-[#EAE3D9] rounded-2xl p-6 shadow-sm flex flex-col justify-between space-y-4 relative hover:border-[#FFB38A] transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#1D4ED8] bg-[#EFF6FF] border border-[#BFDBFE] px-2.5 py-0.5 rounded-full">
                  2. Redis & Gemini 2.5
                </span>
                <span className="text-xs font-semibold text-[#887E78]">Worker Job</span>
              </div>
              <div className="space-y-2">
                <h3 className="font-heading font-bold text-[#201515] text-base">Autonomous Reasoning</h3>
                <div className="p-3 bg-[#FAF5EE] border border-[#EAE3D9] rounded-xl font-mono text-xs text-[#5C524C] line-clamp-3">
                  {currentDemo.agentPrompt}
                </div>
              </div>
              <div className="flex items-center justify-between text-xs pt-2 border-t border-[#F2ECE2]">
                <span className="text-[#5C524C]">BullMQ Queue: active</span>
                <span className="text-[#FF4F00] font-bold flex items-center gap-1.5">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF4F00] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#FF4F00]"></span>
                  </span>
                  Processing
                </span>
              </div>
            </motion.div>

            {/* Step 3: Result Action */}
            <motion.div
              whileHover={{ y: -3 }}
              className="bg-white border border-[#EAE3D9] rounded-2xl p-6 shadow-sm flex flex-col justify-between space-y-4 relative hover:border-[#FFB38A] transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#047857] bg-[#ECFDF5] border border-[#A7F3D0] px-2.5 py-0.5 rounded-full">
                  3. Action / Result
                </span>
                <span className="text-xs font-semibold text-[#887E78]">WebSocket Broadcast</span>
              </div>
              <div className="space-y-2">
                <h3 className="font-heading font-bold text-[#201515] text-base">Completed Output</h3>
                <div className="p-3 bg-[#ECFDF5] border border-[#A7F3D0] rounded-xl font-mono text-xs text-[#065F46] line-clamp-3">
                  {currentDemo.output}
                </div>
              </div>
              <div className="flex items-center justify-between text-xs pt-2 border-t border-[#F2ECE2]">
                <span className="text-[#059669] font-bold">✓ Status: 200 OK</span>
                <span className="text-[#887E78]">Duration: ~1.2s</span>
              </div>
            </motion.div>
          </div>

          {/* Trigger Simulation Button with Moving Border */}
          <div className="flex justify-center pt-2">
            <MovingBorderButton
              onClick={runSimulation}
              disabled={isRunningSim}
              duration={3500}
              borderRadius="9999px"
              className="px-6 py-2.5 text-xs font-bold text-[#201515] cursor-pointer"
            >
              {isRunningSim ? (
                <span className="flex items-center gap-2">
                  <RotateCw className="w-3.5 h-3.5 text-[#FF4F00] animate-spin" />
                  <span>Simulating Queue Pipeline…</span>
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Play className="w-3.5 h-3.5 text-[#FF4F00] fill-[#FF4F00]" />
                  <span>Test Run This Workflow Pipeline</span>
                </span>
              )}
            </MovingBorderButton>
          </div>
        </div>
      </section>

      {/* ─── Stats Banner Strip ────────────────────────────────────────────────── */}
      <section className="border-b border-[#EAE3D9] bg-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center divide-y lg:divide-y-0 lg:divide-x divide-[#EAE3D9]">
            <motion.div
              whileHover={{ scale: 1.03 }}
              className="space-y-1 pt-4 lg:pt-0 transition-transform"
            >
              <p className="font-heading text-3xl sm:text-4xl font-extrabold text-[#201515]">
                <NumberTicker value={4} />+
              </p>
              <p className="text-xs sm:text-sm font-semibold text-[#887E78]">Specialized Agents</p>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.03 }}
              className="space-y-1 pt-4 lg:pt-0 transition-transform"
            >
              <p className="font-heading text-3xl sm:text-4xl font-extrabold text-[#201515]">
                <NumberTicker value={100} />%
              </p>
              <p className="text-xs sm:text-sm font-semibold text-[#887E78]">Automated Queuing</p>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.03 }}
              className="space-y-1 pt-4 lg:pt-0 transition-transform"
            >
              <p className="font-heading text-3xl sm:text-4xl font-extrabold text-[#201515]">
                ~<NumberTicker value={1} />.2s
              </p>
              <p className="text-xs sm:text-sm font-semibold text-[#887E78]">Average Job Latency</p>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.03 }}
              className="space-y-1 pt-4 lg:pt-0 transition-transform"
            >
              <p className="font-heading text-3xl sm:text-4xl font-extrabold text-[#201515]">
                <NumberTicker value={100} />
              </p>
              <p className="text-xs sm:text-sm font-semibold text-[#887E78]">Free Bonus Credits</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── Featured Agents Catalog ───────────────────────────────────────────── */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full space-y-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[#EAE3D9]">
          <div className="space-y-2 max-w-xl">
            <span className="text-xs font-bold uppercase tracking-wider text-[#D43F00] bg-[#FFF2EB] border border-[#FFD6C2] px-3 py-1 rounded-full">
              Live Catalog
            </span>
            <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-[#201515] tracking-tight">
              Curated for productivity
            </h2>
            <p className="text-sm text-[#5C524C]">
              Select an agent, configure dynamic inputs, and execute seamlessly with pay-per-run credits.
            </p>
          </div>

          <Link
            href="/agents"
            className="inline-flex items-center gap-2 text-sm font-bold text-[#FF4F00] hover:text-[#E04600] group"
          >
            <span>View All Agents</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featuredAgents.length > 0 ? (
            featuredAgents.map((agent) => (
              <AgentCard
                key={agent.id}
                id={agent.id}
                name={agent.name}
                description={agent.description}
                creditCost={agent.creditCost}
                category={agent.category}
              />
            ))
          ) : (
            <div className="col-span-3 text-center py-12 text-[#887E78] text-sm">
              Loading featured agents…
            </div>
          )}
        </div>
      </section>

      {/* ─── Aceternity Bento Grid Features ────────────────────────────────────── */}
      <section className="border-t border-[#EAE3D9] bg-[#FAF5EE] py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#5C524C] bg-white border border-[#EAE3D9] px-3 py-1 rounded-full">
              Architecture & Features
            </span>
            <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-[#201515]">
              Engineered like a modern automation hub
            </h2>
            <p className="text-sm text-[#5C524C]">
              Built with an enterprise asynchronous pipeline to handle unpredictable generative AI latencies.
            </p>
          </div>

          <BentoGrid className="max-w-6xl mx-auto">
            <BentoGridItem
              title="Dynamic Schema Engine"
              description="Agents declare input schemas with JSON. The frontend automatically renders validated forms without writing bespoke UI code."
              header={
                <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-[#FFF2EB] to-[#FAF8F5] border border-[#FFD6BE] p-4 flex-col justify-center">
                  <div className="flex items-center gap-2 text-xs font-mono text-[#D43F00] font-semibold">
                    <Terminal className="w-4 h-4 text-[#FF4F00]" />
                    <span>SchemaValidator.validate(data)</span>
                  </div>
                  <div className="mt-2 text-[11px] text-[#887E78] font-mono">
                    ✓ z.object({"{ code, language, style }"})
                  </div>
                </div>
              }
              icon={<Cpu className="w-5 h-5" />}
              className="md:col-span-1"
            />

            <BentoGridItem
              title="BullMQ & Redis Background Worker"
              description="Long-running AI model calls are offloaded to dedicated worker processes. The HTTP server never blocks or drops user connections."
              header={
                <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-[#EFF6FF] to-[#FAF8F5] border border-[#BFDBFE] p-4 flex-col justify-center">
                  <div className="flex items-center justify-between text-xs font-mono text-[#1D4ED8] font-semibold">
                    <span className="flex items-center gap-1.5">
                      <Database className="w-4 h-4" />
                      Queue: agent-execution
                    </span>
                    <span className="text-[10px] bg-white px-2 py-0.5 rounded-full border border-[#BFDBFE]">
                      Active: 1
                    </span>
                  </div>
                  <div className="mt-2 text-[11px] text-[#5C524C] font-mono">
                    Redis 6379 ➜ Worker Process ➜ PostgreSQL
                  </div>
                </div>
              }
              icon={<Database className="w-5 h-5 text-[#1D4ED8]" />}
              className="md:col-span-1"
            />

            <BentoGridItem
              title="Granular Credit Metering"
              description="Immutable credit ledger tracks every transaction. Transparent pay-per-run pricing ensures zero unexpected monthly charges."
              header={
                <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-[#ECFDF5] to-[#FAF8F5] border border-[#A7F3D0] p-4 flex-col justify-center">
                  <div className="flex items-center justify-between text-xs font-mono text-[#047857] font-semibold">
                    <span className="flex items-center gap-1.5">
                      <Zap className="w-4 h-4 text-[#047857] fill-[#047857]" />
                      Ledger: Deduct & Refund
                    </span>
                    <span className="text-[10px] bg-white px-2 py-0.5 rounded-full border border-[#A7F3D0]">
                      Atomic
                    </span>
                  </div>
                  <div className="mt-2 text-[11px] text-[#5C524C] font-mono">
                    Transaction isolation with row-level locks
                  </div>
                </div>
              }
              icon={<Zap className="w-5 h-5 text-[#047857]" />}
              className="md:col-span-1"
            />
          </BentoGrid>
        </div>
      </section>

      {/* ─── High Contrast Callout Section (Zapier Charcoal Dark Section) ─────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
        <motion.div
          whileHover={{ scale: 1.005 }}
          className="bg-[#14100E] rounded-3xl p-10 sm:p-16 text-center space-y-8 relative overflow-hidden shadow-2xl transition-transform"
        >
          {/* Subtle warm orange ambient aura inside dark section */}
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#FF4F00]/15 blur-[120px] rounded-full pointer-events-none" />

          {/* Aceternity sparkles in dark callout */}
          <div className="absolute inset-0 pointer-events-none opacity-40">
            <SparklesCore
              minSize={0.5}
              maxSize={1.8}
              particleDensity={25}
              particleColor="#FFA066"
            />
          </div>

          <div className="relative z-10 max-w-2xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/10 text-[#FF4F00] border border-white/10">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Instant Setup</span>
            </div>

            <h2 className="font-heading text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
              Ready to automate your workflows?
            </h2>

            <p className="text-base text-[#D5CBC0] leading-relaxed">
              Create an account in 30 seconds and receive 100 free execution credits immediately.
            </p>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/register"
                className="btn-zap-primary w-full sm:w-auto text-base py-3.5 px-8 font-bold"
              >
                <span>Get Started with 100 Credits</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/agents"
                className="w-full sm:w-auto px-7 py-3.5 rounded-full font-bold text-sm text-white bg-white/10 hover:bg-white/15 border border-white/15 transition-all"
              >
                Browse Catalog
              </Link>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
