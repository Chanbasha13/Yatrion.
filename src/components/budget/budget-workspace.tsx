"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { 
  Coins, 
  Compass, 
  Info
} from "lucide-react";
import { useAuth } from "@/lib/auth/auth-context";
import { useLanguage } from "@/lib/i18n";
import { loadUserTrip, saveUserTrip, type StoredTripState } from "@/lib/storage/user-trip-service";
import { calculateOptimizedBudget } from "@/lib/budget/budget-optimizer";
import { BudgetScenarios } from "@/components/budget/budget-scenarios";
import { BudgetBreakdown } from "@/components/budget/budget-breakdown";
import { BudgetRecommendations } from "@/components/budget/budget-recommendations";
import type { BudgetScenarioType } from "@/lib/budget/budget-types";

export function BudgetWorkspace() {
  const { user } = useAuth();
  const { isKn } = useLanguage();

  const [tripState, setTripState] = useState<StoredTripState | null>(() =>
    loadUserTrip(user?.id, user?.isDemo)
  );

  // Cross-workspace trip state synchronization
  useEffect(() => {
    const handleUpdate = () => {
      setTripState(loadUserTrip(user?.id, user?.isDemo));
    };
    window.addEventListener("yatrion:trip-updated", handleUpdate);
    return () => window.removeEventListener("yatrion:trip-updated", handleUpdate);
  }, [user?.id, user?.isDemo]);

  const [activeScenarioKey, setActiveScenarioKey] = useState<BudgetScenarioType>("balanced");

  // Compute or load optimized budget plan
  const budgetPlan = useMemo(() => {
    if (!tripState) return null;
    if (tripState.budgetPlan) return tripState.budgetPlan;

    return calculateOptimizedBudget({
      itinerary: tripState.originalItinerary,
      preferences: tripState.preferences,
      routePlan: tripState.optimizedRoute,
      scenarioKey: activeScenarioKey,
      travellerCount: tripState.preferences.travellerCount,
    });
  }, [tripState, activeScenarioKey]);

  const activeScenario = useMemo(() => {
    if (!budgetPlan) return null;
    return budgetPlan.scenarios[activeScenarioKey];
  }, [budgetPlan, activeScenarioKey]);

  const handleSelectScenario = (scenario: BudgetScenarioType) => {
    setActiveScenarioKey(scenario);
  };

  const handleUpdateBudgetInput = (newTargetBudget: number | null, newTravellers: number) => {
    if (!tripState) return;
    const recomputed = calculateOptimizedBudget({
      itinerary: tripState.originalItinerary,
      preferences: { ...tripState.preferences, travellerCount: newTravellers },
      routePlan: tripState.optimizedRoute,
      scenarioKey: activeScenarioKey,
      targetBudget: newTargetBudget,
      travellerCount: newTravellers,
    });

    const updated = { ...tripState, budgetPlan: recomputed };
    setTripState(updated);
    saveUserTrip(user?.id, user?.isDemo, updated);
  };

  if (!tripState || !budgetPlan || !activeScenario) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-white p-12 text-center space-y-4 max-w-xl mx-auto my-12">
        <div className="w-14 h-14 rounded-2xl bg-gold-dark/10 border border-gold-dark/20 text-gold-dark flex items-center justify-center mx-auto">
          <Coins size={28} />
        </div>
        <h2 className="font-serif text-2xl font-bold text-charcoal">
          {isKn ? "ಯಾವುದೇ ಸಕ್ರಿಯ ಪ್ರವಾಸವಿಲ್ಲ" : "No Active Journey to Budget"}
        </h2>
        <p className="text-xs sm:text-sm text-charcoal-light leading-relaxed">
          {isKn
            ? "ಬಜೆಟ್ ವಿಶ್ಲೇಷಣೆ ವೀಕ್ಷಿಸಲು ಮೊದಲು ಸ್ಮಾರ್ಟ್ ಪ್ರವಾಸ ಪ್ಲಾನರ್‌ನಲ್ಲಿ ಹೊಸ ಪ್ರವಾಸವನ್ನು ರಚಿಸಿ."
            : "Generate an itinerary in the Smart Trip Planner first to calculate itemized transport, homestay, and permit costs."}
        </p>
        <div className="pt-2">
          <Link
            href="/app/planner"
            className="inline-flex items-center gap-2 rounded-xl bg-forest px-5 py-3 text-xs font-bold text-white hover:bg-forest-dark transition-all shadow-subtle"
          >
            <Compass size={15} />
            <span>{isKn ? "ಪ್ಲಾನರ್‌ಗೆ ಹೋಗಿ" : "Open Trip Planner"}</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Workspace Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-3 py-1 rounded-full bg-gold-dark/10 border border-gold-dark/20 text-gold-dark text-xs font-mono font-bold flex items-center gap-1.5">
              <Coins size={13} />
              <span>Workspace • Intelligent Budget Optimizer</span>
            </span>
            <span className="text-xs text-charcoal-light font-mono">• Zero Booking Markups</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-charcoal">
            {isKn ? "ಬುದ್ಧಿವಂತ ಬಜೆಟ್ ಆಪ್ಟಿಮೈಸರ್" : "Intelligent Budget Optimizer"}
          </h1>
          <p className="text-xs sm:text-sm text-charcoal-light mt-1">
            {isKn
              ? "ಇಂಧನ ಬಳಕೆ, ಹೆದ್ದಾರಿ ಟೋಲ್ ಮತ್ತು ಸ್ಥಳೀಯ ಹೋಂಸ್ಟೇಗಳ ನೈಜ ವೆಚ್ಚದ ಪಾರದರ್ಶಕ 3-ಹಂತದ ವಿಶ್ಲೇಷಣೆ."
              : "Deterministic cost projections for fuel, highway tolls, homestays, and activity permits across Saver, Balanced, and Comfort scenarios."}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/app/routes"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-forest/10 text-forest hover:bg-forest/20 text-xs font-semibold transition-colors"
          >
            <span>{isKn ? "ಮಾರ್ಗ ನೋಡಿ" : "View Routes"}</span>
          </Link>
          <Link
            href="/app/adaptive"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-forest text-white hover:bg-forest-dark text-xs font-bold transition-all shadow-subtle"
          >
            <span>{isKn ? "ಹವಾಮಾನ ಸ್ಥಿತಿ" : "Live Telemetry"}</span>
          </Link>
        </div>
      </div>

      {/* 3 Scenario Cards Selector */}
      <BudgetScenarios
        plan={budgetPlan}
        activeScenarioKey={activeScenarioKey}
        onSelectScenario={handleSelectScenario}
        onUpdateBudgetInput={handleUpdateBudgetInput}
      />

      {/* Category-Wise Breakdown Table */}
      <BudgetBreakdown
        scenario={activeScenario}
        travellerCount={budgetPlan.inputs.travellerCount}
        durationDays={tripState.preferences.durationDays}
      />

      {/* Budget Recommendations & Optimizations */}
      <BudgetRecommendations
        recommendations={budgetPlan.recommendations}
        dailyExpenses={budgetPlan.dailyExpenses}
        mostExpensiveDayNumber={budgetPlan.mostExpensiveDayNumber}
      />

      {/* Transparency & Disclaimer Banner */}
      <div className="rounded-2xl bg-ivory-warm/60 border border-border p-5 flex items-start gap-3 text-xs text-charcoal-light">
        <Info size={18} className="text-forest shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h5 className="font-bold text-charcoal font-mono uppercase tracking-wider text-[11px]">
            {isKn ? "ಪಾರದರ್ಶಕತೆ ಮತ್ತು ಮಿತಿಗಳ ವಿವರಣೆ" : "Cost Transparency & Institutional Methodology"}
          </h5>
          <p className="leading-relaxed">
            {isKn
              ? "ಇಲ್ಲಿ ತೋರಿಸಿರುವ ಅಂಕಿಅಂಶಗಳು ಕರ್ನಾಟಕದ ಅಧಿಕೃತ ಇಂಧನ ದರಗಳು, ಹೆದ್ದಾರಿ ಟೋಲ್‌ಗಳು ಮತ್ತು ಕೆಎಸ್‌ಟಿಡಿಸಿ/ಹೋಂಸ್ಟೇ ದರಗಳ ಗಣಿತೀಯ ಅಂದಾಜುಗಳಾಗಿವೆ. ಯಾವುದೇ ಮಧ್ಯವರ್ತಿ ಶುಲ್ಕ ಅಥವಾ ಕಮಿಷನ್ ಸೇರಿಸಲಾಗಿಲ್ಲ. ಇದು ನೇರ ಬುಕಿಂಗ್ ದೃಢೀಕರಣವಲ್ಲ."
              : "All projections are deterministic estimates based on verified Karnataka fuel rates, NHAI highway tolls, and direct homestay room sharing ratios. Yatrion charges zero booking markups or affiliate kickbacks. Estimates serve as planning guidance and do not represent live booking contracts."}
          </p>
        </div>
      </div>
    </div>
  );
}
