"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createReportSchema, type CreateReportInput } from "@/lib/validators";
import { PhotoUpload } from "@/components/shared/photo-upload";
import { MapView } from "@/components/shared/map-view";
import { CATEGORY_LABELS } from "@/lib/utils";
import {
  FilePlus,
  Send,
  Loader2,
  AlertCircle,
  CheckCircle2,
  MapPin,
} from "lucide-react";
import { useRouter } from "next/navigation";

export function ReportForm() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [photos, setPhotos] = useState<File[]>([]);
  const [coords, setCoords] = useState<{ lat: number; lng: number }>({
    lat: 6.9271, // Colombo default
    lng: 79.8612,
  });

  const SRI_LANKA_DISTRICTS = [
    "Ampara",
    "Anuradhapura",
    "Badulla",
    "Batticaloa",
    "Colombo",
    "Galle",
    "Gampaha",
    "Hambantota",
    "Jaffna",
    "Kalutara",
    "Kandy",
    "Kegalle",
    "Kilinochchi",
    "Kurunegala",
    "Mannar",
    "Matale",
    "Matara",
    "Moneragala",
    "Mullaitivu",
    "Nuwara Eliya",
    "Polonnaruwa",
    "Puttalam",
    "Ratnapura",
    "Trincomalee",
    "Vavuniya",
  ];

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<CreateReportInput>({
    resolver: zodResolver(createReportSchema),
    defaultValues: {
      category: "ROAD_DAMAGE",
      latitude: coords.lat,
      longitude: coords.lng,
    },
  });

  const handleLocationSelect = (lat: number, lng: number) => {
    setCoords({ lat, lng });
    setValue("latitude", lat);
    setValue("longitude", lng);
  };

  const onSubmit = async (data: CreateReportInput) => {
    setSubmitting(true);
    setErrorMsg(null);

    try {
      // 1. Submit report data
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || "Failed to submit report");
      }

      // 2. Redirect to My Reports or Report detail page
      router.push(`/reports/${result.report.id}?submitted=true`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Submission failed";
      setErrorMsg(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {errorMsg && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Category & District Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Category Selector */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-muted tracking-wide">
            Infrastructure Category *
          </label>
          <select
            {...register("category")}
            className="w-full px-4 py-3 rounded-xl bg-slate-950/45 border border-slate-850 text-foreground text-sm focus:border-emerald-500/85 focus:ring-4 focus:ring-emerald-500/10 hover:border-slate-700 transition-all duration-300 outline-none"
          >
            {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
              <option key={key} value={key} className="bg-slate-950 text-white">
                {label}
              </option>
            ))}
          </select>
          {errors.category && (
            <p className="text-xs text-red-400 font-semibold">{errors.category.message}</p>
          )}
        </div>

        {/* District Selector */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-muted tracking-wide">
            District / Jurisdiction
          </label>
          <select
            {...register("district")}
            className="w-full px-4 py-3 rounded-xl bg-slate-950/45 border border-slate-850 text-foreground text-sm focus:border-emerald-500/85 focus:ring-4 focus:ring-emerald-500/10 hover:border-slate-700 transition-all duration-300 outline-none"
          >
            <option value="" className="bg-slate-950">
              Select District (Optional)
            </option>
            {SRI_LANKA_DISTRICTS.map((d) => (
              <option key={d} value={d} className="bg-slate-950 text-white">
                {d}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Title Input */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-muted tracking-wide">
          Report Title *
        </label>
        <input
          type="text"
          placeholder="e.g. Severe pothole on Main Street near Bus Stand"
          {...register("title")}
          className="w-full px-4 py-3 rounded-xl bg-slate-950/45 border border-slate-850 text-foreground text-sm placeholder:text-slate-650 focus:border-emerald-500/85 focus:ring-4 focus:ring-emerald-500/10 hover:border-slate-700 transition-all duration-300 outline-none"
        />
        {errors.title && (
          <p className="text-xs text-red-400 font-semibold">{errors.title.message}</p>
        )}
      </div>

      {/* Description Textarea */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-muted tracking-wide">
          Detailed Description *
        </label>
        <textarea
          rows={4}
          placeholder="Describe the issue, estimated size/hazard, how long it has persisted, and any nearby landmarks..."
          {...register("description")}
          className="w-full px-4 py-3 rounded-xl bg-slate-950/45 border border-slate-850 text-foreground text-sm placeholder:text-slate-650 focus:border-emerald-500/85 focus:ring-4 focus:ring-emerald-500/10 hover:border-slate-700 transition-all duration-300 outline-none resize-none"
        />
        {errors.description && (
          <p className="text-xs text-red-400 font-semibold">{errors.description.message}</p>
        )}
      </div>

      {/* Address / Landmark */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-muted tracking-wide">
          Address / Nearest Landmark
        </label>
        <input
          type="text"
          placeholder="e.g. Opposite Post Office, Temple Road, Ward 4"
          {...register("address")}
          className="w-full px-4 py-3 rounded-xl bg-slate-950/45 border border-slate-850 text-foreground text-sm placeholder:text-slate-650 focus:border-emerald-500/85 focus:ring-4 focus:ring-emerald-500/10 hover:border-slate-700 transition-all duration-300 outline-none"
        />
      </div>

      {/* Photo Upload Section */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-muted tracking-wide">
          Photo Evidence
        </label>
        <PhotoUpload onPhotosChange={setPhotos} maxFiles={4} />
      </div>

      {/* GPS Location Picker */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-muted flex items-center gap-1.5 tracking-wide">
          <MapPin className="w-4 h-4 text-emerald-400 animate-pulse" />
          Location Coordinates (GPS) *
        </label>
        <MapView
          latitude={coords.lat}
          longitude={coords.lng}
          onLocationSelect={handleLocationSelect}
        />
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={submitting}
        className="w-full py-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-foreground font-bold text-sm sm:text-base shadow-xl shadow-emerald-650/15 hover:shadow-emerald-500/25 active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2.5 disabled:opacity-50 cursor-pointer"
      >
        {submitting ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Submitting & Running AI Triage...
          </>
        ) : (
          <>
            <Send className="w-5 h-5" />
            Submit Infrastructure Report
          </>
        )}
      </button>
    </form>
  );
}


