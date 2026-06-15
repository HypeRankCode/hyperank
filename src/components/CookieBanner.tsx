"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

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
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-[var(--border)] bg-[var(--bg-card)] p-4">
      <div className="mx-auto flex max-w-4xl flex-col items-start gap-4 sm:flex-row sm:items-center">
        <p className="flex-1 text-sm text-[var(--text-primary)]">
          We use cookies to keep you logged in and understand how HypeRank is
          used. No ad cookies unless you accept all.{" "}
          <Link href="/legal/cookies" className="underline">
            Cookie Policy
          </Link>
        </p>
        <div className="flex shrink-0 gap-2">
          <button
            onClick={acceptEssential}
            className="rounded-full border border-[var(--border)] px-4 py-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          >
            Essential Only
          </button>
          <button
            onClick={acceptAll}
            className="rounded-full bg-hype px-4 py-2 text-sm font-semibold text-white"
          >
            Accept All
          </button>
        </div>
      </div>
    </div>
  );
}
