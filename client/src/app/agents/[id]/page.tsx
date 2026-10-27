"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Zap,
  Bot,
  ShieldCheck,
  AlertTriangle,
  Clock,
  Layers,
  Sparkles,
  RotateCcw,
  BookmarkCheck,
  ChevronDown,
  Trash2,
  X,
} from "lucide-react";
import DynamicForm from "@/components/DynamicForm";
import BackgroundBeams from "@/components/BackgroundBeams";
import CardSpotlight from "@/components/CardSpotlight";
import { fetchAgent, submitJob, Agent } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

// ─── Preset System (localStorage) ─────────────────────────────────────────
interface Preset {
  id: string;
  name: string;
  values: Record<string, unknown>;
  createdAt: string;
}

function getPresetsKey(agentId: string) {
  return `presets_${agentId}`;
}

function loadPresets(agentId: string): Preset[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(getPresetsKey(agentId)) || "[]");
  } catch {
    return [];
  }
}

function savePreset(agentId: string, preset: Preset) {
  const presets = loadPresets(agentId);
  localStorage.setItem(
    getPresetsKey(agentId),
    JSON.stringify([preset, ...presets].slice(0, 10)) // max 10
  );
}

function deletePreset(agentId: string, presetId: string) {
  const presets = loadPresets(agentId).filter((p) => p.id !== presetId);
  localStorage.setItem(getPresetsKey(agentId), JSON.stringify(presets));
}

// ─── Name Preset Modal ─────────────────────────────────────────────────────
function NamePresetModal({
  onConfirm,
  onCancel,
}: {
  onConfirm: (name: string) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState("");
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm"
      onClick={onCancel}
    >
      <motion.div
        initial={{ scale: 0.9, y: 10 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 10 }}
        className="bg-white rounded-3xl border border-[#EAE3D9] shadow-2xl p-8 w-full max-w-sm space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div>
          <h3 className="font-heading text-lg font-bold text-[#201515]">Save as Preset</h3>
          <p className="text-xs text-[#5C524C] mt-1">
            Give this input set a name so you can load it quickly next time.
          </p>
        </div>
        <input
          autoFocus
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && name.trim() && onConfirm(name.trim())}
          placeholder="e.g. SEO blog post template"
          className="w-full bg-white border border-[#D5CBC0] text-[#201515] rounded-xl px-4 py-3 text-sm focus:border-[#FF4F00] focus:ring-2 focus:ring-[#FF4F00]/20 focus:outline-none"
        />
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="btn-zap-secondary flex-1 text-xs py-2.5"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!name.trim()}
            onClick={() => name.trim() && onConfirm(name.trim())}
            className="btn-zap-primary flex-1 text-xs py-2.5 disabled:opacity-50"
          >
            Save Preset
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────
export default function AgentDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { balance, refreshBalance } = useAuth();
  const agentId = params.id as string;

  const [agent, setAgent] = useState<Agent | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Preset state
  const [presets, setPresets] = useState<Preset[]>([]);
  const [presetsOpen, setPresetsOpen] = useState(false);
  const [pendingPresetValues, setPendingPresetValues] = useState<
    Record<string, unknown> | null
  >(null);
  const [showNameModal, setShowNameModal] = useState(false);
  const [activePresetName, setActivePresetName] = useState<string | null>(null);

  // Pre-fill from URL (re-run) — decoded once
  const prefillParam = searchParams.get("prefill");
  const prefillValues: Record<string, unknown> | null = (() => {
    if (!prefillParam) return null;
    try {
      return JSON.parse(decodeURIComponent(prefillParam));
    } catch {
      return null;
    }
  })();

  const fromJobId = searchParams.get("fromJob");

  // Load agent
  useEffect(() => {
    if (!agentId) return;
    fetchAgent(agentId)
      .then((data) => setAgent(data))
      .catch((err) => setError(err.message || "Failed to load agent details"))
      .finally(() => setLoading(false));
  }, [agentId]);

  // Load presets from localStorage
  useEffect(() => {
    if (agentId) setPresets(loadPresets(agentId));
  }, [agentId]);

  const handleSubmit = async (formData: Record<string, unknown>) => {
    if (!agent) return;
    setSubmitting(true);
    try {
      const res = await submitJob(agent.id, formData);
      await refreshBalance();
      router.push(`/jobs/${res.id}`);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Job execution failed");
      setSubmitting(false);
    }
  };

  // Save preset flow
  const handleSavePreset = useCallback((values: Record<string, unknown>) => {
    setPendingPresetValues(values);
    setShowNameModal(true);
  }, []);

  const confirmSavePreset = useCallback(
    (name: string) => {
      if (!pendingPresetValues) return;
      const preset: Preset = {
        id: `${Date.now()}`,
        name,
        values: pendingPresetValues,
        createdAt: new Date().toISOString(),
      };
      savePreset(agentId, preset);
      setPresets(loadPresets(agentId));
      setShowNameModal(false);
      setPendingPresetValues(null);
    },
    [agentId, pendingPresetValues]
  );

  const handleLoadPreset = (preset: Preset) => {
    setActivePresetName(preset.name);
    setPresetsOpen(false);
    // Navigate to self with the preset values encoded
    const encoded = encodeURIComponent(JSON.stringify(preset.values));
    router.replace(`/agents/${agentId}?prefill=${encoded}&preset=${encodeURIComponent(preset.name)}`);
  };

  const handleDeletePreset = (presetId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deletePreset(agentId, presetId);
    setPresets(loadPresets(agentId));
  };

  // ── Loading / error states ─────────────────────────────────────────────
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
          <Link href="/agents" className="btn-zap-secondary inline-flex text-xs px-4 py-2">
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Catalog</span>
          </Link>
        </div>
      </div>
    );
  }

  const presetName = searchParams.get("preset")
    ? decodeURIComponent(searchParams.get("preset")!)
    : null;

  // Determine what to show in the prefill banner
  const prefillBanner = prefillValues ? (
    <div className="flex items-start gap-3 bg-[#EFF6FF] border border-[#BFDBFE] rounded-2xl p-4">
      <RotateCcw className="w-4 h-4 text-[#2563EB] shrink-0 mt-0.5" />
      <div className="text-xs flex-1 min-w-0">
        {presetName ? (
          <>
            <p className="font-bold text-[#1D4ED8]">
              Preset loaded: <span className="text-[#2563EB]">{presetName}</span>
            </p>
            <p className="text-[#3B82F6] mt-0.5">
              Input fields are pre-filled from your saved preset.
            </p>
          </>
        ) : (
          <>
            <p className="font-bold text-[#1D4ED8]">
              Re-running from{" "}
              {fromJobId ? (
                <Link
                  href={`/jobs/${fromJobId}`}
                  className="underline underline-offset-2 hover:text-[#2563EB]"
                >
                  previous job
                </Link>
              ) : (
                "a previous run"
              )}
            </p>
            <p className="text-[#3B82F6] mt-0.5">
              Input fields are pre-filled with the same values. Edit and submit to create a new run.
            </p>
          </>
        )}
      </div>
      <button
        type="button"
        onClick={() => router.replace(`/agents/${agentId}`)}
        className="text-[#93C5FD] hover:text-[#2563EB] transition-colors shrink-0 cursor-pointer"
        title="Clear prefill"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  ) : null;

  return (
    <>
      <AnimatePresence>
        {showNameModal && (
          <NamePresetModal
            onConfirm={confirmSavePreset}
            onCancel={() => {
              setShowNameModal(false);
              setPendingPresetValues(null);
            }}
          />
        )}
      </AnimatePresence>

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

                <p className="text-sm text-[#5C524C] leading-relaxed">{agent.description}</p>
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

            {/* Saved Presets Panel */}
            <div className="bg-white border border-[#EAE3D9] rounded-3xl shadow-sm overflow-hidden">
              <button
                type="button"
                onClick={() => setPresetsOpen((v) => !v)}
                className="w-full flex items-center justify-between p-5 text-left hover:bg-[#FAF5EE] transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <BookmarkCheck className="w-4 h-4 text-[#FF4F00]" />
                  <span className="text-sm font-bold text-[#201515]">Saved Presets</span>
                  {presets.length > 0 && (
                    <span className="text-[11px] font-bold bg-[#FFF2EB] text-[#D43F00] border border-[#FFD6C2] px-2 py-0.5 rounded-full">
                      {presets.length}
                    </span>
                  )}
                </div>
                <ChevronDown
                  className={cn(
                    "w-4 h-4 text-[#887E78] transition-transform duration-200",
                    presetsOpen && "rotate-180"
                  )}
                />
              </button>

              <AnimatePresence initial={false}>
                {presetsOpen && (
                  <motion.div
                    key="presets"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    {presets.length === 0 ? (
                      <div className="px-5 pb-5 text-xs text-[#887E78] italic">
                        No presets saved yet. Fill in the form and click &ldquo;Save as Preset&rdquo;.
                      </div>
                    ) : (
                      <div className="divide-y divide-[#EAE3D9]">
                        {presets.map((preset) => (
                          <button
                            key={preset.id}
                            type="button"
                            onClick={() => handleLoadPreset(preset)}
                            className="w-full flex items-center justify-between gap-3 px-5 py-3 hover:bg-[#FAF5EE] transition-colors text-left group cursor-pointer"
                          >
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-[#201515] truncate">{preset.name}</p>
                              <p className="text-[11px] text-[#887E78] truncate">
                                {Object.keys(preset.values).length} field
                                {Object.keys(preset.values).length !== 1 ? "s" : ""}
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={(e) => handleDeletePreset(preset.id, e)}
                              className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-[#FFF1F2] text-[#887E78] hover:text-[#E11D48] transition-all cursor-pointer"
                              title="Delete preset"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </button>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Right Column: Dynamic Form */}
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
                key={prefillParam || "default"}
                fields={agent.inputSchema?.fields || []}
                creditCost={agent.creditCost}
                userBalance={balance}
                onSubmit={handleSubmit}
                isLoading={submitting}
                initialValues={prefillValues ?? undefined}
                onSavePreset={handleSavePreset}
                prefillBanner={prefillBanner}
              />
            </CardSpotlight>
          </motion.div>
        </div>
      </div>
    </>
  );
}
