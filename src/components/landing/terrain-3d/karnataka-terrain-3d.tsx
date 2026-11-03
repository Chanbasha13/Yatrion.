"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  Compass,
  Sparkles,
  ShieldCheck,
  RotateCcw,
  Sliders,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import {
  KARNATAKA_LANDMARKS,
  type VerifiedLandmark,
} from "./terrain-data";
import { TerrainCanvas } from "./terrain-canvas";
import { TerrainSvgFallback } from "./terrain-svg-fallback";

export function KarnatakaTerrain3D() {
  const { t, isKn } = useLanguage();

  const [selectedLandmark, setSelectedLandmark] = useState<VerifiedLandmark>(
    KARNATAKA_LANDMARKS[0] // Default to Mullayanagiri Peak
  );
  const [biomeFilter, setBiomeFilter] = useState<string>("all");
  const [reliefScale, setReliefScale] = useState<number>(1.5);
  const [useFallback, setUseFallback] = useState(() => {
    if (typeof window !== "undefined") {
      return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    }
    return false;
  });

  const biomes = [
    { id: "all", labelEn: "All Karnataka", labelKn: "ಸಮಗ್ರ ಕರ್ನಾಟಕ" },
    { id: "coastal", labelEn: "Karavali Coast", labelKn: "ಕರಾವಳಿ ತೀರ" },
    { id: "rainforest", labelEn: "Sahyadri Rainforests", labelKn: "ಸಹ್ಯಾದ್ರಿ ಮಳೆಕಾಡು" },
    { id: "deccan", labelEn: "Deccan Granite", labelKn: "ಡೆಕ್ಕನ್ ಶಿಲಾ ಪರಿಸರ" },
    { id: "plains", labelEn: "Central Citadels", labelKn: "ಬಯಲು ಸೀಮೆ ಕೋಟೆಗಳು" },
  ];

  return (
    <section id="terrain" className="scroll-mt-16 py-20 bg-[#081510] text-white">
      <div className="container-content space-y-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/10 pb-8">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-xs text-emerald-300 font-medium">
              <Compass size={14} className="text-emerald-400" />
              <span>{t("landing.terrainTag")}</span>
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-white tracking-tight">
              {t("landing.terrainTitle")}
            </h2>

            <p className="text-xs sm:text-sm text-white/80 leading-relaxed font-sans">
              {t("landing.terrainSubtitle")}
            </p>
          </div>

          {/* Interactive Controls Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-white/5 border border-white/10 p-3.5 rounded-xl backdrop-blur-md">
            {/* Relief Exaggeration Slider */}
            <div className="flex items-center gap-2 text-xs">
              <Sliders size={14} className="text-amber-400 shrink-0" />
              <span className="text-white/70">
                {isKn ? "ಎತ್ತರದ ಮಾದರಿ:" : "Relief Scale:"}
              </span>
              <input
                type="range"
                min="0.8"
                max="2.5"
                step="0.1"
                value={reliefScale}
                onChange={(e) => setReliefScale(parseFloat(e.target.value))}
                className="w-24 accent-amber-400 cursor-pointer"
                aria-label="Terrain elevation exaggeration"
              />
              <span className="font-mono text-amber-300 text-[11px]">
                {reliefScale.toFixed(1)}×
              </span>
            </div>

            {/* Renderer Toggle (3D WebGL vs Topo SVG) */}
            <button
              type="button"
              onClick={() => setUseFallback(!useFallback)}
              className="text-[11px] px-2.5 py-1 rounded-md bg-white/10 hover:bg-white/20 text-white/80 transition-colors font-mono"
            >
              {useFallback ? "Switch to 3D WebGL" : "Switch to 2D Topo SVG"}
            </button>
          </div>
        </div>

        {/* Biome Filter Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {biomes.map((biome) => (
            <button
              key={biome.id}
              type="button"
              onClick={() => setBiomeFilter(biome.id)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                biomeFilter === biome.id
                  ? "bg-amber-400 text-forest-dark font-semibold shadow-xs"
                  : "bg-white/5 text-white/70 hover:bg-white/10 hover:text-white border border-white/10"
              }`}
            >
              {isKn ? biome.labelKn : biome.labelEn}
            </button>
          ))}
        </div>

        {/* Main 3D Canvas + Landmark Inspector Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* 3D WebGL / SVG Visualization (8 Columns) */}
          <div className="lg:col-span-8 relative">
            {useFallback ? (
              <TerrainSvgFallback
                selectedLandmark={selectedLandmark}
                onSelectLandmark={setSelectedLandmark}
                isKn={isKn}
                biomeFilter={biomeFilter}
              />
            ) : (
              <TerrainCanvas
                reliefScale={reliefScale}
                selectedLandmark={selectedLandmark}
                onSelectLandmark={setSelectedLandmark}
                biomeFilter={biomeFilter}
                onWebGlError={() => setUseFallback(true)}
              />
            )}

            {/* Instruction Badge */}
            <div className="absolute top-4 left-4 z-10 pointer-events-none flex items-center gap-2 px-3 py-1 rounded-md bg-black/60 border border-white/10 text-[11px] text-white/80 backdrop-blur-xs">
              <RotateCcw size={12} className="text-amber-300" />
              <span>
                {isKn
                  ? "ಭೂಪ್ರದೇಶವನ್ನು ತಿರುಗಿಸಲು ಡ್ರ್ಯಾಗ್ ಮಾಡಿ · ಸ್ಥಳವನ್ನು ಆಯ್ಕೆ ಮಾಡಲು ಕ್ಲಿಕ್ ಮಾಡಿ"
                  : "Drag to rotate terrain · Click landmark pins to inspect"}
              </span>
            </div>
          </div>

          {/* Active Landmark Verified Inspector (4 Columns) */}
          <div className="lg:col-span-4 bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md space-y-5">
            <div className="flex items-center justify-between text-xs border-b border-white/10 pb-3">
              <span className="inline-flex items-center gap-1.5 text-amber-300 font-semibold uppercase tracking-wider text-[11px]">
                <Sparkles size={13} />
                {isKn ? selectedLandmark.biomeLabelKn : selectedLandmark.biomeLabelEn}
              </span>
              <span className="font-mono text-emerald-400 text-[11px]">
                {selectedLandmark.elevationMeters}m MSL
              </span>
            </div>

            {/* Thumbnail Image */}
            <div className="relative h-44 w-full rounded-xl overflow-hidden border border-white/15">
              <Image
                src={selectedLandmark.image}
                alt={selectedLandmark.nameEn}
                fill
                sizes="(max-width: 1024px) 100vw, 33vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              <div className="absolute bottom-2.5 left-3 text-xs font-semibold text-white">
                {selectedLandmark.districtEn} District
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

            {/* Quick Cycle Pins */}
            <div className="pt-2 flex items-center justify-between text-xs text-white/60">
              <span>{isKn ? "ಇತರ ತಾಣಗಳನ್ನು ನೋಡಿ:" : "Select landmark:"}</span>
              <div className="flex items-center gap-1.5">
                {KARNATAKA_LANDMARKS.map((lm) => (
                  <button
                    key={lm.id}
                    type="button"
                    onClick={() => setSelectedLandmark(lm)}
                    className={`w-6 h-6 rounded-full text-[10px] font-mono transition-all ${
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
