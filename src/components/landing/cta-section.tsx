"use client";

import Link from "next/link";
import { ArrowRight, Compass, ShieldCheck } from "lucide-react";
import { useLanguage } from "@/lib/i18n";

export function CtaSection() {
  const { t, isKn } = useLanguage();

  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-forest-dark text-white relative overflow-hidden" id="cta">
      {/* Subtle decorative glow */}
      <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-gold/10 blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-forest-light/20 blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />

      <div className="container-content relative z-10 text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-gold-light/20 bg-forest/40 px-3.5 py-1 text-xs font-medium text-gold-light tracking-wide mb-6">
          <ShieldCheck size={14} className="text-gold" />
          <span>{isKn ? "100% ಉಚಿತ · ನೋಂದಣಿ ಕಡ್ಡಾಯವಿಲ್ಲ · ಕರ್ನಾಟಕ ಪ್ರವಾಸಕ್ಕಾಗಿ" : "100% Free · No Sign-Up Barrier · Built for Karnataka"}</span>
        </div>

        <h2 className="font-[family-name:var(--font-playfair)] text-3xl sm:text-4xl lg:text-5xl font-bold text-ivory leading-tight">
          {t("cta.heading")}
          <span className="text-gold">?</span>
        </h2>

        <p className="mt-5 text-base sm:text-lg text-ivory/80 leading-relaxed max-w-xl mx-auto font-light">
          {t("cta.subheading")}
        </p>

        {/* Action Group */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5 sm:gap-4">
          <Link
            href="#planner"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-[var(--radius-md)] bg-gold px-7 py-3.5 text-sm font-semibold text-forest-dark hover:bg-gold-light active:bg-gold transition-colors shadow-elevated focus-visible:outline-white"
          >
            <span>{t("cta.planTripBtn")}</span>
            <ArrowRight size={16} />
          </Link>

          <Link
            href="#destinations"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-[var(--radius-md)] border border-ivory/30 bg-forest-dark/50 px-7 py-3.5 text-sm font-semibold text-ivory hover:bg-white/10 transition-colors focus-visible:outline-white"
          >
            <span>{t("cta.exploreDestinationsBtn")}</span>
            <Compass size={16} />
          </Link>
        </div>

        {/* Reassurance points */}
        <div className="mt-10 pt-8 border-t border-white/10 flex flex-wrap items-center justify-center gap-6 text-xs text-ivory/60">
          <span>✓ {isKn ? "31 ಕರ್ನಾಟಕದ ಜಿಲ್ಲೆಗಳು" : "31 Karnataka Districts"}</span>
          <span>✓ {isKn ? "ಪಾರದರ್ಶಕ ಬಜೆಟ್ ಮಾಹಿತಿ" : "Zero Booking Markups"}</span>
          <span>✓ {isKn ? "ನೈಜ ಸಾಂಸ್ಕೃತಿಕ ಟಿಪ್ಪಣಿಗಳು" : "Authentic Cultural Notes"}</span>
          <span>✓ {isKn ? "ಕನ್ನಡ ನಾವೀನ್ಯತಾ ಹ್ಯಾಕಥಾನ್ 2026" : "Hackathon 2026 Innovation"}</span>
        </div>
      </div>
    </section>
  );
}
