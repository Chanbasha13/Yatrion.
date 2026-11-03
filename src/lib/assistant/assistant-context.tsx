"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  type ReactNode,
} from "react";
import type { Destination } from "../destinations-data";
import type { TripPreferences } from "../planner-types";
import type { GeneratedItinerary } from "../itinerary-engine";
import type { DetailedBudgetBreakdown } from "../budget-calculator";
import type { OptimizedRoutePlan } from "../routes/route-types";
import type { OptimizedBudgetPlan } from "../budget/budget-types";
import type { GroupTripState } from "../group/group-types";
import type { UnifiedTripIntelligenceContext } from "../adaptive";
import type {
  AssistantAction,
  AssistantContextState,
  AssistantMessage,
} from "./assistant-types";
import { sendAssistantQuery } from "./assistant-service";
import { loadTripFromStorage } from "../trip-storage";
import { useLanguage } from "../i18n";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/auth-context";
import { buildGlobalTravelContext, type GlobalTravelContext } from "./global-travel-context";
import { executeSafeAction, ACTION_REGISTRY, type ActionExecutionContext } from "./action-registry";
import { loadUserTrip, getUserSavedPlaces } from "@/lib/storage/user-trip-service";

const CHAT_STORAGE_KEY = "yatrion-chat-session-v1";

export interface PendingActionState {
  actionId: string;
  labelEn: string;
  labelKn: string;
  payload: Record<string, unknown>;
}

export interface AssistantActionHandlers {
  onViewDestination?: (destinationId: string) => void;
  onPlanDestination?: (destination: Destination) => void;
  onNavigatePlanner?: () => void;
  onSetDuration?: (days: number) => void;
  onSetInterests?: (interests: string[]) => void;
  onSetBudget?: (budget: string) => void;
  onViewAdaptiveDashboard?: () => void;
  onReviewReplanningProposal?: () => void;
  onViewWeatherDetails?: () => void;
  onOpenItineraryDay?: (dayNumber: number) => void;
}

export interface AssistantContextType {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  toggleOpen: () => void;
  messages: AssistantMessage[];
  isLoading: boolean;
  sendMessage: (text: string) => Promise<void>;
  clearMessages: () => void;
  retryLastMessage: () => Promise<void>;
  registerActionHandlers: (handlers: AssistantActionHandlers) => void;
  executeAction: (action: AssistantAction) => void;
  pendingAction: PendingActionState | null;
  confirmPendingAction: () => Promise<void>;
  cancelPendingAction: () => void;
  globalContext: GlobalTravelContext;
  setPlannerPrefs: (prefs: TripPreferences | null) => void;
  setSelectedDestination: (dest: Destination | null) => void;
  setItinerary: (itinerary: GeneratedItinerary | null) => void;
  setDetailedBudget: (budget: DetailedBudgetBreakdown | null) => void;
  routePlan: OptimizedRoutePlan | null;
  setRoutePlan: (routePlan: OptimizedRoutePlan | null) => void;
  budgetPlan: OptimizedBudgetPlan | null;
  setBudgetPlan: (budgetPlan: OptimizedBudgetPlan | null) => void;
  groupState: GroupTripState | null;
  setGroupState: (groupState: GroupTripState | null) => void;
  unifiedContext: UnifiedTripIntelligenceContext | null;
  setUnifiedContext: (ctx: UnifiedTripIntelligenceContext | null) => void;
}

const AssistantContext = createContext<AssistantContextType | undefined>(undefined);

export function AssistantProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { language } = useLanguage();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [messages, setMessages] = useState<AssistantMessage[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = sessionStorage.getItem(CHAT_STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
          }
        }
      } catch {
        // Safe fallback if sessionStorage is restricted
      }
    }
    return [];
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [pendingAction, setPendingAction] = useState<PendingActionState | null>(null);

  // Helper to read initial stored trip on client mount
  const getInitialTrip = useCallback(() => {
    if (typeof window !== "undefined") {
      try {
        return user ? loadUserTrip(user.id, user.isDemo) : loadTripFromStorage();
      } catch {
        return null;
      }
    }
    return null;
  }, [user]);

  // Travel context states with lazy initializers
  const [plannerPrefs, setPlannerPrefs] = useState<TripPreferences | null>(() => getInitialTrip()?.preferences || null);
  const [selectedDestination, setSelectedDestination] = useState<Destination | null>(null);
  const [itinerary, setItinerary] = useState<GeneratedItinerary | null>(() => getInitialTrip()?.originalItinerary || null);
  const [detailedBudget, setDetailedBudget] = useState<DetailedBudgetBreakdown | null>(null);
  const [routePlan, setRoutePlan] = useState<OptimizedRoutePlan | null>(() => getInitialTrip()?.optimizedRoute || null);
  const [budgetPlan, setBudgetPlan] = useState<OptimizedBudgetPlan | null>(() => getInitialTrip()?.budgetPlan || null);
  const [groupState, setGroupState] = useState<GroupTripState | null>(() => getInitialTrip()?.groupState || null);
  const [unifiedContext, setUnifiedContext] = useState<UnifiedTripIntelligenceContext | null>(null);

  const [savedPlaces, setSavedPlaces] = useState<string[]>(() => {
    if (typeof window !== "undefined") {
      try {
        return getUserSavedPlaces(user?.id);
      } catch {
        return [];
      }
    }
    return [];
  });

  // Keep saved places synchronized
  useEffect(() => {
    if (typeof window === "undefined") return;
    const refreshSaved = () => {
      try {
        setSavedPlaces(getUserSavedPlaces(user?.id));
      } catch {
        // Safe fallback
      }
    };
    refreshSaved();
    window.addEventListener("storage", refreshSaved);
    return () => window.removeEventListener("storage", refreshSaved);
  }, [user?.id]);

  // Global travel context aggregation across all 14 workspaces
  const globalContext: GlobalTravelContext = React.useMemo(() => {
    const activeTrip = user ? loadUserTrip(user.id, user.isDemo) : loadTripFromStorage();
    return buildGlobalTravelContext({
      userId: user?.id,
      userName: user?.name,
      isDemo: user?.isDemo,
      language: language as "en" | "kn",
      currentWorkspace: pathname || "/app/dashboard",
      tripState: activeTrip,
      savedPlaceIds: savedPlaces,
      routePlan,
      budgetPlan,
      groupState,
      unifiedContext,
    });
  }, [user, language, pathname, savedPlaces, routePlan, budgetPlan, groupState, unifiedContext]);

  const actionHandlersRef = useRef<AssistantActionHandlers>({});

  // Save chat history to sessionStorage whenever messages change
  useEffect(() => {
    if (typeof window !== "undefined" && messages.length > 0) {
      try {
        sessionStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages));
      } catch {
        // Safe fallback
      }
    }
  }, [messages]);

  const toggleOpen = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const registerActionHandlers = useCallback((handlers: AssistantActionHandlers) => {
    actionHandlersRef.current = {
      ...actionHandlersRef.current,
      ...handlers,
    };
  }, []);

  // Safe action confirmation handler for Category C mutating actions
  const confirmPendingAction = useCallback(async () => {
    if (!pendingAction) return;

    const executionContext: ActionExecutionContext = {
      userId: user?.id,
      isDemo: user?.isDemo,
      routerPush: (href: string) => router.push(href),
      getTripState: () => (user ? loadUserTrip(user.id, user.isDemo) : loadTripFromStorage()),
      refreshTripState: () => {
        const updated = user ? loadUserTrip(user.id, user.isDemo) : loadTripFromStorage();
        if (updated) {
          setPlannerPrefs(updated.preferences);
          setItinerary(updated.originalItinerary);
          setRoutePlan(updated.optimizedRoute || null);
          setBudgetPlan(updated.budgetPlan || null);
        } else {
          setPlannerPrefs(null);
          setItinerary(null);
          setRoutePlan(null);
          setBudgetPlan(null);
        }
      },
    };

    const result = await executeSafeAction(
      pendingAction.actionId,
      pendingAction.payload,
      executionContext,
      true
    );

    const resultMsg: AssistantMessage = {
      id: `action-result-${Date.now()}`,
      sender: "assistant",
      text: language === "kn" ? result.messageKn : result.messageEn,
      timestamp: Date.now(),
      isGrounded: true,
      source: "knowledge-engine",
      sourceDescription: "Action Execution Engine",
    };

    setMessages((prev) => [...prev, resultMsg]);
    setPendingAction(null);
  }, [pendingAction, user, router, language]);

  // Cancel pending mutating action safely without modifying state
  const cancelPendingAction = useCallback(() => {
    if (pendingAction) {
      const cancelMsg: AssistantMessage = {
        id: `action-cancelled-${Date.now()}`,
        sender: "assistant",
        text: language === "kn" ? "ಕ್ರಿಯೆಯನ್ನು ರದ್ದುಗೊಳಿಸಲಾಗಿದೆ." : "Action was cancelled.",
        timestamp: Date.now(),
        isGrounded: true,
        source: "knowledge-engine",
        sourceDescription: "Safety Guard",
      };
      setMessages((prev) => [...prev, cancelMsg]);
    }
    setPendingAction(null);
  }, [pendingAction, language]);

  const executeAction = useCallback((action: AssistantAction) => {
    const handlers = actionHandlersRef.current;
    const actionDef = ACTION_REGISTRY[action.type];

    // Intercept safe actions registered in ACTION_REGISTRY
    if (actionDef) {
      if (actionDef.requiresConfirmation) {
        setPendingAction({
          actionId: action.type,
          labelEn: actionDef.labelEn,
          labelKn: actionDef.labelKn,
          payload: (action.payload as Record<string, unknown>) || {},
        });
        return;
      }

      // Non-mutating Category B actions (navigation)
      const executionContext: ActionExecutionContext = {
        userId: user?.id,
        isDemo: user?.isDemo,
        routerPush: (href: string) => router.push(href),
        getTripState: () => (user ? loadUserTrip(user.id, user.isDemo) : loadTripFromStorage()),
        refreshTripState: () => {},
      };
      executeSafeAction(action.type, action.payload, executionContext, true);
      return;
    }

    // Fallback to legacy action handlers
    switch (action.type) {
      case "view_destination":
        if (action.destinationId && handlers.onViewDestination) {
          handlers.onViewDestination(action.destinationId);
        }
        break;
      case "plan_destination":
        if (action.destinationId && handlers.onPlanDestination) {
          import("../destinations-data").then(({ DESTINATIONS }) => {
            const dest = DESTINATIONS.find((d) => d.id === action.destinationId);
            if (dest && handlers.onPlanDestination) {
              handlers.onPlanDestination(dest);
            }
          });
        }
        break;
      case "navigate_planner":
      case "view_budget":
      case "view_route":
      case "optimize_route":
        if (handlers.onNavigatePlanner) {
          handlers.onNavigatePlanner();
        }
        break;
      case "set_duration":
        if (action.payload?.durationDays && handlers.onSetDuration) {
          handlers.onSetDuration(action.payload.durationDays as number);
        }
        break;
      case "set_interests":
        if (action.payload?.interests && handlers.onSetInterests) {
          handlers.onSetInterests(action.payload.interests as string[]);
        }
        break;
      case "set_budget":
        if (action.payload?.budget && handlers.onSetBudget) {
          handlers.onSetBudget(action.payload.budget as string);
        }
        break;
      case "view_hidden_gems":
      case "view_experience":
        if (typeof document !== "undefined") {
          const discoveryEl = document.getElementById("discovery");
          if (discoveryEl) {
            discoveryEl.scrollIntoView({ behavior: "smooth" });
          } else if (handlers.onNavigatePlanner) {
            handlers.onNavigatePlanner();
          }
        }
        break;
      case "view_group_planner":
      case "optimize_group_decisions":
        if (typeof document !== "undefined") {
          const groupTabBtn = document.getElementById("tab-group");
          if (groupTabBtn) {
            groupTabBtn.click();
            groupTabBtn.scrollIntoView({ behavior: "smooth" });
          } else if (handlers.onNavigatePlanner) {
            handlers.onNavigatePlanner();
          }
        }
        break;
      case "view_adaptive_dashboard":
        if (handlers.onViewAdaptiveDashboard) {
          handlers.onViewAdaptiveDashboard();
        } else if (typeof document !== "undefined") {
          const adaptiveTabBtn = document.getElementById("tab-adaptive");
          if (adaptiveTabBtn) {
            adaptiveTabBtn.click();
            adaptiveTabBtn.scrollIntoView({ behavior: "smooth" });
          } else if (handlers.onNavigatePlanner) {
            handlers.onNavigatePlanner();
          }
        }
        break;
      case "review_replanning_proposal":
        if (handlers.onReviewReplanningProposal) {
          handlers.onReviewReplanningProposal();
        } else if (typeof document !== "undefined") {
          const adaptiveTabBtn = document.getElementById("tab-adaptive");
          if (adaptiveTabBtn) {
            adaptiveTabBtn.click();
            adaptiveTabBtn.scrollIntoView({ behavior: "smooth" });
          } else if (handlers.onNavigatePlanner) {
            handlers.onNavigatePlanner();
          }
        }
        break;
      case "view_weather_details":
        if (handlers.onViewWeatherDetails) {
          handlers.onViewWeatherDetails();
        } else if (typeof document !== "undefined") {
          const adaptiveTabBtn = document.getElementById("tab-adaptive");
          if (adaptiveTabBtn) {
            adaptiveTabBtn.click();
            adaptiveTabBtn.scrollIntoView({ behavior: "smooth" });
          } else if (handlers.onNavigatePlanner) {
            handlers.onNavigatePlanner();
          }
        }
        break;
      case "open_itinerary_day":
        if (action.payload?.dayNumber && handlers.onOpenItineraryDay) {
          handlers.onOpenItineraryDay(action.payload.dayNumber as number);
        } else if (typeof document !== "undefined") {
          const scheduleTabBtn = document.querySelector<HTMLButtonElement>("button:has(svg.lucide-clock)");
          if (scheduleTabBtn) {
            scheduleTabBtn.click();
            scheduleTabBtn.scrollIntoView({ behavior: "smooth" });
          }
        }
        break;
    }
  }, [user, router]);

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isLoading) return;

      const userMsg: AssistantMessage = {
        id: `user-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        sender: "user",
        text: trimmed,
        timestamp: Date.now(),
      };

      const updatedHistory = [...messages, userMsg];
      setMessages(updatedHistory);
      setIsLoading(true);

      const currentContext: AssistantContextState = {
        language,
        currentWorkspace: pathname || undefined,
        globalContext,
        plannerPrefs,
        selectedDestination,
        itinerary,
        detailedBudget,
        routePlan,
        budgetPlan,
        groupState,
        unifiedContext,
      };

      try {
        const response = await sendAssistantQuery(trimmed, updatedHistory, currentContext);

        const assistantMsg: AssistantMessage = {
          id: `assistant-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          sender: "assistant",
          text: response.text,
          timestamp: Date.now(),
          source: response.source,
          sourceDescription: response.sourceDescription,
          actions: response.actions,
          isGrounded: true,
        };

        setMessages((prev) => [...prev, assistantMsg]);
      } catch (err) {
        console.error("Error sending message to assistant:", err);
        const errorMsg: AssistantMessage = {
          id: `error-${Date.now()}`,
          sender: "assistant",
          text:
            language === "kn"
              ? "ಕ್ಷಮಿಸಿ, ಪ್ರತಿಕ್ರಿಯೆಯನ್ನು ಪಡೆಯುವಲ್ಲಿ ದೋಷ ಸಂಭವಿಸಿದೆ. ದಯವಿಟ್ಟು ಮತ್ತೊಮ್ಮೆ ಪ್ರಯತ್ನಿಸಿ."
              : "Apologies, an error occurred while processing your request. Please try again.",
          timestamp: Date.now(),
          isError: true,
        };
        setMessages((prev) => [...prev, errorMsg]);
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading, messages, language, pathname, globalContext, plannerPrefs, selectedDestination, itinerary, detailedBudget, routePlan, budgetPlan, groupState, unifiedContext]
  );

  const retryLastMessage = useCallback(async () => {
    const lastUserMessage = [...messages].reverse().find((m) => m.sender === "user");
    if (lastUserMessage) {
      await sendMessage(lastUserMessage.text);
    }
  }, [messages, sendMessage]);

  const clearMessages = useCallback(() => {
    setMessages([]);
    if (typeof window !== "undefined") {
      try {
        sessionStorage.removeItem(CHAT_STORAGE_KEY);
      } catch {
        // Safe fallback
      }
    }
  }, []);

  return (
    <AssistantContext.Provider
      value={{
        isOpen,
        setIsOpen,
        toggleOpen,
        messages,
        isLoading,
        sendMessage,
        clearMessages,
        retryLastMessage,
        registerActionHandlers,
        executeAction,
        pendingAction,
        confirmPendingAction,
        cancelPendingAction,
        globalContext,
        setPlannerPrefs,
        setSelectedDestination,
        setItinerary,
        setDetailedBudget,
        routePlan,
        setRoutePlan,
        budgetPlan,
        setBudgetPlan,
        groupState,
        setGroupState,
        unifiedContext,
        setUnifiedContext,
      }}
    >
      {children}
    </AssistantContext.Provider>
  );
}

export function useAssistant() {
  const context = useContext(AssistantContext);
  if (!context) {
    throw new Error("useAssistant must be used within an AssistantProvider");
  }
  return context;
}
