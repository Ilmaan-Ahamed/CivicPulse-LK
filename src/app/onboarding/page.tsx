"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  Building2,
  Landmark,
  UserCircle2,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  MapPin,
  Globe2,
  Phone,
  FileText,
  Loader2,
  Clock,
  Zap,
  ChevronRight,
  AlertCircle,
} from "lucide-react";

// ─── Constants ───────────────────────────────────────────────────────────────

const DISTRICTS = [
  "Ampara", "Anuradhapura", "Badulla", "Batticaloa", "Colombo",
  "Galle", "Gampaha", "Hambantota", "Jaffna", "Kalutara",
  "Kandy", "Kegalle", "Kilinochchi", "Kurunegala", "Mannar",
  "Matale", "Matara", "Monaragala", "Mullaitivu", "Nuwara Eliya",
  "Polonnaruwa", "Puttalam", "Ratnapura", "Trincomalee", "Vavuniya",
];

const LANGUAGES = [
  { value: "EN", label: "English", native: "English", flag: "🇬🇧" },
  { value: "SI", label: "Sinhala", native: "සිංහල", flag: "🇱🇰" },
  { value: "TA", label: "Tamil", native: "தமிழ்", flag: "🇮🇳" },
] as const;

type RoleId = "CITIZEN" | "NGO" | "AGENCY" | "DS_OFFICER";
type LangId = "EN" | "SI" | "TA";

interface RoleOption {
  id: RoleId;
  title: string;
  subtitle: string;
  description: string;
  features: string[];
  access: "instant" | "pending";
  accent: {
    border: string;
    bg: string;
    text: string;
    badge: string;
    badgeText: string;
    ring: string;
    glow: string;
  };
  icon: React.ReactNode;
}

const ROLE_OPTIONS: RoleOption[] = [
  {
    id: "CITIZEN",
    title: "Citizen",
    subtitle: "Default · No approval needed",
    description:
      "Report damaged roads, broken streetlights, blocked drains, and other public infrastructure issues near you.",
    features: [
      "Submit geotagged photo reports",
      "Track your report status live",
      "View public transparency dashboard",
      "Earn trust points by verifying reports",
    ],
    access: "instant",
    accent: {
      border: "border-emerald-500/50",
      bg: "bg-emerald-500/8",
      text: "text-emerald-400",
      badge: "bg-emerald-500/15 border border-emerald-500/30",
      badgeText: "text-emerald-400",
      ring: "ring-emerald-500/25",
      glow: "shadow-emerald-500/10",
    },
    icon: <UserCircle2 className="w-6 h-6" />,
  },
  {
    id: "NGO",
    title: "NGO",
    subtitle: "Non-governmental organisation",
    description:
      "Register your NGO to coordinate field teams, accept assignments from DS Offices, and provide resolution reports.",
    features: [
      "Receive assignment requests from DS Offices",
      "Coordinate field teams for issue resolution",
      "Submit evidence-backed resolution reports",
      "Access aggregated issue data for your area",
    ],
    access: "pending",
    accent: {
      border: "border-violet-500/50",
      bg: "bg-violet-500/8",
      text: "text-violet-400",
      badge: "bg-amber-500/15 border border-amber-500/30",
      badgeText: "text-amber-400",
      ring: "ring-violet-500/25",
      glow: "shadow-violet-500/10",
    },
    icon: <Building2 className="w-6 h-6" />,
  },
  {
    id: "AGENCY",
    title: "Government Agency",
    subtitle: "Municipal or provincial authority",
    description:
      "Register as a government agency to receive escalated infrastructure reports and coordinate official responses.",
    features: [
      "Receive high-priority escalated reports",
      "Official assignment workflow with deadlines",
      "Field verification & evidence capture",
      "Resolution reporting to DS Office",
    ],
    access: "pending",
    accent: {
      border: "border-blue-500/50",
      bg: "bg-blue-500/8",
      text: "text-blue-400",
      badge: "bg-amber-500/15 border border-amber-500/30",
      badgeText: "text-amber-400",
      ring: "ring-blue-500/25",
      glow: "shadow-blue-500/10",
    },
    icon: <Landmark className="w-6 h-6" />,
  },
  {
    id: "DS_OFFICER",
    title: "DS Officer",
    subtitle: "Divisional Secretariat staff",
    description:
      "Divisional Secretariat officers who triage, assign, and monitor verified infrastructure reports within their division.",
    features: [
      "DS Console with full report queue",
      "Assign reports to agencies & NGOs",
      "Set priorities, deadlines & SLA tracking",
      "View jurisdictional analytics & heatmaps",
    ],
    access: "pending",
    accent: {
      border: "border-teal-500/50",
      bg: "bg-teal-500/8",
      text: "text-teal-400",
      badge: "bg-amber-500/15 border border-amber-500/30",
      badgeText: "text-amber-400",
      ring: "ring-teal-500/25",
      glow: "shadow-teal-500/10",
    },
    icon: <ShieldCheck className="w-6 h-6" />,
  },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function StepIndicator({ step }: { step: 1 | 2 }) {
  return (
    <div className="flex items-center gap-3 justify-center">
      {[1, 2].map((s) => (
        <div key={s} className="flex items-center gap-3">
          <div
            className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold transition-all duration-300 ${
              s < step
                ? "bg-emerald-500 text-white"
                : s === step
                ? "bg-emerald-500/20 border-2 border-emerald-500 text-emerald-400"
                : "bg-slate-800 border-2 border-slate-700 text-slate-500"
            }`}
          >
            {s < step ? <CheckCircle2 className="w-4 h-4" /> : s}
          </div>
          <span
            className={`text-xs font-medium hidden sm:block ${
              s === step ? "text-slate-200" : "text-slate-500"
            }`}
          >
            {s === 1 ? "Choose Role" : "Your Profile"}
          </span>
          {s < 2 && (
            <ChevronRight className="w-4 h-4 text-slate-600" />
          )}
        </div>
      ))}
    </div>
  );
}

function RoleCard({
  option,
  isSelected,
  onSelect,
}: {
  option: RoleOption;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const a = option.accent;
  return (
    <button
      onClick={onSelect}
      className={`relative w-full text-left p-5 rounded-2xl border-2 transition-all duration-200 focus:outline-none group ${
        isSelected
          ? `${a.border} ${a.bg} ring-2 ${a.ring} shadow-xl ${a.glow}`
          : "border-slate-800 bg-slate-900/50 hover:border-slate-700 hover:bg-slate-900/80"
      }`}
    >
      {/* Selected checkmark */}
      {isSelected && (
        <div className="absolute top-4 right-4 w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
          <CheckCircle2 className="w-3 h-3 text-white" />
        </div>
      )}

      {/* Icon */}
      <div
        className={`inline-flex items-center justify-center w-10 h-10 rounded-xl mb-3 ${a.bg} ${a.text}`}
      >
        {option.icon}
      </div>

      {/* Title row */}
      <div className="flex flex-wrap items-center gap-2 mb-1">
        <h3 className="font-bold text-white text-sm">{option.title}</h3>
        <span
          className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${a.badge} ${a.badgeText}`}
        >
          {option.access === "instant" ? (
            <>
              <Zap className="w-2.5 h-2.5" />
              Instant access
            </>
          ) : (
            <>
              <Clock className="w-2.5 h-2.5" />
              Pending approval
            </>
          )}
        </span>
      </div>

      <p className="text-slate-400 text-xs leading-relaxed mb-3">
        {option.description}
      </p>

      {/* Features */}
      <ul className="space-y-1">
        {option.features.map((f) => (
          <li
            key={f}
            className="flex items-start gap-2 text-[11px] text-slate-300"
          >
            <CheckCircle2
              className={`w-3 h-3 mt-0.5 shrink-0 ${a.text}`}
            />
            {f}
          </li>
        ))}
      </ul>
    </button>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function OnboardingPage() {
  const router = useRouter();

  // Step state
  const [step, setStep] = useState<1 | 2>(1);

  // Step 1
  const [selectedRole, setSelectedRole] = useState<RoleId | null>(null);

  // Step 2
  const [preferredLang, setPreferredLang] = useState<LangId>("EN");
  const [dsDivision, setDsDivision] = useState("");
  const [phone, setPhone] = useState("");
  const [orgName, setOrgName] = useState("");
  const [justification, setJustification] = useState("");

  // Submission
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isPendingRole =
    selectedRole !== null && selectedRole !== "CITIZEN";

  const selectedOption = ROLE_OPTIONS.find((r) => r.id === selectedRole);

  // ── Step 1 → 2 ──────────────────────────────────────────────────────────────
  function handleContinue() {
    if (!selectedRole) return;
    setStep(2);
  }

  function handleSkip() {
    setSelectedRole("CITIZEN");
    setStep(2);
  }

  // ── Final submit ─────────────────────────────────────────────────────────────
  async function handleSubmit() {
    if (!selectedRole) return;
    setIsSubmitting(true);
    setError(null);

    try {
      const payload: Record<string, unknown> = {
        role: selectedRole,
        preferredLang,
        dsDivision: dsDivision || undefined,
        phone: phone || undefined,
      };

      if (isPendingRole) {
        payload.orgName = orgName || undefined;
        payload.justification = justification;
      }

      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Onboarding failed");

      // Store pending-request info for the home page banner
      if (data.status === "PENDING") {
        sessionStorage.setItem(
          "civicpulse_pending_role",
          JSON.stringify({
            requestedRole: data.requestedRole,
            message: data.message,
          })
        );
      }

      router.push("/");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setIsSubmitting(false);
    }
  }

  // ─── Step 2 validation ───────────────────────────────────────────────────────
  const step2Valid =
    !isPendingRole ||
    (justification.trim().length >= 10);

  // ─── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#0a0f1a] flex items-center justify-center px-4 py-16 relative overflow-hidden">
      {/* Ambient glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-emerald-500/6 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[350px] bg-violet-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 left-0 w-[300px] h-[300px] bg-blue-500/4 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-3xl space-y-8 z-10">

        {/* ── Header ────────────────────────────────────────────────────────── */}
        <div className="text-center space-y-4">
          <StepIndicator step={step} />
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-3">
              <ShieldCheck className="w-3.5 h-3.5" />
              Welcome to CivicPulse LK
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              {step === 1 ? "How will you contribute?" : "Set up your profile"}
            </h1>
            <p className="text-slate-400 text-sm max-w-xl mx-auto leading-relaxed mt-2">
              {step === 1
                ? "Choose the role that best describes you. You can always request a role change later from your settings."
                : "A few more details to personalise your experience."}
            </p>
          </div>
        </div>

        {/* ── Step 1: Role Selection ─────────────────────────────────────────── */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {ROLE_OPTIONS.map((opt) => (
                <RoleCard
                  key={opt.id}
                  option={opt}
                  isSelected={selectedRole === opt.id}
                  onSelect={() => setSelectedRole(opt.id)}
                />
              ))}
            </div>

            {/* Admin note */}
            <div className="flex items-start gap-3 p-4 rounded-xl bg-slate-800/60 border border-slate-700/50">
              <AlertCircle className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
              <p className="text-xs text-slate-400 leading-relaxed">
                <span className="text-slate-300 font-semibold">Admin accounts</span> are
                provisioned directly by the system — they cannot be self-selected during
                sign-up.
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <button
                onClick={handleContinue}
                disabled={!selectedRole}
                className="w-full sm:flex-1 inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-sm shadow-lg shadow-emerald-600/20 transition-all hover:scale-[1.01] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                Continue
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={handleSkip}
                className="text-slate-400 hover:text-slate-200 text-sm underline underline-offset-4 transition-colors"
              >
                Skip for now — join as Citizen
              </button>
            </div>
          </div>
        )}

        {/* ── Step 2: Profile & Context ──────────────────────────────────────── */}
        {step === 2 && (
          <div className="space-y-6">
            {/* Pending role notice */}
            {isPendingRole && selectedOption && (
              <div
                className={`flex items-start gap-3 p-4 rounded-xl border ${selectedOption.accent.bg} ${selectedOption.accent.border}`}
              >
                <Clock
                  className={`w-4 h-4 shrink-0 mt-0.5 ${selectedOption.accent.text}`}
                />
                <p className="text-xs text-slate-300 leading-relaxed">
                  <span className={`font-semibold ${selectedOption.accent.text}`}>
                    {selectedOption.title} — Pending approval
                  </span>
                  {" "}You&apos;ll have Citizen access while an administrator reviews your
                  request. We&apos;ll notify you once it&apos;s approved.
                </p>
              </div>
            )}

            {/* Language selector */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-300">
                <Globe2 className="w-4 h-4 text-emerald-400" />
                Preferred Language
              </label>
              <div className="grid grid-cols-3 gap-3">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.value}
                    onClick={() => setPreferredLang(lang.value)}
                    className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border-2 text-sm font-medium transition-all duration-150 ${
                      preferredLang === lang.value
                        ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-300 ring-2 ring-emerald-500/20"
                        : "border-slate-800 bg-slate-900/40 text-slate-400 hover:border-slate-700 hover:text-slate-300"
                    }`}
                  >
                    <span className="text-xl">{lang.flag}</span>
                    <span className="text-xs">{lang.label}</span>
                    <span className="text-[10px] text-slate-500">{lang.native}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* DS Division picker */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-300">
                <MapPin className="w-4 h-4 text-amber-400" />
                DS Division / District
                <span className="text-slate-500 font-normal text-xs">
                  (optional — helps surface nearby reports)
                </span>
              </label>
              <select
                value={dsDivision}
                onChange={(e) => setDsDivision(e.target.value)}
                className="w-full bg-slate-900/60 border border-slate-800 text-slate-200 text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500/60 transition-colors"
              >
                <option value="">Select your district...</option>
                {DISTRICTS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            {/* Phone number */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-300">
                <Phone className="w-4 h-4 text-sky-400" />
                Phone Number
                <span className="text-slate-500 font-normal text-xs">
                  (optional)
                </span>
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+94 77 123 4567"
                className="w-full bg-slate-900/60 border border-slate-800 text-slate-200 text-sm rounded-xl px-4 py-3 placeholder:text-slate-600 focus:outline-none focus:border-sky-500/50 transition-colors"
              />
            </div>

            {/* Org fields — only for NGO / AGENCY / DS_OFFICER */}
            {isPendingRole && (
              <div className="space-y-4 p-5 rounded-2xl bg-slate-900/50 border border-slate-800">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
                  Organisation Details — Required for review
                </p>

                {/* Org name */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-300">
                    {selectedRole === "DS_OFFICER"
                      ? "DS Division / Office Name"
                      : "Organisation Name"}{" "}
                    <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    placeholder={
                      selectedRole === "DS_OFFICER"
                        ? "e.g. Colombo DS Office"
                        : "e.g. Green Earth Foundation"
                    }
                    className="w-full bg-slate-900/60 border border-slate-700 text-slate-200 text-sm rounded-xl px-4 py-3 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500/50 transition-colors"
                  />
                </div>

                {/* Justification */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-slate-300">
                    <FileText className="w-4 h-4 text-slate-400" />
                    Why do you need this role?{" "}
                    <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    value={justification}
                    onChange={(e) => setJustification(e.target.value)}
                    rows={4}
                    placeholder="Briefly describe your organisation's mandate and how you intend to use CivicPulse LK..."
                    className="w-full bg-slate-900/60 border border-slate-700 text-slate-200 text-sm rounded-xl px-4 py-3 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500/50 transition-colors resize-none"
                  />
                  <p className="text-[11px] text-slate-500">
                    {justification.length}/1000 characters ·{" "}
                    {justification.length < 10 ? (
                      <span className="text-amber-500">
                        Minimum 10 characters required
                      </span>
                    ) : (
                      <span className="text-emerald-500">✓ Looks good</span>
                    )}
                  </p>
                </div>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="flex items-start gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                {error}
              </div>
            )}

            {/* Navigation */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setStep(1)}
                disabled={isSubmitting}
                className="flex items-center gap-2 py-3.5 px-5 rounded-xl border border-slate-700 text-slate-300 hover:text-white hover:border-slate-600 text-sm font-medium transition-all disabled:opacity-40"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={!step2Valid || isSubmitting}
                className="flex-1 inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-sm shadow-lg shadow-emerald-600/20 transition-all hover:scale-[1.01] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Setting up your account...
                  </>
                ) : isPendingRole ? (
                  <>
                    Submit Request &amp; Join as Citizen
                    <ArrowRight className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    Complete Setup
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


