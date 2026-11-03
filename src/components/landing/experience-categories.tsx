"use client";

import Image from "next/image";
import { ArrowRight, Sparkles } from "lucide-react";
import { EXPERIENCE_CATEGORIES, type ExperienceCategory } from "@/lib/destinations-data";
import { useLanguage } from "@/lib/i18n";

interface ExperienceCategoriesProps {
  onSelectCategory?: (categoryId: string) => void;
}

export function ExperienceCategories({ onSelectCategory }: ExperienceCategoriesProps) {
  const { t, isKn } = useLanguage();

  const handleCategorySelect = (category: ExperienceCategory) => {
    onSelectCategory?.(category.id);
    const destEl = document.getElementById("destinations");
    if (destEl) {
      destEl.scrollIntoView({ behavior: "smooth" });
    }
  };

  const categoryTranslations: Record<string, { title: string; desc: string }> = {
    heritage: {
      title: t("categories.heritageTitle"),
      desc: t("categories.heritageDesc"),
    },
    nature: {
      title: t("categories.natureTitle"),
      desc: t("categories.natureDesc"),
    },
    coastal: {
      title: t("categories.coastalTitle"),
      desc: t("categories.coastalDesc"),
    },
    wildlife: {
      title: t("categories.wildlifeTitle"),
      desc: t("categories.wildlifeDesc"),
    },
    culture: {
      title: t("categories.cultureTitle"),
      desc: t("categories.cultureDesc"),
    },
  };

  return (
    <section id="experiences" className="py-16 sm:py-20 lg:py-24 bg-ivory scroll-mt-16">
      <div className="container-content">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-gold mb-3 font-mono">
            <Sparkles size={14} />
            <span>{t("categories.tag")}</span>
          </div>
          <h2 className="font-[family-name:var(--font-playfair)] text-2xl sm:text-3xl lg:text-4xl font-bold text-forest-dark tracking-tight">
            {t("categories.heading")}
          </h2>
          <p className="mt-4 text-sm sm:text-base text-charcoal-muted leading-relaxed">
            {t("categories.subheading")}
          </p>
        </div>

        {/* Experience Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {EXPERIENCE_CATEGORIES.map((cat, idx) => {
            const loc = categoryTranslations[cat.id] || { title: cat.title, desc: cat.description };
            const cardTitle = loc.title;
            const cardDesc = loc.desc;

            return (
              <div
                key={cat.id}
                className={`group flex flex-col justify-between rounded-[var(--radius-lg)] border border-border bg-white overflow-hidden shadow-subtle hover:shadow-card transition-all duration-200 ${
                  idx === 0 ? "lg:col-span-2 md:col-span-2" : ""
                }`}
              >
                {/* Image banner with thumbnail */}
                <div
                  className={`relative w-full bg-forest-dark overflow-hidden ${
                    idx === 0 ? "aspect-[21/9]" : "aspect-[16/9]"
                  }`}
                >
                  <Image
                    src={cat.image}
                    alt={cat.imageAlt}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-forest-dark/85 via-forest-dark/40 to-transparent" />

                  <div className="absolute bottom-3 left-4 right-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-gold-light mb-1 font-mono">
                      {isKn ? `ಅನುಭವ #${idx + 1}` : cat.tagline}
                    </p>
                    <h3 className="font-[family-name:var(--font-playfair)] text-xl sm:text-2xl font-bold text-white">
                      {cardTitle}
                    </h3>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-5 sm:p-6 flex flex-col flex-1 justify-between">
                  <div>
                    <p className="text-sm text-charcoal-muted leading-relaxed">
                      {cardDesc}
                    </p>

                    {/* Featured places tags */}
                    <div className="mt-4 flex flex-wrap items-center gap-1.5">
                      <span className="text-xs font-medium text-charcoal-light mr-1">
                        {isKn ? "ಪ್ರಮುಖ ತಾಣಗಳು:" : "Key Highlights:"}
                      </span>
                      {cat.featuredPlaces.map((place) => (
                        <span
                          key={place}
                          className="inline-block rounded-[var(--radius-sm)] bg-ivory-warm border border-border px-2 py-0.5 text-xs text-charcoal font-medium"
                        >
                          {place}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Real interactive filter action */}
                  <div className="mt-6 pt-4 border-t border-border flex items-center justify-between">
                    <span className="text-xs text-charcoal-muted font-medium font-mono">
                      {isKn ? `${cat.destinationCount} ಆಯ್ದ ತಾಣಗಳು` : `${cat.destinationCount} Curated Places`}
                    </span>

                    <button
                      type="button"
                      onClick={() => handleCategorySelect(cat)}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-forest hover:text-forest-light group/btn cursor-pointer focus-visible:outline-forest"
                    >
                      <span>{t("categories.explorePillar")}</span>
                      <ArrowRight
                        size={14}
                        className="group-hover/btn:translate-x-0.5 transition-transform"
                      />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

