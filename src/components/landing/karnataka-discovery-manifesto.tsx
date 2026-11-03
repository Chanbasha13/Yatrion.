"use client";

import React, { useState } from "react";
import { useLanguage } from "@/lib/i18n";
import { 
  Map, 
  MapPin, 
  ShieldCheck, 
  Landmark, 
  Trees, 
  Waves, 
  Mountain,
  ArrowRight
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface DivisionInfo {
  id: string;
  nameEn: string;
  nameKn: string;
  districtsCount: number;
  highlightEn: string;
  highlightKn: string;
  icon: React.ReactNode;
  districtsEn: string[];
  districtsKn: string[];
}

export function KarnatakaDiscoveryManifesto() {
  const { t, isKn } = useLanguage();
  const [selectedDivision, setSelectedDivision] = useState<string>("mysuru");

  const divisions: DivisionInfo[] = [
    {
      id: "mysuru",
      nameEn: "Mysuru Division",
      nameKn: "ಮೈಸೂರು ವಿಭಾಗ",
      districtsCount: 8,
      highlightEn: "Western Ghats, Coffee Highlands, Arabian Sea Coast & Royal Heritage",
      highlightKn: "ಪಶ್ಚಿಮ ಘಟ್ಟಗಳು, ಕಾಫಿ ಗಿರಿಧಾಮಗಳು, ಅರಬ್ಬೀ ಕಡಲತೀರ ಮತ್ತು ರಾಜವೈಭವ",
      icon: <Trees size={20} className="text-forest" />,
      districtsEn: [
        "Mysuru", "Chamarajanagar", "Mandya", "Hassan", 
        "Kodagu (Coorg)", "Dakshina Kannada", "Udupi", "Chikkamagaluru"
      ],
      districtsKn: [
        "ಮೈಸೂರು", "ಚಾಮರಾಜನಗರ", "ಮಂಡ್ಯ", "ಹಾಸನ",
        "ಕೊಡಗು", "ದಕ್ಷಿಣ ಕನ್ನಡ", "ಉಡುಪಿ", "ಚಿಕ್ಕಮಗಳೂರು"
      ],
    },
    {
      id: "bengaluru",
      nameEn: "Bengaluru Division",
      nameKn: "ಬೆಂಗಳೂರು ವಿಭಾಗ",
      districtsCount: 9,
      highlightEn: "Pre-Cambrian Monoliths, Silk Valleys & Granite Fortresses",
      highlightKn: "ಪುರಾತನ ಬಂಡೆ ಶಿಖರಗಳು, ರೇಷ್ಮೆ ಕಣಿವೆಗಳು ಮತ್ತು ಕಲ್ಲಿನ ಬಲಿಷ್ಠ ಕೋಟೆಗಳು",
      icon: <Mountain size={20} className="text-terracotta" />,
      districtsEn: [
        "Bengaluru Urban", "Bengaluru Rural", "Ramanagara", "Chikkaballapura", 
        "Kolar", "Tumakuru", "Shivamogga", "Davanagere", "Chitradurga"
      ],
      districtsKn: [
        "ಬೆಂಗಳೂರು ನಗರ", "ಬೆಂಗಳೂರು ಗ್ರಾಮಾಂತರ", "ರಾಮನಗರ", "ಚಿಕ್ಕಬಳ್ಳಾಪುರ",
        "ಕೋಲಾರ", "ತುಮಕೂರು", "ಶಿವಮೊಗ್ಗ", "ದಾವಣಗೆರೆ", "ಚಿತ್ರದುರ್ಗ"
      ],
    },
    {
      id: "belagavi",
      nameEn: "Belagavi Division",
      nameKn: "ಬೆಳಗಾವಿ ವಿಭಾಗ",
      districtsCount: 7,
      highlightEn: "Sharavathi Estuaries, Dandeli Rainforests & Adil Shahi Domes",
      highlightKn: "ಶರಾವತಿ ಅಳಿವೆಗಳು, ದಾಂಡೇಲಿ ದಟ್ಟ ಕಾಡುಗಳು ಮತ್ತು ಅದಿಲ್‌ಶಾಹಿ ಗುಮ್ಮಟಗಳು",
      icon: <Waves size={20} className="text-blue-600" />,
      districtsEn: [
        "Belagavi", "Bagalkote", "Vijayapura", "Dharwad", 
        "Gadag", "Haveri", "Uttara Kannada"
      ],
      districtsKn: [
        "ಬೆಳಗಾವಿ", "ಬಾಗಲಕೋಟೆ", "ವಿಜಯಪುರ", "ಧಾರವಾಡ",
        "ಗದಗ", "ಹಾವೇರಿ", "ಉತ್ತರ ಕನ್ನಡ"
      ],
    },
    {
      id: "kalaburagi",
      nameEn: "Kalaburagi Division",
      nameKn: "ಕಲಬುರಗಿ ವಿಭಾಗ",
      districtsCount: 7,
      highlightEn: "Tungabhadra Basin, Vijayanagara Boulders & Bidar Subterranean Aqueducts",
      highlightKn: "ತುಂಗಭದ್ರಾ ನದಿತೀರ, ವಿಜಯನಗರದ ಶಿಲಾ ಸಾಮ್ರಾಜ್ಯ ಮತ್ತು ಬೀದರ್ ಭೂಗತ ಸುರಂಗಗಳು",
      icon: <Landmark size={20} className="text-gold-dark" />,
      districtsEn: [
        "Kalaburagi", "Bidar", "Raichur", "Koppal", 
        "Ballari", "Vijayanagara", "Yadgir"
      ],
      districtsKn: [
        "ಕಲಬುರಗಿ", "ಬೀದರ್", "ರಾಯಚೂರು", "ಕೊಪ್ಪಳ",
        "ಬಳ್ಳಾರಿ", "ವಿಜಯನಗರ", "ಯಾದಗಿರಿ"
      ],
    },
  ];

  const currentDiv = divisions.find((d) => d.id === selectedDivision) || divisions[0];

  return (
    <section id="discovery" className="py-20 md:py-28 bg-white border-b border-border/80 scroll-mt-20">
      <div className="container-content space-y-16">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-forest/10 border border-forest/20 text-forest text-xs font-semibold uppercase tracking-widest font-mono">
            <Map size={14} />
            <span>{t("landing.discoveryTag")}</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-charcoal tracking-tight">
            {t("landing.discoveryTitle")}
          </h2>
          <p className="text-base sm:text-lg text-charcoal-light leading-relaxed">
            {t("landing.discoverySubtitle")}
          </p>
        </div>

        {/* Division Selector Buttons */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-4xl mx-auto">
          {divisions.map((div) => {
            const isSelected = div.id === selectedDivision;
            return (
              <button
                key={div.id}
                type="button"
                onClick={() => setSelectedDivision(div.id)}
                className={cn(
                  "flex flex-col items-center justify-center p-4 rounded-xl border text-center transition-all",
                  isSelected
                    ? "bg-forest text-white border-forest shadow-md scale-105"
                    : "bg-ivory-warm/40 text-charcoal border-border hover:bg-white hover:border-forest/40"
                )}
              >
                <div className={cn("p-2 rounded-lg mb-2", isSelected ? "bg-white/20 text-white" : "bg-white text-forest shadow-sm")}>
                  {div.icon}
                </div>
                <span className="text-sm font-bold block mb-0.5">
                  {isKn ? div.nameKn : div.nameEn}
                </span>
                <span className={cn("text-xs font-mono", isSelected ? "text-ivory/80" : "text-charcoal-light")}>
                  {div.districtsCount} {isKn ? "ಜಿಲ್ಲೆಗಳು" : "Districts"}
                </span>
              </button>
            );
          })}
        </div>

        {/* Selected Division Detailed Box */}
        <div className="rounded-2xl border border-border bg-ivory-warm/30 p-8 sm:p-10 max-w-4xl mx-auto shadow-subtle space-y-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border/80 pb-6">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="px-2.5 py-0.5 rounded-full bg-forest/10 text-forest text-xs font-mono font-semibold">
                  {currentDiv.districtsCount} {isKn ? "ಅಧಿಕೃತ ಜಿಲ್ಲೆಗಳು" : "Official Districts"}
                </span>
                <span className="text-xs text-charcoal-light font-mono">• 100% Verified Boundaries</span>
              </div>
              <h3 className="text-2xl font-bold font-serif text-charcoal">
                {isKn ? currentDiv.nameKn : currentDiv.nameEn}
              </h3>
              <p className="text-xs sm:text-sm text-charcoal-light mt-1">
                {isKn ? currentDiv.highlightKn : currentDiv.highlightEn}
              </p>
            </div>
            <Link
              href="/signup"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-forest hover:text-forest-dark bg-white px-4 py-2.5 rounded-lg border border-border shadow-sm group"
            >
              <span>{isKn ? "ಈ ವಿಭಾಗ ಅನ್ವೇಷಿಸಿ" : "Explore Division"}</span>
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* District Pills Grid */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono uppercase tracking-wider text-charcoal-light font-bold">
              {isKn ? "ಒಳಗೊಂಡಿರುವ ಜಿಲ್ಲೆಗಳು" : "Covered Administrative Districts"}:
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
              {(isKn ? currentDiv.districtsKn : currentDiv.districtsEn).map((district, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-border/70 text-xs font-medium text-charcoal shadow-sm"
                >
                  <MapPin size={13} className="text-forest/70 shrink-0" />
                  <span className="truncate">{district}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Secular Policy Invariant Banner */}
          <div className="rounded-xl bg-forest/5 border border-forest/20 p-4 flex items-start gap-3">
            <ShieldCheck size={20} className="text-forest shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h5 className="text-xs font-bold text-forest uppercase tracking-wider font-mono">
                {isKn ? "100% ಜಾತ್ಯತೀತ ಆಯ್ಕೆ ನೀತಿ" : "Strict Non-Religious Curation Invariant"}
              </h5>
              <p className="text-xs text-charcoal-light leading-relaxed">
                {isKn 
                  ? "ಯಾತ್ರಿಯಾನ್‌ನಲ್ಲಿ ಯಾವುದೇ ಧಾರ್ಮಿಕ ದೇವಾಲಯಗಳು ಅಥವಾ ಪೂಜಾ ಸ್ಥಳಗಳನ್ನು ಸೇರಿಸಲಾಗಿಲ್ಲ. ಪ್ರಕೃತಿ ಸೌಂದರ್ಯ, ಬಂಡೆಗಳು, ಜಲಪಾತಗಳು, ಕೋಟೆಗಳು, ಕಡಲತೀರಗಳು ಮತ್ತು ಸಾಂಸ್ಕೃತಿಕ ಪರಂಪರೆಯ ತಾಣಗಳಿಗೆ ಮಾತ್ರ ಆದ್ಯತೆ." 
                  : "Yatrion strictly curates secular attractions: natural landscapes, geological monuments, ancient stone citadels, coastal beaches, waterfalls, wildlife reserves, and artisanal heritage. Zero pilgrimage shrines or temples."}
              </p>
            </div>
          </div>
        </div>

        {/* Global Stats Counter */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto pt-4 text-center">
          <div className="p-4 rounded-xl border border-border/70 bg-white">
            <span className="block font-mono text-3xl font-bold text-forest">31</span>
            <span className="text-xs text-charcoal-light font-medium">{isKn ? "ಜಿಲ್ಲೆಗಳು" : "Districts"}</span>
          </div>
          <div className="p-4 rounded-xl border border-border/70 bg-white">
            <span className="block font-mono text-3xl font-bold text-forest">04</span>
            <span className="text-xs text-charcoal-light font-medium">{isKn ? "ಕಂದಾಯ ವಿಭಾಗಗಳು" : "Administrative Divisions"}</span>
          </div>
          <div className="p-4 rounded-xl border border-border/70 bg-white">
            <span className="block font-mono text-3xl font-bold text-forest">320 km</span>
            <span className="text-xs text-charcoal-light font-medium">{isKn ? "ಕರಾವಳಿ ತೀರ" : "Arabian Sea Coastline"}</span>
          </div>
          <div className="p-4 rounded-xl border border-border/70 bg-white">
            <span className="block font-mono text-3xl font-bold text-forest">1,930 m</span>
            <span className="text-xs text-charcoal-light font-medium">{isKn ? "ಗರಿಷ್ಠ ಶಿಖರ (ಮುಳ್ಳಯ್ಯನಗಿರಿ)" : "Peak Elevation (Mullayanagiri)"}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
