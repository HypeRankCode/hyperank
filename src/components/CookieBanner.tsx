"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookie_consent");
    if (!consent) setVisible(true);
  }, []);

  const acceptAll = () => {
    localStorage.setItem("cookie_consent", "all");
    localStorage.setItem("cookie_consent_date", new Date().toISOString());
    setVisible(false);
    if (typeof window !== "undefined" && "gtag" in window) {
      const w = window as Window & { gtag?: (...args: unknown[]) => void };
      w.gtag?.("consent", "update", { analytics_storage: "granted" });
    }
  };

  const acceptEssential = () => {
    localStorage.setItem("cookie_consent", "essential");
    localStorage.setItem("cookie_consent_date", new Date().toISOString());
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-16 left-4 right-4 z-50 md:bottom-4 md:left-auto md:right-4 md:max-w-md">
      <div className="surface-card rounded-2xl border border-white/10 p-5 shadow-card backdrop-blur-2xl">
        <p className="text-sm text-[var(--text-primary)]">
          We use cookies to keep you logged in and understand how HypeRank is
          used.{" "}
          <Link href="/legal/cookies" className="text-red-400 hover:underline">
            Cookie Policy
          </Link>
        </p>
        <div className="mt-4 flex gap-2">
          <Button variant="ghost" size="sm" onClick={acceptEssential} className="flex-1">
            Essential only
          </Button>
          <Button size="sm" onClick={acceptAll} className="flex-1">
            Accept all
          </Button>
        </div>
      </div>
    </div>
  );
}
