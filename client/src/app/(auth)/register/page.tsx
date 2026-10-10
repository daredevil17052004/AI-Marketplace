"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import BackgroundBeams from "@/components/BackgroundBeams";
import CardSpotlight from "@/components/CardSpotlight";
import { SparklesCore } from "@/components/ui";
import { Loader2, AlertCircle, ArrowRight, Zap } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await register(email, password);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-[calc(100vh-4.5rem)] flex items-center justify-center px-4 py-12 bg-[#FFFDF9]">
      <BackgroundBeams />

      <div className="absolute inset-0 max-w-3xl mx-auto h-[400px] pointer-events-none opacity-40">
        <SparklesCore minSize={0.6} maxSize={1.8} particleDensity={20} particleColor="#FF4F00" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Header */}
        <div className="text-center mb-8 space-y-2">
          <div className="inline-flex items-center justify-center mb-1">
            <span className="text-4xl font-extrabold text-[#FF4F00] leading-none select-none tracking-tighter mr-1">
              _
            </span>
            <span className="font-heading font-extrabold text-[#201515] text-2xl tracking-tight">
              agent<span className="text-[#FF4F00]">flow</span>
            </span>
          </div>
          <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-[#201515] tracking-tight">
            Create your account
          </h1>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#FFF2EB] text-[#D43F00] border border-[#FFD6C2]">
            <Zap className="w-3.5 h-3.5 fill-[#FF4F00] text-[#FF4F00]" />
            <span>Includes 100 complimentary credits</span>
          </div>
        </div>

        {/* Card with Spotlight */}
        <CardSpotlight className="p-8 shadow-sm rounded-3xl">
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {error && (
              <div className="flex items-center gap-2.5 bg-[#FFF1F2] border border-[#FECDD3] rounded-xl px-4 py-3 text-xs text-[#BE123C]">
                <AlertCircle className="w-4 h-4 text-[#E11D48] shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label htmlFor="register-email" className="block text-xs font-bold text-[#201515] mb-1.5">
                Work Email Address
              </label>
              <input
                id="register-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                required
                autoComplete="email"
                className="w-full bg-white border border-[#D5CBC0] text-[#201515] placeholder-[#9C9087] rounded-xl px-4 py-3 text-sm outline-none focus:border-[#FF4F00] focus:ring-2 focus:ring-[#FF4F00]/20 transition-all"
              />
            </div>

            <div>
              <label htmlFor="register-password" className="block text-xs font-bold text-[#201515] mb-1.5">
                Password
              </label>
              <input
                id="register-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
                required
                autoComplete="new-password"
                className="w-full bg-white border border-[#D5CBC0] text-[#201515] placeholder-[#9C9087] rounded-xl px-4 py-3 text-sm outline-none focus:border-[#FF4F00] focus:ring-2 focus:ring-[#FF4F00]/20 transition-all"
              />
            </div>

            <div>
              <label htmlFor="register-confirm" className="block text-xs font-bold text-[#201515] mb-1.5">
                Confirm Password
              </label>
              <input
                id="register-confirm"
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Repeat password"
                required
                autoComplete="new-password"
                className="w-full bg-white border border-[#D5CBC0] text-[#201515] placeholder-[#9C9087] rounded-xl px-4 py-3 text-sm outline-none focus:border-[#FF4F00] focus:ring-2 focus:ring-[#FF4F00]/20 transition-all"
              />
            </div>

            <button
              id="register-submit"
              type="submit"
              disabled={loading}
              className="btn-zap-primary w-full py-3.5 text-sm font-bold mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Creating Account…</span>
                </>
              ) : (
                <>
                  <span>Create Account & Get 100 Credits</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </CardSpotlight>

        <p className="text-center text-xs text-[#5C524C] mt-6">
          Already registered?{" "}
          <Link href="/login" className="text-[#FF4F00] hover:underline font-bold transition-colors">
            Sign into your account
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
