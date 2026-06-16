"use client";

export function AmbientBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-[var(--bg-void)]" />
      <div className="grid-bg absolute inset-0" />
      <div
        className="absolute -left-1/4 top-0 h-[600px] w-[600px] rounded-full opacity-25 blur-[120px]"
        style={{
          background: "radial-gradient(circle, var(--hype) 0%, transparent 70%)",
        }}
      />
      <div
        className="absolute -right-1/4 bottom-0 h-[500px] w-[500px] rounded-full opacity-15 blur-[100px]"
        style={{
          background: "radial-gradient(circle, var(--purple) 0%, transparent 70%)",
        }}
      />
      <div className="noise-overlay" />
    </div>
  );
}
