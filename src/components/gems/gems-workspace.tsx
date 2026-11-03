"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  Gem, 
  BookmarkCheck
} from "lucide-react";
import { useAuth } from "@/lib/auth/auth-context";
import { useLanguage } from "@/lib/i18n";
import { 
  loadUserTrip, 
  saveUserTrip, 
  getUserSavedPlaces, 
  toggleUserSavedPlace,
  type StoredTripState 
} from "@/lib/storage/user-trip-service";
import { DiscoveryExplorer } from "@/components/discovery/discovery-explorer";

export function GemsWorkspace() {
  const { user } = useAuth();
  const { isKn } = useLanguage();

  const [tripState, setTripState] = useState<StoredTripState | null>(() =>
    loadUserTrip(user?.id, user?.isDemo)
  );

  const [savedGemIds, setSavedGemIds] = useState<string[]>(() =>
    getUserSavedPlaces(user?.id)
  );

  const handleToggleSaveGem = (gemId: string) => {
    toggleUserSavedPlace(user?.id, gemId);
    const updatedPlaces = getUserSavedPlaces(user?.id);
    setSavedGemIds(updatedPlaces);

    if (tripState) {
      const updatedTrip = { ...tripState, savedGemIds: updatedPlaces };
      setTripState(updatedTrip);
      saveUserTrip(user?.id, user?.isDemo, updatedTrip);
    }
  };

  const selectedDestinationIds = tripState?.preferences.selectedDestinationIds?.length
    ? tripState.preferences.selectedDestinationIds
    : tripState?.editedDays.map((d) => d.destinationId) || [];

  return (
    <div className="space-y-8">
      {/* Workspace Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-3 py-1 rounded-full bg-terracotta/10 border border-terracotta/20 text-terracotta text-xs font-mono font-bold flex items-center gap-1.5">
              <Gem size={13} />
              <span>Workspace • Hidden Gems Discovery</span>
            </span>
            <span className="text-xs text-charcoal-light font-mono">• 40+ Offbeat Destinations</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-charcoal">
            {isKn ? "ಅಜ್ಞಾತ ರತ್ನಗಳ ಶೋಧಕ" : "Hidden Gems & Offbeat Discovery"}
          </h1>
          <p className="text-xs sm:text-sm text-charcoal-light mt-1">
            {isKn
              ? "ಕಿಕ್ಕಿರಿದ ಪ್ರವಾಸಿ ಗೊಂದಲವಿಲ್ಲದ, ಪರಿಶೀಲಿತ ನೈಸರ್ಗಿಕ ಜಲಪಾತಗಳು, ರಹಸ್ಯ ಕೋಟೆಗಳು ಮತ್ತು ಭೂವೈಜ್ಞಾನಿಕ ವಿಸ್ಮಯಗಳು."
              : "Discover vetted lesser-known Karnataka wonders: secluded waterfalls, ancient stone bastions, volcanic caves, and artisan villages."}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/app/explore"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-forest/10 text-forest hover:bg-forest/20 text-xs font-semibold transition-colors"
          >
            <span>{isKn ? "31 ಜಿಲ್ಲೆಗಳು" : "Explore 31 Districts"}</span>
          </Link>
          <Link
            href="/app/saved"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-forest text-white hover:bg-forest-dark text-xs font-bold transition-all shadow-subtle"
          >
            <BookmarkCheck size={14} />
            <span>{isKn ? "ಉಳಿಸಿದ ತಾಣಗಳು" : "Saved Places"}</span>
          </Link>
        </div>
      </div>

      {/* Discovery Explorer Engine */}
      <div className="bg-white rounded-2xl border border-border/80 shadow-subtle p-6 sm:p-8">
        <DiscoveryExplorer
          preferences={tripState?.preferences || null}
          selectedDestinationIds={selectedDestinationIds}
          savedGemIds={savedGemIds}
          onToggleSaveGem={handleToggleSaveGem}
        />
      </div>
    </div>
  );
}
