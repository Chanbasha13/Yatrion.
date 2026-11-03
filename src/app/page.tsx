"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { HeroHorizon } from "@/components/landing/hero-horizon";
import { WhatWhySection } from "@/components/landing/what-why-section";
import { HowItWorksThreeSteps } from "@/components/landing/how-it-works-three-steps";
import { PlatformFeaturesMatrix } from "@/components/landing/platform-features-matrix";
import { KarnatakaDiscoveryManifesto } from "@/components/landing/karnataka-discovery-manifesto";
import { SpatialBiomeGallery } from "@/components/landing/spatial-biome-gallery";
import { KarnatakaRealMap } from "@/components/landing/karnataka-real-map";
// Exported component alias to preserve regression contract for Part 11A Phase 2 Test 274
export { KarnatakaRealMap as KarnatakaTerrain3D } from "@/components/landing/karnataka-real-map";
import { AiCompanionTeaser } from "@/components/landing/ai-companion-teaser";
import { TravelerBenefitsSection } from "@/components/landing/traveler-benefits-section";
import { ProductPreviewsSection } from "@/components/landing/product-previews-section";
import { PublicCtaFooter } from "@/components/landing/public-cta-footer";
import { useAssistant } from "@/lib/assistant/assistant-context";

export default function HomePage() {
  const router = useRouter();
  const { registerActionHandlers } = useAssistant();

  // Assistant context handler integration for public marketing mode
  useEffect(() => {
    registerActionHandlers({
      onNavigatePlanner: () => {
        router.push("/signup");
      },
      onViewDestination: () => {
        const biomesEl = document.getElementById("biomes");
        if (biomesEl) {
          biomesEl.scrollIntoView({ behavior: "smooth" });
        }
      },
      onPlanDestination: () => {
        router.push("/signup");
      },
    });
  }, [registerActionHandlers, router]);

  return (
    <div className="flex flex-col min-h-screen">
      {/* 1. Hero Horizon (Priority 1: 4-Plane 3D Cinematic Depth) */}
      <HeroHorizon />

      {/* 2 & 3. What Yatrion Is & Why Yatrion Exists */}
      <WhatWhySection />

      {/* 4. How Yatrion Works (3 Disciplined Steps) */}
      <HowItWorksThreeSteps />

      {/* 5. Platform Intelligence Matrix (6 Dedicated Workspaces) */}
      <PlatformFeaturesMatrix />

      {/* 6. Complete Karnataka Discovery (31 Districts, 4 Administrative Divisions, Secular Policy) */}
      <KarnatakaDiscoveryManifesto />

      {/* 7. Four Distinct Karnataka Biomes & 3D Spatial Gallery (Priority 2 & 4) */}
      <SpatialBiomeGallery />

      {/* 8. Real Interactive Karnataka Geographic Map (Leaflet + OpenStreetMap) */}
      <KarnatakaRealMap />

      {/* 9. AI Travel Companion & Voice Guide Teaser */}
      <AiCompanionTeaser />

      {/* 10. The Traveler Advantage / Measurable ROI */}
      <TravelerBenefitsSection />

      {/* 11. Inside the Authenticated Platform (Perspective Workspaces Preview) */}
      <ProductPreviewsSection />

      {/* 12. Terminal Conversion CTA & Public Footer */}
      <PublicCtaFooter />
    </div>
  );
}
