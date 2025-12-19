import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

function DustRing({ count = 1400 }) {
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2;
      const r = 9 + Math.random() * 10;
      arr[i * 3 + 0] = Math.cos(a) * r + (Math.random() - 0.5) * 0.4;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 2.2;
      arr[i * 3 + 2] = Math.sin(a) * r + (Math.random() - 0.5) * 0.4;
    }
    g.setAttribute("position", new THREE.BufferAttribute(arr, 3));
    return g;
  }, [count]);

  const ref = useRef();
  useFrame((state) => {
    if (!ref.current) {return;}
    ref.current.rotation.y = state.clock.elapsedTime * 0.04;
  });

  return (
    <points ref={ref} geometry={geo}>
      <pointsMaterial size={0.05} color="#cfd6ff" transparent opacity={0.22} depthWrite={false} />
    </points>
  );
}

export default function StageMoon() {
  const earth = useRef();
  const moon = useRef();
  const glow = useRef();

  useFrame((state, dt) => {
    const t = state.clock.elapsedTime;

    if (earth.current) {earth.current.rotation.y += dt * 0.08;}

    if (moon.current) {
      const a = t * 0.35;
      moon.current.position.set(Math.cos(a) * 7.5, 0.6, Math.sin(a) * 7.5);
      moon.current.rotation.y += dt * 0.16;
    }

    if (glow.current) {
      glow.current.position.copy(moon.current.position);
      glow.current.rotation.y += dt * 0.1;
    }
  });

  return (
    <group>
      {/* EARTH BACKGROUND */}
      <group ref={earth} position={[0, 0, 0]}>
        <mesh>
          <sphereGeometry args={[2.7, 96, 96]} />
          <meshPhysicalMaterial
            color="#061a44"
            emissive="#0b2a66"
            emissiveIntensity={0.08}
            roughness={0.65}
            metalness={0}
            clearcoat={0.15}
            clearcoatRoughness={0.7}
          />
        </mesh>
        <mesh scale={1.04}>
          <sphereGeometry args={[2.7, 96, 96]} />
          <meshStandardMaterial color="#0b0b18" emissive="#7aa2ff" emissiveIntensity={0.25} transparent opacity={0.05} />
        </mesh>
      </group>

      {/* MOON (FOCUS) */}
      <group ref={moon}>
        <mesh>
          <sphereGeometry args={[1.1, 96, 96]} />
          <meshStandardMaterial color="#181820" emissive="#0b0b18" emissiveIntensity={0.22} roughness={1} metalness={0} />
        </mesh>
      </group>

      {/* moon limb glow */}
      <mesh ref={glow} scale={1.12}>
        <sphereGeometry args={[1.1, 64, 64]} />
        <meshBasicMaterial color="#cfd6ff" transparent opacity={0.08} side={THREE.BackSide} depthWrite={false} />
      </mesh>

      <DustRing />
    </group>
  );
}
