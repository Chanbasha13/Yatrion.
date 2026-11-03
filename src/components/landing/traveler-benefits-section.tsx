"use client";

import React from "react";
import { useLanguage } from "@/lib/i18n";
import { 
  Award, 
  Clock, 
  Coins, 
  ShieldCheck, 
  Users, 
  FileCheck, 
  ArrowRight
} from "lucide-react";
import Link from "next/link";

export function TravelerBenefitsSection() {
  const { t, isKn } = useLanguage();

  const benefits = [
    {
      stat: "~2.5 hrs",
      unitEn: "Saved Transit / Day",
      unitKn: "ದಿನಕ್ಕೆ ಉಳಿತಾಯವಾಗುವ ಪ್ರಯಾಣದ ಸಮಯ",
      titleEn: "Zero Backtracking Guarantee",
      titleKn: "ಅನಗತ್ಯ ಹಿಮ್ಮುಖ ಸಂಚಾರವಿಲ್ಲ",
      descEn: "Our deterministic TSP route optimizer sequences destinations geographically, eliminating redundant mountain switchback climbs.",
      descKn: "ಗಣಿತೀಯ ಅಲ್ಗಾರಿದಮ್‌ಗಳ ಮೂಲಕ ತಾಣಗಳನ್ನು ಭೌಗೋಳಿಕವಾಗಿ ಜೋಡಿಸಿ, ಬೆಟ್ಟದ ರಸ್ತೆಗಳಲ್ಲಿ ಅನಗತ್ಯ ತಿರುಗಾಟವನ್ನು ಸಂಪೂರ್ಣವಾಗಿ ತಪ್ಪಿಸುತ್ತದೆ.",
      icon: <Clock className="text-forest" size={24} />,
    },
    {
      stat: "100%",
      unitEn: "Itemized Cost Breakdown",
      unitKn: "ಪಾರದರ್ಶಕ ವೆಚ್ಚದ ಪಟ್ಟಿ",
      titleEn: "Zero Commercial Markups",
      titleKn: "ಶೂನ್ಯ ಮಧ್ಯವರ್ತಿ ಶುಲ್ಕ",
      descEn: "Transparent, real-world estimates for fuel consumption across 4 vehicle classes, highway tolls, and direct homestay pricing.",
      descKn: "4 ವಿಧದ ವಾಹನಗಳಿಗೆ ಇಂಧನ ವೆಚ್ಚ, ಹೆದ್ದಾರಿ ಟೋಲ್ ಮತ್ತು ಅಧಿಕೃತ ಸ್ಥಳೀಯ ಹೋಂಸ್ಟೇಗಳ ನೈಜ ದರಗಳ ಸಂಪೂರ್ಣ ಪಾರದರ್ಶಕತೆ.",
      icon: <Coins className="text-gold-dark" size={24} />,
    },
    {
      stat: "0",
      unitEn: "Overwritten Decisions",
      unitKn: "ಅಳಿಸಿಹೋಗದ ವೈಯಕ್ತಿಕ ಟಿಪ್ಪಣಿಗಳು",
      titleEn: "Non-Destructive Adaptive Safety",
      titleKn: "ಮೂಲ ಯೋಜನೆಯನ್ನು ಸಂರಕ್ಷಿಸುವ ಭರವಸೆ",
      descEn: "When bad weather or road closures trigger replanning, your notes, completed stops, and group votes remain 100% intact.",
      descKn: "ಮಳೆ ಅಥವಾ ರಸ್ತೆ ಬಂದ್ ಆದಾಗ ಹೊಸ ಪರ್ಯಾಯ ಪ್ರಸ್ತಾಪ ನೀಡುವಾಗಲೂ, ನಿಮ್ಮ ಯಾವುದೇ ಟಿಪ್ಪಣಿಗಳು ಅಥವಾ ನಿರ್ಧಾರಗಳು ನಾಶವಾಗುವುದಿಲ್ಲ.",
      icon: <FileCheck className="text-terracotta" size={24} />,
    },
    {
      stat: "100%",
      unitEn: "Mobility Vetted Stops",
      unitKn: "ಪ್ರವೇಶಾವಕಾಶ ಪರೀಕ್ಷಿತ ತಾಣಗಳು",
      titleEn: "Senior & Family Harmony",
      titleKn: "ಹಿರಿಯರು ಮತ್ತು ಮಕ್ಕಳ ಕುಟುಂಬ ಸ್ನೇಹಿ",
      descEn: "Flags steep 1,000+ staircase climbs, identifies wheelchair-accessible viewpoints, and respects elderly pacing limits.",
      descKn: "ಕಡಿದಾದ ಮೆಟ್ಟಿಲುಗಳ ತಾಣಗಳ ಮುನ್ಸೂಚನೆ, ವೀಲ್‌ಚೇರ್ ರ‍್ಯಾಂಪ್‌ಗಳ ಮಾಹಿತಿ ಮತ್ತು ಹಿರಿಯರಿಗೆ ಸೂಕ್ತವಾದ ವಿಶ್ರಾಂತಿ ಸಮಯದ ಯೋಜನೆ.",
      icon: <Users className="text-forest-light" size={24} />,
    },
  ];

  return (
    <section id="benefits" className="py-20 md:py-28 bg-ivory-warm/40 border-b border-border/80 scroll-mt-20">
      <div className="container-content space-y-16">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-forest/10 border border-forest/20 text-forest text-xs font-semibold uppercase tracking-widest font-mono">
            <Award size={14} />
            <span>{t("landing.benefitsTag")}</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-charcoal tracking-tight">
            {t("landing.benefitsTitle")}
          </h2>
          <p className="text-base sm:text-lg text-charcoal-light leading-relaxed">
            {t("landing.benefitsSubtitle")}
          </p>
        </div>

        {/* 4 Big Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {benefits.map((b, idx) => (
            <div
              key={idx}
              className="rounded-2xl border border-border bg-white p-7 shadow-subtle hover:shadow-elevation transition-all hover:-translate-y-1 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-ivory-warm border border-border flex items-center justify-center">
                    {b.icon}
                  </div>
                  <span className="font-mono text-2xl sm:text-3xl font-extrabold text-forest">
                    {b.stat}
                  </span>
                </div>
                <span className="text-[11px] font-mono uppercase tracking-wider font-semibold text-charcoal-light block mb-2">
                  {isKn ? b.unitKn : b.unitEn}
                </span>
                <h3 className="text-base font-bold text-charcoal mb-2">
                  {isKn ? b.titleKn : b.titleEn}
                </h3>
                <p className="text-xs text-charcoal-light leading-relaxed">
                  {isKn ? b.descKn : b.descEn}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-border/60 flex items-center gap-1.5 text-[11px] font-mono text-forest">
                <ShieldCheck size={13} />
                <span>{isKn ? "ಖಚಿತ ಭರವಸೆ" : "Guaranteed Invariant"}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Sign-Up Bar */}
        <div className="rounded-2xl bg-forest p-6 sm:p-8 text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-elevation">
          <div className="space-y-1 text-center sm:text-left">
            <h4 className="font-serif text-lg sm:text-xl font-bold text-ivory">
              {isKn 
                ? "ನಿಮ್ಮ ಮುಂದಿನ ಕರ್ನಾಟಕ ಪ್ರವಾಸವನ್ನು ವಿಶ್ವಾಸದಿಂದ ಯೋಜಿಸಿ" 
                : "Travel with Total Topographic & Budget Confidence"}
            </h4>
            <p className="text-xs text-ivory/70">
              {isKn 
                ? "30 ಸೆಕೆಂಡುಗಳಲ್ಲಿ ಉಚಿತ ಖಾತೆ ರಚಿಸಿ ಅಥವಾ ಡೆಮೊ ಮೋಡ್ ಮೂಲಕ ಪರಿಶೀಲಿಸಿ." 
                : "Create a free traveler account in 30 seconds or try the instant demo."}
            </p>
          </div>
          <Link
            href="/signup"
            className="shrink-0 inline-flex items-center gap-2 rounded-xl bg-white text-forest px-5 py-3 text-xs font-bold hover:bg-ivory transition-all shadow-md group"
          >
            <span>{isKn ? "ಉಚಿತ ಖಾತೆ ರಚಿಸಿ" : "Get Started Now"}</span>
            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
}
