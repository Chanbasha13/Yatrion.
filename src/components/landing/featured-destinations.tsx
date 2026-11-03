"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import {
  Search,
  X,
  Filter,
  ArrowUpDown,
  MapPin,
  ArrowRight,
  Compass,
  Clock,
  Wallet,
  RotateCcw,
} from "lucide-react";
import {
  DESTINATIONS,
  type Destination,
  type ExperienceCategoryId,
  type RegionId,
} from "@/lib/destinations-data";
import { DestinationModal } from "./destination-modal";
import { useLanguage } from "@/lib/i18n";

interface FeaturedDestinationsProps {
  selectedCategory?: string;
  onCategoryChange?: (category: string) => void;
  onSelectForPlan?: (destination: Destination) => void;
}

type SortOption =
  | "recommended"
  | "name-asc"
  | "name-desc"
  | "duration-asc"
  | "duration-desc";

export function FeaturedDestinations({
  selectedCategory = "all",
  onCategoryChange,
  onSelectForPlan,
}: FeaturedDestinationsProps) {
  const { t, isKn } = useLanguage();
  const [internalCategory, setInternalCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedRegion, setSelectedRegion] = useState<string>("all");
  const [selectedDuration, setSelectedDuration] = useState<string>("all");
  const [sortBy, setSortBy] = useState<SortOption>("recommended");
  const [selectedDestination, setSelectedDestination] = useState<Destination | null>(null);

  // Synchronize category with parent or local state
  const activeCategory = onCategoryChange ? selectedCategory : internalCategory;

  const handleCategoryClick = (catId: string) => {
    if (onCategoryChange) {
      onCategoryChange(catId);
    } else {
      setInternalCategory(catId);
    }
  };

  const handleClearAllFilters = () => {
    handleCategoryClick("all");
    setSearchQuery("");
    setSelectedRegion("all");
    setSelectedDuration("all");
    setSortBy("recommended");
  };

  // Category filter options
  const categoryFilters = [
    { id: "all", label: t("destinations.filterAllExperiences") },
    { id: "heritage", label: t("destinations.filterHeritage") },
    { id: "nature", label: t("destinations.filterNature") },
    { id: "coastal", label: t("destinations.filterCoastal") },
    { id: "wildlife", label: t("destinations.filterWildlife") },
  ];

  // Distinct regions derived from data
  const regions: RegionId[] = [
    "North Karnataka",
    "South Karnataka",
    "Western Ghats",
    "Coastal Karnataka",
    "Nilgiri Biosphere",
  ];

  // Client-side filtering & sorting
  const filteredAndSortedDestinations = useMemo(() => {
    let result = DESTINATIONS;

    // 1. Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((d) => {
        return (
          d.name.toLowerCase().includes(q) ||
          d.kannadaName.includes(q) ||
          d.district.toLowerCase().includes(q) ||
          d.region.toLowerCase().includes(q) ||
          d.categoryLabel.toLowerCase().includes(q) ||
          d.tag.toLowerCase().includes(q) ||
          d.description.toLowerCase().includes(q) ||
          d.highlights.some((h) => h.toLowerCase().includes(q))
        );
      });
    }

    // 2. Category filter
    if (activeCategory !== "all") {
      result = result.filter(
        (d) =>
          d.category === (activeCategory as ExperienceCategoryId) ||
          d.categories.includes(activeCategory as ExperienceCategoryId)
      );
    }

    // 3. Region filter
    if (selectedRegion !== "all") {
      result = result.filter((d) => d.region === selectedRegion);
    }

    // 4. Duration filter
    if (selectedDuration === "short") {
      result = result.filter((d) => d.durationDays <= 2);
    } else if (selectedDuration === "extended") {
      result = result.filter((d) => d.durationDays > 2);
    }

    // 5. Deterministic sorting
    const sorted = [...result];
    switch (sortBy) {
      case "name-asc":
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "name-desc":
        sorted.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case "duration-asc":
        sorted.sort((a, b) => a.durationDays - b.durationDays);
        break;
      case "duration-desc":
        sorted.sort((a, b) => b.durationDays - a.durationDays);
        break;
      case "recommended":
      default:
        // Preserves original curated array order
        break;
    }

    return sorted;
  }, [searchQuery, activeCategory, selectedRegion, selectedDuration, sortBy]);

  const hasActiveFilters =
    searchQuery.trim() !== "" ||
    activeCategory !== "all" ||
    selectedRegion !== "all" ||
    selectedDuration !== "all" ||
    sortBy !== "recommended";

  return (
    <section id="destinations" className="py-16 sm:py-20 lg:py-24 bg-white scroll-mt-16">
      <div className="container-content">
        {/* Section Heading */}
        <div className="max-w-3xl mb-10 sm:mb-12">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-gold mb-3 font-mono">
            <Compass size={14} />
            <span>{t("destinations.tag")}</span>
          </div>
          <h2 className="font-[family-name:var(--font-playfair)] text-2xl sm:text-3xl lg:text-4xl font-bold text-forest-dark tracking-tight">
            {t("destinations.heading")}
          </h2>
          <p className="mt-3 text-sm sm:text-base text-charcoal-muted leading-relaxed">
            {t("destinations.subheading")}
          </p>
        </div>

        {/* Explorer Control Center: Search & Filter Toolbar */}
        <div className="rounded-[var(--radius-lg)] border border-border bg-ivory/60 p-4 sm:p-5 mb-8 shadow-subtle space-y-4">
          {/* Row 1: Search Bar & Sort Dropdown */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Search Input */}
            <div className="relative flex-1" role="search">
              <label htmlFor="destination-search" className="sr-only">
                {t("destinations.searchPlaceholder")}
              </label>
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-charcoal-muted">
                <Search size={16} />
              </div>
              <input
                id="destination-search"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t("destinations.searchPlaceholder")}
                className="w-full pl-10 pr-9 py-2.5 bg-white border border-border rounded-[var(--radius-md)] text-sm text-charcoal placeholder:text-charcoal-muted/70 focus:outline-none focus:border-forest focus:ring-1 focus:ring-forest transition-colors"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  aria-label="Clear destination search"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-charcoal-muted hover:text-charcoal cursor-pointer"
                >
                  <X size={15} />
                </button>
              )}
            </div>

            {/* Region Dropdown */}
            <div className="flex items-center gap-1.5 shrink-0">
              <label htmlFor="region-filter" className="sr-only">
                {t("destinations.filterAllRegions")}
              </label>
              <select
                id="region-filter"
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="w-full sm:w-auto px-3 py-2.5 bg-white border border-border rounded-[var(--radius-md)] text-xs font-medium text-charcoal focus:outline-none focus:border-forest transition-colors cursor-pointer"
              >
                <option value="all">{t("destinations.filterAllRegions")}</option>
                {regions.map((reg) => (
                  <option key={reg} value={reg}>
                    {reg}
                  </option>
                ))}
              </select>
            </div>

            {/* Duration Dropdown */}
            <div className="flex items-center gap-1.5 shrink-0">
              <label htmlFor="duration-filter" className="sr-only">
                {t("destinations.filterAllDurations")}
              </label>
              <select
                id="duration-filter"
                value={selectedDuration}
                onChange={(e) => setSelectedDuration(e.target.value)}
                className="w-full sm:w-auto px-3 py-2.5 bg-white border border-border rounded-[var(--radius-md)] text-xs font-medium text-charcoal focus:outline-none focus:border-forest transition-colors cursor-pointer"
              >
                <option value="all">{t("destinations.filterAllDurations")}</option>
                <option value="short">{t("destinations.duration1to2")}</option>
                <option value="extended">{t("destinations.duration3plus")}</option>
              </select>
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-1.5 shrink-0">
              <ArrowUpDown size={14} className="text-charcoal-muted hidden sm:inline-block" />
              <label htmlFor="sort-destinations" className="sr-only">
                Sort destinations
              </label>
              <select
                id="sort-destinations"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="w-full sm:w-auto px-3 py-2.5 bg-white border border-border rounded-[var(--radius-md)] text-xs font-medium text-charcoal focus:outline-none focus:border-forest transition-colors cursor-pointer"
              >
                <option value="recommended">{t("destinations.sortRecommended")}</option>
                <option value="name-asc">{t("destinations.sortNameAsc")}</option>
                <option value="name-desc">{t("destinations.sortNameDesc")}</option>
                <option value="duration-asc">{t("destinations.sortDurationAsc")}</option>
                <option value="duration-desc">{t("destinations.sortDurationDesc")}</option>
              </select>
            </div>
          </div>

          {/* Row 2: Category Filter Tabs & Filter Status Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-2 border-t border-border/70">
            {/* Category Pills */}
            <div
              className="flex flex-wrap items-center gap-1.5"
              role="tablist"
              aria-label="Filter destinations by experience category"
            >
              <span className="text-xs font-semibold text-charcoal-muted mr-1 hidden sm:inline-flex items-center gap-1">
                <Filter size={12} />
                <span>Experience:</span>
              </span>
              {categoryFilters.map((cat) => {
                const isActive = activeCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => handleCategoryClick(cat.id)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-[var(--radius-sm)] transition-all cursor-pointer focus-visible:outline-forest ${
                      isActive
                        ? "bg-forest text-white shadow-subtle"
                        : "bg-white text-charcoal-muted hover:text-charcoal hover:bg-ivory-warm border border-border"
                    }`}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>

            {/* Result Count and Clear Filters Button */}
            <div className="flex items-center justify-between sm:justify-end gap-3 text-xs text-charcoal-muted">
              <span>
                {t("destinations.showingCount", { count: filteredAndSortedDestinations.length })}
              </span>

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={handleClearAllFilters}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-forest hover:text-forest-light underline cursor-pointer focus-visible:outline-forest"
                >
                  <RotateCcw size={12} />
                  <span>{t("destinations.resetFilters")}</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Destination Cards Responsive Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
          {filteredAndSortedDestinations.map((dest) => (
            <article
              key={dest.id}
              className="group flex flex-col rounded-[var(--radius-lg)] border border-border bg-white overflow-hidden shadow-subtle hover:shadow-card transition-all duration-200"
            >
              {/* Card Image Container */}
              <div className="relative aspect-[16/10] w-full overflow-hidden bg-forest-dark">
                <Image
                  src={dest.image}
                  alt={dest.imageAlt}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-forest-dark/85 via-transparent to-transparent opacity-70 group-hover:opacity-90 transition-opacity" />

                {/* Region Pill */}
                <div className="absolute top-3 left-3">
                  <span className="inline-flex items-center gap-1 rounded-full bg-forest-dark/80 backdrop-blur-sm px-2.5 py-1 text-[11px] font-medium text-ivory border border-white/10">
                    <MapPin size={11} className="text-gold" />
                    {dest.region}
                  </span>
                </div>

                {/* Tag Pill */}
                <div className="absolute top-3 right-3">
                  <span className="inline-block rounded-full bg-gold/90 px-2 py-0.5 text-[10px] font-semibold text-forest-dark uppercase tracking-wider">
                    {dest.tag}
                  </span>
                </div>

                {/* Card Title & Kannada Name Overlay */}
                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <h3 className="font-[family-name:var(--font-playfair)] text-xl sm:text-2xl font-bold drop-shadow-sm">
                      {isKn ? dest.kannadaName : dest.name}
                    </h3>
                    <span className="text-sm font-normal text-gold-light/90">
                      ({isKn ? dest.name : dest.kannadaName})
                    </span>
                  </div>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5 flex flex-col flex-1 justify-between bg-white">
                <div>
                  <div className="flex items-center justify-between text-xs font-mono text-gold mb-1.5">
                    <span>{dest.categoryLabel}</span>
                    <span className="text-charcoal-muted">{t("destinations.districtLabel")}: {dest.district}</span>
                  </div>

                  <p className="text-sm text-charcoal-muted leading-relaxed line-clamp-3">
                    {dest.description}
                  </p>
                </div>

                {/* Meta Row: Duration & Budget estimates */}
                <div className="mt-4 pt-3.5 border-t border-border flex flex-col gap-2">
                  <div className="flex items-center justify-between text-xs text-charcoal-muted">
                    <span className="inline-flex items-center gap-1">
                      <Clock size={13} className="text-forest" />
                      <span>{dest.idealDuration} (est.)</span>
                    </span>
                    <span className="inline-flex items-center gap-1 font-medium text-charcoal">
                      <Wallet size={13} className="text-forest" />
                      <span>{dest.estimatedDailyBudget.split(" ")[0]}</span>
                    </span>
                  </div>

                  {/* Interactive Guide Action */}
                  <div className="pt-2 flex items-center justify-between">
                    <span className="text-[11px] text-charcoal-muted">
                      {dest.highlights.length} {isKn ? "ಪ್ರಮುಖ ಆಕರ್ಷಣೆಗಳು" : "Key Highlights"}
                    </span>
                    <button
                      type="button"
                      onClick={() => setSelectedDestination(dest)}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-forest hover:text-forest-light transition-colors group-hover:translate-x-0.5 cursor-pointer focus-visible:outline-forest py-1 px-2 rounded bg-ivory-warm hover:bg-cream"
                      aria-label={`View detailed guide for ${dest.name} (${dest.kannadaName})`}
                    >
                      <span>{isKn ? "ಮಾರ್ಗದರ್ಶಿ ವೀಕ್ಷಿಸಿ" : "Explore Guide"}</span>
                      <ArrowRight size={13} />
                    </button>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Empty State when zero results match */}
        {filteredAndSortedDestinations.length === 0 && (
          <div className="text-center py-14 border border-dashed border-border rounded-[var(--radius-lg)] p-8 bg-ivory/30">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-forest/8 text-forest mx-auto mb-3">
              <Search size={22} />
            </div>
            <h3 className="font-[family-name:var(--font-playfair)] text-lg font-bold text-forest-dark">
              {t("destinations.noDestinationsFound")}
            </h3>
            <p className="mt-1 text-sm text-charcoal-muted max-w-md mx-auto">
              {t("destinations.noDestinationsMessage")}
            </p>
            <button
              type="button"
              onClick={handleClearAllFilters}
              className="mt-4 inline-flex items-center gap-2 rounded-[var(--radius-md)] bg-forest px-4 py-2 text-xs font-semibold text-white hover:bg-forest-light transition-colors cursor-pointer"
            >
              <RotateCcw size={13} />
              <span>{t("destinations.resetFilters")}</span>
            </button>
          </div>
        )}
      </div>

      {/* Destination Detail Modal */}
      <DestinationModal
        destination={selectedDestination}
        onClose={() => setSelectedDestination(null)}
        onSelectForPlan={onSelectForPlan}
      />
    </section>
  );
}
