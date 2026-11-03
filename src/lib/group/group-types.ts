import type { TripInterest } from "../planner-types";
import type { BudgetScenarioType } from "../budget/budget-types";

/* =========================================================================
   1. TRAVELLER PROFILE TYPES
   ========================================================================= */

export type TravellerType = "adult" | "child";

export type TravelPace = "relaxed" | "balanced" | "packed";

export type FoodPreference = "veg" | "non-veg" | "jain" | "any";

export type AccessibilityRequirement =
  | "none"
  | "step_free"
  | "wheelchair"
  | "low_walking";

export interface TravellerProfile {
  id: string;
  name: string;
  type: TravellerType;
  interests: TripInterest[];
  preferredPace: TravelPace;
  individualBudgetLimit?: number; // Optional maximum budget per person in INR
  foodPreference: FoodPreference;
  accessibilityRequirements: AccessibilityRequirement[];
  notes?: string;
}

export interface GroupTripConfig {
  groupName: string;
  organizerName: string;
  travellers: TravellerProfile[];
}

/* =========================================================================
   2. GROUP COMPATIBILITY & PREFERENCE ANALYSIS TYPES
   ========================================================================= */

export interface GroupSharedInterest {
  interest: TripInterest;
  labelEn: string;
  labelKn: string;
  supporterCount: number;
  percentage: number;
  isUnanimous: boolean;
  isMajority: boolean;
  travellerNames: string[];
}

export interface GroupInterestConflict {
  id: string;
  interestA: TripInterest;
  interestB: TripInterest;
  descriptionEn: string;
  descriptionKn: string;
  suggestedCompromiseEn: string;
  suggestedCompromiseKn: string;
  involvedTravellersA: string[];
  involvedTravellersB: string[];
}

export interface GroupCompatibilityReport {
  overallScore: number; // 0 to 100
  breakdown: {
    interestAlignment: number; // 0 to 40
    paceAlignment: number; // 0 to 25
    budgetHarmony: number; // 0 to 20
    accessibilityFeasibility: number; // 0 to 15
  };
  sharedInterests: GroupSharedInterest[];
  conflictingInterests: GroupInterestConflict[];
  paceConsensus: TravelPace;
  hasPaceConflict: boolean;
  paceBreakdown: Record<TravelPace, number>;
  accessibilityRequirementsActive: AccessibilityRequirement[];
  compromiseSuggestionsEn: string[];
  compromiseSuggestionsKn: string[];
}

/* =========================================================================
   3. GROUP BUDGET & EXPENSE SPLITTING TYPES
   ========================================================================= */

export interface GroupBudgetConflict {
  travellerId: string;
  travellerName: string;
  individualBudgetLimit: number;
  estimatedTripCostPerPerson: number;
  deficitAmount: number;
  isDeficit: boolean;
  adviceEn: string;
  adviceKn: string;
}

export interface GroupBudgetAnalysis {
  totalGroupBudgetTarget: number;
  estimatedTripCostPerPerson: number;
  totalEstimatedTripCost: number;
  averageIndividualBudgetLimit?: number;
  conflicts: GroupBudgetConflict[];
  hasBudgetConflict: boolean;
  contingencySharePerPerson: number;
  equalContributionAmount: number;
  recommendedScenario: BudgetScenarioType;
}

export type ExpenseCategory =
  | "accommodation"
  | "transport"
  | "food"
  | "activities"
  | "permits"
  | "misc";

export interface GroupExpenseItem {
  id: string;
  description: string;
  category: ExpenseCategory;
  amountInr: number;
  paidByTravellerId: string;
  splitMode: "equal" | "custom";
  customShares?: Record<string, number>; // travellerId -> amountInr
  createdAt: string;
}

export interface SettlementTransfer {
  fromTravellerId: string;
  fromTravellerName: string;
  toTravellerId: string;
  toTravellerName: string;
  amountInr: number;
}

export interface GroupExpenseSummary {
  totalExpenses: number;
  perTravellerSpent: Record<string, number>; // who paid what
  perTravellerFairShare: Record<string, number>; // what each traveller owes
  netBalances: Record<string, number>; // positive = owed money, negative = owes money
  settlementTransfers: SettlementTransfer[];
}

/* =========================================================================
   4. GROUP ITINERARY & DECISION TYPES
   ========================================================================= */

export type GroupDecisionTag =
  | "group_consensus"
  | "subgroup_optional"
  | "compromise"
  | "individual_preference";

export type GroupDecisionStatus = "accepted" | "optional" | "rejected";

export interface GroupActivitySuggestion {
  id: string;
  titleEn: string;
  titleKn: string;
  destinationId: string;
  district: string;
  category: string;
  decisionTag: GroupDecisionTag;
  suitabilityScore: number; // 0 to 100
  matchedTravellerIds: string[];
  unmatchedTravellerIds: string[];
  status: GroupDecisionStatus;
  reasonEn: string;
  reasonKn: string;
  isAccessibleForGroup: boolean;
  accessibilityNotesEn?: string;
  accessibilityNotesKn?: string;
  estimatedCostInr: number;
  typicalDurationMinutes: number;
}

/* =========================================================================
   5. COMPLETE GROUP TRIP PERSISTENCE STATE
   ========================================================================= */

export interface GroupTripState {
  version: 1;
  config: GroupTripConfig;
  decisions: Record<string, GroupDecisionStatus>; // activityId -> status
  expenses: GroupExpenseItem[];
  updatedAt: string;
}
