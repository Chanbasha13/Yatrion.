"use client";

import { useState } from "react";
import {
  Compass,
  Clock,
  Wallet,
  Sparkles,
  MapPin,
  Plus,
  Check,
  Bookmark,
  BookmarkCheck,
  Info,
  Calendar,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";
import type { KarnatakaExperience } from "@/lib/discovery/discovery-types";
import { useLanguage } from "@/lib/i18n";

interface ExperienceCardProps {
  experience: KarnatakaExperience;
  relevanceScore?: number;
  matchReasonsEn?: string[];
  matchReasonsKn?: string[];
  onViewDetails: (exp: KarnatakaExperience) => void;
  onSaveToTrip?: (exp: KarnatakaExperience) => void;
  isSaved?: boolean;
  onAddToDay?: (exp: KarnatakaExperience, dayNumber: number) => void;
  availableDays?: number[];
}

export function ExperienceCard({
  experience,
  relevanceScore,
  matchReasonsEn,
  matchReasonsKn,
  onViewDetails,
  onSaveToTrip,
  isSaved = false,
  onAddToDay,
  availableDays = [],
}: ExperienceCardProps) {
  const { isKn } = useLanguage();
  const [showDaySelector, setShowDaySelector] = useState(false);
  const [selectedDayNum, setSelectedDayNum] = useState<number>(
    availableDays[0] || 1
  );
  const [addedRecently, setAddedRecently] = useState(false);

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case "heritage":
        return "bg-amber-100 text-amber-900 border-amber-300";
      case "nature":
        return "bg-emerald-100 text-emerald-900 border-emerald-300";
      case "waterfalls_viewpoints":
        return "bg-sky-100 text-sky-900 border-sky-300";
      case "village_cultural":
        return "bg-orange-100 text-orange-900 border-orange-300";
      case "food_culinary":
        return "bg-rose-100 text-rose-900 border-rose-300";
      case "peaceful_alternatives":
        return "bg-teal-100 text-teal-900 border-teal-300";
      case "responsible_adventure":
        return "bg-indigo-100 text-indigo-900 border-indigo-300";
      case "offbeat_photography":
        return "bg-purple-100 text-purple-900 border-purple-300";
      default:
        return "bg-forest/10 text-forest border-forest/20";
    }
  };

  const handleConfirmAdd = () => {
    if (onAddToDay) {
      onAddToDay(experience, selectedDayNum);
      setAddedRecently(true);
      setShowDaySelector(false);
      setTimeout(() => setAddedRecently(false), 3000);
    }
  };

  const primaryMatchReason = isKn
    ? matchReasonsKn && matchReasonsKn[0]
    : matchReasonsEn && matchReasonsEn[0];

  return (
    <div className="flex flex-col justify-between rounded-[var(--radius-xl)] border border-border bg-white p-5 shadow-card hover:shadow-card-hover transition-all duration-200">
      <div className="space-y-3.5">
        {/* Top Badges Row */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            <span
              className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${getCategoryColor(
                experience.category
              )}`}
            >
              <Compass size={11} />
              <span>
                {isKn ? experience.categoryLabelKn : experience.categoryLabelEn}
              </span>
            </span>

            <span className="inline-flex items-center gap-1 rounded-full bg-ivory-warm border border-border px-2 py-0.5 text-[10px] font-medium text-charcoal-muted">
              <MapPin size={10} className="text-forest" />
              <span>{experience.district}</span>
            </span>
          </div>

          {/* Relevance Score Badge (if ranked) */}
          {typeof relevanceScore === "number" && (
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold font-mono ${
                relevanceScore >= 80
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : relevanceScore >= 60
                  ? "bg-sky-50 text-sky-700 border border-sky-200"
                  : "bg-gray-100 text-charcoal border border-gray-200"
              }`}
              title={isKn ? "ವೈಯಕ್ತಿಕ ಹೊಂದಾಣಿಕೆ ಸ್ಕೋರ್" : "Personalized Trip Match Score"}
            >
              <TrendingUp size={11} />
              <span>{relevanceScore}% {isKn ? "ಹೊಂದಾಣಿಕೆ" : "Match"}</span>
            </span>
          )}
        </div>

        {/* Title & Associated Destination */}
        <div>
          <h4 className="font-[family-name:var(--font-playfair)] text-base sm:text-lg font-bold text-forest-dark leading-snug">
            {isKn ? experience.titleKn : experience.titleEn}
          </h4>
          <p className="text-xs text-charcoal-muted mt-0.5 flex items-center gap-1.5">
            <span>{isKn ? experience.titleEn : experience.titleKn}</span>
            <span>·</span>
            <span className="text-forest font-medium">
              {isKn
                ? `ಸಮೀಪದ ತಾಣ: ${experience.associatedDestinationKannada}`
                : `Near ${experience.associatedDestinationName}`}
            </span>
          </p>
        </div>

        {/* Short Description */}
        <p className="text-xs text-charcoal leading-relaxed line-clamp-3">
          {isKn ? experience.shortDescriptionKn : experience.shortDescriptionEn}
        </p>

        {/* Why Special Highlight */}
        <div className="rounded-[var(--radius-md)] bg-ivory-warm/80 border border-border/80 p-2.5 text-[11px] text-charcoal-muted space-y-1">
          <div className="flex items-center gap-1 font-semibold text-forest-dark">
            <Sparkles size={11} className="text-gold" />
            <span>{isKn ? "ಏಕೆ ವಿಶಿಷ್ಟ?" : "Why It's Special:"}</span>
          </div>
          <p className="leading-relaxed line-clamp-2">
            {isKn ? experience.whySpecialKn : experience.whySpecialEn}
          </p>
        </div>

        {/* Match Reason Banner (if available) */}
        {primaryMatchReason && (
          <div className="flex items-start gap-1.5 text-[11px] font-medium text-emerald-800 bg-emerald-50 border border-emerald-200/80 rounded-[var(--radius-sm)] px-2.5 py-1">
            <Check size={12} className="shrink-0 mt-0.5 text-emerald-600" />
            <span>{primaryMatchReason}</span>
          </div>
        )}

        {/* Metadata Chips: Duration, Budget, Effort, Season */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/70 text-[11px]">
          <div className="flex items-center gap-1 text-charcoal-muted">
            <Clock size={12} className="text-forest shrink-0" />
            <span className="truncate">
              {isKn ? experience.durationLabelKn : experience.durationLabelEn}
            </span>
          </div>

          <div className="flex items-center gap-1 text-charcoal-muted">
            <Wallet size={12} className="text-emerald-700 shrink-0" />
            <span className="truncate">
              {isKn ? experience.costLabelKn : experience.costLabelEn}
            </span>
          </div>

          <div className="flex items-center gap-1 text-charcoal-muted">
            <Calendar size={12} className="text-sky-700 shrink-0" />
            <span className="truncate">
              {isKn ? experience.seasonLabelKn : experience.seasonLabelEn}
            </span>
          </div>

          <div className="flex items-center gap-1 text-charcoal-muted">
            <ShieldCheck size={12} className="text-amber-700 shrink-0" />
            <span className="truncate">
              {experience.dataConfidence === "verified_asi"
                ? isKn ? "ASI ಸಂರಕ್ಷಿತ" : "Verified ASI"
                : experience.dataConfidence === "verified_karnatakatourism"
                ? isKn ? "ಕರ್ನಾಟಕ ಪ್ರವಾಸೋದ್ಯಮ" : "Verified Tourism"
                : isKn ? "ಕ್ಷೇತ್ರ ಪರಿಶೀಲಿತ" : "Field Curated"}
            </span>
          </div>
        </div>
      </div>

      {/* Card Action Buttons */}
      <div className="mt-4 pt-3 border-t border-border flex flex-wrap items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => onViewDetails(experience)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-forest hover:text-forest-light transition-colors cursor-pointer"
        >
          <Info size={13} />
          <span>{isKn ? "ಪೂರ್ಣ ವಿವರ & ನಕ್ಷೆ" : "Details & Map"}</span>
        </button>

        <div className="flex items-center gap-2">
          {/* Bookmark / Save Button */}
          {onSaveToTrip && (
            <button
              type="button"
              onClick={() => onSaveToTrip(experience)}
              aria-label={isSaved ? "Remove from saved gems" : "Save hidden gem to trip"}
              className={`p-1.5 rounded-[var(--radius-md)] border transition-colors cursor-pointer ${
                isSaved
                  ? "bg-forest/10 border-forest text-forest"
                  : "bg-white border-border text-charcoal hover:border-forest"
              }`}
              title={isSaved ? (isKn ? "ಉಳಿಸಲಾಗಿದೆ" : "Saved to Trip") : (isKn ? "ಉಳಿಸಿ" : "Save to Trip")}
            >
              {isSaved ? <BookmarkCheck size={14} /> : <Bookmark size={14} />}
            </button>
          )}

          {/* Add to Itinerary Button */}
          {onAddToDay && (
            <div className="relative">
              {availableDays.length > 1 ? (
                <div>
                  {showDaySelector ? (
                    <div className="flex items-center gap-1.5 bg-ivory-warm border border-forest rounded-[var(--radius-md)] p-1">
                      <select
                        value={selectedDayNum}
                        onChange={(e) => setSelectedDayNum(Number(e.target.value))}
                        className="text-xs bg-white border border-border rounded px-1.5 py-0.5 text-charcoal focus:outline-none"
                        aria-label={isKn ? "ದಿನ ಆಯ್ಕೆಮಾಡಿ" : "Select day"}
                      >
                        {availableDays.map((dNum) => (
                          <option key={dNum} value={dNum}>
                            {isKn ? `ದಿನ ${dNum}` : `Day ${dNum}`}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={handleConfirmAdd}
                        className="bg-forest text-white px-2 py-0.5 rounded text-xs font-semibold hover:bg-forest-light cursor-pointer"
                      >
                        {isKn ? "ಸೇರಿಸಿ" : "Add"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowDaySelector(false)}
                        className="text-charcoal-muted px-1 text-xs hover:text-charcoal cursor-pointer"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setShowDaySelector(true)}
                      className={`inline-flex items-center gap-1 rounded-[var(--radius-md)] px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
                        addedRecently
                          ? "bg-emerald-600 text-white"
                          : "bg-forest text-white hover:bg-forest-light"
                      }`}
                    >
                      {addedRecently ? <Check size={13} /> : <Plus size={13} />}
                      <span>
                        {addedRecently
                          ? isKn
                            ? "ಸೇರಿಸಲಾಗಿದೆ!"
                            : "Added!"
                          : isKn
                          ? "+ ಪ್ರವಾಸಕ್ಕೆ ಸೇರಿಸಿ"
                          : "+ Add to Itinerary"}
                      </span>
                    </button>
                  )}
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    onAddToDay(experience, 1);
                    setAddedRecently(true);
                    setTimeout(() => setAddedRecently(false), 3000);
                  }}
                  className={`inline-flex items-center gap-1 rounded-[var(--radius-md)] px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
                    addedRecently
                      ? "bg-emerald-600 text-white"
                      : "bg-forest text-white hover:bg-forest-light"
                  }`}
                >
                  {addedRecently ? <Check size={13} /> : <Plus size={13} />}
                  <span>
                    {addedRecently
                      ? isKn
                        ? "ಸೇರಿಸಲಾಗಿದೆ!"
                        : "Added!"
                      : isKn
                      ? "+ ಪ್ರವಾಸಕ್ಕೆ ಸೇರಿಸಿ"
                      : "+ Add to Itinerary"}
                  </span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
