import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { LanguageProvider } from "@/lib/i18n";
import { AssistantProvider } from "@/lib/assistant/assistant-context";
import { AuthProvider } from "@/lib/auth/auth-context";
import { SiteLayoutShell } from "@/components/layout/site-layout-shell";
import { FloatingAssistantButton, AssistantPanel } from "@/components/assistant";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Yatrion — Discover Karnataka, differently.",
    template: "%s | Yatrion",
  },
  description:
    "An intelligent travel planner for exploring Karnataka. Discover heritage, nature, beaches, hill stations, and food trails across 31 districts.",
  keywords: [
    "Karnataka",
    "travel planner",
    "itinerary",
    "Yatrion",
    "tourism",
    "Hampi",
    "Coorg",
    "Mysuru",
    "Western Ghats",
    "Kannada",
  ],
  authors: [{ name: "Yatrion" }],
  icons: {
    icon: "/favicon.svg",
  },
  openGraph: {
    title: "Yatrion — Discover Karnataka, differently.",
    description:
      "An intelligent travel planner for exploring Karnataka.",
    siteName: "Yatrion",
    locale: "en_IN",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#1B4332",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${playfair.variable} h-full`}
    >
      <body className="min-h-full flex flex-col antialiased">
        <LanguageProvider>
          <AuthProvider>
            <AssistantProvider>
              <SiteLayoutShell>{children}</SiteLayoutShell>
              <FloatingAssistantButton />
              <AssistantPanel />
            </AssistantProvider>
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
