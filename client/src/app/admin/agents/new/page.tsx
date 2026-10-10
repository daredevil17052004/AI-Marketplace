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
      label: newFieldLabel.trim() || newFieldName.trim(),
      type: newFieldType,
      required: newFieldRequired,
      placeholder: newFieldPlaceholder.trim() || undefined,
      options:
        newFieldType === "select" && newFieldOptions.trim()
          ? newFieldOptions
              .split(",")
              .map((o) => o.trim())
              .filter(Boolean)
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
    if (!name.trim() || !description.trim()) {
      alert("Please fill in Agent Name and Description.");
      return;
    }

    setSaving(true);
    try {
      await createAdminAgent({
        name,
        description,
        systemPrompt,
        creditCost: Number(creditCost),
        category,
        isActive,
        inputSchema: {
          fields,
        },
      });
      router.push("/admin");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to create agent");
      setSaving(false);
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-4.5rem)] p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto w-full space-y-8 bg-[#FFFDF9]">
      <BackgroundBeams />

      <div className="relative z-10">
        <Link
          href="/admin"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#5C524C] hover:text-[#201515] transition-colors bg-white border border-[#EAE3D9] px-3.5 py-1.5 rounded-full shadow-xs"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Governance</span>
        </Link>
      </div>

      <div className="relative z-10 space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#FFF2EB] text-[#D43F00] border border-[#FFD6C2]">
          <span className="text-[#FF4F00] font-black">_</span>
          <span>Agent Publishing Studio</span>
        </div>
        <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-[#201515] tracking-tight">
          Publish New Autonomous Agent
        </h1>
        <p className="text-sm text-[#5C524C]">
          Configure system prompt, credit valuation, and interactive JSON schema inputs.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="relative z-10 space-y-8">
        {/* Core Metadata */}
        <div className="bg-white border border-[#EAE3D9] rounded-3xl p-8 space-y-6 shadow-sm">
          <h2 className="font-heading text-base font-bold text-[#201515] tracking-tight flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#FF4F00]" />
            <span>Agent Specification</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#201515]">Agent Name *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Postgres Query Tuner"
                required
                className="w-full px-4 py-2.5 bg-white border border-[#D5CBC0] rounded-xl text-sm text-[#201515] outline-none focus:border-[#FF4F00] focus:ring-2 focus:ring-[#FF4F00]/20"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#201515]">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-[#D5CBC0] rounded-xl text-sm text-[#201515] outline-none focus:border-[#FF4F00] cursor-pointer"
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
            <label className="text-xs font-bold text-[#201515]">Description *</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Concise overview of what this agent accomplishes..."
              required
              className="w-full px-4 py-2.5 bg-white border border-[#D5CBC0] rounded-xl text-sm text-[#201515] outline-none focus:border-[#FF4F00] focus:ring-2 focus:ring-[#FF4F00]/20"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#201515]">System Instruction Prompt</label>
            <textarea
              rows={4}
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              placeholder="You are an expert AI agent that inspects..."
              className="w-full px-4 py-2.5 bg-white border border-[#D5CBC0] rounded-xl text-sm text-[#201515] outline-none focus:border-[#FF4F00] focus:ring-2 focus:ring-[#FF4F00]/20 resize-y font-sans"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#201515] flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-[#FF4F00] fill-[#FF4F00]" />
                <span>Credit Cost Per Execution</span>
              </label>
              <input
                type="number"
                min={1}
                max={50}
                value={creditCost}
                onChange={(e) => setCreditCost(Number(e.target.value))}
                className="w-full px-4 py-2.5 bg-white border border-[#D5CBC0] rounded-xl text-sm text-[#201515] outline-none focus:border-[#FF4F00]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#201515]">Initial Visibility</label>
              <div className="flex items-center gap-3 pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-[#201515]">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="w-4 h-4 text-[#FF4F00] rounded"
                  />
                  <span>Active in Public Catalog</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Schema Fields */}
        <div className="bg-white border border-[#EAE3D9] rounded-3xl p-8 space-y-6 shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-[#EAE3D9]">
            <div>
              <h2 className="font-heading text-base font-bold text-[#201515] flex items-center gap-2">
                <Sliders className="w-4 h-4 text-[#FF4F00]" />
                <span>Input Schema Fields ({fields.length})</span>
              </h2>
              <p className="text-xs text-[#5C524C] mt-0.5">
                Defines the inputs the user supplies before executing this agent.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowAddField(true)}
              className="btn-zap-secondary text-xs px-3.5 py-1.5 inline-flex"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Field</span>
            </button>
          </div>

          <div className="space-y-3">
            {fields.map((field, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-4 bg-[#FAF5EE] border border-[#EAE3D9] rounded-2xl text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 font-bold text-[#201515]">
                    <span>{field.label}</span>
                    <span className="font-mono text-[10px] text-[#887E78]">({field.name})</span>
                    {field.required && (
                      <span className="text-[10px] bg-[#FFF2EB] text-[#D43F00] px-2 py-0.5 rounded-full font-bold">
                        Required
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-[#5C524C]">Type: {field.type}</p>
                </div>

                <button
                  type="button"
                  onClick={() => handleRemoveField(idx)}
                  className="p-1.5 text-[#E11D48] hover:bg-[#FFF1F2] rounded-lg transition-colors cursor-pointer"
                  title="Remove field"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {/* New field drawer / mini modal */}
          {showAddField && (
            <div className="p-5 border border-[#FFD6C2] bg-[#FFF2EB]/50 rounded-2xl space-y-4">
              <h3 className="font-heading text-xs font-bold text-[#201515] uppercase tracking-wider">
                Configure New Schema Field
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block font-bold text-[#201515] mb-1">Variable Name *</label>
                  <input
                    type="text"
                    value={newFieldName}
                    onChange={(e) => setNewFieldName(e.target.value)}
                    placeholder="e.g. source_code"
                    className="w-full px-3 py-2 bg-white border border-[#D5CBC0] rounded-xl text-xs outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#201515] mb-1">Display Label</label>
                  <input
                    type="text"
                    value={newFieldLabel}
                    onChange={(e) => setNewFieldLabel(e.target.value)}
                    placeholder="e.g. Source Code"
                    className="w-full px-3 py-2 bg-white border border-[#D5CBC0] rounded-xl text-xs outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#201515] mb-1">Type</label>
                  <select
                    value={newFieldType}
                    onChange={(e) => setNewFieldType(e.target.value as SchemaField["type"])}
                    className="w-full px-3 py-2 bg-white border border-[#D5CBC0] rounded-xl text-xs outline-none cursor-pointer"
                  >
                    <option value="text">Text (Short input)</option>
                    <option value="textarea">Textarea (Long multiline)</option>
                    <option value="select">Select (Dropdown options)</option>
                    <option value="number">Number</option>
                    <option value="boolean">Boolean (Checkbox toggle)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-[#201515] mb-1">Placeholder</label>
                  <input
                    type="text"
                    value={newFieldPlaceholder}
                    onChange={(e) => setNewFieldPlaceholder(e.target.value)}
                    placeholder="e.g. Paste here..."
                    className="w-full px-3 py-2 bg-white border border-[#D5CBC0] rounded-xl text-xs outline-none"
                  />
                </div>
              </div>

              {newFieldType === "select" && (
                <div>
                  <label className="block text-xs font-bold text-[#201515] mb-1">
                    Select Options (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={newFieldOptions}
                    onChange={(e) => setNewFieldOptions(e.target.value)}
                    placeholder="Option 1, Option 2, Option 3"
                    className="w-full px-3 py-2 bg-white border border-[#D5CBC0] rounded-xl text-xs outline-none"
                  />
                </div>
              )}

              <div className="flex items-center justify-between pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-[#201515]">
                  <input
                    type="checkbox"
                    checked={newFieldRequired}
                    onChange={(e) => setNewFieldRequired(e.target.checked)}
                    className="w-4 h-4 text-[#FF4F00] rounded"
                  />
                  <span>Mark as Required</span>
                </label>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddField(false)}
                    className="btn-zap-secondary text-xs px-3 py-1.5"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleAddField}
                    className="btn-zap-primary text-xs px-4 py-1.5"
                  >
                    Save Field
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-3 pt-4">
          <Link
            href="/admin"
            className="btn-zap-secondary text-xs px-5 py-2.5"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="btn-zap-primary text-xs px-6 py-2.5 font-bold"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Publishing Agent…</span>
              </>
            ) : (
              <span>Publish Agent</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
