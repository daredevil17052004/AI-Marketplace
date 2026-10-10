"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Zap,
  Bot,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Layers,
  Sparkles,
} from "lucide-react";
import DynamicForm from "@/components/DynamicForm";
import BackgroundBeams from "@/components/BackgroundBeams";
import CardSpotlight from "@/components/CardSpotlight";
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
      <div className="relative min-h-[calc(100vh-4.5rem)] flex items-center justify-center p-8 bg-[#FFFDF9]">
        <BackgroundBeams />
        <div className="text-center space-y-3 z-10">
          <div className="w-10 h-10 border-4 border-[#EAE3D9] border-t-[#FF4F00] rounded-full animate-spin mx-auto" />
          <p className="text-sm font-semibold text-[#5C524C]">Loading Agent Configuration…</p>
        </div>
      </div>
    );
  }

  if (error || !agent) {
    return (
      <div className="relative min-h-[calc(100vh-4.5rem)] flex items-center justify-center p-8 bg-[#FFFDF9]">
        <BackgroundBeams />
        <div className="text-center space-y-4 max-w-md z-10 bg-white border border-[#EAE3D9] p-8 rounded-3xl shadow-sm">
          <AlertTriangle className="w-10 h-10 text-[#E11D48] mx-auto" />
          <h2 className="font-heading text-xl font-bold text-[#201515]">Agent Not Found</h2>
          <p className="text-xs text-[#5C524C]">{error || "Requested agent does not exist."}</p>
          <Link
            href="/agents"
            className="btn-zap-secondary inline-flex text-xs px-4 py-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Catalog</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-[calc(100vh-4.5rem)] p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-8 bg-[#FFFDF9]">
      <BackgroundBeams />

      {/* Back button */}
      <div className="relative z-10">
        <Link
          href="/agents"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#5C524C] hover:text-[#201515] transition-colors bg-white border border-[#EAE3D9] px-3.5 py-1.5 rounded-full shadow-xs hover:border-[#D5CBC0]"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Marketplace</span>
        </Link>
      </div>

      {/* Two-Column Grid */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Agent Details */}
        <motion.div
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="lg:col-span-5 space-y-6"
        >
          <div className="bg-white border border-[#EAE3D9] rounded-3xl p-8 space-y-6 shadow-sm">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#FFF2EB] text-[#D43F00] border border-[#FFD6C2]">
                  {agent.category || "Autonomous Agent"}
                </span>
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#201515] bg-[#FAF5EE] px-3 py-1 rounded-full border border-[#EAE3D9]">
                  <Zap className="w-3.5 h-3.5 fill-[#FF4F00] text-[#FF4F00]" />
                  {agent.creditCost} credits / run
                </span>
              </div>

              <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-[#201515] tracking-tight">
                {agent.name}
              </h1>

              <p className="text-sm text-[#5C524C] leading-relaxed">
                {agent.description}
              </p>
            </div>

            {/* Tags */}
            {agent.tags && agent.tags.length > 0 && (
              <div className="space-y-2 pt-4 border-t border-[#EAE3D9]">
                <span className="text-[11px] font-bold text-[#887E78] uppercase tracking-wider block">
                  Keywords
                </span>
                <div className="flex flex-wrap gap-2">
                  {agent.tags.map((t) => (
                    <span
                      key={t}
                      className="text-xs font-semibold text-[#5C524C] bg-[#FAF5EE] border border-[#EAE3D9] px-2.5 py-1 rounded-lg"
                    >
                      #{t}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Execution Specs */}
            <div className="space-y-3 pt-4 border-t border-[#EAE3D9] text-xs">
              <span className="font-bold text-[#887E78] uppercase tracking-wider block">
                Execution Guarantee
              </span>
              <div className="space-y-2.5 text-[#5C524C]">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#059669]" />
                  <span>Stateless sandboxed execution</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#FF4F00]" />
                  <span>Sub-second job initialization</span>
                </div>
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#2563EB]" />
                  <span>Persistent JSON output storage</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Right Column: Dynamic Form with CardSpotlight */}
        <motion.div
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="lg:col-span-7"
        >
          <CardSpotlight className="p-8 shadow-sm rounded-3xl">
            <div className="border-b border-[#EAE3D9] pb-4 mb-6">
              <div className="flex items-center gap-1.5 text-[#D43F00] text-xs font-bold uppercase tracking-wider mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Runtime Configuration</span>
              </div>
              <h2 className="font-heading text-xl font-bold text-[#201515] tracking-tight">
                Input Parameters
              </h2>
              <p className="text-xs text-[#5C524C] mt-1">
                Fill in the requirements defined by {agent.name}&apos;s schema.
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
        </motion.div>
      </div>
    </div>
  );
}
