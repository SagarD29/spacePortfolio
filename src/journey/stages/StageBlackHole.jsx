import { useFrame } from "@react-three/fiber";
import { useRef } from "react";

export default function StageBlackHole({ onEnterArchive }) {
  const disk = useRef();
  const photon = useRef();

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (disk.current) {disk.current.rotation.z = t * 0.42;}
    if (photon.current) {photon.current.rotation.y = t * 0.62;}
  });

  return (
    <group>
      <mesh onPointerDown={onEnterArchive}>
        <sphereGeometry args={[2.25, 72, 72]} />
        <meshStandardMaterial color="#000000" roughness={1} metalness={0} />
      </mesh>

      <mesh ref={disk} rotation={[Math.PI / 2.2, 0, 0]}>
        <torusGeometry args={[3.7, 0.65, 56, 280]} />
        <meshStandardMaterial color="#0b0b18" emissive="#ff9a3c" emissiveIntensity={0.85} roughness={0.32} metalness={0.2} transparent opacity={0.92} />
      </mesh>

      <mesh ref={photon}>
        <torusGeometry args={[2.9, 0.07, 28, 280]} />
        <meshStandardMaterial color="#0b0b18" emissive="#b8c8ff" emissiveIntensity={1.2} roughness={0.22} metalness={0.35} transparent opacity={0.96} />
      </mesh>
    </group>
  );
}
