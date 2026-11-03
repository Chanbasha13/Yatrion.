import type {
  BudgetOptimizationInputs,
  BudgetScenario,
  BudgetScenarioType,
  ExpenseCategoryEstimate,
  ExpenseCategoryKey,
  DailyExpenseEstimate,
  OptimizedBudgetPlan,
} from "./budget-types";
import {
  getDestinationCostMultiplier,
  estimateTransportCost,
  estimateAccommodationCost,
  estimateFoodCost,
  estimateActivitiesCost,
  estimateMiscellaneousCost,
  getContingencyPercentage,
} from "./budget-estimates";
import { generateBudgetRecommendations } from "./budget-recommendations";
import { DESTINATIONS } from "../destinations-data";
import type { OptimizedRoutePlan } from "../routes/route-types";
import type { GeneratedItinerary } from "../itinerary-engine";
import type { TripPreferences } from "../planner-types";

export interface ItineraryBudgetOptions {
  itinerary: GeneratedItinerary;
  preferences?: TripPreferences;
  routePlan?: OptimizedRoutePlan;
  scenarioKey?: BudgetScenarioType;
  targetBudget?: number | null;
  travellerCount?: number;
}

const TIER_TARGET_LIMITS: Record<string, number | null> = {
  "under-3k": 3000,
  "3k-7k": 7000,
  "7k-15k": 15000,
  "15k-30k": 30000,
  "30k-plus": 50000,
  flexible: null,
};

/**
 * Builds a single complete BudgetScenario with exact category breakdowns,
 * percentages, remaining budget calculation, and clear transparent basis.
 */
function buildScenario(
  scenarioType: BudgetScenarioType,
  inputs: BudgetOptimizationInputs,
  targetGroupBudget: number | null
): BudgetScenario {
  const duration = Math.max(1, inputs.durationDays || 1);
  const travellers = Math.max(1, inputs.travellerCount || 1);
  const transportPref = inputs.transportPreference || "public";
  const costMultiplier = getDestinationCostMultiplier(inputs.destinationIds);

  // 1. Category Estimates
  const transportRes = estimateTransportCost(
    scenarioType,
    transportPref,
    duration,
    travellers,
    inputs.routeDistanceKm,
    inputs.hasWesternGhats
  );

  const accomRes = estimateAccommodationCost(
    scenarioType,
    duration,
    travellers,
    costMultiplier
  );

  const foodRes = estimateFoodCost(scenarioType, duration, travellers);

  const actRes = estimateActivitiesCost(scenarioType, duration, travellers);

  const miscRes = estimateMiscellaneousCost(scenarioType, duration, travellers);

  // 2. Subtotal & Contingency
  const subtotal =
    transportRes.transportGroupCost +
    transportRes.localTravelGroupCost +
    accomRes.groupCost +
    foodRes.groupCost +
    actRes.groupCost +
    miscRes.groupCost;

  const contingencyPercent = getContingencyPercentage(scenarioType);
  const contingencyBuffer = Math.round(subtotal * (contingencyPercent / 100));
  const totalCost = subtotal + contingencyBuffer;

  const perPersonCost = Math.round(totalCost / travellers);
  const dailyPerPersonCost = Math.round(perPersonCost / duration);

  const remainingBudget =
    targetGroupBudget !== null ? targetGroupBudget - totalCost : null;
  const isOverBudget = remainingBudget !== null && remainingBudget < 0;

  // 3. Category Objects
  const createCategory = (
    key: ExpenseCategoryKey,
    labelEn: string,
    labelKn: string,
    estimatedCost: number,
    basisEn: string,
    basisKn: string,
    isRouteGrounded: boolean,
    incEn: string[],
    incKn: string[],
    excEn: string[],
    excKn: string[]
  ): ExpenseCategoryEstimate => ({
    key,
    labelEn,
    labelKn,
    estimatedCost,
    perPersonCost: Math.round(estimatedCost / travellers),
    dailyCost: Math.round(estimatedCost / duration),
    percentageOfTotal:
      totalCost > 0 ? Math.round((estimatedCost / totalCost) * 1000) / 10 : 0,
    basisOrAssumptionEn: basisEn,
    basisOrAssumptionKn: basisKn,
    isRouteGrounded,
    valueType: isRouteGrounded ? "verified" : "estimated",
    includedNotesEn: incEn,
    includedNotesKn: incKn,
    excludedNotesEn: excEn,
    excludedNotesKn: excKn,
  });

  const categories: ExpenseCategoryEstimate[] = [
    createCategory(
      "transport",
      "Intercity Transport",
      "ನಗರಗಳ ನಡುವಿನ ಸಾರಿಗೆ",
      transportRes.transportGroupCost,
      transportRes.transportBasisEn,
      transportRes.transportBasisKn,
      transportRes.isGroundedByRoute,
      [
        "Intercity highway fuel, tolls, or scheduled state coach tickets",
        "Driver day-allowance if private tourist cab is hired",
      ],
      [
        "ನಗರಗಳ ನಡುವಿನ ಇಂಧನ, ಟೋಲ್ ಅಥವಾ ನಿಗದಿತ ಬಸ್ ಟಿಕೆಟ್‌ಗಳು",
        "ಖಾಸಗಿ ಕ್ಯಾಬ್ ಇದ್ದಲ್ಲಿ ಚಾಲಕನ ದಿನಭತ್ಯೆ",
      ],
      ["Last-minute surge premiums", "Station porter tips"],
      ["ಕೊನೆಯ ಕ್ಷಣದ ತುರ್ತು ಶುಲ್ಕಗಳು", "ಲಗೇಜ್ ಕೂಲಿ ಶುಲ್ಕಗಳು"]
    ),
    createCategory(
      "accommodation",
      "Accommodation & Lodging",
      "ವಾಸ್ತವ್ಯ ಮತ್ತು ವಸತಿ",
      accomRes.groupCost,
      accomRes.basisEn,
      accomRes.basisKn,
      false,
      [
        `Double-occupancy rooms (${accomRes.roomsNeeded} room(s))`,
        "Basic amenities (clean linen, private bath, hot water)",
        "Applicable municipal lodging taxes",
      ],
      [
        `ಡಬಲ್ ಆಕ್ಯುಪೆನ್ಸಿ ಕೊಠಡಿಗಳು (${accomRes.roomsNeeded} ಕೊಠಡಿಗಳು)`,
        "ಮೂಲಭೂತ ಸೌಕರ್ಯಗಳು (ಸ್ವಚ್ಛ ಹಾಸಿಗೆ, ಬಿಸಿನೀರು)",
        "ಸ್ಥಳೀಯ ವಸತಿ ತೆರಿಗೆಗಳು",
      ],
      ["Peak holiday surcharges (Dasara/New Year)", "Room service & laundry"],
      ["ಹಬ್ಬದ ದಿನಗಳ ಹೆಚ್ಚುವರಿ ಶುಲ್ಕಗಳು", "ರೂಮ್ ಸರ್ವೀಸ್ & ಲಾಂಡ್ರಿ"]
    ),
    createCategory(
      "food",
      "Food & Dining",
      "ಆಹಾರ ಮತ್ತು ಊಟೋಪಹಾರ",
      foodRes.groupCost,
      foodRes.basisEn,
      foodRes.basisKn,
      false,
      [
        "3 daily regional meals (breakfast, lunch, dinner)",
        "Traditional Karnataka filter coffee or tea stops",
      ],
      [
        "ದಿನಕ್ಕೆ 3 ಪ್ರಾದೇಶಿಕ ಊಟಗಳು (ಉಪಹಾರ, ಮಧ್ಯಾಹ್ನ, ರಾತ್ರಿ)",
        "ಸಾಂಪ್ರದಾಯಿಕ ಕರ್ನಾಟಕ ಫಿಲ್ಟರ್ ಕಾಫಿ ಅಥವಾ ಚಹಾ",
      ],
      ["Bar bills & alcohol", "Imported snacks & fine-dining buffets"],
      ["ಮದ್ಯಪಾನ & ಬಾರ್ ಬಿಲ್‌ಗಳು", "ರೆಸಾರ್ಟ್ ದುಬಾರಿ ಬಫೆಗಳು"]
    ),
    createCategory(
      "localTravel",
      "Local Sightseeing Transit",
      "ಸ್ಥಳೀಯ ವೀಕ್ಷಣಾ ಸಂಚಾರ",
      transportRes.localTravelGroupCost,
      transportRes.localBasisEn,
      transportRes.localBasisKn,
      false,
      [
        transportRes.isLocalCoveredByVehicle
          ? "Sightseeing covered by trip vehicle; nominal parking"
          : "Town auto-rickshaws, shared shuttles, and station drops",
      ],
      [
        transportRes.isLocalCoveredByVehicle
          ? "ಟ್ರಿಪ್ ವಾಹನದಲ್ಲೇ ವೀಕ್ಷಣೆ ಸೇರಿದೆ; ನಾಮಮಾತ್ರದ ಪಾರ್ಕಿಂಗ್ ಶುಲ್ಕ"
          : "ಸ್ಥಳೀಯ ಆಟೋರಿಕ್ಷಾ ಮತ್ತು ಶಟಲ್ ಪ್ರಯಾಣ",
      ],
      ["Waiting charges for unmetered autos", "Special night auto surcharges"],
      ["ಮೀಟರ್ ಇಲ್ಲದ ಆಟೋ ಕಾಯುವಿಕೆ ಶುಲ್ಕ", "ರಾತ್ರಿ ಸಮಯದ ವಿಶೇಷ ದರಗಳು"]
    ),
    createCategory(
      "activities",
      "Activities & Monument Passes",
      "ಚಟುವಟಿಕೆಗಳು & ಸ್ಮಾರಕ ಪಾಸ್‌ಗಳು",
      actRes.groupCost,
      actRes.basisEn,
      actRes.basisKn,
      false,
      [
        "Verified ASI monument tickets (Indian national rates)",
        "Mysore Palace entry and regional coracle boat ride",
      ],
      [
        "ಪರಿಶೀಲಿಸಿದ ASI ಸ್ಮಾರಕ ಪ್ರವೇಶ ಶುಲ್ಕಗಳು",
        "ಮೈಸೂರು ಅರಮನೆ ಪ್ರವೇಶ ಹಾಗೂ ತುಂಗಭದ್ರಾ ತೆಪ್ಪದ ಸವಾರಿ",
      ],
      ["Foreign national differential fees", "DSLR camera permits"],
      ["ವಿದೇಶಿ ಪ್ರವಾಸಿಗರ ಪ್ರತ್ಯೇಕ ಶುಲ್ಕಗಳು", "ಕ್ಯಾಮೆರಾ ಅನುಮತಿ ಶುಲ್ಕ"]
    ),
    createCategory(
      "miscellaneous",
      "Hydration & Incidental Expenses",
      "ನೀರು ಮತ್ತು ಇತರೆ ವೆಚ್ಚಗಳು",
      miscRes.groupCost,
      miscRes.basisEn,
      miscRes.basisKn,
      false,
      [
        "Packaged drinking water / refills",
        "Temple footwear counters and mobile battery charging",
      ],
      [
        "ಕುಡಿಯುವ ನೀರು ಮತ್ತು ಜಲಸಂಚಯನ",
        "ದೇವಾಲಯದ ಪಾದರಕ್ಷೆ ಸ್ಟ್ಯಾಂಡ್ ಹಾಗೂ ತುರ್ತು ವೆಚ್ಚಗಳು",
      ],
      ["Souvenir shopping and silk sarees", "Spices and coffee purchases"],
      ["ರೇಷ್ಮೆ ಸೀರೆಗಳು ಮತ್ತು ಸ್ಮರಣಿಕೆಗಳು", "ಮಸಾಲೆ ಪದಾರ್ಥ ಮತ್ತು ಕಾಫಿ ಪುಡಿ ಖರೀದಿ"]
    ),
    createCategory(
      "contingency",
      `Emergency Contingency Buffer (${contingencyPercent}%)`,
      `ತುರ್ತು ಮೀಸಲು ನಿಧಿ (${contingencyPercent}%)`,
      contingencyBuffer,
      `${contingencyPercent}% safety provision for tire repairs, sudden weather shifts, or minor medical needs.`,
      `ಪಂಕ್ಚರ್, ಹವಾಮಾನ ಬದಲಾವಣೆ ಅಥವಾ ಸಣ್ಣಪುಟ್ಟ ತುರ್ತು ವೆಚ್ಚಗಳಿಗೆ ${contingencyPercent}% ಸುರಕ್ಷತಾ ನಿಧಿ.`,
      false,
      ["Tire puncture repairs / emergency cab re-hire", "First-aid medical expenses"],
      ["ಟೈರ್ ಪಂಕ್ಚರ್ / ತುರ್ತು ಟ್ಯಾಕ್ಸಿ ಮರು-ಬುಕಿಂಗ್", "ಪ್ರಥಮ ಚಿಕಿತ್ಸೆ ಮತ್ತು ಔಷಧಿಗಳು"],
      ["Major mechanical vehicle breakdown insurance", "Hospitalization"],
      ["ವಾಹನದ ಪ್ರಮುಖ ದುರಸ್ತಿ ವಿಮೆ", "ಆಸ್ಪತ್ರೆ ವೆಚ್ಚಗಳು"]
    ),
  ];

  const costCategoryPercentages: Record<ExpenseCategoryKey, number> = {
    transport: categories[0].percentageOfTotal,
    accommodation: categories[1].percentageOfTotal,
    food: categories[2].percentageOfTotal,
    localTravel: categories[3].percentageOfTotal,
    activities: categories[4].percentageOfTotal,
    miscellaneous: categories[5].percentageOfTotal,
    contingency: categories[6].percentageOfTotal,
  };

  const scenarioMeta: Record<
    BudgetScenarioType,
    {
      nameEn: string;
      nameKn: string;
      taglineEn: string;
      taglineKn: string;
      descriptionEn: string;
      descriptionKn: string;
      badgeColor: string;
    }
  > = {
    budget_saver: {
      nameEn: "Budget Saver",
      nameKn: "ಬಜೆಟ್ ಸೇವರ್ (ಕಡಿಮೆ ವೆಚ್ಚ)",
      taglineEn: "Smart, economical travel preserving key Karnataka heritage",
      taglineKn: "ಕರ್ನಾಟಕದ ಪರಂಪರೆಯನ್ನು ಉಳಿಸಿಕೊಂಡು ಕನಿಷ್ಠ ವೆಚ್ಚದ ಜಾಣ್ಮೆಯ ಪ್ರವಾಸ",
      descriptionEn:
        "Utilizes state transport (KSRTC), clean budget guesthouses, local Darshinis, and verified ASI passes to keep spending minimal.",
      descriptionKn:
        "KSRTC ಬಸ್‌ಗಳು, ಶುದ್ಧ ಬಜೆಟ್ ವಸತಿ, ದರ್ಶಿನಿ ಉಪಹಾರ ಮತ್ತು ಅಧಿಕೃತ ASI ಪಾಸ್‌ಗಳನ್ನು ಬಳಸುವ ಮಿತವ್ಯಯದ ಯೋಜನೆ.",
      badgeColor: "bg-emerald-100 text-emerald-900 border-emerald-300",
    },
    balanced: {
      nameEn: "Balanced Explorer",
      nameKn: "ಸಮತೋಲಿತ ಪರಿಶೋಧಕ (ಹೆಚ್ಚು ಜನಪ್ರಿಯ)",
      taglineEn: "Comfort, local homestays & dependable mobility",
      taglineKn: "ಆರಾಮದಾಯಕ ವಸತಿ, ಖಾಸಗಿ ಸಂಚಾರ & ಸಮೃದ್ಧ ಅನುಭವ",
      descriptionEn:
        "Strikes the ideal equilibrium between cost and comfort with authentic heritage homestays, private cab/self-drive, and sit-down regional thalis.",
      descriptionKn:
        "ಹೆರಿಟೇಜ್ ಹೋಂಸ್ಟೇ, ಖಾಸಗಿ ಕ್ಯಾಬ್ ಅಥವಾ ಸ್ವಂತ ಡ್ರೈವ್ ಹಾಗೂ ಸ್ಥಳೀಯ ರೆಸ್ಟೋರೆಂಟ್‌ಗಳ ಪರಿಪೂರ್ಣ ಸಮತೋಲನ.",
      badgeColor: "bg-forest/10 text-forest border-forest/30",
    },
    comfort: {
      nameEn: "Comfort & Indulgence",
      nameKn: "ಪ್ರೀಮಿಯಂ ಕಂಫರ್ಟ್ (ವಿಶೇಷ ಸೌಕರ್ಯ)",
      taglineEn: "Chauffeur-driven AC SUV, boutique resorts & fine dining",
      taglineKn: "ಚಾಲಕ ಸಹಿತ AC SUV, ಬೊಟಿಕ್ ರೆಸಾರ್ಟ್‌ಗಳು ಮತ್ತು ವಿಶಾಲ ಅನುಭವ",
      descriptionEn:
        "Prioritizes maximum convenience, scenic plantation stays, dedicated AC SUV transport, certified licensed guides, and specialty coastal/Malnad banquets.",
      descriptionKn:
        "ಪ್ರಯಾಣದ ಸಂಪೂರ್ಣ ಅನುಕೂಲ, ಎಸ್ಟೇಟ್ ಬಂಗಲೆಗಳ ವಾಸ್ತವ್ಯ, ಮೀಸಲಾದ AC SUV ಮತ್ತು ಸ್ಥಳೀಯ ಪ್ರೀಮಿಯಂ ಊಟೋಪಹಾರ.",
      badgeColor: "bg-purple-100 text-purple-900 border-purple-300",
    },
  };

  const meta = scenarioMeta[scenarioType];

  return {
    id: scenarioType,
    nameEn: meta.nameEn,
    nameKn: meta.nameKn,
    taglineEn: meta.taglineEn,
    taglineKn: meta.taglineKn,
    descriptionEn: meta.descriptionEn,
    descriptionKn: meta.descriptionKn,
    badgeColor: meta.badgeColor,
    totalCost,
    perPersonCost,
    dailyPerPersonCost,
    categories,
    contingencyBuffer,
    contingencyPercent,
    remainingBudget,
    isOverBudget,
    costCategoryPercentages,
    accommodationTypeEn: accomRes.accommodationTypeEn,
    accommodationTypeKn: accomRes.accommodationTypeKn,
    transportTypeEn:
      scenarioType === "budget_saver"
        ? "KSRTC Rajahamsa / Train"
        : scenarioType === "balanced"
        ? "Self-Drive / Tourist Cab"
        : "Chauffeur-Driven AC SUV",
    transportTypeKn:
      scenarioType === "budget_saver"
        ? "KSRTC ರಾಜಹಂಸ / ರೈಲು"
        : scenarioType === "balanced"
        ? "ಸ್ವಂತ ಡ್ರೈವ್ / ಟೂರಿಸ್ಟ್ ಕ್ಯಾಬ್"
        : "ಚಾಲಕ ಸಹಿತ AC SUV",
    diningStyleEn: foodRes.diningStyleEn,
    diningStyleKn: foodRes.diningStyleKn,
    activitiesStyleEn: actRes.activitiesStyleEn,
    activitiesStyleKn: actRes.activitiesStyleKn,
  };
}

/**
 * Main engine entrypoint: calculates, compares, and analyzes 3 budget scenarios.
 */
export function calculateOptimizedBudget(
  inputsOrOptions: BudgetOptimizationInputs | ItineraryBudgetOptions,
  routePlan?: OptimizedRoutePlan,
  itinerary?: GeneratedItinerary
): OptimizedBudgetPlan {
  let inputs: BudgetOptimizationInputs;
  let activeRoutePlan = routePlan;
  let activeItinerary = itinerary;

  if ("itinerary" in inputsOrOptions) {
    const opts = inputsOrOptions as ItineraryBudgetOptions;
    activeItinerary = opts.itinerary;
    activeRoutePlan = opts.routePlan || routePlan;
    inputs = {
      targetBudget: opts.targetBudget !== undefined ? opts.targetBudget : null,
      budgetTier: opts.preferences?.budget,
      travellerCount:
        opts.travellerCount ??
        opts.preferences?.travellerCount ??
        opts.itinerary.travellerCount ??
        2,
      durationDays:
        opts.preferences?.durationDays ?? opts.itinerary.durationDays ?? 3,
      destinationIds:
        opts.itinerary.includedDestinations?.map((d) => d.id) ??
        opts.preferences?.selectedDestinationIds ??
        (Array.isArray(opts.itinerary.days)
          ? opts.itinerary.days.map((d) => d.destinationId).filter(Boolean)
          : []),
      startingLocation:
        opts.preferences?.startingLocation ??
        opts.itinerary.startingLocation ??
        "Bengaluru",
      travelStyle: opts.preferences?.travelStyle,
      transportPreference: opts.preferences?.transport,
      selectedScenario: opts.scenarioKey,
    };
  } else {
    inputs = inputsOrOptions;
  }

  const duration = Math.max(1, inputs.durationDays || 1);
  const travellers = Math.max(1, inputs.travellerCount || 1);

  // 1. Determine Target Budget
  let targetGroupBudget: number | null = null;
  if (typeof inputs.targetBudget === "number" && inputs.targetBudget > 0) {
    targetGroupBudget = inputs.targetBudget;
  } else if (
    typeof inputs.targetPerPerson === "number" &&
    inputs.targetPerPerson > 0
  ) {
    targetGroupBudget = inputs.targetPerPerson * travellers;
  } else if (inputs.budgetTier && TIER_TARGET_LIMITS[inputs.budgetTier]) {
    targetGroupBudget = TIER_TARGET_LIMITS[inputs.budgetTier]! * travellers;
  }

  const targetPerPerson =
    targetGroupBudget !== null ? Math.round(targetGroupBudget / travellers) : null;

  // 2. Synthesize route parameters if available
  const routeDistanceKm =
    inputs.routeDistanceKm ?? (activeRoutePlan ? activeRoutePlan.totalEstimatedDistanceKm : 0);
  const routeTransitHours =
    inputs.routeTransitHours ??
    (activeRoutePlan ? activeRoutePlan.totalEstimatedTransitHours : 0);
  const routeLegsCount =
    inputs.routeLegsCount ??
    (activeRoutePlan
      ? activeRoutePlan.dailyRoutes.reduce((acc, dr) => acc + dr.legs.length, 0)
      : 0);

  const hasWesternGhats =
    inputs.hasWesternGhats ??
    (activeRoutePlan
      ? activeRoutePlan.dailyRoutes.some((dr) =>
          dr.legs.some((l) => l.terrainType === "ghats")
        )
      : inputs.destinationIds.some((id) =>
          ["coorg", "chikmagalur", "dandeli", "jogfalls"].includes(id)
        ));

  const enrichedInputs: BudgetOptimizationInputs = {
    ...inputs,
    targetBudget: targetGroupBudget,
    targetPerPerson,
    routeDistanceKm,
    routeTransitHours,
    routeLegsCount,
    hasWesternGhats,
  };

  // 3. Build the 3 scenarios
  const budgetSaver = buildScenario("budget_saver", enrichedInputs, targetGroupBudget);
  const balanced = buildScenario("balanced", enrichedInputs, targetGroupBudget);
  const comfort = buildScenario("comfort", enrichedInputs, targetGroupBudget);

  const activeScenarioKey = inputs.selectedScenario || "balanced";

  // 4. Daily Expenses Breakdown & Most Expensive Day
  const dailyExpenses: DailyExpenseEstimate[] = [];
  const activeScenario =
    activeScenarioKey === "budget_saver"
      ? budgetSaver
      : activeScenarioKey === "comfort"
      ? comfort
      : balanced;

  let maxDayCost = -1;
  let mostExpensiveDayNum = 1;

  for (let dayNum = 1; dayNum <= duration; dayNum++) {
    const destCount = Math.max(1, inputs.destinationIds.length);
    const assignedDestIdx = Math.min(
      Math.floor(((dayNum - 1) / duration) * destCount),
      destCount - 1
    );
    const destId = inputs.destinationIds[assignedDestIdx] || "mysuru";
    const dest = DESTINATIONS.find((d) => d.id === destId);

    // Baseline daily rate from active scenario
    let dayCost = Math.round(activeScenario.totalCost / duration);
    let driverEn = "Standard daily lodging, meals, and local exploration.";
    let driverKn = "ಸಾಮಾನ್ಯ ದೈನಂದಿನ ವಸತಿ, ಊಟ ಮತ್ತು ಸ್ಥಳೀಯ ಪ್ರವಾಸ.";

    // Day 1 has arrival intercity transit
    if (dayNum === 1) {
      dayCost = Math.round(dayCost * 1.25);
      driverEn = `Arrival transit from ${inputs.startingLocation || "origin"} plus check-in.`;
      driverKn = `${inputs.startingLocation || "ಆರಂಭಿಕ ನಗರ"} ದಿಂದ ಆಗಮನ ಪ್ರಯಾಣ ಮತ್ತು ಹೋಟೆಲ್ ಪ್ರವೇಶ.`;
    }

    if (dayCost > maxDayCost) {
      maxDayCost = dayCost;
      mostExpensiveDayNum = dayNum;
    }

    dailyExpenses.push({
      dayNumber: dayNum,
      destinationId: destId,
      destinationName: dest ? dest.name : destId,
      destinationKannada: dest ? dest.kannadaName : destId,
      estimatedDayCost: dayCost,
      perPersonDayCost: Math.round(dayCost / travellers),
      isMostExpensiveDay: false, // Flagged below
      primaryCostDriverEn: driverEn,
      primaryCostDriverKn: driverKn,
    });
  }

  // Set the most expensive day flag
  dailyExpenses.forEach((de) => {
    if (de.dayNumber === mostExpensiveDayNum) {
      de.isMostExpensiveDay = true;
    }
  });

  const planSkeleton: OptimizedBudgetPlan = {
    id: `opt-budget-${Date.now().toString(36)}`,
    inputs: enrichedInputs,
    targetBudget: targetGroupBudget,
    targetPerPerson,
    scenarios: {
      budget_saver: budgetSaver,
      balanced,
      comfort,
    },
    activeScenario: activeScenarioKey,
    recommendations: [],
    dailyExpenses,
    mostExpensiveDayNumber: mostExpensiveDayNum,
    isRouteGrounded: routeDistanceKm > 0,
    routeDistanceKm,
    routeTransitHours,
    calculatedAt: new Date().toISOString(),
  };

  // 5. Intelligent Recommendations
  planSkeleton.recommendations = generateBudgetRecommendations(
    planSkeleton,
    activeItinerary,
    activeRoutePlan
  );

  return planSkeleton;
}
