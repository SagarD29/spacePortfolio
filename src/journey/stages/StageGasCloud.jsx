import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

function NebulaLayer({ r, color, opacity }) {
  return (
    <mesh scale={1.0}>
      <sphereGeometry args={[r, 64, 64]} />
      <meshStandardMaterial
        color="#05050b"
        emissive={color}
        emissiveIntensity={0.9}
        transparent
        opacity={opacity}
        roughness={1}
        metalness={0}
        depthWrite={false}
      />
    </mesh>
  );
}

export default function StageGasCloud() {
  const g1 = useRef();
  const g2 = useRef();
  const g3 = useRef();
  const dust = useRef();

  const dustGeo = useMemo(() => {
    const count = 16000;
    const g = new THREE.BufferGeometry();
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * 220;
      const y = (Math.random() - 0.5) * 130;
      const z = (Math.random() - 0.5) * 220;
      arr[i * 3 + 0] = x;
      arr[i * 3 + 1] = y;
      arr[i * 3 + 2] = z;
    }
    g.setAttribute("position", new THREE.BufferAttribute(arr, 3));
    return g;
  }, []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (g1.current) {g1.current.rotation.y = t * 0.02;}
    if (g2.current) {g2.current.rotation.y = -t * 0.015;}
    if (g3.current) {g3.current.rotation.y = t * 0.01;}

    if (dust.current) {
      dust.current.rotation.y = t * 0.01;
      dust.current.rotation.x = Math.sin(t * 0.04) * 0.03;
    }
  });

  return (
    <group>
      <group ref={g1}>
        <NebulaLayer r={32} color="#7cffd1" opacity={0.08} />
      </group>
      <group ref={g2}>
        <NebulaLayer r={46} color="#7aa2ff" opacity={0.06} />
      </group>
      <group ref={g3}>
        <NebulaLayer r={62} color="#ff79c6" opacity={0.05} />
      </group>

      <points ref={dust} geometry={dustGeo}>
        <pointsMaterial size={0.08} color="#cfd6ff" transparent opacity={0.12} depthWrite={false} />
      </points>
    </group>
  );
}
