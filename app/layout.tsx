import type { Metadata } from "next";
import { DM_Sans, Instrument_Serif, JetBrains_Mono } from "next/font/google";
import { AmbientGlow } from "@/components/ui/ambient-glow";
import { GlobalSignOut } from "@/components/auth/global-sign-out";
import { ActivityHeartbeat } from "@/components/activity-heartbeat";
import "./globals.css";

const display = DM_Sans({
  variable: "--font-display",
  subsets: ["latin"],
});

const body = DM_Sans({
  variable: "--font-body",
  subsets: ["latin"],
});

// Only for the one or two italic accent words in a headline.
const serif = Instrument_Serif({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: "400",
  style: "italic",
});

const mono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const title = "SaaSFounder — Deviens fondateur de ton premier SaaS";
const description =
  "La méthode pour trouver ton idée, la construire avec l'IA et encaisser tes premiers revenus. Sans expérience, sans code.";

export const metadata: Metadata = {
  metadataBase: new URL("https://saasfounder.fr"),
  title,
  description,
  alternates: { canonical: "/" },
  openGraph: {
    title,
    description,
    url: "/",
    siteName: "SaaSFounder",
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary",
    title,
    description,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="fr"
      className={`${display.variable} ${body.variable} ${serif.variable} ${mono.variable} h-full`}
    >
      <body className="min-h-full bg-canvas text-ink antialiased">
        <AmbientGlow />
        <ActivityHeartbeat />
        <GlobalSignOut />
        {children}
      </body>
    </html>
  );
}
