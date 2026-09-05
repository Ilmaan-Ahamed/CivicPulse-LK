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
  const [publicCases, setPublicCases] = useState<TransparencyCase[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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
          setPublicCases(data.cases || []);
        }
      })
      .catch(() => {
        if (active) setPublicCases([]);
      })
      .finally(() => {
        if (active) setIsLoading(false);
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] py-8 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8">
            <div className="mb-1 flex items-center gap-2">
              <Shield className="h-5 w-5 text-[#F97316] dark:text-[#FF8C00]" />
              <h1 className="page-title text-2xl dark:text-white">{t("nav.transparency")} Dashboard</h1>
            </div>
          </div>
          <div className="flex h-96 items-center justify-center">
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

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
