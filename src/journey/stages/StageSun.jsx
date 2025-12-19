import { Sparkles } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

function Corona({ radius }) {
  const ref = useRef();
  useFrame((state) => {
    if (!ref.current) {return;}
    const t = state.clock.elapsedTime;
    ref.current.rotation.y = t * 0.06;
    ref.current.rotation.x = Math.sin(t * 0.08) * 0.08;
  });

  const mat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: new THREE.Color("#ff9a3c"),
        transparent: true,
        opacity: 0.10,
        side: THREE.BackSide,
        depthWrite: false,
      }),
    []
  );

  return (
    <mesh ref={ref} material={mat} scale={1.18}>
      <sphereGeometry args={[radius, 96, 96]} />
    </mesh>
  );
}

export default function StageSun() {
  const sun = useRef();
  const flare = useRef();

  useFrame((state, dt) => {
    const t = state.clock.elapsedTime;
    if (sun.current) {sun.current.rotation.y += dt * 0.08;}
    if (flare.current) {flare.current.rotation.z = t * 0.18;}
  });

  return (
    <group>
      <group ref={sun}>
        <mesh>
          <sphereGeometry args={[4.2, 96, 96]} />
          <meshPhysicalMaterial
            color="#120c05"
            emissive="#ff9a3c"
            emissiveIntensity={1.55}
            roughness={0.3}
            metalness={0}
            clearcoat={0.15}
            clearcoatRoughness={0.35}
          />
        </mesh>
        <Corona radius={4.2} />
      </group>

      {/* subtle ring flare */}
      <mesh ref={flare} rotation={[Math.PI / 2.6, 0, 0]}>
        <torusGeometry args={[6.2, 0.18, 32, 280]} />
        <meshStandardMaterial color="#0b0b18" emissive="#ffd36e" emissiveIntensity={1.3} transparent opacity={0.25} />
      </mesh>

      <Sparkles count={520} scale={[44, 44, 44]} size={4.5} speed={0.75} opacity={0.6} />
    </group>
  );
}
