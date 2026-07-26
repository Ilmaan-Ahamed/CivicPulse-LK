"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { UserButton, useAuth } from "@clerk/nextjs";
import {
  ShieldAlert,
  FilePlus,
  CheckCircle2,
  Building2,
  BarChart3,
  Menu,
  X,
  Globe,
  ArrowRight,
  ChevronDown,
} from "lucide-react";

export function Navbar() {
  const pathname = usePathname();
  const { isSignedIn } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState<"EN" | "SI" | "TA">("EN");

  const languages = [
    { code: "EN", label: "English" },
    { code: "SI", label: "සිංහල" },
    { code: "TA", label: "தமிழ்" },
  ] as const;

  const isActive = (path: string) => {
    if (path === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(path);
  };

  const navLinks = [
    { href: "/reports", label: "Report Issue", icon: FilePlus, color: "text-emerald-400" },
    { href: "/verify", label: "Verification", icon: CheckCircle2, color: "text-teal-400" },
    { href: "/ds-console", label: "DS Console", icon: Building2, color: "text-indigo-400" },
    { href: "/dashboard", label: "Dashboard", icon: BarChart3, color: "text-amber-400" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800/40 bg-[#0a0f1a]/70 backdrop-blur-md transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 shadow-lg shadow-emerald-500/10 group-hover:scale-105 transition-transform duration-300">
            <div className="w-full h-full bg-[#0a0f1a] rounded-[10px] flex items-center justify-center">
              <ShieldAlert className="w-5 h-5 text-emerald-400" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-lg tracking-tight text-white flex items-center gap-1">
              CivicPulse <span className="text-emerald-400 font-extrabold">LK</span>
            </span>
            <span className="text-[10px] text-slate-400 tracking-wider font-mono uppercase">
              Sri Lanka Infrastructure
            </span>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-1.5 text-sm font-medium">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-2 rounded-xl flex items-center gap-2 border transition-all duration-300 ${
                  active
                    ? "bg-slate-900/60 border-slate-800 text-white font-semibold shadow-sm"
                    : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/40"
                }`}
              >
                <Icon className={`w-4 h-4 ${link.color} ${active ? "opacity-100" : "opacity-80 group-hover:opacity-100"}`} />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right Action Menu */}
        <div className="hidden md:flex items-center gap-4">
          {/* Language Switcher Dropdown */}
          <div className="relative group">
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-800/80 bg-slate-900/40 text-slate-300 text-xs font-semibold hover:border-slate-700 hover:text-white transition-all duration-300">
              <Globe className="w-3.5 h-3.5 text-slate-400" />
              <span>{currentLang}</span>
              <ChevronDown className="w-3 h-3 text-slate-500 group-hover:text-slate-300 transition-transform duration-300 group-hover:rotate-180" />
            </button>
            <div className="absolute right-0 mt-1.5 w-32 py-1 bg-slate-900/95 border border-slate-850 rounded-2xl shadow-2xl opacity-0 scale-95 origin-top-right group-hover:opacity-100 group-hover:scale-100 transition-all duration-300 pointer-events-none group-hover:pointer-events-auto backdrop-blur-xl z-50">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => setCurrentLang(lang.code)}
                  className={`w-full px-3.5 py-2 text-left text-xs flex items-center justify-between hover:bg-slate-800/80 transition-colors ${
                    currentLang === lang.code
                      ? "text-emerald-400 font-bold"
                      : "text-slate-300"
                  }`}
                >
                  <span>{lang.label}</span>
                  {currentLang === lang.code && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-md shadow-emerald-450" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {isSignedIn ? (
            <div className="pl-1">
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: "w-9 h-9 border-2 border-emerald-500/20 hover:border-emerald-400 transition-all duration-300 shadow-md shadow-emerald-500/5",
                  },
                }}
              />
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/sign-in"
                className="text-xs font-semibold text-slate-350 hover:text-white px-3 py-2 rounded-xl transition-all duration-300"
              >
                Sign In
              </Link>
              <Link
                href="/sign-up"
                className="inline-flex items-center gap-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl transition-all duration-300 shadow-lg shadow-emerald-600/10 hover:shadow-emerald-500/25 active:scale-95"
              >
                Get Started
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Toggle Button */}
        <div className="flex md:hidden items-center gap-3">
          {isSignedIn && (
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "w-8 h-8 border border-emerald-500/20",
                },
              }}
            />
          )}

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-900/60 border border-transparent hover:border-slate-800 rounded-xl transition-all duration-300"
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-850 bg-[#0a0f1a]/95 backdrop-blur-2xl px-4 py-4 space-y-4 animate-fade-in z-50 relative">
          <div className="space-y-1.5">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-semibold border transition-all duration-300 ${
                    active
                      ? "bg-slate-900 border-slate-800 text-white"
                      : "border-transparent text-slate-400 hover:bg-slate-900/40 hover:text-slate-200"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${link.color}`} />
                  {link.label}
                </Link>
              );
            })}
          </div>

          <div className="pt-4 border-t border-slate-850 flex items-center justify-between">
            <div className="flex gap-1.5">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => setCurrentLang(lang.code)}
                  className={`px-3 py-1.5 text-xs rounded-xl border font-bold transition-all duration-305 ${
                    currentLang === lang.code
                      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                      : "border-slate-850 bg-slate-900/45 text-slate-450 hover:border-slate-700"
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>

            {!isSignedIn && (
              <Link
                href="/sign-in"
                onClick={() => setMobileMenuOpen(false)}
                className="text-xs text-emerald-400 font-bold hover:underline py-1.5"
              >
                Sign In →
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
