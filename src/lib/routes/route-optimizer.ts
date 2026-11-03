import type {
  OptimizedRoutePlan,
  DailyRoute,
  RouteStop,
  RouteLeg,
  MealBreak,
  RouteOptimizationOptions,
  AttractionRecord,
  GeoCoordinates,
} from "./route-types";
import { DESTINATIONS } from "../destinations-data";
import {
  KARNATAKA_ATTRACTIONS,
  resolveOriginCoordinates,
  resolveDestinationCoordinates,
  estimateRouteLeg,
  calculateHaversineDistanceKm,
  getGoogleMapsSearchUrl,
} from "./route-estimates";
import { analyzeRouteFeasibility } from "./route-feasibility";

/**
 * Orders a list of destination IDs starting from an origin coordinate
 * using a nearest-neighbor heuristic to minimize inter-city zigzagging.
 */
function orderDestinationsMinimizingTransit(
  destinationIds: string[],
  originCoord: GeoCoordinates
): string[] {
  if (destinationIds.length <= 1) return destinationIds;

  const remaining = [...destinationIds];
  const ordered: string[] = [];
  let currentCoord = originCoord;

  while (remaining.length > 0) {
    let nearestIdx = 0;
    let minDistance = Infinity;

    for (let i = 0; i < remaining.length; i++) {
      const destCoord = resolveDestinationCoordinates(remaining[i]);
      const dist = calculateHaversineDistanceKm(currentCoord, destCoord);
      if (dist < minDistance) {
        minDistance = dist;
        nearestIdx = i;
      }
    }

    const chosen = remaining.splice(nearestIdx, 1)[0];
    ordered.push(chosen);
    currentCoord = resolveDestinationCoordinates(chosen);
  }

  return ordered;
}

/**
 * Orders candidate attractions for a single day to minimize distance
 * while respecting time-of-day preferences (morning, afternoon, evening).
 */
function orderDailyAttractions(
  candidates: AttractionRecord[],
  maxStops: number,
  startCoord: GeoCoordinates,
  previouslyVisitedIds: Set<string> = new Set()
): AttractionRecord[] {
  if (candidates.length === 0) return [];

  // Prefer attractions not yet visited in previous days of the trip
  const unvisited = candidates.filter((c) => !previouslyVisitedIds.has(c.id));
  const pool = unvisited.length > 0 ? unvisited : candidates;

  // Group by optimal time of day from pool
  const mornings = pool.filter((a) => a.optimalTimeOfDay === "morning");
  const afternoons = pool.filter((a) => a.optimalTimeOfDay === "afternoon");
  const evenings = pool.filter((a) => a.optimalTimeOfDay === "evening");
  const anytimes = pool.filter(
    (a) => a.optimalTimeOfDay === "any" || !a.optimalTimeOfDay
  );

  const selected: AttractionRecord[] = [];

  // Pick best morning stop (nearest to startCoord if possible)
  if (mornings.length > 0) {
    mornings.sort(
      (a, b) =>
        calculateHaversineDistanceKm(startCoord, a.coordinates) -
        calculateHaversineDistanceKm(startCoord, b.coordinates)
    );
    selected.push(mornings[0]);
  } else if (anytimes.length > 0) {
    selected.push(anytimes.shift()!);
  }

  // Pick afternoon stop (nearest to morning stop)
  const prevCoord = selected.length > 0 ? selected[0].coordinates : startCoord;
  if (afternoons.length > 0) {
    afternoons.sort(
      (a, b) =>
        calculateHaversineDistanceKm(prevCoord, a.coordinates) -
        calculateHaversineDistanceKm(prevCoord, b.coordinates)
    );
    selected.push(afternoons[0]);
  } else if (anytimes.length > 0 && selected.length < maxStops) {
    selected.push(anytimes.shift()!);
  }

  // Pick evening stop (nearest to previous stop)
  const prevCoord2 =
    selected.length > 0 ? selected[selected.length - 1].coordinates : startCoord;
  if (evenings.length > 0 && selected.length < maxStops) {
    evenings.sort(
      (a, b) =>
        calculateHaversineDistanceKm(prevCoord2, a.coordinates) -
        calculateHaversineDistanceKm(prevCoord2, b.coordinates)
    );
    selected.push(evenings[0]);
  } else if (anytimes.length > 0 && selected.length < maxStops) {
    selected.push(anytimes.shift()!);
  }

  // If still room and unvisited remain in pool
  const remainingInPool = pool.filter(
    (c) => !selected.some((s) => s.id === c.id)
  );
  while (selected.length < maxStops && remainingInPool.length > 0) {
    const lastCoord = selected[selected.length - 1]?.coordinates || startCoord;
    remainingInPool.sort(
      (a, b) =>
        calculateHaversineDistanceKm(lastCoord, a.coordinates) -
        calculateHaversineDistanceKm(lastCoord, b.coordinates)
    );
    selected.push(remainingInPool.shift()!);
  }

  // If still room and overall candidates remain
  const remainingOverall = candidates.filter(
    (c) => !selected.some((s) => s.id === c.id)
  );
  while (selected.length < maxStops && remainingOverall.length > 0) {
    const lastCoord = selected[selected.length - 1]?.coordinates || startCoord;
    remainingOverall.sort(
      (a, b) =>
        calculateHaversineDistanceKm(lastCoord, a.coordinates) -
        calculateHaversineDistanceKm(lastCoord, b.coordinates)
    );
    selected.push(remainingOverall.shift()!);
  }

  return selected.slice(0, maxStops);
}

/**
 * Standard meal breaks scheduled into the route
 */
function generateDailyMealBreaks(
  destinationName: string,
  destinationKannada: string,
  timeOfDayStops: { morning?: boolean; afternoon?: boolean; evening?: boolean }
): MealBreak[] {
  const meals: MealBreak[] = [];

  if (timeOfDayStops.morning) {
    meals.push({
      timeOfDay: "morning",
      titleEn: "Authentic Karnataka Breakfast",
      titleKn: "ಸಾಂಪ್ರದಾಯಿಕ ಕರ್ನಾಟಕ ಬೆಳಗಿನ ಉಪಹಾರ",
      durationMinutes: 40,
      recommendationEn: `Hot idli-vada, crisp benne dosa, and freshly brewed filter coffee in ${destinationName}.`,
      recommendationKn: `${destinationKannada} ದಲ್ಲಿ ಬಿಸಿಬಿಸಿ ಇಡ್ಲಿ-ವಡೆ, ಬೆಣ್ಣೆ ದೋಸೆ ಮತ್ತು ಘಮಘಮಿಸುವ ಫಿಲ್ಟರ್ ಕಾಫಿ.`,
    });
  }

  if (timeOfDayStops.afternoon) {
    meals.push({
      timeOfDay: "afternoon",
      titleEn: "Regional Lunch & Midday Rest",
      titleKn: "ಪ್ರಾದೇಶಿಕ ಮಧ್ಯಾಹ್ನದ ಊಟ ಮತ್ತು ವಿಶ್ರಾಂತಿ",
      durationMinutes: 50,
      recommendationEn: `Traditional thali or local specialty at family-run mess/Khanavali. Avoid midday heat.`,
      recommendationKn: `ಸಾಂಪ್ರದಾಯಿಕ ಬಾಳೆಎಲೆ ಊಟ ಅಥವಾ ಖಾನಾವಳಿ ಊಟ. ಮಧ್ಯಾಹ್ನದ ಬಿಸಿಲಿನಲ್ಲಿ ವಿಶ್ರಾಂತಿ ಪಡೆಯಿರಿ.`,
    });
  }

  if (timeOfDayStops.evening) {
    meals.push({
      timeOfDay: "evening",
      titleEn: "Dusk Tea & Evening Dining",
      titleKn: "ಸಂಜೆಯ ಚಹಾ ಮತ್ತು ಊಟ",
      durationMinutes: 45,
      recommendationEn: `Evening filter coffee with Maddur vada or regional street snacks, followed by dinner.`,
      recommendationKn: `ಸಂಜೆಯ ಫಿಲ್ಟರ್ ಕಾಫಿ, ಮದ್ದೂರು ವಡೆ ಹಾಗೂ ಸ್ಥಳೀಯ ತಿನಿಸುಗಳು.`,
    });
  }

  return meals;
}

/**
 * Core Smart Route Optimization Engine for Karnataka.
 * Accepts user preferences, clusters attractions, minimizes backtracking,
 * computes road topography estimates, and validates feasibility.
 */
export function optimizeKarnatakaRoute(
  options: RouteOptimizationOptions
): OptimizedRoutePlan {
  const startingLocation = options.startingLocation?.trim() || "Bengaluru";
  const startCoordinates = resolveOriginCoordinates(startingLocation);
  const durationDays = options.durationDays || 3;
  const travelStyle = options.travelStyle || "balanced";
  const transport = options.transport || "self-drive";

  // If no destinations selected, provide a sensible default circuit
  let destinationIds = options.destinationIds && options.destinationIds.length > 0
    ? options.destinationIds
    : ["hampi", "mysuru"];

  // Filter to known destinations only
  destinationIds = destinationIds.filter((id) =>
    DESTINATIONS.some((d) => d.id === id)
  );
  if (destinationIds.length === 0) {
    destinationIds = ["hampi", "mysuru"];
  }

  // 1. Order destinations geographically from origin
  const orderedDestIds = orderDestinationsMinimizingTransit(
    destinationIds,
    startCoordinates
  );

  const destCount = orderedDestIds.length;
  const dailyRoutes: DailyRoute[] = [];

  let totalEstimatedDistanceKm = 0;
  let totalEstimatedTransitHours = 0;
  let totalStopsCount = 0;

  // Max stops per day according to travel pace
  const maxStopsPerDay =
    travelStyle === "relaxed" ? 2 : travelStyle === "balanced" ? 3 : 4;

  const visitedAttractionIds = new Set<string>();

  // 2. Build each day's route
  for (let dayNumber = 1; dayNumber <= durationDays; dayNumber++) {
    // Determine active destination for this day
    const assignedDestIdx = Math.min(
      Math.floor(((dayNumber - 1) / durationDays) * destCount),
      destCount - 1
    );
    const destId = orderedDestIds[assignedDestIdx];
    const destination = DESTINATIONS.find((d) => d.id === destId)!;

    // Available attractions for this destination
    const allAttractions = KARNATAKA_ATTRACTIONS.filter(
      (a) => a.destinationId === destId
    );

    // If destination has no specific attractions in registry, synthesize from highlights
    const candidateAttractions: AttractionRecord[] =
      allAttractions.length > 0
        ? allAttractions
        : destination.highlights.map((h, hIdx) => ({
            id: `${destId}-synth-${hIdx}`,
            name: h,
            kannadaName: h,
            destinationId: destId,
            destinationName: destination.name,
            destinationKannada: destination.kannadaName,
            coordinates: resolveDestinationCoordinates(destId),
            category: "heritage",
            typicalDurationMinutes: 90,
            optimalTimeOfDay: hIdx === 0 ? "morning" : hIdx === 1 ? "afternoon" : "evening",
            descriptionEn: `Explore ${h} in ${destination.name}.`,
            descriptionKn: `${destination.kannadaName} ದಲ್ಲಿ ${h} ವೀಕ್ಷಿಸಿ.`,
          }));

    // Days spent at this destination
    const daysAtThisDest = Math.max(1, Math.round(durationDays / destCount));
    const dayOffset = (dayNumber - 1) % daysAtThisDest;

    // Shift attractions so multi-day stays see different attractions each day
    const startIndex = (dayOffset * maxStopsPerDay) % candidateAttractions.length;
    const rotated = [
      ...candidateAttractions.slice(startIndex),
      ...candidateAttractions.slice(0, startIndex),
    ];

    const currentOriginCoord =
      dayNumber === 1
        ? startCoordinates
        : resolveDestinationCoordinates(destId);

    // Order attractions to minimize travel and align with time-of-day
    const orderedStops = orderDailyAttractions(
      rotated,
      maxStopsPerDay,
      currentOriginCoord,
      visitedAttractionIds
    );
    orderedStops.forEach((s) => visitedAttractionIds.add(s.id));

    // Convert to RouteStop instances
    const routeStops: RouteStop[] = orderedStops.map((attraction, sIdx) => {
      const timeOfDay: "morning" | "afternoon" | "evening" =
        sIdx === 0 ? "morning" : sIdx === 1 ? "afternoon" : "evening";

      return {
        id: `stop-${dayNumber}-${sIdx + 1}`,
        sequenceNumber: sIdx + 1,
        attractionId: attraction.id,
        title: attraction.name,
        titleKn: attraction.kannadaName,
        destinationId: destId,
        destinationName: destination.name,
        destinationKannada: destination.kannadaName,
        timeOfDay,
        coordinates: attraction.coordinates,
        estimatedDurationMinutes: attraction.typicalDurationMinutes,
        activityType: attraction.category,
        descriptionEn: attraction.descriptionEn,
        descriptionKn: attraction.descriptionKn,
        mealOrRestNoteEn: attraction.timingNoteEn,
        mealOrRestNoteKn: attraction.timingNoteKn,
        googleMapsSearchUrl: getGoogleMapsSearchUrl(
          attraction.name,
          destination.name,
          attraction.coordinates
        ),
      };
    });

    // Compute route legs between consecutive stops
    const legs: RouteLeg[] = [];
    let dayDistanceKm = 0;
    let dayTravelTimeMins = 0;

    for (let i = 0; i < routeStops.length - 1; i++) {
      const from = routeStops[i];
      const to = routeStops[i + 1];

      const leg = estimateRouteLeg(
        from.id,
        from.title,
        from.coordinates,
        to.id,
        to.title,
        to.coordinates,
        transport,
        destId
      );

      legs.push(leg);
      dayDistanceKm += leg.estimatedRoadDistanceKm;
      dayTravelTimeMins += leg.estimatedDurationMinutes;
    }

    // Include arrival inter-city leg on Day 1
    if (dayNumber === 1 && routeStops.length > 0) {
      const arrivalLeg = estimateRouteLeg(
        "start-origin",
        `Depart ${startingLocation}`,
        startCoordinates,
        routeStops[0].id,
        routeStops[0].title,
        routeStops[0].coordinates,
        transport,
        destId
      );
      dayDistanceKm += arrivalLeg.estimatedRoadDistanceKm;
      dayTravelTimeMins += arrivalLeg.estimatedDurationMinutes;
      // Prepend arrival transit leg
      legs.unshift(arrivalLeg);
    }

    const dayActivityMins = routeStops.reduce(
      (sum, s) => sum + s.estimatedDurationMinutes,
      0
    );

    const mealBreaks = generateDailyMealBreaks(
      destination.name,
      destination.kannadaName,
      {
        morning: routeStops.some((s) => s.timeOfDay === "morning"),
        afternoon: routeStops.some((s) => s.timeOfDay === "afternoon"),
        evening: routeStops.some((s) => s.timeOfDay === "evening"),
      }
    );

    // Date calculation if departure date was provided
    let dateLabel: string | undefined = undefined;
    if (options.departureDate) {
      try {
        const [y, m, d] = options.departureDate.split("-").map(Number);
        const dt = new Date(y, m - 1, d + (dayNumber - 1));
        dateLabel = dt.toLocaleDateString("en-IN", {
          weekday: "short",
          month: "short",
          day: "numeric",
        });
      } catch {
        // Fallback without crash
      }
    }

    const themeEn =
      dayNumber === 1
        ? `Arrival from ${startingLocation} & ${destination.name} Highlights`
        : dayNumber === durationDays
        ? `Final Trail in ${destination.name} & Return`
        : `Exploration of ${destination.name} (${destination.region})`;

    const themeKn =
      dayNumber === 1
        ? `${startingLocation} ನಿಂದ ಆಗಮನ ಮತ್ತು ${destination.kannadaName} ವೀಕ್ಷಣೆ`
        : dayNumber === durationDays
        ? `${destination.kannadaName} ಅಂತಿಮ ಪಥ ಮತ್ತು ಮರಳಿ ಪ್ರಯಾಣ`
        : `${destination.kannadaName} (${destination.region}) ಅನ್ವೇಷಣೆ`;

    dailyRoutes.push({
      dayNumber,
      dateLabel,
      destinationId: destId,
      destinationName: destination.name,
      destinationKannada: destination.kannadaName,
      themeEn,
      themeKn,
      stops: routeStops,
      legs,
      totalDistanceKm: Math.round(dayDistanceKm * 10) / 10,
      totalTravelTimeMinutes: dayTravelTimeMins,
      totalActivityTimeMinutes: dayActivityMins,
      mealBreaks,
    });

    totalEstimatedDistanceKm += dayDistanceKm;
    totalEstimatedTransitHours += dayTravelTimeMins / 60;
    totalStopsCount += routeStops.length;
  }

  // 3. Analyze route feasibility, pacing warnings, and alternative suggestions
  const {
    warnings,
    intensity,
    intensityReasonEn,
    intensityReasonKn,
    alternatives,
  } = analyzeRouteFeasibility(
    dailyRoutes,
    travelStyle,
    transport,
    startingLocation
  );

  // Synthesize titles
  const destNamesEn = orderedDestIds
    .map((id) => DESTINATIONS.find((d) => d.id === id)?.name || id)
    .join(" → ");
  const destNamesKn = orderedDestIds
    .map((id) => DESTINATIONS.find((d) => d.id === id)?.kannadaName || id)
    .join(" → ");

  const title = `${startingLocation} to ${destNamesEn} Optimized Trail`;
  const kannadaSubtitle = `${startingLocation} ನಿಂದ ${destNamesKn} ಅತ್ಯುತ್ತಮ ಮಾರ್ಗ ಪಥ`;

  return {
    id: `route-${Date.now().toString(36)}`,
    title,
    kannadaSubtitle,
    startingLocation,
    startCoordinates,
    travelStyle,
    transport,
    intensity,
    intensityReasonEn,
    intensityReasonKn,
    totalEstimatedDistanceKm: Math.round(totalEstimatedDistanceKm * 10) / 10,
    totalEstimatedTransitHours:
      Math.round(totalEstimatedTransitHours * 10) / 10,
    totalStopsCount,
    dailyRoutes,
    feasibilityWarnings: warnings,
    alternativeSuggestions: alternatives,
    generatedAt: new Date().toISOString(),
    isFallback: options.destinationIds?.length === 0,
  };
}
