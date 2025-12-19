import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

export default function StageInsideHorizon() {
  const fog1 = useRef();
  const fog2 = useRef();
  const streaks = useRef();

  const streakGeo = useMemo(() => {
    const count = 14000;
    const g = new THREE.BufferGeometry();
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const z = -80 + Math.random() * 160;
      arr[i * 3 + 0] = (Math.random() - 0.5) * 40;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 24;
      arr[i * 3 + 2] = z;
    }
    g.setAttribute("position", new THREE.BufferAttribute(arr, 3));
    return g;
  }, []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (fog1.current) {fog1.current.rotation.y = t * 0.10;}
    if (fog2.current) {fog2.current.rotation.y = -t * 0.07;}
    if (streaks.current) {streaks.current.rotation.y = t * 0.02;}
  });

  return (
    <group>
      <mesh ref={fog1}>
        <sphereGeometry args={[10, 64, 64]} />
        <meshBasicMaterial color="#05050b" transparent opacity={0.06} side={THREE.BackSide} depthWrite={false} />
      </mesh>

      <mesh ref={fog2} scale={1.4}>
        <sphereGeometry args={[10, 64, 64]} />
        <meshBasicMaterial color="#b8c8ff" transparent opacity={0.02} side={THREE.BackSide} depthWrite={false} />
      </mesh>

      <points ref={streaks} geometry={streakGeo}>
        <pointsMaterial size={0.12} color="#cfd6ff" transparent opacity={0.10} depthWrite={false} />
      </points>
    </group>
  );
}
