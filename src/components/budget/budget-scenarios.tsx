"use client";

import { useState } from "react";
import {
  Wallet,
  Check,
  CheckCircle2,
  AlertCircle,
  Users,
  ArrowRight,
  Plus,
  Minus,
} from "lucide-react";
import type {
  BudgetScenarioType,
  OptimizedBudgetPlan,
} from "@/lib/budget/budget-types";
import { useLanguage } from "@/lib/i18n";

interface BudgetScenariosProps {
  plan: OptimizedBudgetPlan;
  activeScenarioKey: BudgetScenarioType;
  onSelectScenario: (scenario: BudgetScenarioType) => void;
  onUpdateBudgetInput?: (newTargetBudget: number | null, newTravellers: number) => void;
}

export function BudgetScenarios({
  plan,
  activeScenarioKey,
  onSelectScenario,
  onUpdateBudgetInput,
}: BudgetScenariosProps) {
  const { isKn } = useLanguage();
  const [customBudgetInput, setCustomBudgetInput] = useState<string>(
    plan.targetBudget ? String(plan.targetBudget) : ""
  );
  const [travellerCount, setTravellerCount] = useState<number>(
    plan.inputs.travellerCount
  );

  const handleBudgetChange = (val: string) => {
    setCustomBudgetInput(val);
    const num = parseInt(val.replace(/[^\d]/g, ""), 10);
    if (!isNaN(num) && num > 0) {
      onUpdateBudgetInput?.(num, travellerCount);
    } else if (val === "") {
      onUpdateBudgetInput?.(null, travellerCount);
    }
  };

  const handleTravellerDelta = (delta: number) => {
    const nextCount = Math.max(1, Math.min(12, travellerCount + delta));
    setTravellerCount(nextCount);
    const budgetNum = parseInt(customBudgetInput.replace(/[^\d]/g, ""), 10);
    onUpdateBudgetInput?.(isNaN(budgetNum) ? null : budgetNum, nextCount);
  };

  const scenarioOrder: BudgetScenarioType[] = ["budget_saver", "balanced", "comfort"];

  return (
    <div className="space-y-6">
      {/* ── TOP CONTROLS BAR: TARGET BUDGET & TRAVELLER ADJUSTERS ── */}
      <div className="rounded-[var(--radius-lg)] border border-border bg-ivory-warm/70 p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 no-print">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Wallet size={16} className="text-forest" />
            <h4 className="text-sm font-bold text-forest-dark">
              {isKn
                ? "ಬಜೆಟ್ ಸಿಮ್ಯುಲೇಟರ್ ಮತ್ತು ಗುಂಪು ಹೊಂದಾಣಿಕೆ"
                : "Budget Target & Party Size Simulator"}
            </h4>
          </div>
          <p className="text-xs text-charcoal-muted">
            {isKn
              ? "ನಿಮ್ಮ ಲಭ್ಯವಿರುವ ಒಟ್ಟು ಬಜೆಟ್ ಮತ್ತು ಪ್ರವಾಸಿಗರ ಸಂಖ್ಯೆಯನ್ನು ಬದಲಾಯಿಸಿ ಮೂರು ಸನ್ನಿವೇಶಗಳನ್ನು ಹೋಲಿಕೆ ಮಾಡಿ."
              : "Adjust your target spending limit and traveler count to immediately test scenario feasibility."}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Target Budget Input */}
          <div className="flex items-center gap-1.5 bg-white border border-border rounded-[var(--radius-md)] px-3 py-1.5 shadow-subtle">
            <span className="text-xs font-bold text-forest font-mono">₹</span>
            <input
              type="text"
              value={customBudgetInput}
              onChange={(e) => handleBudgetChange(e.target.value)}
              placeholder={isKn ? "ಗುರಿ ಬಜೆಟ್ (ಉದಾ: 20000)" : "Target Budget (e.g. 20000)"}
              className="text-xs font-mono font-semibold text-charcoal w-28 sm:w-32 focus:outline-none"
              aria-label={isKn ? "ಗುರಿ ಬಜೆಟ್" : "Target trip budget in INR"}
            />
          </div>

          {/* Traveller Count Stepper */}
          <div className="inline-flex items-center gap-2 bg-white border border-border rounded-[var(--radius-md)] px-3 py-1.5 shadow-subtle">
            <Users size={13} className="text-forest shrink-0" />
            <span className="text-xs font-bold text-charcoal font-mono">
              {travellerCount} {isKn ? "ಜನ" : "pax"}
            </span>
            <div className="flex items-center gap-1 ml-1 border-l border-border pl-2">
              <button
                type="button"
                onClick={() => handleTravellerDelta(-1)}
                disabled={travellerCount <= 1}
                className="p-1 rounded text-charcoal hover:bg-ivory-warm disabled:opacity-30 cursor-pointer"
                aria-label={isKn ? "ಪ್ರವಾಸಿಗರನ್ನು ಕಡಿಮೆ ಮಾಡಿ" : "Decrease travellers"}
              >
                <Minus size={11} />
              </button>
              <button
                type="button"
                onClick={() => handleTravellerDelta(1)}
                disabled={travellerCount >= 12}
                className="p-1 rounded text-charcoal hover:bg-ivory-warm disabled:opacity-30 cursor-pointer"
                aria-label={isKn ? "ಪ್ರವಾಸಿಗರನ್ನು ಹೆಚ್ಚಿಸಿ" : "Increase travellers"}
              >
                <Plus size={11} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── 3 SCENARIOS COMPARISON CARDS GRID ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {scenarioOrder.map((key) => {
          const scenario = plan.scenarios[key];
          const isSelected = activeScenarioKey === key;
          const isBalanced = key === "balanced";

          return (
            <div
              key={key}
              className={`relative rounded-[var(--radius-xl)] border transition-all flex flex-col justify-between ${
                isSelected
                  ? "border-forest ring-2 ring-forest/20 bg-white shadow-card"
                  : "border-border bg-white shadow-subtle hover:border-forest/40 hover:shadow-card"
              } p-5 sm:p-6`}
            >
              {/* Highlight Ribbon for Balanced */}
              {isBalanced && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gold px-3 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider font-mono shadow-subtle">
                  {isKn ? "★ ಹೆಚ್ಚು ಶಿಫಾರಸು ಮಾಡಲಾಗಿದೆ" : "★ Most Recommended"}
                </div>
              )}

              <div>
                {/* Scenario Header */}
                <div className="flex items-start justify-between gap-2 pb-3 border-b border-border/80">
                  <div>
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border font-mono ${scenario.badgeColor}`}
                    >
                      {isKn ? scenario.nameKn : scenario.nameEn}
                    </span>
                    <h4 className="text-base sm:text-lg font-bold text-forest-dark mt-1 font-[family-name:var(--font-playfair)]">
                      {isKn ? scenario.nameKn : scenario.nameEn}
                    </h4>
                    <p className="text-xs text-charcoal-muted mt-0.5 leading-snug">
                      {isKn ? scenario.taglineKn : scenario.taglineEn}
                    </p>
                  </div>

                  {isSelected && (
                    <span className="shrink-0 flex h-6 w-6 items-center justify-center rounded-full bg-forest text-white shadow-subtle">
                      <Check size={14} />
                    </span>
                  )}
                </div>

                {/* Primary Cost Display */}
                <div className="py-4 border-b border-border/80 space-y-1">
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs text-charcoal-muted uppercase tracking-wider font-mono">
                      {isKn ? "ಅಂದಾಜು ಒಟ್ಟು ಮೊತ್ತ" : "Total Estimated"}
                    </span>
                    <span className="text-xl sm:text-2xl font-bold font-mono text-forest-dark">
                      ₹{scenario.totalCost.toLocaleString("en-IN")}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-charcoal font-mono">
                    <span className="text-charcoal-muted">
                      {isKn ? "ಪ್ರತಿ ವ್ಯಕ್ತಿಗೆ:" : "Per person:"}
                    </span>
                    <span className="font-semibold">
                      ₹{scenario.perPersonCost.toLocaleString("en-IN")}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-charcoal-muted font-mono">
                    <span>{isKn ? "ದೈನಂದಿನ ಸರಾಸರಿ (ವ್ಯಕ್ತಿಗೆ):" : "Daily avg / person:"}</span>
                    <span>₹{scenario.dailyPerPersonCost.toLocaleString("en-IN")}</span>
                  </div>
                </div>

                {/* Budget Comparison Indicator Pill */}
                <div className="py-3 border-b border-border/80">
                  {scenario.remainingBudget !== null ? (
                    scenario.isOverBudget ? (
                      <div className="flex items-center gap-2 rounded-md bg-rose-50 border border-rose-200 p-2 text-xs text-rose-900">
                        <AlertCircle size={14} className="shrink-0 text-rose-600" />
                        <div>
                          <span className="font-bold">
                            {isKn ? "ಬಜೆಟ್ ಮೀರಿದೆ: " : "Over Target: "}
                          </span>
                          <span className="font-mono font-semibold">
                            ₹{Math.abs(scenario.remainingBudget).toLocaleString("en-IN")}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 rounded-md bg-emerald-50 border border-emerald-200 p-2 text-xs text-emerald-900">
                        <CheckCircle2 size={14} className="shrink-0 text-emerald-600" />
                        <div>
                          <span className="font-bold">
                            {isKn ? "ಬಜೆಟ್ ಒಳಗೆ: " : "Within Budget: "}
                          </span>
                          <span className="font-mono font-semibold">
                            +₹{scenario.remainingBudget.toLocaleString("en-IN")}{" "}
                            {isKn ? "ಉಳಿಕೆ" : "surplus"}
                          </span>
                        </div>
                      </div>
                    )
                  ) : (
                    <div className="text-[11px] text-charcoal-muted italic">
                      {isKn
                        ? "ಲಭ್ಯವಿರುವ ಬಜೆಟ್ ದಾಖಲಿಸಿದರೆ ಉಳಿಕೆಯನ್ನು ಲೆಕ್ಕಹಾಕಲಾಗುತ್ತದೆ."
                        : "Enter a target budget above to check surplus/deficit."}
                    </div>
                  )}
                </div>

                {/* Scenario Highlights Specs */}
                <div className="py-3 text-xs space-y-2 text-charcoal">
                  <div className="flex items-start gap-1.5">
                    <span className="font-semibold text-charcoal-muted text-[11px] w-20 shrink-0 font-mono">
                      {isKn ? "ವಸತಿ:" : "Lodging:"}
                    </span>
                    <span className="font-medium text-forest-dark">
                      {isKn ? scenario.accommodationTypeKn : scenario.accommodationTypeEn}
                    </span>
                  </div>

                  <div className="flex items-start gap-1.5">
                    <span className="font-semibold text-charcoal-muted text-[11px] w-20 shrink-0 font-mono">
                      {isKn ? "ಸಾರಿಗೆ:" : "Transit:"}
                    </span>
                    <span className="font-medium text-forest-dark">
                      {isKn ? scenario.transportTypeKn : scenario.transportTypeEn}
                    </span>
                  </div>

                  <div className="flex items-start gap-1.5">
                    <span className="font-semibold text-charcoal-muted text-[11px] w-20 shrink-0 font-mono">
                      {isKn ? "ಊಟ:" : "Dining:"}
                    </span>
                    <span className="font-medium text-forest-dark">
                      {isKn ? scenario.diningStyleKn : scenario.diningStyleEn}
                    </span>
                  </div>

                  <div className="flex items-start gap-1.5">
                    <span className="font-semibold text-charcoal-muted text-[11px] w-20 shrink-0 font-mono">
                      {isKn ? "ತುರ್ತು ನಿಧಿ:" : "Safety:"}
                    </span>
                    <span className="font-mono text-charcoal">
                      {scenario.contingencyPercent}% (~₹{scenario.contingencyBuffer.toLocaleString("en-IN")})
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-4 border-t border-border mt-2 no-print">
                <button
                  type="button"
                  onClick={() => onSelectScenario(key)}
                  className={`w-full py-2.5 px-4 rounded-[var(--radius-md)] text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-subtle ${
                    isSelected
                      ? "bg-forest text-white hover:bg-forest-light"
                      : "bg-ivory-warm border border-border text-charcoal hover:bg-forest hover:text-white hover:border-forest"
                  }`}
                >
                  {isSelected ? (
                    <>
                      <Check size={14} />
                      <span>{isKn ? "ಸಕ್ರಿಯ ಯೋಜನೆ" : "Active Scenario"}</span>
                    </>
                  ) : (
                    <>
                      <span>{isKn ? "ಈ ಯೋಜನೆಯನ್ನು ಅನ್ವಯಿಸಿ" : "Apply This Scenario"}</span>
                      <ArrowRight size={13} />
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
