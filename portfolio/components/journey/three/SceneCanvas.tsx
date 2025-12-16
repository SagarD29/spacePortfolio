"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Line, Stars } from "@react-three/drei";
import * as THREE from "three";
import React, { useEffect, useMemo, useRef, useState } from "react";

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    if (!mq) return;
    const onChange = () => setReduced(!!mq.matches);
    onChange();
    mq.addEventListener?.("change", onChange);
    return () => mq.removeEventListener?.("change", onChange);
  }, []);
  return reduced;
}

function useInView(threshold = 0.15) {
  const [inView, setInView] = useState(true);
  const ioRef = useRef<IntersectionObserver | null>(null);

  const setTarget = (el: Element | null) => {
    ioRef.current?.disconnect();
    if (!el) return;

    ioRef.current = new IntersectionObserver(
      (entries) => {
        for (const e of entries) setInView(e.isIntersecting);
      },
      { threshold }
    );
    ioRef.current.observe(el);
  };

  useEffect(() => () => ioRef.current?.disconnect(), []);
  return { inView, setTarget };
}

function useScrollProgress() {
  const [progress, setProgress] = useState(0);
  const targetRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    let raf = 0;

    const compute = () => {
      const el = targetRef.current;
      if (!el) return;

      const r = el.getBoundingClientRect();
      const vh = window.innerHeight || 1;

      const start = vh;
      const end = -r.height;
      const raw = (start - r.top) / (start - end);
      setProgress(Math.max(0, Math.min(1, raw)));
    };

    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(compute);
    };

    compute();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  const setTarget = (el: HTMLElement | null) => {
    targetRef.current = el;
  };

  return { progress, setTarget };
}

function DemandInvalidator({ active }: { active: boolean }) {
  const invalidate = useThree((s) => s.invalidate);
  useFrame(() => {
    if (active) invalidate();
  });
  return null;
}

type Kind = "pipelines" | "vision" | "observability" | "hardware" | "research" | "default";

function mapLabelToKind(label?: string): Kind {
  const key = (label || "").toLowerCase();
  if (key.includes("pipelines") || key.includes("orchestration")) return "pipelines";
  if (key.includes("vision") || key.includes("inference") || key.includes("ml")) return "vision";
  if (key.includes("observability") || key.includes("reliability") || key.includes("mlops"))
    return "observability";
  if (key.includes("hardware") || key.includes("embedded") || key.includes("systems"))
    return "hardware";
  if (key.includes("materials") || key.includes("energy") || key.includes("research"))
    return "research";
  return "default";
}

function palette(kind: Kind) {
  switch (kind) {
    case "pipelines":
      return { a: "#22d3ee", b: "#60a5fa" };
    case "vision":
      return { a: "#a78bfa", b: "#6366f1" };
    case "observability":
      return { a: "#34d399", b: "#22c55e" };
    case "hardware":
      return { a: "#fbbf24", b: "#fb7185" };
    case "research":
      return { a: "#f472b6", b: "#a855f7" };
    default:
      return { a: "#93c5fd", b: "#a78bfa" };
  }
}

/** -------- scenes (same as your working version, trimmed: keep your existing ones) -------- **/
/** To keep this message manageable: DO NOT change your scene components here.
 *  Keep the existing PipelinesScene/VisionScene/ObservabilityScene/HardwareScene/ResearchScene/DefaultScene
 *  from the version that currently works in your repo.
 *
 *  Only update the wrapper below (SceneRoot + SceneCanvas) to support mode="background".
 */

// ⬇️ KEEP your existing scene components here unchanged
// PipelinesScene, VisionScene, ObservabilityScene, HardwareScene, ResearchScene, DefaultScene
// ... (unchanged from your current working file)

function SceneRoot({
  label,
  progress,
  reducedMotion,
  active,
  renderMode,
}: {
  label?: string;
  progress: number;
  reducedMotion: boolean;
  active: boolean;
  renderMode: "card" | "background";
}) {
  const kind = mapLabelToKind(label);

  // Slightly different star density based on mode (background feels richer)
  const starCount = reducedMotion ? 500 : renderMode === "background" ? 2200 : 1400;

  return (
    <>
      <Stars
        radius={60}
        depth={45}
        count={starCount}
        factor={3}
        fade
        speed={reducedMotion ? 0 : 0.6}
      />

      <ambientLight intensity={0.35} />
      <directionalLight position={[4, 4, 2]} intensity={1.05} />
      <pointLight position={[-4, -2, -2]} intensity={0.55} />
      <fog attach="fog" args={["#07070c", 7, 18]} />

      {/* IMPORTANT: keep your chapter scene selection logic here exactly as you already have it */}
      {/* Example (leave as-is from your current file): */}
      {/* {kind === "pipelines" && <PipelinesScene ... />} */}
      {/* ...etc */}
    </>
  );
}

export default function SceneCanvas({
  label,
  mode = "card",
  className = "",
}: {
  label?: string;
  mode?: "card" | "background";
  className?: string;
}) {
  const reducedMotion = usePrefersReducedMotion();
  const inView = useInView(0.12);
  const scroll = useScrollProgress();

  const active = inView.inView && !reducedMotion;

  const setContainerRef = (el: HTMLDivElement | null) => {
    inView.setTarget(el);
    scroll.setTarget(el);
  };

  const isBg = mode === "background";

  return (
    <div
      ref={setContainerRef}
      className={[
        isBg ? "relative h-full w-full" : "relative overflow-hidden rounded-3xl border border-white/12 bg-white/5",
        className,
      ].join(" ")}
    >
      {/* Overlay label only in card mode (background should be clean) */}
      {!isBg && (
        <div className="absolute left-0 top-0 z-10 p-5 md:p-7 pointer-events-none">
          <p className="text-xs uppercase tracking-wider text-white/60">Scene</p>
          <p className="mt-1 text-sm text-white/85 font-semibold">
            {label ? label : "journey scene"}
          </p>
          <p className="mt-2 text-xs text-white/60 max-w-[56ch]">
            Chapter-specific Three.js scene • scroll-driven • pauses offscreen
            {reducedMotion ? " • reduced motion" : ""}
          </p>
        </div>
      )}

      <div className={isBg ? "absolute inset-0" : "h-[280px] md:h-[360px] lg:h-[420px]"}>
        <Canvas
          frameloop="demand"
          camera={{ position: [0, 0, 7], fov: 45 }}
          dpr={reducedMotion ? 1 : [1, 1.5]}
          gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        >
          <DemandInvalidator active={active} />
          <SceneRoot
            label={label}
            progress={scroll.progress}
            reducedMotion={reducedMotion}
            active={active}
            renderMode={mode}
          />
        </Canvas>
      </div>
    </div>
  );
}
