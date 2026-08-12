"use client";

import { useState } from "react";
import { CheckCircle2, XCircle, HelpCircle, Loader2, Send } from "lucide-react";
import { useRouter } from "next/navigation";

interface VerifyFormProps {
  reportId: string;
}

export function VerifyForm({ reportId }: VerifyFormProps) {
  const router = useRouter();
  const [status, setStatus] = useState<"CONFIRMED" | "DISPUTED" | "NEEDS_INFO">("CONFIRMED");
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/verifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reportId, status, comment }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit verification");
      }

      router.push(`/reports/${reportId}`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Verification failed";
      setErrorMsg(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {errorMsg && (
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
          {errorMsg}
        </div>
      )}

      {/* Decision Buttons */}
      <div className="space-y-2.5">
        <label className="text-xs font-semibold text-muted tracking-wide">
          Your Verification Decision *
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            type="button"
            onClick={() => setStatus("CONFIRMED")}
            className={`p-4 rounded-2xl border flex flex-col items-center gap-2 transition-all duration-300 cursor-pointer ${
              status === "CONFIRMED"
                ? "bg-teal-500/10 border-teal-500 text-teal-350 font-bold shadow-lg shadow-teal-500/5 scale-[1.02]"
                : "bg-slate-950/45 border-slate-850 text-muted hover:border-slate-700 hover:bg-slate-900/30"
            }`}
          >
            <CheckCircle2 className={`w-5 h-5 transition-colors duration-300 ${status === "CONFIRMED" ? "text-teal-400" : "text-subtle"}`} />
            <span className="text-xs">Confirm Authenticity</span>
          </button>

          <button
            type="button"
            onClick={() => setStatus("DISPUTED")}
            className={`p-4 rounded-2xl border flex flex-col items-center gap-2 transition-all duration-300 cursor-pointer ${
              status === "DISPUTED"
                ? "bg-red-500/10 border-red-500 text-red-350 font-bold shadow-lg shadow-red-500/5 scale-[1.02]"
                : "bg-slate-950/45 border-slate-850 text-muted hover:border-slate-700 hover:bg-slate-900/30"
            }`}
          >
            <XCircle className={`w-5 h-5 transition-colors duration-300 ${status === "DISPUTED" ? "text-red-400" : "text-subtle"}`} />
            <span className="text-xs">Dispute / False</span>
          </button>

          <button
            type="button"
            onClick={() => setStatus("NEEDS_INFO")}
            className={`p-4 rounded-2xl border flex flex-col items-center gap-2 transition-all duration-300 cursor-pointer ${
              status === "NEEDS_INFO"
                ? "bg-amber-500/10 border-amber-500 text-amber-350 font-bold shadow-lg shadow-amber-500/5 scale-[1.02]"
                : "bg-slate-950/45 border-slate-850 text-muted hover:border-slate-700 hover:bg-slate-900/30"
            }`}
          >
            <HelpCircle className={`w-5 h-5 transition-colors duration-300 ${status === "NEEDS_INFO" ? "text-amber-400" : "text-subtle"}`} />
            <span className="text-xs">Needs More Info</span>
          </button>
        </div>
      </div>

      {/* Optional Comment */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-muted tracking-wide">
          Verification Notes / Field Observation
        </label>
        <textarea
          rows={3}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Add details about your physical check (e.g., 'Inspected on site, pothole spans full lane width')..."
          className="w-full px-4 py-3 rounded-xl bg-slate-950/45 border border-slate-850 text-foreground text-sm placeholder:text-slate-650 focus:border-teal-500/85 focus:ring-4 focus:ring-teal-500/10 hover:border-slate-700 transition-all duration-300 outline-none resize-none"
        />
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={submitting}
        className="w-full py-4 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-500 hover:from-teal-500 hover:to-emerald-450 text-foreground font-bold text-sm sm:text-base shadow-xl shadow-teal-650/15 hover:shadow-teal-500/25 active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2.5 disabled:opacity-50 cursor-pointer"
      >
        {submitting ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Submitting Verification...
          </>
        ) : (
          <>
            <Send className="w-4 h-4" />
            Submit Verification (+5 Trust Points)
          </>
        )}
      </button>
    </form>
  );
}


