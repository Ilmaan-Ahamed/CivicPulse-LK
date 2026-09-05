"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { PlusCircle, MapPin, Clock, CheckCircle2, ShieldCheck, Search, Filter, HeartHandshake, Camera, XCircle, SkipForward, AlertTriangle, Award } from "lucide-react";
import { CaseCard, CaseCardData } from "@/components/shared/CaseCard";
import { InteractiveMap } from "@/components/map/InteractiveMap";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { TrustScore } from "@/components/ui/TrustScore";
import { PriorityIndicator } from "@/components/ui/PriorityIndicator";
import { useAuth } from "@/lib/auth/AuthContext";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { useSharedIssues } from "@/lib/report-sync";

export default function CitizenDashboard() {
  const { currentUser } = useAuth();
  const { t } = useLanguage();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState<"my-reports" | "nearby" | "verification" | "inspections">("my-reports");
  const sharedIssues = useSharedIssues();
  const [dbReports, setDbReports] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/transparency")
      .then(async (response) => {
        if (!response.ok) throw new Error("Failed");
        const data = (await response.json()) as { cases?: any[] };
        setDbReports(data.cases || []);
      })
      .catch(() => setDbReports([]));
  }, []);

  useEffect(() => {
    if (tabParam === "verification") {
      setActiveTab("verification");
    } else if (tabParam === "inspections") {
      setActiveTab("inspections");
    }
  }, [tabParam]);

  const citizenSeedReports: CaseCardData[] = [
    {
      id: "case-1042",
      caseNumber: "CP-2026-1042",
      title: "Hazardous Deep Potholes near Bambalapitiya Junction",
      description: "Severe road surface damage causing vehicle accidents and traffic congestion on A2 main corridor near Galle Road Bamba junction.",
      category: "ROADS",
      status: "VERIFIED",
      priorityScore: 88.5,
      address: "Galle Road, Bambalapitiya, Colombo 04",
      dsDivisionName: "Colombo DS Office",
      imageUrl: "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80",
      verificationCount: 4,
      verificationThreshold: 3,
      createdAt: "2026-08-10",
    },
  ];

  const [verificationQueue, setVerificationQueue] = useState([
    {
      id: "case-1044",
      caseNumber: "CP-2026-1044",
      title: "Non-Functional Streetlights on Kandy Peradeniya Corridor",
      description: "Five consecutive solar streetlights have gone dark along the main university access road, compromising safety at night.",
      category: "STREETLIGHTS",
      priorityScore: 62.0,
      distance: "0.8 km away",
      address: "Gatembe, Peradeniya Road, Kandy",
      imageUrl: "https://images.unsplash.com/photo-1509114397022-ed747cca3f65?auto=format&fit=crop&w=800&q=80",
      currentConfirmations: 2,
      threshold: 3,
      reporterTrust: 85.0,
      aiDuplicateNotice: "Advisory: 1 similar streetlight issue reported 3.2km away.",
    },
  ]);

  const [verificationHistory, setVerificationHistory] = useState([
    {
      id: "case-1042",
      caseNumber: "CP-2026-1042",
      title: "Hazardous Deep Potholes near Bambalapitiya Junction",
      decision: "CONFIRMED",
      timestamp: "Aug 11, 2026",
    },
  ]);

  const [inspectionTasks, setInspectionTasks] = useState([
    {
      id: "task-01",
      caseNumber: "CP-2026-1042",
      title: "Field Verification: Bambalapitiya Pothole Depth Inspection",
      taskType: "FIELD_INSPECTION",
      address: "Galle Road, Bambalapitiya, Colombo 04",
      distance: "1.1 km away",
      dueDate: "Today by 5:00 PM",
    },
  ]);

  const [inspectingTask, setInspectingTask] = useState<any | null>(null);
  const [observedCondition, setObservedCondition] = useState("");
  const [notes, setNotes] = useState("");
  const [isInspectionSubmitted, setIsInspectionSubmitted] = useState(false);
  const [uploadedPhotos, setUploadedPhotos] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);

  const handleVerificationDecision = (id: string, decision: "CONFIRM" | "DISPUTE" | "SKIP") => {
    const item = verificationQueue.find((c) => c.id === id);
    setVerificationQueue(verificationQueue.filter((c) => c.id !== id));

    if (item && (decision === "CONFIRM" || decision === "DISPUTE")) {
      setVerificationHistory([
        {
          id: item.id,
          caseNumber: item.caseNumber,
          title: item.title,
          decision: decision === "CONFIRM" ? "CONFIRMED" : "DISPUTED",
          timestamp: "Just now",
        },
        ...verificationHistory,
      ]);
    }
  };

  const handleSubmitInspection = (e: React.FormEvent) => {
    e.preventDefault();
    setIsInspectionSubmitted(true);
    setTimeout(() => {
      setIsInspectionSubmitted(false);
      setInspectingTask(null);
      setInspectionTasks([]);
      setUploadedPhotos([]);
      setPhotoPreviews([]);
      setObservedCondition("");
      setNotes("");
    }, 1500);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const newPhotos = [...uploadedPhotos, ...files];
    setUploadedPhotos(newPhotos);

    // Create previews for new files
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreviews((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (index: number) => {
    setUploadedPhotos((prev) => prev.filter((_, i) => i !== index));
    setPhotoPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const closeInspectionDialog = () => {
    setInspectingTask(null);
    setUploadedPhotos([]);
    setPhotoPreviews([]);
    setObservedCondition("");
    setNotes("");
  };

  const sharedCitizenReports: CaseCardData[] = Array.from(
    new Map(
      sharedIssues.map((issue) => [issue.id, {
        id: issue.id,
        caseNumber: issue.caseNumber,
        title: issue.title,
        description: issue.description,
        category: issue.category,
        status: issue.status,
        priorityScore: issue.priorityScore,
        address: issue.address,
        dsDivisionName: issue.dsDivisionName,
        imageUrl: issue.imageUrl,
        verificationCount: 1,
        verificationThreshold: 3,
        createdAt: issue.createdAt,
      }]),
    ).values(),
  );

  const myReports: CaseCardData[] = [...sharedCitizenReports, ...citizenSeedReports];
  const nearbyReports: CaseCardData[] = [
    ...sharedCitizenReports,
    {
      id: "case-1043",
      caseNumber: "CP-2026-1043",
      title: "Blocked Main Canal Causing Pettah Market Flooding",
      description: "Polythene and debris blockages in the primary drainage channel adjacent to Central Bus Stand during heavy rains.",
      category: "DRAINAGE",
      status: "IN_PROGRESS",
      priorityScore: 76.0,
      address: "Bodhiraja Mawatha, Pettah, Colombo 11",
      dsDivisionName: "Colombo DS Office",
      imageUrl: "https://images.unsplash.com/photo-1541888946425-d0fbb186a5b7?auto=format&fit=crop&w=800&q=80",
      verificationCount: 3,
      verificationThreshold: 3,
      createdAt: "2026-08-11",
    },
  ];

  const mapMarkers = [...sharedCitizenReports, ...nearbyReports, ...dbReports].reduce<Array<{
    id: string;
    title: string;
    category: string;
    status: string;
    latitude: number;
    longitude: number;
    address: string;
  }>>((acc, report) => {
    if (acc.some((item) => item.id === report.id)) return acc;

    const lat = report.latitude || (report.category === "ROADS" ? 6.8905 : report.category === "DRAINAGE" ? 6.9344 : report.category === "WATER" ? 6.0268 : 7.2625);
    const lng = report.longitude || (report.category === "ROADS" ? 79.855 : report.category === "DRAINAGE" ? 79.8519 : report.category === "WATER" ? 80.217 : 80.5972);

    acc.push({
      id: report.id,
      title: report.title,
      category: report.category,
      status: report.status,
      latitude: lat,
      longitude: lng,
      address: report.address,
    });

    return acc;
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground py-8 px-4 sm:px-6 lg:px-8 space-y-8 transition-colors duration-300">
      {/* Header Banner */}
      <div className="max-w-7xl mx-auto card-light dark:bg-[#0a0a0a] dark:border-[#333333] rounded-3xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <span className="text-xs font-mono font-bold text-[#F97316] dark:text-[#FF8C00] uppercase tracking-wider">
            {currentUser.dsDivisionName}
          </span>
          <h1 className="text-2xl page-title dark:text-white">{t("dash.citizen.title")}</h1>
          <p className="text-xs body-text dark:text-[#B0B0B0]">
            Welcome back, <span className="font-semibold text-slate-800 dark:text-white">{currentUser.name}</span>. Report public infrastructure hazards or track community updates.
          </p>
        </div>

        {/* Primary CTA Button */}
        <Link
          href="/dashboard/citizen/report"
          className="btn-primary-orange px-6 py-3 text-xs flex items-center justify-center gap-2 shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>{t("hero.cta.report")}</span>
        </Link>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto flex items-center gap-4 border-b border-border dark:border-[#333333] pb-3">
        <button
          onClick={() => setActiveTab("my-reports")}
          className={`text-xs font-bold px-4 py-2 rounded-xl transition-colors ${
            activeTab === "my-reports" ? "bg-[#F97316] dark:bg-[#FF8C00] text-white" : "text-slate-600 dark:text-[#B0B0B0] hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          My Reports ({myReports.length})
        </button>
        <button
          onClick={() => setActiveTab("nearby")}
          className={`text-xs font-bold px-4 py-2 rounded-xl transition-colors ${
            activeTab === "nearby" ? "bg-[#F97316] dark:bg-[#FF8C00] text-white" : "text-slate-600 dark:text-[#B0B0B0] hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          Nearby ({nearbyReports.length})
        </button>
        <button
          onClick={() => setActiveTab("verification")}
          className={`text-xs font-bold px-4 py-2 rounded-xl transition-colors ${
            activeTab === "verification" ? "bg-[#F97316] dark:bg-[#FF8C00] text-white" : "text-slate-600 dark:text-[#B0B0B0] hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <ShieldCheck className="w-3 h-3 inline mr-1" />
          Verification ({verificationQueue.length})
        </button>
        <button
          onClick={() => setActiveTab("inspections")}
          className={`text-xs font-bold px-4 py-2 rounded-xl transition-colors ${
            activeTab === "inspections" ? "bg-[#F97316] dark:bg-[#FF8C00] text-white" : "text-slate-600 dark:text-[#B0B0B0] hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <HeartHandshake className="w-3 h-3 inline mr-1" />
          Inspections ({inspectionTasks.length})
        </button>
      </div>

      <div className="max-w-7xl mx-auto card-light dark:bg-slate-900 dark:border-slate-800 rounded-3xl p-4 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-base card-heading dark:text-white">MapCN.dev issue map</h2>
            <p className="text-[11px] body-text dark:text-slate-400">Live citizen reports visible to your dashboard with permission-based access.</p>
          </div>
          <span className="text-[10px] font-mono text-orange-400">{mapMarkers.length} visible issues</span>
        </div>
        <InteractiveMap markers={mapMarkers} center={[6.9271, 79.8612]} zoom={11} />
      </div>

      {/* Tab Content */}
      {activeTab === "my-reports" || activeTab === "nearby" ? (
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          {(activeTab === "my-reports" ? myReports : nearbyReports).map((c) => (
            <CaseCard key={c.id} caseData={c} />
          ))}
        </div>
      ) : activeTab === "verification" ? (
        <div className="max-w-7xl mx-auto">
          {verificationQueue.length === 0 ? (
            <div className="card-light dark:bg-slate-900 dark:border-slate-800 rounded-3xl p-12 text-center space-y-3">
              <CheckCircle2 className="w-10 h-10 icon-orange dark:text-orange-400 mx-auto" />
              <h3 className="text-base card-heading dark:text-white">Queue Caught Up!</h3>
              <p className="text-xs body-text dark:text-slate-400">All nearby community reports have been verified.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {verificationQueue.map((item) => (
                <div
                  key={item.id}
                  className="card-light dark:bg-slate-900 dark:border-slate-800 rounded-3xl p-6 grid grid-cols-1 lg:grid-cols-3 gap-6 items-center shadow-xl"
                >
                  <div className="relative h-48 rounded-2xl overflow-hidden card-light dark:bg-slate-950">
                    <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                    <div className="absolute top-2 left-2">
                      <span className="px-2 py-0.5 rounded card-light dark:bg-slate-950/80 backdrop-blur-md text-[10px] font-mono card-heading dark:text-white font-bold">
                        {item.distance}
                      </span>
                    </div>
                  </div>

                  <div className="lg:col-span-2 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs text-orange-400 font-bold">{item.caseNumber}</span>
                      <PriorityIndicator score={item.priorityScore} />
                    </div>

                    <h3 className="text-lg card-heading dark:text-white">{item.title}</h3>
                    <p className="text-xs body-text dark:text-slate-400 leading-relaxed">{item.description}</p>

                    {item.aiDuplicateNotice && (
                      <div className="p-2.5 rounded-xl card-light dark:bg-amber-950/50 dark:border-amber-800/80 text-[11px] icon-orange dark:text-amber-300 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 shrink-0" />
                        <span>{item.aiDuplicateNotice}</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-2 text-xs border-t border-[var(--border)] dark:border-slate-800">
                      <span className="body-text dark:text-slate-400">
                        Confirmations: <strong className="card-heading dark:text-white">{item.currentConfirmations}/{item.threshold}</strong>
                      </span>
                      <span className="text-slate-400">Reporter Trust: {item.reporterTrust}%</span>
                    </div>

                    <div className="grid grid-cols-3 gap-3 pt-3">
                      <button
                        onClick={() => handleVerificationDecision(item.id, "CONFIRM")}
                        className="btn-glass-orange-solid py-2 px-4 text-xs flex items-center justify-center gap-1.5"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Confirm</span>
                      </button>

                      <button
                        onClick={() => handleVerificationDecision(item.id, "DISPUTE")}
                        className="py-2 px-4 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-800 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>Dispute</span>
                      </button>

                      <button
                        onClick={() => handleVerificationDecision(item.id, "SKIP")}
                        className="py-2 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5"
                      >
                        <SkipForward className="w-4 h-4" />
                        <span>Skip</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : activeTab === "inspections" ? (
        <div className="max-w-7xl mx-auto space-y-4">
          <h2 className="text-lg page-title dark:text-white">Field Inspection Opportunities</h2>

          {inspectionTasks.length === 0 ? (
            <div className="card-light dark:bg-slate-900 dark:border-slate-800 rounded-3xl p-12 text-center space-y-3">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
              <h3 className="text-base card-heading dark:text-white">All Tasks Completed!</h3>
              <p className="text-xs body-text dark:text-slate-400">No pending field inspections in your area.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {inspectionTasks.map((task) => (
                <div key={task.id} className="card-light dark:bg-slate-900 dark:border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs text-purple-400 font-bold">{task.caseNumber}</span>
                    <span className="text-xs text-slate-400 font-mono">{task.distance}</span>
                  </div>

                  <div>
                    <h3 className="text-base card-heading dark:text-white">{task.title}</h3>
                    <p className="text-xs body-text dark:text-slate-400 mt-1">{task.address}</p>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-[var(--border)] dark:border-slate-800">
                    <span className="text-xs body-text dark:text-slate-500">Due: {task.dueDate}</span>
                    <button
                      onClick={() => setInspectingTask(task)}
                      className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-purple-600/20"
                    >
                      <Camera className="w-4 h-4" />
                      <span>Submit Evidence</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : null}

      {/* Field Evidence Inspection Dialog */}
      {inspectingTask && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleSubmitInspection}
            className="card-light dark:bg-slate-900 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 space-y-6 shadow-2xl"
          >
            <div className="border-b border-slate-800 pb-3">
              <span className="font-mono icon-orange dark:text-purple-400 font-bold">{inspectingTask.caseNumber}</span>
              <h3 className="text-lg card-heading dark:text-white">Field Inspection Evidence Capture</h3>
            </div>

            {isInspectionSubmitted ? (
              <div className="py-8 text-center space-y-2">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto animate-bounce" />
                <h4 className="text-lg card-heading dark:text-white">Evidence Submitted!</h4>
                <p className="text-xs body-text dark:text-slate-400">Attached to case timeline.</p>
              </div>
            ) : (
              <>
                <div>
                  <label className="block text-xs font-bold card-heading dark:text-slate-300 uppercase tracking-wider mb-2">
                    Observed Physical Condition
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Pothole measures 2.1m wide, 18cm deep. Water accumulating."
                    value={observedCondition}
                    onChange={(e) => setObservedCondition(e.target.value)}
                    className="w-full card-light dark:bg-slate-950 dark:border-slate-800 rounded-xl px-4 py-3 text-xs card-heading dark:text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold card-heading dark:text-slate-300 uppercase tracking-wider mb-2">
                    Field Inspection Notes & Safety Advice
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Notes on surrounding safety hazard, pedestrian access, or temporary barriers..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full card-light dark:bg-slate-950 dark:border-slate-800 rounded-xl p-3 text-xs card-heading dark:text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold card-heading dark:text-slate-300 uppercase tracking-wider mb-2">
                    Upload Evidence Photos
                  </label>
                  <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-4 text-center hover:border-purple-500 dark:hover:border-purple-500 transition-colors">
                    <input
                      type="file"
                      id="photo-upload"
                      accept="image/*"
                      multiple
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                    <label
                      htmlFor="photo-upload"
                      className="cursor-pointer flex flex-col items-center gap-2"
                    >
                      <Camera className="w-8 h-8 text-slate-400 dark:text-slate-500" />
                      <span className="text-xs body-text dark:text-slate-400">
                        Click to upload photos or drag and drop
                      </span>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500">
                        PNG, JPG up to 10MB each
                      </span>
                    </label>
                  </div>
                </div>

                {photoPreviews.length > 0 && (
                  <div>
                    <label className="block text-xs font-bold card-heading dark:text-slate-300 uppercase tracking-wider mb-2">
                      Uploaded Photos ({photoPreviews.length})
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {photoPreviews.map((preview, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={preview}
                            alt={`Evidence ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg border border-slate-300 dark:border-slate-700"
                          />
                          <button
                            type="button"
                            onClick={() => removePhoto(index)}
                            className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={closeInspectionDialog}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold text-xs shadow-lg shadow-purple-600/30"
                  >
                    Submit Field Report
                  </button>
                </div>
              </>
            )}
          </form>
        </div>
      )}
    </div>
  );
}
