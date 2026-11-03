"use client";

import {
  Navigation,
  ExternalLink,
  Car,
  Utensils,
  Coffee,
  Undo2,
  Mountain,
  Trees,
  Waves,
} from "lucide-react";
import type { DailyRoute, RouteStop } from "@/lib/routes/route-types";
import { RouteStopCard } from "./route-stop-card";
import { useLanguage } from "@/lib/i18n";

interface DailyRouteTimelineProps {
  dailyRoute: DailyRoute;
  completedStopKeys: string[];
  stopNotes: Record<string, string>;
  removedStops?: RouteStop[];
  onMoveStop: (dayNumber: number, fromIdx: number, direction: "up" | "down") => void;
  onRemoveStop: (dayNumber: number, stopIdx: number) => void;
  onRestoreStop: (dayNumber: number, stop: RouteStop) => void;
  onToggleCompleted: (key: string) => void;
  onSaveStopNote: (key: string, note: string) => void;
}

export function DailyRouteTimeline({
  dailyRoute,
  completedStopKeys,
  stopNotes,
  removedStops = [],
  onMoveStop,
  onRemoveStop,
  onRestoreStop,
  onToggleCompleted,
  onSaveStopNote,
}: DailyRouteTimelineProps) {
  const { isKn } = useLanguage();

  const dayNum = dailyRoute.dayNumber;

  // Format transit time
  const formatMins = (minutes: number) => {
    const hrs = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    if (hrs === 0) return `${mins} ${isKn ? "ನಿಮಿಷ" : "mins"}`;
    if (mins === 0) return `${hrs} ${isKn ? "ಗಂಟೆ" : "hrs"}`;
    return `${hrs}h ${mins}m`;
  };

  // Terrain badge
  const renderTerrainBadge = (terrain: "plains" | "ghats" | "coastal") => {
    switch (terrain) {
      case "ghats":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 px-2 py-0.5 text-[10px] font-bold font-mono uppercase tracking-wider">
            <Mountain size={10} className="text-emerald-700" />
            <span>{isKn ? "ಘಟ್ಟ ರಸ್ತೆ (1.48x)" : "Western Ghats (1.48x)"}</span>
          </span>
        );
      case "coastal":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-teal-100 text-teal-900 border border-teal-300 px-2 py-0.5 text-[10px] font-bold font-mono uppercase tracking-wider">
            <Waves size={10} className="text-teal-700" />
            <span>{isKn ? "ಕರಾವಳಿ ಹೆದ್ದಾರಿ (1.28x)" : "Coastal Corridor (1.28x)"}</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 text-[10px] font-bold font-mono uppercase tracking-wider">
            <Trees size={10} className="text-amber-700" />
            <span>{isKn ? "ದಖ್ಖನ್ ಪ್ರಸ್ಥಭೂಮಿ (1.22x)" : "Deccan Plains (1.22x)"}</span>
          </span>
        );
    }
  };

  // Find arrival leg if any
  const arrivalLeg =
    dailyRoute.legs.length > 0 && dailyRoute.legs[0].fromStopId === "start-origin"
      ? dailyRoute.legs[0]
      : null;

  // Regular legs between stops
  const intermediateLegs = dailyRoute.legs.filter(
    (l) => l.fromStopId !== "start-origin"
  );

  return (
    <div className="rounded-[var(--radius-xl)] border border-border bg-white p-5 sm:p-7 shadow-card space-y-6">
      {/* ── DAY HEADER & METRICS ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center rounded-md bg-forest px-2.5 py-1 text-xs font-bold font-mono text-white">
              {isKn ? `ದಿನ ${dayNum}` : `Day ${dayNum}`}
            </span>
            {dailyRoute.dateLabel && (
              <span className="text-xs font-semibold text-charcoal-muted font-mono">
                {dailyRoute.dateLabel}
              </span>
            )}
            <span className="text-xs font-bold text-forest">
              {isKn ? dailyRoute.destinationKannada : dailyRoute.destinationName}
            </span>
          </div>

          <h3 className="text-lg sm:text-xl font-bold text-forest-dark mt-1 font-[family-name:var(--font-playfair)]">
            {isKn ? dailyRoute.themeKn : dailyRoute.themeEn}
          </h3>
        </div>

        {/* Daily Metrics Summary Pills */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
          <div className="px-3 py-1.5 rounded-[var(--radius-md)] bg-ivory-warm border border-border text-charcoal">
            <span className="text-charcoal-muted text-[10px] block uppercase tracking-wider font-sans">
              {isKn ? "ರಸ್ತೆ ದೂರ (ಅಂದಾಜು)" : "Road Distance"}
            </span>
            <span className="font-bold text-forest">
              ~{dailyRoute.totalDistanceKm} km
            </span>
          </div>

          <div className="px-3 py-1.5 rounded-[var(--radius-md)] bg-ivory-warm border border-border text-charcoal">
            <span className="text-charcoal-muted text-[10px] block uppercase tracking-wider font-sans">
              {isKn ? "ಪ್ರಯಾಣ ಸಮಯ" : "Transit Time"}
            </span>
            <span className="font-bold text-charcoal">
              ~{formatMins(dailyRoute.totalTravelTimeMinutes)}
            </span>
          </div>

          <div className="px-3 py-1.5 rounded-[var(--radius-md)] bg-ivory-warm border border-border text-charcoal">
            <span className="text-charcoal-muted text-[10px] block uppercase tracking-wider font-sans">
              {isKn ? "ನಿಲುಗಡೆಗಳು" : "Stops"}
            </span>
            <span className="font-bold text-forest">
              {dailyRoute.stops.length} {isKn ? "ತಾಣಗಳು" : "attractions"}
            </span>
          </div>
        </div>
      </div>

      {/* ── TIMELINE CONTAINER ── */}
      <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:top-3 before:bottom-3 before:left-3 before:w-0.5 before:bg-forest/20">
        {/* Arrival Leg (Day 1) */}
        {arrivalLeg && (
          <div className="relative">
            <span className="absolute -left-6 sm:-left-8 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-forest text-white ring-4 ring-white shadow-subtle">
              <Navigation size={12} />
            </span>

            <div className="rounded-[var(--radius-md)] border border-forest/20 bg-forest/5 p-3.5 text-xs text-charcoal flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-forest-dark">
                    {arrivalLeg.fromTitle} → {arrivalLeg.toTitle}
                  </span>
                  {renderTerrainBadge(arrivalLeg.terrainType)}
                </div>
                <p className="text-charcoal-muted">
                  {isKn
                    ? `ಅಂದಾಜು ಪ್ರಯಾಣ ದೂರ: ~${arrivalLeg.estimatedRoadDistanceKm} km (${arrivalLeg.haversineDistanceKm} km ನೇರ ರೇಖೆ + ಭೂಪ್ರದೇಶ ತಿರುವುಗಳು) · ಅವಧಿ: ~${formatMins(arrivalLeg.estimatedDurationMinutes)}`
                    : `Est. transit distance: ~${arrivalLeg.estimatedRoadDistanceKm} km (${arrivalLeg.haversineDistanceKm} km direct line + terrain factor) · Est. duration: ~${formatMins(arrivalLeg.estimatedDurationMinutes)}`}
                </p>
                {arrivalLeg.transitAdviceEn && (
                  <p className="text-[11px] text-forest font-medium italic">
                    💡 {isKn ? arrivalLeg.transitAdviceKn || arrivalLeg.transitAdviceEn : arrivalLeg.transitAdviceEn}
                  </p>
                )}
              </div>

              {arrivalLeg.googleMapsDirUrl && (
                <a
                  href={arrivalLeg.googleMapsDirUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-white border border-border text-xs font-semibold text-forest hover:bg-forest hover:text-white transition-colors cursor-pointer shadow-subtle no-print"
                  title={isKn ? "ಗೂಗಲ್ ಮ್ಯಾಪ್ಸ್‌ನಲ್ಲಿ ದಾರಿ ನಕ್ಷೆ ತೆರೆಯಿರಿ" : "Open directions on Google Maps"}
                >
                  <Car size={13} />
                  <span>{isKn ? "ದಾರಿ ನಕ್ಷೆ" : "Directions"}</span>
                  <ExternalLink size={11} />
                </a>
              )}
            </div>
          </div>
        )}

        {/* Stops & Legs */}
        {dailyRoute.stops.map((stop, sIdx) => {
          const stopKey = `${dayNum}-${sIdx}`;
          const isCompleted = completedStopKeys.includes(stopKey);
          const userNote = stopNotes[stopKey] || "";

          // Intermediate leg following this stop
          const followingLeg = intermediateLegs.find(
            (l) => l.fromStopId === stop.id
          );

          // Meal break matching time of day
          const matchingMeal = dailyRoute.mealBreaks.find((mb) => {
            if (sIdx === 0 && mb.timeOfDay === "morning") return true;
            if (sIdx === 1 && mb.timeOfDay === "afternoon") return true;
            if (sIdx >= 2 && mb.timeOfDay === "evening") return true;
            return false;
          });

          return (
            <div key={stop.id} className="space-y-4">
              {/* Stop Card */}
              <div className="relative">
                <span className="absolute -left-6 sm:-left-8 top-5 flex h-6 w-6 items-center justify-center rounded-full bg-forest text-white ring-4 ring-white shadow-subtle text-xs font-bold font-mono">
                  {sIdx + 1}
                </span>

                <RouteStopCard
                  stop={stop}
                  dayNumber={dayNum}
                  index={sIdx}
                  totalStops={dailyRoute.stops.length}
                  isCompleted={isCompleted}
                  userNote={userNote}
                  onMoveUp={() => onMoveStop(dayNum, sIdx, "up")}
                  onMoveDown={() => onMoveStop(dayNum, sIdx, "down")}
                  onRemove={() => onRemoveStop(dayNum, sIdx)}
                  onToggleCompleted={() => onToggleCompleted(stopKey)}
                  onSaveNote={(note) => onSaveStopNote(stopKey, note)}
                />
              </div>

              {/* Meal / Rest Break Recommendation (Interleaved) */}
              {matchingMeal && (
                <div className="relative my-2">
                  <span className="absolute -left-6 sm:-left-8 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-white ring-4 ring-white shadow-subtle">
                    {matchingMeal.timeOfDay === "evening" ? (
                      <Coffee size={10} />
                    ) : (
                      <Utensils size={10} />
                    )}
                  </span>
                  <div className="rounded-md border border-amber-200 bg-amber-50/70 px-3.5 py-2 text-xs text-amber-900 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold">
                        {isKn ? matchingMeal.titleKn : matchingMeal.titleEn}
                      </span>
                      <span className="text-[11px] font-mono text-amber-800">
                        (~{matchingMeal.durationMinutes}m)
                      </span>
                    </div>
                    <span className="text-[11px] text-amber-800 italic">
                      {isKn ? matchingMeal.recommendationKn : matchingMeal.recommendationEn}
                    </span>
                  </div>
                </div>
              )}

              {/* Transit Leg Connector to Next Stop */}
              {followingLeg && (
                <div className="relative my-2 pl-2">
                  <div className="rounded-md border border-dashed border-border bg-ivory-warm/70 p-3 text-xs text-charcoal flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                    <div className="space-y-0.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-forest-dark">
                          {isKn ? "ಮುಂದಿನ ತಾಣಕ್ಕೆ ಪ್ರಯಾಣ:" : "Transit to next stop:"} ~{followingLeg.estimatedRoadDistanceKm} km
                        </span>
                        <span className="font-mono text-charcoal-muted">
                          (~{formatMins(followingLeg.estimatedDurationMinutes)})
                        </span>
                        {renderTerrainBadge(followingLeg.terrainType)}
                      </div>
                      {followingLeg.transitAdviceEn && (
                        <p className="text-[11px] text-charcoal-muted italic">
                          {isKn
                            ? followingLeg.transitAdviceKn || followingLeg.transitAdviceEn
                            : followingLeg.transitAdviceEn}
                        </p>
                      )}
                    </div>

                    {followingLeg.googleMapsDirUrl && (
                      <a
                        href={followingLeg.googleMapsDirUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="shrink-0 inline-flex items-center gap-1 text-[11px] font-semibold text-forest hover:text-forest-light underline cursor-pointer no-print"
                        title={isKn ? "ಗೂಗಲ್ ಮ್ಯಾಪ್ಸ್‌ನಲ್ಲಿ ದಾರಿ ನೋಡಿ" : "View route on Google Maps"}
                      >
                        <Navigation size={11} />
                        <span>{isKn ? "ದಾರಿ ನಕ್ಷೆ" : "Get Directions"}</span>
                        <ExternalLink size={10} />
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {dailyRoute.stops.length === 0 && (
          <div className="p-6 text-center text-xs text-charcoal-muted italic border border-dashed border-border rounded-lg">
            {isKn
              ? "ಈ ದಿನಕ್ಕೆ ಯಾವುದೇ ನಿಲುಗಡೆಗಳು ಉಳಿದಿಲ್ಲ. ಕೆಳಗಿನಿಂದ ತೆಗೆದುಹಾಕಲಾದ ನಿಲುಗಡೆಗಳನ್ನು ಮರುಸ್ಥಾಪಿಸಿ."
              : "No stops remaining for this day. You can restore previously removed stops below."}
          </div>
        )}
      </div>

      {/* ── REMOVED STOPS TRAY ── */}
      {removedStops.length > 0 && (
        <div className="mt-4 p-4 rounded-[var(--radius-md)] border border-warning/30 bg-warning/5 space-y-2 no-print">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-forest-dark flex items-center gap-1.5">
              <Undo2 size={13} className="text-forest" />
              <span>
                {isKn
                  ? `ಈ ದಿನದಿಂದ ತೆಗೆದುಹಾಕಲಾದ ನಿಲುಗಡೆಗಳು (${removedStops.length}):`
                  : `Removed Stops from this Day (${removedStops.length}):`}
              </span>
            </span>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            {removedStops.map((remStop) => (
              <button
                key={remStop.id}
                type="button"
                onClick={() => onRestoreStop(dayNum, remStop)}
                className="inline-flex items-center gap-1.5 rounded-md border border-border bg-white px-2.5 py-1 text-xs text-charcoal hover:bg-forest hover:text-white hover:border-forest transition-colors cursor-pointer shadow-subtle"
                title={isKn ? "ಈ ನಿಲುಗಡೆಯನ್ನು ಮರುಸ್ಥಾಪಿಸಿ" : "Restore this stop"}
              >
                <Undo2 size={11} />
                <span>{isKn ? remStop.titleKn || remStop.title : remStop.title}</span>
                <span className="text-[10px] opacity-75">
                  ({remStop.estimatedDurationMinutes}m)
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
