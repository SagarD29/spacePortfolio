"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Stars, Float, Environment } from "@react-three/drei";
import * as THREE from "three";
import { useMemo, useRef } from "react";

function OrbitalMark({ variant = 0 }: { variant?: number }) {
  const group = useRef<THREE.Group>(null);

  // Different palette intensity per chapter (subtle)
  const color = useMemo(() => {
    const colors = ["#a78bfa", "#22d3ee", "#6366f1", "#f472b6", "#60a5fa"];
    return colors[variant % colors.length];
  }, [variant]);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (group.current) {
      group.current.rotation.y = t * 0.18;
      group.current.rotation.x = Math.sin(t * 0.25) * 0.12;
    }
  });

  return (
    <group ref={group}>
      {/* Core sphere */}
      <mesh>
        <sphereGeometry args={[0.55, 64, 64]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.35}
          metalness={0.6}
          roughness={0.25}
        />
      </mesh>

      {/* Ring */}
      <mesh rotation={[Math.PI / 2.6, 0, 0]}>
        <torusGeometry args={[1.15, 0.02, 16, 240]} />
        <meshStandardMaterial
          color="#ffffff"
          emissive="#ffffff"
          emissiveIntensity={0.22}
          metalness={0.2}
          roughness={0.4}
          transparent
          opacity={0.55}
        />
      </mesh>

      {/* Secondary ring */}
      <mesh rotation={[Math.PI / 3.2, 0.6, 0]}>
        <torusGeometry args={[0.92, 0.015, 16, 240]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.22}
          metalness={0.2}
          roughness={0.45}
          transparent
          opacity={0.45}
        />
      </mesh>
    </group>
  );
}

function Scene({ label }: { label?: string }) {
  // map label -> variant index
  const variant = useMemo(() => {
    const key = (label || "").toLowerCase();
    if (key.includes("pipelines")) return 1;
    if (key.includes("vision")) return 2;
    if (key.includes("observability")) return 3;
    if (key.includes("hardware")) return 4;
    return 0;
  }, [label]);

  return (
    <>
      {/* Background stars */}
      <Stars radius={60} depth={40} count={1600} factor={3} fade speed={0.6} />

      {/* Lighting */}
      <ambientLight intensity={0.35} />
      <directionalLight position={[4, 4, 2]} intensity={1.05} />
      <pointLight position={[-4, -2, -2]} intensity={0.6} />

      {/* Cinematic fog */}
      <fog attach="fog" args={["#07070c", 6, 16]} />

      <Float speed={1.0} rotationIntensity={0.7} floatIntensity={0.6}>
        <OrbitalMark variant={variant} />
      </Float>

      <Environment preset="city" />
    </>
  );
}

export default function SceneCanvas({ label }: { label?: string }) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/12 bg-white/5">
      {/* Text overlay */}
      <div className="absolute left-0 top-0 z-10 p-5 md:p-7 pointer-events-none">
        <p className="text-xs uppercase tracking-wider text-white/60">Scene</p>
        <p className="mt-1 text-sm text-white/80 font-semibold">
          {label ? label : "journey scene"}
        </p>
        <p className="mt-2 text-xs text-white/60 max-w-[38ch]">
          Live Three.js scene (R3F). Lightweight and safe for production.
        </p>
      </div>

      {/* Canvas */}
      <div className="h-[280px] md:h-[360px] lg:h-[420px]">
        <Canvas
          camera={{ position: [0, 0, 6], fov: 45 }}
          dpr={[1, 1.5]}
          gl={{
            antialias: true,
            alpha: true,
            powerPreference: "high-performance",
          }}
        >
          <Scene label={label} />
        </Canvas>
      </div>
    </div>
  );
}
