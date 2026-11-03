import type { TripInterest } from "../planner-types";
import type {
  TravellerProfile,
  GroupSharedInterest,
  GroupInterestConflict,
  AccessibilityRequirement,
  TravelPace,
} from "./group-types";

/* =========================================================================
   1. INTEREST LABELS & METADATA
   ========================================================================= */

export const TRIP_INTEREST_LABELS: Record<
  TripInterest,
  { en: string; kn: string }
> = {
  heritage: { en: "Heritage & History", kn: "ಪರಂಪರೆ ಮತ್ತು ಇತಿಹಾಸ" },
  nature: { en: "Nature & Waterfalls", kn: "ಪ್ರಕೃತಿ ಮತ್ತು ಜಲಪಾತ" },
  hills: { en: "Hills & Plantations", kn: "ಬೆಟ್ಟ ಮತ್ತು ಕಾಫಿ ತೋಟಗಳು" },
  beaches: { en: "Beaches & Coastal", kn: "ಕರಾವಳಿ ಮತ್ತು ಕಡಲತೀರ" },
  wildlife: { en: "Wildlife & Birding", kn: "ವನ್ಯಜೀವಿ ಮತ್ತು ಪಕ್ಷಿವೀಕ್ಷಣೆ" },
  food: { en: "Regional Food & Flavors", kn: "ಸ್ಥಳೀಯ ಆಹಾರ ಮತ್ತು ರುಚಿ" },
  adventure: { en: "Adventure & Treks", kn: "ಸಾಹಸ ಮತ್ತು ಚಾರಣ" },
  spiritual: { en: "Spiritual & Temples", kn: "ಧಾರ್ಮಿಕ ಮತ್ತು ದೇವಾಲಯ" },
};

/* =========================================================================
   2. SHARED INTERESTS EXTRACTION
   ========================================================================= */

/**
 * Extracts and ranks all interests across travellers by popularity.
 * Strictly adheres to truth: never claims unanimous consensus unless 100% of travellers agree.
 */
export function extractSharedInterests(
  travellers: TravellerProfile[]
): GroupSharedInterest[] {
  if (!travellers || travellers.length === 0) return [];

  const totalTravellers = travellers.length;
  const interestCounts = new Map<
    TripInterest,
    { count: number; travellerNames: string[] }
  >();

  // Count supporters for each interest
  for (const t of travellers) {
    const uniqueInterests = new Set(t.interests);
    for (const interest of uniqueInterests) {
      const current = interestCounts.get(interest) || {
        count: 0,
        travellerNames: [],
      };
      current.count += 1;
      current.travellerNames.push(t.name);
      interestCounts.set(interest, current);
    }
  }

  const results: GroupSharedInterest[] = [];
  for (const [interest, data] of interestCounts.entries()) {
    const percentage = Math.round((data.count / totalTravellers) * 100);
    const isUnanimous = data.count === totalTravellers;
    const isMajority = data.count >= Math.ceil(totalTravellers / 2);
    const labels = TRIP_INTEREST_LABELS[interest] || {
      en: interest,
      kn: interest,
    };

    results.push({
      interest,
      labelEn: labels.en,
      labelKn: labels.kn,
      supporterCount: data.count,
      percentage,
      isUnanimous,
      isMajority,
      travellerNames: data.travellerNames,
    });
  }

  // Sort: highest supporter count first, then highest percentage, then alphabetical
  return results.sort((a, b) => {
    if (b.supporterCount !== a.supporterCount) {
      return b.supporterCount - a.supporterCount;
    }
    return a.interest.localeCompare(b.interest);
  });
}

/* =========================================================================
   3. CONFLICT DETECTION & COMPROMISE GENERATION
   ========================================================================= */

/**
 * Detects classic travel style and activity tensions in Karnataka group travel.
 */
export function detectInterestConflicts(
  travellers: TravellerProfile[]
): GroupInterestConflict[] {
  if (!travellers || travellers.length < 2) return [];

  const conflicts: GroupInterestConflict[] = [];

  // Helper to find travellers with a specific interest
  const getSupporters = (interest: TripInterest): string[] =>
    travellers.filter((t) => t.interests.includes(interest)).map((t) => t.name);

  // Conflict 1: Adventure vs Spiritual / Heritage
  const adventureTravellers = getSupporters("adventure");
  const spiritualTravellers = getSupporters("spiritual");

  if (adventureTravellers.length > 0 && spiritualTravellers.length > 0) {
    conflicts.push({
      id: "conflict-adventure-spiritual",
      interestA: "adventure",
      interestB: "spiritual",
      involvedTravellersA: adventureTravellers,
      involvedTravellersB: spiritualTravellers,
      descriptionEn: `${adventureTravellers.join(", ")} favor rugged physical trails/adventure, while ${spiritualTravellers.join(", ")} prioritize peaceful temple sanctum visits.`,
      descriptionKn: `${adventureTravellers.join(", ")} ಕಡಿದಾದ ಚಾರಣಗಳನ್ನು ಬಯಸಿದರೆ, ${spiritualTravellers.join(", ")} ಶಾಂತಿಯುತ ದೇವಾಲಯ ದರ್ಶನಕ್ಕೆ ಆದ್ಯತೆ ನೀಡುತ್ತಾರೆ.`,
      suggestedCompromiseEn:
        "Visit sacred hilltop shrines with step-free or auto access (e.g., Mahakuta or Hemakuta Hill), allowing adventurous members to explore surrounding boulder trails while others enjoy temple sanctums.",
      suggestedCompromiseKn:
        "ಮೆಟ್ಟಿಲುಗಳಿಲ್ಲದ ಅಥವಾ ಸುಲಭ ರಸ್ತೆ ಇರುವ ಬೆಟ್ಟದ ದೇವಾಲಯಗಳನ್ನು ಆಯ್ಕೆಮಾಡಿ (ಉದಾ: ಮಹಾಕೂಟ ಅಥವಾ ಹೇಮಕೂಟ); ಸಾಹಸಿಗಳು ಬಂಡೆಗಲ್ಲು ಪಥದಲ್ಲಿ ಸಾಗಬಹುದು ಮತ್ತು ಇತರರು ಶಾಂತವಾಗಿ ದರ್ಶನ ಪಡೆಯಬಹುದು.",
    });
  }

  // Conflict 2: Fast-paced Packed vs Relaxed Pace
  const packedTravellers = travellers
    .filter((t) => t.preferredPace === "packed")
    .map((t) => t.name);
  const relaxedPaceTravellers = travellers
    .filter((t) => t.preferredPace === "relaxed")
    .map((t) => t.name);

  if (packedTravellers.length > 0 && relaxedPaceTravellers.length > 0) {
    conflicts.push({
      id: "conflict-pace-mismatch",
      interestA: "adventure",
      interestB: "nature",
      involvedTravellersA: packedTravellers,
      involvedTravellersB: relaxedPaceTravellers,
      descriptionEn: `Pace mismatch: ${packedTravellers.join(", ")} want a packed, multi-stop itinerary, while ${relaxedPaceTravellers.join(", ")} prefer fewer stops with minimal transit.`,
      descriptionKn: `ಪ್ರಯಾಣದ ವೇಗದ ಅಂತರ: ${packedTravellers.join(", ")} ಹೆಚ್ಚು ತಾಣಗಳನ್ನು ನೋಡಲು ಬಯಸಿದರೆ, ${relaxedPaceTravellers.join(", ")} ಕಡಿಮೆ ಪ್ರಯಾಣ ಮತ್ತು ಹೆಚ್ಚಿನ ವಿಶ್ರಾಂತಿ ಬಯಸುತ್ತಾರೆ.`,
      suggestedCompromiseEn:
        "Adopt a hub-and-spoke itinerary based in one central town (e.g., Madikeri or Mysuru); keep afternoons unscripted so enthusiastic members can visit secondary viewpoints without forcing the whole group.",
      suggestedCompromiseKn:
        "ಒಂದೇ ಮುಖ್ಯ ಕೇಂದ್ರದಲ್ಲಿ ತಂಗುವ 'ಹಬ್-ಅಂಡ್-ಸ್ಪೋಕ್' ಮಾದರಿ ಅನುಸರಿಸಿ; ಮಧ್ಯಾಹ್ನದ ನಂತರ ಆಸಕ್ತರು ಹೆಚ್ಚುವರಿ ತಾಣಗಳನ್ನು ನೋಡಬಹುದು ಮತ್ತು ಉಳಿದವರು ತಂಗುದಾಣದಲ್ಲಿ ವಿಶ್ರಮಿಸಬಹುದು.",
    });
  }

  // Conflict 3: Jain/Strict Veg vs Non-Veg
  const jainTravellers = travellers
    .filter((t) => t.foodPreference === "jain" || t.foodPreference === "veg")
    .map((t) => t.name);
  const nonVegTravellers = travellers
    .filter((t) => t.foodPreference === "non-veg")
    .map((t) => t.name);

  if (
    travellers.some((t) => t.foodPreference === "jain") &&
    nonVegTravellers.length > 0
  ) {
    conflicts.push({
      id: "conflict-dietary-jain",
      interestA: "food",
      interestB: "food",
      involvedTravellersA: jainTravellers,
      involvedTravellersB: nonVegTravellers,
      descriptionEn: `Dietary preferences: Group has travellers requiring strict Jain/pure vegetarian dining alongside non-vegetarian diners.`,
      descriptionKn: `ಆಹಾರ ಆದ್ಯತೆಗಳ ವ್ಯತ್ಯಾಸ: ತಂಡದಲ್ಲಿ ಕಟ್ಟುನಿಟ್ಟಾದ ಜೈನ/ಶುದ್ಧ ಸಸ್ಯಾಹಾರಿಗಳು ಹಾಗೂ ಮಾಂಸಾಹಾರಿಗಳು ಇಬ್ಬರೂ ಇದ್ದಾರೆ.`,
      suggestedCompromiseEn:
        "Select certified pure-vegetarian dining halls (e.g., Udupi Sri Krishna matha dining or Woodlands) for primary group lunches, allowing separate dinner stops at coastal seafood specialty restaurants.",
      suggestedCompromiseKn:
        "ಮಧ್ಯಾಹ್ನದ ಮುಖ್ಯ ಊಟಕ್ಕೆ ಉಡುಪಿ ಶ್ರೀಕೃಷ್ಣ ಮಠ ಅಥವಾ ಶುದ್ಧ ಸಸ್ಯಾಹಾರಿ ಹೋಟೆಲ್‌ಗಳನ್ನು ಆಯ್ಕೆಮಾಡಿ; ರಾತ್ರಿ ಊಟದ ಸಮಯದಲ್ಲಿ ಕರಾವಳಿ ತಿನಿಸು ಬಯಸುವವರು ಪ್ರತ್ಯೇಕವಾಗಿ ಭೇಟಿ ನೀಡಬಹುದು.",
    });
  }

  return conflicts;
}

/* =========================================================================
   4. ACCESSIBILITY & MOBILITY REQUIREMENTS
   ========================================================================= */

/**
 * Aggregates all unique accessibility requirements across travellers.
 */
export function aggregateAccessibilityRequirements(
  travellers: TravellerProfile[]
): AccessibilityRequirement[] {
  if (!travellers) return [];

  const activeSet = new Set<AccessibilityRequirement>();
  for (const t of travellers) {
    if (Array.isArray(t.accessibilityRequirements)) {
      for (const req of t.accessibilityRequirements) {
        if (req !== "none") {
          activeSet.add(req);
        }
      }
    }
  }

  return Array.from(activeSet);
}

/**
 * Computes travel pace consensus across group members.
 */
export function determineGroupPaceConsensus(
  travellers: TravellerProfile[]
): {
  consensus: TravelPace;
  hasConflict: boolean;
  counts: Record<TravelPace, number>;
} {
  const counts: Record<TravelPace, number> = {
    relaxed: 0,
    balanced: 0,
    packed: 0,
  };

  if (!travellers || travellers.length === 0) {
    return { consensus: "balanced", hasConflict: false, counts };
  }

  for (const t of travellers) {
    const pace = t.preferredPace || "balanced";
    counts[pace] = (counts[pace] || 0) + 1;
  }

  const distinctPaces = Object.values(counts).filter((c) => c > 0).length;
  const hasConflict = distinctPaces > 1;

  // If there's a conflict between relaxed and packed, balanced is the optimal compromise
  if (counts.relaxed > 0 && counts.packed > 0) {
    return { consensus: "balanced", hasConflict: true, counts };
  }

  // Otherwise, choose majority
  let maxCount = -1;
  let consensus: TravelPace = "balanced";
  for (const [pace, count] of Object.entries(counts) as [TravelPace, number][]) {
    if (count > maxCount) {
      maxCount = count;
      consensus = pace;
    }
  }

  return { consensus, hasConflict, counts };
}
