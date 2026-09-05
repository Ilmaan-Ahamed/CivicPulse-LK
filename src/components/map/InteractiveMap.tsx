"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Eye, MapPin } from "lucide-react";
import type { Map as MapLibreMap } from "maplibre-gl";
import {
  Map,
  MapControls,
  MapMarker as MapCNMarker,
  MarkerContent,
  MarkerPopup,
  MarkerTooltip,
} from "@/components/ui/map";

export interface MapMarker {
  id: string;
  caseId?: string;
  title: string;
  category: string;
  status: string;
  latitude: number;
  longitude: number;
  address: string;
}

interface InteractiveMapProps {
  markers?: MapMarker[];
  center?: [number, number];
  zoom?: number;
  onMarkerSelect?: (marker: MapMarker) => void;
  onLocationPick?: (lat: number, lng: number) => void;
  isPickerMode?: boolean;
}

export function InteractiveMap({
  markers = [],
  center = [6.9271, 79.8612],
  zoom = 12,
  onMarkerSelect,
  onLocationPick,
  isPickerMode = false,
}: InteractiveMapProps) {
  const [selectedMarker, setSelectedMarker] = useState<MapMarker | null>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const uniqueMarkers = useMemo(() => {
    const byId = new globalThis.Map<string, MapMarker>();
    markers.forEach((marker) => {
      if (!byId.has(marker.id)) {
        byId.set(marker.id, marker);
      }
    });
    return Array.from(byId.values());
  }, [markers]);

  useEffect(() => {
    if (!mapRef.current || !isPickerMode || !onLocationPick) return;

    const map = mapRef.current;
    const handleClick = (event: { lngLat: { lat: number; lng: number } }) => {
      const { lat, lng } = event.lngLat;
      onLocationPick(lat, lng);
    };

    map.on("click", handleClick);
    return () => {
      map.off("click", handleClick);
    };
  }, [isPickerMode, onLocationPick]);

  const markerStyles: Record<string, string> = {
    VERIFIED: "bg-amber-500 ring-amber-400",
    ASSIGNED: "bg-orange-500 ring-orange-400",
    IN_PROGRESS: "bg-orange-500 ring-orange-400",
    RESOLVED: "bg-orange-600 ring-orange-500",
    SUBMITTED: "bg-amber-500 ring-amber-400",
    UNDER_VERIFICATION: "bg-orange-500 ring-orange-400",
  };

  const centerLngLat: [number, number] = [center[1], center[0]];

  return (
    <div className="relative h-96 min-h-87.5 w-full overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 shadow-xl">
      <Map
        ref={mapRef}
        className="h-full w-full"
        viewport={{ center: centerLngLat, zoom }}
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

        {uniqueMarkers.map((marker) => {
          const isSelected = selectedMarker?.id === marker.id;
          const colorClass = markerStyles[marker.status] ?? "bg-orange-500 ring-orange-400";

          return (
            <MapCNMarker
              key={marker.id}
              longitude={marker.longitude}
              latitude={marker.latitude}
              draggable={false}
              onClick={() => {
                setSelectedMarker(marker);
                onMarkerSelect?.(marker);
              }}
            >
              <MarkerContent className="cursor-pointer">
                <div className="relative">
                  <span className={`absolute -inset-1 rounded-full animate-ping opacity-40 ${colorClass}`} />
                  <div
                    className={`relative flex h-7 w-7 items-center justify-center rounded-full border-2 border-white text-slate-950 shadow-lg transition-transform ${colorClass} ${
                      isSelected ? "scale-125 ring-4 ring-white" : ""
                    }`}
                  >
                    <MapPin className="h-4 w-4 text-slate-950 fill-slate-950" />
                  </div>
                </div>
              </MarkerContent>

              <MarkerTooltip offset={20} maxWidth="220px">
                <div className="space-y-1">
                  <div className="font-semibold text-orange-300">{marker.title}</div>
                  <div className="text-[10px] text-slate-300">{marker.category}</div>
                  <div className="text-[10px] text-slate-300">{marker.status}</div>
                  <div className="text-[10px] text-slate-400">{marker.id}</div>
                </div>
              </MarkerTooltip>

              <MarkerPopup closeButton={false} offset={[0, -18]}>
                <div className="max-w-55 space-y-1 p-1 text-left">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-orange-400">{marker.caseId ?? marker.id}</div>
                  <div className="text-sm font-semibold text-slate-900">{marker.title}</div>
                  <div className="text-[10px] text-slate-600">{marker.category} • {marker.status}</div>
                  <div className="text-[10px] text-slate-500">{marker.address}</div>
                </div>
              </MarkerPopup>
            </MapCNMarker>
          );
        })}
      </Map>

      {selectedMarker && (
        <div className="absolute bottom-3 left-3 right-3 z-10 flex items-center justify-between rounded-xl border border-slate-700/80 bg-slate-900/95 p-4 shadow-2xl backdrop-blur-md">
          <div className="min-w-0 flex-1 pr-4">
            <span className="text-[10px] font-mono uppercase tracking-wider text-orange-400">
              {selectedMarker.category} • {selectedMarker.status}
            </span>
            <h4 className="truncate text-sm font-bold text-white">{selectedMarker.title}</h4>
            <p className="truncate text-xs text-slate-400">{selectedMarker.address}</p>
          </div>
          <button
            onClick={() => onMarkerSelect?.(selectedMarker)}
            className="flex shrink-0 items-center gap-1.5 rounded-lg bg-orange-600 px-3 py-1.5 text-xs font-semibold text-white shadow-md transition-colors hover:bg-orange-500"
          >
            <Eye className="h-3.5 w-3.5" />
            <span>Inspect</span>
          </button>
        </div>
      )}
    </div>
  );
}
