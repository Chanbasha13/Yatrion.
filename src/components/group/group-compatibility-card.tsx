"use client";

import {
  AlertTriangle,
  Lightbulb,
  CheckCircle2,
  Clock,
  Accessibility,
  HeartHandshake,
} from "lucide-react";
import type { GroupCompatibilityReport } from "@/lib/group/group-types";
import { useLanguage } from "@/lib/i18n";

interface GroupCompatibilityCardProps {
  report: GroupCompatibilityReport;
}

export function GroupCompatibilityCard({ report }: GroupCompatibilityCardProps) {
  const { isKn } = useLanguage();

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-forest border-forest bg-forest/10";
    if (score >= 60) return "text-gold-dark border-gold bg-gold/15";
    return "text-terracotta border-terracotta bg-terracotta/10";
  };

  const getScoreStatus = (score: number) => {
    if (score >= 80) {
      return isKn ? "ಉತ್ತಮ ಹೊಂದಾಣಿಕೆ (High Alignment)" : "High Alignment";
    }
    if (score >= 60) {
      return isKn ? "ಸಮತೋಲಿತ ಹೊಂದಾಣಿಕೆ (Balanced Alignment)" : "Balanced Alignment";
    }
    return isKn ? "ವೈವಿಧ್ಯಮಯ ಆದ್ಯತೆಗಳು (Diverse Interests)" : "Diverse Interests";
  };

  return (
    <div className="rounded-[var(--radius-xl)] border border-border bg-white p-6 sm:p-8 shadow-card space-y-6">
      {/* Top Banner: Compatibility Score and Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-border">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <HeartHandshake size={20} className="text-forest" />
            <h3 className="font-[family-name:var(--font-playfair)] text-xl sm:text-2xl font-bold text-forest-dark">
              {isKn ? "ತಂಡದ ಹೊಂದಾಣಿಕೆ ಮತ್ತು ನಿರ್ಧಾರ ವಿಶ್ಲೇಷಣೆ" : "Group Compatibility & Decision Analysis"}
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-charcoal-muted max-w-xl leading-relaxed">
            {isKn
              ? "ವೈಯಕ್ತಿಕ ಆಸಕ್ತಿಗಳು, ಪ್ರಯಾಣದ ವೇಗ, ಬಜೆಟ್ ಮತ್ತು ಪ್ರವೇಶಾವಶ್ಯಕತೆಗಳನ್ನು ಪಾರದರ್ಶಕವಾಗಿ ವಿಶ್ಲೇಷಿಸಿ ರಚಿಸಲಾದ ವರದಿ."
              : "Deterministic analysis combining individual interests, travel paces, budget limits, and accessibility needs."}
          </p>
        </div>

        {/* Circular / Badge Score */}
        <div className="flex items-center gap-4 shrink-0">
          <div
            className={`w-20 h-20 rounded-full border-4 flex flex-col items-center justify-center font-bold shadow-subtle ${getScoreColor(
              report.overallScore
            )}`}
          >
            <span className="text-2xl font-mono leading-none">
              {report.overallScore}
            </span>
            <span className="text-[10px] uppercase font-mono tracking-wider mt-0.5 opacity-80">
              / 100
            </span>
          </div>
          <div>
            <span className="text-[11px] font-mono font-bold text-charcoal-muted uppercase block">
              {isKn ? "ಹೊಂದಾಣಿಕೆ ದರ್ಜೆ" : "Compatibility Rating"}
            </span>
            <span className="text-sm font-bold text-charcoal block">
              {getScoreStatus(report.overallScore)}
            </span>
            <span className="text-[11px] text-charcoal-muted">
              {report.sharedInterests.filter((s) => s.isMajority).length}{" "}
              {isKn ? "ಬಹುಮತದ ಆಸಕ್ತಿಗಳು" : "majority interests"}
            </span>
          </div>
        </div>
      </div>

      {/* 4 Score Breakdown Meters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="p-3 rounded-[var(--radius-md)] bg-ivory-warm/60 border border-border">
          <div className="flex justify-between font-medium text-charcoal-muted mb-1">
            <span>{isKn ? "ಆಸಕ್ತಿಗಳ ಹೊಂದಾಣಿಕೆ" : "Interest Match"}</span>
            <span className="font-mono font-bold text-charcoal">
              {report.breakdown.interestAlignment}/40
            </span>
          </div>
          <div className="w-full bg-border/60 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-forest h-full rounded-full transition-all"
              style={{
                width: `${(report.breakdown.interestAlignment / 40) * 100}%`,
              }}
            />
          </div>
        </div>

        <div className="p-3 rounded-[var(--radius-md)] bg-ivory-warm/60 border border-border">
          <div className="flex justify-between font-medium text-charcoal-muted mb-1">
            <span>{isKn ? "ವೇಗದ ಹೊಂದಾಣಿಕೆ" : "Pace Alignment"}</span>
            <span className="font-mono font-bold text-charcoal">
              {report.breakdown.paceAlignment}/25
            </span>
          </div>
          <div className="w-full bg-border/60 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-forest h-full rounded-full transition-all"
              style={{
                width: `${(report.breakdown.paceAlignment / 25) * 100}%`,
              }}
            />
          </div>
        </div>

        <div className="p-3 rounded-[var(--radius-md)] bg-ivory-warm/60 border border-border">
          <div className="flex justify-between font-medium text-charcoal-muted mb-1">
            <span>{isKn ? "ಬಜೆಟ್ ಹೊಂದಾಣಿಕೆ" : "Budget Harmony"}</span>
            <span className="font-mono font-bold text-charcoal">
              {report.breakdown.budgetHarmony}/20
            </span>
          </div>
          <div className="w-full bg-border/60 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-gold-dark h-full rounded-full transition-all"
              style={{
                width: `${(report.breakdown.budgetHarmony / 20) * 100}%`,
              }}
            />
          </div>
        </div>

        <div className="p-3 rounded-[var(--radius-md)] bg-ivory-warm/60 border border-border">
          <div className="flex justify-between font-medium text-charcoal-muted mb-1">
            <span>{isKn ? "ಪ್ರವೇಶಸಾಧ್ಯತೆ" : "Accessibility"}</span>
            <span className="font-mono font-bold text-charcoal">
              {report.breakdown.accessibilityFeasibility}/15
            </span>
          </div>
          <div className="w-full bg-border/60 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-forest h-full rounded-full transition-all"
              style={{
                width: `${(report.breakdown.accessibilityFeasibility / 15) * 100}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Shared Interests Section */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold text-charcoal uppercase tracking-wider font-mono flex items-center gap-1.5">
          <CheckCircle2 size={14} className="text-forest" />
          <span>{isKn ? "ಹಂಚಿಕೊಂಡ ಆಸಕ್ತಿಗಳು (Shared Group Interests)" : "Shared Group Interests"}</span>
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
          {report.sharedInterests.map((si) => (
            <div
              key={si.interest}
              className="p-3 rounded-[var(--radius-md)] border border-border bg-ivory-warm/40 flex items-center justify-between text-xs"
            >
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-charcoal">
                    {isKn ? si.labelKn : si.labelEn}
                  </span>
                  {si.isUnanimous ? (
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-forest text-white font-semibold">
                      {isKn ? "ಸರ್ವಾನುಮತ" : "100% Unanimous"}
                    </span>
                  ) : si.isMajority ? (
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-forest/15 text-forest font-semibold">
                      {isKn ? "ಬಹುಮತ" : "Majority"}
                    </span>
                  ) : null}
                </div>
                <p className="text-[11px] text-charcoal-muted mt-0.5">
                  {si.travellerNames.join(", ")}
                </p>
              </div>
              <span className="font-mono font-bold text-forest text-xs ml-2">
                {si.percentage}%
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Conflicting Interests & Compromises */}
      {report.conflictingInterests.length > 0 && (
        <div className="space-y-3 pt-2">
          <h4 className="text-xs font-bold text-terracotta uppercase tracking-wider font-mono flex items-center gap-1.5">
            <AlertTriangle size={14} className="text-terracotta" />
            <span>{isKn ? "ಆಸಕ್ತಿಗಳ ಸಂಘರ್ಷ & ಹೊಂದಾಣಿಕೆ ಸಲಹೆಗಳು" : "Preference Tensions & Smart Compromises"}</span>
          </h4>
          <div className="space-y-2.5">
            {report.conflictingInterests.map((conf) => (
              <div
                key={conf.id}
                className="p-4 rounded-[var(--radius-md)] border border-terracotta/25 bg-terracotta/5 text-xs space-y-2"
              >
                <div className="flex items-start gap-2 text-charcoal font-medium">
                  <span className="shrink-0 text-terracotta mt-0.5 font-bold">●</span>
                  <p>{isKn ? conf.descriptionKn : conf.descriptionEn}</p>
                </div>
                <div className="pl-4 border-l-2 border-forest/40 flex items-start gap-2 text-charcoal">
                  <Lightbulb size={14} className="text-forest shrink-0 mt-0.5" />
                  <p className="text-[11px] text-charcoal-muted leading-relaxed">
                    <strong className="text-forest-dark font-semibold">
                      {isKn ? "ಶಿಫಾರಸು ಮಾಡಿದ ಹೊಂದಾಣಿಕೆ: " : "Recommended Compromise: "}
                    </strong>
                    {isKn ? conf.suggestedCompromiseKn : conf.suggestedCompromiseEn}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pace Consensus & Accessibility Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
        <div className="p-3.5 rounded-[var(--radius-md)] bg-ivory-warm border border-border flex items-center gap-3 text-xs">
          <Clock size={16} className="text-forest shrink-0" />
          <div>
            <span className="font-bold text-charcoal block">
              {isKn ? "ಶಿಫಾರಸು ಮಾಡಿದ ತಂಡದ ವೇಗ:" : "Recommended Group Pace:"}{" "}
              <span className="text-forest capitalize">
                {report.paceConsensus}
              </span>
            </span>
            <span className="text-[11px] text-charcoal-muted">
              {report.hasPaceConflict
                ? isKn
                  ? "ವಿಭಿನ್ನ ವೇಗಗಳನ್ನು ಹೊಂದಿಸಲು ವಿಶ್ರಾಂತಿ ಸಮಯ ಕಾಯ್ದಿರಿಸಲಾಗಿದೆ."
                  : "Mixed pace preferences resolved with designated rest windows."
                : isKn
                ? "ಎಲ್ಲಾ ಸದಸ್ಯರ ವೇಗದಲ್ಲಿ ಪೂರ್ಣ ಒಮ್ಮತವಿದೆ."
                : "Full consensus across all group members."}
            </span>
          </div>
        </div>

        <div className="p-3.5 rounded-[var(--radius-md)] bg-ivory-warm border border-border flex items-center gap-3 text-xs">
          <Accessibility size={16} className="text-forest shrink-0" />
          <div>
            <span className="font-bold text-charcoal block">
              {isKn ? "ಪ್ರವೇಶಾವಶ್ಯಕತೆ ಸ್ಥಿತಿ:" : "Group Accessibility:"}{" "}
              <span className="text-forest">
                {report.accessibilityRequirementsActive.length > 0
                  ? report.accessibilityRequirementsActive.join(", ")
                  : isKn
                  ? "ಸಾಮಾನ್ಯ"
                  : "Standard"}
              </span>
            </span>
            <span className="text-[11px] text-charcoal-muted">
              {report.accessibilityRequirementsActive.length > 0
                ? isKn
                  ? "ಕಡಿದಾದ ಚಾರಣಗಳನ್ನು ಐಚ್ಛಿಕವಾಗಿ ಗುರುತಿಸಲಾಗಿದೆ."
                  : "Strenuous activities automatically flagged as optional."
                : isKn
                ? "ಎಲ್ಲಾ ತಾಣಗಳೂ ತಂಡಕ್ಕೆ ಮುಕ್ತವಾಗಿವೆ."
                : "All terrain accessible for group members."}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
