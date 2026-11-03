import type { Destination } from "./destinations-data";
import type {
  TripPreferences,
  BudgetTier,
  TransportPreference,
} from "./planner-types";

/* =========================================================================
   BUDGET INTELLIGENCE TYPES
   ========================================================================= */

export type BudgetCategoryKey =
  | "transport"
  | "accommodation"
  | "food"
  | "activities"
  | "localTravel"
  | "miscellaneous";

export interface BudgetCategoryBreakdown {
  key: BudgetCategoryKey;
  label: string;
  isEstimated: boolean;
  perPersonDailyMin: number | null;
  perPersonDailyMax: number | null;
  perPersonTotalMin: number | null;
  perPersonTotalMax: number | null;
  groupTotalMin: number | null;
  groupTotalMax: number | null;
  formattedPerPersonTotal: string;
  formattedGroupTotal: string;
  formattedPerPersonDaily: string;
  formattedGroupDaily: string;
  basisOrAssumption: string;
  includedNotes: string[];
  excludedNotes: string[];
}

export interface DetailedBudgetBreakdown {
  categories: BudgetCategoryBreakdown[];
  perPersonTotal: {
    min: number;
    max: number;
    formatted: string;
  };
  groupTotal: {
    min: number;
    max: number;
    formatted: string;
  };
  perPersonDaily: {
    min: number;
    max: number;
    formatted: string;
  };
  groupDaily: {
    min: number;
    max: number;
    formatted: string;
  };
  selectedTier: {
    id: BudgetTier;
    label: string;
    maxThreshold: number | null; // e.g. 3000 for 'under-3k', null for 'flexible'
  };
  isBudgetTightOrLower: boolean;
  budgetComparisonNote: string;
  assumptions: string[];
  inclusions: string[];
  exclusions: string[];
}

/* =========================================================================
   BUDGET CALCULATION LOGIC
   ========================================================================= */

const TIER_THRESHOLDS: Record<BudgetTier, { label: string; maxLimit: number | null }> = {
  "under-3k": { label: "Under ₹3,000", maxLimit: 3000 },
  "3k-7k": { label: "₹3,000 – ₹7,000", maxLimit: 7000 },
  "7k-15k": { label: "₹7,000 – ₹15,000", maxLimit: 15000 },
  "15k-30k": { label: "₹15,000 – ₹30,000", maxLimit: 30000 },
  "30k-plus": { label: "₹30,000+", maxLimit: null },
  flexible: { label: "Flexible Budget", maxLimit: null },
};

/**
 * Calculates a conservative, transparent budget breakdown across 6 distinct categories.
 * All assumptions are explicitly articulated without fabricating live or exact fares.
 */
export function calculateDetailedBudget(
  prefs: TripPreferences,
  destinations: Destination[] = []
): DetailedBudgetBreakdown {
  const duration = Math.max(1, prefs.durationDays || 1);
  const travellers = Math.max(1, prefs.travellerCount || 1);
  const transport: TransportPreference = prefs.transport || "public";
  const tier = TIER_THRESHOLDS[prefs.budget] || TIER_THRESHOLDS["7k-15k"];

  // 1. Destination benchmark extraction
  let destMinDaily = 1500;
  let destMaxDaily = 3000;

  if (destinations && destinations.length > 0) {
    const parsedRanges = destinations.map((d) => {
      const match = d.estimatedDailyBudget?.match(/₹([\d,]+)\s*–\s*₹([\d,]+)/);
      if (match) {
        return {
          min: parseInt(match[1].replace(/,/g, ""), 10),
          max: parseInt(match[2].replace(/,/g, ""), 10),
        };
      }
      return { min: 1500, max: 3000 };
    });

    destMinDaily = Math.round(
      parsedRanges.reduce((acc, r) => acc + r.min, 0) / parsedRanges.length
    );
    destMaxDaily = Math.round(
      parsedRanges.reduce((acc, r) => acc + r.max, 0) / parsedRanges.length
    );
  }

  // -----------------------------------------------------------------------
  // CATEGORY 1: ACCOMMODATION
  // -----------------------------------------------------------------------
  // Typically accounts for ~40% of standard tourism spending.
  // Room sharing: for couples/groups, assume double occupancy (rooms = ceil(travellers / 2)).
  const roomsNeeded = Math.max(1, Math.ceil(travellers / 2));
  const roomRateMin = Math.round(destMinDaily * 0.9); // ~₹1,200 - ₹1,800 / room
  const roomRateMax = Math.round(destMaxDaily * 0.9); // ~₹2,200 - ₹3,500 / room

  const accomGroupDailyMin = roomRateMin * roomsNeeded;
  const accomGroupDailyMax = roomRateMax * roomsNeeded;
  const accomPerPersonDailyMin = Math.round(accomGroupDailyMin / travellers);
  const accomPerPersonDailyMax = Math.round(accomGroupDailyMax / travellers);

  const accomPerPersonTotalMin = accomPerPersonDailyMin * duration;
  const accomPerPersonTotalMax = accomPerPersonDailyMax * duration;
  const accomGroupTotalMin = accomGroupDailyMin * duration;
  const accomGroupTotalMax = accomGroupDailyMax * duration;

  const categoryAccommodation: BudgetCategoryBreakdown = {
    key: "accommodation",
    label: "Accommodation",
    isEstimated: true,
    perPersonDailyMin: accomPerPersonDailyMin,
    perPersonDailyMax: accomPerPersonDailyMax,
    perPersonTotalMin: accomPerPersonTotalMin,
    perPersonTotalMax: accomPerPersonTotalMax,
    groupTotalMin: accomGroupTotalMin,
    groupTotalMax: accomGroupTotalMax,
    formattedPerPersonTotal: `₹${accomPerPersonTotalMin.toLocaleString("en-IN")} – ₹${accomPerPersonTotalMax.toLocaleString("en-IN")}`,
    formattedGroupTotal: `₹${accomGroupTotalMin.toLocaleString("en-IN")} – ₹${accomGroupTotalMax.toLocaleString("en-IN")}`,
    formattedPerPersonDaily: `₹${accomPerPersonDailyMin.toLocaleString("en-IN")} – ₹${accomPerPersonDailyMax.toLocaleString("en-IN")}`,
    formattedGroupDaily: `₹${accomGroupDailyMin.toLocaleString("en-IN")} – ₹${accomGroupDailyMax.toLocaleString("en-IN")}`,
    basisOrAssumption: `Standard guesthouses / heritage homestays across ${roomsNeeded} double-occupancy room(s) for ${travellers} traveler(s).`,
    includedNotes: [
      "Standard double or twin room with attached bathroom",
      "Basic amenities (ceiling fan/AC, clean linen, hot water)",
      "Applicable municipal taxes and lodging fees",
    ],
    excludedNotes: [
      "Luxury resort surcharges or 5-star club upgrades",
      "Room service, laundry, and mini-bar consumption",
      "Peak holiday weekend surcharges (e.g. Dasara, New Year)",
    ],
  };

  // -----------------------------------------------------------------------
  // CATEGORY 2: FOOD & DINING
  // -----------------------------------------------------------------------
  // ~30% of daily expenses: breakfast, lunch, coffee/tea, dinner.
  const foodDailyMin = 400; // Darshini breakfast + South Indian thali + light dinner
  const foodDailyMax = 800; // Coffee stops, multi-cuisine dinner, regional specialties
  const foodPerPersonTotalMin = foodDailyMin * duration;
  const foodPerPersonTotalMax = foodDailyMax * duration;
  const foodGroupTotalMin = foodPerPersonTotalMin * travellers;
  const foodGroupTotalMax = foodPerPersonTotalMax * travellers;

  const categoryFood: BudgetCategoryBreakdown = {
    key: "food",
    label: "Food & Dining",
    isEstimated: true,
    perPersonDailyMin: foodDailyMin,
    perPersonDailyMax: foodDailyMax,
    perPersonTotalMin: foodPerPersonTotalMin,
    perPersonTotalMax: foodPerPersonTotalMax,
    groupTotalMin: foodGroupTotalMin,
    groupTotalMax: foodGroupTotalMax,
    formattedPerPersonTotal: `₹${foodPerPersonTotalMin.toLocaleString("en-IN")} – ₹${foodPerPersonTotalMax.toLocaleString("en-IN")}`,
    formattedGroupTotal: `₹${foodGroupTotalMin.toLocaleString("en-IN")} – ₹${foodGroupTotalMax.toLocaleString("en-IN")}`,
    formattedPerPersonDaily: `₹${foodDailyMin.toLocaleString("en-IN")} – ₹${foodDailyMax.toLocaleString("en-IN")}`,
    formattedGroupDaily: `₹${(foodDailyMin * travellers).toLocaleString("en-IN")} – ₹${(foodDailyMax * travellers).toLocaleString("en-IN")}`,
    basisOrAssumption: "3 daily regional meals (breakfast, lunch, dinner) and traditional filter coffee stops at local Karnataka restaurants.",
    includedNotes: [
      "Traditional South Indian breakfast (idli, dose, vade)",
      "Wholesome vegetarian or regional non-veg thali lunch",
      "Evening filter coffee or tea with light snacks",
      "Standard sit-down regional dinner",
    ],
    excludedNotes: [
      "Alcoholic beverages and pub bills",
      "Imported snacks, energy drinks, and packaged items",
      "Fine-dining specialty restaurants and resort buffets",
    ],
  };

  // -----------------------------------------------------------------------
  // CATEGORY 3: INTERCITY TRANSPORT
  // -----------------------------------------------------------------------
  let transPerPersonDailyMin: number | null = null;
  let transPerPersonDailyMax: number | null = null;
  let transPerPersonTotalMin: number | null = null;
  let transPerPersonTotalMax: number | null = null;
  let transGroupTotalMin: number | null = null;
  let transGroupTotalMax: number | null = null;
  let isTransportEstimated = true;
  let transportBasis = "";
  const transportInclusions: string[] = [];
  const transportExclusions: string[] = [];

  if (transport === "public") {
    // KSRTC Rajahamsa/Airavat or Express Train roundtrip + connecting buses
    transPerPersonTotalMin = Math.round(500 * (1 + duration * 0.25));
    transPerPersonTotalMax = Math.round(1200 * (1 + duration * 0.25));
    transGroupTotalMin = transPerPersonTotalMin * travellers;
    transGroupTotalMax = transPerPersonTotalMax * travellers;
    transPerPersonDailyMin = Math.round(transPerPersonTotalMin / duration);
    transPerPersonDailyMax = Math.round(transPerPersonTotalMax / duration);
    transportBasis = `KSRTC Rajahamsa / Airavat buses or Indian Railways Express fares from ${prefs.startingLocation || "origin"}.`;
    transportInclusions.push(
      "Intercity return coach or rail ticket",
      "Scheduled transit between major district hubs"
    );
    transportExclusions.push(
      "Last-minute Tatkal emergency booking premiums",
      "Station porter charges or luggage storage fees"
    );
  } else if (transport === "self-drive") {
    // Fuel + highway tolls for the journey
    const estTripKm = Math.min(1800, Math.max(300, duration * 220));
    const fuelCostMin = Math.round(estTripKm * 6.5);
    const fuelCostMax = Math.round(estTripKm * 9.0);
    const tollEstimate = duration > 2 ? 600 : 350;

    transGroupTotalMin = fuelCostMin + tollEstimate;
    transGroupTotalMax = fuelCostMax + tollEstimate;
    transPerPersonTotalMin = Math.round(transGroupTotalMin / travellers);
    transPerPersonTotalMax = Math.round(transGroupTotalMax / travellers);
    transPerPersonDailyMin = Math.round(transPerPersonTotalMin / duration);
    transPerPersonDailyMax = Math.round(transPerPersonTotalMax / duration);
    transportBasis = `Estimated fuel and NH/SH highway tolls for approx. ${estTripKm} km roundtrip across Karnataka.`;
    transportInclusions.push(
      "Petrol or diesel fuel consumption based on highway averages",
      "FASTag highway tolls on national/state toll plazas"
    );
    transportExclusions.push(
      "Car rental baseline security deposits or vehicle leasing fees",
      "Traffic violation fines, punctures, or mechanical repairs"
    );
  } else if (transport === "taxi") {
    // Outstation cab per-day rate: ~₹3,200 - ₹4,500 / day including driver batta
    const cabDailyMin = 3200;
    const cabDailyMax = 4500;
    transGroupTotalMin = cabDailyMin * duration;
    transGroupTotalMax = cabDailyMax * duration;
    transPerPersonTotalMin = Math.round(transGroupTotalMin / travellers);
    transPerPersonTotalMax = Math.round(transGroupTotalMax / travellers);
    transPerPersonDailyMin = Math.round(transPerPersonTotalMin / duration);
    transPerPersonDailyMax = Math.round(transPerPersonTotalMax / duration);
    transportBasis = `Dedicated private tourist cab (sedan/SUV) with driver day-allowance for ${duration} days.`;
    transportInclusions.push(
      "Private vehicle with commercial driver for the entire trip",
      "Driver daily allowance (batta) and night charges"
    );
    transportExclusions.push(
      "State-border transit permit fees (if crossing borders)",
      "Driver gratuity / tips"
    );
  } else {
    // "flexible" or unspecified starting origin
    isTransportEstimated = false;
    transportBasis = "Transport is marked as flexible. Fares vary significantly by arrival city, flight vs train, and date.";
    transportInclusions.push("Intercity tickets or transport hire to be arranged independently");
    transportExclusions.push("All arrival and return intercity fares");
  }

  const categoryTransport: BudgetCategoryBreakdown = {
    key: "transport",
    label: "Intercity Transport",
    isEstimated: isTransportEstimated,
    perPersonDailyMin: transPerPersonDailyMin,
    perPersonDailyMax: transPerPersonDailyMax,
    perPersonTotalMin: transPerPersonTotalMin,
    perPersonTotalMax: transPerPersonTotalMax,
    groupTotalMin: transGroupTotalMin,
    groupTotalMax: transGroupTotalMax,
    formattedPerPersonTotal: isTransportEstimated
      ? `₹${transPerPersonTotalMin?.toLocaleString("en-IN")} – ₹${transPerPersonTotalMax?.toLocaleString("en-IN")}`
      : "Not estimated",
    formattedGroupTotal: isTransportEstimated
      ? `₹${transGroupTotalMin?.toLocaleString("en-IN")} – ₹${transGroupTotalMax?.toLocaleString("en-IN")}`
      : "Not estimated",
    formattedPerPersonDaily: isTransportEstimated
      ? `₹${transPerPersonDailyMin?.toLocaleString("en-IN")} – ₹${transPerPersonDailyMax?.toLocaleString("en-IN")}`
      : "Not estimated",
    formattedGroupDaily: isTransportEstimated
      ? `₹${transGroupTotalMin && Math.round(transGroupTotalMin / duration).toLocaleString("en-IN")} – ₹${transGroupTotalMax && Math.round(transGroupTotalMax / duration).toLocaleString("en-IN")}`
      : "Not estimated",
    basisOrAssumption: transportBasis,
    includedNotes: transportInclusions,
    excludedNotes: transportExclusions,
  };

  // -----------------------------------------------------------------------
  // CATEGORY 4: ACTIVITIES & ENTRY FEES
  // -----------------------------------------------------------------------
  // Monument tickets (ASI Hampi ₹40, Mysore Palace ₹100, Belur nominal, coracle ₹200-400)
  const actDailyMin = 120;
  const actDailyMax = 350;
  const actPerPersonTotalMin = actDailyMin * duration;
  const actPerPersonTotalMax = actDailyMax * duration;
  const actGroupTotalMin = actPerPersonTotalMin * travellers;
  const actGroupTotalMax = actPerPersonTotalMax * travellers;

  const categoryActivities: BudgetCategoryBreakdown = {
    key: "activities",
    label: "Activities & Entry Fees",
    isEstimated: true,
    perPersonDailyMin: actDailyMin,
    perPersonDailyMax: actDailyMax,
    perPersonTotalMin: actPerPersonTotalMin,
    perPersonTotalMax: actPerPersonTotalMax,
    groupTotalMin: actGroupTotalMin,
    groupTotalMax: actGroupTotalMax,
    formattedPerPersonTotal: `₹${actPerPersonTotalMin.toLocaleString("en-IN")} – ₹${actPerPersonTotalMax.toLocaleString("en-IN")}`,
    formattedGroupTotal: `₹${actGroupTotalMin.toLocaleString("en-IN")} – ₹${actGroupTotalMax.toLocaleString("en-IN")}`,
    formattedPerPersonDaily: `₹${actDailyMin.toLocaleString("en-IN")} – ₹${actDailyMax.toLocaleString("en-IN")}`,
    formattedGroupDaily: `₹${(actDailyMin * travellers).toLocaleString("en-IN")} – ₹${(actDailyMax * travellers).toLocaleString("en-IN")}`,
    basisOrAssumption: "Standard ASI ticket rates for Indian nationals, palace entries, municipal park fees, and coracle rides.",
    includedNotes: [
      "ASI monument passes (Hampi, Badami, Pattadakal, Belur)",
      "Mysore Palace museum entry ticket",
      "Local boating or coracle ride tickets",
    ],
    excludedNotes: [
      "Foreign national differential ASI fees ($5 to $10 equivalent)",
      "Professional DSLR video/camera permits where charged",
      "Private naturalist guides or exclusive jeep safari hire",
    ],
  };

  // -----------------------------------------------------------------------
  // CATEGORY 5: LOCAL TRAVEL
  // -----------------------------------------------------------------------
  // Town auto-rickshaws, shared jeeps, station transfers
  const localDailyMin = 150;
  const localDailyMax = 300;
  const localPerPersonTotalMin = localDailyMin * duration;
  const localPerPersonTotalMax = localDailyMax * duration;
  const localGroupTotalMin = localPerPersonTotalMin * travellers;
  const localGroupTotalMax = localPerPersonTotalMax * travellers;

  const categoryLocalTravel: BudgetCategoryBreakdown = {
    key: "localTravel",
    label: "Local Travel & Transfers",
    isEstimated: true,
    perPersonDailyMin: localDailyMin,
    perPersonDailyMax: localDailyMax,
    perPersonTotalMin: localPerPersonTotalMin,
    perPersonTotalMax: localPerPersonTotalMax,
    groupTotalMin: localGroupTotalMin,
    groupTotalMax: localGroupTotalMax,
    formattedPerPersonTotal: `₹${localPerPersonTotalMin.toLocaleString("en-IN")} – ₹${localPerPersonTotalMax.toLocaleString("en-IN")}`,
    formattedGroupTotal: `₹${localGroupTotalMin.toLocaleString("en-IN")} – ₹${localGroupTotalMax.toLocaleString("en-IN")}`,
    formattedPerPersonDaily: `₹${localDailyMin.toLocaleString("en-IN")} – ₹${localDailyMax.toLocaleString("en-IN")}`,
    formattedGroupDaily: `₹${(localDailyMin * travellers).toLocaleString("en-IN")} – ₹${(localDailyMax * travellers).toLocaleString("en-IN")}`,
    basisOrAssumption: "Auto-rickshaws, shared local jeeps, and station transfers within destination hubs.",
    includedNotes: [
      "Point-to-point auto-rickshaws between monuments",
      "Short local town shuttles and bus stand transfers",
    ],
    excludedNotes: [
      "Full-day waiting charges without meter",
      "Unplanned long detours beyond municipal limits",
    ],
  };

  // -----------------------------------------------------------------------
  // CATEGORY 6: MISCELLANEOUS & CONTINGENCY
  // -----------------------------------------------------------------------
  const miscDailyMin = 100;
  const miscDailyMax = 200;
  const miscPerPersonTotalMin = miscDailyMin * duration;
  const miscPerPersonTotalMax = miscDailyMax * duration;
  const miscGroupTotalMin = miscPerPersonTotalMin * travellers;
  const miscGroupTotalMax = miscPerPersonTotalMax * travellers;

  const categoryMiscellaneous: BudgetCategoryBreakdown = {
    key: "miscellaneous",
    label: "Miscellaneous & Contingency",
    isEstimated: true,
    perPersonDailyMin: miscDailyMin,
    perPersonDailyMax: miscDailyMax,
    perPersonTotalMin: miscPerPersonTotalMin,
    perPersonTotalMax: miscPerPersonTotalMax,
    groupTotalMin: miscGroupTotalMin,
    groupTotalMax: miscGroupTotalMax,
    formattedPerPersonTotal: `₹${miscPerPersonTotalMin.toLocaleString("en-IN")} – ₹${miscPerPersonTotalMax.toLocaleString("en-IN")}`,
    formattedGroupTotal: `₹${miscGroupTotalMin.toLocaleString("en-IN")} – ₹${miscGroupTotalMax.toLocaleString("en-IN")}`,
    formattedPerPersonDaily: `₹${miscDailyMin.toLocaleString("en-IN")} – ₹${miscDailyMax.toLocaleString("en-IN")}`,
    formattedGroupDaily: `₹${(miscDailyMin * travellers).toLocaleString("en-IN")} – ₹${(miscDailyMax * travellers).toLocaleString("en-IN")}`,
    basisOrAssumption: "Bottled water, temple prasadam, emergency medical items, and small local tips.",
    includedNotes: [
      "Packaged drinking water refills and coconut water",
      "Shoe-keeper tips and temple voluntary contributions",
      "Contingency cushion for minor out-of-pocket costs",
    ],
    excludedNotes: [
      "Souvenir handicraft purchases and shopping",
      "Electronic repairs or replacement gear",
    ],
  };

  const categories = [
    categoryAccommodation,
    categoryFood,
    categoryTransport,
    categoryActivities,
    categoryLocalTravel,
    categoryMiscellaneous,
  ];

  // -----------------------------------------------------------------------
  // OVERALL TOTALS & SUMMARY
  // -----------------------------------------------------------------------
  const estimatedCategories = categories.filter((c) => c.isEstimated);

  const totalPerPersonMin = estimatedCategories.reduce(
    (acc, c) => acc + (c.perPersonTotalMin || 0),
    0
  );
  const totalPerPersonMax = estimatedCategories.reduce(
    (acc, c) => acc + (c.perPersonTotalMax || 0),
    0
  );

  const totalGroupMin = estimatedCategories.reduce(
    (acc, c) => acc + (c.groupTotalMin || 0),
    0
  );
  const totalGroupMax = estimatedCategories.reduce(
    (acc, c) => acc + (c.groupTotalMax || 0),
    0
  );

  const dailyPerPersonMin = Math.round(totalPerPersonMin / duration);
  const dailyPerPersonMax = Math.round(totalPerPersonMax / duration);

  const dailyGroupMin = Math.round(totalGroupMin / duration);
  const dailyGroupMax = Math.round(totalGroupMax / duration);

  // Budget Tier Comparison & Warnings
  let isBudgetTightOrLower = false;
  let budgetComparisonNote = "";

  if (tier.maxLimit !== null) {
    // If the user's budget ceiling is lower than our minimum estimated group spend
    if (tier.maxLimit < totalGroupMin) {
      isBudgetTightOrLower = true;
      budgetComparisonNote = `Your selected budget tier (${tier.label}) is below the conservative estimated total spend of ₹${totalGroupMin.toLocaleString(
        "en-IN"
      )} – ₹${totalGroupMax.toLocaleString(
        "en-IN"
      )} for ${travellers} traveller(s) across ${duration} day(s). Consider choosing municipal temple guesthouses, shared state transport, or adjusting your budget tier.`;
    } else {
      budgetComparisonNote = `Your selected budget tier (${tier.label}) comfortably accommodates the estimated spending range of ₹${totalGroupMin.toLocaleString(
        "en-IN"
      )} – ₹${totalGroupMax.toLocaleString("en-IN")}.`;
    }
  } else {
    budgetComparisonNote =
      "Flexible budget selected. This plan can comfortably incorporate boutique plantation stays, premium culinary tours, and chauffeured transit.";
  }

  const generalAssumptions = [
    `Calculations reflect standard, non-peak travel averages across ${(destinations || []).map((d) => d.name).join(", ") || "Karnataka"}.`,
    `Assumes ${travellers} traveller(s) staying in ${roomsNeeded} shared room(s) for ${duration} night(s).`,
    "All figures are indicative estimates compiled from verified Karnataka Tourism guidelines; Yatrion is not a booking agent and prices may vary.",
  ];

  const inclusions = [
    "Clean standard accommodation (double-occupancy basis)",
    "3 regional daily meals, snacks, and traditional filter coffee",
    "Standard local transport and sightseeing entrance charges",
    "Intercity transit matching selected mode preference",
  ];

  const exclusions = [
    "Luxury 5-star resort upgrades and premium spa packages",
    "Airfare or interstate sleeper premiums during festival peaks",
    "Alcohol, nightlife, personal shopping, and commercial photography permits",
    "Foreign national ASI tariff differentials",
  ];

  return {
    categories,
    perPersonTotal: {
      min: totalPerPersonMin,
      max: totalPerPersonMax,
      formatted: `₹${totalPerPersonMin.toLocaleString("en-IN")} – ₹${totalPerPersonMax.toLocaleString("en-IN")}`,
    },
    groupTotal: {
      min: totalGroupMin,
      max: totalGroupMax,
      formatted: `₹${totalGroupMin.toLocaleString("en-IN")} – ₹${totalGroupMax.toLocaleString("en-IN")}`,
    },
    perPersonDaily: {
      min: dailyPerPersonMin,
      max: dailyPerPersonMax,
      formatted: `₹${dailyPerPersonMin.toLocaleString("en-IN")} – ₹${dailyPerPersonMax.toLocaleString("en-IN")}`,
    },
    groupDaily: {
      min: dailyGroupMin,
      max: dailyGroupMax,
      formatted: `₹${dailyGroupMin.toLocaleString("en-IN")} – ₹${dailyGroupMax.toLocaleString("en-IN")}`,
    },
    selectedTier: {
      id: prefs.budget,
      label: tier.label,
      maxThreshold: tier.maxLimit,
    },
    isBudgetTightOrLower,
    budgetComparisonNote,
    assumptions: generalAssumptions,
    inclusions,
    exclusions,
  };
}

