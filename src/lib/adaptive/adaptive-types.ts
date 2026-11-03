import type { TripPreferences } from "../planner-types";
import type { GeneratedItinerary, ItineraryDay, ItineraryStop } from "../itinerary-engine";
import type { OptimizedRoutePlan } from "../routes/route-types";
import type { OptimizedBudgetPlan } from "../budget/budget-types";
import type { GroupTripState } from "../group/group-types";
import type { AccessibilityRating } from "../discovery/discovery-types";
import type {
  ProviderResult,
  DestinationWeatherData,
  DestinationDisruptionData,
} from "./providers/provider-types";

/* =========================================================================
   1. DATA PROVENANCE & CONFIDENCE CLASSIFICATION
   ========================================================================= */

/**
 * Origin of data driving adaptive evaluation.
 * In accordance with hackathon ethics, live external information is NEVER invented.
 */
export type DataProvenance =
  | "user_provided"     // Directly supplied by the user (preferences, notes, budget limits)
  | "static_knowledge"  // Verified, static Yatrion dataset (ASI monument hours, heritage data, geography)
  | "heuristic"         // Calibrated mathematical estimations (terrain multipliers, average road speeds)
  | "external_live";    // Genuine live external feed (only when an authentic verified API is connected)

/**
 * Confidence level of conditions, detected issues, and suggestions.
 */
export type ConfidenceLevel =
  | "high"       // Grounded in explicit user input or verified static facts
  | "medium"     // Grounded in calibrated domain heuristics with realistic variance
  | "low"        // Generic fallback or generalized assumption
  | "unverified"; // External conditions when no live telemetry sensor is connected

/* =========================================================================
   2. CONDITION CATEGORIES & TRAVEL CONDITIONS
   ========================================================================= */

export type ConditionCategory =
  | "weather"
  | "travel_delay"
  | "route_disruption"
  | "activity_unavailable"
  | "seasonal_restriction"
  | "budget_overrun"
  | "group_preference_conflict"
  | "accessibility_conflict"
  | "schedule_overload";

export interface TravelCondition {
  id: string;
  category: ConditionCategory;
  titleEn: string;
  titleKn: string;
  descriptionEn: string;
  descriptionKn: string;
  provenance: DataProvenance;
  confidence: ConfidenceLevel;
  timestamp?: string;
  hasLiveConfirmation: boolean;
  affectedDayNumber?: number;
  affectedStopTitle?: string;
  metadata?: Record<string, unknown>;
}

/* =========================================================================
   3. ITINERARY CONSTRAINTS
   ========================================================================= */

export type ConstraintType =
  | "max_daily_transit_minutes"
  | "max_daily_stops"
  | "budget_limit_overall"
  | "budget_limit_individual"
  | "wheelchair_required"
  | "step_free_required"
  | "no_midday_temple_arrival"
  | "daylight_ghat_driving_only"
  | "avoid_monsoon_waterfall_danger"
  | "group_pace_balanced";

export interface ItineraryConstraint {
  id: string;
  type: ConstraintType;
  labelEn: string;
  labelKn: string;
  targetValue?: string | number;
  source: DataProvenance;
  mandatory: boolean; // if true, issue severity is critical/warning; if false, info
}

/* =========================================================================
   4. ADAPTIVE TRIP CONTEXT (INPUTS TO AUDIT ENGINE)
   ========================================================================= */

export interface AdaptiveTripContext {
  preferences: TripPreferences;
  itinerary: GeneratedItinerary;
  days: ItineraryDay[];
  routePlan?: OptimizedRoutePlan | null;
  budgetPlan?: OptimizedBudgetPlan | null;
  groupState?: GroupTripState | null;
  savedGemIds?: string[];
  dayNotes?: Record<number, string>;
  stopNotes?: Record<string, string>;
  completedStopKeys?: string[];
  externalConditions?: TravelCondition[]; // Optional verified external conditions
  weatherResults?: ProviderResult<DestinationWeatherData>[];
  disruptionResults?: ProviderResult<DestinationDisruptionData>[];
  hasLiveProviderConnected?: boolean;
}

/* =========================================================================
   5. DETECTED TRIP ISSUES
   ========================================================================= */

export type IssueSeverity = "critical" | "warning" | "info";

export type AdaptiveActionType =
  | "reorder_stops"
  | "replace_activity"
  | "move_stop_day"
  | "remove_excess_stop"
  | "insert_rest_period"
  | "select_budget_alternative"
  | "select_accessible_alternative"
  | "tag_subgroup_optional"
  | "switch_budget_scenario"
  | "adjust_travel_pace";

export interface DetectedTripIssue {
  id: string;
  severity: IssueSeverity;
  category: ConditionCategory;
  dayNumber?: number;
  stopIndex?: number;
  stopTitle?: string;
  titleEn: string;
  titleKn: string;
  explanationEn: string;
  explanationKn: string;
  evidence: string;
  provenance: DataProvenance;
  confidence: ConfidenceLevel;
  suggestedActionEn: string;
  suggestedActionKn: string;
  actionType: AdaptiveActionType;
  metadata?: Record<string, unknown>;
}

/* =========================================================================
   6. ALTERNATIVES & ADAPTIVE RECOMMENDATIONS
   ========================================================================= */

export interface AlternativeActivity {
  id: string;
  titleEn: string;
  titleKn: string;
  destinationId: string;
  destinationName: string;
  district: string;
  category: string;
  activityType: ItineraryStop["activityType"];
  estimatedDuration: string;
  estimatedDurationMinutes: number;
  estimatedCostInr: number;
  accessibility: AccessibilityRating | "step_free" | "strenuous_climb";
  isWheelchairAccessible: boolean;
  isStepFree: boolean;
  experienceId?: string; // If sourced from KARNATAKA_EXPERIENCES
  whyRecommendedEn: string;
  whyRecommendedKn: string;
  provenance: DataProvenance;
}

export interface RecommendationReason {
  whatChangedEn: string;
  whatChangedKn: string;
  whyChangedEn: string;
  whyChangedKn: string;
  constraintsSatisfied: ConstraintType[];
  timeImpactMinutes: number; // Negative = saves time, positive = adds time
  costImpactInr: number;     // Negative = saves cost, positive = adds cost
  assumptionsEn: string[];
  assumptionsKn: string[];
}

export interface AdaptiveRecommendation {
  id: string;
  issueId: string;
  actionType: AdaptiveActionType;
  titleEn: string;
  titleKn: string;
  explanationEn: string;
  explanationKn: string;
  targetDayNumber: number;
  targetStopIndex?: number;
  targetStopTitle?: string;
  alternative?: AlternativeActivity;
  reason: RecommendationReason;
  confidence: ConfidenceLevel;
  provenance: DataProvenance;
  score: number; // Explainable score (0-100)
}

/* =========================================================================
   7. SAFE REPLANNING PROPOSAL & COMPARISON (USER CONTROL WORKFLOW)
   ========================================================================= */

export interface RouteImpactComparison {
  originalDistanceKm: number;
  proposedDistanceKm: number;
  distanceDiffKm: number;
  originalTransitMinutes: number;
  proposedTransitMinutes: number;
  transitMinutesDiff: number;
}

export interface BudgetImpactComparison {
  originalTotalCostInr: number;
  proposedTotalCostInr: number;
  costDiffInr: number;
  originalPerPersonInr: number;
  proposedPerPersonInr: number;
}

export interface PreservedUserArtifacts {
  dayNotesCount: number;
  stopNotesCount: number;
  completedStopsCount: number;
  savedGemsCount: number;
  groupDecisionsCount: number;
  allPreserved: boolean;
}

export interface AdaptiveReplanningProposal {
  id: string;
  createdAt: string;
  contextSummaryEn: string;
  contextSummaryKn: string;
  originalDays: ItineraryDay[];
  proposedDays: ItineraryDay[];
  detectedIssues: DetectedTripIssue[];
  recommendations: AdaptiveRecommendation[];
  appliedRecommendationIds: string[];
  changeSummaryEn: string[];
  changeSummaryKn: string[];
  routeImpact: RouteImpactComparison;
  budgetImpact: BudgetImpactComparison;
  preservedData: PreservedUserArtifacts;
  warningsAndAssumptionsEn: string[];
  warningsAndAssumptionsKn: string[];
  hasLiveConfirmation: boolean;
}
