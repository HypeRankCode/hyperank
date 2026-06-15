"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { useAuthModalStore } from "@/stores/useAuthModalStore";

interface Props {
  shopItemId: string;
}

export function ShopBuyButton({ shopItemId }: Props) {
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const requireAuth = useRequireAuth();
  const showAuthModal = useAuthModalStore((s) => s.show);

  async function buy() {
    if (!requireAuth("Sign in to buy from the shop")) return;
    setLoading(true);
    setMsg("");
    const res = await fetch("/api/shop/purchase", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ shop_item_id: shopItemId }),
    });
    const data = await res.json();
    if (!res.ok) {
      if (res.status === 401) showAuthModal("Sign in to shop");
      else setMsg(data.error ?? "Purchase failed");
      setLoading(false);
      return;
    }
    setMsg("Purchased! Check your locker.");
    setLoading(false);
    window.location.href = "/locker";
  }

  return (
    <div>
      <Button size="sm" className="w-full" disabled={loading} onClick={buy}>
        {loading ? "Buying…" : "Buy now"}
      </Button>
      {msg && <p className="mt-2 text-xs text-emerald-400">{msg}</p>}
    </div>
  );
}
