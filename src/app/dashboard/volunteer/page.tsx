"use client";

import React, { useState } from "react";
import { HeartHandshake, MapPin, Camera, CheckCircle2, Upload, Navigation, Sparkles } from "lucide-react";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useAuth } from "@/lib/auth/AuthContext";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function VolunteerDashboard() {
  const { currentUser } = useAuth();
  const { t } = useLanguage();

  const [availableTasks, setAvailableTasks] = useState([
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
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmitInspection = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      setInspectingTask(null);
      setAvailableTasks([]);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] py-8 px-4 sm:px-6 lg:px-8 space-y-8 transition-colors duration-300">
      {/* Header Banner */}
      <div className="max-w-7xl mx-auto card-light dark:bg-[#0a0a0a] dark:border-[#333333] rounded-3xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <HeartHandshake className="w-5 h-5 icon-orange dark:text-purple-400" />
            <h1 className="text-2xl page-title dark:text-white">{t("dash.volunteer.title")}</h1>
          </div>
          <p className="text-xs body-text dark:text-[#B0B0B0]">
            {currentUser.name} • {currentUser.organization || "Civic Action Volunteer"}
          </p>
        </div>

        <div className="card-light dark:bg-slate-950 dark:border-slate-800 px-4 py-2 rounded-2xl border text-center">
          <span className="text-[10px] card-subtext dark:text-slate-500 font-medium block">Available Tasks</span>
          <span className="text-lg card-stat dark:text-purple-400 font-mono">{availableTasks.length}</span>
        </div>
      </div>

      {/* Task Worklist */}
      <div className="max-w-7xl mx-auto space-y-4">
        <h2 className="text-lg page-title dark:text-white">Field Inspection Opportunities</h2>

        {availableTasks.length === 0 ? (
          <div className="card-light dark:bg-slate-900 dark:border-slate-800 rounded-3xl p-12 text-center space-y-3">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
            <h3 className="text-base card-heading dark:text-white">All Assigned Tasks Completed!</h3>
            <p className="text-xs body-text dark:text-slate-400">No pending field inspections in your Divisional Secretariat area.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {availableTasks.map((task) => (
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
                    <span>Submit Inspection Evidence</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

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

            {isSubmitted ? (
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

                <div className="p-3 rounded-2xl card-light dark:bg-slate-950 dark:border-slate-800 flex items-center justify-between text-xs font-mono body-text dark:text-slate-400">
                  <span className="flex items-center gap-1.5 text-emerald-400">
                    <Navigation className="w-4 h-4" />
                    GPS Proximity Verified
                  </span>
                  <span>6.8905, 79.8550</span>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setInspectingTask(null)}
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
