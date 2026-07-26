"use client";

import { useState } from "react";
import { MapPin, Navigation, Compass } from "lucide-react";

interface MapViewProps {
  latitude?: number;
  longitude?: number;
  onLocationSelect?: (lat: number, lng: number) => void;
  interactive?: boolean;
}

export function MapView({
  latitude = 6.9271, // Colombo default latitude
  longitude = 79.8612, // Colombo default longitude
  onLocationSelect,
  interactive = true,
}: MapViewProps) {
  const [currentLat, setCurrentLat] = useState(latitude);
  const [currentLng, setCurrentLng] = useState(longitude);
  const [locating, setLocating] = useState(false);

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = parseFloat(position.coords.latitude.toFixed(6));
        const lng = parseFloat(position.coords.longitude.toFixed(6));
        setCurrentLat(lat);
        setCurrentLng(lng);
        setLocating(false);
        if (onLocationSelect) {
          onLocationSelect(lat, lng);
        }
      },
      (error) => {
        console.error("GPS error:", error);
        setLocating(false);
        alert("Failed to retrieve your current location.");
      },
      { enableHighAccuracy: true }
    );
  };

  return (
    <div className="space-y-3 relative z-10">
      {/* Interactive Geolocation Action Bar */}
      {interactive && (
        <div className="flex items-center justify-between gap-4 p-3 rounded-xl bg-slate-900/40 border border-slate-850 backdrop-blur-md">
          <div className="flex items-center gap-2 text-xs">
            <Compass className="w-4 h-4 text-emerald-450 animate-pulse" />
            <span className="font-mono text-slate-350 font-semibold">
              {currentLat.toFixed(4)}° N, {currentLng.toFixed(4)}° E
            </span>
          </div>

          <button
            type="button"
            onClick={handleGetCurrentLocation}
            disabled={locating}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-505/20 text-emerald-400 hover:bg-emerald-500/20 text-xs font-semibold transition-all duration-300 disabled:opacity-50 cursor-pointer active:scale-95"
          >
            <Navigation className={`w-3.5 h-3.5 ${locating ? "animate-spin text-emerald-400" : ""}`} />
            {locating ? "Acquiring GPS..." : "Auto-Detect My GPS"}
          </button>
        </div>
      )}

      {/* Visual Map Representation */}
      <div className="relative w-full h-56 rounded-2xl overflow-hidden border border-slate-850 bg-[#070b14]/90 flex items-center justify-center group transition-all duration-300 hover:border-emerald-500/30">
        {/* Subtle Map Grid Background */}
        <div
          className="absolute inset-0 opacity-15"
          style={{
            backgroundImage: `radial-gradient(#10b981 1px, transparent 1px)`,
            backgroundSize: "20px 20px",
          }}
        />

        {/* Center Marker Pin */}
        <div className="relative z-10 flex flex-col items-center animate-float">
          <div className="p-2.5 rounded-full bg-emerald-500/10 border-2 border-emerald-400/80 text-emerald-450 shadow-2xl shadow-emerald-500/20 backdrop-blur-md">
            <MapPin className="w-6 h-6 fill-emerald-500/20" />
          </div>
          <div className="w-3.5 h-1 bg-emerald-550/45 rounded-full blur-[1px] mt-1.5 animate-pulse" />
        </div>

        {/* Coordinate Badge Overlay */}
        <div className="absolute bottom-3 left-3 z-10 px-3 py-1.5 rounded-lg bg-slate-950/80 border border-slate-850 text-[10px] text-slate-350 backdrop-blur-md font-mono font-semibold">
          Lat: {currentLat} | Lng: {currentLng}
        </div>
      </div>
    </div>
  );
}
