import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";

export default async function DictionaryTermPage({
  params,
}: {
  params: { term: string };
}) {
  const supabase = await createClient();
  const { data: entry } = await supabase
    .from("dictionary")
    .select("*")
    .eq("term", decodeURIComponent(params.term))
    .single();

  if (!entry) notFound();

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="font-display text-4xl font-bold">{entry.term}</h1>
      <p className="mt-4 text-lg">{entry.definition}</p>
      {entry.example_usage && (
        <p className="mt-4 text-[var(--text-secondary)] italic">
          &ldquo;{entry.example_usage}&rdquo;
        </p>
      )}
    </div>
  );
}
