"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Check,
  AlertTriangle,
  ShieldCheck,
  Clock,
  Wallet,
  Sparkles,
  RefreshCw,
  FileText,
  Bookmark,
  Users,
} from "lucide-react";
import type {
  AdaptiveReplanningProposal,
} from "@/lib/adaptive";
import { checkProposalStaleness } from "@/lib/adaptive/dashboard-adapters";
import type { ItineraryDay } from "@/lib/itinerary-engine";
import { useLanguage } from "@/lib/i18n";

interface ReplanningReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  proposal: AdaptiveReplanningProposal | null;
  currentDays: ItineraryDay[];
  onApplyPlan: (proposal: AdaptiveReplanningProposal, selectedRecIds: string[]) => void;
  onRefreshProposal: () => void;
}

export function ReplanningReviewModal({
  isOpen,
  onClose,
  proposal,
  currentDays,
  onApplyPlan,
  onRefreshProposal,
}: ReplanningReviewModalProps) {
  const { isKn } = useLanguage();
  const [prevProposalId, setPrevProposalId] = useState<string | null>(proposal?.id || null);
  const [selectedRecIds, setSelectedRecIds] = useState<string[]>(
    () => proposal?.appliedRecommendationIds || []
  );

  // Synchronize during render when proposal changes (React recommended pattern)
  if (proposal && proposal.id !== prevProposalId) {
    setPrevProposalId(proposal.id);
    setSelectedRecIds(proposal.appliedRecommendationIds);
  }

  // Handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !proposal) return null;

  const staleness = checkProposalStaleness(proposal, currentDays);

  const toggleRec = (recId: string) => {
    setSelectedRecIds((prev) =>
      prev.includes(recId) ? prev.filter((id) => id !== recId) : [...prev, recId]
    );
  };

  const handleApply = () => {
    if (staleness.isStale) return;
    onApplyPlan(proposal, selectedRecIds);
    onClose();
  };

  const { routeImpact, budgetImpact, preservedData } = proposal;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-charcoal/60 backdrop-blur-xs animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="replanning-modal-title"
    >
      <div className="bg-white rounded-3xl shadow-2xl border border-border w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* ── Modal Header ── */}
        <div className="p-5 sm:p-6 border-b border-border/80 flex items-start justify-between gap-4 bg-sand-light/30">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-forest bg-forest/10 px-2 py-0.5 rounded-md">
                {isKn ? "ಹೊಂದಾಣಿಕೆಯ ಯೋಜನೆ" : "Adaptive Replanning"}
              </span>
              <span className="text-xs text-charcoal-muted">
                {proposal.appliedRecommendationIds.length}{" "}
                {isKn ? "ಬದಲಾವಣೆಗಳು ಪ್ರಸ್ತಾವಿತ" : "proposed changes"}
              </span>
            </div>
            <h3
              id="replanning-modal-title"
              className="text-lg sm:text-2xl font-bold font-[family-name:var(--font-playfair)] text-forest-dark mt-1"
            >
              {isKn
                ? "ಸಂವಾದಾತ್ಮಕ ಮರು-ಯೋಜನಾ ಪ್ರಸ್ತಾವನೆ ಪರಿಶೀಲನೆ"
                : "Interactive Replanning Proposal Review"}
            </h3>
            <p className="text-xs text-charcoal-muted mt-1">
              {isKn
                ? "ಮೂಲ ಮತ್ತು ಪ್ರಸ್ತಾವಿತ ವೇಳಾಪಟ್ಟಿಯನ್ನು ಹೋಲಿಸಿ. ನಿಮ್ಮ ಟಿಪ್ಪಣಿಗಳು, ಪೂರ್ಣಗೊಳಿಸಿದ ಗುರುತುಗಳು ಮತ್ತು ಗುಂಪು ನಿರ್ಧಾರಗಳು 100% ಸುರಕ್ಷಿತವಾಗಿರುತ್ತವೆ."
                : "Compare changes side-by-side. Your notes, completed marks, and group decisions are strictly preserved."}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-sand text-charcoal-muted hover:text-charcoal transition-colors cursor-pointer"
            aria-label={isKn ? "ಮುಚ್ಚಿರಿ" : "Close"}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ── Scrollable Modal Body ── */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* Stale Proposal Alert */}
          {staleness.isStale && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-in">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="text-xs sm:text-sm">
                  <span className="font-bold block">
                    {isKn ? "ಪ್ರಸ್ತಾವನೆ ಅಪ್‌ಡೇಟ್ ಅಗತ್ಯವಿದೆ" : "Proposal Needs Refresh"}
                  </span>
                  <span className="text-amber-900">
                    {isKn ? staleness.messageKn : staleness.messageEn}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={onRefreshProposal}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-amber-600 text-white hover:bg-amber-700 transition-colors shrink-0 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>{isKn ? "ನವೀಕರಿಸಿ" : "Refresh Proposal"}</span>
              </button>
            </div>
          )}

          {/* ── Impact Metrics Row ── */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-2xl bg-sand-light/50 border border-border/80">
              <div className="flex items-center gap-2 text-xs font-semibold text-charcoal-muted">
                <Clock className="w-4 h-4 text-forest" />
                <span>{isKn ? "ಪ್ರಯಾಣದ ಸಮಯದ ವ್ಯತ್ಯಾಸ" : "Transit Time Impact"}</span>
              </div>
              <div className="mt-1 flex items-baseline gap-1.5">
                <span
                  className={`text-xl font-extrabold ${
                    routeImpact.transitMinutesDiff < 0
                      ? "text-emerald-700"
                      : "text-charcoal"
                  }`}
                >
                  {routeImpact.transitMinutesDiff > 0 ? "+" : ""}
                  {routeImpact.transitMinutesDiff} {isKn ? "ನಿಮಿಷಗಳು" : "mins"}
                </span>
                <span className="text-xs text-charcoal-muted">
                  ({routeImpact.originalTransitMinutes}m → {routeImpact.proposedTransitMinutes}m)
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-sand-light/50 border border-border/80">
              <div className="flex items-center gap-2 text-xs font-semibold text-charcoal-muted">
                <Wallet className="w-4 h-4 text-forest" />
                <span>{isKn ? "ಬಜೆಟ್ ವೆಚ್ಚ ವ್ಯತ್ಯಾಸ" : "Budget Cost Impact"}</span>
              </div>
              <div className="mt-1 flex items-baseline gap-1.5">
                <span
                  className={`text-xl font-extrabold ${
                    budgetImpact.costDiffInr < 0
                      ? "text-emerald-700"
                      : budgetImpact.costDiffInr > 0
                      ? "text-amber-700"
                      : "text-charcoal"
                  }`}
                >
                  {budgetImpact.costDiffInr > 0 ? "+₹" : budgetImpact.costDiffInr < 0 ? "-₹" : "₹0"}
                  {Math.abs(budgetImpact.costDiffInr).toLocaleString("en-IN")}
                </span>
                <span className="text-xs text-charcoal-muted">
                  ({budgetImpact.proposedTotalCostInr > 0 ? `₹${budgetImpact.proposedTotalCostInr.toLocaleString("en-IN")}` : "0"})
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-sand-light/50 border border-border/80">
              <div className="flex items-center gap-2 text-xs font-semibold text-charcoal-muted">
                <Sparkles className="w-4 h-4 text-forest" />
                <span>{isKn ? "ಬದಲಾದ ಶಿಫಾರಸುಗಳು" : "Applied Changes"}</span>
              </div>
              <div className="mt-1 flex items-baseline gap-1.5">
                <span className="text-xl font-extrabold text-charcoal">
                  {proposal.appliedRecommendationIds.length}
                </span>
                <span className="text-xs text-charcoal-muted">
                  ({isKn ? "ಸಕ್ರಿಯ ಶಿಫಾರಸುಗಳು" : "active recommendations"})
                </span>
              </div>
            </div>
          </div>

          {/* ── Granular Recommendation Selection ── */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-charcoal">
              {isKn
                ? "ಶಿಫಾರಸುಗಳನ್ನು ಆಯ್ಕೆಮಾಡಿ (ಪ್ರತಿಯೊಂದನ್ನು ಪ್ರತ್ಯೇಕವಾಗಿ ಆರಿಸಬಹುದು):"
                : "Select Recommendations to Apply:"}
            </h4>
            <div className="space-y-2">
              {proposal.recommendations.map((rec) => {
                const isSelected = selectedRecIds.includes(rec.id);
                return (
                  <label
                    key={rec.id}
                    className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? "bg-forest/5 border-forest/40"
                        : "bg-white border-border/60 hover:bg-sand-light/40"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleRec(rec.id)}
                      className="mt-1 rounded text-forest focus:ring-forest cursor-pointer"
                    />
                    <div className="flex-1 text-xs">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-charcoal">
                          {isKn
                            ? `ದಿನ ${rec.targetDayNumber}: ${rec.titleKn}`
                            : `Day ${rec.targetDayNumber}: ${rec.titleEn}`}
                        </span>
                        <span className="text-[11px] font-semibold text-forest">
                          {rec.reason.timeImpactMinutes !== 0 && (
                            <span className="mr-2">
                              {rec.reason.timeImpactMinutes > 0 ? "+" : ""}
                              {rec.reason.timeImpactMinutes}m
                            </span>
                          )}
                          {rec.reason.costImpactInr !== 0 && (
                            <span>
                              {rec.reason.costImpactInr > 0 ? "+₹" : "-₹"}
                              {Math.abs(rec.reason.costImpactInr)}
                            </span>
                          )}
                        </span>
                      </div>
                      <p className="text-charcoal-muted mt-0.5">
                        {isKn ? rec.reason.whyChangedKn : rec.reason.whyChangedEn}
                      </p>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* ── Side-by-Side Day Diff Comparison ── */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-charcoal">
              {isKn ? "ವೇಳಾಪಟ್ಟಿ ಹೋಲಿಕೆ (ಮೂಲ vs ಪ್ರಸ್ತಾವಿತ):" : "Itinerary Schedule Comparison:"}
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Original Plan Column */}
              <div className="space-y-3">
                <div className="p-2.5 rounded-xl bg-sand-light/70 border border-border text-xs font-bold text-charcoal text-center">
                  {isKn ? "ಮೂಲ ವೇಳಾಪಟ್ಟಿ (Original)" : "Original Itinerary"}
                </div>
                <div className="space-y-3">
                  {proposal.originalDays.map((day) => (
                    <div
                      key={day.dayNumber}
                      className="p-3 rounded-xl border border-border/70 bg-white space-y-2 text-xs"
                    >
                      <span className="font-bold text-forest-dark block pb-1 border-b border-border/40">
                        {isKn ? `ದಿನ ${day.dayNumber}: ${day.title}` : `Day ${day.dayNumber}: ${day.title}`}
                      </span>
                      {day.stops.map((stop, sIdx) => (
                        <div
                          key={sIdx}
                          className="flex items-center justify-between py-1 border-b last:border-b-0 border-border/20 text-[11px]"
                        >
                          <span className="font-medium text-charcoal">
                            <span className="capitalize text-charcoal-muted mr-1.5">
                              [{stop.timeOfDay}]
                            </span>
                            {stop.title}
                          </span>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>

              {/* Proposed Plan Column */}
              <div className="space-y-3">
                <div className="p-2.5 rounded-xl bg-emerald-100/70 border border-emerald-300 text-xs font-bold text-emerald-900 text-center">
                  {isKn ? "ಪ್ರಸ್ತಾವಿತ ಹೊಂದಾಣಿಕೆಯ ವೇಳಾಪಟ್ಟಿ (Proposed)" : "Proposed Adaptive Itinerary"}
                </div>
                <div className="space-y-3">
                  {proposal.proposedDays.map((day) => (
                    <div
                      key={day.dayNumber}
                      className="p-3 rounded-xl border border-emerald-200 bg-emerald-50/30 space-y-2 text-xs"
                    >
                      <span className="font-bold text-emerald-900 block pb-1 border-b border-emerald-200/50">
                        {isKn ? `ದಿನ ${day.dayNumber}: ${day.title}` : `Day ${day.dayNumber}: ${day.title}`}
                      </span>
                      {day.stops.map((stop, sIdx) => (
                        <div
                          key={sIdx}
                          className="flex items-center justify-between py-1 border-b last:border-b-0 border-emerald-200/30 text-[11px]"
                        >
                          <span className="font-medium text-emerald-950">
                            <span className="capitalize text-emerald-800 mr-1.5">
                              [{stop.timeOfDay}]
                            </span>
                            {stop.title}
                          </span>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ── Preserved User Artifacts Audit (Zero Overwrites) ── */}
          <div className="p-4 rounded-2xl bg-sand-light/40 border border-border/80 space-y-2">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-forest" />
              <h5 className="text-xs font-bold text-forest-dark">
                {isKn
                  ? "ರಕ್ಷಿತ ಬಳಕೆದಾರ ಡೇಟಾ (ಶೂನ್ಯ ತಿದ್ದಿಬರೆಯುವಿಕೆ ಖಾತರಿ):"
                  : "Preserved User Data (Zero-Overwrite Guarantee):"}
              </h5>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-[11px] text-charcoal">
              <div className="p-2 rounded-lg bg-white border border-border/60 text-center">
                <FileText className="w-3.5 h-3.5 mx-auto text-charcoal-muted mb-0.5" />
                <span className="font-bold block">{preservedData.dayNotesCount}</span>
                <span className="text-charcoal-muted text-[10px]">
                  {isKn ? "ದಿನದ ಟಿಪ್ಪಣಿಗಳು" : "Day Notes"}
                </span>
              </div>

              <div className="p-2 rounded-lg bg-white border border-border/60 text-center">
                <FileText className="w-3.5 h-3.5 mx-auto text-charcoal-muted mb-0.5" />
                <span className="font-bold block">{preservedData.stopNotesCount}</span>
                <span className="text-charcoal-muted text-[10px]">
                  {isKn ? "ಚಟುವಟಿಕೆ ಟಿಪ್ಪಣಿಗಳು" : "Stop Notes"}
                </span>
              </div>

              <div className="p-2 rounded-lg bg-white border border-border/60 text-center">
                <Check className="w-3.5 h-3.5 mx-auto text-emerald-600 mb-0.5" />
                <span className="font-bold block">{preservedData.completedStopsCount}</span>
                <span className="text-charcoal-muted text-[10px]">
                  {isKn ? "ಪೂರ್ಣಗೊಂಡ ಸ್ಥಳಗಳು" : "Completed Stops"}
                </span>
              </div>

              <div className="p-2 rounded-lg bg-white border border-border/60 text-center">
                <Bookmark className="w-3.5 h-3.5 mx-auto text-amber-600 mb-0.5" />
                <span className="font-bold block">{preservedData.savedGemsCount}</span>
                <span className="text-charcoal-muted text-[10px]">
                  {isKn ? "ಉಳಿಸಿದ ರತ್ನಗಳು" : "Saved Gems"}
                </span>
              </div>

              <div className="p-2 rounded-lg bg-white border border-border/60 text-center">
                <Users className="w-3.5 h-3.5 mx-auto text-indigo-600 mb-0.5" />
                <span className="font-bold block">{preservedData.groupDecisionsCount}</span>
                <span className="text-charcoal-muted text-[10px]">
                  {isKn ? "ಗುಂಪು ನಿರ್ಧಾರಗಳು" : "Decisions"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Modal Footer ── */}
        <div className="p-4 sm:p-5 border-t border-border/80 bg-sand-light/30 flex items-center justify-between gap-3 flex-wrap">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl border border-border hover:bg-sand text-charcoal transition-colors cursor-pointer"
          >
            {isKn ? "ರದ್ದುಮಾಡಿ (ಮೂಲ ಯೋಜನೆಯನ್ನೇ ಇರಿಸಿ)" : "Keep Original Plan"}
          </button>

          <button
            type="button"
            disabled={staleness.isStale || selectedRecIds.length === 0}
            onClick={handleApply}
            className="inline-flex items-center gap-2 px-5 py-2 text-xs sm:text-sm font-bold rounded-xl bg-forest hover:bg-forest-dark text-white shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>
              {isKn
                ? `ಪ್ರಸ್ತಾವಿತ ಯೋಜನೆಯನ್ನು ಅಳವಡಿಸಿ (${selectedRecIds.length} ಆಯ್ಕೆ)`
                : `Apply Proposed Plan (${selectedRecIds.length} selected)`}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
