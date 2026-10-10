"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Sparkles,
  Zap,
  Sliders,
  CheckCircle2,
  Loader2,
  Bot,
} from "lucide-react";
import CardSpotlight from "@/components/CardSpotlight";
import BackgroundBeams from "@/components/BackgroundBeams";
import { createAdminAgent, SchemaField } from "@/lib/api";
import { cn } from "@/lib/utils";

export default function NewAgentPage() {
  const router = useRouter();

  // Agent meta
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [systemPrompt, setSystemPrompt] = useState("");
  const [creditCost, setCreditCost] = useState(2);
  const [category, setCategory] = useState("Developer");
  const [isActive, setIsActive] = useState(true);

  // Schema builder fields
  const [fields, setFields] = useState<SchemaField[]>([
    {
      name: "prompt",
      label: "Prompt Input",
      type: "textarea",
      required: true,
      placeholder: "Enter details for the agent...",
    },
  ]);

  // New field modal / drawer state
  const [showAddField, setShowAddField] = useState(false);
  const [newFieldName, setNewFieldName] = useState("");
  const [newFieldLabel, setNewFieldLabel] = useState("");
  const [newFieldType, setNewFieldType] = useState<SchemaField["type"]>("text");
  const [newFieldRequired, setNewFieldRequired] = useState(false);
  const [newFieldPlaceholder, setNewFieldPlaceholder] = useState("");
  const [newFieldOptions, setNewFieldOptions] = useState("");

  const [saving, setSaving] = useState(false);

  const handleAddField = () => {
    if (!newFieldName.trim()) return;
    const cleanName = newFieldName.trim().replace(/\s+/g, "_").toLowerCase();

    const newField: SchemaField = {
      name: cleanName,
      label: newFieldLabel.trim() || newFieldName,
      type: newFieldType,
      required: newFieldRequired,
      placeholder: newFieldPlaceholder || undefined,
      options:
        newFieldType === "select"
          ? newFieldOptions.split(",").map((s) => s.trim()).filter(Boolean)
          : undefined,
    };

    setFields([...fields, newField]);
    setNewFieldName("");
    setNewFieldLabel("");
    setNewFieldPlaceholder("");
    setNewFieldOptions("");
    setNewFieldRequired(false);
    setShowAddField(false);
  };

  const handleRemoveField = (index: number) => {
    setFields(fields.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return alert("Agent name is required.");

    setSaving(true);
    try {
      await createAdminAgent({
        name,
        description,
        systemPrompt,
        creditCost,
        category,
        isActive,
        inputSchema: { fields },
      });
      router.push("/admin");
    } catch (err) {
      alert("Failed to create agent");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-4rem)] p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto w-full space-y-8">
      <BackgroundBeams />

      <div className="relative z-10 flex items-center justify-between">
        <Link
          href="/admin"
          className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Admin Studio</span>
        </Link>
      </div>

      <div className="relative z-10 space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-violet-500/10 text-violet-300 border border-violet-500/20">
          <Bot className="w-3.5 h-3.5" />
          <span>Agent Publishing Studio</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Publish New Autonomous Agent
        </h1>
        <p className="text-xs sm:text-sm text-gray-400">
          Configure system prompt, credit valuation, and interactive JSON schema inputs.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="relative z-10 space-y-8">
        {/* Core Metadata */}
        <CardSpotlight className="p-8 space-y-6">
          <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-violet-400" />
            <span>Agent Specification</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-300">Agent Name *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Postgres Query Tuner"
                required
                className="w-full px-4 py-2.5 bg-gray-950/70 border border-white/10 rounded-xl text-sm text-white outline-none focus:border-violet-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-300">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-950/70 border border-white/10 rounded-xl text-sm text-white outline-none focus:border-violet-500"
              >
                <option value="Developer">Developer</option>
                <option value="Data">Data & Database</option>
                <option value="Security">Security & Audit</option>
                <option value="Marketing">Marketing & Copy</option>
                <option value="General">General Automation</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-300">Description *</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Concise overview of what this agent accomplishes..."
              required
              className="w-full px-4 py-2.5 bg-gray-950/70 border border-white/10 rounded-xl text-sm text-white outline-none focus:border-violet-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-300">System Instruction Prompt</label>
            <textarea
              rows={4}
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              placeholder="You are an expert AI agent that inspects..."
              className="w-full px-4 py-2.5 bg-gray-950/70 border border-white/10 rounded-xl text-sm text-white outline-none focus:border-violet-500 resize-y"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-300 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                <span>Credit Cost Per Execution</span>
              </label>
              <input
                type="number"
                min={1}
                max={50}
                value={creditCost}
                onChange={(e) => setCreditCost(parseInt(e.target.value) || 1)}
                className="w-full px-4 py-2.5 bg-gray-950/70 border border-white/10 rounded-xl text-sm text-white outline-none focus:border-violet-500"
              />
            </div>

            <div className="flex items-center gap-3 pt-6">
              <input
                type="checkbox"
                id="is-active"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-4 h-4 rounded text-violet-600 accent-violet-600"
              />
              <label htmlFor="is-active" className="text-xs font-semibold text-gray-300 cursor-pointer">
                Publish as Active (Immediate discovery in Marketplace)
              </label>
            </div>
          </div>
        </CardSpotlight>

        {/* Dynamic Schema Builder */}
        <CardSpotlight className="p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <div>
              <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                <Sliders className="w-4 h-4 text-cyan-400" />
                <span>Input Schema Builder</span>
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                Define the runtime arguments your agent accepts.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowAddField(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-violet-300 bg-violet-600/20 hover:bg-violet-600 hover:text-white border border-violet-500/30 transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Field</span>
            </button>
          </div>

          {/* Fields list */}
          <div className="space-y-3">
            {fields.map((f, index) => (
              <div
                key={f.name + index}
                className="p-4 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white text-xs">{f.label || f.name}</span>
                    <span className="font-mono text-[11px] text-gray-500">({f.name})</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 uppercase">
                      {f.type}
                    </span>
                    {f.required && (
                      <span className="text-[10px] text-amber-400 font-semibold">
                        Required
                      </span>
                    )}
                  </div>
                  {f.placeholder && (
                    <p className="text-[11px] text-gray-400">Placeholder: &quot;{f.placeholder}&quot;</p>
                  )}
                  {f.options && (
                    <p className="text-[11px] text-gray-400 font-mono">
                      Options: [{f.options.join(", ")}]
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => handleRemoveField(index)}
                  className="p-1.5 text-gray-500 hover:text-rose-400 transition-colors cursor-pointer"
                  title="Remove Field"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Add Field Subform */}
          {showAddField && (
            <div className="p-5 rounded-2xl bg-gray-950/80 border border-violet-500/30 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-violet-300">
                New Input Parameter
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-gray-400">Field Key *</label>
                  <input
                    type="text"
                    value={newFieldName}
                    onChange={(e) => setNewFieldName(e.target.value)}
                    placeholder="e.g. source_code"
                    className="w-full px-3 py-2 bg-gray-900 border border-white/10 rounded-lg text-xs text-white outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-gray-400">Display Label</label>
                  <input
                    type="text"
                    value={newFieldLabel}
                    onChange={(e) => setNewFieldLabel(e.target.value)}
                    placeholder="e.g. Source Code"
                    className="w-full px-3 py-2 bg-gray-900 border border-white/10 rounded-lg text-xs text-white outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-gray-400">Type</label>
                  <select
                    value={newFieldType}
                    onChange={(e) => setNewFieldType(e.target.value as SchemaField["type"])}
                    className="w-full px-3 py-2 bg-gray-900 border border-white/10 rounded-lg text-xs text-white outline-none"
                  >
                    <option value="text">Single-line Text</option>
                    <option value="textarea">Multi-line Textarea</option>
                    <option value="number">Number</option>
                    <option value="select">Dropdown Select</option>
                    <option value="boolean">Boolean Checkbox</option>
                  </select>
                </div>
              </div>

              {newFieldType === "select" && (
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-gray-400">
                    Dropdown Options (comma separated)
                  </label>
                  <input
                    type="text"
                    value={newFieldOptions}
                    onChange={(e) => setNewFieldOptions(e.target.value)}
                    placeholder="Option 1, Option 2, Option 3"
                    className="w-full px-3 py-2 bg-gray-900 border border-white/10 rounded-lg text-xs text-white outline-none"
                  />
                </div>
              )}

              <div className="flex items-center justify-between pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-300">
                  <input
                    type="checkbox"
                    checked={newFieldRequired}
                    onChange={(e) => setNewFieldRequired(e.target.checked)}
                    className="w-3.5 h-3.5 rounded text-violet-600 accent-violet-600"
                  />
                  <span>Mark as Required</span>
                </label>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddField(false)}
                    className="px-3 py-1.5 rounded-lg text-xs text-gray-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleAddField}
                    className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-violet-600 hover:bg-violet-500 text-white shadow-md shadow-violet-600/30"
                  >
                    Save Field
                  </button>
                </div>
              </div>
            </div>
          )}
        </CardSpotlight>

        {/* Submit */}
        <div className="flex items-center justify-end gap-4">
          <Link
            href="/admin"
            className="px-5 py-2.5 rounded-xl text-xs font-medium text-gray-400 hover:text-white transition-colors"
          >
            Discard
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-violet-600 hover:bg-violet-500 shadow-lg shadow-violet-600/30 flex items-center gap-2 cursor-pointer"
          >
            {saving ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Publishing Agent…</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Publish Agent</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
