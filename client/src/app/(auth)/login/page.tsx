"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import BackgroundBeams from "@/components/BackgroundBeams";
import CardSpotlight from "@/components/CardSpotlight";
import GoogleAuthButton from "@/components/GoogleAuthButton";
import { SparklesCore } from "@/components/ui";
import { Loader2, AlertCircle, ArrowRight, ShieldCheck } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(email, password);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid credentials.");
    } finally {
      setLoading(false);
    }
  }

  function handleDemoLogin() {
    setEmail("demo@example.com");
    setPassword("password123");
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
            Welcome Back
          </h1>
          <p className="text-xs sm:text-sm text-[#5C524C]">
            Sign in to access your agents, active jobs, and credit balance
          </p>
        </div>

        {/* Card with Spotlight */}
        <CardSpotlight className="p-8 shadow-sm rounded-3xl">
          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            {error && (
              <div className="flex items-center gap-2.5 bg-[#FFF1F2] border border-[#FECDD3] rounded-xl px-4 py-3 text-xs text-[#BE123C]">
                <AlertCircle className="w-4 h-4 text-[#E11D48] shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label htmlFor="login-email" className="block text-xs font-bold text-[#201515] mb-1.5">
                Email Address
              </label>
              <input
                id="login-email"
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
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="login-password" className="block text-xs font-bold text-[#201515]">
                  Password
                </label>
                <span className="text-[11px] text-[#887E78] hover:text-[#FF4F00] cursor-pointer">
                  Forgot password?
                </span>
              </div>
              <input
                id="login-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                required
                autoComplete="current-password"
                className="w-full bg-white border border-[#D5CBC0] text-[#201515] placeholder-[#9C9087] rounded-xl px-4 py-3 text-sm outline-none focus:border-[#FF4F00] focus:ring-2 focus:ring-[#FF4F00]/20 transition-all"
              />
            </div>

            <button
              id="login-submit"
              type="submit"
              disabled={loading}
              className="btn-zap-primary w-full py-3.5 text-sm font-bold"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Authenticating…</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {/* Divider */}
            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-[#EAE3D9]"></div>
              <span className="flex-shrink mx-3 text-[11px] font-bold text-[#887E78] uppercase tracking-wider">
                Or
              </span>
              <div className="flex-grow border-t border-[#EAE3D9]"></div>
            </div>

            {/* Google OAuth Login */}
            <GoogleAuthButton mode="signin" onError={(err) => setError(err)} />

            {/* Quick Demo Credentials */}
            <div className="pt-4 border-t border-[#EAE3D9] space-y-2">
              <span className="text-[11px] font-bold text-[#887E78] uppercase tracking-wider block text-center">
                One-Click Seeded Account
              </span>
              <button
                type="button"
                onClick={handleDemoLogin}
                className="w-full py-2.5 px-3 rounded-full bg-[#FAF5EE] hover:bg-[#F2ECE2] text-[#201515] text-xs font-bold transition-all cursor-pointer border border-[#EAE3D9] flex items-center justify-center gap-2"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-[#FF4F00]" />
                <span>Fill Demo Credentials (demo@example.com)</span>
              </button>
            </div>
          </form>
        </CardSpotlight>

        <p className="text-center text-xs text-[#5C524C] mt-6">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-[#FF4F00] hover:underline font-bold transition-colors">
            Create account (100 free credits)
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
