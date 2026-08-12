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
import { ThemeToggle } from "@/components/theme-toggle";

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
    { href: "/reports", label: "Report Issue", icon: FilePlus, color: "text-primary" },
    { href: "/verify", label: "Verification", icon: CheckCircle2, color: "text-primary-light" },
    { href: "/ds-console", label: "DS Console", icon: Building2, color: "text-accent" },
    { href: "/dashboard", label: "Dashboard", icon: BarChart3, color: "text-primary" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/70 backdrop-blur-md transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-primary-light p-0.5 shadow-lg shadow-primary/10 group-hover:scale-105 transition-transform duration-300">
            <div className="w-full h-full bg-background rounded-[10px] flex items-center justify-center">
              <ShieldAlert className="w-5 h-5 text-primary" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-lg tracking-tight text-foreground flex items-center gap-1">
              CivicPulse <span className="text-primary font-extrabold">LK</span>
            </span>
            <span className="text-[10px] text-muted tracking-wider font-mono uppercase">
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
                    ? "bg-surface border-border text-foreground font-semibold shadow-sm"
                    : "border-transparent text-muted hover:text-foreground hover:bg-surface/60"
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
          <ThemeToggle />
          {/* Language Switcher Dropdown */}
          <div className="relative group">
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border bg-surface/60 text-muted text-xs font-semibold hover:border-slate-700 hover:text-foreground transition-all duration-300">
              <Globe className="w-3.5 h-3.5 text-muted" />
              <span>{currentLang}</span>
              <ChevronDown className="w-3 h-3 text-muted group-hover:text-foreground transition-transform duration-300 group-hover:rotate-180" />
            </button>
<<<<<<< HEAD
            <div className="absolute right-0 mt-1.5 w-32 py-1 bg-surface border border-border rounded-2xl shadow-2xl opacity-0 scale-95 origin-top-right group-hover:opacity-100 group-hover:scale-100 transition-all duration-300 pointer-events-none group-hover:pointer-events-auto backdrop-blur-xl z-50">
=======
            <div className="absolute right-0 mt-1.5 w-32 py-1 bg-slate-900/95 border border-slate-800 rounded-2xl shadow-2xl opacity-0 scale-95 origin-top-right group-hover:opacity-100 group-hover:scale-100 transition-all duration-300 pointer-events-none group-hover:pointer-events-auto backdrop-blur-xl z-50">
>>>>>>> 7548f6d (Update CivicPulse development features)
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => setCurrentLang(lang.code)}
                  className={`w-full px-3.5 py-2 text-left text-xs flex items-center justify-between hover:bg-surface-hover transition-colors ${
                    currentLang === lang.code
                      ? "text-primary font-bold"
                      : "text-muted"
                  }`}
                >
                  <span>{lang.label}</span>
                  {currentLang === lang.code && (
<<<<<<< HEAD
                    <span className="w-1.5 h-1.5 rounded-full bg-primary shadow-md shadow-primary/50" />
=======
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-md shadow-emerald-500" />
>>>>>>> 7548f6d (Update CivicPulse development features)
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
                    avatarBox: "w-9 h-9 border-2 border-primary/20 hover:border-primary transition-all duration-300 shadow-md shadow-primary/5",
                  },
                }}
              />
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/sign-in"
<<<<<<< HEAD
                className="text-xs font-semibold text-muted hover:text-foreground px-3 py-2 rounded-xl transition-all duration-300"
=======
                className="text-xs font-semibold text-slate-300 hover:text-white px-3 py-2 rounded-xl transition-all duration-300"
>>>>>>> 7548f6d (Update CivicPulse development features)
              >
                Sign In
              </Link>
              <Link
                href="/sign-up"
                className="inline-flex items-center gap-1.5 text-xs font-bold bg-primary hover:bg-primary-light text-foreground px-4 py-2 rounded-xl transition-all duration-300 shadow-lg shadow-primary/10 hover:shadow-primary/25 active:scale-95"
              >
                Get Started
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Toggle Button */}
        <div className="flex md:hidden items-center gap-3">
          <ThemeToggle />
          {isSignedIn && (
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "w-8 h-8 border border-primary/20",
                },
              }}
            />
          )}

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-muted hover:text-foreground hover:bg-surface border border-transparent hover:border-border rounded-xl transition-all duration-300"
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
<<<<<<< HEAD
        <div className="md:hidden border-b border-border bg-background/95 backdrop-blur-2xl px-4 py-4 space-y-4 animate-fade-in z-50 relative">
=======
        <div className="md:hidden border-b border-slate-800 bg-[#0a0f1a]/95 backdrop-blur-2xl px-4 py-4 space-y-4 animate-fade-in z-50 relative">
>>>>>>> 7548f6d (Update CivicPulse development features)
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
                      ? "bg-surface border-border text-foreground"
                      : "border-transparent text-muted hover:bg-surface/60 hover:text-foreground"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${link.color}`} />
                  {link.label}
                </Link>
              );
            })}
          </div>

<<<<<<< HEAD
          <div className="pt-4 border-t border-border flex items-center justify-between">
=======
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
>>>>>>> 7548f6d (Update CivicPulse development features)
            <div className="flex gap-1.5">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => setCurrentLang(lang.code)}
                  className={`px-3 py-1.5 text-xs rounded-xl border font-bold transition-all duration-300 ${
                    currentLang === lang.code
<<<<<<< HEAD
                      ? "border-primary/30 bg-primary/10 text-primary"
                      : "border-border bg-surface/60 text-muted hover:border-border-hover"
=======
                      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                      : "border-slate-800 bg-slate-900/45 text-slate-400 hover:border-slate-700"
>>>>>>> 7548f6d (Update CivicPulse development features)
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
                className="text-xs text-primary font-bold hover:underline py-1.5"
              >
                Sign In â†’
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}






