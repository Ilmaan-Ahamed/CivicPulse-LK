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
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-primary/10 rounded-full blur-[120px] pointer-events-none -z-10" />
        <div className="absolute top-40 right-10 w-[400px] h-[250px] bg-accent/10 rounded-full blur-[100px] pointer-events-none -z-10" />

        <div className="text-center space-y-8 max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/30 text-primary text-xs font-semibold shadow-lg shadow-primary/5 backdrop-blur-md">
            <Sparkles className="w-4 h-4 text-primary animate-pulse" />
            <span>Empowering Citizens & DS Offices Across Sri Lanka</span>
            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
          </div>

          {/* Main Title */}
          <h1 className="text-4xl sm:text-6xl font-extrabold text-foreground tracking-tight leading-[1.15]">
            Community-Verified Public Infrastructure Reporting for{" "}
            <span className="bg-gradient-to-r from-primary via-primary-light to-accent bg-clip-text text-transparent">
              Sri Lanka
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl text-muted leading-relaxed max-w-3xl mx-auto font-normal">
            Bridge the gap between unorganized social media complaints and formal action. Submit geotagged reports, let nearby verifiers confirm authenticity, and track repairs live through your Divisional Secretariat Office.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              href="/reports/new"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-primary to-primary-light hover:from-primary-light hover:to-primary text-foreground font-bold text-sm shadow-xl shadow-primary/25 transition-all hover:scale-[1.02]"
            >
              <ShieldAlert className="w-5 h-5" />
              Report Infrastructure Issue
            </Link>

            <Link
              href="/verify"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-surface border-2 border-primary/30 hover:border-primary/50 hover:bg-primary/10 text-foreground font-semibold text-sm transition-all hover:scale-[1.02]"
            >
              <CheckCircle2 className="w-5 h-5 text-primary" />
              Verify Nearby Reports
            </Link>

            <Link
              href="/dashboard"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-surface border-2 border-primary/20 text-muted hover:text-foreground hover:border-primary/40 text-sm font-medium transition-colors"
            >
              <BarChart3 className="w-4 h-4 text-primary" />
              Public Dashboard AI
            </Link>
          </div>

          {/* Real-time Ticker / Stats Grid */}
          <div className="pt-12 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <div className="p-4 rounded-2xl bg-surface border border-primary/20 backdrop-blur-md text-center space-y-1">
              <div className="text-2xl sm:text-3xl font-extrabold text-foreground">
                1,240+
              </div>
              <div className="text-xs text-muted font-medium">
                Reports Submitted
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-surface border border-primary/20 backdrop-blur-md text-center space-y-1">
              <div className="text-2xl sm:text-3xl font-extrabold text-foreground">
                94%
              </div>
              <div className="text-xs text-muted font-medium">
                Community Verification Accuracy
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-surface border border-primary/20 backdrop-blur-md text-center space-y-1">
              <div className="text-2xl sm:text-3xl font-extrabold text-foreground">
                332
              </div>
              <div className="text-xs text-muted font-medium">
                DS Office Jurisdictions
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-surface border border-primary/20 backdrop-blur-md text-center space-y-1">
              <div className="text-2xl sm:text-3xl font-extrabold text-foreground">
                850+
              </div>
              <div className="text-xs text-muted font-medium">
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
        <div className="bg-surface border border-primary/20 rounded-3xl p-8 sm:p-12 relative overflow-hidden backdrop-blur-xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-3xl space-y-4 mb-10">
            <span className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4" />
              The Problem in Sri Lanka Today
            </span>
            <h2 className="text-3xl font-bold text-foreground tracking-tight">
              Why Traditional Complaints Fail Citizens & Authorities
            </h2>
            <p className="text-muted text-sm leading-relaxed">
              Infrastructure issues in Sri Lanka (damaged roads, blocked drains, broken streetlights, water leaks) are currently scattered across phone hotlines like 1919, social media, and WhatsApp groups.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-surface border border-primary/20 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-foreground text-base">
                No Verification Filter
              </h3>
              <p className="text-xs text-muted leading-relaxed">
                Authorities are overwhelmed by unverified, exaggerated, or duplicate complaints, causing massive delays in authentic repair triage.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-surface border border-primary/20 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-primary-light/10 border border-primary-light/20 flex items-center justify-center text-primary-light">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-foreground text-base">
                Zero Status Visibility
              </h3>
              <p className="text-xs text-muted leading-relaxed">
                After filing a complaint, citizens have no way to track whether action is taken, leading to frustration and repeated submissions.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-surface border border-primary/20 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
                <Building2 className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-foreground text-base">
                Uncoordinated Response
              </h3>
              <p className="text-xs text-muted leading-relaxed">
                No single institutional coordinator connects municipal councils, RDA, NWSDB, NGOs, and volunteers into a shared verifiable record.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================
          FEATURED REPORT CARD
      ========================================= */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="max-w-md mx-auto">
          <div className="bg-surface border border-primary/20 rounded-2xl overflow-hidden backdrop-blur-xl">
            {/* Card Header */}
            <div className="flex items-center justify-between p-4 border-b border-primary/20">
              <span className="text-sm font-semibold text-foreground">Report #A17-2291</span>
              <span className="px-2 py-1 rounded-full bg-primary/20 text-primary text-xs font-bold border border-primary/30">
                VERIFIED
              </span>
            </div>

            {/* Map Placeholder */}
            <div className="relative h-48 bg-surface-hover flex items-center justify-center">
              <MapPin className="w-8 h-8 text-primary" />
              <div className="absolute bottom-2 right-2 text-xs text-muted font-mono">
                6.9271° N, 79.8612° E
              </div>
            </div>

            {/* Card Content */}
            <div className="p-4 space-y-3">
              <h3 className="text-base font-semibold text-foreground">
                Collapsed drain cover — Galle Rd, Colombo 03
              </h3>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted">4 confirmations</span>
                <span className="text-primary font-medium">Assigned → CMC Ward 12</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================
          HOW IT WORKS (4-STEP PIPELINE)
      ========================================= */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-wider text-primary">
            End-to-End Workflow
          </span>
          <h2 className="text-3xl font-bold text-foreground tracking-tight">
            How CivicPulse LK Resolves Issues
          </h2>
          <p className="text-muted text-sm">
            A structured, 4-step pipeline powered by community trust scores, Gemini AI triage, and Divisional Secretariat oversight.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
          {/* Step 1 */}
          <div className="p-6 rounded-2xl bg-surface border border-primary/20 space-y-4 relative group hover:border-primary/40 transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center text-primary font-bold text-lg">
              01
            </div>
            <h3 className="font-bold text-foreground text-lg flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary" />
              Report
            </h3>
            <p className="text-xs text-muted leading-relaxed">
              Citizens submit infrastructure reports with geotagged GPS location, photo evidence, and issue description in English, Sinhala, or Tamil.
            </p>
          </div>

          {/* Step 2 */}
          <div className="p-6 rounded-2xl bg-surface border border-primary/20 space-y-4 relative group hover:border-primary-light/40 transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-primary-light/10 border border-primary-light/30 flex items-center justify-center text-primary-light font-bold text-lg">
              02
            </div>
            <h3 className="font-bold text-foreground text-lg flex items-center gap-2">
              <Users className="w-4 h-4 text-primary-light" />
              Verify
            </h3>
            <p className="text-xs text-muted leading-relaxed">
              Nearby residents review & physically confirm or dispute reports. Reliable verifiers accumulate trust scores to weigh future votes.
            </p>
          </div>

          {/* Step 3 */}
          <div className="p-6 rounded-2xl bg-surface border border-primary/20 space-y-4 relative group hover:border-accent/40 transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-accent/10 border border-accent/30 flex items-center justify-center text-accent font-bold text-lg">
              03
            </div>
            <h3 className="font-bold text-foreground text-lg flex items-center gap-2">
              <Building2 className="w-4 h-4 text-accent" />
              Triage & Assign
            </h3>
            <p className="text-xs text-muted leading-relaxed">
              Google Gemini AI flags duplicates & priority scores. The DS Office Console routes verified cases to RDA, Municipal Council, or NGOs.
            </p>
          </div>

          {/* Step 4 */}
          <div className="p-6 rounded-2xl bg-surface border border-primary/20 space-y-4 relative group hover:border-primary/40 transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center text-primary font-bold text-lg">
              04
            </div>
            <h3 className="font-bold text-foreground text-lg flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-primary" />
              Resolve & Audit
            </h3>
            <p className="text-xs text-muted leading-relaxed">
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
          <span className="text-xs font-bold uppercase tracking-wider text-primary-light">
            Platform Capabilities
          </span>
          <h2 className="text-3xl font-bold text-foreground tracking-tight">
            Designed for Every Stakeholder
          </h2>
          <p className="text-muted text-sm">
            Six integrated modules working seamlessly to create a trustworthy civic ecosystem.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="p-6 rounded-2xl bg-surface border border-primary/20 space-y-3 hover:border-primary/30 transition-all">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-foreground text-base">
              Citizen Reporting App
            </h3>
            <p className="text-xs text-muted leading-relaxed">
              Instant geotagged submission with photo evidence, category selection, and trilingual support (Sinhala/Tamil/English).
            </p>
          </div>

          {/* Card 2 */}
          <div className="p-6 rounded-2xl bg-surface border border-primary/20 space-y-3 hover:border-primary-light/30 transition-all">
            <div className="w-10 h-10 rounded-xl bg-primary-light/10 flex items-center justify-center text-primary-light">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-foreground text-base">
              Community Verification Layer
            </h3>
            <p className="text-xs text-muted leading-relaxed">
              Nearby verifiers confirm or dispute reports. Dynamic trust scores weight votes to eliminate false or exaggerated claims. English, Tamil, Sinhala.
            </p>
          </div>

          {/* Card 3 */}
          <div className="p-6 rounded-2xl bg-surface border border-primary/20 space-y-3 hover:border-accent/30 transition-all">
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
              <BrainCircuit className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-foreground text-base">
              Gemini AI Triage Service
            </h3>
            <p className="text-xs text-muted leading-relaxed">
              Advisory AI service that detects duplicate reports, classifies categories, and scores urgency (Critical to Low).
            </p>
          </div>

          {/* Card 4 */}
          <div className="p-6 rounded-2xl bg-surface border border-primary/20 space-y-3 hover:border-primary/30 transition-all">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <Building2 className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-foreground text-base">
              DS Office Console
            </h3>
            <p className="text-xs text-muted leading-relaxed">
              Institutional coordination dashboard for Divisional Secretariat officers to assign authorities, NGOs, or volunteer teams.
            </p>
          </div>

          {/* Card 5 */}
          <div className="p-6 rounded-2xl bg-surface border border-primary/20 space-y-3 hover:border-primary-light/30 transition-all">
            <div className="w-10 h-10 rounded-xl bg-primary-light/10 flex items-center justify-center text-primary-light">
              <Camera className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-foreground text-base">
              Field Evidence Capture
            </h3>
            <p className="text-xs text-muted leading-relaxed">
              Field inspection photo uploads with GPS coordinates for tamper-proof audit trails of work completed.
            </p>
          </div>

          {/* Card 6 */}
          <div className="p-6 rounded-2xl bg-surface border border-primary/20 space-y-3 hover:border-accent/30 transition-all">
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
              <BarChart3 className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-foreground text-base">
              Public Transparency Dashboard
            </h3>
            <p className="text-xs text-muted leading-relaxed">
              Open stats, district heatmaps, category charts, and live resolution timelines for full public accountability.
            </p>
          </div>
        </div>
      </section>

      {/* =========================================
          KEY DIFFERENTIATOR BANNER
      ========================================= */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="relative rounded-3xl bg-surface border-2 border-primary/30 p-8 sm:p-12 overflow-hidden shadow-2xl">
          <div className="max-w-3xl space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
              Key Differentiator
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
              Institutional Credibility Centered Around Divisional Secretariats
            </h2>
            <p className="text-muted text-sm leading-relaxed">
              Unlike purely crowd-sourced apps or unguided AI bots, CivicPulse LK leverages Sri Lankaâ€™s trusted Divisional Secretariat (DS) Offices as formal triage centers while harnessing AI to strip away noise and crowd verification for speed.
            </p>
            <div className="pt-2 flex flex-wrap gap-4">
              <Link
                href="/ds-console"
                className="inline-flex items-center gap-2 text-xs font-semibold text-primary hover:text-primary-light bg-primary/10 border border-primary/20 px-4 py-2.5 rounded-lg transition-colors"
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


