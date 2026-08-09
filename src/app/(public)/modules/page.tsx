import Link from "next/link";
import { ArrowRight, Layers } from "lucide-react";
import { PLATFORM_MODULE_LIST } from "@/lib/platform-modules";

export default function PlatformModulesIndexPage() {
  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-10">
      <div className="max-w-3xl space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold">
          <Layers className="w-4 h-4" />
          Platform Modules
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
          CivicPulse LK Platform Modules
        </h1>
        <p className="text-sm text-muted leading-relaxed">
          Four integrated modules connect citizens, community verifiers, Divisional Secretariat
          offices, and the public. Choose a module to learn how it works, then jump into the live
          tool.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {PLATFORM_MODULE_LIST.map((mod) => {
          const Icon = mod.icon;
          return (
            <Link
              key={mod.slug}
              href={`/modules/${mod.slug}`}
              className="group p-6 rounded-2xl bg-surface border border-primary/20 hover:border-primary/40 transition-all space-y-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div
                  className={`w-11 h-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center ${mod.accentClass}`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <ArrowRight className="w-5 h-5 text-muted group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0" />
              </div>
              <div className="space-y-2">
                <h2 className="text-lg font-bold text-foreground">{mod.footerLabel}</h2>
                <p className="text-xs text-muted leading-relaxed line-clamp-3">
                  {mod.shortDescription}
                </p>
              </div>
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary">
                Learn more
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
