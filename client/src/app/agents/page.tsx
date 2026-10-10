"use client";

import React, { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bot,
  Search,
  SlidersHorizontal,
  Sparkles,
} from "lucide-react";
import BackgroundBeams from "@/components/BackgroundBeams";
import AgentCard from "@/components/AgentCard";
import { fetchAgents, Agent } from "@/lib/api";
import { HoverBorderGradient } from "@/components/ui";
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

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  };

  return (
    <div className="relative min-h-[calc(100vh-4.5rem)] p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-10">
      <BackgroundBeams />

      {/* Header */}
      <div className="relative z-10 text-center max-w-2xl mx-auto space-y-3 pt-6">
        <div className="flex justify-center">
          <HoverBorderGradient
            as="div"
            className="text-xs font-bold uppercase tracking-wider text-[#D43F00] py-1 px-3.5 flex items-center gap-1.5"
          >
            <span className="text-[#FF4F00] font-black">_</span>
            <span>Curated Agent Directory</span>
          </HoverBorderGradient>
        </div>
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-heading text-3xl sm:text-5xl font-extrabold text-[#201515] tracking-tight"
        >
          Explore AI Agents
        </motion.h1>
        <p className="text-sm text-[#5C524C]">
          Select specialized agents for code refactoring, query optimization, copywriting, and schema validation. Pay per run.
        </p>
      </div>

      {/* Search and Filters Bar */}
      <div className="relative z-10 space-y-4 max-w-4xl mx-auto w-full">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* Search bar */}
          <div className="relative w-full sm:flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#887E78]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search agents by name, task, or keyword..."
              className="w-full pl-11 pr-16 py-3.5 bg-white border border-[#D5CBC0] rounded-full text-sm text-[#201515] placeholder-[#9C9087] outline-none focus:border-[#FF4F00] focus:ring-2 focus:ring-[#FF4F00]/20 transition-all shadow-xs"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-[#887E78] hover:text-[#201515] cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Category Pills with animated spring layoutId */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none justify-center">
          <SlidersHorizontal className="w-4 h-4 text-[#887E78] shrink-0 mr-1" />
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={cn(
                  "relative px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors duration-200 cursor-pointer z-10",
                  isSelected
                    ? "text-[#FFFDF9]"
                    : "text-[#5C524C] hover:text-[#201515]"
                )}
              >
                {isSelected && (
                  <motion.div
                    layoutId="categoryPill"
                    className="absolute inset-0 bg-[#201515] rounded-full z-[-1] shadow-xs"
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                )}
                {!isSelected && (
                  <div className="absolute inset-0 bg-white border border-[#EAE3D9] rounded-full z-[-2]" />
                )}
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Agents Grid */}
      <div className="relative z-10">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="h-64 rounded-2xl border border-[#EAE3D9] bg-white animate-pulse"
              />
            ))}
          </div>
        ) : filteredAgents.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-16 text-center space-y-4 rounded-3xl border border-[#EAE3D9] bg-white shadow-xs max-w-lg mx-auto"
          >
            <Bot className="w-10 h-10 text-[#887E78] mx-auto" />
            <h3 className="font-heading text-lg font-bold text-[#201515]">No matching agents found</h3>
            <p className="text-xs text-[#5C524C] max-w-sm mx-auto">
              Try adjusting your search query or choosing another category.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setSelectedCategory("All");
              }}
              className="btn-zap-secondary text-xs px-4 py-2"
            >
              Reset Filters
            </button>
          </motion.div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredAgents.map((agent) => (
              <motion.div key={agent.id} variants={cardVariants}>
                <AgentCard
                  id={agent.id}
                  name={agent.name}
                  description={agent.description}
                  creditCost={agent.creditCost}
                  category={agent.category}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
