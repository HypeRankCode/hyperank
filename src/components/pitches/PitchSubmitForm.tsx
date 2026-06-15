"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useRequireAuth } from "@/hooks/useRequireAuth";

export function PitchSubmitForm() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requireAuth = useRequireAuth();
  const router = useRouter();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!requireAuth("Sign in to pitch the next hype thing")) return;

    setLoading(true);
    try {
      const res = await fetch("/api/pitches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not submit pitch.");
        return;
      }
      setTitle("");
      setDescription("");
      router.refresh();
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <div>
        <label htmlFor="pitch-title" className="sr-only">
          Pitch title
        </label>
        <input
          id="pitch-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What's the next thing that should blow up?"
          maxLength={80}
          required
          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-[var(--text-secondary)] focus:border-red-500/40 focus:outline-none focus:ring-1 focus:ring-red-500/30"
        />
      </div>
      <div>
        <label htmlFor="pitch-desc" className="sr-only">
          Why it&apos;ll go viral
        </label>
        <textarea
          id="pitch-desc"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Why will people care? (optional)"
          maxLength={280}
          rows={2}
          className="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-[var(--text-secondary)] focus:border-red-500/40 focus:outline-none focus:ring-1 focus:ring-red-500/30"
        />
      </div>
      {error && (
        <p className="text-sm text-red-400" role="alert">
          {error}
        </p>
      )}
      <Button type="submit" disabled={loading || title.trim().length < 3}>
        {loading ? "Submitting…" : "Submit audition"}
      </Button>
    </form>
  );
}
