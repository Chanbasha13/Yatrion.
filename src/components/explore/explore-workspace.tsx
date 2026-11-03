"use client";

import React, { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Compass,
  Search,
  MapPin,
  ShieldCheck,
  Bookmark,
  BookmarkCheck,
  Layers,
  Clock,
  Coins,
  Calendar,
  Mountain,
  X,
  PlusCircle,
  Sparkles,
  ChevronRight,
  CheckCircle2,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import { useAuth } from "@/lib/auth/auth-context";
import {
  KARNATAKA_DISTRICTS,
  SECULAR_ATTRACTIONS,
  DIVISIONS_METADATA,
  type AdministrativeDivision,
  type SecularAttraction,
} from "@/lib/explore/district-data";
import {
  getUserSavedPlaces,
  toggleUserSavedPlace,
} from "@/lib/storage/user-trip-service";
import { AddToTripModal } from "./add-to-trip-modal";
import { cn } from "@/lib/utils";

export function ExploreWorkspace() {
  const { isKn } = useLanguage();
  const { user } = useAuth();
  const router = useRouter();

  // Filters state
  const [selectedDivision, setSelectedDivision] = useState<string>("all");
  const [selectedDistrict, setSelectedDistrict] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedAttraction, setSelectedAttraction] = useState<SecularAttraction | null>(null);
  const [addToTripAttraction, setAddToTripAttraction] = useState<SecularAttraction | null>(null);
  const [toastNotification, setToastNotification] = useState<string | null>(null);

  useEffect(() => {
    if (toastNotification) {
      const timer = setTimeout(() => setToastNotification(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toastNotification]);

  // Saved places state
  const [savedPlaces, setSavedPlaces] = useState<string[]>(() =>
    getUserSavedPlaces(user?.id)
  );

  const handleToggleSave = (placeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    toggleUserSavedPlace(user?.id, placeId);
    setSavedPlaces(getUserSavedPlaces(user?.id));
  };

  // Filtered districts list based on division
  const availableDistricts = useMemo(() => {
    if (selectedDivision === "all") return KARNATAKA_DISTRICTS;
    return KARNATAKA_DISTRICTS.filter((d) => d.division === selectedDivision);
  }, [selectedDivision]);

  // Categories list
  const categories: { id: string; labelEn: string; labelKn: string }[] = [
    { id: "all", labelEn: "All Categories", labelKn: "ಎಲ್ಲಾ ವಿಭಾಗಗಳು" },
    { id: "nature_waterfalls", labelEn: "Waterfalls & Valleys", labelKn: "ಜಲಪಾತಗಳು & ಕಣಿವೆಗಳು" },
    { id: "wildlife_forests", labelEn: "Wildlife & Forests", labelKn: "ವನ್ಯಜೀವಿ & ಅರಣ್ಯಗಳು" },
    { id: "heritage_forts", labelEn: "Forts & Citadels", labelKn: "ಕೋಟೆಗಳು & ದುರ್ಗಗಳು" },
    { id: "geology_caves", labelEn: "Geology & Caves", labelKn: "ಬಂಡೆಗಳು & ಗುಹೆಗಳು" },
    { id: "architecture_monuments", labelEn: "Architecture & Domes", labelKn: "ವಾಸ್ತುಶಿಲ್ಪ & ಗುಮ್ಮಟಗಳು" },
    { id: "crafts_culture", labelEn: "Handicrafts & Guilds", labelKn: "ಕರಕುಶಲ ಕಲೆಗಳು" },
  ];

  // Filtered attractions
  const filteredAttractions = useMemo(() => {
    return SECULAR_ATTRACTIONS.filter((a) => {
      // Division filter
      if (selectedDivision !== "all" && a.division !== selectedDivision) {
        return false;
      }
      // District filter
      if (selectedDistrict !== "all" && a.districtId !== selectedDistrict) {
        return false;
      }
      // Category filter
      if (selectedCategory !== "all" && a.category !== selectedCategory) {
        return false;
      }
      // Search query
      if (searchQuery.trim() !== "") {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = a.nameEn.toLowerCase().includes(q) || a.nameKn.includes(q);
        const matchesDistrict = a.districtId.toLowerCase().includes(q);
        const matchesDesc = a.shortDescEn.toLowerCase().includes(q);
        const matchesHighlights = a.highlightsEn.some((h) => h.toLowerCase().includes(q));
        if (!matchesName && !matchesDistrict && !matchesDesc && !matchesHighlights) {
          return false;
        }
      }
      return true;
    });
  }, [selectedDivision, selectedDistrict, selectedCategory, searchQuery]);

  return (
    <div className="space-y-8">
      {/* Top Banner & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-3 py-1 rounded-full bg-forest/10 border border-forest/20 text-forest text-xs font-mono font-bold flex items-center gap-1.5">
              <Compass size={13} />
              <span>31 Districts • 100% Secular</span>
            </span>
            <span className="text-xs text-charcoal-light font-mono">
              • Verified Institutional Gazette Data
            </span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-charcoal">
            {isKn ? "ಕರ್ನಾಟಕದ 31 ಜಿಲ್ಲೆಗಳ ಅನ್ವೇಷಣೆ" : "Explore Karnataka — 31 Districts Directory"}
          </h1>
          <p className="text-xs sm:text-sm text-charcoal-light mt-1">
            {isKn
              ? "ಜಾತ್ಯತೀತ ನೈಸರ್ಗಿಕ ತಾಣಗಳು, ಜಲಪಾತಗಳು, ಕೋಟೆಗಳು, ಕಡಲತೀರಗಳು ಮತ್ತು ಭೂವೈಜ್ಞಾನಿಕ ವಿಸ್ಮಯಗಳ ಸಮಗ್ರ ಕೋಶ."
              : "Discover verified secular waterfalls, prehistoric forts, columnar basalts, and rainforest preserves across 4 administrative divisions."}
          </p>
        </div>

        {/* Quick Search */}
        <div className="relative w-full md:w-80">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-charcoal-light/70" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isKn ? "ತಾಣ, ಜಿಲ್ಲೆ ಅಥವಾ ಕೀವರ್ಡ್ ಹುಡುಕಿ..." : "Search attractions, districts..."}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-white text-xs sm:text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-forest/20 focus:border-forest transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal-light hover:text-charcoal"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Division Selector Tabs */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono font-bold text-charcoal-light uppercase tracking-wider">
            {isKn ? "ಕಂದಾಯ ವಿಭಾಗ ಆಯ್ಕೆ" : "Select Administrative Division"}:
          </span>
          <span className="text-xs font-mono text-forest">
            {filteredAttractions.length} {isKn ? "ತಾಣಗಳು ಲಭ್ಯ" : "Attractions Listed"}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
          <button
            type="button"
            onClick={() => {
              setSelectedDivision("all");
              setSelectedDistrict("all");
            }}
            className={cn(
              "px-4 py-3 rounded-xl border text-xs font-bold transition-all text-center",
              selectedDivision === "all"
                ? "bg-forest text-white border-forest shadow-sm"
                : "bg-white text-charcoal border-border hover:bg-ivory-warm hover:border-forest/30"
            )}
          >
            <span className="block">{isKn ? "ಸಮಗ್ರ ಕರ್ನಾಟಕ" : "All Karnataka"}</span>
            <span className={cn("text-[11px] font-mono", selectedDivision === "all" ? "text-ivory/80" : "text-charcoal-light")}>
              31 {isKn ? "ಜಿಲ್ಲೆಗಳು" : "Districts"}
            </span>
          </button>

          {(Object.keys(DIVISIONS_METADATA) as AdministrativeDivision[]).map((divKey) => {
            const meta = DIVISIONS_METADATA[divKey];
            const isSelected = selectedDivision === divKey;
            return (
              <button
                key={divKey}
                type="button"
                onClick={() => {
                  setSelectedDivision(divKey);
                  setSelectedDistrict("all");
                }}
                className={cn(
                  "px-4 py-3 rounded-xl border text-xs font-bold transition-all text-center",
                  isSelected
                    ? "bg-forest text-white border-forest shadow-sm"
                    : "bg-white text-charcoal border-border hover:bg-ivory-warm hover:border-forest/30"
                )}
              >
                <span className="block truncate">{isKn ? meta.nameKn : meta.nameEn}</span>
                <span className={cn("text-[11px] font-mono", isSelected ? "text-ivory/80" : "text-charcoal-light")}>
                  {meta.districtCount} {isKn ? "ಜಿಲ್ಲೆಗಳು" : "Districts"}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* District & Category Filters Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 p-4 rounded-xl bg-ivory-warm/40 border border-border">
        {/* District select */}
        <div className="flex-1 flex items-center gap-2">
          <MapPin size={16} className="text-forest shrink-0" />
          <select
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
            className="w-full bg-white border border-border rounded-lg px-3 py-2 text-xs font-medium text-charcoal focus:outline-none focus:border-forest"
          >
            <option value="all">
              {isKn ? "ಎಲ್ಲಾ ಜಿಲ್ಲೆಗಳು (31 ಜಿಲ್ಲೆಗಳು)" : "All Districts in Selection"}
            </option>
            {availableDistricts.map((d) => (
              <option key={d.id} value={d.id}>
                {isKn ? d.nameKn : d.nameEn} ({d.totalAttractions} {isKn ? "ತಾಣಗಳು" : "places"})
              </option>
            ))}
          </select>
        </div>

        {/* Category select */}
        <div className="flex-1 flex items-center gap-2">
          <Layers size={16} className="text-forest shrink-0" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full bg-white border border-border rounded-lg px-3 py-2 text-xs font-medium text-charcoal focus:outline-none focus:border-forest"
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {isKn ? c.labelKn : c.labelEn}
              </option>
            ))}
          </select>
        </div>

        {/* Reset Filters */}
        {(selectedDivision !== "all" || selectedDistrict !== "all" || selectedCategory !== "all" || searchQuery) && (
          <button
            type="button"
            onClick={() => {
              setSelectedDivision("all");
              setSelectedDistrict("all");
              setSelectedCategory("all");
              setSearchQuery("");
            }}
            className="text-xs font-mono text-terracotta hover:underline shrink-0 px-2 py-1"
          >
            {isKn ? "ಫಿಲ್ಟರ್ ತೆರವುಗೊಳಿಸಿ" : "Reset Filters"}
          </button>
        )}
      </div>

      {/* Attractions Grid */}
      {filteredAttractions.length === 0 ? (
        <div className="text-center py-16 rounded-2xl border border-dashed border-border bg-white p-8 space-y-3">
          <Compass size={36} className="mx-auto text-charcoal-light/60" />
          <h3 className="font-bold text-sm text-charcoal">
            {isKn ? "ಯಾವುದೇ ತಾಣಗಳು ಕಂಡುಬಂದಿಲ್ಲ" : "No Attractions Match Your Filters"}
          </h3>
          <p className="text-xs text-charcoal-light max-w-sm mx-auto">
            {isKn
              ? "ದಯವಿಟ್ಟು ನಿಮ್ಮ ಹುಡುಕಾಟ ಪದ ಅಥವಾ ಫಿಲ್ಟರ್‌ಗಳನ್ನು ಬದಲಾಯಿಸಿ ಪ್ರಯತ್ನಿಸಿ."
              : "Try adjusting your search query, administrative division, or category filter."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAttractions.map((attraction) => {
            const isSaved = savedPlaces.includes(attraction.id);
            const districtObj = KARNATAKA_DISTRICTS.find((d) => d.id === attraction.districtId);

            return (
              <div
                key={attraction.id}
                onClick={() => setSelectedAttraction(attraction)}
                className="group relative rounded-2xl border border-border/80 bg-white overflow-hidden shadow-subtle hover:shadow-elevation transition-all duration-300 hover:-translate-y-1 cursor-pointer flex flex-col justify-between"
              >
                <div>
                  {/* Image container */}
                  <div className="relative h-48 w-full bg-forest-dark overflow-hidden">
                    <Image
                      src={attraction.image}
                      alt={isKn ? attraction.nameKn : attraction.nameEn}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                    {/* Top badging */}
                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                      <span className="px-2.5 py-1 rounded-md bg-black/60 backdrop-blur-md text-[11px] font-mono font-bold text-white border border-white/20">
                        {isKn ? districtObj?.nameKn : districtObj?.nameEn}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => handleToggleSave(attraction.id, e)}
                        className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center transition-colors backdrop-blur-md",
                          isSaved
                            ? "bg-gold-dark text-white shadow-md"
                            : "bg-black/50 text-white/80 hover:bg-black/80 hover:text-white"
                        )}
                        aria-label="Save attraction"
                      >
                        {isSaved ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
                      </button>
                    </div>

                    {/* Bottom image overlay info */}
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-white/90 font-mono">
                      <span className="flex items-center gap-1">
                        <Mountain size={13} className="text-emerald-400" />
                        <span>{attraction.elevationMeters ? `${attraction.elevationMeters}m ASL` : "Lowland"}</span>
                      </span>
                      <span className="text-[11px] bg-white/20 px-2 py-0.5 rounded backdrop-blur-sm text-ivory">
                        {isKn ? attraction.categoryLabelKn : attraction.categoryLabelEn}
                      </span>
                    </div>
                  </div>

                  {/* Body Info */}
                  <div className="p-5 space-y-3">
                    <h3 className="font-serif text-lg font-bold text-charcoal group-hover:text-forest transition-colors leading-snug">
                      {isKn ? attraction.nameKn : attraction.nameEn}
                    </h3>
                    <p className="text-xs text-charcoal-light leading-relaxed line-clamp-2">
                      {isKn ? attraction.shortDescKn : attraction.shortDescEn}
                    </p>

                    {/* Highlights pills */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {(isKn ? attraction.highlightsKn : attraction.highlightsEn).slice(0, 2).map((h, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded bg-forest/5 text-forest text-[11px] font-mono border border-forest/15 truncate max-w-full"
                        >
                          {h}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="p-3.5 border-t border-border/60 bg-ivory-warm/20 flex items-center justify-between text-xs font-mono">
                  <span className="text-charcoal-light flex items-center gap-1">
                    <ShieldCheck size={13} className="text-forest shrink-0" />
                    <span className="truncate max-w-[120px]">{attraction.verifiedSource.split("/")[0]}</span>
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setAddToTripAttraction(attraction);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-forest/10 hover:bg-forest/20 text-forest text-[11px] font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <PlusCircle size={12} />
                      <span>{isKn ? "ಸೇರಿಸಿ" : "Add"}</span>
                    </button>
                    <Link
                      href={`/app/attractions/${attraction.id}`}
                      onClick={(e) => e.stopPropagation()}
                      className="text-forest hover:text-forest-dark font-semibold flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform"
                      title={isKn ? "ಪೂರ್ಣ ವಿವರಗಳು" : "Full Details"}
                    >
                      <span className="text-[11px] font-sans sm:inline hidden">{isKn ? "ವಿವರ" : "Details"}</span>
                      <ChevronRight size={14} />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Attraction Details Modal */}
      {selectedAttraction && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setSelectedAttraction(null)}
        >
          <div
            className="relative w-full max-w-2xl rounded-2xl bg-white shadow-2xl border border-border overflow-hidden max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Image Header */}
            <div className="relative h-60 w-full bg-forest-dark shrink-0">
              <Image
                src={selectedAttraction.image}
                alt={isKn ? selectedAttraction.nameKn : selectedAttraction.nameEn}
                fill
                className="object-cover opacity-90"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />

              <button
                type="button"
                onClick={() => setSelectedAttraction(null)}
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black transition-colors"
                aria-label="Close modal"
              >
                <X size={18} />
              </button>

              <div className="absolute bottom-4 left-6 right-6 text-white space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded bg-emerald-500 text-forest-dark text-[11px] font-mono font-bold">
                    {isKn ? selectedAttraction.categoryLabelKn : selectedAttraction.categoryLabelEn}
                  </span>
                  <span className="text-xs font-mono text-ivory/80">
                    {KARNATAKA_DISTRICTS.find((d) => d.id === selectedAttraction.districtId)?.nameEn} District
                  </span>
                </div>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white leading-tight">
                  {isKn ? selectedAttraction.nameKn : selectedAttraction.nameEn}
                </h2>
              </div>
            </div>

            {/* Modal Body Content */}
            <div className="p-6 overflow-y-auto space-y-6 text-charcoal">
              {/* Description */}
              <p className="text-sm leading-relaxed text-charcoal-light">
                {isKn ? selectedAttraction.shortDescKn : selectedAttraction.shortDescEn}
              </p>

              {/* 4 Metadata Cards */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-xl bg-ivory-warm/60 border border-border space-y-1">
                  <span className="text-[11px] font-mono text-charcoal-light uppercase flex items-center gap-1">
                    <Coins size={13} className="text-gold-dark" />
                    <span>{isKn ? "ಪ್ರವೇಶ ಶುಲ್ಕ" : "Entry Fee"}</span>
                  </span>
                  <p className="font-semibold text-charcoal">
                    {isKn ? selectedAttraction.entryFeeKn : selectedAttraction.entryFeeEn}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-ivory-warm/60 border border-border space-y-1">
                  <span className="text-[11px] font-mono text-charcoal-light uppercase flex items-center gap-1">
                    <Clock size={13} className="text-forest" />
                    <span>{isKn ? "ಸಮಯ" : "Visiting Hours"}</span>
                  </span>
                  <p className="font-semibold text-charcoal">
                    {isKn ? selectedAttraction.timingKn : selectedAttraction.timingEn}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-ivory-warm/60 border border-border space-y-1">
                  <span className="text-[11px] font-mono text-charcoal-light uppercase flex items-center gap-1">
                    <Calendar size={13} className="text-forest" />
                    <span>{isKn ? "ಸೂಕ್ತ ಕಾಲ" : "Best Season"}</span>
                  </span>
                  <p className="font-semibold text-charcoal">
                    {isKn ? selectedAttraction.bestSeasonKn : selectedAttraction.bestSeasonEn}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-ivory-warm/60 border border-border space-y-1">
                  <span className="text-[11px] font-mono text-charcoal-light uppercase flex items-center gap-1">
                    <Mountain size={13} className="text-forest" />
                    <span>{isKn ? "ಹಿರಿಯರ ಪ್ರವೇಶಾವಕಾಶ" : "Senior Mobility"}</span>
                  </span>
                  <p className="font-semibold text-charcoal">
                    {isKn ? selectedAttraction.seniorAccessibilityLabelKn : selectedAttraction.seniorAccessibilityLabelEn}
                  </p>
                </div>
              </div>

              {/* Highlights */}
              <div className="space-y-2">
                <h4 className="text-xs font-mono uppercase tracking-wider text-charcoal-light font-bold">
                  {isKn ? "ಪ್ರಮುಖ ಆಕರ್ಷಣೆಗಳು" : "Verified Highlights"}:
                </h4>
                <div className="space-y-1.5">
                  {(isKn ? selectedAttraction.highlightsKn : selectedAttraction.highlightsEn).map((h, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-charcoal bg-forest/5 p-2 rounded-lg border border-forest/10">
                      <Sparkles size={14} className="text-forest shrink-0" />
                      <span>{h}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Coordinates & Provenance */}
              <div className="p-3.5 rounded-xl bg-ivory-warm/40 border border-border flex items-start gap-2.5 text-xs text-charcoal-light font-mono">
                <ShieldCheck size={16} className="text-forest shrink-0 mt-0.5" />
                <div>
                  <p className="text-charcoal font-semibold">
                    Institutional Record: {selectedAttraction.verifiedSource}
                  </p>
                  <p className="text-[11px] text-charcoal-light mt-0.5">
                    WGS84 Coordinates: {selectedAttraction.lat.toFixed(4)}°N, {selectedAttraction.lng.toFixed(4)}°E
                    {selectedAttraction.elevationMeters ? ` • Altitude: ${selectedAttraction.elevationMeters}m ASL` : ""}
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Actions Footer */}
            <div className="p-4 border-t border-border bg-ivory-warm/30 flex items-center justify-between gap-3 shrink-0">
              <button
                type="button"
                onClick={(e) => handleToggleSave(selectedAttraction.id, e)}
                className={cn(
                  "inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-semibold transition-colors",
                  savedPlaces.includes(selectedAttraction.id)
                    ? "bg-gold-dark text-white border-gold-dark"
                    : "bg-white text-charcoal border-border hover:bg-ivory-warm"
                )}
              >
                {savedPlaces.includes(selectedAttraction.id) ? (
                  <>
                    <BookmarkCheck size={15} />
                    <span>{isKn ? "ಉಳಿಸಲಾಗಿದೆ" : "Saved"}</span>
                  </>
                ) : (
                  <>
                    <Bookmark size={15} />
                    <span>{isKn ? "ಉಳಿಸಿ" : "Save Place"}</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setAddToTripAttraction(selectedAttraction);
                }}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-forest text-white hover:bg-forest-dark text-xs font-bold transition-all shadow-subtle cursor-pointer"
              >
                <PlusCircle size={15} />
                <span>{isKn ? "ಪ್ರವಾಸಕ್ಕೆ ಸೇರಿಸಿ" : "Add to Trip"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add To Trip Day Selector Modal */}
      <AddToTripModal
        attraction={addToTripAttraction}
        isOpen={!!addToTripAttraction}
        onClose={() => setAddToTripAttraction(null)}
        onSuccess={(msg) => {
          setToastNotification(msg);
          setSelectedAttraction(null);
        }}
      />

      {/* Toast Notification */}
      {toastNotification && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-forest text-white text-xs font-medium shadow-2xl border border-white/20 animate-fade-in">
          <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
          <span>{toastNotification}</span>
          <button
            type="button"
            onClick={() => router.push("/app/planner")}
            className="ml-2 px-2.5 py-1 rounded-md bg-white/15 hover:bg-white/25 text-white font-bold transition-colors cursor-pointer"
          >
            {isKn ? "ಪ್ಲಾನರ್ ನೋಡಿ" : "View"}
          </button>
          <button
            type="button"
            onClick={() => setToastNotification(null)}
            className="p-1 rounded-md text-white/70 hover:text-white"
            aria-label="Dismiss notification"
          >
            <X size={13} />
          </button>
        </div>
      )}
    </div>
  );
}
