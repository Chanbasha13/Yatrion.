"use client";

import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import { SITE } from "@/lib/constants";
import { MapPin, Mail, Compass } from "lucide-react";
import { useLanguage } from "@/lib/i18n";

export function SiteFooter() {
  const { t, isKn } = useLanguage();

  const footerExplore = [
    { label: isKn ? "ಹಂಪಿ ಪರಂಪರೆ" : "Hampi Heritage", href: "#destinations" },
    { label: isKn ? "ಕೊಡಗು ಗಿರಿಧಾಮ" : "Coorg Highlands", href: "#destinations" },
    { label: isKn ? "ಮೈಸೂರು ಅರಮನೆ ತಾಣ" : "Mysuru Royal Trail", href: "#destinations" },
    { label: isKn ? "ಗೋಕರ್ಣ ಕಡಲತೀರ" : "Gokarna Coast", href: "#destinations" },
    { label: isKn ? "ಚಿಕ್ಕಮಗಳೂರು ಕಾಫಿ ಶಿಖರ" : "Chikkamagaluru Coffee Peaks", href: "#destinations" },
    { label: isKn ? "ಬಂಡೀಪುರ ವನ್ಯಜೀವಿ ಧಾಮ" : "Bandipur Wildlife Sanctuary", href: "#destinations" },
  ];

  const navLinks = [
    { label: t("nav.destinations"), href: "#destinations" },
    { label: t("nav.experiences"), href: "#experiences" },
    { label: t("nav.howItWorks"), href: "#how-it-works" },
    { label: t("nav.planner"), href: "#planner" },
  ];

  return (
    <footer id="about" className="border-t border-border bg-forest-dark text-ivory/90">
      <div className="container-content py-12 sm:py-16">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand column */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Logo className="text-2xl !text-white" />
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-ivory/70">
              {t("footer.description")}
            </p>
            <div className="mt-4 flex items-center gap-2 text-sm text-ivory/60">
              <MapPin size={14} />
              <span>{isKn ? "ಬೆಂಗಳೂರು · ಕರ್ನಾಟಕ, ಭಾರತ" : "Bengaluru · Karnataka, India"}</span>
            </div>
            <div className="mt-2 flex items-center gap-2 text-xs text-gold-light/80 font-mono">
              <Compass size={14} />
              <span>{isKn ? "31 ಜಿಲ್ಲೆಗಳು · ಮುಕ್ತ ತಂತ್ರಜ್ಞಾನ" : "31 Districts · Zero Booking Markup"}</span>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-gold-muted mb-4 font-mono">
              {t("footer.quickLinksTitle")}
            </h3>
            <ul className="space-y-2.5">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-ivory/70 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Curated Destinations */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-gold-muted mb-4 font-mono">
              {t("footer.destinationsTitle")}
            </h3>
            <ul className="space-y-2.5">
              {footerExplore.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-ivory/70 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* About / Hackathon */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-gold-muted mb-4 font-mono">
              {isKn ? "ಹ್ಯಾಕಥಾನ್ ಯೋಜನೆ" : "Hackathon Project"}
            </h3>
            <p className="text-sm text-ivory/70 leading-relaxed">
              {t("footer.hackathonCredit")}.
            </p>
            <p className="mt-2 text-xs text-ivory/60 leading-relaxed">
              {t("footer.culturalHeritageText")}
            </p>
            <div className="mt-4 flex items-center gap-2 text-sm text-ivory/60">
              <Mail size={14} />
              <span>connect@yatrion.in</span>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-ivory/50">
          <p>
            &copy; 2026 {SITE.name}. {t("footer.copyrightText")}
          </p>
          <p>
            {t("footer.tagline")}
          </p>
        </div>
      </div>
    </footer>
  );
}
