"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Shield,
  Key,
  Zap,
  Layers,
  Copy,
  Check,
  Calendar,
  Mail,
  ArrowRight,
  ExternalLink,
  Code2,
  Lock,
  LogOut,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Sparkles,
  Bot,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import BackgroundBeams from "@/components/BackgroundBeams";
import CardSpotlight from "@/components/CardSpotlight";
import StatusBadge from "@/components/StatusBadge";
import {
  fetchUserProfile,
  UserProfileData,
  changePassword,
  fetchJobs,
  Job,
  fetchCreditLedger,
  CreditLedgerItem,
} from "@/lib/api";
import { formatDate } from "@/lib/utils";

type ActiveTab = "overview" | "security" | "developer";

export default function ProfilePage() {
  const router = useRouter();
  const { user, accessToken, balance, logout, isLoading: authLoading } = useAuth();

  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [ledger, setLedger] = useState<CreditLedgerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<ActiveTab>("overview");

  // Copy feedbacks
  const [copiedId, setCopiedId] = useState(false);
  const [copiedToken, setCopiedToken] = useState(false);
  const [showToken, setShowToken] = useState(false);

  // Change password form
  const [currentPass, setCurrentPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [passLoading, setPassLoading] = useState(false);
  const [passError, setPassError] = useState<string | null>(null);
  const [passSuccess, setPassSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
      return;
    }

    if (user) {
      async function loadUserData() {
        try {
          const [profData, jobsData, ledgerData] = await Promise.allSettled([
            fetchUserProfile(),
            fetchJobs(),
            fetchCreditLedger(),
          ]);

          if (profData.status === "fulfilled") {
            setProfile(profData.value);
          } else {
            // Fallback from context
            setProfile({
              id: user!.id,
              email: user!.email,
              role: user!.role,
              createdAt: new Date().toISOString(),
              isGoogleUser: false,
            });
          }

          if (jobsData.status === "fulfilled") {
            setJobs(jobsData.value);
          }
          if (ledgerData.status === "fulfilled") {
            setLedger(ledgerData.value);
          }
        } finally {
          setLoading(false);
        }
      }
      loadUserData();
    }
  }, [user, authLoading, router]);

  const copyToClipboard = (text: string, type: "id" | "token") => {
    navigator.clipboard.writeText(text);
    if (type === "id") {
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    } else {
      setCopiedToken(true);
      setTimeout(() => setCopiedToken(false), 2000);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassError(null);
    setPassSuccess(null);

    if (newPass !== confirmPass) {
      setPassError("New passwords do not match.");
      return;
    }
    if (newPass.length < 8) {
      setPassError("New password must be at least 8 characters long.");
      return;
    }

    setPassLoading(true);
    try {
      const res = await changePassword(currentPass, newPass);
      setPassSuccess(res.message || "Password updated successfully!");
      setCurrentPass("");
      setNewPass("");
      setConfirmPass("");
    } catch (err) {
      setPassError(err instanceof Error ? err.message : "Failed to change password.");
    } finally {
      setPassLoading(false);
    }
  };

  if (authLoading || (loading && !profile)) {
    return (
      <div className="min-h-[calc(100vh-4.5rem)] flex items-center justify-center bg-[#FFFDF9]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-[#FF4F00] animate-spin" />
          <p className="text-sm font-medium text-[#5C524C]">Loading your profile...</p>
        </div>
      </div>
    );
  }

  const initial = profile?.email ? profile.email[0].toUpperCase() : "U";
  const totalJobs = jobs.length;
  const completedJobs = jobs.filter((j) => j.status === "completed").length;
  const successRate = totalJobs > 0 ? Math.round((completedJobs / totalJobs) * 100) : 100;
  const totalSpent = ledger
    .filter((tx) => tx.amount < 0)
    .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);

  return (
    <div className="relative min-h-[calc(100vh-4.5rem)] p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-8 bg-[#FFFDF9]">
      <BackgroundBeams />

      {/* Breadcrumb / Category header */}
      <div className="relative z-10 flex items-center gap-2 text-xs text-[#5C524C]">
        <Link href="/dashboard" className="hover:text-[#FF4F00] transition-colors">
          Workspace
        </Link>
        <span>/</span>
        <span className="text-[#201515] font-semibold">User Profile & Account</span>
      </div>

      {/* Hero Profile Banner */}
      <div className="relative z-10">
        <CardSpotlight className="p-6 sm:p-8 rounded-3xl border border-[#EAE3D9] bg-white/95 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            {/* Avatar & User Details */}
            <div className="flex items-start sm:items-center gap-4 sm:gap-6">
              <div className="relative">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-tr from-[#201515] to-[#3A2D28] text-white flex items-center justify-center font-extrabold text-3xl sm:text-4xl shadow-md border-2 border-[#FAF5EE]">
                  {initial}
                </div>
                <div
                  className="absolute -bottom-1.5 -right-1.5 p-1 rounded-full bg-white border border-[#EAE3D9] shadow-xs"
                  title={profile?.role === "admin" ? "Administrator" : "Operator"}
                >
                  <Shield className="w-4 h-4 text-[#FF4F00]" />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="font-heading text-xl sm:text-2xl font-extrabold text-[#201515] tracking-tight">
                    {profile?.email.split("@")[0]}
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-[#FFF2EB] text-[#FF4F00] border border-[#FFD6C2]">
                    {profile?.role === "admin" ? "Administrator" : "Operator"}
                  </span>
                  {profile?.isGoogleUser && (
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#EEF2FF] text-[#4338CA] border border-[#C7D2FE] flex items-center gap-1">
                      <svg className="w-3 h-3" viewBox="0 0 24 24">
                        <path
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          fill="#4285F4"
                        />
                        <path
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          fill="#34A853"
                        />
                        <path
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                          fill="#FBBC05"
                        />
                        <path
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                          fill="#EA4335"
                        />
                      </svg>
                      Google Verified
                    </span>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs text-[#5C524C]">
                  <span className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-[#887E78]" />
                    {profile?.email}
                  </span>
                  <span className="hidden sm:inline text-[#D5CBC0]">•</span>
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#887E78]" />
                    Joined {profile?.createdAt ? formatDate(profile.createdAt) : "Recently"}
                  </span>
                </div>

                {/* Account UUID Pill */}
                <div className="pt-1 flex items-center gap-2">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#FAF5EE] border border-[#EAE3D9] text-[11px] font-mono text-[#5C524C]">
                    <span className="text-[#887E78]">UID:</span>
                    <span>{profile?.id}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(profile?.id || "", "id")}
                    className="p-1 text-[#887E78] hover:text-[#201515] rounded hover:bg-[#FAF5EE] transition-colors"
                    title="Copy Account ID"
                  >
                    {copiedId ? <Check className="w-3.5 h-3.5 text-[#237A57]" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-3 self-start md:self-center">
              <Link href="/credits" className="btn-zap-primary text-xs py-2.5 px-4 font-bold flex items-center gap-2">
                <Zap className="w-3.5 h-3.5" />
                <span>Top Up Credits</span>
              </Link>
              <button
                type="button"
                onClick={() => logout()}
                className="p-2.5 rounded-full border border-[#EAE3D9] text-[#887E78] hover:text-[#BE123C] hover:bg-[#FFF1F2] hover:border-[#FECDD3] transition-all cursor-pointer"
                title="Log out of session"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </CardSpotlight>
      </div>

      {/* Metrics Row */}
      <div className="relative z-10 grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Credit Balance */}
        <div className="p-5 rounded-2xl bg-white border border-[#EAE3D9] shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-[#5C524C]">
            <span className="font-semibold">Credit Balance</span>
            <div className="p-1 rounded-md bg-[#FFF2EB] text-[#FF4F00]">
              <Zap className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#201515]">
            {balance}
          </div>
          <Link href="/credits" className="inline-flex items-center gap-1 text-[11px] font-bold text-[#FF4F00] hover:underline">
            Manage credits <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Total Executions */}
        <div className="p-5 rounded-2xl bg-white border border-[#EAE3D9] shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-[#5C524C]">
            <span className="font-semibold">Jobs Dispatched</span>
            <div className="p-1 rounded-md bg-[#FAF5EE] text-[#201515]">
              <Layers className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#201515]">
            {totalJobs}
          </div>
          <Link href="/jobs" className="inline-flex items-center gap-1 text-[11px] font-bold text-[#5C524C] hover:text-[#201515]">
            View job logs <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Success Rate */}
        <div className="p-5 rounded-2xl bg-white border border-[#EAE3D9] shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-[#5C524C]">
            <span className="font-semibold">Success Rate</span>
            <div className="p-1 rounded-md bg-[#ECFDF5] text-[#059669]">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#201515]">
            {successRate}%
          </div>
          <span className="text-[11px] text-[#059669] font-medium flex items-center gap-1">
            {completedJobs} completed / {totalJobs} total
          </span>
        </div>

        {/* Credits Spent */}
        <div className="p-5 rounded-2xl bg-white border border-[#EAE3D9] shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-[#5C524C]">
            <span className="font-semibold">Credits Consumed</span>
            <div className="p-1 rounded-md bg-[#FAF5EE] text-[#5C524C]">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#201515]">
            {totalSpent}
          </div>
          <span className="text-[11px] text-[#5C524C]">Autonomous execution usage</span>
        </div>
      </div>

      {/* Profile Section Tabs */}
      <div className="relative z-10 space-y-6">
        {/* Tab Controls */}
        <div className="flex items-center gap-2 border-b border-[#EAE3D9] pb-2">
          <button
            type="button"
            onClick={() => setActiveTab("overview")}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
              activeTab === "overview"
                ? "bg-[#201515] text-white shadow-xs"
                : "text-[#5C524C] hover:text-[#201515] hover:bg-[#FAF5EE]"
            }`}
          >
            Activity & Overview
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("security")}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
              activeTab === "security"
                ? "bg-[#201515] text-white shadow-xs"
                : "text-[#5C524C] hover:text-[#201515] hover:bg-[#FAF5EE]"
            }`}
          >
            Security & Authentication
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("developer")}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
              activeTab === "developer"
                ? "bg-[#201515] text-white shadow-xs"
                : "text-[#5C524C] hover:text-[#201515] hover:bg-[#FAF5EE]"
            }`}
          >
            Developer & API
          </button>
        </div>

        {/* Tab 1: Activity & Overview */}
        {activeTab === "overview" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Recent Jobs Column */}
              <div className="lg:col-span-2 p-6 rounded-3xl bg-white border border-[#EAE3D9] shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-heading text-lg font-bold text-[#201515]">Recent Autonomous Runs</h2>
                    <p className="text-xs text-[#5C524C]">Your most recently executed agent jobs</p>
                  </div>
                  <Link href="/jobs" className="text-xs font-bold text-[#FF4F00] hover:underline flex items-center gap-1">
                    View all <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                {jobs.length === 0 ? (
                  <div className="py-12 text-center space-y-3">
                    <Bot className="w-10 h-10 text-[#D5CBC0] mx-auto" />
                    <p className="text-xs text-[#5C524C]">No jobs have been executed yet.</p>
                    <Link href="/agents" className="btn-zap-primary text-xs py-2 px-4 inline-flex">
                      Browse Agents
                    </Link>
                  </div>
                ) : (
                  <div className="divide-y divide-[#F0EAE1]">
                    {jobs.slice(0, 5).map((job) => (
                      <div key={job.id} className="py-3.5 flex items-center justify-between gap-4">
                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-[#201515] truncate">
                              {job.agentName || "AI Agent"}
                            </span>
                            <StatusBadge status={job.status} />
                          </div>
                          <p className="text-[11px] text-[#887E78]">
                            Job ID: {job.id.slice(0, 8)}... • {formatDate(job.createdAt)}
                          </p>
                        </div>
                        <Link
                          href={`/jobs/${job.id}`}
                          className="text-xs font-semibold text-[#FF4F00] hover:text-[#E64600] shrink-0"
                        >
                          Details →
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Side Info Cards */}
              <div className="space-y-6">
                <div className="p-6 rounded-3xl bg-gradient-to-br from-[#FFFDF9] to-[#FFF2EB] border border-[#FFD6C2] shadow-xs space-y-3">
                  <div className="flex items-center gap-2 text-[#FF4F00]">
                    <Zap className="w-4 h-4 fill-[#FF4F00]" />
                    <span className="text-xs font-bold uppercase tracking-wider">Fast Execution</span>
                  </div>
                  <h3 className="font-heading text-base font-bold text-[#201515]">
                    Unlimited Autonomous Runs
                  </h3>
                  <p className="text-xs text-[#5C524C] leading-relaxed">
                    Every agent consumes 1 credit per execution. Top up credits anytime to scale your background workers without limits.
                  </p>
                  <Link href="/credits" className="btn-zap-primary text-xs py-2 px-4 inline-block font-bold mt-2">
                    Purchase Credits
                  </Link>
                </div>

                <div className="p-6 rounded-3xl bg-white border border-[#EAE3D9] shadow-xs space-y-3">
                  <h3 className="font-heading text-sm font-bold text-[#201515]">Role Privileges</h3>
                  <div className="space-y-2 text-xs text-[#5C524C]">
                    <div className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-[#059669]" />
                      <span>Execute marketplace agents</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-[#059669]" />
                      <span>Real-time WebSocket event streaming</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-[#059669]" />
                      <span>Full credit ledger & execution audit</span>
                    </div>
                    {profile?.role === "admin" && (
                      <div className="flex items-center gap-2 font-semibold text-[#FF4F00]">
                        <Shield className="w-3.5 h-3.5 text-[#FF4F00]" />
                        <span>Admin Agent Management & Studio</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Tab 2: Security & Authentication */}
        {activeTab === "security" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          >
            {/* Password Management */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#EAE3D9] shadow-xs space-y-5">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-[#201515]">
                  <Key className="w-4 h-4 text-[#FF4F00]" />
                  <h2 className="font-heading text-lg font-bold">Password & Authentication</h2>
                </div>
                <p className="text-xs text-[#5C524C]">
                  Update your local login password or verify your OAuth security status.
                </p>
              </div>

              {profile?.isGoogleUser ? (
                <div className="p-5 rounded-2xl bg-[#EEF2FF] border border-[#C7D2FE] space-y-3">
                  <div className="flex items-center gap-2 text-[#4338CA] font-bold text-xs">
                    <Shield className="w-4 h-4" />
                    <span>Google OAuth Managed Account</span>
                  </div>
                  <p className="text-xs text-[#475569] leading-relaxed">
                    This account signs in with Google Identity Services. Password management is handled securely through your Google Account.
                  </p>
                </div>
              ) : (
                <form onSubmit={handlePasswordChange} className="space-y-4">
                  {passError && (
                    <div className="flex items-center gap-2 p-3 bg-[#FFF1F2] border border-[#FECDD3] text-[#BE123C] text-xs rounded-xl">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{passError}</span>
                    </div>
                  )}

                  {passSuccess && (
                    <div className="flex items-center gap-2 p-3 bg-[#ECFDF5] border border-[#A7F3D0] text-[#059669] text-xs rounded-xl">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span>{passSuccess}</span>
                    </div>
                  )}

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#201515]">Current Password</label>
                    <input
                      type="password"
                      required
                      value={currentPass}
                      onChange={(e) => setCurrentPass(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5CBC0] bg-white text-xs text-[#201515] focus:outline-none focus:border-[#FF4F00]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#201515]">New Password</label>
                    <input
                      type="password"
                      required
                      minLength={8}
                      value={newPass}
                      onChange={(e) => setNewPass(e.target.value)}
                      placeholder="At least 8 characters"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5CBC0] bg-white text-xs text-[#201515] focus:outline-none focus:border-[#FF4F00]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#201515]">Confirm New Password</label>
                    <input
                      type="password"
                      required
                      minLength={8}
                      value={confirmPass}
                      onChange={(e) => setConfirmPass(e.target.value)}
                      placeholder="Repeat new password"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5CBC0] bg-white text-xs text-[#201515] focus:outline-none focus:border-[#FF4F00]"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={passLoading}
                    className="btn-zap-primary text-xs py-2.5 px-5 font-bold cursor-pointer disabled:opacity-50"
                  >
                    {passLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" /> : null}
                    <span>Save Password</span>
                  </button>
                </form>
              )}
            </div>

            {/* Session & Account Security */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#EAE3D9] shadow-xs space-y-5">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-[#201515]">
                  <Lock className="w-4 h-4 text-[#FF4F00]" />
                  <h2 className="font-heading text-lg font-bold">Session & Active Credentials</h2>
                </div>
                <p className="text-xs text-[#5C524C]">
                  Your current web session state and device security.
                </p>
              </div>

              <div className="space-y-3">
                <div className="p-4 rounded-2xl bg-[#FAF5EE] border border-[#EAE3D9] space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-[#201515]">
                    <span>Current Session</span>
                    <span className="text-[10px] text-[#059669] bg-[#ECFDF5] px-2 py-0.5 rounded-full border border-[#A7F3D0]">
                      Active Now
                    </span>
                  </div>
                  <p className="text-xs text-[#5C524C]">
                    Authenticated as <span className="font-semibold text-[#201515]">{profile?.email}</span> via standard JWT Bearer tokens.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#FFFDF9] border border-[#EAE3D9] space-y-2">
                  <span className="text-xs font-bold text-[#201515]">Token Invalidation & Refresh</span>
                  <p className="text-xs text-[#5C524C] leading-relaxed">
                    Logging out revokes your current refresh token in PostgreSQL. Any stored session credentials on this browser will be cleared immediately.
                  </p>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => logout()}
                  className="w-full py-2.5 px-4 rounded-xl border border-[#FECDD3] bg-[#FFF1F2] text-[#BE123C] font-bold text-xs hover:bg-[#FFE4E6] transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Log Out From Device</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Tab 3: Developer & API Access */}
        {activeTab === "developer" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#EAE3D9] shadow-xs space-y-6">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-[#201515]">
                  <Code2 className="w-4 h-4 text-[#FF4F00]" />
                  <h2 className="font-heading text-lg font-bold">Developer API Access</h2>
                </div>
                <p className="text-xs text-[#5C524C]">
                  Interact with the AI Marketplace programmatically using your authenticated JWT bearer token.
                </p>
              </div>

              {/* JWT Access Token Card */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#201515] flex items-center justify-between">
                  <span>Current Access Token (JWT Bearer)</span>
                  <button
                    type="button"
                    onClick={() => setShowToken(!showToken)}
                    className="text-[11px] text-[#FF4F00] hover:underline"
                  >
                    {showToken ? "Mask Token" : "Reveal Token"}
                  </button>
                </label>
                <div className="relative">
                  <input
                    type={showToken ? "text" : "password"}
                    readOnly
                    value={accessToken || "No active access token"}
                    className="w-full pr-12 pl-3.5 py-2.5 rounded-xl border border-[#D5CBC0] bg-[#FAF5EE] text-xs font-mono text-[#201515] select-all"
                  />
                  <button
                    type="button"
                    onClick={() => copyToClipboard(accessToken || "", "token")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 text-[#887E78] hover:text-[#201515] rounded hover:bg-[#EAE3D9] transition-colors"
                    title="Copy JWT Token"
                  >
                    {copiedToken ? <Check className="w-4 h-4 text-[#059669]" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[11px] text-[#887E78]">
                  Attach this token in your HTTP headers: <code className="bg-[#FAF5EE] px-1 py-0.5 rounded font-mono">Authorization: Bearer &lt;token&gt;</code>
                </p>
              </div>

              {/* cURL Example */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#201515]">Quick cURL Example: Fetch Available Agents</label>
                <div className="p-4 rounded-2xl bg-[#201515] text-[#FAF5EE] font-mono text-xs overflow-x-auto leading-relaxed">
                  <code>
                    curl -X GET http://localhost:4000/api/agents \<br />
                    &nbsp;&nbsp;-H &quot;Authorization: Bearer {accessToken ? `${accessToken.slice(0, 16)}...` : "&lt;token&gt;"}&quot; \<br />
                    &nbsp;&nbsp;-H &quot;Content-Type: application/json&quot;
                  </code>
                </div>
              </div>

              {/* Quick cURL Example 2: Submit Job */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#201515]">cURL Example: Dispatch Job</label>
                <div className="p-4 rounded-2xl bg-[#201515] text-[#FAF5EE] font-mono text-xs overflow-x-auto leading-relaxed">
                  <code>
                    curl -X POST http://localhost:4000/api/jobs \<br />
                    &nbsp;&nbsp;-H &quot;Authorization: Bearer {accessToken ? `${accessToken.slice(0, 16)}...` : "&lt;token&gt;"}&quot; \<br />
                    &nbsp;&nbsp;-H &quot;Content-Type: application/json&quot; \<br />
                    &nbsp;&nbsp;-d &apos;&#123;&quot;agentId&quot;: &quot;&lt;agent_id&gt;&quot;, &quot;inputPayload&quot;: &#123;&quot;text&quot;: &quot;Hello world&quot;&#125;&#125;&apos;
                  </code>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
