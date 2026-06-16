"use client";

export function AmbientBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-[#050505]" />
      <div className="grid-bg absolute inset-0" />
      <div
        className="absolute -left-1/4 top-0 h-[600px] w-[600px] rounded-full opacity-30 blur-[120px]"
        style={{ background: "radial-gradient(circle, #ff2b2b 0%, transparent 70%)" }}
      />
      <div
        className="absolute -right-1/4 bottom-0 h-[500px] w-[500px] rounded-full opacity-20 blur-[100px]"
        style={{ background: "radial-gradient(circle, #660000 0%, transparent 70%)" }}
      />
      <div
        className="absolute left-1/2 top-1/3 h-[300px] w-[800px] -translate-x-1/2 rounded-full opacity-[0.07] blur-[80px]"
        style={{ background: "linear-gradient(90deg, transparent, #ff2b2b, transparent)" }}
      />
      <div className="noise-overlay" />
    </div>
  );
}
