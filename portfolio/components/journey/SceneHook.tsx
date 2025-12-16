"use client";

import { useEffect, useMemo, useState } from "react";

export default function SceneHook({ label }: { label?: string }) {
  const [t, setT] = useState(0);

  useEffect(() => {
    let raf = 0;
    const loop = () => {
      setT((x) => (x + 1) % 1_000_000);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  const bg = useMemo(() => {
    const a = (t % 1200) / 1200;
    const b = (t % 1800) / 1800;
    return {
      backgroundPosition: `${Math.round(a * 140)}px ${Math.round(b * 140)}px`,
    } as const;
  }, [t]);

  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/12 bg-white/5">
      {/* Stars */}
      <div
        className="absolute inset-0 opacity-[0.16]"
        style={{
          ...bg,
          backgroundImage:
            "radial-gradient(circle at 12% 18%, rgba(255,255,255,.6) 1px, transparent 2px)," +
            "radial-gradient(circle at 78% 28%, rgba(255,255,255,.45) 1px, transparent 2px)," +
            "radial-gradient(circle at 55% 72%, rgba(255,255,255,.35) 1px, transparent 2px)," +
            "radial-gradient(circle at 22% 68%, rgba(255,255,255,.28) 1px, transparent 2px)," +
            "radial-gradient(circle at 88% 82%, rgba(255,255,255,.25) 1px, transparent 2px)",
          backgroundSize: "260px 260px",
        }}
      />

      {/* Aurora gradient */}
      <div
        className="absolute inset-0 opacity-[0.28]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 20%, rgba(99,102,241,.45), transparent 55%)," +
            "radial-gradient(circle at 80% 30%, rgba(34,211,238,.28), transparent 60%)," +
            "radial-gradient(circle at 55% 85%, rgba(168,85,247,.22), transparent 55%)",
        }}
      />

      {/* Subtle grid */}
      <div
        className="absolute inset-0 opacity-[0.10]"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(255,255,255,0.20) 1px, transparent 1px)," +
            "linear-gradient(to bottom, rgba(255,255,255,0.20) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
        }}
      />

      <div className="relative p-6 md:p-10">
        <p className="text-xs uppercase tracking-wider text-white/60">Scene</p>
        <h3 className="mt-2 text-lg md:text-xl font-semibold tracking-tight text-white">
          Immersive scene hook
        </h3>
        <p className="mt-2 text-sm text-white/70 max-w-2xl">
          This block is the scrollytelling “stage”. Later we can replace it with a real 3D
          scene (R3F/Three.js) without changing the Journey structure.
        </p>
        {label && <p className="mt-4 text-xs font-mono text-white/55">context: {label}</p>}
      </div>
    </div>
  );
}
