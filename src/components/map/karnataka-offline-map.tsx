"use client";

import React from "react";
import type { MapLandmark } from "./karnataka-map-data";

export interface KarnatakaOfflineMapProps {
  landmarks: MapLandmark[];
  selectedLandmark: MapLandmark | null;
  onSelectLandmark: (landmark: MapLandmark) => void;
  isKn?: boolean;
}

/**
 * High-precision SVG vector map of Karnataka.
 * Projects geodetic latitude (11.5°N – 18.5°N) and longitude (74.0°E – 78.5°E)
 * into an SVG coordinate space (800x600).
 */
export function KarnatakaOfflineMap({
  landmarks,
  selectedLandmark,
  onSelectLandmark,
  isKn = false,
}: KarnatakaOfflineMapProps) {
  // Geodetic projection functions for Karnataka bounds
  const minLat = 11.5;
  const maxLat = 18.5;
  const minLng = 74.0;
  const maxLng = 78.5;

  const projectX = (lng: number) => {
    return ((lng - minLng) / (maxLng - minLng)) * 640 + 80;
  };

  const projectY = (lat: number) => {
    // Invert Y for screen coordinates (north is up)
    return (1 - (lat - minLat) / (maxLat - minLat)) * 480 + 60;
  };

  return (
    <div className="relative w-full h-[520px] rounded-2xl bg-[#081510] border border-white/10 overflow-hidden flex items-center justify-center p-4">
      <svg
        viewBox="0 0 800 600"
        className="w-full h-full max-h-[500px]"
        role="img"
        aria-label="Karnataka State Vector Map"
      >
        <defs>
          <linearGradient id="karnatakaBg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0B2B1F" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#1B4332" stopOpacity="0.9" />
          </linearGradient>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Karnataka State Stylized Boundary Polygon */}
        <path
          d="M 280,70 L 410,65 L 530,95 L 610,150 L 590,240 L 630,300 L 560,390 L 520,490 L 430,550 L 350,540 L 260,500 L 190,430 L 140,360 L 120,290 L 160,220 L 210,140 Z"
          fill="url(#karnatakaBg)"
          stroke="#D4AF37"
          strokeWidth="1.8"
          strokeDasharray="4 2"
          className="opacity-90"
        />

        {/* District divisions guide lines */}
        <path
          d="M 140,360 Q 300,320 590,240 M 190,430 Q 380,390 560,390 M 210,140 Q 380,180 610,150"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="1"
          fill="none"
        />

        {/* Coastal Line Annotation */}
        <text x="75" y="300" fill="#38BDF8" fontSize="11" fontFamily="sans-serif" className="tracking-widest">
          ARABIAN SEA
        </text>

        {/* Render Landmark Pins */}
        {landmarks.map((lm) => {
          const cx = projectX(lm.lng);
          const cy = projectY(lm.lat);
          const isSelected = selectedLandmark?.id === lm.id;

          return (
            <g
              key={lm.id}
              onClick={() => onSelectLandmark(lm)}
              className="cursor-pointer transition-transform duration-200"
              role="button"
              tabIndex={0}
            >
              {/* Outer pulsing ring if selected */}
              {isSelected && (
                <circle
                  cx={cx}
                  cy={cy}
                  r="18"
                  fill="none"
                  stroke="#F59E0B"
                  strokeWidth="2"
                  className="animate-ping opacity-75"
                />
              )}

              {/* Pin Base Circle */}
              <circle
                cx={cx}
                cy={cy}
                r={isSelected ? "9" : "6"}
                fill={isSelected ? "#F59E0B" : "#10B981"}
                stroke="#FAF7F2"
                strokeWidth="1.8"
                filter={isSelected ? "url(#glow)" : undefined}
              />

              {/* Pin Label */}
              <text
                x={cx}
                y={cy - 12}
                textAnchor="middle"
                fill={isSelected ? "#F59E0B" : "#FAF7F2"}
                fontSize={isSelected ? "11" : "9"}
                fontWeight={isSelected ? "bold" : "normal"}
                fontFamily="sans-serif"
                className="pointer-events-none drop-shadow-md"
              >
                {isKn ? lm.nameKn : lm.nameEn}
              </text>
            </g>
          );
        })}
      </svg>

      <div className="absolute bottom-3 left-4 text-[10px] text-white/50 font-mono">
        Karnataka Vector Fallback · Projected Geodetic Coordinates
      </div>
    </div>
  );
}

