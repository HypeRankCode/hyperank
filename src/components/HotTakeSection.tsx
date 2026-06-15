"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface HotTake {
  id: string;
  content: string;
  upvotes: number;
  profiles?: { username: string } | { username: string }[] | null;
}

export function HotTakeSection({
  trendId,
  initialTakes = [],
}: {
  trendId: string;
  initialTakes?: HotTake[];
}) {
  const [takes, setTakes] = useState<HotTake[]>(initialTakes);
  const [content, setContent] = useState("");
  const [error, setError] = useState("");

  async function submit() {
    setError("");
    const res = await fetch("/api/hot-takes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ trend_id: trendId, content }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Failed");
      return;
    }
    setTakes((t) => [data.hot_take, ...t]);
    setContent("");
  }

  async function upvote(id: string) {
    await fetch(`/api/hot-takes/${id}/upvote`, { method: "POST" });
    setTakes((t) =>
      t.map((x) => (x.id === id ? { ...x, upvotes: x.upvotes + 1 } : x))
    );
  }

  return (
    <section className="mt-8">
      <h3 className="font-display text-lg font-bold">Hot Takes</h3>

      <div className="mt-4 flex gap-2">
        <Input
          placeholder="Say something (140 chars)"
          maxLength={140}
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <Button onClick={submit}>Post</Button>
      </div>
      {error && <p className="mt-1 text-sm text-hype">{error}</p>}

      <div className="mt-4 space-y-3">
        {takes.length === 0 && (
          <p className="text-sm text-[var(--text-secondary)]">
            Nothing here yet. Be the first to say something.
          </p>
        )}
        {takes.map((t) => (
          <div key={t.id} className="card-glass p-4">
            <p className="text-sm">{t.content}</p>
            <div className="mt-2 flex items-center justify-between text-xs text-[var(--text-secondary)]">
              <span>
                @
                {Array.isArray(t.profiles)
                  ? t.profiles[0]?.username
                  : t.profiles?.username ?? "anon"}
              </span>
              <button onClick={() => upvote(t.id)} className="hover:text-hype">
                ▲ {t.upvotes}
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
