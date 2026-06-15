"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { AgeGate } from "@/components/AgeGate";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Step = "age" | "auth" | "blocked";

export default function LoginPage() {
  const [step, setStep] = useState<Step>("age");
  const [ageData, setAgeData] = useState<{
    isMinor: boolean;
    parentEmail?: string;
  } | null>(null);
  const [loading, setLoading] = useState<string | null>(null);

  async function signInWith(provider: "google" | "discord" | "twitter") {
    setLoading(provider);
    const supabase = createClient();
    const redirectTo = `${window.location.origin}/auth/callback`;

    await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo,
        queryParams:
          provider === "twitter"
            ? { prompt: "login" }
            : undefined,
      },
    });
  }

  if (step === "blocked") {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <h1 className="font-display text-2xl font-bold">Not quite yet</h1>
        <p className="mt-4 text-[var(--text-secondary)]">
          You must be 13 or older to use HypeRank.
        </p>
      </div>
    );
  }

  if (step === "age") {
    return (
      <div className="px-4 py-16">
        <AgeGate
          onComplete={(result) => {
            if (result.ageBracket === "blocked") {
              setStep("blocked");
              return;
            }
            setAgeData({
              isMinor: result.ageBracket === "minor",
              parentEmail: result.parentEmail,
            });
            sessionStorage.setItem(
              "hyperank_age",
              JSON.stringify({
                isMinor: result.ageBracket === "minor",
                parentEmail: result.parentEmail,
              })
            );
            setStep("auth");
          }}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Sign in to HypeRank</CardTitle>
          <p className="text-sm text-[var(--text-secondary)]">
            Vote, streak, customize your character.
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button
            className="w-full"
            variant="secondary"
            disabled={!!loading}
            onClick={() => signInWith("google")}
          >
            {loading === "google" ? "Redirecting..." : "Continue with Google"}
          </Button>
          <Button
            className="w-full"
            variant="secondary"
            disabled={!!loading}
            onClick={() => signInWith("discord")}
          >
            {loading === "discord" ? "Redirecting..." : "Continue with Discord"}
          </Button>
          <Button
            className="w-full"
            variant="secondary"
            disabled={!!loading}
            onClick={() => signInWith("twitter")}
          >
            {loading === "twitter" ? "Redirecting..." : "Continue with X"}
          </Button>

          {ageData?.isMinor && (
            <p className="pt-2 text-center text-xs text-[var(--text-secondary)]">
              Parental consent email will be sent after sign-up.
            </p>
          )}

          <p className="pt-4 text-center text-xs text-[var(--text-secondary)]">
            Already have an account?{" "}
            <button
              className="text-hype underline"
              onClick={() => setStep("auth")}
            >
              Sign in directly
            </button>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
