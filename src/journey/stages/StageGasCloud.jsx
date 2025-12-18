import { useFrame } from "@react-three/fiber";
import { useRef } from "react";

export default function StageGasCloud() {
  const gas = useRef();

  useFrame((state) => {
    if (!gas.current) {return;}
    const t = state.clock.elapsedTime;
    gas.current.rotation.y = t * 0.05;
    gas.current.rotation.x = Math.sin(t * 0.08) * 0.1;
  });

  return (
    <mesh ref={gas}>
      <sphereGeometry args={[22, 64, 64]} />
      <meshStandardMaterial
        color="#0b0b18"
        emissive="#7cffd1"
        emissiveIntensity={0.25}
        transparent
        opacity={0.12}
        roughness={0.85}
        metalness={0}
      />
    </mesh>
  );
}
