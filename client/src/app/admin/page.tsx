"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
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
  AlertTriangle,
} from "lucide-react";
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

  const loadData = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    let ignore = false;
    Promise.all([
      fetchAdminAgents(),
      fetchAdminJobs(),
      fetchAdminUsers(),
    ])
      .then(([agentsData, jobsData, usersData]) => {
        if (!ignore) {
          setAgents(agentsData);
          setJobs(jobsData);
          setUsers(usersData);
          setLoading(false);
        }
      })
      .catch((e) => {
        console.error("Admin data load error:", e);
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
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

  return (
    <div className="relative min-h-[calc(100vh-4.5rem)] p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-8 bg-[#FFFDF9]">
      <BackgroundBeams />

      {/* Header */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#EAE3D9]">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold bg-[#FFF2EB] text-[#D43F00] border border-[#FFD6C2]">
            <span className="text-[#FF4F00] font-black">_</span>
            <span>Platform Governance</span>
          </div>
          <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-[#201515] tracking-tight mt-2">
            Admin Studio
          </h1>
          <p className="text-sm text-[#5C524C]">
            Manage published agents, inspect system-wide job executions, and audit user balances.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/agents/new"
            className="btn-zap-primary text-xs py-2.5 px-5 font-bold"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Agent</span>
          </Link>
        </div>
      </div>

      {/* Tabs with Aceternity animated indicator pill */}
      <div className="relative z-10 flex items-center gap-1 p-1 bg-[#FAF5EE] border border-[#EAE3D9] rounded-full w-fit">
        {(
          [
            { id: "agents", label: `Agents (${agents.length})`, icon: Bot },
            { id: "jobs", label: `All Jobs (${jobs.length})`, icon: Layers },
            { id: "users", label: `Users & Credits (${users.length})`, icon: Users },
          ] as const
        ).map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "relative flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold transition-colors cursor-pointer z-10",
                isActive
                  ? "text-[#FFFDF9]"
                  : "text-[#5C524C] hover:text-[#201515]"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="adminTabPill"
                  className="absolute inset-0 bg-[#201515] rounded-full z-[-1] shadow-xs"
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                />
              )}
              <Icon className={cn("w-3.5 h-3.5", isActive ? "text-[#FF4F00]" : "text-[#887E78]")} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Agents */}
      {activeTab === "agents" && (
        <div className="relative z-10 space-y-4">
          <div className="bg-white border border-[#EAE3D9] rounded-3xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#EAE3D9] bg-[#FAF5EE] text-[#5C524C]">
                    <th className="px-6 py-3.5 font-bold">Agent Name</th>
                    <th className="px-6 py-3.5 font-bold">Category</th>
                    <th className="px-6 py-3.5 font-bold">Cost</th>
                    <th className="px-6 py-3.5 font-bold">Inputs</th>
                    <th className="px-6 py-3.5 font-bold">Active State</th>
                    <th className="px-6 py-3.5 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EAE3D9] text-[#201515]">
                  {agents.map((agent) => (
                    <tr key={agent.id} className="hover:bg-[#FAF5EE] transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-[#201515]">{agent.name}</div>
                        <div className="text-[11px] text-[#887E78] font-mono">{agent.id}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] bg-[#FFF2EB] text-[#D43F00] border border-[#FFD6C2] font-bold">
                          {agent.category || "General"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1 font-bold text-[#201515]">
                          <Zap className="w-3 h-3 fill-[#FF4F00] text-[#FF4F00]" />
                          {agent.creditCost} credits
                        </span>
                      </td>
                      <td className="px-6 py-4 font-mono text-[#5C524C]">
                        {agent.inputSchema?.fields?.length || 0} fields
                      </td>
                      <td className="px-6 py-4">
                        <button
                          type="button"
                          onClick={() => handleToggle(agent.id, agent.isActive !== false)}
                          className={cn(
                            "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border transition-all cursor-pointer",
                            agent.isActive !== false
                              ? "bg-[#ECFDF5] text-[#059669] border-[#A7F3D0]"
                              : "bg-[#F2ECE2] text-[#887E78] border-[#EAE3D9]"
                          )}
                        >
                          <Power className="w-3 h-3" />
                          <span>{agent.isActive !== false ? "Active" : "Disabled"}</span>
                        </button>
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <Link
                          href={`/admin/agents/${agent.id}`}
                          className="inline-flex items-center gap-1 text-xs text-[#5C524C] hover:text-[#201515] p-1.5 hover:bg-[#FAF5EE] rounded-lg transition-colors"
                          title="Edit Agent"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => setAgentToDelete(agent)}
                          className="inline-flex items-center gap-1 text-xs text-[#E11D48] hover:text-[#BE123C] p-1.5 hover:bg-[#FFF1F2] rounded-lg transition-colors cursor-pointer"
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
          </div>
        </div>
      )}

      {/* Tab 2: All Jobs */}
      {activeTab === "jobs" && (
        <div className="relative z-10 space-y-4">
          <div className="bg-white border border-[#EAE3D9] rounded-3xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#EAE3D9] bg-[#FAF5EE] text-[#5C524C]">
                    <th className="px-6 py-3.5 font-bold">Job ID</th>
                    <th className="px-6 py-3.5 font-bold">Agent</th>
                    <th className="px-6 py-3.5 font-bold">Status</th>
                    <th className="px-6 py-3.5 font-bold">Duration</th>
                    <th className="px-6 py-3.5 font-bold">Created At</th>
                    <th className="px-6 py-3.5 font-bold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EAE3D9] text-[#201515]">
                  {jobs.map((job) => (
                    <tr key={job.id} className="hover:bg-[#FAF5EE] transition-colors">
                      <td className="px-6 py-4 font-mono font-medium text-[#887E78]">
                        #{job.id.slice(0, 8)}
                      </td>
                      <td className="px-6 py-4 font-bold text-[#201515]">
                        {job.agentName || job.agentId}
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={job.status} />
                      </td>
                      <td className="px-6 py-4 font-mono text-[#5C524C]">
                        {job.durationMs ? `${job.durationMs}ms` : "—"}
                      </td>
                      <td className="px-6 py-4 text-[#5C524C]">
                        {formatDate(job.createdAt)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          href={`/jobs/${job.id}`}
                          className="inline-flex items-center gap-1 text-xs text-[#FF4F00] hover:underline font-bold"
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
          </div>
        </div>
      )}

      {/* Tab 3: Users */}
      {activeTab === "users" && (
        <div className="relative z-10 space-y-4">
          <div className="bg-white border border-[#EAE3D9] rounded-3xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#EAE3D9] bg-[#FAF5EE] text-[#5C524C]">
                    <th className="px-6 py-3.5 font-bold">User Email</th>
                    <th className="px-6 py-3.5 font-bold">Role</th>
                    <th className="px-6 py-3.5 font-bold">Credits Balance</th>
                    <th className="px-6 py-3.5 font-bold">Joined Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EAE3D9] text-[#201515]">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-[#FAF5EE] transition-colors">
                      <td className="px-6 py-4 font-bold text-[#201515]">
                        {u.email}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={cn(
                            "px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
                            u.role === "admin"
                              ? "bg-[#FFF2EB] text-[#D43F00] border border-[#FFD6C2]"
                              : "bg-[#FAF5EE] text-[#5C524C] border border-[#EAE3D9]"
                          )}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1 font-mono font-bold text-[#201515]">
                          <Zap className="w-3 h-3 fill-[#FF4F00] text-[#FF4F00]" />
                          {u.creditsBalance}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-[#5C524C]">
                        {formatDate(u.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {agentToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-3xl border border-[#EAE3D9] bg-white p-6 space-y-4 shadow-xl">
            <div className="flex items-center gap-3 text-[#E11D48]">
              <div className="p-2 rounded-xl bg-[#FFF1F2] border border-[#FECDD3]">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="font-heading text-base font-bold text-[#201515]">Confirm Deletion</h3>
            </div>
            <p className="text-xs text-[#5C524C] leading-relaxed">
              Are you sure you want to delete <strong className="text-[#201515]">{agentToDelete.name}</strong>? This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setAgentToDelete(null)}
                className="btn-zap-secondary text-xs px-4 py-2"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="px-4 py-2 rounded-full text-xs font-bold text-white bg-[#E11D48] hover:bg-[#BE123C] transition-colors cursor-pointer"
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
