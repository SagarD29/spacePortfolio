import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

function OrbitRing({ r }) {
  return (
    <mesh rotation={[Math.PI / 2, 0, 0]}>
      <ringGeometry args={[r - 0.03, r + 0.03, 140]} />
      <meshBasicMaterial color="#ffffff" transparent opacity={0.1} side={THREE.DoubleSide} />
    </mesh>
  );
}

function OrbitPlanet({ orbitR, planetR, speed, emissive }) {
  const ref = useRef();
  useFrame((state) => {
    if (!ref.current) {return;}
    const t = state.clock.elapsedTime * speed;
    ref.current.position.set(Math.cos(t) * orbitR, Math.sin(t * 0.7) * 0.6, Math.sin(t) * orbitR);
    ref.current.rotation.y = t;
  });

  return (
    <mesh ref={ref}>
      <sphereGeometry args={[planetR, 48, 48]} />
      <meshStandardMaterial color="#0b0b18" emissive={emissive} emissiveIntensity={0.65} roughness={0.45} metalness={0.08} />
    </mesh>
  );
}

export default function StageSolarSystem() {
  const orbits = useMemo(
    () => [
      { orbitR: 12, planetR: 0.55, speed: 0.34, c: "#b8c8ff" },
      { orbitR: 18, planetR: 0.75, speed: 0.22, c: "#ff79c6" },
      { orbitR: 26, planetR: 0.85, speed: 0.18, c: "#7cffd1" },
      { orbitR: 36, planetR: 0.8, speed: 0.14, c: "#ffd36e" },
      { orbitR: 52, planetR: 1.8, speed: 0.08, c: "#ff9a3c" },
      { orbitR: 70, planetR: 1.5, speed: 0.06, c: "#cfd6ff" },
      { orbitR: 88, planetR: 1.2, speed: 0.05, c: "#7aa2ff" },
      { orbitR: 106, planetR: 1.15, speed: 0.04, c: "#7cffd1" },
    ],
    []
  );

  return (
    <group>
      <mesh>
        <sphereGeometry args={[5.8, 64, 64]} />
        <meshStandardMaterial color="#151106" emissive="#ff9a3c" emissiveIntensity={1.2} roughness={0.35} />
      </mesh>

      {orbits.map((p, i) => (
        <group key={i}>
          <OrbitRing r={p.orbitR} />
          <OrbitPlanet orbitR={p.orbitR} planetR={p.planetR} speed={p.speed} emissive={p.c} />
        </group>
      ))}
    </group>
  );
}
