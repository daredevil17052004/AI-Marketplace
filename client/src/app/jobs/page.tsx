"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Layers,
  ArrowRight,
  RefreshCw,
  Search,
  Bot,
  Clock,
  Sparkles,
} from "lucide-react";
import StatusBadge from "@/components/StatusBadge";
import BackgroundBeams from "@/components/BackgroundBeams";
import { fetchJobs, Job } from "@/lib/api";
import { formatDate, cn } from "@/lib/utils";

export default function JobsHistoryPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>("All");
  const [search, setSearch] = useState("");

  const loadJobs = async (silent = false) => {
    if (!silent) setIsRefreshing(true);
    try {
      const data = await fetchJobs();
      setJobs(data);
    } catch (e) {
      console.error("Failed to load jobs:", e);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadJobs();
  }, []);

  // Auto-polling if any job is pending or processing
  useEffect(() => {
    const hasActiveJob = jobs.some(
      (j) => j.status === "pending" || j.status === "processing"
    );

    if (!hasActiveJob) return;

    const timer = setInterval(() => {
      loadJobs(true);
    }, 3500);

    return () => clearInterval(timer);
  }, [jobs]);

  const statuses = ["All", "Pending", "Processing", "Completed", "Failed"];

  const filteredJobs = useMemo(() => {
    return jobs.filter((j) => {
      const matchesStatus =
        selectedStatus === "All" ||
        j.status.toLowerCase() === selectedStatus.toLowerCase();

      const q = search.toLowerCase();
      const matchesSearch =
        j.id.toLowerCase().includes(q) ||
        (j.agentName && j.agentName.toLowerCase().includes(q)) ||
        j.agentId.toLowerCase().includes(q);

      return matchesStatus && matchesSearch;
    });
  }, [jobs, selectedStatus, search]);

  return (
    <div className="relative min-h-[calc(100vh-4.5rem)] p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-8 bg-[#FFFDF9]">
      <BackgroundBeams />

      {/* Header */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#EAE3D9]">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold bg-[#FFF2EB] text-[#D43F00] border border-[#FFD6C2]">
            <span className="text-[#FF4F00] font-black">_</span>
            <span>Execution Audit Trail</span>
          </div>
          <motion.h1
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="font-heading text-2xl sm:text-3xl font-extrabold text-[#201515] tracking-tight"
          >
            Job History & Runs
          </motion.h1>
          <p className="text-sm text-[#5C524C]">
            Real-time feed of all asynchronous agent executions processed by BullMQ.
          </p>
        </div>

        <button
          type="button"
          onClick={() => loadJobs(false)}
          disabled={isRefreshing}
          className="btn-zap-secondary text-xs px-4 py-2 self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw className={cn("w-3.5 h-3.5", isRefreshing && "animate-spin text-[#FF4F00]")} />
          <span>Refresh Runs</span>
        </button>
      </div>

      {/* Filters and Search Bar */}
      <div className="relative z-10 flex flex-col sm:flex-row items-center gap-4">
        {/* Search */}
        <div className="relative w-full sm:flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#887E78]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by job ID or agent name..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#D5CBC0] rounded-full text-sm text-[#201515] placeholder-[#9C9087] outline-none focus:border-[#FF4F00] focus:ring-2 focus:ring-[#FF4F00]/20 transition-all shadow-xs"
          />
        </div>

        {/* Status Pills with animated spring pill */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
          {statuses.map((s) => {
            const isSelected = selectedStatus === s;
            return (
              <button
                key={s}
                type="button"
                onClick={() => setSelectedStatus(s)}
                className={cn(
                  "relative px-3.5 py-1.5 rounded-full text-xs font-bold transition-colors whitespace-nowrap cursor-pointer z-10",
                  isSelected
                    ? "text-[#FFFDF9]"
                    : "text-[#5C524C] hover:text-[#201515]"
                )}
              >
                {isSelected && (
                  <motion.div
                    layoutId="jobStatusPill"
                    className="absolute inset-0 bg-[#201515] rounded-full z-[-1] shadow-xs"
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                )}
                {!isSelected && (
                  <div className="absolute inset-0 bg-white border border-[#EAE3D9] rounded-full z-[-2]" />
                )}
                {s}
              </button>
            );
          })}
        </div>
      </div>

      {/* Jobs Feed / Table */}
      <div className="relative z-10">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-20 bg-white border border-[#EAE3D9] rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : filteredJobs.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white border border-[#EAE3D9] rounded-3xl p-16 text-center space-y-4 shadow-xs"
          >
            <Layers className="w-10 h-10 text-[#887E78] mx-auto" />
            <h3 className="font-heading text-lg font-bold text-[#201515]">No execution runs found</h3>
            <p className="text-xs text-[#5C524C] max-w-sm mx-auto">
              Run your first agent from the marketplace to see live execution telemetry here.
            </p>
            <Link
              href="/agents"
              className="btn-zap-primary text-xs px-5 py-2.5 inline-flex"
            >
              <span>Explore Marketplace</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </motion.div>
        ) : (
          <div className="bg-white border border-[#EAE3D9] rounded-3xl overflow-hidden shadow-xs divide-y divide-[#EAE3D9]">
            {filteredJobs.map((j, idx) => (
              <motion.div
                key={j.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04 }}
              >
                <Link
                  href={`/jobs/${j.id}`}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-5 hover:bg-[#FAF5EE] transition-colors gap-4 group"
                >
                  <div className="flex items-start sm:items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-[#FFF2EB] border border-[#FFD6C2] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <Bot className="w-5 h-5 text-[#FF4F00]" />
                    </div>
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-heading font-bold text-sm text-[#201515] group-hover:text-[#FF4F00] transition-colors">
                          {j.agentName || "Agent Run"}
                        </span>
                        <span className="text-xs font-mono text-[#887E78]">
                          #{j.id.slice(0, 8)}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-[#887E78]">
                        <span>{formatDate(j.createdAt)}</span>
                        {j.durationMs && (
                          <span>• {j.durationMs}ms</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 self-end sm:self-auto">
                    <StatusBadge status={j.status} />
                    <ArrowRight className="w-4 h-4 text-[#887E78] group-hover:text-[#FF4F00] group-hover:translate-x-1 transition-all" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
