"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ShopTeaserProps {
  drop: {
    id: string;
    name: string;
    ends_at: string;
    theme: string | null;
    shop_items: { id: string }[];
  };
}

function formatCountdown(endsAt: string) {
  const diff = new Date(endsAt).getTime() - Date.now();
  if (diff <= 0) return "Ended";
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  if (d > 0) return `${d}d ${h}h`;
  return `${h}h ${m}m`;
}

export function ShopTeaser({ drop }: ShopTeaserProps) {
  const [countdown, setCountdown] = useState(() => formatCountdown(drop.ends_at));
  const itemCount = drop.shop_items?.length ?? 3;
  const themeColor = drop.theme ?? "#7c3aed";

  useEffect(() => {
    const id = setInterval(() => {
      setCountdown(formatCountdown(drop.ends_at));
    }, 60000);
    return () => clearInterval(id);
  }, [drop.ends_at]);

  return (
    <section className="py-16">
      <div className="mx-auto max-w-7xl px-4">
        <Link
          href="/shop/drop"
          className="group relative flex flex-col items-center gap-6 overflow-hidden rounded-2xl border border-[var(--border)] p-6 transition-all hover:border-[var(--border-bright)] md:flex-row md:p-8"
          style={{
            background: `linear-gradient(135deg, var(--bg-surface) 0%, ${themeColor}15 50%, var(--bg-surface) 100%)`,
          }}
        >
          <div className="flex-1">
            <Badge variant="gold" className="mb-3 normal-case tracking-normal">
              Weekly drop
            </Badge>
            <h2 className="text-display-sm group-hover:text-hype">{drop.name}</h2>
            <div className="mt-2 flex items-center gap-2 text-gold">
              <Clock className="h-4 w-4" aria-hidden />
              <span className="font-display text-sm font-bold">{countdown}</span>
              <span className="text-body-sm text-[var(--text-3)]">left</span>
            </div>
          </div>

          <div className="flex items-center gap-3" aria-hidden>
            {Array.from({ length: Math.min(itemCount, 3) }).map((_, i) => (
              <div
                key={i}
                className="h-20 w-16 rounded-xl border border-[var(--border-bright)]"
                style={{
                  background: `linear-gradient(180deg, ${themeColor}40, var(--bg-raised))`,
                  transform: `rotate(${(i - 1) * 6}deg)`,
                }}
              />
            ))}
          </div>

          <Button className="shrink-0">See the drop</Button>
        </Link>
      </div>
    </section>
  );
}
