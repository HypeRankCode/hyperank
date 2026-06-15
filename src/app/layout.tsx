import { Syne, Inter } from "next/font/google";
import type { Metadata } from "next";
import "./globals.css";
import { HeaderClient } from "@/components/HeaderClient";
import { Footer } from "@/components/Footer";
import { CookieBanner } from "@/components/CookieBanner";
import { MobileNav } from "@/components/MobileNav";
import { UserProvider } from "@/components/UserProvider";

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-syne",
  weight: ["700", "800"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "HypeRank – What's Hot, What's Not",
  description:
    "Vote on what's hype and what's dead. Track the pulse of culture in real time.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://hyperank.ca"
  ),
  openGraph: {
    title: "HypeRank – What's Hot, What's Not",
    description: "Vote on what's hype and what's dead.",
    images: ["/social-banner.png"],
    siteName: "HypeRank",
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${syne.variable} ${inter.variable} flex min-h-screen flex-col pb-16 md:pb-0`}
        style={{ ["--font-syne-mono" as string]: "ui-monospace, monospace" }}
      >
        <UserProvider>
          <HeaderClient />
          <main className="flex-1">{children}</main>
          <Footer />
          <CookieBanner />
          <MobileNav />
        </UserProvider>
      </body>
    </html>
  );
}
