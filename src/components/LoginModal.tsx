"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { getSiteUrl } from "@/lib/site";
import { useAuthModalStore } from "@/stores/useAuthModalStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function LoginModal() {
  const { open, message, hide } = useAuthModalStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") hide();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, hide]);

  async function oauth(provider: "google" | "discord" | "twitter") {
    setLoading(provider);
    setError("");
    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${getSiteUrl()}/auth/callback` },
    });
    if (authError) {
      setError(authError.message);
      setLoading(null);
    }
  }

  async function emailSignIn(e: React.FormEvent) {
    e.preventDefault();
    setLoading("email");
    setError("");
    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (signInError) {
      setError(signInError.message);
      setLoading(null);
      return;
    }
    hide();
    window.location.reload();
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.button
            type="button"
            aria-label="Close"
            className="absolute inset-0 bg-black/75 backdrop-blur-sm"
            onClick={hide}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            className="relative w-full max-w-md overflow-hidden rounded-2xl border border-red-500/20 bg-[#0c0c0c] p-6 shadow-[0_0_40px_rgba(255,43,43,0.25)]"
            initial={{ opacity: 0, scale: 0.92, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ type: "spring", stiffness: 400, damping: 28 }}
          >
            <h2 className="font-display text-xl font-bold">You&apos;re not in yet</h2>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">{message}</p>

            <div className="mt-5 space-y-2">
              <Button
                className="w-full gap-2"
                variant="secondary"
                disabled={!!loading}
                onClick={() => oauth("google")}
              >
                {loading === "google" ? "…" : "Continue with Google"}
              </Button>
              <Button
                className="w-full gap-2"
                variant="secondary"
                disabled={!!loading}
                onClick={() => oauth("discord")}
              >
                {loading === "discord" ? "…" : "Continue with Discord"}
              </Button>
            </div>

            <div className="my-4 flex items-center gap-2">
              <div className="h-px flex-1 bg-white/10" />
              <span className="text-xs text-[var(--text-secondary)]">or email</span>
              <div className="h-px flex-1 bg-white/10" />
            </div>

            <form onSubmit={emailSignIn} className="space-y-2">
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <Button type="submit" className="w-full" disabled={!!loading}>
                {loading === "email" ? "Signing in…" : "Sign in"}
              </Button>
            </form>

            {error && <p className="mt-3 text-sm text-red-400">{error}</p>}

            <p className="mt-4 text-center text-xs text-[var(--text-secondary)]">
              No account?{" "}
              <Link href="/login" className="text-red-400 hover:underline" onClick={hide}>
                Sign up on the login page
              </Link>
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
