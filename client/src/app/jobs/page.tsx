"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  Layers,
  ArrowRight,
  RefreshCw,
  Search,
  Bot,
  Clock,
  Sparkles,
} from "lucide-react";
import CardSpotlight from "@/components/CardSpotlight";
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
    return jobs.filter((job) => {
      const matchesStatus =
        selectedStatus === "All" ||
        job.status.toLowerCase() === selectedStatus.toLowerCase();

      const matchesSearch =
        job.id.toLowerCase().includes(search.toLowerCase()) ||
        (job.agentName && job.agentName.toLowerCase().includes(search.toLowerCase())) ||
        job.agentId.toLowerCase().includes(search.toLowerCase());

      return matchesStatus && matchesSearch;
    });
  }, [jobs, selectedStatus, search]);

  return (
    <div className="relative min-h-[calc(100vh-4rem)] p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-8">
      <BackgroundBeams />

      {/* Header */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/[0.08]">
        <div>
          <span className="text-xs font-semibold uppercase tracking-widest text-violet-400">
            Autonomous Workflows
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
            Job History & Outputs
          </h1>
          <p className="text-xs sm:text-sm text-gray-400">
            Real-time execution log. Inspect input payloads, response statuses, and structured output.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => loadJobs()}
            disabled={isRefreshing}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-gray-300 bg-white/5 hover:bg-white/10 border border-white/10 transition-all cursor-pointer"
          >
            <RefreshCw className={cn("w-3.5 h-3.5", isRefreshing && "animate-spin text-violet-400")} />
            <span>Refresh</span>
          </button>
          <Link
            href="/agents"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-violet-600 hover:bg-violet-500 shadow-md shadow-violet-600/25 transition-all"
          >
            <Bot className="w-4 h-4" />
            <span>Launch New Job</span>
          </Link>
        </div>
      </div>

      {/* Search and Status Filters */}
      <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Status Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto p-1 bg-white/[0.03] border border-white/5 rounded-2xl">
          {statuses.map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setSelectedStatus(st)}
              className={cn(
                "px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 whitespace-nowrap cursor-pointer",
                selectedStatus === st
                  ? "bg-violet-600 text-white shadow-md shadow-violet-600/30"
                  : "text-gray-400 hover:text-white"
              )}
            >
              {st}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search Job ID or Agent…"
            className="w-full pl-9 pr-3 py-2 bg-gray-950/70 border border-white/10 rounded-xl text-xs text-white placeholder-gray-500 outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/20 transition-all"
          />
        </div>
      </div>

      {/* Jobs Table */}
      <div className="relative z-10">
        <CardSpotlight className="p-0 overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-xs text-gray-400">Loading jobs…</div>
          ) : filteredJobs.length === 0 ? (
            <div className="p-16 text-center space-y-4">
              <Layers className="w-10 h-10 text-gray-600 mx-auto" />
              <h3 className="text-base font-bold text-white">No jobs found</h3>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">
                No execution tasks match the selected status filter or search parameters.
              </p>
              <Link
                href="/agents"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-violet-600 hover:bg-violet-500"
              >
                Trigger an Agent
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/5 bg-white/[0.02] text-gray-400">
                    <th className="px-6 py-3.5 font-semibold">Job ID</th>
                    <th className="px-6 py-3.5 font-semibold">Agent</th>
                    <th className="px-6 py-3.5 font-semibold">Status</th>
                    <th className="px-6 py-3.5 font-semibold">Duration</th>
                    <th className="px-6 py-3.5 font-semibold">Created At</th>
                    <th className="px-6 py-3.5 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-gray-300">
                  {filteredJobs.map((job) => (
                    <tr key={job.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4 font-mono font-medium text-gray-300">
                        {job.id}
                      </td>
                      <td className="px-6 py-4 font-semibold text-white">
                        <Link
                          href={`/agents/${job.agentId}`}
                          className="hover:text-violet-400 transition-colors"
                        >
                          {job.agentName || job.agentId}
                        </Link>
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={job.status} />
                      </td>
                      <td className="px-6 py-4 font-mono text-gray-400">
                        {job.durationMs ? `${job.durationMs}ms` : "—"}
                      </td>
                      <td className="px-6 py-4 text-gray-400">
                        {formatDate(job.createdAt)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          href={`/jobs/${job.id}`}
                          className="inline-flex items-center gap-1.5 text-xs font-medium text-violet-400 hover:text-white px-3 py-1.5 rounded-lg bg-white/5 hover:bg-violet-600 transition-all"
                        >
                          <span>Inspect</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardSpotlight>
      </div>
    </div>
  );
}
