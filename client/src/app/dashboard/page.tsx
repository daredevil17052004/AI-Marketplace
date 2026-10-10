"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
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
  Activity,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import NumberTicker from "@/components/NumberTicker";
import StatusBadge from "@/components/StatusBadge";
import BackgroundBeams from "@/components/BackgroundBeams";
import CardSpotlight from "@/components/CardSpotlight";
import { HoverBorderGradient } from "@/components/ui";
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
    <div className="relative min-h-[calc(100vh-4.5rem)] p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-10 bg-[#FFFDF9]">
      <BackgroundBeams />

      {/* Header */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#EAE3D9]">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold bg-[#FFF2EB] text-[#D43F00] border border-[#FFD6C2]">
            <span className="text-[#FF4F00] font-black">_</span>
            <span>Workspace Operations</span>
          </div>
          <motion.h1
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="font-heading text-2xl sm:text-3xl font-extrabold text-[#201515] tracking-tight mt-2"
          >
            Welcome, {user?.email?.split("@")[0] || "Operator"}
          </motion.h1>
          <p className="text-sm text-[#5C524C]">
            Monitor real-time credits, autonomous jobs, and orchestrator metrics.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/agents"
            className="btn-zap-primary text-xs py-2.5 px-5 font-bold"
          >
            <Bot className="w-4 h-4" />
            <span>Launch Agent</span>
          </Link>
          <Link
            href="/credits"
            className="btn-zap-secondary text-xs py-2.5 px-4 font-bold"
          >
            <Zap className="w-3.5 h-3.5 text-[#FF4F00] fill-[#FF4F00]" />
            <span>Top Up</span>
          </Link>
        </div>
      </div>

      {/* Grid: 3 Metric Cards with CardSpotlight & Motion */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Balance Hero */}
        <motion.div
          whileHover={{ y: -4 }}
          transition={{ duration: 0.2 }}
        >
          <CardSpotlight className="p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-[#887E78] uppercase tracking-wider">
                Available Credits
              </span>
              <div className="p-2 rounded-xl bg-[#FFF2EB] border border-[#FFD6C2]">
                <Zap className="w-4 h-4 text-[#FF4F00] fill-[#FF4F00]" />
              </div>
            </div>
            <div className="font-heading text-3xl sm:text-4xl font-extrabold text-[#201515] mb-2">
              <NumberTicker value={balance} />
            </div>
            <div className="flex items-center justify-between text-xs text-[#5C524C] pt-3 border-t border-[#F2ECE2]">
              <span>Pay-per-job runtime balance</span>
              <Link href="/credits" className="text-[#FF4F00] hover:underline font-bold flex items-center gap-1">
                Manage &rarr;
              </Link>
            </div>
          </CardSpotlight>
        </motion.div>

        {/* Card 2: Total Jobs & Success Rate */}
        <motion.div
          whileHover={{ y: -4 }}
          transition={{ duration: 0.2 }}
        >
          <CardSpotlight className="p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-[#887E78] uppercase tracking-wider">
                Jobs Processed
              </span>
              <div className="p-2 rounded-xl bg-[#EFF6FF] border border-[#BFDBFE]">
                <Layers className="w-4 h-4 text-[#2563EB]" />
              </div>
            </div>
            <div className="flex items-baseline gap-3 mb-2">
              <div className="font-heading text-3xl sm:text-4xl font-extrabold text-[#201515]">
                <NumberTicker value={totalJobs} />
              </div>
              <span className="text-xs text-[#059669] font-bold flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" />
                {successRate}% Success
              </span>
            </div>
            {/* Progress bar */}
            <div className="w-full bg-[#FAF5EE] h-2 rounded-full overflow-hidden mt-3 border border-[#EAE3D9]">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${successRate}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="bg-[#059669] h-full rounded-full"
              />
            </div>
          </CardSpotlight>
        </motion.div>

        {/* Card 3: Total Credits Spent */}
        <motion.div
          whileHover={{ y: -4 }}
          transition={{ duration: 0.2 }}
        >
          <CardSpotlight className="p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-[#887E78] uppercase tracking-wider">
                Lifetime Consumption
              </span>
              <div className="p-2 rounded-xl bg-[#FAF5EE] border border-[#EAE3D9]">
                <TrendingUp className="w-4 h-4 text-[#5C524C]" />
              </div>
            </div>
            <div className="font-heading text-3xl sm:text-4xl font-extrabold text-[#201515] mb-2">
              <NumberTicker value={totalSpent} />
              <span className="text-xs font-semibold text-[#887E78] ml-2">credits</span>
            </div>
            <div className="flex items-center justify-between text-xs text-[#5C524C] pt-3 border-t border-[#F2ECE2]">
              <span>Metered across all agent jobs</span>
              <Link href="/jobs" className="text-[#FF4F00] hover:underline font-bold flex items-center gap-1">
                View History &rarr;
              </Link>
            </div>
          </CardSpotlight>
        </motion.div>
      </div>

      {/* Recent Activity Table with motion items */}
      <div className="relative z-10 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-heading text-xl font-bold text-[#201515] flex items-center gap-2">
              <Activity className="w-5 h-5 text-[#FF4F00]" />
              Recent Job Executions
            </h2>
            <p className="text-xs text-[#5C524C]">Live jobs submitted from your account</p>
          </div>
          <Link
            href="/jobs"
            className="text-xs font-bold text-[#FF4F00] hover:underline inline-flex items-center gap-1"
          >
            <span>All Runs</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="bg-white border border-[#EAE3D9] rounded-3xl overflow-hidden shadow-xs">
          {loading ? (
            <div className="p-8 text-center text-sm text-[#887E78]">Loading activity…</div>
          ) : jobs.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <Bot className="w-8 h-8 text-[#887E78] mx-auto" />
              <p className="text-sm font-bold text-[#201515]">No agent runs yet</p>
              <p className="text-xs text-[#5C524C]">Run an agent from the catalog to see real-time output.</p>
              <Link href="/agents" className="btn-zap-primary text-xs py-2 px-4 inline-flex mt-2">
                Launch First Agent
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-[#EAE3D9]">
              {jobs.slice(0, 5).map((j, idx) => (
                <motion.div
                  key={j.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <Link
                    href={`/jobs/${j.id}`}
                    className="flex items-center justify-between p-4 sm:p-5 hover:bg-[#FAF5EE] transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#FFF2EB] border border-[#FFD6C2] flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Bot className="w-4 h-4 text-[#FF4F00]" />
                      </div>
                      <div>
                        <p className="font-bold text-xs text-[#201515] group-hover:text-[#FF4F00] transition-colors">
                          {j.agentName || "Agent Run"}
                        </p>
                        <p className="text-[11px] text-[#887E78] font-mono">
                          #{j.id.slice(0, 8)} • {formatDate(j.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <StatusBadge status={j.status} />
                      <ArrowRight className="w-4 h-4 text-[#887E78] group-hover:translate-x-1 transition-transform" />
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
