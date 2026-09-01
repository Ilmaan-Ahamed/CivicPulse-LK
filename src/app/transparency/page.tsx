"use client";

import React, { useEffect, useMemo, useState } from "react";
import { InteractiveMap } from "@/components/map/InteractiveMap";
import { CaseCard, CaseCardData } from "@/components/shared/CaseCard";
import { Search, Filter, MapPin, Shield } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

type TransparencyCase = CaseCardData & {
  latitude?: number | null;
  longitude?: number | null;
  district?: string | null;
};

const fallbackCases: TransparencyCase[] = [
  {
    id: "case-1042",
    caseNumber: "CP-2026-1042",
    title: "Hazardous Deep Potholes near Bambalapitiya Junction",
    description: "Severe road surface damage causing vehicle accidents and traffic congestion on A2 main corridor near Galle Road Bamba junction.",
    category: "ROAD_DAMAGE",
    status: "VERIFIED",
    priorityScore: 88.5,
    address: "Galle Road, Bambalapitiya, Colombo 04",
    dsDivisionName: "Colombo DS Office",
    latitude: 6.8905,
    longitude: 79.855,
    district: "Colombo DS Office",
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
    priorityScore: 76,
    address: "Bodhiraja Mawatha, Pettah, Colombo 11",
    dsDivisionName: "Colombo DS Office",
    latitude: 6.9344,
    longitude: 79.8519,
    district: "Colombo DS Office",
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
    category: "STREETLIGHT",
    status: "UNDER_VERIFICATION",
    priorityScore: 62,
    address: "Gatembe, Peradeniya Road, Kandy",
    dsDivisionName: "Kandy Four Gravets DS",
    latitude: 7.2625,
    longitude: 80.5972,
    district: "Kandy Four Gravets DS",
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
    category: "WATER_SUPPLY",
    status: "RESOLVED",
    priorityScore: 91,
    address: "Rampart Street, Galle Fort, Galle",
    dsDivisionName: "Galle Four Gravets DS",
    latitude: 6.0268,
    longitude: 80.217,
    district: "Galle Four Gravets DS",
    imageUrl: "https://images.unsplash.com/photo-1584992236310-6edddc08acff?auto=format&fit=crop&w=800&q=80",
    verificationCount: 5,
    verificationThreshold: 3,
    createdAt: "2026-08-12",
  },
];

function toUiCategory(value: string | undefined | null) {
  return value ?? "OTHER";
}

function toUiStatus(value: string | undefined | null) {
  return value ?? "SUBMITTED";
}

function formatCategoryLabel(category: string) {
  switch (category) {
    case "ROAD_DAMAGE":
      return "Roads & Highways";
    case "DRAINAGE":
      return "Drainage & Floods";
    case "STREETLIGHT":
      return "Streetlights";
    case "WATER_SUPPLY":
      return "Water Supply";
    default:
      return category.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  }
}

export default function TransparencyDashboard() {
  const { t } = useLanguage();
  const [publicCases, setPublicCases] = useState<TransparencyCase[]>(fallbackCases);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [selectedDivision, setSelectedDivision] = useState("ALL");
  const [viewMode, setViewMode] = useState<"map" | "list">("map");
  const [inspectingCase, setInspectingCase] = useState<CaseCardData | null>(null);

  useEffect(() => {
    let active = true;

    fetch("/api/transparency")
      .then(async (response) => {
        if (!response.ok) throw new Error("Failed");
        const data = (await response.json()) as { cases?: TransparencyCase[] };
        if (active) {
          setPublicCases(data.cases && data.cases.length ? data.cases : fallbackCases);
        }
      })
      .catch(() => {
        if (active) setPublicCases(fallbackCases);
      });

    return () => {
      active = false;
    };
  }, []);

  const districtOptions = useMemo(
    () =>
      Array.from(
        new Set(
          publicCases
            .map((caseItem) => caseItem.district || caseItem.dsDivisionName || "")
            .filter(Boolean),
        ),
      ).sort((a, b) => a.localeCompare(b)),
    [publicCases],
  );

  const filteredCases = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return publicCases.filter((caseItem) => {
      const matchesSearch =
        !query ||
        [caseItem.caseNumber, caseItem.title, caseItem.address, caseItem.district ?? ""]
          .join(" ")
          .toLowerCase()
          .includes(query);

      const matchesCategory =
        selectedCategory === "ALL" || toUiCategory(caseItem.category) === selectedCategory;

      const matchesStatus =
        selectedStatus === "ALL" || toUiStatus(caseItem.status) === selectedStatus;

      const matchesDistrict =
        selectedDivision === "ALL" ||
        (caseItem.district ?? caseItem.dsDivisionName ?? "") === selectedDivision;

      return matchesSearch && matchesCategory && matchesStatus && matchesDistrict;
    });
  }, [publicCases, searchQuery, selectedCategory, selectedStatus, selectedDivision]);

  const mapMarkers = filteredCases.map((caseItem) => ({
    id: caseItem.id,
    title: caseItem.title,
    category: formatCategoryLabel(toUiCategory(caseItem.category)),
    status: toUiStatus(caseItem.status),
    latitude: Number(caseItem.latitude ?? 6.9271),
    longitude: Number(caseItem.longitude ?? 79.8612),
    address: caseItem.address,
  }));

  const verifiedCount = filteredCases.filter((caseItem) =>
    ["VERIFIED", "FIELD_VERIFIED", "RESOLVED"].includes(toUiStatus(caseItem.status)),
  ).length;

  const activeCount = filteredCases.filter((caseItem) =>
    ["ASSIGNED", "IN_PROGRESS", "UNDER_VERIFICATION", "SUBMITTED"].includes(
      toUiStatus(caseItem.status),
    ),
  ).length;

  const resolvedCount = filteredCases.filter(
    (caseItem) => toUiStatus(caseItem.status) === "RESOLVED",
  ).length;

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] py-8 px-4 sm:px-6 lg:px-8 space-y-8 transition-colors duration-300">
      <div className="mx-auto max-w-7xl flex flex-col justify-between gap-4 border-b border-[#E8D5B5] pb-6 md:flex-row md:items-center dark:border-[#333333]">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <Shield className="h-5 w-5 text-[#F97316] dark:text-[#FF8C00]" />
            <h1 className="page-title text-2xl dark:text-white">{t("nav.transparency")} Dashboard</h1>
          </div>
          <p className="body-text text-xs dark:text-[#B0B0B0]">
            Open civic data showing Sri Lanka public infrastructure reports, verifications, agency assignments, and resolutions.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start rounded-xl border border-[#E8D5B5] bg-[#FDEEDC] p-1 dark:border-[#333333] dark:bg-[#111111]">
          <button
            onClick={() => setViewMode("map")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
              viewMode === "map"
                ? "bg-[#F97316] text-white dark:bg-[#FF8C00]"
                : "text-slate-600 hover:text-slate-900 dark:text-[#B0B0B0] dark:hover:text-white"
            }`}
          >
            <MapPin className="h-3.5 w-3.5" />
            <span>Map View</span>
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
              viewMode === "list"
                ? "bg-[#F97316] text-white dark:bg-[#FF8C00]"
                : "text-slate-600 hover:text-slate-900 dark:text-[#B0B0B0] dark:hover:text-white"
            }`}
          >
            <Filter className="h-3.5 w-3.5" />
            <span>List View</span>
          </button>
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="card-light rounded-2xl p-4 dark:border-[#333333] dark:bg-[#0a0a0a]">
          <p className="card-subtext text-xs font-medium dark:text-[#B0B0B0]">Total Public Reports</p>
          <p className="card-stat mt-1 font-mono text-2xl dark:text-white">{filteredCases.length}</p>
        </div>
        <div className="card-light rounded-2xl p-4 dark:border-[#333333] dark:bg-[#0a0a0a]">
          <p className="card-subtext text-xs font-medium dark:text-[#B0B0B0]">Community Verified</p>
          <p className="card-stat mt-1 font-mono text-2xl dark:text-amber-400">{verifiedCount}</p>
        </div>
        <div className="card-light rounded-2xl p-4 dark:border-[#333333] dark:bg-[#0a0a0a]">
          <p className="card-subtext text-xs font-medium dark:text-[#B0B0B0]">Agency Repairs Active</p>
          <p className="card-stat icon-orange mt-1 font-mono text-2xl dark:text-[#FF8C00]">{activeCount}</p>
        </div>
        <div className="card-light rounded-2xl p-4 dark:border-[#333333] dark:bg-[#0a0a0a]">
          <p className="card-subtext text-xs font-medium dark:text-[#B0B0B0]">Resolved & Published</p>
          <p className="card-stat icon-orange mt-1 font-mono text-2xl dark:text-[#FF8C00]">{resolvedCount}</p>
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-4 rounded-2xl border border-[#E8D5B5] bg-[#FDEEDC] p-4 dark:border-[#333333] dark:bg-[#0a0a0a] md:grid-cols-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400 dark:text-[#FF8C00]/60" />
          <input
            type="text"
            placeholder="Search by case ID, title, or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="card-light w-full rounded-xl py-2 pl-9 pr-3 text-xs placeholder-slate-400 focus:border-[#F97316] focus:outline-none dark:border-[#333333] dark:bg-[#111111] dark:text-white dark:placeholder-[#FF8C00]/40 dark:focus:border-[#FF8C00]"
          />
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="card-light rounded-xl px-3 py-2 text-xs focus:border-[#F97316] focus:outline-none dark:border-[#333333] dark:bg-[#111111] dark:text-white dark:focus:border-[#FF8C00]"
        >
          <option value="ALL">All Categories</option>
          <option value="ROAD_DAMAGE">Roads & Highways</option>
          <option value="DRAINAGE">Drainage & Floods</option>
          <option value="STREETLIGHT">Streetlights</option>
          <option value="WATER_SUPPLY">Water Supply</option>
        </select>

        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="card-light rounded-xl px-3 py-2 text-xs focus:border-[#F97316] focus:outline-none dark:border-[#333333] dark:bg-[#111111] dark:text-white dark:focus:border-[#FF8C00]"
        >
          <option value="ALL">All Statuses</option>
          <option value="SUBMITTED">Pending Verification</option>
          <option value="UNDER_VERIFICATION">Under Verification</option>
          <option value="VERIFIED">Community Verified</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="RESOLVED">Resolved & Published</option>
        </select>

        <select
          value={selectedDivision}
          onChange={(e) => setSelectedDivision(e.target.value)}
          className="card-light rounded-xl px-3 py-2 text-xs focus:border-[#F97316] focus:outline-none dark:border-[#333333] dark:bg-[#111111] dark:text-white dark:focus:border-[#FF8C00]"
        >
          <option value="ALL">All DS Divisions</option>
          {districtOptions.map((district) => (
            <option key={district} value={district}>
              {district}
            </option>
          ))}
        </select>
      </div>

      <div className="mx-auto max-w-7xl">
        {viewMode === "map" ? (
          <div className="space-y-6">
            <InteractiveMap
              markers={mapMarkers}
              center={[6.9271, 79.8612]}
              zoom={8}
              onMarkerSelect={(m) => {
                const selected = filteredCases.find((caseItem) => caseItem.id === m.id);
                if (selected) setInspectingCase(selected);
              }}
            />

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {filteredCases.map((caseItem) => (
                <CaseCard
                  key={caseItem.id}
                  caseData={caseItem}
                  onSelect={(item) => setInspectingCase(item)}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {filteredCases.map((caseItem) => (
              <CaseCard
                key={caseItem.id}
                caseData={caseItem}
                onSelect={(item) => setInspectingCase(item)}
              />
            ))}
          </div>
        )}
      </div>

      {inspectingCase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
          <div className="card-light max-h-[90vh] w-full max-w-2xl space-y-4 overflow-y-auto rounded-2xl p-6 shadow-2xl dark:border-[#333333] dark:bg-[#0a0a0a]">
            <div className="flex items-center justify-between border-b border-[#E8D5B5] pb-3 dark:border-[#333333]">
              <div>
                <span className="font-mono text-xs text-[#F97316] dark:text-[#FF8C00]">
                  {inspectingCase.caseNumber}
                </span>
                <h3 className="card-heading text-lg dark:text-white">{inspectingCase.title}</h3>
              </div>
              <button
                onClick={() => setInspectingCase(null)}
                className="rounded bg-[#FDEEDC] px-2 py-1 text-xs text-slate-500 hover:text-slate-800 dark:bg-[#111111] dark:text-[#B0B0B0] dark:hover:text-white"
              >
                Close
              </button>
            </div>

            {inspectingCase.imageUrl && (
              <div className="card-light h-56 w-full overflow-hidden rounded-xl dark:bg-[#111111]">
                <img
                  src={inspectingCase.imageUrl}
                  alt={inspectingCase.title}
                  className="h-full w-full object-cover"
                />
              </div>
            )}

            <div>
              <h4 className="card-heading mb-1 text-xs font-bold uppercase tracking-wider dark:text-[#B0B0B0]">
                Issue Description
              </h4>
              <p className="body-text text-xs leading-relaxed dark:text-[#B0B0B0]">
                {inspectingCase.description}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 border-t border-[var(--border)] pt-2 text-xs dark:border-[#333333]">
              <div>
                <span className="card-subtext dark:text-[#B0B0B0]">Location:</span>
                <p className="card-heading font-medium dark:text-white">{inspectingCase.address}</p>
              </div>
              <div>
                <span className="card-subtext dark:text-[#B0B0B0]">Divisional Secretariat:</span>
                <p className="card-heading font-medium dark:text-white">
                  {inspectingCase.dsDivisionName ?? inspectingCase.address}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
