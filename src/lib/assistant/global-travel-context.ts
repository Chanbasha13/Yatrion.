/**
 * Global Travel Context Engine for Yatrion
 * 
 * Aggregates, normalizes, and validates telemetry from all 14 workspaces
 * into a structured, compact, typed travel context payload for AI reasoning.
 */

import type { StoredTripState } from "@/lib/storage/user-trip-service";
import type { OptimizedRoutePlan } from "@/lib/routes/route-types";
import type { OptimizedBudgetPlan } from "@/lib/budget/budget-types";
import type { GroupTripState } from "@/lib/group/group-types";
import type { UnifiedTripIntelligenceContext } from "@/lib/adaptive";
import { SECULAR_ATTRACTIONS } from "@/lib/explore/district-data";

export interface TravelerContextDomain {
  userId?: string;
  name?: string;
  isDemo: boolean;
  language: "en" | "kn";
}

export interface ActiveTripContextDomain {
  id?: string;
  title: string;
  startingLocation: string;
  durationDays: number;
  pacing: string;
  budgetTier: string;
  travelStyle: string;
  transport: string;
  groupType: string;
  travellerCount: number;
  destinationIds: string[];
  savedAt: string;
  syncState: string;
}

export interface ItineraryStopContext {
  dayNumber: number;
  timeOfDay: string;
  title: string;
  destinationName: string;
  district: string;
  activityType: string;
  isCompleted: boolean;
  notes?: string;
}

export interface ItineraryContextDomain {
  daysCount: number;
  totalStops: number;
  completedStopsCount: number;
  progressPercent: number;
  stops: ItineraryStopContext[];
}

export interface BudgetContextDomain {
  targetBudget: number | null;
  estimatedTotalCost: number;
  perPersonCost: number;
  scenarioKey: string;
  categories: {
    key: string;
    labelEn: string;
    labelKn: string;
    estimatedCost: number;
    percentage: number;
  }[];
}

export interface RouteContextDomain {
  startingLocation: string;
  totalDistanceKm: number;
  totalDurationHours: number;
  destinationHubs: string[];
  legsCount: number;
}

export interface SavedPlaceContext {
  id: string;
  nameEn: string;
  nameKn: string;
  districtId: string;
  category: string;
}

export interface GroupContextDomain {
  participantsCount: number;
  members: { id: string; name: string; style: string }[];
  consensusRankings: { destinationId: string; score: number }[];
  accessibilityRequirements: string[];
  totalExpenses: number;
}

export interface WeatherObservationContext {
  destinationId: string;
  temperatureC: number;
  condition: string;
  precipitationProbability: number;
  windSpeedKmh: number;
  freshnessTimestamp: string;
}

export interface IntelligenceContextDomain {
  tripHealthScore: number;
  activeIssuesCount: number;
  issues: { id: string; title: string; severity: string }[];
  replanningProposalsCount: number;
}

export interface GlobalTravelContext {
  timestamp: string;
  currentWorkspace: string;
  language: "en" | "kn";
  traveler: TravelerContextDomain;
  activeTrip: ActiveTripContextDomain | null;
  itinerary: ItineraryContextDomain | null;
  budget: BudgetContextDomain | null;
  routes: RouteContextDomain | null;
  savedPlaces: SavedPlaceContext[];
  discoveries: string[];
  group: GroupContextDomain | null;
  weather: WeatherObservationContext[];
  intelligence: IntelligenceContextDomain | null;
  availability: {
    traveler: boolean;
    activeTrip: boolean;
    itinerary: boolean;
    budget: boolean;
    routes: boolean;
    savedPlaces: boolean;
    discoveries: boolean;
    group: boolean;
    weather: boolean;
    intelligence: boolean;
    workspace: boolean;
  };
}

export interface BuildGlobalContextInputs {
  timestamp?: string;
  userId?: string;
  userName?: string;
  isDemo?: boolean;
  language?: "en" | "kn";
  currentWorkspace?: string;
  tripState?: StoredTripState | null;
  savedPlaceIds?: string[];
  routePlan?: OptimizedRoutePlan | null;
  budgetPlan?: OptimizedBudgetPlan | null;
  groupState?: GroupTripState | null;
  unifiedContext?: UnifiedTripIntelligenceContext | null;
  weatherObservations?: WeatherObservationContext[];
}

/**
 * Builds a normalized, validated GlobalTravelContext from available client and server services.
 */
export function buildGlobalTravelContext(inputs: BuildGlobalContextInputs): GlobalTravelContext {
  const language = inputs.language || "en";
  const currentWorkspace = inputs.currentWorkspace || "/app/dashboard";
  const trip = inputs.tripState || null;

  // 1. Traveler Domain
  const traveler: TravelerContextDomain = {
    userId: inputs.userId,
    name: inputs.userName || (inputs.isDemo ? "Demo Traveler" : undefined),
    isDemo: !!inputs.isDemo,
    language,
  };

  // 2. Active Trip Domain
  let activeTrip: ActiveTripContextDomain | null = null;
  if (trip && trip.preferences) {
    const destIds = trip.preferences.selectedDestinationIds?.length
      ? trip.preferences.selectedDestinationIds
      : trip.editedDays?.map((d) => d.destinationId) || [];

    activeTrip = {
      title: `${trip.preferences.durationDays}-Day Karnataka Journey`,
      startingLocation: trip.preferences.startingLocation || "Bengaluru",
      durationDays: trip.preferences.durationDays,
      pacing: trip.preferences.travelStyle,
      budgetTier: trip.preferences.budget,
      travelStyle: trip.preferences.travelStyle,
      transport: trip.preferences.transport,
      groupType: trip.preferences.groupType,
      travellerCount: trip.preferences.travellerCount,
      destinationIds: destIds,
      savedAt: trip.savedAt,
      syncState: trip.syncState || "synced",
    };
  }

  // 3. Itinerary Domain
  let itinerary: ItineraryContextDomain | null = null;
  if (trip && Array.isArray(trip.editedDays) && trip.editedDays.length > 0) {
    const stops: ItineraryStopContext[] = [];
    let totalStops = 0;
    const completedSet = new Set(trip.completedStopKeys || []);

    trip.editedDays.forEach((day, dIdx) => {
      const dayNum = day.dayNumber || dIdx + 1;
      day.stops.forEach((stop, sIdx) => {
        totalStops++;
        const stopKey = `${dayNum}-${sIdx}`;
        stops.push({
          dayNumber: dayNum,
          timeOfDay: stop.timeOfDay,
          title: stop.title,
          destinationName: stop.destinationName,
          district: stop.district,
          activityType: stop.activityType,
          isCompleted: completedSet.has(stopKey),
          notes: trip.stopNotes?.[stopKey] || undefined,
        });
      });
    });

    const completedStopsCount = stops.filter((s) => s.isCompleted).length;
    const progressPercent = totalStops > 0 ? Math.round((completedStopsCount / totalStops) * 100) : 0;

    itinerary = {
      daysCount: trip.editedDays.length,
      totalStops,
      completedStopsCount,
      progressPercent,
      stops: stops.slice(0, 15), // keep compact for AI tokens
    };
  }

  // 4. Budget Domain
  let budget: BudgetContextDomain | null = null;
  if (inputs.budgetPlan) {
    const activeKey = inputs.budgetPlan.activeScenario || "balanced";
    const activeScen = inputs.budgetPlan.scenarios[activeKey] || inputs.budgetPlan.scenarios.balanced;
    if (activeScen) {
      budget = {
        targetBudget: inputs.budgetPlan.targetBudget,
        estimatedTotalCost: activeScen.totalCost,
        perPersonCost: activeScen.perPersonCost,
        scenarioKey: activeKey,
        categories: (activeScen.categories || []).map((c) => ({
          key: c.key,
          labelEn: c.labelEn,
          labelKn: c.labelKn,
          estimatedCost: c.estimatedCost,
          percentage: c.percentageOfTotal,
        })),
      };
    }
  }

  // 5. Route Domain
  let routes: RouteContextDomain | null = null;
  if (inputs.routePlan) {
    const hubs = Array.from(new Set((inputs.routePlan.dailyRoutes || []).map((d) => d.destinationName)));
    routes = {
      startingLocation: inputs.routePlan.startingLocation,
      totalDistanceKm: inputs.routePlan.totalEstimatedDistanceKm,
      totalDurationHours: inputs.routePlan.totalEstimatedTransitHours,
      destinationHubs: hubs,
      legsCount: (inputs.routePlan.dailyRoutes || []).reduce((acc, r) => acc + (r.legs?.length || 0), 0),
    };
  }

  // 6. Saved Places Domain
  const savedPlaces: SavedPlaceContext[] = [];
  if (Array.isArray(inputs.savedPlaceIds) && inputs.savedPlaceIds.length > 0) {
    const placeSet = new Set(inputs.savedPlaceIds);
    SECULAR_ATTRACTIONS.filter((a) => placeSet.has(a.id)).slice(0, 10).forEach((a) => {
      savedPlaces.push({
        id: a.id,
        nameEn: a.nameEn,
        nameKn: a.nameKn,
        districtId: a.districtId,
        category: a.category,
      });
    });
  }

  // 7. Group Domain
  let group: GroupContextDomain | null = null;
  if (inputs.groupState && inputs.groupState.config?.travellers?.length > 0) {
    const travellers = inputs.groupState.config.travellers;
    group = {
      participantsCount: travellers.length,
      members: travellers.map((p) => ({
        id: p.id,
        name: p.name,
        style: p.preferredPace,
      })),
      consensusRankings: Object.entries(inputs.groupState.decisions || {}).slice(0, 5).map(([destId, status]) => ({
        destinationId: destId,
        score: status === "accepted" ? 100 : status === "optional" ? 50 : 0,
      })),
      accessibilityRequirements: travellers.flatMap((p) => p.accessibilityRequirements || []),
      totalExpenses: inputs.groupState.expenses?.reduce((sum, e) => sum + (e.amountInr || 0), 0) || 0,
    };
  }

  // 8. Intelligence Domain
  let intelligence: IntelligenceContextDomain | null = null;
  if (inputs.unifiedContext) {
    const health = inputs.unifiedContext.adaptive.health;
    const healthScore = Math.max(0, 100 - (health.criticalCount * 25 + health.warningCount * 10));
    intelligence = {
      tripHealthScore: healthScore,
      activeIssuesCount: inputs.unifiedContext.adaptive.detectedIssuesCount || inputs.unifiedContext.adaptive.issues.length,
      issues: (inputs.unifiedContext.adaptive.issues || []).slice(0, 5).map((iss) => ({
        id: iss.id,
        title: iss.titleEn,
        severity: iss.severity,
      })),
      replanningProposalsCount: inputs.unifiedContext.adaptive.recommendationsCount || 0,
    };
  }

  return {
    timestamp: inputs.timestamp || "2026-11-03T00:00:00.000Z",
    currentWorkspace,
    language,
    traveler,
    activeTrip,
    itinerary,
    budget,
    routes,
    savedPlaces,
    discoveries: inputs.tripState?.savedGemIds || [],
    group,
    weather: inputs.weatherObservations || [],
    intelligence,
    availability: {
      traveler: true,
      activeTrip: !!activeTrip,
      itinerary: !!itinerary,
      budget: !!budget,
      routes: !!routes,
      savedPlaces: savedPlaces.length > 0,
      discoveries: (inputs.tripState?.savedGemIds?.length || 0) > 0,
      group: !!group,
      weather: (inputs.weatherObservations?.length || 0) > 0,
      intelligence: !!intelligence,
      workspace: true,
    },
  };
}

/**
 * Formats a GlobalTravelContext into a concise, token-efficient system briefing.
 */
export function formatGlobalContextForPrompt(ctx: GlobalTravelContext, language: "en" | "kn" = ctx.language || "en"): string {
  const isKn = language === "kn";
  const sections: string[] = [];

  sections.push(`[Active Screen: ${ctx.currentWorkspace}] (User Language: ${ctx.language})`);

  if (ctx.activeTrip) {
    sections.push(
      `Trip: ${ctx.activeTrip.title} (${ctx.activeTrip.durationDays} Days, Origin: ${ctx.activeTrip.startingLocation}, Style: ${ctx.activeTrip.travelStyle}, Transport: ${ctx.activeTrip.transport}, Group: ${ctx.activeTrip.groupType})`
    );
  } else {
    sections.push(`Trip: No active journey configured. Guide traveler to /app/planner or starter blueprints.`);
  }

  if (ctx.itinerary) {
    sections.push(
      `Itinerary Progress: ${ctx.itinerary.completedStopsCount}/${ctx.itinerary.totalStops} stops completed (${ctx.itinerary.progressPercent}%).`
    );
    const stopsSummary = ctx.itinerary.stops
      .slice(0, 8)
      .map((s) => `Day ${s.dayNumber} [${s.timeOfDay}]: ${s.title} (${s.district})${s.isCompleted ? " ✓" : ""}`)
      .join(" | ");
    sections.push(`Key Stops: ${stopsSummary}`);
  }

  if (ctx.budget) {
    sections.push(
      `Budget: Total ₹${ctx.budget.estimatedTotalCost.toLocaleString("en-IN")} (${ctx.budget.scenarioKey} scenario, ₹${ctx.budget.perPersonCost.toLocaleString("en-IN")}/person).`
    );
  }

  if (ctx.routes) {
    sections.push(
      `Routes: ${ctx.routes.totalDistanceKm} km estimated across ${ctx.routes.legsCount} transit legs (~${ctx.routes.totalDurationHours} hrs driving).`
    );
  }

  if (ctx.savedPlaces.length > 0) {
    const savedNames = ctx.savedPlaces.map((p) => (isKn ? p.nameKn : p.nameEn)).join(", ");
    sections.push(`Saved Places (${ctx.savedPlaces.length}): ${savedNames}`);
  }

  if (ctx.group) {
    sections.push(
      `Group: ${ctx.group.participantsCount} travelers. Total logged expenses: ₹${ctx.group.totalExpenses.toLocaleString("en-IN")}.`
    );
  }

  if (ctx.intelligence) {
    sections.push(
      `Trip Health: ${ctx.intelligence.tripHealthScore}/100 with ${ctx.intelligence.activeIssuesCount} issues and ${ctx.intelligence.replanningProposalsCount} active replanning proposals.`
    );
  }

  return sections.join("\n");
}
