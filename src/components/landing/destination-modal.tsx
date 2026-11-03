"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import {
  X,
  Calendar,
  Clock,
  MapPin,
  Sparkles,
  Navigation,
  ArrowRight,
  Wallet,
  Tag,
} from "lucide-react";
import type { Destination } from "@/lib/destinations-data";
import { useLanguage } from "@/lib/i18n";

interface DestinationModalProps {
  destination: Destination | null;
  onClose: () => void;
  onSelectForPlan?: (destination: Destination) => void;
}

export function DestinationModal({
  destination,
  onClose,
  onSelectForPlan,
}: DestinationModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const { t, isKn } = useLanguage();

  // Close on Escape key press, trap Tab focus, and manage body scroll
  useEffect(() => {
    if (!destination) return;

    const previouslyFocusedElement = document.activeElement as HTMLElement | null;

    // Focus close button on mount
    const timer = setTimeout(() => {
      closeButtonRef.current?.focus();
    }, 50);

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }

      // Trap Tab key within dialog
      if (e.key === "Tab" && dialogRef.current) {
        const focusableElements = dialogRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      clearTimeout(timer);
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
      previouslyFocusedElement?.focus?.();
    };
  }, [destination, onClose]);

  if (!destination) return null;

  const handlePlanClick = () => {
    onSelectForPlan?.(destination);
    onClose();
    // Smooth scroll to planner section
    const plannerEl = document.getElementById("planner");
    if (plannerEl) {
      plannerEl.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-dest-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        tabIndex={-1}
        className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-[var(--radius-lg)] border border-border bg-white shadow-elevated focus:outline-none"
      >
        {/* Close Button */}
        <button
          ref={closeButtonRef}
          type="button"
          onClick={onClose}
          aria-label={t("destinations.closeModal")}
          className="absolute top-3 right-3 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-forest-dark/80 text-white hover:bg-forest-dark transition-colors focus-visible:outline-forest cursor-pointer shadow-subtle"
        >
          <X size={18} />
        </button>

        {/* Modal Image Header */}
        <div className="relative aspect-[16/9] w-full bg-forest-dark overflow-hidden">
          <Image
            src={destination.image}
            alt={destination.imageAlt}
            fill
            sizes="(max-width: 768px) 100vw, 680px"
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-forest-dark/95 via-forest-dark/40 to-transparent" />

          <div className="absolute bottom-4 left-4 right-4 text-white">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="inline-block rounded-full bg-gold/90 px-2.5 py-0.5 text-xs font-semibold text-forest-dark uppercase tracking-wider">
                {destination.tag}
              </span>
              <span className="inline-block rounded-full bg-white/20 backdrop-blur-sm px-2.5 py-0.5 text-xs font-medium text-white">
                {destination.categoryLabel}
              </span>
            </div>

            <div className="flex items-baseline gap-2.5 flex-wrap">
              <h2
                id="modal-dest-title"
                className="font-[family-name:var(--font-playfair)] text-2xl sm:text-3xl font-bold text-white leading-tight"
              >
                {isKn ? destination.kannadaName : destination.name}
              </h2>
              <span className="text-base sm:text-lg text-gold-light font-normal">
                ({isKn ? destination.name : destination.kannadaName})
              </span>
            </div>

            <p className="flex items-center gap-1.5 text-xs sm:text-sm text-ivory/80 mt-1">
              <MapPin size={13} className="text-gold-light shrink-0" />
              <span>
                {destination.region} · {t("destinations.districtLabel")}: {destination.district}
              </span>
            </p>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-7 space-y-6">
          {/* Detailed Overview */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-charcoal-muted mb-2 font-mono">
              {isKn ? "ಈ ತಾಣದ ಕುರಿತು" : "About this destination"}
            </h3>
            <p className="text-sm sm:text-base text-charcoal leading-relaxed">
              {destination.detailedDescription || destination.description}
            </p>
          </div>

          {/* Quick Facts Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 bg-ivory-warm p-4 rounded-[var(--radius-md)] border border-border text-xs sm:text-sm">
            <div className="flex items-start gap-2.5">
              <Calendar size={18} className="text-forest mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-medium text-charcoal-muted">{t("destinations.bestSeasonLabel")}</p>
                <p className="text-sm font-semibold text-charcoal">{destination.bestSeason}</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <Clock size={18} className="text-forest mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-medium text-charcoal-muted">{t("destinations.idealStayLabel")}</p>
                <p className="text-sm font-semibold text-charcoal">{destination.idealDuration}</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <Wallet size={18} className="text-forest mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-medium text-charcoal-muted">{t("destinations.estBudgetLabel")}</p>
                <p className="text-sm font-semibold text-charcoal">
                  {destination.estimatedDailyBudget}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <Tag size={18} className="text-forest mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-medium text-charcoal-muted">{isKn ? "ಬಜೆಟ್ ಶ್ರೇಣಿ" : "Budget Tier"}</p>
                <p className="text-sm font-semibold text-charcoal">
                  {destination.budgetTier} {isKn ? "ಶ್ರೇಣಿ" : "travel range"}
                </p>
              </div>
            </div>
          </div>

          {/* Key Highlights */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-charcoal-muted mb-3 font-mono">
              {t("destinations.highlightsLabel")}
            </h3>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-charcoal">
              {destination.highlights.map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-gold mt-2 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Cultural & Travel Notes */}
          <div className="space-y-3 border-t border-border pt-4">
            <div className="flex items-start gap-2.5 text-xs sm:text-sm text-charcoal-light">
              <Sparkles size={16} className="text-gold mt-0.5 shrink-0" />
              <div>
                <strong className="text-charcoal font-medium">{t("destinations.culturalNoteLabel")}: </strong>
                <span>{destination.culturalNote}</span>
              </div>
            </div>

            <div className="flex items-start gap-2.5 text-xs sm:text-sm text-charcoal-light">
              <Navigation size={16} className="text-forest mt-0.5 shrink-0" />
              <div>
                <strong className="text-charcoal font-medium">{t("destinations.transitTipLabel")}: </strong>
                <span>{destination.transitTip}</span>
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div className="border-t border-border pt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <span className="text-xs text-charcoal-muted">
              {isKn ? `${destination.kannadaName} ತಾಣವನ್ನು ನಿಮ್ಮ ಪ್ರವಾಸಕ್ಕೆ ಸೇರಿಸಿ.` : `Add ${destination.name} to your custom itinerary route.`}
            </span>
            <button
              type="button"
              onClick={handlePlanClick}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-[var(--radius-md)] bg-forest px-5 py-2.5 text-sm font-semibold text-white hover:bg-forest-light transition-colors focus-visible:outline-forest cursor-pointer shadow-subtle"
            >
              <span>{isKn ? `${destination.kannadaName} ಜೊತೆಗೆ ಪ್ರವಾಸ ಯೋಜಿಸಿ` : `Build Itinerary with ${destination.name}`}</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
