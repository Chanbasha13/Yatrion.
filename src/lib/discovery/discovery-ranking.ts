import type {
  KarnatakaExperience,
  RankedExperience,
  DiscoveryRankingInputs,
  RecommendedSeason,
} from "./discovery-types";
import type { TripInterest } from "../planner-types";

/**
 * Determines current or target season from departure date or current month.
 */
export function getActiveSeason(departureDate?: string | Date): RecommendedSeason {
  let month = new Date().getMonth(); // 0 to 11
  if (departureDate) {
    const parsed = departureDate instanceof Date ? departureDate : new Date(departureDate);
    if (!isNaN(parsed.getTime())) {
      month = parsed.getMonth();
    }
  }

  // Karnataka meteorological seasons:
  // June to Sept (5 to 8): Southwest Monsoon
  // Oct to Nov (9 to 10): Post-monsoon / Retreating monsoon
  // Dec to Feb (11, 0, 1): Winter / Pleasant
  // March to May (2 to 4): Summer
  if (month >= 5 && month <= 8) return "monsoon";
  if (month >= 9 && month <= 10) return "post_monsoon";
  if (month === 11 || month === 0 || month === 1) return "winter";
  return "summer";
}

/**
 * Deterministically computes personalized relevance score (0 to 100)
 * and generates transparent bilingual explanations for why each gem is recommended.
 */
export function rankExperience(
  experience: KarnatakaExperience,
  inputs: DiscoveryRankingInputs
): RankedExperience {
  let score = 20; // Baseline entry score
  const matchReasonsEn: string[] = [];
  const matchReasonsKn: string[] = [];

  const selectedDests = inputs.selectedDestinationIds || [];
  const userInterests: (TripInterest | string)[] =
    inputs.userInterests || inputs.interests || inputs.preferences?.interests || [];
  const activeScenario =
    inputs.activeBudgetScenario || inputs.budgetScenario || "balanced";
  const duration = inputs.durationDays || inputs.preferences?.durationDays || 3;
  const currentSeason = getActiveSeason(
    inputs.departureDate || inputs.preferences?.departureDate
  );

  // 1. DIRECT DESTINATION PROXIMITY (+35 pts)
  const isDirectDestMatch = selectedDests.includes(
    experience.associatedDestinationId
  );
  if (isDirectDestMatch) {
    score += 35;
    matchReasonsEn.push(
      `Located directly in your selected destination area: ${experience.associatedDestinationName}`
    );
    matchReasonsKn.push(
      `ನಿಮ್ಮ ಆಯ್ಕೆಯ ತಾಣವಾದ ${experience.associatedDestinationKannada} ಪ್ರದೇಶದಲ್ಲೇ ನೆಲೆಸಿದೆ`
    );
  }

  // 2. INTEREST OVERLAP (up to +30 pts)
  let interestOverlapCount = 0;
  for (const tag of experience.tags) {
    if (userInterests.includes(tag)) {
      interestOverlapCount++;
    }
  }
  if (interestOverlapCount > 0) {
    const pts = Math.min(30, interestOverlapCount * 12);
    score += pts;
    const tagNames = experience.tags
      .filter((t) => userInterests.includes(t))
      .join(", ");
    matchReasonsEn.push(`Strong match for your travel interests: ${tagNames}`);
    matchReasonsKn.push(`ನಿಮ್ಮ ಪ್ರವಾಸದ ಆಸಕ್ತಿಗಳಿಗೆ ಉತ್ತಮ ಹೊಂದಾಣಿಕೆ: ${tagNames}`);
  }

  // 3. BUDGET SCENARIO FIT (+15 pts)
  let isBudgetFriendly = false;
  if (activeScenario === "budget_saver") {
    if (experience.budgetTier === "free") {
      score += 15;
      isBudgetFriendly = true;
      matchReasonsEn.push("₹0 admission cost fits your Budget Saver goal");
      matchReasonsKn.push("ಉಚಿತ ಪ್ರವೇಶ — ನಿಮ್ಮ ಬಜೆಟ್ ಸೇವರ್ ಯೋಜನೆಗೆ ಹೊಂದುತ್ತದೆ");
    } else if (experience.budgetTier === "budget") {
      score += 12;
      isBudgetFriendly = true;
      matchReasonsEn.push("Low-cost entrance aligns with budget transit");
      matchReasonsKn.push("ಕನಿಷ್ಠ ಪ್ರವೇಶ ವೆಚ್ಚ — ಮಿತವ್ಯಯದ ಪ್ರವಾಸಕ್ಕೆ ಪೂರಕ");
    } else if (experience.budgetTier === "moderate") {
      score += 5;
    }
  } else if (activeScenario === "balanced") {
    if (experience.budgetTier === "free" || experience.budgetTier === "budget") {
      score += 15;
      isBudgetFriendly = true;
      matchReasonsEn.push("Excellent value with high cultural/nature immersion");
      matchReasonsKn.push("ಕಡಿಮೆ ವೆಚ್ಚದಲ್ಲಿ ಅತ್ಯುನ್ನತ ನೈಸರ್ಗಿಕ/ಸಾಂಸ್ಕೃತಿಕ ಅನುಭವ");
    } else if (experience.budgetTier === "moderate") {
      score += 12;
    } else {
      score += 6;
    }
  } else {
    // Comfort & Indulgence
    score += 12;
    matchReasonsEn.push("Curated immersive experience with scenic access");
    matchReasonsKn.push("ವಿಶಿಷ್ಟ ಮತ್ತು ಆರಾಮದಾಯಕ ಪ್ರವಾಸ ಅನುಭವ");
  }

  // 4. PEACEFUL ALTERNATIVE TO POPULAR (+10 pts)
  const isAlternativeToPopular = Boolean(
    experience.peacefulAlternativeTo &&
      (isDirectDestMatch || selectedDests.length > 0)
  );
  if (isAlternativeToPopular) {
    score += 10;
    matchReasonsEn.push(
      `Peaceful uncrowded alternative to ${experience.peacefulAlternativeTo}`
    );
    matchReasonsKn.push(
      `${experience.peacefulAlternativeTo} ಗಿಂತ ಜನದಟ್ಟಣೆ ಇಲ್ಲದ ಶಾಂತಿಯುತ ತಾಣ`
    );
  }

  // 5. DURATION FEASIBILITY (+10 pts)
  if (duration <= 2 && experience.visitDurationMinutes <= 90) {
    score += 10;
    matchReasonsEn.push("Compact visit duration easily added into short trips");
    matchReasonsKn.push("ಕಡಿಮೆ ಸಮಯಾವಧಿ — 1-2 ದಿನಗಳ ಪ್ರವಾಸಕ್ಕೆ ಸುಲಭವಾಗಿ ಸೇರಿಸಬಹುದು");
  } else if (duration >= 3) {
    score += 8;
  }

  // 6. SEASONAL HARMONY (+10 pts)
  let isSeasonallyOptimal = false;
  if (
    experience.recommendedSeason === "year_round" ||
    experience.recommendedSeason === currentSeason
  ) {
    score += 10;
    isSeasonallyOptimal = true;
    matchReasonsEn.push(`Ideal weather during ${experience.seasonLabelEn}`);
    matchReasonsKn.push(`${experience.seasonLabelKn} ಹವಾಮಾನಕ್ಕೆ ಸೂಕ್ತ`);
  }

  // Cap score at 100
  const finalScore = Math.min(100, Math.max(10, score));

  return {
    experience,
    relevanceScore: finalScore,
    matchReasonsEn,
    matchReasonsKn,
    isNearSelectedDestination: isDirectDestMatch,
    isAlternativeToPopular,
    isBudgetFriendly,
    isSeasonallyOptimal,
  };
}

/**
 * Deterministically sorts a collection of ranked experiences.
 */
export function sortRankedExperiences(
  ranked: RankedExperience[]
): RankedExperience[] {
  return [...ranked].sort((a, b) => {
    // Highest score first
    if (b.relevanceScore !== a.relevanceScore) {
      return b.relevanceScore - a.relevanceScore;
    }
    // Proximity to selected destination tie-breaker
    if (
      a.isNearSelectedDestination &&
      !b.isNearSelectedDestination
    ) {
      return -1;
    }
    if (
      !a.isNearSelectedDestination &&
      b.isNearSelectedDestination
    ) {
      return 1;
    }
    // Alphabetical title tie-breaker for deterministic output
    return a.experience.titleEn.localeCompare(b.experience.titleEn);
  });
}
