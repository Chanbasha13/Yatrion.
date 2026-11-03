"use client";

import React from "react";
import { useLanguage } from "@/lib/i18n";
import { 
  Sparkles, 
  SlidersHorizontal, 
  Cpu, 
  Compass, 
  CheckCircle,
  ArrowRight,
  ShieldCheck,
  ChevronRight
} from "lucide-react";
import Link from "next/link";

export function HowItWorksThreeSteps() {
  const { t, isKn } = useLanguage();

  const steps = [
    {
      num: "01",
      icon: <SlidersHorizontal className="text-forest" size={24} />,
      badgeEn: "Input & Context",
      badgeKn: "ಆಯ್ಕೆ ಮತ್ತು ಆದ್ಯತೆ",
      titleEn: "Configure Preferences & Group Mobility",
      titleKn: "ನಿಮ್ಮ ಪ್ರಯಾಣ ಆದ್ಯತೆ ಮತ್ತು ಗುಂಪು ವಿವರ ಆಯ್ಕೆಮಾಡಿ",
      descEn: "Select target Karnataka regions, desired trip duration (1-7 days), pacing, budget tier, and traveler profiles including children and senior citizen accessibility requirements.",
      descKn: "ಕರ್ನಾಟಕದ ಪ್ರದೇಶಗಳು, ಪ್ರವಾಸದ ಅವಧಿ (1-7 ದಿನಗಳು), ಬಜೆಟ್ ವರ್ಗ ಹಾಗೂ ಮಕ್ಕಳು ಮತ್ತು ಹಿರಿಯ ನಾಗರಿಕರ ಪ್ರವೇಶಾವಕಾಶದ ಆದ್ಯತೆಗಳನ್ನು ಸುಲಭವಾಗಿ ಆಯ್ಕೆಮಾಡಿ.",
      highlightsEn: [
        "Adult, child & senior mobility filters",
        "Pacing: Relaxed, Balanced, or Ambitious",
        "Vehicle class: Hatchback, Sedan, SUV, or Tempo",
      ],
      highlightsKn: [
        "ಹಿರಿಯರು ಮತ್ತು ಮಕ್ಕಳ ಪ್ರವೇಶಾವಕಾಶ ಫಿಲ್ಟರ್‌ಗಳು",
        "ಪ್ರಯಾಣದ ವೇಗ: ಪ್ರಶಾಂತ, ಸಮತೋಲಿತ ಅಥವಾ ಚುರುಕು",
        "ವಾಹನ ಆಯ್ಕೆ: ಹ್ಯಾಚ್‌ಬ್ಯಾಕ್, ಸೆಡಾನ್, ಎಸ್‌ಯುವಿ, ಅಥವಾ ಟೆಂಪೋ",
      ],
    },
    {
      num: "02",
      icon: <Cpu className="text-gold-dark" size={24} />,
      badgeEn: "Algorithmic Precision",
      badgeKn: "ನಿಖರ ಅಲ್ಗಾರಿದಮ್ ಲೆಕ್ಕಾಚಾರ",
      titleEn: "Deterministic Topographic & Budget Engine",
      titleKn: "ಭೌಗೋಳಿಕ ಮಾರ್ಗ ಮತ್ತು ಬಜೆಟ್ ಆಪ್ಟಿಮೈಸೇಶನ್",
      descEn: "Our engine sequences your daily stops to eradicate backtracking, factors 1.35x-1.55x winding ghat coefficients, and projects transparent itemized costs for fuel, tolls, and homestays.",
      descKn: "ಹಿಮ್ಮುಖ ಪ್ರಯಾಣವನ್ನು ಸಂಪೂರ್ಣ ತಡೆಗಟ್ಟಲು ನಮ್ಮ ವ್ಯವಸ್ಥೆಯು ನಿಲ್ದಾಣಗಳನ್ನು ಕ್ರಮಗೊಳಿಸುತ್ತದೆ, ಘಾಟಿ ತಿರುವುಗಳ ಲೆಕ್ಕಾಚಾರ ಮಾಡುತ್ತದೆ ಮತ್ತು ಇಂಧನ ಹಾಗೂ ವಸತಿಯ ಪಾರದರ್ಶಕ ಬಜೆಟ್ ರೂಪಿಸುತ್ತದೆ.",
      highlightsEn: [
        "Zero backtracking route sequencing",
        "Sunset cutoff & ghat safety constraints",
        "100% itemized budget with zero markups",
      ],
      highlightsKn: [
        "ಅನಗತ್ಯ ಹಿಮ್ಮುಖ ಸಂಚಾರವಿಲ್ಲದ ಮಾರ್ಗ ಕ್ರಮ",
        "ಸೂರ್ಯಾಸ್ತದ ಮುನ್ನ ಸುರಕ್ಷಿತ ತಲುಪುವ ಯೋಜನೆ",
        "ಶೂನ್ಯ ಕಮಿಷನ್ ನೈಜ ವೆಚ್ಚದ ವಿಶ್ಲೇಷಣೆ",
      ],
    },
    {
      num: "03",
      icon: <Compass className="text-forest-light" size={24} />,
      badgeEn: "Live Companion",
      badgeKn: "ನೈಜ ಪ್ರವಾಸ ಸಹಾಯಕ",
      titleEn: "Adaptive Guidance & Non-Destructive Replanning",
      titleKn: "ಹೊಂದಿಕೊಳ್ಳುವ ಮಾರ್ಗದರ್ಶನ ಮತ್ತು ನೈಜ ನವೀಕರಣ",
      descEn: "While on the road, Yatrion evaluates Open-Meteo precipitation data and official road disruption bulletins. If a ghat is blocked, it proposes explainable alternatives without wiping out your custom notes.",
      descKn: "ಪ್ರಯಾಣದ ಸಮಯದಲ್ಲಿ ಓಪನ್-ಮೀಟಿಯೋ ಮಳೆ ಮುನ್ಸೂಚನೆ ಮತ್ತು ರಸ್ತೆ ಸ್ಥಿತಿಗತಿಗಳನ್ನು ಪರಿಶೀಲಿಸಿ, ಯಾವುದೇ ಅಡೆತಡೆಗಳಿದ್ದಲ್ಲಿ ನಿಮ್ಮ ಟಿಪ್ಪಣಿಗಳನ್ನು ಅಳಿಸದೆ ಅತ್ಯುತ್ತಮ ಪರ್ಯಾಯಗಳನ್ನು ಪ್ರಸ್ತಾಪಿಸುತ್ತದೆ.",
      highlightsEn: [
        "Live weather & rain risk telemetry",
        "Non-destructive itinerary proposals",
        "Bilingual AI voice companion assistance",
      ],
      highlightsKn: [
        "ನೈಜ ಮಳೆ ಮತ್ತು ಹವಾಮಾನ ಮುನ್ಸೂಚನೆ",
        "ವೈಯಕ್ತಿಕ ನಿರ್ಧಾರಗಳನ್ನು ಸಂರಕ್ಷಿಸುವ ನವೀಕರಣ",
        "ಕನ್ನಡ ಮತ್ತು ಇಂಗ್ಲಿಷ್‌ನಲ್ಲಿ AI ಧ್ವನಿ ಮಾರ್ಗದರ್ಶಿ",
      ],
    },
  ];

  return (
    <section id="how-it-works" className="py-20 md:py-28 bg-ivory-warm/40 border-b border-border/80 scroll-mt-20">
      <div className="container-content space-y-16">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-forest/10 border border-forest/20 text-forest text-xs font-semibold uppercase tracking-widest font-mono">
            <Sparkles size={14} />
            <span>{t("landing.howTag")}</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-charcoal tracking-tight">
            {t("landing.howTitle")}
          </h2>
          <p className="text-base sm:text-lg text-charcoal-light leading-relaxed">
            {t("landing.howSubtitle")}
          </p>
        </div>

        {/* 3 Step Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative">
          {steps.map((step, idx) => (
            <div
              key={idx}
              className="relative flex flex-col justify-between rounded-2xl border border-border bg-white p-8 shadow-subtle hover:shadow-elevation transition-all duration-300 hover:-translate-y-1"
            >
              <div>
                {/* Step Top Bar */}
                <div className="flex items-center justify-between mb-6">
                  <span className="font-mono text-3xl font-bold text-forest/20 group-hover:text-forest transition-colors">
                    {step.num}
                  </span>
                  <div className="flex items-center gap-2 px-2.5 py-1 rounded-md bg-ivory-warm text-charcoal-light text-[11px] font-mono uppercase tracking-wider font-semibold border border-border">
                    {step.icon}
                    <span>{isKn ? step.badgeKn : step.badgeEn}</span>
                  </div>
                </div>

                {/* Title & Desc */}
                <h3 className="text-lg font-bold text-charcoal mb-3 leading-snug">
                  {isKn ? step.titleKn : step.titleEn}
                </h3>
                <p className="text-xs sm:text-sm text-charcoal-light leading-relaxed mb-6">
                  {isKn ? step.descKn : step.descEn}
                </p>

                {/* Highlights List */}
                <ul className="space-y-2.5 border-t border-border/60 pt-4">
                  {(isKn ? step.highlightsKn : step.highlightsEn).map((hl, hIdx) => (
                    <li key={hIdx} className="flex items-start gap-2 text-xs text-charcoal-light">
                      <CheckCircle size={14} className="text-forest shrink-0 mt-0.5" />
                      <span>{hl}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Step Footer Indicator */}
              <div className="mt-8 pt-4 border-t border-border/40 flex items-center justify-between text-xs text-charcoal-light font-mono">
                <span className="flex items-center gap-1 text-forest font-semibold">
                  <ShieldCheck size={14} />
                  <span>{isKn ? "ಪರಿಶೀಲಿತ ಅಲ್ಗಾರಿದಮ್" : "Deterministic Engine"}</span>
                </span>
                {idx < 2 && (
                  <span className="hidden lg:flex items-center text-charcoal-light/60">
                    <span>{isKn ? "ಮುಂದಿನ ಹಂತ" : "Next Step"}</span>
                    <ChevronRight size={14} />
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* CTA Bar */}
        <div className="text-center pt-6">
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 rounded-xl bg-forest px-6 py-3.5 text-sm font-semibold text-white hover:bg-forest-dark transition-all shadow-subtle hover:shadow-elevation group"
          >
            <span>{isKn ? "ಉಚಿತವಾಗಿ ಯೋಜಿಸಲು ಪ್ರಾರಂಭಿಸಿ" : "Start Planning with Yatrion"}</span>
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
}

