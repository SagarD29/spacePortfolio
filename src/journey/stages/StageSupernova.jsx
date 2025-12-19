import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

function GRB() {
  return (
    <group>
      <mesh>
        <cylinderGeometry args={[0.05, 0.9, 52, 42, 1, true]} />
        <meshStandardMaterial color="#0b0b18" emissive="#ffd36e" emissiveIntensity={2.8} transparent opacity={0.22} side={THREE.DoubleSide} />
      </mesh>
      <mesh rotation={[Math.PI, 0, 0]}>
        <cylinderGeometry args={[0.05, 0.9, 52, 42, 1, true]} />
        <meshStandardMaterial color="#0b0b18" emissive="#ffd36e" emissiveIntensity={2.8} transparent opacity={0.22} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

export default function StageSupernova() {
  const core = useRef();
  const burst = useRef();
  const shock = useRef();
  const ejecta = useRef();

  const ejectaGeo = useMemo(() => {
    const count = 12000;
    const g = new THREE.BufferGeometry();
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = Math.pow(Math.random(), 0.3) * 140;
      const a = Math.random() * Math.PI * 2;
      const b = (Math.random() - 0.5) * Math.PI;
      arr[i * 3 + 0] = Math.cos(a) * Math.cos(b) * r;
      arr[i * 3 + 1] = Math.sin(b) * r;
      arr[i * 3 + 2] = Math.sin(a) * Math.cos(b) * r;
    }
    g.setAttribute("position", new THREE.BufferAttribute(arr, 3));
    return g;
  }, []);

  useFrame((state, dt) => {
    const t = state.clock.elapsedTime;

    if (core.current) {
      core.current.rotation.y += dt * 0.22;
      const pulse = 1 + Math.sin(t * 3.0) * 0.10;
      core.current.scale.setScalar(pulse);
    }

    if (burst.current) {
      burst.current.rotation.y = t * 0.35;
      burst.current.rotation.z = t * 0.22;
    }

    if (shock.current) {
      const s = 1.0 + (Math.sin(t * 1.2) * 0.5 + 0.5) * 0.6;
      shock.current.scale.setScalar(s);
      shock.current.rotation.y = t * 0.12;
    }

    if (ejecta.current) {
      ejecta.current.rotation.y = t * 0.03;
    }
  });

  return (
    <group>
      <mesh ref={core}>
        <sphereGeometry args={[2.9, 96, 96]} />
        <meshPhysicalMaterial
          color="#0b0b18"
          emissive="#ffd36e"
          emissiveIntensity={3.0}
          transparent
          opacity={0.80}
          roughness={0.25}
          metalness={0.1}
          clearcoat={0.2}
          clearcoatRoughness={0.35}
        />
      </mesh>

      <group ref={burst}>
        <GRB />
      </group>

      {/* shockwave shell */}
      <mesh ref={shock} scale={1.25}>
        <sphereGeometry args={[6.5, 80, 80]} />
        <meshBasicMaterial color="#ffd36e" transparent opacity={0.05} side={THREE.BackSide} depthWrite={false} />
      </mesh>

      {/* ejecta */}
      <points ref={ejecta} geometry={ejectaGeo}>
        <pointsMaterial size={0.09} color="#cfd6ff" transparent opacity={0.16} depthWrite={false} />
      </points>
    </group>
  );
}
