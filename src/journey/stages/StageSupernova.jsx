import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

function GammaRayBurst() {
  return (
    <group>
      <mesh>
        <cylinderGeometry args={[0.05, 0.75, 40, 36, 1, true]} />
        <meshStandardMaterial color="#0b0b18" emissive="#ffd36e" emissiveIntensity={2.4} transparent opacity={0.25} side={THREE.DoubleSide} />
      </mesh>

      <mesh rotation={[Math.PI, 0, 0]}>
        <cylinderGeometry args={[0.05, 0.75, 40, 36, 1, true]} />
        <meshStandardMaterial color="#0b0b18" emissive="#ffd36e" emissiveIntensity={2.4} transparent opacity={0.25} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

export default function StageSupernova() {
  const superN = useRef();
  const burst = useRef();

  useFrame((state, dt) => {
    const t = state.clock.elapsedTime;

    if (superN.current) {
      superN.current.rotation.y += dt * 0.22;
      const pulse = 1 + Math.sin(t * 2.5) * 0.08;
      superN.current.scale.setScalar(pulse);
    }

    if (burst.current) {
      burst.current.rotation.y = t * 0.3;
      burst.current.rotation.z = t * 0.18;
    }
  });

  return (
    <group>
      <mesh ref={superN}>
        <sphereGeometry args={[2.8, 64, 64]} />
        <meshStandardMaterial color="#0b0b18" emissive="#ffd36e" emissiveIntensity={2.5} transparent opacity={0.78} roughness={0.35} metalness={0.1} />
      </mesh>

      <group ref={burst}>
        <GammaRayBurst />
      </group>
    </group>
  );
}
