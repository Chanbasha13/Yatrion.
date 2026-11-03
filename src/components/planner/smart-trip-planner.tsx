"use client";

import { useState, useEffect, useId } from "react";
import Image from "next/image";
import {
  Compass,
  MapPin,
  Calendar,
  Check,
  X,
  AlertCircle,
  ArrowRight,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import type { Destination } from "@/lib/destinations-data";
import { DESTINATIONS } from "@/lib/destinations-data";
import type {
  TripPreferences,
  DestinationChoiceMode,
  TripDurationDays,
  BudgetTier,
  TripInterest,
  TravelStyle,
  GroupType,
  TransportPreference,
  PlannerFormErrors,
} from "@/lib/planner-types";
import { GROUP_TYPES } from "@/lib/planner-types";
import { TripPreferencesSummary } from "./trip-preferences-summary";
import { generateItinerary, type GeneratedItinerary } from "@/lib/itinerary-engine";
import { GeneratedItineraryView } from "./generated-itinerary";
import { DestinationModal } from "@/components/landing/destination-modal";
import { loadTripFromStorage, clearTripFromStorage } from "@/lib/trip-storage";
import { useAuth } from "@/lib/auth/auth-context";
import { loadUserTrip } from "@/lib/storage/user-trip-service";
import { useLanguage } from "@/lib/i18n";

interface SmartTripPlannerProps {
  preselectedDestination?: Destination | null;
  onClearPreselectedDestination?: () => void;
  onGenerateTrip?: (preferences: TripPreferences) => void;
}

export function SmartTripPlanner({
  preselectedDestination,
  onClearPreselectedDestination,
  onGenerateTrip,
}: SmartTripPlannerProps) {
  const { t, isKn } = useLanguage();

  // Unique accessible IDs for inputs
  const startingLocationId = useId();
  const departureDateId = useId();
  const returnDateId = useId();

  // Localized Options
  const durationOptions = [
    { days: 1 as const, label: isKn ? "1 ದಿನ" : "1 Day", subtitle: isKn ? "ದಿನದ ಪ್ರವಾಸ" : "Day Excursion" },
    { days: 2 as const, label: isKn ? "2 ದಿನಗಳು" : "2 Days", subtitle: isKn ? "ವಾರಾಂತ್ಯ ಪ್ರವಾಸ" : "Weekend Getaway" },
    { days: 3 as const, label: isKn ? "3 ದಿನಗಳು" : "3 Days", subtitle: isKn ? "ದೀರ್ಘ ವಾರಾಂತ್ಯ" : "Long Weekend" },
    { days: 4 as const, label: isKn ? "4 ದಿನಗಳು" : "4 Days", subtitle: isKn ? "ಕಿರು ಸುತ್ತು" : "Mini Circuit" },
    { days: 5 as const, label: isKn ? "5 ದಿನಗಳು" : "5 Days", subtitle: isKn ? "ಪ್ರಾದೇಶಿಕ ಅನ್ವೇಷಣೆ" : "Regional Discovery" },
    { days: 7 as const, label: isKn ? "7 ದಿನಗಳು" : "7 Days", subtitle: isKn ? "ಮಹಾ ಕರ್ನಾಟಕ ಪಥ" : "Grand Karnataka Trail" },
  ];

  const budgetOptions = [
    {
      id: "under-3k" as const,
      label: isKn ? "₹3,000 ಕ್ಕಿಂತ ಕಡಿಮೆ" : "Under ₹3,000",
      description: isKn ? "ಕಡಿಮೆ ಬಜೆಟ್ · ಸ್ಥಳೀಯ KSRTC ಬಸ್ಸುಗಳು & ಸರಳ ಹೋಮ್‌ಸ್ಟೇ" : "Budget backpacker · Local KSRTC buses & basic homestays",
    },
    {
      id: "3k-7k" as const,
      label: isKn ? "₹3,000 – ₹7,000" : "₹3,000 – ₹7,000",
      description: isKn ? "ಮಧ್ಯಮ ಬಜೆಟ್ · ಎಕ್ಸ್‌ಪ್ರೆಸ್ ರೈಲುಗಳು & ಉತ್ತಮ ಗೆಸ್ಟ್‌ಹೌಸ್" : "Moderate · Express trains & comfortable guesthouses",
    },
    {
      id: "7k-15k" as const,
      label: isKn ? "₹7,000 – ₹15,000" : "₹7,000 – ₹15,000",
      description: isKn ? "ಹಿತಕರ ಬಜೆಟ್ · ಖಾಸಗಿ ಕ್ಯಾಬ್ / ಸ್ವಂತ ವಾಹನ & ಬೊಟಿಕ್ ವಾಸ್ತವ್ಯ" : "Comfort · Private cabs / self-drive & boutique stays",
    },
    {
      id: "15k-30k" as const,
      label: isKn ? "₹15,000 – ₹30,000" : "₹15,000 – ₹30,000",
      description: isKn ? "ಪ್ರೀಮಿಯಂ ಬಜೆಟ್ · ಹೆರಿಟೇಜ್ ರೆಸಾರ್ಟ್‌ಗಳು & ಮಾರ್ಗದರ್ಶಕ ಪ್ರವಾಸ" : "Premium · Heritage estates & guided experiences",
    },
    {
      id: "30k-plus" as const,
      label: isKn ? "₹30,000+" : "₹30,000+",
      description: isKn ? "ಐಷಾರಾಮಿ ಬಜೆಟ್ · ಜಂಗಲ್ ಲಾಡ್ಜಸ್ & ವಿಶೇಷ ಸಫಾರಿಗಳು" : "Luxury · Exclusive jungle lodges & private charters",
    },
    {
      id: "flexible" as const,
      label: isKn ? "ಹೊಂದಿಕೊಳ್ಳುವ ಬಜೆಟ್" : "Flexible Budget",
      description: isKn ? "ಅನುಭವಕ್ಕೆ ಆದ್ಯತೆ · ಪ್ರವಾಸದ ಪ್ರಕಾರ ವೆಚ್ಚ ಲೆಕ್ಕಾಚಾರ" : "Prioritize experiences · Calculate costs based on itinerary",
    },
  ];

  const interestOptions = [
    { id: "heritage" as const, label: isKn ? "ಪರಂಪರೆ ಮತ್ತು ವಾಸ್ತುಶಿಲ್ಪ" : "Heritage & Architecture", desc: isKn ? "ಹಂಪಿ, ಬಾದಾಮಿ, ಪಟ್ಟದಕಲ್ಲು, ಬೇಲೂರು" : "Hampi, Badami, Pattadakal, Belur" },
    { id: "nature" as const, label: isKn ? "ಪ್ರಕೃತಿ ಮತ್ತು ಜಲಪಾತ" : "Nature & Waterfalls", desc: isKn ? "ಜೋಗ ಜಲಪಾತ, ಪಶ್ಚಿಮ ಘಟ್ಟಗಳು, ಶರಾವತಿ" : "Jog Falls, Western Ghats, Sharavathi" },
    { id: "hills" as const, label: isKn ? "ಕಾಫಿ ಗಿರಿಧಾಮಗಳು" : "Hill Stations & Coffee", desc: isKn ? "ಕೊಡಗು, ಚಿಕ್ಕಮಗಳೂರು, ಮುಳ್ಳಯ್ಯನಗಿರಿ" : "Coorg, Chikkamagaluru, Mullayanagiri" },
    { id: "beaches" as const, label: isKn ? "ಕರಾವಳಿ ಮತ್ತು ಕಡಲತೀರಗಳು" : "Beaches & Coastline", desc: isKn ? "ಗೋಕರ್ಣ, ಓಂ ಬೀಚ್, ಉಡುಪಿ, ಮಲ್ಪೆ" : "Gokarna, Om Beach, Udupi, Malpe" },
    { id: "wildlife" as const, label: isKn ? "ವನ್ಯಜೀವಿ ಸಫಾರಿ" : "Wildlife & Safaris", desc: isKn ? "ಬಂಡೀಪುರ, ಕಬಿನಿ, ದಾಂಡೇಲಿ" : "Bandipur, Kabini, Dandeli" },
    { id: "food" as const, label: isKn ? "ಕರ್ನಾಟಕ ಆಹಾರ ಸಂಸ್ಕೃತಿ" : "Culinary & Food Trails", desc: isKn ? "ಉಡುಪಿ ಊಟ, ದಾವಣಗೆರೆ ಬೆಣ್ಣೆ ದೋಸೆ" : "Udupi meals, Davanagere dose, filter coffee" },
    { id: "adventure" as const, label: isKn ? "ಸಾಹಸ ಮತ್ತು ಜಲಕ್ರೀಡೆ" : "Adventure & Outdoors", desc: isKn ? "ದಾಂಡೇಲಿ ರಾಫ್ಟಿಂಗ್, ಪಶ್ಚಿಮ ಘಟ್ಟಗಳ ಟ್ರೆಕ್ಕಿಂಗ್" : "Dandeli rafting, Western Ghats treks" },
    { id: "spiritual" as const, label: isKn ? "ದೇವಾಲಯಗಳು ಮತ್ತು ಪುಣ್ಯಕ್ಷೇತ್ರ" : "Temples & Pilgrimage", desc: isKn ? "ವಿರೂಪಾಕ್ಷ, ಕೃಷ್ಣ ಮಠ, ಮುರುಡೇಶ್ವರ" : "Virupaksha, Krishna Matha, Murudeshwar" },
  ];

  const travelStyles = [
    { id: "relaxed" as const, label: t("planner.paceRelaxed"), desc: t("planner.paceRelaxedDesc") },
    { id: "balanced" as const, label: t("planner.paceBalanced"), desc: t("planner.paceBalancedDesc") },
    { id: "packed" as const, label: t("planner.pacePacked"), desc: t("planner.pacePackedDesc") },
  ];

  const groupTypes = [
    { id: "solo" as const, label: isKn ? "ಏಕವ್ಯಕ್ತಿ (1)" : "Solo (1)" },
    { id: "couple" as const, label: isKn ? "ದಂಪತಿ (2)" : "Couple (2)" },
    { id: "family" as const, label: isKn ? "ಕುಟುಂಬ (3-5)" : "Family (3-5)" },
    { id: "friends" as const, label: isKn ? "ಸ್ನೇಹಿತರು (3-6)" : "Friends (3-6)" },
    { id: "group" as const, label: isKn ? "ತಂಡ (6+)" : "Group (6+)" },
  ];

  const transportOptions = [
    { id: "public" as const, label: isKn ? "ಸಾರ್ವಜನಿಕ ಸಾರಿಗೆ (KSRTC ಮತ್ತು ರೈಲು)" : "Public Transport (Bus/Train)", hint: isKn ? "KSRTC ಐರಾವತ, ರಾಜಹಂಸ ಅಥವಾ ರೈಲುಗಳು" : "KSRTC Airavat, Rajahamsa & Express trains" },
    { id: "self-drive" as const, label: isKn ? "ಸ್ವಂತ ವಾಹನ ಚಾಲನೆ" : "Self-Drive Vehicle", hint: isKn ? "ಸ್ವಂತ ಕಾರು ಅಥವಾ ಬಾಡಿಗೆ ವಾಹನ" : "Personal car or rental for highway flexibility" },
    { id: "taxi" as const, label: isKn ? "ಪ್ರವಾಸಿ ಕ್ಯಾಬ್ / ಟ್ಯಾಕ್ಸಿ" : "Rental Cab / Taxi", hint: isKn ? "ಚಾಲಕನೊಂದಿಗೆ ಮೀಸಲಾದ ಖಾಸಗಿ ವಾಹನ" : "Dedicated outstation taxi with chauffeur" },
    { id: "flexible" as const, label: isKn ? "ಹೊಂದಿಕೊಳ್ಳುವ ವಿಧಾನ" : "Flexible / Recommended", hint: isKn ? "ಪ್ರವಾಸದ ದೂರಕ್ಕೆ ತಕ್ಕಂತೆ ಆಯ್ಕೆ" : "Select optimal mode per destination" },
  ];

  // Form State
  const [destinationMode, setDestinationMode] =
    useState<DestinationChoiceMode>("explore");
  const [selectedDestinationIds, setSelectedDestinationIds] = useState<string[]>([]);
  const [durationDays, setDurationDays] = useState<TripDurationDays>(3);
  const [startingLocation, setStartingLocation] = useState<string>("Bengaluru");
  const [departureDate, setDepartureDate] = useState<string>("");
  const [returnDate, setReturnDate] = useState<string>("");
  const [budget, setBudget] = useState<BudgetTier>("7k-15k");
  const [interests, setInterests] = useState<TripInterest[]>([
    "heritage",
    "nature",
    "food",
  ]);
  const [travelStyle, setTravelStyle] = useState<TravelStyle>("balanced");
  const [groupType, setGroupType] = useState<GroupType>("couple");
  const [travellerCount, setTravellerCount] = useState<number>(2);
  const [transport, setTransport] = useState<TransportPreference>("public");

  // UI / View State
  const [errors, setErrors] = useState<PlannerFormErrors>({});
  const [submittedPreferences, setSubmittedPreferences] =
    useState<TripPreferences | null>(null);
  const [generatedItinerary, setGeneratedItinerary] =
    useState<GeneratedItinerary | null>(null);
  const [modalDestination, setModalDestination] =
    useState<Destination | null>(null);
  const [showBlueprints, setShowBlueprints] = useState<boolean>(false);
  const [prevPreselectedDestId, setPrevPreselectedDestId] = useState<string | undefined>();

  const { user } = useAuth();

  // Hydrate saved trip from user storage safely on client mount
  useEffect(() => {
    const timer = setTimeout(() => {
      let saved = loadUserTrip(user?.id, user?.isDemo);
      if (!saved) {
        saved = loadTripFromStorage();
      }
      if (saved) {
        setSubmittedPreferences(saved.preferences);
        setGeneratedItinerary(saved.originalItinerary);
        // Restore form values so editing preferences is seamless
        setDestinationMode(saved.preferences.destinationMode);
        setSelectedDestinationIds(saved.preferences.selectedDestinationIds);
        setDurationDays(saved.preferences.durationDays);
        setStartingLocation(saved.preferences.startingLocation);
        setDepartureDate(saved.preferences.departureDate || "");
        setReturnDate(saved.preferences.returnDate || "");
        setBudget(saved.preferences.budget);
        setInterests(saved.preferences.interests);
        setTravelStyle(saved.preferences.travelStyle);
        setGroupType(saved.preferences.groupType);
        setTravellerCount(saved.preferences.travellerCount);
        setTransport(saved.preferences.transport);
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [user?.id, user?.isDemo]);

  // If preselected destination changed from parent modal, synchronize during render
  if (preselectedDestination && preselectedDestination.id !== prevPreselectedDestId) {
    setPrevPreselectedDestId(preselectedDestination.id);
    setDestinationMode("preselected");
    setSelectedDestinationIds((prev) =>
      prev.includes(preselectedDestination.id)
        ? prev
        : [preselectedDestination.id, ...prev]
    );
    if (preselectedDestination.durationDays >= 4) {
      setDurationDays(4);
    } else if (preselectedDestination.durationDays <= 2) {
      setDurationDays(2);
    } else {
      setDurationDays(3);
    }
  }

  // Destination toggle handler
  const handleToggleDestination = (id: string) => {
    setSelectedDestinationIds((prev) => {
      const next = prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id];
      if (next.length > 0 && errors.selectedDestinationIds) {
        setErrors((err) => ({ ...err, selectedDestinationIds: undefined }));
      }
      return next;
    });
  };

  // Interest toggle handler
  const handleToggleInterest = (id: TripInterest) => {
    setInterests((prev) => {
      const next = prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id];
      if (next.length > 0 && errors.interests) {
        setErrors((err) => ({ ...err, interests: undefined }));
      }
      return next;
    });
  };

  // Date handlers with safety constraints
  const handleDepartureChange = (newDeparture: string) => {
    setDepartureDate(newDeparture);
    setErrors((prev) => ({ ...prev, departureDate: undefined }));

    // If return date is now before the new departure date, reset return date
    if (returnDate && newDeparture && returnDate < newDeparture) {
      setReturnDate("");
    }
  };

  const handleReturnChange = (newReturn: string) => {
    setReturnDate(newReturn);
    setErrors((prev) => ({ ...prev, returnDate: undefined }));
  };

  // Group type handler
  const handleGroupTypeChange = (gt: GroupType) => {
    setGroupType(gt);
    const matched = GROUP_TYPES.find((g) => g.id === gt);
    if (matched) {
      setTravellerCount(matched.defaultCount);
    }
  };

  // Traveller stepper
  const handleIncrementTravellers = () => {
    setTravellerCount((prev) => Math.min(20, prev + 1));
  };

  const handleDecrementTravellers = () => {
    setTravellerCount((prev) => Math.max(1, prev - 1));
  };

  // Validation & Submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: PlannerFormErrors = {};

    // 1. Starting Location is required
    if (!startingLocation.trim()) {
      newErrors.startingLocation = t("planner.errorStartingLocation");
    }

    // 2. Interests: at least 1 required
    if (interests.length === 0) {
      newErrors.interests = t("planner.errorInterests");
    }

    // 3. Destinations: required if manual choose mode
    if (destinationMode === "choose" && selectedDestinationIds.length === 0) {
      newErrors.selectedDestinationIds = t("planner.errorSelectedDestinations");
    }

    // 4. Date validation
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    if (departureDate && departureDate < todayStr) {
      newErrors.departureDate = t("planner.errorDepartureDate");
    }

    if (departureDate && returnDate && returnDate < departureDate) {
      newErrors.returnDate = t("planner.errorReturnDate");
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      // Smooth scroll to the first error
      const firstErrorKey = Object.keys(newErrors)[0];
      const errorElement = document.getElementById(`planner-error-${firstErrorKey}`);
      if (errorElement) {
        errorElement.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }

    // Clear errors
    setErrors({});

    // Construct valid typed preferences
    const preferences: TripPreferences = {
      destinationMode,
      selectedDestinationIds:
        destinationMode === "explore" ? [] : selectedDestinationIds,
      durationDays,
      startingLocation: startingLocation.trim(),
      departureDate: departureDate || undefined,
      returnDate: returnDate || undefined,
      budget,
      interests,
      travelStyle,
      groupType,
      travellerCount,
      transport,
      submittedAt: new Date().toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    // Save in state
    setSubmittedPreferences(preferences);

    // Generate deterministic multi-day itinerary using Part 5 engine
    const itinerary = generateItinerary(preferences);
    setGeneratedItinerary(itinerary);

    // Call external callback if provided (for Part 5 integration)
    onGenerateTrip?.(preferences);

    // Optional safe URL query sync (without reloading or triggering suspense)
    try {
      const params = new URLSearchParams();
      params.set("origin", preferences.startingLocation);
      params.set("days", String(preferences.durationDays));
      params.set("budget", preferences.budget);
      if (preferences.selectedDestinationIds.length > 0) {
        params.set("destinations", preferences.selectedDestinationIds.join(","));
      }
      const newUrl = `${window.location.pathname}?${params.toString()}#planner`;
      window.history.replaceState(null, "", newUrl);
    } catch {
      // Ignore URL sync failure in restricted sandboxes
    }
  };

  return (
    <section id="planner" className="py-16 sm:py-20 lg:py-24 bg-ivory-warm scroll-mt-16">
      <div className="container-content">
        {/* Section Header */}
        <div className="max-w-3xl mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-gold mb-3 font-mono">
            <Compass size={14} />
            <span>{isKn ? "ಸ್ಮಾರ್ಟ್ ಟ್ರಿಪ್ ಪ್ಲಾನರ್" : "Smart Trip Planner"}</span>
          </div>
          <h2 className="font-[family-name:var(--font-playfair)] text-2xl sm:text-3xl lg:text-4xl font-bold text-forest-dark tracking-tight">
            {isKn ? "ನಿಮ್ಮ ವೈಯಕ್ತಿಕ ಕರ್ನಾಟಕ ಪ್ರವಾಸವನ್ನು ವಿನ್ಯಾಸಗೊಳಿಸಿ" : "Design your personalized Karnataka journey"}
          </h2>
          <p className="mt-3 text-sm sm:text-base text-charcoal-muted leading-relaxed">
            {isKn
              ? "ನಿಮ್ಮ ಆರಂಭಿಕ ಸ್ಥಳ, ಲಭ್ಯವಿರುವ ದಿನಗಳು, ಬಜೆಟ್ ಶ್ರೇಣಿ ಮತ್ತು ಪ್ರಯಾಣ ಶೈಲಿಯನ್ನು ಆರಿಸಿ. ದೃಢೀಕೃತ ಕರ್ನಾಟಕ ತಾಣಗಳು ಮತ್ತು ಸಾಂಸ್ಕೃತಿಕ ವಿವರಗಳೊಂದಿಗೆ ಪೂರ್ಣ ಪ್ರವಾಸ ಯೋಜನೆಯನ್ನು ನಾವು ಸಿದ್ಧಪಡಿಸುತ್ತೇವೆ."
              : "Specify your origin, available days, budget range, and preferred travel pace. We will structure your trip parameters with authentic Karnataka destinations and verified cultural context."}
          </p>
        </div>

        {/* If itinerary is generated, render the complete GeneratedItineraryView */}
        {generatedItinerary ? (
          <div className="space-y-6">
            <GeneratedItineraryView
              itinerary={generatedItinerary}
              preferences={submittedPreferences || undefined}
              onEditPreferences={() => {
                setGeneratedItinerary(null);
                setSubmittedPreferences(null);
              }}
              onRegenerate={() => {
                if (submittedPreferences) {
                  const fresh = generateItinerary(submittedPreferences);
                  setGeneratedItinerary(fresh);
                }
              }}
              onExploreDestination={(dest) => setModalDestination(dest)}
              onClearSavedTrip={() => {
                clearTripFromStorage();
                setGeneratedItinerary(null);
                setSubmittedPreferences(null);
              }}
            />
            {modalDestination && (
              <DestinationModal
                destination={modalDestination}
                onClose={() => setModalDestination(null)}
                onSelectForPlan={(dest) => {
                  setModalDestination(null);
                  setGeneratedItinerary(null);
                  setSubmittedPreferences(null);
                  setDestinationMode("choose");
                  setSelectedDestinationIds((prev) =>
                    prev.includes(dest.id) ? prev : [...prev, dest.id]
                  );
                }}
              />
            )}
          </div>
        ) : submittedPreferences ? (
          <TripPreferencesSummary
            preferences={submittedPreferences}
            onEdit={() => setSubmittedPreferences(null)}
          />
        ) : (
          /* Main Planning Form */
          <form
            onSubmit={handleSubmit}
            noValidate
            className="rounded-[var(--radius-xl)] border border-border bg-white p-6 sm:p-8 lg:p-10 shadow-card space-y-10"
          >
            {/* Validation Error Banner (if errors exist) */}
            {Object.keys(errors).length > 0 && (
              <div
                id="planner-error-summary"
                role="alert"
                className="p-4 rounded-[var(--radius-md)] bg-error/10 border border-error/30 text-error flex items-start gap-3 animate-fade-in"
              >
                <AlertCircle size={20} className="shrink-0 mt-0.5" />
                <div className="text-xs sm:text-sm">
                  <p className="font-semibold">
                    {isKn
                      ? "ದಯವಿಟ್ಟು ಮುಂದುವರಿಯುವ ಮೊದಲು ಈ ಕೆಳಗಿನ ವಿವರಗಳನ್ನು ಸರಿಪಡಿಸಿ:"
                      : "Please correct the following before generating your trip:"}
                  </p>
                  <ul className="list-disc list-inside mt-1 space-y-0.5">
                    {errors.startingLocation && <li>{errors.startingLocation}</li>}
                    {errors.selectedDestinationIds && (
                      <li>{errors.selectedDestinationIds}</li>
                    )}
                    {errors.interests && <li>{errors.interests}</li>}
                    {errors.departureDate && <li>{errors.departureDate}</li>}
                    {errors.returnDate && <li>{errors.returnDate}</li>}
                  </ul>
                </div>
              </div>
            )}

            {/* Preselected Destination Alert Banner */}
            {preselectedDestination && (
              <div className="p-4 rounded-[var(--radius-md)] bg-ivory-warm border border-gold/40 flex items-center justify-between gap-3 animate-fade-in">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-forest text-white shrink-0">
                    <Sparkles size={14} />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-semibold text-forest-dark">
                      {isKn ? "ಮೊದಲೇ ಆಯ್ಕೆಮಾಡಿದ ತಾಣ: " : "Preselected Destination: "}
                      <span className="text-forest underline font-bold">
                        {isKn ? preselectedDestination.kannadaName : preselectedDestination.name}
                      </span>{" "}
                      ({isKn ? preselectedDestination.name : preselectedDestination.kannadaName})
                    </p>
                    <p className="text-[11px] sm:text-xs text-charcoal-muted">
                      {preselectedDestination.region} · {isKn ? "ಜಿಲ್ಲೆ" : "District"}:{" "}
                      {preselectedDestination.district} · {isKn ? "ಸೂಚಿತ ಅವಧಿ" : "Suggested"}:{" "}
                      {preselectedDestination.idealDuration}
                    </p>
                  </div>
                </div>

                {onClearPreselectedDestination && (
                  <button
                    type="button"
                    onClick={() => {
                      onClearPreselectedDestination();
                      setDestinationMode("explore");
                      setSelectedDestinationIds([]);
                    }}
                    className="p-1 rounded text-charcoal-muted hover:text-charcoal cursor-pointer"
                    aria-label={isKn ? "ಮೊದಲೇ ಆಯ್ಕೆಮಾಡಿದ ತಾಣ ತೆಗೆದುಹಾಕಿ" : "Remove preselected destination"}
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            )}

            {/* ── STEP 1: DESTINATION SELECTION ── */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-forest text-white text-xs font-mono font-bold">
                    1
                  </span>
                  <h3 className="font-[family-name:var(--font-playfair)] text-lg sm:text-xl font-bold text-forest-dark">
                    {t("planner.step1Title")}
                  </h3>
                </div>
                <span className="text-xs font-mono uppercase tracking-wider text-charcoal-muted">
                  {t("planner.required")}
                </span>
              </div>

              {/* Destination Mode Segmented Options */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setDestinationMode("explore");
                    setErrors((err) => ({
                      ...err,
                      selectedDestinationIds: undefined,
                    }));
                  }}
                  className={`p-4 rounded-[var(--radius-md)] border text-left transition-all cursor-pointer focus-visible:outline-forest ${
                    destinationMode === "explore"
                      ? "border-forest bg-forest/5 shadow-subtle ring-1 ring-forest/30"
                      : "border-border bg-white hover:bg-ivory-warm"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-charcoal">
                      {t("planner.modeExplore")}
                    </span>
                    {destinationMode === "explore" && (
                      <Check size={16} className="text-forest" />
                    )}
                  </div>
                  <p className="text-xs text-charcoal-muted mt-1 leading-relaxed">
                    {t("planner.modeExploreDesc")}
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setDestinationMode("choose")}
                  className={`p-4 rounded-[var(--radius-md)] border text-left transition-all cursor-pointer focus-visible:outline-forest ${
                    destinationMode === "choose"
                      ? "border-forest bg-forest/5 shadow-subtle ring-1 ring-forest/30"
                      : "border-border bg-white hover:bg-ivory-warm"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-charcoal">
                      {t("planner.modeChoose")}
                    </span>
                    {destinationMode === "choose" && (
                      <Check size={16} className="text-forest" />
                    )}
                  </div>
                  <p className="text-xs text-charcoal-muted mt-1 leading-relaxed">
                    {t("planner.modeChooseDesc")}
                  </p>
                </button>

                {preselectedDestination && (
                  <button
                    type="button"
                    onClick={() => setDestinationMode("preselected")}
                    className={`p-4 rounded-[var(--radius-md)] border text-left transition-all cursor-pointer focus-visible:outline-forest ${
                      destinationMode === "preselected"
                        ? "border-forest bg-forest/5 shadow-subtle ring-1 ring-forest/30"
                        : "border-border bg-white hover:bg-ivory-warm"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-charcoal">
                        {isKn ? `${preselectedDestination.kannadaName} ಬಳಸಿ` : `Use ${preselectedDestination.name}`}
                      </span>
                      {destinationMode === "preselected" && (
                        <Check size={16} className="text-forest" />
                      )}
                    </div>
                    <p className="text-xs text-charcoal-muted mt-1 leading-relaxed">
                      {isKn ? "ತಾಣ ಅನ್ವೇಷಕದಿಂದ ಮೊದಲೇ ಆಯ್ಕೆಮಾಡಲಾಗಿದೆ." : "Preselected from the Destination Explorer modal."}
                    </p>
                  </button>
                )}
              </div>

              {/* Multi-select Destination Grid (Shown when "choose" or "preselected" is active) */}
              {(destinationMode === "choose" ||
                destinationMode === "preselected") && (
                <div
                  id="planner-error-selectedDestinationIds"
                  className="space-y-3 pt-2"
                >
                  <div className="flex items-center justify-between text-xs text-charcoal-muted">
                    <span>
                      {isKn ? "ಸೇರಿಸಲು ತಾಣಗಳನ್ನು ಆಯ್ಕೆಮಾಡಿ" : "Select places to include"} (
                      <strong>{selectedDestinationIds.length}</strong> {isKn ? "ಆಯ್ಕೆಯಾಗಿದೆ" : "selected"}):
                    </span>
                    {selectedDestinationIds.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setSelectedDestinationIds([])}
                        className="text-xs text-forest hover:text-forest-light underline cursor-pointer"
                      >
                        {isKn ? "ಆಯ್ಕೆ ರದ್ದುಮಾಡಿ" : "Clear Selection"}
                      </button>
                    )}
                  </div>

                  {errors.selectedDestinationIds && (
                    <p className="text-xs text-error font-medium">
                      {errors.selectedDestinationIds}
                    </p>
                  )}

                  {/* Destination Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
                    {DESTINATIONS.map((dest) => {
                      const isSelected = selectedDestinationIds.includes(dest.id);
                      return (
                        <button
                          key={dest.id}
                          type="button"
                          onClick={() => handleToggleDestination(dest.id)}
                          className={`relative flex flex-col items-start p-2.5 rounded-[var(--radius-md)] border text-left transition-all cursor-pointer focus-visible:outline-forest ${
                            isSelected
                              ? "border-forest bg-forest text-white shadow-subtle"
                              : "border-border bg-white text-charcoal hover:bg-ivory-warm"
                          }`}
                        >
                          <div className="relative aspect-[16/10] w-full rounded-[var(--radius-sm)] overflow-hidden mb-2 bg-forest-dark">
                            <Image
                              src={dest.image}
                              alt={dest.imageAlt}
                              fill
                              sizes="160px"
                              className="object-cover"
                            />
                            {isSelected && (
                              <div className="absolute inset-0 bg-forest/40 flex items-center justify-center">
                                <Check size={18} className="text-white" />
                              </div>
                            )}
                          </div>
                          <span className="text-xs font-semibold leading-tight line-clamp-1">
                            {isKn ? dest.kannadaName : dest.name}
                          </span>
                          <span
                            className={`text-[10px] mt-0.5 ${
                              isSelected ? "text-gold-light" : "text-charcoal-muted"
                            }`}
                          >
                            {isKn ? dest.name : dest.kannadaName}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* ── STEP 2: TIMELINE & ORIGIN ── */}
            <div className="space-y-5 pt-6 border-t border-border">
              <div className="flex items-center gap-2.5">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-forest text-white text-xs font-mono font-bold">
                  2
                </span>
                <h3 className="font-[family-name:var(--font-playfair)] text-lg sm:text-xl font-bold text-forest-dark">
                  {t("planner.step2Title")}
                </h3>
              </div>

              {/* Starting Location */}
              <div id="planner-error-startingLocation" className="space-y-1.5">
                <label
                  htmlFor={startingLocationId}
                  className="block text-xs font-semibold text-charcoal uppercase tracking-wider font-mono"
                >
                  {t("planner.startingLocationLabel")} <span className="text-error">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-charcoal-muted">
                    <MapPin size={16} />
                  </div>
                  <input
                    id={startingLocationId}
                    type="text"
                    required
                    value={startingLocation}
                    onChange={(e) => {
                      setStartingLocation(e.target.value);
                      if (errors.startingLocation) {
                        setErrors((err) => ({
                          ...err,
                          startingLocation: undefined,
                        }));
                      }
                    }}
                    placeholder={t("planner.startingLocationPlaceholder")}
                    className={`w-full pl-10 pr-4 py-2.5 bg-white border rounded-[var(--radius-md)] text-sm text-charcoal placeholder:text-charcoal-muted/60 focus:outline-none focus:ring-1 transition-colors ${
                      errors.startingLocation
                        ? "border-error focus:border-error focus:ring-error/20"
                        : "border-border focus:border-forest focus:ring-forest/30"
                    }`}
                  />
                </div>
                {errors.startingLocation ? (
                  <p className="text-xs text-error font-medium">
                    {errors.startingLocation}
                  </p>
                ) : (
                  <p className="text-[11px] text-charcoal-muted">
                    {isKn
                      ? "ಪ್ರಯಾಣದ ಸಮಯ ಮತ್ತು ಮಾರ್ಗವನ್ನು ಈ ಆರಂಭಿಕ ಸ್ಥಳದಿಂದ ಲೆಕ್ಕಾಚಾರ ಮಾಡಲಾಗುತ್ತದೆ."
                      : "Route travel times will be estimated from this origin point."}
                  </p>
                )}
              </div>

              {/* Trip Duration Segmented Selector */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-charcoal uppercase tracking-wider font-mono">
                  {t("planner.tripDurationLabel")} <span className="text-error">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                  {durationOptions.map((opt) => {
                    const isSelected = durationDays === opt.days;
                    return (
                      <button
                        key={opt.days}
                        type="button"
                        onClick={() => setDurationDays(opt.days)}
                        className={`py-3 px-2 rounded-[var(--radius-md)] border text-center transition-all cursor-pointer focus-visible:outline-forest ${
                          isSelected
                            ? "border-forest bg-forest text-white shadow-subtle"
                            : "border-border bg-white text-charcoal hover:bg-ivory-warm"
                        }`}
                      >
                        <p className="text-sm font-bold font-[family-name:var(--font-playfair)]">
                          {opt.label}
                        </p>
                        <p
                          className={`text-[10px] mt-0.5 line-clamp-1 ${
                            isSelected ? "text-gold-light" : "text-charcoal-muted"
                          }`}
                        >
                          {opt.subtitle}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Optional Dates Picker */}
              <div className="p-4 rounded-[var(--radius-md)] bg-ivory/50 border border-border space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-charcoal flex items-center gap-1.5">
                    <Calendar size={14} className="text-forest" />
                    <span>
                      {t("planner.departureDateLabel")} &amp; {t("planner.returnDateLabel")} (
                      {isKn ? "ಐಚ್ಛಿಕ" : "Optional"})
                    </span>
                  </span>
                  <span className="text-[11px] text-charcoal-muted">
                    {isKn
                      ? "ದಿನಾಂಕಗಳು ಐಚ್ಛಿಕ · ಕೇವಲ ದಿನಗಳ ಸಂಖ್ಯೆಯಿಂದಲೂ ಪ್ರವಾಸ ಯೋಜನೆ ರಚಿಸಬಹುದು"
                      : "Dates are optional · Duration-only trips are fully supported"}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Departure Date */}
                  <div id="planner-error-departureDate" className="space-y-1">
                    <label
                      htmlFor={departureDateId}
                      className="block text-xs text-charcoal-muted font-medium"
                    >
                      {t("planner.departureDateLabel")}
                    </label>
                    <input
                      id={departureDateId}
                      type="date"
                      value={departureDate}
                      onChange={(e) => handleDepartureChange(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-border rounded-[var(--radius-md)] text-xs text-charcoal focus:outline-none focus:border-forest"
                    />
                    {errors.departureDate && (
                      <p className="text-xs text-error">{errors.departureDate}</p>
                    )}
                  </div>

                  {/* Return Date */}
                  <div id="planner-error-returnDate" className="space-y-1">
                    <label
                      htmlFor={returnDateId}
                      className="block text-xs text-charcoal-muted font-medium"
                    >
                      {t("planner.returnDateLabel")}
                    </label>
                    <input
                      id={returnDateId}
                      type="date"
                      min={departureDate || undefined}
                      value={returnDate}
                      onChange={(e) => handleReturnChange(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-border rounded-[var(--radius-md)] text-xs text-charcoal focus:outline-none focus:border-forest"
                    />
                    {errors.returnDate && (
                      <p className="text-xs text-error">{errors.returnDate}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* ── STEP 3: ESTIMATED TOTAL BUDGET ── */}
            <div className="space-y-4 pt-6 border-t border-border">
              <div className="flex items-center gap-2.5">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-forest text-white text-xs font-mono font-bold">
                  3
                </span>
                <h3 className="font-[family-name:var(--font-playfair)] text-lg sm:text-xl font-bold text-forest-dark">
                  {t("planner.step3Title")}
                </h3>
              </div>

              <p className="text-xs text-charcoal-muted leading-relaxed">
                {t("planner.budgetPerGroupNote")}
              </p>

              {/* Budget Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {budgetOptions.map((b) => {
                  const isSelected = budget === b.id;
                  return (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => setBudget(b.id)}
                      className={`p-3.5 rounded-[var(--radius-md)] border text-left transition-all cursor-pointer focus-visible:outline-forest ${
                        isSelected
                          ? "border-forest bg-forest/5 shadow-subtle ring-1 ring-forest/30"
                          : "border-border bg-white hover:bg-ivory-warm"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-charcoal">
                          {b.label}
                        </span>
                        {isSelected && <Check size={16} className="text-forest" />}
                      </div>
                      <p className="text-xs text-charcoal-muted mt-1 leading-relaxed">
                        {b.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ── STEP 4: INTERESTS & TRAVEL STYLE ── */}
            <div
              id="planner-error-interests"
              className="space-y-5 pt-6 border-t border-border"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-forest text-white text-xs font-mono font-bold">
                    4
                  </span>
                  <h3 className="font-[family-name:var(--font-playfair)] text-lg sm:text-xl font-bold text-forest-dark">
                    {t("planner.step4Title")}
                  </h3>
                </div>
                <span className="text-xs font-mono uppercase tracking-wider text-charcoal-muted">
                  {t("planner.interestsSelectMin")}
                </span>
              </div>

              {errors.interests && (
                <p className="text-xs text-error font-medium">{errors.interests}</p>
              )}

              {/* Multi-select Interest Chips */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                {interestOptions.map((interest) => {
                  const isSelected = interests.includes(interest.id);
                  return (
                    <button
                      key={interest.id}
                      type="button"
                      onClick={() => handleToggleInterest(interest.id)}
                      className={`p-3 rounded-[var(--radius-md)] border text-left transition-all cursor-pointer focus-visible:outline-forest ${
                        isSelected
                          ? "border-forest bg-forest text-white shadow-subtle"
                          : "border-border bg-white text-charcoal hover:bg-ivory-warm"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold leading-tight">
                          {interest.label}
                        </span>
                        {isSelected && (
                          <Check size={14} className="text-gold-light shrink-0 ml-1" />
                        )}
                      </div>
                      <p
                        className={`text-[11px] mt-1 line-clamp-2 leading-relaxed ${
                          isSelected ? "text-ivory/80" : "text-charcoal-muted"
                        }`}
                      >
                        {interest.desc}
                      </p>
                    </button>
                  );
                })}
              </div>

              {/* Travel Style Single Choice */}
              <div className="space-y-2 pt-2">
                <label className="block text-xs font-semibold text-charcoal uppercase tracking-wider font-mono">
                  {isKn ? "ಪ್ರಯಾಣದ ವೇಗ ಮತ್ತು ಶೈಲಿ" : "Travel Pace & Style"}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {travelStyles.map((style) => {
                    const isSelected = travelStyle === style.id;
                    return (
                      <button
                        key={style.id}
                        type="button"
                        onClick={() => setTravelStyle(style.id)}
                        className={`p-3 rounded-[var(--radius-md)] border text-left transition-all cursor-pointer focus-visible:outline-forest ${
                          isSelected
                            ? "border-forest bg-forest/5 shadow-subtle ring-1 ring-forest/30"
                            : "border-border bg-white hover:bg-ivory-warm"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-charcoal">
                            {style.label}
                          </span>
                          {isSelected && <Check size={15} className="text-forest" />}
                        </div>
                        <p className="text-[11px] text-charcoal-muted mt-1 leading-relaxed">
                          {style.desc}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* ── STEP 5: TRAVELLERS & TRANSPORT ── */}
            <div className="space-y-5 pt-6 border-t border-border">
              <div className="flex items-center gap-2.5">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-forest text-white text-xs font-mono font-bold">
                  5
                </span>
                <h3 className="font-[family-name:var(--font-playfair)] text-lg sm:text-xl font-bold text-forest-dark">
                  {t("planner.step5Title")}
                </h3>
              </div>

              {/* Group Type & Number of Travellers */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Group Type */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-charcoal uppercase tracking-wider font-mono">
                    {isKn ? "ಗುಂಪಿನ ವಿಧ" : "Group Type"}
                  </label>
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                    {groupTypes.map((gt) => {
                      const isSelected = groupType === gt.id;
                      return (
                        <button
                          key={gt.id}
                          type="button"
                          onClick={() => handleGroupTypeChange(gt.id)}
                          className={`p-2.5 rounded-[var(--radius-md)] border text-center text-xs font-medium transition-all cursor-pointer focus-visible:outline-forest ${
                            isSelected
                              ? "border-forest bg-forest text-white shadow-subtle"
                              : "border-border bg-white text-charcoal hover:bg-ivory-warm"
                          }`}
                        >
                          {gt.label.split(" ")[0]}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Number of Travellers Stepper */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-charcoal uppercase tracking-wider font-mono">
                    {isKn ? "ಒಟ್ಟು ಪ್ರವಾಸಿಗರು (1 ರಿಂದ 20)" : "Total Travellers (1 to 20)"}
                  </label>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={handleDecrementTravellers}
                      aria-label={isKn ? "ಪ್ರವಾಸಿಗರ ಸಂಖ್ಯೆ ಕಡಿಮೆ ಮಾಡಿ" : "Decrease traveller count"}
                      disabled={travellerCount <= 1}
                      className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] border border-border bg-white text-charcoal hover:bg-ivory-warm disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer focus-visible:outline-forest"
                    >
                      -
                    </button>
                    <div className="flex-1 max-w-[120px] text-center">
                      <span className="text-base font-bold text-forest font-mono">
                        {travellerCount}
                      </span>
                      <span className="text-xs text-charcoal-muted ml-1.5">
                        {isKn
                          ? travellerCount === 1
                            ? "ಪ್ರವಾಸಿ"
                            : "ಪ್ರವಾಸಿಗರು"
                          : travellerCount === 1
                            ? "traveller"
                            : "travellers"}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handleIncrementTravellers}
                      aria-label={isKn ? "ಪ್ರವಾಸಿಗರ ಸಂಖ್ಯೆ ಹೆಚ್ಚಿಸಿ" : "Increase traveller count"}
                      disabled={travellerCount >= 20}
                      className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] border border-border bg-white text-charcoal hover:bg-ivory-warm disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer focus-visible:outline-forest"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* Transport Preference */}
              <div className="space-y-2 pt-2">
                <label className="block text-xs font-semibold text-charcoal uppercase tracking-wider font-mono">
                  {isKn ? "ಆದ್ಯತೆಯ ಸಾರಿಗೆ ವಿಧಾನ" : "Preferred Transport Mode"}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {transportOptions.map((tr) => {
                    const isSelected = transport === tr.id;
                    return (
                      <button
                        key={tr.id}
                        type="button"
                        onClick={() => setTransport(tr.id)}
                        className={`p-3 rounded-[var(--radius-md)] border text-left transition-all cursor-pointer focus-visible:outline-forest ${
                          isSelected
                            ? "border-forest bg-forest/5 shadow-subtle ring-1 ring-forest/30"
                            : "border-border bg-white hover:bg-ivory-warm"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-charcoal">
                            {tr.label}
                          </span>
                          {isSelected && <Check size={14} className="text-forest" />}
                        </div>
                        <p className="text-[11px] text-charcoal-muted mt-1">
                          {tr.hint}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* ── SUBMISSION BUTTON & CONTROLS ── */}
            <div className="pt-8 border-t border-border flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
              <div>
                <p className="text-xs text-charcoal-muted">
                  {isKn ? "ಕರ್ನಾಟಕ ಪ್ರವಾಸ ರಚಿಸಲು ಸಿದ್ಧರಾಗಿದ್ದೀರಿ: " : "Ready to compile parameters for "}
                  <strong>
                    {destinationMode === "explore"
                      ? isKn
                        ? "ಕರ್ನಾಟಕ ಅನ್ವೇಷಣೆ"
                        : "Karnataka Discovery"
                      : isKn
                        ? `${selectedDestinationIds.length} ತಾಣಗಳು`
                        : `${selectedDestinationIds.length} Destinations`}
                  </strong>
                  .
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-[var(--radius-md)] bg-forest px-8 py-3.5 text-sm font-semibold text-white hover:bg-forest-light active:bg-forest-dark transition-all shadow-card cursor-pointer focus-visible:outline-forest"
                >
                  <span>{t("planner.generateTripBtn")}</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Optional Collapsible Blueprint Reference Drawer */}
        <div className="mt-8 pt-6 border-t border-border flex flex-col items-center">
          <button
            type="button"
            onClick={() => setShowBlueprints(!showBlueprints)}
            className="inline-flex items-center gap-2 text-xs font-semibold text-forest hover:text-forest-light underline cursor-pointer focus-visible:outline-forest"
          >
            <span>
              {showBlueprints
                ? t("planner.blueprintsToggleHide")
                : t("planner.blueprintsToggleShow")}
            </span>
            {showBlueprints ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>

          {showBlueprints && (
            <div className="w-full mt-6 grid grid-cols-1 md:grid-cols-3 gap-5 animate-fade-in text-left">
              <div className="p-4 rounded-[var(--radius-md)] border border-border bg-white shadow-subtle">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gold font-mono">
                  {isKn ? "4-ದಿನಗಳ ರಾಜ ಪಥ" : "4-Day Royal Circuit"}
                </span>
                <h4 className="font-[family-name:var(--font-playfair)] font-bold text-sm text-charcoal mt-1">
                  {isKn ? "ಬೆಂಗಳೂರು → ಮೈಸೂರು → ಹಂಪಿ" : "Bengaluru → Mysuru → Hampi"}
                </h4>
                <p className="text-xs text-charcoal-muted mt-1 leading-relaxed">
                  {isKn
                    ? "ಮೈಸೂರು ಅರಮನೆ, ಚಾಮುಂಡಿ ಬೆಟ್ಟ, ಶ್ರೀರಂಗಪಟ್ಟಣ ಮತ್ತು ವಿಠ್ಠಲ ಕಲ್ಲಿನ ರಥ."
                    : "Mysore Palace, Chamundi Hill, Srirangapatna, and Vittala Stone Chariot."}
                </p>
              </div>

              <div className="p-4 rounded-[var(--radius-md)] border border-border bg-white shadow-subtle">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gold font-mono">
                  {isKn ? "3-ದಿನಗಳ ಕಾಫಿ ಗಿರಿಧಾಮಗಳು" : "3-Day Coffee Highlands"}
                </span>
                <h4 className="font-[family-name:var(--font-playfair)] font-bold text-sm text-charcoal mt-1">
                  {isKn ? "ಬೆಂಗಳೂರು → ಚಿಕ್ಕಮಗಳೂರು → ಕೊಡಗು" : "Bengaluru → Chikkamagaluru → Coorg"}
                </h4>
                <p className="text-xs text-charcoal-muted mt-1 leading-relaxed">
                  {isKn
                    ? "ಮುಳ್ಳಯ್ಯನಗಿರಿ ಶಿಖರ, ಕಾಫಿ ಎಸ್ಟೇಟ್ ಭೇಟಿ ಮತ್ತು ಅಬ್ಬಿ ಜಲಪಾತ."
                    : "Mullayanagiri peak summit, coffee estate tours, and Abbey Falls cascades."}
                </p>
              </div>

              <div className="p-4 rounded-[var(--radius-md)] border border-border bg-white shadow-subtle">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gold font-mono">
                  {isKn ? "4-ದಿನಗಳ ಕರಾವಳಿ & ದೇವಾಲಯ ಪಥ" : "4-Day Coastal & Temple Trail"}
                </span>
                <h4 className="font-[family-name:var(--font-playfair)] font-bold text-sm text-charcoal mt-1">
                  {isKn ? "ಗೋಕರ್ಣ → ಉಡುಪಿ → ಮಂಗಳೂರು" : "Gokarna → Udupi → Mangaluru"}
                </h4>
                <p className="text-xs text-charcoal-muted mt-1 leading-relaxed">
                  {isKn
                    ? "ಓಂ ಬೀಚ್ ನಡಿಗೆ, ಕೃಷ್ಣ ಮಠ, ಸೈಂಟ್ ಮೇರಿಸ್ ಐಲ್ಯಾಂಡ್ ಮತ್ತು ಕರಾವಳಿ ಆಹಾರ."
                    : "Om Beach cliff hike, Krishna Matha, St. Mary's Island, and coastal feasts."}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
