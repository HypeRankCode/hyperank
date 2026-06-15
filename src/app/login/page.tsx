"use client";

import { useState } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function signInWith(provider: "google" | "discord" | "twitter") {
    setLoading(provider);
    setError("");
    const supabase = createClient();
    const redirectTo = `${window.location.origin}/auth/callback`;

    const { error: authError } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo,
        queryParams:
          provider === "twitter" ? { prompt: "login" } : undefined,
      },
    });

    if (authError) {
      setError("Unable to start sign-in. Please try again.");
      setLoading(null);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="grid w-full max-w-4xl overflow-hidden rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] md:grid-cols-2">
        <div className="relative hidden flex-col justify-between border-r border-[var(--border-subtle)] p-10 md:flex">
          <Logo size="md" />
          <div className="space-y-4">
            <h1 className="font-display text-3xl font-semibold leading-snug text-zinc-50">
              Sign in to
              <br />
              <span className="text-[var(--accent-hype)]">HypeRank</span>
            </h1>
            <p className="max-w-xs text-sm leading-relaxed text-[var(--text-secondary)]">
              Vote on trends, track your streak, and manage your profile across
              devices.
            </p>
          </div>
          <Image
            src="/logo.png"
            alt=""
            width={160}
            height={160}
            className="opacity-90"
          />
        </div>

        <div className="flex flex-col justify-center p-8 md:p-10">
          <div className="mb-8 md:hidden">
            <Logo />
          </div>
          <h2 className="font-display text-xl font-semibold text-zinc-50">
            Continue with your account
          </h2>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">
            Choose a provider below. Age verification is completed once after your
            first sign-in.
          </p>

          <div className="mt-8 space-y-2.5">
            <Button
              className="w-full justify-center gap-3"
              variant="secondary"
              disabled={!!loading}
              onClick={() => signInWith("google")}
            >
              <GoogleIcon />
              {loading === "google" ? "Redirecting…" : "Google"}
            </Button>
            <Button
              className="w-full justify-center gap-3"
              variant="secondary"
              disabled={!!loading}
              onClick={() => signInWith("discord")}
            >
              <DiscordIcon />
              {loading === "discord" ? "Redirecting…" : "Discord"}
            </Button>
            <Button
              className="w-full justify-center gap-3"
              variant="secondary"
              disabled={!!loading}
              onClick={() => signInWith("twitter")}
            >
              <XIcon />
              {loading === "twitter" ? "Redirecting…" : "X (Twitter)"}
            </Button>
          </div>

          {error && (
            <p className="mt-4 text-center text-sm text-red-400">{error}</p>
          )}

          <p className="mt-8 text-center text-xs leading-relaxed text-[var(--text-secondary)]">
            By continuing, you agree to our{" "}
            <a
              href="/legal/terms"
              className="text-zinc-300 underline-offset-2 hover:underline"
            >
              Terms of Service
            </a>{" "}
            and{" "}
            <a
              href="/legal/privacy"
              className="text-zinc-300 underline-offset-2 hover:underline"
            >
              Privacy Policy
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24">
      <path
        fill="#EA4335"
        d="M12 11.2v3.6h5.1c-.2 1.2-1.6 3.6-5.1 3.6-3.1 0-5.6-2.5-5.6-5.6s2.5-5.6 5.6-5.6c1.8 0 3 .8 3.7 1.5l2.5-2.4C16.9 4.5 14.6 3.6 12 3.6 6.9 3.6 2.7 7.8 2.7 12.9S6.9 22.2 12 22.2c6.9 0 8.4-4.8 8.4-7.2 0-.5 0-1-.1-1.4H12z"
      />
    </svg>
  );
}

function DiscordIcon() {
  return (
    <svg className="h-4 w-4" fill="#5865F2" viewBox="0 0 24 24">
      <path d="M20.3 4.4A16.7 16.7 0 0015.5 3a12 12 0 00-.6 1.2 15.4 15.4 0 00-6.8 0A12 12 0 007.5 3 16.7 16.7 0 003.7 4.4 17.5 17.5 0 00.2 14.7a16.8 16.8 0 005.1 2.6l1.2-2a11.2 11.2 0 01-1.9-.9l.4-.3a8.1 8.1 0 007.8 0l.4.3c-.6.3-1.2.6-1.9.9l1.2 2a16.8 16.8 0 005.1-2.6A17.4 17.4 0 0020.3 4.4zM8.6 12.5c-1 0-1.8-1-1.8-2.1s.8-2.1 1.8-2.1 1.8 1 1.8 2.1-.8 2.1-1.8 2.1zm6.8 0c-1 0-1.8-1-1.8-2.1s.8-2.1 1.8-2.1 1.8 1 1.8 2.1-.8 2.1-1.8 2.1z" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
      <path d="M18.9 3H22l-7.7 8.8L23 21h-6.7l-5.2-6.8L5.6 21H2.5l8.2-9.4L1 3h6.9l4.7 6.2L18.9 3zm-1.2 16.2h1.5L7.1 4.7H5.5l12.2 14.5z" />
    </svg>
  );
}
