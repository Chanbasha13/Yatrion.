import type { BudgetScenarioType } from "./budget-types";
import type { TransportPreference } from "../planner-types";
import { DESTINATIONS } from "../destinations-data";

/**
 * Double occupancy room calculation:
 * Solo travellers: 1 room
 * Couples: 1 room
 * Families / groups: ceil(travellers / 2) rooms
 */
export function getRoomsNeeded(travellerCount: number): number {
  return Math.max(1, Math.ceil(travellerCount / 2));
}

/**
 * Resolves destination cost index multiplier based on selected destinations.
 * Heritage & Western Ghats hotspots (Hampi, Coorg, Kabini) have slightly higher seasonal rates.
 */
export function getDestinationCostMultiplier(destinationIds: string[]): number {
  if (!destinationIds || destinationIds.length === 0) return 1.0;

  const validDests = DESTINATIONS.filter((d) => destinationIds.includes(d.id));
  if (validDests.length === 0) return 1.0;

  let sumMin = 0;
  for (const d of validDests) {
    const match = d.estimatedDailyBudget?.match(/₹([\d,]+)\s*–\s*₹([\d,]+)/);
    if (match) {
      sumMin += parseInt(match[1].replace(/,/g, ""), 10);
    } else {
      sumMin += 1800;
    }
  }

  const avgMin = sumMin / validDests.length;
  // Baseline is 1800 INR/day
  return Math.max(0.85, Math.min(1.35, Math.round((avgMin / 1800) * 100) / 100));
}

/**
 * Calculates transportation cost avoiding double-counting with local travel.
 */
export function estimateTransportCost(
  scenario: BudgetScenarioType,
  transportPref: TransportPreference,
  durationDays: number,
  travellerCount: number,
  routeDistanceKm: number = 0,
  hasWesternGhats: boolean = false
): {
  transportGroupCost: number;
  localTravelGroupCost: number;
  isGroundedByRoute: boolean;
  transportBasisEn: string;
  transportBasisKn: string;
  localBasisEn: string;
  localBasisKn: string;
  isLocalCoveredByVehicle: boolean;
} {
  // If route distance is available, calibrate from real topography distance
  const isGroundedByRoute = routeDistanceKm > 0;
  const effectiveTripKm = isGroundedByRoute
    ? routeDistanceKm
    : Math.max(300, durationDays * 180);

  let transportGroupCost = 0;
  let localTravelGroupCost = 0;
  let isLocalCoveredByVehicle = false;
  let transportBasisEn = "";
  let transportBasisKn = "";
  let localBasisEn = "";
  let localBasisKn = "";

  if (scenario === "budget_saver") {
    // KSRTC Rajahamsa/Airavat coaches or Indian Railways sleeper/express
    const busRatePerKm = 1.85; // Current state transport average for Rajahamsa
    const intercityPerPerson = Math.round(effectiveTripKm * busRatePerKm);
    transportGroupCost = intercityPerPerson * travellerCount;

    // Local travel: Town auto-rickshaws, shared jeeps, and station transfers
    const localDailyPerPerson = 120;
    localTravelGroupCost = localDailyPerPerson * durationDays * travellerCount;

    transportBasisEn = `KSRTC Rajahamsa / Express train roundtrip fares (~₹${busRatePerKm}/km) across ${Math.round(effectiveTripKm)} km for ${travellerCount} traveler(s).`;
    transportBasisKn = `${travellerCount} ಪ್ರವಾಸಿಗರಿಗೆ ${Math.round(effectiveTripKm)} ಕಿ.ಮೀ ಗೆ KSRTC ರಾಜಹಂಸ ಅಥವಾ ಎಕ್ಸ್‌ಪ್ರೆಸ್ ರೈಲು ಪ್ರಯಾಣ ದರಗಳು (ಅಂದಾಜು ₹${busRatePerKm}/ಕಿ.ಮೀ).`;

    localBasisEn = `Shared auto-rickshaws and town bus transit (~₹${localDailyPerPerson}/day per person).`;
    localBasisKn = `ಸ್ಥಳೀಯ ಆಟೋರಿಕ್ಷಾ ಮತ್ತು ನಗರ ಬಸ್ ಪ್ರಯಾಣ (ಪ್ರತಿ ವ್ಯಕ್ತಿಗೆ ದಿನಕ್ಕೆ ~₹${localDailyPerPerson}).`;
  } else if (scenario === "balanced") {
    if (transportPref === "self-drive" || transportPref === "flexible") {
      // Self-drive: Fuel (petrol/diesel @ ~₹7.2/km) + FASTag highway tolls
      const fuelCost = Math.round(effectiveTripKm * 7.2);
      const tollsCost = durationDays > 2 ? 650 : 350;
      transportGroupCost = fuelCost + tollsCost;

      // Because vehicle is present, local travel is mostly fuel (already included)
      isLocalCoveredByVehicle = true;
      localTravelGroupCost = Math.round(40 * durationDays * travellerCount); // Parking & entry fees

      transportBasisEn = `Estimated fuel consumption (~₹7.2/km) and FASTag highway tolls for ${Math.round(effectiveTripKm)} km roundtrip.`;
      transportBasisKn = `${Math.round(effectiveTripKm)} ಕಿ.ಮೀ ರೌಂಡ್‌ಟ್ರಿಪ್‌ಗೆ ಅಂದಾಜು ಇಂಧನ ವೆಚ್ಚ (~₹7.2/ಕಿ.ಮೀ) ಮತ್ತು ಫಾಸ್ಟ್ಯಾಗ್ ಟೋಲ್ ಶುಲ್ಕಗಳು.`;

      localBasisEn = `Local sightseeing covered by self-drive vehicle (nominal parking & entry fees).`;
      localBasisKn = `ಸ್ವಂತ ವಾಹನದಲ್ಲೇ ಸ್ಥಳೀಯ ವೀಕ್ಷಣೆ (ಕೇವಲ ನಾಮಮಾತ್ರದ ಪಾರ್ಕಿಂಗ್ ಶುಲ್ಕಗಳು).`;
    } else {
      // Shared private tourist cab (sedan or Ertiga) @ ₹3,200/day
      const cabDailyRate = hasWesternGhats ? 3600 : 3200;
      transportGroupCost = cabDailyRate * durationDays;

      isLocalCoveredByVehicle = true;
      localTravelGroupCost = Math.round(50 * durationDays * travellerCount); // Nominal monument parking

      transportBasisEn = `Dedicated private tourist cab (~₹${cabDailyRate}/day) including driver allowance and highway transit.`;
      transportBasisKn = `ಚಾಲಕನ ದಿನಭತ್ಯೆ ಮತ್ತು ಹೆದ್ದಾರಿ ಪ್ರಯಾಣ ಒಳಗೊಂಡ ಖಾಸಗಿ ಟೂರಿಸ್ಟ್ ಕ್ಯಾಬ್ (~₹${cabDailyRate}/ದಿನ).`;

      localBasisEn = `Town movement covered by dedicated cab (avoids duplicate auto-rickshaw hires).`;
      localBasisKn = `ಮೀಸಲಾದ ಕ್ಯಾಬ್‌ನಿಂದಲೇ ನಗರದೊಳಗಿನ ಚಲನೆ (ಹೆಚ್ಚುವರಿ ಆಟೋ ಬಾಡಿಗೆಯನ್ನು ತಪ್ಪಿಸುತ್ತದೆ).`;
    }
  } else {
    // Comfort: Premium dedicated SUV (Innova / Crysta) @ ₹4,800/day
    const suvDailyRate = hasWesternGhats ? 5200 : 4800;
    transportGroupCost = suvDailyRate * durationDays;

    isLocalCoveredByVehicle = true;
    localTravelGroupCost = Math.round(75 * durationDays * travellerCount); // Parking & green cess

    transportBasisEn = `Chauffeur-driven premium AC SUV (~₹${suvDailyRate}/day) covering all inter-city and mountain routes.`;
    transportBasisKn = `ಎಲ್ಲಾ ನಗರ ಮತ್ತು ಘಟ್ಟ ರಸ್ತೆಗಳಿಗೆ ಚಾಲಕ ಸಹಿತ ಪ್ರೀಮಿಯಂ AC SUV (~₹${suvDailyRate}/ದಿನ).`;

    localBasisEn = `Full local mobility handled seamlessly by private SUV without separate taxi hires.`;
    localBasisKn = `ಪ್ರತ್ಯೇಕ ಟ್ಯಾಕ್ಸಿಗಳ ಅಗತ್ಯವಿಲ್ಲದೆ ಖಾಸಗಿ SUV ಯಿಂದಲೇ ಸಂಪೂರ್ಣ ಸ್ಥಳೀಯ ಸಂಚಾರ.`;
  }

  return {
    transportGroupCost: Math.round(transportGroupCost),
    localTravelGroupCost: Math.round(localTravelGroupCost),
    isGroundedByRoute,
    transportBasisEn,
    transportBasisKn,
    localBasisEn,
    localBasisKn,
    isLocalCoveredByVehicle,
  };
}

/**
 * Calculates accommodation cost across rooms needed.
 */
export function estimateAccommodationCost(
  scenario: BudgetScenarioType,
  durationDays: number,
  travellerCount: number,
  costMultiplier: number = 1.0
): {
  groupCost: number;
  roomsNeeded: number;
  perRoomNight: number;
  accommodationTypeEn: string;
  accommodationTypeKn: string;
  basisEn: string;
  basisKn: string;
} {
  const roomsNeeded = getRoomsNeeded(travellerCount);
  const nights = Math.max(1, durationDays - 1 || 1);

  let perRoomNight = 1000;
  let accommodationTypeEn = "";
  let accommodationTypeKn = "";

  if (scenario === "budget_saver") {
    perRoomNight = Math.round(1100 * costMultiplier);
    accommodationTypeEn = "Budget Homestays & Guesthouses";
    accommodationTypeKn = "ಬಜೆಟ್ ಹೋಂಸ್ಟೇ ಮತ್ತು ಅತಿಥಿ ಗೃಹಗಳು";
  } else if (scenario === "balanced") {
    perRoomNight = Math.round(2400 * costMultiplier);
    accommodationTypeEn = "Heritage Homestays & KSTDC Mayura";
    accommodationTypeKn = "ಹೆರಿಟೇಜ್ ಹೋಂಸ್ಟೇ & KSTDC ಮಯೂರ ಹೋಟೆಲ್‌ಗಳು";
  } else {
    perRoomNight = Math.round(5800 * costMultiplier);
    accommodationTypeEn = "Boutique Resorts & Plantation Estates";
    accommodationTypeKn = "ಬೊಟಿಕ್ ರೆಸಾರ್ಟ್‌ಗಳು & ಕಾಫಿ ಎಸ್ಟೇಟ್ ಬಂಗಲೆಗಳು";
  }

  const groupCost = perRoomNight * roomsNeeded * nights;

  const basisEn = `${roomsNeeded} double-occupancy room(s) for ${nights} night(s) at ~₹${perRoomNight.toLocaleString("en-IN")}/night (${accommodationTypeEn}).`;
  const basisKn = `${nights} ರಾತ್ರಿಗಳಿಗೆ ${roomsNeeded} ಕೊಠಡಿಗಳು, ಪ್ರತಿ ಕೊಠಡಿಗೆ ~₹${perRoomNight.toLocaleString("en-IN")} (${accommodationTypeKn}).`;

  return {
    groupCost: Math.round(groupCost),
    roomsNeeded,
    perRoomNight,
    accommodationTypeEn,
    accommodationTypeKn,
    basisEn,
    basisKn,
  };
}

/**
 * Calculates food & dining expenses.
 */
export function estimateFoodCost(
  scenario: BudgetScenarioType,
  durationDays: number,
  travellerCount: number
): {
  groupCost: number;
  perPersonDaily: number;
  diningStyleEn: string;
  diningStyleKn: string;
  basisEn: string;
  basisKn: string;
} {
  let perPersonDaily = 320;
  let diningStyleEn = "";
  let diningStyleKn = "";

  if (scenario === "budget_saver") {
    perPersonDaily = 320;
    diningStyleEn = "Darshini Breakfasts & Regional Thalis";
    diningStyleKn = "ದರ್ಶಿನಿ ಉಪಹಾರ & ಸಾಂಪ್ರದಾಯಿಕ ಊಟ";
  } else if (scenario === "balanced") {
    perPersonDaily = 650;
    diningStyleEn = "Heritage Sit-Down Restaurants & Local Specialties";
    diningStyleKn = "ಹೆರಿಟೇಜ್ ರೆಸ್ಟೋರೆಂಟ್‌ಗಳು & ಪ್ರಾದೇಶಿಕ ವಿಶೇಷ ಊಟ";
  } else {
    perPersonDaily = 1350;
    diningStyleEn = "Resort Specialty Dining & Fine Regional Banquets";
    diningStyleKn = "ರೆಸಾರ್ಟ್ ಸ್ಪೆಷಾಲಿಟಿ ಊಟ & ಪ್ರೀಮಿಯಂ ಬಫೆ";
  }

  const groupCost = perPersonDaily * durationDays * travellerCount;

  const basisEn = `3 regional daily meals plus filter coffee stops (~₹${perPersonDaily}/day per person).`;
  const basisKn = `3 ಪ್ರಾದೇಶಿಕ ಊಟಗಳು ಹಾಗೂ ಫಿಲ್ಟರ್ ಕಾಫಿ (ಪ್ರತಿ ವ್ಯಕ್ತಿಗೆ ದಿನಕ್ಕೆ ~₹${perPersonDaily}).`;

  return {
    groupCost: Math.round(groupCost),
    perPersonDaily,
    diningStyleEn,
    diningStyleKn,
    basisEn,
    basisKn,
  };
}

/**
 * Calculates activities and verified monument entries.
 */
export function estimateActivitiesCost(
  scenario: BudgetScenarioType,
  durationDays: number,
  travellerCount: number
): {
  groupCost: number;
  perPersonDaily: number;
  activitiesStyleEn: string;
  activitiesStyleKn: string;
  basisEn: string;
  basisKn: string;
} {
  let perPersonDaily = 80;
  let activitiesStyleEn = "";
  let activitiesStyleKn = "";

  if (scenario === "budget_saver") {
    perPersonDaily = 80;
    activitiesStyleEn = "Standard Monument Tickets & Free Viewpoints";
    activitiesStyleKn = "ಸಾಮಾನ್ಯ ಸ್ಮಾರಕ ಪ್ರವೇಶ & ಉಚಿತ ನೈಸರ್ಗಿಕ ತಾಣಗಳು";
  } else if (scenario === "balanced") {
    perPersonDaily = 220;
    activitiesStyleEn = "Heritage Passes, Palace Entry & Coracle Ride";
    activitiesStyleKn = "ಸ್ಮಾರಕ ಪಾಸ್‌ಗಳು, ಅರಮನೆ ಪ್ರವೇಶ & ತೆಪ್ಪದ ಸವಾರಿ";
  } else {
    perPersonDaily = 550;
    activitiesStyleEn = "All Entries, Licensed ASI Guide & Safari/Boat Hire";
    activitiesStyleKn = "ಎಲ್ಲಾ ಪ್ರವೇಶಗಳು, ಪ್ರಮಾಣೀಕೃತ ಗೈಡ್ & ಸಫಾರಿ ಸವಾರಿ";
  }

  const groupCost = perPersonDaily * durationDays * travellerCount;

  const basisEn = `Verified ASI entry fees, palace tickets, and regional trails (~₹${perPersonDaily}/day per person).`;
  const basisKn = `ಪರಿಶೀಲಿಸಿದ ASI ಟಿಕೆಟ್‌ಗಳು, ಅರಮನೆ ಪ್ರವೇಶ ಹಾಗೂ ತೆಪ್ಪದ ಸವಾರಿ (ದಿನಕ್ಕೆ ~₹${perPersonDaily}/ವ್ಯಕ್ತಿ).`;

  return {
    groupCost: Math.round(groupCost),
    perPersonDaily,
    activitiesStyleEn,
    activitiesStyleKn,
    basisEn,
    basisKn,
  };
}

/**
 * Calculates miscellaneous expenses (hydration, temple offerings, emergency snacks).
 */
export function estimateMiscellaneousCost(
  scenario: BudgetScenarioType,
  durationDays: number,
  travellerCount: number
): {
  groupCost: number;
  perPersonDaily: number;
  basisEn: string;
  basisKn: string;
} {
  let perPersonDaily = 50;

  if (scenario === "budget_saver") {
    perPersonDaily = 50;
  } else if (scenario === "balanced") {
    perPersonDaily = 100;
  } else {
    perPersonDaily = 220;
  }

  const groupCost = perPersonDaily * durationDays * travellerCount;

  const basisEn = `Packaged drinking water, footwear tokens, and mobile battery top-ups (~₹${perPersonDaily}/day per person).`;
  const basisKn = `ಕುಡಿಯುವ ನೀರು, ಪಾದರಕ್ಷೆ ಸ್ಟ್ಯಾಂಡ್ ಹಾಗೂ ತುರ್ತು ವೆಚ್ಚಗಳು (ದಿನಕ್ಕೆ ~₹${perPersonDaily}/ವ್ಯಕ್ತಿ).`;

  return {
    groupCost: Math.round(groupCost),
    perPersonDaily,
    basisEn,
    basisKn,
  };
}

/**
 * Contingency buffer calculation percentage.
 */
export function getContingencyPercentage(scenario: BudgetScenarioType): number {
  switch (scenario) {
    case "budget_saver":
      return 5.0; // 5% minimum emergency buffer
    case "balanced":
      return 7.5; // 7.5% comfortable buffer
    case "comfort":
      return 10.0; // 10% premium buffer
  }
}
