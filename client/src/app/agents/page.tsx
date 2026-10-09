"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  Bot,
  Search,
  Zap,
  Filter,
  ArrowRight,
  SlidersHorizontal,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import CardSpotlight from "@/components/CardSpotlight";
import BackgroundBeams from "@/components/BackgroundBeams";
import { fetchAgents, Agent } from "@/lib/api";
import { cn } from "@/lib/utils";

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  useEffect(() => {
    fetchAgents()
      .then((data) => setAgents(data))
      .catch((err) => console.error("Error loading agents:", err))
      .finally(() => setLoading(false));
  }, []);

  // Extract categories
  const categories = useMemo(() => {
    const set = new Set<string>(["All"]);
    agents.forEach((a) => {
      if (a.category) set.add(a.category);
    });
    return Array.from(set);
  }, [agents]);

  // Filter agents
  const filteredAgents = useMemo(() => {
    return agents.filter((agent) => {
      const matchesSearch =
        agent.name.toLowerCase().includes(search.toLowerCase()) ||
        agent.description.toLowerCase().includes(search.toLowerCase()) ||
        (agent.tags && agent.tags.some((t) => t.toLowerCase().includes(search.toLowerCase())));

      const matchesCat =
        selectedCategory === "All" || agent.category === selectedCategory;

      return matchesSearch && matchesCat;
    });
  }, [agents, search, selectedCategory]);

  return (
    <div className="relative min-h-[calc(100vh-4rem)] p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-8">
      <BackgroundBeams />

      {/* Header */}
      <div className="relative z-10 text-center max-w-2xl mx-auto space-y-3 pt-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-violet-500/10 text-violet-300 border border-violet-500/20">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Curated Autonomous Catalog</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
          Explore AI Agents
        </h1>
        <p className="text-xs sm:text-sm text-gray-400">
          Find the right agent for code refactoring, query optimization, copywriting, and security audits. Billed per execution run.
        </p>
      </div>

      {/* Search and Filters Bar */}
      <div className="relative z-10 space-y-4">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* Search bar */}
          <div className="relative w-full sm:flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by agent name, description, or keyword..."
              className="w-full pl-11 pr-4 py-3 bg-gray-950/70 border border-white/10 rounded-2xl text-sm text-white placeholder-gray-500 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all backdrop-blur-md"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-gray-500 hover:text-white"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <SlidersHorizontal className="w-4 h-4 text-gray-500 shrink-0 ml-1 mr-1" />
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={cn(
                "px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer",
                selectedCategory === cat
                  ? "bg-violet-600 text-white shadow-md shadow-violet-600/30 scale-105"
                  : "bg-white/[0.03] text-gray-400 hover:text-white hover:bg-white/[0.08] border border-white/5"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Agents Grid */}
      <div className="relative z-10">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="h-64 rounded-2xl border border-white/5 bg-white/[0.02] shimmer-bg"
              />
            ))}
          </div>
        ) : filteredAgents.length === 0 ? (
          <div className="p-16 text-center space-y-4 rounded-3xl border border-white/5 bg-gray-900/30 backdrop-blur-md">
            <Bot className="w-10 h-10 text-gray-600 mx-auto" />
            <h3 className="text-base font-bold text-white">No matching agents found</h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              Try adjusting your search terms or filter selection to find available autonomous agents.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setSelectedCategory("All");
              }}
              className="text-xs font-semibold text-violet-400 hover:text-violet-300 underline"
            >
              Reset filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAgents.map((agent) => (
              <CardSpotlight
                key={agent.id}
                className="p-6 flex flex-col justify-between group hover:border-violet-500/30 transition-all duration-300"
              >
                <div className="space-y-4">
                  {/* Category and Credit Cost */}
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-violet-500/10 text-violet-300 border border-violet-500/20">
                      {agent.category || "General"}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-300 bg-amber-400/10 px-2.5 py-0.5 rounded-full border border-amber-400/20">
                      <Zap className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
                      {agent.creditCost} {agent.creditCost === 1 ? "credit" : "credits"}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-lg font-bold text-white group-hover:text-violet-300 transition-colors">
                    {agent.name}
                  </h3>

                  {/* Description */}
                  <p className="text-xs text-gray-400 line-clamp-3 leading-relaxed">
                    {agent.description}
                  </p>

                  {/* Tags */}
                  {agent.tags && agent.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {agent.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-[10px] font-mono text-gray-500 bg-white/[0.03] px-2 py-0.5 rounded-md"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Footer / CTA */}
                <div className="pt-6 mt-6 border-t border-white/5 flex items-center justify-between">
                  <span className="text-[11px] text-gray-500 font-mono">
                    {agent.inputSchema?.fields?.length || 2} inputs required
                  </span>
                  <Link
                    href={`/agents/${agent.id}`}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-white px-3.5 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-500 shadow-md shadow-violet-600/20 hover:shadow-violet-600/40 transition-all cursor-pointer"
                  >
                    <span>Run Agent</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </CardSpotlight>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
