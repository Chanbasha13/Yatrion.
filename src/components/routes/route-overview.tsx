"use client";

import { useState } from "react";
import {
  Compass,
  MapPin,
  Car,
  AlertTriangle,
  Info,
  ShieldAlert,
  Sparkles,
  ExternalLink,
  RotateCcw,
  RefreshCw,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import type {
  OptimizedRoutePlan,
  TravelIntensity,
} from "@/lib/routes/route-types";
import { useLanguage } from "@/lib/i18n";
import { getGoogleMapsDirectionsUrl } from "@/lib/routes/route-estimates";

interface RouteOverviewProps {
  routePlan: OptimizedRoutePlan;
  onRegenerateRoute: () => void;
  onResetRoute?: () => void;
  isRegenerating?: boolean;
}

export function RouteOverview({
  routePlan,
  onRegenerateRoute,
  onResetRoute,
  isRegenerating = false,
}: RouteOverviewProps) {
  const { isKn } = useLanguage();
  const [showAllWarnings, setShowAllWarnings] = useState(true);

  // Intensity badge styling
  const getIntensityBadge = (intensity: TravelIntensity) => {
    switch (intensity) {
      case "relaxed":
        return {
          labelEn: "Relaxed Pace",
          labelKn: "ಆರಾಮದಾಯಕ ವೇಗ",
          color: "bg-emerald-100 text-emerald-900 border-emerald-300",
        };
      case "packed":
        return {
          labelEn: "Packed / Fast-Paced",
          labelKn: "ವೇಗದ ಗತಿಯ ಪ್ರವಾಸ",
          color: "bg-amber-100 text-amber-900 border-amber-300",
        };
      default:
        return {
          labelEn: "Balanced Pace",
          labelKn: "ಸಮತೋಲಿತ ವೇಗ",
          color: "bg-forest/10 text-forest border-forest/30",
        };
    }
  };

  const intensityBadge = getIntensityBadge(routePlan.intensity);

  // Generate full circuit directions URL if we have multiple destinations
  const firstDestCoord = routePlan.dailyRoutes[0]?.stops[0]?.coordinates;
  const lastDestCoord =
    routePlan.dailyRoutes[routePlan.dailyRoutes.length - 1]?.stops[
      routePlan.dailyRoutes[routePlan.dailyRoutes.length - 1]?.stops.length - 1
    ]?.coordinates;

  const fullCircuitMapsUrl =
    firstDestCoord && lastDestCoord
      ? getGoogleMapsDirectionsUrl(
          routePlan.startCoordinates,
          lastDestCoord,
          routePlan.transport
        )
      : undefined;

  return (
    <div className="rounded-[var(--radius-xl)] border border-border bg-white p-6 sm:p-8 shadow-card space-y-6">
      {/* ── TOP HEADER & CIRCUIT ACTIONS ── */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-6 border-b border-border">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-gold mb-1 font-mono">
            <Compass size={14} />
            <span>
              {isKn
                ? "ಸ್ಮಾರ್ಟ್ ಮಾರ್ಗ ಆಪ್ಟಿಮೈಸೇಶನ್ ಎಂಜಿನ್ (ಭಾಗ 10)"
                : "Smart Route Optimization Engine (Part 10)"}
            </span>
          </div>

          <h3 className="font-[family-name:var(--font-playfair)] text-xl sm:text-2xl font-bold text-forest-dark">
            {isKn ? routePlan.kannadaSubtitle : routePlan.title}
          </h3>

          <p className="text-xs sm:text-sm text-charcoal-muted mt-1 leading-relaxed">
            {isKn
              ? "ಕರ್ನಾಟಕದ ಭೌಗೋಳಿಕತೆ (ಘಟ್ಟ, ಕರಾವಳಿ, ಮೈದಾನ), ದೇವಾಲಯಗಳ ಸಮಯ ಮತ್ತು ಹಿಂದಿರುಗುವಿಕೆಯನ್ನು ತಪ್ಪಿಸಿ ರಚಿಸಲಾದ ಅತ್ಯುತ್ತಮ ಮಾರ್ಗ ಪಥ."
              : "Optimized itinerary trail minimizing backtracking, incorporating Western Ghats detour factors, temple timings, and practical daily transit."}
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0 no-print">
          {fullCircuitMapsUrl && (
            <a
              href={fullCircuitMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-[var(--radius-md)] border border-forest/30 bg-forest/5 px-3.5 py-2 text-xs font-semibold text-forest hover:bg-forest hover:text-white transition-colors cursor-pointer shadow-subtle"
              title={
                isKn
                  ? "ಗೂಗಲ್ ಮ್ಯಾಪ್ಸ್‌ನಲ್ಲಿ ಸಂಪೂರ್ಣ ಪ್ರವಾಸ ನಕ್ಷೆ ವೀಕ್ಷಿಸಿ"
                  : "Open full circuit on Google Maps (opens external link in new tab)"
              }
            >
              <Car size={13} />
              <span>{isKn ? "ಸಂಪೂರ್ಣ ಗೂಗಲ್ ಮ್ಯಾಪ್" : "Full Circuit Map"}</span>
              <ExternalLink size={11} />
            </a>
          )}

          <button
            type="button"
            onClick={onRegenerateRoute}
            disabled={isRegenerating}
            className="inline-flex items-center gap-1.5 rounded-[var(--radius-md)] bg-forest px-3.5 py-2 text-xs font-semibold text-white hover:bg-forest-light transition-colors cursor-pointer shadow-subtle disabled:opacity-50"
          >
            <RefreshCw size={13} className={isRegenerating ? "animate-spin" : ""} />
            <span>
              {isRegenerating
                ? isKn
                  ? "ಮಾರ್ಗ ಲೆಕ್ಕಾಚಾರ..."
                  : "Calculating..."
                : isKn
                ? "ಮಾರ್ಗ ಮರು-ಆಪ್ಟಿಮೈಸ್"
                : "Re-Optimize Route"}
            </span>
          </button>

          {onResetRoute && (
            <button
              type="button"
              onClick={onResetRoute}
              className="inline-flex items-center gap-1.5 rounded-[var(--radius-md)] border border-border bg-ivory-warm px-3 py-2 text-xs font-semibold text-charcoal hover:bg-cream transition-colors cursor-pointer"
              title={isKn ? "ಮೂಲ ಮಾರ್ಗಕ್ಕೆ ಮರುಹೊಂದಿಸಿ" : "Reset custom route"}
            >
              <RotateCcw size={13} />
              <span>{isKn ? "ಮರುಹೊಂದಿಸಿ" : "Reset"}</span>
            </button>
          )}
        </div>
      </div>

      {/* ── METRICS OVERVIEW STATS GRID ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
        <div className="p-3.5 rounded-[var(--radius-md)] bg-ivory-warm border border-border">
          <span className="text-[10px] font-semibold text-charcoal-muted uppercase tracking-wider font-mono block">
            {isKn ? "ಒಟ್ಟು ರಸ್ತೆ ದೂರ" : "Total Road Distance"}
          </span>
          <p className="text-base sm:text-lg font-bold text-forest mt-0.5 font-mono">
            ~{routePlan.totalEstimatedDistanceKm} km
          </p>
          <span className="text-[10px] text-charcoal-muted">
            {isKn ? "ಭೂಪ್ರದೇಶ ತಿರುವುಗಳು ಸೇರಿವೆ" : "incl. terrain factors"}
          </span>
        </div>

        <div className="p-3.5 rounded-[var(--radius-md)] bg-ivory-warm border border-border">
          <span className="text-[10px] font-semibold text-charcoal-muted uppercase tracking-wider font-mono block">
            {isKn ? "ಒಟ್ಟು ಪ್ರಯಾಣ ಸಮಯ" : "Total Transit Time"}
          </span>
          <p className="text-base sm:text-lg font-bold text-charcoal mt-0.5 font-mono">
            ~{routePlan.totalEstimatedTransitHours} {isKn ? "ಗಂಟೆಗಳು" : "hours"}
          </p>
          <span className="text-[10px] text-charcoal-muted">
            {isKn ? "ಮಾರ್ಗದಲ್ಲಿನ ಚಲನೆ" : "pure road transit"}
          </span>
        </div>

        <div className="p-3.5 rounded-[var(--radius-md)] bg-ivory-warm border border-border">
          <span className="text-[10px] font-semibold text-charcoal-muted uppercase tracking-wider font-mono block">
            {isKn ? "ಪ್ರಯಾಣದ ತೀವ್ರತೆ" : "Travel Intensity"}
          </span>
          <div className="mt-1">
            <span
              className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-bold border ${intensityBadge.color}`}
            >
              {isKn ? intensityBadge.labelKn : intensityBadge.labelEn}
            </span>
          </div>
          <p className="text-[10px] text-charcoal-muted mt-1 truncate">
            {isKn ? routePlan.intensityReasonKn : routePlan.intensityReasonEn}
          </p>
        </div>

        <div className="p-3.5 rounded-[var(--radius-md)] bg-ivory-warm border border-border">
          <span className="text-[10px] font-semibold text-charcoal-muted uppercase tracking-wider font-mono block">
            {isKn ? "ಯೋಜಿತ ತಾಣಗಳು" : "Curated Stops"}
          </span>
          <p className="text-base sm:text-lg font-bold text-forest mt-0.5 font-mono">
            {routePlan.totalStopsCount} {isKn ? "ನಿಲುಗಡೆಗಳು" : "stops"}
          </p>
          <span className="text-[10px] text-charcoal-muted">
            {routePlan.dailyRoutes.length} {isKn ? "ದಿನಗಳಲ್ಲಿ" : "days planned"}
          </span>
        </div>
      </div>

      {/* ── MULTI-DESTINATION CIRCUIT BREADCRUMB ── */}
      <div className="p-3.5 rounded-[var(--radius-md)] bg-forest/5 border border-forest/20 flex flex-wrap items-center gap-2 text-xs">
        <span className="font-bold text-forest-dark uppercase tracking-wider text-[11px] font-mono mr-1">
          {isKn ? "ಮಾರ್ಗ ಹರಿವು:" : "Route Circuit:"}
        </span>
        <span className="inline-flex items-center gap-1 font-semibold text-charcoal">
          <MapPin size={12} className="text-forest" />
          <span>{routePlan.startingLocation} ({isKn ? "ಆರಂಭ" : "Origin"})</span>
        </span>

        {routePlan.dailyRoutes.map((dr) => (
          <div key={dr.dayNumber} className="flex items-center gap-2">
            <span className="text-forest font-bold">→</span>
            <span className="inline-flex items-center gap-1 rounded bg-white px-2 py-0.5 border border-border font-medium text-charcoal shadow-subtle">
              <span className="text-[10px] font-bold text-forest font-mono">
                D{dr.dayNumber}
              </span>
              <span>{isKn ? dr.destinationKannada : dr.destinationName}</span>
            </span>
          </div>
        ))}
      </div>

      {/* ── ROUTE FEASIBILITY WARNINGS & ADVISORIES ── */}
      {routePlan.feasibilityWarnings.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle size={16} className="text-amber-600" />
              <h4 className="text-sm font-bold text-forest-dark">
                {isKn
                  ? `ಮಾರ್ಗ ಕಾರ್ಯಸಾಧ್ಯತೆ & ಪ್ರಾಯೋಗಿಕ ಎಚ್ಚರಿಕೆಗಳು (${routePlan.feasibilityWarnings.length})`
                  : `Route Feasibility & Pacing Advisories (${routePlan.feasibilityWarnings.length})`}
              </h4>
            </div>

            <button
              type="button"
              onClick={() => setShowAllWarnings(!showAllWarnings)}
              className="inline-flex items-center gap-1 text-xs text-forest hover:text-forest-light cursor-pointer"
            >
              <span>{showAllWarnings ? (isKn ? "ಮರೆಮಾಡಿ" : "Collapse") : (isKn ? "ವೀಕ್ಷಿಸಿ" : "Expand")}</span>
              {showAllWarnings ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            </button>
          </div>

          {showAllWarnings && (
            <div className="space-y-2.5 animate-fade-in">
              {routePlan.feasibilityWarnings.map((warning, wIdx) => {
                const isCaution = warning.severity === "caution";
                const isWarning = warning.severity === "warning";

                return (
                  <div
                    key={wIdx}
                    role="alert"
                    className={`p-3.5 rounded-[var(--radius-md)] border text-xs flex items-start gap-3 shadow-subtle ${
                      isWarning
                        ? "border-amber-300 bg-amber-50/70 text-amber-950"
                        : isCaution
                        ? "border-orange-300 bg-orange-50/70 text-orange-950"
                        : "border-blue-200 bg-blue-50/70 text-blue-950"
                    }`}
                  >
                    {isWarning ? (
                      <AlertTriangle size={15} className="text-amber-600 shrink-0 mt-0.5" />
                    ) : isCaution ? (
                      <ShieldAlert size={15} className="text-orange-600 shrink-0 mt-0.5" />
                    ) : (
                      <Info size={15} className="text-blue-600 shrink-0 mt-0.5" />
                    )}

                    <div className="space-y-0.5 flex-1">
                      <p className="font-bold">
                        {isKn ? warning.titleKn : warning.titleEn}
                      </p>
                      <p className="leading-relaxed opacity-90">
                        {isKn ? warning.messageKn : warning.messageEn}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── ALTERNATIVE ROUTE SUGGESTIONS ── */}
      {routePlan.alternativeSuggestions.length > 0 && (
        <div className="rounded-[var(--radius-lg)] border border-forest/30 bg-forest/5 p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-forest" />
            <h4 className="text-sm font-bold text-forest-dark">
              {isKn ? "ಪರ್ಯಾಯ ಮಾರ್ಗ ಸಲಹೆಗಳು" : "Alternative Route Suggestions"}
            </h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {routePlan.alternativeSuggestions.map((alt) => (
              <div
                key={alt.id}
                className="p-3 rounded-md bg-white border border-border shadow-subtle space-y-1.5 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-forest">
                    {isKn ? alt.titleKn : alt.titleEn}
                  </span>
                  {alt.suggestedPace && (
                    <span className="font-mono text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded bg-forest/10 text-forest border border-forest/20">
                      {alt.suggestedPace}
                    </span>
                  )}
                </div>

                <p className="text-charcoal-muted leading-relaxed">
                  {isKn ? alt.descriptionKn : alt.descriptionEn}
                </p>

                <p className="text-[11px] text-forest font-medium italic">
                  💡 {isKn ? alt.benefitKn : alt.benefitEn}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── DISCLOSURE FOOTNOTE ── */}
      <div className="pt-2 text-[11px] text-charcoal-muted/80 leading-relaxed font-mono border-t border-border/60">
        <p>
          {isKn
            ? "ℹ️ ಸೂಚನೆ: ರಸ್ತೆ ದೂರ ಮತ್ತು ಸಮಯದ ಅಂದಾಜುಗಳು ಕರ್ನಾಟಕದ ನೈಜ ಭೂಪ್ರದೇಶ ಗುಣಕಗಳನ್ನು ಆಧರಿಸಿವೆ (ಪಶ್ಚಿಮ ಘಟ್ಟಗಳು 1.48x, ಕರಾವಳಿ 1.28x, ಮೈದಾನ 1.22x). ಬಾಹ್ಯ ಗೂಗಲ್ ಮ್ಯಾಪ್ಸ್ ಲಿಂಕ್‌ಗಳು ಉಚಿತ ವೆಬ್ URL ಗಳಾಗಿದ್ದು ಯಾವುದೇ ಪಾವತಿಸಿದ API ಅಥವಾ ಬಿಲ್ಲಿಂಗ್ ಅನ್ನು ಒಳಗೊಂಡಿಲ್ಲ."
            : "ℹ️ Note: Transit estimates use calibrated Karnataka terrain detour multipliers (Western Ghats 1.48x, Coastal NH 66 1.28x, Deccan Plains 1.22x). Google Maps links use standard external search/direction URLs requiring zero paid APIs or billing."}
        </p>
      </div>
    </div>
  );
}
