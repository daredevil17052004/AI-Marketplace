"use client";

import React from "react";
import Link from "next/link";
import { Sparkles, Github, Twitter, Terminal } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-white/[0.08] bg-gray-950/80 backdrop-blur-md mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Col 1 */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-white text-base">AI Marketplace</span>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed max-w-xs">
              Execute production-grade AI agents via dynamic schema forms. Powered by Next.js, Lenis, and modern autonomous architectures.
            </p>
            <div className="flex items-center gap-3 text-gray-400 pt-2">
              <a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">
                <Github className="w-4 h-4" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">
                <Twitter className="w-4 h-4" />
              </a>
              <span className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                <Terminal className="w-3 h-3" /> API Online
              </span>
            </div>
          </div>

          {/* Col 2 */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider">Explore</h4>
            <ul className="space-y-2 text-xs text-gray-400">
              <li>
                <Link href="/agents" className="hover:text-violet-400 transition-colors">
                  Agent Marketplace
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-violet-400 transition-colors">
                  User Dashboard
                </Link>
              </li>
              <li>
                <Link href="/jobs" className="hover:text-violet-400 transition-colors">
                  Job History & Outputs
                </Link>
              </li>
              <li>
                <Link href="/credits" className="hover:text-violet-400 transition-colors">
                  Credits & Billing
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3 */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider">Developers</h4>
            <ul className="space-y-2 text-xs text-gray-400">
              <li>
                <Link href="/admin" className="hover:text-violet-400 transition-colors">
                  Admin Studio
                </Link>
              </li>
              <li>
                <Link href="/admin/agents/new" className="hover:text-violet-400 transition-colors">
                  Publish New Agent
                </Link>
              </li>
              <li>
                <a href="#schema" className="hover:text-violet-400 transition-colors">
                  Dynamic JSON Schema Spec
                </a>
              </li>
              <li>
                <a href="/health" className="hover:text-violet-400 transition-colors">
                  System Healthcheck
                </a>
              </li>
            </ul>
          </div>

          {/* Col 4 */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider">Account</h4>
            <ul className="space-y-2 text-xs text-gray-400">
              <li>
                <Link href="/login" className="hover:text-violet-400 transition-colors">
                  Sign In
                </Link>
              </li>
              <li>
                <Link href="/register" className="hover:text-violet-400 transition-colors">
                  Create Free Account
                </Link>
              </li>
              <li>
                <span className="text-violet-400">⚡ 50 Free Signup Credits</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/[0.05] pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 gap-4">
          <p>© {new Date().getFullYear()} AI Marketplace. Built with Next.js, Lenis & Aceternity UI.</p>
          <div className="flex gap-6">
            <span className="hover:text-gray-400 transition-colors">Privacy Policy</span>
            <span className="hover:text-gray-400 transition-colors">Terms of Service</span>
            <span className="hover:text-gray-400 transition-colors">Security</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
