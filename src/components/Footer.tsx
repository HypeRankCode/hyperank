import Link from "next/link";
import { Logo } from "./Logo";

const legalLinks = [
  { href: "/legal/terms", label: "Terms" },
  { href: "/legal/privacy", label: "Privacy" },
  { href: "/legal/cookies", label: "Cookies" },
  { href: "/legal/community", label: "Community" },
  { href: "/legal/credits-policy", label: "Credits" },
  { href: "/legal/coppa", label: "COPPA" },
  { href: "/legal/dmca", label: "DMCA" },
  { href: "/legal/contact", label: "Contact" },
];

const exploreLinks = [
  { href: "/trends", label: "Trends" },
  { href: "/battles", label: "Battles" },
  { href: "/leaderboard", label: "Leaderboard" },
  { href: "/dictionary", label: "Dictionary" },
  { href: "/advertise", label: "Advertise" },
];

export function Footer() {
  return (
    <footer className="relative z-10 mt-auto border-t border-white/[0.06] bg-black/40 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid gap-10 md:grid-cols-3">
          <div>
            <Logo size="sm" />
            <p className="mt-4 max-w-xs text-sm text-[var(--text-secondary)]">
              Vote on culture. Build streaks. Flex your avatar. The internet&apos;s
              pulse, ranked.
            </p>
          </div>

          <div>
            <p className="section-label mb-3">Explore</p>
            <div className="flex flex-col gap-2">
              {exploreLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm text-[var(--text-secondary)] transition-colors hover:text-red-400"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <p className="section-label mb-3">Legal</p>
            <div className="flex flex-wrap gap-x-4 gap-y-2">
              {legalLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm text-[var(--text-secondary)] transition-colors hover:text-white"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-1 border-t border-white/[0.06] pt-6 text-xs text-[var(--text-secondary)] sm:flex-row sm:justify-between">
          <p>© {new Date().getFullYear()} HypeRank. All rights reserved.</p>
          <p>HypeRank credits have no real-world value.</p>
        </div>
      </div>
    </footer>
  );
}
