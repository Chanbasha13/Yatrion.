/** Site-wide constants */
export const SITE = {
  name: "Yatrion",
  tagline: "Discover Karnataka, differently.",
  description: "An intelligent travel planner for exploring Karnataka.",
} as const;

/** Navigation links used in header and footer */
export const NAV_LINKS = [
  { label: "Destinations", href: "#destinations" },
  { label: "Experiences", href: "#experiences" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Plan a Trip", href: "#planner" },
] as const;
