"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { addHours } from "date-fns";

export function AdminBattleForm({
  trends,
}: {
  trends: { id: string; name: string }[];
}) {
  const [a, setA] = useState(trends[0]?.id ?? "");
  const [b, setB] = useState(trends[1]?.id ?? "");
  const [msg, setMsg] = useState("");

  async function create() {
    const res = await fetch("/api/admin/battles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        trend_a_id: a,
        trend_b_id: b,
        ends_at: addHours(new Date(), 72).toISOString(),
      }),
    });
    const data = await res.json();
    setMsg(data.error ?? "Battle created.");
  }

  return (
    <div className="mt-6 space-y-4">
      <select
        className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] p-2"
        value={a}
        onChange={(e) => setA(e.target.value)}
      >
        {trends.map((t) => (
          <option key={t.id} value={t.id}>
            {t.name}
          </option>
        ))}
      </select>
      <select
        className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] p-2"
        value={b}
        onChange={(e) => setB(e.target.value)}
      >
        {trends.map((t) => (
          <option key={t.id} value={t.id}>
            {t.name}
          </option>
        ))}
      </select>
      <Button onClick={create}>Create 72h battle</Button>
      {msg && <p className="text-sm">{msg}</p>}
    </div>
  );
}
