"use client";

import React, { useState } from "react";
import { useLanguage } from "@/lib/i18n";
import { 
  Mountain, 
  Waves, 
  Trees, 
  Landmark, 
  Compass, 
  ArrowRight,
  ShieldCheck,
  Eye,
  Layers
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface BiomeItem {
  id: string;
  num: string;
  nameEn: string;
  nameKn: string;
  subtitleEn: string;
  subtitleKn: string;
  elevation: string;
  temperature: string;
  ghatAccess: string;
  bgGradient: string;
  accentBorder: string;
  tagColor: string;
  icon: React.ReactNode;
  highlightsEn: string[];
  highlightsKn: string[];
  descriptionEn: string;
  descriptionKn: string;
  geologicalFactEn: string;
  geologicalFactKn: string;
}

export function SpatialBiomeGallery() {
  const { t, isKn } = useLanguage();
  const [activeBiomeId, setActiveBiomeId] = useState<string>("sahyadri");
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const biomes: BiomeItem[] = [
    {
      id: "karavali",
      num: "01",
      nameEn: "Karavali Coastal Strip",
      nameKn: "ಕರಾವಳಿ ಕಡಲತೀರ ಪ್ರದೇಶ",
      subtitleEn: "320 km of Arabian Sea cliffs, estuaries, and volcanic basalt columns",
      subtitleKn: "320 ಕಿ.ಮೀ ಅರಬ್ಬೀ ಕಡಲತೀರ, ನದಿ ಅಳಿವೆಗಳು ಮತ್ತು ಜ್ವಾಲಾಮುಖಿ ಬಸಾಲ್ಟ್ ಶಿಲೆಗಳು",
      elevation: "0 – 50 m ASL",
      temperature: "24°C – 32°C",
      ghatAccess: "Shiradi / Agumbe Ghat Descent",
      bgGradient: "from-teal-950 via-slate-900 to-sky-950",
      accentBorder: "border-teal-500/30",
      tagColor: "bg-teal-500/20 text-teal-300 border-teal-500/30",
      icon: <Waves className="text-teal-400" size={24} />,
      highlightsEn: [
        "St. Mary's Island — Hexagonal columnar basalt (88M yrs old)",
        "Maravanthe NH66 — Arabian Sea & Souparnika River divide",
        "Honnavar Mangroves — Boardwalk through tidal backwaters",
        "Om Beach Headland — Rocky geological crescent cliffs"
      ],
      highlightsKn: [
        "ಸೇಂಟ್ ಮೇರಿಸ್ ದ್ವೀಪ — ಷಡ್ಭುಜಾಕೃತಿಯ ಅಪರೂಪದ ಬಸಾಲ್ಟ್ ಶಿಲಾ ಸ್ತಂಭಗಳು",
        "ಮರವಂತೆ ಹೆದ್ದಾರಿ — ಕಡಲು ಮತ್ತು ಸೌಪರ್ಣಿಕಾ ನದಿಯ ನಡುವಿನ ಕಿರಿದಾದ ರಸ್ತೆ",
        "ಹೊನ್ನಾವರ ಮ್ಯಾಂಗ್ರೋವ್ — ಹಿನ್ನೀರಿನ ಪರಿಸರ ಕಾಲುದಾರಿ",
        "ಓಂ ಬೀಚ್ ಕಡಿದಾದ ಬಂಡೆಗಳು — ನೈಸರ್ಗಿಕ ಕಲ್ಲಿನ ತೀರ"
      ],
      descriptionEn: "A pristine marine coastline where the Western Ghats tumble directly into the Arabian Sea. Characterized by tidal estuaries, salt-sprayed cliffs, and ancient maritime trade ports.",
      descriptionKn: "ಪಶ್ಚಿಮ ಘಟ್ಟಗಳ ಹಸಿರು ಇಳಿಜಾರುಗಳು ಅರಬ್ಬೀ ಸಮುದ್ರಕ್ಕೆ ಮುಖಾಮುಖಿಯಾಗುವ ಅಪೂರ್ವ ಕರಾವಳಿ. ಹಿನ್ನೀರು, ನದಿ ಮುಖಜ ಭೂಮಿ ಮತ್ತು ಸಮುದ್ರ ಬಂಡೆಗಳ ರಮಣೀಯ ತಾಣ.",
      geologicalFactEn: "St. Mary's columnar basalts were formed when Madagascar split from the Indian plate during the Cretaceous period.",
      geologicalFactKn: "ಕ್ರಿಟೇಷಿಯಸ್ ಯುಗದಲ್ಲಿ ಭಾರತೀಯ ಭೂಖಂಡದಿಂದ ಮಡಗಾಸ್ಕರ್ ಬೇರ್ಪಟ್ಟಾಗ ಈ ಬಸಾಲ್ಟ್ ಕಂಬಗಳು ರೂಪುಗೊಂಡವು.",
    },
    {
      id: "sahyadri",
      num: "02",
      nameEn: "Sahyadri Rainforests",
      nameKn: "ಸಹ್ಯಾದ್ರಿ ಮಳೆಕಾಡು ವಲಯ",
      subtitleEn: "UNESCO World Heritage biodiversity hotspot & high misty summits",
      subtitleKn: "ಯುನೆಸ್ಕೋ ವಿಶ್ವ ಪರಂಪರೆಯ ನಿತ್ಯಹರಿದ್ವರ್ಣ ಮಳೆಕಾಡುಗಳು ಮತ್ತು ಮಂಜಿನ ಶಿಖರಗಳು",
      elevation: "600 – 1,930 m ASL",
      temperature: "14°C – 26°C",
      ghatAccess: "Charmadi / Kudremukh Ghat Passes",
      bgGradient: "from-emerald-950 via-forest-dark to-slate-950",
      accentBorder: "border-emerald-500/30",
      tagColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
      icon: <Trees className="text-emerald-400" size={24} />,
      highlightsEn: [
        "Mullayanagiri Peak — Highest point in Karnataka (1,930 m)",
        "Jog Falls Gorge — 253m unbroken cascade in Sharavathi valley",
        "Kudremukh Shola Ridges — Vast montane grassland ecosystem",
        "Agumbe Rainforest Canopy — High rainfall & king cobra sanctuary"
      ],
      highlightsKn: [
        "ಮುಳ್ಳಯ್ಯನಗಿರಿ ಶಿಖರ — ಕರ್ನಾಟಕದ ಅತ್ಯುನ್ನತ ಶಿಖರ (1,930 ಮೀ)",
        "ಜೋಗ ಜಲಪಾತ — ಶರಾವತಿ ಕಣಿವೆಯ 253 ಮೀಟರ್ ಅದ್ಭುತ ಜಲಪಾತ",
        "ಕುದುರೆಮುಖ ಶೋಲಾ ಹುಲ್ಲುಗಾವಲು — ಪರ್ವತ ಪರಿಸರ ವ್ಯವಸ್ಥೆ",
        "ಆಗುಂಬೆ ಮಳೆಕಾಡು — ಮಳೆಯ ರಾಜಧಾನಿ ಮತ್ತು ದಟ್ಟ ನಿತ್ಯಹರಿದ್ವರ್ಣ ಕಾಡು"
      ],
      descriptionEn: "One of the world's eight hottest biodiversity hotspots. Steep escarpments, roaring monsoon waterfalls, dense shola canopy cover, and lush Arabica coffee estates.",
      descriptionKn: "ವಿಶ್ವದ ಅತ್ಯಂತ ಪ್ರಮುಖ ಜೀವವೈವಿಧ್ಯ ತಾಣಗಳಲ್ಲಿ ಒಂದು. ಕಡಿದಾದ ಘಾಟಿಗಳು, ಮಳೆಗಾಲದ ಜಲಪಾತಗಳು ಮತ್ತು ಪರಿಮಳ ಬೀರುವ ಕಾಫಿ ತೋಟಗಳು ಇಲ್ಲಿನ ಸೊಬಗು.",
      geologicalFactEn: "Acts as Karnataka's water tower, catching South-West monsoon clouds to birth the Kaveri, Tungabhadra, and Sharavathi rivers.",
      geologicalFactKn: "ನೈಋತ್ಯ ಮಾನ್ಸೂನ್ ಮಾರುತಗಳನ್ನು ತಡೆದು ಕಾವೇರಿ, ತುಂಗಭದ್ರಾ ಮತ್ತು ಶರಾವತಿ ನದಿಗಳಿಗೆ ಜನ್ಮ ನೀಡುವ ನೈಸರ್ಗಿಕ ಜಲಸಂಪನ್ಮೂಲ.",
    },
    {
      id: "deccan-granite",
      num: "03",
      nameEn: "Deccan Granite Landscapes",
      nameKn: "ಡೆಕ್ಕನ್ ಶಿಲಾ ಕಣಿವೆಗಳು",
      subtitleEn: "2.5-billion-year-old Archean granite tors & towering stone citadels",
      subtitleKn: "2.5 ಶತಕೋಟಿ ವರ್ಷಗಳ ಪುರಾತನ ಆರ್ಕಿಯನ್ ಬಂಡೆಗಳು ಮತ್ತು ಕಲ್ಲಿನ ಬಲಿಷ್ಠ ಕೋಟೆಗಳು",
      elevation: "450 – 900 m ASL",
      temperature: "20°C – 36°C",
      ghatAccess: "NH48 / Tungabhadra Valley Corridors",
      bgGradient: "from-stone-950 via-amber-950 to-neutral-950",
      accentBorder: "border-amber-500/30",
      tagColor: "bg-amber-500/20 text-amber-300 border-amber-500/30",
      icon: <Mountain className="text-amber-400" size={24} />,
      highlightsEn: [
        "Hampi Boulder Terrain — Vast surreal granite balance formations",
        "Chitradurga Fort — Impenetrable 7-tiered stone masonry citadel",
        "Savandurga Monolith — Asia's largest single granite monolith (1,226 m)",
        "Yana Limestone Karsts — 120m jagged black crystalline needles"
      ],
      highlightsKn: [
        "ಹಂಪಿ ಶಿಲಾ ಕಣಿವೆ — ನೈಸರ್ಗಿಕವಾಗಿ ಸಮತೋಲನಗೊಂಡ ಬೃಹತ್ ಬಂಡೆಗಳು",
        "ಚಿತ್ರದುರ್ಗ ಏಳುಸುತ್ತಿನ ಕೋಟೆ — ಕಲ್ಲಿನ ವಾಸ್ತುಶಿಲ್ಪದ ಅಪ್ರತಿಮ ರಕ್ಷಣೆ",
        "ಸಾವನದುರ್ಗ ಏಕಶಿಲೆ — ಏಷ್ಯಾದ ಅತಿದೊಡ್ಡ ಏಕಶಿಲಾ ಬಂಡೆ (1,226 ಮೀ)",
        "ಯಾಣದ ಕಪ್ಪು ಶಿಖರಗಳು — 120 ಮೀಟರ್ ಎತ್ತರದ ಹರಳು ಸುಣ್ಣದಕಲ್ಲಿನ ರಚನೆ"
      ],
      descriptionEn: "Pre-Cambrian crystalline shields where natural weathering sculpted massive granitic balancing boulders. Fortified by legendary rulers who incorporated raw boulders directly into battlements.",
      descriptionKn: "ಕೋಟಿಗಟ್ಟಲೆ ವರ್ಷಗಳ ಪ್ರಾಕೃತಿಕ ಬದಲಾವಣೆಗಳಿಂದ ರೂಪುಗೊಂಡ ಬೃಹತ್ ಬಂಡೆಗಳ ನಾಡು. ನೈಸರ್ಗಿಕ ಬಂಡೆಗಳನ್ನೇ ಗೋಡೆಗಳನ್ನಾಗಿ ಬಳಸಿಕೊಂಡ ಐತಿಹಾಸಿಕ ಕೋಟೆಗಳ ತವರು.",
      geologicalFactEn: "Composed of Closepet granite and Dharwar schist belts among the oldest surviving continental crusts on Earth.",
      geologicalFactKn: "ಭೂಮಿಯ ಅತ್ಯಂತ ಪುರಾತನ ಶಿಲಾ ಪದರಗಳಲ್ಲಿ ಒಂದಾದ ಕ್ಲೋಸ್‌ಪೇಟ್ ಗ್ರಾನೈಟ್‌ನಿಂದ ಈ ಪ್ರದೇಶ ರೂಪುಗೊಂಡಿದೆ.",
    },
    {
      id: "central-plains",
      num: "04",
      nameEn: "Central Plains & Citadels",
      nameKn: "ಮಧ್ಯ ಬಯಲು ಸೀಮೆ ಮತ್ತು ಕೋಟೆಗಳು",
      subtitleEn: "Basalt plateaus, river basins, subterranean aqueducts & acoustic domes",
      subtitleKn: "ಬಸಾಲ್ಟ್ ಪ್ರಸ್ಥಭೂಮಿ, ನದಿತೀರಗಳು, ಭೂಗತ ಕಾಲುವೆಗಳು ಮತ್ತು ಪ್ರತಿಧ್ವನಿ ಗುಮ್ಮಟಗಳು",
      elevation: "500 – 700 m ASL",
      temperature: "22°C – 38°C",
      ghatAccess: "Deccan Highway Network (NH50 / NH65)",
      bgGradient: "from-zinc-950 via-rose-950 to-slate-950",
      accentBorder: "border-rose-500/30",
      tagColor: "bg-rose-500/20 text-rose-300 border-rose-500/30",
      icon: <Landmark className="text-rose-400" size={24} />,
      highlightsEn: [
        "Bidar Karez Water System — Ancient subterranean Persian tunnel network",
        "Gol Gumbaz (Vijayapura) — World's second largest dome with 7-echo acoustics",
        "Badami Cliff Caves — Red sandstone escarpments carved above Agastya Lake",
        "Aihole Architecture Cradle — Rock-cut masonry testing laboratories"
      ],
      highlightsKn: [
        "ಬೀದರ್ ಕರೇಜ್ ನೀರಿನ ವ್ಯವಸ್ಥೆ — ಪುರಾತನ ಭೂಗತ ಪರ್ಷಿಯನ್ ಕಾಲುವೆ ಜಾಲ",
        "ಗೋಲ್ ಗುಮ್ಮಟ (ವಿಜಯಪುರ) — 7 ಬಾರಿ ಪ್ರತಿಧ್ವನಿಸುವ ವಿಶ್ವದ ಎರಡನೇ ಅತಿದೊಡ್ಡ ಗುಮ್ಮಟ",
        "ಬಾದಾಮಿ ಕೆಂಪು ಕಲ್ಲಿನ ಗುಹೆಗಳು — ಅಗಸ್ತ್ಯ ಸರೋವರದ ತೀರದ ಕಡಿದಾದ ಬಂಡೆಗಳು",
        "ಐಹೊಳೆ ಶಿಲ್ಪಕಲೆಯ ತೊಟ್ಟಿಲು — ಕಲ್ಲಿನ ವಾಸ್ತುಶಿಲ್ಪದ ಸಂಶೋಧನಾ ತಾಣ"
      ],
      descriptionEn: "Expansive fertile river valleys and dry plateau basins. Home to advanced medieval hydraulic engineering, massive brick-and-mortar acoustic engineering, and carved sandstone cliffs.",
      descriptionKn: "ವಿಶಾಲ ಕೃಷ್ಣಾ ಮತ್ತು ತುಂಗಭದ್ರಾ ನದಿ ಬಯಲು ಪ್ರದೇಶಗಳು. ಮಧ್ಯಕಾಲೀನ ಜಲವಿಜ್ಞಾನ, ಅದ್ಭುತ ಧ್ವನಿ ವಿಜ್ಞಾನದ ಗುಮ್ಮಟಗಳು ಮತ್ತು ಕೆಂಪು ಮರಳುಗಲ್ಲಿನ ಶಿಲ್ಪಕಲೆ.",
      geologicalFactEn: "Underlain by Deccan Traps basalt flood-lavas that erupted 66 million years ago over earlier Kaladgi sandstones.",
      geologicalFactKn: "66 ದಶಲಕ್ಷ ವರ್ಷಗಳ ಹಿಂದೆ ಉಕ್ಕಿ ಹರಿದ ಡೆಕ್ಕನ್ ಟ್ರ್ಯಾಪ್ಸ್ ಲಾವಾ ಪ್ರವಾಹಗಳಿಂದ ರೂಪುಗೊಂಡ ಪ್ರಸ್ಥಭೂಮಿ.",
    },
  ];

  const currentBiome = biomes.find((b) => b.id === activeBiomeId) || biomes[0];

  // Mouse move 3D tilt calculation
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setMousePos({ x, y });
  };

  const handleMouseLeave = () => {
    setMousePos({ x: 0, y: 0 });
  };

  return (
    <section id="biomes" className="py-20 md:py-28 bg-forest-dark text-white relative overflow-hidden scroll-mt-20">
      {/* Background ambient lighting */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(16,185,129,0.15),rgba(255,255,255,0))]" />

      <div className="container-content space-y-16 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-widest font-mono">
            <Layers size={14} />
            <span>{t("landing.galleryTag")}</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-ivory tracking-tight">
            {t("landing.galleryTitle")}
          </h2>
          <p className="text-base sm:text-lg text-ivory/70 leading-relaxed">
            {t("landing.gallerySubtitle")}
          </p>
        </div>

        {/* Biome Tab Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          {biomes.map((biome) => {
            const isActive = biome.id === activeBiomeId;
            return (
              <button
                key={biome.id}
                type="button"
                onClick={() => setActiveBiomeId(biome.id)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs sm:text-sm font-semibold transition-all",
                  isActive
                    ? "bg-white text-forest-dark border-white shadow-lg scale-105"
                    : "bg-white/5 text-ivory/80 border-white/10 hover:bg-white/10 hover:text-white"
                )}
              >
                {biome.icon}
                <span>{isKn ? biome.nameKn : biome.nameEn}</span>
                <span className="font-mono text-xs opacity-60">[{biome.num}]</span>
              </button>
            );
          })}
        </div>

        {/* 3D Spatial Environment Showcase */}
        <div
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="relative max-w-5xl mx-auto rounded-3xl border border-white/15 bg-gradient-to-br backdrop-blur-xl p-8 sm:p-12 shadow-2xl transition-all duration-300"
          style={{
            transform: `perspective(1000px) rotateY(${mousePos.x * 6}deg) rotateX(${-mousePos.y * 6}deg)`,
            transformStyle: "preserve-3d",
          }}
        >
          <div className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${currentBiome.bgGradient} opacity-90 -z-10`} />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Info Column */}
            <div className="lg:col-span-7 space-y-6">
              <div className="flex flex-wrap items-center gap-2">
                <span className={cn("px-3 py-1 rounded-full text-xs font-mono font-bold border", currentBiome.tagColor)}>
                  {currentBiome.elevation}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-mono bg-white/10 border border-white/15 text-ivory">
                  {currentBiome.temperature}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-mono bg-white/10 border border-white/15 text-ivory/80">
                  {currentBiome.ghatAccess}
                </span>
              </div>

              <div>
                <span className="text-xs font-mono text-gold-light/80 block mb-1">
                  BIOME {currentBiome.num} OF 04
                </span>
                <h3 className="text-2xl sm:text-3xl font-serif font-bold text-white leading-tight">
                  {isKn ? currentBiome.nameKn : currentBiome.nameEn}
                </h3>
                <p className="text-sm text-ivory/80 mt-1">
                  {isKn ? currentBiome.subtitleKn : currentBiome.subtitleEn}
                </p>
              </div>

              <p className="text-xs sm:text-sm text-ivory/70 leading-relaxed">
                {isKn ? currentBiome.descriptionKn : currentBiome.descriptionEn}
              </p>

              {/* Highlights */}
              <div className="space-y-2.5 pt-2">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-gold-muted block">
                  {isKn ? "ಪ್ರಮುಖ ನೈಸರ್ಗಿಕ ತಾಣಗಳು" : "Verified Secular Highlights"}:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {(isKn ? currentBiome.highlightsKn : currentBiome.highlightsEn).map((hl, hIdx) => (
                    <div
                      key={hIdx}
                      className="flex items-start gap-2 p-2.5 rounded-lg bg-black/20 border border-white/10 text-xs text-ivory/90"
                    >
                      <ShieldCheck size={14} className="text-emerald-400 shrink-0 mt-0.5" />
                      <span>{hl}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Geological Fact Box */}
              <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 text-xs text-ivory/75 flex items-start gap-2.5">
                <Compass size={16} className="text-gold-light shrink-0 mt-0.5" />
                <p>
                  <strong className="text-gold-light font-mono mr-1">
                    {isKn ? "ಭೂವೈಜ್ಞಾನಿಕ ಸತ್ಯ:" : "Geological Provenance:"}
                  </strong>
                  {isKn ? currentBiome.geologicalFactKn : currentBiome.geologicalFactEn}
                </p>
              </div>
            </div>

            {/* Right Interactive Visual Card */}
            <div className="lg:col-span-5 flex flex-col justify-center">
              <div
                className="relative rounded-2xl border border-white/20 bg-white/10 p-6 backdrop-blur-md shadow-xl space-y-5"
                style={{
                  transform: "translateZ(30px)",
                }}
              >
                <div className="flex items-center justify-between border-b border-white/15 pb-4">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-xs font-mono text-ivory font-semibold uppercase tracking-wider">
                      {isKn ? "ನೈಜ ಪರಿಸರ ಮಾದರಿ" : "Live Spatial Model"}
                    </span>
                  </div>
                  <Eye size={15} className="text-ivory/60" />
                </div>

                <div className="space-y-4">
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-mono text-ivory/70">
                      <span>{isKn ? "ಎತ್ತರದ ಮಟ್ಟ" : "Elevation Range"}</span>
                      <span className="text-emerald-300">{currentBiome.elevation}</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-emerald-400 h-full rounded-full transition-all duration-500"
                        style={{
                          width: currentBiome.id === "karavali" ? "10%" :
                                 currentBiome.id === "sahyadri" ? "95%" :
                                 currentBiome.id === "deccan-granite" ? "50%" : "35%"
                        }}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-mono text-ivory/70">
                      <span>{isKn ? "ಘಾಟಿ ಇಳಿಜಾರು ಗುಣಕ" : "Ghat Curvature Penalty"}</span>
                      <span className="text-amber-300">
                        {currentBiome.id === "sahyadri" ? "1.48x – 1.55x" :
                         currentBiome.id === "karavali" ? "1.20x" : "1.10x – 1.25x"}
                      </span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-amber-400 h-full rounded-full transition-all duration-500"
                        style={{
                          width: currentBiome.id === "sahyadri" ? "90%" :
                                 currentBiome.id === "karavali" ? "30%" : "40%"
                        }}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-mono text-ivory/70">
                      <span>{isKn ? "ಮಾನ್ಸೂನ್ ಮಳೆ ಪ್ರಭಾವ" : "Monsoon Rain Sensitivity"}</span>
                      <span className="text-sky-300">
                        {currentBiome.id === "sahyadri" ? "High (4,000+ mm)" :
                         currentBiome.id === "karavali" ? "High (3,500 mm)" : "Moderate (650 mm)"}
                      </span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-sky-400 h-full rounded-full transition-all duration-500"
                        style={{
                          width: currentBiome.id === "sahyadri" ? "95%" :
                                 currentBiome.id === "karavali" ? "80%" : "25%"
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <Link
                    href="/signup"
                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-white text-forest-dark px-4 py-3 text-xs font-bold hover:bg-ivory transition-all shadow-md group"
                  >
                    <span>{isKn ? "ಈ ವಲಯದ ಸಂಪೂರ್ಣ ಪ್ರವಾಸ ಯೋಜನೆ" : "Plan Trip in this Biome"}</span>
                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

