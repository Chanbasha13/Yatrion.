"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Compass, Sparkles, MapPin } from "lucide-react";
import { useLanguage } from "@/lib/i18n";

export function HeroSection() {
  const { t, isKn } = useLanguage();

  return (
    <section className="relative bg-forest-dark text-white overflow-hidden">
      {/* Background photography with delicate multi-stop gradient scrim */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/hero/karnataka-landscape.jpg"
          alt="Lush rolling peaks of Kudremukh in the Western Ghats of Karnataka"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center scale-105 transition-transform duration-1000 ease-out"
        />
        {/* Carefully calibrated scrim for legibility without washing out the photo */}
        <div className="absolute inset-0 bg-gradient-to-r from-forest-dark/95 via-forest-dark/85 to-forest-dark/60 sm:to-forest-dark/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-forest-dark via-transparent to-forest-dark/30" />
      </div>

      <div className="container-content relative z-10">
        <div className="py-14 sm:py-20 md:py-24 lg:py-28 max-w-3xl">
          {/* Hackathon banner badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-gold-light/25 bg-forest-dark/70 backdrop-blur-md px-3.5 py-1.5 text-xs font-medium text-gold-light tracking-wide mb-6">
            <Sparkles size={13} className="text-gold" />
            <span>{t("hero.badge")}</span>
          </div>

          {/* Editorial Headline */}
          <h1 className="font-[family-name:var(--font-playfair)] text-3xl sm:text-5xl lg:text-6xl font-bold text-ivory tracking-tight leading-[1.15]">
            {t("hero.titleLine1")}{" "}
            <span className="italic font-normal text-gold-light">{t("hero.titleLine2")}</span>
          </h1>

          {/* Specific Supporting Copy */}
          <p className="mt-5 text-base sm:text-lg text-ivory/85 leading-relaxed max-w-2xl font-light">
            {t("hero.subtitle")}
          </p>

          {/* Personalization Indicator Pills */}
          <div className="mt-6 flex flex-wrap items-center gap-2 text-xs text-ivory/80">
            <span className="text-gold-light font-medium">
              {isKn ? "ವೈಯಕ್ತೀಕರಿಸಲಾಗಿದೆ:" : "Personalized by:"}
            </span>
            <span className="rounded-full bg-white/10 px-3 py-1 backdrop-blur-sm border border-white/10">
              {isKn ? "ನಿಮ್ಮ ಬಜೆಟ್ (₹0 ರಿಂದ ಐಷಾರಾಮಿ)" : "Your Budget (₹0 to Luxury)"}
            </span>
            <span className="rounded-full bg-white/10 px-3 py-1 backdrop-blur-sm border border-white/10">
              {isKn ? "ಪ್ರವಾಸದ ದಿನಗಳು (1 ರಿಂದ 7 ದಿನಗಳು)" : "Trip Duration (1 to 7 Days)"}
            </span>
            <span className="rounded-full bg-white/10 px-3 py-1 backdrop-blur-sm border border-white/10">
              {isKn ? "ಪ್ರಯಾಣದ ವೇಗ ಮತ್ತು ಆಸಕ್ತಿಗಳು" : "Travel Pace & Interests"}
            </span>
          </div>

          {/* CTA Group */}
          <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
            <Link
              href="#planner"
              className="inline-flex items-center justify-center gap-2 rounded-[var(--radius-md)] bg-gold px-6 py-3.5 text-sm font-semibold text-forest-dark hover:bg-gold-light active:bg-gold transition-colors shadow-elevated focus-visible:outline-white"
            >
              <span>{t("hero.startPlanningBtn")}</span>
              <ArrowRight size={16} />
            </Link>

            <Link
              href="#destinations"
              className="inline-flex items-center justify-center gap-2 rounded-[var(--radius-md)] border border-ivory/30 bg-forest-dark/40 backdrop-blur-sm px-6 py-3.5 text-sm font-semibold text-ivory hover:bg-white/10 transition-colors focus-visible:outline-white"
            >
              <span>{t("hero.exploreDestinationsBtn")}</span>
              <Compass size={16} />
            </Link>
          </div>

          {/* Quick Metrics Bar */}
          <div className="mt-12 pt-6 border-t border-white/15 grid grid-cols-3 gap-4 max-w-lg">
            <div>
              <p className="font-[family-name:var(--font-playfair)] text-2xl sm:text-3xl font-bold text-white font-mono">
                31
              </p>
              <p className="text-xs text-ivory/70 mt-0.5">
                {isKn ? "ಒಟ್ಟು ಜಿಲ್ಲೆಗಳು" : "Districts Covered"}
              </p>
            </div>
            <div>
              <p className="font-[family-name:var(--font-playfair)] text-2xl sm:text-3xl font-bold text-white font-mono">
                100%
              </p>
              <p className="text-xs text-ivory/70 mt-0.5">
                {isKn ? "ಉಚಿತ ಹಾಗೂ ಮುಕ್ತ ಪ್ರವೇಶ" : "Free & Open Access"}
              </p>
            </div>
            <div>
              <p className="font-[family-name:var(--font-playfair)] text-2xl sm:text-3xl font-bold text-white font-mono">
                {isKn ? "ಸ್ಮಾರ್ಟ್" : "Smart"}
              </p>
              <p className="text-xs text-ivory/70 mt-0.5">
                {isKn ? "ಪ್ರವಾಸ ಯೋಜಕ" : "Itinerary Engine"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Subtle location caption for authentic photography credibility */}
      <div className="hidden lg:flex absolute bottom-4 right-6 z-10 items-center gap-1.5 text-[11px] text-ivory/60 bg-forest-dark/70 backdrop-blur-sm px-2.5 py-1 rounded">
        <MapPin size={11} className="text-gold" />
        <span>{isKn ? "ಕುದುರೆಮುಖ ರಾಷ್ಟ್ರೀಯ ಉದ್ಯಾನವನ · ಪಶ್ಚಿಮ ಘಟ್ಟಗಳು, ಕರ್ನಾಟಕ" : "Kudremukh National Park · Western Ghats, Karnataka"}</span>
      </div>
    </section>
  );
}
