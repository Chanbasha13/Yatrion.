import React from "react";
import Link from "next/link";
import { getAttractionById, SECULAR_ATTRACTIONS } from "@/lib/explore/district-data";
import { AttractionDetailView } from "@/components/explore/attraction-detail-view";
import { ArrowLeft, Compass } from "lucide-react";

interface AttractionPageProps {
  params: Promise<{ id: string }>;
}

export function generateStaticParams() {
  return SECULAR_ATTRACTIONS.map((attraction) => ({
    id: attraction.id,
  }));
}

export default async function AttractionPage({ params }: AttractionPageProps) {
  const { id } = await params;
  const attraction = getAttractionById(id);

  if (!attraction) {
    return (
      <div className="py-16 text-center space-y-4">
        <div className="w-16 h-16 mx-auto rounded-full bg-terracotta/10 text-terracotta flex items-center justify-center">
          <Compass size={28} />
        </div>
        <h1 className="font-serif text-2xl font-bold text-charcoal">
          Attraction Not Found
        </h1>
        <p className="text-sm text-charcoal-light max-w-md mx-auto">
          The requested secular attraction could not be found in our verified Karnataka directory.
        </p>
        <Link
          href="/app/explore"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-forest text-white text-xs font-semibold hover:bg-forest-dark transition-colors"
        >
          <ArrowLeft size={14} />
          <span>Return to 31-District Explorer</span>
        </Link>
      </div>
    );
  }

  return <AttractionDetailView attraction={attraction} />;
}
