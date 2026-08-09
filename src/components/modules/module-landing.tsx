import Link from "next/link";
import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import type { PlatformModule } from "@/lib/platform-modules";

type ModuleLandingProps = {
  module: PlatformModule;
};

export function ModuleLanding({ module }: ModuleLandingProps) {
  const Icon = module.icon;

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-10">
      <Link
        href="/modules"
        className="inline-flex items-center gap-1.5 text-xs text-muted hover:text-primary transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        All platform modules
      </Link>

      <div className="space-y-4">
        <div
          className={`inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 ${module.accentClass} text-xs font-semibold`}
        >
          <Icon className="w-4 h-4" />
          CivicPulse LK Module
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
          {module.title}
        </h1>
        <p className="text-sm text-muted leading-relaxed max-w-3xl">
          {module.shortDescription}
        </p>
      </div>

      <div className="p-6 sm:p-8 rounded-3xl bg-surface border border-primary/20 space-y-4">
        <h2 className="text-sm font-bold text-foreground uppercase tracking-wide">
          Key capabilities
        </h2>
        <ul className="space-y-3">
          {module.features.map((feature) => (
            <li
              key={feature}
              className="flex items-start gap-3 text-sm text-muted leading-relaxed"
            >
              <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="space-y-4">
        <h2 className="text-sm font-bold text-foreground uppercase tracking-wide">
          How it works
        </h2>
        <ol className="space-y-4">
          {module.workflow.map((item, index) => (
            <li
              key={item.step}
              className="flex gap-4 p-4 rounded-2xl bg-surface/80 border border-primary/15"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 border border-primary/25 text-xs font-bold text-primary">
                {index + 1}
              </span>
              <div className="space-y-1">
                <p className="text-sm font-semibold text-foreground">{item.step}</p>
                <p className="text-xs text-muted leading-relaxed">{item.detail}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>

      <div className="p-6 rounded-2xl bg-surface border border-primary/25 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          {module.accessNote && (
            <p className="text-xs text-muted">{module.accessNote}</p>
          )}
          <Link
            href={module.ctaHref}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-primary to-primary-light hover:from-primary-light hover:to-primary text-foreground font-bold text-sm shadow-lg shadow-primary/20 transition-all"
          >
            {module.ctaLabel}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
