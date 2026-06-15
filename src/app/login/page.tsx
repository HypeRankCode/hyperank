"use client";

import { useState, useEffect, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { getSiteUrl } from "@/lib/site";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Mode = "signin" | "signup" | "forgot";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") ?? "/dashboard";
  const urlError = searchParams.get("error");

  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (urlError === "auth") {
      setError("Sign-in failed. Try again or use a different method.");
    }
  }, [urlError]);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        router.replace(redirect.startsWith("/") ? redirect : "/dashboard");
      }
    });
  }, [router, redirect]);

  async function routeAfterLogin() {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      router.push(redirect);
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("username, age_verified")
      .eq("id", user.id)
      .maybeSingle();

    if (!profile?.username) router.push("/onboarding");
    else if (!profile.age_verified) router.push("/onboarding/age");
    else router.push(redirect.startsWith("/") ? redirect : "/dashboard");
  }

  async function signInWith(provider: "google" | "discord" | "twitter") {
    setLoading(provider);
    setError("");
    setMessage("");
    const supabase = createClient();
    const callbackUrl = new URL(`${getSiteUrl()}/auth/callback`);
    if (redirect && redirect !== "/dashboard") {
      callbackUrl.searchParams.set("redirect", redirect);
    }

    const { error: authError } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: callbackUrl.toString(),
        queryParams:
          provider === "twitter" ? { prompt: "login" } : undefined,
      },
    });

    if (authError) {
      setError(authError.message);
      setLoading(null);
    }
  }

  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading("email");

    const supabase = createClient();

    try {
      if (mode === "forgot") {
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(
          email,
          { redirectTo: `${getSiteUrl()}/auth/callback?type=recovery` }
        );
        if (resetError) throw resetError;
        setMessage("Check your email for a password reset link.");
        setLoading(null);
        return;
      }

      if (mode === "signup") {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${getSiteUrl()}/auth/callback`,
          },
        });
        if (signUpError) throw signUpError;
        setMessage(
          "Account created. Check your email to confirm, then sign in."
        );
        setMode("signin");
        setLoading(null);
        return;
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (signInError) throw signInError;

      await routeAfterLogin();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setLoading(null);
    }
  }

  return (
    <div className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
      <div className="grid w-full max-w-4xl overflow-hidden rounded-3xl border border-white/10 bg-black/40 shadow-card backdrop-blur-xl md:grid-cols-2">
        <div className="relative hidden flex-col justify-between overflow-hidden p-10 md:flex">
          <div
            className="absolute inset-0 opacity-40"
            style={{
              background:
                "radial-gradient(ellipse at top left, #ff2b2b 0%, transparent 60%)",
            }}
          />
          <div className="relative">
            <Logo size="lg" />
          </div>
          <div className="relative space-y-4">
            <h1 className="font-display text-4xl font-extrabold leading-tight">
              Vote on
              <br />
              <span className="text-gradient-fire">culture.</span>
            </h1>
            <p className="max-w-xs text-sm text-[var(--text-secondary)]">
              What&apos;s hot. What&apos;s dead. Build your streak. Flex your
              avatar.
            </p>
          </div>
          <div className="relative animate-float">
            <Image
              src="/logo.png"
              alt=""
              width={200}
              height={200}
              className="opacity-90 drop-shadow-[0_0_40px_rgba(255,43,43,0.5)]"
            />
          </div>
        </div>

        <div className="flex flex-col justify-center p-8 md:p-10">
          <div className="mb-6 md:hidden">
            <Logo />
          </div>

          <h2 className="font-display text-2xl font-bold">
            {mode === "signup"
              ? "Create account"
              : mode === "forgot"
                ? "Reset password"
                : "Welcome back"}
          </h2>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">
            {mode === "forgot"
              ? "We'll email you a reset link."
              : "OAuth, email, or both — your call."}
          </p>

          {mode !== "forgot" && (
            <div className="mt-6 space-y-3">
              <Button
                className="w-full justify-center gap-3"
                variant="secondary"
                disabled={!!loading}
                onClick={() => signInWith("google")}
              >
                <GoogleIcon />
                {loading === "google" ? "Redirecting…" : "Continue with Google"}
              </Button>
              <Button
                className="w-full justify-center gap-3"
                variant="secondary"
                disabled={!!loading}
                onClick={() => signInWith("discord")}
              >
                <DiscordIcon />
                {loading === "discord"
                  ? "Redirecting…"
                  : "Continue with Discord"}
              </Button>
              <Button
                className="w-full justify-center gap-3"
                variant="secondary"
                disabled={!!loading}
                onClick={() => signInWith("twitter")}
              >
                <XIcon />
                {loading === "twitter" ? "Redirecting…" : "Continue with X"}
              </Button>
            </div>
          )}

          {mode !== "forgot" && (
            <div className="my-6 flex items-center gap-3">
              <div className="h-px flex-1 bg-white/10" />
              <span className="text-xs text-[var(--text-secondary)]">or</span>
              <div className="h-px flex-1 bg-white/10" />
            </div>
          )}

          <form onSubmit={handleEmailSubmit} className="space-y-3">
            <div>
              <label className="text-sm text-[var(--text-secondary)]">
                Email
              </label>
              <Input
                className="mt-1.5"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {mode !== "forgot" && (
              <div>
                <div className="flex items-center justify-between">
                  <label className="text-sm text-[var(--text-secondary)]">
                    Password
                  </label>
                  {mode === "signin" && (
                    <button
                      type="button"
                      className="text-xs text-red-400 hover:underline"
                      onClick={() => {
                        setMode("forgot");
                        setError("");
                        setMessage("");
                      }}
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <Input
                  className="mt-1.5"
                  type="password"
                  autoComplete={
                    mode === "signup" ? "new-password" : "current-password"
                  }
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={!!loading}
            >
              {loading === "email"
                ? "Working…"
                : mode === "signup"
                  ? "Sign up with email"
                  : mode === "forgot"
                    ? "Send reset link"
                    : "Sign in with email"}
            </Button>
          </form>

          {error && (
            <p className="mt-4 text-center text-sm text-red-400">{error}</p>
          )}
          {message && (
            <p className="mt-4 text-center text-sm text-emerald-400">
              {message}
            </p>
          )}

          <p className="mt-6 text-center text-sm text-[var(--text-secondary)]">
            {mode === "signup" ? (
              <>
                Already have an account?{" "}
                <button
                  type="button"
                  className="text-red-400 hover:underline"
                  onClick={() => setMode("signin")}
                >
                  Sign in
                </button>
              </>
            ) : mode === "forgot" ? (
              <>
                <button
                  type="button"
                  className="text-red-400 hover:underline"
                  onClick={() => setMode("signin")}
                >
                  Back to sign in
                </button>
              </>
            ) : (
              <>
                New here?{" "}
                <button
                  type="button"
                  className="text-red-400 hover:underline"
                  onClick={() => setMode("signup")}
                >
                  Create account
                </button>
              </>
            )}
          </p>

          <p className="mt-6 text-center text-xs text-[var(--text-secondary)]">
            By continuing you agree to our{" "}
            <Link href="/legal/terms" className="text-red-400 hover:underline">
              Terms
            </Link>
            . Age check happens once after sign-in.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center text-[var(--text-secondary)]">
          Loading…
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}

function GoogleIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24">
      <path
        fill="#EA4335"
        d="M12 11.2v3.6h5.1c-.2 1.2-1.6 3.6-5.1 3.6-3.1 0-5.6-2.5-5.6-5.6s2.5-5.6 5.6-5.6c1.8 0 3 .8 3.7 1.5l2.5-2.4C16.9 4.5 14.6 3.6 12 3.6 6.9 3.6 2.7 7.8 2.7 12.9S6.9 22.2 12 22.2c6.9 0 8.4-4.8 8.4-7.2 0-.5 0-1-.1-1.4H12z"
      />
    </svg>
  );
}

function DiscordIcon() {
  return (
    <svg className="h-5 w-5" fill="#5865F2" viewBox="0 0 24 24">
      <path d="M20.3 4.4A16.7 16.7 0 0015.5 3a12 12 0 00-.6 1.2 15.4 15.4 0 00-6.8 0A12 12 0 007.5 3 16.7 16.7 0 003.7 4.4 17.5 17.5 0 00.2 14.7a16.8 16.8 0 005.1 2.6l1.2-2a11.2 11.2 0 01-1.9-.9l.4-.3a8.1 8.1 0 007.8 0l.4.3c-.6.3-1.2.6-1.9.9l1.2 2a16.8 16.8 0 005.1-2.6A17.4 17.4 0 0020.3 4.4zM8.6 12.5c-1 0-1.8-1-1.8-2.1s.8-2.1 1.8-2.1 1.8 1 1.8 2.1-.8 2.1-1.8 2.1zm6.8 0c-1 0-1.8-1-1.8-2.1s.8-2.1 1.8-2.1 1.8 1 1.8 2.1-.8 2.1-1.8 2.1z" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M18.9 3H22l-7.7 8.8L23 21h-6.7l-5.2-6.8L5.6 21H2.5l8.2-9.4L1 3h6.9l4.7 6.2L18.9 3zm-1.2 16.2h1.5L7.1 4.7H5.5l12.2 14.5z" />
    </svg>
  );
}
