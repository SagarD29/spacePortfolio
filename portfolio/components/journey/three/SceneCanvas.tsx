"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Line, Stars } from "@react-three/drei";
import * as THREE from "three";
import React, { useEffect, useMemo, useRef, useState } from "react";

/**
 * --------- hooks (reduced motion / in-view / scroll progress) ----------
 */

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

  useEffect(() => {
    return () => ioRef.current?.disconnect();
  }, []);

  return { inView, setTarget };
}

/**
 * Returns progress 0..1 as the container moves through viewport.
 * 0 = entering, 1 = leaving.
 */
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
      const clamped = Math.max(0, Math.min(1, raw));
      setProgress(clamped);
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

/**
 * Invalidates frames only when active, for frameloop="demand".
 */
function DemandInvalidator({ active }: { active: boolean }) {
  const invalidate = useThree((s) => s.invalidate);
  useFrame(() => {
    if (active) invalidate();
  });
  return null;
}

/**
 * --------- helpers ----------
 */

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

/**
 * --------- scenes ----------
 */

function PipelinesScene({
  progress,
  reducedMotion,
  active,
  kind,
}: {
  progress: number;
  reducedMotion: boolean;
  active: boolean;
  kind: Kind;
}) {
  const { a, b } = palette(kind);
  const group = useRef<THREE.Group>(null);

  const nodes = useMemo(() => {
    return [
      new THREE.Vector3(-2.2, 0.6, 0),
      new THREE.Vector3(-1.0, 1.2, 0),
      new THREE.Vector3(-0.2, 0.2, 0),
      new THREE.Vector3(0.8, 0.9, 0),
      new THREE.Vector3(1.8, 0.1, 0),
      new THREE.Vector3(2.3, 1.1, 0),
      new THREE.Vector3(-1.4, -0.7, 0),
      new THREE.Vector3(0.2, -0.9, 0),
      new THREE.Vector3(1.6, -0.8, 0),
    ];
  }, []);

  const edgePairs = useMemo(() => {
    return [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 5],
      [2, 4],
      [6, 2],
      [2, 7],
      [7, 8],
      [4, 5],
    ] as const;
  }, []);

  useFrame((state) => {
    if (!active || reducedMotion) return;
    const t = state.clock.getElapsedTime();
    if (group.current) {
      group.current.rotation.y = (progress - 0.5) * 0.9;
      group.current.rotation.x = Math.sin(t * 0.25) * 0.08;
    }
  });

  const flowX = THREE.MathUtils.lerp(-2.4, 2.4, progress);

  return (
    <group ref={group}>
      {edgePairs.map(([i, j], idx) => (
        <Line
          key={idx}
          points={[nodes[i], nodes[j]]}
          color="white"
          transparent
          opacity={0.25}
          lineWidth={1}
        />
      ))}

      {nodes.map((p, idx) => (
        <mesh key={idx} position={p}>
          <sphereGeometry args={[0.09, 24, 24]} />
          <meshStandardMaterial
            color={idx % 2 === 0 ? a : b}
            emissive={idx % 2 === 0 ? a : b}
            emissiveIntensity={0.35}
            roughness={0.35}
            metalness={0.35}
          />
        </mesh>
      ))}

      <mesh position={[flowX, 0.15 + Math.sin(progress * Math.PI * 2) * 0.15, 0.25]}>
        <sphereGeometry args={[0.12, 24, 24]} />
        <meshStandardMaterial
          color="#ffffff"
          emissive="#ffffff"
          emissiveIntensity={0.6}
          transparent
          opacity={0.9}
        />
      </mesh>
    </group>
  );
}

function VisionScene({
  progress,
  reducedMotion,
  active,
  kind,
}: {
  progress: number;
  reducedMotion: boolean;
  active: boolean;
  kind: Kind;
}) {
  const { a, b } = palette(kind);
  const group = useRef<THREE.Group>(null);

  const frustumLines = useMemo(() => {
    const pts: Array<[THREE.Vector3, THREE.Vector3]> = [];
    const o = new THREE.Vector3(0, 0, 0);
    const a1 = new THREE.Vector3(-1.2, 0.8, -2.2);
    const a2 = new THREE.Vector3(1.2, 0.8, -2.2);
    const a3 = new THREE.Vector3(-1.2, -0.8, -2.2);
    const a4 = new THREE.Vector3(1.2, -0.8, -2.2);

    pts.push([o, a1], [o, a2], [o, a3], [o, a4]);
    pts.push([a1, a2], [a2, a4], [a4, a3], [a3, a1]);
    return pts;
  }, []);

  const detections = useMemo(() => {
    return [
      { pos: new THREE.Vector3(-0.7, 0.2, -1.2), s: new THREE.Vector3(0.6, 0.4, 0.02) },
      { pos: new THREE.Vector3(0.4, -0.1, -1.6), s: new THREE.Vector3(0.5, 0.6, 0.02) },
      { pos: new THREE.Vector3(0.2, 0.45, -1.9), s: new THREE.Vector3(0.8, 0.3, 0.02) },
    ];
  }, []);

  useFrame((state) => {
    if (!active || reducedMotion) return;
    const t = state.clock.getElapsedTime();
    if (group.current) {
      group.current.rotation.y = (progress - 0.5) * 0.8;
      group.current.rotation.x = Math.sin(t * 0.22) * 0.06;
    }
  });

  return (
    <group ref={group}>
      {frustumLines.map(([p1, p2], idx) => (
        <Line
          key={idx}
          points={[p1, p2]}
          color="white"
          transparent
          opacity={0.25}
          lineWidth={1}
        />
      ))}

      {detections.map((d, i) => {
        const pulse =
          0.35 +
          0.65 * (Math.sin((progress * Math.PI * 2 + i) * 1.2) * 0.5 + 0.5);
        const opacity = THREE.MathUtils.clamp(0.18 + progress * 0.55 + pulse * 0.15, 0.15, 0.85);

        return (
          <mesh key={i} position={d.pos} scale={d.s}>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial
              color={i % 2 === 0 ? a : b}
              emissive={i % 2 === 0 ? a : b}
              emissiveIntensity={0.35}
              transparent
              opacity={opacity}
              roughness={0.45}
              metalness={0.1}
            />
          </mesh>
        );
      })}
    </group>
  );
}

function ObservabilityScene({
  progress,
  reducedMotion,
  active,
  kind,
}: {
  progress: number;
  reducedMotion: boolean;
  active: boolean;
  kind: Kind;
}) {
  const { a, b } = palette(kind);

  const pointsRef = useRef<THREE.Vector3[]>([]);
  const geomRef = useRef<THREE.BufferGeometry | null>(null);

  // init points once
  useMemo(() => {
    const pts: THREE.Vector3[] = [];
    const n = 120;
    for (let i = 0; i < n; i++) {
      const x = THREE.MathUtils.lerp(-2.6, 2.6, i / (n - 1));
      pts.push(new THREE.Vector3(x, 0, 0));
    }
    pointsRef.current = pts;
  }, []);

  useFrame((state) => {
    if (!active || reducedMotion) return;
    const t = state.clock.getElapsedTime();
    const geom = geomRef.current;
    if (!geom) return;

    const arr = geom.attributes.position.array as Float32Array;
    const sweep = THREE.MathUtils.lerp(-1.4, 1.4, progress);

    for (let i = 0; i < arr.length; i += 3) {
      const x = arr[i + 0];
      const wave = Math.sin(x * 2 + t * 1.4) * 0.25;
      const spike = Math.exp(-Math.pow(x - sweep, 2) * 1.2) * 0.55;
      arr[i + 1] = wave + spike;
    }
    geom.attributes.position.needsUpdate = true;
  });

  // marker moves with progress
  const markerX = THREE.MathUtils.lerp(-2.2, 2.2, progress);

  return (
    <group>
      <line>
        <bufferGeometry
          ref={(g) => {
            if (!g) return;
            geomRef.current = g;
            g.setFromPoints(pointsRef.current);
          }}
        />
        <lineBasicMaterial color={a} transparent opacity={0.65} />
      </line>

      <mesh position={[markerX, 0.1, 0.12]}>
        <sphereGeometry args={[0.12, 24, 24]} />
        <meshStandardMaterial
          color={b}
          emissive={b}
          emissiveIntensity={0.55}
          roughness={0.35}
          metalness={0.2}
        />
      </mesh>
    </group>
  );
}

function HardwareScene({
  progress,
  reducedMotion,
  active,
  kind,
}: {
  progress: number;
  reducedMotion: boolean;
  active: boolean;
  kind: Kind;
}) {
  const { a, b } = palette(kind);
  const group = useRef<THREE.Group>(null);

  const chips = useMemo(() => {
    return [
      { p: new THREE.Vector3(-1.8, 0.8, 0), s: new THREE.Vector3(0.9, 0.55, 0.08) },
      { p: new THREE.Vector3(0.0, 0.6, 0), s: new THREE.Vector3(1.1, 0.7, 0.08) },
      { p: new THREE.Vector3(1.7, 0.3, 0), s: new THREE.Vector3(0.85, 0.55, 0.08) },
      { p: new THREE.Vector3(-0.8, -0.6, 0), s: new THREE.Vector3(1.0, 0.6, 0.08) },
      { p: new THREE.Vector3(1.0, -0.7, 0), s: new THREE.Vector3(0.95, 0.6, 0.08) },
    ];
  }, []);

  useFrame((state) => {
    if (!active || reducedMotion) return;
    const t = state.clock.getElapsedTime();
    if (group.current) {
      group.current.rotation.y = (progress - 0.5) * 0.8;
      group.current.rotation.x = Math.sin(t * 0.18) * 0.05;
    }
  });

  return (
    <group ref={group}>
      {chips.map((c, i) => (
        <group key={i} position={c.p}>
          <mesh scale={c.s}>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial
              color={i % 2 === 0 ? a : b}
              emissive={i % 2 === 0 ? a : b}
              emissiveIntensity={0.18}
              roughness={0.55}
              metalness={0.15}
              transparent
              opacity={0.7}
            />
          </mesh>

          {Array.from({ length: 6 }).map((_, k) => (
            <mesh
              key={k}
              position={[
                THREE.MathUtils.lerp(-0.45, 0.45, k / 5),
                -0.42,
                0.06 + Math.sin(progress * Math.PI * 2) * 0.02,
              ]}
              scale={[0.07, 0.18, 0.07]}
            >
              <boxGeometry args={[1, 1, 1]} />
              <meshStandardMaterial
                color="#ffffff"
                emissive="#ffffff"
                emissiveIntensity={0.12}
                transparent
                opacity={0.45}
              />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}

function ResearchScene({
  progress,
  reducedMotion,
  active,
  kind,
}: {
  progress: number;
  reducedMotion: boolean;
  active: boolean;
  kind: Kind;
}) {
  const { a, b } = palette(kind);
  const group = useRef<THREE.Group>(null);

  const points = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    for (let x = -2; x <= 2; x++) {
      for (let y = -2; y <= 2; y++) {
        pts.push(new THREE.Vector3(x * 0.6, y * 0.6, 0));
      }
    }
    return pts;
  }, []);

  useFrame((state) => {
    if (!active || reducedMotion) return;
    const t = state.clock.getElapsedTime();
    if (group.current) {
      group.current.rotation.y = (progress - 0.5) * 0.7;
      group.current.rotation.x = Math.sin(t * 0.2) * 0.06;
    }
  });

  const lift = THREE.MathUtils.lerp(-0.2, 0.3, progress);

  return (
    <group ref={group} position={[0, lift, 0]}>
      {points.map((p, i) => {
        const mix = i % 2 === 0 ? a : b;
        const glow = 0.15 + 0.25 * Math.sin(progress * Math.PI * 2 + i * 0.15);
        return (
          <mesh key={i} position={p}>
            <sphereGeometry args={[0.06, 18, 18]} />
            <meshStandardMaterial
              color={mix}
              emissive={mix}
              emissiveIntensity={0.25 + glow}
              roughness={0.4}
              metalness={0.1}
              transparent
              opacity={0.8}
            />
          </mesh>
        );
      })}

      <mesh position={[0, 0, -0.2]} scale={[3.4, 3.4, 0.06]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial
          color="#ffffff"
          emissive="#ffffff"
          emissiveIntensity={0.06}
          transparent
          opacity={0.12}
          roughness={0.8}
          metalness={0.05}
        />
      </mesh>
    </group>
  );
}

function DefaultScene({
  progress,
  reducedMotion,
  active,
  kind,
}: {
  progress: number;
  reducedMotion: boolean;
  active: boolean;
  kind: Kind;
}) {
  const { a } = palette(kind);
  const group = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!active || reducedMotion) return;
    const t = state.clock.getElapsedTime();
    if (group.current) {
      group.current.rotation.y = t * 0.25 + (progress - 0.5) * 0.6;
      group.current.rotation.x = Math.sin(t * 0.18) * 0.08;
    }
  });

  return (
    <group ref={group}>
      <mesh>
        <icosahedronGeometry args={[1.05, 1]} />
        <meshStandardMaterial
          color={a}
          emissive={a}
          emissiveIntensity={0.25}
          metalness={0.45}
          roughness={0.35}
          transparent
          opacity={0.75}
        />
      </mesh>

      <mesh rotation={[Math.PI / 2.2, 0, 0]}>
        <torusGeometry args={[1.6, 0.02, 16, 240]} />
        <meshStandardMaterial
          color="#ffffff"
          emissive="#ffffff"
          emissiveIntensity={0.16}
          transparent
          opacity={0.35}
        />
      </mesh>
    </group>
  );
}

function SceneRoot({
  label,
  progress,
  reducedMotion,
  active,
}: {
  label?: string;
  progress: number;
  reducedMotion: boolean;
  active: boolean;
}) {
  const kind = mapLabelToKind(label);

  return (
    <>
      <Stars
        radius={55}
        depth={40}
        count={reducedMotion ? 500 : 1400}
        factor={3}
        fade
        speed={reducedMotion ? 0 : 0.6}
      />

      <ambientLight intensity={0.35} />
      <directionalLight position={[4, 4, 2]} intensity={1.05} />
      <pointLight position={[-4, -2, -2]} intensity={0.55} />
      <fog attach="fog" args={["#07070c", 6, 16]} />

      {kind === "pipelines" && (
        <PipelinesScene progress={progress} reducedMotion={reducedMotion} active={active} kind={kind} />
      )}
      {kind === "vision" && (
        <VisionScene progress={progress} reducedMotion={reducedMotion} active={active} kind={kind} />
      )}
      {kind === "observability" && (
        <ObservabilityScene progress={progress} reducedMotion={reducedMotion} active={active} kind={kind} />
      )}
      {kind === "hardware" && (
        <HardwareScene progress={progress} reducedMotion={reducedMotion} active={active} kind={kind} />
      )}
      {kind === "research" && (
        <ResearchScene progress={progress} reducedMotion={reducedMotion} active={active} kind={kind} />
      )}
      {kind === "default" && (
        <DefaultScene progress={progress} reducedMotion={reducedMotion} active={active} kind={kind} />
      )}
    </>
  );
}

export default function SceneCanvas({ label }: { label?: string }) {
  const reducedMotion = usePrefersReducedMotion();

  const inView = useInView(0.12);
  const scroll = useScrollProgress();

  const active = inView.inView && !reducedMotion;

  // Single callback ref that feeds both hooks without mutating hook return values.
  const setContainerRef = (el: HTMLDivElement | null) => {
    inView.setTarget(el);
    scroll.setTarget(el);
  };

  return (
    <div
      ref={setContainerRef}
      className="relative overflow-hidden rounded-3xl border border-white/12 bg-white/5"
    >
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

      <div className="h-[280px] md:h-[360px] lg:h-[420px]">
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
          />
        </Canvas>
      </div>
    </div>
  );
}
