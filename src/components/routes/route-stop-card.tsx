"use client";

import { useState } from "react";
import {
  MapPin,
  ExternalLink,
  Clock,
  ArrowUp,
  ArrowDown,
  Trash2,
  Edit3,
  Sun,
  Sunset,
  Sunrise,
  Check,
  X,
  Compass,
} from "lucide-react";
import type { RouteStop } from "@/lib/routes/route-types";
import { useLanguage } from "@/lib/i18n";

interface RouteStopCardProps {
  stop: RouteStop;
  dayNumber: number;
  index: number;
  totalStops: number;
  isCompleted?: boolean;
  userNote?: string;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onRemove?: () => void;
  onToggleCompleted?: () => void;
  onSaveNote?: (note: string) => void;
}

export function RouteStopCard({
  stop,
  index,
  totalStops,
  isCompleted = false,
  userNote = "",
  onMoveUp,
  onMoveDown,
  onRemove,
  onToggleCompleted,
  onSaveNote,
}: RouteStopCardProps) {
  const { isKn } = useLanguage();
  const [isEditingNote, setIsEditingNote] = useState(false);
  const [noteText, setNoteText] = useState(userNote);

  const handleSave = () => {
    onSaveNote?.(noteText);
    setIsEditingNote(false);
  };

  const handleCancel = () => {
    setNoteText(userNote);
    setIsEditingNote(false);
  };

  // Time of day icon & badge
  const renderTimeBadge = () => {
    switch (stop.timeOfDay) {
      case "morning":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-800 border border-amber-200">
            <Sunrise size={11} className="text-amber-600" />
            <span>{isKn ? "ಬೆಳಗ್ಗೆ" : "Morning"}</span>
          </span>
        );
      case "afternoon":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-800 border border-blue-200">
            <Sun size={11} className="text-blue-600" />
            <span>{isKn ? "ಮಧ್ಯಾಹ್ನ" : "Afternoon"}</span>
          </span>
        );
      case "evening":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-purple-50 px-2 py-0.5 text-[11px] font-semibold text-purple-800 border border-purple-200">
            <Sunset size={11} className="text-purple-600" />
            <span>{isKn ? "ಸಂಜೆ" : "Evening"}</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-charcoal/5 px-2 py-0.5 text-[11px] font-semibold text-charcoal border border-border">
            <Clock size={11} />
            <span>{isKn ? "ಯಾವುದೇ ಸಮಯ" : "Flexible"}</span>
          </span>
        );
    }
  };

  // Activity category badge
  const categoryLabel = () => {
    const map: Record<string, { en: string; kn: string; color: string }> = {
      heritage: { en: "Heritage", kn: "ಪಾರಂಪರಿಕ", color: "bg-amber-100 text-amber-900 border-amber-300" },
      nature: { en: "Nature", kn: "ಪ್ರಕೃತಿ", color: "bg-emerald-100 text-emerald-900 border-emerald-300" },
      cultural: { en: "Cultural", kn: "ಸಾಂಸ್ಕೃತಿಕ", color: "bg-indigo-100 text-indigo-900 border-indigo-300" },
      scenic: { en: "Scenic", kn: "ನಿಸರ್ಗ ರಮಣೀಯ", color: "bg-sky-100 text-sky-900 border-sky-300" },
      adventure: { en: "Adventure", kn: "ಸಾಹಸ", color: "bg-orange-100 text-orange-900 border-orange-300" },
      spiritual: { en: "Spiritual", kn: "ಆಧ್ಯಾತ್ಮಿಕ", color: "bg-rose-100 text-rose-900 border-rose-300" },
      coastal: { en: "Coastal", kn: "ಕರಾವಳಿ", color: "bg-teal-100 text-teal-900 border-teal-300" },
      dining: { en: "Dining", kn: "ಆಹಾರ", color: "bg-yellow-100 text-yellow-900 border-yellow-300" },
    };
    const c = map[stop.activityType] || { en: stop.activityType, kn: stop.activityType, color: "bg-gray-100 text-gray-800 border-gray-200" };
    return (
      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border ${c.color}`}>
        {isKn ? c.kn : c.en}
      </span>
    );
  };

  return (
    <div
      className={`relative rounded-[var(--radius-lg)] border transition-all ${
        isCompleted
          ? "border-forest/40 bg-forest/5 opacity-80"
          : "border-border bg-white shadow-subtle hover:shadow-card"
      } p-4 sm:p-5`}
    >
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        {/* Sequence & Stop Header */}
        <div className="flex items-start gap-3 flex-1 min-w-0">
          {/* Sequence Number / Completion Checkbox */}
          <button
            type="button"
            onClick={onToggleCompleted}
            aria-label={
              isCompleted
                ? isKn
                  ? "ಅಪೂರ್ಣ ಎಂದು ಗುರುತಿಸಿ"
                  : "Mark as incomplete"
                : isKn
                ? "ಪೂರ್ಣಗೊಂಡಿದೆ ಎಂದು ಗುರುತಿಸಿ"
                : "Mark as completed"
            }
            className="mt-0.5 shrink-0 inline-flex items-center justify-center w-7 h-7 rounded-full bg-forest text-white font-mono text-xs font-bold hover:bg-forest-light transition-colors cursor-pointer shadow-subtle"
            title={isKn ? "ಪೂರ್ಣಗೊಂಡ ಸ್ಥಿತಿ ಬದಲಾಯಿಸಿ" : "Toggle stop completion"}
          >
            {isCompleted ? <Check size={14} /> : index + 1}
          </button>

          {/* Stop Details */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              {renderTimeBadge()}
              {categoryLabel()}
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-charcoal-muted font-mono">
                <Clock size={11} />
                <span>
                  ~{stop.estimatedDurationMinutes} {isKn ? "ನಿಮಿಷ" : "mins"}
                </span>
              </span>
            </div>

            <h4
              className={`text-base sm:text-lg font-bold tracking-tight ${
                isCompleted ? "line-through text-charcoal-muted" : "text-forest-dark"
              }`}
            >
              {isKn ? stop.titleKn || stop.title : stop.title}
            </h4>

            {stop.titleKn && stop.titleKn !== stop.title && (
              <p className="text-xs text-forest font-medium font-mono">
                {isKn ? stop.title : stop.titleKn}
              </p>
            )}

            <p className="mt-1.5 text-xs sm:text-sm text-charcoal-muted leading-relaxed">
              {isKn ? stop.descriptionKn || stop.descriptionEn : stop.descriptionEn}
            </p>

            {/* Meal / Rest / Sanctum timing note */}
            {(stop.mealOrRestNoteEn || stop.mealOrRestNoteKn) && (
              <div className="mt-2 inline-flex items-center gap-1.5 rounded-md bg-amber-50/80 border border-amber-200/80 px-2.5 py-1 text-xs text-amber-900">
                <Compass size={12} className="shrink-0 text-amber-700" />
                <span>
                  {isKn
                    ? stop.mealOrRestNoteKn || stop.mealOrRestNoteEn
                    : stop.mealOrRestNoteEn}
                </span>
              </div>
            )}

            {/* Coordinates / Verified Location footnote */}
            <div className="mt-2 flex flex-wrap items-center gap-3 text-[11px] text-charcoal-muted font-mono">
              <span className="inline-flex items-center gap-1">
                <MapPin size={11} className="text-forest" />
                <span>
                  {stop.coordinates.latitude.toFixed(4)}°N, {stop.coordinates.longitude.toFixed(4)}°E
                </span>
              </span>

              {/* Free Google Maps Search Link */}
              <a
                href={stop.googleMapsSearchUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-forest hover:text-forest-light underline cursor-pointer font-sans text-xs"
                title={
                  isKn
                    ? "ಉಚಿತ ಗೂಗಲ್ ಮ್ಯಾಪ್ಸ್‌ನಲ್ಲಿ ವೀಕ್ಷಿಸಿ (ಹೊಸ ಟ್ಯಾಬ್)"
                    : "Search on Google Maps (opens external link in new tab)"
                }
              >
                <span>{isKn ? "ಗೂಗಲ್ ಮ್ಯಾಪ್ಸ್‌ನಲ್ಲಿ ಹುಡುಕಿ" : "Search on Google Maps"}</span>
                <ExternalLink size={11} />
              </a>
            </div>
          </div>
        </div>

        {/* Action Controls (Reorder, Remove, Note) */}
        <div className="flex sm:flex-col items-center justify-end gap-1 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-border no-print">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={onMoveUp}
              disabled={index === 0}
              aria-label={isKn ? "ಮೇಲೆ ಸರಿಸಿ" : "Move stop up"}
              className="p-1.5 rounded-[var(--radius-sm)] border border-border bg-ivory-warm text-charcoal hover:bg-cream disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
              title={isKn ? "ಮೇಲೆ ಸರಿಸಿ" : "Move stop up"}
            >
              <ArrowUp size={13} />
            </button>

            <button
              type="button"
              onClick={onMoveDown}
              disabled={index === totalStops - 1}
              aria-label={isKn ? "ಕೆಳಗೆ ಸರಿಸಿ" : "Move stop down"}
              className="p-1.5 rounded-[var(--radius-sm)] border border-border bg-ivory-warm text-charcoal hover:bg-cream disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
              title={isKn ? "ಕೆಳಗೆ ಸರಿಸಿ" : "Move stop down"}
            >
              <ArrowDown size={13} />
            </button>

            <button
              type="button"
              onClick={() => setIsEditingNote(!isEditingNote)}
              aria-label={isKn ? "ಟಿಪ್ಪಣಿ ಸೇರಿಸಿ/ತಿದ್ದಿ" : "Add/edit note"}
              className={`p-1.5 rounded-[var(--radius-sm)] border transition-colors cursor-pointer ${
                userNote
                  ? "border-forest/40 bg-forest/10 text-forest"
                  : "border-border bg-ivory-warm text-charcoal hover:bg-cream"
              }`}
              title={isKn ? "ವೈಯಕ್ತಿಕ ಟಿಪ್ಪಣಿ" : "Personal stop note"}
            >
              <Edit3 size={13} />
            </button>

            <button
              type="button"
              onClick={onRemove}
              aria-label={isKn ? "ನಿಲುಗಡೆ ತೆಗೆದುಹಾಕಿ" : "Remove stop"}
              className="p-1.5 rounded-[var(--radius-sm)] border border-border/80 bg-white text-error hover:bg-error/5 transition-colors cursor-pointer"
              title={isKn ? "ನಿಲುಗಡೆ ತೆಗೆದುಹಾಕಿ" : "Remove stop"}
            >
              <Trash2 size={13} />
            </button>
          </div>
        </div>
      </div>

      {/* User Note Display & Inline Editor */}
      {userNote && !isEditingNote && (
        <div className="mt-3 p-2.5 rounded-md bg-ivory-warm border border-forest/20 text-xs text-charcoal">
          <span className="font-semibold text-forest mr-1">
            {isKn ? "ನಿಮ್ಮ ಟಿಪ್ಪಣಿ:" : "Note:"}
          </span>
          <span>{userNote}</span>
        </div>
      )}

      {isEditingNote && (
        <div className="mt-3 p-3 rounded-md bg-ivory-warm border border-forest/30 space-y-2 animate-fade-in no-print">
          <label className="block text-xs font-semibold text-forest-dark">
            {isKn ? "ಈ ನಿಲುಗಡೆಗೆ ವೈಯಕ್ತಿಕ ಟಿಪ್ಪಣಿ:" : "Personal note for this stop:"}
          </label>
          <textarea
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            rows={2}
            placeholder={
              isKn
                ? "ಉದಾ: ಮುಂಚಿತವಾಗಿ ಟಿಕೆಟ್ ಕಾಯ್ದಿರಿಸಿ, ಬೆಳಗ್ಗೆ 8 ಗಂಟೆಗೆ ತಲುಪಿ..."
                : "e.g., Pre-book entry tickets, arrive by 8:00 AM..."
            }
            className="w-full rounded-md border border-border p-2 text-xs text-charcoal focus:border-forest focus:outline-none"
          />
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={handleCancel}
              className="inline-flex items-center gap-1 rounded px-2.5 py-1 text-xs text-charcoal hover:bg-cream border border-border cursor-pointer"
            >
              <X size={12} />
              <span>{isKn ? "ರದ್ದು" : "Cancel"}</span>
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="inline-flex items-center gap-1 rounded bg-forest px-3 py-1 text-xs font-semibold text-white hover:bg-forest-light cursor-pointer shadow-subtle"
            >
              <Check size={12} />
              <span>{isKn ? "ಉಳಿಸಿ" : "Save Note"}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
