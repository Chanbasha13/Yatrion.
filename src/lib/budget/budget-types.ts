import type {
  TripDurationDays,
  TransportPreference,
  BudgetTier,
  TravelStyle,
} from "../planner-types";

export type BudgetScenarioType = "budget_saver" | "balanced" | "comfort";

export type ExpenseCategoryKey =
  | "transport"
  | "accommodation"
  | "food"
  | "localTravel"
  | "activities"
  | "miscellaneous"
  | "contingency";

export interface BudgetOptimizationInputs {
  targetBudget?: number | null; // Total budget in INR (user entered or derived from tier)
  targetPerPerson?: number | null;
  budgetTier?: BudgetTier;
  travellerCount: number;
  durationDays: TripDurationDays | number;
  destinationIds: string[];
  startingLocation: string;
  travelStyle?: TravelStyle;
  transportPreference?: TransportPreference;
  selectedScenario?: BudgetScenarioType;
  // Route engine integration parameters
  routeDistanceKm?: number;
  routeTransitHours?: number;
  routeLegsCount?: number;
  hasWesternGhats?: boolean;
}

export interface ExpenseCategoryEstimate {
  key: ExpenseCategoryKey;
  labelEn: string;
  labelKn: string;
  estimatedCost: number; // In INR for entire group
  perPersonCost: number; // In INR per person
  dailyCost: number; // In INR daily for group
  percentageOfTotal: number; // 0 to 100
  basisOrAssumptionEn: string;
  basisOrAssumptionKn: string;
  isRouteGrounded: boolean;
  valueType: "verified" | "estimated" | "user_provided";
  includedNotesEn: string[];
  includedNotesKn: string[];
  excludedNotesEn: string[];
  excludedNotesKn: string[];
}

export interface BudgetScenario {
  id: BudgetScenarioType;
  nameEn: string;
  nameKn: string;
  taglineEn: string;
  taglineKn: string;
  descriptionEn: string;
  descriptionKn: string;
  badgeColor: string;
  totalCost: number;
  perPersonCost: number;
  dailyPerPersonCost: number;
  categories: ExpenseCategoryEstimate[];
  contingencyBuffer: number;
  contingencyPercent: number; // e.g. 5, 7.5, 10
  remainingBudget: number | null; // Target budget - Total cost (positive = surplus, negative = deficit)
  isOverBudget: boolean;
  costCategoryPercentages: Record<ExpenseCategoryKey, number>;
  accommodationTypeEn: string;
  accommodationTypeKn: string;
  transportTypeEn: string;
  transportTypeKn: string;
  diningStyleEn: string;
  diningStyleKn: string;
  activitiesStyleEn: string;
  activitiesStyleKn: string;
}

export interface DailyExpenseEstimate {
  dayNumber: number;
  destinationId: string;
  destinationName: string;
  destinationKannada: string;
  estimatedDayCost: number;
  perPersonDayCost: number;
  isMostExpensiveDay: boolean;
  primaryCostDriverEn: string;
  primaryCostDriverKn: string;
}

export interface BudgetRecommendation {
  id: string;
  type:
    | "accommodation"
    | "transport"
    | "activities"
    | "food"
    | "routing"
    | "duration";
  titleEn: string;
  titleKn: string;
  descriptionEn: string;
  descriptionKn: string;
  estimatedSavingsInr: number;
  impactLevel: "high" | "medium" | "low";
  explanationEn: string;
  explanationKn: string;
  actionableSuggestionEn: string;
  actionableSuggestionKn: string;
  safetyAffirmationEn: string;
  safetyAffirmationKn: string;
}

export interface OptimizedBudgetPlan {
  id: string;
  inputs: BudgetOptimizationInputs;
  targetBudget: number | null;
  targetPerPerson: number | null;
  scenarios: Record<BudgetScenarioType, BudgetScenario>;
  activeScenario: BudgetScenarioType;
  recommendations: BudgetRecommendation[];
  dailyExpenses: DailyExpenseEstimate[];
  mostExpensiveDayNumber: number;
  isRouteGrounded: boolean;
  routeDistanceKm: number;
  routeTransitHours: number;
  calculatedAt: string;
}

