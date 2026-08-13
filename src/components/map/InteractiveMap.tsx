"use client";

import React, { useEffect, useState } from "react";
import { MapPin, Navigation, Eye } from "lucide-react";

export interface MapMarker {
  id: string;
  title: string;
  category: string;
  status: string;
  latitude: number;
  longitude: number;
  address: string;
}

interface InteractiveMapProps {
  markers?: MapMarker[];
  center?: [number, number]; // [lat, lng]
  zoom?: number;
  onMarkerSelect?: (marker: MapMarker) => void;
  onLocationPick?: (lat: number, lng: number) => void;
  isPickerMode?: boolean;
}

export function InteractiveMap({
  markers = [],
  center = [6.9271, 79.8612], // Colombo default
  zoom = 12,
  onMarkerSelect,
  onLocationPick,
  isPickerMode = false,
}: InteractiveMapProps) {
  const [selectedMarker, setSelectedMarker] = useState<MapMarker | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className="w-full h-80 min-h-[300px] bg-slate-100 dark:bg-slate-900 rounded-xl flex flex-col items-center justify-center border border-slate-200 dark:border-slate-800 animate-pulse">
        <MapPin className="w-8 h-8 text-orange-600 dark:text-orange-400 mb-2 animate-bounce" />
        <p className="text-xs text-slate-500 font-medium">Loading CivicPulse Interactive Map...</p>
      </div>
    );
  }

  // Dynamic visual map representation with status markers
  return (
    <div className="relative w-full h-96 min-h-[350px] bg-slate-900 rounded-2xl overflow-hidden shadow-xl border border-slate-800 flex flex-col">
      {/* Map Header Controls */}
      <div className="absolute top-3 left-3 right-3 z-10 flex items-center justify-between pointer-events-auto">
        <div className="bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-700/80 text-xs font-semibold text-white flex items-center gap-2 shadow-lg">
          <Navigation className="w-3.5 h-3.5 text-orange-400 animate-spin" style={{ animationDuration: "12s" }} />
          <span>Sri Lanka Geospatial Grid</span>
          <span className="bg-orange-500/20 text-orange-300 text-[10px] px-1.5 py-0.5 rounded font-mono">
            {markers.length} Active Pins
          </span>
        </div>

        {isPickerMode && (
          <div className="bg-amber-500/90 text-slate-950 font-bold px-3 py-1 rounded-lg text-xs shadow-lg animate-pulse">
            Click map pin to adjust exact GPS coordinates
          </div>
        )}
      </div>

      {/* Simulated High-Quality Map Canvas */}
      <div
        className="relative w-full h-full bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] bg-slate-950 p-6 overflow-hidden cursor-crosshair flex items-center justify-center"
        onClick={(e) => {
          if (isPickerMode && onLocationPick) {
            // Simulated location click
            onLocationPick(center[0] + (Math.random() - 0.5) * 0.02, center[1] + (Math.random() - 0.5) * 0.02);
          }
        }}
      >
        {/* Map Grid Lines */}
        <div className="absolute inset-0 opacity-20 pointer-events-none bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem]" />

        {/* Map Pin Items */}
        {markers.map((marker, idx) => {
          // Compute relative pin positioning for demonstration grid
          const offsetLat = ((marker.latitude - center[0]) * 800) + 50;
          const offsetLng = ((marker.longitude - center[1]) * 800) + 50;
          const topPercent = Math.min(Math.max(offsetLat, 15), 85);
          const leftPercent = Math.min(Math.max(offsetLng, 15), 85);

          const isSelected = selectedMarker?.id === marker.id;

          let colorClass = "bg-amber-500 ring-amber-400";
          if (marker.status === "VERIFIED") colorClass = "bg-amber-500 ring-amber-400";
          if (marker.status === "ASSIGNED" || marker.status === "IN_PROGRESS") colorClass = "bg-orange-500 ring-orange-400";
          if (marker.status === "RESOLVED") colorClass = "bg-orange-600 ring-orange-500";

          return (
            <div
              key={marker.id || idx}
              style={{ top: `${topPercent}%`, left: `${leftPercent}%` }}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 group cursor-pointer z-20"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedMarker(marker);
                if (onMarkerSelect) onMarkerSelect(marker);
              }}
            >
              <div className="relative">
                <span className={`absolute -inset-1 rounded-full animate-ping opacity-40 ${colorClass}`} />
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-slate-950 font-bold text-xs shadow-lg transition-transform group-hover:scale-125 ring-2 ${colorClass} ${
                    isSelected ? "scale-125 ring-4 ring-white" : ""
                  }`}
                >
                  <MapPin className="w-4 h-4 text-slate-950 fill-slate-950" />
                </div>
              </div>

              {/* Pin Hover Tooltip */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block w-48 p-2 bg-slate-950/95 backdrop-blur-md text-white text-xs rounded-lg shadow-xl border border-slate-800 z-30 pointer-events-none">
                <p className="font-semibold text-orange-400 truncate">{marker.title}</p>
                <p className="text-[10px] text-slate-400 truncate">{marker.address}</p>
                <span className="inline-block mt-1 text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                  {marker.status}
                </span>
              </div>
            </div>
          );
        })}

        {/* Selected Marker Detail Overlay Drawer */}
        {selectedMarker && (
          <div className="absolute bottom-3 left-3 right-3 bg-slate-900/95 backdrop-blur-md p-4 rounded-xl border border-slate-700/80 shadow-2xl flex items-center justify-between z-30 animate-in fade-in slide-in-from-bottom-3">
            <div className="flex-1 pr-4 min-w-0">
              <span className="text-[10px] font-mono text-orange-400 uppercase tracking-wider">
                {selectedMarker.category} • {selectedMarker.status}
              </span>
              <h4 className="text-sm font-bold text-white truncate">{selectedMarker.title}</h4>
              <p className="text-xs text-slate-400 truncate">{selectedMarker.address}</p>
            </div>
            <button
              onClick={() => {
                if (onMarkerSelect) onMarkerSelect(selectedMarker);
              }}
              className="px-3 py-1.5 bg-orange-600 hover:bg-orange-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0 shadow-md"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Inspect</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
