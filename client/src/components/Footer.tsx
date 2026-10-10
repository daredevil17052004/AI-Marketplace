"use client";

import React from "react";
import Link from "next/link";
import { Terminal, ArrowRight, ShieldCheck, Zap } from "lucide-react";

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
    <footer className="border-t border-[#EAE3D9] bg-[#FAF5EE] mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10 mb-14">
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center">
              <span className="w-5 h-1.5 bg-[#ff4f00] rounded-[1px] mr-1.5 self-end mb-1" />
              <span className="font-display font-medium text-[#201515] text-2xl tracking-tight">
                agent<span className="text-[#ff4f00]">flow</span>
              </span>
            </div>
            <p className="text-sm text-[#5C524C] leading-relaxed max-w-sm">
              Empowering builders, creators, and teams to automate mission-critical tasks with autonomous AI agents. Powered by Gemini 2.5, BullMQ, and Redis.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-full bg-white border border-[#EAE3D9] flex items-center justify-center text-[#5C524C] hover:text-[#201515] hover:border-[#D5CBC0] transition-colors"
                aria-label="GitHub"
              >
                <GithubIcon className="w-4 h-4" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-full bg-white border border-[#EAE3D9] flex items-center justify-center text-[#5C524C] hover:text-[#201515] hover:border-[#D5CBC0] transition-colors"
                aria-label="Twitter"
              >
                <TwitterIcon className="w-4 h-4" />
              </a>
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#047857] bg-[#ECFDF5] px-3 py-1 rounded-full border border-[#A7F3D0]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#059669] animate-pulse" />
                All Systems Operational
              </span>
            </div>
          </div>

          {/* Links 1 */}
          <div className="space-y-3">
            <h4 className="font-heading text-xs font-bold text-[#201515] uppercase tracking-wider">Product</h4>
            <ul className="space-y-2.5 text-sm text-[#5C524C]">
              <li>
                <Link href="/agents" className="hover:text-[#FF4F00] transition-colors">
                  Agent Marketplace
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-[#FF4F00] transition-colors">
                  Workspace Dashboard
                </Link>
              </li>
              <li>
                <Link href="/jobs" className="hover:text-[#FF4F00] transition-colors">
                  Live Job Feeds
                </Link>
              </li>
              <li>
                <Link href="/credits" className="hover:text-[#FF4F00] transition-colors">
                  Credit Top-Ups
                </Link>
              </li>
            </ul>
          </div>

          {/* Links 2 */}
          <div className="space-y-3">
            <h4 className="font-heading text-xs font-bold text-[#201515] uppercase tracking-wider">Agents</h4>
            <ul className="space-y-2.5 text-sm text-[#5C524C]">
              <li>
                <Link href="/agents" className="hover:text-[#FF4F00] transition-colors">
                  Code Refactoring
                </Link>
              </li>
              <li>
                <Link href="/agents" className="hover:text-[#FF4F00] transition-colors">
                  Text Summarization
                </Link>
              </li>
              <li>
                <Link href="/agents" className="hover:text-[#FF4F00] transition-colors">
                  SEO Copywriting
                </Link>
              </li>
              <li>
                <Link href="/agents" className="hover:text-[#FF4F00] transition-colors">
                  Regex & Schema
                </Link>
              </li>
            </ul>
          </div>

          {/* Links 3 */}
          <div className="space-y-3">
            <h4 className="font-heading text-xs font-bold text-[#201515] uppercase tracking-wider">Platform</h4>
            <ul className="space-y-2.5 text-sm text-[#5C524C]">
              <li>
                <Link href="/admin" className="hover:text-[#FF4F00] transition-colors">
                  Admin Console
                </Link>
              </li>
              <li>
                <a href="http://localhost:4000/health" target="_blank" rel="noreferrer" className="hover:text-[#FF4F00] transition-colors">
                  API Status
                </a>
              </li>
              <li>
                <a href="http://localhost:8081" target="_blank" rel="noreferrer" className="hover:text-[#FF4F00] transition-colors">
                  Database Adminer
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-[#EAE3D9] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#887E78]">
          <p>© {new Date().getFullYear()} agentflow. Built with Zapier design principles.</p>
          <div className="flex items-center gap-6">
            <span className="hover:text-[#201515] cursor-pointer">Privacy Policy</span>
            <span className="hover:text-[#201515] cursor-pointer">Terms of Service</span>
            <span className="hover:text-[#201515] cursor-pointer">Security</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
