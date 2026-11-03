"use client";

import React from "react";
import { useLanguage } from "@/lib/i18n";
import { 
  Cpu, 
  Route, 
  Coins, 
  Gem, 
  Users, 
  Activity, 
  Bot, 
  ArrowRight,
  Shield
} from "lucide-react";
import Link from "next/link";

export function PlatformFeaturesMatrix() {
  const { t, isKn } = useLanguage();

  const features = [
    {
      id: "routes",
      icon: <Route className="text-forest" size={26} />,
      tagEn: "Workspace 01",
      tagKn: "ಕಾರ್ಯಸ್ಥಳ 01",
      titleEn: "Smart Route Optimization",
      titleKn: "ಸ್ಮಾರ್ಟ್ ಮಾರ್ಗ ಆಪ್ಟಿಮೈಸೇಶನ್",
      descEn: "Mathematical travel-salesman algorithms customized for Karnataka topography. Applies 1.35x-1.55x speed penalties on Western Ghats passes to prevent exhausted late-night mountain driving.",
      descKn: "ಕರ್ನಾಟಕದ ನೈಜ ಭೂಪ್ರದೇಶಕ್ಕೆ ಹೊಂದುವ ಗಣಿತೀಯ ಅಲ್ಗಾರಿದಮ್‌ಗಳು. ಪಶ್ಚಿಮ ಘಟ್ಟಗಳ ರಸ್ತೆಗಳಲ್ಲಿ ಸುರಕ್ಷಿತ ಸಂಚಾರಕ್ಕಾಗಿ ನೈಜ ಸಮಯ ಮತ್ತು ವೇಗದ ಗುಣಕಗಳನ್ನು ಅನ್ವಯಿಸುತ್ತದೆ.",
      metricEn: "Saves ~2.5 hrs transit daily",
      metricKn: "ದಿನಕ್ಕೆ ಸರಾಸರಿ 2.5 ಗಂಟೆ ಉಳಿತಾಯ",
    },
    {
      id: "budget",
      icon: <Coins className="text-gold-dark" size={26} />,
      tagEn: "Workspace 02",
      tagKn: "ಕಾರ್ಯಸ್ಥಳ 02",
      titleEn: "Intelligent Budget Optimizer",
      titleKn: "ಬುದ್ಧಿವಂತ ಬಜೆಟ್ ಆಪ್ಟಿಮೈಜರ್",
      descEn: "Deterministic 3-tier cost modeling for fuel consumption, highway tolls, verified homestays, and activity permits across 4 vehicle classes with zero hidden fees.",
      descKn: "ಇಂಧನ ಬಳಕೆ, ಹೆದ್ದಾರಿ ಟೋಲ್, ಅಧಿಕೃತ ಹೋಂಸ್ಟೇ ಮತ್ತು ಪ್ರವೇಶ ಪರವಾನಗಿಗಳ ನಿಖರ 3-ಹಂತದ ಬಜೆಟ್ ಲೆಕ್ಕಾಚಾರ. ಯಾವುದೇ ರಹಸ್ಯ ಶುಲ್ಕಗಳಿಲ್ಲ.",
      metricEn: "100% itemized transparency",
      metricKn: "100% ಪಾರದರ್ಶಕ ವೆಚ್ಚದ ಪಟ್ಟಿ",
    },
    {
      id: "gems",
      icon: <Gem className="text-terracotta" size={26} />,
      tagEn: "Workspace 03",
      tagKn: "ಕಾರ್ಯಸ್ಥಳ 03",
      titleEn: "Hidden Gems Discovery Engine",
      titleKn: "ಅಜ್ಞಾತ ರತ್ನಗಳ ಶೋಧಕ",
      descEn: "Catalog of 40+ curated, lesser-known Karnataka destinations: hidden waterfalls, secluded coastal viewpoints, basalt geological columns, and artisan craft villages.",
      descKn: "40+ ಗುಪ್ತ ತಾಣಗಳ ಪಟ್ಟಿ: ಕಾಡಿನೊಳಗಿನ ಜಲಪಾತಗಳು, ರಹಸ್ಯ ಕಡಲತೀರಗಳು, ಬಸಾಲ್ಟ್ ಶಿಲಾ ಸ್ತಂಭಗಳು ಮತ್ತು ಸಾಂಪ್ರದಾಯಿಕ ಕರಕುಶಲ ಕಲಾ ಗ್ರಾಮಗಳು.",
      metricEn: "40+ verified offbeat locations",
      metricKn: "40+ ಪರಿಶೀಲಿತ ವಿಶಿಷ್ಟ ತಾಣಗಳು",
    },
    {
      id: "group",
      icon: <Users className="text-forest" size={26} />,
      tagEn: "Workspace 04",
      tagKn: "ಕಾರ್ಯಸ್ಥಳ 04",
      titleEn: "Collaborative Group Decision Engine",
      titleKn: "ಸಹಭಾಗಿತ್ವದ ಗುಂಪು ನಿರ್ಧಾರ ವ್ಯವಸ್ಥೆ",
      descEn: "Allows multi-traveler parties to vote on stops using Borda count aggregation while strictly enforcing senior citizen and child mobility constraints.",
      descKn: "ಗುಂಪಿನ ಎಲ್ಲ ಸದಸ್ಯರ ಇಷ್ಟಗಳನ್ನು ಮತದಾನದ ಮೂಲಕ ನಿರ್ಧರಿಸುತ್ತದೆ ಮತ್ತು ಹಿರಿಯ ನಾಗರಿಕರು ಹಾಗೂ ಮಕ್ಕಳ ನಡಿಗೆ ಮಿತಿಗಳನ್ನು ಕಾಪಾಡುತ್ತದೆ.",
      metricEn: "Fair consensus & accessibility checks",
      metricKn: "ನ್ಯಾಯಯುತ ಒಮ್ಮತ ಮತ್ತು ಪ್ರವೇಶಾವಕಾಶ",
    },
    {
      id: "adaptive",
      icon: <Activity className="text-forest-light" size={26} />,
      tagEn: "Workspace 05",
      tagKn: "ಕಾರ್ಯಸ್ಥಳ 05",
      titleEn: "Adaptive Travel Intelligence",
      titleKn: "ಹೊಂದಾಣಿಕೆಯ ಪ್ರವಾಸ ಬುದ್ಧಿಮತ್ತೆ",
      descEn: "Real-time Open-Meteo precipitation feeds and verified Karnataka road disruptions trigger explainable schedule proposals without overwriting your trip state.",
      descKn: "ನೈಜ ಹವಾಮಾನ ಮತ್ತು ರಸ್ತೆ ತಡೆಗಳ ಆಧಾರದ ಮೇಲೆ, ನಿಮ್ಮ ಮೂಲ ಯೋಜನೆಯನ್ನು ಅಳಿಸದೆ ಪಾರದರ್ಶಕ ಪರ್ಯಾಯ ವೇಳಾಪಟ್ಟಿಯನ್ನು ಶಿಫಾರಸು ಮಾಡುತ್ತದೆ.",
      metricEn: "Zero-overwrite safety guarantee",
      metricKn: "ಮೂಲ ಯೋಜನೆ ಸಂರಕ್ಷಿಸುವ ಭರವಸೆ",
    },
    {
      id: "companion",
      icon: <Bot className="text-gold-dark" size={26} />,
      tagEn: "Workspace 06",
      tagKn: "ಕಾರ್ಯಸ್ಥಳ 06",
      titleEn: "Multilingual AI Companion",
      titleKn: "ಬಹುಭಾಷಾ AI ಪ್ರವಾಸ ಸಹಾಯಕ",
      descEn: "Conversational co-pilot fluent in Kannada and English, grounded strictly in verified Karnataka geography, road conditions, and cultural etiquette without hallucinations.",
      descKn: "ಕನ್ನಡ ಮತ್ತು ಇಂಗ್ಲಿಷ್‌ನಲ್ಲಿ ಸಲೀಸಾಗಿ ಮಾತನಾಡುವ, ಕರ್ನಾಟಕದ ಭೌಗೋಳಿಕತೆ ಮತ್ತು ಸಂಸ್ಕೃತಿಗೆ ಬದ್ಧವಾದ ವಿಶ್ವಾಸಾರ್ಹ AI ಮಾರ್ಗದರ್ಶಿ.",
      metricEn: "Kannada & English native voice",
      metricKn: "ಕನ್ನಡ ಮತ್ತು ಇಂಗ್ಲಿಷ್ ನೈಸರ್ಗಿಕ ಧ್ವನಿ",
    },
  ];

  return (
    <section id="features" className="py-20 md:py-28 bg-white border-b border-border/80 scroll-mt-20">
      <div className="container-content space-y-16">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-forest/10 border border-forest/20 text-forest text-xs font-semibold uppercase tracking-widest font-mono">
            <Cpu size={14} />
            <span>{t("landing.featuresTag")}</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-charcoal tracking-tight">
            {t("landing.featuresTitle")}
          </h2>
          <p className="text-base sm:text-lg text-charcoal-light leading-relaxed">
            {t("landing.featuresSubtitle")}
          </p>
        </div>

        {/* 6 Workspace Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
          {features.map((feat) => (
            <div
              key={feat.id}
              className="group flex flex-col justify-between rounded-2xl border border-border/80 bg-ivory-warm/30 hover:bg-white p-7 transition-all duration-300 hover:shadow-elevation hover:-translate-y-1"
            >
              <div>
                {/* Card Header */}
                <div className="flex items-center justify-between mb-5">
                  <div className="w-12 h-12 rounded-xl bg-white border border-border flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                    {feat.icon}
                  </div>
                  <span className="text-[11px] font-mono uppercase tracking-wider font-semibold text-charcoal-light/70 bg-white px-2.5 py-1 rounded-md border border-border/60">
                    {isKn ? feat.tagKn : feat.tagEn}
                  </span>
                </div>

                {/* Title & Desc */}
                <h3 className="text-lg font-bold text-charcoal mb-2.5 group-hover:text-forest transition-colors">
                  {isKn ? feat.titleKn : feat.titleEn}
                </h3>
                <p className="text-xs sm:text-sm text-charcoal-light leading-relaxed mb-6">
                  {isKn ? feat.descKn : feat.descEn}
                </p>
              </div>

              {/* Bottom Metric & Link */}
              <div className="pt-4 border-t border-border/60 flex items-center justify-between text-xs font-mono">
                <span className="text-forest font-semibold flex items-center gap-1.5">
                  <Shield size={13} className="text-forest/70" />
                  <span>{isKn ? feat.metricKn : feat.metricEn}</span>
                </span>
                <Link
                  href="/login"
                  className="text-charcoal-light group-hover:text-forest font-semibold flex items-center gap-1 transition-colors"
                >
                  <span>{isKn ? "ಪ್ರವೇಶಿಸಿ" : "Explore"}</span>
                  <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Banner */}
        <div className="rounded-2xl bg-forest-dark text-white p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6 shadow-elevation">
          <div className="space-y-2 text-center md:text-left">
            <h4 className="font-serif text-xl sm:text-2xl font-bold text-ivory">
              {isKn 
                ? "ಎಲ್ಲಾ 6 ಕಾರ್ಯಸ್ಥಳಗಳು ನಿಮ್ಮ ಉಚಿತ ಖಾತೆಯಲ್ಲಿ ಲಭ್ಯವಿದೆ" 
                : "All 6 Dedicated Workspaces Await You"}
            </h4>
            <p className="text-xs sm:text-sm text-ivory/70 max-w-xl">
              {isKn 
                ? "ಯಾವುದೇ ಕ್ರೆಡಿಟ್ ಕಾರ್ಡ್ ಅಥವಾ ಶುಲ್ಕವಿಲ್ಲ. ಹ್ಯಾಕಥಾನ್ ಮೌಲ್ಯಮಾಪನಕ್ಕಾಗಿ 1-ಕ್ಲಿಕ್ ಡೆಮೊ ಮೋಡ್ ಅನ್ನು ಸಹ ಬಳಸಬಹುದು." 
                : "Zero subscriptions or paid APIs. 1-click Demo Traveler mode available for immediate evaluation."}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
            <Link
              href="/signup"
              className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl bg-forest-light px-5 py-3 text-xs font-semibold text-white hover:bg-forest transition-all"
            >
              {t("landing.signUpFreeBtn")}
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl border border-white/20 bg-white/10 px-5 py-3 text-xs font-semibold text-white hover:bg-white/20 transition-all"
            >
              {t("landing.signInBtn")}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

