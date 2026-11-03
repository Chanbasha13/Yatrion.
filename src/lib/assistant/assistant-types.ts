import type { Destination } from "../destinations-data";
import type { TripPreferences } from "../planner-types";
import type { GeneratedItinerary } from "../itinerary-engine";
import type { DetailedBudgetBreakdown } from "../budget-calculator";
import type { OptimizedRoutePlan } from "../routes/route-types";
import type { OptimizedBudgetPlan } from "../budget/budget-types";
import type { GroupTripState } from "../group/group-types";
import type { UnifiedTripIntelligenceContext } from "../adaptive";
import type { GlobalTravelContext } from "./global-travel-context";

export type AssistantSource =
  | "chrome-builtin" // Genuine client-side on-device Chrome Prompt API (Gemini Nano)
  | "cloud-gemini"   // Genuine serverless Google AI Studio free tier (Gemini 1.5 Flash)
  | "knowledge-engine"; // Grounded deterministic Karnataka travel knowledge engine

export type AssistantLanguage = "en" | "kn" | "hi" | "te";

export type VoiceLanguage = "en-IN" | "kn-IN" | "hi-IN" | "te-IN";

export type SpeechRecognitionStatus =
  | "idle"
  | "listening"
  | "processing"
  | "error"
  | "unsupported"
  | "permission-denied";

export type SpeechSynthesisStatus =
  | "idle"
  | "speaking"
  | "paused"
  | "unsupported";

export interface VoiceLanguageOption {
  code: VoiceLanguage;
  label: string;
  nativeLabel: string;
  flag: string;
  hasVoiceSynthesis?: boolean;
}

export interface TravelPhrase {
  id: string;
  category: "greetings" | "transport" | "food" | "shopping" | "emergency" | "etiquette";
  english: string;
  kannada: string;
  kannadaTransliteration: string;
  hindi: string;
  hindiTransliteration?: string;
  telugu: string;
  teluguTransliteration?: string;
  usageContext?: string;
}

export interface PackingItem {
  name: string;
  nameKn: string;
  nameHi?: string;
  nameTe?: string;
  essential: boolean;
  reason: string;
}

export interface PackingChecklist {
  category: "clothing" | "footwear" | "gear" | "health_safety" | "documents";
  title: string;
  titleKn: string;
  items: PackingItem[];
}

export interface SafetyGuideline {
  id: string;
  category: "responsible_tourism" | "temple_etiquette" | "ghat_roads" | "wildlife_safari" | "emergency_preparedness";
  title: string;
  titleKn: string;
  titleHi?: string;
  titleTe?: string;
  guidelines: { en: string; kn: string; hi?: string; te?: string }[];
}

export type AssistantActionType =
  | "view_destination"
  | "plan_destination"
  | "navigate_planner"
  | "set_duration"
  | "set_interests"
  | "set_budget"
  | "view_budget"
  | "view_route"
  | "optimize_route"
  | "apply_budget_scenario"
  | "view_hidden_gems"
  | "view_experience"
  | "view_group_planner"
  | "optimize_group_decisions"
  | "view_adaptive_dashboard"
  | "review_replanning_proposal"
  | "view_weather_details"
  | "open_itinerary_day"
  | "navigate_workspace"
  | "add_attraction_to_trip"
  | "remove_stop_from_trip"
  | "toggle_saved_place"
  | "reset_active_trip"
  | (string & {});

export interface AssistantAction {
  id: string;
  type: AssistantActionType;
  label: string;
  labelKn?: string;
  destinationId?: string;
  payload?: {
    destinationId?: string;
    durationDays?: number;
    interests?: string[];
    budget?: string;
    sectionId?: string;
    dayNumber?: number;
    href?: string;
    attractionId?: string;
    attractionName?: string;
    districtId?: string;
    stopIndex?: number;
    placeId?: string;
    placeName?: string;
    [key: string]: unknown;
  };
}

export interface AssistantMessage {
  id: string;
  sender: "user" | "assistant";
  text: string;
  timestamp: number;
  source?: AssistantSource;
  sourceDescription?: string;
  actions?: AssistantAction[];
  isError?: boolean;
  isGrounded?: boolean;
}

export interface AssistantContextState {
  language: "en" | "kn";
  assistantLanguage?: AssistantLanguage;
  currentWorkspace?: string;
  globalContext?: GlobalTravelContext;
  plannerPrefs?: TripPreferences | null;
  selectedDestination?: Destination | null;
  itinerary?: GeneratedItinerary | null;
  detailedBudget?: DetailedBudgetBreakdown | null;
  routePlan?: OptimizedRoutePlan | null;
  budgetPlan?: OptimizedBudgetPlan | null;
  savedGemIds?: string[];
  groupState?: GroupTripState | null;
  unifiedContext?: UnifiedTripIntelligenceContext | null;
}

export interface AssistantResponse {
  text: string;
  source: AssistantSource;
  sourceDescription: string;
  actions?: AssistantAction[];
}

