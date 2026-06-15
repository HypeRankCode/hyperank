"use client";

import { useMemo, useState } from "react";
import { Avatar3D } from "./Avatar3DClient";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { ConfirmDialog } from "./ConfirmDialog";
import { useUserStore } from "@/stores/useUserStore";
import { useRegisterUnsavedChanges } from "@/hooks/useRegisterUnsavedChanges";
import {
  getAppearanceFromConfig,
  hasUnownedEquipped,
  ownedEquippedOnly,
} from "@/lib/avatar/types";

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
  avatarConfig?: Record<string, unknown> | null;
}

const CATEGORIES = [
  "hat",
  "shirt",
  "pants",
  "shoes",
  "watch",
  "chain",
  "earrings",
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
  ownedIds: initialOwnedIds,
  equipped: initialEquipped,
  modelUrl,
  avatarConfig,
}: CosmeticsLockerProps) {
  const appearance = getAppearanceFromConfig(avatarConfig);
  const [category, setCategory] = useState("hat");
  const [savedEquipped, setSavedEquipped] = useState(initialEquipped);
  const [previewEquipped, setPreviewEquipped] = useState(initialEquipped);
  const [ownedIds, setOwnedIds] = useState(initialOwnedIds);
  const [saving, setSaving] = useState(false);
  const [buying, setBuying] = useState(false);
  const [error, setError] = useState("");
  const [confirmSave, setConfirmSave] = useState(false);
  const [confirmClearAll, setConfirmClearAll] = useState(false);
  const [confirmClearLocked, setConfirmClearLocked] = useState(false);
  const [pendingBuy, setPendingBuy] = useState<Cosmetic | null>(null);

  const profile = useUserStore((s) => s.profile);
  const setProfile = useUserStore((s) => s.setProfile);
  const updateCredits = useUserStore((s) => s.updateCredits);

  const filtered = cosmetics.filter((c) => c.category === category);

  const previewHasUnowned = useMemo(
    () => hasUnownedEquipped(previewEquipped, ownedIds),
    [previewEquipped, ownedIds]
  );

  const hasUnsavedChanges = useMemo(() => {
    const ownedPreview = ownedEquippedOnly(previewEquipped, ownedIds);
    return JSON.stringify(ownedPreview) !== JSON.stringify(savedEquipped);
  }, [previewEquipped, savedEquipped, ownedIds]);

  const selectedPreviewId = previewEquipped[category];
  const selectedItem = filtered.find((c) => c.id === selectedPreviewId);
  const selectedOwned = selectedPreviewId
    ? ownedIds.includes(selectedPreviewId)
    : true;

  function tryOn(id: string) {
    setError("");
    setPreviewEquipped((prev) => {
      if (prev[category] === id) {
        const next = { ...prev };
        delete next[category];
        return next;
      }
      return { ...prev, [category]: id };
    });
  }

  function clearAllPreviewChanges() {
    setPreviewEquipped({ ...savedEquipped });
    setConfirmClearAll(false);
    setError("");
  }

  function clearLockedPreviewsOnly() {
    setPreviewEquipped((prev) => {
      const next = { ...prev };
      for (const slot of Object.keys(next)) {
        const id = next[slot];
        if (id && !ownedIds.includes(id)) {
          if (savedEquipped[slot]) next[slot] = savedEquipped[slot];
          else delete next[slot];
        }
      }
      return next;
    });
    setConfirmClearLocked(false);
    setError("");
  }

  const hasPreviewChanges = useMemo(
    () => JSON.stringify(previewEquipped) !== JSON.stringify(savedEquipped),
    [previewEquipped, savedEquipped]
  );

  const hasLockedPreviews = useMemo(
    () => hasUnownedEquipped(previewEquipped, ownedIds),
    [previewEquipped, ownedIds]
  );

  useRegisterUnsavedChanges(
    hasPreviewChanges,
    "You have unsaved outfit changes. Leave the locker anyway?"
  );

  async function confirmPurchase() {
    if (!pendingBuy || !profile) return;
    if (profile.credits < pendingBuy.cost_credits) {
      setError("Not enough credits.");
      setPendingBuy(null);
      return;
    }

    setBuying(true);
    setError("");
    const res = await fetch("/api/cosmetics/purchase", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cosmetic_id: pendingBuy.id }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Purchase failed");
      setBuying(false);
      setPendingBuy(null);
      return;
    }

    const newOwned = [...ownedIds, pendingBuy.id];
    setOwnedIds(newOwned);
    const newCredits = profile.credits - pendingBuy.cost_credits;
    updateCredits(newCredits);
    setProfile({
      ...profile,
      credits: newCredits,
      owned_cosmetic_ids: newOwned,
    });

    setPreviewEquipped((prev) => ({ ...prev, [category]: pendingBuy.id }));
    setPendingBuy(null);
    setBuying(false);
  }

  async function confirmSaveOutfit() {
    const toSave = ownedEquippedOnly(previewEquipped, ownedIds);
    setSaving(true);
    setError("");
    const res = await fetch("/api/avatar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ equipped: toSave }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Save failed");
      setSaving(false);
      setConfirmSave(false);
      return;
    }
    setSavedEquipped(toSave);
    setPreviewEquipped(toSave);
    setConfirmSave(false);
    setSaving(false);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="card-glass relative flex min-h-[400px] items-center justify-center p-4">
        {previewHasUnowned && (
          <Badge
            variant="outline"
            className="absolute left-4 top-4 z-10 border-amber-500/50 text-amber-400"
          >
            Preview mode — buy items to keep them
          </Badge>
        )}
        <Avatar3D
          modelUrl={modelUrl}
          avatarConfig={appearance}
          equipped={previewEquipped}
          size="full"
        />
      </div>

      <div>
        <div className="mb-4 flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
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
            const isPreview = previewEquipped[category] === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => tryOn(item.id)}
                className={`card-glass relative p-3 text-left transition ${
                  rarityColor[item.rarity] ?? ""
                } border ${isPreview ? "ring-2 ring-hype" : ""} ${
                  !owned ? "opacity-90" : ""
                }`}
              >
                {!owned && (
                  <span className="absolute right-2 top-2 text-[10px] text-amber-400">
                    🔒
                  </span>
                )}
                <p className="text-sm font-medium">{item.name}</p>
                <Badge variant="outline" className="mt-1 text-[10px]">
                  {item.rarity}
                </Badge>
                {isPreview && (
                  <Badge
                    variant="outline"
                    className={`mt-1 text-[10px] ${!owned ? "text-amber-400" : "text-red-400"}`}
                  >
                    {!owned ? "Try-on" : "Equipped"}
                  </Badge>
                )}
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

        {error && <p className="mt-4 text-sm text-red-400">{error}</p>}

        <div className="mt-6 space-y-2">
          {selectedItem && !selectedOwned && selectedItem.cost_credits > 0 && (
            <Button
              type="button"
              className="w-full bg-gold text-black hover:bg-gold/90"
              onClick={() => setPendingBuy(selectedItem)}
              disabled={buying}
            >
              Buy {selectedItem.name} — {selectedItem.cost_credits} credits
            </Button>
          )}
          {selectedItem &&
            !selectedOwned &&
            selectedItem.cost_credits === 0 &&
            selectedItem.unlock_condition && (
              <p className="rounded-lg bg-white/5 px-4 py-3 text-center text-sm text-[var(--text-secondary)]">
                Preview only — unlock by:{" "}
                <span className="text-amber-400">
                  {selectedItem.unlock_condition.replace(/_/g, " ")}
                </span>
              </p>
            )}

          <Button
            type="button"
            className="w-full"
            onClick={() => setConfirmSave(true)}
            disabled={
              saving ||
              !hasUnsavedChanges ||
              previewHasUnowned
            }
          >
            {saving ? "Saving…" : "Save outfit"}
          </Button>

          {previewHasUnowned && hasUnsavedChanges && (
            <p className="text-center text-xs text-amber-400">
              Buy previewed items or remove them before saving your outfit.
            </p>
          )}

          {(hasPreviewChanges || hasLockedPreviews) && (
            <div className="border-t border-white/10 pt-3 text-center text-xs text-[var(--text-secondary)]">
              <span>Changed your mind? </span>
              {hasPreviewChanges && (
                <button
                  type="button"
                  className="text-red-400 hover:underline"
                  onClick={() => setConfirmClearAll(true)}
                >
                  Clear all changes
                </button>
              )}
              {hasPreviewChanges && hasLockedPreviews && (
                <span className="mx-1">·</span>
              )}
              {hasLockedPreviews && (
                <button
                  type="button"
                  className="text-amber-400 hover:underline"
                  onClick={() => setConfirmClearLocked(true)}
                >
                  Remove try-ons only
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={confirmClearAll}
        title="Clear all changes?"
        description="This reverts your outfit preview to what you last saved. Nothing is deleted from your inventory."
        confirmLabel="Clear everything"
        onConfirm={clearAllPreviewChanges}
        onCancel={() => setConfirmClearAll(false)}
      />

      <ConfirmDialog
        open={confirmClearLocked}
        title="Remove try-ons?"
        description="This removes locked preview items only. Your owned selections stay as they are in the preview."
        confirmLabel="Remove try-ons"
        onConfirm={clearLockedPreviewsOnly}
        onCancel={() => setConfirmClearLocked(false)}
      />

      <ConfirmDialog
        open={confirmSave}
        title="Save outfit?"
        description="This equips your owned items across your profile. Preview-only items won't be saved."
        confirmLabel="Save outfit"
        loading={saving}
        onConfirm={confirmSaveOutfit}
        onCancel={() => setConfirmSave(false)}
      />

      <ConfirmDialog
        open={!!pendingBuy}
        title={`Buy ${pendingBuy?.name ?? "item"}?`}
        description={
          pendingBuy
            ? `Spend ${pendingBuy.cost_credits} credits? You'll own it permanently and can equip it anytime. Balance after: ${(profile?.credits ?? 0) - pendingBuy.cost_credits} credits.`
            : undefined
        }
        confirmLabel="Buy now"
        loading={buying}
        onConfirm={confirmPurchase}
        onCancel={() => setPendingBuy(null)}
      />
    </div>
  );
}
