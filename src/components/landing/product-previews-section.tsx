"use client";

import React, { useState } from "react";
import { useLanguage } from "@/lib/i18n";
import { 
  Laptop, 
  LayoutDashboard, 
  Route, 
  Coins, 
  Activity, 
  ArrowRight, 
  ShieldCheck, 
  Car
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface PreviewTab {
  id: string;
  nameEn: string;
  nameKn: string;
  routePath: string;
  icon: React.ReactNode;
  titleEn: string;
  titleKn: string;
  descEn: string;
  descKn: string;
  metrics: { labelEn: string; labelKn: string; val: string }[];
  content: React.ReactNode;
}

export function ProductPreviewsSection() {
  const { t, isKn } = useLanguage();
  const [activeTab, setActiveTab] = useState<string>("dashboard");

  const tabs: PreviewTab[] = [
    {
      id: "dashboard",
      nameEn: "Personal Dashboard",
      nameKn: "ವೈಯಕ್ತಿಕ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್",
      routePath: "/app/dashboard",
      icon: <LayoutDashboard size={18} />,
      titleEn: "Central Command Center",
      titleKn: "ಕೇಂದ್ರೀಯ ನಿಯಂತ್ರಣ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್",
      descEn: "View your active journey status, upcoming stops, regional weather advisories, and quick access to all 6 specialized workspaces.",
      descKn: "ನಿಮ್ಮ ಪ್ರವಾಸದ ಸ್ಥಿತಿ, ಮುಂದಿನ ನಿಲ್ದಾಣಗಳು, ಪ್ರಾದೇಶಿಕ ಹವಾಮಾನ ಎಚ್ಚರಿಕೆಗಳು ಮತ್ತು ಎಲ್ಲಾ 6 ಕಾರ್ಯಸ್ಥಳಗಳಿಗೆ ತ್ವರಿತ ಪ್ರವೇಶವನ್ನು ವೀಕ್ಷಿಸಿ.",
      metrics: [
        { labelEn: "Active Journey", labelKn: "ಸಕ್ರಿಯ ಪ್ರವಾಸ", val: "Western Ghats & Coorg" },
        { labelEn: "Next Stop", labelKn: "ಮುಂದಿನ ನಿಲ್ದಾಣ", val: "Mullayanagiri Peak" },
        { labelEn: "Live Weather", labelKn: "ನೈಜ ಹವಾಮಾನ", val: "21°C • Clear" },
      ],
      content: (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-forest/5 border border-forest/20 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[11px] font-mono text-forest uppercase tracking-wider font-bold">
                {isKn ? "ಸಕ್ರಿಯ ಪ್ರವಾಸ" : "Active Itinerary"}
              </span>
              <h5 className="font-bold text-sm text-charcoal">
                {isKn ? "ಚಿಕ್ಕಮಗಳೂರು ಮತ್ತು ಕೊಡಗು 4-ದಿನಗಳ ನಿಸರ್ಗ ಪಯಣ" : "Chikkamagaluru & Coorg 4-Day Nature Trail"}
              </h5>
              <p className="text-xs text-charcoal-light font-mono">
                {isKn ? "ದಿನ 2 • 3 ನಿಲ್ದಾಣಗಳು • 142 ಕಿ.ಮೀ" : "Day 2 of 4 • 3 stops remaining • 142 km"}
              </p>
            </div>
            <span className="px-3 py-1 rounded-full bg-forest text-white text-xs font-semibold">
              {isKn ? "ಆನ್-ಟ್ರ್ಯಾಕ್" : "On Track"}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl bg-ivory-warm/60 border border-border">
              <span className="text-[11px] font-mono text-charcoal-light block mb-1">
                {isKn ? "ಇಂದಿನ ಒಟ್ಟು ಚಾಲನಾ ಸಮಯ" : "Today's Transit Time"}
              </span>
              <span className="text-lg font-bold text-forest">3h 45m</span>
              <span className="text-[11px] text-charcoal-light block mt-0.5">
                {isKn ? "1.42x ಘಾಟಿ ಗುಣಕದೊಂದಿಗೆ" : "Includes 1.42x ghat curve multiplier"}
              </span>
            </div>
            <div className="p-3.5 rounded-xl bg-ivory-warm/60 border border-border">
              <span className="text-[11px] font-mono text-charcoal-light block mb-1">
                {isKn ? "ಬಜೆಟ್ ಸ್ಥಿತಿ" : "Budget Tracking"}
              </span>
              <span className="text-lg font-bold text-gold-dark">₹14,250 / ₹18,000</span>
              <span className="text-[11px] text-charcoal-light block mt-0.5">
                {isKn ? "ಶೂನ್ಯ ಕಮಿಷನ್ ನೈಜ ವೆಚ್ಚ" : "79% utilized • Fuel & homestay"}
              </span>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "routes",
      nameEn: "Route Optimizer",
      nameKn: "ಮಾರ್ಗ ಆಪ್ಟಿಮೈಜರ್",
      routePath: "/app/routes",
      icon: <Route size={18} />,
      titleEn: "Topographic Stop Sequencing",
      titleKn: "ಭೌಗೋಳಿಕ ಮಾರ್ಗ ವಿನ್ಯಾಸ",
      descEn: "Mathematically sequenced destinations that eradicate backtracking and enforce sunset cutoffs before driving steep Western Ghat passes.",
      descKn: "ಹಿಮ್ಮುಖ ಸಂಚಾರವನ್ನು ತಪ್ಪಿಸಿ, ಪಶ್ಚಿಮ ಘಟ್ಟಗಳಲ್ಲಿ ರಾತ್ರಿ ಪ್ರಯಾಣವನ್ನು ತಡೆಯಲು ಸೂರ್ಯಾಸ್ತದ ಮುನ್ನ ತಲುಪುವಂತೆ ಮಾರ್ಗವನ್ನು ಯೋಜಿಸುತ್ತದೆ.",
      metrics: [
        { labelEn: "Backtracking Eliminated", labelKn: "ಉಳಿಸಿದ ಸಂಚಾರ", val: "100%" },
        { labelEn: "Ghat Speed Multiplier", labelKn: "ಘಾಟಿ ವೇಗ ಗುಣಕ", val: "1.48x" },
        { labelEn: "Sunset Arrival Target", labelKn: "ಸೂರ್ಯಾಸ್ತದ ಗುರಿ", val: "17:45 IST" },
      ],
      content: (
        <div className="space-y-3 font-mono text-xs">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-white border border-border shadow-sm">
            <span className="w-6 h-6 rounded-full bg-forest text-white flex items-center justify-center font-bold text-xs shrink-0">
              1
            </span>
            <div className="flex-1">
              <span className="font-bold text-charcoal block">Mullayanagiri Peak (1,930 m)</span>
              <span className="text-[11px] text-charcoal-light">Chikkamagaluru • Morning summit vista</span>
            </div>
            <span className="text-forest font-semibold">08:00 – 10:30</span>
          </div>

          <div className="flex items-center gap-2 pl-3 py-1 text-charcoal-light text-[11px]">
            <Car size={13} className="text-forest" />
            <span>NH173 • 42 km • 1h 15m (Charmadi descent factor: 1.45x)</span>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-xl bg-white border border-border shadow-sm">
            <span className="w-6 h-6 rounded-full bg-forest text-white flex items-center justify-center font-bold text-xs shrink-0">
              2
            </span>
            <div className="flex-1">
              <span className="font-bold text-charcoal block">Bhadra Wildlife Sanctuary</span>
              <span className="text-[11px] text-charcoal-light">Lakkavalli • Forest boat safari</span>
            </div>
            <span className="text-forest font-semibold">14:00 – 17:00</span>
          </div>
        </div>
      ),
    },
    {
      id: "budget",
      nameEn: "Budget Optimizer",
      nameKn: "ಬಜೆಟ್ ಆಪ್ಟಿಮೈಜರ್",
      routePath: "/app/budget",
      icon: <Coins size={18} />,
      titleEn: "Itemized Cost Architecture",
      titleKn: "ಪಾರದರ್ಶಕ ವೆಚ್ಚ ವಿಶ್ಲೇಷಣೆ",
      descEn: "Full breakdown of real costs for petrol/diesel, highway tolls, verified local homestays, entry permits, and dining across 3 tiers.",
      descKn: "ಪೆಟ್ರೋಲ್/ಡೀಸೆಲ್, ಹೆದ್ದಾರಿ ಟೋಲ್, ಸ್ಥಳೀಯ ಹೋಂಸ್ಟೇಗಳು ಮತ್ತು ಪ್ರವೇಶ ಶುಲ್ಕಗಳ ಸಂಪೂರ್ಣ ನೈಜ ಲೆಕ್ಕಾಚಾರ.",
      metrics: [
        { labelEn: "Direct Homestays", labelKn: "ನೇರ ಹೋಂಸ್ಟೇ", val: "Zero Markup" },
        { labelEn: "Fuel Accuracy", labelKn: "ಇಂಧನ ನಿಖರತೆ", val: "±4%" },
        { labelEn: "Vehicle Classes", labelKn: "ವಾಹನ ವರ್ಗಗಳು", val: "4 Supported" },
      ],
      content: (
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="p-3 rounded-xl bg-ivory-warm/60 border border-border">
              <span className="text-[11px] font-mono text-charcoal-light block">Backpacker</span>
              <span className="text-base font-bold text-charcoal">₹1,850/day</span>
            </div>
            <div className="p-3 rounded-xl bg-forest/10 border-2 border-forest text-forest">
              <span className="text-[11px] font-mono block font-bold">Balanced</span>
              <span className="text-base font-bold">₹4,200/day</span>
            </div>
            <div className="p-3 rounded-xl bg-ivory-warm/60 border border-border">
              <span className="text-[11px] font-mono text-charcoal-light block">Premium</span>
              <span className="text-base font-bold text-charcoal">₹8,900/day</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-white border border-border space-y-1.5 text-xs text-charcoal-light">
            <div className="flex justify-between">
              <span>Fuel (Compact SUV • 580 km @ 14 km/L)</span>
              <span className="font-mono font-semibold text-charcoal">₹4,225</span>
            </div>
            <div className="flex justify-between">
              <span>Highway Tolls (NH75 / NH173)</span>
              <span className="font-mono font-semibold text-charcoal">₹380</span>
            </div>
            <div className="flex justify-between">
              <span>Verified Estate Homestays (3 Nights)</span>
              <span className="font-mono font-semibold text-charcoal">₹8,400</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "adaptive",
      nameEn: "Adaptive Telemetry",
      nameKn: "ಹೊಂದಾಣಿಕೆಯ ಟೆಲಿಮೆಟ್ರಿ",
      routePath: "/app/adaptive",
      icon: <Activity size={18} />,
      titleEn: "Live Condition Command Center",
      titleKn: "ನೈಜ ಹವಾಮಾನ ಮತ್ತು ರಸ್ತೆ ಕೇಂದ್ರ",
      descEn: "Live Open-Meteo precipitation feeds and verified Karnataka disruption reports trigger explainable replanning without erasing your notes.",
      descKn: "ಓಪನ್-ಮೀಟಿಯೋ ಮಳೆ ಮಾಹಿತಿ ಮತ್ತು ಅಧಿಕೃತ ರಸ್ತೆ ವರದಿಗಳನ್ನು ಪರಿಶೀಲಿಸಿ, ನಿಮ್ಮ ಮೂಲ ಯೋಜನೆಗೆ ಧಕ್ಕೆಯಾಗದಂತೆ ಪರ್ಯಾಯಗಳನ್ನು ನೀಡುತ್ತದೆ.",
      metrics: [
        { labelEn: "Weather Refresh", labelKn: "ಹವಾಮಾನ ನವೀಕರಣ", val: "TTL 30m" },
        { labelEn: "Disruption Provider", labelKn: "ರಸ್ತೆ ಮಾಹಿತಿ", val: "Verified Only" },
        { labelEn: "Zero-Overwrite", labelKn: "ಅಳಿಸಿಹೋಗದ ಟಿಪ್ಪಣಿ", val: "Guaranteed" },
      ],
      content: (
        <div className="space-y-3">
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 mt-1 shrink-0 animate-pulse" />
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-amber-800 block">
                {isKn ? "ಭಾರೀ ಮಳೆ ಎಚ್ಚರಿಕೆ — ಚಾರ್ಮಾಡಿ ಘಾಟಿ" : "Heavy Rain Warning — Charmadi Ghat"}
              </span>
              <p className="text-[11px] text-amber-700">
                {isKn 
                  ? "Open-Meteo: 18 ಮಿ.ಮೀ ಮಳೆ ಮುನ್ಸೂಚನೆ. ಶಿರಾಡಿ ಘಾಟಿ (NH75) ಪರ್ಯಾಯ ಮಾರ್ಗವನ್ನು ಶಿಫಾರಸು ಮಾಡಲಾಗಿದೆ." 
                  : "Open-Meteo: 18 mm/hr rain detected. Proposing Shiradi Ghat (NH75) detour (+14 mins, zero mudslide risk)."}
              </p>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-forest/5 border border-forest/20 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <ShieldCheck size={16} className="text-forest" />
              <span className="font-semibold text-charcoal">
                {isKn ? "ವೈಯಕ್ತಿಕ ಟಿಪ್ಪಣಿಗಳು 100% ಸಂರಕ್ಷಿತ" : "User Trip Notes Preserved"}
              </span>
            </div>
            <span className="font-mono text-forest font-bold">Zero Overwrite</span>
          </div>
        </div>
      ),
    },
  ];

  const currentTab = tabs.find((t) => t.id === activeTab) || tabs[0];

  return (
    <section id="previews" className="py-20 md:py-28 bg-white border-b border-border/80 scroll-mt-20">
      <div className="container-content space-y-16">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-forest/10 border border-forest/20 text-forest text-xs font-semibold uppercase tracking-widest font-mono">
            <Laptop size={14} />
            <span>{t("landing.previewTag")}</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-charcoal tracking-tight">
            {t("landing.previewTitle")}
          </h2>
          <p className="text-base sm:text-lg text-charcoal-light leading-relaxed">
            {t("landing.previewSubtitle")}
          </p>
        </div>

        {/* Workspace Tab Switcher */}
        <div className="flex flex-wrap items-center justify-center gap-2 max-w-3xl mx-auto">
          {tabs.map((tab) => {
            const isActive = tab.id === activeTab;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs sm:text-sm font-semibold transition-all",
                  isActive
                    ? "bg-forest text-white border-forest shadow-md"
                    : "bg-ivory-warm/40 text-charcoal border-border hover:bg-white hover:border-forest/40"
                )}
              >
                {tab.icon}
                <span>{isKn ? tab.nameKn : tab.nameEn}</span>
              </button>
            );
          })}
        </div>

        {/* Perspective Product Mockup Frame */}
        <div className="max-w-4xl mx-auto rounded-3xl border border-border/90 bg-ivory-warm/20 shadow-elevation overflow-hidden">
          {/* Mockup Browser Window Header */}
          <div className="bg-charcoal px-5 py-3 flex items-center justify-between text-white/70 border-b border-white/10">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500/80" />
              <span className="w-3 h-3 rounded-full bg-amber-500/80" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
            </div>
            <div className="flex items-center gap-2 px-4 py-1 rounded-md bg-white/10 text-xs font-mono text-ivory/80">
              <span>https://yatrion.in{currentTab.routePath}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-mono text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>Live Telemetry</span>
            </div>
          </div>

          {/* Mockup Workspace Content */}
          <div className="p-6 sm:p-10 bg-white space-y-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border pb-6">
              <div>
                <span className="text-xs font-mono text-forest uppercase tracking-wider font-semibold block mb-1">
                  {currentTab.routePath}
                </span>
                <h3 className="font-serif text-2xl font-bold text-charcoal">
                  {isKn ? currentTab.titleKn : currentTab.titleEn}
                </h3>
                <p className="text-xs sm:text-sm text-charcoal-light mt-1 max-w-xl">
                  {isKn ? currentTab.descKn : currentTab.descEn}
                </p>
              </div>

              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-forest hover:bg-forest-dark px-4 py-2.5 rounded-lg shadow-sm group shrink-0"
              >
                <span>{isKn ? "ಕಾರ್ಯಸ್ಥಳ ತೆರೆಯಿರಿ" : "Open Workspace"}</span>
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* Metrics Ticker */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {currentTab.metrics.map((m, mIdx) => (
                <div key={mIdx} className="p-3 rounded-xl bg-ivory-warm/40 border border-border">
                  <span className="text-[11px] font-mono uppercase text-charcoal-light block">
                    {isKn ? m.labelKn : m.labelEn}
                  </span>
                  <span className="text-sm font-bold text-charcoal mt-0.5 block">{m.val}</span>
                </div>
              ))}
            </div>

            {/* Simulated Workspace View */}
            <div className="p-6 rounded-2xl bg-ivory-warm/20 border border-border/70">
              {currentTab.content}
            </div>
          </div>

          {/* Mockup Bottom Notice */}
          <div className="bg-ivory-warm/60 px-6 py-3.5 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-charcoal-light font-mono">
            <span>
              {isKn 
                ? "ಪೂರ್ಣ ಕಾರ್ಯಸ್ಥಳವು ಸೈನ್ ಇನ್ ಆದ ನಂತರ ಮಾತ್ರ ಲಭ್ಯವಿರುತ್ತದೆ." 
                : "Full workspace interactivity is secured within the authenticated application shell."}
            </span>
            <Link
              href="/signup"
              className="text-forest hover:text-forest-dark font-bold flex items-center gap-1"
            >
              <span>{isKn ? "1-ಕ್ಲಿಕ್ ಡೆಮೊ ಪ್ರಯಾಣಿಕ ಮೋಡ್" : "Try 1-Click Demo Mode"}</span>
              <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
