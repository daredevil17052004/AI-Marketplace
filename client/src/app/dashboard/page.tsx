"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Zap,
  Bot,
  Layers,
  ArrowRight,
  TrendingUp,
  Clock,
  CheckCircle,
  PlusCircle,
  Sparkles,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import CardSpotlight from "@/components/CardSpotlight";
import NumberTicker from "@/components/NumberTicker";
import StatusBadge from "@/components/StatusBadge";
import BackgroundBeams from "@/components/BackgroundBeams";
import { fetchJobs, Job, fetchCreditLedger, CreditLedgerItem } from "@/lib/api";
import { formatDate } from "@/lib/utils";

export default function DashboardPage() {
  const { user, balance } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [ledger, setLedger] = useState<CreditLedgerItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [jobsData, ledgerData] = await Promise.all([
          fetchJobs(),
          fetchCreditLedger(),
        ]);
        setJobs(jobsData);
        setLedger(ledgerData);
      } catch (err) {
        console.error("Dashboard data load error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const totalJobs = jobs.length;
  const completedJobs = jobs.filter((j) => j.status === "completed").length;
  const successRate = totalJobs > 0 ? Math.round((completedJobs / totalJobs) * 100) : 100;
  const totalSpent = ledger
    .filter((tx) => tx.amount < 0)
    .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);

  return (
    <div className="relative min-h-[calc(100vh-4rem)] p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-8">
      <BackgroundBeams />

      {/* Header */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/[0.08]">
        <div>
          <span className="text-xs font-semibold uppercase tracking-widest text-violet-400">
            Account Dashboard
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
            Welcome, {user?.email?.split("@")[0] || "Agent Operator"}
          </h1>
          <p className="text-xs sm:text-sm text-gray-400">
            Monitor real-time credits, autonomous jobs, and orchestrator metrics.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/agents"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-violet-600 hover:bg-violet-500 shadow-md shadow-violet-600/25 transition-all"
          >
            <Bot className="w-4 h-4" />
            <span>Launch Agent</span>
          </Link>
          <Link
            href="/credits"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-violet-300 bg-violet-950/40 hover:bg-violet-900/50 border border-violet-500/30 transition-all"
          >
            <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
            <span>Top Up</span>
          </Link>
        </div>
      </div>

      {/* Grid: 3 Metric Cards */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Balance Hero */}
        <CardSpotlight className="p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Available Credits
            </span>
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-extrabold text-white mb-2">
            <NumberTicker value={balance} />
          </div>
          <div className="flex items-center justify-between text-xs text-gray-400 pt-2 border-t border-white/5">
            <span>Pay-per-job runtime balance</span>
            <Link href="/credits" className="text-violet-400 hover:text-violet-300 font-medium">
              Manage &rarr;
            </Link>
          </div>
        </CardSpotlight>

        {/* Card 2: Total Jobs & Success Rate */}
        <CardSpotlight className="p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Jobs Processed
            </span>
            <div className="p-2 rounded-xl bg-violet-500/10 border border-violet-500/20">
              <Layers className="w-4 h-4 text-violet-400" />
            </div>
          </div>
          <div className="flex items-baseline gap-3 mb-2">
            <div className="text-3xl sm:text-4xl font-extrabold text-white">
              <NumberTicker value={totalJobs} />
            </div>
            <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5" />
              {successRate}% Success
            </span>
          </div>
          {/* Progress bar */}
          <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden mt-3">
            <div
              className="bg-gradient-to-r from-violet-500 to-emerald-400 h-full rounded-full transition-all duration-1000"
              style={{ width: `${successRate}%` }}
            />
          </div>
        </CardSpotlight>

        {/* Card 3: Total Credits Spent */}
        <CardSpotlight className="p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Total Credits Spent
            </span>
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-extrabold text-white mb-2">
            <NumberTicker value={totalSpent} suffix=" credits" />
          </div>
          <div className="flex items-center justify-between text-xs text-gray-400 pt-2 border-t border-white/5">
            <span>Append-only ledger history</span>
            <Link href="/credits" className="text-violet-400 hover:text-violet-300 font-medium">
              View Ledger &rarr;
            </Link>
          </div>
        </CardSpotlight>
      </div>

      {/* Quick Navigation Cards */}
      <div className="relative z-10 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          href="/agents"
          className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.08] hover:border-violet-500/30 hover:bg-white/[0.04] transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-violet-600/10 text-violet-400 group-hover:scale-110 transition-transform">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-white">Browse Agent Catalog</p>
              <p className="text-[11px] text-gray-400">Discover and trigger specialized bots</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-gray-500 group-hover:text-violet-400 group-hover:translate-x-1 transition-all" />
        </Link>

        <Link
          href="/jobs"
          className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.08] hover:border-violet-500/30 hover:bg-white/[0.04] transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-sky-600/10 text-sky-400 group-hover:scale-110 transition-transform">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-white">Inspect Recent Jobs</p>
              <p className="text-[11px] text-gray-400">Review real-time execution outputs</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-gray-500 group-hover:text-sky-400 group-hover:translate-x-1 transition-all" />
        </Link>

        <Link
          href="/credits"
          className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.08] hover:border-violet-500/30 hover:bg-white/[0.04] transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-600/10 text-amber-400 group-hover:scale-110 transition-transform">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-white">Purchase Credits</p>
              <p className="text-[11px] text-gray-400">Flexible pay-as-you-go tiers</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-gray-500 group-hover:text-amber-400 group-hover:translate-x-1 transition-all" />
        </Link>
      </div>

      {/* Recent Jobs Table */}
      <div className="relative z-10 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight">Recent Jobs</h3>
            <p className="text-xs text-gray-400">The last execution runs across all your agents</p>
          </div>
          <Link
            href="/jobs"
            className="text-xs font-medium text-violet-400 hover:text-violet-300 flex items-center gap-1"
          >
            <span>View All ({jobs.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <CardSpotlight className="p-0 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-xs text-gray-400">Loading jobs…</div>
          ) : jobs.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <Sparkles className="w-8 h-8 text-gray-600 mx-auto" />
              <p className="text-sm text-gray-300 font-medium">No jobs executed yet</p>
              <p className="text-xs text-gray-500">Pick an agent from the marketplace to run your first task.</p>
              <Link
                href="/agents"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-violet-600 hover:bg-violet-500 mt-2"
              >
                Launch First Agent
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/5 bg-white/[0.02] text-gray-400">
                    <th className="px-6 py-3 font-semibold">Job ID</th>
                    <th className="px-6 py-3 font-semibold">Agent</th>
                    <th className="px-6 py-3 font-semibold">Status</th>
                    <th className="px-6 py-3 font-semibold">Started</th>
                    <th className="px-6 py-3 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-gray-300">
                  {jobs.slice(0, 5).map((job) => (
                    <tr key={job.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4 font-mono text-gray-400">
                        {job.id}
                      </td>
                      <td className="px-6 py-4 font-semibold text-white">
                        {job.agentName || job.agentId}
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={job.status} />
                      </td>
                      <td className="px-6 py-4 text-gray-400">
                        {formatDate(job.createdAt)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          href={`/jobs/${job.id}`}
                          className="inline-flex items-center gap-1 text-xs font-medium text-violet-400 hover:text-white px-2.5 py-1 rounded-md bg-white/5 hover:bg-violet-600 transition-all"
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
