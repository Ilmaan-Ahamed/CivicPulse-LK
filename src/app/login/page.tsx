"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Shield,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  LogIn,
  UserPlus,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  ChevronDown,
} from "lucide-react";
import { useAuth } from "@/lib/auth/AuthContext";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { UserRole } from "@/lib/auth/rbac";

type AuthTab = "signin" | "signup";

const ROLE_OPTIONS: { value: UserRole; label: string; description: string }[] = [
  { value: "CITIZEN", label: "Citizen", description: "Report infrastructure issues in your community" },
  { value: "COMMUNITY_VERIFIER", label: "Community Verifier", description: "Verify reports submitted by citizens nearby" },
  { value: "VOLUNTEER", label: "Field Volunteer", description: "Conduct physical inspections and collect evidence" },
  { value: "NGO", label: "NGO Partner", description: "Pledge support for high-priority civic projects" },
  { value: "GOVT_AGENCY", label: "Government Agency", description: "Manage and resolve assigned infrastructure cases" },
  { value: "DS_OFFICER", label: "DS Officer", description: "Triage cases and coordinate agency assignments" },
];

export default function LoginPage() {
  const router = useRouter();
  const { login, register, isAuthenticated, currentRole } = useAuth();
  const { t } = useLanguage();

  const [activeTab, setActiveTab] = useState<AuthTab>("signin");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Sign In form
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Sign Up form
  const [registerName, setRegisterName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState("");
  const [registerRole, setRegisterRole] = useState<UserRole>("CITIZEN");
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const getDashPath = (role: string) => {
        switch (role) {
          case "COMMUNITY_VERIFIER": return "/dashboard/verifier";
          case "VOLUNTEER": return "/dashboard/volunteer";
          case "NGO": return "/dashboard/ngo";
          case "GOVT_AGENCY": return "/dashboard/agency";
          case "DS_OFFICER": return "/dashboard/ds-officer";
          case "ADMIN": return "/dashboard/admin";
          default: return "/dashboard/citizen";
        }
      };
      router.push(getDashPath(currentRole));
    }
  }, [isAuthenticated, currentRole, router]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!loginEmail || !loginPassword) {
      setError("Please enter both email and password.");
      return;
    }

    setIsSubmitting(true);
    const result = await login({ email: loginEmail, password: loginPassword });
    setIsSubmitting(false);

    if (!result.success) {
      setError(result.error || "Login failed. Please check your credentials.");
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!registerName || !registerEmail || !registerPassword) {
      setError("Please fill in all required fields.");
      return;
    }

    if (registerPassword.length < 4) {
      setError("Password must be at least 4 characters long.");
      return;
    }

    if (registerPassword !== registerConfirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    const result = await register({
      name: registerName,
      email: registerEmail,
      password: registerPassword,
      role: registerRole,
    });
    setIsSubmitting(false);

    if (!result.success) {
      setError(result.error || "Registration failed. Please try again.");
    } else {
      setSuccess("Account created successfully! Redirecting...");
    }
  };

  const selectedRoleOption = ROLE_OPTIONS.find((r) => r.value === registerRole);

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden px-4 py-12">
      {/* Background decorative elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#FDF6E3] via-[#FDEEDC] to-[#FFE4C4] dark:from-black dark:via-black dark:to-black" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-orange-400/10 dark:bg-[#FF8C00]/8 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-amber-400/8 dark:bg-[#FF8C00]/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute inset-0 opacity-5 dark:opacity-10 bg-[radial-gradient(#F97316_1px,transparent_1px)] [background-size:32px_32px]" />

      {/* Login Card */}
      <div className="relative w-full max-w-md z-10">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 group mb-4">
            <div className="w-12 h-12 rounded-2xl bg-[#F97316] dark:bg-[#FF8C00] text-white flex items-center justify-center shadow-xl shadow-orange-600/25 group-hover:scale-105 transition-transform">
              <Shield className="w-6 h-6" />
            </div>
          </Link>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            CivicPulse <span className="text-[#F97316] dark:text-[#FF8C00] font-mono text-lg">LK</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-[#B0B0B0] mt-1">
            {t("auth.subtitle")}
          </p>
        </div>

        {/* Glass Card */}
        <div className="bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-xl border border-[#E8D5B5]/80 dark:border-[#333333]/80 rounded-3xl shadow-2xl shadow-slate-200/50 dark:shadow-black/30 overflow-hidden">
          {/* Tab Switcher */}
          <div className="flex border-b border-[#E8D5B5] dark:border-slate-800">
            <button
              onClick={() => { setActiveTab("signin"); setError(null); setSuccess(null); }}
              className={`flex-1 py-3.5 text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === "signin"
                  ? "text-[#F97316] dark:text-orange-400 border-b-2 border-[#F97316] dark:border-orange-400 bg-[#FFE4C4]/50 dark:bg-orange-950/20"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>{t("auth.signIn")}</span>
            </button>
            <button
              onClick={() => { setActiveTab("signup"); setError(null); setSuccess(null); }}
              className={`flex-1 py-3.5 text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === "signup"
                  ? "text-[#F97316] dark:text-orange-400 border-b-2 border-[#F97316] dark:border-orange-400 bg-[#FFE4C4]/50 dark:bg-orange-950/20"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>{t("auth.createAccount")}</span>
            </button>
          </div>

          <div className="p-6 sm:p-8">
            {/* Error / Success Messages */}
            {error && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-400 text-xs font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}
            {success && (
              <div className="mb-4 p-3 rounded-xl bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-900/50 text-orange-700 dark:text-orange-400 text-xs font-medium flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{success}</span>
              </div>
            )}

            {/* SIGN IN FORM */}
            {activeTab === "signin" && (
              <form onSubmit={handleSignIn} className="space-y-4">
                <div>
                  <label htmlFor="login-email" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    {t("auth.email")}
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      id="login-email"
                      type="email"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#FDEEDC] dark:bg-slate-800/60 border border-[#E8D5B5] dark:border-slate-700 text-slate-900 dark:text-white text-sm placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#F97316]/50 focus:border-[#F97316] transition-all"
                      autoComplete="email"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="login-password" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    {t("auth.password")}
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      id="login-password"
                      type={showPassword ? "text" : "password"}
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-12 py-3 rounded-xl bg-[#FDEEDC] dark:bg-slate-800/60 border border-[#E8D5B5] dark:border-slate-700 text-slate-900 dark:text-white text-sm placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#F97316]/50 focus:border-[#F97316] transition-all"
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary-orange w-full py-3 text-sm flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>{t("auth.signingIn")}</span>
                    </>
                  ) : (
                    <>
                      <LogIn className="w-4 h-4" />
                      <span>{t("auth.signInBtn")}</span>
                    </>
                  )}
                </button>

                {/* Demo credentials hint */}
                <div className="mt-4 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 text-amber-700 dark:text-amber-400 text-[11px]">
                  <div className="flex items-center gap-1.5 font-bold mb-1">
                    <Sparkles className="w-3 h-3" />
                    <span>{t("auth.demoHintTitle")}</span>
                  </div>
                  <p className="text-amber-600 dark:text-amber-500">{t("auth.demoHintDesc")}</p>
                </div>
              </form>
            )}

            {/* SIGN UP FORM */}
            {activeTab === "signup" && (
              <form onSubmit={handleSignUp} className="space-y-4">
                <div>
                  <label htmlFor="register-name" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    {t("auth.fullName")}
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      id="register-name"
                      type="text"
                      value={registerName}
                      onChange={(e) => setRegisterName(e.target.value)}
                      placeholder="Anusha Fernando"
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#FDEEDC] dark:bg-slate-800/60 border border-[#E8D5B5] dark:border-slate-700 text-slate-900 dark:text-white text-sm placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#F97316]/50 focus:border-[#F97316] transition-all"
                      autoComplete="name"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="register-email" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    {t("auth.email")}
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      id="register-email"
                      type="email"
                      value={registerEmail}
                      onChange={(e) => setRegisterEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#FDEEDC] dark:bg-slate-800/60 border border-[#E8D5B5] dark:border-slate-700 text-slate-900 dark:text-white text-sm placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#F97316]/50 focus:border-[#F97316] transition-all"
                      autoComplete="email"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="register-password" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      {t("auth.password")}
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        id="register-password"
                        type={showPassword ? "text" : "password"}
                        value={registerPassword}
                        onChange={(e) => setRegisterPassword(e.target.value)}
                        placeholder="••••••"
                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#FDEEDC] dark:bg-slate-800/60 border border-[#E8D5B5] dark:border-slate-700 text-slate-900 dark:text-white text-sm placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#F97316]/50 focus:border-[#F97316] transition-all"
                        autoComplete="new-password"
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="register-confirm" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      {t("auth.confirmPassword")}
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        id="register-confirm"
                        type={showConfirmPassword ? "text" : "password"}
                        value={registerConfirmPassword}
                        onChange={(e) => setRegisterConfirmPassword(e.target.value)}
                        placeholder="••••••"
                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#FDEEDC] dark:bg-slate-800/60 border border-[#E8D5B5] dark:border-slate-700 text-slate-900 dark:text-white text-sm placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#F97316]/50 focus:border-[#F97316] transition-all"
                        autoComplete="new-password"
                      />
                    </div>
                  </div>
                </div>

                {/* Role Selector */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    {t("auth.selectRole")}
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                      className="w-full px-4 py-3 rounded-xl bg-[#FDEEDC] dark:bg-slate-800/60 border border-[#E8D5B5] dark:border-slate-700 text-left text-sm flex items-center justify-between transition-all focus:outline-none focus:ring-2 focus:ring-[#F97316]/50 focus:border-[#F97316]"
                    >
                      <div>
                        <span className="text-slate-900 dark:text-white font-medium">{selectedRoleOption?.label}</span>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 block">{selectedRoleOption?.description}</span>
                      </div>
                      <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${roleDropdownOpen ? "rotate-180" : ""}`} />
                    </button>

                    {roleDropdownOpen && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setRoleDropdownOpen(false)} />
                        <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-slate-900 border border-[#E8D5B5] dark:border-slate-800 rounded-xl shadow-xl z-50 max-h-64 overflow-y-auto p-1">
                          {ROLE_OPTIONS.map((opt) => (
                            <button
                              type="button"
                              key={opt.value}
                              onClick={() => { setRegisterRole(opt.value); setRoleDropdownOpen(false); }}
                              className={`w-full text-left px-3 py-2.5 rounded-lg text-xs transition-colors ${
                                registerRole === opt.value
                                  ? "bg-[#FFE4C4] dark:bg-orange-950/40 text-[#F97316] dark:text-orange-400"
                                  : "text-slate-700 dark:text-slate-300 hover:bg-[#FDEEDC] dark:hover:bg-slate-800"
                              }`}
                            >
                              <span className="font-bold block">{opt.label}</span>
                              <span className="text-[11px] text-slate-500 dark:text-slate-400">{opt.description}</span>
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary-orange w-full py-3 text-sm flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>{t("auth.creatingAccount")}</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      <span>{t("auth.createAccountBtn")}</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Bottom links */}
        <div className="mt-6 text-center">
          <Link
            href="/"
            className="text-xs text-slate-500 dark:text-slate-400 hover:text-orange-600 dark:hover:text-orange-400 font-medium inline-flex items-center gap-1 transition-colors"
          >
            <ArrowRight className="w-3 h-3 rotate-180" />
            <span>{t("auth.backToHome")}</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
