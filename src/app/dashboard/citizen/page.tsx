"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { PlusCircle, MapPin, Clock, CheckCircle2, ShieldCheck, Search, Filter, HeartHandshake, Camera, XCircle, SkipForward, AlertTriangle, Award, Edit, Trash2, X, AlertCircle } from "lucide-react";
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
  const [activeTab, setActiveTab] = useState<"my-reports" | "nearby" | "verification" | "inspections" | "notifications">("my-reports");
  const sharedIssues = useSharedIssues();
  const [dbReports, setDbReports] = useState<any[]>([]);
  const [transparencyReports, setTransparencyReports] = useState<any[]>([]);

  // Deduplicate sharedIssues with useMemo to prevent infinite loop
  const uniqueSharedIssues = React.useMemo(
    () => Array.from(new Map(sharedIssues.map((issue) => [issue.id, issue])).values()),
    [sharedIssues]
  );

  const [verificationQueue, setVerificationQueue] = useState<any[]>([]);
  const [verificationHistory, setVerificationHistory] = useState<any[]>([]);
  const [inspectionTasks, setInspectionTasks] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [selectedReportHistory, setSelectedReportHistory] = useState<any | null>(null);

  useEffect(() => {
    // Fetch reports from database (role-filtered)
    fetch("/api/reports/dashboard")
      .then(async (response) => {
        if (!response.ok) throw new Error("Failed");
        const data = await response.json();
        setDbReports(Array.from(new Map((data.data || []).map((r: any) => [r.id, r])).values()));
      })
      .catch(() => setDbReports([]));

    // Fetch all reports for map (like transparency page)
    fetch("/api/transparency")
      .then(async (response) => {
        if (!response.ok) throw new Error("Failed");
        const data = await response.json();
        setTransparencyReports(Array.from(new Map((data.cases || []).map((r: any) => [r.id, r])).values()));
      })
      .catch(() => setTransparencyReports([]));

    // Fetch verification queue
    fetch("/api/verification-queue")
      .then(async (response) => {
        if (!response.ok) throw new Error("Failed");
        const data = await response.json();
        setVerificationQueue(data.data || []);
      })
      .catch(() => setVerificationQueue([]));

    // Fetch inspection tasks (for citizens, show their own reports that are being inspected)
    fetch("/api/reports/dashboard?status=IN_PROGRESS")
      .then(async (response) => {
        if (!response.ok) throw new Error("Failed");
        const data = await response.json();
        // Map reports to inspection task format
        const tasks = (data.data || []).map((r: any) => ({
          id: r.id,
          caseNumber: r.caseNumber,
          title: r.title,
          description: r.description,
          category: r.category,
          address: r.address,
          status: r.status,
          priorityScore: r.priorityScore,
        }));
        setInspectionTasks(tasks);
      })
      .catch(() => setInspectionTasks([]));

    // Fetch notifications
    fetch("/api/notifications")
      .then(async (response) => {
        if (!response.ok) throw new Error("Failed");
        const data = await response.json();
        setNotifications(data.data || []);
      })
      .catch(() => setNotifications([]));

    // Fetch unread count
    fetch("/api/notifications/unread-count")
      .then(async (response) => {
        if (!response.ok) throw new Error("Failed");
        const data = await response.json();
        setUnreadCount(data.count || 0);
      })
      .catch(() => setUnreadCount(0));

    if (tabParam === "verification") {
      setActiveTab("verification");
    } else if (tabParam === "inspections") {
      setActiveTab("inspections");
    }
  }, [tabParam]);


  const [inspectingTask, setInspectingTask] = useState<any | null>(null);
  const [observedCondition, setObservedCondition] = useState("");
  const [notes, setNotes] = useState("");
  const [isInspectionSubmitted, setIsInspectionSubmitted] = useState(false);
  const [uploadedPhotos, setUploadedPhotos] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);

  // Edit and Delete state
  const [editingReport, setEditingReport] = useState<CaseCardData | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editAddress, setEditAddress] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editError, setEditError] = useState("");
  const [deletingReportId, setDeletingReportId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleVerificationDecision = async (id: string, decision: "CONFIRM" | "DISPUTE" | "SKIP") => {
    const item = verificationQueue.find((c) => c.id === id);
    
    if (decision === "SKIP") {
      setVerificationQueue(verificationQueue.filter((c) => c.id !== id));
      return;
    }

    if (!item) return;

    try {
      const response = await fetch("/api/verifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reportId: id,
          status: decision === "CONFIRM" ? "CONFIRMED" : "DISPUTED",
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        console.error("Verification failed:", result.error);
        return;
      }

      // Remove from queue and add to history
      setVerificationQueue(verificationQueue.filter((c) => c.id !== id));
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

      // Refresh verification queue
      fetch("/api/verification-queue")
        .then(async (res) => {
          if (res.ok) {
            const data = await res.json();
            setVerificationQueue(data.data || []);
          }
        })
        .catch(() => {});
    } catch (error) {
      console.error("Verification submission error:", error);
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

  const handleEditReport = (report: CaseCardData) => {
    setEditingReport(report);
    setEditTitle(report.title);
    setEditDescription(report.description);
    setEditCategory(report.category);
    setEditAddress(report.address);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingReport) return;

    setEditError("");
    setIsEditing(true);
    try {
      const response = await fetch(`/api/reports/${editingReport.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editTitle,
          description: editDescription,
          category: editCategory,
          address: editAddress,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        setEditError(result.error || "Failed to save changes");
        return;
      }

      // Refresh reports
      fetch("/api/reports/dashboard")
        .then(async (res) => {
          if (res.ok) {
            const data = await res.json();
            setDbReports(Array.from(new Map((data.data || []).map((r: any) => [r.id, r])).values()));
          }
        })
        .catch(() => {});

      setEditingReport(null);
    } catch (error) {
      setEditError("Failed to save changes. Please try again.");
    } finally {
      setIsEditing(false);
    }
  };

  const handleDeleteReport = async (reportId: string) => {
    setDeletingReportId(reportId);
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/reports/${reportId}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        console.error("Delete failed:", result.error);
        alert(`Delete failed: ${result.error || "Unknown error"}`);
        return;
      }

      // Refresh reports and close dialog
      await fetch("/api/reports/dashboard")
        .then(async (res) => {
          if (res.ok) {
            const data = await res.json();
            setDbReports(Array.from(new Map((data.data || []).map((r: any) => [r.id, r])).values()));
          }
        })
        .catch(() => {});

      setDeletingReportId(null);
    } catch (error) {
      console.error("Delete submission error:", error);
      alert("Delete failed: Network error");
    } finally {
      setIsDeleting(false);
    }
  };

  const sharedCitizenReports: CaseCardData[] = uniqueSharedIssues.map((issue) => ({
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
  }));

  // Convert dbReports to CaseCardData format
  const dbReportsAsCards: CaseCardData[] = dbReports.map((report) => ({
    id: report.id,
    caseNumber: report.caseNumber,
    title: report.title,
    description: report.description,
    category: report.category,
    status: report.status,
    priorityScore: report.priorityScore,
    address: report.address,
    dsDivisionName: report.district,
    imageUrl: report.imageUrl,
    verificationCount: report.verificationCount,
    verificationThreshold: report.verificationThreshold,
    createdAt: report.createdAt,
    latitude: report.latitude,
    longitude: report.longitude,
  }));

  const myReports: CaseCardData[] = dbReportsAsCards; // Only show actual database reports for "my-reports"
  const nearbyReports: CaseCardData[] = Array.from(
    new Map([...sharedCitizenReports, ...dbReportsAsCards].map((report) => [report.id, report])).values()
  ).filter((report) => dbReportsAsCards.some((r) => r.id === report.id)); // Only show reports that exist in database

  const mapMarkers = Array.from(
    new Map(
      [...sharedCitizenReports, ...transparencyReports].map((report) => [
        report.id,
        {
          id: report.id,
          title: report.title,
          category: report.category,
          status: report.status,
          latitude: report.latitude || (report.category === "ROADS" ? 6.8905 : report.category === "DRAINAGE" ? 6.9344 : report.category === "WATER" ? 6.0268 : 7.2625),
          longitude: report.longitude || (report.category === "ROADS" ? 79.855 : report.category === "DRAINAGE" ? 79.8519 : report.category === "WATER" ? 80.217 : 80.5972),
          address: report.address,
        },
      ])
    ).values()
  );

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
          <PlusCircle className="h-4 w-4" />
          Report New Issue
        </Link>

        {/* Notifications Bell */}
        <button
          onClick={() => setActiveTab(activeTab === "notifications" ? "my-reports" : "notifications")}
          className="relative p-3 rounded-xl card-light dark:bg-[#111111] dark:border-[#333333] hover:bg-slate-100 dark:hover:bg-[#1a1a1a] transition-colors"
        >
          <ShieldCheck className="h-5 w-5 text-slate-600 dark:text-slate-400" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
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
        <button
          onClick={() => setActiveTab("notifications")}
          className={`text-xs font-bold px-4 py-2 rounded-xl transition-colors ${
            activeTab === "notifications" ? "bg-[#F97316] dark:bg-[#FF8C00] text-white" : "text-slate-600 dark:text-[#B0B0B0] hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <ShieldCheck className="w-3 h-3 inline mr-1" />
          Notifications ({unreadCount})
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
            <CaseCard 
              key={c.id} 
              caseData={c} 
              onEdit={activeTab === "my-reports" ? handleEditReport : undefined}
              onDelete={activeTab === "my-reports" ? handleDeleteReport : undefined}
              isOwnReport={activeTab === "my-reports"}
            />
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
      ) : activeTab === "notifications" ? (
        <div className="max-w-7xl mx-auto space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg page-title dark:text-white">Notifications</h2>
            <button
              onClick={() => {
                fetch("/api/notifications", { method: "PATCH", body: JSON.stringify({ markAll: true }) })
                  .then(() => {
                    setNotifications(notifications.map(n => ({ ...n, isRead: true })));
                    setUnreadCount(0);
                  });
              }}
              className="text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
            >
              Mark all as read
            </button>
          </div>

          {notifications.length === 0 ? (
            <div className="card-light dark:bg-slate-900 dark:border-slate-800 rounded-3xl p-12 text-center space-y-3">
              <ShieldCheck className="w-10 h-10 text-slate-400 mx-auto" />
              <h3 className="text-base card-heading dark:text-white">No Notifications</h3>
              <p className="text-xs body-text dark:text-slate-400">You're all caught up!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`card-light dark:bg-slate-900 dark:border-slate-800 rounded-2xl p-4 flex items-start gap-4 ${
                    !notif.isRead ? "border-l-4 border-l-orange-500" : ""
                  }`}
                >
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-sm font-bold card-heading dark:text-white">{notif.title}</h4>
                      <span className="text-[10px] text-slate-500">
                        {new Date(notif.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-xs body-text dark:text-slate-400">{notif.message}</p>
                  </div>
                  {!notif.isRead && (
                    <button
                      onClick={() => {
                        fetch("/api/notifications", {
                          method: "PATCH",
                          body: JSON.stringify({ notificationId: notif.id }),
                        })
                          .then(() => {
                            setNotifications(notifications.map(n => 
                              n.id === notif.id ? { ...n, isRead: true } : n
                            ));
                            setUnreadCount(Math.max(0, unreadCount - 1));
                          });
                      }}
                      className="text-xs text-orange-500 hover:text-orange-600"
                    >
                      Mark read
                    </button>
                  )}
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

      {/* Edit Report Modal */}
      {editingReport && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveEdit}
            className="card-light dark:bg-slate-900 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 space-y-6 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Edit className="w-5 h-5 text-orange-400" />
                <h3 className="text-lg font-bold text-white">Edit Report</h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingReport(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs">
              <span className="font-mono text-orange-400 font-bold">{editingReport.caseNumber}</span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Title
              </label>
              <input
                type="text"
                required
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Description
              </label>
              <textarea
                rows={3}
                required
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Category
              </label>
              <select
                value={editCategory}
                onChange={(e) => setEditCategory(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-orange-500"
              >
                <option value="ROADS">Roads & Potholes</option>
                <option value="DRAINAGE">Drainage & Floods</option>
                <option value="STREETLIGHTS">Streetlights</option>
                <option value="WATER">Water Leakage</option>
                <option value="PUBLIC_BUILDINGS">Public Structure</option>
                <option value="SANITATION">Waste Disposal</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Address
              </label>
              <input
                type="text"
                value={editAddress}
                onChange={(e) => setEditAddress(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-orange-500"
              />
            </div>

            {editError && (
              <div className="p-3 rounded-xl bg-rose-950/60 text-rose-300 border border-rose-800 text-xs">
                {editError}
              </div>
            )}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setEditingReport(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold"
                disabled={isEditing}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-glass-orange-solid px-6 py-2 text-xs"
                disabled={isEditing}
              >
                {isEditing ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deletingReportId && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="card-light dark:bg-slate-900 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-6 shadow-2xl">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
              <div className="w-10 h-10 rounded-full bg-rose-950/60 text-rose-400 flex items-center justify-center">
                <AlertCircle className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white">Delete Report?</h3>
            </div>

            <div className="space-y-3">
              <p className="text-xs body-text dark:text-slate-400">
                Are you sure you want to delete this report? This action cannot be undone.
              </p>
              <p className="text-[11px] text-slate-500">
                Only reports in SUBMITTED or UNDER_VERIFICATION status can be deleted.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setDeletingReportId(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteReport(deletingReportId)}
                className="px-6 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-bold text-xs shadow-lg shadow-rose-600/30"
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting..." : "Delete Report"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
