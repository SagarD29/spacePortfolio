"use client";

import dynamic from "next/dynamic";

const SceneCanvas = dynamic(() => import("./three/SceneCanvas"), {
  ssr: false,
  loading: () => <div className="absolute inset-0 bg-black/20" />,
});

export default function SceneHook({
  label,
  mode = "card",
  className = "",
}: {
  label?: string;
  mode?: "card" | "background";
  className?: string;
}) {
  return <SceneCanvas label={label} mode={mode} className={className} />;
}
