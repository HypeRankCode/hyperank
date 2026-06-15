import Link from "next/link";

export default function BrandApplyPage() {
  return (
    <div className="mx-auto max-w-lg px-4 py-16">
      <h1 className="font-display text-2xl font-bold">Brand application</h1>
      <p className="mt-4 text-[var(--text-secondary)]">
        Email legal@hyperank.ca with your company name, website, and what you
        want to sponsor.
      </p>
      <Link href="/brand" className="mt-6 inline-block text-hype">
        Back
      </Link>
    </div>
  );
}
