"use client";

import { useEffect, useMemo, useState } from "react";

type Props = {
  /** Optional label for debugging / per-chapter context */
  label?: string;
};

export default function SceneHook({ label }: Props) {
  const [t, setT] = useState(0);

  useEffect(() => {
    let raf = 0;
    const loop = () => {
      setT((x) => (x + 1) % 1000000);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  // Subtle moving background positions
  const bg = useMemo(() => {
    const a = (t % 600) / 600;
    const b = (t % 900) / 900;
    return {
      backgroundPosition: `${Math.round(a * 120)}px ${Math.round(b * 120)}px`,
    } as const;
  }, [t]);

  return (
    <div className="relative overflow-hidden rounded-3xl border bg-white">
      <div
        className="absolute inset-0 opacity-[0.08]"
        style={{
          ...bg,
          backgroundImage:
            "linear-gradient(to right, rgba(0,0,0,0.15) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.15) 1px, transparent 1px)",
          backgroundSize: "36px 36px",
        }}
      />
      <div
        className="absolute inset-0 opacity-[0.12]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 20%, rgba(0,0,0,0.12), transparent 35%), radial-gradient(circle at 80% 30%, rgba(0,0,0,0.10), transparent 40%), radial-gradient(circle at 55% 80%, rgba(0,0,0,0.08), transparent 45%)",
        }}
      />

      <div className="relative p-6 md:p-10">
        <p className="text-xs uppercase tracking-wider opacity-60">Scene</p>
        <h3 className="mt-2 text-lg md:text-xl font-semibold tracking-tight">
          3D hook placeholder
        </h3>
        <p className="mt-2 text-sm opacity-70 max-w-2xl">
          This is a lightweight placeholder for a future 3D scene (Three.js / R3F). It’s safe,
          fast, and keeps the Journey architecture stable.
        </p>

        {label && (
          <p className="mt-4 text-xs font-mono opacity-60">
            context: {label}
          </p>
        )}
      </div>
    </div>
  );
}
