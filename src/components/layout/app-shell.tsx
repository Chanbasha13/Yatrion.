"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Compass,
  Calendar,
  CalendarDays,
  Route,
  Coins,
  Sparkles,
  Users,
  Activity,
  CloudSun,
  Bookmark,
  FolderHeart,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  ShieldCheck,
  RotateCcw,
  Bot,
} from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { useAuth } from "@/lib/auth/auth-context";
import { useLanguage } from "@/lib/i18n";
import { useAssistant } from "@/lib/assistant/assistant-context";
import type { User } from "@/lib/auth/auth-types";

interface AppShellProps {
  initialUser: User | null;
  children: React.ReactNode;
}

export function AppShell({ initialUser, children }: AppShellProps) {
  const pathname = usePathname();
  const { user: authUser, logout, loginDemo } = useAuth();
  const user = authUser || initialUser;
  const { t, isKn } = useLanguage();
  const { toggleOpen } = useAssistant();

  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [isResettingDemo, setIsResettingDemo] = useState(false);

  const navItems = [
    {
      group: isKn ? "ಮುಖ್ಯ ಕಾರ್ಯಸ್ಥಳ" : "Main",
      items: [
        {
          name: t("appShell.navDashboard"),
          href: "/app/dashboard",
          icon: LayoutDashboard,
          active: pathname === "/app/dashboard",
        },
        {
          name: t("appShell.navExplore"),
          href: "/app/explore",
          icon: Compass,
          active: pathname.startsWith("/app/explore") || pathname.startsWith("/app/attractions"),
        },
        {
          name: t("appShell.navPlanner"),
          href: "/app/planner",
          icon: Calendar,
          active: pathname === "/app/planner",
        },
        {
          name: t("appShell.navItinerary"),
          href: "/app/itinerary",
          icon: CalendarDays,
          active: pathname.startsWith("/app/itinerary"),
        },
      ],
    },
    {
      group: isKn ? "ಬುದ್ಧಿವಂತ ಎಂಜಿನ್‌ಗಳು" : "Intelligence Engines",
      items: [
        {
          name: t("appShell.navRoutes"),
          href: "/app/routes",
          icon: Route,
          active: pathname.startsWith("/app/routes"),
        },
        {
          name: t("appShell.navBudget"),
          href: "/app/budget",
          icon: Coins,
          active: pathname.startsWith("/app/budget"),
        },
        {
          name: t("appShell.navDiscover"),
          href: "/app/discover",
          legacyHref: "/app/gems",
          icon: Sparkles,
          active: pathname.startsWith("/app/discover") || pathname.startsWith("/app/gems"),
        },
        {
          name: t("appShell.navGroup"),
          href: "/app/group",
          icon: Users,
          active: pathname.startsWith("/app/group"),
        },
        {
          name: t("appShell.navIntelligence"),
          href: "/app/intelligence",
          legacyHref: "/app/adaptive",
          icon: Activity,
          active: pathname.startsWith("/app/intelligence") || pathname.startsWith("/app/adaptive"),
        },
        {
          name: t("appShell.navWeather"),
          href: "/app/weather",
          legacyHref: "/app/conditions",
          icon: CloudSun,
          active: pathname.startsWith("/app/weather") || pathname.startsWith("/app/conditions"),
        },
      ],
    },
    {
      group: isKn ? "ವೈಯಕ್ತಿಕ" : "Personal",
      items: [
        {
          name: t("appShell.navSaved"),
          href: "/app/saved",
          icon: Bookmark,
          active: pathname.startsWith("/app/saved"),
        },
        {
          name: t("appShell.navTrips"),
          href: "/app/trips",
          icon: FolderHeart,
          active: pathname.startsWith("/app/trips"),
        },
        {
          name: t("appShell.navSettings"),
          href: "/app/settings",
          icon: Settings,
          active: pathname.startsWith("/app/settings"),
        },
      ],
    },
  ];

  const currentWorkspaceItem = navItems
    .flatMap((g) => g.items)
    .find((it) => it.active);
  const currentWorkspaceTitle = pathname.startsWith("/app/attractions")
    ? (t("appShell.navAttractions") || "Attraction Details")
    : currentWorkspaceItem?.name || t("appShell.navDashboard");

  const handleResetDemo = async () => {
    setIsResettingDemo(true);
    try {
      await loginDemo();
      setProfileDropdownOpen(false);
      window.location.reload();
    } finally {
      setIsResettingDemo(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#FAF8F5] text-charcoal">
      {/* Mobile Drawer Backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-charcoal/50 backdrop-blur-xs lg:hidden transition-opacity"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar Navigation (Desktop & Mobile Slide-out) */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col bg-forest-dark text-white border-r border-forest-light/20 transition-all duration-300 ease-in-out ${
          collapsed ? "w-20" : "w-64"
        } ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-white/10 shrink-0">
          <Link href="/app/dashboard" className="flex items-center gap-2 overflow-hidden">
            <Logo className="text-xl text-white shrink-0" />
            {!collapsed && (
              <span className="text-[10px] uppercase tracking-widest text-amber-300/80 font-mono border border-amber-300/30 px-1.5 py-0.5 rounded-sm">
                OS
              </span>
            )}
          </Link>

          {/* Desktop Collapse Toggle */}
          <button
            type="button"
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex items-center justify-center w-7 h-7 rounded-md text-white/60 hover:text-white hover:bg-white/10 transition-colors"
            aria-label={collapsed ? t("appShell.expandSidebar") : t("appShell.collapseSidebar")}
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>

          {/* Mobile Close Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(false)}
            className="flex lg:hidden items-center justify-center w-7 h-7 rounded-md text-white/60 hover:text-white hover:bg-white/10 transition-colors"
            aria-label={t("appShell.closeMobileMenu")}
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
          {navItems.map((section) => (
            <div key={section.group} className="space-y-1">
              {!collapsed && (
                <div className="px-3 pb-1 text-[10px] font-semibold tracking-wider uppercase text-white/40">
                  {section.group}
                </div>
              )}
              {section.items.map((item) => {
                const IconComponent = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all group ${
                      item.active
                        ? "bg-forest-light text-white font-semibold shadow-xs"
                        : "text-white/70 hover:text-white hover:bg-white/5"
                    }`}
                    title={collapsed ? item.name : undefined}
                  >
                    <IconComponent
                      size={18}
                      className={`shrink-0 ${
                        item.active ? "text-amber-300" : "text-white/60 group-hover:text-white"
                      }`}
                    />
                    {!collapsed && (
                      <span className="flex-1 truncate">{item.name}</span>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </div>

        {/* Sidebar Footer — User & Mode Status */}
        <div className="p-3 border-t border-white/10 bg-black/15 shrink-0 space-y-2">
          {/* Demo Mode Badge if active */}
          {user?.isDemo && !collapsed && (
            <div className="p-2 rounded-md bg-amber-500/10 border border-amber-400/20 text-amber-200 text-[11px] flex items-center justify-between">
              <span className="inline-flex items-center gap-1 font-medium">
                <ShieldCheck size={13} className="text-amber-300" />
                {t("appShell.demoModeTag")}
              </span>
              <button
                type="button"
                onClick={handleResetDemo}
                disabled={isResettingDemo}
                className="text-[10px] underline hover:text-white transition-colors"
              >
                {t("dashboard.resetDemoBtn")}
              </button>
            </div>
          )}

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-forest-light text-white flex items-center justify-center text-xs font-semibold shrink-0 border border-white/20">
              {user?.name ? user.name[0].toUpperCase() : "T"}
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium text-white truncate">
                  {user?.name || "Traveler"}
                </div>
                <div className="text-[10px] text-white/50 truncate">
                  {user?.email || "traveler@yatrion.local"}
                </div>
              </div>
            )}
            {!collapsed && (
              <button
                type="button"
                onClick={logout}
                className="p-1.5 rounded-md text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                title={t("appShell.signOut")}
              >
                <LogOut size={15} />
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
          collapsed ? "lg:pl-20" : "lg:pl-64"
        }`}
      >
        {/* Top Navigation Bar */}
        <header className="sticky top-0 z-30 h-16 bg-white/95 backdrop-blur-md border-b border-charcoal/10 flex items-center justify-between px-4 sm:px-6 lg:px-8 shrink-0">
          {/* Left: Mobile hamburger & breadcrumbs */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-lg text-charcoal hover:bg-forest/5 transition-colors"
              aria-label={t("appShell.openMobileMenu")}
            >
              <Menu size={20} />
            </button>

            <div className="flex items-center gap-2 text-xs sm:text-sm">
              <span className="font-semibold text-forest-dark">Yatrion</span>
              <span className="text-charcoal-light">/</span>
              <span className="text-charcoal font-medium">
                {currentWorkspaceTitle}
              </span>
            </div>
          </div>

          {/* Right: Actions, Language, Profile */}
          <div className="flex items-center gap-3">
            {/* Demo Traveler indicator banner on mobile/desktop topbar */}
            {user?.isDemo && (
              <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-xs font-medium">
                <ShieldCheck size={13} className="text-amber-700" />
                {t("appShell.demoModeTag")}
              </span>
            )}

            {/* AI Companion Quick Trigger */}
            <button
              type="button"
              onClick={toggleOpen}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-forest/20 bg-forest/5 hover:bg-forest/10 text-forest text-xs font-semibold transition-all shadow-2xs"
            >
              <Bot size={14} />
              <span>{t("appShell.aiCompanionBtn")}</span>
            </button>

            {/* Language Switcher */}
            <LanguageSwitcher />

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2 p-1 rounded-full hover:ring-2 hover:ring-forest/20 transition-all focus:outline-hidden"
                aria-expanded={profileDropdownOpen}
                aria-label={t("appShell.profileLabel")}
              >
                <div className="w-8 h-8 rounded-full bg-forest text-white flex items-center justify-center text-xs font-semibold border border-forest-light">
                  {user?.name ? user.name[0].toUpperCase() : "T"}
                </div>
              </button>

              {profileDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setProfileDropdownOpen(false)}
                  />
                  <div
                    role="menu"
                    aria-label="User Account Menu"
                    className="absolute right-0 mt-2 w-56 rounded-xl bg-white border border-charcoal/10 shadow-lg py-2 z-50 text-xs space-y-1"
                  >
                    <div className="px-4 py-2 border-b border-charcoal/10">
                      <p className="font-semibold text-charcoal truncate">{user?.name}</p>
                      <p className="text-[11px] text-charcoal-light truncate">{user?.email}</p>
                      {user?.isDemo && (
                        <span className="inline-block mt-1 text-[10px] font-semibold text-amber-800 bg-amber-100 border border-amber-300 px-1.5 py-0.2 rounded-sm">
                          {t("auth.demoBadge")}
                        </span>
                      )}
                    </div>

                    {user?.isDemo && (
                      <button
                        type="button"
                        role="menuitem"
                        onClick={handleResetDemo}
                        disabled={isResettingDemo}
                        className="w-full flex items-center gap-2 px-4 py-2 text-charcoal hover:bg-amber-50 hover:text-amber-900 transition-colors"
                      >
                        <RotateCcw size={14} className="text-amber-700" />
                        <span>{t("dashboard.resetDemoBtn")}</span>
                      </button>
                    )}

                    <Link
                      href="/app/settings"
                      role="menuitem"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="w-full flex items-center gap-2 px-4 py-2 text-charcoal hover:bg-forest/5 hover:text-forest transition-colors"
                    >
                      <Settings size={14} />
                      <span>{t("appShell.navSettings")}</span>
                    </Link>

                    <div className="pt-1 border-t border-charcoal/10">
                      <button
                        type="button"
                        role="menuitem"
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          logout();
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2 text-rose-700 hover:bg-rose-50 transition-colors"
                      >
                        <LogOut size={14} />
                        <span>{t("appShell.signOut")}</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Dynamic Workspace Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
