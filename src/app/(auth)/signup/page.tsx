"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Lock, Mail, User as UserIcon, Sparkles, ArrowRight, AlertCircle, ShieldCheck, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/lib/auth/auth-context";
import { useLanguage } from "@/lib/i18n";

function SignupForm() {
  const router = useRouter();
  const { signup, loginDemo } = useAuth();
  const { t, isKn } = useLanguage();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDemoSubmitting, setIsDemoSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{
    name?: string[];
    email?: string[];
    password?: string[];
  }>({});

  // Live password requirements
  const hasMinLength = password.length >= 8;
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setFieldErrors({});

    if (!name.trim() || !email.trim() || !password) {
      setErrorMessage(isKn ? "ದಯವಿಟ್ಟು ಎಲ್ಲಾ ಕ್ಷೇತ್ರಗಳನ್ನು ಭರ್ತಿ ಮಾಡಿ." : "Please fill in all required fields.");
      return;
    }

    if (!hasMinLength || !hasLetter || !hasNumber) {
      setErrorMessage(isKn ? "ದಯವಿಟ್ಟು ಪಾಸ್‌ವರ್ಡ್ ನಿಯಮಗಳನ್ನು ಪಾಲಿಸಿ." : "Please meet all password requirements.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await signup(name, email, password);
      if (res.success) {
        router.push(res.redirectUrl || "/app/dashboard");
      } else {
        setErrorMessage(res.error || (isKn ? "ನೋಂದಣಿ ವಿಫಲವಾಗಿದೆ." : "Failed to create account."));
        if (res.fieldErrors) {
          setFieldErrors(res.fieldErrors);
        }
      }
    } catch {
      setErrorMessage(isKn ? "ನೆಟ್‌ವರ್ಕ್ ದೋಷ ಸಂಭವಿಸಿದೆ." : "A connection error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoLogin = async () => {
    setErrorMessage(null);
    setIsDemoSubmitting(true);
    try {
      const res = await loginDemo();
      if (res.success) {
        router.push(res.redirectUrl || "/app/dashboard");
      } else {
        setErrorMessage(res.error || (isKn ? "ಡೆಮೊ ಲಾಗಿನ್ ವಿಫಲವಾಗಿದೆ." : "Failed to initiate demo session."));
      }
    } catch {
      setErrorMessage(isKn ? "ದೋಷ ಸಂಭವಿಸಿದೆ." : "Unable to launch demo mode.");
    } finally {
      setIsDemoSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2 text-left">
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-forest-dark tracking-tight">
          {t("auth.signupTitle")}
        </h1>
        <p className="text-sm text-charcoal-light">
          {t("auth.signupSubtitle")}
        </p>
      </div>

      {/* Demo Traveler Express Callout */}
      <div className="p-4 rounded-xl border border-amber-300/80 bg-amber-50/70 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-200/60 text-amber-900 text-[11px] font-semibold uppercase tracking-wider">
            <Sparkles size={12} className="text-amber-700" />
            {t("auth.demoBadge")}
          </span>
          <span className="text-[11px] text-amber-900/80 font-medium">1-Click Access</span>
        </div>

        <p className="text-xs text-amber-900/90 leading-relaxed">
          {t("auth.demoNotice")}
        </p>

        <button
          type="button"
          onClick={handleDemoLogin}
          disabled={isDemoSubmitting || isSubmitting}
          className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-forest text-white text-xs sm:text-sm font-semibold hover:bg-forest-light active:bg-forest-dark transition-all disabled:opacity-60 shadow-sm"
        >
          {isDemoSubmitting ? (
            <span className="inline-flex items-center gap-2">
              <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>{isKn ? "ಪ್ರವೇಶಿಸಲಾಗುತ್ತಿದೆ..." : "Launching Demo Traveler..."}</span>
            </span>
          ) : (
            <>
              <ShieldCheck size={16} />
              <span>{t("auth.demoBtn")}</span>
              <ArrowRight size={14} className="ml-auto" />
            </>
          )}
        </button>
      </div>

      {/* Divider */}
      <div className="relative flex items-center justify-center">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-charcoal/15" />
        </div>
        <span className="relative bg-[#FAF8F5] px-3 text-xs text-charcoal-light uppercase tracking-wider font-medium">
          {isKn ? "ಅಥವಾ ಹೊಸ ಖಾತೆ ತೆರೆಯಿರಿ" : "Or create a personal account"}
        </span>
      </div>

      {/* Error Banner */}
      {errorMessage && (
        <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-200 flex items-start gap-3 text-xs text-rose-800">
          <AlertCircle size={16} className="text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1 font-medium leading-relaxed">{errorMessage}</div>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Full Name Field */}
        <div className="space-y-1.5">
          <label
            htmlFor="signup-name"
            className="block text-xs font-semibold text-charcoal tracking-wide"
          >
            {t("auth.fullNameLabel")}
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-charcoal-light">
              <UserIcon size={16} />
            </div>
            <input
              id="signup-name"
              name="name"
              type="text"
              autoComplete="name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("auth.fullNamePlaceholder")}
              className={`w-full pl-9 pr-3 py-2.5 rounded-lg border bg-white text-sm text-charcoal placeholder:text-charcoal-light/50 focus:outline-hidden focus:ring-2 focus:ring-forest/30 transition-all ${
                fieldErrors.name ? "border-rose-300 ring-rose-200" : "border-charcoal/20 focus:border-forest"
              }`}
            />
          </div>
          {fieldErrors.name && (
            <p className="text-[11px] text-rose-600">{fieldErrors.name[0]}</p>
          )}
        </div>

        {/* Email Field */}
        <div className="space-y-1.5">
          <label
            htmlFor="signup-email"
            className="block text-xs font-semibold text-charcoal tracking-wide"
          >
            {t("auth.emailLabel")}
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-charcoal-light">
              <Mail size={16} />
            </div>
            <input
              id="signup-email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t("auth.emailPlaceholder")}
              className={`w-full pl-9 pr-3 py-2.5 rounded-lg border bg-white text-sm text-charcoal placeholder:text-charcoal-light/50 focus:outline-hidden focus:ring-2 focus:ring-forest/30 transition-all ${
                fieldErrors.email ? "border-rose-300 ring-rose-200" : "border-charcoal/20 focus:border-forest"
              }`}
            />
          </div>
          {fieldErrors.email && (
            <p className="text-[11px] text-rose-600">{fieldErrors.email[0]}</p>
          )}
        </div>

        {/* Password Field */}
        <div className="space-y-1.5">
          <label
            htmlFor="signup-password"
            className="block text-xs font-semibold text-charcoal tracking-wide"
          >
            {t("auth.passwordLabel")}
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-charcoal-light">
              <Lock size={16} />
            </div>
            <input
              id="signup-password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t("auth.passwordPlaceholder")}
              className={`w-full pl-9 pr-10 py-2.5 rounded-lg border bg-white text-sm text-charcoal placeholder:text-charcoal-light/50 focus:outline-hidden focus:ring-2 focus:ring-forest/30 transition-all ${
                fieldErrors.password ? "border-rose-300 ring-rose-200" : "border-charcoal/20 focus:border-forest"
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-charcoal-light hover:text-charcoal transition-colors"
              aria-label={showPassword ? t("auth.hidePassword") : t("auth.showPassword")}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {fieldErrors.password && (
            <p className="text-[11px] text-rose-600">{fieldErrors.password[0]}</p>
          )}

          {/* Password Requirements Checklist */}
          <div className="pt-1.5 grid grid-cols-3 gap-1.5 text-[11px]">
            <div className={`flex items-center gap-1 ${hasMinLength ? "text-emerald-700 font-medium" : "text-charcoal-light"}`}>
              <CheckCircle2 size={12} className={hasMinLength ? "text-emerald-600" : "text-charcoal-light/40"} />
              <span>{t("auth.passwordReqMin")}</span>
            </div>
            <div className={`flex items-center gap-1 ${hasLetter ? "text-emerald-700 font-medium" : "text-charcoal-light"}`}>
              <CheckCircle2 size={12} className={hasLetter ? "text-emerald-600" : "text-charcoal-light/40"} />
              <span>{t("auth.passwordReqLetter")}</span>
            </div>
            <div className={`flex items-center gap-1 ${hasNumber ? "text-emerald-700 font-medium" : "text-charcoal-light"}`}>
              <CheckCircle2 size={12} className={hasNumber ? "text-emerald-600" : "text-charcoal-light/40"} />
              <span>{t("auth.passwordReqNumber")}</span>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting || isDemoSubmitting}
          className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-forest bg-forest text-white text-sm font-semibold hover:bg-forest-light active:bg-forest-dark transition-all disabled:opacity-60 shadow-xs mt-2"
        >
          {isSubmitting ? (
            <span className="inline-flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>{t("auth.creatingAccount")}</span>
            </span>
          ) : (
            <span>{t("auth.signUpBtn")}</span>
          )}
        </button>
      </form>

      {/* Switch to Login */}
      <div className="text-center pt-2">
        <p className="text-xs text-charcoal-light">
          {t("auth.haveAccount")}{" "}
          <Link
            href="/login"
            className="font-semibold text-forest hover:text-terracotta underline underline-offset-2 transition-colors"
          >
            {t("auth.signInLink")}
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-sm text-charcoal-light">
          <div className="w-5 h-5 border-2 border-forest/30 border-t-forest rounded-full animate-spin mx-auto mb-2" />
          Loading registration...
        </div>
      }
    >
      <SignupForm />
    </Suspense>
  );
}

