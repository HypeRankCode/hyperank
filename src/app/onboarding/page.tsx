"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { sanitizeText } from "@/lib/sanitize";
import { validateUserContent } from "@/lib/moderation";
import {
  birthYearFromOAuthUser,
  type AgeResult,
} from "@/lib/age";
import { BirthYearField } from "@/components/BirthYearField";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Logo } from "@/components/Logo";
import type { User } from "@supabase/supabase-js";

export default function OnboardingPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [ageResult, setAgeResult] = useState<AgeResult | null>(null);
  const [oauthYear, setOauthYear] = useState<number | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user: u } }) => {
      if (!u) {
        router.push("/login");
        return;
      }
      setUser(u);
      const detected = birthYearFromOAuthUser(u);
      if (detected) {
        setOauthYear(detected);
        setAgeResult({
          birthYear: detected,
          blocked: false,
          isMinor: new Date().getFullYear() - detected < 18,
        });
      }
      supabase
        .from("profiles")
        .select("username, age_verified")
        .eq("id", u.id)
        .maybeSingle()
        .then(({ data, error }) => {
          if (error) return;
          if (data?.username && data.age_verified) router.push("/dashboard");
          else if (data?.username && !data.age_verified)
            router.push("/onboarding/age");
        });
    });
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!ageResult || ageResult.blocked) {
      setError("Select a valid birth year.");
      return;
    }

    setLoading(true);
    const cleaned = sanitizeText(username, 20);
    const validation = validateUserContent(cleaned, 20);
    if (!validation.ok || !/^[a-zA-Z0-9_]{3,20}$/.test(cleaned)) {
      setError("Use 3–20 characters: letters, numbers, underscore.");
      setLoading(false);
      return;
    }

    const supabase = createClient();
    const { error: insertError } = await supabase.from("profiles").insert({
      id: user!.id,
      username: cleaned,
      is_minor: ageResult.isMinor,
      age_verified: true,
      is_public: !ageResult.isMinor,
      owned_cosmetic_ids: [
        "hat_default",
        "shirt_default",
        "shirt_hyperank",
        "shoes_default",
      ],
    });

    if (insertError) {
      setError(
        insertError.code === "23505"
          ? "Username taken."
          : "Something went wrong. Try again."
      );
      setLoading(false);
      return;
    }

    router.push("/locker");
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-8">
        <Logo size="sm" className="mb-8" />
        <h1 className="font-display text-xl font-semibold text-zinc-50">
          Complete your profile
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)]">
          Choose a username and confirm your birth year to finish setup.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div>
            <label className="text-sm text-[var(--text-secondary)]">
              Username
            </label>
            <Input
              className="mt-1.5"
              placeholder="yourname"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              maxLength={20}
              required
            />
          </div>

          <BirthYearField
            defaultYear={oauthYear}
            onResult={setAgeResult}
          />

          {error && <p className="text-sm text-red-400">{error}</p>}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Creating account…" : "Continue"}
          </Button>
        </form>
      </div>
    </div>
  );
}
