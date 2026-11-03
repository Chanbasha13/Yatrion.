"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Activity,
  Sparkles,
  CheckCircle2,
  Eye,
} from "lucide-react";
import type { GeneratedItinerary, ItineraryDay } from "@/lib/itinerary-engine";
import type { TripPreferences } from "@/lib/planner-types";
import type { OptimizedRoutePlan } from "@/lib/routes/route-types";
import type { OptimizedBudgetPlan } from "@/lib/budget/budget-types";
import type { GroupTripState } from "@/lib/group/group-types";
import {
  detectTripIssues,
  generateAdaptiveRecommendations,
  generateReplanningProposal,
  computeTripHealth,
  buildUnifiedTripContext,
  type AdaptiveTripContext,
  type DetectedTripIssue,
  type AdaptiveRecommendation,
  type AdaptiveReplanningProposal,
} from "@/lib/adaptive";
import {
  OpenMeteoWeatherProvider,
  KarnatakaDisruptionProvider,
  type ProviderResult,
  type DestinationWeatherData,
  type DestinationDisruptionData,
} from "@/lib/adaptive/providers";
import { resolveDestinationCoordinates } from "@/lib/routes/route-estimates";
import { useLanguage } from "@/lib/i18n";
import { useAssistant } from "@/lib/assistant/assistant-context";
import { TripHealthSummary } from "./trip-health-summary";
import { TripConditionOverview } from "./trip-condition-overview";
import { RecommendationCard } from "./recommendation-card";
import { ReplanningReviewModal } from "./replanning-review-modal";

interface AdaptiveDashboardProps {
  itinerary: GeneratedItinerary;
  editedDays: ItineraryDay[];
  preferences?: TripPreferences;
  routePlan?: OptimizedRoutePlan;
  budgetPlan?: OptimizedBudgetPlan;
  groupState?: GroupTripState | null;
  savedGemIds?: string[];
  dayNotes?: Record<number, string>;
  stopNotes?: Record<string, string>;
  completedStopKeys?: string[];
  acceptedRecommendationIds?: string[];
  rejectedRecommendationIds?: string[];
  onAcceptRecommendation?: (recId: string) => void;
  onRejectRecommendation?: (recId: string) => void;
  onApplyProposal?: (
    proposal: AdaptiveReplanningProposal,
    selectedRecIds: string[]
  ) => void;
  onJumpToDay?: (dayNumber: number) => void;
}

export function AdaptiveDashboard({
  itinerary,
  editedDays,
  preferences,
  routePlan,
  budgetPlan,
  groupState = null,
  savedGemIds = [],
  dayNotes = {},
  stopNotes = {},
  completedStopKeys = [],
  acceptedRecommendationIds: initialAcceptedIds = [],
  rejectedRecommendationIds: initialRejectedIds = [],
  onAcceptRecommendation,
  onRejectRecommendation,
  onApplyProposal,
  onJumpToDay,
}: AdaptiveDashboardProps) {
  const { isKn } = useLanguage();
  const { setUnifiedContext } = useAssistant();

  // ── 1. Telemetry State ──
  const [weatherResults, setWeatherResults] = useState<
    Record<string, ProviderResult<DestinationWeatherData>>
  >({});
  const [disruptionResults, setDisruptionResults] = useState<
    ProviderResult<DestinationDisruptionData>[]
  >([]);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // ── 2. Filters & Modal State ──
  const [activeSeverityFilter, setActiveSeverityFilter] = useState<
    "all" | "critical" | "warning" | "info"
  >("all");
  const [selectedDayNumber, setSelectedDayNumber] = useState<number | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // ── 3. Local Accepted/Rejected IDs if not managed exclusively by parent ──
  const [localAcceptedIds, setLocalAcceptedIds] =
    useState<string[]>(initialAcceptedIds);
  const [localRejectedIds, setLocalRejectedIds] =
    useState<string[]>(initialRejectedIds);

  const acceptedIds = initialAcceptedIds.length > 0 ? initialAcceptedIds : localAcceptedIds;
  const rejectedIds = initialRejectedIds.length > 0 ? initialRejectedIds : localRejectedIds;

  // ── 4. Telemetry Fetcher ──
  const fetchTelemetry = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const weatherProvider = new OpenMeteoWeatherProvider();
      const disruptionProvider = new KarnatakaDisruptionProvider();

      const destinationIds = itinerary.includedDestinations.map((d) => d.id);
      const results: Record<string, ProviderResult<DestinationWeatherData>> = {};

      for (const destId of destinationIds) {
        try {
          const coords = resolveDestinationCoordinates(destId);
          const res = await weatherProvider.fetchConditions(destId, coords);
          results[destId] = res;
        } catch {
          // Keep resilient fallback
        }
      }

      setWeatherResults(results);

      try {
        const disRes = await disruptionProvider.fetchConditions("karnataka-all", {
          latitude: 15.3173,
          longitude: 75.7139,
        });
        setDisruptionResults([disRes]);
      } catch {
        // Safe fallback
      }
    } finally {
      setIsRefreshing(false);
    }
  }, [itinerary.includedDestinations]);

  // Initial Telemetry Fetch
  useEffect(() => {
    const timer = setTimeout(() => {
      void fetchTelemetry();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchTelemetry]);

  // ── 5. Build Deterministic Context ──
  const adaptiveContext: AdaptiveTripContext = useMemo(() => {
    const validPreferences: TripPreferences = preferences || {
      startingLocation: itinerary.startingLocation,
      durationDays: itinerary.durationDays,
      destinationMode: "explore",
      selectedDestinationIds: itinerary.includedDestinations.map((d) => d.id),
      interests: [],
      travelStyle: "balanced",
      budget: "7k-15k",
      groupType: "solo",
      travellerCount: 1,
      transport: "self-drive",
    };

    return {
      preferences: validPreferences,
      itinerary,
      days: editedDays,
      routePlan,
      budgetPlan,
      groupState: groupState || undefined,
      savedGemIds,
      dayNotes,
      stopNotes,
      completedStopKeys,
      weatherResults: Object.values(weatherResults),
      disruptionResults,
      hasLiveProviderConnected: Object.keys(weatherResults).length > 0,
    };
  }, [
    preferences,
    itinerary,
    editedDays,
    routePlan,
    budgetPlan,
    groupState,
    savedGemIds,
    dayNotes,
    stopNotes,
    completedStopKeys,
    weatherResults,
    disruptionResults,
  ]);

  // ── 6. Deterministic Intelligence Pipelines ──
  const detectedIssues: DetectedTripIssue[] = useMemo(() => {
    return detectTripIssues(adaptiveContext);
  }, [adaptiveContext]);

  const allRecommendations: AdaptiveRecommendation[] = useMemo(() => {
    return generateAdaptiveRecommendations(detectedIssues, adaptiveContext);
  }, [detectedIssues, adaptiveContext]);

  const replanningProposal: AdaptiveReplanningProposal = useMemo(() => {
    return generateReplanningProposal(adaptiveContext);
  }, [adaptiveContext]);

  const health = useMemo(() => {
    return computeTripHealth(detectedIssues);
  }, [detectedIssues]);

  // Sync unified intelligence context to conversational AI companion
  useEffect(() => {
    try {
      const uCtx = buildUnifiedTripContext({
        itinerary,
        editedDays,
        preferences,
        routePlan,
        budgetPlan,
        groupState,
        savedGemIds,
        dayNotes,
        stopNotes,
        completedStopKeys,
        weatherResults: Object.values(weatherResults),
        disruptionResults,
        detectedIssues,
        recommendations: allRecommendations,
        tripHealth: health,
        activeProposal: replanningProposal,
      });
      setUnifiedContext(uCtx);
    } catch (err) {
      console.warn("Failed to sync unified context from AdaptiveDashboard:", err);
    }
  }, [
    itinerary,
    editedDays,
    preferences,
    routePlan,
    budgetPlan,
    groupState,
    savedGemIds,
    dayNotes,
    stopNotes,
    completedStopKeys,
    weatherResults,
    disruptionResults,
    detectedIssues,
    allRecommendations,
    health,
    replanningProposal,
    setUnifiedContext,
  ]);

  // ── 7. Filtering & Day Selection ──
  const filteredIssues = useMemo(() => {
    return detectedIssues.filter((issue) => {
      if (activeSeverityFilter !== "all" && issue.severity !== activeSeverityFilter) {
        return false;
      }
      if (
        selectedDayNumber !== null &&
        selectedDayNumber > 0 &&
        issue.dayNumber !== selectedDayNumber
      ) {
        return false;
      }
      return true;
    });
  }, [detectedIssues, activeSeverityFilter, selectedDayNumber]);

  const filteredRecommendations = useMemo(() => {
    return allRecommendations.filter((rec) => {
      if (
        selectedDayNumber !== null &&
        selectedDayNumber > 0 &&
        rec.targetDayNumber !== selectedDayNumber
      ) {
        return false;
      }
      return true;
    });
  }, [allRecommendations, selectedDayNumber]);

  // ── 8. Acceptance / Rejection Handlers ──
  const handleAcceptRec = (recId: string) => {
    if (onAcceptRecommendation) {
      onAcceptRecommendation(recId);
    } else {
      setLocalAcceptedIds((prev) => (prev.includes(recId) ? prev : [...prev, recId]));
      setLocalRejectedIds((prev) => prev.filter((id) => id !== recId));
    }
  };

  const handleRejectRec = (recId: string) => {
    if (onRejectRecommendation) {
      onRejectRecommendation(recId);
    } else {
      setLocalRejectedIds((prev) => (prev.includes(recId) ? prev : [...prev, recId]));
      setLocalAcceptedIds((prev) => prev.filter((id) => id !== recId));
    }
  };

  const handleApplyProposedPlan = (
    proposal: AdaptiveReplanningProposal,
    selectedRecIds: string[]
  ) => {
    if (onApplyProposal) {
      onApplyProposal(proposal, selectedRecIds);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* ── Section Title & Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-forest bg-forest/10 px-2.5 py-0.5 rounded-md">
              {isKn ? "ಭಾಗ 10 ಹಂತ 5" : "Part 10 Stage 5"}
            </span>
            <span className="text-xs text-charcoal-muted">
              {isKn
                ? "ಸ್ಮಾರ್ಟ್ ಪ್ರವಾಸ ಹೊಂದಾಣಿಕೆ & ವಿಶ್ವಾಸಾರ್ಹತೆ"
                : "Smart Trip Intelligence & Adaptive Travel"}
            </span>
          </div>
          <h2 className="text-xl sm:text-3xl font-bold font-[family-name:var(--font-playfair)] text-forest-dark mt-1">
            {isKn
              ? "ಹೊಂದಾಣಿಕೆಯ ಪ್ರವಾಸ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್"
              : "Adaptive Travel Intelligence Dashboard"}
          </h2>
          <p className="text-xs sm:text-sm text-charcoal-muted mt-1 max-w-2xl">
            {isKn
              ? "ನಿಖರ ಸ್ಥಿತಿ ನಿಗಾ, ಮೂಲ ವೇಳಾಪಟ್ಟಿಯನ್ನು ರಕ್ಷಿಸುವ ಮರು-ಯೋಜನೆ ಮತ್ತು ಸ್ಪಷ್ಟ ಪ್ರವಾಸ ಸಲಹೆಗಳು."
              : "Deterministic condition monitoring, non-destructive replanning proposals, and explainable travel advisories."}
          </p>
        </div>

        {/* Global Modal Trigger */}
        {allRecommendations.length > 0 && (
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold rounded-xl bg-forest hover:bg-forest-dark text-white shadow-md transition-all cursor-pointer shrink-0"
          >
            <Sparkles className="w-4 h-4" />
            <span>
              {isKn
                ? "ಮರು-ಯೋಜನಾ ಪ್ರಸ್ತಾವನೆ ಪರಿಶೀಲಿಸಿ"
                : "Review Replanning Proposal"}
            </span>
          </button>
        )}
      </div>

      {/* ── 1. Trip Health Summary Banner ── */}
      <TripHealthSummary
        health={health}
        issues={detectedIssues}
        activeFilter={activeSeverityFilter}
        onFilterChange={setActiveSeverityFilter}
        onSelectDay={(dayNum) => setSelectedDayNumber(dayNum || null)}
        selectedDayNumber={selectedDayNumber}
      />

      {/* ── 2. Filtered Intelligence Feed (Detected Issues) ── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base sm:text-lg font-bold text-forest-dark flex items-center gap-2">
            <Activity className="w-5 h-5 text-forest" />
            <span>
              {isKn
                ? "ಗುರುತಿಸಲಾದ ಸಮಸ್ಯೆಗಳು & ಸಲಹೆಗಳು"
                : "Detected Issues & Advisories"}
            </span>
            <span className="text-xs font-normal text-charcoal-muted">
              ({filteredIssues.length} {isKn ? "ಸಕ್ರಿಯ" : "active"})
            </span>
          </h3>

          {selectedDayNumber && (
            <span className="text-xs text-forest font-semibold bg-forest/10 px-2 py-0.5 rounded-md">
              {isKn ? `ದಿನ ${selectedDayNumber} ಮಾತ್ರ` : `Day ${selectedDayNumber} only`}
            </span>
          )}
        </div>

        {filteredIssues.length === 0 ? (
          <div className="p-6 rounded-2xl border border-dashed border-border bg-white text-center space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
            <p className="text-sm font-bold text-charcoal">
              {isKn
                ? "ಯಾವುದೇ ಸಮಸ್ಯೆಗಳು ಅಥವಾ ಎಚ್ಚರಿಕೆಗಳು ಕಂಡುಬಂದಿಲ್ಲ!"
                : "No issues or warnings detected for this filter!"}
            </p>
            <p className="text-xs text-charcoal-muted max-w-md mx-auto">
              {isKn
                ? "ನಿಮ್ಮ ಪ್ರವಾಸ ವೇಳಾಪಟ್ಟಿ ಸುಗಮವಾಗಿದೆ ಮತ್ತು ಯಾವುದೇ ಗಂಭೀರ ಸಂಚಾರ ಅಥವಾ ಹವಾಮಾನ ತೊಂದರೆಗಳಿಲ್ಲ."
                : "Your itinerary timing, sequence, and regional pacing are well-balanced."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredIssues.map((issue) => (
              <div
                key={issue.id}
                className={`p-4 rounded-2xl border shadow-subtle flex flex-col justify-between ${
                  issue.severity === "critical"
                    ? "border-rose-300 bg-rose-50/50"
                    : issue.severity === "warning"
                    ? "border-amber-300 bg-amber-50/50"
                    : "border-sky-200 bg-sky-50/50"
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${
                          issue.severity === "critical"
                            ? "bg-rose-600 text-white"
                            : issue.severity === "warning"
                            ? "bg-amber-600 text-white"
                            : "bg-sky-600 text-white"
                        }`}
                      >
                        {issue.severity}
                      </span>
                      <span className="text-xs font-semibold text-charcoal capitalize">
                        {issue.category.replace("_", " ")}
                      </span>
                    </div>

                    {issue.dayNumber !== undefined && (
                      <span className="text-xs font-bold text-charcoal-muted">
                        {isKn ? `ದಿನ ${issue.dayNumber}` : `Day ${issue.dayNumber}`}
                      </span>
                    )}
                  </div>

                  <h4 className="text-sm font-bold text-charcoal">
                    {isKn ? issue.titleKn : issue.titleEn}
                  </h4>
                  <p className="text-xs text-charcoal-muted leading-relaxed">
                    {isKn ? issue.explanationKn : issue.explanationEn}
                  </p>
                </div>

                {/* Footer with affected stop jump */}
                {issue.stopTitle && onJumpToDay && issue.dayNumber && (
                  <div className="mt-3 pt-2 border-t border-border/40 flex items-center justify-end">
                    <button
                      type="button"
                      onClick={() => onJumpToDay(issue.dayNumber!)}
                      className="text-[11px] font-semibold text-forest hover:text-forest-dark transition-colors cursor-pointer"
                    >
                      {isKn ? "ವೇಳಾಪಟ್ಟಿಯಲ್ಲಿ ವೀಕ್ಷಿಸಿ →" : "View in Schedule →"}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── 3. Explainable Recommendations ── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base sm:text-lg font-bold text-forest-dark flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-forest" />
            <span>
              {isKn
                ? "ಸ್ಪಷ್ಟೀಕರಣ ಸಹಿತ ಹೊಂದಾಣಿಕೆಯ ಶಿಫಾರಸುಗಳು"
                : "Explainable Adaptive Recommendations"}
            </span>
            <span className="text-xs font-normal text-charcoal-muted">
              ({filteredRecommendations.length})
            </span>
          </h3>

          {allRecommendations.length > 0 && (
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="text-xs font-bold text-forest hover:text-forest-dark flex items-center gap-1 cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>{isKn ? "ಎಲ್ಲವನ್ನೂ ಹೋಲಿಸಿ" : "Compare All Changes"}</span>
            </button>
          )}
        </div>

        {filteredRecommendations.length === 0 ? (
          <div className="p-5 rounded-2xl border border-dashed border-border bg-white text-center text-xs text-charcoal-muted">
            {isKn
              ? "ಪ್ರಸ್ತುತ ಯಾವುದೇ ಮರು-ಯೋಜನಾ ಶಿಫಾರಸುಗಳು ಅಗತ್ಯವಿಲ್ಲ."
              : "No replanning recommendations needed for this filter."}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredRecommendations.map((rec) => (
              <RecommendationCard
                key={rec.id}
                recommendation={rec}
                isAccepted={acceptedIds.includes(rec.id)}
                isRejected={rejectedIds.includes(rec.id)}
                onAccept={handleAcceptRec}
                onReject={handleRejectRec}
                onReviewInModal={() => setIsModalOpen(true)}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── 4. Live Conditions & Disruption Overview ── */}
      <TripConditionOverview
        weatherResults={weatherResults}
        disruptionResults={disruptionResults}
        onRefresh={fetchTelemetry}
        isRefreshing={isRefreshing}
      />

      {/* ── 5. Replanning Review Modal ── */}
      <ReplanningReviewModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        proposal={replanningProposal}
        currentDays={editedDays}
        onApplyPlan={handleApplyProposedPlan}
        onRefreshProposal={fetchTelemetry}
      />
    </div>
  );
}
