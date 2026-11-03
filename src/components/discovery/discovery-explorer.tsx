"use client";

import { useState, useMemo } from "react";
import {
  Compass,
  Search,
  Sparkles,
  RotateCcw,
  Bookmark,
} from "lucide-react";
import type {
  KarnatakaExperience,
  ExperienceCategory,
  ExperienceBudgetTier,
} from "@/lib/discovery/discovery-types";
import type { RegionId } from "@/lib/destinations-data";
import {
  rankAllExperiences,
} from "@/lib/discovery/discovery-engine";
import { ExperienceCard } from "./experience-card";
import { ExperienceDetailsModal } from "./experience-details";
import { useLanguage } from "@/lib/i18n";
import type { TripPreferences } from "@/lib/planner-types";
import type { BudgetScenarioType } from "@/lib/budget/budget-types";

interface DiscoveryExplorerProps {
  preferences?: TripPreferences | null;
  selectedDestinationIds?: string[];
  activeBudgetScenario?: BudgetScenarioType;
  availableDays?: number[];
  onAddToItinerary?: (exp: KarnatakaExperience, dayNumber: number) => void;
  savedGemIds?: string[];
  onToggleSaveGem?: (gemId: string) => void;
  isEmbeddedInPlanner?: boolean;
}

export function DiscoveryExplorer({
  preferences,
  selectedDestinationIds = [],
  activeBudgetScenario = "balanced",
  availableDays = [],
  onAddToItinerary,
  savedGemIds = [],
  onToggleSaveGem,
  isEmbeddedInPlanner = false,
}: DiscoveryExplorerProps) {
  const { isKn } = useLanguage();

  // Local filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<
    ExperienceCategory | "all"
  >("all");
  const [selectedRegion, setSelectedRegion] = useState<RegionId | "all">("all");
  const [selectedBudgetTier, setSelectedBudgetTier] = useState<
    ExperienceBudgetTier | "all"
  >("all");
  const [maxDuration, setMaxDuration] = useState<number | "all">("all");
  const [showOnlySaved, setShowOnlySaved] = useState(false);

  // Selected experience for detailed modal
  const [activeModalGem, setActiveModalGem] =
    useState<KarnatakaExperience | null>(null);

  const categories: { id: ExperienceCategory | "all"; labelEn: string; labelKn: string }[] = [
    { id: "all", labelEn: "All Gems", labelKn: "ಎಲ್ಲಾ ತಾಣಗಳು" },
    { id: "peaceful_alternatives", labelEn: "Peaceful Alternatives", labelKn: "ಪ್ರಶಾಂತ ಪರ್ಯಾಯಗಳು" },
    { id: "heritage", labelEn: "Lesser-Known Heritage", labelKn: "ಕಡಿಮೆ ಪರಿಚಿತ ಪರಂಪರೆ" },
    { id: "waterfalls_viewpoints", labelEn: "Waterfalls & Viewpoints", labelKn: "ಜಲಪಾತ & ವ್ಯೂಪಾಯಿಂಟ್" },
    { id: "nature", labelEn: "Scenic Nature & Valleys", labelKn: "ನಿಸರ್ಗ & ಕಣಿವೆಗಳು" },
    { id: "village_cultural", labelEn: "Village & Living Culture", labelKn: "ಗ್ರಾಮೀಣ & ಸಂಸ್ಕೃತಿ" },
    { id: "responsible_adventure", labelEn: "Responsible Adventure", labelKn: "ಜವಾಬ್ದಾರಿಯುತ ಸಾಹಸ" },
    { id: "offbeat_photography", labelEn: "Offbeat Photography", labelKn: "ವಿಶಿಷ್ಟ ಫೋಟೋಗ್ರಫಿ" },
  ];

  const regions: { id: RegionId | "all"; labelEn: string; labelKn: string }[] = [
    { id: "all", labelEn: "All Karnataka Regions", labelKn: "ಎಲ್ಲಾ ಪ್ರದೇಶಗಳು" },
    { id: "North Karnataka", labelEn: "North Karnataka (Bayaluseeme)", labelKn: "ಉತ್ತರ ಕರ್ನಾಟಕ" },
    { id: "Western Ghats", labelEn: "Western Ghats & Malnad", labelKn: "ಪಶ್ಚಿಮ ಘಟ್ಟ & ಮಲೆನಾಡು" },
    { id: "Coastal Karnataka", labelEn: "Coastal Karnataka (Karavali)", labelKn: "ಕರಾವಳಿ ಕರ್ನಾಟಕ" },
    { id: "South Karnataka", labelEn: "South Karnataka (Old Mysore)", labelKn: "ದಕ್ಷಿಣ ಕರ್ನಾಟಕ" },
    { id: "Nilgiri Biosphere", labelEn: "Nilgiri Biosphere", labelKn: "ನೀಲಗಿರಿ ವನ್ಯಜೀವಿ ಧಾಮ" },
  ];

  // Personalized ranking calculations
  const rankingInputs = useMemo(
    () => ({
      preferences,
      selectedDestinationIds,
      activeBudgetScenario,
      durationDays: preferences?.durationDays || 3,
      userInterests: preferences?.interests || [],
      departureDate: preferences?.departureDate,
    }),
    [preferences, selectedDestinationIds, activeBudgetScenario]
  );

  const rankedExperiences = useMemo(() => {
    return rankAllExperiences(rankingInputs, {
      searchQuery,
      category: selectedCategory,
      region: selectedRegion,
      budgetTier: selectedBudgetTier,
      maxDurationMinutes: maxDuration,
    });
  }, [
    rankingInputs,
    searchQuery,
    selectedCategory,
    selectedRegion,
    selectedBudgetTier,
    maxDuration,
  ]);

  // Filter for saved gems if toggle is on
  const displayedRankedGems = useMemo(() => {
    if (showOnlySaved) {
      return rankedExperiences.filter((r) =>
        savedGemIds.includes(r.experience.id)
      );
    }
    return rankedExperiences;
  }, [rankedExperiences, showOnlySaved, savedGemIds]);

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setSelectedRegion("all");
    setSelectedBudgetTier("all");
    setMaxDuration("all");
    setShowOnlySaved(false);
  };

  const handleToggleSave = (exp: KarnatakaExperience) => {
    if (onToggleSaveGem) {
      onToggleSaveGem(exp.id);
    }
  };

  return (
    <div
      id="discovery"
      className={`space-y-6 ${
        isEmbeddedInPlanner ? "" : "py-12 sm:py-16 border-t border-border"
      }`}
    >
      {/* ── HEADER & SEARCH BAR ── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1.5 max-w-2xl">
          <div className="flex items-center gap-2">
            <Compass size={20} className="text-forest" />
            <h3 className="font-[family-name:var(--font-playfair)] text-xl sm:text-2xl lg:text-3xl font-bold text-forest-dark">
              {isKn
                ? "ಕರ್ನಾಟಕದ ಗುಪ್ತ ರತ್ನಗಳು & ವಿಶಿಷ್ಟ ಅನುಭವಗಳು"
                : "Hidden Gems & Intelligent Experience Finder"}
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-charcoal-muted leading-relaxed">
            {isKn
              ? "ಜನದಟ್ಟಣೆ ಇಲ್ಲದ ಪ್ರಶಾಂತ ತಾಣಗಳು, ಪ್ರಾಚೀನ ಸ್ಮಾರಕಗಳು, ಗ್ರಾಮೀಣ ಸಂಸ್ಕೃತಿ ಮತ್ತು ನೈಸರ್ಗಿಕ ಜಲಪಾತಗಳನ್ನು ಅನ್ವೇಷಿಸಿ."
              : "Discover lesser-known heritage sanctuaries, uncrowded coastal cliffs, Shola ridge trails, and living village traditions across Karnataka."}
          </p>
        </div>

        {/* Search Input & Saved Toggle */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <div className="relative">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal-muted"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isKn ? "ತಾಣ, ಜಿಲ್ಲೆ ಅಥವಾ ಅನುಭವ ಹುಡುಕಿ..." : "Search gems, districts, heritage..."}
              className="pl-9 pr-3 py-2 text-xs rounded-[var(--radius-md)] border border-border bg-white text-charcoal focus:outline-none focus:border-forest w-56 sm:w-64 shadow-subtle"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-charcoal-muted hover:text-charcoal cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>

          {/* Saved Gems Filter Button */}
          {savedGemIds.length > 0 && (
            <button
              type="button"
              onClick={() => setShowOnlySaved(!showOnlySaved)}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-[var(--radius-md)] border text-xs font-semibold transition-colors cursor-pointer ${
                showOnlySaved
                  ? "bg-forest text-white border-forest shadow-subtle"
                  : "bg-white border-border text-charcoal hover:border-forest"
              }`}
            >
              <Bookmark size={13} />
              <span>
                {isKn
                  ? `ಉಳಿಸಿದ ತಾಣಗಳು (${savedGemIds.length})`
                  : `Saved Gems (${savedGemIds.length})`}
              </span>
            </button>
          )}
        </div>
      </div>

      {/* ── FILTER CONTROLS BAR ── */}
      <div className="space-y-3 p-4 rounded-[var(--radius-xl)] border border-border bg-ivory-warm/60">
        {/* Category Pills Slider */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                selectedCategory === cat.id
                  ? "bg-forest text-white shadow-subtle"
                  : "bg-white border border-border text-charcoal hover:border-forest"
              }`}
            >
              {isKn ? cat.labelKn : cat.labelEn}
            </button>
          ))}
        </div>

        {/* Secondary Filters: Region, Budget, Duration, Reset */}
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-border/70 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-charcoal-muted uppercase tracking-wider text-[11px] font-mono">
              {isKn ? "ಪ್ರದೇಶ:" : "Region:"}
            </span>
            <select
              value={selectedRegion}
              onChange={(e) =>
                setSelectedRegion(e.target.value as RegionId | "all")
              }
              className="bg-white border border-border rounded-[var(--radius-sm)] px-2 py-1 text-xs text-charcoal focus:outline-none"
            >
              {regions.map((r) => (
                <option key={r.id} value={r.id}>
                  {isKn ? r.labelKn : r.labelEn}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-charcoal-muted uppercase tracking-wider text-[11px] font-mono">
              {isKn ? "ವೆಚ್ಚ:" : "Budget:"}
            </span>
            <select
              value={selectedBudgetTier}
              onChange={(e) =>
                setSelectedBudgetTier(e.target.value as ExperienceBudgetTier | "all")
              }
              className="bg-white border border-border rounded-[var(--radius-sm)] px-2 py-1 text-xs text-charcoal focus:outline-none"
            >
              <option value="all">{isKn ? "ಎಲ್ಲಾ ವೆಚ್ಚ ಶ್ರೇಣಿ" : "Any Budget"}</option>
              <option value="free">{isKn ? "ಉಚಿತ ಪ್ರವೇಶ (₹0)" : "Free Access (₹0)"}</option>
              <option value="budget">{isKn ? "ಕಡಿಮೆ ವೆಚ್ಚ (≤ ₹50)" : "Budget (≤ ₹50)"}</option>
              <option value="moderate">{isKn ? "ಮಧ್ಯಮ (₹50 – ₹200)" : "Moderate (₹50 – ₹200)"}</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-charcoal-muted uppercase tracking-wider text-[11px] font-mono">
              {isKn ? "ಅವಧಿ:" : "Duration:"}
            </span>
            <select
              value={maxDuration}
              onChange={(e) =>
                setMaxDuration(
                  e.target.value === "all" ? "all" : Number(e.target.value)
                )
              }
              className="bg-white border border-border rounded-[var(--radius-sm)] px-2 py-1 text-xs text-charcoal focus:outline-none"
            >
              <option value="all">{isKn ? "ಯಾವುದೇ ಅವಧಿ" : "Any Duration"}</option>
              <option value={60}>{isKn ? "≤ 1 ಗಂಟೆ" : "≤ 1 Hour"}</option>
              <option value={90}>{isKn ? "≤ 1.5 ಗಂಟೆ" : "≤ 1.5 Hours"}</option>
              <option value={120}>{isKn ? "≤ 2 ಗಂಟೆ" : "≤ 2 Hours"}</option>
            </select>
          </div>

          {(searchQuery ||
            selectedCategory !== "all" ||
            selectedRegion !== "all" ||
            selectedBudgetTier !== "all" ||
            maxDuration !== "all" ||
            showOnlySaved) && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1 text-xs font-semibold text-forest hover:underline ml-auto cursor-pointer"
            >
              <RotateCcw size={12} />
              <span>{isKn ? "ಫಿಲ್ಟರ್ ಮರುಹೊಂದಿಸಿ" : "Reset Filters"}</span>
            </button>
          )}
        </div>
      </div>

      {/* ── PERSONALIZED RECOMMENDATION BANNER (IF TRIP ACTIVE) ── */}
      {selectedDestinationIds.length > 0 && (
        <div className="flex items-center justify-between gap-3 p-3.5 rounded-[var(--radius-lg)] bg-emerald-50/80 border border-emerald-200 text-xs text-emerald-950">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-gold shrink-0" />
            <p>
              {isKn
                ? `ನಿಮ್ಮ ಪ್ರವಾಸ ತಾಣಗಳಿಗೆ (${selectedDestinationIds.join(", ")}) ಅನುಗುಣವಾಗಿ ಪ್ರಶಾಂತ ಗುಪ್ತ ರತ್ನಗಳನ್ನು ಆದ್ಯತೆಯ ಮೇರೆಗೆ ಜೋಡಿಸಲಾಗಿದೆ.`
                : `Hidden gems near your selected destinations (${selectedDestinationIds.join(", ")}) are prioritized with customized match scores.`}
            </p>
          </div>
          <span className="shrink-0 font-bold font-mono text-[11px] text-emerald-800 bg-emerald-100/60 px-2 py-0.5 rounded-full">
            {displayedRankedGems.length} {isKn ? "ಲಭ್ಯ" : "Curated"}
          </span>
        </div>
      )}

      {/* ── EXPERIENCES GRID ── */}
      {displayedRankedGems.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {displayedRankedGems.map(({ experience, relevanceScore, matchReasonsEn, matchReasonsKn }) => (
            <ExperienceCard
              key={experience.id}
              experience={experience}
              relevanceScore={relevanceScore}
              matchReasonsEn={matchReasonsEn}
              matchReasonsKn={matchReasonsKn}
              onViewDetails={setActiveModalGem}
              onSaveToTrip={handleToggleSave}
              isSaved={savedGemIds.includes(experience.id)}
              onAddToDay={onAddToItinerary}
              availableDays={availableDays}
            />
          ))}
        </div>
      ) : (
        /* Empty Search / Filter State */
        <div className="text-center py-12 p-6 rounded-[var(--radius-xl)] border border-border bg-white space-y-3">
          <Compass size={32} className="mx-auto text-charcoal-muted/50" />
          <h4 className="text-base font-bold text-forest-dark">
            {isKn ? "ಯಾವುದೇ ತಾಣಗಳು ಕಂಡುಬಂದಿಲ್ಲ" : "No hidden gems match your filters"}
          </h4>
          <p className="text-xs text-charcoal-muted max-w-md mx-auto">
            {isKn
              ? "ದಯವಿಟ್ಟು ನಿಮ್ಮ ಹುಡುಕಾಟ ಪದ ಅಥವಾ ಫಿಲ್ಟರ್‌ಗಳನ್ನು ಬದಲಾಯಿಸಿ ಪುನಃ ಪ್ರಯತ್ನಿಸಿ."
              : "Try adjusting your search keywords, region selection, or budget filters to explore more Karnataka experiences."}
          </p>
          <button
            type="button"
            onClick={handleResetFilters}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-[var(--radius-md)] bg-forest text-white text-xs font-semibold hover:bg-forest-light transition-colors cursor-pointer"
          >
            <RotateCcw size={13} />
            <span>{isKn ? "ಎಲ್ಲಾ ತಾಣಗಳನ್ನು ವೀಕ್ಷಿಸಿ" : "View All Gems"}</span>
          </button>
        </div>
      )}

      {/* ── EXPERIENCE DETAILS MODAL DIALOG ── */}
      <ExperienceDetailsModal
        experience={activeModalGem}
        isOpen={Boolean(activeModalGem)}
        onClose={() => setActiveModalGem(null)}
        onSaveToTrip={handleToggleSave}
        isSaved={Boolean(activeModalGem && savedGemIds.includes(activeModalGem.id))}
        onAddToItinerary={onAddToItinerary}
        availableDays={availableDays}
      />
    </div>
  );
}
