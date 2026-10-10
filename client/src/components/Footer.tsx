"use client";

import React from "react";
import Link from "next/link";
import { Sparkles, Terminal } from "lucide-react";

function GithubIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  );
}

function TwitterIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

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
              <a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors" aria-label="GitHub">
                <GithubIcon className="w-4 h-4" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors" aria-label="Twitter">
                <TwitterIcon className="w-4 h-4" />
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
