import type { Metadata } from "next";
import { Bricolage_Grotesque, Manrope, JetBrains_Mono } from "next/font/google";
import { AmbientGlow } from "@/components/ui/ambient-glow";
import { GlobalSignOut } from "@/components/auth/global-sign-out";
import { OAuthCodeListener } from "@/components/auth/oauth-code-listener";
import "./globals.css";

const display = Bricolage_Grotesque({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});

const body = Manrope({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
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
      className={`${display.variable} ${body.variable} ${mono.variable} h-full`}
    >
      <body className="min-h-full bg-canvas text-ink antialiased selection:bg-accent selection:text-canvas">
        <AmbientGlow />
        <OAuthCodeListener />
        <GlobalSignOut />
        {children}
      </body>
    </html>
  );
}
