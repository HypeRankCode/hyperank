export function AdSlot({ slot }: { slot: string }) {
  return (
    <div
      className="my-4 flex min-h-[90px] items-center justify-center rounded-lg border border-dashed border-[var(--border)] bg-[var(--bg-elevated)]/50 text-xs text-[var(--text-secondary)]"
      data-ad-slot={slot}
    >
      Ad slot
    </div>
  );
}
