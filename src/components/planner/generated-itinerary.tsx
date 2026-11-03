"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  Compass,
  Clock,
  Wallet,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Copy,
  Check,
  Edit3,
  RefreshCw,
  MapPin,
  ArrowRight,
  Sun,
  Sunset,
  Sunrise,
  Printer,
  Download,
  Trash2,
  RotateCcw,
  ArrowUp,
  ArrowDown,
  Square,
  CheckSquare,
  FileText,
  HelpCircle,
  Undo2,
  Sparkles,
  Users,
  Activity,
  CloudOff,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import type { GeneratedItinerary, ItineraryDay, ItineraryStop } from "@/lib/itinerary-engine";
import { type Destination } from "@/lib/destinations-data";
import type { TripPreferences } from "@/lib/planner-types";
import {
  formatItineraryAsText,
  formatSingleDayAsText,
  downloadItineraryTextFile,
} from "@/lib/trip-export";
import {
  saveTripToStorage,
  loadTripFromStorage,
  clearTripFromStorage,
  isStorageAvailable,
  type StoredTripState,
} from "@/lib/trip-storage";
import { useAuth } from "@/lib/auth/auth-context";
import { saveUserTrip } from "@/lib/storage/user-trip-service";
import { useLanguage } from "@/lib/i18n";
import { useAssistant } from "@/lib/assistant/assistant-context";
import { optimizeKarnatakaRoute } from "@/lib/routes/route-optimizer";
import { estimateRouteLeg } from "@/lib/routes/route-estimates";
import type {
  OptimizedRoutePlan,
  RouteStop,
  RouteLeg,
} from "@/lib/routes/route-types";
import { RouteOverview } from "@/components/routes/route-overview";
import { DailyRouteTimeline } from "@/components/routes/daily-route-timeline";
import { calculateOptimizedBudget } from "@/lib/budget/budget-optimizer";
import type { BudgetScenarioType, OptimizedBudgetPlan } from "@/lib/budget/budget-types";
import { BudgetScenarios } from "@/components/budget/budget-scenarios";
import { BudgetBreakdown } from "@/components/budget/budget-breakdown";
import { BudgetRecommendations } from "@/components/budget/budget-recommendations";
import { DiscoveryExplorer } from "@/components/discovery/discovery-explorer";
import {
  convertExperienceToItineraryStop,
  convertExperienceToRouteStop,
} from "@/lib/discovery/discovery-engine";
import type { KarnatakaExperience } from "@/lib/discovery/discovery-types";
import { GroupWorkspace } from "@/components/group/group-workspace";
import type { GroupTripState } from "@/lib/group/group-types";
import { AdaptiveDashboard } from "@/components/adaptive";
import {
  type AdaptiveReplanningProposal,
  applyReplanningProposalToItinerary,
} from "@/lib/adaptive";

interface GeneratedItineraryViewProps {
  itinerary: GeneratedItinerary;
  preferences?: TripPreferences;
  onEditPreferences: () => void;
  onRegenerate: () => void;
  onExploreDestination?: (destination: Destination) => void;
  onClearSavedTrip?: () => void;
}

export function GeneratedItineraryView({
  itinerary,
  preferences,
  onEditPreferences,
  onRegenerate,
  onExploreDestination,
  onClearSavedTrip,
}: GeneratedItineraryViewProps) {
  const { t, isKn, language } = useLanguage();
  const {
    setItinerary,
    setRoutePlan: setAssistantRoutePlan,
    setDetailedBudget,
    setBudgetPlan: setAssistantBudgetPlan,
    setGroupState: setAssistantGroupState,
  } = useAssistant();

  // ── 1. Collapsible Days State ──
  const [expandedDays, setExpandedDays] = useState<Record<number, boolean>>({
    1: true,
    2: true,
  });

  // ── 2. Editable Trip State ──
  const [editedDays, setEditedDays] = useState<ItineraryDay[]>(itinerary.days);
  const [removedStops, setRemovedStops] = useState<Record<number, ItineraryStop[]>>({});
  const [dayNotes, setDayNotes] = useState<Record<number, string>>({});
  const [stopNotes, setStopNotes] = useState<Record<string, string>>({});
  const [completedStopKeys, setCompletedStopKeys] = useState<string[]>([]);

  // ── 3. Inline Note Editors ──
  const [editingDayNoteId, setEditingDayNoteId] = useState<number | null>(null);
  const [dayNoteInput, setDayNoteInput] = useState<string>("");
  const [editingStopNoteKey, setEditingStopNoteKey] = useState<string | null>(null);
  const [stopNoteInput, setStopNoteInput] = useState<string>("");

  // ── 4. Budget View Controls ──
  const [budgetScope, setBudgetScope] = useState<"group" | "person">("group");
  const [budgetPeriod, setBudgetPeriod] = useState<"total" | "daily">("total");
  const [showBudgetAssumptions, setShowBudgetAssumptions] = useState<boolean>(false);

  // ── 5. Feedback & Notification States ──
  const { user } = useAuth();
  const [syncStatus, setSyncStatus] = useState<"synced" | "syncing" | "offline" | "conflict" | "error">("synced");

  useEffect(() => {
    const handleSync = (e: Event) => {
      const customEvent = e as CustomEvent<{ state: "synced" | "syncing" | "offline" | "conflict" | "error" }>;
      if (customEvent.detail?.state) {
        setSyncStatus(customEvent.detail.state);
      }
    };
    if (typeof window !== "undefined") {
      window.addEventListener("yatrion:sync", handleSync);
      return () => window.removeEventListener("yatrion:sync", handleSync);
    }
  }, []);

  const [copied, setCopied] = useState<boolean>(false);
  const [copiedDayNum, setCopiedDayNum] = useState<number | null>(null);
  const [isRegenerating, setIsRegenerating] = useState<boolean>(false);
  const [showPracticalTips, setShowPracticalTips] = useState<boolean>(true);
  const [prevItineraryId, setPrevItineraryId] = useState<string>(itinerary.id);

  // ── 5B. Smart Route Optimization Engine State (Part 10 Stage 1) ──
  const createFreshRoutePlan = () =>
    optimizeKarnatakaRoute({
      startingLocation: itinerary.startingLocation,
      destinationIds: itinerary.includedDestinations.map((d) => d.id),
      durationDays: itinerary.durationDays,
      travelStyle: preferences?.travelStyle || "balanced",
      transport: preferences?.transport || "self-drive",
      departureDate: preferences?.departureDate,
      interests: preferences?.interests,
    });

  const [routePlan, setRoutePlan] = useState<OptimizedRoutePlan>(createFreshRoutePlan);
  const [routeRemovedStops, setRouteRemovedStops] = useState<Record<number, RouteStop[]>>({});

  // ── 5C. Intelligent Travel Budget Optimizer State (Part 10 Stage 2) ──
  const [activeScenarioKey, setActiveScenarioKey] = useState<BudgetScenarioType>("balanced");

  const [budgetPlan, setBudgetPlanState] = useState<OptimizedBudgetPlan>(() =>
    calculateOptimizedBudget({
      itinerary,
      preferences,
      routePlan,
      scenarioKey: "balanced",
    })
  );

  // ── 5D. Hidden Gems & Discovery State (Part 10 Stage 3) ──
  const [savedGemIds, setSavedGemIds] = useState<string[]>(() => {
    if (isStorageAvailable()) {
      const stored = loadTripFromStorage();
      if (stored?.savedGemIds && Array.isArray(stored.savedGemIds)) {
        return stored.savedGemIds;
      }
    }
    return [];
  });

  // ── 5E. Group Trip Planner State (Part 10 Stage 4) ──
  const [groupState, setGroupState] = useState<GroupTripState | null>(() => {
    if (isStorageAvailable()) {
      const stored = loadTripFromStorage();
      if (stored?.groupState && stored.groupState.version === 1) {
        return stored.groupState;
      }
    }
    return null;
  });

  // ── 5F. Adaptive Travel Intelligence State (Part 10 Stage 5) ──
  const [acceptedRecommendationIds, setAcceptedRecommendationIds] = useState<string[]>(() => {
    if (isStorageAvailable()) {
      const stored = loadTripFromStorage();
      if (stored?.acceptedRecommendationIds && Array.isArray(stored.acceptedRecommendationIds)) {
        return stored.acceptedRecommendationIds;
      }
    }
    return [];
  });

  const [rejectedRecommendationIds, setRejectedRecommendationIds] = useState<string[]>(() => {
    if (isStorageAvailable()) {
      const stored = loadTripFromStorage();
      if (stored?.rejectedRecommendationIds && Array.isArray(stored.rejectedRecommendationIds)) {
        return stored.rejectedRecommendationIds;
      }
    }
    return [];
  });

  const [activeTab, setActiveTab] = useState<
    "schedule" | "route" | "budget" | "discovery" | "group" | "adaptive"
  >("schedule");

  const handleUpdateGroupState = (next: GroupTripState) => {
    setGroupState(next);
  };

  const handleAcceptRecommendation = (recId: string) => {
    setAcceptedRecommendationIds((prev) => (prev.includes(recId) ? prev : [...prev, recId]));
    setRejectedRecommendationIds((prev) => prev.filter((id) => id !== recId));
  };

  const handleRejectRecommendation = (recId: string) => {
    setRejectedRecommendationIds((prev) => (prev.includes(recId) ? prev : [...prev, recId]));
    setAcceptedRecommendationIds((prev) => prev.filter((id) => id !== recId));
  };

  const handleApplyReplanningProposal = (
    proposal: AdaptiveReplanningProposal,
    selectedRecIds: string[]
  ) => {
    const result = applyReplanningProposalToItinerary({
      originalDays: editedDays,
      proposal,
      acceptedRecommendationIds: selectedRecIds,
      dayNotes,
      stopNotes,
      completedStopKeys,
      savedGemIds,
      groupState,
    });

    setEditedDays(result.updatedDays);
    setAcceptedRecommendationIds((prev) => Array.from(new Set([...prev, ...selectedRecIds])));

    // Recompute route and budget plans with updated days
    const freshRoute = createFreshRoutePlan();
    setRoutePlan(freshRoute);
    setBudgetPlanState(
      calculateOptimizedBudget({
        itinerary: {
          ...itinerary,
          days: result.updatedDays,
        },
        preferences,
        routePlan: freshRoute,
        scenarioKey: activeScenarioKey,
      })
    );
  };

  // Synchronize during render when itinerary prop changes (e.g. on regeneration)
  if (itinerary.id !== prevItineraryId) {
    setPrevItineraryId(itinerary.id);
    setEditedDays(itinerary.days);
    setRemovedStops({});
    setDayNotes({});
    setStopNotes({});
    setCompletedStopKeys([]);
    const freshRoute = createFreshRoutePlan();
    setRoutePlan(freshRoute);
    setRouteRemovedStops({});
    setActiveScenarioKey("balanced");
    setBudgetPlanState(
      calculateOptimizedBudget({
        itinerary,
        preferences,
        routePlan: freshRoute,
        scenarioKey: "balanced",
      })
    );
  }

  // Safe local & cloud persistence effect
  useEffect(() => {
    if (preferences && isStorageAvailable()) {
      saveTripToStorage(
        preferences,
        itinerary,
        editedDays,
        removedStops,
        dayNotes,
        stopNotes,
        completedStopKeys,
        routePlan,
        budgetPlan,
        savedGemIds,
        groupState || undefined,
        acceptedRecommendationIds,
        rejectedRecommendationIds
      );

      const tripPayload: StoredTripState = {
        version: 1,
        savedAt: new Date().toISOString(),
        preferences,
        originalItinerary: itinerary,
        editedDays,
        removedStops,
        dayNotes,
        stopNotes,
        completedStopKeys,
        optimizedRoute: routePlan,
        budgetPlan,
        savedGemIds,
        groupState: groupState || undefined,
        acceptedRecommendationIds,
        rejectedRecommendationIds,
      };
      saveUserTrip(user?.id, user?.isDemo, tripPayload);
    }
  }, [
    preferences,
    itinerary,
    editedDays,
    removedStops,
    dayNotes,
    stopNotes,
    completedStopKeys,
    routePlan,
    budgetPlan,
    savedGemIds,
    groupState,
    acceptedRecommendationIds,
    rejectedRecommendationIds,
    user?.id,
    user?.isDemo,
  ]);

  // Keep Assistant Companion synced with active itinerary, route, budget, and group
  useEffect(() => {
    setItinerary(itinerary);
    setAssistantRoutePlan(routePlan);
    setDetailedBudget(itinerary.detailedBudget || null);
    setAssistantBudgetPlan(budgetPlan);
    setAssistantGroupState(groupState);
  }, [
    itinerary,
    routePlan,
    budgetPlan,
    groupState,
    setItinerary,
    setAssistantRoutePlan,
    setDetailedBudget,
    setAssistantBudgetPlan,
    setAssistantGroupState,
  ]);

  const handleApplyScenario = (scenarioKey: BudgetScenarioType) => {
    setActiveScenarioKey(scenarioKey);
    const updatedPlan = calculateOptimizedBudget({
      itinerary,
      preferences,
      routePlan,
      scenarioKey,
      targetBudget: budgetPlan.targetBudget,
      travellerCount: budgetPlan.inputs.travellerCount,
    });
    setBudgetPlanState(updatedPlan);
  };

  const handleUpdateBudgetInput = (newTargetBudget: number | null, newTravellers: number) => {
    const updatedPlan = calculateOptimizedBudget({
      itinerary,
      preferences,
      routePlan,
      scenarioKey: activeScenarioKey,
      targetBudget: newTargetBudget,
      travellerCount: newTravellers,
    });
    setBudgetPlanState(updatedPlan);
  };

  const isSavedLocally = Boolean(preferences) && isStorageAvailable();

  // Expand / Collapse toggles
  const toggleDay = (dayNum: number) => {
    setExpandedDays((prev) => ({
      ...prev,
      [dayNum]: !prev[dayNum],
    }));
  };

  const handleExpandAll = () => {
    const next: Record<number, boolean> = {};
    editedDays.forEach((d) => {
      next[d.dayNumber] = true;
    });
    setExpandedDays(next);
  };

  const handleCollapseAll = () => {
    setExpandedDays({});
  };

  const handleRegenerateClick = () => {
    setIsRegenerating(true);
    onRegenerate();
    setTimeout(() => setIsRegenerating(false), 500);
  };

  // ── 6. Editing Handlers ──
  const handleRemoveStop = (dayNum: number, stopIdx: number) => {
    const targetDay = editedDays.find((d) => d.dayNumber === dayNum);
    if (!targetDay) return;
    const removedItem = targetDay.stops[stopIdx];
    if (!removedItem) return;

    setEditedDays((prev) =>
      prev.map((d) => {
        if (d.dayNumber !== dayNum) return d;
        const updated = [...d.stops];
        updated.splice(stopIdx, 1);
        return { ...d, stops: updated };
      })
    );

    setRemovedStops((prev) => ({
      ...prev,
      [dayNum]: [...(prev[dayNum] || []), removedItem],
    }));
  };

  const handleRestoreStop = (dayNum: number, stopToRestore: ItineraryStop) => {
    setEditedDays((prev) =>
      prev.map((d) => {
        if (d.dayNumber !== dayNum) return d;
        return { ...d, stops: [...d.stops, stopToRestore] };
      })
    );

    setRemovedStops((prev) => ({
      ...prev,
      [dayNum]: (prev[dayNum] || []).filter((s) => s !== stopToRestore),
    }));
  };

  const handleMoveStop = (dayNum: number, stopIdx: number, direction: "up" | "down") => {
    const targetIdx = direction === "up" ? stopIdx - 1 : stopIdx + 1;
    setEditedDays((prev) =>
      prev.map((d) => {
        if (d.dayNumber !== dayNum) return d;
        if (targetIdx < 0 || targetIdx >= d.stops.length) return d;
        const nextStops = [...d.stops];
        const temp = nextStops[stopIdx];
        nextStops[stopIdx] = nextStops[targetIdx];
        nextStops[targetIdx] = temp;
        return { ...d, stops: nextStops };
      })
    );
  };

  const handleChangeSlot = (
    dayNum: number,
    stopIdx: number,
    slot: "morning" | "afternoon" | "evening"
  ) => {
    setEditedDays((prev) =>
      prev.map((d) => {
        if (d.dayNumber !== dayNum) return d;
        const nextStops = d.stops.map((s, idx) =>
          idx === stopIdx ? { ...s, timeOfDay: slot } : s
        );
        return { ...d, stops: nextStops };
      })
    );
  };

  const handleToggleCompleted = (key: string) => {
    setCompletedStopKeys((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const handleResetToOriginal = () => {
    const confirmMsg = isKn
      ? "ಎಲ್ಲಾ ಕಸ್ಟಮ್ ಚಟುವಟಿಕೆಗಳು, ಟಿಪ್ಪಣಿಗಳು ಮತ್ತು ಪೂರ್ಣಗೊಂಡ ಮಾರ್ಕ್‌ಗಳನ್ನು ಮೂಲ ಯೋಜನೆಗೆ ಮರುಹೊಂದಿಸಬೇಕೇ?"
      : "Reset all customized activities, notes, and completion checkmarks back to the original generated plan?";
    if (typeof window !== "undefined" && window.confirm(confirmMsg)) {
      setEditedDays(itinerary.days);
      setRemovedStops({});
      setDayNotes({});
      setStopNotes({});
      setCompletedStopKeys([]);
      setRoutePlan(createFreshRoutePlan());
      setRouteRemovedStops({});
    }
  };

  const handleClearTripClick = () => {
    const confirmMsg = isKn
      ? "ಈ ಸಾಧನದಿಂದ ನಿಮ್ಮ ಉಳಿಸಿದ ಪ್ರವಾಸವನ್ನು ಅಳಿಸಬೇಕೇ? ಇದು ಈ ಬ್ರೌಸರ್‌ನಲ್ಲಿರುವ ಎಲ್ಲಾ ಬದಲಾವಣೆಗಳನ್ನು ಅಳಿಸುತ್ತದೆ."
      : "Clear your saved trip from this device? This will erase all local modifications and notes on this browser.";
    if (typeof window !== "undefined" && window.confirm(confirmMsg)) {
      clearTripFromStorage();
      onClearSavedTrip?.();
    }
  };

  // ── 6B. Route Optimization Handlers (Part 10) ──
  const handleMoveRouteStop = (
    dayNum: number,
    fromIdx: number,
    direction: "up" | "down"
  ) => {
    const targetIdx = direction === "up" ? fromIdx - 1 : fromIdx + 1;
    setRoutePlan((prev) => {
      const updatedDailyRoutes = prev.dailyRoutes.map((dr) => {
        if (dr.dayNumber !== dayNum) return dr;
        if (targetIdx < 0 || targetIdx >= dr.stops.length) return dr;
        const newStops = [...dr.stops];
        const temp = newStops[fromIdx];
        newStops[fromIdx] = newStops[targetIdx];
        newStops[targetIdx] = temp;

        const newLegs: RouteLeg[] = [];
        let dayDist = 0;
        let dayTransitMins = 0;
        for (let i = 0; i < newStops.length - 1; i++) {
          const leg = estimateRouteLeg(
            newStops[i].id,
            newStops[i].title,
            newStops[i].coordinates,
            newStops[i + 1].id,
            newStops[i + 1].title,
            newStops[i + 1].coordinates,
            prev.transport,
            dr.destinationId
          );
          newLegs.push(leg);
          dayDist += leg.estimatedRoadDistanceKm;
          dayTransitMins += leg.estimatedDurationMinutes;
        }

        return {
          ...dr,
          stops: newStops,
          legs: newLegs,
          totalDistanceKm: Math.round(dayDist * 10) / 10,
          totalTravelTimeMinutes: dayTransitMins,
        };
      });

      return {
        ...prev,
        dailyRoutes: updatedDailyRoutes,
        totalEstimatedDistanceKm:
          Math.round(
            updatedDailyRoutes.reduce((s, d) => s + d.totalDistanceKm, 0) * 10
          ) / 10,
      };
    });
  };

  const handleRemoveRouteStop = (dayNum: number, stopIdx: number) => {
    setRoutePlan((prev) => {
      const targetDaily = prev.dailyRoutes.find((dr) => dr.dayNumber === dayNum);
      if (!targetDaily) return prev;
      const removed = targetDaily.stops[stopIdx];
      if (!removed) return prev;

      setRouteRemovedStops((rPrev) => ({
        ...rPrev,
        [dayNum]: [...(rPrev[dayNum] || []), removed],
      }));

      const newStops = targetDaily.stops.filter((_, idx) => idx !== stopIdx);
      const newLegs: RouteLeg[] = [];
      let dayDist = 0;
      let dayTransitMins = 0;
      for (let i = 0; i < newStops.length - 1; i++) {
        const leg = estimateRouteLeg(
          newStops[i].id,
          newStops[i].title,
          newStops[i].coordinates,
          newStops[i + 1].id,
          newStops[i + 1].title,
          newStops[i + 1].coordinates,
          prev.transport,
          targetDaily.destinationId
        );
        newLegs.push(leg);
        dayDist += leg.estimatedRoadDistanceKm;
        dayTransitMins += leg.estimatedDurationMinutes;
      }

      const updatedDailyRoutes = prev.dailyRoutes.map((dr) =>
        dr.dayNumber === dayNum
          ? {
              ...dr,
              stops: newStops,
              legs: newLegs,
              totalDistanceKm: Math.round(dayDist * 10) / 10,
              totalTravelTimeMinutes: dayTransitMins,
            }
          : dr
      );

      return {
        ...prev,
        dailyRoutes: updatedDailyRoutes,
        totalStopsCount: Math.max(0, prev.totalStopsCount - 1),
        totalEstimatedDistanceKm:
          Math.round(
            updatedDailyRoutes.reduce((s, d) => s + d.totalDistanceKm, 0) * 10
          ) / 10,
      };
    });
  };

  const handleRestoreRouteStop = (dayNum: number, stopToRestore: RouteStop) => {
    setRoutePlan((prev) => {
      const targetDaily = prev.dailyRoutes.find((dr) => dr.dayNumber === dayNum);
      if (!targetDaily) return prev;

      setRouteRemovedStops((rPrev) => ({
        ...rPrev,
        [dayNum]: (rPrev[dayNum] || []).filter((s) => s.id !== stopToRestore.id),
      }));

      const newStops = [...targetDaily.stops, stopToRestore];
      const newLegs: RouteLeg[] = [];
      let dayDist = 0;
      let dayTransitMins = 0;
      for (let i = 0; i < newStops.length - 1; i++) {
        const leg = estimateRouteLeg(
          newStops[i].id,
          newStops[i].title,
          newStops[i].coordinates,
          newStops[i + 1].id,
          newStops[i + 1].title,
          newStops[i + 1].coordinates,
          prev.transport,
          targetDaily.destinationId
        );
        newLegs.push(leg);
        dayDist += leg.estimatedRoadDistanceKm;
        dayTransitMins += leg.estimatedDurationMinutes;
      }

      const updatedDailyRoutes = prev.dailyRoutes.map((dr) =>
        dr.dayNumber === dayNum
          ? {
              ...dr,
              stops: newStops,
              legs: newLegs,
              totalDistanceKm: Math.round(dayDist * 10) / 10,
              totalTravelTimeMinutes: dayTransitMins,
            }
          : dr
      );

      return {
        ...prev,
        dailyRoutes: updatedDailyRoutes,
        totalStopsCount: prev.totalStopsCount + 1,
        totalEstimatedDistanceKm:
          Math.round(
            updatedDailyRoutes.reduce((s, d) => s + d.totalDistanceKm, 0) * 10
          ) / 10,
      };
    });
  };

  const handleSaveStopNote = (stopKey: string, note: string) => {
    setStopNotes((prev) => ({
      ...prev,
      [stopKey]: note,
    }));
  };

  const handleRegenerateRoute = () => {
    setIsRegenerating(true);
    setRoutePlan(createFreshRoutePlan());
    setRouteRemovedStops({});
    setTimeout(() => setIsRegenerating(false), 500);
  };

  // ── 6C. Hidden Gems Handlers (Part 10 Stage 3) ──
  const handleToggleSaveGem = (gemId: string) => {
    setSavedGemIds((prev) => {
      const next = prev.includes(gemId)
        ? prev.filter((id) => id !== gemId)
        : [...prev, gemId];
      if (preferences && isStorageAvailable()) {
        saveTripToStorage(
          preferences,
          itinerary,
          editedDays,
          removedStops,
          dayNotes,
          stopNotes,
          completedStopKeys,
          routePlan,
          budgetPlan,
          next
        );
      }
      return next;
    });
  };

  const handleAddExperienceToItinerary = (
    exp: KarnatakaExperience,
    dayNumber: number
  ) => {
    const newStop = convertExperienceToItineraryStop(exp, "afternoon");

    // 1. Append to editedDays
    const updatedDays = editedDays.map((d) => {
      if (d.dayNumber !== dayNumber) return d;
      return {
        ...d,
        stops: [...d.stops, newStop],
      };
    });
    setEditedDays(updatedDays);

    // 2. If route coordinates exist, append to routePlan
    let updatedRoutePlan = routePlan;
    if (routePlan && exp.coordinates) {
      const targetDaily = routePlan.dailyRoutes.find(
        (dr) => dr.dayNumber === dayNumber
      );
      if (targetDaily) {
        const routeStop = convertExperienceToRouteStop(
          exp,
          dayNumber,
          targetDaily.stops.length + 1
        );
        const newRouteStops = [...targetDaily.stops, routeStop];
        const newLegs: RouteLeg[] = [];
        let dayDist = 0;
        let dayTransitMins = 0;
        for (let i = 0; i < newRouteStops.length - 1; i++) {
          const leg = estimateRouteLeg(
            newRouteStops[i].id,
            newRouteStops[i].title,
            newRouteStops[i].coordinates,
            newRouteStops[i + 1].id,
            newRouteStops[i + 1].title,
            newRouteStops[i + 1].coordinates,
            routePlan.transport,
            targetDaily.destinationId
          );
          newLegs.push(leg);
          dayDist += leg.estimatedRoadDistanceKm;
          dayTransitMins += leg.estimatedDurationMinutes;
        }

        const updatedDailyRoutes = routePlan.dailyRoutes.map((dr) =>
          dr.dayNumber === dayNumber
            ? {
                ...dr,
                stops: newRouteStops,
                legs: newLegs,
                totalDistanceKm: Math.round(dayDist * 10) / 10,
                totalTravelTimeMinutes: dayTransitMins,
              }
            : dr
        );

        updatedRoutePlan = {
          ...routePlan,
          dailyRoutes: updatedDailyRoutes,
          totalStopsCount: routePlan.totalStopsCount + 1,
          totalEstimatedDistanceKm:
            Math.round(
              updatedDailyRoutes.reduce((s, d) => s + d.totalDistanceKm, 0) * 10
            ) / 10,
        };
        setRoutePlan(updatedRoutePlan);
      }
    }

    // 3. Recalculate budget plan
    const updatedBudgetPlan = calculateOptimizedBudget({
      itinerary: {
        ...itinerary,
        days: updatedDays,
      },
      preferences,
      routePlan: updatedRoutePlan,
      scenarioKey: activeScenarioKey,
      targetBudget: budgetPlan.targetBudget,
    });
    setBudgetPlanState(updatedBudgetPlan);

    // 4. Persist immediately to storage
    if (preferences && isStorageAvailable()) {
      saveTripToStorage(
        preferences,
        itinerary,
        updatedDays,
        removedStops,
        dayNotes,
        stopNotes,
        completedStopKeys,
        updatedRoutePlan,
        updatedBudgetPlan,
        savedGemIds
      );
    }
  };

  // ── 7. Export & Copy Handlers ──
  const handleCopyItinerary = () => {
    const text = formatItineraryAsText({
      itinerary,
      days: editedDays,
      detailedBudget: itinerary.detailedBudget,
      dayNotes,
      stopNotes,
      completedStopKeys,
      language,
      optimizedRoute: routePlan,
      budgetPlan,
      savedGemIds,
      groupState: groupState || undefined,
    });
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopySingleDay = (day: ItineraryDay) => {
    const text = formatSingleDayAsText(
      day,
      dayNotes[day.dayNumber],
      stopNotes,
      new Set(completedStopKeys),
      language
    );
    navigator.clipboard.writeText(text);
    setCopiedDayNum(day.dayNumber);
    setTimeout(() => setCopiedDayNum(null), 2000);
  };

  const handleDownloadTxt = () => {
    const text = formatItineraryAsText({
      itinerary,
      days: editedDays,
      detailedBudget: itinerary.detailedBudget,
      dayNotes,
      stopNotes,
      completedStopKeys,
      language,
      optimizedRoute: routePlan,
      budgetPlan,
      savedGemIds,
      groupState: groupState || undefined,
    });
    const filename = `yatrion-${itinerary.startingLocation.toLowerCase().replace(/[^a-z0-9]/g, "-")}-${itinerary.durationDays}days.txt`;
    downloadItineraryTextFile(text, filename);
  };

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  // Statistics
  const totalStopsCount = editedDays.reduce((acc, d) => acc + d.stops.length, 0);
  const completedStopsCount = editedDays.reduce(
    (acc, d) =>
      acc +
      d.stops.filter((_, idx) => completedStopKeys.includes(`${d.dayNumber}-${idx}`)).length,
    0
  );

  const budget = itinerary.detailedBudget;

  return (
    <div className="space-y-8 animate-fade-in print:space-y-4">
      {/* ── PRINT-ONLY HEADER ── */}
      <div className="hidden print:block pb-4 mb-4 border-b border-gray-400">
        <h1 className="text-2xl font-bold font-serif text-black">{itinerary.title}</h1>
        <p className="text-sm text-gray-700 font-mono mt-0.5">
          {itinerary.kannadaSubtitle} · {itinerary.durationDays} {isKn ? "ದಿನಗಳು" : "Days"} · {isKn ? "ಆರಂಭಿಕ ಸ್ಥಳ" : "Origin"}: {itinerary.startingLocation}
        </p>
        <p className="text-xs text-gray-600 mt-1 italic">
          {isKn
            ? "ಯಾತ್ರಿಯಾನ್ (ಕನ್ನಡ ಡಿಜಿಟಲ್ ಇನ್ನೋವೇಶನ್ ಹ್ಯಾಕಥಾನ್ 2026) ಮೂಲಕ ರಚಿಸಲಾಗಿದೆ."
            : "Generated via Yatrion (Kannada Digital Innovation Hackathon 2026)."}
        </p>
      </div>

      {/* ── TOP HERO BANNER & TRIP TOOLS ── */}
      <div className="rounded-[var(--radius-xl)] border border-border bg-white p-6 sm:p-8 lg:p-10 shadow-card">
        {/* Local Storage Indicator & Mode Pill */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-6 border-b border-border no-print">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-forest animate-pulse" />
            <span className="text-xs font-semibold text-charcoal">
              {isKn ? "ಪ್ರವಾಸ ಕಾರ್ಯಕ್ಷೇತ್ರ ಸಕ್ರಿಯ" : "Trip Workspace Active"}
            </span>
            {isSavedLocally && (
              <span className="inline-flex items-center gap-1 rounded-full bg-forest/10 px-2.5 py-0.5 text-[11px] font-medium text-forest font-mono">
                <FileText size={11} />
                <span>{isKn ? "ಈ ಸಾಧನದಲ್ಲಿ ಸ್ಥಳೀಯವಾಗಿ ಉಳಿಸಲಾಗಿದೆ" : "Saved locally on this device"}</span>
              </span>
            )}
          </div>

          {/* Quick Toolbar */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              aria-label={t("itinerary.printBtn")}
              className="inline-flex items-center gap-1.5 rounded-[var(--radius-md)] border border-border bg-ivory-warm px-3 py-1.5 text-xs font-medium text-charcoal hover:bg-cream transition-colors cursor-pointer"
            >
              <Printer size={13} />
              <span>{t("itinerary.printBtn")}</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadTxt}
              aria-label={t("itinerary.downloadTxtBtn")}
              className="inline-flex items-center gap-1.5 rounded-[var(--radius-md)] border border-border bg-ivory-warm px-3 py-1.5 text-xs font-medium text-charcoal hover:bg-cream transition-colors cursor-pointer"
            >
              <Download size={13} />
              <span>{t("itinerary.downloadTxtBtn")}</span>
            </button>

            <button
              type="button"
              onClick={handleResetToOriginal}
              aria-label={t("itinerary.resetBtn")}
              className="inline-flex items-center gap-1.5 rounded-[var(--radius-md)] border border-border bg-ivory-warm px-3 py-1.5 text-xs font-medium text-charcoal hover:bg-cream transition-colors cursor-pointer"
            >
              <RotateCcw size={13} />
              <span>{t("itinerary.resetBtn")}</span>
            </button>

            <button
              type="button"
              onClick={handleClearTripClick}
              aria-label={t("itinerary.clearTripBtn")}
              className="inline-flex items-center gap-1.5 rounded-[var(--radius-md)] border border-border/80 bg-white px-3 py-1.5 text-xs font-medium text-error hover:bg-error/5 transition-colors cursor-pointer"
            >
              <Trash2 size={13} />
              <span>{t("itinerary.clearTripBtn")}</span>
            </button>
          </div>
        </div>

        {/* Title, Kannada Tag, Summary */}
        <div className="mt-6">
          <div className="flex flex-wrap items-center gap-3 mb-2">
            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-gold font-mono">
              <Compass size={14} />
              <span>{isKn ? "ಆಯ್ಕೆಮಾಡಿದ ಕರ್ನಾಟಕ ಪ್ರವಾಸ" : "Curated Karnataka Journey"}</span>
            </div>

            {/* Live Cloud Sync Status Badge */}
            <div className="inline-flex items-center">
              {syncStatus === "syncing" && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-medium border text-amber-800 bg-amber-50 border-amber-300">
                  <RefreshCw size={11} className="animate-spin text-amber-600" />
                  <span>{isKn ? "ಸಿಂಕ್ ಆಗುತ್ತಿದೆ..." : "Synchronizing..."}</span>
                </span>
              )}
              {syncStatus === "synced" && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-medium border text-emerald-800 bg-emerald-50 border-emerald-200">
                  <CheckCircle2 size={12} className="text-emerald-600" />
                  <span>
                    {user?.isDemo
                      ? (isKn ? "ಸ್ಥಳೀಯವಾಗಿ ಉಳಿಸಲಾಗಿದೆ (ಡೆಮೊ)" : "Saved locally (Demo)")
                      : (isKn ? "ಕ್ಲೌಡ್‌ನಲ್ಲಿ ಸಿಂಕ್ ಆಗಿದೆ" : "Synchronized with Cloud")}
                  </span>
                </span>
              )}
              {syncStatus === "offline" && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-medium border text-stone-700 bg-stone-100 border-stone-300">
                  <CloudOff size={12} className="text-stone-500" />
                  <span>{isKn ? "ಆಫ್‌ಲೈನ್ (ಸ್ಥಳೀಯವಾಗಿ ಉಳಿಸಲಾಗಿದೆ)" : "Offline (Saved locally)"}</span>
                </span>
              )}
              {syncStatus === "conflict" && (
                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-medium border text-amber-900 bg-amber-100 border-amber-400 hover:bg-amber-200 transition-colors"
                >
                  <AlertTriangle size={12} className="text-amber-700" />
                  <span>{isKn ? "ಆವೃತ್ತಿ ಸಂಘರ್ಷ (ರೀಲೋಡ್ ಮಾಡಿ)" : "Version conflict (Click to reload)"}</span>
                </button>
              )}
              {syncStatus === "error" && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-medium border text-rose-800 bg-rose-50 border-rose-300">
                  <AlertCircle size={12} className="text-rose-600" />
                  <span>{isKn ? "ಸಿಂಕ್ ದೋಷ (ಸ್ಥಳೀಯವಾಗಿ ಸುರಕ್ಷಿತ)" : "Sync failed (Saved locally)"}</span>
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h2 className="font-[family-name:var(--font-playfair)] text-2xl sm:text-3xl lg:text-4xl font-bold text-forest-dark tracking-tight">
                {itinerary.title}
              </h2>
              <p className="text-sm sm:text-base font-semibold text-forest mt-0.5 font-mono">
                {isKn ? `ಕನ್ನಡ ಶೀರ್ಷಿಕೆ: ${itinerary.kannadaSubtitle}` : `ಕನ್ನಡ: ${itinerary.kannadaSubtitle}`}
              </p>
            </div>

            {/* Top Primary Actions */}
            <div className="flex flex-wrap items-center gap-2.5 shrink-0 no-print">
              <button
                type="button"
                onClick={onEditPreferences}
                className="inline-flex items-center gap-1.5 rounded-[var(--radius-md)] border border-border bg-ivory-warm px-4 py-2.5 text-xs font-semibold text-charcoal hover:bg-cream transition-colors cursor-pointer focus-visible:outline-forest"
              >
                <Edit3 size={14} />
                <span>{t("itinerary.editPreferencesBtn")}</span>
              </button>

              <button
                type="button"
                onClick={handleRegenerateClick}
                disabled={isRegenerating}
                className="inline-flex items-center gap-1.5 rounded-[var(--radius-md)] border border-border bg-ivory-warm px-4 py-2.5 text-xs font-semibold text-charcoal hover:bg-cream transition-colors cursor-pointer focus-visible:outline-forest disabled:opacity-50"
              >
                <RefreshCw size={14} className={isRegenerating ? "animate-spin" : ""} />
                <span>{isRegenerating ? (isKn ? "ಮರುರಚಿಸಲಾಗುತ್ತಿದೆ..." : "Regenerating...") : t("itinerary.regenerateBtn")}</span>
              </button>

              <button
                type="button"
                onClick={handleCopyItinerary}
                className="inline-flex items-center gap-1.5 rounded-[var(--radius-md)] bg-forest px-4 py-2.5 text-xs font-semibold text-white hover:bg-forest-light transition-colors cursor-pointer focus-visible:outline-forest shadow-subtle"
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                <span>{copied ? (isKn ? "ಪ್ರವಾಸ ಪಠ್ಯ ನಕಲಿಸಲಾಗಿದೆ!" : "Copied Itinerary!") : t("itinerary.copyFullTextBtn")}</span>
              </button>
            </div>
          </div>

          <p className="mt-4 text-sm sm:text-base text-charcoal-muted leading-relaxed max-w-4xl">
            {itinerary.summary}
          </p>
        </div>

        {/* Overview Stats Bar */}
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-6 border-t border-border">
          <div className="p-3 rounded-[var(--radius-md)] bg-ivory-warm border border-border">
            <span className="text-[11px] font-semibold text-charcoal-muted uppercase tracking-wider font-mono">
              {t("itinerary.statDuration")}
            </span>
            <p className="text-sm font-bold text-forest mt-0.5 font-mono">
              {itinerary.durationDays} {isKn ? "ದಿನಗಳು" : "Days"}
            </p>
          </div>

          <div className="p-3 rounded-[var(--radius-md)] bg-ivory-warm border border-border">
            <span className="text-[11px] font-semibold text-charcoal-muted uppercase tracking-wider font-mono">
              {t("itinerary.statOrigin")}
            </span>
            <p className="text-sm font-bold text-charcoal mt-0.5 truncate">
              {itinerary.startingLocation}
            </p>
          </div>

          <div className="p-3 rounded-[var(--radius-md)] bg-ivory-warm border border-border">
            <span className="text-[11px] font-semibold text-charcoal-muted uppercase tracking-wider font-mono">
              {t("itinerary.statParty")}
            </span>
            <p className="text-sm font-bold text-charcoal mt-0.5 truncate">
              {itinerary.travellerCount} {itinerary.groupTypeLabel}
            </p>
          </div>

          <div className="p-3 rounded-[var(--radius-md)] bg-ivory-warm border border-border">
            <span className="text-[11px] font-semibold text-charcoal-muted uppercase tracking-wider font-mono">
              {t("itinerary.statPacing")}
            </span>
            <p className="text-sm font-bold text-charcoal mt-0.5 truncate">
              {itinerary.travelStyleLabel.split(" ")[0]}
            </p>
          </div>

          <div className="p-3 rounded-[var(--radius-md)] bg-ivory-warm border border-border">
            <span className="text-[11px] font-semibold text-charcoal-muted uppercase tracking-wider font-mono">
              {t("itinerary.statTransport")}
            </span>
            <p className="text-sm font-bold text-charcoal mt-0.5 truncate">
              {itinerary.transportPreferenceLabel.split(" ")[0]}
            </p>
          </div>

          <div className="p-3 rounded-[var(--radius-md)] bg-ivory-warm border border-border">
            <span className="text-[11px] font-semibold text-charcoal-muted uppercase tracking-wider font-mono">
              {t("itinerary.statProgress")}
            </span>
            <p className="text-sm font-bold text-forest mt-0.5 font-mono">
              {completedStopsCount}/{totalStopsCount} {isKn ? "ಪೂರ್ಣ" : "Done"}
            </p>
          </div>
        </div>

        {/* Featured Destinations Included Pills */}
        <div className="mt-5 flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-charcoal-muted font-mono uppercase tracking-wider mr-1">
            {isKn ? "ತಾಣಗಳು:" : "Destinations:"}
          </span>
          {itinerary.includedDestinations.map((dest) => (
            <span
              key={dest.id}
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-white px-3 py-1 text-xs text-charcoal shadow-subtle"
            >
              <MapPin size={12} className="text-forest" />
              <strong className="font-semibold">{isKn ? dest.kannadaName : dest.name}</strong>
              <span className="text-[10px] text-charcoal-muted font-mono">
                ({isKn ? dest.name : dest.kannadaName})
              </span>
              {dest.isUserSelected && (
                <span className="ml-1 text-[10px] font-bold text-gold uppercase tracking-wider font-mono">
                  {isKn ? "★ ಆಯ್ಕೆಮಾಡಲಾಗಿದೆ" : "★ Chosen"}
                </span>
              )}
            </span>
          ))}

          {/* Quick Route Shortcut Pill */}
          <button
            type="button"
            onClick={() => setActiveTab("route")}
            className="inline-flex items-center gap-1.5 rounded-full border border-forest/30 bg-forest/10 px-3 py-1 text-xs font-semibold text-forest hover:bg-forest hover:text-white transition-colors cursor-pointer shadow-subtle no-print"
            title={isKn ? "ಸ್ಮಾರ್ಟ್ ಮಾರ್ಗ ಕಾಲಾವಧಿ ವೀಕ್ಷಿಸಿ" : "View Smart Route Timeline"}
          >
            <Compass size={12} />
            <span>
              {isKn
                ? `ಮಾರ್ಗ: ~${routePlan.totalEstimatedDistanceKm} km (${routePlan.intensity === "relaxed" ? "ಆರಾಮದಾಯಕ" : routePlan.intensity === "packed" ? "ವೇಗ" : "ಸಮತೋಲಿತ"})`
                : `Route: ~${routePlan.totalEstimatedDistanceKm} km (${routePlan.intensity})`}
            </span>
            <ArrowRight size={11} />
          </button>

          {/* Quick Budget Optimizer Pill */}
          <button
            type="button"
            onClick={() => setActiveTab("budget")}
            className="inline-flex items-center gap-1.5 rounded-full border border-emerald-600/30 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800 hover:bg-emerald-700 hover:text-white transition-colors cursor-pointer shadow-subtle no-print"
            title={isKn ? "ಬುದ್ಧಿವಂತ ಬಜೆಟ್ ಆಪ್ಟಿಮೈಜರ್ ವೀಕ್ಷಿಸಿ" : "View Intelligent Budget Optimizer"}
          >
            <Wallet size={12} />
            <span>
              {isKn ? "ಬಜೆಟ್: " : "Budget: "}
              ₹{budgetPlan.scenarios[activeScenarioKey].totalCost.toLocaleString("en-IN")}
            </span>
            <ArrowRight size={11} />
          </button>
        </div>
      </div>

      {/* ── FEASIBILITY & BUDGET WARNINGS BANNER ── */}
      {itinerary.warnings && itinerary.warnings.length > 0 && (
        <div className="space-y-3">
          {itinerary.warnings.map((warn, wIdx) => (
            <div
              key={wIdx}
              role="alert"
              className="p-4 rounded-[var(--radius-lg)] border border-warning/40 bg-warning/10 text-charcoal flex items-start gap-3.5 shadow-subtle"
            >
              <AlertTriangle size={18} className="text-warning shrink-0 mt-0.5" />
              <div className="text-xs sm:text-sm">
                <p className="font-bold text-forest-dark">{warn.title}</p>
                <p className="mt-0.5 text-charcoal-muted leading-relaxed">
                  {warn.message}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── SECTION 2: BUDGET INTELLIGENCE BREAKDOWN ── */}
      {budget && (
        <div className="rounded-[var(--radius-xl)] border border-border bg-white p-6 sm:p-8 shadow-card space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Wallet size={18} className="text-forest" />
                <h3 className="font-[family-name:var(--font-playfair)] text-xl sm:text-2xl font-bold text-forest-dark">
                  {t("budget.heading")}
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-charcoal-muted mt-1 leading-relaxed">
                {t("budget.subheading")}
              </p>
            </div>

            {/* View Toggles */}
            <div className="flex flex-wrap items-center gap-2 no-print">
              {/* Group vs Person Toggle */}
              <div className="inline-flex rounded-[var(--radius-md)] border border-border p-0.5 bg-ivory-warm">
                <button
                  type="button"
                  onClick={() => setBudgetScope("group")}
                  className={`px-3 py-1 text-xs font-semibold rounded-[var(--radius-sm)] transition-colors cursor-pointer ${
                    budgetScope === "group"
                      ? "bg-forest text-white shadow-subtle"
                      : "text-charcoal hover:text-forest"
                  }`}
                >
                  {isKn ? `ಇಡೀ ತಂಡ (${itinerary.travellerCount})` : `Entire Group (${itinerary.travellerCount})`}
                </button>
                <button
                  type="button"
                  onClick={() => setBudgetScope("person")}
                  className={`px-3 py-1 text-xs font-semibold rounded-[var(--radius-sm)] transition-colors cursor-pointer ${
                    budgetScope === "person"
                      ? "bg-forest text-white shadow-subtle"
                      : "text-charcoal hover:text-forest"
                  }`}
                >
                  {t("budget.personToggle")}
                </button>
              </div>

              {/* Total vs Daily Toggle */}
              <div className="inline-flex rounded-[var(--radius-md)] border border-border p-0.5 bg-ivory-warm">
                <button
                  type="button"
                  onClick={() => setBudgetPeriod("total")}
                  className={`px-3 py-1 text-xs font-semibold rounded-[var(--radius-sm)] transition-colors cursor-pointer ${
                    budgetPeriod === "total"
                      ? "bg-forest text-white shadow-subtle"
                      : "text-charcoal hover:text-forest"
                  }`}
                >
                  {isKn ? `ಒಟ್ಟು ಪ್ರವಾಸ (${itinerary.durationDays} ದಿನ)` : `Total Trip (${itinerary.durationDays}d)`}
                </button>
                <button
                  type="button"
                  onClick={() => setBudgetPeriod("daily")}
                  className={`px-3 py-1 text-xs font-semibold rounded-[var(--radius-sm)] transition-colors cursor-pointer ${
                    budgetPeriod === "daily"
                      ? "bg-forest text-white shadow-subtle"
                      : "text-charcoal hover:text-forest"
                  }`}
                >
                  {t("budget.perDayToggle")}
                </button>
              </div>
            </div>
          </div>

          {/* Primary Budget Banner Comparison */}
          <div className="p-4 sm:p-5 rounded-[var(--radius-lg)] bg-ivory-warm border border-border flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-charcoal-muted font-mono">
                {isKn ? "ಅಂದಾಜು ವೆಚ್ಚ ಶ್ರೇಣಿ" : "Indicative Estimated Range"} (
                {budgetScope === "group"
                  ? isKn
                    ? "ಇಡೀ ತಂಡ"
                    : "Entire Group"
                  : isKn
                  ? "ಪ್ರತಿ ಪ್ರವಾಸಿಗರಿಗೆ"
                  : "Per Person"}{" "}
                ·{" "}
                {budgetPeriod === "total"
                  ? isKn
                    ? "ಒಟ್ಟು ಪ್ರವಾಸ"
                    : "Total Trip"
                  : isKn
                  ? "ದೈನಂದಿನ"
                  : "Daily"}
                )
              </span>
              <p className="text-2xl sm:text-3xl font-bold text-forest font-mono mt-0.5">
                {budgetScope === "group"
                  ? budgetPeriod === "total"
                    ? budget.groupTotal.formatted
                    : budget.groupDaily.formatted
                  : budgetPeriod === "total"
                  ? budget.perPersonTotal.formatted
                  : budget.perPersonDaily.formatted}
              </p>
              <p className="text-xs text-charcoal-muted mt-1">
                {isKn ? "ನಿಮ್ಮ ಆಯ್ಕೆಯ ಬಜೆಟ್ ಶ್ರೇಣಿ: " : "Your selected tier: "}
                <strong>{budget.selectedTier.label}</strong>
              </p>
            </div>

            {/* Comparison Tag */}
            <div className="max-w-md">
              <p
                className={`text-xs sm:text-sm font-semibold ${
                  budget.isBudgetTightOrLower ? "text-error" : "text-forest"
                }`}
              >
                {budget.isBudgetTightOrLower
                  ? isKn
                    ? "⚠ ಬಜೆಟ್ ಎಚ್ಚರಿಕೆ:"
                    : "⚠ Budget Warning:"
                  : isKn
                  ? "✓ ಬಜೆಟ್ ಹೊಂದಾಣಿಕೆ:"
                  : "✓ Budget Alignment:"}
              </p>
              <p className="text-xs text-charcoal-muted mt-0.5 leading-relaxed">
                {budget.budgetComparisonNote}
              </p>
            </div>

            {/* Quick Scenario Selector Pills */}
            <div className="w-full flex flex-wrap items-center gap-2 pt-3 border-t border-border/70 no-print">
              <span className="text-[11px] font-semibold text-charcoal-muted uppercase tracking-wider font-mono">
                {isKn ? "ಬುದ್ಧಿವಂತ ಸನ್ನಿವೇಶಗಳು (ಹಂತ 2):" : "Smart Scenarios (Part 10):"}
              </span>
              {(["budget_saver", "balanced", "comfort"] as BudgetScenarioType[]).map((sKey) => {
                const sc = budgetPlan.scenarios[sKey];
                const isSelected = activeScenarioKey === sKey;
                return (
                  <button
                    key={sKey}
                    type="button"
                    onClick={() => handleApplyScenario(sKey)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                      isSelected
                        ? "bg-forest text-white shadow-subtle ring-2 ring-forest/30"
                        : "bg-white border border-border text-charcoal hover:border-forest"
                    }`}
                  >
                    <span>{isKn ? sc.nameKn : sc.nameEn}</span>
                    <span className="font-mono text-[11px] opacity-90">
                      ₹{sc.totalCost.toLocaleString("en-IN")}
                    </span>
                    {isSelected && <Check size={12} className="shrink-0" />}
                  </button>
                );
              })}
              <button
                type="button"
                onClick={() => setActiveTab("budget")}
                className="inline-flex items-center gap-1 text-xs font-semibold text-forest hover:underline ml-auto"
              >
                <span>{isKn ? "ಪೂರ್ಣ ಆಪ್ಟಿಮೈಜರ್ ವೀಕ್ಷಿಸಿ" : "View Full Optimizer"}</span>
                <ArrowRight size={12} />
              </button>
            </div>
          </div>

          {/* 6 Category Breakdown Grid */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-charcoal font-mono mb-3">
              {isKn ? "ವರ್ಗಾವಾರು ಅಂದಾಜು ವೆಚ್ಚ (ಸೂಚ್ಯ):" : "Itemized Category Estimates (Indicative):"}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {budget.categories.map((cat) => {
                const categoryLabelsKn: Record<string, string> = {
                  accommodation: "ವಸತಿ & ಹೋಮ್‌ಸ್ಟೇ",
                  transport: "ಸ್ಥಳೀಯ ಸಾರಿಗೆ & ಇಂಧನ",
                  food: "ಸ್ಥಳೀಯ ಆಹಾರ & ಕಾಫಿ",
                  activities: "ಸ್ಮಾರಕ ಪ್ರವೇಶ & ಸಾಹಸ ಶುಲ್ಕ",
                  guide: "ಸ್ಥಳೀಯ ಮಾರ್ಗದರ್ಶಿ & ಸೇವಾ ಶುಲ್ಕ",
                  contingency: "ತುರ್ತು & ಆಕಸ್ಮಿಕ ನಿಧಿ",
                };

                const displayFormatted =
                  !cat.isEstimated
                    ? isKn
                      ? "ಅಂದಾಜಿಸಿಲ್ಲ"
                      : "Not estimated"
                    : budgetScope === "group"
                    ? budgetPeriod === "total"
                      ? cat.formattedGroupTotal
                      : cat.formattedGroupDaily
                    : budgetPeriod === "total"
                    ? cat.formattedPerPersonTotal
                    : cat.formattedPerPersonDaily;

                return (
                  <div
                    key={cat.key}
                    className="p-4 rounded-[var(--radius-md)] border border-border bg-white shadow-subtle space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-forest-dark">
                        {isKn ? (categoryLabelsKn[cat.key] || cat.label) : cat.label}
                      </span>
                      <span
                        className={`text-xs font-bold font-mono ${
                          cat.isEstimated ? "text-forest" : "text-charcoal-muted italic"
                        }`}
                      >
                        {displayFormatted}
                      </span>
                    </div>
                    <p className="text-[11px] text-charcoal-muted leading-relaxed">
                      {cat.basisOrAssumption}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Expandable Assumptions & Inclusions Drawer */}
          <div className="pt-2 border-t border-border no-print">
            <button
              type="button"
              onClick={() => setShowBudgetAssumptions(!showBudgetAssumptions)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-forest hover:text-forest-light underline cursor-pointer"
            >
              <HelpCircle size={13} />
              <span>
                {showBudgetAssumptions
                  ? isKn
                    ? "ಬಜೆಟ್ ಊಹೆಗಳು & ವಿವರಗಳನ್ನು ಮರೆಮಾಡಿ"
                    : "Hide Budget Assumptions & Inclusions"
                  : isKn
                  ? "ಪೂರ್ಣ ಬಜೆಟ್ ಊಹೆಗಳು, ಒಳಗೊಂಡಿರುವ ಮತ್ತು ಹೊರತುಪಡಿಸಿದ ವೆಚ್ಚಗಳನ್ನು ವೀಕ್ಷಿಸಿ"
                  : "View Full Budget Assumptions, Inclusions & Exclusions"}
              </span>
              {showBudgetAssumptions ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            </button>

            {showBudgetAssumptions && (
              <div className="mt-4 p-5 rounded-[var(--radius-md)] bg-ivory-warm border border-border grid grid-cols-1 md:grid-cols-3 gap-5 text-xs text-charcoal-muted animate-fade-in">
                <div>
                  <h5 className="font-bold text-charcoal uppercase tracking-wider font-mono mb-2">
                    {isKn ? "ಪ್ರಮುಖ ಊಹೆಗಳು:" : "Key Assumptions:"}
                  </h5>
                  <ul className="space-y-1.5 list-disc list-inside">
                    {budget.assumptions.map((a, i) => (
                      <li key={i}>{a}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h5 className="font-bold text-forest uppercase tracking-wider font-mono mb-2">
                    {isKn ? "ಒಳಗೊಂಡಿರುವ ಸೇವೆಗಳು:" : "What is Included:"}
                  </h5>
                  <ul className="space-y-1.5 list-disc list-inside">
                    {budget.inclusions.map((inc, i) => (
                      <li key={i}>{inc}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h5 className="font-bold text-error uppercase tracking-wider font-mono mb-2">
                    {isKn ? "ಹೊರತುಪಡಿಸಿದ ವೆಚ್ಚಗಳು:" : "What is Excluded:"}
                  </h5>
                  <ul className="space-y-1.5 list-disc list-inside">
                    {budget.exclusions.map((exc, i) => (
                      <li key={i}>{exc}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── SECTION 3: VIEW SELECTOR TABS (DAILY SCHEDULE vs ROUTE OPTIMIZATION) ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-border no-print">
        <div className="inline-flex rounded-[var(--radius-lg)] border border-border p-1 bg-ivory-warm">
          <button
            type="button"
            onClick={() => setActiveTab("schedule")}
            className={`inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold rounded-[var(--radius-md)] transition-colors cursor-pointer ${
              activeTab === "schedule"
                ? "bg-forest text-white shadow-subtle"
                : "text-charcoal hover:text-forest"
            }`}
          >
            <Clock size={15} />
            <span>{isKn ? "ದೈನಂದಿನ ವೇಳಾಪಟ್ಟಿ" : "Daily Activity Schedule"}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("route")}
            className={`inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold rounded-[var(--radius-md)] transition-colors cursor-pointer ${
              activeTab === "route"
                ? "bg-forest text-white shadow-subtle"
                : "text-charcoal hover:text-forest"
            }`}
          >
            <Compass size={15} />
            <span>{isKn ? "ಸ್ಮಾರ್ಟ್ ಮಾರ್ಗ & ಕಾಲಾವಧಿ (ಭಾಗ 10)" : "Smart Route & Timeline (Part 10)"}</span>
            <span
              className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full ${
                activeTab === "route"
                  ? "bg-white/20 text-white"
                  : "bg-forest/10 text-forest"
              }`}
            >
              ~{routePlan.totalEstimatedDistanceKm} km
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("budget")}
            className={`inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold rounded-[var(--radius-md)] transition-colors cursor-pointer ${
              activeTab === "budget"
                ? "bg-forest text-white shadow-subtle"
                : "text-charcoal hover:text-forest"
            }`}
          >
            <Wallet size={15} />
            <span>{isKn ? "ಬುದ್ಧಿವಂತ ಬಜೆಟ್ ಆಪ್ಟಿಮೈಜರ್ (ಭಾಗ 10)" : "Budget Optimizer (Part 10)"}</span>
            <span
              className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full ${
                activeTab === "budget"
                  ? "bg-white/20 text-white"
                  : "bg-forest/10 text-forest"
              }`}
            >
              ₹{budgetPlan.scenarios[activeScenarioKey].totalCost.toLocaleString("en-IN")}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("discovery")}
            className={`inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold rounded-[var(--radius-md)] transition-colors cursor-pointer ${
              activeTab === "discovery"
                ? "bg-forest text-white shadow-subtle"
                : "text-charcoal hover:text-forest"
            }`}
          >
            <Sparkles size={15} />
            <span>{isKn ? "ಗುಪ್ತ ರತ್ನಗಳು & ಅನ್ವೇಷಣೆ (ಭಾಗ 10)" : "Hidden Gems & Discovery (Part 10)"}</span>
            <span
              className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full ${
                activeTab === "discovery"
                  ? "bg-white/20 text-white"
                  : "bg-forest/10 text-forest"
              }`}
            >
              {savedGemIds.length > 0 ? `${savedGemIds.length} saved` : "New"}
            </span>
          </button>

          <button
            id="tab-group"
            type="button"
            onClick={() => setActiveTab("group")}
            className={`inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold rounded-[var(--radius-md)] transition-colors cursor-pointer ${
              activeTab === "group"
                ? "bg-forest text-white shadow-subtle"
                : "text-charcoal hover:text-forest"
            }`}
          >
            <Users size={15} />
            <span>{isKn ? "ಗುಂಪು ಪ್ರವಾಸ & ಸಹಯೋಗ (ಭಾಗ 10)" : "Group Trip & Decisions (Part 10)"}</span>
            <span
              className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full ${
                activeTab === "group"
                  ? "bg-white/20 text-white"
                  : "bg-forest/10 text-forest"
              }`}
            >
              {groupState?.config?.travellers?.length || 3} {isKn ? "ಜನರು" : "members"}
            </span>
          </button>

          <button
            id="tab-adaptive"
            type="button"
            onClick={() => setActiveTab("adaptive")}
            className={`inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold rounded-[var(--radius-md)] transition-colors cursor-pointer ${
              activeTab === "adaptive"
                ? "bg-forest text-white shadow-subtle"
                : "text-charcoal hover:text-forest"
            }`}
          >
            <Activity size={15} />
            <span>{isKn ? "ಹೊಂದಾಣಿಕೆಯ ಬುದ್ಧಿವಂತಿಕೆ (ಭಾಗ 10)" : "Adaptive Intelligence (Part 10)"}</span>
            <span
              className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full ${
                activeTab === "adaptive"
                  ? "bg-white/20 text-white"
                  : "bg-forest/10 text-forest"
              }`}
            >
              {acceptedRecommendationIds.length > 0
                ? `${acceptedRecommendationIds.length} applied`
                : "Live"}
            </span>
          </button>
        </div>

        {/* View Mode Context Hint */}
        <p className="text-xs text-charcoal-muted">
          {activeTab === "schedule"
            ? isKn
              ? "ಸಮಯಾವಾರು ಚಟುವಟಿಕೆಗಳ ಪಟ್ಟಿ ಮತ್ತು ಟಿಪ್ಪಣಿಗಳು"
              : "Slot-by-slot activity sequence and notes"
            : activeTab === "route"
            ? isKn
              ? "ಕರ್ನಾಟಕ ಭೂಪ್ರದೇಶ ತಿರುವು ಗುಣಕಗಳು, ನಿಲುಗಡೆಗಳ ಕ್ರಮ & ಗೂಗಲ್ ಮ್ಯಾಪ್ಸ್"
              : "Terrain detour factors, route legs & Google Maps"
            : activeTab === "budget"
            ? isKn
              ? "3 ಸನ್ನಿವೇಶಗಳ ಹೋಲಿಕೆ, ವರ್ಗವಾರು ವಿಭಜನೆ ಮತ್ತು ನೈಜ ಉಳಿತಾಯ ಸಲಹೆಗಳು"
              : "3-scenario comparison, itemized categories & savings recommendations"
            : activeTab === "discovery"
            ? isKn
              ? "ಪ್ರಮಾಣೀಕೃತ ಅಪರೂಪದ ತಾಣಗಳು, ಪ್ರಶಾಂತ ಪರ್ಯಾಯಗಳು ಮತ್ತು ವೈಯಕ್ತಿಕ ಶಿಫಾರಸುಗಳು"
              : "Verified offbeat gems, tranquil alternatives & personalized scoring"
            : activeTab === "group"
            ? isKn
              ? "ಪ್ರವಾಸಿಗರ ಪ್ರೊಫೈಲ್‌ಗಳು, ಹೊಂದಾಣಿಕೆ ಅಂಕ, ಸಾಮೂಹಿಕ ಚಟುವಟಿಕೆಗಳ ನಿರ್ಧಾರಗಳು ಮತ್ತು ವೆಚ್ಚ ಹಂಚಿಕೆ"
              : "Traveller profiles, compatibility score, collaborative activity voting & zero-rounding expense splitting"
            : isKn
            ? "ನೈಜ ಪರಿಸರ ಸ್ಥಿತಿ ನಿಗಾ, ಮೂಲ ವೇಳಾಪಟ್ಟಿಯನ್ನು ರಕ್ಷಿಸುವ ಮರು-ಯೋಜನೆ ಮತ್ತು ಸ್ಪಷ್ಟ ಪ್ರವಾಸ ಸಲಹೆಗಳು"
            : "Deterministic condition monitoring, non-destructive replanning proposals & explainable travel advisories"}
        </p>
      </div>

      {activeTab === "budget" ? (
        <div className="space-y-8 animate-fade-in">
          {/* Header & Scenario Selection */}
          <div className="rounded-[var(--radius-xl)] border border-border bg-white p-6 sm:p-8 shadow-card space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <Wallet size={20} className="text-forest" />
                  <h3 className="font-[family-name:var(--font-playfair)] text-xl sm:text-2xl font-bold text-forest-dark">
                    {isKn
                      ? "ಬುದ್ಧಿವಂತ ಪ್ರಯಾಣ ಬಜೆಟ್ ಆಪ್ಟಿಮೈಜರ್"
                      : "Intelligent Travel Budget Optimizer"}
                  </h3>
                </div>
                <p className="text-xs sm:text-sm text-charcoal-muted mt-1 leading-relaxed">
                  {isKn
                    ? "ಪಾರದರ್ಶಕ 3-ಸನ್ನಿವೇಶ ವೆಚ್ಚ ವಿಶ್ಲೇಷಣೆ, ವರ್ಗವಾರು ವೆಚ್ಚಗಳ ಪಟ್ಟಿ ಮತ್ತು ನೈಜ ಉಳಿತಾಯ ಶಿಫಾರಸುಗಳು."
                    : "Transparent 3-scenario cost analysis, itemized category breakdown, and verified cost-saving recommendations."}
                </p>
              </div>

              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-forest/10 border border-forest/20 text-xs font-semibold text-forest">
                <Check size={14} />
                <span>
                  {isKn ? "ಸಕ್ರಿಯ ಸನ್ನಿವೇಶ: " : "Active Scenario: "}
                  {isKn
                    ? budgetPlan.scenarios[activeScenarioKey].nameKn
                    : budgetPlan.scenarios[activeScenarioKey].nameEn}
                </span>
              </div>
            </div>

            <BudgetScenarios
              plan={budgetPlan}
              activeScenarioKey={activeScenarioKey}
              onSelectScenario={handleApplyScenario}
              onUpdateBudgetInput={handleUpdateBudgetInput}
            />
          </div>

          {/* Category Breakdown & Inclusions */}
          <div className="rounded-[var(--radius-xl)] border border-border bg-white p-6 sm:p-8 shadow-card space-y-6">
            <BudgetBreakdown
              scenario={budgetPlan.scenarios[activeScenarioKey]}
              travellerCount={budgetPlan.inputs.travellerCount}
              durationDays={budgetPlan.inputs.durationDays}
            />
          </div>

          {/* Cost-Saving Recommendations & Most Expensive Day */}
          <div className="rounded-[var(--radius-xl)] border border-border bg-white p-6 sm:p-8 shadow-card space-y-6">
            <BudgetRecommendations
              recommendations={budgetPlan.recommendations}
              dailyExpenses={budgetPlan.dailyExpenses}
              mostExpensiveDayNumber={budgetPlan.mostExpensiveDayNumber}
            />
          </div>
        </div>
      ) : activeTab === "route" ? (
        <div className="space-y-6 animate-fade-in">
          <RouteOverview
            routePlan={routePlan}
            onRegenerateRoute={handleRegenerateRoute}
            onResetRoute={handleResetToOriginal}
            isRegenerating={isRegenerating}
          />

          <div className="space-y-6">
            {routePlan.dailyRoutes.map((dailyRoute) => (
              <DailyRouteTimeline
                key={dailyRoute.dayNumber}
                dailyRoute={dailyRoute}
                completedStopKeys={completedStopKeys}
                stopNotes={stopNotes}
                removedStops={routeRemovedStops[dailyRoute.dayNumber] || []}
                onMoveStop={handleMoveRouteStop}
                onRemoveStop={handleRemoveRouteStop}
                onRestoreStop={handleRestoreRouteStop}
                onToggleCompleted={handleToggleCompleted}
                onSaveStopNote={handleSaveStopNote}
              />
            ))}
          </div>
        </div>
      ) : activeTab === "discovery" ? (
        <div className="space-y-6 animate-fade-in">
          <DiscoveryExplorer
            preferences={preferences}
            selectedDestinationIds={itinerary.includedDestinations.map((d) => d.id)}
            activeBudgetScenario={activeScenarioKey}
            availableDays={editedDays.map((d) => d.dayNumber)}
            onAddToItinerary={handleAddExperienceToItinerary}
            savedGemIds={savedGemIds}
            onToggleSaveGem={handleToggleSaveGem}
            isEmbeddedInPlanner={true}
          />
        </div>
      ) : activeTab === "group" ? (
        <div className="space-y-6 animate-fade-in">
          <GroupWorkspace
            destinationIds={itinerary.includedDestinations.map((d) => d.id)}
            budgetPlan={budgetPlan}
            activeBudgetScenario={activeScenarioKey}
            initialGroupState={groupState}
            onUpdateGroupState={handleUpdateGroupState}
          />
        </div>
      ) : activeTab === "adaptive" ? (
        <div className="space-y-6 animate-fade-in">
          <AdaptiveDashboard
            itinerary={itinerary}
            editedDays={editedDays}
            preferences={preferences}
            routePlan={routePlan}
            budgetPlan={budgetPlan}
            groupState={groupState}
            savedGemIds={savedGemIds}
            dayNotes={dayNotes}
            stopNotes={stopNotes}
            completedStopKeys={completedStopKeys}
            acceptedRecommendationIds={acceptedRecommendationIds}
            rejectedRecommendationIds={rejectedRecommendationIds}
            onAcceptRecommendation={handleAcceptRecommendation}
            onRejectRecommendation={handleRejectRecommendation}
            onApplyProposal={handleApplyReplanningProposal}
            onJumpToDay={(dayNum) => {
              setActiveTab("schedule");
              setExpandedDays((prev) => ({ ...prev, [dayNum]: true }));
            }}
          />
        </div>
      ) : (
        /* ── SECTION 3: EDITABLE DAY-BY-DAY ITINERARY ── */
        <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="font-[family-name:var(--font-playfair)] text-xl sm:text-2xl font-bold text-forest-dark">
              {isKn ? "ದೈನಂದಿನ ಚಟುವಟಿಕೆಗಳ ವೇಳಾಪಟ್ಟಿ" : "Daily Activity Schedule"}
            </h3>
            <p className="text-xs sm:text-sm text-charcoal-muted mt-0.5">
              {isKn
                ? "ನಿಮ್ಮ ಯೋಜನೆಯನ್ನು ಕಸ್ಟಮೈಸ್ ಮಾಡಿ: ಚಟುವಟಿಕೆಗಳನ್ನು ಮರುಹೊಂದಿಸಿ, ಸಮಯ ಬದಲಾಯಿಸಿ ಅಥವಾ ವೈಯಕ್ತಿಕ ಟಿಪ್ಪಣಿಗಳನ್ನು ಸೇರಿಸಿ."
                : "Customize your plan: reorder stops, shift between morning/afternoon/evening, or add personal notes."}
            </p>
          </div>

          <div className="flex items-center gap-2.5 no-print">
            <button
              type="button"
              onClick={handleExpandAll}
              className="text-xs font-semibold text-forest hover:text-forest-light underline cursor-pointer"
            >
              {t("itinerary.expandAll")}
            </button>
            <span className="text-border">|</span>
            <button
              type="button"
              onClick={handleCollapseAll}
              className="text-xs font-semibold text-forest hover:text-forest-light underline cursor-pointer"
            >
              {t("itinerary.collapseAll")}
            </button>
            <span className="text-border">|</span>
            <button
              type="button"
              onClick={() => setShowPracticalTips(!showPracticalTips)}
              className="text-xs font-semibold text-forest hover:text-forest-light underline cursor-pointer"
            >
              {showPracticalTips
                ? isKn
                  ? "ಪ್ರವಾಸ ಸಲಹೆಗಳನ್ನು ಮರೆಮಾಡಿ"
                  : "Hide Travel Tips"
                : isKn
                ? "ಪ್ರವಾಸ ಸಲಹೆಗಳನ್ನು ತೋರಿಸಿ"
                : "Show Travel Tips"}
            </button>
          </div>
        </div>

        {/* Day Panels Loop */}
        <div className="space-y-6">
          {editedDays.map((day) => {
            const isExpanded = expandedDays[day.dayNumber] ?? false;
            const removedForThisDay = removedStops[day.dayNumber] || [];
            const dayNote = dayNotes[day.dayNumber];

            return (
              <div
                key={day.dayNumber}
                className="itinerary-day-card rounded-[var(--radius-xl)] border border-border bg-white overflow-hidden shadow-card transition-shadow hover:shadow-elevated"
              >
                {/* ── DAY HEADER ROW ── */}
                <div
                  className="p-5 sm:p-6 bg-ivory-warm border-b border-border flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer select-none"
                  onClick={() => toggleDay(day.dayNumber)}
                >
                  <div className="flex items-start sm:items-center gap-3.5">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-forest text-white font-mono font-bold text-sm shrink-0">
                      D{day.dayNumber}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-gold font-mono">
                          {isKn ? `ದಿನ ${day.dayNumber}` : `Day ${day.dayNumber}`}
                          {day.dateLabel ? ` · ${day.dateLabel}` : ""}
                        </span>
                        <span className="text-xs text-charcoal-muted">·</span>
                        <span className="text-xs font-semibold text-forest">
                          {isKn ? day.destinationKannada : day.destinationName} (
                          {isKn ? day.destinationName : day.destinationKannada})
                        </span>
                      </div>
                      <h4 className="font-[family-name:var(--font-playfair)] text-base sm:text-lg lg:text-xl font-bold text-forest-dark mt-0.5">
                        {day.title}
                      </h4>
                    </div>
                  </div>

                  {/* Day Level Action Buttons */}
                  <div
                    className="flex items-center gap-2.5 shrink-0 self-end md:self-center no-print"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      type="button"
                      onClick={() => handleCopySingleDay(day)}
                      className="inline-flex items-center gap-1 rounded-[var(--radius-sm)] border border-border bg-white px-2.5 py-1 text-xs font-medium text-charcoal hover:bg-cream transition-colors cursor-pointer"
                    >
                      {copiedDayNum === day.dayNumber ? (
                        <>
                          <Check size={12} className="text-forest" />
                          <span>{isKn ? "ನಕಲಿಸಲಾಗಿದೆ!" : "Copied!"}</span>
                        </>
                      ) : (
                        <>
                          <Copy size={12} />
                          <span>{isKn ? "ದಿನ ನಕಲಿಸಿ" : "Copy Day"}</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (editingDayNoteId === day.dayNumber) {
                          setEditingDayNoteId(null);
                        } else {
                          setEditingDayNoteId(day.dayNumber);
                          setDayNoteInput(dayNotes[day.dayNumber] || "");
                        }
                      }}
                      className="inline-flex items-center gap-1 rounded-[var(--radius-sm)] border border-border bg-white px-2.5 py-1 text-xs font-medium text-charcoal hover:bg-cream transition-colors cursor-pointer"
                    >
                      <Edit3 size={12} />
                      <span>{dayNote ? (isKn ? "ಟಿಪ್ಪಣಿ ಬದಲಿಸಿ" : "Edit Note") : (isKn ? "+ ಟಿಪ್ಪಣಿ" : "+ Note")}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => toggleDay(day.dayNumber)}
                      aria-label={isExpanded ? (isKn ? "ದಿನ ಮಡಿಸಿ" : "Collapse Day") : (isKn ? "ದಿನ ವಿಸ್ತರಿಸಿ" : "Expand Day")}
                      className="p-1 rounded text-charcoal-muted hover:text-charcoal cursor-pointer"
                    >
                      {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </button>
                  </div>
                </div>

                {/* ── EXPANDED DAY CONTENT ── */}
                {isExpanded && (
                  <div className="p-5 sm:p-7 space-y-6">
                    {/* Destination Banner & Hub Meta */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 rounded-[var(--radius-lg)] bg-ivory-warm border border-border">
                      <div className="md:col-span-1 relative h-32 md:h-full min-h-[100px] rounded-[var(--radius-md)] overflow-hidden">
                        <Image
                          src={day.image}
                          alt={day.imageAlt}
                          fill
                          sizes="(max-width: 768px) 100vw, 25vw"
                          className="object-cover"
                        />
                      </div>

                      <div className="md:col-span-3 space-y-2 flex flex-col justify-between">
                        <div>
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-forest font-mono">
                              {isKn ? "ಪ್ರಾದೇಶಿಕ ಕೇಂದ್ರ:" : "Regional Hub:"}{" "}
                              {isKn ? day.destinationKannada : day.destinationName} ({day.region})
                            </span>
                            {onExploreDestination && (
                              <button
                                type="button"
                                onClick={() => {
                                  const destObj = {
                                    id: day.destinationId,
                                    name: day.destinationName,
                                    kannadaName: day.destinationKannada,
                                    region: day.region,
                                    district: day.district,
                                  } as Destination;
                                  onExploreDestination(destObj);
                                }}
                                className="inline-flex items-center gap-1 text-xs font-semibold text-forest hover:text-forest-light underline cursor-pointer no-print"
                              >
                                <span>
                                  {isKn
                                    ? `${day.destinationKannada} ಮಾರ್ಗದರ್ಶಿ ವೀಕ್ಷಿಸಿ`
                                    : `Explore ${day.destinationName} Guide`}
                                </span>
                                <ArrowRight size={12} />
                              </button>
                            )}
                          </div>
                          <p className="text-xs text-charcoal-muted mt-1 leading-relaxed">
                            <strong>{isKn ? "ವಾಸ್ತವ್ಯ ಕೇಂದ್ರ:" : "Base & Stay:"}</strong> {day.suggestedStayArea} ·{" "}
                            <strong>{isKn ? "ಸಂಚಾರ ಮಾರ್ಗ:" : "Transit:"}</strong> {day.transitGuidance}
                          </p>
                        </div>

                        <div className="text-[11px] text-charcoal-muted bg-white p-2.5 rounded-[var(--radius-sm)] border border-border">
                          <strong>{isKn ? "ಪ್ರಯಾಣ ಸಲಹೆ:" : "Pacing Tip:"}</strong> {day.dailyPacingNote}
                        </div>
                      </div>
                    </div>

                    {/* Day-Level Custom Note (if set or editing) */}
                    {(dayNote || editingDayNoteId === day.dayNumber) && (
                      <div className="p-4 rounded-[var(--radius-md)] bg-gold/10 border border-gold/40 text-charcoal">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs font-bold text-forest-dark uppercase tracking-wider font-mono flex items-center gap-1">
                            <FileText size={12} className="text-gold" />
                            <span>
                              {isKn
                                ? `ದಿನ ${day.dayNumber} ಕ್ಕೆ ವೈಯಕ್ತಿಕ ಟಿಪ್ಪಣಿ:`
                                : `Personal Note for Day ${day.dayNumber}:`}
                            </span>
                          </span>
                          {editingDayNoteId !== day.dayNumber && (
                            <button
                              type="button"
                              onClick={() => {
                                setEditingDayNoteId(day.dayNumber);
                                setDayNoteInput(dayNote || "");
                              }}
                              className="text-[11px] font-semibold text-forest hover:underline cursor-pointer no-print"
                            >
                              {isKn ? "ಟಿಪ್ಪಣಿ ಬದಲಿಸಿ" : "Edit Note"}
                            </button>
                          )}
                        </div>

                        {editingDayNoteId === day.dayNumber ? (
                          <div className="space-y-2 mt-2 no-print">
                            <textarea
                              aria-label={isKn ? `ದಿನ ${day.dayNumber} ಟಿಪ್ಪಣಿ` : `Day ${day.dayNumber} note`}
                              value={dayNoteInput}
                              onChange={(e) => setDayNoteInput(e.target.value)}
                              placeholder={
                                isKn
                                  ? "ಉದಾ: ಬೆಳಿಗ್ಗೆ ತೆಪ್ಪದ ಸವಾರಿ ಮುಂಚಿತವಾಗಿ ಬುಕ್ ಮಾಡಿ..."
                                  : "e.g., Book sunrise coracle early; pack umbrella for trek..."
                              }
                              rows={2}
                              className="w-full text-xs p-2.5 rounded-[var(--radius-sm)] border border-border bg-white text-charcoal focus-visible:outline-forest"
                            />
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  setDayNotes((prev) => ({
                                    ...prev,
                                    [day.dayNumber]: dayNoteInput.trim(),
                                  }));
                                  setEditingDayNoteId(null);
                                }}
                                className="px-3 py-1 bg-forest text-white text-xs font-semibold rounded-[var(--radius-sm)] cursor-pointer"
                              >
                                {isKn ? "ಉಳಿಸಿ" : "Save Note"}
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingDayNoteId(null)}
                                className="px-3 py-1 bg-white border border-border text-charcoal text-xs font-semibold rounded-[var(--radius-sm)] cursor-pointer"
                              >
                                {isKn ? "ರದ್ದುಮಾಡಿ" : "Cancel"}
                              </button>
                            </div>
                          </div>
                        ) : (
                          <p className="text-xs text-charcoal leading-relaxed whitespace-pre-line">
                            {dayNote}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Restorable Removed Activities Banner */}
                    {removedForThisDay.length > 0 && (
                      <div className="p-3.5 rounded-[var(--radius-md)] bg-ivory-warm border border-dashed border-border flex flex-wrap items-center justify-between gap-2 no-print">
                        <span className="text-xs font-medium text-charcoal-muted">
                          {removedForThisDay.length}{" "}
                          {isKn
                            ? "ತೆಗೆದುಹಾಕಲಾದ ಚಟುವಟಿಕೆಗಳು:"
                            : `removed activit${removedForThisDay.length > 1 ? "ies" : "y"}:`}
                        </span>
                        <div className="flex flex-wrap items-center gap-2">
                          {removedForThisDay.map((rem, rIdx) => (
                            <button
                              key={rIdx}
                              type="button"
                              onClick={() => handleRestoreStop(day.dayNumber, rem)}
                              className="inline-flex items-center gap-1 rounded-full bg-white border border-border px-2.5 py-1 text-[11px] font-semibold text-forest hover:bg-cream transition-colors cursor-pointer"
                            >
                              <Undo2 size={11} />
                              <span>
                                {isKn ? "ಮರುಸ್ಥಾಪಿಸಿ" : "Restore"} &ldquo;
                                {rem.title.split(":")[1]?.trim() || rem.title}
                                &rdquo;
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Day Stops (Empty State or List) */}
                    {day.stops.length === 0 ? (
                      <div className="p-8 text-center rounded-[var(--radius-md)] border border-dashed border-border bg-ivory-warm space-y-2">
                        <p className="text-sm font-semibold text-charcoal">
                          {isKn
                            ? `ದಿನ ${day.dayNumber} ಕ್ಕೆ ಯಾವುದೇ ಚಟುವಟಿಕೆಗಳು ನಿಗದಿಯಾಗಿಲ್ಲ.`
                            : `No activities scheduled for Day ${day.dayNumber}.`}
                        </p>
                        <p className="text-xs text-charcoal-muted">
                          {isKn
                            ? "ಈ ದಿನದ ಎಲ್ಲಾ ಚಟುವಟಿಕೆಗಳನ್ನು ನೀವು ತೆಗೆದುಹಾಕಿದ್ದೀರಿ. ಮೇಲಿನ ಬಟನ್ ಮೂಲಕ ಮರುಸ್ಥಾಪಿಸಬಹುದು."
                            : "You have removed all stops for this day. You can restore them from above or regenerate your plan."}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {day.stops.map((stop, stopIdx) => {
                          const stopKey = `${day.dayNumber}-${stopIdx}`;
                          const isCompleted = completedStopKeys.includes(stopKey);
                          const stopNote = stopNotes[stopKey];

                          // Time slot styling
                          const isMorning = stop.timeOfDay === "morning";
                          const isAfternoon = stop.timeOfDay === "afternoon";

                          const slotIcon = isMorning ? (
                            <Sunrise size={16} className="text-gold" />
                          ) : isAfternoon ? (
                            <Sun size={16} className="text-gold" />
                          ) : (
                            <Sunset size={16} className="text-gold" />
                          );

                          const slotLabels: Record<string, string> = {
                            morning: t("itinerary.morningSlot"),
                            afternoon: t("itinerary.afternoonSlot"),
                            evening: t("itinerary.eveningSlot"),
                          };

                          return (
                            <div
                              key={stopIdx}
                              className={`p-4 sm:p-5 rounded-[var(--radius-lg)] border transition-all ${
                                isCompleted
                                  ? "border-forest/30 bg-forest/5 opacity-80"
                                  : "border-border bg-white shadow-subtle hover:border-forest/30"
                              }`}
                            >
                              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                                {/* Left Side: Completion checkbox, slot badge, title */}
                                <div className="flex items-start gap-3">
                                  <button
                                    type="button"
                                    onClick={() => handleToggleCompleted(stopKey)}
                                    aria-label={
                                      isKn
                                        ? `${stop.title} ಅನ್ನು ${isCompleted ? "ಬಾಕಿ" : "ಪೂರ್ಣ"} ಎಂದು ಗುರುತಿಸಿ`
                                        : `Mark ${stop.title} as ${isCompleted ? "pending" : "completed"}`
                                    }
                                    className="mt-1 text-forest hover:text-forest-light cursor-pointer no-print"
                                  >
                                    {isCompleted ? (
                                      <CheckSquare size={18} className="text-forest" />
                                    ) : (
                                      <Square size={18} className="text-charcoal-muted" />
                                    )}
                                  </button>

                                  <div className="space-y-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                      <span className="inline-flex items-center gap-1 rounded-full bg-ivory-warm px-2.5 py-0.5 text-[10px] font-bold text-forest uppercase tracking-wider font-mono">
                                        {slotIcon}
                                        <span>{slotLabels[stop.timeOfDay] || stop.timeOfDay}</span>
                                      </span>

                                      <span className="text-[11px] text-charcoal-muted font-mono flex items-center gap-1">
                                        <Clock size={11} />
                                        <span>{stop.estimatedDuration}</span>
                                      </span>

                                      {isCompleted && (
                                        <span className="inline-flex items-center gap-1 rounded bg-forest/20 text-forest px-2 py-0.5 text-[10px] font-bold font-mono">
                                          {isKn ? "✓ ಭೇಟಿ ನೀಡಲಾಗಿದೆ" : "✓ Visited"}
                                        </span>
                                      )}
                                    </div>

                                    <h5
                                      className={`text-base font-bold font-serif ${
                                        isCompleted
                                          ? "line-through text-charcoal-muted"
                                          : "text-forest-dark"
                                      }`}
                                    >
                                      {stop.title}
                                    </h5>
                                    <p className="text-xs text-charcoal-muted">
                                      {stop.location}, {stop.district}
                                    </p>
                                  </div>
                                </div>

                                {/* Right Side: Reorder & Editing Controls */}
                                <div className="flex items-center gap-1.5 self-end sm:self-start no-print">
                                  {/* Slot Switcher */}
                                  <select
                                    value={stop.timeOfDay}
                                    onChange={(e) =>
                                      handleChangeSlot(
                                        day.dayNumber,
                                        stopIdx,
                                        e.target.value as "morning" | "afternoon" | "evening"
                                      )
                                    }
                                    aria-label={isKn ? "ಸಮಯ ಬದಲಾಯಿಸಿ" : "Shift time of day"}
                                    className="text-[11px] font-semibold rounded-[var(--radius-sm)] border border-border bg-ivory-warm px-2 py-1 text-charcoal cursor-pointer focus-visible:outline-forest"
                                  >
                                    <option value="morning">{t("itinerary.morningSlot")}</option>
                                    <option value="afternoon">{t("itinerary.afternoonSlot")}</option>
                                    <option value="evening">{t("itinerary.eveningSlot")}</option>
                                  </select>

                                  {/* Up / Down Order */}
                                  <button
                                    type="button"
                                    onClick={() => handleMoveStop(day.dayNumber, stopIdx, "up")}
                                    disabled={stopIdx === 0}
                                    aria-label={isKn ? "ಮೇಲೆ ಸರಿಸಿ" : "Move activity earlier"}
                                    className="p-1 rounded border border-border bg-white text-charcoal hover:bg-ivory-warm disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                                  >
                                    <ArrowUp size={13} />
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => handleMoveStop(day.dayNumber, stopIdx, "down")}
                                    disabled={stopIdx === day.stops.length - 1}
                                    aria-label={isKn ? "ಕೆಳಗೆ ಸರಿಸಿ" : "Move activity later"}
                                    className="p-1 rounded border border-border bg-white text-charcoal hover:bg-ivory-warm disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                                  >
                                    <ArrowDown size={13} />
                                  </button>

                                  {/* Add Activity Note */}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (editingStopNoteKey === stopKey) {
                                        setEditingStopNoteKey(null);
                                      } else {
                                        setEditingStopNoteKey(stopKey);
                                        setStopNoteInput(stopNotes[stopKey] || "");
                                      }
                                    }}
                                    aria-label={isKn ? "ಚಟುವಟಿಕೆ ಟಿಪ್ಪಣಿ ಸೇರಿಸಿ" : "Add or edit note on this stop"}
                                    className="p-1 rounded border border-border bg-white text-charcoal hover:bg-ivory-warm cursor-pointer"
                                  >
                                    <Edit3 size={13} />
                                  </button>

                                  {/* Remove Stop */}
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveStop(day.dayNumber, stopIdx)}
                                    aria-label={isKn ? "ಚಟುವಟಿಕೆ ತೆಗೆದುಹಾಕಿ" : "Remove activity"}
                                    className="p-1 rounded border border-border/80 bg-white text-error hover:bg-error/10 cursor-pointer"
                                  >
                                    <Trash2 size={13} />
                                  </button>
                                </div>
                              </div>

                              <p className="mt-2 text-xs sm:text-sm text-charcoal leading-relaxed">
                                {stop.description}
                              </p>

                              {/* Practical Tip Pills */}
                              <div className="mt-3 flex flex-wrap gap-2 text-xs">
                                {stop.mealOrRestNote && (
                                  <div className="p-2 rounded-[var(--radius-sm)] bg-ivory-warm border border-border text-[11px] text-charcoal-muted">
                                    <strong>{isKn ? "ಆಹಾರ ಸಲಹೆ:" : "Food Tip:"}</strong> {stop.mealOrRestNote}
                                  </div>
                                )}
                                {stop.transitNote && (
                                  <div className="p-2 rounded-[var(--radius-sm)] bg-ivory-warm border border-border text-[11px] text-charcoal-muted">
                                    <strong>{isKn ? "ಸಾರಿಗೆ ಸಲಹೆ:" : "Transit Tip:"}</strong> {stop.transitNote}
                                  </div>
                                )}
                              </div>

                              {/* Stop Note Display / Editor */}
                              {(stopNote || editingStopNoteKey === stopKey) && (
                                <div className="mt-3 pt-3 border-t border-border">
                                  {editingStopNoteKey === stopKey ? (
                                    <div className="space-y-2 no-print">
                                      <input
                                        type="text"
                                        aria-label={
                                          isKn
                                            ? `ಚಟುವಟಿಕೆ ಟಿಪ್ಪಣಿ (${stop.timeOfDay})`
                                            : `Activity note (${stop.timeOfDay})`
                                        }
                                        value={stopNoteInput}
                                        onChange={(e) => setStopNoteInput(e.target.value)}
                                        placeholder={
                                          isKn
                                            ? "ಈ ಚಟುವಟಿಕೆಗೆ ತ್ವರಿತ ಟಿಪ್ಪಣಿ ಸೇರಿಸಿ..."
                                            : "Add a quick note for this activity..."
                                        }
                                        className="w-full text-xs p-2 rounded-[var(--radius-sm)] border border-border bg-white focus-visible:outline-forest"
                                      />
                                      <div className="flex items-center gap-2">
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setStopNotes((prev) => ({
                                              ...prev,
                                              [stopKey]: stopNoteInput.trim(),
                                            }));
                                            setEditingStopNoteKey(null);
                                          }}
                                          className="px-2.5 py-1 bg-forest text-white text-[11px] font-semibold rounded cursor-pointer"
                                        >
                                          {isKn ? "ಉಳಿಸಿ" : "Save"}
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => setEditingStopNoteKey(null)}
                                          className="px-2.5 py-1 bg-white border border-border text-[11px] rounded cursor-pointer"
                                        >
                                          {isKn ? "ರದ್ದುಮಾಡಿ" : "Cancel"}
                                        </button>
                                      </div>
                                    </div>
                                  ) : (
                                    <p className="text-[11px] text-charcoal font-medium italic">
                                      {isKn ? "ಟಿಪ್ಪಣಿ:" : "Note:"} &ldquo;{stopNote}&rdquo;
                                    </p>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      )}

      {/* ── SECTION 4: PRACTICAL REMINDERS & TIPS DRAWER ── */}
      {showPracticalTips && (
        <div className="rounded-[var(--radius-xl)] border border-border bg-white p-6 sm:p-8 shadow-card space-y-4">
          <div className="flex items-center gap-2">
            <Compass size={18} className="text-forest" />
            <h4 className="font-[family-name:var(--font-playfair)] text-lg sm:text-xl font-bold text-forest-dark">
              {t("itinerary.remindersHeading")}
            </h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-charcoal-muted leading-relaxed">
            <div className="p-4 rounded-[var(--radius-md)] bg-ivory-warm border border-border space-y-1">
              <p className="font-bold text-charcoal uppercase tracking-wider font-mono">
                {isKn ? "ದೇವಾಲಯದ ಸಮಯ ಮತ್ತು ಉಡುಪು ಸಂಹಿತೆ" : "Temple Hours & Dress Code"}
              </p>
              <p>
                {isKn
                  ? "ಪ್ರಮುಖ ದೇವಾಲಯಗಳ (ವಿರೂಪಾಕ್ಷ, ಚಾಮುಂಡೇಶ್ವರಿ, ಬಾದಾಮಿ) ಗರ್ಭಗುಡಿ ಮಧ್ಯಾಹ್ನ 12:30 ರಿಂದ 4:30 ರವರೆಗೆ ಮುಚ್ಚಿರುತ್ತದೆ. ಭುಜ ಮತ್ತು ಮೊಣಕಾಲು ಮುಚ್ಚುವ ಉಡುಪು ಕಡ್ಡಾಯ."
                  : "Major shrines (Virupaksha, Chamundeshwari, Badami) observe afternoon sanctum closures between 12:30 PM and 4:30 PM. Modest attire covering shoulders and knees is mandatory."}
              </p>
            </div>

            <div className="p-4 rounded-[var(--radius-md)] bg-ivory-warm border border-border space-y-1">
              <p className="font-bold text-charcoal uppercase tracking-wider font-mono">
                {isKn ? "ಅರಣ್ಯ & ಸಫಾರಿ ಅನುಮತಿಗಳು" : "Forest & Safari Permits"}
              </p>
              <p>
                {isKn
                  ? "ಬಂಡೀಪುರ ಮತ್ತು ಕಬಿನಿ ಸಫಾರಿಗಳು ವಾರಾಂತ್ಯದಲ್ಲಿ ಬೇಗ ಭರ್ತಿಯಾಗುತ್ತವೆ. ಅಧಿಕೃತ ಕರ್ನಾಟಕ ಅರಣ್ಯ ಇಲಾಖೆ ಅಥವಾ ಜಂಗಲ್ ಲಾಡ್ಜಸ್ ಪೋರ್ಟಲ್ ಮೂಲಕ ಮುಂಚಿತವಾಗಿ ಬುಕ್ ಮಾಡಿ."
                  : "Bandipur and Kabini tiger safaris fill up fast on weekends. Book directly through official Karnataka Forest Department or Jungle Lodges & Resorts portals in advance."}
              </p>
            </div>

            <div className="p-4 rounded-[var(--radius-md)] bg-ivory-warm border border-border space-y-1">
              <p className="font-bold text-charcoal uppercase tracking-wider font-mono">
                {isKn ? "ಘಾಟ್ & ಕರಾವಳಿ ಚಾಲನೆ" : "Ghat & Coastal Driving"}
              </p>
              <p>
                {isKn
                  ? "ಚಾರ್ಮಾಡಿ ಮತ್ತು ಶಿರಾಡಿ ಘಾಟ್ ಮಾರ್ಗಗಳಲ್ಲಿ ಮಂಜು ಮತ್ತು ಹೇರ್‌ಪಿನ್ ತಿರುವುಗಳು ಇರುತ್ತವೆ. ಸಾಧ್ಯವಾದಷ್ಟು ಹಗಲಿನ ವೇಳೆಯಲ್ಲಿ ಪ್ರಯಾಣ ಯೋಜಿಸಿ."
                  : "Charmadi and Shiradi ghat routes may experience fog and seasonal hairpin slow-downs. Plan transit journeys in daylight hours wherever possible."}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── SECTION 5: BOTTOM ACTIONS ROW ── */}
      <div className="p-5 rounded-[var(--radius-lg)] border border-border bg-white flex flex-col sm:flex-row items-center justify-between gap-4 no-print">
        <div>
          <p className="text-xs font-semibold text-charcoal">
            {isKn
              ? `ಈ ಬ್ರೌಸರ್‌ನಲ್ಲಿ ಉಳಿಸಲಾಗಿದೆ · ${totalStopsCount} ಒಟ್ಟು ಚಟುವಟಿಕೆಗಳು ಯೋಜಿತವಾಗಿವೆ`
              : `Saved on this browser · ${totalStopsCount} total activities planned`}
          </p>
          <p className="text-[11px] text-charcoal-muted">
            {isKn
              ? "ಎಲ್ಲಾ ಬದಲಾವಣೆಗಳು ಮತ್ತು ಟಿಪ್ಪಣಿಗಳು ಪುಟ ರಿಫ್ರೆಶ್ ಆದರೂ ಉಳಿಯುತ್ತವೆ."
              : "All edits and notes persist across page refreshes."}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={onEditPreferences}
            className="inline-flex items-center gap-1.5 rounded-[var(--radius-md)] border border-border bg-ivory-warm px-4 py-2 text-xs font-semibold text-charcoal hover:bg-cream transition-colors cursor-pointer focus-visible:outline-forest"
          >
            <Edit3 size={14} />
            <span>{t("itinerary.editPreferencesBtn")}</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadTxt}
            className="inline-flex items-center gap-1.5 rounded-[var(--radius-md)] border border-border bg-ivory-warm px-4 py-2 text-xs font-semibold text-charcoal hover:bg-cream transition-colors cursor-pointer focus-visible:outline-forest"
          >
            <Download size={14} />
            <span>{t("itinerary.downloadTxtBtn")}</span>
          </button>

          <button
            type="button"
            onClick={handleCopyItinerary}
            className="inline-flex items-center gap-1.5 rounded-[var(--radius-md)] bg-forest px-4 py-2 text-xs font-semibold text-white hover:bg-forest-light transition-colors cursor-pointer focus-visible:outline-forest"
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            <span>{copied ? (isKn ? "ನಕಲಿಸಲಾಗಿದೆ!" : "Copied!") : t("itinerary.copyFullTextBtn")}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
