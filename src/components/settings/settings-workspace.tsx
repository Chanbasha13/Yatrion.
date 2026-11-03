"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Settings, 
  User, 
  Globe, 
  ShieldCheck, 
  RotateCcw, 
  LogOut, 
  Check, 
  Server
} from "lucide-react";
import { useAuth } from "@/lib/auth/auth-context";
import { useLanguage } from "@/lib/i18n";
import { clearUserTrip, createSeedDemoTrip, saveUserTrip } from "@/lib/storage/user-trip-service";

export function SettingsWorkspace() {
  const { user, logout } = useAuth();
  const { language, setLanguage, isKn, t } = useLanguage();
  const router = useRouter();

  const [isResetting, setIsResetting] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  const handleResetDemoData = () => {
    setIsResetting(true);
    clearUserTrip(user?.id, user?.isDemo);
    if (user?.isDemo) {
      const seed = createSeedDemoTrip();
      saveUserTrip(user.id, true, seed);
    }
    setTimeout(() => {
      setIsResetting(false);
      setResetSuccess(true);
      setTimeout(() => setResetSuccess(false), 3000);
    }, 400);
  };

  const handleSignOut = async () => {
    await logout();
    router.push("/");
  };

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Workspace Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-3 py-1 rounded-full bg-forest/10 border border-forest/20 text-forest text-xs font-mono font-bold flex items-center gap-1.5">
              <Settings size={13} />
              <span>Workspace • Settings & Preferences</span>
            </span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-charcoal">
            {isKn ? "ಖಾತೆ ಮತ್ತು ಪ್ರಾಶಸ್ತ್ಯಗಳು" : "Account Settings & Preferences"}
          </h1>
          <p className="text-xs sm:text-sm text-charcoal-light mt-1">
            {isKn
              ? "ನಿಮ್ಮ ಪ್ರೊಫೈಲ್ ವಿವರಗಳು, ಭಾಷಾ ಆಯ್ಕೆ ಮತ್ತು ಅಪ್ಲಿಕೇಶನ್ ಪ್ರಾಶಸ್ತ್ಯಗಳನ್ನು ನಿರ್ವಹಿಸಿ."
              : "Manage your traveler identity, interface localization, and isolated evaluation session."}
          </p>
        </div>

        <button
          type="button"
          onClick={handleSignOut}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border text-xs font-semibold text-terracotta hover:bg-terracotta/5 transition-colors self-start sm:self-auto"
        >
          <LogOut size={14} />
          <span>{t("appShell.signOut")}</span>
        </button>
      </div>

      {/* User Profile Card */}
      <div className="rounded-2xl border border-border bg-white p-6 sm:p-8 shadow-subtle space-y-6">
        <h3 className="font-serif text-lg font-bold text-charcoal flex items-center gap-2 border-b border-border pb-3">
          <User size={18} className="text-forest" />
          <span>{isKn ? "ಪ್ರಯಾಣಿಕರ ವಿವರ" : "Traveler Identity"}</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-ivory-warm/40 border border-border space-y-1">
            <span className="text-[11px] font-mono text-charcoal-light uppercase">Full Name</span>
            <p className="font-bold text-sm text-charcoal">{user?.name || "Traveler"}</p>
          </div>

          <div className="p-4 rounded-xl bg-ivory-warm/40 border border-border space-y-1">
            <span className="text-[11px] font-mono text-charcoal-light uppercase">Email Address</span>
            <p className="font-bold text-sm text-charcoal">{user?.email || "N/A"}</p>
          </div>

          <div className="p-4 rounded-xl bg-ivory-warm/40 border border-border space-y-1">
            <span className="text-[11px] font-mono text-charcoal-light uppercase">Account Tier</span>
            <p className="font-bold text-sm text-forest flex items-center gap-1.5">
              <ShieldCheck size={14} />
              <span>{user?.isDemo ? "Hackathon Evaluation Demo" : "Free Explorer Account"}</span>
            </p>
          </div>

          <div className="p-4 rounded-xl bg-ivory-warm/40 border border-border space-y-1">
            <span className="text-[11px] font-mono text-charcoal-light uppercase">Session Security</span>
            <p className="font-mono text-xs text-charcoal-light">
              Signed HS256 JWT • HttpOnly Cookie
            </p>
          </div>
        </div>
      </div>

      {/* Language Preference Card */}
      <div className="rounded-2xl border border-border bg-white p-6 sm:p-8 shadow-subtle space-y-6">
        <h3 className="font-serif text-lg font-bold text-charcoal flex items-center gap-2 border-b border-border pb-3">
          <Globe size={18} className="text-forest" />
          <span>{isKn ? "ಇಂಟರ್ಫೇಸ್ ಭಾಷೆ" : "Interface Language"}</span>
        </h3>

        <p className="text-xs text-charcoal-light leading-relaxed">
          {isKn
            ? "ಯಾತ್ರಿಯಾನ್ ಸಂಪೂರ್ಣವಾಗಿ ಕನ್ನಡ ಮತ್ತು ಇಂಗ್ಲಿಷ್‌ನಲ್ಲಿ ಲಭ್ಯವಿದ್ದು, ಅಧಿಕೃತ ಸ್ಥಳೀಯ ಭಾಷಾ ಪದಗಳನ್ನು ಬಳಸುತ್ತದೆ."
            : "Switch between English and authentic Kannada across all workspaces, maps, and reports."}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg">
          <button
            type="button"
            onClick={() => setLanguage("en")}
            className={`p-4 rounded-xl border text-left transition-all flex items-center justify-between ${
              language === "en"
                ? "bg-forest/5 border-forest text-forest shadow-sm"
                : "bg-white border-border text-charcoal hover:bg-ivory-warm"
            }`}
          >
            <div>
              <span className="font-bold text-sm block">English</span>
              <span className="text-xs text-charcoal-light font-mono">Standard Interface</span>
            </div>
            {language === "en" && <Check size={18} className="text-forest" />}
          </button>

          <button
            type="button"
            onClick={() => setLanguage("kn")}
            className={`p-4 rounded-xl border text-left transition-all flex items-center justify-between ${
              language === "kn"
                ? "bg-forest/5 border-forest text-forest shadow-sm"
                : "bg-white border-border text-charcoal hover:bg-ivory-warm"
            }`}
          >
            <div>
              <span className="font-bold text-sm block">ಕನ್ನಡ</span>
              <span className="text-xs text-charcoal-light font-mono">ಪ್ರಾಕೃತಿಕ ಭಾಷೆ</span>
            </div>
            {language === "kn" && <Check size={18} className="text-forest" />}
          </button>
        </div>
      </div>

      {/* Demo Traveler Data Management Card */}
      <div className="rounded-2xl border border-border bg-white p-6 sm:p-8 shadow-subtle space-y-6">
        <h3 className="font-serif text-lg font-bold text-charcoal flex items-center gap-2 border-b border-border pb-3">
          <RotateCcw size={18} className="text-terracotta" />
          <span>{isKn ? "ಮೌಲ್ಯಮಾಪನ ಡೆಮೊ ಡೇಟಾ" : "Evaluation Data Reset"}</span>
        </h3>

        <p className="text-xs text-charcoal-light leading-relaxed">
          {isKn
            ? "ಹ್ಯಾಕಥಾನ್ ಪರೀಕ್ಷೆಗಾಗಿ ಸಕ್ರಿಯ ಪ್ರವಾಸ ಡೇಟಾವನ್ನು ಮೂಲ ಸ್ಥಿತಿಗೆ ಮರುಹೊಂದಿಸಿ. ಇದು ಪೂರ್ವ-ಲೋಡ್ ಮಾಡಲಾದ ಪಶ್ಚಿಮ ಘಟ್ಟಗಳ ಮಾದರಿ ಪ್ರವಾಸವನ್ನು ಪುನಃಸ್ಥಾಪಿಸುತ್ತದೆ."
            : "Reset your active trip state to the pristine 4-day Western Ghats sample itinerary. Recommended between hackathon grading evaluations."}
        </p>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleResetDemoData}
            disabled={isResetting}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-terracotta/10 text-terracotta hover:bg-terracotta/20 text-xs font-bold transition-all disabled:opacity-50"
          >
            <RotateCcw size={14} className={isResetting ? "animate-spin" : ""} />
            <span>{isResetting ? "Resetting..." : (isKn ? "ಡೆಮೊ ಡೇಟಾ ಮರುಹೊಂದಿಸಿ" : "Reset Journey to Sample State")}</span>
          </button>

          {resetSuccess && (
            <span className="text-xs font-mono text-emerald-700 flex items-center gap-1">
              <Check size={14} />
              <span>Reset complete!</span>
            </span>
          )}
        </div>
      </div>

      {/* Architecture Integrity Notice */}
      <div className="rounded-2xl bg-forest-dark text-white p-6 sm:p-8 space-y-3 shadow-elevation">
        <div className="flex items-center gap-2 text-xs font-mono text-gold-light uppercase tracking-wider font-bold">
          <Server size={14} />
          <span>Zero-Cost & Non-Religious Architecture Invariants</span>
        </div>
        <h4 className="font-serif text-lg font-bold text-ivory">
          Built for the Kannada Digital Innovation Hackathon 2026
        </h4>
        <p className="text-xs text-ivory/75 leading-relaxed">
          Yatrion strictly curates secular natural and historic heritage, uses Open-Meteo CC BY 4.0 weather feeds, runs browser-native WebGL terrain rendering, and employs deterministic algorithms for routing and budget modeling. Zero paid API keys or commercial markups.
        </p>
      </div>
    </div>
  );
}
