import type { GeneratedItinerary, ItineraryDay } from "../itinerary-engine";
import type { TripPreferences } from "../planner-types";
import type { OptimizedRoutePlan } from "../routes/route-types";
import type { OptimizedBudgetPlan } from "../budget/budget-types";
import type { GroupTripState } from "../group/group-types";
import type {
  DetectedTripIssue,
  AdaptiveRecommendation,
  AdaptiveReplanningProposal,
} from "./adaptive-types";
import type {
  ProviderResult,
  DestinationWeatherData,
  DestinationDisruptionData,
} from "./providers/provider-types";
import { computeTripHealth, type TripHealthSummary } from "./dashboard-adapters";

/* =========================================================================
   1. UNIFIED TRIP INTELLIGENCE CONTEXT TYPES
   ========================================================================= */

export interface UnifiedWeatherSummary {
  destinationId: string;
  destinationName: string;
  temperatureC?: number;
  apparentTemperatureC?: number;
  conditionEn?: string;
  conditionKn?: string;
  precipitationMm?: number;
  windSpeedKmh?: number;
  freshnessState: string;
  isStale: boolean;
  isLive: boolean;
}

export interface UnifiedForecastSummary {
  destinationId: string;
  date: string;
  conditionEn: string;
  conditionKn: string;
  tempMinC: number;
  tempMaxC: number;
  rainProbabilityPercent: number;
  precipitationMm: number;
}

export interface UnifiedDisruptionSummary {
  id: string;
  titleEn: string;
  titleKn: string;
  severity: string;
  corridorOrRoad?: string;
  officialSource: string;
}

export interface UnifiedTripIntelligenceContext {
  tripId: string;
  title: string;
  destinationSummary: string;
  durationDays: number;
  departureDate?: string;
  travellerCount: number;
  travelStyle: string;
  startingLocation: string;

  // Route Intelligence
  route: {
    totalDistanceKm: number;
    totalTransitHours: number;
    intensity: string;
    stopCount: number;
    hasBacktrackingWarning: boolean;
  };

  // Budget Intelligence
  budget: {
    selectedScenario: string;
    totalCostInr: number;
    perPersonCostInr: number;
    isBudgetTight: boolean;
  };

  // Discovery Intelligence
  discovery: {
    savedGemCount: number;
    savedGemIds: string[];
  };

  // Group Intelligence
  group?: {
    groupName: string;
    memberCount: number;
    hasAccessibilityNeeds: boolean;
    accessibilitySummary: string[];
    travelPace: string;
  };

  // Adaptive Health & Replanning
  adaptive: {
    health: TripHealthSummary;
    detectedIssuesCount: number;
    issues: Array<{
      id: string;
      severity: string;
      category: string;
      dayNumber?: number;
      titleEn: string;
      titleKn: string;
      explanationEn: string;
      explanationKn: string;
    }>;
    recommendationsCount: number;
    recommendations: Array<{
      id: string;
      targetDayNumber: number;
      actionType: string;
      titleEn: string;
      titleKn: string;
      timeImpactMinutes: number;
      costImpactInr: number;
      whyChangedEn: string;
      whyChangedKn: string;
    }>;
    hasPendingProposal: boolean;
    acceptedRecIds: string[];
    rejectedRecIds: string[];
  };

  // Live Conditions & External Providers
  conditions: {
    weather: UnifiedWeatherSummary[];
    forecasts: UnifiedForecastSummary[];
    disruptions: UnifiedDisruptionSummary[];
    sourceAttribution: string;
  };
}

export interface BuildUnifiedTripContextParams {
  itinerary?: GeneratedItinerary | null;
  editedDays?: ItineraryDay[];
  preferences?: TripPreferences | null;
  routePlan?: OptimizedRoutePlan | null;
  budgetPlan?: OptimizedBudgetPlan | null;
  groupState?: GroupTripState | null;
  savedGemIds?: string[];
  dayNotes?: Record<number, string>;
  stopNotes?: Record<string, string>;
  completedStopKeys?: string[];
  issues?: DetectedTripIssue[];
  detectedIssues?: DetectedTripIssue[];
  recommendations?: AdaptiveRecommendation[];
  proposal?: AdaptiveReplanningProposal | null;
  activeProposal?: AdaptiveReplanningProposal | null;
  tripHealth?: TripHealthSummary | null;
  weatherResults?: Record<string, ProviderResult<DestinationWeatherData>> | ProviderResult<DestinationWeatherData>[];
  disruptionResults?: ProviderResult<DestinationDisruptionData>[];
  acceptedRecommendationIds?: string[];
  rejectedRecommendationIds?: string[];
}

/* =========================================================================
   2. BUILD UNIFIED TRIP CONTEXT (PURE & BOUNDED)
   ========================================================================= */

export function buildUnifiedTripContext(
  params: BuildUnifiedTripContextParams
): UnifiedTripIntelligenceContext {
  const {
    itinerary,
    preferences,
    routePlan,
    budgetPlan,
    groupState,
    savedGemIds = [],
    recommendations = [],
    weatherResults,
    disruptionResults = [],
    acceptedRecommendationIds = [],
    rejectedRecommendationIds = [],
  } = params;

  const rawIssues = params.issues || params.detectedIssues || [];
  const rawProposal = params.proposal ?? params.activeProposal ?? null;

  // 1. Trip Overview
  const tripId = itinerary?.id || "unassigned-trip";
  const title = itinerary?.title || "Karnataka Journey";
  const destinationSummary =
    itinerary?.includedDestinations?.map((d) => d.name).join(", ") ||
    preferences?.selectedDestinationIds?.join(", ") ||
    "Karnataka";
  const durationDays = itinerary?.durationDays || preferences?.durationDays || 3;
  const departureDate = preferences?.departureDate;
  const travellerCount = preferences?.travellerCount || (groupState?.config?.travellers?.length || 1);
  const travelStyle = preferences?.travelStyle || "balanced";
  const startingLocation = itinerary?.startingLocation || preferences?.startingLocation || "Bengaluru";

  // 2. Route Intelligence
  const route = {
    totalDistanceKm: routePlan?.totalEstimatedDistanceKm || 0,
    totalTransitHours: routePlan?.totalEstimatedTransitHours || 0,
    intensity: routePlan?.intensity || "balanced",
    stopCount: routePlan?.totalStopsCount || 0,
    hasBacktrackingWarning: Boolean(
      routePlan &&
      Array.isArray(routePlan.feasibilityWarnings) &&
      routePlan.feasibilityWarnings.some((w) => w.type === "backtracking")
    ),
  };

  // 3. Budget Intelligence
  const selectedScenario = budgetPlan?.activeScenario || "balanced";
  const activeScenario = budgetPlan?.scenarios?.[selectedScenario];
  const budget = {
    selectedScenario,
    totalCostInr: activeScenario?.totalCost || 0,
    perPersonCostInr: activeScenario?.perPersonCost || 0,
    isBudgetTight: activeScenario?.isOverBudget || false,
  };

  // 4. Discovery Intelligence
  const discovery = {
    savedGemCount: savedGemIds.length,
    savedGemIds,
  };

  // 5. Group Intelligence
  let group: UnifiedTripIntelligenceContext["group"] | undefined = undefined;
  if (groupState && groupState.config) {
    const travellers = groupState.config.travellers || [];
    const accessibilityNeeds: string[] = [];
    for (const tr of travellers) {
      if (tr.accessibilityRequirements && tr.accessibilityRequirements.length > 0) {
        for (const req of tr.accessibilityRequirements) {
          if (req !== "none") {
            accessibilityNeeds.push(req);
          }
        }
      }
    }

    group = {
      groupName: groupState.config.groupName,
      memberCount: travellers.length,
      hasAccessibilityNeeds: accessibilityNeeds.length > 0,
      accessibilitySummary: Array.from(new Set(accessibilityNeeds)),
      travelPace: travellers[0]?.preferredPace || "balanced",
    };
  }

  // 6. Adaptive Health & Issues (Bounded to top 5)
  const health = params.tripHealth || computeTripHealth(rawIssues);
  const boundedIssues = rawIssues.slice(0, 5).map((iss) => ({
    id: iss.id,
    severity: iss.severity,
    category: iss.category,
    dayNumber: iss.dayNumber,
    titleEn: iss.titleEn,
    titleKn: iss.titleKn,
    explanationEn: iss.explanationEn,
    explanationKn: iss.explanationKn,
  }));

  const boundedRecommendations = recommendations.slice(0, 5).map((rec) => ({
    id: rec.id,
    targetDayNumber: rec.targetDayNumber,
    actionType: rec.actionType,
    titleEn: rec.titleEn,
    titleKn: rec.titleKn,
    timeImpactMinutes: rec.reason.timeImpactMinutes,
    costImpactInr: rec.reason.costImpactInr,
    whyChangedEn: rec.reason.whyChangedEn,
    whyChangedKn: rec.reason.whyChangedKn,
  }));

  const adaptive = {
    health,
    detectedIssuesCount: rawIssues.length,
    issues: boundedIssues,
    recommendationsCount: recommendations.length,
    recommendations: boundedRecommendations,
    hasPendingProposal: rawProposal !== null,
    acceptedRecIds: acceptedRecommendationIds,
    rejectedRecIds: rejectedRecommendationIds,
  };

  // 7. Conditions & Weather
  const weatherList: UnifiedWeatherSummary[] = [];
  const forecastList: UnifiedForecastSummary[] = [];

  const rawWeatherArray = Array.isArray(weatherResults)
    ? weatherResults
    : weatherResults
    ? Object.values(weatherResults)
    : [];

  for (const res of rawWeatherArray) {
    if (res.data) {
      const cur = res.data.current;
      weatherList.push({
        destinationId: res.data.destinationId,
        destinationName: res.data.destinationName,
        temperatureC: cur?.temperatureC,
        apparentTemperatureC: cur?.apparentTemperatureC,
        conditionEn: cur?.weatherDescriptionEn,
        conditionKn: cur?.weatherDescriptionKn,
        precipitationMm: cur?.precipitationMm,
        windSpeedKmh: cur?.windSpeedKmh,
        freshnessState: res.freshness.state,
        isStale: res.freshness.state === "expired" || res.freshness.state === "aging",
        isLive: res.isLiveObservation,
      });

      if (res.data.dailyForecast) {
        for (const fc of res.data.dailyForecast.slice(0, 3)) {
          forecastList.push({
            destinationId: res.data.destinationId,
            date: fc.date,
            conditionEn: fc.weatherDescriptionEn,
            conditionKn: fc.weatherDescriptionKn,
            tempMinC: fc.tempMinC,
            tempMaxC: fc.tempMaxC,
            rainProbabilityPercent: fc.precipitationProbabilityPercent,
            precipitationMm: fc.precipitationMm,
          });
        }
      }
    }
  }

  const disruptionList: UnifiedDisruptionSummary[] = [];
  for (const dRes of disruptionResults) {
    if (dRes.data?.alerts) {
      for (const al of dRes.data.alerts) {
        disruptionList.push({
          id: al.id,
          titleEn: al.titleEn,
          titleKn: al.titleKn,
          severity: al.severity,
          corridorOrRoad: al.corridorOrRoad,
          officialSource: al.officialSource,
        });
      }
    }
  }

  const conditions = {
    weather: weatherList,
    forecasts: forecastList,
    disruptions: disruptionList,
    sourceAttribution:
      "Open-Meteo under CC BY 4.0; Karnataka State Disaster Management & Tourism Gazette",
  };

  return {
    tripId,
    title,
    destinationSummary,
    durationDays,
    departureDate,
    travellerCount,
    travelStyle,
    startingLocation,
    route,
    budget,
    discovery,
    group,
    adaptive,
    conditions,
  };
}

/* =========================================================================
   3. FORMAT UNIFIED CONTEXT FOR SYSTEM PROMPTS (BOUNDED & BILINGUAL)
   ========================================================================= */

export function formatUnifiedContextForPrompt(
  ctx: UnifiedTripIntelligenceContext,
  lang: "en" | "kn" | "hi" | "te" = "en"
): string {
  const isKn = lang === "kn";
  const lines: string[] = [];

  lines.push(
    isKn
      ? `=== ಯಾತ್ರಿಯಾನ್ ಸಕ್ರಿಯ ಪ್ರವಾಸ ಮಾಹಿತಿ ವಿವರ (ಪ್ರಸ್ತುತ ಪ್ರವಾಸ) ===`
      : `=== YATRION ACTIVE TRIP INTELLIGENCE CONTEXT ===`
  );

  lines.push(
    isKn
      ? `ಪ್ರವಾಸ: ${ctx.title} (${ctx.destinationSummary}) | ${ctx.durationDays} ದಿನಗಳು | ಪ್ರಯಾಣಿಕರು: ${ctx.travellerCount} | ಶೈಲಿ: ${ctx.travelStyle}`
      : `Trip: ${ctx.title} (${ctx.destinationSummary}) | ${ctx.durationDays} Days | Travellers: ${ctx.travellerCount} | Style: ${ctx.travelStyle}`
  );

  // Route
  if (ctx.route.totalDistanceKm > 0) {
    lines.push(
      isKn
        ? `ಮಾರ್ಗ: ಒಟ್ಟು ~${ctx.route.totalDistanceKm} km, ~${ctx.route.totalTransitHours} ಗಂಟೆಗಳ ಪ್ರಯಾಣ (${ctx.route.intensity} ವೇಗ)`
        : `Route: Total ~${ctx.route.totalDistanceKm} km, ~${ctx.route.totalTransitHours} hrs transit (${ctx.route.intensity} intensity)`
    );
  }

  // Budget
  if (ctx.budget.totalCostInr > 0) {
    lines.push(
      isKn
        ? `ಬಜೆಟ್: ₹${ctx.budget.totalCostInr.toLocaleString("en-IN")} (ತಲಾ ₹${ctx.budget.perPersonCostInr.toLocaleString("en-IN")}, ಸನ್ನಿವೇಶ: ${ctx.budget.selectedScenario})`
        : `Budget: ₹${ctx.budget.totalCostInr.toLocaleString("en-IN")} (₹${ctx.budget.perPersonCostInr.toLocaleString("en-IN")}/person, scenario: ${ctx.budget.selectedScenario})`
    );
  }

  // Group
  if (ctx.group) {
    lines.push(
      isKn
        ? `ಗುಂಪು: ${ctx.group.groupName} (${ctx.group.memberCount} ಸದಸ್ಯರು)${ctx.group.hasAccessibilityNeeds ? `, ಪ್ರವೇಶಾವಕಾಶ ಅಗತ್ಯಗಳು: ${ctx.group.accessibilitySummary.join(", ")}` : ""}`
        : `Group: ${ctx.group.groupName} (${ctx.group.memberCount} members)${ctx.group.hasAccessibilityNeeds ? `, Accessibility needs: ${ctx.group.accessibilitySummary.join(", ")}` : ""}`
    );
  }

  // Adaptive Health
  lines.push(
    isKn
      ? `ಪ್ರವಾಸ ಆರೋಗ್ಯ: ${ctx.adaptive.health.labelKn} (${ctx.adaptive.health.criticalCount} ಗಂಭೀರ, ${ctx.adaptive.health.warningCount} ಎಚ್ಚರಿಕೆ, ${ctx.adaptive.health.infoCount} ಮಾಹಿತಿ)`
      : `Trip Health: ${ctx.adaptive.health.labelEn} (${ctx.adaptive.health.criticalCount} Critical, ${ctx.adaptive.health.warningCount} Warning, ${ctx.adaptive.health.infoCount} Info)`
  );

  if (ctx.adaptive.issues.length > 0) {
    lines.push(isKn ? `ಗುರುತಿಸಲಾದ ಪ್ರಮುಖ ಸಮಸ್ಯೆಗಳು:` : `Top Detected Issues:`);
    ctx.adaptive.issues.forEach((iss, i) => {
      lines.push(
        `  ${i + 1}. [${iss.severity.toUpperCase()}] ${isKn ? iss.titleKn : iss.titleEn} - ${isKn ? iss.explanationKn : iss.explanationEn}`
      );
    });
  }

  if (ctx.adaptive.recommendations.length > 0) {
    lines.push(isKn ? `ಶಿಫಾರಸುಗಳು:` : `Adaptive Recommendations:`);
    ctx.adaptive.recommendations.forEach((rec, i) => {
      lines.push(
        `  ${i + 1}. ದಿನ ${rec.targetDayNumber}: ${isKn ? rec.titleKn : rec.titleEn} (Δ${rec.timeImpactMinutes}m transit, Δ₹${rec.costImpactInr})`
      );
    });
  }

  // Conditions
  if (ctx.conditions.weather.length > 0) {
    lines.push(isKn ? `ಹವಾಮಾನ ಸ್ಥಿತಿ:` : `Weather Conditions:`);
    ctx.conditions.weather.forEach((w) => {
      lines.push(
        `  - ${w.destinationName}: ${w.temperatureC ?? "—"}°C, ${w.conditionEn || "Clear"}, rain: ${w.precipitationMm ?? 0}mm [Freshness: ${w.freshnessState}]`
      );
    });
  }

  if (ctx.conditions.disruptions.length > 0) {
    lines.push(isKn ? `ಪರಿಶೀಲಿತ ರಸ್ತೆ/ಸಂಚಾರ ಅಡಚಣೆಗಳು:` : `Verified Travel Disruptions:`);
    ctx.conditions.disruptions.forEach((d) => {
      lines.push(`  - [${d.severity.toUpperCase()}] ${isKn ? d.titleKn : d.titleEn} (${d.officialSource})`);
    });
  } else {
    lines.push(
      isKn
        ? `ಸಂಚಾರ ಮಾಹಿತಿ: ಯಾವುದೇ ಪರಿಶೀಲಿತ ಅಧಿಕೃತ ಅಡಚಣೆಗಳಿಲ್ಲ (ಸ್ಥಳೀಯವಾಗಿ ಖಚಿತಪಡಿಸಿಕೊಳ್ಳಿ; ಕಾಲ್ಪನಿಕ ವರದಿಗಳಿಲ್ಲ).`
        : `Disruptions: No verified road closures reported (always confirm locally; zero synthetic reports).`
    );
  }

  lines.push(`Attribution: ${ctx.conditions.sourceAttribution}`);
  return lines.join("\n");
}

/**
 * Estimates prompt token consumption using standard ~4 chars/token heuristic.
 */
export function estimatePromptTokens(text: string): number {
  if (!text) return 0;
  return Math.ceil(text.length / 4);
}
