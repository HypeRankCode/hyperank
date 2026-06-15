"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ProfileOwnerBarProps {
  username: string;
  isPublic: boolean;
}

export function ProfileOwnerBar({ username, isPublic }: ProfileOwnerBarProps) {
  const [copied, setCopied] = useState(false);

  async function shareProfile() {
    const url = `${window.location.origin}/u/${username}`;
    try {
      if (typeof navigator.share === "function") {
        await navigator.share({
          title: `${username} on HypeRank`,
          text: `Check out @${username} on HypeRank`,
          url,
        });
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* user cancelled share */
    }
  }

  return (
    <div className="mb-6 space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="hype">Your profile</Badge>
        {!isPublic && (
          <Badge variant="outline" className="border-amber-500/40 text-amber-400">
            Private — only you see this
          </Badge>
        )}
      </div>

      <div className="surface-card flex flex-wrap gap-2 rounded-2xl p-3">
        <Button type="button" size="sm" variant="secondary" onClick={shareProfile}>
          {copied ? "Link copied!" : "Share profile"}
        </Button>
        <Link href="/settings/profile-photo">
          <Button type="button" size="sm" variant="secondary">
            Photo booth
          </Button>
        </Link>
        <Link href="/locker">
          <Button type="button" size="sm" variant="secondary">
            Locker
          </Button>
        </Link>
        <Link href="/settings/avatar">
          <Button type="button" size="sm" variant="secondary">
            Edit look
          </Button>
        </Link>
        <Link href="/settings">
          <Button type="button" size="sm" variant="ghost">
            Settings
          </Button>
        </Link>
      </div>

      {!isPublic && (
        <p className="text-sm text-[var(--text-secondary)]">
          Others see a private message on this page.{" "}
          <Link href="/settings/privacy" className="text-red-400 hover:underline">
            Change visibility
          </Link>
        </p>
      )}
    </div>
  );
}
