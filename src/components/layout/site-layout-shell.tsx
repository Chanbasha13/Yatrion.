"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { SiteHeader } from "./site-header";

interface SiteLayoutShellProps {
  children: React.ReactNode;
}

export function SiteLayoutShell({ children }: SiteLayoutShellProps) {
  const pathname = usePathname();
  const isAppOrAuth =
    pathname?.startsWith("/app") ||
    pathname?.startsWith("/login") ||
    pathname?.startsWith("/signup");

  if (isAppOrAuth) {
    return <main className="flex-1 flex flex-col min-h-0">{children}</main>;
  }

  return (
    <>
      <SiteHeader />
      <main className="flex-1">{children}</main>
    </>
  );
}
