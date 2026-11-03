import { Compass, Calendar, Wallet, Globe } from "lucide-react";

const HIGHLIGHTS = [
  {
    icon: Compass,
    title: "Smart Discovery",
    description:
      "Explore Karnataka by interests — heritage, wildlife, beaches, hill stations, or food trails across all 31 districts.",
  },
  {
    icon: Calendar,
    title: "Custom Itineraries",
    description:
      "Build day-by-day plans tailored to your schedule, from quick weekend getaways to immersive two-week journeys.",
  },
  {
    icon: Wallet,
    title: "Budget Friendly",
    description:
      "Estimate costs for transport, stays, and entry fees. Travel smart without overspending — always ₹0 to use.",
  },
  {
    icon: Globe,
    title: "Local Insight",
    description:
      "Seasonal tips, festival calendars, and Kannada travel phrases. Experience Karnataka like a local, not a tourist.",
  },
];

export function HighlightsSection() {
  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-ivory">
      <div className="container-content">
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <p className="text-xs font-semibold uppercase tracking-widest text-gold mb-3">
            Why Yatrion
          </p>
          <h2 className="font-[family-name:var(--font-playfair)] text-2xl sm:text-3xl lg:text-4xl font-bold text-forest-dark">
            Travel planning, reimagined
          </h2>
          <p className="mt-4 text-charcoal-muted leading-relaxed">
            Purpose-built for Karnataka — not another generic trip tool.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {HIGHLIGHTS.map((item) => (
            <div
              key={item.title}
              className="group rounded-[var(--radius-lg)] border border-border bg-white p-6 sm:p-7 transition-shadow hover:shadow-card"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] bg-forest/8 text-forest mb-5 group-hover:bg-forest/12 transition-colors">
                <item.icon size={20} strokeWidth={1.8} />
              </div>
              <h3 className="text-base font-semibold text-charcoal mb-2">
                {item.title}
              </h3>
              <p className="text-sm text-charcoal-muted leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

