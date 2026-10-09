"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sparkles, Bot, Layers, Zap, LayoutDashboard, Shield, LogOut, Menu, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import CreditChip from "@/components/CreditChip";
import { cn } from "@/lib/utils";

export default function Navbar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: "Marketplace", href: "/agents", icon: Bot },
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Jobs", href: "/jobs", icon: Layers },
    { label: "Credits", href: "/credits", icon: Zap },
  ];

  if (user?.role === "admin" || !user) {
    navLinks.push({ label: "Admin", href: "/admin", icon: Shield });
  }

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-xl bg-gray-950/75 border-b border-white/[0.08] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-violet-600/30 group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-white text-base tracking-tight group-hover:text-violet-300 transition-colors">
              AI Marketplace
            </span>
            <span className="text-[10px] text-violet-400 font-mono -mt-1 tracking-wider uppercase">
              Autonomous
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1 bg-white/[0.03] border border-white/[0.07] px-3 py-1.5 rounded-full">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200",
                  isActive
                    ? "bg-violet-600/20 text-violet-300 border border-violet-500/30 shadow-[0_0_12px_-2px_rgba(139,92,246,0.3)]"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                )}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right CTA / Auth */}
        <div className="hidden sm:flex items-center gap-3">
          <CreditChip />

          {user ? (
            <div className="flex items-center gap-2.5 pl-2 border-l border-white/10">
              <span className="text-xs text-gray-400 max-w-[130px] truncate" title={user.email}>
                {user.email}
              </span>
              <button
                type="button"
                onClick={() => logout()}
                className="p-1.5 text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                title="Log out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="text-xs font-medium text-gray-300 hover:text-white px-3 py-2 rounded-lg transition-colors"
              >
                Sign in
              </Link>
              <Link
                href="/register"
                className="text-xs font-semibold bg-violet-600 hover:bg-violet-500 text-white px-4 py-2 rounded-xl transition-all shadow-md shadow-violet-600/20 hover:shadow-violet-600/40"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu trigger */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 text-gray-400 hover:text-white rounded-lg focus:outline-none"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile menu drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden px-4 pt-2 pb-6 space-y-2 bg-gray-950/95 border-b border-white/10 backdrop-blur-2xl">
          <div className="py-2">
            <CreditChip />
          </div>
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium",
                  isActive
                    ? "bg-violet-600/20 text-violet-300 border border-violet-500/30"
                    : "text-gray-300 hover:text-white hover:bg-white/5"
                )}
              >
                <Icon className="w-4 h-4" />
                <span>{link.label}</span>
              </Link>
            );
          })}

          <div className="pt-4 border-t border-white/10 flex flex-col gap-2">
            {user ? (
              <button
                type="button"
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                }}
                className="flex items-center gap-2 text-rose-400 text-sm px-3 py-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout ({user.email})</span>
              </button>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-sm text-gray-300 px-3 py-2"
                >
                  Sign in
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center text-sm font-semibold bg-violet-600 text-white px-4 py-2.5 rounded-xl"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
