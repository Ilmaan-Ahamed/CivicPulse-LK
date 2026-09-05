import React from "react";
import Link from "next/link";
import { Shield, Heart, MapPin, ExternalLink } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-[#FDF6E3] dark:bg-black border-t border-[#E8D5B5] dark:border-[#FF8C00] text-slate-600 dark:text-[#B0B0B0] py-12 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
        {/* Col 1: Brand Info */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#F97316] dark:bg-[#FF8C00] text-white flex items-center justify-center font-bold">
              <Shield className="w-4 h-4" />
            </div>
            <span className="text-lg font-black text-slate-900 dark:text-white">CivicPulse LK</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-[#B0B0B0] leading-relaxed">
            Sri Lanka's premier community-verified public infrastructure reporting and governance transparency platform.
          </p>
          <div className="flex items-center gap-1.5 text-xs text-[#F97316] dark:text-[#FF8C00] font-mono">
            <MapPin className="w-3.5 h-3.5" />
            <span>Colombo • Kandy • Galle • Jaffna</span>
          </div>
        </div>

        {/* Col 2: Quick Navigation */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-white mb-3">Platform Navigation</h4>
          <ul className="space-y-2 text-xs">
            <li>
              <Link href="/" className="hover:text-orange-600 dark:hover:text-[#FF8C00] transition-colors">
                Public Home
              </Link>
            </li>
            <li>
              <Link href="/transparency" className="hover:text-orange-600 dark:hover:text-[#FF8C00] transition-colors">
                Public Transparency Map
              </Link>
            </li>
            <li>
              <Link href="/dashboard/citizen/report" className="hover:text-orange-600 dark:hover:text-[#FF8C00] transition-colors">
                Report an Infrastructure Issue
              </Link>
            </li>
            <li>
              <Link href="/dashboard/citizen" className="hover:text-orange-600 dark:hover:text-[#FF8C00] transition-colors">
                User Portal
              </Link>
            </li>
          </ul>
        </div>

        {/* Col 3: Stakeholders Ecosystem */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-white mb-3">Ecosystem & Roles</h4>
          <ul className="space-y-2 text-xs">
            <li>
              <Link href="/dashboard/verifier" className="hover:text-orange-600 dark:hover:text-[#FF8C00] transition-colors">
                Community Verifiers
              </Link>
            </li>
            <li>
              <Link href="/dashboard/ds-officer" className="hover:text-orange-600 dark:hover:text-[#FF8C00] transition-colors">
                Divisional Secretariats (DS Office)
              </Link>
            </li>
            <li>
              <Link href="/dashboard/agency" className="hover:text-orange-600 dark:hover:text-[#FF8C00] transition-colors">
                Road Development Authority (RDA) & NWSDB
              </Link>
            </li>
            <li>
              <Link href="/dashboard/ngo" className="hover:text-orange-600 dark:hover:text-[#FF8C00] transition-colors">
                NGO Partners & Rotary International
              </Link>
            </li>
          </ul>
        </div>

        {/* Col 4: Institutional Integrity */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-white mb-3">Institutional Standards</h4>
          <p className="text-xs text-slate-500 dark:text-[#B0B0B0] leading-relaxed mb-3">
            Designed specifically for Sri Lankan administrative boundaries, protecting private citizen metadata while exposing public progress.
          </p>
          <div className="inline-flex items-center gap-1 text-[11px] text-slate-400 dark:text-[#B0B0B0] font-mono">
            <span>Built for Sri Lanka Civic Tech Initiative</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-6 border-t border-slate-200 dark:border-[#333333] flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 dark:text-[#B0B0B0] gap-3">
        <p>© 2026 CivicPulse LK. All rights reserved.</p>
        <div className="flex items-center gap-1 text-slate-400 dark:text-[#B0B0B0]">
          <span>Empowering Sri Lankan communities with accountable infrastructure</span>
        </div>
      </div>
    </footer>
  );
}
