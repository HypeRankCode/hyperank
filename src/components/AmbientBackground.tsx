"use client";

export function AmbientBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-[var(--bg-base)]" />
      <div className="grid-bg absolute inset-0 opacity-60" />
      <div
        className="absolute -left-1/3 top-0 h-[500px] w-[500px] rounded-full opacity-[0.07] blur-[100px]"
        style={{
          background: "radial-gradient(circle, #e82222 0%, transparent 70%)",
        }}
      />
      <div
        className="absolute -right-1/4 bottom-0 h-[400px] w-[400px] rounded-full opacity-[0.05] blur-[80px]"
        style={{
          background: "radial-gradient(circle, #7f1d1d 0%, transparent 70%)",
        }}
      />
      <div className="noise-overlay" />
    </div>
  );
}
