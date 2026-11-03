"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { useLanguage } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { t, isKn } = useLanguage();

  const navLinks = [
    { label: t("nav.destinations"), href: "#biomes" },
    { label: isKn ? "ಕರ್ನಾಟಕ ನಕ್ಷೆ" : "Interactive Map", href: "#map" },
    { label: t("nav.howItWorks"), href: "#how-it-works" },
    { label: isKn ? "ವೈಶಿಷ್ಟ್ಯಗಳು" : "Features", href: "#features" },
    { label: t("nav.hiddenGems"), href: "#discovery" },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-white/95 backdrop-blur-md">
      <div className="container-content flex h-16 items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-1 focus-visible:outline-forest" aria-label="Yatrion home">
          <Logo className="text-xl" />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-7" aria-label="Main navigation">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-charcoal-light hover:text-forest transition-colors focus-visible:outline-forest"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop CTA & Language Switcher */}
        <div className="hidden md:flex items-center gap-3">
          <LanguageSwitcher />

          <Link
            href="/login"
            className="text-xs font-semibold text-charcoal hover:text-forest px-3 py-2 transition-colors focus-visible:outline-forest rounded-[var(--radius-md)] hover:bg-forest/5"
          >
            {t("auth.signInBtn")}
          </Link>

          <Link
            href="/signup"
            className="inline-flex items-center justify-center rounded-[var(--radius-md)] bg-forest px-4 py-2 text-xs font-semibold text-white hover:bg-forest-light transition-colors focus-visible:outline-forest shadow-subtle"
          >
            {t("nav.planYourTripBtn")}
          </Link>
        </div>

        {/* Mobile controls: language switcher + burger */}
        <div className="flex md:hidden items-center gap-2">
          <LanguageSwitcher />

          <button
            type="button"
            className="inline-flex items-center justify-center p-2 rounded-[var(--radius-md)] text-charcoal hover:bg-ivory-warm transition-colors focus-visible:outline-forest"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-expanded={mobileOpen}
            aria-label={mobileOpen ? t("nav.closeMenu") : t("nav.openMenu")}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile nav panel */}
      <div
        className={cn(
          "md:hidden overflow-hidden transition-all duration-200 ease-in-out border-t border-border bg-white",
          mobileOpen ? "max-h-96" : "max-h-0 border-t-0"
        )}
      >
        <nav className="container-content flex flex-col gap-1 py-4" aria-label="Mobile navigation">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-[var(--radius-md)] px-4 py-2.5 text-sm font-medium text-charcoal-light hover:bg-ivory-warm hover:text-forest transition-colors"
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <div className="mt-2 px-4 space-y-2">
            <LanguageSwitcher variant="mobile" />

            <Link
              href="/login"
              className="inline-flex w-full items-center justify-center rounded-[var(--radius-md)] border border-forest/20 bg-forest/5 px-5 py-2.5 text-sm font-semibold text-forest hover:bg-forest/10 transition-colors"
              onClick={() => setMobileOpen(false)}
            >
              {t("auth.signInBtn")}
            </Link>

            <Link
              href="/signup"
              className="inline-flex w-full items-center justify-center rounded-[var(--radius-md)] bg-forest px-5 py-2.5 text-sm font-semibold text-white hover:bg-forest-light transition-colors"
              onClick={() => setMobileOpen(false)}
            >
              {t("nav.planYourTripBtn")}
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}
