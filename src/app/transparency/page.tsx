"use client";

import React, { useState } from "react";
import { InteractiveMap, MapMarker } from "@/components/map/InteractiveMap";
import { CaseCard, CaseCardData } from "@/components/shared/CaseCard";
import { Search, Filter, MapPin, CheckCircle2, Clock, Wrench, Shield, ArrowRight } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function TransparencyDashboard() {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [selectedDivision, setSelectedDivision] = useState("ALL");
  const [viewMode, setViewMode] = useState<"map" | "list">("map");
  const [inspectingCase, setInspectingCase] = useState<CaseCardData | null>(null);

  const mockPublicCases: CaseCardData[] = [
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
    {
      id: "case-1044",
      caseNumber: "CP-2026-1044",
      title: "Non-Functional Streetlights on Kandy Peradeniya Corridor",
      description: "Five consecutive solar streetlights have gone dark along the main university access road, compromising safety at night.",
      category: "STREETLIGHTS",
      status: "UNDER_VERIFICATION",
      priorityScore: 62.0,
      address: "Gatembe, Peradeniya Road, Kandy",
      dsDivisionName: "Kandy DS Office",
      imageUrl: "https://images.unsplash.com/photo-1509114397022-ed747cca3f65?auto=format&fit=crop&w=800&q=80",
      verificationCount: 2,
      verificationThreshold: 3,
      createdAt: "2026-08-12",
    },
    {
      id: "case-1045",
      caseNumber: "CP-2026-1045",
      title: "Burst Main Water Pipe at Galle Fort Pedestrian Walkway",
      description: "Clean water leak under high pressure washing away paved heritage stones near Rampart Street.",
      category: "WATER",
      status: "RESOLVED",
      priorityScore: 91.0,
      address: "Rampart Street, Galle Fort, Galle",
      dsDivisionName: "Galle DS Office",
      imageUrl: "https://images.unsplash.com/photo-1584992236310-6edddc08acff?auto=format&fit=crop&w=800&q=80",
      verificationCount: 5,
      verificationThreshold: 3,
      createdAt: "2026-08-12",
    },
  ];

  // Map markers transformation with privacy-safe coordinate fuzzing
  const mapMarkers: MapMarker[] = mockPublicCases.map((c) => ({
    id: c.id,
    title: c.title,
    category: c.category,
    status: c.status,
    latitude: c.category === "ROADS" ? 6.8905 : c.category === "DRAINAGE" ? 6.9344 : c.category === "WATER" ? 6.0268 : 7.2625,
    longitude: c.category === "ROADS" ? 79.8550 : c.category === "DRAINAGE" ? 79.8519 : c.category === "WATER" ? 80.2170 : 80.5972,
    address: c.address,
  }));

  const filteredCases = mockPublicCases.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.caseNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "ALL" || c.category === selectedCategory;
    const matchesStatus = selectedStatus === "ALL" || c.status === selectedStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] py-8 px-4 sm:px-6 lg:px-8 space-y-8 transition-colors duration-300">
      {/* Header */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E8D5B5] dark:border-[#333333] pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Shield className="w-5 h-5 text-[#F97316] dark:text-[#FF8C00]" />
            <h1 className="text-2xl page-title dark:text-white">{t("nav.transparency")} Dashboard</h1>
          </div>
          <p className="text-xs body-text dark:text-[#B0B0B0]">
            Open civic data showing Sri Lanka public infrastructure reports, verifications, agency assignments, and resolutions.
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-2 bg-[#FDEEDC] dark:bg-[#111111] p-1 rounded-xl border border-[#E8D5B5] dark:border-[#333333] self-start">
          <button
            onClick={() => setViewMode("map")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              viewMode === "map" ? "bg-[#F97316] dark:bg-[#FF8C00] text-white" : "text-slate-600 dark:text-[#B0B0B0] hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>Map View</span>
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              viewMode === "list" ? "bg-[#F97316] dark:bg-[#FF8C00] text-white" : "text-slate-600 dark:text-[#B0B0B0] hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            <span>List View</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card-light dark:bg-[#0a0a0a] dark:border-[#333333] rounded-2xl p-4">
          <p className="text-xs card-subtext dark:text-[#B0B0B0] font-medium">Total Public Reports</p>
          <p className="text-2xl card-stat dark:text-white font-mono mt-1">1,045</p>
        </div>
        <div className="card-light dark:bg-[#0a0a0a] dark:border-[#333333] rounded-2xl p-4">
          <p className="text-xs card-subtext dark:text-[#B0B0B0] font-medium">Community Verified</p>
          <p className="text-2xl card-stat dark:text-amber-400 font-mono mt-1">980</p>
        </div>
        <div className="card-light dark:bg-[#0a0a0a] dark:border-[#333333] rounded-2xl p-4">
          <p className="text-xs card-subtext dark:text-[#B0B0B0] font-medium">Agency Repairs Active</p>
          <p className="text-2xl card-stat icon-orange dark:text-[#FF8C00] font-mono mt-1">116</p>
        </div>
        <div className="card-light dark:bg-[#0a0a0a] dark:border-[#333333] rounded-2xl p-4">
          <p className="text-xs card-subtext dark:text-[#B0B0B0] font-medium">Resolved & Published</p>
          <p className="text-2xl card-stat icon-orange dark:text-[#FF8C00] font-mono mt-1">864</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="max-w-7xl mx-auto card-light dark:bg-[#0a0a0a] dark:border-[#333333] rounded-2xl p-4 grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 dark:text-[#FF8C00]/60 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search by case ID, title, or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full card-light dark:bg-[#111111] dark:border-[#333333] rounded-xl pl-9 pr-3 py-2 text-xs card-heading dark:text-white placeholder-slate-400 dark:placeholder-[#FF8C00]/40 focus:outline-none focus:border-[#F97316] dark:focus:border-[#FF8C00]"
          />
        </div>

        {/* Category Filter */}
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="card-light dark:bg-[#111111] dark:border-[#333333] rounded-xl px-3 py-2 text-xs card-heading dark:text-white focus:outline-none focus:border-[#F97316] dark:focus:border-[#FF8C00]"
        >
          <option value="ALL">All Categories</option>
          <option value="ROADS">Roads & Highways</option>
          <option value="DRAINAGE">Drainage & Floods</option>
          <option value="STREETLIGHTS">Streetlights</option>
          <option value="WATER">Water Supply</option>
        </select>

        {/* Status Filter */}
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="card-light dark:bg-[#111111] dark:border-[#333333] rounded-xl px-3 py-2 text-xs card-heading dark:text-white focus:outline-none focus:border-[#F97316] dark:focus:border-[#FF8C00]"
        >
          <option value="ALL">All Statuses</option>
          <option value="PENDING">Pending Verification</option>
          <option value="VERIFIED">Community Verified</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="RESOLVED">Resolved & Published</option>
        </select>

        {/* DS Division Filter */}
        <select
          value={selectedDivision}
          onChange={(e) => setSelectedDivision(e.target.value)}
          className="card-light dark:bg-[#111111] dark:border-[#333333] rounded-xl px-3 py-2 text-xs card-heading dark:text-white focus:outline-none focus:border-[#F97316] dark:focus:border-[#FF8C00]"
        >
          <option value="ALL">All DS Divisions</option>
          <option value="DS-COL-01">Colombo DS Secretariat</option>
          <option value="DS-KND-02">Kandy Four Gravets DS</option>
          <option value="DS-GAL-03">Galle Four Gravets DS</option>
        </select>
      </div>

      {/* Main Content View (Map or List) */}
      <div className="max-w-7xl mx-auto">
        {viewMode === "map" ? (
          <div className="space-y-6">
            <InteractiveMap
              markers={mapMarkers}
              onMarkerSelect={(m) => {
                const found = mockPublicCases.find((c) => c.id === m.id);
                if (found) setInspectingCase(found);
              }}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {filteredCases.map((c) => (
                <CaseCard key={c.id} caseData={c} onSelect={(item) => setInspectingCase(item)} />
              ))}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {filteredCases.map((c) => (
              <CaseCard key={c.id} caseData={c} onSelect={(item) => setInspectingCase(item)} />
            ))}
          </div>
        )}
      </div>

      {/* Case Detail Inspection Modal */}
      {inspectingCase && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="card-light dark:bg-[#0a0a0a] dark:border-[#333333] rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#E8D5B5] dark:border-[#333333] pb-3">
              <div>
                <span className="font-mono text-xs text-[#F97316] dark:text-[#FF8C00]">{inspectingCase.caseNumber}</span>
                <h3 className="text-lg card-heading dark:text-white">{inspectingCase.title}</h3>
              </div>
              <button
                onClick={() => setInspectingCase(null)}
                className="text-slate-500 hover:text-slate-800 dark:text-[#B0B0B0] dark:hover:text-white px-2 py-1 bg-[#FDEEDC] dark:bg-[#111111] rounded text-xs"
              >
                Close
              </button>
            </div>

            {inspectingCase.imageUrl && (
              <div className="w-full h-56 rounded-xl overflow-hidden card-light dark:bg-[#111111]">
                <img src={inspectingCase.imageUrl} alt={inspectingCase.title} className="w-full h-full object-cover" />
              </div>
            )}

            <div>
              <h4 className="text-xs font-bold card-heading dark:text-[#B0B0B0] uppercase tracking-wider mb-1">Issue Description</h4>
              <p className="text-xs body-text dark:text-[#B0B0B0] leading-relaxed">{inspectingCase.description}</p>
            </div>

            <div className="pt-2 border-t border-[var(--border)] dark:border-[#333333] grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="card-subtext dark:text-[#B0B0B0]">Location:</span>
                <p className="font-medium card-heading dark:text-white">{inspectingCase.address}</p>
              </div>
              <div>
                <span className="card-subtext dark:text-[#B0B0B0]">Divisional Secretariat:</span>
                <p className="font-medium card-heading dark:text-white">{inspectingCase.dsDivisionName}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
