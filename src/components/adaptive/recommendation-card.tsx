"use client";

import React from "react";
import {
  Check,
  X,
  Clock,
  ArrowRight,
  TrendingDown,
  TrendingUp,
  Shield,
  Eye,
} from "lucide-react";
import type { AdaptiveRecommendation } from "@/lib/adaptive";
import { useLanguage } from "@/lib/i18n";

interface RecommendationCardProps {
  recommendation: AdaptiveRecommendation;
  isAccepted: boolean;
  isRejected: boolean;
  onAccept: (recId: string) => void;
  onReject: (recId: string) => void;
  onReviewInModal?: () => void;
}

export function RecommendationCard({
  recommendation,
  isAccepted,
  isRejected,
  onAccept,
  onReject,
  onReviewInModal,
}: RecommendationCardProps) {
  const { isKn } = useLanguage();
  const { reason } = recommendation;

  const getActionBadge = () => {
    switch (recommendation.actionType) {
      case "reorder_stops":
        return {
          label: isKn ? "ಸ್ಥಳಗಳ ಮರುಕ್ರಮ" : "Reorder Stops",
          color: "bg-indigo-100 text-indigo-800 border-indigo-200",
        };
      case "replace_activity":
        return {
          label: isKn ? "ಚಟುವಟಿಕೆ ಬದಲಾವಣೆ" : "Replace Activity",
          color: "bg-emerald-100 text-emerald-800 border-emerald-200",
        };
      case "adjust_travel_pace":
        return {
          label: isKn ? "ವೇಗ ಹೊಂದಾಣಿಕೆ" : "Pace Adjustment",
          color: "bg-sky-100 text-sky-800 border-sky-200",
        };
      case "insert_rest_period":
        return {
          label: isKn ? "ವಿರಾಮ ಸೇರ್ಪಡೆ" : "Rest Period",
          color: "bg-purple-100 text-purple-800 border-purple-200",
        };
      case "select_accessible_alternative":
        return {
          label: isKn ? "ಸುಲಭ ಪ್ರವೇಶ ಪರ್ಯಾಯ" : "Accessible Alternative",
          color: "bg-amber-100 text-amber-800 border-amber-200",
        };
      case "select_budget_alternative":
      case "switch_budget_scenario":
      default:
        return {
          label: isKn ? "ಬಜೆಟ್ ಪರ್ಯಾಯ" : "Budget Alternative",
          color: "bg-teal-100 text-teal-800 border-teal-200",
        };
    }
  };

  const actionBadge = getActionBadge();

  return (
    <div
      className={`rounded-2xl border transition-all p-4 sm:p-5 flex flex-col justify-between ${
        isAccepted
          ? "border-emerald-400 bg-emerald-50/40 shadow-xs ring-1 ring-emerald-300"
          : isRejected
          ? "border-charcoal-muted/30 bg-sand-light/30 opacity-70"
          : "border-border bg-white shadow-subtle hover:border-forest/50"
      }`}
    >
      <div className="space-y-3.5">
        {/* ── Top Bar: Day Indicator, Action Badge & Status ── */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-forest bg-forest/10 px-2 py-0.5 rounded-md">
              {isKn
                ? `ದಿನ ${recommendation.targetDayNumber}`
                : `Day ${recommendation.targetDayNumber}`}
            </span>
            <span
              className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border ${actionBadge.color}`}
            >
              {actionBadge.label}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {isAccepted && (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-600 text-white">
                <Check className="w-3 h-3" />
                {isKn ? "ಸ್ವೀಕರಿಸಲಾಗಿದೆ" : "Accepted"}
              </span>
            )}
            {isRejected && (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-charcoal-muted text-white">
                <X className="w-3 h-3" />
                {isKn ? "ತಿರಸ್ಕರಿಸಲಾಗಿದೆ" : "Dismissed"}
              </span>
            )}
            <span className="text-[10px] text-charcoal-muted font-medium">
              {recommendation.score} / 100 {isKn ? "ಅಂಕ" : "score"}
            </span>
          </div>
        </div>

        {/* ── Title & Explanation ── */}
        <div>
          <h4 className="text-sm sm:text-base font-bold text-charcoal">
            {isKn ? recommendation.titleKn : recommendation.titleEn}
          </h4>
          <p className="text-xs text-charcoal-muted mt-1 leading-relaxed">
            <span className="font-semibold text-charcoal">
              {isKn ? "ಏಕೆ ಬದಲಾಯಿಸಬೇಕು: " : "Why: "}
            </span>
            {isKn ? reason.whyChangedKn : reason.whyChangedEn}
          </p>
        </div>

        {/* ── What Changes Diff ── */}
        <div className="p-2.5 rounded-xl bg-sand-light/60 border border-border/60 text-xs space-y-1.5">
          <div className="flex items-start gap-2">
            <ArrowRight className="w-3.5 h-3.5 text-forest shrink-0 mt-0.5" />
            <span className="text-charcoal leading-snug">
              <span className="font-semibold text-forest-dark">
                {isKn ? "ಪ್ರಸ್ತಾವಿತ ಬದಲಾವಣೆ: " : "Proposed Change: "}
              </span>
              {isKn ? reason.whatChangedKn : reason.whatChangedEn}
            </span>
          </div>
        </div>

        {/* ── Impact Metrics & Constraints Satisfied ── */}
        <div className="flex items-center justify-between gap-3 flex-wrap text-xs pt-1">
          <div className="flex items-center gap-3">
            {/* Transit Time Impact */}
            <div className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-charcoal-muted" />
              <span
                className={`font-semibold ${
                  reason.timeImpactMinutes < 0
                    ? "text-emerald-700"
                    : reason.timeImpactMinutes > 0
                    ? "text-amber-700"
                    : "text-charcoal"
                }`}
              >
                {reason.timeImpactMinutes > 0 ? "+" : ""}
                {reason.timeImpactMinutes} {isKn ? "ನಿಮಿಷ" : "min"}
              </span>
            </div>

            {/* Budget Impact */}
            <div className="flex items-center gap-1">
              {reason.costImpactInr < 0 ? (
                <TrendingDown className="w-3.5 h-3.5 text-emerald-600" />
              ) : reason.costImpactInr > 0 ? (
                <TrendingUp className="w-3.5 h-3.5 text-amber-600" />
              ) : null}
              <span
                className={`font-semibold ${
                  reason.costImpactInr < 0
                    ? "text-emerald-700"
                    : reason.costImpactInr > 0
                    ? "text-amber-700"
                    : "text-charcoal"
                }`}
              >
                {reason.costImpactInr > 0 ? "+₹" : reason.costImpactInr < 0 ? "-₹" : "₹0"}
                {Math.abs(reason.costImpactInr).toLocaleString("en-IN")}
              </span>
            </div>
          </div>

          {/* Constraints tags */}
          {reason.constraintsSatisfied.length > 0 && (
            <div className="flex items-center gap-1 flex-wrap">
              <Shield className="w-3 h-3 text-forest-dark shrink-0" />
              {reason.constraintsSatisfied.slice(0, 2).map((c, i) => (
                <span
                  key={i}
                  className="text-[10px] px-1.5 py-0.2 rounded bg-forest/5 text-forest-dark border border-forest/15"
                >
                  {c.replace(/_/g, " ")}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Actions Footer ── */}
      <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between gap-2">
        {onReviewInModal && (
          <button
            type="button"
            onClick={onReviewInModal}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-forest hover:text-forest-dark transition-colors cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>{isKn ? "ಹೋಲಿಸಿ ನೋಡಿ" : "Review Proposal"}</span>
          </button>
        )}

        <div className="flex items-center gap-2 ml-auto">
          {!isRejected && (
            <button
              type="button"
              onClick={() => onReject(recommendation.id)}
              className="px-2.5 py-1 text-xs font-medium text-charcoal-muted hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
            >
              {isKn ? "ತಿರಸ್ಕರಿಸಿ" : "Dismiss"}
            </button>
          )}

          {!isAccepted && (
            <button
              type="button"
              onClick={() => onAccept(recommendation.id)}
              className="inline-flex items-center gap-1 px-3 py-1 text-xs font-bold rounded-lg bg-forest text-white hover:bg-forest-dark shadow-xs transition-colors cursor-pointer"
            >
              <Check className="w-3 h-3" />
              <span>{isKn ? "ಸ್ವೀಕರಿಸಿ" : "Accept"}</span>
            </button>
          )}

          {(isAccepted || isRejected) && (
            <button
              type="button"
              onClick={() => {
                if (isAccepted) onReject(recommendation.id);
                else onAccept(recommendation.id);
              }}
              className="text-[11px] text-charcoal-muted hover:text-charcoal underline cursor-pointer"
            >
              {isKn ? "ಮರುಹೊಂದಿಸಿ" : "Reset"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
