"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ShieldAlert,
  CheckCircle2,
  ArrowRight,
  MapPin,
  Users,
  ShieldCheck,
  Loader2,
} from "lucide-react";

const DISTRICTS = [
  "Colombo", "Gampaha", "Kalutara", "Kandy", "Matale", "Nuwara Eliya",
  "Galle", "Matara", "Hambantota", "Jaffna", "Kilinochchi", "Mannar",
  "Mullaitivu", "Vavuniya", "Trincomalee", "Batticaloa", "Ampara",
  "Kurunegala", "Puttalam", "Anuradhapura", "Polonnaruwa", "Badulla",
  "Monaragala", "Ratnapura", "Kegalle",
];

type RoleOption = "CITIZEN" | "VERIFIER";

interface RoleCard {
  role: RoleOption;
  title: string;
  subtitle: string;
  description: string;
  features: string[];
  color: string;
  borderColor: string;
  textColor: string;
  bgColor: string;
  icon: React.ReactNode;
}

const ROLE_OPTIONS: RoleCard[] = [
  {
    role: "CITIZEN",
    title: "Citizen Reporter",
    subtitle: "Most common",
    description:
      "Report damaged roads, broken streetlights, blocked drains, and other infrastructure issues near you.",
    features: [
      "Submit geotagged photo reports",
      "Track your report status live",
      "Get notified on DS Office actions",
      "View public transparency dashboard",
    ],
    color: "primary",
    borderColor: "border-primary/40",
    textColor: "text-primary",
    bgColor: "bg-primary/10",
    icon: <ShieldAlert className="w-7 h-7" />,
  },
  {
    role: "VERIFIER",
    title: "Community Verifier",
    subtitle: "Earn trust points",
    description:
      "Verify nearby reports by visiting the location and confirming whether the issue exists.",
    features: [
      "Confirm or dispute nearby reports",
      "Earn trust score points",
      "Help escalate critical issues",
      "Strengthen report authenticity",
    ],
    color: "primary-light",
    borderColor: "border-primary-light/40",
    textColor: "text-primary-light",
    bgColor: "bg-primary-light/10",
    icon: <CheckCircle2 className="w-7 h-7" />,
  },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<RoleOption | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    if (!selectedRole) return;
    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: selectedRole,
          district: selectedDistrict || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Onboarding failed");

      // Redirect based on chosen role
      if (selectedRole === "VERIFIER") {
        router.push("/verify");
      } else {
        router.push("/");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0f1a] flex items-center justify-center px-4 py-16 relative overflow-hidden">
      {/* Ambient glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-primary/8 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[300px] bg-accent/8 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-3xl space-y-10 z-10">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold">
            <ShieldCheck className="w-4 h-4" />
            Welcome to CivicPulse LK
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
            How will you contribute?
          </h1>
          <p className="text-muted text-sm max-w-xl mx-auto leading-relaxed">
            Choose your role to get started. You can always discuss a role
            upgrade with your district administrator later.
          </p>
        </div>

        {/* Role Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {ROLE_OPTIONS.map((opt) => {
            const isSelected = selectedRole === opt.role;
            return (
              <button
                key={opt.role}
                onClick={() => setSelectedRole(opt.role)}
                className={`relative text-left p-6 rounded-2xl border-2 transition-all duration-200 group focus:outline-none ${
                  isSelected
                    ? `${opt.borderColor} ${opt.bgColor} ring-2 ring-${opt.color}-500/30`
                    : "border-slate-800 bg-slate-900/50 hover:border-slate-700 hover:bg-slate-900/80"
                }`}
              >
                {isSelected && (
                  <div className="absolute top-4 right-4 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                    <CheckCircle2 className="w-3 h-3 text-white" />
                  </div>
                )}

                <div
                  className={`inline-flex items-center justify-center w-12 h-12 rounded-xl mb-4 ${opt.bgColor} ${opt.textColor}`}
                >
                  {opt.icon}
                </div>

                <div className="space-y-1 mb-4">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-foreground text-base">
                      {opt.title}
                    </h3>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${opt.bgColor} ${opt.textColor}`}
                    >
                      {opt.subtitle}
                    </span>
                  </div>
                  <p className="text-muted text-xs leading-relaxed">
                    {opt.description}
                  </p>
                </div>

                <ul className="space-y-1.5">
                  {opt.features.map((f) => (
                    <li
                      key={f}
                      className="flex items-start gap-2 text-xs text-muted"
                    >
                      <CheckCircle2
                        className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${opt.textColor}`}
                      />
                      {f}
                    </li>
                  ))}
                </ul>
              </button>
            );
          })}
        </div>

        {/* District Selection */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-semibold text-muted">
            <MapPin className="w-4 h-4 text-primary" />
            Your District{" "}
            <span className="text-subtle font-normal text-xs">
              (optional â€” helps show nearby reports)
            </span>
          </label>
          <select
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
            className="w-full bg-slate-900/60 border border-slate-800 text-foreground text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-primary/60 transition-colors"
          >
            <option value="">Select your district...</option>
            {DISTRICTS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>

        {/* DS Officer Info Note */}
        <div className="flex items-start gap-3 p-4 rounded-xl bg-accent/10 border border-accent/20">
          <Users className="w-5 h-5 text-accent shrink-0 mt-0.5" />
          <p className="text-xs text-muted leading-relaxed">
            <strong className="text-accent">DS Officers, NGOs & Government Agencies</strong>{" "}
            â€” Institutional access is managed by your district administrator.
            Sign up as a Citizen and contact your DS Office to request an
            institutional role upgrade.
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
            {error}
          </div>
        )}

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={!selectedRole || isSubmitting}
          className="w-full inline-flex items-center justify-center gap-2 py-4 px-6 rounded-xl bg-gradient-to-r from-primary to-primary-light hover:from-primary-light hover:to-primary text-foreground font-bold text-sm shadow-xl shadow-primary/20 transition-all hover:scale-[1.01] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Setting up your account...
            </>
          ) : (
            <>
              Get Started as {selectedRole === "VERIFIER" ? "Community Verifier" : selectedRole === "CITIZEN" ? "Citizen Reporter" : "..."}
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}


