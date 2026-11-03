"use client";

import {
  User,
  Baby,
  Edit2,
  Trash2,
  Clock,
  Wallet,
  Utensils,
  Accessibility,
  Sparkles,
  FileText,
} from "lucide-react";
import type { TravellerProfile } from "@/lib/group/group-types";
import { TRIP_INTEREST_LABELS } from "@/lib/group/group-preferences";
import { useLanguage } from "@/lib/i18n";

interface TravellerCardProps {
  traveller: TravellerProfile;
  onEdit: (traveller: TravellerProfile) => void;
  onRemove: (travellerId: string) => void;
  isOrganizer?: boolean;
}

export function TravellerCard({
  traveller,
  onEdit,
  onRemove,
  isOrganizer = false,
}: TravellerCardProps) {
  const { isKn } = useLanguage();

  const paceLabel = {
    relaxed: isKn ? "ಆರಾಮದಾಯಕ (Relaxed)" : "Relaxed Pace",
    balanced: isKn ? "ಸಮತೋಲಿತ (Balanced)" : "Balanced Pace",
    packed: isKn ? "ವೇಗದ ಗತಿಯ (Packed)" : "Packed Schedule",
  }[traveller.preferredPace || "balanced"];

  const foodLabel = {
    veg: isKn ? "ಸಸ್ಯಾಹಾರಿ (Veg)" : "Vegetarian",
    "non-veg": isKn ? "ಮಾಂಸಾಹಾರಿ (Non-Veg)" : "Non-Vegetarian",
    jain: isKn ? "ಶುದ್ಧ ಜೈನ (Jain Veg)" : "Jain Vegetarian",
    any: isKn ? "ಯಾವುದಾದರೂ (Flexible)" : "Flexible / Any",
  }[traveller.foodPreference || "any"];

  return (
    <div className="rounded-[var(--radius-lg)] border border-border bg-white p-5 shadow-card hover:shadow-hover transition-all flex flex-col justify-between relative group">
      <div>
        {/* Header: Name, Type, and Actions */}
        <div className="flex items-start justify-between gap-3 pb-3 border-b border-border/60">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                traveller.type === "child"
                  ? "bg-terracotta/15 text-terracotta"
                  : "bg-forest/15 text-forest"
              }`}
            >
              {traveller.type === "child" ? (
                <Baby size={18} />
              ) : (
                <User size={18} />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-charcoal text-base">
                  {traveller.name}
                </h4>
                {isOrganizer && (
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-forest text-white font-semibold">
                    {isKn ? "ಆಯೋಜಕ" : "Organizer"}
                  </span>
                )}
              </div>
              <p className="text-xs text-charcoal-muted capitalize">
                {traveller.type === "child"
                  ? isKn
                    ? "ಮಗು (Child)"
                    : "Child Traveller"
                  : isKn
                  ? "ವಯಸ್ಕ (Adult)"
                  : "Adult Traveller"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity">
            <button
              type="button"
              onClick={() => onEdit(traveller)}
              className="p-1.5 rounded-[var(--radius-sm)] text-charcoal-muted hover:text-forest hover:bg-forest/10 transition-colors cursor-pointer"
              aria-label={`Edit ${traveller.name}`}
            >
              <Edit2 size={15} />
            </button>
            {!isOrganizer && (
              <button
                type="button"
                onClick={() => onRemove(traveller.id)}
                className="p-1.5 rounded-[var(--radius-sm)] text-charcoal-muted hover:text-error hover:bg-error/10 transition-colors cursor-pointer"
                aria-label={`Remove ${traveller.name}`}
              >
                <Trash2 size={15} />
              </button>
            )}
          </div>
        </div>

        {/* Specifications grid */}
        <div className="py-3.5 space-y-2 text-xs">
          <div className="flex items-center justify-between text-charcoal-muted">
            <span className="flex items-center gap-1.5">
              <Clock size={13} className="text-forest" />
              <span>{isKn ? "ಪ್ರಯಾಣದ ವೇಗ:" : "Preferred Pace:"}</span>
            </span>
            <span className="font-medium text-charcoal">{paceLabel}</span>
          </div>

          <div className="flex items-center justify-between text-charcoal-muted">
            <span className="flex items-center gap-1.5">
              <Utensils size={13} className="text-forest" />
              <span>{isKn ? "ಆಹಾರ ಆದ್ಯತೆ:" : "Food Preference:"}</span>
            </span>
            <span className="font-medium text-charcoal">{foodLabel}</span>
          </div>

          {typeof traveller.individualBudgetLimit === "number" &&
            traveller.individualBudgetLimit > 0 && (
              <div className="flex items-center justify-between text-charcoal-muted">
                <span className="flex items-center gap-1.5">
                  <Wallet size={13} className="text-gold-dark" />
                  <span>{isKn ? "ವೈಯಕ್ತಿಕ ಬಜೆಟ್ ಮಿತಿ:" : "Budget Limit:"}</span>
                </span>
                <span className="font-mono font-bold text-forest-dark">
                  ₹{traveller.individualBudgetLimit.toLocaleString("en-IN")}
                </span>
              </div>
            )}

          {/* Accessibility Requirements */}
          {traveller.accessibilityRequirements &&
            traveller.accessibilityRequirements.filter((r) => r !== "none")
              .length > 0 && (
              <div className="pt-1 flex items-start gap-1.5 text-xs text-charcoal">
                <Accessibility size={13} className="text-terracotta shrink-0 mt-0.5" />
                <span className="text-[11px] text-charcoal-muted">
                  {isKn ? "ಪ್ರವೇಶಾವಶ್ಯಕತೆ:" : "Accessibility:"}{" "}
                  <strong className="text-charcoal font-medium">
                    {traveller.accessibilityRequirements
                      .filter((r) => r !== "none")
                      .join(", ")}
                  </strong>
                </span>
              </div>
            )}

          {/* Optional notes */}
          {traveller.notes && (
            <div className="pt-1 flex items-start gap-1.5 text-[11px] text-charcoal-muted italic">
              <FileText size={12} className="shrink-0 mt-0.5" />
              <span>&ldquo;{traveller.notes}&rdquo;</span>
            </div>
          )}
        </div>
      </div>

      {/* Interests Pills */}
      <div className="pt-3 border-t border-border/60">
        <div className="flex items-center gap-1 text-[11px] font-semibold text-charcoal-muted mb-2">
          <Sparkles size={12} className="text-forest" />
          <span>{isKn ? "ಆಸಕ್ತಿಗಳು:" : "Interests:"}</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {traveller.interests.map((interest) => {
            const label = TRIP_INTEREST_LABELS[interest] || {
              en: interest,
              kn: interest,
            };
            return (
              <span
                key={interest}
                className="text-[10px] px-2 py-0.5 rounded-full bg-ivory-warm border border-border text-charcoal font-medium"
              >
                {isKn ? label.kn : label.en}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}

