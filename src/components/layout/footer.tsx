import Link from "next/link";
import { ShieldAlert, Heart, ExternalLink } from "lucide-react";
import { PLATFORM_MODULE_LIST } from "@/lib/platform-modules";

export function Footer() {
  return (
    <footer className="w-full border-t border-primary/20 bg-surface backdrop-blur-md text-muted text-xs py-12 relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1: Branding & Intro */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center shadow-md shadow-primary/5">
                <ShieldAlert className="w-4.5 h-4.5 text-primary" />
              </div>
              <span className="font-bold text-base text-foreground tracking-tight">
                CivicPulse <span className="text-primary">LK</span>
              </span>
            </div>
            <p className="text-muted leading-relaxed text-xs">
              Sri Lanka's premier community-verified public infrastructure reporting ecosystem. Bridging citizens, local verifiers, and Divisional Secretariat offices.
            </p>
            <div className="inline-flex items-center gap-2 text-[10px] text-primary bg-primary/10 border border-primary/20 px-3 py-1 rounded-xl font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              CCS3361 â€“ Group 20
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div className="space-y-3">
            <h4 className="font-bold text-foreground text-sm tracking-wide">Platform Modules</h4>
            <ul className="space-y-2">
              {PLATFORM_MODULE_LIST.map((mod) => (
                <li key={mod.slug}>
                  <Link
                    href={`/modules/${mod.slug}`}
                    className="hover:text-primary transition-colors duration-300 flex items-center gap-1"
                  >
                    {mod.footerLabel}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/modules" className="hover:text-primary transition-colors duration-300 flex items-center gap-1 text-primary/90">
                  View all modules
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Institutional Workflow */}
          <div className="space-y-3">
            <h4 className="font-bold text-foreground text-sm tracking-wide">Gov & NGO Workflow</h4>
            <ul className="space-y-2 text-slate-450">
              <li className="flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-slate-650" />
                <span>Divisional Secretariat Offices</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-slate-650" />
                <span>RDA / Municipal Councils / NWSDB</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-slate-650" />
                <span>Community Verifiers & Trust Scoring</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-slate-650" />
                <span>Field Evidence & Auditing</span>
              </li>
            </ul>
          </div>

          {/* Col 4: Project Info & Team */}
          <div className="space-y-3">
            <h4 className="font-bold text-foreground text-sm tracking-wide">Technology & Credits</h4>
            <div className="space-y-3">
              <a
                href="https://github.com/Ilmaan-Ahamed/CivicPulse-LK-.git"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-slate-350 hover:text-primary transition-all duration-300 font-semibold"
              >
                <svg className="w-4.5 h-4.5 fill-current" viewBox="0 0 24 24">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                </svg>
                GitHub Repository
                <ExternalLink className="w-3 h-3 text-subtle" />
              </a>
              <p className="text-[11px] text-subtle leading-relaxed">
                Powered by Next.js 16, PostgreSQL (Neon DB + PostGIS), Google Gemini AI, Clerk Auth & MinIO S3.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-primary/20 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px]">
          <p>Â© {new Date().getFullYear()} CivicPulse LK (Group 20). All rights reserved.</p>
          <div className="flex items-center gap-1.5 text-subtle">
            <span>Built with</span>
            <Heart className="w-3 h-3 text-red-500 fill-red-500" />
            <span>for Sri Lanka public infrastructure transparency and accountability. </span>
          </div>
        </div>
      </div>
    </footer>
  );
}


