"use client";

import {
  Wallet,
  AlertTriangle,
  CheckCircle2,
  ShieldCheck,
} from "lucide-react";
import type { GroupBudgetAnalysis } from "@/lib/group/group-types";
import { useLanguage } from "@/lib/i18n";

interface GroupBudgetSummaryProps {
  analysis: GroupBudgetAnalysis;
  travellerCount: number;
}

export function GroupBudgetSummary({
  analysis,
  travellerCount,
}: GroupBudgetSummaryProps) {
  const { isKn } = useLanguage();

  return (
    <div className="rounded-[var(--radius-xl)] border border-border bg-white p-6 sm:p-8 shadow-card space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <Wallet size={20} className="text-forest" />
            <h3 className="font-[family-name:var(--font-playfair)] text-xl sm:text-2xl font-bold text-forest-dark">
              {isKn ? "ತಂಡದ ಬಜೆಟ್ ವಿಶ್ಲೇಷಣೆ & ಹಂಚಿಕೆ" : "Group Budget Analysis & Allocation"}
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-charcoal-muted mt-1 leading-relaxed">
            {isKn
              ? "ವೈಯಕ್ತಿಕ ಬಜೆಟ್ ಮಿತಿಗಳು, ಸಮಾನ ಹಂಚಿಕೆ ಮತ್ತು ಸಂಭಾವ್ಯ ಕೊರತೆಗಳ ಪಾರದರ್ಶಕ ಲೆಕ್ಕಾಚಾರ."
              : "Transparent calculation comparing individual ceilings with estimated per-person trip costs."}
          </p>
        </div>

        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-forest/10 border border-forest/20 text-xs font-semibold text-forest">
          <CheckCircle2 size={14} />
          <span>
            {isKn ? "ಶಿಫಾರಸು ಮಾಡಿದ ಸನ್ನಿವೇಶ: " : "Recommended Scenario: "}
            <strong className="capitalize">
              {analysis.recommendedScenario.replace("_", " ")}
            </strong>
          </span>
        </div>
      </div>

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-[var(--radius-lg)] bg-ivory-warm border border-border">
          <span className="text-[11px] font-mono uppercase tracking-wider text-charcoal-muted block">
            {isKn ? "ಒಟ್ಟು ಪ್ರವಾಸ ಅಂದಾಜು" : "Total Group Estimated Cost"}
          </span>
          <span className="text-xl sm:text-2xl font-bold font-mono text-forest-dark block mt-1">
            ₹{analysis.totalEstimatedTripCost.toLocaleString("en-IN")}
          </span>
          <span className="text-[11px] text-charcoal-muted mt-1 block">
            {isKn ? `${travellerCount} ಪ್ರಯಾಣಿಕರಿಗೆ ಒಟ್ಟು ವೆಚ್ಚ` : `Across ${travellerCount} travellers`}
          </span>
        </div>

        <div className="p-4 rounded-[var(--radius-lg)] bg-ivory-warm border border-border">
          <span className="text-[11px] font-mono uppercase tracking-wider text-charcoal-muted block">
            {isKn ? "ಪ್ರತಿ ವ್ಯಕ್ತಿಗೆ ಸಮಾನ ಪಾಲು" : "Equal Share Per Person"}
          </span>
          <span className="text-xl sm:text-2xl font-bold font-mono text-charcoal block mt-1">
            ₹{analysis.equalContributionAmount.toLocaleString("en-IN")}
          </span>
          <span className="text-[11px] text-charcoal-muted mt-1 block">
            {isKn ? "ಸಮಾನ ವೆಚ್ಚ ಹಂಚಿಕೆ ಸೂತ್ರ" : "Base equal split contribution"}
          </span>
        </div>

        <div className="p-4 rounded-[var(--radius-lg)] bg-ivory-warm border border-border">
          <span className="text-[11px] font-mono uppercase tracking-wider text-charcoal-muted block">
            {isKn ? "ತುರ್ತು ನಿಧಿ (ಪ್ರತಿ ವ್ಯಕ್ತಿಗೆ)" : "Contingency Share"}
          </span>
          <span className="text-xl sm:text-2xl font-bold font-mono text-gold-dark block mt-1">
            ₹{analysis.contingencySharePerPerson.toLocaleString("en-IN")}
          </span>
          <span className="text-[11px] text-charcoal-muted mt-1 block flex items-center gap-1">
            <ShieldCheck size={11} className="text-forest" />
            <span>{isKn ? "ಅನಿರೀಕ್ಷಿತ ರಸ್ತೆ/ವೈದ್ಯಕೀಯ ಬಫರ್" : "Medical & transit buffer"}</span>
          </span>
        </div>
      </div>

      {/* Budget Conflicts & Deficit Alerts */}
      {analysis.conflicts.length > 0 ? (
        <div className="p-4 rounded-[var(--radius-lg)] border border-error/30 bg-error/5 space-y-3">
          <div className="flex items-center gap-2 text-error font-bold text-xs uppercase tracking-wider font-mono">
            <AlertTriangle size={15} />
            <span>
              {isKn
                ? "ಬಜೆಟ್ ಮಿತಿ ಎಚ್ಚರಿಕೆ (Budget Ceiling Conflicts)"
                : "Budget Ceiling Conflicts Detected"}
            </span>
          </div>
          <div className="space-y-2">
            {analysis.conflicts.map((conf) => (
              <div
                key={conf.travellerId}
                className="p-3 rounded-[var(--radius-md)] bg-white border border-error/20 text-xs text-charcoal space-y-1"
              >
                <div className="flex items-center justify-between font-semibold">
                  <span>{conf.travellerName}</span>
                  <span className="text-error font-mono">
                    {isKn ? "ಕೊರತೆ: " : "Deficit: "}₹{conf.deficitAmount.toLocaleString("en-IN")}
                  </span>
                </div>
                <p className="text-[11px] text-charcoal-muted leading-relaxed">
                  {isKn ? conf.adviceKn : conf.adviceEn}
                </p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-[var(--radius-lg)] border border-forest/20 bg-forest/5 flex items-center gap-3 text-xs text-forest-dark">
          <CheckCircle2 size={18} className="text-forest shrink-0" />
          <p>
            {isKn
              ? "ಎಲ್ಲಾ ಪ್ರಯಾಣಿಕರ ಬಜೆಟ್ ಮಿತಿಗಳು ಯೋಜಿತ ಪ್ರವಾಸ ವೆಚ್ಚಕ್ಕೆ ಹೊಂದಾಣಿಕೆಯಾಗಿವೆ."
              : "All individual budget limits are comfortably aligned with the estimated per-person trip costs."}
          </p>
        </div>
      )}
    </div>
  );
}
