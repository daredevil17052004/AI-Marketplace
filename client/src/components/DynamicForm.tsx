"use client";

import React, { useState } from "react";
import { SchemaField } from "@/lib/api";
import { cn } from "@/lib/utils";
import { Sparkles, Loader2, AlertCircle } from "lucide-react";

interface DynamicFormProps {
  fields: SchemaField[];
  creditCost: number;
  userBalance: number;
  onSubmit: (formData: Record<string, unknown>) => Promise<void>;
  isLoading?: boolean;
}

export default function DynamicForm({
  fields,
  creditCost,
  userBalance,
  onSubmit,
  isLoading = false,
}: DynamicFormProps) {
  // Initialize default form state
  const [formData, setFormData] = useState<Record<string, unknown>>(() => {
    const initial: Record<string, unknown> = {};
    fields.forEach((f) => {
      if (f.defaultValue !== undefined) {
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
        if (val === undefined || val === "" || val === null) {
          errors[f.name] = `${f.label || f.name} is required.`;
        }
      }
    });

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    await onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-5">
        {fields.map((field) => {
          const fieldId = `field-${field.name}`;
          const isError = Boolean(formErrors[field.name]);

          return (
            <div key={field.name} className="space-y-2">
              <div className="flex items-center justify-between">
                <label
                  htmlFor={fieldId}
                  className="block text-sm font-semibold text-gray-200"
                >
                  {field.label || field.name}
                  {field.required && <span className="text-violet-400 ml-1">*</span>}
                </label>
                <span className="text-[11px] text-gray-500 uppercase tracking-wider">
                  {field.type}
                </span>
              </div>

              {/* Text / Input */}
              {field.type === "text" && (
                <input
                  id={fieldId}
                  type="text"
                  value={(formData[field.name] as string) || ""}
                  onChange={(e) => handleChange(field.name, e.target.value)}
                  placeholder={field.placeholder || `Enter ${field.label || field.name}...`}
                  className={cn(
                    "w-full px-4 py-3 bg-gray-950/60 border rounded-xl text-sm text-gray-100 placeholder-gray-500 outline-none transition-all duration-200",
                    isError
                      ? "border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                      : "border-white/10 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
                  )}
                />
              )}

              {/* Textarea */}
              {field.type === "textarea" && (
                <textarea
                  id={fieldId}
                  rows={4}
                  value={(formData[field.name] as string) || ""}
                  onChange={(e) => handleChange(field.name, e.target.value)}
                  placeholder={field.placeholder || `Enter ${field.label || field.name}...`}
                  className={cn(
                    "w-full px-4 py-3 bg-gray-950/60 border rounded-xl text-sm text-gray-100 placeholder-gray-500 outline-none transition-all duration-200 resize-y",
                    isError
                      ? "border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                      : "border-white/10 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
                  )}
                />
              )}

              {/* Number */}
              {field.type === "number" && (
                <input
                  id={fieldId}
                  type="number"
                  value={(formData[field.name] as number) ?? ""}
                  onChange={(e) => handleChange(field.name, parseFloat(e.target.value) || 0)}
                  placeholder={field.placeholder || "0"}
                  className={cn(
                    "w-full px-4 py-3 bg-gray-950/60 border rounded-xl text-sm text-gray-100 placeholder-gray-500 outline-none transition-all duration-200",
                    isError
                      ? "border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                      : "border-white/10 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
                  )}
                />
              )}

              {/* Select */}
              {field.type === "select" && (
                <select
                  id={fieldId}
                  value={(formData[field.name] as string) || ""}
                  onChange={(e) => handleChange(field.name, e.target.value)}
                  className="w-full px-4 py-3 bg-gray-950/80 border border-white/10 rounded-xl text-sm text-gray-100 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all duration-200"
                >
                  {(field.options || []).map((opt) => (
                    <option key={opt} value={opt} className="bg-gray-900 text-gray-100">
                      {opt}
                    </option>
                  ))}
                </select>
              )}

              {/* Boolean / Switch */}
              {field.type === "boolean" && (
                <label className="flex items-center gap-3 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={Boolean(formData[field.name])}
                    onChange={(e) => handleChange(field.name, e.target.checked)}
                    className="w-4 h-4 rounded border-gray-700 text-violet-600 focus:ring-violet-500/30 accent-violet-600"
                  />
                  <span className="text-sm text-gray-300">
                    Enable {field.label || field.name}
                  </span>
                </label>
              )}

              {isError && (
                <p className="text-xs text-rose-400 flex items-center gap-1.5 mt-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {formErrors[field.name]}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Credit warning banner */}
      <div className="rounded-xl p-4 bg-violet-950/30 border border-violet-500/20 flex items-center justify-between">
        <div className="flex items-center gap-2.5 text-xs text-violet-200">
          <Sparkles className="w-4 h-4 text-violet-400 shrink-0" />
          <span>
            This run costs <strong className="text-white font-semibold">{creditCost} credits</strong>. Your current balance: <strong className="text-white font-semibold">{userBalance}</strong>.
          </span>
        </div>
        {!hasEnoughCredits && (
          <span className="text-xs font-semibold text-rose-400">
            Insufficient credits
          </span>
        )}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading || !hasEnoughCredits}
        className={cn(
          "relative w-full py-3.5 px-6 rounded-xl font-semibold text-sm text-white shadow-lg transition-all duration-300 flex items-center justify-center gap-2.5 overflow-hidden group cursor-pointer",
          !hasEnoughCredits
            ? "bg-gray-800 text-gray-500 cursor-not-allowed border border-white/5"
            : "bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 shadow-violet-600/30 hover:shadow-violet-600/50 hover:scale-[1.01] active:scale-[0.99]"
        )}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin text-white" />
            <span>Executing Agent Job…</span>
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4 text-violet-200 group-hover:rotate-12 transition-transform" />
            <span>Run Agent ({creditCost} Credits)</span>
          </>
        )}
      </button>
    </form>
  );
}
