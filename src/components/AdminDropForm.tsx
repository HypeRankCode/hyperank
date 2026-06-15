"use client";

import { useState } from "react";
import { addDays } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Cosmetic {
  id: string;
  name: string;
  rarity: string;
  cost_credits: number;
}

export function AdminDropForm({ cosmetics }: { cosmetics: Cosmetic[] }) {
  const [name, setName] = useState("Weekly Drop");
  const [selected, setSelected] = useState<string[]>([]);
  const [msg, setMsg] = useState("");

  function toggle(id: string) {
    setSelected((s) =>
      s.includes(id) ? s.filter((x) => x !== id) : [...s, id]
    );
  }

  async function create() {
    const res = await fetch("/api/admin/drops", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        ends_at: addDays(new Date(), 7).toISOString(),
        cosmetic_ids: selected,
      }),
    });
    const data = await res.json();
    setMsg(data.error ?? `Drop created with ${data.items ?? 0} items.`);
  }

  return (
    <div className="mt-6 space-y-4">
      <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Drop name" />
      <div className="max-h-64 space-y-2 overflow-y-auto rounded-xl border border-white/10 p-3">
        {cosmetics.map((c) => (
          <label
            key={c.id}
            className="flex cursor-pointer items-center gap-2 text-sm"
          >
            <input
              type="checkbox"
              checked={selected.includes(c.id)}
              onChange={() => toggle(c.id)}
            />
            <span>{c.name}</span>
            <span className="text-[var(--text-secondary)]">({c.rarity})</span>
          </label>
        ))}
      </div>
      <Button onClick={create} disabled={!selected.length}>
        Create active drop
      </Button>
      {msg && <p className="text-sm text-[var(--text-secondary)]">{msg}</p>}
    </div>
  );
}
