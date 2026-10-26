"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
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
import NumberTicker from "@/components/NumberTicker";
import BackgroundBeams from "@/components/BackgroundBeams";
import { BackgroundGradient, HoverBorderGradient } from "@/components/ui";
import { useAuth } from "@/contexts/AuthContext";
import { fetchCreditLedger, topUpCredits, CreditLedgerItem } from "@/lib/api";
import { formatDate, cn } from "@/lib/utils";

export default function CreditsPage() {
  const { balance, refreshBalance } = useAuth();
  const [ledger, setLedger] = useState<CreditLedgerItem[]>([]);
  const [loadingLedger, setLoadingLedger] = useState(true);
  const [purchasingTier, setPurchasingTier] = useState<number | null>(null);

  const loadLedger = useCallback(async () => {
    try {
      const data = await fetchCreditLedger();
      setLedger(data);
    } catch (err) {
      console.error("Failed to load credit ledger:", err);
    } finally {
      setLoadingLedger(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;
    fetchCreditLedger()
      .then((data) => {
        if (!ignore) {
          setLedger(data);
          setLoadingLedger(false);
        }
      })
      .catch((err) => {
        console.error("Failed to load credit ledger:", err);
        if (!ignore) setLoadingLedger(false);
      });

    return () => {
      ignore = true;
    };
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
      description: "Optimal for production workflows & high frequency tasks.",
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
    <div className="relative min-h-[calc(100vh-4.5rem)] p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-10 bg-[#FFFDF9]">
      <BackgroundBeams />

      {/* Header */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#EAE3D9]">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold bg-[#FFF2EB] text-[#D43F00] border border-[#FFD6C2]">
            <span className="text-[#FF4F00] font-black">_</span>
            <span>Billing & Token Ledger</span>
          </div>
          <motion.h1
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="font-heading text-2xl sm:text-3xl font-extrabold text-[#201515] tracking-tight mt-2"
          >
            Credits & Usage
          </motion.h1>
          <p className="text-sm text-[#5C524C]">
            Every agent run deducts credits dynamically according to schema complexity.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-bold text-[#047857] bg-[#ECFDF5] border border-[#A7F3D0] px-3.5 py-1.5 rounded-full self-start sm:self-auto">
          <ShieldCheck className="w-4 h-4 text-[#059669]" />
          <span>Append-Only Ledger Guarantee</span>
        </div>
      </div>

      {/* Balance Hero Card */}
      <div className="relative z-10">
        <motion.div
          whileHover={{ y: -2 }}
          className="bg-white border border-[#EAE3D9] rounded-3xl p-8 sm:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8 shadow-sm transition-all"
        >
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-[#D43F00] text-xs font-bold uppercase tracking-wider">
              <Zap className="w-4 h-4 fill-[#FF4F00] text-[#FF4F00]" />
              <span>Available Credit Balance</span>
            </div>
            <div className="font-heading text-5xl sm:text-6xl font-black text-[#201515] tracking-tight">
              <NumberTicker value={balance} />
              <span className="text-xl sm:text-2xl font-bold text-[#887E78] ml-3">
                Credits
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[#5C524C] max-w-md">
              Credits never expire. Seamlessly trigger refactoring, text summarization, and SEO generation.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#FAF5EE] border border-[#EAE3D9] space-y-3 text-xs w-full md:w-auto min-w-[260px]">
            <span className="font-bold text-[#201515] uppercase tracking-wider text-[11px] block">
              Quick Test Top-up
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleTopUp(25)}
                disabled={purchasingTier !== null}
                className="flex-1 py-2 px-3 rounded-full bg-white hover:bg-[#F2ECE2] text-[#201515] font-bold text-xs border border-[#EAE3D9] transition-all cursor-pointer text-center"
              >
                +25 Test
              </button>
              <button
                type="button"
                onClick={() => handleTopUp(100)}
                disabled={purchasingTier !== null}
                className="btn-zap-primary flex-1 py-2 px-3 text-xs"
              >
                +100 Test
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Pricing / Top-Up Tiers with BackgroundGradient on Popular */}
      <div className="relative z-10 space-y-6">
        <div>
          <h2 className="font-heading text-xl sm:text-2xl font-extrabold text-[#201515] tracking-tight">
            Top-up Packages
          </h2>
          <p className="text-xs sm:text-sm text-[#5C524C]">
            Instant replenishment with volume discounts.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {TIERS.map((tier) => {
            const cardContent = (
              <div
                className={cn(
                  "bg-white border rounded-3xl p-6 sm:p-8 flex flex-col justify-between space-y-6 relative transition-all shadow-xs h-full",
                  tier.popular
                    ? "border-transparent"
                    : "border-[#EAE3D9] hover:border-[#FFB38A]"
                )}
              >
                {tier.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#FF4F00] text-white text-[11px] font-bold uppercase tracking-wider px-3.5 py-0.5 rounded-full shadow-sm z-20">
                    Most Popular
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <h3 className="font-heading text-lg font-bold text-[#201515]">{tier.title}</h3>
                    <p className="text-xs text-[#5C524C] mt-1">{tier.description}</p>
                  </div>

                  <div className="flex items-baseline gap-2">
                    <span className="font-heading text-4xl font-extrabold text-[#201515]">{tier.price}</span>
                    <span className="text-xs font-semibold text-[#887E78]">/ {tier.credits} credits</span>
                  </div>

                  <div className="pt-2 border-t border-[#F2ECE2] text-xs font-semibold text-[#FF4F00]">
                    {tier.perCredit}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleTopUp(tier.credits)}
                  disabled={purchasingTier !== null}
                  className={cn(
                    "w-full py-3 rounded-full font-bold text-xs transition-all cursor-pointer",
                    tier.popular
                      ? "btn-zap-primary"
                      : "btn-zap-secondary"
                  )}
                >
                  {purchasingTier === tier.credits ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" /> Adding Credits…
                    </span>
                  ) : (
                    <span>Purchase {tier.credits} Credits</span>
                  )}
                </button>
              </div>
            );

            return tier.popular ? (
              <div key={tier.credits} className="h-full">
                <BackgroundGradient className="rounded-3xl h-full" containerClassName="h-full">
                  {cardContent}
                </BackgroundGradient>
              </div>
            ) : (
              <motion.div
                key={tier.credits}
                whileHover={{ y: -4 }}
                transition={{ duration: 0.2 }}
                className="h-full"
              >
                {cardContent}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Credit Ledger Table */}
      <div className="relative z-10 space-y-4">
        <div>
          <h2 className="font-heading text-xl sm:text-2xl font-extrabold text-[#201515] tracking-tight">
            Transaction Ledger
          </h2>
          <p className="text-xs sm:text-sm text-[#5C524C]">
            Verified audit record of all credit grants and deductions.
          </p>
        </div>

        <div className="bg-white border border-[#EAE3D9] rounded-3xl overflow-hidden shadow-xs">
          {loadingLedger ? (
            <div className="p-8 text-center text-sm text-[#887E78]">Loading ledger…</div>
          ) : ledger.length === 0 ? (
            <div className="p-12 text-center text-sm text-[#887E78]">No transaction records yet.</div>
          ) : (
            <div className="divide-y divide-[#EAE3D9]">
              {ledger.map((item, idx) => {
                const isPositive = item.amount > 0;
                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    className="p-4 sm:p-5 flex items-center justify-between hover:bg-[#FAF5EE] transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center",
                        isPositive ? "bg-[#ECFDF5] text-[#059669]" : "bg-[#FFF1F2] text-[#E11D48]"
                      )}>
                        {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                      </div>
                      <div>
                        <p className="font-bold text-xs text-[#201515] capitalize">
                          {item.reason?.replace(/_/g, " ") || (isPositive ? "Top Up" : "Agent Run")}
                        </p>
                        <p className="text-[11px] text-[#887E78]">{formatDate(item.createdAt)}</p>
                      </div>
                    </div>

                    <div className={cn(
                      "font-mono font-bold text-sm",
                      isPositive ? "text-[#059669]" : "text-[#BE123C]"
                    )}>
                      {isPositive ? `+${item.amount}` : item.amount} credits
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
