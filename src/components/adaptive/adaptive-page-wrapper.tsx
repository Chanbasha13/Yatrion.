"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  Activity, 
  Compass, 
  CloudSun
} from "lucide-react";
import { useAuth } from "@/lib/auth/auth-context";
import { useLanguage } from "@/lib/i18n";
import { loadUserTrip, saveUserTrip, type StoredTripState } from "@/lib/storage/user-trip-service";
import { AdaptiveDashboard } from "@/components/adaptive/adaptive-dashboard";
import type { AdaptiveReplanningProposal } from "@/lib/adaptive";

export function AdaptivePageWrapper() {
  const { user } = useAuth();
  const { isKn } = useLanguage();

  const [tripState, setTripState] = useState<StoredTripState | null>(() =>
    loadUserTrip(user?.id, user?.isDemo)
  );

  const handleApplyProposal = (
    proposal: AdaptiveReplanningProposal,
    selectedRecIds: string[]
  ) => {
    if (!tripState) return;
    const currentAccepted = tripState.acceptedRecommendationIds || [];
    const updated: StoredTripState = {
      ...tripState,
      editedDays: proposal.proposedDays,
      acceptedRecommendationIds: Array.from(
        new Set([...currentAccepted, ...selectedRecIds])
      ),
      savedAt: new Date().toISOString(),
    };
    setTripState(updated);
    saveUserTrip(user?.id, user?.isDemo, updated);
  };

  const handleAcceptRecommendation = (id: string) => {
    if (!tripState) return;
    const current = tripState.acceptedRecommendationIds || [];
    const updated: StoredTripState = {
      ...tripState,
      acceptedRecommendationIds: current.includes(id) ? current : [...current, id],
    };
    setTripState(updated);
    saveUserTrip(user?.id, user?.isDemo, updated);
  };

  const handleRejectRecommendation = (id: string) => {
    if (!tripState) return;
    const current = tripState.rejectedRecommendationIds || [];
    const updated: StoredTripState = {
      ...tripState,
      rejectedRecommendationIds: current.includes(id) ? current : [...current, id],
    };
    setTripState(updated);
    saveUserTrip(user?.id, user?.isDemo, updated);
  };

  if (!tripState) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-white p-12 text-center space-y-4 max-w-xl mx-auto my-12">
        <div className="w-14 h-14 rounded-2xl bg-forest/10 border border-forest/20 text-forest flex items-center justify-center mx-auto">
          <Activity size={28} />
        </div>
        <h2 className="font-serif text-2xl font-bold text-charcoal">
          {isKn ? "ಯಾವುದೇ ಸಕ್ರಿಯ ಪ್ರವಾಸವಿಲ್ಲ" : "No Active Journey to Monitor"}
        </h2>
        <p className="text-xs sm:text-sm text-charcoal-light leading-relaxed">
          {isKn
            ? "ನೈಜ ಹವಾಮಾನ ಮುನ್ಸೂಚನೆ, ರಸ್ತೆ ಅಡೆತಡೆಗಳು ಮತ್ತು ಹೊಂದಾಣಿಕೆಯ ಮಾರ್ಗದರ್ಶನಕ್ಕಾಗಿ ಮೊದಲು ಪ್ರವಾಸವನ್ನು ರಚಿಸಿ."
            : "Generate an itinerary in the Smart Trip Planner first to activate real-time telemetry, rain risk detection, and non-destructive replanning."}
        </p>
        <div className="pt-2">
          <Link
            href="/app/planner"
            className="inline-flex items-center gap-2 rounded-xl bg-forest px-5 py-3 text-xs font-bold text-white hover:bg-forest-dark transition-all shadow-subtle"
          >
            <Compass size={15} />
            <span>{isKn ? "ಪ್ಲಾನರ್‌ಗೆ ಹೋಗಿ" : "Open Trip Planner"}</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Workspace Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-3 py-1 rounded-full bg-forest/10 border border-forest/20 text-forest text-xs font-mono font-bold flex items-center gap-1.5">
              <Activity size={13} />
              <span>Workspace • Adaptive Travel Intelligence</span>
            </span>
            <span className="text-xs text-charcoal-light font-mono">• Zero-Overwrite Guarantee</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-charcoal">
            {isKn ? "ಹೊಂದಾಣಿಕೆಯ ಪ್ರವಾಸ ಕಮಾಂಡ್ ಸೆಂಟರ್" : "Adaptive Travel Command Center"}
          </h1>
          <p className="text-xs sm:text-sm text-charcoal-light mt-1">
            {isKn
              ? "ನೈಜ ಹವಾಮಾನ, ರಸ್ತೆ ತಡೆಗಳು ಮತ್ತು ಸಮಯ ಮಿತಿಗಳನ್ನು ಪರಿಶೀಲಿಸಿ ನಿಮ್ಮ ವೈಯಕ್ತಿಕ ಟಿಪ್ಪಣಿಗಳನ್ನು ಅಳಿಸದೆ ಪರ್ಯಾಯ ಮಾರ್ಗಗಳನ್ನು ನೀಡುತ್ತದೆ."
              : "Monitors live Open-Meteo precipitation and road disruptions to propose non-destructive alternatives without overwriting your notes."}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/app/conditions"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-forest/10 text-forest hover:bg-forest/20 text-xs font-semibold transition-colors"
          >
            <CloudSun size={14} />
            <span>{isKn ? "ಹವಾಮಾನ ವರದಿ" : "Live Weather Telemetry"}</span>
          </Link>
          <Link
            href="/app/routes"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-forest text-white hover:bg-forest-dark text-xs font-bold transition-all shadow-subtle"
          >
            <span>{isKn ? "ಮಾರ್ಗ ಯೋಜನೆ" : "Route Plan"}</span>
          </Link>
        </div>
      </div>

      {/* Adaptive Dashboard Engine */}
      <AdaptiveDashboard
        itinerary={tripState.originalItinerary}
        editedDays={tripState.editedDays}
        preferences={tripState.preferences}
        routePlan={tripState.optimizedRoute}
        budgetPlan={tripState.budgetPlan}
        groupState={tripState.groupState}
        savedGemIds={tripState.savedGemIds || []}
        acceptedRecommendationIds={tripState.acceptedRecommendationIds || []}
        rejectedRecommendationIds={tripState.rejectedRecommendationIds || []}
        completedStopKeys={tripState.completedStopKeys || []}
        dayNotes={tripState.dayNotes || {}}
        stopNotes={tripState.stopNotes || {}}
        onApplyProposal={handleApplyProposal}
        onAcceptRecommendation={handleAcceptRecommendation}
        onRejectRecommendation={handleRejectRecommendation}
      />
    </div>
  );
}
