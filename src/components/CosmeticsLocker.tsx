"use client";

import { useState } from "react";
import { Avatar3D } from "./Avatar3DClient";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { useUserStore } from "@/stores/useUserStore";

interface Cosmetic {
  id: string;
  name: string;
  category: string;
  cost_credits: number;
  rarity: string;
  unlock_condition: string | null;
}

interface CosmeticsLockerProps {
  cosmetics: Cosmetic[];
  ownedIds: string[];
  equipped: Record<string, string>;
  modelUrl: string;
}

const CATEGORIES = [
  "hat",
  "shirt",
  "pants",
  "shoes",
  "accessory",
  "background",
  "effect",
];

const rarityColor: Record<string, string> = {
  common: "border-gray-500",
  rare: "border-blue-500",
  legendary: "border-gold",
  epic: "border-purple-500",
  mythic: "border-hype",
};

export function CosmeticsLocker({
  cosmetics,
  ownedIds,
  equipped: initialEquipped,
  modelUrl,
}: CosmeticsLockerProps) {
  const [category, setCategory] = useState("hat");
  const [equipped, setEquipped] = useState(initialEquipped);
  const [saving, setSaving] = useState(false);
  const profile = useUserStore((s) => s.profile);

  const filtered = cosmetics.filter((c) => c.category === category);

  async function equip(id: string) {
    if (!ownedIds.includes(id)) return;
    const next = { ...equipped, [category]: id };
    setEquipped(next);
  }

  async function save() {
    setSaving(true);
    await fetch("/api/avatar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ avatar_config: equipped }),
    });
    setSaving(false);
  }

  async function purchase(id: string, cost: number) {
    if (!profile || profile.credits < cost) return;
    await fetch("/api/cosmetics/purchase", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cosmetic_id: id }),
    });
    window.location.reload();
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="card-glass flex min-h-[400px] items-center justify-center p-4">
        <Avatar3D modelUrl={modelUrl} size="full" />
      </div>

      <div>
        <div className="mb-4 flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`rounded-full px-3 py-1 text-sm capitalize ${
                category === cat
                  ? "bg-hype text-white"
                  : "bg-[var(--bg-elevated)] text-[var(--text-secondary)]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {filtered.map((item) => {
            const owned = ownedIds.includes(item.id);
            const isEquipped = equipped[category] === item.id;
            return (
              <button
                key={item.id}
                onClick={() =>
                  owned ? equip(item.id) : purchase(item.id, item.cost_credits)
                }
                className={`card-glass relative p-3 text-left transition ${
                  rarityColor[item.rarity] ?? ""
                } border ${isEquipped ? "ring-2 ring-hype" : ""}`}
              >
                <p className="text-sm font-medium">{item.name}</p>
                <Badge variant="outline" className="mt-1 text-[10px]">
                  {item.rarity}
                </Badge>
                {!owned && (
                  <p className="mt-2 text-xs text-gold">
                    {item.cost_credits > 0
                      ? `${item.cost_credits} credits`
                      : item.unlock_condition}
                  </p>
                )}
              </button>
            );
          })}
        </div>

        <Button className="mt-6 w-full" onClick={save} disabled={saving}>
          {saving ? "Saving..." : "Save outfit"}
        </Button>
      </div>
    </div>
  );
}
