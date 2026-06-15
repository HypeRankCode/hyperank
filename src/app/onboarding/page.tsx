"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
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
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { useRegisterUnsavedChanges } from "@/hooks/useRegisterUnsavedChanges";
import { useUnsavedChangesStore } from "@/stores/useUnsavedChangesStore";
import {
  DEFAULT_AVATAR_CONFIG,
  PROCEDURAL_AVATAR_URL,
  type AvatarConfig,
} from "@/lib/avatar/types";
import type { User } from "@supabase/supabase-js";

const AvatarBuilder = dynamic(
  () =>
    import("@/components/AvatarBuilder").then((m) => ({
      default: m.AvatarBuilder,
    })),
  { ssr: false, loading: () => <div className="h-64 animate-pulse rounded-xl bg-white/5" /> }
);

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [ageResult, setAgeResult] = useState<AgeResult | null>(null);
  const [oauthYear, setOauthYear] = useState<number | null>(null);
  const [avatarConfig, setAvatarConfig] = useState<AvatarConfig>({
    ...DEFAULT_AVATAR_CONFIG,
  });
  const [confirmFinish, setConfirmFinish] = useState(false);
  const clearUnsaved = useUnsavedChangesStore((s) => s.clear);

  useRegisterUnsavedChanges(
    step === 2,
    "Finish building your character before leaving setup."
  );

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
        .select("username, age_verified, avatar_config")
        .eq("id", u.id)
        .maybeSingle()
        .then(({ data, error: qErr }) => {
          if (qErr) return;
          if (data?.username && data.age_verified) {
            router.push("/dashboard");
            return;
          }
          if (data?.username && !data.age_verified) {
            router.push("/onboarding/age");
          }
        });
    });
  }, [router]);

  async function handleStep1(e: React.FormEvent) {
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
        "pants_default",
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

    setLoading(false);
    setStep(2);
  }

  async function finishSetup() {
    setLoading(true);
    setError("");
    const res = await fetch("/api/avatar", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        avatar_rpm_url: PROCEDURAL_AVATAR_URL,
        appearance: avatarConfig,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Could not save avatar");
      setLoading(false);
      setConfirmFinish(false);
      return;
    }
    setConfirmFinish(false);
    clearUnsaved();
    router.push("/dashboard");
  }

  if (step === 1) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
        <div className="w-full max-w-md rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-8">
          <Logo size="sm" className="mb-8" />
          <p className="section-label">Step 1 of 2</p>
          <h1 className="font-display text-xl font-semibold text-zinc-50">
            Create your account
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)]">
            Username and birth year first — then you&apos;ll build your
            character.
          </p>

          <form onSubmit={handleStep1} className="mt-8 space-y-5">
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

            <BirthYearField defaultYear={oauthYear} onResult={setAgeResult} />

            {error && <p className="text-sm text-red-400">{error}</p>}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creating…" : "Next — build your character"}
            </Button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <Logo size="sm" className="mb-6" />
      <p className="section-label">Step 2 of 2</p>
      <h1 className="font-display text-2xl font-bold">Build your character</h1>
      <p className="mt-2 text-sm text-[var(--text-secondary)]">
        Pick your look — gender, face, hair, colors. You can change everything
        later in your locker and buy jewelry there.
      </p>

      <div className="mt-8">
        <AvatarBuilder
          value={avatarConfig}
          onChange={setAvatarConfig}
          compact
          showSaveButton={false}
        />
      </div>

      {error && <p className="mt-4 text-sm text-red-400">{error}</p>}

      <Button
        type="button"
        className="mt-8 w-full max-w-md"
        disabled={loading}
        onClick={() => setConfirmFinish(true)}
      >
        {loading ? "Finishing…" : "Finish setup"}
      </Button>

      <ConfirmDialog
        open={confirmFinish}
        title="Finish setup?"
        description="Your character will be saved and you'll head to the dashboard. You can customize more anytime in your locker."
        confirmLabel="Let's go"
        loading={loading}
        onConfirm={finishSetup}
        onCancel={() => setConfirmFinish(false)}
      />
    </div>
  );
}
