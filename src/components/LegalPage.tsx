import type { Metadata } from "next";

interface LegalPageProps {
  title: string;
  lastUpdated: string;
  children: React.ReactNode;
}

export function LegalPage({ title, lastUpdated, children }: LegalPageProps) {
  return (
    <article className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="font-display text-3xl font-bold">{title}</h1>
      <p className="mt-2 text-sm text-[var(--text-secondary)]">
        Last updated: {lastUpdated}
      </p>
      <div className="prose prose-invert mt-8 max-w-none space-y-4 text-[var(--text-secondary)] [&_h2]:font-display [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-[var(--text-primary)] [&_li]:ml-4 [&_ul]:list-disc [&_ul]:space-y-2">
        {children}
      </div>
    </article>
  );
}

export function legalMetadata(title: string): Metadata {
  return { title: `${title} | HypeRank` };
}
