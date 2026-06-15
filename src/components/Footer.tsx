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
    <footer className="relative z-10 mt-auto border-t border-[var(--border-subtle)] bg-[var(--bg-base)]">
      <div className="mx-auto max-w-7xl px-4 py-12 lg:px-6">
        <div className="grid gap-10 md:grid-cols-3">
          <div>
            <Logo size="sm" />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-[var(--text-secondary)]">
              Community-driven trend rankings, battles, and rewards.
            </p>
          </div>

          <div>
            <p className="section-label mb-3">Product</p>
            <div className="flex flex-col gap-2">
              {exploreLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm text-[var(--text-secondary)] transition-colors hover:text-zinc-200"
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
                  className="text-sm text-[var(--text-secondary)] transition-colors hover:text-zinc-200"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-1 border-t border-[var(--border-subtle)] pt-6 text-xs text-[var(--text-secondary)] sm:flex-row sm:justify-between">
          <p>© {new Date().getFullYear()} HypeRank</p>
          <p>Credits have no real-world monetary value.</p>
        </div>
      </div>
    </footer>
  );
}
