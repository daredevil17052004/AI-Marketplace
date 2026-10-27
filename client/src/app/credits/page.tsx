"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import Script from "next/script";
import { motion, AnimatePresence } from "framer-motion";
import {
  Zap,
  TrendingDown,
  TrendingUp,
  ArrowRight,
  ShieldCheck,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  XCircle,
} from "lucide-react";
import NumberTicker from "@/components/NumberTicker";
import BackgroundBeams from "@/components/BackgroundBeams";
import { BackgroundGradient } from "@/components/ui";
import { useAuth } from "@/contexts/AuthContext";
import {
  fetchCreditLedger,
  createCreditOrder,
  verifyCreditPayment,
  CreditLedgerItem,
} from "@/lib/api";
import { formatDate, cn } from "@/lib/utils";

// ─── Razorpay global type ──────────────────────────────────────────────────
declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Razorpay: new (options: any) => { open(): void };
  }
}

// ─── Toast component ───────────────────────────────────────────────────────
type ToastType = "success" | "error";
interface Toast {
  id: number;
  type: ToastType;
  message: string;
}

function ToastContainer({ toasts, remove }: { toasts: Toast[]; remove: (id: number) => void }) {
  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, x: 60, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 60, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className={cn(
              "pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl text-sm font-semibold border",
              t.type === "success"
                ? "bg-[#ECFDF5] text-[#065F46] border-[#6EE7B7]"
                : "bg-[#FFF1F2] text-[#9F1239] border-[#FECDD3]"
            )}
          >
            {t.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-[#059669]" />
            ) : (
              <XCircle className="w-4 h-4 flex-shrink-0 text-[#E11D48]" />
            )}
            <span>{t.message}</span>
            <button
              onClick={() => remove(t.id)}
              className="ml-1 text-current opacity-50 hover:opacity-100 transition-opacity cursor-pointer"
            >
              ×
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

// ─── Credit tiers (mirror paymentService.ts CREDIT_TIERS) ─────────────────
const TIERS = [
  {
    credits: 50,
    priceLabel: "₹420",
    usdLabel: "~$5",
    popular: false,
    title: "Starter",
    description: "Great for testing and light agent runs.",
    perCredit: "₹8.40 / credit",
    features: ["50 credits", "Never expire", "All agents included"],
  },
  {
    credits: 200,
    priceLabel: "₹1,260",
    usdLabel: "~$15",
    popular: true,
    title: "Builder Pro",
    description: "Optimal for production workflows & high frequency tasks.",
    perCredit: "₹6.30 / credit",
    features: ["200 credits", "25% cheaper per credit", "Priority support"],
  },
  {
    credits: 1000,
    priceLabel: "₹5,040",
    usdLabel: "~$60",
    popular: false,
    title: "Scale Studio",
    description: "Bulk automated agent orchestration for teams.",
    perCredit: "₹5.04 / credit",
    features: ["1,000 credits", "40% cheaper per credit", "Team-scale throughput"],
  },
];

// ─── Page ─────────────────────────────────────────────────────────────────
export default function CreditsPage() {
  const { balance, refreshBalance, user } = useAuth();
  const [ledger, setLedger] = useState<CreditLedgerItem[]>([]);
  const [loadingLedger, setLoadingLedger] = useState(true);
  const [purchasingTier, setPurchasingTier] = useState<number | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastCounter = useRef(0);

  // ── Toast helpers ────────────────────────────────────────────────────────
  const addToast = useCallback((type: ToastType, message: string) => {
    const id = ++toastCounter.current;
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 5000);
  }, []);

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // ── Ledger loader ────────────────────────────────────────────────────────
  const loadLedger = useCallback(async () => {
    try {
      const data = await fetchCreditLedger();
      setLedger(data);
    } catch {
      // silent — balance still shown via AuthContext
    } finally {
      setLoadingLedger(false);
    }
  }, []);

  useEffect(() => {
    loadLedger();
  }, [loadLedger]);

  // ── Razorpay checkout handler ────────────────────────────────────────────
  const handlePurchase = async (credits: number) => {
    if (purchasingTier !== null) return;
    setPurchasingTier(credits);

    try {
      // 1. Create order on our backend
      const order = await createCreditOrder(credits);

      // 2. Open Razorpay modal
      const rzp = new window.Razorpay({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: "AI Marketplace",
        description: `${credits} Credits`,
        order_id: order.orderId,
        prefill: {
          email: user?.email ?? "",
        },
        theme: { color: "#FF4F00" },
        modal: {
          ondismiss: () => {
            setPurchasingTier(null);
          },
        },
        handler: async (response: {
          razorpay_payment_id: string;
          razorpay_order_id: string;
          razorpay_signature: string;
        }) => {
          try {
            // 3. Verify payment on our backend → credits get deposited
            await verifyCreditPayment({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              credits,
            });

            // 4. Refresh balance and ledger
            await refreshBalance();
            await loadLedger();
            addToast("success", `🎉 ${credits} credits added to your account!`);
          } catch {
            addToast("error", "Payment received but credit deposit failed. Contact support.");
          } finally {
            setPurchasingTier(null);
          }
        },
      });

      rzp.open();
    } catch (err: unknown) {
      setPurchasingTier(null);
      const message = err instanceof Error ? err.message : "Failed to initiate payment.";
      addToast("error", message);
    }
  };

  return (
    <>
      {/* Razorpay Checkout Script */}
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />

      <ToastContainer toasts={toasts} remove={removeToast} />

      <div className="relative min-h-[calc(100vh-4.5rem)] p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-10 bg-[#FFFDF9]">
        <BackgroundBeams />

        {/* Header */}
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#EAE3D9]">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold bg-[#FFF2EB] text-[#D43F00] border border-[#FFD6C2]">
              <span className="text-[#FF4F00] font-black">_</span>
              <span>Billing &amp; Token Ledger</span>
            </div>
            <motion.h1
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="font-heading text-2xl sm:text-3xl font-extrabold text-[#201515] tracking-tight mt-2"
            >
              Credits &amp; Usage
            </motion.h1>
            <p className="text-sm text-[#5C524C]">
              Every agent run deducts credits. Prices in INR — secured by Razorpay.
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

            <a
              href="#packages"
              className="btn-zap-primary text-xs py-3 px-5 font-bold flex items-center gap-2 self-start md:self-auto cursor-pointer"
            >
              <span>Get Credits</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </motion.div>
        </div>

        {/* Pricing Tiers */}
        <div id="packages" className="relative z-10 space-y-6">
          <div>
            <h2 className="font-heading text-xl sm:text-2xl font-extrabold text-[#201515] tracking-tight">
              Top-up Packages
            </h2>
            <p className="text-xs sm:text-sm text-[#5C524C]">
              Instant replenishment via Razorpay — UPI, cards, net banking &amp; more.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
            {TIERS.map((tier) => {
              const isLoading = purchasingTier === tier.credits;
              const isDisabled = purchasingTier !== null;

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
                      <span className="font-heading text-4xl font-extrabold text-[#201515]">
                        {tier.priceLabel}
                      </span>
                      <span className="text-xs font-semibold text-[#887E78]">
                        / {tier.credits} credits
                      </span>
                    </div>

                    <div className="pt-2 border-t border-[#F2ECE2] text-xs font-semibold text-[#FF4F00]">
                      {tier.perCredit} &nbsp;·&nbsp;{" "}
                      <span className="text-[#887E78] font-normal">{tier.usdLabel}</span>
                    </div>

                    <ul className="space-y-1.5 pt-1">
                      {tier.features.map((f) => (
                        <li key={f} className="flex items-center gap-2 text-xs text-[#5C524C]">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#059669] flex-shrink-0" />
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button
                    type="button"
                    onClick={() => handlePurchase(tier.credits)}
                    disabled={isDisabled}
                    className={cn(
                      "w-full py-3 rounded-full font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-2",
                      tier.popular ? "btn-zap-primary" : "btn-zap-secondary",
                      isDisabled && "opacity-60 cursor-not-allowed"
                    )}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Opening Razorpay…</span>
                      </>
                    ) : (
                      <span>Pay {tier.priceLabel}</span>
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

          {/* Payment methods badge */}
          <div className="flex flex-wrap items-center gap-2 pt-2">
            <span className="text-[11px] text-[#887E78] font-medium">Accepted via Razorpay:</span>
            {["UPI", "Credit Card", "Debit Card", "Net Banking", "Wallets"].map((m) => (
              <span
                key={m}
                className="text-[11px] font-semibold text-[#5C524C] bg-[#FAF5EE] border border-[#EAE3D9] px-2.5 py-0.5 rounded-full"
              >
                {m}
              </span>
            ))}
          </div>
        </div>

        {/* Transaction Ledger */}
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
                        <div
                          className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center",
                            isPositive ? "bg-[#ECFDF5] text-[#059669]" : "bg-[#FFF1F2] text-[#E11D48]"
                          )}
                        >
                          {isPositive ? (
                            <TrendingUp className="w-4 h-4" />
                          ) : (
                            <TrendingDown className="w-4 h-4" />
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-xs text-[#201515] capitalize">
                            {item.reason?.replace(/_/g, " ") || (isPositive ? "Top Up" : "Agent Run")}
                          </p>
                          <p className="text-[11px] text-[#887E78]">{formatDate(item.createdAt)}</p>
                        </div>
                      </div>

                      <div
                        className={cn(
                          "font-mono font-bold text-sm",
                          isPositive ? "text-[#059669]" : "text-[#BE123C]"
                        )}
                      >
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
    </>
  );
}
