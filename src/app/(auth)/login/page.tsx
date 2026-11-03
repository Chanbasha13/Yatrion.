"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Lock, Mail, Sparkles, ArrowRight, AlertCircle, ShieldCheck } from "lucide-react";
import { useAuth } from "@/lib/auth/auth-context";
import { useLanguage } from "@/lib/i18n";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get("redirect") || "/app/dashboard";

  const { login, loginDemo } = useAuth();
  const { t, isKn } = useLanguage();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDemoSubmitting, setIsDemoSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ email?: string[]; password?: string[] }>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setFieldErrors({});

    if (!email.trim() || !password) {
      setErrorMessage(isKn ? "ದಯವಿಟ್ಟು ಎಲ್ಲಾ ಕ್ಷೇತ್ರಗಳನ್ನು ಭರ್ತಿ ಮಾಡಿ." : "Please fill in all required fields.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await login(email, password, redirectParam);
      if (res.success) {
        router.push(res.redirectUrl || redirectParam);
      } else {
        setErrorMessage(res.error || (isKn ? "ಲಾಗಿನ್ ವಿಫಲವಾಗಿದೆ." : "Invalid credentials. Please check and try again."));
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
          {t("auth.loginTitle")}
        </h1>
        <p className="text-sm text-charcoal-light">
          {t("auth.loginSubtitle")}
        </p>
      </div>

      {/* Demo Traveler Express Callout (Primary for Evaluators) */}
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
          {isKn ? "ಅಥವಾ ಖಾತೆಯೊಂದಿಗೆ ಲಾಗಿನ್ ಮಾಡಿ" : "Or sign in with email"}
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
        {/* Email Field */}
        <div className="space-y-1.5">
          <label
            htmlFor="login-email"
            className="block text-xs font-semibold text-charcoal tracking-wide"
          >
            {t("auth.emailLabel")}
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-charcoal-light">
              <Mail size={16} />
            </div>
            <input
              id="login-email"
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
          <div className="flex items-center justify-between">
            <label
              htmlFor="login-password"
              className="block text-xs font-semibold text-charcoal tracking-wide"
            >
              {t("auth.passwordLabel")}
            </label>
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-charcoal-light">
              <Lock size={16} />
            </div>
            <input
              id="login-password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
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
              <span>{t("auth.loggingIn")}</span>
            </span>
          ) : (
            <span>{t("auth.signInBtn")}</span>
          )}
        </button>
      </form>

      {/* Switch to Signup */}
      <div className="text-center pt-2">
        <p className="text-xs text-charcoal-light">
          {t("auth.noAccount")}{" "}
          <Link
            href="/signup"
            className="font-semibold text-forest hover:text-terracotta underline underline-offset-2 transition-colors"
          >
            {t("auth.signUpLink")}
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-sm text-charcoal-light">
          <div className="w-5 h-5 border-2 border-forest/30 border-t-forest rounded-full animate-spin mx-auto mb-2" />
          Loading authentication...
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}

