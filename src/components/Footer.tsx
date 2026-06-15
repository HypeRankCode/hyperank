import Link from "next/link";

const legalLinks = [
  { href: "/legal/terms", label: "Terms" },
  { href: "/legal/privacy", label: "Privacy" },
  { href: "/legal/cookies", label: "Cookies" },
  { href: "/legal/community", label: "Community" },
  { href: "/legal/credits-policy", label: "Credits Policy" },
  { href: "/legal/coppa", label: "Children's Privacy" },
  { href: "/legal/dmca", label: "DMCA" },
  { href: "/legal/contact", label: "Contact" },
];

export function Footer() {
  return (
    <footer className="mt-auto border-t border-[var(--border)] bg-[var(--bg-card)] px-4 py-8">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-[var(--text-secondary)]">
          {legalLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="hover:text-[var(--text-primary)]"
            >
              {link.label}
            </Link>
          ))}
        </div>
        <p className="mt-4 text-xs text-[var(--text-secondary)]">
          © {new Date().getFullYear()} HypeRank. All rights reserved.
        </p>
        <p className="mt-1 text-xs text-[var(--text-secondary)]">
          HypeRank credits have no real-world value.
        </p>
      </div>
    </footer>
  );
}
