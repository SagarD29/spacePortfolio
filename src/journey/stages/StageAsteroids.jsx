import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";

export default function StageAsteroids() {
  const group = useRef();
  const rocks = useMemo(() => {
    const n = 520;
    return Array.from({ length: n }).map((_, i) => {
      const a = Math.random() * Math.PI * 2;
      const r = 18 + Math.random() * 42;
      return {
        x: Math.cos(a) * r,
        y: (Math.random() - 0.5) * 14,
        z: Math.sin(a) * r,
        s: 0.05 + Math.random() * 0.42,
        rx: Math.random() * Math.PI,
        ry: Math.random() * Math.PI,
        i,
      };
    });
  }, []);

  useFrame((state) => {
    if (!group.current) {return;}
    group.current.rotation.y = state.clock.elapsedTime * 0.12;
  });

  return (
    <group ref={group}>
      {rocks.map((a) => (
        <mesh key={a.i} position={[a.x, a.y, a.z]} rotation={[a.rx, a.ry, 0]} scale={a.s}>
          <icosahedronGeometry args={[1, 0]} />
          <meshStandardMaterial color="#11111a" roughness={0.98} metalness={0.03} />
        </mesh>
      ))}
    </group>
  );
}
