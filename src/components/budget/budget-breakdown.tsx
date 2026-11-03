"use client";

import { useState } from "react";
import {
  Car,
  Home,
  Utensils,
  MapPin,
  Ticket,
  Sparkles,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  FileText,
} from "lucide-react";
import type {
  BudgetScenario,
  ExpenseCategoryEstimate,
  ExpenseCategoryKey,
} from "@/lib/budget/budget-types";
import { useLanguage } from "@/lib/i18n";

interface BudgetBreakdownProps {
  scenario: BudgetScenario;
  travellerCount: number;
  durationDays: number;
}

export function BudgetBreakdown({
  scenario,
  travellerCount,
  durationDays,
}: BudgetBreakdownProps) {
  const { isKn } = useLanguage();
  const [scope, setScope] = useState<"group" | "person">("group");
  const [period, setPeriod] = useState<"total" | "daily">("total");
  const [expandedCategoryKey, setExpandedCategoryKey] = useState<ExpenseCategoryKey | null>(null);

  const getCategoryIcon = (key: ExpenseCategoryKey) => {
    switch (key) {
      case "transport":
        return <Car size={15} className="text-sky-600" />;
      case "accommodation":
        return <Home size={15} className="text-emerald-700" />;
      case "food":
        return <Utensils size={15} className="text-amber-600" />;
      case "localTravel":
        return <MapPin size={15} className="text-teal-600" />;
      case "activities":
        return <Ticket size={15} className="text-indigo-600" />;
      case "miscellaneous":
        return <Sparkles size={15} className="text-charcoal-muted" />;
      case "contingency":
        return <ShieldAlert size={15} className="text-rose-600" />;
    }
  };

  const getCategoryBarColor = (key: ExpenseCategoryKey) => {
    switch (key) {
      case "transport":
        return "bg-sky-500";
      case "accommodation":
        return "bg-emerald-600";
      case "food":
        return "bg-amber-500";
      case "localTravel":
        return "bg-teal-500";
      case "activities":
        return "bg-indigo-500";
      case "miscellaneous":
        return "bg-charcoal/30";
      case "contingency":
        return "bg-rose-400";
    }
  };

  const formatAmount = (category: ExpenseCategoryEstimate) => {
    let amt = category.estimatedCost;
    if (scope === "person") {
      amt = category.perPersonCost;
    }
    if (period === "daily") {
      amt = Math.round(amt / Math.max(1, durationDays));
    }
    return `₹${amt.toLocaleString("en-IN")}`;
  };

  return (
    <div className="rounded-[var(--radius-xl)] border border-border bg-white p-6 sm:p-8 shadow-card space-y-6">
      {/* ── HEADER & SCOPE TOGGLES ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold font-mono uppercase tracking-wider border ${scenario.badgeColor}`}
            >
              {isKn ? scenario.nameKn : scenario.nameEn}
            </span>
            <span className="text-xs text-charcoal-muted font-mono">
              ({durationDays} {isKn ? "ದಿನಗಳು" : "days"} · {travellerCount}{" "}
              {isKn ? "ಪ್ರವಾಸಿಗರು" : "travelers"})
            </span>
          </div>
          <h3 className="font-[family-name:var(--font-playfair)] text-xl sm:text-2xl font-bold text-forest-dark mt-1">
            {isKn ? "ವರ್ಗಾವಾರು ವಿವರವಾದ ವೆಚ್ಚ ವಿಶ್ಲೇಷಣೆ" : "Detailed Expense Category Breakdown"}
          </h3>
        </div>

        {/* View Mode Selectors */}
        <div className="flex flex-wrap items-center gap-2 no-print">
          {/* Group vs Person */}
          <div className="inline-flex rounded-[var(--radius-md)] border border-border p-0.5 bg-ivory-warm">
            <button
              type="button"
              onClick={() => setScope("group")}
              className={`px-3 py-1 text-xs font-semibold rounded-[var(--radius-sm)] transition-colors cursor-pointer ${
                scope === "group"
                  ? "bg-forest text-white shadow-subtle"
                  : "text-charcoal hover:text-forest"
              }`}
            >
              {isKn ? `ಇಡೀ ತಂಡ (${travellerCount})` : `Entire Group (${travellerCount})`}
            </button>
            <button
              type="button"
              onClick={() => setScope("person")}
              className={`px-3 py-1 text-xs font-semibold rounded-[var(--radius-sm)] transition-colors cursor-pointer ${
                scope === "person"
                  ? "bg-forest text-white shadow-subtle"
                  : "text-charcoal hover:text-forest"
              }`}
            >
              {isKn ? "ಪ್ರತಿ ವ್ಯಕ್ತಿಗೆ" : "Per Person"}
            </button>
          </div>

          {/* Total vs Daily */}
          <div className="inline-flex rounded-[var(--radius-md)] border border-border p-0.5 bg-ivory-warm">
            <button
              type="button"
              onClick={() => setPeriod("total")}
              className={`px-3 py-1 text-xs font-semibold rounded-[var(--radius-sm)] transition-colors cursor-pointer ${
                period === "total"
                  ? "bg-forest text-white shadow-subtle"
                  : "text-charcoal hover:text-forest"
              }`}
            >
              {isKn ? "ಒಟ್ಟು ಪ್ರವಾಸ" : "Total Trip"}
            </button>
            <button
              type="button"
              onClick={() => setPeriod("daily")}
              className={`px-3 py-1 text-xs font-semibold rounded-[var(--radius-sm)] transition-colors cursor-pointer ${
                period === "daily"
                  ? "bg-forest text-white shadow-subtle"
                  : "text-charcoal hover:text-forest"
              }`}
            >
              {isKn ? "ದೈನಂದಿನ ಸರಾಸರಿ" : "Daily Avg"}
            </button>
          </div>
        </div>
      </div>

      {/* ── VISUAL PERCENTAGE COMPOSITION BAR ── */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-charcoal font-semibold">
          <span className="font-mono text-charcoal-muted uppercase tracking-wider text-[11px]">
            {isKn ? "ವೆಚ್ಚದ ಹಂಚಿಕೆ ಪ್ರತಿಶತ:" : "Budget Allocation Composition:"}
          </span>
          <span className="font-mono text-forest font-bold">
            100% {isKn ? "ಲೆಕ್ಕಹಾಕಲಾಗಿದೆ" : "Accounted"}
          </span>
        </div>

        {/* Multi-segment Progress Bar */}
        <div className="h-3.5 w-full rounded-full bg-border overflow-hidden flex shadow-inner">
          {scenario.categories.map((cat) => (
            <div
              key={cat.key}
              style={{ width: `${cat.percentageOfTotal}%` }}
              className={`${getCategoryBarColor(cat.key)} h-full transition-all`}
              title={`${cat.labelEn}: ${cat.percentageOfTotal}%`}
            />
          ))}
        </div>

        {/* Bar Legend */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 pt-1 text-[11px] text-charcoal-muted font-mono">
          {scenario.categories.map((cat) => (
            <div key={cat.key} className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${getCategoryBarColor(cat.key)}`} />
              <span>{isKn ? cat.labelKn : cat.labelEn}</span>
              <strong className="text-charcoal font-bold">
                {cat.percentageOfTotal}%
              </strong>
            </div>
          ))}
        </div>
      </div>

      {/* ── 7 CATEGORY CARDS GRID ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
        {scenario.categories.map((cat) => {
          const isExpanded = expandedCategoryKey === cat.key;

          return (
            <div
              key={cat.key}
              className="rounded-[var(--radius-lg)] border border-border bg-white p-4 shadow-subtle hover:border-forest/30 transition-all space-y-2"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-md bg-ivory-warm border border-border">
                    {getCategoryIcon(cat.key)}
                  </span>
                  <div>
                    <h4 className="text-sm font-bold text-forest-dark">
                      {isKn ? cat.labelKn : cat.labelEn}
                    </h4>
                    <span className="text-[10px] text-charcoal-muted font-mono">
                      {cat.percentageOfTotal}% {isKn ? "ಒಟ್ಟು ಬಜೆಟ್‌ನಲ್ಲಿ" : "of total budget"}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-base font-bold font-mono text-forest">
                    {formatAmount(cat)}
                  </span>
                  {cat.isRouteGrounded && (
                    <span className="block text-[9px] font-mono text-sky-700 bg-sky-50 border border-sky-200 rounded px-1.5 py-0.2 mt-0.5">
                      {isKn ? "ಮಾರ್ಗ ಆಧಾರಿತ" : "Route Grounded"}
                    </span>
                  )}
                </div>
              </div>

              {/* Basis / Assumptions Explanation */}
              <p className="text-xs text-charcoal-muted leading-relaxed">
                {isKn ? cat.basisOrAssumptionKn : cat.basisOrAssumptionEn}
              </p>

              {/* Expandable Details Drawer */}
              <div className="pt-2 border-t border-border/70 text-xs">
                <button
                  type="button"
                  onClick={() =>
                    setExpandedCategoryKey(isExpanded ? null : cat.key)
                  }
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-forest hover:text-forest-light cursor-pointer"
                >
                  <FileText size={11} />
                  <span>
                    {isExpanded
                      ? isKn
                        ? "ವಿವರಗಳನ್ನು ಮರೆಮಾಡಿ"
                        : "Hide Inclusions"
                      : isKn
                      ? "ಒಳಗೊಂಡಿರುವ / ಹೊರತುಪಡಿಸಿದ ವೆಚ್ಚಗಳು"
                      : "View Inclusions & Exclusions"}
                  </span>
                  {isExpanded ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
                </button>

                {isExpanded && (
                  <div className="mt-2.5 p-3 rounded-md bg-ivory-warm border border-border space-y-2 text-[11px] animate-fade-in">
                    <div>
                      <span className="font-bold text-forest block mb-1">
                        {isKn ? "ಒಳಗೊಂಡಿರುವ ಅಂಶಗಳು:" : "What is Included:"}
                      </span>
                      <ul className="list-disc list-inside space-y-0.5 text-charcoal-muted">
                        {(isKn ? cat.includedNotesKn : cat.includedNotesEn).map(
                          (n, idx) => (
                            <li key={idx}>{n}</li>
                          )
                        )}
                      </ul>
                    </div>

                    <div>
                      <span className="font-bold text-rose-700 block mb-1">
                        {isKn ? "ಹೊರತುಪಡಿಸಿದ ಅಂಶಗಳು:" : "What is Excluded:"}
                      </span>
                      <ul className="list-disc list-inside space-y-0.5 text-charcoal-muted">
                        {(isKn ? cat.excludedNotesKn : cat.excludedNotesEn).map(
                          (n, idx) => (
                            <li key={idx}>{n}</li>
                          )
                        )}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── TRANSPARENCY & DATA LABELS FOOTNOTE ── */}
      <div className="pt-3 border-t border-border/80 flex flex-wrap items-center justify-between gap-3 text-[11px] text-charcoal-muted font-mono">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded bg-sky-50 border border-sky-200 px-2 py-0.5 text-sky-800 text-[10px]">
            <CheckCircle2 size={10} />
            <span>{isKn ? "ಪರಿಶೀಲಿಸಿದ ದತ್ತಾಂಶ: ASI ಪಾಸ್‌ಗಳು & ಮಾರ್ಗ ಕಿ.ಮೀ" : "Verified: ASI fees & route km"}</span>
          </span>
          <span className="inline-flex items-center gap-1 rounded bg-amber-50 border border-amber-200 px-2 py-0.5 text-amber-800 text-[10px]">
            <span>{isKn ? "ಅಂದಾಜು: ಪ್ರಾದೇಶಿಕ ಸರಾಸರಿಗಳು" : "Estimated: Regional benchmarks"}</span>
          </span>
        </div>

        <p className="italic">
          {isKn
            ? "ನೈಜ ಬೆಲೆಗಳು ಋತುಮಾನ ಮತ್ತು ಹೋಟೆಲ್ ಲಭ್ಯತೆಗೆ ಅನುಗುಣವಾಗಿ ಬದಲಾಗಬಹುದು."
            : "Actual costs vary by seasonality and hotel availability."}
        </p>
      </div>
    </div>
  );
}
