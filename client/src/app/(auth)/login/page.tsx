"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import BackgroundBeams from "@/components/BackgroundBeams";
import CardSpotlight from "@/components/CardSpotlight";
import { Sparkles, Loader2, AlertCircle, ArrowRight, ShieldCheck } from "lucide-react";

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

  function handleDemoLogin(role: "user" | "admin") {
    if (role === "admin") {
      setEmail("admin@aimarketplace.com");
      setPassword("AdminPass123!");
    } else {
      setEmail("user@aimarketplace.com");
      setPassword("UserPass123!");
    }
  }

  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      <BackgroundBeams />

      <div className="relative z-10 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8 space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-600 shadow-lg shadow-violet-600/30 mb-2">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Welcome Back
          </h1>
          <p className="text-xs sm:text-sm text-gray-400">
            Sign in to access your agents, active jobs, and credit balance
          </p>
        </div>

        {/* Card */}
        <CardSpotlight className="p-8 shadow-2xl border-white/10">
          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            {error && (
              <div className="flex items-center gap-2.5 bg-rose-500/10 border border-rose-500/20 rounded-xl px-4 py-3 text-xs text-rose-300">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label htmlFor="login-email" className="block text-xs font-semibold text-gray-300 mb-1.5">
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
                className="w-full bg-gray-950/70 border border-white/10 text-white placeholder-gray-500 rounded-xl px-4 py-3 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all duration-200"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="login-password" className="block text-xs font-semibold text-gray-300">
                  Password
                </label>
                <span className="text-[11px] text-gray-500 hover:text-violet-400 cursor-pointer">
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
                className="w-full bg-gray-950/70 border border-white/10 text-white placeholder-gray-500 rounded-xl px-4 py-3 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all duration-200"
              />
            </div>

            <button
              id="login-submit"
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:opacity-60 text-white font-semibold rounded-xl px-4 py-3 text-sm transition-all duration-200 shadow-lg shadow-violet-600/25 hover:shadow-violet-600/40 flex items-center justify-center gap-2 cursor-pointer mt-2"
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

            {/* Quick Demo Credentials */}
            <div className="pt-4 border-t border-white/5 space-y-2">
              <span className="text-[11px] text-gray-500 uppercase tracking-wider block text-center">
                Quick Demo Fill
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleDemoLogin("user")}
                  className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-medium transition-colors cursor-pointer border border-white/5"
                >
                  Fill Regular User
                </button>
                <button
                  type="button"
                  onClick={() => handleDemoLogin("admin")}
                  className="px-3 py-1.5 rounded-lg bg-violet-500/10 hover:bg-violet-500/20 text-violet-300 text-xs font-medium transition-colors cursor-pointer border border-violet-500/20 flex items-center justify-center gap-1"
                >
                  <ShieldCheck className="w-3 h-3" />
                  Fill Admin
                </button>
              </div>
            </div>
          </form>
        </CardSpotlight>

        <p className="text-center text-xs text-gray-500 mt-6">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-violet-400 hover:text-violet-300 font-medium transition-colors">
            Create account (50 free credits)
          </Link>
        </p>
      </div>
    </div>
  );
}
