"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  Users, 
  Compass, 
  Coins
} from "lucide-react";
import { useAuth } from "@/lib/auth/auth-context";
import { useLanguage } from "@/lib/i18n";
import { loadUserTrip, saveUserTrip, type StoredTripState } from "@/lib/storage/user-trip-service";
import { calculateOptimizedBudget } from "@/lib/budget/budget-optimizer";
import { GroupWorkspace } from "@/components/group/group-workspace";
import type { GroupTripState } from "@/lib/group/group-types";

export function GroupPageWrapper() {
  const { user } = useAuth();
  const { isKn } = useLanguage();

  const [tripState, setTripState] = useState<StoredTripState | null>(() =>
    loadUserTrip(user?.id, user?.isDemo)
  );

  const budgetPlan = tripState?.budgetPlan || (tripState ? calculateOptimizedBudget({
    itinerary: tripState.originalItinerary,
    preferences: tripState.preferences,
    routePlan: tripState.optimizedRoute,
    scenarioKey: "balanced",
    travellerCount: tripState.preferences.travellerCount,
  }) : null);

  const destinationIds = tripState?.preferences.selectedDestinationIds?.length
    ? tripState.preferences.selectedDestinationIds
    : tripState?.editedDays.map((d) => d.destinationId) || [];

  const handleUpdateGroupState = (newGroupState: GroupTripState) => {
    if (!tripState) return;
    const updated = { ...tripState, groupState: newGroupState };
    setTripState(updated);
    saveUserTrip(user?.id, user?.isDemo, updated);
  };

  if (!tripState || !budgetPlan) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-white p-12 text-center space-y-4 max-w-xl mx-auto my-12">
        <div className="w-14 h-14 rounded-2xl bg-forest/10 border border-forest/20 text-forest flex items-center justify-center mx-auto">
          <Users size={28} />
        </div>
        <h2 className="font-serif text-2xl font-bold text-charcoal">
          {isKn ? "ಯಾವುದೇ ಸಕ್ರಿಯ ಗುಂಪು ಪ್ರವಾಸವಿಲ್ಲ" : "No Active Journey for Group Planning"}
        </h2>
        <p className="text-xs sm:text-sm text-charcoal-light leading-relaxed">
          {isKn
            ? "ಗುಂಪು ಸದಸ್ಯರ ಪ್ರೊಫೈಲ್, ಮತದಾನ ಮತ್ತು ಖರ್ಚು ಹಂಚಿಕೆಯನ್ನು ನಿರ್ವಹಿಸಲು ಮೊದಲು ಪ್ರವಾಸವನ್ನು ರಚಿಸಿ."
            : "Create an itinerary in the Smart Trip Planner first to coordinate group preferences, member mobility profiles, and expense splitting."}
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
              <Users size={13} />
              <span>Workspace • Group Collaboration & Expense Engine</span>
            </span>
            <span className="text-xs text-charcoal-light font-mono">• Borda Count Consensus</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-charcoal">
            {isKn ? "ಗುಂಪು ಪ್ರವಾಸ ಮತ್ತು ವೆಚ್ಚ ಹಂಚಿಕೆ" : "Group Trip Planner & Expense Splitter"}
          </h1>
          <p className="text-xs sm:text-sm text-charcoal-light mt-1">
            {isKn
              ? "ಹಿರಿಯರು ಮತ್ತು ಮಕ್ಕಳ ಪ್ರವೇಶಾವಕಾಶ ಮಿತಿಗಳೊಂದಿಗೆ ಗುಂಪಿನ ಎಲ್ಲ ಸದಸ್ಯರ ಒಮ್ಮತ ನಿರ್ಧಾರ ಮತ್ತು ನಿಖರ ಖರ್ಚು ಹಂಚಿಕೆ."
              : "Coordinate multi-traveller parties with Borda count preference voting, accessibility checks, and simplified debt settlement graphs."}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/app/budget"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-forest/10 text-forest hover:bg-forest/20 text-xs font-semibold transition-colors"
          >
            <Coins size={14} />
            <span>{isKn ? "ಬಜೆಟ್" : "Budget Workspace"}</span>
          </Link>
          <Link
            href="/app/adaptive"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-forest text-white hover:bg-forest-dark text-xs font-bold transition-all shadow-subtle"
          >
            <span>{isKn ? "ನೈಜ ಸ್ಥಿತಿ" : "Live Health"}</span>
          </Link>
        </div>
      </div>

      {/* Group Workspace Component */}
      <div className="bg-white rounded-2xl border border-border/80 shadow-subtle p-6 sm:p-8">
        <GroupWorkspace
          destinationIds={destinationIds}
          budgetPlan={budgetPlan}
          initialGroupState={tripState.groupState || null}
          onUpdateGroupState={handleUpdateGroupState}
        />
      </div>
    </div>
  );
}
