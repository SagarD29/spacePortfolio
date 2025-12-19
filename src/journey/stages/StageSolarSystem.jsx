import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

function OrbitRing({ r, opacity = 0.1 }) {
  return (
    <mesh rotation={[Math.PI / 2, 0, 0]}>
      <ringGeometry args={[r - 0.05, r + 0.05, 180]} />
      <meshBasicMaterial color="#ffffff" transparent opacity={opacity} side={THREE.DoubleSide} />
    </mesh>
  );
}

function Planet({ r, color, emissive, e = 0.55, roughness = 0.55 }) {
  return (
    <mesh>
      <sphereGeometry args={[r, 56, 56]} />
      <meshStandardMaterial color={color} emissive={emissive} emissiveIntensity={e} roughness={roughness} metalness={0.08} />
    </mesh>
  );
}

function OrbitingPlanet({ orbitR, planetR, speed, tilt = 0.0, color, emissive }) {
  const ref = useRef();
  useFrame((state) => {
    if (!ref.current) {return;}
    const t = state.clock.elapsedTime * speed;
    const y = Math.sin(t * 0.9) * 0.7;
    ref.current.position.set(Math.cos(t) * orbitR, y, Math.sin(t) * orbitR);
    ref.current.rotation.y = t;
    ref.current.rotation.z = tilt;
  });

  return (
    <group ref={ref}>
      <Planet r={planetR} color={color} emissive={emissive} e={0.65} roughness={0.5} />
    </group>
  );
}

function AsteroidBelt({ inner = 40, outer = 58, count = 2200 }) {
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2;
      const r = inner + Math.random() * (outer - inner);
      arr[i * 3 + 0] = Math.cos(a) * r;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 4.0;
      arr[i * 3 + 2] = Math.sin(a) * r;
    }
    g.setAttribute("position", new THREE.BufferAttribute(arr, 3));
    return g;
  }, [count, inner, outer]);

  const ref = useRef();
  useFrame((state) => {
    if (!ref.current) {return;}
    ref.current.rotation.y = state.clock.elapsedTime * 0.02;
  });

  return (
    <points ref={ref} geometry={geo}>
      <pointsMaterial size={0.12} color="#cfd6ff" transparent opacity={0.18} depthWrite={false} />
    </points>
  );
}

export default function StageSolarSystem() {
  const orbits = useMemo(
    () => [
      { orbitR: 12, r: 0.55, s: 0.38, c: "#0b0b18", e: "#b8c8ff", tilt: 0.1 },
      { orbitR: 18, r: 0.75, s: 0.25, c: "#0b0b18", e: "#ff79c6", tilt: -0.12 },
      { orbitR: 26, r: 0.85, s: 0.20, c: "#0b0b18", e: "#7cffd1", tilt: 0.08 },
      { orbitR: 34, r: 0.65, s: 0.18, c: "#0b0b18", e: "#ffd36e", tilt: -0.05 },
      { orbitR: 52, r: 1.8, s: 0.10, c: "#0b0b18", e: "#ff9a3c", tilt: 0.02 },
      { orbitR: 70, r: 1.45, s: 0.08, c: "#0b0b18", e: "#cfd6ff", tilt: -0.02 },
      { orbitR: 88, r: 1.25, s: 0.065, c: "#0b0b18", e: "#7aa2ff", tilt: 0.03 },
      { orbitR: 106, r: 1.15, s: 0.055, c: "#0b0b18", e: "#7cffd1", tilt: -0.04 },
    ],
    []
  );

  const sun = useRef();
  useFrame((state) => {
    if (!sun.current) {return;}
    sun.current.rotation.y = state.clock.elapsedTime * 0.03;
  });

  return (
    <group>
      <group ref={sun}>
        <mesh>
          <sphereGeometry args={[5.8, 96, 96]} />
          <meshStandardMaterial color="#151106" emissive="#ff9a3c" emissiveIntensity={1.2} roughness={0.35} />
        </mesh>
        <mesh scale={1.16}>
          <sphereGeometry args={[5.8, 96, 96]} />
          <meshBasicMaterial color="#ff9a3c" transparent opacity={0.06} side={THREE.BackSide} depthWrite={false} />
        </mesh>
      </group>

      {orbits.map((p, i) => (
        <group key={i}>
          <OrbitRing r={p.orbitR} opacity={0.08} />
          <OrbitingPlanet orbitR={p.orbitR} planetR={p.r} speed={p.s} tilt={p.tilt} color={p.c} emissive={p.e} />
        </group>
      ))}

      <AsteroidBelt />
    </group>
  );
}
