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
        .single()
        .then(({ data }) => {
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
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-black/50 p-8 shadow-hype-sm backdrop-blur-xl">
        <Logo size="sm" className="mb-8" />
        <h1 className="font-display text-2xl font-bold">Almost in</h1>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          Pick a username and confirm your birth year. One time, then you&apos;re
          done.
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
            {loading ? "Setting up…" : "Enter HypeRank"}
          </Button>
        </form>
      </div>
    </div>
  );
}
