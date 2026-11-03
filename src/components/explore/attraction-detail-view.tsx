"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  Bookmark,
  CalendarPlus,
  Compass,
  MapPin,
  Clock,
  Ticket,
  Sun,
  ShieldCheck,
  ExternalLink,
  Bot,
  CheckCircle2,
  Navigation,
} from "lucide-react";
import { useAuth } from "@/lib/auth/auth-context";
import { useLanguage } from "@/lib/i18n";
import { useAssistant } from "@/lib/assistant/assistant-context";
import {
  getUserSavedPlaces,
  toggleUserSavedPlace,
} from "@/lib/storage/user-trip-service";
import {
  type SecularAttraction,
  KARNATAKA_DISTRICTS,
  SECULAR_ATTRACTIONS,
} from "@/lib/explore/district-data";
import { AddToTripModal } from "./add-to-trip-modal";

interface AttractionDetailViewProps {
  attraction: SecularAttraction;
}

export function AttractionDetailView({ attraction }: AttractionDetailViewProps) {
  const { user } = useAuth();
  const { isKn } = useLanguage();
  const { toggleOpen, sendMessage } = useAssistant();

  const [savedPlaces, setSavedPlaces] = useState<string[]>(() =>
    getUserSavedPlaces(user?.id)
  );
  const [modalOpen, setModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const isSaved = savedPlaces.includes(attraction.id);
  const districtObj = KARNATAKA_DISTRICTS.find((d) => d.id === attraction.districtId);

  // Nearby attractions in the same division/district
  const relatedAttractions = SECULAR_ATTRACTIONS.filter(
    (a) => a.id !== attraction.id && (a.districtId === attraction.districtId || a.division === attraction.division)
  ).slice(0, 3);

  const handleToggleBookmark = () => {
    toggleUserSavedPlace(user?.id, attraction.id);
    const updated = getUserSavedPlaces(user?.id);
    setSavedPlaces(updated);
    setToastMessage(
      updated.includes(attraction.id)
        ? (isKn ? "ತಾಣವನ್ನು ಬುಕ್‌ಮಾರ್ಕ್ ಮಾಡಲಾಗಿದೆ" : "Added to Saved Places")
        : (isKn ? "ತಾಣವನ್ನು ತೆಗೆದುಹಾಕಲಾಗಿದೆ" : "Removed from Saved Places")
    );
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleAskAssistant = () => {
    toggleOpen();
    const query = isKn
      ? `${attraction.nameKn} (${attraction.nameEn}) ತಾಣಕ್ಕೆ ಭೇಟಿ ನೀಡಲು ಅತ್ಯುತ್ತಮ ಸಮಯ ಮತ್ತು ಪ್ರಮುಖ ಸಲಹೆಗಳನ್ನು ನೀಡಿ.`
      : `Tell me practical traveler tips, historical significance, and best hours to visit ${attraction.nameEn} in ${districtObj?.nameEn || attraction.districtId}.`;
    sendMessage(query);
  };

  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${attraction.lat},${attraction.lng}`;

  return (
    <div className="space-y-8">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-forest-dark text-white text-xs sm:text-sm font-medium shadow-elevation border border-forest/30 transition-all animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
          <Link
            href="/app/saved"
            className="ml-2 underline text-gold-light hover:text-white font-mono text-xs"
          >
            {isKn ? "ನೋಡಿ" : "View"}
          </Link>
        </div>
      )}

      {/* Top Breadcrumb & Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
        <Link
          href="/app/explore"
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium text-charcoal-light hover:text-forest transition-colors"
        >
          <ArrowLeft size={16} />
          <span>{isKn ? "31 ಜಿಲ್ಲೆಗಳ ಅನ್ವೇಷಣೆಗೆ ಹಿಂತಿರುಗಿ" : "Back to 31-District Explorer"}</span>
        </Link>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleToggleBookmark}
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
              isSaved
                ? "bg-terracotta/10 border-terracotta text-terracotta"
                : "bg-white border-border text-charcoal hover:bg-ivory-warm"
            }`}
          >
            <Bookmark size={14} className={isSaved ? "fill-terracotta" : ""} />
            <span>{isSaved ? (isKn ? "ಉಳಿಸಲಾಗಿದೆ" : "Bookmarked") : (isKn ? "ಉಳಿಸಿ" : "Save Place")}</span>
          </button>

          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-forest text-white hover:bg-forest-dark text-xs font-bold transition-all shadow-subtle cursor-pointer"
          >
            <CalendarPlus size={14} />
            <span>{isKn ? "ಪ್ರವಾಸಕ್ಕೆ ಸೇರಿಸಿ" : "Add to Trip"}</span>
          </button>
        </div>
      </div>

      {/* Hero Visual Banner */}
      <div className="relative rounded-3xl overflow-hidden border border-border/80 bg-forest-dark text-white shadow-elevation">
        <div className="relative h-72 sm:h-96 w-full">
          <Image
            src={attraction.image}
            alt={attraction.nameEn}
            fill
            className="object-cover"
            priority
            sizes="(max-width: 1024px) 100vw, 1200px"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-charcoal/95 via-charcoal/40 to-black/20" />

          {/* Badges Overlay */}
          <div className="absolute top-4 left-4 right-4 flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-forest-dark/80 backdrop-blur-xs border border-forest-light/30 text-white text-[11px] font-mono font-semibold flex items-center gap-1.5">
                <Compass size={12} className="text-gold" />
                <span>{isKn ? attraction.categoryLabelKn : attraction.categoryLabelEn}</span>
              </span>
              <span className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-xs border border-white/20 text-white text-[11px] font-mono">
                {isKn ? districtObj?.nameKn : districtObj?.nameEn || attraction.districtId} • {attraction.division.toUpperCase()}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {attraction.elevationMeters && (
                <span className="px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-xs text-white text-[11px] font-mono">
                  {attraction.elevationMeters}m MSL
                </span>
              )}
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 backdrop-blur-xs border border-emerald-400/30 text-emerald-300 text-[11px] font-mono flex items-center gap-1">
                <ShieldCheck size={12} />
                <span>100% Secular Site</span>
              </span>
            </div>
          </div>

          {/* Title & Metadata */}
          <div className="absolute bottom-6 left-6 right-6 max-w-4xl">
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight">
              {isKn ? attraction.nameKn : attraction.nameEn}
            </h1>
            <p className="font-serif text-lg sm:text-xl text-ivory-warm/90 mt-1">
              {isKn ? attraction.nameEn : attraction.nameKn}
            </p>
            <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-ivory/80 mt-3 font-mono">
              <span className="flex items-center gap-1">
                <MapPin size={14} className="text-gold" />
                <span>{districtObj?.headquartersEn || attraction.districtId}, Karnataka</span>
              </span>
              <span>•</span>
              <span className="text-gold-light">
                {isKn ? attraction.bestSeasonKn : attraction.bestSeasonEn}
              </span>
              <span>•</span>
              <span>{attraction.verifiedSource}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Primary Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Description, Highlights, Tips */}
        <div className="lg:col-span-2 space-y-8">
          {/* Overview */}
          <div className="p-6 sm:p-8 rounded-2xl bg-white border border-border/80 shadow-subtle space-y-4">
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-charcoal">
              {isKn ? "ತಾಣದ ಅವಲೋಕನ & ವೈಶಿಷ್ಟ್ಯ" : "Overview & Cultural Significance"}
            </h2>
            <p className="text-sm sm:text-base text-charcoal-light leading-relaxed">
              {isKn ? attraction.shortDescKn : attraction.shortDescEn}
            </p>
          </div>

          {/* Highlights */}
          <div className="p-6 sm:p-8 rounded-2xl bg-white border border-border/80 shadow-subtle space-y-4">
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-charcoal">
              {isKn ? "ಪ್ರಮುಖ ಮುಖ್ಯಾಂಶಗಳು" : "Key Highlights"}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(isKn ? attraction.highlightsKn : attraction.highlightsEn).map((h, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2.5 p-3 rounded-xl bg-ivory-warm/60 border border-border/50 text-xs sm:text-sm text-charcoal"
                >
                  <CheckCircle2 size={16} className="text-forest shrink-0 mt-0.5" />
                  <span>{h}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Related Attractions */}
          {relatedAttractions.length > 0 && (
            <div className="space-y-4">
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-charcoal">
                {isKn ? "ಸಮೀಪದ ಇತರ ಜಾತ್ಯತೀತ ತಾಣಗಳು" : "Explore Nearby in this Region"}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {relatedAttractions.map((rel) => (
                  <Link
                    key={rel.id}
                    href={`/app/attractions/${rel.id}`}
                    className="group rounded-xl border border-border/80 bg-white p-3 hover:shadow-subtle hover:-translate-y-0.5 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="relative h-28 w-full rounded-lg overflow-hidden mb-2.5">
                        <Image
                          src={rel.image}
                          alt={rel.nameEn}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                          sizes="(max-width: 640px) 100vw, 300px"
                        />
                      </div>
                      <h3 className="font-serif text-sm font-bold text-charcoal group-hover:text-forest transition-colors line-clamp-1">
                        {isKn ? rel.nameKn : rel.nameEn}
                      </h3>
                      <p className="text-[11px] text-charcoal-light line-clamp-2 mt-1">
                        {isKn ? rel.shortDescKn : rel.shortDescEn}
                      </p>
                    </div>
                    <span className="text-[10px] font-mono text-forest font-semibold mt-2 inline-flex items-center gap-1">
                      <span>{isKn ? "ವಿವರ ನೋಡಿ" : "View Details"}</span>
                      <span>→</span>
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Col: Logistics, Map Link, AI Guidance */}
        <div className="space-y-6">
          {/* Practical Logistics Card */}
          <div className="p-6 rounded-2xl bg-white border border-border/80 shadow-subtle space-y-5">
            <h3 className="font-serif text-lg font-bold text-charcoal border-b border-border pb-3">
              {isKn ? "ಪ್ರಯಾಣಿಕರ ಮಾಹಿತಿ" : "Practical Guidance"}
            </h3>

            <div className="space-y-4 text-xs sm:text-sm">
              <div className="flex items-start gap-3">
                <Clock size={16} className="text-forest shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-charcoal">{isKn ? "ಸಮಯ" : "Visiting Hours"}</div>
                  <div className="text-charcoal-light">{isKn ? attraction.timingKn : attraction.timingEn}</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Ticket size={16} className="text-forest shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-charcoal">{isKn ? "ಪ್ರವೇಶ ಶುಲ್ಕ" : "Entry Fee"}</div>
                  <div className="text-charcoal-light">{isKn ? attraction.entryFeeKn : attraction.entryFeeEn}</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Sun size={16} className="text-forest shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-charcoal">{isKn ? "ಉತ್ತಮ ಕಾಲ" : "Best Season"}</div>
                  <div className="text-charcoal-light">{isKn ? attraction.bestSeasonKn : attraction.bestSeasonEn}</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <ShieldCheck size={16} className="text-forest shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-charcoal">{isKn ? "ಹಿರಿಯರ ಪ್ರವೇಶಾವಕಾಶ" : "Accessibility"}</div>
                  <div className="text-charcoal-light">
                    {isKn ? attraction.seniorAccessibilityLabelKn : attraction.seniorAccessibilityLabelEn}
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-border flex flex-col gap-2.5">
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-border text-xs font-semibold text-charcoal hover:bg-ivory-warm transition-colors"
              >
                <Navigation size={14} className="text-forest" />
                <span>{isKn ? "ಗೂಗಲ್ ಮ್ಯಾಪ್ಸ್ ನಿರ್ದೇಶನ" : "Open in Google Maps"}</span>
                <ExternalLink size={12} className="text-charcoal-light" />
              </a>

              <button
                type="button"
                onClick={handleAskAssistant}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-forest/10 hover:bg-forest/20 text-forest text-xs font-bold transition-colors cursor-pointer"
              >
                <Bot size={15} />
                <span>{isKn ? "AI ಮಾರ್ಗದರ್ಶಿಯನ್ನು ಕೇಳಿ" : "Ask Yatrion AI"}</span>
              </button>
            </div>
          </div>

          {/* Geographic Coordinates Card */}
          <div className="p-5 rounded-2xl bg-ivory-warm/50 border border-border/80 text-xs text-charcoal-light space-y-2 font-mono">
            <div className="font-bold text-charcoal font-sans text-xs">
              {isKn ? "ಭೌಗೋಳಿಕ ನಿರ್ದೇಶಾಂಕಗಳು" : "Geographic Telemetry"}
            </div>
            <div>Latitude: {attraction.lat.toFixed(5)}° N</div>
            <div>Longitude: {attraction.lng.toFixed(5)}° E</div>
            <div>District: {districtObj?.nameEn} ({attraction.districtId})</div>
            <div>Source: {attraction.verifiedSource}</div>
          </div>
        </div>
      </div>

      {/* Add to Trip Modal */}
      <AddToTripModal
        attraction={attraction}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={() => {
          setToastMessage(
            isKn
              ? `"${attraction.nameKn}" ಅನ್ನು ಪ್ರವಾಸಕ್ಕೆ ಸೇರಿಸಲಾಗಿದೆ!`
              : `Added "${attraction.nameEn}" to your active itinerary!`
          );
          setTimeout(() => setToastMessage(null), 3500);
        }}
      />
    </div>
  );
}
