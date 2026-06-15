"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Item {
  id: string;
  name: string;
  serial: number | null;
}

export function MarketListForm({ items }: { items: Item[] }) {
  const [selected, setSelected] = useState(items[0]?.id ?? "");
  const [price, setPrice] = useState(100);
  const [error, setError] = useState("");

  async function submit() {
    const res = await fetch("/api/marketplace/list", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        inventory_item_id: selected,
        asking_price: price,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Failed");
      return;
    }
    window.location.href = "/shop/market";
  }

  if (!items.length) {
    return (
      <p className="mt-4 text-[var(--text-secondary)]">
        Nothing to list. Check the weekly drop.
      </p>
    );
  }

  return (
    <div className="mt-6 space-y-4">
      <select
        className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] p-2"
        value={selected}
        onChange={(e) => setSelected(e.target.value)}
      >
        {items.map((i) => (
          <option key={i.id} value={i.id}>
            {i.name}
            {i.serial ? ` #${i.serial}` : ""}
          </option>
        ))}
      </select>
      <Input
        type="number"
        min={1}
        value={price}
        onChange={(e) => setPrice(Number(e.target.value))}
        placeholder="Price in credits"
      />
      {error && <p className="text-sm text-hype">{error}</p>}
      <Button onClick={submit}>List</Button>
    </div>
  );
}
