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
      <div className="space-y-2">
        <label className="text-xs font-semibold text-slate-300">
          Your Verification Decision *
        </label>
        <div className="grid grid-cols-3 gap-3">
          <button
            type="button"
            onClick={() => setStatus("CONFIRMED")}
            className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
              status === "CONFIRMED"
                ? "bg-teal-500/20 border-teal-500 text-teal-300 font-bold"
                : "bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700"
            }`}
          >
            <CheckCircle2 className="w-5 h-5 text-teal-400" />
            <span className="text-xs">Confirm Authenticity</span>
          </button>

          <button
            type="button"
            onClick={() => setStatus("DISPUTED")}
            className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
              status === "DISPUTED"
                ? "bg-red-500/20 border-red-500 text-red-300 font-bold"
                : "bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700"
            }`}
          >
            <XCircle className="w-5 h-5 text-red-400" />
            <span className="text-xs">Dispute / False</span>
          </button>

          <button
            type="button"
            onClick={() => setStatus("NEEDS_INFO")}
            className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
              status === "NEEDS_INFO"
                ? "bg-amber-500/20 border-amber-500 text-amber-300 font-bold"
                : "bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700"
            }`}
          >
            <HelpCircle className="w-5 h-5 text-amber-400" />
            <span className="text-xs">Needs More Info</span>
          </button>
        </div>
      </div>

      {/* Optional Comment */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-slate-300">
          Verification Notes / Field Observation
        </label>
        <textarea
          rows={3}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Add details about your physical check (e.g., 'Inspected on site, pothole spans full lane width')..."
          className="w-full px-4 py-3 rounded-xl bg-slate-950/60 border border-slate-800 text-white text-sm placeholder:text-slate-500 focus:border-teal-500 transition-colors resize-none"
        />
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={submitting}
        className="w-full py-3.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50"
      >
        {submitting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
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
