import { Sparkles } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";

export default function StageSun() {
  const sun = useRef();

  useFrame((_, dt) => {
    if (sun.current) {sun.current.rotation.y += dt * 0.08;}
  });

  return (
    <group ref={sun}>
      <mesh>
        <sphereGeometry args={[4.2, 64, 64]} />
        <meshStandardMaterial color="#151106" emissive="#ff9a3c" emissiveIntensity={1.35} roughness={0.35} metalness={0.05} />
      </mesh>
      <Sparkles count={260} scale={[28, 28, 28]} size={4} speed={0.65} opacity={0.5} />
    </group>
  );
}
