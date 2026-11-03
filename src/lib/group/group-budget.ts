import type { OptimizedBudgetPlan, BudgetScenarioType } from "../budget/budget-types";
import type {
  TravellerProfile,
  GroupBudgetAnalysis,
  GroupBudgetConflict,
} from "./group-types";

interface CalculateGroupBudgetParams {
  travellers: TravellerProfile[];
  budgetPlan?: OptimizedBudgetPlan;
  activeScenarioKey?: BudgetScenarioType;
}

/**
 * Computes group budget distribution, individual budget limits vs trip cost,
 * and deficit warnings across group members.
 */
export function analyzeGroupBudget({
  travellers,
  budgetPlan,
  activeScenarioKey = "balanced",
}: CalculateGroupBudgetParams): GroupBudgetAnalysis {
  const count = Math.max(1, travellers.length);
  const fallbackScenarios = {
    budget_saver: {
      key: "budget_saver" as BudgetScenarioType,
      nameEn: "Budget Saver",
      nameKn: "ಬಜೆಟ್ ಸೇವರ್",
      totalCost: count * 6500,
      perPersonCost: 6500,
      contingencyBuffer: count * 500,
      contingencyPercent: 8,
      isOverBudget: false,
      remainingBudget: 0,
    },
    balanced: {
      key: "balanced" as BudgetScenarioType,
      nameEn: "Balanced Comfort",
      nameKn: "ಸಮತೋಲಿತ ಕಂಫರ್ಟ್",
      totalCost: count * 10000,
      perPersonCost: 10000,
      contingencyBuffer: count * 1000,
      contingencyPercent: 10,
      isOverBudget: false,
      remainingBudget: 0,
    },
    comfort: {
      key: "comfort" as BudgetScenarioType,
      nameEn: "Premium Heritage",
      nameKn: "ಪ್ರೀಮಿಯಂ ಹೆರಿಟೇಜ್",
      totalCost: count * 18000,
      perPersonCost: 18000,
      contingencyBuffer: count * 2000,
      contingencyPercent: 12,
      isOverBudget: false,
      remainingBudget: 0,
    },
  };

  const scenarios = budgetPlan?.scenarios || fallbackScenarios;
  const scenario = scenarios[activeScenarioKey] || scenarios.balanced;
  const estimatedTripCostPerPerson = scenario.perPersonCost;
  const totalEstimatedTripCost = estimatedTripCostPerPerson * count;
  const equalContributionAmount = estimatedTripCostPerPerson;
  const contingencySharePerPerson = Math.round(
    scenario.contingencyBuffer / (budgetPlan?.inputs.travellerCount || count)
  );

  // Analyze individual budget limits
  const conflicts: GroupBudgetConflict[] = [];
  const limits = travellers
    .map((t) => t.individualBudgetLimit)
    .filter((b): b is number => typeof b === "number" && b > 0);

  const totalGroupBudgetTarget =
    limits.length > 0
      ? limits.reduce((acc, curr) => acc + curr, 0)
      : budgetPlan?.targetBudget || totalEstimatedTripCost;

  const averageIndividualBudgetLimit =
    limits.length > 0
      ? Math.round(totalGroupBudgetTarget / limits.length)
      : undefined;

  for (const t of travellers) {
    if (typeof t.individualBudgetLimit === "number" && t.individualBudgetLimit > 0) {
      const deficit = estimatedTripCostPerPerson - t.individualBudgetLimit;
      if (deficit > 0) {
        conflicts.push({
          travellerId: t.id,
          travellerName: t.name,
          individualBudgetLimit: t.individualBudgetLimit,
          estimatedTripCostPerPerson,
          deficitAmount: deficit,
          isDeficit: true,
          adviceEn: `Current '${scenario.nameEn}' estimated share (₹${estimatedTripCostPerPerson.toLocaleString("en-IN")}) exceeds ${t.name}'s limit of ₹${t.individualBudgetLimit.toLocaleString("en-IN")} by ₹${deficit.toLocaleString("en-IN")}. Switch to 'Budget Saver' or adjust room sharing.`,
          adviceKn: `ಪ್ರಸ್ತುತ '${scenario.nameKn}' ಅಂದಾಜು ಪಾಲು (₹${estimatedTripCostPerPerson.toLocaleString("en-IN")}) ${t.name} ಅವರ ಮಿತಿ ₹${t.individualBudgetLimit.toLocaleString("en-IN")} ಕ್ಕಿಂತ ₹${deficit.toLocaleString("en-IN")} ಹೆಚ್ಚಾಗಿದೆ. 'ಬಜೆಟ್ ಸೇವರ್' ಆಯ್ಕೆಮಾಡಿ ಅಥವಾ ಕೊಠಡಿ ಹಂಚಿಕೆಯನ್ನು ಹೊಂದಿಸಿ.`,
        });
      }
    }
  }

  // Recommended Scenario based on limits
  let recommendedScenario: BudgetScenarioType = activeScenarioKey;
  if (limits.length > 0) {
    const minLimit = Math.min(...limits);
    if (minLimit < scenarios.budget_saver.perPersonCost) {
      recommendedScenario = "budget_saver";
    } else if (
      minLimit >= scenarios.comfort.perPersonCost &&
      averageIndividualBudgetLimit &&
      averageIndividualBudgetLimit >= scenarios.comfort.perPersonCost
    ) {
      recommendedScenario = "comfort";
    } else if (minLimit >= scenarios.balanced.perPersonCost) {
      recommendedScenario = "balanced";
    } else {
      recommendedScenario = "budget_saver";
    }
  }

  return {
    totalGroupBudgetTarget,
    estimatedTripCostPerPerson,
    totalEstimatedTripCost,
    averageIndividualBudgetLimit,
    conflicts,
    hasBudgetConflict: conflicts.length > 0,
    contingencySharePerPerson,
    equalContributionAmount,
    recommendedScenario,
  };
}
