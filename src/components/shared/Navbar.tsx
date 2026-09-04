"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Shield,
  PlusCircle,
  Globe,
  Sun,
  Moon,
  LayoutDashboard,
  Map,
  Menu,
  X,
  LogIn,
  LogOut,
  User,
  UserCheck,
  ChevronDown,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { useAuth } from "@/lib/auth/AuthContext";
import { useTheme } from "@/lib/theme/ThemeContext";
import { RoleBadge } from "@/components/ui/RoleBadge";
import { Language } from "@/lib/i18n/translations";

export function Navbar() {
  const pathname = usePathname();
  const { language, setLanguage, t } = useLanguage();
  const { currentRole, currentUser, isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const getDashboardPath = (role: string) => {
    switch (role) {
      case "NGO_PARTNER":
        return "/dashboard/ngo";
      case "DS_OFFICER":
        return "/dashboard/ds-officer";
      case "ADMIN":
        return "/dashboard/admin";
      case "CITIZEN":
      default:
        return "/dashboard/citizen";
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#E8D5B5] dark:border-[#FF8C00] bg-[#FDF6E3]/90 dark:bg-black/90 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-9 h-9 rounded-xl bg-[#F97316] dark:bg-[#FF8C00] text-white flex items-center justify-center shadow-lg shadow-orange-600/20 group-hover:scale-105 transition-transform">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <span className="text-lg font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-1">
              CivicPulse <span className="text-[#F97316] dark:text-[#FF8C00] font-mono text-sm">LK</span>
            </span>
            <span className="text-[10px] text-slate-500 dark:text-[#B0B0B0] font-medium block -mt-1">
              Sri Lanka Civic Tech
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-6">
          <Link
            href="/"
            className={`text-xs font-semibold transition-colors ${
              pathname === "/"
                ? "text-orange-600 dark:text-orange-400"
                : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            {t("nav.home")}
          </Link>
          <Link
            href="/transparency"
            className={`text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              pathname === "/transparency"
                ? "text-orange-600 dark:text-orange-400"
                : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Map className="w-3.5 h-3.5" />
            <span>{t("nav.transparency")}</span>
          </Link>
          {isAuthenticated && (
            <Link
              href={getDashboardPath(currentRole)}
              className={`text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                pathname.startsWith("/dashboard")
                  ? "text-orange-600 dark:text-orange-400"
                  : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>{t("nav.dashboard")}</span>
            </Link>
          )}
        </nav>

        {/* Right Action Items */}
        <div className="hidden md:flex items-center gap-3">
          {/* Primary CTA - Report an Issue */}
          {isAuthenticated && (
            <Link
              href="/dashboard/citizen/report"
              className="btn-primary-orange px-3.5 py-1.5 text-xs flex items-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{t("nav.reportIssue")}</span>
            </Link>
          )}

          {/* Language Switcher Dropdown */}
          <div className="relative group">
            <button className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold flex items-center gap-1">
              <Globe className="w-4 h-4 text-orange-600 dark:text-orange-400" />
              <span className="uppercase">{language}</span>
            </button>
            <div className="absolute right-0 mt-1 w-32 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl p-1 hidden group-hover:block z-50">
              {(["en", "si", "ta"] as Language[]).map((lang) => (
                <button
                  key={lang}
                  onClick={() => setLanguage(lang)}
                  className={`w-full text-left px-3 py-1.5 text-xs rounded-lg font-medium transition-colors ${
                    language === lang
                      ? "bg-orange-50 dark:bg-orange-950/60 text-orange-600 dark:text-orange-300 font-bold"
                      : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                >
                  {lang === "en" ? "English" : lang === "si" ? "සිංහල" : "தமிழ்"}
                </button>
              ))}
            </div>
          </div>

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl bg-[#FDEEDC] dark:bg-[#111111] text-[#F97316] dark:text-[#FF8C00] hover:bg-[#FFE4C4] dark:hover:bg-[#1a1a1a] border border-[#E8D5B5] dark:border-[#FF8C00]/30 transition-colors flex items-center gap-1.5"
            title={`Switch to ${theme === "dark" ? "Light Mode" : "Dark Mode"}`}
          >
            {theme === "dark" ? (
              <>
                <Sun className="w-4 h-4 text-[#FF8C00]" />
                <span className="text-[11px] font-bold text-[#FF8C00] hidden xl:inline">Dark</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-[#F97316]" />
                <span className="text-[11px] font-bold text-[#F97316] hidden xl:inline">Light</span>
              </>
            )}
          </button>

          {/* Auth State: Sign In / User Menu */}
          {isAuthenticated ? (
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                  {currentUser.name.charAt(0).toUpperCase()}
                </div>
                <div className="hidden lg:block text-left">
                  <p className="text-xs font-semibold text-slate-800 dark:text-white leading-none">{currentUser.name}</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-none mt-0.5">{currentUser.email}</p>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {userMenuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl p-2 z-50">
                    <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 mb-1">
                      <p className="text-xs font-bold text-slate-800 dark:text-white">{currentUser.name}</p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">{currentUser.email}</p>
                      <div className="mt-1">
                        <RoleBadge role={currentRole} />
                      </div>
                    </div>
                    <Link
                      href={getDashboardPath(currentRole)}
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2 w-full px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                    >
                      <LayoutDashboard className="w-3.5 h-3.5" />
                      <span>{t("nav.dashboard")}</span>
                    </Link>
                    <Link
                      href="/select-role"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2 w-full px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                    >
                      <UserCheck className="w-3.5 h-3.5 text-[#F97316] dark:text-[#FF8C00]" />
                      <span>{t("nav.switchRole")}</span>
                    </Link>
                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        logout();
                      }}
                      className="flex items-center gap-2 w-full px-3 py-2 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>{t("nav.signOut")}</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="btn-primary-orange px-4 py-2 text-xs flex items-center gap-1.5"
            >
              <LogIn className="w-4 h-4" />
              <span>{t("nav.signIn")}</span>
            </Link>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="flex md:hidden items-center gap-2">
          {isAuthenticated ? (
            <Link
              href="/dashboard/citizen/report"
              className="btn-primary-orange p-2 text-xs"
            >
              <PlusCircle className="w-4 h-4" />
            </Link>
          ) : (
            <Link
              href="/login"
              className="btn-primary-orange p-2 text-xs"
            >
              <LogIn className="w-4 h-4" />
            </Link>
          )}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-[#333333] bg-white dark:bg-black p-4 space-y-3">
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-semibold text-slate-800 dark:text-slate-200"
          >
            {t("nav.home")}
          </Link>
          <Link
            href="/transparency"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-semibold text-slate-800 dark:text-slate-200"
          >
            {t("nav.transparency")}
          </Link>
          {isAuthenticated && (
            <Link
              href={getDashboardPath(currentRole)}
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-semibold text-slate-800 dark:text-slate-200"
            >
              {t("nav.dashboard")}
            </Link>
          )}

          {/* Auth section in mobile */}
          {isAuthenticated ? (
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center text-white text-xs font-bold">
                  {currentUser.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800 dark:text-white">{currentUser.name}</p>
                  <RoleBadge role={currentRole} />
                </div>
              </div>
              <Link
                href="/select-role"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 w-full px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800/80 rounded-lg mb-2"
              >
                <UserCheck className="w-3.5 h-3.5 text-[#F97316] dark:text-[#FF8C00]" />
                <span>{t("nav.switchRole")}</span>
              </Link>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  logout();
                }}
                className="flex items-center gap-2 w-full px-3 py-2 text-xs font-semibold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/20 rounded-lg"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>{t("nav.signOut")}</span>
              </button>
            </div>
          ) : (
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="btn-glass-orange-solid flex items-center gap-2 w-full px-3 py-2 text-xs justify-center"
              >
                <LogIn className="w-4 h-4" />
                <span>{t("nav.signIn")}</span>
              </Link>
            </div>
          )}

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-orange-500" />
              {(["en", "si", "ta"] as Language[]).map((lang) => (
                <button
                  key={lang}
                  onClick={() => setLanguage(lang)}
                  className={`px-2 py-1 text-xs rounded font-bold uppercase ${
                    language === lang ? "bg-orange-600 text-white" : "bg-slate-200 dark:bg-slate-800"
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-slate-100 dark:bg-[#111111] text-slate-700 dark:text-[#FF8C00] flex items-center gap-1 border border-transparent dark:border-[#FF8C00]/30"
              title="Toggle theme"
            >
              {theme === "dark" ? (
                <>
                  <Sun className="w-4 h-4 text-[#FF8C00]" />
                  <span className="text-[10px] font-bold">Dark</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-slate-700" />
                  <span className="text-[10px] font-bold">Light</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
