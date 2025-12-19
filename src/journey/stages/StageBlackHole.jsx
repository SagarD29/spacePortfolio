import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

export default function StageBlackHole({ onEnterArchive }) {
  const disk = useRef();
  const photon = useRef();
  const lens = useRef();

  const lensMat = useMemo(() => {
    return new THREE.MeshBasicMaterial({
      color: new THREE.Color("#b8c8ff"),
      transparent: true,
      opacity: 0.03,
      side: THREE.BackSide,
      depthWrite: false,
    });
  }, []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (disk.current) {disk.current.rotation.z = t * 0.52;}
    if (photon.current) {photon.current.rotation.y = t * 0.75;}
    if (lens.current) {lens.current.rotation.y = -t * 0.12;}
  });

  return (
    <group>
      {/* singularity */}
      <mesh onPointerDown={onEnterArchive}>
        <sphereGeometry args={[2.35, 96, 96]} />
        <meshStandardMaterial color="#000000" roughness={1} metalness={0} />
      </mesh>

      {/* accretion disk */}
      <mesh ref={disk} rotation={[Math.PI / 2.2, 0, 0]}>
        <torusGeometry args={[4.2, 0.95, 64, 360]} />
        <meshPhysicalMaterial
          color="#0b0b18"
          emissive="#ff9a3c"
          emissiveIntensity={1.05}
          roughness={0.28}
          metalness={0.22}
          transparent
          opacity={0.92}
          clearcoat={0.25}
          clearcoatRoughness={0.4}
        />
      </mesh>

      {/* photon sphere ring */}
      <mesh ref={photon}>
        <torusGeometry args={[3.15, 0.10, 40, 360]} />
        <meshStandardMaterial
          color="#0b0b18"
          emissive="#b8c8ff"
          emissiveIntensity={1.5}
          roughness={0.2}
          metalness={0.35}
          transparent
          opacity={0.98}
        />
      </mesh>

      {/* subtle gravitational lens “bubble” */}
      <mesh ref={lens} material={lensMat} scale={1.55}>
        <sphereGeometry args={[3.2, 80, 80]} />
      </mesh>
    </group>
  );
}
