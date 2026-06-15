import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { AdSlot } from "@/components/AdSlot";

export default async function DictionaryPage() {
  const supabase = await createClient();
  const { data: terms } = await supabase
    .from("dictionary")
    .select("id, term, definition")
    .order("term");

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="font-display text-3xl font-bold">Dictionary</h1>
      <p className="mt-1 text-[var(--text-secondary)]">
        Internet slang, defined.
      </p>

      <div className="mt-8 space-y-4">
        {(terms ?? []).map((t, i) => (
          <div key={t.id}>
            <Link
              href={`/dictionary/${encodeURIComponent(t.term)}`}
              className="card-glass block p-4 hover:border-hype/30"
            >
              <p className="font-display font-bold">{t.term}</p>
              <p className="mt-1 text-sm text-[var(--text-secondary)] line-clamp-2">
                {t.definition}
              </p>
            </Link>
            {i > 0 && (i + 1) % 8 === 0 && <AdSlot slot="dictionary" />}
          </div>
        ))}
        {!terms?.length && (
          <p className="text-[var(--text-secondary)]">No terms yet.</p>
        )}
      </div>
    </div>
  );
}
