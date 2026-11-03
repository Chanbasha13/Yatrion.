"use client";

import React from "react";
import { ShieldCheck } from "lucide-react";
import { KARNATAKA_LANDMARKS, type VerifiedLandmark } from "./terrain-data";

interface TerrainSvgFallbackProps {
  selectedLandmark: VerifiedLandmark | null;
  onSelectLandmark: (landmark: VerifiedLandmark) => void;
  isKn: boolean;
  biomeFilter: string;
}

export function TerrainSvgFallback({
  selectedLandmark,
  onSelectLandmark,
  isKn,
  biomeFilter,
}: TerrainSvgFallbackProps) {
  // Convert lat/lng to SVG viewport (Viewbox 0 0 500 650)
  // Karnataka Bounds: Lat 11.5 to 18.5 (Range: 7), Lng 74.0 to 78.5 (Range: 4.5)
  const projectCoords = (lat: number, lng: number) => {
    const minLat = 11.5;
    const maxLat = 18.5;
    const minLng = 74.0;
    const maxLng = 78.5;

    // Normalizing
    const normX = (lng - minLng) / (maxLng - minLng);
    const normY = 1 - (lat - minLat) / (maxLat - minLat); // Invert Y for SVG

    const x = 50 + normX * 400;
    const y = 50 + normY * 550;
    return { x, y };
  };

  const filteredLandmarks = KARNATAKA_LANDMARKS.filter(
    (l) => biomeFilter === "all" || l.biome === biomeFilter
  );

  return (
    <div className="relative w-full h-[520px] bg-[#0A1A14] rounded-2xl overflow-hidden border border-emerald-900/40 p-4 flex flex-col justify-between">
      {/* Topographic Background Overlay */}
      <div className="absolute inset-0 bg-radial from-emerald-950/40 via-[#0A1A14] to-[#0A1A14] pointer-events-none" />

      {/* SVG Topographic Contour Vectors */}
      <svg
        viewBox="0 0 500 650"
        className="w-full h-full object-contain filter drop-shadow-md select-none"
        aria-label="Karnataka Topographic Contour Relief Map"
      >
        <defs>
          {/* Subtle glow for pins */}
          <filter id="pin-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Karnataka State Boundary Outline (Approximate Geodetic Polygon) */}
        <path
          d="M 120,70 L 220,50 L 330,60 L 400,120 L 440,200 L 410,310 L 370,410 L 350,520 L 290,610 L 220,620 L 190,560 L 140,510 L 100,430 L 70,330 L 90,210 Z"
          fill="rgba(15, 56, 42, 0.45)"
          stroke="rgba(245, 158, 11, 0.35)"
          strokeWidth="1.5"
          strokeDasharray="4 2"
        />

        {/* Western Ghats Mountain Ridge Isolines (Elevation > 900m) */}
        <path
          d="M 90,210 Q 110,320 120,420 T 160,540 L 180,550 Q 150,440 130,330 T 110,210 Z"
          fill="rgba(16, 185, 129, 0.18)"
          stroke="rgba(16, 185, 129, 0.5)"
          strokeWidth="1.2"
        />
        <path
          d="M 100,280 Q 120,380 140,490 L 155,480 Q 135,380 115,280 Z"
          fill="rgba(245, 158, 11, 0.12)"
          stroke="rgba(245, 158, 11, 0.4)"
          strokeWidth="1"
        />

        {/* Karavali Coastal Strip (Elevation 0 - 50m) */}
        <path
          d="M 70,330 Q 85,410 100,430 L 140,510 L 130,520 Q 90,440 75,340 Z"
          fill="rgba(56, 189, 248, 0.15)"
          stroke="rgba(56, 189, 248, 0.4)"
          strokeWidth="1"
        />

        {/* Landmark Hotspot Pins */}
        {filteredLandmarks.map((landmark) => {
          const { x, y } = projectCoords(landmark.lat, landmark.lng);
          const isSelected = selectedLandmark?.id === landmark.id;

          return (
            <g
              key={landmark.id}
              className="cursor-pointer transition-transform hover:scale-125"
              onClick={() => onSelectLandmark(landmark)}
              tabIndex={0}
              role="button"
              aria-label={landmark.nameEn}
            >
              {/* Outer Pulse Ring */}
              <circle
                cx={x}
                cy={y}
                r={isSelected ? 14 : 9}
                fill={isSelected ? "rgba(245, 158, 11, 0.3)" : "rgba(16, 185, 129, 0.25)"}
                className={isSelected ? "animate-ping" : ""}
              />

              {/* Pin Core */}
              <circle
                cx={x}
                cy={y}
                r={isSelected ? 6 : 4.5}
                fill={isSelected ? "#F59E0B" : "#10B981"}
                stroke="#FFFFFF"
                strokeWidth="1.5"
                filter="url(#pin-glow)"
              />

              {/* Landmark Label */}
              <text
                x={x + 10}
                y={y + 4}
                fill="#FFFFFF"
                fontSize="11"
                fontFamily="var(--font-inter), sans-serif"
                fontWeight={isSelected ? "700" : "500"}
                className="select-none pointer-events-none drop-shadow-md"
              >
                {isKn ? landmark.nameKn : landmark.nameEn}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Verified Geographic Source Pill */}
      <div className="relative z-10 flex items-center justify-between text-[11px] text-white/60 bg-black/40 px-3 py-1.5 rounded-lg border border-white/10 backdrop-blur-xs">
        <span className="flex items-center gap-1.5">
          <ShieldCheck size={13} className="text-emerald-400" />
          <span>{isKn ? "ಪರಿಶೀಲಿತ ಸರ್ವೇ ಆಫ್ ಇಂಡಿಯಾ ನಿರ್ದೇಶಾಂಕಗಳು" : "Survey of India Geodetic Coordinates"}</span>
        </span>
        <span className="font-mono text-amber-300">11.5°N – 18.5°N</span>
      </div>
    </div>
  );
}
