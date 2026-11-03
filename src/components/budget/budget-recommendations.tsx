"use client";

import {
  Sparkles,
  TrendingDown,
  ShieldCheck,
  Compass,
  Home,
  Car,
  Ticket,
  Utensils,
  Clock,
  Lightbulb,
} from "lucide-react";
import type {
  BudgetRecommendation,
  DailyExpenseEstimate,
} from "@/lib/budget/budget-types";
import { useLanguage } from "@/lib/i18n";

interface BudgetRecommendationsProps {
  recommendations: BudgetRecommendation[];
  dailyExpenses: DailyExpenseEstimate[];
  mostExpensiveDayNumber: number;
}

export function BudgetRecommendations({
  recommendations,
  dailyExpenses,
  mostExpensiveDayNumber,
}: BudgetRecommendationsProps) {
  const { isKn } = useLanguage();

  const mostExpensiveDay = dailyExpenses.find(
    (d) => d.dayNumber === mostExpensiveDayNumber
  );

  const totalPotentialSavings = recommendations.reduce(
    (sum, r) => sum + r.estimatedSavingsInr,
    0
  );

  const getRecIcon = (type: BudgetRecommendation["type"]) => {
    switch (type) {
      case "accommodation":
        return <Home size={15} className="text-emerald-700" />;
      case "transport":
        return <Car size={15} className="text-sky-600" />;
      case "activities":
        return <Ticket size={15} className="text-indigo-600" />;
      case "food":
        return <Utensils size={15} className="text-amber-600" />;
      case "routing":
        return <Compass size={15} className="text-forest" />;
      case "duration":
        return <Clock size={15} className="text-purple-600" />;
    }
  };

  const getImpactBadge = (level: "high" | "medium" | "low") => {
    switch (level) {
      case "high":
        return (
          <span className="inline-flex items-center rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider font-mono">
            {isKn ? "ಹೆಚ್ಚಿನ ಉಳಿತಾಯ" : "High Savings"}
          </span>
        );
      case "medium":
        return (
          <span className="inline-flex items-center rounded-full bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider font-mono">
            {isKn ? "ಮಧ್ಯಮ ಉಳಿತಾಯ" : "Medium Savings"}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center rounded-full bg-charcoal/10 text-charcoal border border-border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider font-mono">
            {isKn ? "ಸಣ್ಣ ಉಳಿತಾಯ" : "Minor Savings"}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* ── HEADER BANNER WITH TOTAL SAVINGS ── */}
      <div className="rounded-[var(--radius-xl)] border border-border bg-white p-6 sm:p-7 shadow-card space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-border">
          <div className="flex items-center gap-2">
            <Sparkles size={18} className="text-forest" />
            <h3 className="font-[family-name:var(--font-playfair)] text-xl sm:text-2xl font-bold text-forest-dark">
              {isKn
                ? "ಜಾಣ್ಮೆಯ ಉಳಿತಾಯ ಸಲಹೆಗಳು ಮತ್ತು ವೆಚ್ಚ ನಿಯಂತ್ರಣ"
                : "Intelligent Cost Optimization & Practical Savings"}
            </h3>
          </div>

          {totalPotentialSavings > 0 && (
            <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-300 px-3.5 py-1 text-xs font-bold text-emerald-900 shadow-subtle font-mono">
              <TrendingDown size={14} className="text-emerald-700" />
              <span>
                {isKn
                  ? `ಒಟ್ಟು ಉಳಿತಾಯ ಅವಕಾಶ: ~₹${totalPotentialSavings.toLocaleString("en-IN")}`
                  : `Total Potential Savings: ~₹${totalPotentialSavings.toLocaleString("en-IN")}`}
              </span>
            </div>
          )}
        </div>

        <p className="text-xs sm:text-sm text-charcoal-muted leading-relaxed">
          {isKn
            ? "ಕರ್ನಾಟಕ ಪ್ರವಾಸದ ಸಾರಿಗೆ, ವಸತಿ ಮತ್ತು ಸ್ಥಳೀಯ ಆಹಾರದ ನೈಜ ನಿಯತಾಂಕಗಳ ಆಧಾರದ ಮೇಲೆ ರಚಿಸಲಾದ ಶಿಫಾರಸುಗಳು. ಇವು ಪ್ರವಾಸದ ಸುರಕ್ಷತೆ ಮತ್ತು ಪ್ರಮುಖ ಅನುಭವಗಳನ್ನು ರಾಜಿ ಮಾಡಿಕೊಳ್ಳುವುದಿಲ್ಲ."
            : "Deterministic savings recommendations derived from Yatrion's verified destination benchmarks. Every recommendation preserves personal safety, hygiene, and authentic cultural experiences."}
        </p>

        {/* ── MOST EXPENSIVE DAY SPOTLIGHT ── */}
        {mostExpensiveDay && (
          <div className="mt-4 p-4 rounded-[var(--radius-lg)] border border-amber-300/80 bg-amber-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-amber-950 font-mono text-[11px] uppercase tracking-wider bg-amber-200/80 px-2 py-0.5 rounded">
                  {isKn ? "ಗರಿಷ್ಠ ವೆಚ್ಚದ ದಿನ" : "Most Expensive Day"}
                </span>
                <span className="font-bold text-forest-dark text-sm">
                  {isKn ? `ದಿನ ${mostExpensiveDay.dayNumber}` : `Day ${mostExpensiveDay.dayNumber}`}:{" "}
                  {isKn ? mostExpensiveDay.destinationKannada : mostExpensiveDay.destinationName}
                </span>
              </div>
              <p className="text-amber-900 leading-relaxed">
                {isKn ? mostExpensiveDay.primaryCostDriverKn : mostExpensiveDay.primaryCostDriverEn}
              </p>
            </div>

            <div className="shrink-0 text-right">
              <span className="text-xs text-amber-800 font-mono block">
                {isKn ? "ಅಂದಾಜು ದಿನದ ವೆಚ್ಚ:" : "Est. Day Cost:"}
              </span>
              <span className="text-base sm:text-lg font-bold font-mono text-amber-950">
                ₹{mostExpensiveDay.estimatedDayCost.toLocaleString("en-IN")}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* ── RECOMMENDATION CARDS LIST ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {recommendations.map((rec) => (
          <div
            key={rec.id}
            className="rounded-[var(--radius-lg)] border border-border bg-white p-5 shadow-subtle hover:border-forest/30 transition-all flex flex-col justify-between space-y-3"
          >
            <div className="space-y-2.5">
              {/* Card Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-md bg-ivory-warm border border-border">
                    {getRecIcon(rec.type)}
                  </span>
                  <div>
                    <h4 className="text-sm font-bold text-forest-dark">
                      {isKn ? rec.titleKn : rec.titleEn}
                    </h4>
                  </div>
                </div>

                <div className="shrink-0 text-right">
                  {getImpactBadge(rec.impactLevel)}
                  <span className="block text-xs font-bold font-mono text-emerald-800 mt-1">
                    {isKn
                      ? `~₹${rec.estimatedSavingsInr.toLocaleString("en-IN")} ಉಳಿತಾಯ`
                      : `Save ~₹${rec.estimatedSavingsInr.toLocaleString("en-IN")}`}
                  </span>
                </div>
              </div>

              {/* Description */}
              <p className="text-xs text-charcoal-muted leading-relaxed">
                {isKn ? rec.descriptionKn : rec.descriptionEn}
              </p>

              {/* Actionable Suggestion Callout */}
              <div className="rounded-md bg-forest/5 border border-forest/20 p-2.5 text-xs text-forest-dark flex items-start gap-2">
                <Lightbulb size={14} className="shrink-0 text-forest mt-0.5" />
                <span className="leading-snug">
                  {isKn ? rec.actionableSuggestionKn : rec.actionableSuggestionEn}
                </span>
              </div>
            </div>

            {/* Safety Affirmation Footnote */}
            <div className="pt-2 border-t border-border/70 flex items-center gap-1.5 text-[11px] text-emerald-900 font-medium">
              <ShieldCheck size={13} className="shrink-0 text-emerald-700" />
              <span>{isKn ? rec.safetyAffirmationKn : rec.safetyAffirmationEn}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
