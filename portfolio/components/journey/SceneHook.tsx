"use client";

import dynamic from "next/dynamic";

const SceneCanvas = dynamic(() => import("./three/SceneCanvas"), {
  ssr: false,
  loading: () => (
    <div className="rounded-3xl border border-white/12 bg-white/5 p-6 md:p-10">
      <p className="text-xs uppercase tracking-wider text-white/60">Scene</p>
      <h3 className="mt-2 text-lg md:text-xl font-semibold tracking-tight text-white">
        Loading scene…
      </h3>
      <p className="mt-2 text-sm text-white/70">
        Initialising WebGL (Three.js).
      </p>
    </div>
  ),
});

export default function SceneHook({ label }: { label?: string }) {
  return <SceneCanvas label={label} />;
}
