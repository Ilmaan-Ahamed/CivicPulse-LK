import Link from "next/link";
import {
  ShieldAlert,
  CheckCircle2,
  BrainCircuit,
  Building2,
  Camera,
  BarChart3,
  ArrowRight,
  Sparkles,
  MapPin,
  Clock,
  ShieldCheck,
  AlertTriangle,
  Users,
  FileCheck,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="space-y-24 pb-20 overflow-hidden">
      {/* =========================================
          HERO SECTION
      ========================================= */}
      <section className="relative pt-16 pb-20 md:pt-28 md:pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Glow Effects */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none -z-10" />
        <div className="absolute top-40 right-10 w-[400px] h-[250px] bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none -z-10" />

        <div className="text-center space-y-8 max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/90 border border-emerald-500/30 text-emerald-400 text-xs font-semibold shadow-lg shadow-emerald-500/5 backdrop-blur-md">
            <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span>Empowering Citizens & DS Offices Across Sri Lanka</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          </div>

          {/* Main Title */}
          <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-[1.15]">
            Community-Verified Public Infrastructure Reporting for{" "}
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-indigo-400 bg-clip-text text-transparent">
              Sri Lanka
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl text-slate-300 leading-relaxed max-w-3xl mx-auto font-normal">
            Bridge the gap between unorganized social media complaints and formal action. Submit geotagged reports, let nearby verifiers confirm authenticity, and track repairs live through your Divisional Secretariat Office.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              href="/reports/new"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-sm shadow-xl shadow-emerald-600/25 transition-all hover:scale-[1.02]"
            >
              <ShieldAlert className="w-5 h-5" />
              Report Infrastructure Issue
            </Link>

            <Link
              href="/verify"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-slate-900 border border-slate-700/80 hover:bg-slate-800 text-slate-200 font-semibold text-sm transition-all hover:scale-[1.02]"
            >
              <CheckCircle2 className="w-5 h-5 text-teal-400" />
              Verify Nearby Reports
            </Link>

            <Link
              href="/dashboard"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-slate-900/60 text-slate-300 hover:text-white text-sm font-medium transition-colors"
            >
              <BarChart3 className="w-4 h-4 text-amber-400" />
              Public Dashboard →
            </Link>
          </div>

          {/* Real-time Ticker / Stats Grid */}
          <div className="pt-12 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md text-center space-y-1">
              <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400">
                1,240+
              </div>
              <div className="text-xs text-slate-400 font-medium">
                Reports Submitted
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md text-center space-y-1">
              <div className="text-2xl sm:text-3xl font-extrabold text-teal-400">
                94%
              </div>
              <div className="text-xs text-slate-400 font-medium">
                Community Verification Accuracy
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md text-center space-y-1">
              <div className="text-2xl sm:text-3xl font-extrabold text-indigo-400">
                332
              </div>
              <div className="text-xs text-slate-400 font-medium">
                DS Office Jurisdictions
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md text-center space-y-1">
              <div className="text-2xl sm:text-3xl font-extrabold text-amber-400">
                850+
              </div>
              <div className="text-xs text-slate-400 font-medium">
                Repairs Resolved
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================
          PROBLEM STATEMENT SECTION
      ========================================= */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8 sm:p-12 relative overflow-hidden backdrop-blur-xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-red-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-3xl space-y-4 mb-10">
            <span className="text-xs font-bold uppercase tracking-wider text-red-400 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4" />
              The Problem in Sri Lanka Today
            </span>
            <h2 className="text-3xl font-bold text-white tracking-tight">
              Why Traditional Complaints Fail Citizens & Authorities
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              Infrastructure issues in Sri Lanka (damaged roads, blocked drains, broken streetlights, water leaks) are currently scattered across phone hotlines like 1919, social media, and WhatsApp groups.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-white text-base">
                No Verification Filter
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Authorities are overwhelmed by unverified, exaggerated, or duplicate complaints, causing massive delays in authentic repair triage.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-white text-base">
                Zero Status Visibility
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                After filing a complaint, citizens have no way to track whether action is taken, leading to frustration and repeated submissions.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                <Building2 className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-white text-base">
                Uncoordinated Response
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                No single institutional coordinator connects municipal councils, RDA, NWSDB, NGOs, and volunteers into a shared verifiable record.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================
          HOW IT WORKS (4-STEP PIPELINE)
      ========================================= */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
            End-to-End Workflow
          </span>
          <h2 className="text-3xl font-bold text-white tracking-tight">
            How CivicPulse LK Resolves Issues
          </h2>
          <p className="text-slate-400 text-sm">
            A structured, 4-step pipeline powered by community trust scores, Gemini AI triage, and Divisional Secretariat oversight.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
          {/* Step 1 */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4 relative group hover:border-emerald-500/40 transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-lg">
              01
            </div>
            <h3 className="font-bold text-white text-lg flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-400" />
              Report
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Citizens submit infrastructure reports with geotagged GPS location, photo evidence, and issue description in English, Sinhala, or Tamil.
            </p>
          </div>

          {/* Step 2 */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4 relative group hover:border-teal-500/40 transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 font-bold text-lg">
              02
            </div>
            <h3 className="font-bold text-white text-lg flex items-center gap-2">
              <Users className="w-4 h-4 text-teal-400" />
              Verify
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Nearby residents review & physically confirm or dispute reports. Reliable verifiers accumulate trust scores to weigh future votes.
            </p>
          </div>

          {/* Step 3 */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4 relative group hover:border-indigo-500/40 transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold text-lg">
              03
            </div>
            <h3 className="font-bold text-white text-lg flex items-center gap-2">
              <Building2 className="w-4 h-4 text-indigo-400" />
              Triage & Assign
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Google Gemini AI flags duplicates & priority scores. The DS Office Console routes verified cases to RDA, Municipal Council, or NGOs.
            </p>
          </div>

          {/* Step 4 */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4 relative group hover:border-amber-500/40 transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold text-lg">
              04
            </div>
            <h3 className="font-bold text-white text-lg flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-amber-400" />
              Resolve & Audit
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Field agents attach inspection photos & GPS proof. Resolution is logged to the public dashboard for complete community transparency.
            </p>
          </div>
        </div>
      </section>

      {/* =========================================
          CORE MODULES GRID
      ========================================= */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-wider text-teal-400">
            Platform Capabilities
          </span>
          <h2 className="text-3xl font-bold text-white tracking-tight">
            Designed for Every Stakeholder
          </h2>
          <p className="text-slate-400 text-sm">
            Six integrated modules working seamlessly to create a trustworthy civic ecosystem.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-3 hover:border-emerald-500/30 transition-all">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-white text-base">
              Citizen Reporting App
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Instant geotagged submission with photo evidence, category selection, and trilingual support (Sinhala/Tamil/English).
            </p>
          </div>

          {/* Card 2 */}
          <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-3 hover:border-teal-500/30 transition-all">
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-white text-base">
              Community Verification Layer
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Nearby verifiers confirm or dispute reports. Dynamic trust scores weight votes to eliminate false or exaggerated claims.
            </p>
          </div>

          {/* Card 3 */}
          <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-3 hover:border-indigo-500/30 transition-all">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
              <BrainCircuit className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-white text-base">
              Gemini AI Triage Service
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Advisory AI service that detects duplicate reports, classifies categories, and scores urgency (Critical to Low).
            </p>
          </div>

          {/* Card 4 */}
          <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-3 hover:border-amber-500/30 transition-all">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400">
              <Building2 className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-white text-base">
              DS Office Console
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Institutional coordination dashboard for Divisional Secretariat officers to assign authorities, NGOs, or volunteer teams.
            </p>
          </div>

          {/* Card 5 */}
          <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-3 hover:border-blue-500/30 transition-all">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
              <Camera className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-white text-base">
              Field Evidence Capture
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Field inspection photo uploads with GPS coordinates for tamper-proof audit trails of work completed.
            </p>
          </div>

          {/* Card 6 */}
          <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-3 hover:border-purple-500/30 transition-all">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400">
              <BarChart3 className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-white text-base">
              Public Transparency Dashboard
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Open stats, district heatmaps, category charts, and live resolution timelines for full public accountability.
            </p>
          </div>
        </div>
      </section>

      {/* =========================================
          KEY DIFFERENTIATOR BANNER
      ========================================= */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="relative rounded-3xl bg-gradient-to-r from-emerald-950/80 via-slate-900 to-indigo-950/80 border border-emerald-500/30 p-8 sm:p-12 overflow-hidden shadow-2xl">
          <div className="max-w-3xl space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold">
              Key Differentiator
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Institutional Credibility Centered Around Divisional Secretariats
            </h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              Unlike purely crowd-sourced apps or unguided AI bots, CivicPulse LK leverages Sri Lanka’s trusted Divisional Secretariat (DS) Offices as formal triage centers while harnessing AI to strip away noise and crowd verification for speed.
            </p>
            <div className="pt-2 flex flex-wrap gap-4">
              <Link
                href="/ds-console"
                className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 px-4 py-2.5 rounded-lg transition-colors"
              >
                Explore DS Console Workflow
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
