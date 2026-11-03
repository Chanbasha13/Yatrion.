"use client";

import React from "react";
import { useLanguage } from "@/lib/i18n";
import { 
  Compass, 
  ShieldCheck, 
  Route, 
  Coins, 
  CloudSun, 
  MapPin, 
  XCircle, 
  CheckCircle2, 
  ArrowRight 
} from "lucide-react";
import Link from "next/link";

export function WhatWhySection() {
  const { t, isKn } = useLanguage();

  const pillars = [
    {
      icon: <Route className="text-forest" size={24} />,
      titleEn: "Topographic Ghat Physics",
      titleKn: "ಘಾಟಿ ರಸ್ತೆಗಳ ನೈಜ ಭೌಗೋಳಿಕ ಲೆಕ್ಕಾಚಾರ",
      descEn: "Calculates realistic driving speeds using 1.35x–1.55x curvature penalties across Western Ghat passes like Shiradi, Charmadi, and Agumbe.",
      descKn: "ಶಿರಾಡಿ, ಚಾರ್ಮಾಡಿ ಮತ್ತು ಆಗುಂಬೆ ಘಾಟಿಗಳಲ್ಲಿ 1.35x-1.55x ತಿರುವು ಗುಣಕಗಳೊಂದಿಗೆ ನೈಜ ಪ್ರಯಾಣದ ಸಮಯವನ್ನು ನಿಖರವಾಗಿ ಲೆಕ್ಕಾಚಾರ ಮಾಡುತ್ತದೆ.",
    },
    {
      icon: <Coins className="text-gold-dark" size={24} />,
      titleEn: "Itemized Zero-Markup Budgeting",
      titleKn: "ಪಾರದರ್ಶಕ ನೈಜ ವೆಚ್ಚದ ಅಂದಾಜು",
      descEn: "Complete cost breakdowns for fuel, tolls, local homestays, and activities. Zero hidden booking commissions or sponsored markups.",
      descKn: "ಇಂಧನ, ಟೋಲ್, ಸ್ಥಳೀಯ ಹೋಂಸ್ಟೇ ಮತ್ತು ಪ್ರವೇಶ ಶುಲ್ಕಗಳ ನಿಖರ ಲೆಕ್ಕಾಚಾರ. ಯಾವುದೇ ಮಧ್ಯವರ್ತಿ ಶುಲ್ಕ ಅಥವಾ ಪ್ರಾಯೋಜಿತ ಕಮಿಷನ್ ಇರುವುದಿಲ್ಲ.",
    },
    {
      icon: <ShieldCheck className="text-forest" size={24} />,
      titleEn: "100% Secular Heritage Curation",
      titleKn: "ಸಂಪೂರ್ಣ ಜಾತ್ಯತೀತ ಪರಂಪರೆ ಆಯ್ಕೆ",
      descEn: "Strictly focused on Karnataka's geological wonders, ancient stone citadels, coastal beaches, and rainforest wildlife sanctuaries.",
      descKn: "ಕರ್ನಾಟಕದ ನೈಸರ್ಗಿಕ ವಿಸ್ಮಯಗಳು, ಕಲ್ಲಿನ ಕೋಟೆಗಳು, ಕಡಲತೀರಗಳು ಮತ್ತು ವನ್ಯಜೀವಿ ತಾಣಗಳ ಮೇಲೆ ಸಂಪೂರ್ಣ ಗಮನ.",
    },
    {
      icon: <CloudSun className="text-forest-light" size={24} />,
      titleEn: "Live Adaptive Telemetry",
      titleKn: "ನೈಜ ಹವಾಮಾನ ಮತ್ತು ರಸ್ತೆ ಮಾಹಿತಿ",
      descEn: "Monitors Open-Meteo precipitation and verified road disruptions to propose non-destructive schedule adjustments without overwriting notes.",
      descKn: "ನೈಜ ಹವಾಮಾನ ಮತ್ತು ರಸ್ತೆ ಸ್ಥಿತಿಗತಿಗಳನ್ನು ಪರಿಶೀಲಿಸಿ, ನಿಮ್ಮ ಯಾವುದೇ ವೈಯಕ್ತಿಕ ಟಿಪ್ಪಣಿಗಳನ್ನು ಅಳಿಸದೆ ಪರ್ಯಾಯ ಮಾರ್ಗಗಳನ್ನು ಸೂಚಿಸುತ್ತದೆ.",
    },
  ];

  const comparisons = [
    {
      category: isKn ? "ಘಾಟಿ ಪ್ರಯಾಣದ ಸಮಯ" : "Western Ghats Transit Times",
      generic: isKn ? "ಸಮತಟ್ಟಾದ ರಸ್ತೆಗಳ ವೇಗವನ್ನು ಊಹಿಸುತ್ತದೆ (50 ಕಿ.ಮೀಗೆ 45 ನಿಮಿಷಗಳು)." : "Assumes flat-terrain highway speeds (50 km in 45 mins).",
      yatrion: isKn ? "1.48x ಘಾಟಿ ಗುಣಕ ಮತ್ತು ಹಗಲು ಬೆಳಕಿನ ಮಿತಿಯೊಂದಿಗೆ ಲೆಕ್ಕಾಚಾರ." : "Calibrates 1.48x hairpin curve factor & daylight safety cutoff.",
    },
    {
      category: isKn ? "ತಾಣಗಳ ಆಯ್ಕೆ" : "Attraction Selection",
      generic: isKn ? "ಕೇವಲ 3-4 ಕಿಕ್ಕಿರಿದ ವಾಣಿಜ್ಯ ತಾಣಗಳನ್ನು ಮಾತ್ರ ಪುನರಾವರ್ತಿಸುತ್ತದೆ." : "Echoes the same 3-4 overcrowded commercial tourist spots.",
      yatrion: isKn ? "40+ ಅಜ್ಞಾತ ರತ್ನಗಳು ಮತ್ತು 31 ಜಿಲ್ಲೆಗಳ ಸಮಗ್ರ ಪರಿಶೋಧನೆ." : "40+ vetted hidden waterfalls, bastions, and geological wonders.",
    },
    {
      category: isKn ? "ವೆಚ್ಚ ಮತ್ತು ಬಜೆಟ್" : "Budget Transparency",
      generic: isKn ? "ಪ್ರಾಯೋಜಿತ ಪ್ಯಾಕೇಜ್‌ಗಳು ಮತ್ತು ಅಸ್ಪಷ್ಟ ಕಮಿಷನ್ ಶುಲ್ಕಗಳು." : "Opaque packages packed with hidden booking commissions.",
      yatrion: isKn ? "ಇಂಧನ, ವಾಹನ ಮತ್ತು ಹೋಂಸ್ಟೇಗಳ ನೈಜ ವೆಚ್ಚ (ಶೂನ್ಯ ಕಮಿಷನ್)." : "Itemized fuel, vehicle class, and authentic homestay rates.",
    },
    {
      category: isKn ? "ಹವಾಮಾನ ಮತ್ತು ರಸ್ತೆ ಬದಲಾವಣೆ" : "Weather & Landslide Disruptions",
      generic: isKn ? "ಮಳೆ ಅಥವಾ ಭೂಕುಸಿತ ಸಂಭವಿಸಿದಾಗ ಇಡೀ ಪ್ರವಾಸ ರದ್ದಾಗುತ್ತದೆ." : "Fails completely or destroys the traveler's custom schedule.",
      yatrion: isKn ? "ವೈಯಕ್ತಿಕ ನಿರ್ಧಾರಗಳನ್ನು ಸಂರಕ್ಷಿಸಿ ನೈಜ ಪರ್ಯಾಯ ಪ್ರಸ್ತಾಪ ನೀಡುತ್ತದೆ." : "Non-destructive replanning preserving all personal notes & choices.",
    },
  ];

  return (
    <section className="py-20 md:py-28 bg-white border-b border-border/80">
      <div className="container-content space-y-24">
        {/* SECTION 2: WHAT YATRION IS */}
        <div id="what" className="scroll-mt-20">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-forest/10 border border-forest/20 text-forest text-xs font-semibold uppercase tracking-widest font-mono">
              <Compass size={14} />
              <span>{t("landing.whatTag")}</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-charcoal tracking-tight">
              {t("landing.whatTitle")}
            </h2>
            <p className="text-base sm:text-lg text-charcoal-light leading-relaxed">
              {t("landing.whatSubtitle")}
            </p>
          </div>

          {/* 4 Pillars Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {pillars.map((pillar, idx) => (
              <div
                key={idx}
                className="group relative rounded-2xl border border-border/80 bg-ivory-warm/40 hover:bg-white p-7 transition-all duration-300 hover:shadow-elevation hover:-translate-y-1"
              >
                <div className="w-12 h-12 rounded-xl bg-white border border-border flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform">
                  {pillar.icon}
                </div>
                <h3 className="text-base font-bold text-charcoal mb-2">
                  {isKn ? pillar.titleKn : pillar.titleEn}
                </h3>
                <p className="text-xs sm:text-sm text-charcoal-light leading-relaxed">
                  {isKn ? pillar.descKn : pillar.descEn}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* SECTION 3: WHY YATRION EXISTS */}
        <div id="why" className="scroll-mt-20 pt-8 border-t border-border/60">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-terracotta/10 border border-terracotta/20 text-terracotta text-xs font-semibold uppercase tracking-widest font-mono">
              <ShieldCheck size={14} />
              <span>{t("landing.whyTag")}</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-charcoal tracking-tight">
              {t("landing.whyTitle")}
            </h2>
            <p className="text-base sm:text-lg text-charcoal-light leading-relaxed">
              {t("landing.whySubtitle")}
            </p>
          </div>

          {/* Comparison Cards / Table */}
          <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-subtle">
            <div className="grid grid-cols-1 md:grid-cols-12 bg-ivory-warm/80 border-b border-border py-4 px-6 text-xs font-bold uppercase tracking-wider text-charcoal-light font-mono">
              <div className="md:col-span-4">{isKn ? "ಪ್ರಯಾಣದ ಆಯಾಮ" : "Travel Dimension"}</div>
              <div className="md:col-span-4 text-terracotta flex items-center gap-1.5 mt-2 md:mt-0">
                <XCircle size={14} />
                <span>{isKn ? "ಸಾಮಾನ್ಯ ಆನ್‌ಲೈನ್ ಪ್ಲಾನರ್‌ಗಳು" : "Generic Travel Planners"}</span>
              </div>
              <div className="md:col-span-4 text-forest flex items-center gap-1.5 mt-2 md:mt-0">
                <CheckCircle2 size={14} />
                <span>{isKn ? "ಯಾತ್ರಿಯಾನ್ ಇಂಟೆಲಿಜೆನ್ಸ್" : "Yatrion Travel Intelligence"}</span>
              </div>
            </div>

            <div className="divide-y divide-border/60">
              {comparisons.map((row, index) => (
                <div
                  key={index}
                  className="grid grid-cols-1 md:grid-cols-12 p-6 gap-4 items-center hover:bg-ivory/30 transition-colors"
                >
                  <div className="md:col-span-4">
                    <span className="font-semibold text-sm text-charcoal flex items-center gap-2">
                      <MapPin size={15} className="text-forest/70 shrink-0" />
                      {row.category}
                    </span>
                  </div>
                  <div className="md:col-span-4 text-xs sm:text-sm text-charcoal-light bg-terracotta/5 p-3 rounded-lg border border-terracotta/10">
                    <span className="line-through text-charcoal-light/70 block mb-0.5 text-[11px] uppercase font-mono tracking-wider">
                      {isKn ? "ಸಾಮಾನ್ಯ ಅನುಭವ" : "Legacy Approach"}
                    </span>
                    {row.generic}
                  </div>
                  <div className="md:col-span-4 text-xs sm:text-sm font-medium text-forest-dark bg-forest/5 p-3 rounded-lg border border-forest/20">
                    <span className="text-forest block mb-0.5 text-[11px] uppercase font-mono tracking-wider font-semibold">
                      {isKn ? "ಯಾತ್ರಿಯಾನ್ ಖಚಿತತೆ" : "The Yatrion Advantage"}
                    </span>
                    {row.yatrion}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Callout Bar */}
          <div className="mt-10 rounded-xl bg-forest/5 border border-forest/15 p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-forest animate-pulse shrink-0" />
              <p className="text-xs sm:text-sm text-charcoal">
                {isKn 
                  ? "ಕರ್ನಾಟಕದ ನೈಜ ರಸ್ತೆ ನಿಯಮಗಳು ಮತ್ತು ಸೂರ್ಯಾಸ್ತದ ಸುರಕ್ಷತಾ ಮಿತಿಗಳನ್ನು ಆಧರಿಸಿ ವಿನ್ಯಾಸಗೊಳಿಸಲಾಗಿದೆ." 
                  : "Engineered specifically for Karnataka ghat safety, daylight cutoffs, and verified secular landmarks."}
              </p>
            </div>
            <Link
              href="/signup"
              className="shrink-0 text-xs font-semibold text-forest hover:text-forest-dark flex items-center gap-1.5 group"
            >
              <span>{isKn ? "ಖಾತೆ ತೆರೆಯಿರಿ" : "Experience the Difference"}</span>
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

