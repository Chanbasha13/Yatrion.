import type { ExperienceCategoryId } from "./destinations-data";

export type DestinationChoiceMode = "explore" | "choose" | "preselected";

export type TripDurationDays = 1 | 2 | 3 | 4 | 5 | 7;

export type BudgetTier =
  | "under-3k"
  | "3k-7k"
  | "7k-15k"
  | "15k-30k"
  | "30k-plus"
  | "flexible";

export type TripInterest =
  | "heritage"
  | "nature"
  | "hills"
  | "beaches"
  | "wildlife"
  | "food"
  | "adventure"
  | "spiritual";

export type TravelStyle = "relaxed" | "balanced" | "packed";

export type GroupType = "solo" | "couple" | "family" | "friends" | "group";

export type TransportPreference =
  | "public"
  | "self-drive"
  | "taxi"
  | "two-wheeler"
  | "flexible";

export interface TripPreferences {
  destinationMode: DestinationChoiceMode;
  selectedDestinationIds: string[];
  durationDays: TripDurationDays;
  startingLocation: string;
  departureDate?: string;
  returnDate?: string;
  budget: BudgetTier;
  interests: TripInterest[];
  travelStyle: TravelStyle;
  groupType: GroupType;
  travellerCount: number;
  transport: TransportPreference;
  submittedAt?: string;
}

export interface PlannerFormErrors {
  startingLocation?: string;
  selectedDestinationIds?: string;
  interests?: string;
  departureDate?: string;
  returnDate?: string;
  general?: string;
}

export const DURATION_OPTIONS: { days: TripDurationDays; label: string; subtitle: string }[] = [
  { days: 1, label: "1 Day", subtitle: "Day Excursion" },
  { days: 2, label: "2 Days", subtitle: "Weekend Getaway" },
  { days: 3, label: "3 Days", subtitle: "Long Weekend" },
  { days: 4, label: "4 Days", subtitle: "Mini Circuit" },
  { days: 5, label: "5 Days", subtitle: "Regional Discovery" },
  { days: 7, label: "7 Days", subtitle: "Grand Karnataka Trail" },
];

export const BUDGET_OPTIONS: { id: BudgetTier; label: string; description: string }[] = [
  {
    id: "under-3k",
    label: "Under ₹3,000",
    description: "Budget backpacker · Local KSRTC buses & basic homestays",
  },
  {
    id: "3k-7k",
    label: "₹3,000 – ₹7,000",
    description: "Moderate · Express trains & comfortable guesthouses",
  },
  {
    id: "7k-15k",
    label: "₹7,000 – ₹15,000",
    description: "Comfort · Private cabs / self-drive & boutique stays",
  },
  {
    id: "15k-30k",
    label: "₹15,000 – ₹30,000",
    description: "Premium · Heritage estates & guided experiences",
  },
  {
    id: "30k-plus",
    label: "₹30,000+",
    description: "Luxury · Exclusive jungle lodges & private charters",
  },
  {
    id: "flexible",
    label: "Flexible Budget",
    description: "Prioritize experiences · Calculate costs based on itinerary",
  },
];

export const INTEREST_OPTIONS: {
  id: TripInterest;
  label: string;
  description: string;
  categoryMapping?: ExperienceCategoryId;
}[] = [
  {
    id: "heritage",
    label: "Heritage & Architecture",
    description: "UNESCO monuments, Hoysala stone carvings & royal palaces",
    categoryMapping: "heritage",
  },
  {
    id: "nature",
    label: "Nature & Waterfalls",
    description: "Dense rainforests, Abbey & Jog cascades, Western Ghats",
    categoryMapping: "nature",
  },
  {
    id: "hills",
    label: "Hills & Trekking",
    description: "Mullayanagiri, coffee slopes & Baba Budangiri ridge walks",
    categoryMapping: "nature",
  },
  {
    id: "beaches",
    label: "Beaches & Coastal Life",
    description: "Om Beach clifftops, pristine Malpe sands & St. Mary's Island",
    categoryMapping: "coastal",
  },
  {
    id: "wildlife",
    label: "Wildlife & Safaris",
    description: "Asian elephants, Bengal tigers, Bandipur & Kabini river drives",
    categoryMapping: "wildlife",
  },
  {
    id: "food",
    label: "Food & Local Culture",
    description: "Authentic Udupi dosas, Mangalorean seafood, Kodava cuisine",
    categoryMapping: "culture",
  },
  {
    id: "adventure",
    label: "Adventure & Outdoors",
    description: "Kali River white-water rafting, rock scrambling & camping",
    categoryMapping: "wildlife",
  },
  {
    id: "spiritual",
    label: "Spiritual Places",
    description: "Ancient Shaivite shrines, sacred Cauvery source, Krishna Matha",
    categoryMapping: "heritage",
  },
];

export const TRAVEL_STYLES: { id: TravelStyle; label: string; description: string }[] = [
  {
    id: "relaxed",
    label: "Relaxed Pace",
    description: "1–2 key stops per day · Ample downtime and slow travel",
  },
  {
    id: "balanced",
    label: "Balanced Mix",
    description: "2–3 activities per day · Harmonious mix of exploration and rest",
  },
  {
    id: "packed",
    label: "Packed Trail",
    description: "Maximum sights · Early mornings and full-day exploration",
  },
];

export const GROUP_TYPES: { id: GroupType; label: string; defaultCount: number }[] = [
  { id: "solo", label: "Solo Explorer", defaultCount: 1 },
  { id: "couple", label: "Couple", defaultCount: 2 },
  { id: "family", label: "Family", defaultCount: 4 },
  { id: "friends", label: "Friends Group", defaultCount: 4 },
  { id: "group", label: "Large Group", defaultCount: 8 },
];

export const TRANSPORT_OPTIONS: { id: TransportPreference; label: string; hint: string }[] = [
  {
    id: "public",
    label: "Public Transport",
    hint: "KSRTC Airavat Express & Indian Railways",
  },
  {
    id: "self-drive",
    label: "Self-Drive Vehicle",
    hint: "Personal car or rented self-drive car",
  },
  {
    id: "taxi",
    label: "Rental Car / Taxi",
    hint: "Chauffeur-driven tourist taxi / Outstation cab",
  },
  {
    id: "two-wheeler",
    label: "Two-Wheeler",
    hint: "Motorcycle touring / local scooter rentals",
  },
  {
    id: "flexible",
    label: "Flexible / Recommend",
    hint: "Tailored to terrain and route feasibility",
  },
];

