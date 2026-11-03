"use client";

import React from "react";
import {
  ShieldCheck,
  AlertTriangle,
  AlertOctagon,
  Calendar,
  Filter,
} from "lucide-react";
import type { TripHealthSummary as TripHealthSummaryType, DetectedTripIssue } from "@/lib/adaptive";
import { useLanguage } from "@/lib/i18n";

interface TripHealthSummaryProps {
  health: TripHealthSummaryType;
  issues: DetectedTripIssue[];
  activeFilter: "all" | "critical" | "warning" | "info";
  onFilterChange: (filter: "all" | "critical" | "warning" | "info") => void;
  onSelectDay?: (dayNumber: number) => void;
  selectedDayNumber?: number | null;
}

export function TripHealthSummary({
  health,
  issues,
  activeFilter,
  onFilterChange,
  onSelectDay,
  selectedDayNumber,
}: TripHealthSummaryProps) {
  const { isKn } = useLanguage();

  const getStatusConfig = () => {
    switch (health.status) {
      case "critical_action_required":
        return {
          bg: "bg-rose-50 border-rose-300",
          text: "text-rose-900",
          badgeBg: "bg-rose-600 text-white",
          icon: <AlertOctagon className="w-7 h-7 text-rose-600 shrink-0" />,
          title: isKn ? health.labelKn : health.labelEn,
          desc: isKn ? health.descriptionKn : health.descriptionEn,
        };
      case "attention_needed":
        return {
          bg: "bg-amber-50 border-amber-300",
          text: "text-amber-900",
          badgeBg: "bg-amber-600 text-white",
          icon: <AlertTriangle className="w-7 h-7 text-amber-600 shrink-0" />,
          title: isKn ? health.labelKn : health.labelEn,
          desc: isKn ? health.descriptionKn : health.descriptionEn,
        };
      case "optimal":
      default:
        return {
          bg: "bg-emerald-50 border-emerald-300",
          text: "text-emerald-900",
          badgeBg: "bg-emerald-600 text-white",
          icon: <ShieldCheck className="w-7 h-7 text-emerald-600 shrink-0" />,
          title: isKn ? health.labelKn : health.labelEn,
          desc: isKn ? health.descriptionKn : health.descriptionEn,
        };
    }
  };

  const statusConfig = getStatusConfig();

  return (
    <div className="space-y-4">
      {/* ── Status Banner ── */}
      <div
        className={`p-5 rounded-2xl border ${statusConfig.bg} shadow-sm transition-all`}
        role="region"
        aria-label={isKn ? "ಪ್ರವಾಸ ಆರೋಗ್ಯ ಸ್ಥಿತಿ" : "Trip Health Status"}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="mt-0.5">{statusConfig.icon}</div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h3 className={`text-lg font-bold ${statusConfig.text}`}>
                  {statusConfig.title}
                </h3>
                <span
                  className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${statusConfig.badgeBg}`}
                >
                  {health.totalIssues}{" "}
                  {isKn ? "ಸಮಸ್ಯೆಗಳು / ಸಲಹೆಗಳು" : "Issues / Advisories"}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-charcoal-muted mt-1 max-w-2xl">
                {statusConfig.desc}
              </p>
            </div>
          </div>

          {/* Affected Days Quick Jump */}
          {health.affectedDayNumbers.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap pt-2 md:pt-0 border-t md:border-t-0 border-border/40">
              <span className="text-xs font-semibold text-charcoal-muted flex items-center gap-1 mr-1">
                <Calendar className="w-3.5 h-3.5" />
                {isKn ? "ಬಾಧಿತ ದಿನಗಳು:" : "Affected:"}
              </span>
              {health.affectedDayNumbers.map((dayNum) => {
                const isSelected = selectedDayNumber === dayNum;
                return (
                  <button
                    key={dayNum}
                    type="button"
                    onClick={() => onSelectDay?.(dayNum)}
                    className={`px-2 py-0.5 text-xs font-medium rounded-md transition-colors ${
                      isSelected
                        ? "bg-forest text-white shadow-xs font-bold"
                        : "bg-white/80 hover:bg-forest/10 text-charcoal border border-border/60"
                    }`}
                  >
                    {isKn ? `ದಿನ ${dayNum}` : `Day ${dayNum}`}
                  </button>
                );
              })}
              {selectedDayNumber && (
                <button
                  type="button"
                  onClick={() => onSelectDay?.(0)}
                  className="px-2 py-0.5 text-[11px] text-charcoal-muted hover:text-forest underline transition-colors"
                >
                  {isKn ? "ಎಲ್ಲಾ ದಿನಗಳು" : "Clear filter"}
                </button>
              )}
            </div>
          )}
        </div>

        {/* ── Metric Badges & Filter Tabs ── */}
        <div className="mt-4 pt-4 border-t border-border/40 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-charcoal-muted" />
            <span className="text-xs font-semibold text-charcoal-muted uppercase tracking-wider">
              {isKn ? "ಫಿಲ್ಟರ್:" : "Filter:"}
            </span>
          </div>

          <div className="inline-flex rounded-xl border border-border/60 p-0.5 bg-white/60">
            <button
              type="button"
              onClick={() => onFilterChange("all")}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                activeFilter === "all"
                  ? "bg-forest text-white shadow-xs"
                  : "text-charcoal hover:text-forest"
              }`}
            >
              {isKn ? "ಎಲ್ಲಾ" : "All"} ({issues.length})
            </button>

            <button
              type="button"
              onClick={() => onFilterChange("critical")}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                activeFilter === "critical"
                  ? "bg-rose-600 text-white shadow-xs"
                  : "text-rose-700 hover:bg-rose-50"
              }`}
            >
              {isKn ? "ತುರ್ತು" : "Critical"} ({health.criticalCount})
            </button>

            <button
              type="button"
              onClick={() => onFilterChange("warning")}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                activeFilter === "warning"
                  ? "bg-amber-600 text-white shadow-xs"
                  : "text-amber-700 hover:bg-amber-50"
              }`}
            >
              {isKn ? "ಎಚ್ಚರಿಕೆ" : "Warnings"} ({health.warningCount})
            </button>

            <button
              type="button"
              onClick={() => onFilterChange("info")}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                activeFilter === "info"
                  ? "bg-sky-600 text-white shadow-xs"
                  : "text-sky-700 hover:bg-sky-50"
              }`}
            >
              {isKn ? "ಸಲಹೆಗಳು" : "Tips"} ({health.infoCount})
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
