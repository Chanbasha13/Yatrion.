import type {
  TravellerProfile,
  GroupCompatibilityReport,
} from "./group-types";
import {
  extractSharedInterests,
  detectInterestConflicts,
  determineGroupPaceConsensus,
  aggregateAccessibilityRequirements,
} from "./group-preferences";

/**
 * Calculates a transparent, deterministic Group Compatibility Score (0 to 100)
 * with actionable explainability and compromise advisories.
 */
export function calculateGroupCompatibility(
  travellers: TravellerProfile[]
): GroupCompatibilityReport {
  // Safe fallback for single traveler or empty group
  if (!travellers || travellers.length <= 1) {
    const singleTraveller = travellers?.[0];
    const singleInterests = singleTraveller
      ? extractSharedInterests([singleTraveller])
      : [];

    return {
      overallScore: 100,
      breakdown: {
        interestAlignment: 40,
        paceAlignment: 25,
        budgetHarmony: 20,
        accessibilityFeasibility: 15,
      },
      sharedInterests: singleInterests,
      conflictingInterests: [],
      paceConsensus: singleTraveller?.preferredPace || "balanced",
      hasPaceConflict: false,
      paceBreakdown: {
        relaxed: singleTraveller?.preferredPace === "relaxed" ? 1 : 0,
        balanced: singleTraveller?.preferredPace === "balanced" ? 1 : 0,
        packed: singleTraveller?.preferredPace === "packed" ? 1 : 0,
      },
      accessibilityRequirementsActive:
        singleTraveller?.accessibilityRequirements || [],
      compromiseSuggestionsEn: [
        "Solo / baseline traveller mode: Full alignment with your individual preferences.",
      ],
      compromiseSuggestionsKn: [
        "ವೈಯಕ್ತಿಕ ಪ್ರಯಾಣ ವಿಧಾನ: ನಿಮ್ಮ ಎಲ್ಲಾ ಆದ್ಯತೆಗಳಿಗೂ ಪೂರ್ಣ ಹೊಂದಾಣಿಕೆ ಇದೆ.",
      ],
    };
  }

  const sharedInterests = extractSharedInterests(travellers);
  const conflictingInterests = detectInterestConflicts(travellers);
  const { consensus: paceConsensus, hasConflict: hasPaceConflict, counts: paceBreakdown } =
    determineGroupPaceConsensus(travellers);
  const activeAccessibility = aggregateAccessibilityRequirements(travellers);

  // ── 1. INTEREST ALIGNMENT (Max: 40 pts) ──
  let interestScore = 20; // baseline
  const hasUnanimous = sharedInterests.some((si) => si.isUnanimous);
  const majorityCount = sharedInterests.filter((si) => si.isMajority).length;

  if (hasUnanimous) {
    interestScore += 15;
  } else if (majorityCount >= 2) {
    interestScore += 10;
  } else if (majorityCount === 1) {
    interestScore += 5;
  }

  // Penalty for conflicting interest pairs
  const conflictPenalty = Math.min(10, conflictingInterests.length * 3);
  interestScore = Math.max(10, interestScore - conflictPenalty);

  // ── 2. PACE ALIGNMENT (Max: 25 pts) ──
  let paceScore = 25;
  if (!hasPaceConflict) {
    paceScore = 25; // everyone chose identical pace
  } else if (paceBreakdown.relaxed > 0 && paceBreakdown.packed > 0) {
    paceScore = 12; // polar clash
  } else {
    paceScore = 18; // relaxed-balanced or balanced-packed
  }

  // ── 3. BUDGET HARMONY (Max: 20 pts) ──
  let budgetScore = 20;
  const budgetLimits = travellers
    .map((t) => t.individualBudgetLimit)
    .filter((b): b is number => typeof b === "number" && b > 0);

  if (budgetLimits.length >= 2) {
    const minBudget = Math.min(...budgetLimits);
    const maxBudget = Math.max(...budgetLimits);
    const ratio = minBudget / maxBudget;

    if (ratio >= 0.8) {
      budgetScore = 20;
    } else if (ratio >= 0.6) {
      budgetScore = 16;
    } else if (ratio >= 0.4) {
      budgetScore = 12;
    } else {
      budgetScore = 8; // significant divergence
    }
  }

  // ── 4. ACCESSIBILITY FEASIBILITY (Max: 15 pts) ──
  let accessibilityScore = 15;
  if (activeAccessibility.includes("wheelchair")) {
    accessibilityScore = 12; // requires strict terrain & vehicle planning
  } else if (activeAccessibility.includes("step_free")) {
    accessibilityScore = 13;
  }

  // ── TOTAL OVERALL SCORE ──
  const overallScore = Math.min(
    100,
    Math.max(15, interestScore + paceScore + budgetScore + accessibilityScore)
  );

  // ── COMPROMISE SUGGESTIONS ──
  const compromiseSuggestionsEn: string[] = [];
  const compromiseSuggestionsKn: string[] = [];

  if (hasUnanimous) {
    const unanNames = sharedInterests
      .filter((s) => s.isUnanimous)
      .map((s) => s.labelEn)
      .join(" & ");
    compromiseSuggestionsEn.push(
      `Core consensus anchor: Build major morning segments around shared interest in ${unanNames}.`
    );
    compromiseSuggestionsKn.push(
      `ಪ್ರಮುಖ ಸರ್ವಾನುಮತದ ಆಸಕ್ತಿ: ಬೆಳಗಿನ ಪ್ರಮುಖ ಚಟುವಟಿಕೆಗಳನ್ನು ${sharedInterests.filter((s) => s.isUnanimous).map((s) => s.labelKn).join(" ಮತ್ತು ")} ಸುತ್ತ ರೂಪಿಸಿ.`
    );
  }

  for (const c of conflictingInterests) {
    compromiseSuggestionsEn.push(c.suggestedCompromiseEn);
    compromiseSuggestionsKn.push(c.suggestedCompromiseKn);
  }

  if (activeAccessibility.length > 0) {
    compromiseSuggestionsEn.push(
      `Accessibility advisory: Group includes members requiring ${activeAccessibility.join(", ")}. Prioritize monuments with battery cart / ramp access (e.g., Somnathpura or Badami museum ground path).`
    );
    compromiseSuggestionsKn.push(
      `ಪ್ರವೇಶಸಾಧ್ಯತೆ ಎಚ್ಚರಿಕೆ: ತಂಡದಲ್ಲಿ ಮೆಟ್ಟಿಲು ರಹಿತ ಅಥವಾ ಬ್ಯಾಟರಿ ಕಾರ್ಟ್ ಸೌಲಭ್ಯದ ಅಗತ್ಯವಿರುವ ಸದಸ್ಯರಿದ್ದಾರೆ (ಉದಾ: ಸೋಮನಾಥಪುರ ಅಥವಾ ಬಾದಾಮಿ ಮ್ಯೂಸಿಯಂ ಸಮತಟ್ಟಾದ ರಸ್ತೆ).`
    );
  }

  return {
    overallScore,
    breakdown: {
      interestAlignment: interestScore,
      paceAlignment: paceScore,
      budgetHarmony: budgetScore,
      accessibilityFeasibility: accessibilityScore,
    },
    sharedInterests,
    conflictingInterests,
    paceConsensus,
    hasPaceConflict,
    paceBreakdown,
    accessibilityRequirementsActive: activeAccessibility,
    compromiseSuggestionsEn,
    compromiseSuggestionsKn,
  };
}

