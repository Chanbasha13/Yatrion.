import type {
  DailyRoute,
  RouteFeasibilityWarning,
  AlternativeRouteSuggestion,
  TravelIntensity,
} from "./route-types";
import type { TravelStyle, TransportPreference } from "../planner-types";
import { calculateHaversineDistanceKm } from "./route-estimates";

/**
 * Analyzes an entire multi-day route and returns feasibility warnings,
 * travel intensity score, and constructive alternatives.
 */
export function analyzeRouteFeasibility(
  dailyRoutes: DailyRoute[],
  travelStyle: TravelStyle,
  transport: TransportPreference,
  startingLocation: string = "Bengaluru"
): {
  warnings: RouteFeasibilityWarning[];
  intensity: TravelIntensity;
  intensityReasonEn: string;
  intensityReasonKn: string;
  alternatives: AlternativeRouteSuggestion[];
} {
  const warnings: RouteFeasibilityWarning[] = [];
  const alternatives: AlternativeRouteSuggestion[] = [];

  let totalTransitMinutes = 0;
  let totalStopsCount = 0;
  let hasGhatNightTransit = false;
  let maxDailyDistanceKm = 0;

  for (const day of dailyRoutes) {
    totalTransitMinutes += day.totalTravelTimeMinutes;
    totalStopsCount += day.stops.length;
    if (day.totalDistanceKm > maxDailyDistanceKm) {
      maxDailyDistanceKm = day.totalDistanceKm;
    }

    // ── 1. DAILY OVERCROWDING CHECK (BASED ON TRAVEL STYLE) ──
    const maxStopsAllowed =
      travelStyle === "relaxed" ? 2 : travelStyle === "balanced" ? 3 : 4;

    if (day.stops.length > maxStopsAllowed) {
      warnings.push({
        id: `warn-overcrowd-day-${day.dayNumber}`,
        type: "overcrowded",
        severity: "warning",
        titleEn: `Day ${day.dayNumber}: Dense Activity Schedule`,
        titleKn: `ದಿನ ${day.dayNumber}: ಅತಿಯಾದ ಚಟುವಟಿಕೆಗಳ ವೇಳಾಪಟ್ಟಿ`,
        messageEn: `Day ${day.dayNumber} has ${day.stops.length} planned stops, which exceeds your '${travelStyle}' pace recommendation of ${maxStopsAllowed} stops. Consider dropping 1 activity to allow unhurried exploration.`,
        messageKn: `ದಿನ ${day.dayNumber} ರಲ್ಲಿ ${day.stops.length} ಚಟುವಟಿಕೆಗಳಿವೆ; ನಿಮ್ಮ '${travelStyle}' ಶೈಲಿಗೆ ಗರಿಷ್ಠ ${maxStopsAllowed} ತಾಣಗಳು ಸೂಕ್ತ. ಆರಾಮದಾಯಕ ಪ್ರವಾಸಕ್ಕಾಗಿ 1 ಚಟುವಟಿಕೆ ಕಡಿಮೆ ಮಾಡುವುದನ್ನು ಪರಿಗಣಿಸಿ.`,
        dayNumber: day.dayNumber,
      });

      if (!alternatives.some((a) => a.id === "alt-pace-adjust")) {
        alternatives.push({
          id: "alt-pace-adjust",
          titleEn: "Rebalance Day Schedule to Relaxed Pace",
          titleKn: "ದಿನದ ವೇಳಾಪಟ್ಟಿಯನ್ನು ಸರಳಗೊಳಿಸಿ",
          descriptionEn: "Limit daily activities to 2 flagship sights and dedicate afternoons to culinary trails or cultural rest.",
          descriptionKn: "ದಿನಕ್ಕೆ 2 ಪ್ರಮುಖ ತಾಣಗಳಿಗೆ ಸೀಮಿತಗೊಳಿಸಿ ಉಳಿದ ಸಮಯವನ್ನು ವಿಶ್ರಾಂತಿ ಅಥವಾ ಸ್ಥಳೀಯ ಆಹಾರಕ್ಕೆ ಮೀಸಲಿಡಿ.",
          benefitEn: "Saves ~1.5 hours of transit and prevents traveler fatigue.",
          benefitKn: "~1.5 ಗಂಟೆಗಳ ಪ್ರಯಾಣ ಸಮಯ ಉಳಿತಾಯ ಮತ್ತು ಸುಸ್ತಾಗುವುದನ್ನು ತಪ್ಪಿಸುತ್ತದೆ.",
          suggestedPace: "relaxed",
        });
      }
    }

    // ── 2. EXCESSIVE TRANSIT TIME CHECK ──
    const maxDailyTransitAllowed =
      travelStyle === "relaxed" ? 120 : travelStyle === "balanced" ? 180 : 240;

    if (day.totalTravelTimeMinutes > maxDailyTransitAllowed) {
      warnings.push({
        id: `warn-transit-day-${day.dayNumber}`,
        type: "excessive_travel",
        severity: "caution",
        titleEn: `Day ${day.dayNumber}: Heavy Transit Hours (~${Math.round(day.totalTravelTimeMinutes / 60)} hrs)`,
        titleKn: `ದಿನ ${day.dayNumber}: ದೀರ್ಘ ಪ್ರಯಾಣದ ಸಮಯ (~${Math.round(day.totalTravelTimeMinutes / 60)} ಗಂಟೆ)`,
        messageEn: `Estimated transit time between stops on Day ${day.dayNumber} is ${day.totalTravelTimeMinutes} mins (~${day.totalDistanceKm} km est.). This leaves limited daylight for sightseeing.`,
        messageKn: `ದಿನ ${day.dayNumber} ರ ಪ್ರವಾಸಕ್ಕೆ ${day.totalTravelTimeMinutes} ನಿಮಿಷಗಳ ಪ್ರಯಾಣ ಬೇಕಾಗುತ್ತದೆ (~${day.totalDistanceKm} ಕಿ.ಮೀ ಅಂದಾಜು). ಇದು ವೀಕ್ಷಣೆಗೆ ಕಡಿಮೆ ಸಮಯ ನೀಡುತ್ತದೆ.`,
        dayNumber: day.dayNumber,
      });
    }

    // ── 3. BACKTRACKING DETECTION (TRIANGLE INEQUALITY & ZIGZAG) ──
    if (day.stops.length >= 3) {
      for (let i = 0; i < day.stops.length - 2; i++) {
        const s1 = day.stops[i];
        const s2 = day.stops[i + 1];
        const s3 = day.stops[i + 2];

        const d12 = calculateHaversineDistanceKm(s1.coordinates, s2.coordinates);
        const d23 = calculateHaversineDistanceKm(s2.coordinates, s3.coordinates);
        const d13 = calculateHaversineDistanceKm(s1.coordinates, s3.coordinates);

        // If visiting S2 takes a detour where direct S1->S3 is much shorter and S2 is far off
        if (d12 + d23 > 2.2 * d13 && d12 > 15 && d23 > 15) {
          warnings.push({
            id: `warn-backtrack-day-${day.dayNumber}-${i}`,
            type: "backtracking",
            severity: "info",
            titleEn: `Day ${day.dayNumber}: Noticeable Route Detour`,
            titleKn: `ದಿನ ${day.dayNumber}: ಮಾರ್ಗದಲ್ಲಿ ಅನಗತ್ಯ ಸುತ್ತುಬಳಸು`,
            messageEn: `Transit from '${s1.title}' to '${s2.title}' and back towards '${s3.title}' adds ~${Math.round(d12 + d23 - d13)} km extra detour. Reordering these stops can streamline transit.`,
            messageKn: `'${s1.title}' ನಿಂದ '${s2.title}' ಮತ್ತು ನಂತರ '${s3.title}' ಗೆ ಸಾಗುವುದರಿಂದ ~${Math.round(d12 + d23 - d13)} ಕಿ.ಮೀ ಹೆಚ್ಚುವರಿ ಸುತ್ತಾಗುತ್ತದೆ. ಇವುಗಳ ಕ್ರಮ ಬದಲಾಯಿಸುವುದು ಸೂಕ್ತ.`,
            dayNumber: day.dayNumber,
          });

          if (!alternatives.some((a) => a.id === `alt-reorder-day-${day.dayNumber}`)) {
            alternatives.push({
              id: `alt-reorder-day-${day.dayNumber}`,
              titleEn: `Optimize Visit Sequence for Day ${day.dayNumber}`,
              titleKn: `ದಿನ ${day.dayNumber} ರ ತಾಣಗಳ ಕ್ರಮ ಬದಲಾವಣೆ`,
              descriptionEn: `Group geographically adjacent sights together (e.g., '${s1.title}' directly with '${s3.title}') before heading towards '${s2.title}'.`,
              descriptionKn: `ಭೌಗೋಳಿಕವಾಗಿ ಹತ್ತಿರವಿರುವ ತಾಣಗಳನ್ನು ಒಟ್ಟಿಗೆ ವೀಕ್ಷಿಸಿ ಅನಗತ್ಯ ಪ್ರಯಾಣ ತಪ್ಪಿಸಿ.`,
              benefitEn: "Reduces road transit by ~25–35 minutes.",
              benefitKn: "ಸುಮಾರು 25-35 ನಿಮಿಷಗಳ ರಸ್ತೆ ಪ್ರಯಾಣ ಉಳಿತಾಯವಾಗುತ್ತದೆ.",
            });
          }
        }
      }
    }

    // ── 4. TEMPLE CLOSURE HOURS CONFLICT ──
    for (const stop of day.stops) {
      const isTemple =
        stop.title.toLowerCase().includes("temple") ||
        stop.title.toLowerCase().includes("matha") ||
        stop.title.toLowerCase().includes("ದೇವಾಲಯ") ||
        stop.title.toLowerCase().includes("ಮಠ");

      if (isTemple && stop.timeOfDay === "afternoon") {
        warnings.push({
          id: `warn-temple-noon-${stop.id}`,
          type: "timing_conflict",
          severity: "info",
          titleEn: `Afternoon Temple Closure Advisory: ${stop.title}`,
          titleKn: `ಮಧ್ಯಾಹ್ನದ ದೇವಾಲಯ ಬಾಗಿಲು ಮುಚ್ಚುವ ಸಮಯ: ${stop.title}`,
          messageEn: `Major Karnataka shrines observe sanctum closure between 12:30 PM and 4:30 PM for rituals. Plan arrival before 12:00 PM or after 4:30 PM.`,
          messageKn: `ಕರ್ನಾಟಕದ ಪ್ರಮುಖ ದೇವಾಲಯಗಳಲ್ಲಿ ಮಧ್ಯಾಹ್ನ 12:30 ರಿಂದ 4:30 ರವರೆಗೆ ಗರ್ಭಗುಡಿ ದರ್ಶನ ಇರುವುದಿಲ್ಲ. ಬೆಳಿಗ್ಗೆ 12:00 ಮುಂಚೆ ಅಥವಾ ಸಂಜೆ 4:30 ನಂತರ ಭೇಟಿ ನೀಡಿ.`,
          dayNumber: day.dayNumber,
        });
      }
    }

    // ── 5. GHAT ROAD NIGHT TRANSIT ──
    const hasGhatStop = day.stops.some(
      (s) =>
        s.destinationId === "coorg" ||
        s.destinationId === "chikmagalur" ||
        s.destinationId === "jogfalls" ||
        s.destinationId === "dandeli"
    );
    if (hasGhatStop && day.totalDistanceKm > 100 && transport !== "public") {
      hasGhatNightTransit = true;
    }
  }

  if (hasGhatNightTransit) {
    warnings.push({
      id: "warn-ghat-night",
      type: "terrain_alert",
      severity: "caution",
      titleEn: "Western Ghats Mountain Driving Precaution",
      titleKn: "ಪಶ್ಚಿಮ ಘಟ್ಟಗಳ ರಸ್ತೆ ಸಂಚಾರ ಎಚ್ಚರಿಕೆ",
      messageEn:
        "Routes through Coorg, Chikmagalur, and Shiradi/Charmadi Ghats have fog and sharp hairpins. Plan transit journeys in daylight hours wherever possible.",
      messageKn:
        "ಕೊಡಗು, ಚಿಕ್ಕಮಗಳೂರು ಮತ್ತು ಚಾರ್ಮಾಡಿ/ಶಿರಾಡಿ ಘಾಟ್‌ಗಳಲ್ಲಿ ಮಂಜು ಮತ್ತು ಕಡಿದಾದ ತಿರುವುಗಳಿರುತ್ತವೆ; ಹಗಲಿನ ವೇಳೆಯಲ್ಲಿ ಪ್ರಯಾಣಿಸುವುದು ಸುರಕ್ಷಿತ.",
    });
  }

  // ── 6. CALCULATE OVERALL TRAVEL INTENSITY ──
  const avgStopsPerDay = dailyRoutes.length > 0 ? totalStopsCount / dailyRoutes.length : 0;
  const avgTransitPerDay = dailyRoutes.length > 0 ? totalTransitMinutes / dailyRoutes.length : 0;

  let intensity: TravelIntensity = "balanced";
  let intensityReasonEn = "";
  let intensityReasonKn = "";

  if (avgStopsPerDay <= 2.2 && avgTransitPerDay <= 90 && maxDailyDistanceKm <= 100) {
    intensity = "relaxed";
    intensityReasonEn = "Generous leisure windows, minimal inter-stop driving, and ample time for local cuisine and downtime.";
    intensityReasonKn = "ಧಾರಾಳ ವಿಶ್ರಾಂತಿ ಸಮಯ, ಕಡಿಮೆ ರಸ್ತೆ ಪ್ರಯಾಣ ಮತ್ತು ಸ್ಥಳೀಯ ಆಹಾರ ಸವಿಯಲು ಪ್ರಶಸ್ತ ಸಮಯ.";
  } else if (avgStopsPerDay > 3.2 || avgTransitPerDay > 180 || maxDailyDistanceKm > 200) {
    intensity = "packed";
    intensityReasonEn = "Ambitious pace with early morning starts, multiple stops per day, and significant highway driving.";
    intensityReasonKn = "ಮುಂಜಾನೆ ಬೇಗ ಆರಂಭವಾಗುವ, ದಿನಕ್ಕೆ ಹೆಚ್ಚಿನ ತಾಣಗಳು ಮತ್ತು ದೀರ್ಘ ಪ್ರಯಾಣದ ಚುರುಕಿನ ವೇಳಾಪಟ್ಟಿ.";
  } else {
    intensity = "balanced";
    intensityReasonEn = "Balanced cadence pairing morning and evening exploration with dedicated midday lunch breaks.";
    intensityReasonKn = "ಬೆಳಿಗ್ಗೆ ಮತ್ತು ಸಂಜೆಯ ವೀಕ್ಷಣೆ ಹಾಗೂ ಮಧ್ಯಾಹ್ನದ ವಿಶ್ರಾಂತಿಯನ್ನು ಸಮತೋಲನಗೊಳಿಸಿದ ಮಾದರಿ ಪಥ.";
  }

  // Fallback alternative suggestion if none generated
  if (alternatives.length === 0) {
    alternatives.push({
      id: "alt-leisure-buffer",
      titleEn: `Add Scenic Coffee Break Buffer from ${startingLocation}`,
      titleKn: `${startingLocation} ನಿಂದ ಮಧ್ಯಂತರ ಕಾಫಿ ವಿಶ್ರಾಂತಿ ಸೇರಿಸಿ`,
      descriptionEn: `Insert a 30-minute stop at local highway Darshinis or estate coffee counters along the transit corridor from ${startingLocation}.`,
      descriptionKn: `${startingLocation} ನಿಂದ ಹೆದ್ದಾರಿಯ ಸಾಂಪ್ರದಾಯಿಕ ದರ್ಶಿನಿ ಅಥವಾ ಕಾಫಿ ಕೌಂಟರ್‌ಗಳಲ್ಲಿ 30 ನಿಮಿಷಗಳ ವಿಶ್ರಾಂತಿ ಪಡೆಯಿರಿ.`,
      benefitEn: "Breaks driving fatigue and supports authentic regional snacking.",
      benefitKn: "ಪ್ರಯಾಣದ ಆಯಾಸ ಕಡಿಮೆ ಮಾಡುತ್ತದೆ ಮತ್ತು ಸ್ಥಳೀಯ ತಿಂಡಿ ಸವಿಯಲು ನೆರವಾಗುತ್ತದೆ.",
    });
  }

  return {
    warnings,
    intensity,
    intensityReasonEn,
    intensityReasonKn,
    alternatives,
  };
}
