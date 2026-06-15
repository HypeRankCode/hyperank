"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";

function BuyHandler() {
  const params = useSearchParams();
  const buyId = params.get("buy");
  const [status, setStatus] = useState("");

  useEffect(() => {
    if (!buyId) return;
    fetch("/api/shop/purchase", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ shop_item_id: buyId }),
    })
      .then((r) => r.json())
      .then((d) => {
        setStatus(d.error ?? "Purchased.");
        if (!d.error) window.location.href = "/locker";
      });
  }, [buyId]);

  if (!buyId) return null;
  return status ? <p className="mt-4 text-sm">{status}</p> : <p className="mt-4 text-sm">Processing...</p>;
}

export { BuyHandler };

export function ShopDropExtras() {
  return (
    <Suspense>
      <BuyHandler />
    </Suspense>
  );
}
