import { Syne, Inter } from "next/font/google";
import type { Metadata } from "next";
import { Toaster } from "sonner";
import "./globals.css";
import { HeaderClient } from "@/components/HeaderClient";
import { Footer } from "@/components/Footer";
import { CookieBanner } from "@/components/CookieBanner";
import { MobileNav } from "@/components/MobileNav";
import { UserProvider } from "@/components/UserProvider";
import { AmbientBackground } from "@/components/AmbientBackground";
import { LoginModal } from "@/components/LoginModal";
import { UnsavedChangesGuard } from "@/components/UnsavedChangesGuard";

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-syne",
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["400", "500", "600"],
  display: "swap",
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
    <html
      lang="en"
      className={`dark ${syne.variable} ${inter.variable}`}
    >
      <body className="relative flex min-h-screen flex-col pb-20 md:pb-0">
        <AmbientBackground />
        <UserProvider>
          <HeaderClient />
          <main className="relative z-10 flex-1">{children}</main>
          <Footer />
          <CookieBanner />
          <MobileNav />
          <LoginModal />
          <UnsavedChangesGuard />
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: "var(--bg-raised)",
                border: "1px solid var(--border-bright)",
                color: "var(--text-1)",
                fontFamily: "var(--font-inter)",
                fontSize: "0.875rem",
              },
            }}
            className="md:bottom-4 md:right-4 max-md:bottom-20 max-md:left-1/2 max-md:-translate-x-1/2"
          />
        </UserProvider>
      </body>
    </html>
  );
}
