"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Zap,
  CheckCircle2,
  TrendingDown,
  TrendingUp,
  CreditCard,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Loader2,
} from "lucide-react";
import CardSpotlight from "@/components/CardSpotlight";
import NumberTicker from "@/components/NumberTicker";
import BackgroundBeams from "@/components/BackgroundBeams";
import { useAuth } from "@/contexts/AuthContext";
import { fetchCreditLedger, topUpCredits, CreditLedgerItem } from "@/lib/api";
import { formatDate, cn } from "@/lib/utils";

export default function CreditsPage() {
  const { balance, refreshBalance } = useAuth();
  const [ledger, setLedger] = useState<CreditLedgerItem[]>([]);
  const [loadingLedger, setLoadingLedger] = useState(true);
  const [purchasingTier, setPurchasingTier] = useState<number | null>(null);

  const loadLedger = async () => {
    try {
      const data = await fetchCreditLedger();
      setLedger(data);
    } catch (err) {
      console.error("Failed to load credit ledger:", err);
    } finally {
      setLoadingLedger(false);
    }
  };

  useEffect(() => {
    loadLedger();
  }, []);

  const handleTopUp = async (amount: number) => {
    setPurchasingTier(amount);
    try {
      await topUpCredits(amount);
      await refreshBalance();
      await loadLedger();
    } catch (err) {
      console.error("Failed to top up credits:", err);
    } finally {
      setPurchasingTier(null);
    }
  };

  const TIERS = [
    {
      credits: 50,
      price: "$5",
      popular: false,
      title: "Starter",
      description: "Great for testing and light agent runs.",
      perCredit: "$0.10 / credit",
    },
    {
      credits: 200,
      price: "$15",
      popular: true,
      title: "Builder Pro",
      description: "Optimal for production pipelines & high frequency tasks.",
      perCredit: "$0.075 / credit",
    },
    {
      credits: 1000,
      price: "$60",
      popular: false,
      title: "Scale Studio",
      description: "Bulk automated agent orchestration for teams.",
      perCredit: "$0.06 / credit",
    },
  ];

  return (
    <div className="relative min-h-[calc(100vh-4rem)] p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-10">
      <BackgroundBeams />

      {/* Header */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/[0.08]">
        <div>
          <span className="text-xs font-semibold uppercase tracking-widest text-violet-400">
            Billing & Token Ledger
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
            Credits & Usage
          </h1>
          <p className="text-xs sm:text-sm text-gray-400">
            Every agent run deducts credits dynamically according to schema complexity.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-full">
          <ShieldCheck className="w-4 h-4" />
          <span>Append-Only Ledger Guarantee</span>
        </div>
      </div>

      {/* Balance Hero Card */}
      <div className="relative z-10">
        <CardSpotlight className="p-8 sm:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8 border-violet-500/20 bg-gradient-to-br from-violet-950/30 to-gray-900/60">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
              <Zap className="w-4 h-4 fill-amber-400" />
              <span>Current Available Balance</span>
            </div>
            <div className="text-5xl sm:text-6xl font-black text-white tracking-tight">
              <NumberTicker value={balance} />
              <span className="text-xl sm:text-2xl font-normal text-violet-300 ml-3">
                Credits
              </span>
            </div>
            <p className="text-xs sm:text-sm text-gray-400 max-w-md">
              Your credits never expire. Seamlessly trigger refactoring, security audits, and SQL analyzers.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-2 text-xs text-gray-300 w-full md:w-auto min-w-[240px]">
            <span className="font-semibold text-gray-400 uppercase tracking-wider text-[11px] block">
              Quick Top-up Simulation
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleTopUp(25)}
                disabled={purchasingTier !== null}
                className="flex-1 py-2 px-3 rounded-lg bg-violet-600/20 hover:bg-violet-600 text-violet-300 hover:text-white font-semibold text-xs border border-violet-500/30 transition-all cursor-pointer text-center"
              >
                +25 Free
              </button>
              <button
                type="button"
                onClick={() => handleTopUp(100)}
                disabled={purchasingTier !== null}
                className="flex-1 py-2 px-3 rounded-lg bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-black font-semibold text-xs border border-amber-500/30 transition-all cursor-pointer text-center"
              >
                +100 Boost
              </button>
            </div>
          </div>
        </CardSpotlight>
      </div>

      {/* Top-Up Tier Cards */}
      <div className="relative z-10 space-y-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Purchase Additional Credits
          </h2>
          <p className="text-xs text-gray-400">
            Select a package to replenish your agent runner pool.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TIERS.map((tier) => (
            <CardSpotlight
              key={tier.credits}
              className={cn(
                "p-6 flex flex-col justify-between space-y-6 transition-all duration-300",
                tier.popular
                  ? "border-violet-500/40 bg-gradient-to-b from-violet-950/20 to-gray-900/60 shadow-[0_0_30px_-5px_rgba(139,92,246,0.2)]"
                  : "border-white/10"
              )}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                    {tier.title}
                  </span>
                  {tier.popular && (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-violet-500/20 text-violet-300 border border-violet-500/30">
                      Most Popular
                    </span>
                  )}
                </div>

                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-extrabold text-white">{tier.price}</span>
                    <span className="text-xs text-gray-500">one-time</span>
                  </div>
                  <div className="inline-flex items-center gap-1.5 text-sm font-bold text-violet-300 mt-1">
                    <Zap className="w-4 h-4 fill-violet-300" />
                    <span>{tier.credits} Credits</span>
                  </div>
                </div>

                <p className="text-xs text-gray-400 leading-relaxed">
                  {tier.description}
                </p>

                <div className="pt-2 text-[11px] font-mono text-gray-500">
                  {tier.perCredit}
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleTopUp(tier.credits)}
                disabled={purchasingTier !== null}
                className={cn(
                  "w-full py-2.5 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer",
                  tier.popular
                    ? "bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-600/30"
                    : "bg-white/5 hover:bg-white/10 text-gray-200 border border-white/10"
                )}
              >
                {purchasingTier === tier.credits ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Processing Top-up…</span>
                  </>
                ) : (
                  <>
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>Simulate Top-Up</span>
                  </>
                )}
              </button>
            </CardSpotlight>
          ))}
        </div>
      </div>

      {/* Transaction Ledger Table */}
      <div className="relative z-10 space-y-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Transaction Ledger
          </h2>
          <p className="text-xs text-gray-400">
            Audit trail of credit deposits, bonuses, and per-job deductions.
          </p>
        </div>

        <CardSpotlight className="p-0 overflow-hidden">
          {loadingLedger ? (
            <div className="p-8 text-center text-xs text-gray-400">Loading ledger…</div>
          ) : ledger.length === 0 ? (
            <div className="p-12 text-center text-xs text-gray-500">
              No transactions recorded yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/5 bg-white/[0.02] text-gray-400">
                    <th className="px-6 py-3.5 font-semibold">Transaction ID</th>
                    <th className="px-6 py-3.5 font-semibold">Reason</th>
                    <th className="px-6 py-3.5 font-semibold">Date</th>
                    <th className="px-6 py-3.5 font-semibold">Associated Job</th>
                    <th className="px-6 py-3.5 font-semibold text-right">Credit Delta</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-gray-300">
                  {ledger.map((item) => {
                    const isPositive = item.amount > 0;
                    return (
                      <tr key={item.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-6 py-4 font-mono text-gray-400">
                          {item.id}
                        </td>
                        <td className="px-6 py-4 font-medium text-white capitalize">
                          {item.reason.replace(/_/g, " ")}
                        </td>
                        <td className="px-6 py-4 text-gray-400">
                          {formatDate(item.createdAt)}
                        </td>
                        <td className="px-6 py-4 font-mono">
                          {item.jobId ? (
                            <Link
                              href={`/jobs/${item.jobId}`}
                              className="text-violet-400 hover:text-violet-300 transition-colors"
                            >
                              {item.jobId}
                            </Link>
                          ) : (
                            <span className="text-gray-600">—</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span
                            className={cn(
                              "inline-flex items-center gap-1 font-bold text-xs px-2.5 py-1 rounded-full",
                              isPositive
                                ? "text-emerald-400 bg-emerald-500/10 border border-emerald-500/20"
                                : "text-rose-400 bg-rose-500/10 border border-rose-500/20"
                            )}
                          >
                            {isPositive ? (
                              <TrendingUp className="w-3 h-3" />
                            ) : (
                              <TrendingDown className="w-3 h-3" />
                            )}
                            {isPositive ? `+${item.amount}` : item.amount}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardSpotlight>
      </div>
    </div>
  );
}
