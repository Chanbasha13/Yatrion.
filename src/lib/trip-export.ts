import type { GeneratedItinerary, ItineraryDay } from "./itinerary-engine";
import type { DetailedBudgetBreakdown } from "./budget-calculator";
import type { OptimizedRoutePlan } from "./routes/route-types";
import type { OptimizedBudgetPlan } from "./budget/budget-types";
import { getExperienceById } from "./discovery/discovery-engine";
import type { KarnatakaExperience } from "./discovery/discovery-types";
import type { GroupTripState } from "./group/group-types";
import { calculateGroupExpenseSummary } from "./group/group-expenses";
import { calculateGroupCompatibility } from "./group/group-compatibility";

export interface FormatExportOptions {
  itinerary: GeneratedItinerary;
  days: ItineraryDay[];
  detailedBudget?: DetailedBudgetBreakdown;
  dayNotes?: Record<number, string>;
  stopNotes?: Record<string, string>;
  completedStopKeys?: string[];
  language?: "en" | "kn";
  optimizedRoute?: OptimizedRoutePlan;
  budgetPlan?: OptimizedBudgetPlan;
  savedGemIds?: string[];
  groupState?: GroupTripState;
}

/**
 * Formats a clean, readable plain-text document of the entire itinerary,
 * including user notes, completion marks, and budget assumptions.
 * Fully supports English and authentic Kannada Unicode rendering.
 */
export function formatItineraryAsText({
  itinerary,
  days,
  detailedBudget,
  dayNotes = {},
  stopNotes = {},
  completedStopKeys = [],
  language = "en",
  optimizedRoute,
  budgetPlan,
  savedGemIds,
  groupState,
}: FormatExportOptions): string {
  const isKn = language === "kn";
  const completedSet = new Set(completedStopKeys);
  const totalStops = days.reduce((acc, d) => acc + d.stops.length, 0);
  const completedCount = days.reduce(
    (acc, d) =>
      acc +
      d.stops.filter((_, idx) => completedSet.has(`${d.dayNumber}-${idx}`)).length,
    0
  );

  const lines: string[] = isKn
    ? [
        `================================================================================`,
        `ಯಾತ್ರಿಯಾನ್ (YATRION) — ಕರ್ನಾಟಕವನ್ನು ಅನ್ವೇಷಿಸಿ, ವಿಭಿನ್ನವಾಗಿ`,
        `ಅಧಿಕೃತ ಪ್ರವಾಸ ಯೋಜನೆ: ${itinerary.title}`,
        `ಕನ್ನಡ ಶೀರ್ಷಿಕೆ: ${itinerary.kannadaSubtitle}`,
        `================================================================================`,
        ``,
        `ಪ್ರವಾಸದ ಅವಲೋಕನ:`,
        `• ಅವಧಿ: ${itinerary.durationDays} ದಿನಗಳು`,
        `• ಆರಂಭಿಕ ಸ್ಥಳ: ${itinerary.startingLocation}`,
        `• ಪ್ರವಾಸಿಗರ ಸಂಖ್ಯೆ: ${itinerary.travellerCount} (${itinerary.groupTypeLabel})`,
        `• ಪ್ರಯಾಣ ಶೈಲಿ: ${itinerary.travelStyleLabel}`,
        `• ಆದ್ಯತೆಯ ಸಾರಿಗೆ: ${itinerary.transportPreferenceLabel}`,
        `• ಚಟುವಟಿಕೆಗಳ ಪ್ರಗತಿ: ${totalStops} ರಲ್ಲಿ ${completedCount} ಚಟುವಟಿಕೆಗಳು ಪೂರ್ಣಗೊಂಡಿವೆ`,
        `• ರಚಿಸಲಾದ ಸಮಯ: ${itinerary.generatedAt}`,
        ``,
        `ಪ್ರವಾಸದ ಸಾರಾಂಶ:`,
        itinerary.summary,
        ``,
      ]
    : [
        `================================================================================`,
        `YATRION — DISCOVER KARNATAKA, DIFFERENTLY`,
        `Official Itinerary: ${itinerary.title}`,
        `ಕನ್ನಡ: ${itinerary.kannadaSubtitle}`,
        `================================================================================`,
        ``,
        `TRIP OVERVIEW:`,
        `• Duration: ${itinerary.durationDays} Days`,
        `• Starting Origin: ${itinerary.startingLocation}`,
        `• Party: ${itinerary.groupTypeLabel} (${itinerary.travellerCount} traveler${
          itinerary.travellerCount > 1 ? "s" : ""
        })`,
        `• Travel Style & Pace: ${itinerary.travelStyleLabel}`,
        `• Transport Preference: ${itinerary.transportPreferenceLabel}`,
        `• Completion Progress: ${completedCount} of ${totalStops} activities completed`,
        `• Generated At: ${itinerary.generatedAt}`,
        ``,
        `SUMMARY:`,
        itinerary.summary,
        ``,
      ];

  // Budget Breakdown Section
  if (isKn) {
    lines.push(
      `================================================================================`,
      `ಅಂದಾಜು ಬಜೆಟ್ ಮಾಹಿತಿ & ಪಾರದರ್ಶಕತೆ`,
      `================================================================================`,
      `• ಆಯ್ಕೆಮಾಡಿದ ಬಜೆಟ್ ಶ್ರೇಣಿ: ${itinerary.budgetSummary.userBudgetRange}`,
      `• ಅಂದಾಜು ಒಟ್ಟು ವೆಚ್ಚ (ಇಡೀ ತಂಡ): ${
        detailedBudget ? detailedBudget.groupTotal.formatted : itinerary.budgetSummary.indicativeEstimatedSpend
      }`,
      `• ಅಂದಾಜು ವೆಚ್ಚ (ಪ್ರತಿ ವ್ಯಕ್ತಿಗೆ): ${
        detailedBudget ? detailedBudget.perPersonTotal.formatted : "ಗುಂಪಿನ ಪ್ರಕಾರ ಲೆಕ್ಕಹಾಕಲಾಗುತ್ತದೆ"
      }`,
      `• ದೈನಂದಿನ ಅಂದಾಜು ವೆಚ್ಚ (ಪ್ರತಿ ವ್ಯಕ್ತಿಗೆ): ${
        detailedBudget ? detailedBudget.perPersonDaily.formatted : "ಲಭ್ಯವಿಲ್ಲ"
      }`,
      ``,
      `ವರ್ಗಾವಾರು ವೆಚ್ಚ ವಿವರ (ಸೂಚ್ಯ ಶ್ರೇಣಿಗಳು):`
    );
  } else {
    lines.push(
      `================================================================================`,
      `ESTIMATED BUDGET INTELLIGENCE & TRANSPARENCY`,
      `================================================================================`,
      `• Selected Budget Tier: ${itinerary.budgetSummary.userBudgetRange}`,
      `• Indicative Spend (Entire Group): ${
        detailedBudget ? detailedBudget.groupTotal.formatted : itinerary.budgetSummary.indicativeEstimatedSpend
      }`,
      `• Indicative Spend (Per Person): ${
        detailedBudget ? detailedBudget.perPersonTotal.formatted : "Calculated per group"
      }`,
      `• Indicative Daily Spend (Per Person): ${
        detailedBudget ? detailedBudget.perPersonDaily.formatted : "N/A"
      }`,
      ``,
      `CATEGORY BREAKDOWN (INDICATIVE RANGES):`
    );
  }

  if (detailedBudget && detailedBudget.categories) {
    detailedBudget.categories.forEach((cat) => {
      lines.push(
        `• ${cat.label.toUpperCase()}:`,
        `  - ${isKn ? "ಪ್ರತಿ ವ್ಯಕ್ತಿಗೆ" : "Per Traveler"}: ${cat.formattedPerPersonTotal}`,
        `  - ${isKn ? "ಇಡೀ ತಂಡಕ್ಕೆ" : "Entire Group"}: ${cat.formattedGroupTotal}`,
        `  - ${isKn ? "ಆಧಾರ / ಊಹೆ" : "Basis / Assumption"}: ${cat.basisOrAssumption}`
      );
    });
  } else {
    lines.push(
      isKn
        ? `• ಕರ್ನಾಟಕ ಪ್ರವಾಸ ಸರಾಸರಿ ವೆಚ್ಚ ಅನ್ವಯಿಸುತ್ತದೆ (~₹1,500 – ₹3,000/ದಿನಕ್ಕೆ).`
        : `• Standard Karnataka destination average applies (~₹1,500 – ₹3,000/day).`
    );
  }

  lines.push(
    ``,
    isKn ? `ಬಜೆಟ್ ಊಹೆಗಳು & ಮಾರ್ಗಸೂಚಿಗಳು:` : `BUDGET ASSUMPTIONS & GUIDELINES:`,
    detailedBudget?.assumptions?.map((a) => `• ${a}`).join("\n") ||
      `• ${itinerary.budgetSummary.pricingAssumption}`,
    ``,
    isKn ? `ಒಳಗೊಂಡಿರುವ ಸೇವೆಗಳು:` : `WHAT IS INCLUDED:`,
    detailedBudget?.inclusions?.map((i) => `✓ ${i}`).join("\n") ||
      (isKn
        ? "✓ ಸಾಮಾನ್ಯ ವಸತಿ, ಸ್ಥಳೀಯ ಊಟೋಪಚಾರ, ಪ್ರವೇಶ ಶುಲ್ಕಗಳು"
        : "✓ Standard accommodation, regional meals, local entry tickets"),
    ``,
    isKn ? `ಹೊರತುಪಡಿಸಿದ ವೆಚ್ಚಗಳು:` : `WHAT IS EXCLUDED:`,
    detailedBudget?.exclusions?.map((e) => `✗ ${e}`).join("\n") ||
      (isKn
        ? "✗ ಐಷಾರಾಮಿ ಅಪ್‌ಗ್ರೇಡ್‌ಗಳು, ವೈಯಕ್ತಿಕ ಶಾಪಿಂಗ್, ವಿಮಾನ ಶುಲ್ಕ"
        : "✗ 5-star upgrades, alcohol, personal shopping, airfares"),
    ``
  );

  // Intelligent Budget Scenarios & Savings (Part 10 Stage 2)
  if (budgetPlan) {
    const s = budgetPlan.scenarios;
    if (isKn) {
      lines.push(
        `================================================================================`,
        `ಜಾಣ್ಮೆಯ ಬಜೆಟ್ ಸನ್ನಿವೇಶಗಳ ಹೋಲಿಕೆ (ಭಾಗ 10 ಹಂತ 2)`,
        `================================================================================`,
        `1. ಬಜೆಟ್ ಸೇವರ್ (ಕಡಿಮೆ ವೆಚ್ಚ): ₹${s.budget_saver.totalCost.toLocaleString("en-IN")} (ಪ್ರತಿ ವ್ಯಕ್ತಿಗೆ: ₹${s.budget_saver.perPersonCost.toLocaleString("en-IN")})`,
        `2. ಸಮತೋಲಿತ ಪರಿಶೋಧಕ (ಶಿಫಾರಸು): ₹${s.balanced.totalCost.toLocaleString("en-IN")} (ಪ್ರತಿ ವ್ಯಕ್ತಿಗೆ: ₹${s.balanced.perPersonCost.toLocaleString("en-IN")})`,
        `3. ಪ್ರೀಮಿಯಂ ಕಂಫರ್ಟ್: ₹${s.comfort.totalCost.toLocaleString("en-IN")} (ಪ್ರತಿ ವ್ಯಕ್ತಿಗೆ: ₹${s.comfort.perPersonCost.toLocaleString("en-IN")})`,
        `• ಸಕ್ರಿಯ ಯೋಜನೆ: ${s[budgetPlan.activeScenario].nameKn}`,
        `• ತುರ್ತು ಮೀಸಲು ನಿಧಿ: ${s[budgetPlan.activeScenario].contingencyPercent}% (~₹${s[budgetPlan.activeScenario].contingencyBuffer.toLocaleString("en-IN")})`,
        `• ಗರಿಷ್ಠ ವೆಚ್ಚದ ದಿನ: ದಿನ ${budgetPlan.mostExpensiveDayNumber}`,
        ``,
        `ಪ್ರಮುಖ ಉಳಿತಾಯ ಶಿಫಾರಸುಗಳು:`
      );
      budgetPlan.recommendations.slice(0, 3).forEach((rec) => {
        lines.push(
          `• ${rec.titleKn} (ಅಂದಾಜು ಉಳಿತಾಯ: ~₹${rec.estimatedSavingsInr.toLocaleString("en-IN")})`,
          `  - ${rec.descriptionKn}`
        );
      });
      lines.push(``);
    } else {
      lines.push(
        `================================================================================`,
        `INTELLIGENT BUDGET SCENARIO COMPARISON (PART 10 STAGE 2)`,
        `================================================================================`,
        `1. Budget Saver: ₹${s.budget_saver.totalCost.toLocaleString("en-IN")} (Per Person: ₹${s.budget_saver.perPersonCost.toLocaleString("en-IN")})`,
        `2. Balanced Explorer (Recommended): ₹${s.balanced.totalCost.toLocaleString("en-IN")} (Per Person: ₹${s.balanced.perPersonCost.toLocaleString("en-IN")})`,
        `3. Comfort & Indulgence: ₹${s.comfort.totalCost.toLocaleString("en-IN")} (Per Person: ₹${s.comfort.perPersonCost.toLocaleString("en-IN")})`,
        `• Active Scenario: ${s[budgetPlan.activeScenario].nameEn}`,
        `• Emergency Contingency Buffer: ${s[budgetPlan.activeScenario].contingencyPercent}% (~₹${s[budgetPlan.activeScenario].contingencyBuffer.toLocaleString("en-IN")})`,
        `• Most Expensive Day: Day ${budgetPlan.mostExpensiveDayNumber}`,
        ``,
        `KEY COST-SAVING RECOMMENDATIONS:`
      );
      budgetPlan.recommendations.slice(0, 3).forEach((rec) => {
        lines.push(
          `• ${rec.titleEn} (Est. Savings: ~₹${rec.estimatedSavingsInr.toLocaleString("en-IN")})`,
          `  - ${rec.descriptionEn}`
        );
      });
      lines.push(``);
    }
  }

  // Warnings (if any)
  if (itinerary.warnings && itinerary.warnings.length > 0) {
    lines.push(
      `================================================================================`,
      isKn
        ? `ಪ್ರಾಯೋಗಿಕ ಎಚ್ಚರಿಕೆಗಳು & ಪ್ರಯಾಣ ಸಲಹೆಗಳು`
        : `PRACTICAL ADVISORIES & FEASIBILITY NOTICES`,
      `================================================================================`
    );
    itinerary.warnings.forEach((w) => {
      lines.push(`[!] ${w.title.toUpperCase()}:`, `    ${w.message}`, ``);
    });
  }

  // Day-by-Day Schedule
  lines.push(
    `================================================================================`,
    isKn
      ? `ದೈನಂದಿನ ವೇಳಾಪಟ್ಟಿ & ಕಸ್ಟಮ್ ಚಟುವಟಿಕೆಗಳು`
      : `DAY-BY-DAY ITINERARY & CUSTOM ACTIVITIES`,
    `================================================================================`
  );

  days.forEach((day) => {
    lines.push(
      ``,
      `--------------------------------------------------------------------------------`,
      isKn
        ? `ದಿನ ${day.dayNumber}: ${day.title}`
        : `DAY ${day.dayNumber}: ${day.title.toUpperCase()}`,
      isKn
        ? `ತಾಣ: ${day.destinationKannada} (${day.destinationName}) · ಪ್ರದೇಶ: ${day.region}`
        : `Destination: ${day.destinationName} (${day.destinationKannada}) · Region: ${day.region}`,
      isKn
        ? `ಸೂಚಿತ ವಾಸ್ತವ್ಯ ಕೇಂದ್ರ: ${day.suggestedStayArea}`
        : `Suggested Base / Stay: ${day.suggestedStayArea}`,
      isKn
        ? `ವೇಗ ಮತ್ತು ಮಾರ್ಗದರ್ಶನ: ${day.dailyPacingNote}`
        : `Pacing Guidance: ${day.dailyPacingNote}`,
      isKn
        ? `ಸಾರಿಗೆ ಮಾಹಿತಿ: ${day.transitGuidance}`
        : `Transit Advice: ${day.transitGuidance}`,
      `--------------------------------------------------------------------------------`
    );

    // Personal Day Note
    if (dayNotes[day.dayNumber]) {
      lines.push(
        ``,
        isKn
          ? `>>> ದಿನ ${day.dayNumber} ಕ್ಕೆ ವೈಯಕ್ತಿಕ ಟಿಪ್ಪಣಿ:`
          : `>>> PERSONAL NOTE FOR DAY ${day.dayNumber}:`,
        `    ${dayNotes[day.dayNumber]}`,
        ``
      );
    }

    if (day.stops.length === 0) {
      lines.push(
        isKn
          ? `(ಈ ದಿನಕ್ಕೆ ಯಾವುದೇ ಚಟುವಟಿಕೆಗಳು ಯೋಜಿತವಾಗಿಲ್ಲ)`
          : `(No scheduled activities for this day)`
      );
    } else {
      day.stops.forEach((stop, stopIdx) => {
        const stopKey = `${day.dayNumber}-${stopIdx}`;
        const isDone = completedSet.has(stopKey);
        const doneMark = isDone
          ? isKn
            ? "[✓ ಪೂರ್ಣಗೊಂಡಿದೆ]"
            : "[✓ COMPLETED]"
          : isKn
          ? "[  ಬಾಕಿ  ]"
          : "[  PENDING  ]";

        const slotMap: Record<string, string> = {
          morning: isKn ? "ಬೆಳಿಗ್ಗೆ" : "MORNING",
          afternoon: isKn ? "ಮಧ್ಯಾಹ್ನ" : "AFTERNOON",
          evening: isKn ? "ಸಂಜೆ" : "EVENING",
        };
        const slotLabel = slotMap[stop.timeOfDay] || stop.timeOfDay.toUpperCase();

        lines.push(
          ``,
          `${doneMark} [${slotLabel}] ${stop.title}`,
          `  • ${isKn ? "ಸ್ಥಳ" : "Location"}: ${stop.location}, ${stop.district}`,
          `  • ${isKn ? "ಅಂದಾಜು ಸಮಯ" : "Visit Duration"}: ${stop.estimatedDuration}`,
          `  • ${isKn ? "ವಿವರಣೆ" : "Description"}: ${stop.description}`
        );

        if (stop.mealOrRestNote) {
          lines.push(
            `  • ${isKn ? "ಆಹಾರ / ಉಪಹಾರ ಸಲಹೆ" : "Meal / Refreshment Tip"}: ${
              stop.mealOrRestNote
            }`
          );
        }
        if (stop.transitNote) {
          lines.push(
            `  • ${isKn ? "ಸಾರಿಗೆ / ಮಾರ್ಗ ಸಲಹೆ" : "Transit / Routing Tip"}: ${
              stop.transitNote
            }`
          );
        }

        // Custom note on stop
        if (stopNotes[stopKey]) {
          lines.push(
            `  • ${isKn ? "ವೈಯಕ್ತಿಕ ಟಿಪ್ಪಣಿ" : "Custom Note"}: ${stopNotes[stopKey]}`
          );
        }
      });
    }
  });

  // Smart Route Optimization Summary (Part 10)
  if (optimizedRoute) {
    if (isKn) {
      lines.push(
        ``,
        `================================================================================`,
        `ಸ್ಮಾರ್ಟ್ ಮಾರ್ಗ ಆಪ್ಟಿಮೈಸೇಶನ್ ವಿವರ (ಭಾಗ 10)`,
        `================================================================================`,
        `• ಒಟ್ಟು ರಸ್ತೆ ದೂರ (ಅಂದಾಜು): ~${optimizedRoute.totalEstimatedDistanceKm} km`,
        `• ಒಟ್ಟು ಪ್ರಯಾಣ ಸಮಯ (ಅಂದಾಜು): ~${optimizedRoute.totalEstimatedTransitHours} ಗಂಟೆಗಳು`,
        `• ಪ್ರಯಾಣದ ತೀವ್ರತೆ: ${optimizedRoute.intensity} (${optimizedRoute.intensityReasonKn})`,
        `• ಯೋಜಿತ ನಿಲುಗಡೆಗಳು: ${optimizedRoute.totalStopsCount}`,
        `• ಭೂಪ್ರದೇಶ ಗುಣಕಗಳು: ಪಶ್ಚಿಮ ಘಟ್ಟಗಳು 1.48x, ಕರಾವಳಿ 1.28x, ಮೈದಾನ 1.22x`
      );
    } else {
      lines.push(
        ``,
        `================================================================================`,
        `SMART ROUTE OPTIMIZATION (PART 10)`,
        `================================================================================`,
        `• Total Road Distance (Est.): ~${optimizedRoute.totalEstimatedDistanceKm} km`,
        `• Total Transit Time (Est.): ~${optimizedRoute.totalEstimatedTransitHours} hours`,
        `• Travel Intensity: ${optimizedRoute.intensity.toUpperCase()} (${optimizedRoute.intensityReasonEn})`,
        `• Curated Stops: ${optimizedRoute.totalStopsCount}`,
        `• Terrain Detour Multipliers: Western Ghats 1.48x, Coastal NH 66 1.28x, Plains 1.22x`
      );
    }
  }

  // Part 10 Stage 3: Saved Hidden Gems & Offbeat Experiences
  if (savedGemIds && savedGemIds.length > 0) {
    const savedExperiences = savedGemIds
      .map((id) => getExperienceById(id))
      .filter((exp): exp is KarnatakaExperience => Boolean(exp));

    if (savedExperiences.length > 0) {
      lines.push(
        ``,
        `================================================================================`,
        isKn
          ? `ಉಳಿಸಿದ ಗುಪ್ತ ರತ್ನಗಳು & ಅಪರೂಪದ ತಾಣಗಳು (ಭಾಗ 10 ಹಂತ 3):`
          : `SAVED HIDDEN GEMS & OFFBEAT EXPERIENCES (PART 10 STAGE 3):`,
        `================================================================================`
      );
      savedExperiences.forEach((gem, idx) => {
        lines.push(
          ``,
          `${idx + 1}. ${isKn ? gem.titleKn : gem.titleEn} (${gem.district})`,
          `   ${isKn ? "ವಿಭಾಗ" : "Category"}: ${isKn ? gem.categoryLabelKn : gem.categoryLabelEn} | ${isKn ? "ವೆಚ್ಚ" : "Budget"}: ${gem.estimatedCostInr > 0 ? `~₹${gem.estimatedCostInr}` : isKn ? "ಉಚಿತ" : "Free"}`,
          `   ${isKn ? "ವಿಶೇಷತೆ" : "Why Special"}: ${isKn ? gem.whySpecialKn : gem.whySpecialEn}`,
          `   ${isKn ? "ಪರಿಶೀಲಿತ ಮೂಲ" : "Verified Source"}: ${isKn ? gem.sourceCitationKn : gem.sourceCitationEn}`,
          `   ${isKn ? "ಗೂಗಲ್ ಮ್ಯಾಪ್ಸ್" : "Google Maps"}: ${gem.googleMapsSearchUrl}`
        );
      });
    }
  }

  // Part 10 Stage 4: Group Trip Planning & Collaborative Decisions
  if (groupState && groupState.config.travellers.length > 0) {
    const config = groupState.config;
    const compatibility = calculateGroupCompatibility(config.travellers);
    const expenseSummary = calculateGroupExpenseSummary(groupState.expenses, config.travellers);

    if (isKn) {
      lines.push(
        ``,
        `================================================================================`,
        `ಗುಂಪು ಪ್ರವಾಸ ಯೋಜನೆ & ಸಹಯೋಗದ ನಿರ್ಧಾರಗಳು (ಭಾಗ 10 ಹಂತ 4)`,
        `ತಂಡದ ಹೆಸರು: ${config.groupName} | ಸಂಘಟಕರು: ${config.organizerName}`,
        `================================================================================`,
        `ಪ್ರವಾಸಿಗರ ಪಟ್ಟಿ (${config.travellers.length} ಜನರು):`
      );

      config.travellers.forEach((t, i) => {
        const typeStr = t.type === "adult" ? "ವಯಸ್ಕರು" : "ಮಕ್ಕಳು";
        const paceStr =
          t.preferredPace === "relaxed" ? "ನಿರಾಳ" : t.preferredPace === "packed" ? "ವೇಗದ" : "ಸಮತೋಲಿತ";
        const budgetStr = t.individualBudgetLimit ? `₹${t.individualBudgetLimit.toLocaleString("en-IN")}` : "ಮಿತಿ ನಿಗದಿಯಾಗಿಲ್ಲ";
        lines.push(
          `  ${i + 1}. ${t.name} (${typeStr}) — ವೇಗ: ${paceStr} | ಬಜೆಟ್ ಮಿತಿ: ${budgetStr} | ಆಹಾರ: ${t.foodPreference}`,
          `     ಆಸಕ್ತಿಗಳು: ${t.interests.join(", ")}`
        );
        if (t.accessibilityRequirements && t.accessibilityRequirements.length > 0 && !t.accessibilityRequirements.includes("none")) {
          lines.push(`     ಪ್ರವೇಶ ಅಗತ್ಯತೆಗಳು: ${t.accessibilityRequirements.join(", ")}`);
        }
      });

      lines.push(
        ``,
        `ಗುಂಪು ಹೊಂದಾಣಿಕೆ ಅಂಕ: ${compatibility.overallScore}/100`,
        `• ಆಸಕ್ತಿ ಹೊಂದಾಣಿಕೆ: ${compatibility.breakdown.interestAlignment}/40`,
        `• ವೇಗ ಹೊಂದಾಣಿಕೆ: ${compatibility.breakdown.paceAlignment}/25`,
        `• ಬಜೆಟ್ ಸಾಮರಸ್ಯ: ${compatibility.breakdown.budgetHarmony}/20`,
        `• ಪ್ರವೇಶ್ಯತೆ: ${compatibility.breakdown.accessibilityFeasibility}/15`,
        `• ವೇಗ ಒಮ್ಮತ: ${compatibility.paceConsensus === "relaxed" ? "ನಿರಾಳ" : compatibility.paceConsensus === "packed" ? "ವೇಗದ" : "ಸಮತೋಲಿತ"}`
      );

      if (compatibility.sharedInterests.length > 0) {
        lines.push(`ಸಾಮಾನ್ಯ ಆಸಕ್ತಿಗಳು:`);
        compatibility.sharedInterests.forEach((si) => {
          lines.push(
            `  • ${si.labelKn}: ${si.percentage}% ಪ್ರವಾಸಿಗರು (${si.supporterCount}/${config.travellers.length}) ${si.isUnanimous ? "[ಸರ್ವಾನುಮತ]" : ""}`
          );
        });
      }

      if (compatibility.conflictingInterests.length > 0) {
        lines.push(``, `ಆಸಕ್ತಿ ಸಂಘರ್ಷಗಳು & ಪರಿಹಾರ ಸಲಹೆಗಳು:`);
        compatibility.conflictingInterests.forEach((ci) => {
          lines.push(
            `  • ${ci.descriptionKn}`,
            `    ಸಲಹೆ: ${ci.suggestedCompromiseKn}`
          );
        });
      }

      // Group Activity Decisions
      const decisionEntries = Object.entries(groupState.decisions);
      if (decisionEntries.length > 0) {
        const accepted = decisionEntries.filter(([, s]) => s === "accepted");
        const optional = decisionEntries.filter(([, s]) => s === "optional");
        lines.push(
          ``,
          `ಚಟುವಟಿಕೆಗಳ ಸಾಮೂಹಿಕ ನಿರ್ಧಾರಗಳು:`,
          `  • ಒಪ್ಪಿಗೆಯಾದ ಸಾಮೂಹಿಕ ಚಟುವಟಿಕೆಗಳು: ${accepted.length}`,
          `  • ಐಚ್ಛಿಕ ಉಪಗುಂಪು ಚಟುವಟಿಕೆಗಳು: ${optional.length}`
        );
      }

      // Expenses & Settlement
      lines.push(
        ``,
        `ವೆಚ್ಚ ಹಂಚಿಕೆ & ಲೆಕ್ಕಾಚಾರ:`,
        `  • ಒಟ್ಟು ದಾಖಲಾದ ವೆಚ್ಚ: ₹${expenseSummary.totalExpenses.toLocaleString("en-IN")}`
      );
      if (expenseSummary.settlementTransfers.length > 0) {
        lines.push(`  ಹಣ ಪಾವತಿ ಇತ್ಯರ್ಥ ("ಯಾರು ಯಾರಿಗೆ ನೀಡಬೇಕು"):`);
        expenseSummary.settlementTransfers.forEach((st) => {
          lines.push(`    • ${st.fromTravellerName} → ${st.toTravellerName}: ₹${st.amountInr.toLocaleString("en-IN")}`);
        });
      } else if (expenseSummary.totalExpenses > 0) {
        lines.push(`    (ಎಲ್ಲಾ ವೆಚ್ಚಗಳು ಸಮನಾಗಿ ಇತ್ಯರ್ಥಗೊಂಡಿವೆ)`);
      }
    } else {
      lines.push(
        ``,
        `================================================================================`,
        `GROUP TRIP PLANNING & COLLABORATIVE DECISIONS (PART 10 STAGE 4)`,
        `Group Name: ${config.groupName} | Organizer: ${config.organizerName}`,
        `================================================================================`,
        `TRAVELLER ROSTER (${config.travellers.length} members):`
      );

      config.travellers.forEach((t, i) => {
        const typeStr = t.type === "adult" ? "Adult" : "Child";
        const budgetStr = t.individualBudgetLimit ? `₹${t.individualBudgetLimit.toLocaleString("en-IN")}` : "No limit set";
        lines.push(
          `  ${i + 1}. ${t.name} (${typeStr}) — Pace: ${t.preferredPace} | Budget Ceiling: ${budgetStr} | Food: ${t.foodPreference}`,
          `     Interests: ${t.interests.join(", ")}`
        );
        if (t.accessibilityRequirements && t.accessibilityRequirements.length > 0 && !t.accessibilityRequirements.includes("none")) {
          lines.push(`     Accessibility: ${t.accessibilityRequirements.join(", ")}`);
        }
      });

      lines.push(
        ``,
        `GROUP COMPATIBILITY SCORE: ${compatibility.overallScore}/100`,
        `• Interest Alignment: ${compatibility.breakdown.interestAlignment}/40`,
        `• Pace Alignment: ${compatibility.breakdown.paceAlignment}/25`,
        `• Budget Harmony: ${compatibility.breakdown.budgetHarmony}/20`,
        `• Accessibility Feasibility: ${compatibility.breakdown.accessibilityFeasibility}/15`,
        `• Group Pace Consensus: ${compatibility.paceConsensus.toUpperCase()}`
      );

      if (compatibility.sharedInterests.length > 0) {
        lines.push(`SHARED INTERESTS:`);
        compatibility.sharedInterests.forEach((si) => {
          lines.push(
            `  • ${si.labelEn}: ${si.percentage}% of members (${si.supporterCount}/${config.travellers.length}) ${si.isUnanimous ? "[UNANIMOUS]" : ""}`
          );
        });
      }

      if (compatibility.conflictingInterests.length > 0) {
        lines.push(``, `INTEREST CONFLICTS & COMPROMISES:`);
        compatibility.conflictingInterests.forEach((ci) => {
          lines.push(
            `  • ${ci.descriptionEn}`,
            `    Compromise: ${ci.suggestedCompromiseEn}`
          );
        });
      }

      // Group Activity Decisions
      const decisionEntries = Object.entries(groupState.decisions);
      if (decisionEntries.length > 0) {
        const accepted = decisionEntries.filter(([, s]) => s === "accepted");
        const optional = decisionEntries.filter(([, s]) => s === "optional");
        lines.push(
          ``,
          `ACTIVITY DECISIONS:`,
          `  • Accepted Group Consensus Activities: ${accepted.length}`,
          `  • Optional Subgroup Excursions: ${optional.length}`
        );
      }

      // Expenses & Settlement
      lines.push(
        ``,
        `EXPENSE SPLITTING & SETTLEMENTS:`,
        `  • Total Expenses Logged: ₹${expenseSummary.totalExpenses.toLocaleString("en-IN")}`
      );
      if (expenseSummary.settlementTransfers.length > 0) {
        lines.push(`  Settlement Transfers ("Who Owes Whom"):`);
        expenseSummary.settlementTransfers.forEach((st) => {
          lines.push(`    • ${st.fromTravellerName} owes ${st.toTravellerName}: ₹${st.amountInr.toLocaleString("en-IN")}`);
        });
      } else if (expenseSummary.totalExpenses > 0) {
        lines.push(`    (All expenses are balanced / settled)`);
      }
    }
  }

  // Footer & Disclaimer
  lines.push(
    ``,
    `================================================================================`,
    isKn
      ? `ಕರ್ನಾಟಕ ಪ್ರವಾಸಿಗರಿಗೆ ಪ್ರಮುಖ ಸಲಹೆಗಳು:`
      : `PRACTICAL REMINDERS FOR KARNATAKA TRAVEL:`,
    isKn
      ? `• ದೇವಾಲಯ ಸಮಯ: ಪ್ರಮುಖ ದೇವಾಲಯಗಳ ಗರ್ಭಗುಡಿ ಮಧ್ಯಾಹ್ನ 12:30 ರಿಂದ 4:30 ರವರೆಗೆ ಮುಚ್ಚಿರುತ್ತದೆ.`
      : `• Morning Temples: Many temple sanctums close between 12:30 PM and 4:30 PM.`,
    isKn
      ? `• ಉಡುಪು ಸಂಹಿತೆ: ಸಕ್ರಿಯ ದೇವಾಲಯಗಳಲ್ಲಿ ಭುಜ ಮತ್ತು ಮೊಣಕಾಲು ಮುಚ್ಚುವ ವಸ್ತ್ರ ಧರಿಸುವುದು ಕಡ್ಡಾಯ.`
      : `• Dress Code: Modest clothing covering shoulders and knees required at active temples.`,
    isKn
      ? `• ಅರಣ್ಯ ಸಫಾರಿ: ಬಂಡೀಪುರ ಮತ್ತು ಕಬಿನಿ ಸಫಾರಿಗಳನ್ನು ಅಧಿಕೃತ ಜಂಗಲ್ ಲಾಡ್ಜಸ್ ಪೋರ್ಟಲ್ ಮೂಲಕ ಮೊದಲೇ ಕಾಯ್ದಿರಿಸಿ.`
      : `• Forest & Wildlife: Bandipur/Kabini safaris must be booked through official Jungle Lodges or Forest Dept portals.`,
    isKn
      ? `• ಜಲಸಂಚಯನ: ಮರುಬಳಕೆಯ ನೀರಿನ ಬಾಟಲಿಗಳನ್ನು ಕೊಂಡೊಯ್ಯಿರಿ; ಪಶ್ಚಿಮ ಘಟ್ಟಗಳು & ಕರಾವಳಿಯಲ್ಲಿ ಸಾಕಷ್ಟು ನೀರು ಕುಡಿಯಿರಿ.`
      : `• Hydration: Carry reusable water bottles; Western Ghats & coastal regions require steady hydration.`,
    `================================================================================`,
    isKn
      ? `ಯಾತ್ರಿಯಾನ್ (Yatrion) — ಕರ್ನಾಟಕವನ್ನು ಅನ್ವೇಷಿಸಿ, ವಿಭಿನ್ನವಾಗಿ.`
      : `Yatrion — Discover Karnataka, differently.`,
    isKn
      ? `ಕನ್ನಡ ಡಿಜಿಟಲ್ ಇನ್ನೋವೇಶನ್ ಹ್ಯಾಕಥಾನ್ 2026 ಗಾಗಿ ಅಭಿವೃದ್ಧಿಪಡಿಸಲಾಗಿದೆ.`
      : `Built for the Kannada Digital Innovation Hackathon 2026.`,
    isKn
      ? `ಹಕ್ಕುತ್ಯಾಗ: ಋತು ಮತ್ತು ಸ್ಥಳೀಯ ಪರಿಸ್ಥಿತಿಗಳಿಗೆ ಅನುಗುಣವಾಗಿ ನೈಜ ವೆಚ್ಚಗಳು ಮತ್ತು ಸಮಯ ಬದಲಾಗಬಹುದು.`
      : `Disclaimer: Actual expenses and timings vary by season and local conditions.`,
    `================================================================================`
  );

  return lines.join("\n");
}

/**
 * Formats a single day's plan as readable text for copying.
 */
export function formatSingleDayAsText(
  day: ItineraryDay,
  dayNote?: string,
  stopNotes: Record<string, string> = {},
  completedSet: Set<string> = new Set(),
  language: "en" | "kn" = "en"
): string {
  const isKn = language === "kn";

  const lines: string[] = isKn
    ? [
        `==================================================`,
        `ಯಾತ್ರಿಯಾನ್ (YATRION) — ದಿನ ${day.dayNumber}: ${day.title}`,
        `ತಾಣ: ${day.destinationKannada} (${day.destinationName})`,
        `ವಾಸ್ತವ್ಯ ಕೇಂದ್ರ: ${day.suggestedStayArea}`,
        `==================================================`,
        `ಸಾರಿಗೆ: ${day.transitGuidance}`,
        `ವೇಗ: ${day.dailyPacingNote}`,
      ]
    : [
        `==================================================`,
        `YATRION — DAY ${day.dayNumber}: ${day.title}`,
        `Destination: ${day.destinationName} (${day.destinationKannada})`,
        `Base / Stay: ${day.suggestedStayArea}`,
        `==================================================`,
        `Transit: ${day.transitGuidance}`,
        `Pacing: ${day.dailyPacingNote}`,
      ];

  if (dayNote) {
    lines.push(``, isKn ? `ವೈಯಕ್ತಿಕ ಟಿಪ್ಪಣಿ:` : `PERSONAL NOTE:`, dayNote);
  }

  lines.push(``, isKn ? `ವೇಳಾಪಟ್ಟಿ:` : `SCHEDULE:`);

  if (day.stops.length === 0) {
    lines.push(
      isKn ? `(ಯಾವುದೇ ಚಟುವಟಿಕೆಗಳು ಯೋಜಿತವಾಗಿಲ್ಲ)` : `(No activities scheduled)`
    );
  } else {
    day.stops.forEach((stop, idx) => {
      const stopKey = `${day.dayNumber}-${idx}`;
      const isDone = completedSet.has(stopKey);
      const mark = isDone ? "[✓]" : "[ ]";
      const slotMap: Record<string, string> = {
        morning: isKn ? "ಬೆಳಿಗ್ಗೆ" : "MORNING",
        afternoon: isKn ? "ಮಧ್ಯಾಹ್ನ" : "AFTERNOON",
        evening: isKn ? "ಸಂಜೆ" : "EVENING",
      };
      const slotLabel = slotMap[stop.timeOfDay] || stop.timeOfDay.toUpperCase();

      lines.push(
        ``,
        `${mark} ${slotLabel}: ${stop.title} (${stop.estimatedDuration})`,
        `   ${stop.description}`
      );
      if (stop.mealOrRestNote) {
        lines.push(`   ${isKn ? "ಆಹಾರ" : "Food"}: ${stop.mealOrRestNote}`);
      }
      if (stop.transitNote) {
        lines.push(`   ${isKn ? "ಸಾರಿಗೆ" : "Transit"}: ${stop.transitNote}`);
      }
      if (stopNotes[stopKey]) {
        lines.push(`   ${isKn ? "ಟಿಪ್ಪಣಿ" : "Note"}: ${stopNotes[stopKey]}`);
      }
    });
  }

  lines.push(
    ``,
    `--------------------------------------------------`,
    isKn
      ? `ಯಾತ್ರಿಯಾನ್ — ಕರ್ನಾಟಕವನ್ನು ಅನ್ವೇಷಿಸಿ, ವಿಭಿನ್ನವಾಗಿ.`
      : `Yatrion — Discover Karnataka, differently.`
  );

  return lines.join("\n");
}

/**
 * Triggers a browser download of the plain-text itinerary file.
 */
export function downloadItineraryTextFile(content: string, filename?: string): boolean {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return false;
  }

  try {
    const safeName =
      filename ||
      `yatrion-karnataka-itinerary-${new Date().toISOString().slice(0, 10)}.txt`;

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = safeName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    return true;
  } catch (err) {
    console.error("Yatrion: Failed to download text file", err);
    return false;
  }
}
