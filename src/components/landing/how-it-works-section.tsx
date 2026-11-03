"use client";

import { Sliders, Calendar, CheckCircle2, Compass, ArrowDown } from "lucide-react";
import { useLanguage } from "@/lib/i18n";

export function HowItWorksSection() {
  const { t, isKn } = useLanguage();

  return (
    <section id="how-it-works" className="py-16 sm:py-20 lg:py-24 bg-ivory scroll-mt-16">
      <div className="container-content">
        {/* Section Heading */}
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-gold mb-3 font-mono">
            <Compass size={14} />
            <span>{t("howItWorks.tag")}</span>
          </div>
          <h2 className="font-[family-name:var(--font-playfair)] text-2xl sm:text-3xl lg:text-4xl font-bold text-forest-dark tracking-tight">
            {t("howItWorks.heading")}
          </h2>
          <p className="mt-4 text-sm sm:text-base text-charcoal-muted leading-relaxed">
            {t("howItWorks.subheading")}
          </p>
        </div>

        {/* 3 Step Visual Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {/* Step 1 */}
          <div className="flex flex-col rounded-[var(--radius-lg)] border border-border bg-white p-6 sm:p-7 shadow-subtle relative">
            <div className="flex items-center justify-between mb-4">
              <span className="font-mono text-xs font-bold uppercase tracking-widest text-gold">
                {isKn ? "ಹಂತ 01" : "Step 01"}
              </span>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-forest/8 text-forest">
                <Sliders size={20} strokeWidth={1.8} />
              </div>
            </div>
            <h3 className="font-[family-name:var(--font-playfair)] text-lg font-bold text-forest-dark mb-2">
              {t("howItWorks.step1Title")}
            </h3>
            <p className="text-sm text-charcoal-muted leading-relaxed">
              {t("howItWorks.step1Desc")}
            </p>
          </div>

          {/* Step 2 */}
          <div className="flex flex-col rounded-[var(--radius-lg)] border border-border bg-white p-6 sm:p-7 shadow-subtle relative">
            <div className="flex items-center justify-between mb-4">
              <span className="font-mono text-xs font-bold uppercase tracking-widest text-gold">
                {isKn ? "ಹಂತ 02" : "Step 02"}
              </span>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-forest/8 text-forest">
                <Calendar size={20} strokeWidth={1.8} />
              </div>
            </div>
            <h3 className="font-[family-name:var(--font-playfair)] text-lg font-bold text-forest-dark mb-2">
              {t("howItWorks.step2Title")}
            </h3>
            <p className="text-sm text-charcoal-muted leading-relaxed">
              {t("howItWorks.step2Desc")}
            </p>
          </div>

          {/* Step 3 */}
          <div className="flex flex-col rounded-[var(--radius-lg)] border border-border bg-white p-6 sm:p-7 shadow-subtle relative">
            <div className="flex items-center justify-between mb-4">
              <span className="font-mono text-xs font-bold uppercase tracking-widest text-gold">
                {isKn ? "ಹಂತ 03" : "Step 03"}
              </span>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-forest/8 text-forest">
                <CheckCircle2 size={20} strokeWidth={1.8} />
              </div>
            </div>
            <h3 className="font-[family-name:var(--font-playfair)] text-lg font-bold text-forest-dark mb-2">
              {t("howItWorks.step3Title")}
            </h3>
            <p className="text-sm text-charcoal-muted leading-relaxed">
              {t("howItWorks.step3Desc")}
            </p>
          </div>
        </div>

        {/* Jump-to-planner indicator */}
        <div className="mt-12 text-center">
          <a
            href="#planner"
            className="inline-flex items-center gap-2 rounded-full border border-forest/20 bg-forest/5 px-4 py-2 text-xs font-semibold text-forest hover:bg-forest/10 transition-colors focus-visible:outline-forest"
          >
            <span>{isKn ? "ಪ್ರವಾಸ ಯೋಜಿಸಲು ಸಿದ್ಧರೇ? ಕೆಳಗೆ ನಿಮ್ಮ ಆದ್ಯತೆಗಳನ್ನು ತಿಳಿಸಿ" : "Ready to plan? Configure your preferences below"}</span>
            <ArrowDown size={14} />
          </a>
        </div>
      </div>
    </section>
  );
}
