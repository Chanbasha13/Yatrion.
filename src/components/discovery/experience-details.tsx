"use client";

import { useEffect } from "react";
import {
  X,
  Compass,
  MapPin,
  Clock,
  Wallet,
  Calendar,
  ShieldCheck,
  ExternalLink,
  Sparkles,
  Accessibility,
  HeartHandshake,
  Plus,
  Bookmark,
  BookmarkCheck,
} from "lucide-react";
import type { KarnatakaExperience } from "@/lib/discovery/discovery-types";
import { useLanguage } from "@/lib/i18n";

interface ExperienceDetailsModalProps {
  experience: KarnatakaExperience | null;
  isOpen: boolean;
  onClose: () => void;
  onSaveToTrip?: (exp: KarnatakaExperience) => void;
  isSaved?: boolean;
  onAddToItinerary?: (exp: KarnatakaExperience, dayNumber: number) => void;
  availableDays?: number[];
}

export function ExperienceDetailsModal({
  experience,
  isOpen,
  onClose,
  onSaveToTrip,
  isSaved = false,
  onAddToItinerary,
  availableDays = [1],
}: ExperienceDetailsModalProps) {
  const { isKn } = useLanguage();

  // Escape key listener to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen || !experience) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="gem-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
    >
      <div
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-[var(--radius-xl)] bg-white border border-border shadow-2xl p-6 sm:p-8 space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label={isKn ? "ಮುಚ್ಚಿ" : "Close dialog"}
          className="absolute top-5 right-5 p-2 rounded-full text-charcoal hover:bg-ivory-warm transition-colors cursor-pointer"
        >
          <X size={20} />
        </button>

        {/* Header Section */}
        <div className="space-y-2 pr-8">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-forest/10 border border-forest/20 px-2.5 py-0.5 text-xs font-semibold text-forest">
              <Compass size={12} />
              <span>
                {isKn ? experience.categoryLabelKn : experience.categoryLabelEn}
              </span>
            </span>

            <span className="inline-flex items-center gap-1 rounded-full bg-ivory-warm border border-border px-2.5 py-0.5 text-xs font-medium text-charcoal-muted">
              <MapPin size={11} className="text-forest" />
              <span>{experience.district} · {experience.region}</span>
            </span>

            {experience.dataConfidence && (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200 px-2.5 py-0.5 text-[11px] font-medium text-amber-800">
                <ShieldCheck size={11} className="text-amber-600" />
                <span>
                  {experience.dataConfidence === "verified_asi"
                    ? isKn ? "ASI ಸಂರಕ್ಷಿತ ಸ್ಮಾರಕ" : "ASI Protected"
                    : experience.dataConfidence === "verified_karnatakatourism"
                    ? isKn ? "ಕರ್ನಾಟಕ ಪ್ರವಾಸೋದ್ಯಮ ಪರಿಶೀಲಿತ" : "Verified Tourism"
                    : isKn ? "ಕ್ಷೇತ್ರ ಪರಿಶೀಲಿತ" : "Field Curated"}
                </span>
              </span>
            )}
          </div>

          <h3
            id="gem-modal-title"
            className="font-[family-name:var(--font-playfair)] text-xl sm:text-2xl font-bold text-forest-dark"
          >
            {isKn ? experience.titleKn : experience.titleEn}
          </h3>

          <p className="text-xs sm:text-sm text-charcoal-muted">
            {isKn ? experience.titleEn : experience.titleKn} ·{" "}
            <span className="text-forest font-medium">
              {isKn
                ? `ಸಂಬಂಧಿತ ಪ್ರಮುಖ ತಾಣ: ${experience.associatedDestinationKannada}`
                : `Associated destination: ${experience.associatedDestinationName}`}
            </span>
          </p>
        </div>

        {/* Main Description */}
        <div className="space-y-3 text-xs sm:text-sm text-charcoal leading-relaxed">
          <p>{isKn ? experience.shortDescriptionKn : experience.shortDescriptionEn}</p>
        </div>

        {/* Why Special Highlight Card */}
        <div className="rounded-[var(--radius-lg)] bg-ivory-warm/80 border border-border p-4 space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-forest uppercase tracking-wider font-mono">
            <Sparkles size={13} className="text-gold" />
            <span>{isKn ? "ಯಾತ್ರಿಯಾನ್ ವಿಶೇಷತೆ:" : "Why This Experience Is Special:"}</span>
          </div>
          <p className="text-xs sm:text-sm text-charcoal leading-relaxed">
            {isKn ? experience.whySpecialKn : experience.whySpecialEn}
          </p>
        </div>

        {/* Specifications Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2 border-t border-border text-xs">
          <div className="p-3 rounded-[var(--radius-md)] bg-ivory-warm/50 border border-border/80 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-forest">
              <Clock size={13} />
              <span>{isKn ? "ಭೇಟಿ ಸಮಯಾವಧಿ:" : "Visit Duration:"}</span>
            </div>
            <p className="text-charcoal font-medium">
              {isKn ? experience.durationLabelKn : experience.durationLabelEn}
            </p>
          </div>

          <div className="p-3 rounded-[var(--radius-md)] bg-ivory-warm/50 border border-border/80 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-emerald-800">
              <Wallet size={13} />
              <span>{isKn ? "ಅಂದಾಜು ವೆಚ್ಚ:" : "Estimated Budget:"}</span>
            </div>
            <p className="text-charcoal font-medium">
              {isKn ? experience.costLabelKn : experience.costLabelEn}
            </p>
          </div>

          <div className="p-3 rounded-[var(--radius-md)] bg-ivory-warm/50 border border-border/80 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-sky-800">
              <Calendar size={13} />
              <span>{isKn ? "ಸೂಕ್ತ ಕಾಲಾವಧಿ:" : "Best Season:"}</span>
            </div>
            <p className="text-charcoal font-medium">
              {isKn ? experience.seasonLabelKn : experience.seasonLabelEn}
            </p>
          </div>

          <div className="p-3 rounded-[var(--radius-md)] bg-ivory-warm/50 border border-border/80 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-charcoal">
              <Accessibility size={13} />
              <span>{isKn ? "ಪ್ರವೇಶ ಸೌಲಭ್ಯ:" : "Accessibility:"}</span>
            </div>
            <p className="text-charcoal leading-tight">
              {isKn ? experience.accessibilityNoteKn : experience.accessibilityNoteEn}
            </p>
          </div>
        </div>

        {/* Responsible Tourism & Conservation Guidance */}
        <div className="rounded-[var(--radius-md)] bg-emerald-50/70 border border-emerald-200/80 p-3.5 space-y-1 text-xs">
          <div className="flex items-center gap-1.5 font-bold text-emerald-900 font-mono uppercase tracking-wider text-[11px]">
            <HeartHandshake size={13} className="text-emerald-700" />
            <span>{isKn ? "ಜವಾಬ್ದಾರಿಯುತ ಪ್ರವಾಸೋದ್ಯಮ ಮಾರ್ಗದರ್ಶನ:" : "Responsible Tourism & Preservation:"}</span>
          </div>
          <p className="text-emerald-950 leading-relaxed">
            {isKn ? experience.responsibleTourismGuidanceKn : experience.responsibleTourismGuidanceEn}
          </p>
        </div>

        {/* Traceable Data Source & Non-Live Crowd Disclaimer */}
        <div className="p-3 rounded-[var(--radius-md)] bg-gray-50 border border-gray-200 text-[11px] text-charcoal-muted space-y-1 font-mono">
          <p>
            <strong className="text-charcoal">{isKn ? "ದತ್ತಾಂಶ ಮೂಲ:" : "Source Citation:"}</strong>{" "}
            {isKn ? experience.sourceCitationKn : experience.sourceCitationEn}
          </p>
          {experience.coordinates && (
            <p>
              <strong className="text-charcoal">{isKn ? "ಜಿಪಿಎಸ್ ನಿರ್ದೇಶಾಂಕಗಳು:" : "GPS Coordinates:"}</strong>{" "}
              {experience.coordinates.latitude.toFixed(4)}° N, {experience.coordinates.longitude.toFixed(4)}° E
            </p>
          )}
          <p className="text-gray-500 italic pt-1">
            {isKn ? experience.crowdLevelDisclaimerKn : experience.crowdLevelDisclaimerEn}
          </p>
        </div>

        {/* Bottom Actions Row */}
        <div className="pt-3 border-t border-border flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <a
            href={experience.googleMapsSearchUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-1.5 rounded-[var(--radius-md)] border border-border bg-ivory-warm px-4 py-2 text-xs font-semibold text-charcoal hover:bg-cream transition-colors cursor-pointer"
          >
            <span>{isKn ? "ಗೂಗಲ್ ಮ್ಯಾಪ್ಸ್‌ನಲ್ಲಿ ವೀಕ್ಷಿಸಿ" : "View on Google Maps"}</span>
            <ExternalLink size={12} />
          </a>

          <div className="flex items-center gap-2">
            {onSaveToTrip && (
              <button
                type="button"
                onClick={() => onSaveToTrip(experience)}
                className={`inline-flex items-center justify-center gap-1.5 rounded-[var(--radius-md)] border px-4 py-2 text-xs font-semibold transition-colors cursor-pointer ${
                  isSaved
                    ? "bg-forest/10 border-forest text-forest"
                    : "bg-white border-border text-charcoal hover:border-forest"
                }`}
              >
                {isSaved ? <BookmarkCheck size={14} /> : <Bookmark size={14} />}
                <span>
                  {isSaved
                    ? isKn ? "ಉಳಿಸಲಾಗಿದೆ" : "Saved"
                    : isKn ? "ಪ್ರವಾಸಕ್ಕೆ ಉಳಿಸಿ" : "Save to Trip"}
                </span>
              </button>
            )}

            {onAddToItinerary && (
              <button
                type="button"
                onClick={() => {
                  onAddToItinerary(experience, availableDays[0] || 1);
                  onClose();
                }}
                className="inline-flex items-center justify-center gap-1.5 rounded-[var(--radius-md)] bg-forest px-4 py-2 text-xs font-semibold text-white hover:bg-forest-light transition-colors cursor-pointer shadow-subtle"
              >
                <Plus size={14} />
                <span>{isKn ? "ವೇಳಾಪಟ್ಟಿಗೆ ಸೇರಿಸಿ" : "Add to Itinerary"}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
