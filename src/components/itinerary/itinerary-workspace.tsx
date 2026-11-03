"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CalendarDays,
  CalendarPlus,
  Route,
  Coins,
  Activity,
  Compass,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { useAuth } from "@/lib/auth/auth-context";
import { useLanguage } from "@/lib/i18n";
import {
  loadUserTrip,
  saveUserTrip,
  clearUserTrip,
  type StoredTripState,
} from "@/lib/storage/user-trip-service";
import { generateItinerary } from "@/lib/itinerary-engine";
import { GeneratedItineraryView } from "@/components/planner/generated-itinerary";
import type { Destination } from "@/lib/destinations-data";
import { DestinationModal } from "@/components/landing/destination-modal";
import type { TripDurationDays, TripInterest } from "@/lib/planner-types";

export function ItineraryWorkspace() {
  const router = useRouter();
  const { user } = useAuth();
  const { isKn } = useLanguage();

  const [tripState, setTripState] = useState<StoredTripState | null>(() =>
    loadUserTrip(user?.id, user?.isDemo)
  );
  const [modalDestination, setModalDestination] = useState<Destination | null>(null);

  // Cross-workspace event listener
  useEffect(() => {
    const handleUpdate = () => {
      const fresh = loadUserTrip(user?.id, user?.isDemo);
      setTripState(fresh);
    };

    window.addEventListener("yatrion:trip-updated", handleUpdate);
    return () => {
      window.removeEventListener("yatrion:trip-updated", handleUpdate);
    };
  }, [user?.id, user?.isDemo]);

  const handleClearTrip = () => {
    if (
      confirm(
        isKn
          ? "ನೀವು ನಿಜವಾಗಿಯೂ ಈ ಪ್ರಯಾಣ ಪಟ್ಟಿಯನ್ನು ಅಳಿಸಲು ಬಯಸುವಿರಾ?"
          : "Are you sure you want to clear your active itinerary?"
      )
    ) {
      clearUserTrip(user?.id, user?.isDemo);
      setTripState(null);
    }
  };

  const handleRegenerate = () => {
    if (!tripState?.preferences) return;
    const fresh = generateItinerary(tripState.preferences);
    const updated: StoredTripState = {
      ...tripState,
      originalItinerary: fresh,
      editedDays: fresh.days,
      removedStops: {},
      savedAt: new Date().toISOString(),
      syncState: "syncing",
    };
    saveUserTrip(user?.id, user?.isDemo, updated);
    setTripState(updated);
  };

  const handleApplyBlueprint = (blueprintKey: "rainforest" | "citadel" | "coastal") => {
    let days: TripDurationDays = 3;
    let interests: TripInterest[] = ["nature"];
    let startingLocation = "Bengaluru";
    let budgetTier: "under-3k" | "3k-7k" | "7k-15k" | "15k-30k" | "above-30k" = "7k-15k";

    if (blueprintKey === "rainforest") {
      days = 4;
      interests = ["nature", "hills", "wildlife"];
      startingLocation = "Bengaluru";
      budgetTier = "7k-15k";
    } else if (blueprintKey === "citadel") {
      days = 3;
      interests = ["heritage", "nature"];
      startingLocation = "Bengaluru";
      budgetTier = "7k-15k";
    } else if (blueprintKey === "coastal") {
      days = 5;
      interests = ["beaches", "nature", "food"];
      startingLocation = "Mangaluru";
      budgetTier = "15k-30k";
    }

    const seededItin = generateItinerary({
      destinationMode: "explore",
      startingLocation,
      selectedDestinationIds: [],
      durationDays: days,
      interests,
      budget: budgetTier,
      travelStyle: "balanced",
      groupType: "couple",
      travellerCount: 2,
      transport: "self-drive",
    });

    const newTrip: StoredTripState = {
      version: 1,
      savedAt: new Date().toISOString(),
      preferences: {
        destinationMode: "explore",
        startingLocation,
        selectedDestinationIds: [],
        durationDays: days,
        interests,
        budget: budgetTier,
        travelStyle: "balanced",
        groupType: "couple",
        travellerCount: 2,
        transport: "self-drive",
      },
      originalItinerary: seededItin,
      editedDays: seededItin.days,
      removedStops: {},
      dayNotes: {},
      stopNotes: {},
      completedStopKeys: [],
      syncState: "synced",
    };

    saveUserTrip(user?.id, user?.isDemo, newTrip);
    setTripState(newTrip);
  };

  return (
    <div className="space-y-8">
      {/* Workspace Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-3 py-1 rounded-full bg-forest/10 border border-forest/20 text-forest text-xs font-mono font-bold flex items-center gap-1.5">
              <CalendarDays size={13} />
              <span>Workspace • Daily Itinerary Studio</span>
            </span>
            {tripState && (
              <span className="text-xs text-charcoal-light font-mono">
                • {tripState.editedDays.length} {isKn ? "ದಿನಗಳು" : "Days"}
              </span>
            )}
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-charcoal">
            {isKn ? "ದೈನಂದಿನ ವಿವರ ಪ್ರವಾಸ ಪಟ್ಟಿ" : "Daily Itinerary Studio"}
          </h1>
          <p className="text-xs sm:text-sm text-charcoal-light mt-1">
            {isKn
              ? "ನಿಮ್ಮ ದಿನವಾರು ವೇಳಾಪಟ್ಟಿ, ತಾಣಗಳ ನಿರ್ವಹಣೆ, ಪ್ರವಾಸ ಟಿಪ್ಪಣಿಗಳು ಮತ್ತು ನೈಜ-ಸಮಯದ ಪ್ರಗತಿ."
              : "Review and fine-tune day-by-day stops, time slots, travel notes, activity completions, and live cloud sync."}
          </p>
        </div>

        {/* Quick Actions Bar */}
        <div className="flex items-center gap-2.5">
          <Link
            href="/app/planner"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border text-xs font-semibold text-charcoal hover:bg-ivory-warm transition-colors"
          >
            <Compass size={14} className="text-forest" />
            <span>{isKn ? "ಹೊಸ ಸಂರಚನೆ" : "Trip Planner"}</span>
          </Link>

          <Link
            href="/app/routes"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-forest/10 text-forest hover:bg-forest/20 text-xs font-semibold transition-colors"
          >
            <Route size={14} />
            <span>{isKn ? "ಮಾರ್ಗ" : "Routes"}</span>
          </Link>

          <Link
            href="/app/budget"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-forest/10 text-forest hover:bg-forest/20 text-xs font-semibold transition-colors"
          >
            <Coins size={14} />
            <span>{isKn ? "ಬಜೆಟ್" : "Budget"}</span>
          </Link>

          <Link
            href="/app/intelligence"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-forest text-white hover:bg-forest-dark text-xs font-bold transition-all shadow-subtle"
          >
            <Activity size={14} />
            <span>{isKn ? "ಹೊಂದಾಣಿಕೆ" : "Adaptive"}</span>
          </Link>
        </div>
      </div>

      {/* Main Workspace Body */}
      {tripState && tripState.originalItinerary ? (
        <div className="bg-white rounded-2xl border border-border/80 shadow-subtle p-4 sm:p-6 lg:p-8">
          <GeneratedItineraryView
            itinerary={tripState.originalItinerary}
            preferences={tripState.preferences}
            onEditPreferences={() => router.push("/app/planner")}
            onRegenerate={handleRegenerate}
            onExploreDestination={(dest) => setModalDestination(dest)}
            onClearSavedTrip={handleClearTrip}
          />

          {modalDestination && (
            <DestinationModal
              destination={modalDestination}
              onClose={() => setModalDestination(null)}
              onSelectForPlan={() => {
                setModalDestination(null);
                router.push("/app/planner");
              }}
            />
          )}
        </div>
      ) : (
        /* Empty State with Onboarding Blueprints */
        <div className="space-y-8">
          <div className="p-8 sm:p-12 rounded-3xl bg-white border border-border/80 text-center shadow-subtle space-y-4 max-w-2xl mx-auto">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-forest/10 text-forest flex items-center justify-center">
              <CalendarDays size={32} />
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-charcoal">
              {isKn ? "ಸಕ್ರಿಯ ಪ್ರವಾಸ ಪಟ್ಟಿ ಇಲ್ಲ" : "No Active Daily Itinerary"}
            </h2>
            <p className="text-xs sm:text-sm text-charcoal-light leading-relaxed">
              {isKn
                ? "ಸ್ಮಾರ್ಟ್ ಟ್ರಿಪ್ ಪ್ಲಾನರ್ ಮೂಲಕ ನಿಮ್ಮದೇ ಆದ ಕಸ್ಟಮ್ ಪ್ರವಾಸವನ್ನು ವಿನ್ಯಾಸಗೊಳಿಸಿ ಅಥವಾ ಕೆಳಗಿನ ದೃಢೀಕೃತ ಕರ್ನಾಟಕ ಬ್ಲೂಪ್ರಿಂಟ್‌ಗಳಿಂದ ಆರಂಭಿಸಿ."
                : "Create a tailored multi-day itinerary with our deterministic planner engine or instantly activate one of our curated Karnataka starter blueprints."}
            </p>
            <div className="pt-2">
              <Link
                href="/app/planner"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-forest text-white hover:bg-forest-dark text-xs sm:text-sm font-bold shadow-subtle transition-all"
              >
                <CalendarPlus size={16} />
                <span>{isKn ? "ಪ್ಲಾನರ್‌ನಲ್ಲಿ ಪ್ರಾರಂಭಿಸಿ" : "Create New Itinerary"}</span>
              </Link>
            </div>
          </div>

          {/* Starter Blueprints */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-forest" />
              <h3 className="font-serif text-lg sm:text-xl font-bold text-charcoal">
                {isKn ? "ದೃಢೀಕೃತ ಆರಂಭಿಕ ಬ್ಲೂಪ್ರಿಂಟ್‌ಗಳು" : "Curated Starter Blueprints"}
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Blueprint 1 */}
              <div className="group rounded-2xl border border-border/80 bg-white p-6 shadow-subtle hover:shadow-elevation transition-all flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="px-2.5 py-0.5 rounded-full bg-forest/10 text-forest font-semibold">
                      4 Days • Western Ghats
                    </span>
                    <span className="text-charcoal-light">₹7,000 - ₹15,000</span>
                  </div>
                  <h4 className="font-serif text-lg font-bold text-charcoal group-hover:text-forest transition-colors">
                    {isKn ? "ಮಲೆನಾಡು & ಕಾಫಿ ತೋಟಗಳು" : "Western Ghats Rainforest & Coffee"}
                  </h4>
                  <p className="text-xs text-charcoal-light leading-relaxed">
                    Chikmagalur coffee estates, Mullayanagiri trek, and Coorg cloud forests with scenic mountain passes.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleApplyBlueprint("rainforest")}
                  className="mt-5 w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-forest/10 text-forest hover:bg-forest hover:text-white text-xs font-bold transition-all cursor-pointer"
                >
                  <span>{isKn ? "ಈ ಯೋಜನೆಯನ್ನು ಅಳವಡಿಸಿ" : "Activate Blueprint"}</span>
                  <ArrowRight size={13} />
                </button>
              </div>

              {/* Blueprint 2 */}
              <div className="group rounded-2xl border border-border/80 bg-white p-6 shadow-subtle hover:shadow-elevation transition-all flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="px-2.5 py-0.5 rounded-full bg-terracotta/10 text-terracotta font-semibold">
                      3 Days • Deccan
                    </span>
                    <span className="text-charcoal-light">₹7,000 - ₹15,000</span>
                  </div>
                  <h4 className="font-serif text-lg font-bold text-charcoal group-hover:text-terracotta transition-colors">
                    {isKn ? "ದಖ್ಖನ್ ಗ್ರಾನೈಟ್ ಕೋಟೆಗಳು" : "Deccan Granite Citadel & Heritage"}
                  </h4>
                  <p className="text-xs text-charcoal-light leading-relaxed">
                    Hampi monolithic boulders, Tungabhadra riverside architecture, and Badami red sandstone caves.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleApplyBlueprint("citadel")}
                  className="mt-5 w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-terracotta/10 text-terracotta hover:bg-terracotta hover:text-white text-xs font-bold transition-all cursor-pointer"
                >
                  <span>{isKn ? "ಈ ಯೋಜನೆಯನ್ನು ಅಳವಡಿಸಿ" : "Activate Blueprint"}</span>
                  <ArrowRight size={13} />
                </button>
              </div>

              {/* Blueprint 3 */}
              <div className="group rounded-2xl border border-border/80 bg-white p-6 shadow-subtle hover:shadow-elevation transition-all flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="px-2.5 py-0.5 rounded-full bg-gold/15 text-gold-dark font-semibold">
                      5 Days • Karavali
                    </span>
                    <span className="text-charcoal-light">₹15,000 - ₹30,000</span>
                  </div>
                  <h4 className="font-serif text-lg font-bold text-charcoal group-hover:text-gold-dark transition-colors">
                    {isKn ? "ಕರಾವಳಿ ಕಡಲತೀರಗಳು & ಕೊಲ್ಲಿ" : "Karavali Coastal & Estuary Odyssey"}
                  </h4>
                  <p className="text-xs text-charcoal-light leading-relaxed">
                    Gokarna cliff walks, Karwar estuary mangroves, Udupi culinary heritage, and Arabian sea coastlines.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleApplyBlueprint("coastal")}
                  className="mt-5 w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gold/15 text-gold-dark hover:bg-gold-dark hover:text-white text-xs font-bold transition-all cursor-pointer"
                >
                  <span>{isKn ? "ಈ ಯೋಜನೆಯನ್ನು ಅಳವಡಿಸಿ" : "Activate Blueprint"}</span>
                  <ArrowRight size={13} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
