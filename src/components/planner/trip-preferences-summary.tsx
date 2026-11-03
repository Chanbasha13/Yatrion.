"use client";

import { useState } from "react";
import {
  CheckCircle2,
  MapPin,
  Calendar,
  Clock,
  Wallet,
  Users,
  Car,
  Compass,
  Edit3,
  Copy,
  Check,
  Sparkles,
} from "lucide-react";
import type { TripPreferences } from "@/lib/planner-types";
import {
  DURATION_OPTIONS,
  BUDGET_OPTIONS,
  INTEREST_OPTIONS,
  TRAVEL_STYLES,
  GROUP_TYPES,
  TRANSPORT_OPTIONS,
} from "@/lib/planner-types";
import { DESTINATIONS } from "@/lib/destinations-data";

interface TripPreferencesSummaryProps {
  preferences: TripPreferences;
  onEdit: () => void;
}

export function TripPreferencesSummary({
  preferences,
  onEdit,
}: TripPreferencesSummaryProps) {
  const [copied, setCopied] = useState(false);

  // Look up labels
  const durationObj = DURATION_OPTIONS.find((d) => d.days === preferences.durationDays);
  const budgetObj = BUDGET_OPTIONS.find((b) => b.id === preferences.budget);
  const styleObj = TRAVEL_STYLES.find((s) => s.id === preferences.travelStyle);
  const groupObj = GROUP_TYPES.find((g) => g.id === preferences.groupType);
  const transportObj = TRANSPORT_OPTIONS.find((t) => t.id === preferences.transport);

  // Look up selected destinations
  const selectedDestinations = DESTINATIONS.filter((d) =>
    preferences.selectedDestinationIds.includes(d.id)
  );

  // Look up selected interests
  const selectedInterests = INTEREST_OPTIONS.filter((i) =>
    preferences.interests.includes(i.id)
  );

  const handleCopySummary = () => {
    const lines = [
      `Yatrion Karnataka Trip Planning Preferences`,
      `-------------------------------------------`,
      `Destination Mode: ${
        preferences.destinationMode === "explore"
          ? "Explore Karnataka (Curated recommendation)"
          : selectedDestinations.map((d) => `${d.name} (${d.kannadaName})`).join(", ")
      }`,
      `Starting Location: ${preferences.startingLocation}`,
      `Duration: ${durationObj?.label} (${durationObj?.subtitle})`,
      preferences.departureDate
        ? `Dates: ${preferences.departureDate} ${
            preferences.returnDate ? `to ${preferences.returnDate}` : ""
          }`
        : `Dates: Flexible dates`,
      `Estimated Total Budget: ${budgetObj?.label}`,
      `Travel Style: ${styleObj?.label}`,
      `Travellers: ${groupObj?.label} (${preferences.travellerCount} person${
        preferences.travellerCount > 1 ? "s" : ""
      })`,
      `Transport: ${transportObj?.label}`,
      `Interests: ${selectedInterests.map((i) => i.label).join(", ")}`,
      `-------------------------------------------`,
      `Ready for Itinerary Engine (Part 5)`,
    ];

    navigator.clipboard?.writeText(lines.join("\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="rounded-[var(--radius-xl)] border border-forest/30 bg-white p-6 sm:p-8 lg:p-10 shadow-card animate-fade-in">
      {/* Top Status Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border">
        <div className="flex items-start gap-3.5">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-forest text-white shrink-0 shadow-subtle">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-forest font-mono">
              <Sparkles size={13} className="text-gold" />
              <span>Preferences Validated &amp; Recorded</span>
            </div>
            <h3 className="font-[family-name:var(--font-playfair)] text-xl sm:text-2xl font-bold text-forest-dark mt-0.5">
              Your Karnataka Journey Blueprint
            </h3>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            type="button"
            onClick={onEdit}
            className="inline-flex items-center gap-1.5 rounded-[var(--radius-md)] border border-border bg-ivory-warm px-3.5 py-2 text-xs font-semibold text-charcoal hover:bg-cream transition-colors cursor-pointer focus-visible:outline-forest"
          >
            <Edit3 size={14} />
            <span>Edit Parameters</span>
          </button>

          <button
            type="button"
            onClick={handleCopySummary}
            className="inline-flex items-center gap-1.5 rounded-[var(--radius-md)] border border-border bg-white px-3.5 py-2 text-xs font-semibold text-charcoal hover:bg-ivory-warm transition-colors cursor-pointer focus-visible:outline-forest"
          >
            {copied ? <Check size={14} className="text-forest" /> : <Copy size={14} />}
            <span>{copied ? "Copied!" : "Copy Summary"}</span>
          </button>
        </div>
      </div>

      {/* Part 5 Integration Notice */}
      <div className="mt-6 p-4 rounded-[var(--radius-md)] bg-ivory-warm border border-gold/30">
        <p className="text-xs sm:text-sm text-charcoal leading-relaxed">
          <strong className="text-forest font-semibold">Engine Integration Note: </strong>
          These typed preferences have been structured and validated for the Part 5 itinerary engine. In the next phase, Yatrion will synthesize this data into day-by-day schedules, route-optimized transit recommendations, and verified cultural stops.
        </p>
      </div>

      {/* Detailed Parameters Grid */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
        {/* Destination Scope */}
        <div className="p-5 rounded-[var(--radius-lg)] border border-border bg-ivory/40">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-charcoal-muted mb-2 font-mono">
            <Compass size={14} className="text-forest" />
            <span>Destination Scope</span>
          </div>
          {preferences.destinationMode === "explore" ? (
            <div>
              <p className="font-[family-name:var(--font-playfair)] text-base sm:text-lg font-bold text-forest-dark">
                Explore Karnataka (Planner Curated)
              </p>
              <p className="text-xs text-charcoal-muted mt-1 leading-relaxed">
                Yatrion will automatically select optimal destinations based on your duration and chosen interests.
              </p>
            </div>
          ) : (
            <div>
              <p className="text-xs text-charcoal-muted mb-1.5">
                {selectedDestinations.length} destination{selectedDestinations.length > 1 ? "s" : ""} selected:
              </p>
              <div className="flex flex-wrap gap-1.5">
                {selectedDestinations.map((dest) => (
                  <span
                    key={dest.id}
                    className="inline-flex items-center gap-1 rounded-[var(--radius-sm)] bg-forest/10 px-2.5 py-1 text-xs font-medium text-forest"
                  >
                    <span>{dest.name}</span>
                    <span className="text-[11px] text-charcoal-muted">({dest.kannadaName})</span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Departure & Transit Route */}
        <div className="p-5 rounded-[var(--radius-lg)] border border-border bg-ivory/40">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-charcoal-muted mb-2 font-mono">
            <MapPin size={14} className="text-forest" />
            <span>Starting Point &amp; Mode</span>
          </div>
          <p className="font-[family-name:var(--font-playfair)] text-base sm:text-lg font-bold text-forest-dark">
            Origin: {preferences.startingLocation}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-charcoal">
            <span className="inline-flex items-center gap-1">
              <Car size={13} className="text-forest" />
              <span>{transportObj?.label}</span>
            </span>
            <span className="text-charcoal-muted font-light">({transportObj?.hint})</span>
          </div>
        </div>

        {/* Duration & Dates */}
        <div className="p-5 rounded-[var(--radius-lg)] border border-border bg-ivory/40">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-charcoal-muted mb-2 font-mono">
            <Clock size={14} className="text-forest" />
            <span>Duration &amp; Timeline</span>
          </div>
          <p className="font-[family-name:var(--font-playfair)] text-base sm:text-lg font-bold text-forest-dark">
            {durationObj?.label} · {durationObj?.subtitle}
          </p>
          <div className="mt-1 flex items-center gap-1.5 text-xs text-charcoal-muted">
            <Calendar size={13} className="text-forest shrink-0" />
            <span>
              {preferences.departureDate
                ? `Travel window: ${preferences.departureDate} ${
                    preferences.returnDate ? `→ ${preferences.returnDate}` : ""
                  }`
                : "Flexible calendar window (dates not specified)"}
            </span>
          </div>
        </div>

        {/* Budget & Party */}
        <div className="p-5 rounded-[var(--radius-lg)] border border-border bg-ivory/40">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-charcoal-muted mb-2 font-mono">
            <Wallet size={14} className="text-forest" />
            <span>Estimated Budget &amp; Group</span>
          </div>
          <p className="font-[family-name:var(--font-playfair)] text-base sm:text-lg font-bold text-forest-dark">
            {budgetObj?.label}
          </p>
          <div className="mt-1 flex items-center gap-1.5 text-xs text-charcoal-muted">
            <Users size={13} className="text-forest shrink-0" />
            <span>
              {groupObj?.label} ({preferences.travellerCount} traveller{preferences.travellerCount > 1 ? "s" : ""}) · Pace: {styleObj?.label}
            </span>
          </div>
        </div>
      </div>

      {/* Selected Interests Row */}
      <div className="mt-6 pt-5 border-t border-border">
        <p className="text-xs font-bold uppercase tracking-widest text-charcoal-muted mb-3 font-mono">
          Travel Interests &amp; Experience Pillars
        </p>
        <div className="flex flex-wrap gap-2">
          {selectedInterests.map((interest) => (
            <span
              key={interest.id}
              className="inline-flex items-center rounded-full bg-ivory-warm border border-border px-3 py-1 text-xs font-medium text-charcoal"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-gold mr-1.5" />
              {interest.label}
            </span>
          ))}
        </div>
      </div>

      {/* Bottom Confirmation Footer */}
      <div className="mt-8 pt-5 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-charcoal-muted">
        <span>
          Submitted at:{" "}
          <strong className="text-charcoal">
            {preferences.submittedAt || "Saved in application state"}
          </strong>
        </span>
        <button
          type="button"
          onClick={onEdit}
          className="text-xs font-semibold text-forest hover:text-forest-light underline cursor-pointer"
        >
          Modify these preferences
        </button>
      </div>
    </div>
  );
}

