import React from "react";
import { ItineraryWorkspace } from "@/components/itinerary/itinerary-workspace";

export const metadata = {
  title: "Daily Itinerary Studio • Yatrion Karnataka",
  description: "Interactive day-by-day itinerary management with stops, activity notes, and cloud synchronization.",
};

export default function ItineraryPage() {
  return <ItineraryWorkspace />;
}
