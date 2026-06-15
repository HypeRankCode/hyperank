import Link from "next/link";
import { ProfileAvatar } from "@/components/ProfileAvatar";

export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="font-display text-3xl font-bold">Settings</h1>
      <nav className="mt-6 space-y-2">
        <Link
          href="/settings/profile-photo"
          className="block text-hype hover:underline"
        >
          Profile photo studio
        </Link>
        <Link href="/settings/social" className="block text-hype hover:underline">
          Social accounts
        </Link>
        <Link href="/settings/privacy" className="block text-hype hover:underline">
          Privacy
        </Link>
        <Link href="/settings/avatar" className="block text-hype hover:underline">
          Avatar appearance
        </Link>
      </nav>
    </div>
  );
}
