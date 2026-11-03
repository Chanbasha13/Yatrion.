import { SITE } from "@/lib/constants";

/**
 * Yatrion wordmark logo.
 * Uses the serif font for an editorial, premium feel.
 */
export function Logo({ className }: { className?: string }) {
  return (
    <span
      className={`font-[family-name:var(--font-playfair)] font-bold tracking-tight text-forest-dark select-none ${className ?? ""}`}
    >
      {SITE.name}
      <span className="text-gold">.</span>
    </span>
  );
}

