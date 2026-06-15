import type { Metadata } from "next";
import Link from "next/link";

interface LegalPageProps {
  title: string;
  lastUpdated: string;
  children: React.ReactNode;
}

/** Calm, readable layout for legal/docs — separate from the game UI. */
export function LegalPage({ title, lastUpdated, children }: LegalPageProps) {
  return (
    <div className="min-h-[60vh] bg-zinc-950/80">
      <article className="mx-auto max-w-2xl px-4 py-12 md:py-16">
        <Link
          href="/"
          className="text-sm text-zinc-500 transition-colors hover:text-zinc-300"
        >
          ← Back to HypeRank
        </Link>
        <header className="mt-6 border-b border-zinc-800 pb-6">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-100 md:text-3xl">
            {title}
          </h1>
          <p className="mt-2 text-sm text-zinc-500">
            Last updated {lastUpdated}
          </p>
        </header>
        <div className="prose-legal mt-8 space-y-5 text-[15px] leading-relaxed text-zinc-400 [&_h2]:mt-8 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-zinc-200 [&_li]:ml-5 [&_ul]:list-disc [&_ul]:space-y-2">
          {children}
        </div>
      </article>
    </div>
  );
}

export function legalMetadata(title: string): Metadata {
  return { title: `${title} | HypeRank` };
}
