"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Shield,
  Bot,
  Layers,
  Users,
  Plus,
  Trash2,
  Edit,
  Power,
  Zap,
  ArrowRight,
  CheckCircle,
  AlertTriangle,
  Lock,
} from "lucide-react";
import CardSpotlight from "@/components/CardSpotlight";
import StatusBadge from "@/components/StatusBadge";
import BackgroundBeams from "@/components/BackgroundBeams";
import { useAuth } from "@/contexts/AuthContext";
import {
  fetchAdminAgents,
  toggleAdminAgent,
  deleteAdminAgent,
  fetchAdminJobs,
  fetchAdminUsers,
  Agent,
  Job,
  UserSummary,
} from "@/lib/api";
import { formatDate, cn } from "@/lib/utils";

export default function AdminPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"agents" | "jobs" | "users">("agents");

  const [agents, setAgents] = useState<Agent[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [users, setUsers] = useState<UserSummary[]>([]);
  const [loading, setLoading] = useState(true);

  // Delete modal state
  const [agentToDelete, setAgentToDelete] = useState<Agent | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [agentsData, jobsData, usersData] = await Promise.all([
        fetchAdminAgents(),
        fetchAdminJobs(),
        fetchAdminUsers(),
      ]);
      setAgents(agentsData);
      setJobs(jobsData);
      setUsers(usersData);
    } catch (e) {
      console.error("Admin data load error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggle = async (id: string, currentStatus: boolean) => {
    try {
      await toggleAdminAgent(id, !currentStatus);
      setAgents((prev) =>
        prev.map((a) => (a.id === id ? { ...a, isActive: !currentStatus } : a))
      );
    } catch (err) {
      alert("Failed to toggle agent status");
    }
  };

  const handleDelete = async () => {
    if (!agentToDelete) return;
    try {
      await deleteAdminAgent(agentToDelete.id);
      setAgents((prev) => prev.filter((a) => a.id !== agentToDelete.id));
      setAgentToDelete(null);
    } catch (err) {
      alert("Failed to delete agent");
    }
  };

  const isAdmin = user?.role === "admin" || !user; // Allow preview with badge if guest

  return (
    <div className="relative min-h-[calc(100vh-4rem)] p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-8">
      <BackgroundBeams />

      {/* Header */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-violet-400">
            <Shield className="w-3.5 h-3.5" />
            <span>Platform Administration</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
            Admin Studio & Governance
          </h1>
          <p className="text-xs sm:text-sm text-gray-400">
            Manage published agents, inspect system-wide job executions, and audit user balances.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/agents/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-violet-600 hover:bg-violet-500 shadow-lg shadow-violet-600/30 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Agent</span>
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="relative z-10 flex items-center gap-2 p-1.5 bg-white/[0.03] border border-white/5 rounded-2xl w-fit">
        <button
          type="button"
          onClick={() => setActiveTab("agents")}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer",
            activeTab === "agents"
              ? "bg-violet-600 text-white shadow-md shadow-violet-600/30"
              : "text-gray-400 hover:text-white"
          )}
        >
          <Bot className="w-3.5 h-3.5" />
          <span>Agents ({agents.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("jobs")}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer",
            activeTab === "jobs"
              ? "bg-violet-600 text-white shadow-md shadow-violet-600/30"
              : "text-gray-400 hover:text-white"
          )}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>All Jobs ({jobs.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("users")}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer",
            activeTab === "users"
              ? "bg-violet-600 text-white shadow-md shadow-violet-600/30"
              : "text-gray-400 hover:text-white"
          )}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Users & Credits ({users.length})</span>
        </button>
      </div>

      {/* Tab 1: Agents */}
      {activeTab === "agents" && (
        <div className="relative z-10 space-y-4">
          <CardSpotlight className="p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/5 bg-white/[0.02] text-gray-400">
                    <th className="px-6 py-3.5 font-semibold">Agent Name</th>
                    <th className="px-6 py-3.5 font-semibold">Category</th>
                    <th className="px-6 py-3.5 font-semibold">Cost</th>
                    <th className="px-6 py-3.5 font-semibold">Inputs</th>
                    <th className="px-6 py-3.5 font-semibold">Active State</th>
                    <th className="px-6 py-3.5 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-gray-300">
                  {agents.map((agent) => (
                    <tr key={agent.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-white">{agent.name}</div>
                        <div className="text-[11px] text-gray-500 font-mono">{agent.id}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-violet-500/10 text-violet-300 border border-violet-500/20 font-semibold">
                          {agent.category || "General"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1 font-semibold text-amber-300">
                          <Zap className="w-3 h-3 fill-amber-300" />
                          {agent.creditCost} credits
                        </span>
                      </td>
                      <td className="px-6 py-4 font-mono text-gray-400">
                        {agent.inputSchema?.fields?.length || 0} fields
                      </td>
                      <td className="px-6 py-4">
                        <button
                          type="button"
                          onClick={() => handleToggle(agent.id, agent.isActive !== false)}
                          className={cn(
                            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border transition-all cursor-pointer",
                            agent.isActive !== false
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20"
                              : "bg-gray-800 text-gray-400 border-gray-700 hover:bg-gray-700"
                          )}
                        >
                          <Power className="w-3 h-3" />
                          <span>{agent.isActive !== false ? "Active" : "Disabled"}</span>
                        </button>
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <Link
                          href={`/admin/agents/${agent.id}`}
                          className="inline-flex items-center gap-1 text-xs text-gray-300 hover:text-white p-1.5 hover:bg-white/5 rounded-lg transition-colors"
                          title="Edit Agent"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => setAgentToDelete(agent)}
                          className="inline-flex items-center gap-1 text-xs text-rose-400 hover:text-rose-300 p-1.5 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                          title="Delete Agent"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardSpotlight>
        </div>
      )}

      {/* Tab 2: All Jobs */}
      {activeTab === "jobs" && (
        <div className="relative z-10 space-y-4">
          <CardSpotlight className="p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/5 bg-white/[0.02] text-gray-400">
                    <th className="px-6 py-3.5 font-semibold">Job ID</th>
                    <th className="px-6 py-3.5 font-semibold">Agent</th>
                    <th className="px-6 py-3.5 font-semibold">Status</th>
                    <th className="px-6 py-3.5 font-semibold">Duration</th>
                    <th className="px-6 py-3.5 font-semibold">Created At</th>
                    <th className="px-6 py-3.5 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-gray-300">
                  {jobs.map((job) => (
                    <tr key={job.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4 font-mono font-medium text-gray-400">
                        {job.id}
                      </td>
                      <td className="px-6 py-4 font-semibold text-white">
                        {job.agentName || job.agentId}
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
                          className="inline-flex items-center gap-1 text-xs text-violet-400 hover:text-white px-2.5 py-1 rounded-md bg-white/5 hover:bg-violet-600 transition-all"
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
          </CardSpotlight>
        </div>
      )}

      {/* Tab 3: Users */}
      {activeTab === "users" && (
        <div className="relative z-10 space-y-4">
          <CardSpotlight className="p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/5 bg-white/[0.02] text-gray-400">
                    <th className="px-6 py-3.5 font-semibold">User Email</th>
                    <th className="px-6 py-3.5 font-semibold">Role</th>
                    <th className="px-6 py-3.5 font-semibold">Credits Balance</th>
                    <th className="px-6 py-3.5 font-semibold">Joined Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-gray-300">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4 font-semibold text-white">
                        {u.email}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={cn(
                            "px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider",
                            u.role === "admin"
                              ? "bg-violet-500/20 text-violet-300 border border-violet-500/30"
                              : "bg-white/5 text-gray-400 border border-white/10"
                          )}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1 font-mono font-bold text-amber-300">
                          <Zap className="w-3 h-3 fill-amber-300" />
                          {u.creditsBalance}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-400">
                        {formatDate(u.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardSpotlight>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {agentToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-gray-950 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Confirm Deletion</h3>
            </div>
            <p className="text-xs text-gray-300 leading-relaxed">
              Are you sure you want to delete <strong className="text-white">{agentToDelete.name}</strong>? This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setAgentToDelete(null)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 transition-colors cursor-pointer"
              >
                Delete Agent
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
