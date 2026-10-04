"use client";

import React, { useEffect, useState } from "react";
import { Camera, MapPin, Sparkles, CheckCircle2, Upload, AlertCircle, ArrowLeft, ArrowRight, LoaderCircle, RefreshCw, X } from "lucide-react";
import { Map, MapControls, MapMarker, MarkerContent } from "@/components/ui/map";
import { analyzeReportWithAi } from "@/lib/ai/triage";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { addSharedIssue } from "@/lib/report-sync";
import Link from "next/link";

type NominatimResult = {
  display_name: string;
  lat: string;
  lon: string;
};

type ReportPhoto = {
  id: string;
  src: string;
  file: File;
  status: "uploading" | "uploaded" | "failed";
  key?: string;
  error?: string;
};

export default function ReportIssuePage() {
  const { t } = useLanguage();

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [category, setCategory] = useState("ROADS");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("Bambalapitiya Junction, Galle Road, Colombo 04");
  const [lat, setLat] = useState(6.8905);
  const [lng, setLng] = useState(79.8550);
  const [locationSuggestions, setLocationSuggestions] = useState<NominatimResult[]>([]);
  const [isSearchingLocation, setIsSearchingLocation] = useState(false);
  const [isSelectionPending, setIsSelectionPending] = useState(false);
  const [photos, setPhotos] = useState<ReportPhoto[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [submittedCaseId, setSubmittedCaseId] = useState<string | null>(null);

  useEffect(() => {
    if (!address.trim() || isSelectionPending) {
      if (!address.trim()) {
        setLocationSuggestions([]);
      }
      return;
    }

    const timer = window.setTimeout(async () => {
      try {
        setIsSearchingLocation(true);
        const params = new URLSearchParams({
          format: "jsonv2",
          q: address.trim(),
          countrycodes: "lk",
          limit: "5",
        });

        const response = await fetch(`https://nominatim.openstreetmap.org/search?${params.toString()}`, {
          headers: {
            Accept: "application/json",
          },
        });

        if (!response.ok) {
          setLocationSuggestions([]);
          return;
        }

        const results = (await response.json()) as NominatimResult[];
        setLocationSuggestions(results);
      } catch (error) {
        setLocationSuggestions([]);
      } finally {
        setIsSearchingLocation(false);
      }
    }, 400);

    return () => window.clearTimeout(timer);
  }, [address, isSelectionPending]);

  const handleLocationSuggestionSelect = (result: NominatimResult) => {
    const nextLat = Number(result.lat);
    const nextLng = Number(result.lon);
    setAddress(result.display_name);
    setLat(nextLat);
    setLng(nextLng);
    setLocationSuggestions([]);
    setIsSelectionPending(true);
    window.setTimeout(() => setIsSelectionPending(false), 0);
  };

  const handleAiAssist = async () => {
    if (!title || !description) return;
    setIsAiLoading(true);
    try {
      const res = await analyzeReportWithAi(title, description, category, address);
      setAiSummary(res.summary);
    } catch (e) {
      setAiSummary("AI Advisory generated summary for DS Officer triage.");
    } finally {
      setIsAiLoading(false);
    }
  };

  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const hasUploadingPhotos = photos.some((photo) => photo.status === "uploading");
  const hasFailedPhotos = photos.some((photo) => photo.status === "failed");

  const uploadPhoto = async (photo: ReportPhoto) => {
    setSubmitError(null);
    setPhotos((current) => current.map((item) =>
      item.id === photo.id ? { ...item, status: "uploading", key: undefined, error: undefined } : item
    ));

    try {
      const body = new FormData();
      body.append("file", photo.file);
      const response = await fetch("/api/upload", { method: "POST", body, credentials: "include" });
      const result = (await response.json().catch(() => null)) as {
        success?: boolean;
        key?: string;
        error?: string;
      } | null;

      if (!response.ok || !result?.success || !result.key) {
        throw new Error(result?.error || `Photo upload failed (${response.status})`);
      }

      setPhotos((current) => current.map((item) =>
        item.id === photo.id ? { ...item, status: "uploaded", key: result.key, error: undefined } : item
      ));
    } catch (error) {
      const message = error instanceof Error ? error.message : "Photo upload failed";
      const details = error instanceof Error ? `${error.name}: ${error.message}` : String(error);
      console.error(`[REPORT PHOTO UPLOAD] photoId=${photo.id}: ${details}`);
      setPhotos((current) => current.map((item) =>
        item.id === photo.id ? { ...item, status: "failed", key: undefined, error: message } : item
      ));
    }
  };

  const removePhoto = (photo: ReportPhoto) => {
    URL.revokeObjectURL(photo.src);
    setPhotos((current) => current.filter((item) => item.id !== photo.id));
  };

  const renderPhotoGrid = () => (
    <div className="grid grid-cols-2 gap-4">
      {photos.map((photo, index) => (
        <div key={photo.id} className="relative h-40 overflow-hidden rounded-xl border border-slate-800 bg-slate-950">
          <img src={photo.src} alt={`Evidence ${index + 1}`} className="h-full w-full object-cover" />
          <div className="absolute inset-x-0 bottom-0 flex flex-wrap items-center justify-between gap-2 bg-black/75 px-2 py-1.5">
            <span
              className={`inline-flex items-center gap-1 text-[10px] ${
                photo.status === "uploaded" ? "text-emerald-300" : photo.status === "failed" ? "text-red-300" : "text-white"
              }`}
              role={photo.status === "failed" ? "alert" : "status"}
            >
              {photo.status === "uploading" ? <LoaderCircle className="h-3 w-3 animate-spin" /> : null}
              {photo.status === "uploaded" ? <CheckCircle2 className="h-3 w-3" /> : null}
              {photo.status === "failed" ? <AlertCircle className="h-3 w-3" /> : null}
              {photo.status === "uploading" ? "Uploading" : photo.status === "uploaded" ? "Uploaded" : "Failed"}
            </span>
            <div className="flex items-center gap-1">
              {photo.status === "failed" && (
                <button
                  type="button"
                  onClick={() => void uploadPhoto(photo)}
                  className="inline-flex items-center gap-1 rounded bg-slate-800 px-2 py-1 text-[10px] text-white hover:bg-slate-700"
                  aria-label={`Retry upload for photo ${index + 1}`}
                >
                  <RefreshCw className="h-3 w-3" />
                  Retry
                </button>
              )}
              <button
                type="button"
                onClick={() => removePhoto(photo)}
                className="rounded bg-slate-800 p-1 text-white hover:bg-slate-700"
                aria-label={`Remove photo ${index + 1}`}
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          </div>
          {photo.status === "failed" && photo.error && (
            <p className="absolute inset-x-0 top-0 truncate bg-red-950/90 px-2 py-1 text-[10px] text-red-100" title={photo.error}>
              {photo.error}
            </p>
          )}
        </div>
      ))}
    </div>
  );

  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    if (hasUploadingPhotos || hasFailedPhotos || photos.some((photo) => photo.status !== "uploaded" || !photo.key)) {
      setSubmitError("Finish or retry each photo upload before submitting.");
      return;
    }
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        credentials: "include",
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          category,
          latitude: lat,
          longitude: lng,
          address: address.trim() || undefined,
          photoKeys: photos.flatMap((photo) => (photo.key ? [photo.key] : [])),
        }),
      });
      const result = (await response.json()) as {
        success?: boolean;
        error?: string;
        report?: {
          id: string;
          caseNumber: string;
          title: string;
          description: string;
          category: string;
          status: string;
          latitude: number;
          longitude: number;
          address: string | null;
          createdAt: string;
        };
      };

      if (!response.ok || !result.success || !result.report) {
        throw new Error(result.error || "Unable to submit report");
      }

      const report = result.report;
      addSharedIssue({
        id: report.id,
        caseNumber: report.caseNumber,
        title: report.title,
        description: report.description,
        category: report.category,
        status: report.status,
        priorityScore: 66,
        address: report.address || "Colombo, Sri Lanka",
        dsDivisionName: "Colombo DS Office",
        createdAt: report.createdAt,
      });
      setSubmittedCaseId(report.caseNumber);
    } catch (error) {
      console.error("Report submission failed:", error);
      setSubmitError(error instanceof Error ? error.message : "Unable to submit report");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <Link
            href="/dashboard/citizen"
            className="text-xs font-semibold text-slate-400 hover:text-white flex items-center gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </Link>
          <span className="text-xs font-mono text-orange-400 font-bold">Step {step} of 4</span>
        </div>

        {/* Success Confirmation Modal */}
        {submittedCaseId ? (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center space-y-6 shadow-2xl animate-in zoom-in-95">
            <div className="w-16 h-16 rounded-full bg-orange-600/20 text-orange-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-black text-white">{t("form.success")}</h2>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Your report has been securely registered in the Sri Lanka CivicPulse network and sent to nearby verifiers.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 inline-block font-mono text-sm">
              <span className="text-slate-400">{t("form.caseId")} </span>
              <span className="text-emerald-400 font-bold">{submittedCaseId}</span>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
              <Link
                href="/dashboard/citizen"
                className="btn-glass-orange-solid w-full sm:w-auto px-6 py-3 text-xs"
              >
                Track Case Progress
              </Link>
              <button
                onClick={() => {
                  setSubmittedCaseId(null);
                  setStep(1);
                  setTitle("");
                  setDescription("");
                }}
                className="w-full sm:w-auto px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-bold text-xs"
              >
                Report Another Issue
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmitReport} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
            {/* Step 1: Issue Category & Details */}
            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-white">{t("form.step1")}</h2>
                  <p className="text-xs text-slate-400 mt-1">Select category and describe the infrastructure problem.</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                    {t("form.label.category")}
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {[
                      { id: "ROADS", label: "Roads & Potholes" },
                      { id: "DRAINAGE", label: "Drainage & Floods" },
                      { id: "STREETLIGHTS", label: "Streetlights" },
                      { id: "WATER", label: "Water Leakage" },
                      { id: "PUBLIC_BUILDINGS", label: "Public Structure" },
                      { id: "SANITATION", label: "Waste Disposal" },
                    ].map((cat) => (
                      <button
                        type="button"
                        key={cat.id}
                        onClick={() => setCategory(cat.id)}
                        className={`p-3 rounded-xl border text-xs font-bold text-left transition-all ${
                          category === cat.id
                            ? "bg-orange-950 border-orange-500 text-orange-300 shadow-md"
                            : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                    {t("form.label.title")}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Hazardous deep pothole on main road lane..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                      {t("form.label.description")}
                    </label>
                    <button
                      type="button"
                      onClick={handleAiAssist}
                      disabled={isAiLoading || !title}
                      className="text-xs text-orange-400 hover:text-orange-300 flex items-center gap-1 font-semibold disabled:opacity-50"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{isAiLoading ? "Analyzing..." : t("form.btn.aiAssist")}</span>
                    </button>
                  </div>
                  <textarea
                    rows={4}
                    required
                    placeholder="Provide exact details of the damage, safety hazard, or public impact..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs text-white focus:outline-none focus:border-orange-500"
                  />
                  {aiSummary && (
                    <div className="mt-2 p-3 rounded-xl bg-orange-950/60 border border-orange-800/80 text-xs text-orange-300">
                      <span className="font-bold">AI Summary Guidance: </span>
                      {aiSummary}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Step 2: Evidence Photos */}
            {step === 2 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-white">{t("form.step2")}</h2>
                  <p className="text-xs text-slate-400 mt-1">Upload clear photos showing the damaged infrastructure.</p>
                </div>

                <div
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { fileInputRef.current?.click(); } }}
                  onClick={() => { setUploadError(null); fileInputRef.current?.click(); }}
                  className="relative border-2 border-dashed border-slate-800 rounded-2xl p-8 text-center space-y-3 bg-slate-950 hover:border-slate-700 transition-colors cursor-pointer"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    multiple
                    capture="environment"
                    className="sr-only"
                    onChange={(e) => {
                      setUploadError(null);
                      const files = e.target.files;
                      if (!files || files.length === 0) return;

                      const newItems: ReportPhoto[] = [];
                      for (let i = 0; i < files.length; i++) {
                        const f = files[i];
                        // Validate type
                        if (!ACCEPTED_TYPES.includes(f.type)) {
                          setUploadError("Unsupported file type. Please upload JPG, PNG, or WebP images.");
                          continue;
                        }
                        // Validate size
                        if (f.size > MAX_FILE_SIZE) {
                          setUploadError("File is too large. Maximum allowed size is 10 MB.");
                          continue;
                        }
                        // Prevent duplicates by name+size
                        const exists = photos.some((p) => p.file?.name === f.name && p.file?.size === f.size);
                        if (exists) continue;
                        if (photos.length + newItems.length >= 5) {
                          setUploadError("A report can include up to 5 photos.");
                          break;
                        }

                        const objectUrl = URL.createObjectURL(f);
                          newItems.push({ id: crypto.randomUUID(), src: objectUrl, file: f, status: "uploading" });
                      }

                      if (newItems.length > 0) {
                        setPhotos((prev) => [...prev, ...newItems]);
                        newItems.forEach((item) => void uploadPhoto(item));
                      }

                      // Reset input to allow same file selection again
                      e.currentTarget.value = "";
                    }}
                  />

                  <Camera className="w-10 h-10 text-orange-400 mx-auto" />
                  <div>
                    <p className="text-xs font-bold text-white">Capture Photo or Upload from Gallery</p>
                    <p className="text-[11px] text-slate-500">Supports JPG, PNG, WebP up to 10MB</p>
                  </div>

                  {uploadError && (
                    <div className="absolute left-4 right-4 -bottom-10 text-xs text-red-400">
                      <AlertCircle className="w-4 h-4 inline-block mr-1 align-middle" />
                      <span>{uploadError}</span>
                    </div>
                  )}
                </div>

                {photos.length > 0 && (
                  <div>
                    <span className="text-xs font-bold text-slate-300 block mb-2">Evidence Photos</span>
                    {renderPhotoGrid()}
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Location Picker */}
            {step === 3 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-white">{t("form.step3")}</h2>
                  <p className="text-xs text-slate-400 mt-1">
                    GPS auto-detected: {lat.toFixed(5)}, {lng.toFixed(5)}. Drag the pin to fine-tune the exact coordinates.
                  </p>
                </div>
  
                <div className="relative">
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                    {t("form.label.address")}
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => {
                      const nextValue = e.target.value;
                      setAddress(nextValue);
                    }}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-orange-500 mb-4"
                    placeholder="Search for a place, landmark, or district in Sri Lanka..."
                  />

                  {address.trim() && (
                    <div className="absolute left-0 right-0 top-full z-20 mt-1 overflow-hidden rounded-xl border border-slate-700 bg-slate-950 shadow-2xl">
                      {isSearchingLocation ? (
                        <div className="px-3 py-2 text-xs text-slate-400">Searching locations...</div>
                      ) : locationSuggestions.length > 0 ? (
                        locationSuggestions.map((suggestion) => (
                          <button
                            key={`${suggestion.display_name}-${suggestion.lat}-${suggestion.lon}`}
                            type="button"
                            onClick={() => handleLocationSuggestionSelect(suggestion)}
                            className="block w-full border-b border-slate-800 px-3 py-2 text-left text-xs text-slate-200 transition-colors last:border-b-0 hover:bg-slate-900"
                          >
                            <div className="font-medium text-white">{suggestion.display_name}</div>
                            <div className="mt-0.5 text-[10px] text-slate-400">
                              {Number(suggestion.lat).toFixed(5)}, {Number(suggestion.lon).toFixed(5)}
                            </div>
                          </button>
                        ))
                      ) : (
                        <div className="px-3 py-2 text-xs text-slate-400">No matches found</div>
                      )}
                    </div>
                  )}
                </div>
  
                <div className="h-[420px] w-full relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-950">
                  <Map
                    className="h-[420px] w-full"
                    viewport={{ center: [lng, lat], zoom: 14 }}
                    dragRotate={false}
                    pitchWithRotate={false}
                  >
                    <MapControls
                      position="bottom-right"
                      showZoom={true}
                      showLocate={false}
                      showCompass={false}
                      showFullscreen={false}
                    />
 
                    <MapMarker
                      longitude={lng}
                      latitude={lat}
                      draggable={true}
                      onDrag={({ lng: nextLng, lat: nextLat }) => {
                        setLng(nextLng);
                        setLat(nextLat);
                      }}
                      onDragEnd={({ lng: nextLng, lat: nextLat }) => {
                        setLng(nextLng);
                        setLat(nextLat);
                      }}
                    >
                      <MarkerContent className="pointer-events-none">
                        <div className="relative flex h-8 w-8 items-center justify-center rounded-full border-4 border-white bg-orange-500 shadow-lg shadow-orange-950/60">
                          <MapPin className="h-4 w-4 text-white" />
                        </div>
                      </MarkerContent>
                    </MapMarker>
                  </Map>
                </div>
              </div>
            )}

            {/* Step 4: Final Review */}
            {step === 4 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-white">{t("form.step4")}</h2>
                  <p className="text-xs text-slate-400 mt-1">Review your report before submitting to the CivicPulse network.</p>
                </div>

                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-3 text-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <span className="text-slate-400">Category</span>
                    <span className="font-bold text-orange-400">{category}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-1">Title</span>
                    <span className="font-bold text-white text-sm">{title}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-1">Description</span>
                    <p className="text-slate-300 leading-relaxed">{description}</p>
                  </div>
                  <div className="pt-2 border-t border-slate-800">
                    <span className="text-slate-400 block mb-1">Location</span>
                    <span className="font-medium text-slate-200">{address}</span>
                  </div>
                </div>

                {photos.length > 0 && (
                  <section className="space-y-2" aria-label="Photo upload status">
                    <h3 className="text-xs font-bold text-slate-300">Evidence Photos</h3>
                    {renderPhotoGrid()}
                    {hasUploadingPhotos && <p className="text-xs text-slate-300">Photo uploads are still in progress.</p>}
                    {hasFailedPhotos && <p className="text-xs text-red-300">Retry or remove failed photos before submitting.</p>}
                  </section>
                )}
              </div>
            )}

            {/* Navigation Buttons */}
            {submitError && (
              <div role="alert" className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-xs text-red-300">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{submitError}</span>
              </div>
            )}
            <div className="flex items-center justify-between pt-4 border-t border-slate-800">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={() => setStep((step - 1) as any)}
                  className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold"
                >
                  Previous
                </button>
              ) : (
                <div />
              )}

              {step < 4 ? (
                <button
                  type="button"
                  onClick={() => setStep((step + 1) as any)}
                  className="btn-glass-orange-solid px-6 py-2.5 text-xs flex items-center gap-1.5"
                >
                  <span>Next Step</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting || hasUploadingPhotos || hasFailedPhotos}
                  className="btn-glass-orange-solid px-8 py-3 text-xs disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isSubmitting ? "Submitting..." : t("form.btn.submit")}
                </button>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
