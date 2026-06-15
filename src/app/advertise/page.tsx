export default function AdvertisePage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 text-center">
      <h1 className="font-display text-4xl font-bold">Advertise on HypeRank</h1>
      <p className="mt-4 text-[var(--text-secondary)]">
        Sponsored trends, battle naming, and weekly report slots. No paywalls —
        respectful placements only.
      </p>
      <a
        href="/brand/apply"
        className="mt-8 inline-block rounded-full bg-hype px-8 py-3 font-medium text-white"
      >
        Partner with us
      </a>
    </div>
  );
}
