"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Zap,
  Sparkles,
  Bot,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Layers,
} from "lucide-react";
import CardSpotlight from "@/components/CardSpotlight";
import DynamicForm from "@/components/DynamicForm";
import BackgroundBeams from "@/components/BackgroundBeams";
import { fetchAgent, submitJob, Agent } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

export default function AgentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { balance, refreshBalance } = useAuth();
  const agentId = params.id as string;

  const [agent, setAgent] = useState<Agent | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!agentId) return;
    fetchAgent(agentId)
      .then((data) => setAgent(data))
      .catch((err) => setError(err.message || "Failed to load agent details"))
      .finally(() => setLoading(false));
  }, [agentId]);

  const handleSubmit = async (formData: Record<string, unknown>) => {
    if (!agent) return;
    setSubmitting(true);
    try {
      const res = await submitJob(agent.id, formData);
      await refreshBalance();
      // Redirect to job detail page
      router.push(`/jobs/${res.id}`);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Job execution failed");
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center p-8">
        <BackgroundBeams />
        <div className="text-center space-y-3 z-10">
          <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-gray-400">Loading Agent Schema…</p>
        </div>
      </div>
    );
  }

  if (error || !agent) {
    return (
      <div className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center p-8">
        <BackgroundBeams />
        <div className="text-center space-y-4 max-w-md z-10">
          <AlertTriangle className="w-10 h-10 text-rose-400 mx-auto" />
          <h2 className="text-xl font-bold text-white">Agent Not Found</h2>
          <p className="text-xs text-gray-400">{error || "Requested agent does not exist."}</p>
          <Link
            href="/agents"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 text-white text-xs font-semibold hover:bg-white/20"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Catalog</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-[calc(100vh-4rem)] p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-8">
      <BackgroundBeams />

      {/* Back button */}
      <div className="relative z-10">
        <Link
          href="/agents"
          className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Marketplace</span>
        </Link>
      </div>

      {/* Two-Column Grid */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Agent Details */}
        <div className="lg:col-span-5 space-y-6">
          <CardSpotlight className="p-8 space-y-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-violet-500/10 text-violet-300 border border-violet-500/20">
                  {agent.category || "Autonomous Agent"}
                </span>
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-300 bg-amber-400/10 px-3 py-1 rounded-full border border-amber-400/20">
                  <Zap className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
                  {agent.creditCost} credits / run
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {agent.name}
              </h1>

              <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
                {agent.description}
              </p>
            </div>

            {/* Tags */}
            {agent.tags && agent.tags.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-white/5">
                <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">
                  Keywords
                </span>
                <div className="flex flex-wrap gap-2">
                  {agent.tags.map((t) => (
                    <span
                      key={t}
                      className="text-xs font-mono text-violet-300 bg-violet-950/40 border border-violet-500/20 px-2.5 py-1 rounded-lg"
                    >
                      #{t}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Execution Specs */}
            <div className="space-y-3 pt-4 border-t border-white/5 text-xs">
              <span className="font-semibold text-gray-400 uppercase tracking-wider block">
                Execution Guarantee
              </span>
              <div className="space-y-2 text-gray-300">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Stateless sandboxed execution</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-cyan-400" />
                  <span>Sub-second job initialization</span>
                </div>
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-violet-400" />
                  <span>Persistent JSON output storage</span>
                </div>
              </div>
            </div>
          </CardSpotlight>
        </div>

        {/* Right Column: Dynamic Form */}
        <div className="lg:col-span-7">
          <CardSpotlight className="p-8 space-y-6">
            <div className="border-b border-white/5 pb-4">
              <div className="flex items-center gap-2 text-violet-400 text-xs font-semibold uppercase tracking-wider mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Runtime Configuration</span>
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                Input Parameters
              </h2>
              <p className="text-xs text-gray-400 mt-1">
                Fill in the typed requirements defined by {agent.name}&apos;s schema.
              </p>
            </div>

            <DynamicForm
              fields={agent.inputSchema?.fields || []}
              creditCost={agent.creditCost}
              userBalance={balance}
              onSubmit={handleSubmit}
              isLoading={submitting}
            />
          </CardSpotlight>
        </div>
      </div>
    </div>
  );
}
