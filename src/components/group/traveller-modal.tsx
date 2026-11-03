"use client";

import { useState, useEffect } from "react";
import { X, Check } from "lucide-react";
import type {
  TravellerProfile,
  TravellerType,
  TravelPace,
  FoodPreference,
  AccessibilityRequirement,
} from "@/lib/group/group-types";
import type { TripInterest } from "@/lib/planner-types";
import { TRIP_INTEREST_LABELS } from "@/lib/group/group-preferences";
import { useLanguage } from "@/lib/i18n";

interface TravellerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (traveller: TravellerProfile) => void;
  initialData?: TravellerProfile | null;
}

const ALL_INTERESTS: TripInterest[] = [
  "heritage",
  "nature",
  "hills",
  "beaches",
  "wildlife",
  "food",
  "adventure",
  "spiritual",
];

export function TravellerModal({
  isOpen,
  onClose,
  onSave,
  initialData,
}: TravellerModalProps) {
  const { isKn } = useLanguage();

  const [name, setName] = useState(initialData?.name || "");
  const [type, setType] = useState<TravellerType>(initialData?.type || "adult");
  const [preferredPace, setPreferredPace] = useState<TravelPace>(
    initialData?.preferredPace || "balanced"
  );
  const [foodPreference, setFoodPreference] = useState<FoodPreference>(
    initialData?.foodPreference || "any"
  );
  const [budgetLimit, setBudgetLimit] = useState<string>(
    initialData?.individualBudgetLimit
      ? initialData.individualBudgetLimit.toString()
      : ""
  );
  const [interests, setInterests] = useState<TripInterest[]>(
    initialData?.interests || ["heritage", "nature"]
  );
  const [accessibility, setAccessibility] = useState<AccessibilityRequirement[]>(
    initialData?.accessibilityRequirements && initialData.accessibilityRequirements.length > 0
      ? initialData.accessibilityRequirements
      : ["none"]
  );
  const [notes, setNotes] = useState(initialData?.notes || "");
  const [error, setError] = useState<string | null>(null);

  // Escape key handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const toggleInterest = (interest: TripInterest) => {
    setInterests((prev) =>
      prev.includes(interest)
        ? prev.length > 1
          ? prev.filter((i) => i !== interest)
          : prev
        : [...prev, interest]
    );
  };

  const toggleAccessibility = (req: AccessibilityRequirement) => {
    if (req === "none") {
      setAccessibility(["none"]);
      return;
    }
    setAccessibility((prev) => {
      const filtered = prev.filter((r) => r !== "none");
      if (filtered.includes(req)) {
        const next = filtered.filter((r) => r !== req);
        return next.length === 0 ? ["none"] : next;
      }
      return [...filtered, req];
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError(isKn ? "ದಯವಿಟ್ಟು ಹೆಸರು ನಮೂದಿಸಿ." : "Please enter a traveller name.");
      return;
    }
    if (interests.length === 0) {
      setError(
        isKn
          ? "ಕನಿಷ್ಠ ಒಂದು ಆಸಕ್ತಿಯನ್ನು ಆಯ್ಕೆಮಾಡಿ."
          : "Please select at least one travel interest."
      );
      return;
    }

    const budgetNum = budgetLimit.trim() ? parseInt(budgetLimit.replace(/[^0-9]/g, ""), 10) : undefined;

    const traveller: TravellerProfile = {
      id: initialData?.id || `trv-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name: name.trim(),
      type,
      preferredPace,
      foodPreference,
      individualBudgetLimit: budgetNum && !isNaN(budgetNum) ? budgetNum : undefined,
      interests,
      accessibilityRequirements: accessibility,
      notes: notes.trim() || undefined,
    };

    onSave(traveller);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="traveller-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-charcoal/60 backdrop-blur-sm animate-fade-in"
    >
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-[var(--radius-xl)] bg-white p-6 sm:p-8 shadow-card border border-border">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-border">
          <h3
            id="traveller-modal-title"
            className="text-lg sm:text-xl font-bold text-forest-dark"
          >
            {initialData
              ? isKn
                ? "ಪ್ರಯಾಣಿಕರ ವಿವರಗಳನ್ನು ಸಂಪಾದಿಸಿ"
                : "Edit Traveller Profile"
              : isKn
              ? "ಹೊಸ ಪ್ರಯಾಣಿಕರನ್ನು ಸೇರಿಸಿ"
              : "Add New Traveller"}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-charcoal-muted hover:text-charcoal hover:bg-ivory-warm transition-colors cursor-pointer"
            aria-label={isKn ? "ಮುಚ್ಚಿ" : "Close"}
          >
            <X size={18} />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-[var(--radius-md)] bg-error/10 border border-error/20 text-xs font-semibold text-error">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-5 text-xs text-charcoal">
          {/* Name & Type */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2 space-y-1.5">
              <label className="font-semibold text-charcoal block">
                {isKn ? "ಹೆಸರು *" : "Traveller Name *"}
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={isKn ? "ಉದಾ: ರಮೇಶ್, ಪ್ರಿಯಾ" : "e.g., Ramesh, Priya"}
                className="w-full px-3.5 py-2.5 rounded-[var(--radius-md)] border border-border bg-ivory-warm/40 text-charcoal text-xs focus:outline-forest"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-charcoal block">
                {isKn ? "ವರ್ಗ" : "Type"}
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as TravellerType)}
                className="w-full px-3 py-2.5 rounded-[var(--radius-md)] border border-border bg-ivory-warm/40 text-charcoal text-xs focus:outline-forest"
              >
                <option value="adult">{isKn ? "ವಯಸ್ಕ (Adult)" : "Adult"}</option>
                <option value="child">{isKn ? "ಮಗು (Child)" : "Child"}</option>
              </select>
            </div>
          </div>

          {/* Preferred Pace & Food Preference */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="font-semibold text-charcoal block">
                {isKn ? "ಆದ್ಯತೆಯ ಪ್ರಯಾಣ ವೇಗ" : "Preferred Travel Pace"}
              </label>
              <select
                value={preferredPace}
                onChange={(e) => setPreferredPace(e.target.value as TravelPace)}
                className="w-full px-3 py-2.5 rounded-[var(--radius-md)] border border-border bg-ivory-warm/40 text-charcoal text-xs focus:outline-forest"
              >
                <option value="relaxed">
                  {isKn ? "ಆರಾಮದಾಯಕ (Relaxed)" : "Relaxed Pace"}
                </option>
                <option value="balanced">
                  {isKn ? "ಸಮತೋಲಿತ (Balanced)" : "Balanced Pace"}
                </option>
                <option value="packed">
                  {isKn ? "ವೇಗದ ಗತಿಯ (Packed)" : "Packed Schedule"}
                </option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-charcoal block">
                {isKn ? "ಆಹಾರ ಆದ್ಯತೆ" : "Food Preference"}
              </label>
              <select
                value={foodPreference}
                onChange={(e) => setFoodPreference(e.target.value as FoodPreference)}
                className="w-full px-3 py-2.5 rounded-[var(--radius-md)] border border-border bg-ivory-warm/40 text-charcoal text-xs focus:outline-forest"
              >
                <option value="any">{isKn ? "ಯಾವುದಾದರೂ (Flexible)" : "Flexible / Any"}</option>
                <option value="veg">{isKn ? "ಶುದ್ಧ ಸಸ್ಯಾಹಾರಿ (Vegetarian)" : "Pure Vegetarian"}</option>
                <option value="jain">{isKn ? "ಜೈನ ಸಸ್ಯಾಹಾರಿ (Jain Veg)" : "Jain Vegetarian"}</option>
                <option value="non-veg">{isKn ? "ಮಾಂಸಾಹಾರಿ (Non-Veg)" : "Non-Vegetarian"}</option>
              </select>
            </div>
          </div>

          {/* Individual Budget Limit */}
          <div className="space-y-1.5">
            <label className="font-semibold text-charcoal block">
              {isKn ? "ವೈಯಕ್ತಿಕ ಗರಿಷ್ಠ ಬಜೆಟ್ ಮಿತಿ (₹ ಐಚ್ಛಿಕ)" : "Individual Budget Limit (₹ Optional)"}
            </label>
            <input
              type="text"
              value={budgetLimit}
              onChange={(e) => setBudgetLimit(e.target.value)}
              placeholder={isKn ? "ಉದಾ: 15000 (ಖಾಲಿ ಬಿಟ್ಟರೆ ಸಮಾನ ಹಂಚಿಕೆ)" : "e.g., 15000 (leave blank for equal share)"}
              className="w-full px-3.5 py-2.5 rounded-[var(--radius-md)] border border-border bg-ivory-warm/40 text-charcoal text-xs focus:outline-forest"
            />
            <p className="text-[11px] text-charcoal-muted">
              {isKn
                ? "ಈ ಪ್ರಯಾಣಿಕರ ಗರಿಷ್ಠ ಖರ್ಚು ಸಾಮರ್ಥ್ಯವನ್ನು ನಮೂದಿಸಿ. ಬಜೆಟ್ ಮಿತಿ ಮೀರಿದರೆ ಎಚ್ಚರಿಕೆ ನೀಡಲಾಗುತ್ತದೆ."
                : "Enter this member's spending ceiling. We flag conflicts if per-person trip cost exceeds this."}
            </p>
          </div>

          {/* Individual Interests (Multi-select) */}
          <div className="space-y-2">
            <label className="font-semibold text-charcoal block">
              {isKn ? "ಪ್ರವಾಸದ ಆಸಕ್ತಿಗಳು (ಒಂದಕ್ಕಿಂತ ಹೆಚ್ಚು ಆಯ್ಕೆಮಾಡಿ) *" : "Travel Interests (Select all that apply) *"}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {ALL_INTERESTS.map((interest) => {
                const isSelected = interests.includes(interest);
                const label = TRIP_INTEREST_LABELS[interest] || {
                  en: interest,
                  kn: interest,
                };
                return (
                  <button
                    key={interest}
                    type="button"
                    onClick={() => toggleInterest(interest)}
                    className={`flex items-center gap-1.5 p-2 rounded-[var(--radius-md)] border text-[11px] font-medium text-left transition-colors cursor-pointer ${
                      isSelected
                        ? "bg-forest/10 border-forest text-forest font-semibold"
                        : "bg-ivory-warm/40 border-border text-charcoal hover:bg-ivory-warm"
                    }`}
                  >
                    <div
                      className={`w-3.5 h-3.5 rounded flex items-center justify-center shrink-0 border ${
                        isSelected
                          ? "bg-forest border-forest text-white"
                          : "border-border bg-white"
                      }`}
                    >
                      {isSelected && <Check size={10} />}
                    </div>
                    <span className="truncate">{isKn ? label.kn : label.en}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Accessibility & Mobility Requirements */}
          <div className="space-y-2">
            <label className="font-semibold text-charcoal block">
              {isKn ? "ಪ್ರವೇಶಸಾಧ್ಯತೆ & ಚಲನಶೀಲತೆ ಅಗತ್ಯತೆಗಳು" : "Accessibility & Mobility Requirements"}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: "none" as AccessibilityRequirement, labelEn: "Standard", labelKn: "ಸಾಮಾನ್ಯ" },
                { id: "step_free" as AccessibilityRequirement, labelEn: "Step-Free Access", labelKn: "ಮೆಟ್ಟಿಲು-ರಹಿತ" },
                { id: "wheelchair" as AccessibilityRequirement, labelEn: "Wheelchair", labelKn: "ವೀಲ್‌ಚೇರ್" },
                { id: "low_walking" as AccessibilityRequirement, labelEn: "Low Walking", labelKn: "ಕಡಿಮೆ ನಡಿಗೆ" },
              ].map((item) => {
                const isSelected = accessibility.includes(item.id);
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => toggleAccessibility(item.id)}
                    className={`p-2 rounded-[var(--radius-md)] border text-[11px] font-medium text-center transition-colors cursor-pointer ${
                      isSelected
                        ? "bg-forest/10 border-forest text-forest font-semibold"
                        : "bg-ivory-warm/40 border-border text-charcoal hover:bg-ivory-warm"
                    }`}
                  >
                    {isKn ? item.labelKn : item.labelEn}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <label className="font-semibold text-charcoal block">
              {isKn ? "ವೈಯಕ್ತಿಕ ಟಿಪ್ಪಣಿಗಳು (ಐಚ್ಛಿಕ)" : "Personal Notes (Optional)"}
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={isKn ? "ಉದಾ: ಬೆಳಗಿನ ಕಾಫಿ ಪ್ರಿಯ, ಛಾಯಾಗ್ರಹಣ ಆಸಕ್ತ..." : "e.g., Morning coffee enthusiast, amateur bird photographer..."}
              className="w-full px-3.5 py-2.5 rounded-[var(--radius-md)] border border-border bg-ivory-warm/40 text-charcoal text-xs focus:outline-forest"
            />
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-[var(--radius-md)] border border-border text-charcoal hover:bg-ivory-warm transition-colors font-medium cursor-pointer"
            >
              {isKn ? "ರದ್ದುಮಾಡಿ" : "Cancel"}
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-[var(--radius-md)] bg-forest text-white hover:bg-forest-light transition-colors font-semibold cursor-pointer shadow-subtle"
            >
              {initialData
                ? isKn
                  ? "ಬದಲಾವಣೆ ಉಳಿಸಿ"
                  : "Save Changes"
                : isKn
                ? "ಪ್ರಯಾಣಿಕರನ್ನು ಸೇರಿಸಿ"
                : "Add Traveller"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
