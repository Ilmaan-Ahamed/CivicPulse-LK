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
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="group flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-linear-to-tr from-primary to-primary-light p-0.5 shadow-lg shadow-primary/10 transition-transform duration-300 group-hover:scale-105">
            <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-background">
              <ShieldAlert className="h-5 w-5 text-primary" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="flex items-center gap-1 text-lg font-bold tracking-tight text-foreground">
              CivicPulse <span className="font-extrabold text-primary">LK</span>
            </span>
            <span className="font-mono text-[10px] uppercase tracking-wider text-muted">
              Sri Lanka Infrastructure
            </span>
          </div>
        </Link>

        <nav className="hidden items-center gap-1.5 text-sm font-medium md:flex">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.href);

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-2 rounded-xl border px-3 py-2 transition-all duration-300 ${
                  active
                    ? "border-border bg-surface text-foreground font-semibold shadow-sm"
                    : "border-transparent text-muted hover:bg-surface/60 hover:text-foreground"
                }`}
              >
                <Icon
                  className={`h-4 w-4 ${link.color} ${active ? "opacity-100" : "opacity-80"}`}
                />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-4 md:flex">
          <ThemeToggle />

          <div className="group relative">
            <button className="flex items-center gap-1.5 rounded-xl border border-border bg-surface/60 px-3 py-1.5 text-xs font-semibold text-muted transition-all duration-300 hover:border-slate-700 hover:text-foreground">
              <Globe className="h-3.5 w-3.5 text-muted" />
              <span>{currentLang}</span>
              <ChevronDown className="h-3 w-3 text-muted transition-transform duration-300 group-hover:rotate-180 group-hover:text-foreground" />
            </button>

            <div className="pointer-events-none absolute right-0 z-50 mt-1.5 w-32 origin-top-right scale-95 rounded-2xl border border-border bg-surface py-1 opacity-0 shadow-2xl transition-all duration-300 group-hover:pointer-events-auto group-hover:scale-100 group-hover:opacity-100 backdrop-blur-xl">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => setCurrentLang(lang.code)}
                  className={`flex w-full items-center justify-between px-3.5 py-2 text-left text-xs transition-colors hover:bg-surface-hover ${
                    currentLang === lang.code ? "font-bold text-primary" : "text-muted"
                  }`}
                >
                  <span>{lang.label}</span>
                  {currentLang === lang.code && (
                    <span className="h-1.5 w-1.5 rounded-full bg-primary shadow-md shadow-primary/50" />
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
                    avatarBox:
                      "h-9 w-9 border-2 border-primary/20 shadow-md shadow-primary/5 transition-all duration-300 hover:border-primary",
                  },
                }}
              />
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/sign-in"
                className="rounded-xl px-3 py-2 text-xs font-semibold text-muted transition-all duration-300 hover:text-foreground"
              >
                Sign In
              </Link>
              <Link
                href="/sign-up"
                className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-foreground shadow-lg shadow-primary/10 transition-all duration-300 hover:bg-primary-light hover:shadow-primary/25 active:scale-95"
              >
                Get Started
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 md:hidden">
          <ThemeToggle />
          {isSignedIn && (
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "h-8 w-8 border border-primary/20",
                },
              }}
            />
          )}

          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-xl border border-transparent p-2 text-muted transition-all duration-300 hover:border-border hover:bg-surface hover:text-foreground"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="relative z-50 border-b border-border bg-background/95 px-4 py-4 backdrop-blur-2xl md:hidden">
          <div className="space-y-1.5">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.href);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 rounded-xl border px-3.5 py-3 text-sm font-semibold transition-all duration-300 ${
                    active
                      ? "border-border bg-surface text-foreground"
                      : "border-transparent text-muted hover:bg-surface/60 hover:text-foreground"
                  }`}
                >
                  <Icon className={`h-4 w-4 ${link.color}`} />
                  {link.label}
                </Link>
              );
            })}
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
            <div className="flex gap-1.5">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => setCurrentLang(lang.code)}
                  className={`rounded-xl border px-3 py-1.5 text-xs font-bold transition-all duration-300 ${
                    currentLang === lang.code
                      ? "border-primary/30 bg-primary/10 text-primary"
                      : "border-border bg-surface/60 text-muted hover:border-border-hover"
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
                className="py-1.5 text-xs font-bold text-primary hover:underline"
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


