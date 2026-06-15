import { Syne, DM_Sans, JetBrains_Mono } from "next/font/google";
import type { Metadata } from "next";
import "./globals.css";
import { HeaderClient } from "@/components/HeaderClient";
import { Footer } from "@/components/Footer";
import { CookieBanner } from "@/components/CookieBanner";
import { MobileNav } from "@/components/MobileNav";
import { UserProvider } from "@/components/UserProvider";
import { AmbientBackground } from "@/components/AmbientBackground";
import { LoginModal } from "@/components/LoginModal";

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-syne",
  weight: ["600", "700", "800"],
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm",
  weight: ["400", "500", "600"],
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
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
        className={`${syne.variable} ${dmSans.variable} ${jetbrains.variable} relative flex min-h-screen flex-col pb-20 md:pb-0`}
      >
        <AmbientBackground />
        <UserProvider>
          <HeaderClient />
          <main className="relative z-10 flex-1">{children}</main>
          <Footer />
          <CookieBanner />
          <MobileNav />
          <LoginModal />
        </UserProvider>
      </body>
    </html>
  );
}
