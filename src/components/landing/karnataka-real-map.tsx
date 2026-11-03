"use client";

import React, { useState, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import {
  Compass,
  Sparkles,
  ShieldCheck,
  MapPin,
  Route,
  ArrowRight,
  Layers,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import {
  REAL_MAP_LANDMARKS,
  BIOME_FILTERS,
  type MapLandmark,
  type MapBiome,
} from "@/components/map/karnataka-map-data";
import {
  getActiveTripRoutePoints,
  type ActiveRoutePoint,
} from "@/components/map/map-route-utils";
import { KarnatakaOfflineMap } from "@/components/map/karnataka-offline-map";

// Dynamic import with SSR disabled for Leaflet container
const LeafletInteractiveMap = dynamic(
  () =>
    import("@/components/map/leaflet-interactive-map").then(
      (mod) => mod.LeafletInteractiveMap
    ),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[520px] rounded-2xl bg-[#081510] border border-white/10 flex flex-col items-center justify-center text-white/70 space-y-3">
        <Compass className="w-8 h-8 text-amber-400 animate-spin" />
        <span className="text-xs font-mono">Initializing OpenStreetMap Cartography...</span>
      </div>
    ),
  }
);

export function KarnatakaRealMap() {
  const { isKn } = useLanguage();

  const [selectedLandmark, setSelectedLandmark] = useState<MapLandmark>(
    REAL_MAP_LANDMARKS[0] // Mullayanagiri Peak
  );
  const [selectedBiome, setSelectedBiome] = useState<"all" | MapBiome>("all");
  const [useVectorFallback, setUseVectorFallback] = useState(false);
  const [routePoints, setRoutePoints] = useState<ActiveRoutePoint[]>([]);
  const [showRoute, setShowRoute] = useState(false);

  // Load active trip from storage if present on client
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const points = getActiveTripRoutePoints();
        if (points.length >= 2) {
          setRoutePoints(points);
          setShowRoute(true);
        }
      } catch {
        // Storage unavailable in private browsing
      }
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  // Filter landmarks by biome
  const filteredLandmarks = useMemo(() => {
    if (selectedBiome === "all") return REAL_MAP_LANDMARKS;
    return REAL_MAP_LANDMARKS.filter((lm) => lm.biome === selectedBiome);
  }, [selectedBiome]);

  return (
    <section id="map" className="scroll-mt-16 py-20 bg-[#081510] text-white relative">
      <span id="terrain" className="absolute -top-16 left-0 opacity-0 pointer-events-none" aria-hidden="true" />
      <div className="container-content space-y-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/10 pb-8">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-xs text-emerald-300 font-medium">
              <Compass size={14} className="text-emerald-400" />
              <span>
                {isKn ? "ಪರಿಶೀಲಿತ ಭೌಗೋಳಿಕ ನಕ್ಷೆ" : "Verified Geographic Cartography"}
              </span>
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-white tracking-tight">
              {isKn ? "ಕರ್ನಾಟಕ ನೈಜ ನಕ್ಷೆ ಮತ್ತು ತಾಣಗಳು" : "Explore Karnataka on Real Maps"}
            </h2>

            <p className="text-xs sm:text-sm text-white/80 leading-relaxed font-sans">
              {isKn
                ? "ನಿಖರವಾದ ಓಪನ್‌ಸ್ಟ್ರೀಟ್‌ಮ್ಯಾಪ್ (OpenStreetMap) ಆಧಾರಿತ ಭೌಗೋಳಿಕ ನಕ್ಷೆ. ಕರ್ನಾಟಕದ 31 ಜಿಲ್ಲೆಗಳು, ಕರಾವಳಿ, ಸಹ್ಯಾದ್ರಿ ಮತ್ತು ಬಯಲು ಸೀಮೆಯ ಧಾರ್ಮಿಕೇತರ ಐತಿಹಾಸಿಕ ತಾಣಗಳನ್ನು ಅನ್ವೇಷಿಸಿ."
                : "Real interactive OpenStreetMap cartography plotted with verified secular landmarks, elevation contours, highway corridors, and active journey routes across all 31 districts."}
            </p>
          </div>

          {/* Quick Controls Bar */}
          <div className="flex flex-wrap items-center gap-3 bg-white/5 border border-white/10 p-3 rounded-xl backdrop-blur-md">
            {/* Vector Fallback Toggle */}
            <button
              type="button"
              onClick={() => setUseVectorFallback(!useVectorFallback)}
              className="inline-flex items-center gap-1.5 text-[11px] px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white/90 transition-colors font-mono"
            >
              <Layers size={13} className="text-amber-400" />
              <span>
                {useVectorFallback ? "Switch to Live OSM Tiles" : "Switch to 2D Vector Map"}
              </span>
            </button>

            {/* Route Points Indicator */}
            {routePoints.length >= 2 && (
              <div className="inline-flex items-center gap-1.5 text-[11px] px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 font-mono">
                <Route size={13} />
                <span>
                  {routePoints.length} {isKn ? "ಪ್ರವಾಸ ನಿಲ್ದಾಣಗಳು" : "Trip Waypoints"}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Biome Filter Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {BIOME_FILTERS.map((biome) => (
            <button
              key={biome.id}
              type="button"
              onClick={() => setSelectedBiome(biome.id)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                selectedBiome === biome.id
                  ? "bg-amber-400 text-forest-dark font-semibold shadow-xs"
                  : "bg-white/5 text-white/70 hover:bg-white/10 hover:text-white border border-white/10"
              }`}
            >
              {isKn ? biome.labelKn : biome.labelEn}
            </button>
          ))}
        </div>

        {/* Main Interactive Map & Landmark Inspector Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Map View Container (8 Columns) */}
          <div className="lg:col-span-8 relative rounded-2xl overflow-hidden border border-white/15 shadow-2xl">
            {useVectorFallback ? (
              <KarnatakaOfflineMap
                landmarks={filteredLandmarks}
                selectedLandmark={selectedLandmark}
                onSelectLandmark={setSelectedLandmark}
                isKn={isKn}
              />
            ) : (
              <LeafletInteractiveMap
                landmarks={filteredLandmarks}
                selectedLandmark={selectedLandmark}
                onSelectLandmark={setSelectedLandmark}
                routePoints={routePoints}
                showRoute={showRoute}
                onToggleRoute={() => setShowRoute(!showRoute)}
                isKn={isKn}
                onTileError={() => setUseVectorFallback(true)}
              />
            )}
          </div>

          {/* Active Landmark Inspector Card (4 Columns) */}
          <div className="lg:col-span-4 bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md space-y-5">
            {/* Card Header & MSL Elevation */}
            <div className="flex items-center justify-between text-xs border-b border-white/10 pb-3">
              <span className="inline-flex items-center gap-1.5 text-amber-300 font-semibold uppercase tracking-wider text-[11px]">
                <Sparkles size={13} />
                {isKn ? selectedLandmark.biomeLabelKn : selectedLandmark.biomeLabelEn}
              </span>
              <span className="font-mono text-emerald-400 text-[11px]">
                {selectedLandmark.elevationMeters}m MSL
              </span>
            </div>

            {/* High-Resolution Verified Photo */}
            <div className="relative h-44 w-full rounded-xl overflow-hidden border border-white/15">
              <Image
                src={selectedLandmark.image}
                alt={selectedLandmark.nameEn}
                fill
                sizes="(max-width: 1024px) 100vw, 33vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              <div className="absolute bottom-2.5 left-3 text-xs font-semibold text-white flex items-center gap-1.5">
                <MapPin size={13} className="text-amber-400" />
                <span>
                  {isKn ? selectedLandmark.districtKn : selectedLandmark.districtEn}{" "}
                  {isKn ? "ಜಿಲ್ಲೆ" : "District"}
                </span>
              </div>
            </div>

            {/* Title & Description */}
            <div className="space-y-1.5">
              <h3 className="text-xl font-serif font-bold text-white">
                {isKn ? selectedLandmark.nameKn : selectedLandmark.nameEn}
              </h3>
              <p className="text-xs text-amber-200/90 font-medium">
                {isKn ? selectedLandmark.categoryKn : selectedLandmark.categoryEn}
              </p>
              <p className="text-xs text-white/70 leading-relaxed pt-1">
                {isKn ? selectedLandmark.summaryKn : selectedLandmark.summaryEn}
              </p>
            </div>

            {/* Verified Geodetic Coordinates */}
            <div className="p-3 rounded-lg bg-black/40 border border-white/10 space-y-2 text-xs">
              <div className="flex items-center justify-between text-white/60 text-[11px]">
                <span>{isKn ? "ಪರಿಶೀಲಿತ ನಿರ್ದೇಶಾಂಕಗಳು" : "Geodetic Coordinates"}</span>
                <span className="font-mono text-amber-300">
                  {selectedLandmark.lat.toFixed(4)}°N, {selectedLandmark.lng.toFixed(4)}°E
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-white/50 border-t border-white/10 pt-1.5">
                <ShieldCheck size={12} className="text-emerald-400 shrink-0" />
                <span className="truncate">{selectedLandmark.verifiedSource}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-1">
              <Link
                href={`/app/planner${selectedLandmark.hubId ? `?destination=${selectedLandmark.hubId}` : ""}`}
                className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-forest-dark font-semibold text-xs transition-colors"
              >
                <span>{isKn ? "ಪ್ರವಾಸ ಯೋಜಿಸಿ" : "Plan Trip"}</span>
                <ArrowRight size={13} />
              </Link>
              <Link
                href="/app/explore"
                className="inline-flex items-center justify-center py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs transition-colors"
              >
                {isKn ? "ಅನ್ವೇಷಿಸಿ" : "Explore"}
              </Link>
            </div>

            {/* Quick Cycle Landmark Switcher */}
            <div className="pt-2 flex items-center justify-between text-xs text-white/60">
              <span>{isKn ? "ಇತರ ತಾಣಗಳನ್ನು ನೋಡಿ:" : "Select landmark:"}</span>
              <div className="flex items-center gap-1.5 overflow-x-auto py-1">
                {REAL_MAP_LANDMARKS.slice(0, 8).map((lm) => (
                  <button
                    key={lm.id}
                    type="button"
                    onClick={() => setSelectedLandmark(lm)}
                    className={`w-6 h-6 rounded-full text-[10px] font-mono shrink-0 transition-all ${
                      selectedLandmark.id === lm.id
                        ? "bg-amber-400 text-forest-dark font-bold scale-110"
                        : "bg-white/10 text-white hover:bg-white/20"
                    }`}
                    title={lm.nameEn}
                  >
                    {lm.nameEn[0]}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
