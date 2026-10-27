"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Bot, Layers, Zap, LayoutDashboard, Shield, LogOut, Menu, X, ArrowRight, User } from "lucide-react";
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
    <header className="sticky top-0 z-50 w-full backdrop-blur-xl bg-[#FFFDF9]/90 border-b border-[#EAE3D9] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        {/* Zapier-style Brand with signature orange foundation bar */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex items-center">
            {/* The exact Zapier foundation block */}
            <span className="w-5 h-1.5 bg-[#ff4f00] rounded-[1px] mr-1.5 self-end mb-1.5 group-hover:scale-x-110 transition-transform origin-left" />
            <span className="font-display font-medium text-[#201515] text-2xl tracking-tight">
              agent<span className="text-[#ff4f00]">flow</span>
            </span>
          </div>
          <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-[#fff2eb] text-[#ff4f00] border border-[#ffd6c2] rounded-full">
            Autonomous
          </span>
        </Link>

        {/* Desktop Navigation with Aceternity animated indicator pill */}
        <nav className="hidden md:flex items-center gap-1 bg-[#FAF5EE] border border-[#EAE3D9] p-1 rounded-full shadow-xs relative">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "relative flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold transition-colors duration-200 z-10",
                  isActive
                    ? "text-[#FFFDF9]"
                    : "text-[#5C524C] hover:text-[#201515]"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeNavPill"
                    className="absolute inset-0 bg-[#201515] rounded-full z-[-1] shadow-xs"
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                )}
                <Icon className={cn("w-3.5 h-3.5", isActive ? "text-[#FF4F00]" : "text-[#887E78]")} />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right CTA / Auth */}
        <div className="hidden sm:flex items-center gap-3">
          <CreditChip />

          {user ? (
            <div className="flex items-center gap-2 pl-2 border-l border-[#EAE3D9]">
              <Link
                href="/profile"
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-full hover:bg-[#FAF5EE] border border-transparent hover:border-[#EAE3D9] transition-all group"
                title="View Profile & Settings"
              >
                <div className="w-6 h-6 rounded-full bg-[#201515] text-white flex items-center justify-center font-bold text-[11px] group-hover:scale-105 transition-transform">
                  {user.email ? user.email[0].toUpperCase() : "U"}
                </div>
                <span className="text-xs font-semibold text-[#5C524C] group-hover:text-[#201515] max-w-[120px] truncate">
                  {user.email.split("@")[0]}
                </span>
              </Link>
              <button
                type="button"
                onClick={() => logout()}
                className="p-1.5 text-[#887E78] hover:text-[#BE123C] hover:bg-[#FFF1F2] rounded-full transition-colors cursor-pointer"
                title="Log out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="text-xs font-semibold text-[#5C524C] hover:text-[#201515] px-3.5 py-2 rounded-full hover:bg-[#FAF5EE] transition-colors"
              >
                Log in
              </Link>
              <Link
                href="/register"
                className="btn-zap-primary text-xs py-2 px-4 font-semibold"
              >
                <span>Get Started Free</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu trigger */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 text-[#5C524C] hover:text-[#201515] rounded-xl hover:bg-[#FAF5EE] focus:outline-none"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile menu drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden px-4 pt-3 pb-6 space-y-2 bg-[#FFFDF9] border-b border-[#EAE3D9] shadow-lg">
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
                  "flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold",
                  isActive
                    ? "bg-[#201515] text-[#FFFDF9]"
                    : "text-[#5C524C] hover:text-[#201515] hover:bg-[#FAF5EE]"
                )}
              >
                <Icon className={cn("w-4 h-4", isActive ? "text-[#FF4F00]" : "text-[#887E78]")} />
                <span>{link.label}</span>
              </Link>
            );
          })}

          <div className="pt-4 border-t border-[#EAE3D9] flex flex-col gap-2">
            {user ? (
              <>
                <Link
                  href="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 text-sm px-3.5 py-2 hover:bg-[#FAF5EE] rounded-xl font-semibold text-[#201515]"
                >
                  <User className="w-4 h-4 text-[#FF4F00]" />
                  <span>Profile & Settings</span>
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-2 text-[#BE123C] text-sm px-3.5 py-2 hover:bg-[#FFF1F2] rounded-xl font-medium"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout ({user.email})</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-sm font-semibold text-[#5C524C] px-3.5 py-2 hover:bg-[#FAF5EE] rounded-xl"
                >
                  Log in
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="btn-zap-primary text-center text-sm py-2.5 rounded-full"
                >
                  Get Started Free
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
