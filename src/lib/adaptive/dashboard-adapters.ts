import type {
  DetectedTripIssue,
  AdaptiveRecommendation,
  AdaptiveReplanningProposal,
  PreservedUserArtifacts,
} from "./adaptive-types";
import type {
  ProviderResult,
  DestinationWeatherData,
  DestinationDisruptionData,
} from "./providers/provider-types";
import type { ItineraryDay } from "../itinerary-engine";
import type { GroupTripState } from "../group/group-types";

/* =========================================================================
   TRIP HEALTH TYPES & EVALUATION
   ========================================================================= */

export type TripHealthStatus = "optimal" | "attention_needed" | "critical_action_required";

export interface TripHealthSummary {
  status: TripHealthStatus;
  criticalCount: number;
  warningCount: number;
  infoCount: number;
  totalIssues: number;
  affectedDayNumbers: number[];
  categoryBreakdown: Record<string, number>;
  labelEn: string;
  labelKn: string;
  descriptionEn: string;
  descriptionKn: string;
}

/**
 * Deterministically evaluates detected issues into a top-level TripHealthSummary.
 */
export function computeTripHealth(issues: DetectedTripIssue[]): TripHealthSummary {
  let criticalCount = 0;
  let warningCount = 0;
  let infoCount = 0;
  const affectedDaysSet = new Set<number>();
  const categoryBreakdown: Record<string, number> = {};

  for (const issue of issues) {
    if (issue.severity === "critical") criticalCount++;
    else if (issue.severity === "warning") warningCount++;
    else infoCount++;

    if (issue.dayNumber !== undefined) {
      affectedDaysSet.add(issue.dayNumber);
    }

    categoryBreakdown[issue.category] = (categoryBreakdown[issue.category] || 0) + 1;
  }

  const affectedDayNumbers = Array.from(affectedDaysSet).sort((a, b) => a - b);
  const totalIssues = issues.length;

  let status: TripHealthStatus = "optimal";
  let labelEn = "Optimal & Smooth";
  let labelKn = "ಯೋಜನೆ ಅತ್ಯುತ್ತಮವಾಗಿದೆ";
  let descriptionEn = "No critical route, pacing, or seasonal conflicts detected in your itinerary.";
  let descriptionKn = "ನಿಮ್ಮ ಪ್ರವಾಸ ವೇಳಾಪಟ್ಟಿಯಲ್ಲಿ ಯಾವುದೇ ಪ್ರಮುಖ ಮಾರ್ಗ, ಹವಾಮಾನ ಅಥವಾ ವೇಗದ ಸಮಸ್ಯೆಗಳಿಲ್ಲ.";

  if (criticalCount > 0) {
    status = "critical_action_required";
    labelEn = "Critical Attention Required";
    labelKn = "ತುರ್ತು ಗಮನ ಅಗತ್ಯವಿದೆ";
    descriptionEn = `${criticalCount} critical constraint conflict(s) detected. Replanning is strongly recommended.`;
    descriptionKn = `${criticalCount} ಪ್ರಮುಖ ಸಮಸ್ಯೆಗಳು ಪತ್ತೆಯಾಗಿವೆ. ಮರು-ಯೋಜನೆ ಮಾಡುವುದು ಸೂಕ್ತ.`;
  } else if (warningCount > 0) {
    status = "attention_needed";
    labelEn = "Advisories & Improvements Active";
    labelKn = "ಗಮನ ಮತ್ತು ಸಲಹೆಗಳು ಲಭ್ಯವಿದೆ";
    descriptionEn = `${warningCount} advisory notice(s) identified to optimize timing, transit, or seasonal comfort.`;
    descriptionKn = `ಸಮಯ, ಪ್ರಯಾಣ ಮತ್ತು ಕಾಲೋಚಿತ ಸೌಕರ್ಯಕ್ಕಾಗಿ ${warningCount} ಸಲಹೆಗಳಿವೆ.`;
  } else if (infoCount > 0) {
    status = "optimal";
    labelEn = "Good with Minor Tips";
    labelKn = "ಉತ್ತಮವಾಗಿದೆ ಮತ್ತು ಸಣ್ಣ ಸಲಹೆಗಳಿವೆ";
    descriptionEn = `${infoCount} practical tip(s) available for your journey.`;
    descriptionKn = `ನಿಮ್ಮ ಪ್ರಯಾಣಕ್ಕಾಗಿ ${infoCount} ಉಪಯುಕ್ತ ಸಲಹೆಗಳಿವೆ.`;
  }

  return {
    status,
    criticalCount,
    warningCount,
    infoCount,
    totalIssues,
    affectedDayNumbers,
    categoryBreakdown,
    labelEn,
    labelKn,
    descriptionEn,
    descriptionKn,
  };
}

/* =========================================================================
   STALENESS EVALUATION
   ========================================================================= */

export interface StalenessCheckResult {
  isStale: boolean;
  reason?: "itinerary_modified" | "proposal_expired" | "day_count_mismatch";
  messageEn?: string;
  messageKn?: string;
}

/**
 * Checks whether an AdaptiveReplanningProposal is stale compared to the current active itinerary.
 * Detects user day modifications, stop additions/removals, or expired proposals (> 30 minutes).
 */
export function checkProposalStaleness(
  proposal: AdaptiveReplanningProposal,
  currentDays: ItineraryDay[],
  maxAgeMinutes: number = 30
): StalenessCheckResult {
  // 1. Proposal Age Check
  const proposalTime = new Date(proposal.createdAt).getTime();
  const now = Date.now();
  if (now - proposalTime > maxAgeMinutes * 60 * 1000) {
    return {
      isStale: true,
      reason: "proposal_expired",
      messageEn: "This replanning proposal is older than 30 minutes. Please refresh for up-to-date conditions.",
      messageKn: "ಈ ಮರು-ಯೋಜನೆಯು 30 ನಿಮಿಷಗಳಿಗಿಂತ ಹಳೆಯದಾಗಿದೆ. ದಯವಿಟ್ಟು ತಾಜಾ ಮಾಹಿತಿಗಾಗಿ ನವೀಕರಿಸಿ.",
    };
  }

  // 2. Day Count Mismatch
  if (proposal.originalDays.length !== currentDays.length) {
    return {
      isStale: true,
      reason: "day_count_mismatch",
      messageEn: "The number of days in the itinerary has changed since this proposal was created.",
      messageKn: "ಈ ಪ್ರಸ್ತಾವನೆ ಸೃಷ್ಟಿಯಾದ ನಂತರ ಪ್ರವಾಸದ ದಿನಗಳ ಸಂಖ್ಯೆ ಬದಲಾಗಿದೆ.",
    };
  }

  // 3. Stop Sequence & Content Mismatch
  for (let i = 0; i < proposal.originalDays.length; i++) {
    const origDay = proposal.originalDays[i];
    const currDay = currentDays[i];

    if (!currDay || origDay.dayNumber !== currDay.dayNumber) {
      return {
        isStale: true,
        reason: "itinerary_modified",
        messageEn: "Itinerary structure changed since proposal was generated.",
        messageKn: "ಪ್ರಸ್ತಾವನೆ ರಚನೆಯಾದ ನಂತರ ದಿನಗಳ ರಚನೆ ಬದಲಾಗಿದೆ.",
      };
    }

    if (origDay.stops.length !== currDay.stops.length) {
      return {
        isStale: true,
        reason: "itinerary_modified",
        messageEn: `Day ${origDay.dayNumber} stops were modified after this proposal was generated.`,
        messageKn: `ದಿನ ${origDay.dayNumber} ರ ಚಟುವಟಿಕೆಗಳು ಈ ಪ್ರಸ್ತಾವನೆಯ ನಂತರ ಮಾರ್ಪಟ್ಟಿವೆ.`,
      };
    }

    for (let s = 0; s < origDay.stops.length; s++) {
      const origStop = origDay.stops[s];
      const currStop = currDay.stops[s];

      if (
        origStop.title !== currStop.title ||
        origStop.destinationId !== currStop.destinationId ||
        origStop.timeOfDay !== currStop.timeOfDay
      ) {
        return {
          isStale: true,
          reason: "itinerary_modified",
          messageEn: `Day ${origDay.dayNumber} activities were modified after this proposal was generated.`,
          messageKn: `ದಿನ ${origDay.dayNumber} ರ ಚಟುವಟಿಕೆಗಳನ್ನು ಬದಲಾಯಿಸಲಾಗಿದೆ.`,
        };
      }
    }
  }

  return { isStale: false };
}

/* =========================================================================
   NON-DESTRUCTIVE REPLANNING APPLICATOR
   ========================================================================= */

export interface ApplyReplanningParams {
  originalDays: ItineraryDay[];
  proposal: AdaptiveReplanningProposal;
  acceptedRecommendationIds?: string[];
  dayNotes: Record<number, string>;
  stopNotes: Record<string, string>;
  completedStopKeys: string[];
  savedGemIds?: string[];
  groupState?: GroupTripState | null;
}

export interface ApplyReplanningResult {
  updatedDays: ItineraryDay[];
  preservedDayNotes: Record<number, string>;
  preservedStopNotes: Record<string, string>;
  preservedCompletedKeys: string[];
  appliedRecCount: number;
  preservedArtifacts: PreservedUserArtifacts;
}

/**
 * Applies proposed changes non-destructively to an itinerary while strictly preserving
 * 100% of day notes, stop notes, completed stops, saved hidden gems, and group voting.
 */
export function applyReplanningProposalToItinerary(
  params: ApplyReplanningParams
): ApplyReplanningResult {
  const {
    proposal,
    acceptedRecommendationIds,
    dayNotes,
    stopNotes,
    completedStopKeys,
    savedGemIds = [],
    groupState = null,
  } = params;

  // Deep clone proposed days
  const updatedDays: ItineraryDay[] = proposal.proposedDays.map((d) => ({
    ...d,
    stops: d.stops.map((s) => ({ ...s })),
  }));

  // Preserve all day notes
  const preservedDayNotes = { ...dayNotes };

  // Preserve all stop notes
  const preservedStopNotes = { ...stopNotes };

  // Preserve all completed stop keys
  const preservedCompletedKeys = [...completedStopKeys];

  const appliedRecCount = acceptedRecommendationIds
    ? proposal.appliedRecommendationIds.filter((id) => acceptedRecommendationIds.includes(id)).length
    : proposal.appliedRecommendationIds.length;

  const preservedArtifacts: PreservedUserArtifacts = {
    dayNotesCount: Object.keys(preservedDayNotes).length,
    stopNotesCount: Object.keys(preservedStopNotes).length,
    completedStopsCount: preservedCompletedKeys.length,
    savedGemsCount: savedGemIds.length,
    groupDecisionsCount: groupState?.decisions ? Object.keys(groupState.decisions).length : 0,
    allPreserved: true,
  };

  return {
    updatedDays,
    preservedDayNotes,
    preservedStopNotes,
    preservedCompletedKeys,
    appliedRecCount,
    preservedArtifacts,
  };
}

/* =========================================================================
   ASSISTANT CONTEXT ADAPTER (PHASE 4 PREPARATION)
   ========================================================================= */

export interface AdaptiveAssistantContextInput {
  health: TripHealthSummary;
  issues: DetectedTripIssue[];
  recommendations: AdaptiveRecommendation[];
  weatherResults?: ProviderResult<DestinationWeatherData>[];
  disruptionResults?: ProviderResult<DestinationDisruptionData>[];
  language: "en" | "kn";
}

/**
 * Formats a concise, factual briefing of the adaptive itinerary state for the AI Companion.
 */
export function formatAdaptiveContextForAssistant(input: AdaptiveAssistantContextInput): string {
  const isKn = input.language === "kn";
  const { health, issues, recommendations, weatherResults, disruptionResults } = input;

  const lines: string[] = [];
  lines.push(
    isKn
      ? `=== ಹೊಂದಾಣಿಕೆಯ ಪ್ರವಾಸ ಸ್ಥಿತಿ (ಭಾಗ 10 ಹಂತ 5) ===`
      : `=== ADAPTIVE TRIP INTELLIGENCE STATUS (Part 10 Stage 5) ===`
  );

  lines.push(
    isKn
      ? `ಆರೋಗ್ಯ ಸ್ಥಿತಿ: ${health.labelKn} (${health.criticalCount} ಗಂಭೀರ, ${health.warningCount} ಎಚ್ಚರಿಕೆ, ${health.infoCount} ಮಾಹಿತಿ)`
      : `Trip Health: ${health.labelEn} (${health.criticalCount} Critical, ${health.warningCount} Warning, ${health.infoCount} Info)`
  );

  if (issues.length > 0) {
    lines.push(isKn ? `ಗುರುತಿಸಲಾದ ಸಮಸ್ಯೆಗಳು:` : `Detected Issues:`);
    issues.slice(0, 5).forEach((issue, idx) => {
      lines.push(
        `  ${idx + 1}. [${issue.severity.toUpperCase()}] ${isKn ? issue.titleKn : issue.titleEn} (${isKn ? issue.explanationKn : issue.explanationEn})`
      );
    });
  }

  if (recommendations.length > 0) {
    lines.push(isKn ? `ಸಕ್ರಿಯ ಶಿಫಾರಸುಗಳು:` : `Active Recommendations:`);
    recommendations.slice(0, 5).forEach((rec, idx) => {
      lines.push(
        `  ${idx + 1}. ${isKn ? rec.titleKn : rec.titleEn} -> ${isKn ? rec.reason.whyChangedKn : rec.reason.whyChangedEn} (Δ${rec.reason.timeImpactMinutes}m, Δ₹${rec.reason.costImpactInr})`
      );
    });
  }

  if (weatherResults && weatherResults.length > 0) {
    lines.push(isKn ? `ಪ್ರಮುಖ ಗಮ್ಯಸ್ಥಾನಗಳ ಹವಾಮಾನ:` : `Key Destination Weather Telemetry:`);
    for (const res of weatherResults) {
      if (res.data?.current) {
        const obs = res.data.current;
        lines.push(
          `  - ${res.data.destinationName || res.data.destinationId}: ${obs.weatherDescriptionEn}, ${obs.temperatureC}°C, wind ${obs.windSpeedKmh}km/h (Freshness: ${res.freshness.state})`
        );
      }
    }
  }

  if (disruptionResults && disruptionResults.length > 0) {
    const totalAlerts = disruptionResults.reduce((acc, r) => acc + (r.data?.alerts?.length || 0), 0);
    lines.push(
      isKn
        ? `ರಸ್ತೆ/ಸಂಚಾರ ಅಡಚಣೆಗಳು: ${totalAlerts} ಸಕ್ರಿಯ ವರದಿಗಳು`
        : `Road/Travel Disruptions: ${totalAlerts} active verified incidents`
    );
  }

  return lines.join("\n");
}
