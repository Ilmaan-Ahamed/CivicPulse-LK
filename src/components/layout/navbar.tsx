"use client";

import Link from "next/link";
import { useState } from "react";
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
} from "lucide-react";

export function Navbar() {
  const { isSignedIn } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState<"EN" | "SI" | "TA">("EN");

  const languages = [
    { code: "EN", label: "English" },
    { code: "SI", label: "සිංහල" },
    { code: "TA", label: "தமிழ்" },
  ] as const;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800/80 bg-[#0a0f1a]/80 backdrop-blur-xl transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 p-0.5 shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-[#0a0f1a] rounded-[10px] flex items-center justify-center">
              <ShieldAlert className="w-5 h-5 text-emerald-400" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-lg tracking-tight text-white flex items-center gap-1.5">
              CivicPulse <span className="text-emerald-400 font-extrabold">LK</span>
            </span>
            <span className="text-[10px] text-slate-400 tracking-wider font-mono uppercase">
              Sri Lanka Infrastructure
            </span>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-1 text-sm font-medium text-slate-300">
          <Link
            href="/reports"
            className="px-3 py-2 rounded-lg hover:text-white hover:bg-slate-800/60 transition-colors flex items-center gap-1.5"
          >
            <FilePlus className="w-4 h-4 text-emerald-400" />
            Report Issue
          </Link>
          <Link
            href="/verify"
            className="px-3 py-2 rounded-lg hover:text-white hover:bg-slate-800/60 transition-colors flex items-center gap-1.5"
          >
            <CheckCircle2 className="w-4 h-4 text-teal-400" />
            Community Verification
          </Link>
          <Link
            href="/ds-console"
            className="px-3 py-2 rounded-lg hover:text-white hover:bg-slate-800/60 transition-colors flex items-center gap-1.5"
          >
            <Building2 className="w-4 h-4 text-indigo-400" />
            DS Console
          </Link>
          <Link
            href="/dashboard"
            className="px-3 py-2 rounded-lg hover:text-white hover:bg-slate-800/60 transition-colors flex items-center gap-1.5"
          >
            <BarChart3 className="w-4 h-4 text-amber-400" />
            Public Dashboard
          </Link>
        </nav>

        {/* Right Action Menu */}
        <div className="hidden md:flex items-center gap-3">
          {/* Language Switcher Dropdown */}
          <div className="relative group">
            <button className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-800 bg-slate-900/60 text-slate-300 text-xs hover:border-slate-700 transition-colors">
              <Globe className="w-3.5 h-3.5 text-slate-400" />
              <span>{currentLang}</span>
            </button>
            <div className="absolute right-0 mt-1 w-28 py-1 bg-slate-900 border border-slate-800 rounded-xl shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none group-hover:pointer-events-auto">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => setCurrentLang(lang.code)}
                  className={`w-full px-3 py-1.5 text-left text-xs flex items-center justify-between hover:bg-slate-800 transition-colors ${
                    currentLang === lang.code
                      ? "text-emerald-400 font-semibold"
                      : "text-slate-300"
                  }`}
                >
                  {lang.label}
                  {currentLang === lang.code && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {isSignedIn ? (
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "w-9 h-9 border-2 border-emerald-500/30 hover:border-emerald-400 transition-colors",
                },
              }}
            />
          ) : (
            <>
              <Link
                href="/sign-in"
                className="text-xs font-semibold text-slate-300 hover:text-white px-3 py-2 rounded-lg hover:bg-slate-800/60 transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/sign-up"
                className="inline-flex items-center gap-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-2 rounded-lg transition-all shadow-md shadow-emerald-600/20"
              >
                Get Started
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Toggle Button */}
        <div className="flex md:hidden items-center gap-2">
          {isSignedIn && <UserButton />}

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-800 bg-[#0a0f1a]/95 backdrop-blur-2xl px-4 py-4 space-y-3">
          <Link
            href="/reports"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-300 hover:bg-slate-800 text-sm font-medium"
          >
            <FilePlus className="w-4 h-4 text-emerald-400" />
            Report Infrastructure Issue
          </Link>
          <Link
            href="/verify"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-300 hover:bg-slate-800 text-sm font-medium"
          >
            <CheckCircle2 className="w-4 h-4 text-teal-400" />
            Community Verification
          </Link>
          <Link
            href="/ds-console"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-300 hover:bg-slate-800 text-sm font-medium"
          >
            <Building2 className="w-4 h-4 text-indigo-400" />
            DS Office Console
          </Link>
          <Link
            href="/dashboard"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-300 hover:bg-slate-800 text-sm font-medium"
          >
            <BarChart3 className="w-4 h-4 text-amber-400" />
            Public Transparency Dashboard
          </Link>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
            <div className="flex gap-2">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => setCurrentLang(lang.code)}
                  className={`px-2.5 py-1 text-xs rounded-md border ${
                    currentLang === lang.code
                      ? "border-emerald-500 bg-emerald-500/10 text-emerald-400 font-semibold"
                      : "border-slate-800 text-slate-400"
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>

            {!isSignedIn && (
              <Link
                href="/sign-in"
                className="text-xs text-emerald-400 font-semibold hover:underline"
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
