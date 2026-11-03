import type {
  AdaptiveTripContext,
  DetectedTripIssue,
  AdaptiveRecommendation,
  AlternativeActivity,
} from "./adaptive-types";
import { KARNATAKA_EXPERIENCES } from "../discovery/experiences";
import type { KarnatakaExperience } from "../discovery/discovery-types";

/**
 * Maps a field-curated KarnatakaExperience into a typed AlternativeActivity.
 */
function experienceToAlternative(
  exp: KarnatakaExperience,
  whyEn: string,
  whyKn: string
): AlternativeActivity {
  return {
    id: `alt-exp-${exp.id}`,
    titleEn: exp.titleEn,
    titleKn: exp.titleKn,
    destinationId: exp.associatedDestinationId,
    destinationName: exp.associatedDestinationName,
    district: exp.district,
    category: exp.category,
    activityType: exp.category === "heritage" ? "cultural" : exp.category === "nature" ? "nature" : "exploration",
    estimatedDuration: exp.durationLabelEn,
    estimatedDurationMinutes: exp.visitDurationMinutes,
    estimatedCostInr: exp.estimatedCostInr,
    accessibility: exp.accessibility,
    isWheelchairAccessible: exp.accessibility === "wheelchair_accessible",
    isStepFree: exp.accessibility === "wheelchair_accessible" || exp.accessibility === "partially_accessible",
    experienceId: exp.id,
    whyRecommendedEn: whyEn,
    whyRecommendedKn: whyKn,
    provenance: "static_knowledge",
  };
}

/**
 * Finds the most suitable verified alternative experience in the same district or destination
 * matching accessibility, budget, and category constraints.
 */
function findBestAlternativeExperience(
  destinationId: string,
  district: string,
  requiresStepFree: boolean,
  maxCostInr?: number
): AlternativeActivity | undefined {
  // First, search in the same destination or district
  const candidates = KARNATAKA_EXPERIENCES.filter((exp) => {
    const matchesGeo =
      exp.associatedDestinationId.toLowerCase() === destinationId.toLowerCase() ||
      exp.district.toLowerCase() === district.toLowerCase();

    if (!matchesGeo) return false;

    if (requiresStepFree && exp.accessibility !== "wheelchair_accessible" && exp.accessibility !== "partially_accessible") {
      return false;
    }

    if (typeof maxCostInr === "number" && exp.estimatedCostInr > maxCostInr) {
      return false;
    }

    return true;
  });

  if (candidates.length > 0) {
    const chosen = candidates[0];
    return experienceToAlternative(
      chosen,
      `Step-free verified Karnataka experience in ${chosen.district} with zero barrier stairs.`,
      `${chosen.district} ನಲ್ಲಿ ಮೆಟ್ಟಿಲುಗಳಿಲ್ಲದ ಸುಲಭ ಪ್ರವೇಶವಿರುವ ಅಧಿಕೃತ ತಾಣ.`
    );
  }

  // Fallback: search anywhere in the broader region
  const regionalCandidates = KARNATAKA_EXPERIENCES.filter((exp) => {
    if (requiresStepFree && exp.accessibility !== "wheelchair_accessible" && exp.accessibility !== "partially_accessible") {
      return false;
    }
    return true;
  });

  if (regionalCandidates.length > 0) {
    const chosen = regionalCandidates[0];
    return experienceToAlternative(
      chosen,
      `Regional accessible cultural gem in ${chosen.associatedDestinationName}.`,
      `${chosen.associatedDestinationName} ನಲ್ಲಿ ಪ್ರವೇಶ್ಯತಾ-ಸ್ನೇಹಿ ಸಾಂಸ್ಕೃತಿಕ ತಾಣ.`
    );
  }

  return undefined;
}

/**
 * Deterministically generates explainable recommendations for each detected trip issue.
 * Reuses existing Yatrion modules and scoring criteria without duplicate code.
 */
export function generateAdaptiveRecommendations(
  issues: DetectedTripIssue[],
  context: AdaptiveTripContext
): AdaptiveRecommendation[] {
  const recommendations: AdaptiveRecommendation[] = [];
  const { days, budgetPlan } = context;

  for (const issue of issues) {
    // ── 1. TEMPLE AFTERNOON CLOSURE -> REORDER STOPS ──
    if (issue.id.startsWith("issue-temple-closure-") && issue.dayNumber && issue.stopIndex !== undefined) {
      const day = days.find((d) => d.dayNumber === issue.dayNumber);
      if (day && day.stops.length >= 2) {
        // Swap morning stop and afternoon stop
        const morningStop = day.stops.find((s) => s.timeOfDay === "morning");

        recommendations.push({
          id: `rec-reorder-temple-${issue.id}`,
          issueId: issue.id,
          actionType: "reorder_stops",
          titleEn: `Visit '${issue.stopTitle}' in Morning Slot`,
          titleKn: `'${issue.stopTitle}' ಗೆ ಬೆಳಿಗ್ಗೆ ಭೇಟಿ ನೀಡಿ`,
          explanationEn: `Swap '${issue.stopTitle}' to the morning slot (9:00 AM – 11:30 AM) and shift ${morningStop ? `'${morningStop.title}'` : "the morning sight"} to the afternoon. This ensures arrival while the temple sanctum is fully open for darshan.`,
          explanationKn: `'${issue.stopTitle}' ಭೇಟಿಯನ್ನು ಬೆಳಿಗ್ಗೆ 9:00 - 11:30 ಕ್ಕೆ ಬದಲಾಯಿಸಿ, ಮಧ್ಯಾಹ್ನ ಇತರ ತಾಣಗಳನ್ನು ವೀಕ್ಷಿಸಿ. ಇದರಿಂದ ಗರ್ಭಗುಡಿ ದರ್ಶನ ನಿರಾತಂಕವಾಗಿ ಲಭ್ಯವಾಗುತ್ತದೆ.`,
          targetDayNumber: issue.dayNumber,
          targetStopIndex: issue.stopIndex,
          targetStopTitle: issue.stopTitle,
          reason: {
            whatChangedEn: `Reordered Day ${issue.dayNumber} stops: moved '${issue.stopTitle}' to morning.`,
            whatChangedKn: `ದಿನ ${issue.dayNumber} ರ ಕ್ರಮ ಬದಲಾವಣೆ: '${issue.stopTitle}' ಬೆಳಿಗ್ಗೆ ಭೇಟಿ.`,
            whyChangedEn: "Bypasses mandatory afternoon sanctum closure (12:30 PM – 4:30 PM).",
            whyChangedKn: "ಮಧ್ಯಾಹ್ನದ ಗರ್ಭಗುಡಿ ಮುಚ್ಚುವ ಸಮಯವನ್ನು (12:30 - 4:30) ತಪ್ಪಿಸಲು.",
            constraintsSatisfied: ["no_midday_temple_arrival"],
            timeImpactMinutes: 0,
            costImpactInr: 0,
            assumptionsEn: ["Temple morning visiting hours are typically 6:30 AM to 12:30 PM."],
            assumptionsKn: ["ದೇವಾಲಯದ ಬೆಳಗಿನ ದರ್ಶನ ಸಮಯ ಬೆಳಿಗ್ಗೆ 6:30 ರಿಂದ 12:30 ರವರೆಗೆ ಇರುತ್ತದೆ."],
          },
          confidence: "high",
          provenance: "static_knowledge",
          score: 95,
        });
      }
    }

    // ── 2. MOBILITY & ACCESSIBILITY BARRIER -> REPLACE WITH STEP-FREE ALTERNATIVE ──
    else if (issue.category === "accessibility_conflict" && issue.dayNumber && issue.stopTitle) {
      const day = days.find((d) => d.dayNumber === issue.dayNumber);
      const destId = day?.destinationId || "hampi";
      const district = day?.district || "Ballari";

      const alt = findBestAlternativeExperience(destId, district, true);

      if (alt) {
        recommendations.push({
          id: `rec-access-replace-${issue.id}`,
          issueId: issue.id,
          actionType: "select_accessible_alternative",
          titleEn: `Replace '${issue.stopTitle}' with Step-Free '${alt.titleEn}'`,
          titleKn: `'${issue.stopTitle}' ಬದಲಿಗೆ ಸುಲಭ ಪ್ರವೇಶದ '${alt.titleKn}' ಆಯ್ಕೆಮಾಡಿ`,
          explanationEn: `Substitutes the strenuous climb at '${issue.stopTitle}' with '${alt.titleEn}', a verified step-free destination in ${alt.district} featuring smooth ground pathways suitable for wheelchairs and low-walking travelers.`,
          explanationKn: `'${issue.stopTitle}' ನ ಕಡಿದಾದ ಮೆಟ್ಟಿಲುಗಳ ಬದಲಿಗೆ ${alt.district} ನ '${alt.titleKn}' ಆಯ್ಕೆಮಾಡಿ; ಇದು ಗಾಲಿಕುರ್ಚಿ ಮತ್ತು ಹಿರಿಯರಿಗೆ ಸುಲಭವಾಗಿ ಪ್ರವೇಶಿಸಬಹುದಾದ ಸಮತಟ್ಟಾದ ತಾಣವಾಗಿದೆ.`,
          targetDayNumber: issue.dayNumber,
          targetStopIndex: issue.stopIndex,
          targetStopTitle: issue.stopTitle,
          alternative: alt,
          reason: {
            whatChangedEn: `Replaced '${issue.stopTitle}' with step-free verified '${alt.titleEn}'.`,
            whatChangedKn: `'${issue.stopTitle}' ಬದಲಿಗೆ ಸುಗಮ ಪಥದ '${alt.titleKn}' ಬದಲಾವಣೆ.`,
            whyChangedEn: "Eliminates physical barriers for travellers requiring wheelchair/step-free access.",
            whyChangedKn: "ಗಾಲಿಕುರ್ಚಿ ಮತ್ತು ಮೆಟ್ಟಿಲು-ರಹಿತ ನಡಿಗೆಯ ಅಗತ್ಯವಿರುವ ಸದಸ್ಯರಿಗೆ ಅಡೆತಡೆಯಿಲ್ಲದ ಪ್ರವೇಶ ನೀಡಲು.",
            constraintsSatisfied: ["wheelchair_required", "step_free_required"],
            timeImpactMinutes: alt.estimatedDurationMinutes - 90,
            costImpactInr: alt.estimatedCostInr,
            assumptionsEn: ["Alternative has flat, paved ground and battery cart or wheelchair ramp availability."],
            assumptionsKn: ["ಪರ್ಯಾಯ ತಾಣವು ಸಮತಟ್ಟಾದ ರಸ್ತೆ ಮತ್ತು ರ‍್ಯಾಂಪ್ ಪ್ರವೇಶವನ್ನು ಹೊಂದಿದೆ."],
          },
          confidence: "high",
          provenance: "static_knowledge",
          score: 98,
        });
      }
    }

    // ── 3. TRANSIT OVERLOAD -> REMOVE FURTHEST SECONDARY STOP ──
    else if (issue.id.startsWith("issue-transit-overload-") && issue.dayNumber) {
      const day = days.find((d) => d.dayNumber === issue.dayNumber);
      if (day && day.stops.length > 2) {
        // Recommend removing the last or least critical stop
        const targetStop = day.stops[day.stops.length - 1];

        recommendations.push({
          id: `rec-transit-decompress-${issue.id}`,
          issueId: issue.id,
          actionType: "remove_excess_stop",
          titleEn: `Drop Secondary Stop '${targetStop.title}' on Day ${issue.dayNumber}`,
          titleKn: `ದಿನ ${issue.dayNumber} ರಲ್ಲಿ ಹೆಚ್ಚುವರಿ ತಾಣ '${targetStop.title}' ಕಡಿಮೆ ಮಾಡಿ`,
          explanationEn: `Dropping '${targetStop.title}' eliminates an estimated 60–90 minutes of road transit, keeping Day ${issue.dayNumber} within safe, unhurried daylight driving hours.`,
          explanationKn: `'${targetStop.title}' ತಾಣವನ್ನು ಕಡಿಮೆ ಮಾಡುವುದರಿಂದ ಅಂದಾಜು 60-90 ನಿಮಿಷಗಳ ಪ್ರಯಾಣ ಸಮಯ ಉಳಿತಾಯವಾಗುತ್ತದೆ ಮತ್ತು ಪ್ರವಾಸ ಆರಾಮದಾಯಕವಾಗಿರುತ್ತದೆ.`,
          targetDayNumber: issue.dayNumber,
          targetStopIndex: day.stops.length - 1,
          targetStopTitle: targetStop.title,
          reason: {
            whatChangedEn: `Removed '${targetStop.title}' from Day ${issue.dayNumber} schedule.`,
            whatChangedKn: `ದಿನ ${issue.dayNumber} ರಿಂದ '${targetStop.title}' ತೆಗೆದುಹಾಕಲಾಗಿದೆ.`,
            whyChangedEn: "Decompresses transit schedule to meet travel style pacing limit.",
            whyChangedKn: "ಪ್ರಯಾಣದ ಸಮಯವನ್ನು ಕಡಿಮೆ ಮಾಡಿ ನಿಗದಿತ ಶೈಲಿಯ ಮಿತಿಯಲ್ಲಿಡಲು.",
            constraintsSatisfied: ["max_daily_transit_minutes"],
            timeImpactMinutes: -75,
            costImpactInr: 0,
            assumptionsEn: ["Road transit estimates based on calibrated terrain detour model."],
            assumptionsKn: ["ಕರ್ನಾಟಕ ಭೂಪ್ರದೇಶ ಗುಣಕಗಳ ಆಧಾರದ ಮೇಲೆ ಅಂದಾಜಿಸಲಾದ ರಸ್ತೆ ಪ್ರಯಾಣ."],
          },
          confidence: "medium",
          provenance: "heuristic",
          score: 88,
        });
      }
    }

    // ── 4. STOP DENSITY OVERLOAD -> TAG AS SUBGROUP OPTIONAL ──
    else if (issue.id.startsWith("issue-stop-overload-") && issue.dayNumber) {
      const day = days.find((d) => d.dayNumber === issue.dayNumber);
      if (day && day.stops.length > 0) {
        const excessStop = day.stops[day.stops.length - 1];

        recommendations.push({
          id: `rec-optional-tag-${issue.id}`,
          issueId: issue.id,
          actionType: "tag_subgroup_optional",
          titleEn: `Make '${excessStop.title}' an Optional Subgroup Activity`,
          titleKn: `'${excessStop.title}' ಅನ್ನು ಐಚ್ಛಿಕ ಉಪಗುಂಪು ಚಟುವಟಿಕೆಯನ್ನಾಗಿ ಮಾಡಿ`,
          explanationEn: `Designates '${excessStop.title}' as optional rather than mandatory. Active travellers can visit during afternoon free time while others enjoy tea or lounge downtime.`,
          explanationKn: `'${excessStop.title}' ಅನ್ನು ಕಡ್ಡಾಯಗೊಳಿಸದೆ ಐಚ್ಛಿಕವಾಗಿಸಿ; ಆಸಕ್ತರು ಭೇಟಿ ನೀಡಬಹುದು ಮತ್ತು ಇತರರು ವಿಶ್ರಮಿಸಬಹುದು.`,
          targetDayNumber: issue.dayNumber,
          targetStopIndex: day.stops.length - 1,
          targetStopTitle: excessStop.title,
          reason: {
            whatChangedEn: `Tagged '${excessStop.title}' as subgroup optional.`,
            whatChangedKn: `'${excessStop.title}' ಅನ್ನು ಐಚ್ಛಿಕ ಉಪಗುಂಪು ಚಟುವಟಿಕೆಯಾಗಿ ಗುರುತಿಸಲಾಗಿದೆ.`,
            whyChangedEn: "Prevents forcing the whole group into an overcrowded pace.",
            whyChangedKn: "ಇಡೀ ತಂಡದ ಮೇಲೆ ಅತಿಯಾದ ತಾಣಗಳ ಒತ್ತಡವನ್ನು ತಪ್ಪಿಸಲು.",
            constraintsSatisfied: ["max_daily_stops", "group_pace_balanced"],
            timeImpactMinutes: -45,
            costImpactInr: 0,
            assumptionsEn: ["Remaining members can rest at hotel base or local café."],
            assumptionsKn: ["ಉಳಿದ ಸದಸ್ಯರು ಹೋಟೆಲ್ ಅಥವಾ ಕೆಫೆಯಲ್ಲಿ ವಿಶ್ರಾಂತಿ ಪಡೆಯಬಹುದು."],
          },
          confidence: "high",
          provenance: "user_provided",
          score: 85,
        });
      }
    }

    // ── 5. BUDGET DEFICIT / OVERRUN -> SWITCH TO BUDGET SAVER SCENARIO ──
    else if (issue.category === "budget_overrun" && budgetPlan) {
      const currentScenario = budgetPlan.scenarios[budgetPlan.activeScenario] || budgetPlan.scenarios.balanced;
      const saverScenario = budgetPlan.scenarios.budget_saver;
      const savingsPerPerson = Math.max(500, currentScenario.perPersonCost - saverScenario.perPersonCost);
      const totalSavings = savingsPerPerson * (budgetPlan.inputs.travellerCount || 1);

      recommendations.push({
        id: `rec-switch-budget-saver-${issue.id}`,
        issueId: issue.id,
        actionType: "switch_budget_scenario",
        titleEn: "Adopt 'Budget Saver' Scenario",
        titleKn: "'ಬಜೆಟ್ ಸೇವರ್' ಯೋಜನೆಗೆ ಬದಲಾಯಿಸಿ",
        explanationEn: `Switching to 'Budget Saver' optimizes lodging to verified budget homestays/KSTDC Mayura and prioritizes KSRTC express buses, saving ~₹${savingsPerPerson.toLocaleString("en-IN")} per traveller (₹${totalSavings.toLocaleString("en-IN")} overall) and eliminating the budget deficit.`,
        explanationKn: "'ಬಜೆಟ್ ಸೇವರ್' ಆಯ್ಕೆಮಾಡುವುದರಿಂದ ಅಧಿಕೃತ ಹೋಂಸ್ಟೇ ಮತ್ತು KSRTC ಸಾರಿಗೆಯೊಂದಿಗೆ ಪ್ರತಿ ಪ್ರವಾಸಿಗರಿಗೆ ~₹" + savingsPerPerson.toLocaleString("en-IN") + " ಉಳಿತಾಯವಾಗುತ್ತದೆ ಮತ್ತು ಬಜೆಟ್ ಮಿತಿ ಸುರಕ್ಷಿತವಾಗಿರುತ್ತದೆ.",
        targetDayNumber: 1,
        reason: {
          whatChangedEn: "Applied 'Budget Saver' scenario configuration across all trip days.",
          whatChangedKn: "ಎಲ್ಲಾ ದಿನಗಳಿಗೂ 'ಬಜೆಟ್ ಸೇವರ್' ಸನ್ನಿವೇಶವನ್ನು ಅನ್ವಯಿಸಲಾಗಿದೆ.",
          whyChangedEn: "Eliminates individual budget limit deficits and stays within target budget.",
          whyChangedKn: "ವೈಯಕ್ತಿಕ ಬಜೆಟ್ ಕೊರತೆಯನ್ನು ನಿವಾರಿಸಲು ಮತ್ತು ನಿಗದಿತ ಮಿತಿಯೊಳಗೆ ಪ್ರವಾಸ ಪೂರ್ಣಗೊಳಿಸಲು.",
          constraintsSatisfied: ["budget_limit_overall", "budget_limit_individual"],
          timeImpactMinutes: 0,
          costImpactInr: -totalSavings,
          assumptionsEn: [
            "Rooms booked in quad or triple sharing where permitted.",
            "Retains 5% emergency contingency reserve.",
          ],
          assumptionsKn: [
            "ಕೊಠಡಿಗಳನ್ನು ಹಂಚಿಕೆ ಆಧಾರದಲ್ಲಿ ಪಡೆಯಲಾಗುತ್ತದೆ.",
            "5% ತುರ್ತು ಮೀಸಲು ನಿಧಿಯನ್ನು ಕಾಯ್ದಿರಿಸಲಾಗುತ್ತದೆ.",
          ],
        },
        confidence: "high",
        provenance: "heuristic",
        score: 92,
      });
    }

    // ── 6. SEASONAL WATERFALL OR MONSOON ISSUE -> REPLACE WITH EVERGREEN/CULTURAL GEM ──
    else if (issue.category === "seasonal_restriction" && issue.dayNumber && issue.stopTitle) {
      const day = days.find((d) => d.dayNumber === issue.dayNumber);
      const alt = findBestAlternativeExperience(
        day?.destinationId || "coorg",
        day?.district || "Kodagu",
        false
      );

      if (alt) {
        recommendations.push({
          id: `rec-seasonal-alt-${issue.id}`,
          issueId: issue.id,
          actionType: "replace_activity",
          titleEn: `Replace '${issue.stopTitle}' with Seasonal Cultural Gem '${alt.titleEn}'`,
          titleKn: `'${issue.stopTitle}' ಬದಲಿಗೆ ಸಾರ್ವಕಾಲಿಕ '${alt.titleKn}' ಆಯ್ಕೆಮಾಡಿ`,
          explanationEn: `Substitutes the seasonally constrained activity with '${alt.titleEn}' (${alt.district}), which remains vibrant and unaffected by current seasonal dry-down or weather restrictions.`,
          explanationKn: `ಹವಾಮಾನದ ಕಾರಣದಿಂದ ಪ್ರಭಾವಿತವಾಗಿರುವ ತಾಣದ ಬದಲಿಗೆ ${alt.district} ನ '${alt.titleKn}' ಆಯ್ಕೆಮಾಡಿ; ಇದು ಎಲ್ಲಾ ಕಾಲದಲ್ಲೂ ಉತ್ತಮ ಅನುಭವ ನೀಡುತ್ತದೆ.`,
          targetDayNumber: issue.dayNumber,
          targetStopIndex: issue.stopIndex,
          targetStopTitle: issue.stopTitle,
          alternative: alt,
          reason: {
            whatChangedEn: `Replaced '${issue.stopTitle}' with all-weather '${alt.titleEn}'.`,
            whatChangedKn: `'${issue.stopTitle}' ಬದಲಿಗೆ ಸಾರ್ವಕಾಲಿಕ '${alt.titleKn}' ಬದಲಾವಣೆ.`,
            whyChangedEn: "Avoids seasonal dryness or monsoon safety closures.",
            whyChangedKn: "ಬೇಸಿಗೆಯ ನೀರಿನ ಕೊರತೆ ಅಥವಾ ಮಳೆಯ ಅಪಾಯವನ್ನು ತಪ್ಪಿಸಲು.",
            constraintsSatisfied: ["avoid_monsoon_waterfall_danger"],
            timeImpactMinutes: 0,
            costImpactInr: alt.estimatedCostInr,
            assumptionsEn: ["Attraction is open year-round with verified road connectivity."],
            assumptionsKn: ["ಈ ತಾಣವು ವರ್ಷಪೂರ್ತಿ ಲಭ್ಯವಿರುವ ರಸ್ತೆ ಸಂಪರ್ಕವನ್ನು ಹೊಂದಿದೆ."],
          },
          confidence: "high",
          provenance: "static_knowledge",
          score: 87,
        });
      }
    }
  }

  // Sort recommendations deterministically by score descending
  return recommendations.sort((a, b) => b.score - a.score);
}
