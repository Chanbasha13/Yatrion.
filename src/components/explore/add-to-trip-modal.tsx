"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Calendar,
  Clock,
  MapPin,
  Check,
  X,
  Compass,
  PlusCircle,
} from "lucide-react";
import { useAuth } from "@/lib/auth/auth-context";
import { useLanguage } from "@/lib/i18n";
import { loadUserTrip, saveUserTrip } from "@/lib/storage/user-trip-service";
import type { SecularAttraction } from "@/lib/explore/district-data";
import type { ItineraryStop } from "@/lib/itinerary-engine";

interface AddToTripModalProps {
  attraction: SecularAttraction | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (message: string) => void;
}

export function AddToTripModal({
  attraction,
  isOpen,
  onClose,
  onSuccess,
}: AddToTripModalProps) {
  const { user } = useAuth();
  const { isKn } = useLanguage();
  const router = useRouter();

  const [activeTrip, setActiveTrip] = useState(() =>
    typeof window !== "undefined" ? loadUserTrip(user?.id, user?.isDemo) : null
  );

  const [selectedDayNumber, setSelectedDayNumber] = useState<number>(1);
  const [selectedSlot, setSelectedSlot] = useState<"morning" | "afternoon" | "evening">("afternoon");
  const [isAdding, setIsAdding] = useState(false);
  const [addedSuccessfully, setAddedSuccessfully] = useState(false);

  if (!isOpen || !attraction) return null;

  const handleConfirmAdd = () => {
    if (!activeTrip || activeTrip.editedDays.length === 0) {
      router.push("/app/planner");
      onClose();
      return;
    }

    setIsAdding(true);

    const slotTimes = {
      morning: "09:00 AM - 11:30 AM",
      afternoon: "02:00 PM - 04:30 PM",
      evening: "05:00 PM - 07:00 PM",
    };

    const newStop: ItineraryStop = {
      timeOfDay: selectedSlot,
      title: isKn ? attraction.nameKn : attraction.nameEn,
      destinationId: attraction.districtId,
      destinationName: attraction.nameEn,
      destinationKannada: attraction.nameKn,
      location: `${attraction.nameEn}, ${attraction.districtId}`,
      district: attraction.districtId,
      description: isKn ? attraction.shortDescKn : attraction.shortDescEn,
      estimatedDuration: `2 - 3 hours (${slotTimes[selectedSlot]})`,
      activityType: "sightseeing",
      transitNote: attraction.entryFeeEn,
    };

    const targetDayIndex = Math.max(0, Math.min(selectedDayNumber - 1, activeTrip.editedDays.length - 1));
    const updatedDays = activeTrip.editedDays.map((day, idx) => {
      if (idx === targetDayIndex) {
        return {
          ...day,
          stops: [...day.stops, newStop],
        };
      }
      return day;
    });

    const updatedTrip = {
      ...activeTrip,
      editedDays: updatedDays,
      savedAt: new Date().toISOString(),
    };

    saveUserTrip(user?.id, user?.isDemo, updatedTrip);
    setActiveTrip(updatedTrip);
    setIsAdding(false);
    setAddedSuccessfully(true);

    if (onSuccess) {
      onSuccess(
        isKn
          ? `"${attraction.nameKn}" ಅನ್ನು ದಿನ ${selectedDayNumber} ಕ್ಕೆ ಯಶಸ್ವಿಯಾಗಿ ಸೇರಿಸಲಾಗಿದೆ.`
          : `Successfully added "${attraction.nameEn}" to Day ${selectedDayNumber}!`
      );
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-to-trip-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/60 backdrop-blur-xs animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-charcoal/10 overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-charcoal/10 bg-ivory-warm/40">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-forest/10 text-forest">
              <PlusCircle size={18} />
            </span>
            <h2 id="add-to-trip-title" className="font-serif text-lg font-bold text-charcoal">
              {isKn ? "ಪ್ರವಾಸಕ್ಕೆ ತಾಣ ಸೇರಿಸಿ" : "Add Attraction to Trip"}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-charcoal-light hover:text-charcoal hover:bg-black/5 transition-colors"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 text-xs text-charcoal">
          {/* Attraction Preview Pill */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-forest/5 border border-forest/15">
            <div className="relative w-14 h-14 rounded-lg overflow-hidden shrink-0 bg-forest/10">
              <Image
                src={attraction.image}
                alt={attraction.nameEn}
                fill
                className="object-cover"
              />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[10px] uppercase font-mono tracking-wider font-semibold text-forest">
                {isKn ? attraction.categoryLabelKn : attraction.categoryLabelEn}
              </span>
              <h3 className="font-bold text-sm text-charcoal truncate">
                {isKn ? attraction.nameKn : attraction.nameEn}
              </h3>
              <p className="text-[11px] text-charcoal-light flex items-center gap-1 mt-0.5 truncate">
                <MapPin size={12} className="text-terracotta shrink-0" />
                <span>{attraction.districtId} District • {attraction.entryFeeEn}</span>
              </p>
            </div>
          </div>

          {activeTrip && activeTrip.editedDays.length > 0 ? (
            <>
              {/* Trip Context Tag */}
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-400/20 text-amber-900 text-xs">
                <span className="font-mono text-[10px] uppercase tracking-wider block text-amber-700 font-semibold">
                  {isKn ? "ಸಕ್ರಿಯ ಪ್ರವಾಸ" : "Active Journey"}:
                </span>
                <span className="font-serif font-bold text-sm block mt-0.5">
                  {activeTrip.originalItinerary.title}
                </span>
                <span className="text-[11px] text-amber-800 font-mono">
                  {activeTrip.editedDays.length} {isKn ? "ದಿನಗಳು" : "Days"} · {activeTrip.preferences.startingLocation}
                </span>
              </div>

              {/* Day Selection */}
              <div className="space-y-2">
                <label className="block font-semibold text-charcoal flex items-center gap-1.5">
                  <Calendar size={14} className="text-forest" />
                  <span>{isKn ? "ಯಾವ ದಿನಕ್ಕೆ ಸೇರಿಸಬೇಕು?" : "Select Target Day"}:</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {activeTrip.editedDays.map((day, idx) => {
                    const dayNum = idx + 1;
                    const isSelected = selectedDayNumber === dayNum;
                    return (
                      <button
                        key={dayNum}
                        type="button"
                        onClick={() => setSelectedDayNumber(dayNum)}
                        className={`p-2.5 rounded-xl border text-center transition-all ${
                          isSelected
                            ? "bg-forest text-white border-forest shadow-xs font-bold"
                            : "bg-white text-charcoal border-charcoal/15 hover:bg-forest/5 font-medium"
                        }`}
                      >
                        <span className="block text-xs">Day {dayNum}</span>
                        <span className={`text-[10px] font-mono block truncate ${isSelected ? "text-white/80" : "text-charcoal-light"}`}>
                          {day.stops.length} {isKn ? "ತಾಣಗಳು" : "stops"}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Time Slot Selection */}
              <div className="space-y-2">
                <label className="block font-semibold text-charcoal flex items-center gap-1.5">
                  <Clock size={14} className="text-forest" />
                  <span>{isKn ? "ಸಮಯದ ವಿಭಾಗ (Time Slot)" : "Time Slot"}:</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "morning" as const, label: isKn ? "ಬೆಳಿಗ್ಗೆ" : "Morning", time: "9:00 - 11:30 AM" },
                    { id: "afternoon" as const, label: isKn ? "ಮಧ್ಯಾಹ್ನ" : "Afternoon", time: "2:00 - 4:30 PM" },
                    { id: "evening" as const, label: isKn ? "ಸಂಜೆ" : "Evening", time: "5:00 - 7:00 PM" },
                  ].map((slot) => {
                    const isSelected = selectedSlot === slot.id;
                    return (
                      <button
                        key={slot.id}
                        type="button"
                        onClick={() => setSelectedSlot(slot.id)}
                        className={`p-2.5 rounded-xl border text-center transition-all ${
                          isSelected
                            ? "bg-forest text-white border-forest shadow-xs font-bold"
                            : "bg-white text-charcoal border-charcoal/15 hover:bg-forest/5 font-medium"
                        }`}
                      >
                        <span className="block text-xs">{slot.label}</span>
                        <span className={`text-[10px] font-mono block ${isSelected ? "text-white/80" : "text-charcoal-light"}`}>
                          {slot.time}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          ) : (
            <div className="p-4 rounded-xl bg-ivory-warm border border-charcoal/10 text-center space-y-2">
              <Compass size={24} className="mx-auto text-forest" />
              <p className="font-semibold text-charcoal">
                {isKn ? "ಯಾವುದೇ ಸಕ್ರಿಯ ಪ್ರವಾಸವಿಲ್ಲ" : "No Active Journey Yet"}
              </p>
              <p className="text-[11px] text-charcoal-light leading-relaxed">
                {isKn
                  ? "ಈ ತಾಣದೊಂದಿಗೆ ಹೊಸ ಪ್ರವಾಸವನ್ನು ಪ್ರಾರಂಭಿಸಲು ಸ್ಮಾರ್ಟ್ ಪ್ಲಾನರ್‌ಗೆ ಹೋಗಿ."
                  : "Start an optimized itinerary tailored to this destination in the Smart Trip Planner."}
              </p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-charcoal/10 bg-ivory-warm/30 flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-charcoal/15 text-charcoal text-xs font-semibold hover:bg-white transition-colors"
          >
            {isKn ? "ರದ್ದುಮಾಡಿ" : "Cancel"}
          </button>

          {addedSuccessfully ? (
            <button
              type="button"
              onClick={() => {
                onClose();
                router.push("/app/planner");
              }}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-all shadow-xs"
            >
              <Check size={14} />
              <span>{isKn ? "ಪ್ಲಾನರ್‌ನಲ್ಲಿ ನೋಡಿ →" : "View in Planner →"}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleConfirmAdd}
              disabled={isAdding}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-forest text-white text-xs font-bold hover:bg-forest-dark transition-all shadow-xs disabled:opacity-50"
            >
              <PlusCircle size={14} />
              <span>
                {isAdding
                  ? (isKn ? "ಸೇರಿಸಲಾಗುತ್ತಿದೆ..." : "Adding...")
                  : activeTrip
                  ? (isKn ? "ದಿನ " + selectedDayNumber + " ಕ್ಕೆ ಸೇರಿಸಿ" : "Add to Day " + selectedDayNumber)
                  : (isKn ? "ಪ್ಲಾನರ್ ಪ್ರಾರಂಭಿಸಿ" : "Start New Journey")}
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
