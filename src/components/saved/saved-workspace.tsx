"use client";

import React, { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { 
  Bookmark, 
  BookmarkCheck, 
  Trash2, 
  Compass, 
  Mountain, 
  PlusCircle, 
  ShieldCheck,
  CheckCircle2,
  X,
} from "lucide-react";
import { useAuth } from "@/lib/auth/auth-context";
import { useLanguage } from "@/lib/i18n";
import { 
  getUserSavedPlaces, 
  toggleUserSavedPlace 
} from "@/lib/storage/user-trip-service";
import { 
  SECULAR_ATTRACTIONS, 
  KARNATAKA_DISTRICTS,
  type SecularAttraction
} from "@/lib/explore/district-data";
import { AddToTripModal } from "@/components/explore/add-to-trip-modal";

export function SavedWorkspace() {
  const { user } = useAuth();
  const { isKn } = useLanguage();

  const [savedIds, setSavedIds] = useState<string[]>(() =>
    getUserSavedPlaces(user?.id)
  );
  const [addToTripAttraction, setAddToTripAttraction] = useState<SecularAttraction | null>(null);
  const [toastNotification, setToastNotification] = useState<string | null>(null);

  // Cross-workspace saved places synchronization
  useEffect(() => {
    const handleUpdate = () => {
      setSavedIds(getUserSavedPlaces(user?.id));
    };
    window.addEventListener("yatrion:saved-places-updated", handleUpdate);
    return () => window.removeEventListener("yatrion:saved-places-updated", handleUpdate);
  }, [user?.id]);

  useEffect(() => {
    if (toastNotification) {
      const timer = setTimeout(() => setToastNotification(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toastNotification]);

  const handleRemove = (id: string) => {
    toggleUserSavedPlace(user?.id, id);
    setSavedIds(getUserSavedPlaces(user?.id));
  };

  const savedAttractions = useMemo(() => {
    return SECULAR_ATTRACTIONS.filter((a) => savedIds.includes(a.id));
  }, [savedIds]);

  return (
    <div className="space-y-8">
      {/* Workspace Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-3 py-1 rounded-full bg-gold-dark/10 border border-gold-dark/20 text-gold-dark text-xs font-mono font-bold flex items-center gap-1.5">
              <BookmarkCheck size={13} />
              <span>Workspace • Saved Places & Bookmarks</span>
            </span>
            <span className="text-xs text-charcoal-light font-mono">• {savedIds.length} Saved</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-charcoal">
            {isKn ? "ಉಳಿಸಿದ ತಾಣಗಳು ಮತ್ತು ರತ್ನಗಳು" : "Saved Places & Curated Highlights"}
          </h1>
          <p className="text-xs sm:text-sm text-charcoal-light mt-1">
            {isKn
              ? "ನಿಮ್ಮ ವೈಯಕ್ತಿಕ ಖಾತೆಗೆ ಉಳಿಸಲಾದ ಜಾತ್ಯತೀತ ತಾಣಗಳು ಮತ್ತು ಅಜ್ಞಾತ ಪ್ರವಾಸಿ ರತ್ನಗಳ ಪಟ್ಟಿ."
              : "Your bookmarked collection of secular waterfalls, coastal cliffs, bastions, and geological wonders."}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/app/explore"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-forest/10 text-forest hover:bg-forest/20 text-xs font-semibold transition-colors"
          >
            <Compass size={14} />
            <span>{isKn ? "ಇನ್ನಷ್ಟು ಅನ್ವೇಷಿಸಿ" : "Explore More"}</span>
          </Link>
          <Link
            href="/app/planner"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-forest text-white hover:bg-forest-dark text-xs font-bold transition-all shadow-subtle"
          >
            <PlusCircle size={14} />
            <span>{isKn ? "ಪ್ರವಾಸ ಪ್ಲಾನರ್" : "Plan Trip"}</span>
          </Link>
        </div>
      </div>

      {/* Saved Places Grid */}
      {savedAttractions.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-white p-12 text-center space-y-4 max-w-xl mx-auto my-8">
          <div className="w-14 h-14 rounded-2xl bg-gold-dark/10 border border-gold-dark/20 text-gold-dark flex items-center justify-center mx-auto">
            <Bookmark size={28} />
          </div>
          <h2 className="font-serif text-xl font-bold text-charcoal">
            {isKn ? "ಇನ್ನೂ ಯಾವುದೇ ತಾಣಗಳನ್ನು ಉಳಿಸಿಲ್ಲ" : "No Saved Places Yet"}
          </h2>
          <p className="text-xs sm:text-sm text-charcoal-light leading-relaxed">
            {isKn
              ? "31 ಜಿಲ್ಲೆಗಳ ಕೋಶ ಅಥವಾ ಅಜ್ಞಾತ ರತ್ನಗಳ ಶೋಧಕಕ್ಕೆ ಭೇಟಿ ನೀಡಿ ಬುಕ್‌ಮಾರ್ಕ್ ಐಕಾನ್ ಕ್ಲಿಕ್ ಮಾಡಿ."
              : "Browse the 31-District Explorer or Hidden Gems finder and click the bookmark button on any attraction to save it to your personal list."}
          </p>
          <div className="pt-2">
            <Link
              href="/app/explore"
              className="inline-flex items-center gap-2 rounded-xl bg-forest px-5 py-3 text-xs font-bold text-white hover:bg-forest-dark transition-all shadow-subtle"
            >
              <Compass size={15} />
              <span>{isKn ? "31 ಜಿಲ್ಲೆಗಳ ಅನ್ವೇಷಣೆ" : "Explore 31 Districts"}</span>
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedAttractions.map((attraction) => {
            const districtObj = KARNATAKA_DISTRICTS.find((d) => d.id === attraction.districtId);

            return (
              <div
                key={attraction.id}
                className="group relative rounded-2xl border border-border/80 bg-white overflow-hidden shadow-subtle hover:shadow-elevation transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-44 w-full bg-forest-dark overflow-hidden">
                    <Image
                      src={attraction.image}
                      alt={isKn ? attraction.nameKn : attraction.nameEn}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                      <span className="px-2.5 py-1 rounded-md bg-black/60 backdrop-blur-md text-[11px] font-mono font-bold text-white border border-white/20">
                        {isKn ? districtObj?.nameKn : districtObj?.nameEn}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemove(attraction.id)}
                        className="w-8 h-8 rounded-full bg-black/60 text-white/80 hover:text-terracotta hover:bg-black/90 transition-colors flex items-center justify-center backdrop-blur-md"
                        title="Remove from saved"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>

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

                  <div className="p-5 space-y-2.5">
                    <h3 className="font-serif text-lg font-bold text-charcoal group-hover:text-forest transition-colors">
                      {isKn ? attraction.nameKn : attraction.nameEn}
                    </h3>
                    <p className="text-xs text-charcoal-light leading-relaxed line-clamp-2">
                      {isKn ? attraction.shortDescKn : attraction.shortDescEn}
                    </p>
                  </div>
                </div>

                <div className="p-3.5 border-t border-border/60 bg-ivory-warm/20 flex items-center justify-between text-xs font-mono">
                  <span className="text-charcoal-light flex items-center gap-1">
                    <ShieldCheck size={13} className="text-forest" />
                    <span>Verified Secular</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setAddToTripAttraction(attraction)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-forest text-white hover:bg-forest-dark text-xs font-bold transition-all shadow-2xs cursor-pointer"
                  >
                    <PlusCircle size={13} />
                    <span>{isKn ? "ಪ್ರವಾಸಕ್ಕೆ ಸೇರಿಸಿ" : "Add to Trip"}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add To Trip Day Selector Modal */}
      <AddToTripModal
        attraction={addToTripAttraction}
        isOpen={!!addToTripAttraction}
        onClose={() => setAddToTripAttraction(null)}
        onSuccess={(msg) => setToastNotification(msg)}
      />

      {/* Toast Notification */}
      {toastNotification && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-forest text-white text-xs font-medium shadow-2xl border border-white/20 animate-fade-in">
          <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
          <span>{toastNotification}</span>
          <Link
            href="/app/planner"
            className="ml-2 px-2.5 py-1 rounded-md bg-white/15 hover:bg-white/25 text-white font-bold transition-colors"
          >
            {isKn ? "ಪ್ಲಾನರ್ ನೋಡಿ" : "View"}
          </Link>
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
