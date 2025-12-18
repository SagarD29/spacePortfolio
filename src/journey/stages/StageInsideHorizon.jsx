import { useFrame } from "@react-three/fiber";
import { useRef } from "react";

export default function StageInsideHorizon() {
  const fog = useRef();

  useFrame((state) => {
    if (!fog.current) {return;}
    fog.current.rotation.y = state.clock.elapsedTime * 0.12;
  });

  return (
    <mesh ref={fog}>
      <sphereGeometry args={[6, 64, 64]} />
      <meshStandardMaterial color="#05050b" emissive="#b8c8ff" emissiveIntensity={0.15} transparent opacity={0.06} roughness={1} metalness={0} />
    </mesh>
  );
}
