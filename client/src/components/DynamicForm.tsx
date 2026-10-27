"use client";

import React, { useState } from "react";
import { SchemaField } from "@/lib/api";
import { cn } from "@/lib/utils";
import { Zap, Loader2, AlertCircle, ArrowRight } from "lucide-react";
import Link from "next/link";

interface DynamicFormProps {
  fields: SchemaField[];
  creditCost: number;
  userBalance: number;
  onSubmit: (formData: Record<string, unknown>) => Promise<void>;
  isLoading?: boolean;
  initialValues?: Record<string, unknown>;
  onSavePreset?: (values: Record<string, unknown>) => void;
  prefillBanner?: React.ReactNode;
}

export default function DynamicForm({
  fields,
  creditCost,
  userBalance,
  onSubmit,
  isLoading = false,
  initialValues,
  onSavePreset,
  prefillBanner,
}: DynamicFormProps) {
  // Initialize form state — prefer initialValues (re-run prefill), then schema defaults
  const [formData, setFormData] = useState<Record<string, unknown>>(() => {
    const initial: Record<string, unknown> = {};
    fields.forEach((f) => {
      if (initialValues && initialValues[f.name] !== undefined) {
        initial[f.name] = initialValues[f.name];
      } else if (f.defaultValue !== undefined) {
        initial[f.name] = f.defaultValue;
      } else if (f.type === "boolean") {
        initial[f.name] = false;
      } else if (f.type === "number") {
        initial[f.name] = 0;
      } else {
        initial[f.name] = "";
      }
    });
    return initial;
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const hasEnoughCredits = userBalance >= creditCost;

  const handleChange = (name: string, value: unknown) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};

    fields.forEach((f) => {
      if (f.required) {
        const val = formData[f.name];
        if (val === undefined || val === null || val === "") {
          errors[f.name] = `${f.label || f.name} is required`;
        }
      }
    });

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    if (!hasEnoughCredits) {
      return;
    }

    await onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Prefill banner (Re-run notice / preset loaded notice) */}
      {prefillBanner}

      {/* Credit warning banner if balance too low */}}
      {!hasEnoughCredits && (
        <div className="bg-[#FFF1F2] border border-[#FECDD3] rounded-2xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-[#E11D48] shrink-0 mt-0.5" />
          <div className="text-xs">
            <p className="font-bold text-[#BE123C]">Insufficient credits</p>
            <p className="text-[#9F1239] mt-0.5">
              This agent requires {creditCost} credit{creditCost !== 1 ? "s" : ""}, but you only have {userBalance}.
            </p>
            <Link
              href="/credits"
              className="inline-flex items-center gap-1 font-bold text-[#FF4F00] hover:underline mt-2"
            >
              Top up credits now <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      )}

      {/* Dynamic Fields */}
      <div className="space-y-5">
        {fields.map((field) => {
          const value = formData[field.name];
          const error = formErrors[field.name];

          return (
            <div key={field.name} className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-bold text-[#201515]">
                  {field.label || field.name}
                  {field.required && <span className="text-[#FF4F00] ml-1">*</span>}
                </label>
                <span className="text-[11px] font-mono text-[#887E78] uppercase">{field.type}</span>
              </div>

              {/* Text / Input */}
              {field.type === "text" && (
                <input
                  type="text"
                  value={(value as string) || ""}
                  onChange={(e) => handleChange(field.name, e.target.value)}
                  placeholder={field.placeholder || `Enter ${field.label || field.name}...`}
                  className={cn(
                    "w-full bg-white border border-[#D5CBC0] text-[#201515] rounded-xl px-4 py-3 text-sm focus:border-[#FF4F00] focus:ring-2 focus:ring-[#FF4F00]/20 focus:outline-none transition-all placeholder:text-[#9C9087]",
                    error && "border-[#E11D48] focus:border-[#E11D48] focus:ring-[#E11D48]/20"
                  )}
                />
              )}

              {/* Textarea */}
              {field.type === "textarea" && (
                <textarea
                  rows={5}
                  value={(value as string) || ""}
                  onChange={(e) => handleChange(field.name, e.target.value)}
                  placeholder={field.placeholder || `Enter ${field.label || field.name}...`}
                  className={cn(
                    "w-full bg-white border border-[#D5CBC0] text-[#201515] rounded-xl p-4 text-sm focus:border-[#FF4F00] focus:ring-2 focus:ring-[#FF4F00]/20 focus:outline-none transition-all placeholder:text-[#9C9087] font-sans resize-y",
                    error && "border-[#E11D48] focus:border-[#E11D48] focus:ring-[#E11D48]/20"
                  )}
                />
              )}

              {/* Select */}
              {field.type === "select" && (
                <select
                  value={(value as string) || ""}
                  onChange={(e) => handleChange(field.name, e.target.value)}
                  className={cn(
                    "w-full bg-white border border-[#D5CBC0] text-[#201515] rounded-xl px-4 py-3 text-sm focus:border-[#FF4F00] focus:ring-2 focus:ring-[#FF4F00]/20 focus:outline-none transition-all cursor-pointer",
                    error && "border-[#E11D48]"
                  )}
                >
                  <option value="" disabled>Select an option...</option>
                  {(field.options || []).map((opt) => (
                    <option key={opt} value={opt} className="bg-white text-[#201515]">
                      {opt}
                    </option>
                  ))}
                </select>
              )}

              {/* Number */}
              {field.type === "number" && (
                <input
                  type="number"
                  value={value !== undefined ? Number(value) : 0}
                  onChange={(e) => handleChange(field.name, Number(e.target.value))}
                  placeholder={field.placeholder}
                  className={cn(
                    "w-full bg-white border border-[#D5CBC0] text-[#201515] rounded-xl px-4 py-3 text-sm focus:border-[#FF4F00] focus:ring-2 focus:ring-[#FF4F00]/20 focus:outline-none transition-all placeholder:text-[#9C9087]",
                    error && "border-[#E11D48]"
                  )}
                />
              )}

              {/* Boolean */}
              {field.type === "boolean" && (
                <label className="flex items-center gap-3 p-3 bg-[#FAF5EE] border border-[#EAE3D9] rounded-xl cursor-pointer hover:bg-[#F2ECE2] transition-colors">
                  <input
                    type="checkbox"
                    checked={Boolean(value)}
                    onChange={(e) => handleChange(field.name, e.target.checked)}
                    className="w-4 h-4 text-[#FF4F00] rounded border-[#D5CBC0] focus:ring-[#FF4F00]"
                  />
                  <span className="text-sm font-medium text-[#201515]">
                    {field.placeholder || "Enable this setting"}
                  </span>
                </label>
              )}

              {error && <p className="text-xs text-[#E11D48] font-medium mt-1">{error}</p>}
            </div>
          );
        })}
      </div>

      {/* Execution Action Footer */}
      <div className="pt-4 border-t border-[#EAE3D9] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs text-[#5C524C]">
          <span>Cost per run:</span>
          <span className="inline-flex items-center gap-1 font-bold text-[#D43F00] bg-[#FFF2EB] border border-[#FFD6C2] px-2.5 py-0.5 rounded-full">
            <Zap className="w-3 h-3 text-[#FF4F00] fill-[#FF4F00]" />
            {creditCost} credit{creditCost !== 1 ? "s" : ""}
          </span>
          <span className="text-[#887E78]">(Balance: {userBalance})</span>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {onSavePreset && (
            <button
              type="button"
              onClick={() => onSavePreset(formData)}
              className="btn-zap-secondary text-xs py-2.5 px-4 flex-shrink-0"
            >
              Save as Preset
            </button>
          )}
          <button
            type="submit"
            disabled={!hasEnoughCredits || isLoading}
            className={cn(
              "btn-zap-primary w-full sm:w-auto flex-1 sm:flex-none",
              (!hasEnoughCredits || isLoading) && "opacity-50 cursor-not-allowed hover:transform-none hover:shadow-none"
            )}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Queuing Job…</span>
              </>
            ) : (
              <>
                <span>Execute Agent</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
}
