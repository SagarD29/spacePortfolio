import { Sparkles } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";

function Planet({ r, color, emissive, e }) {
  return (
    <mesh>
      <sphereGeometry args={[r, 64, 64]} />
      <meshStandardMaterial color={color} emissive={emissive} emissiveIntensity={e} roughness={0.55} metalness={0.05} />
    </mesh>
  );
}

export default function StageEarth() {
  const earth = useRef();
  const moon = useRef();

  useFrame((state, dt) => {
    const t = state.clock.elapsedTime;

    if (earth.current) {earth.current.rotation.y += dt * 0.18;}

    if (moon.current) {
      // moon orbit in background
      const a = t * 0.35;
      moon.current.position.set(Math.cos(a) * 7.5, 0.6, Math.sin(a) * 7.5);
      moon.current.rotation.y += dt * 0.12;
    }
  });

  return (
    <group>
      <group ref={earth} position={[0, 0, 0]}>
        <Planet r={2.7} color="#0b2a66" emissive="#0b2a66" e={0.1} />
        <mesh scale={1.02}>
          <sphereGeometry args={[2.7, 64, 64]} />
          <meshStandardMaterial color="#0b0b18" emissive="#7aa2ff" emissiveIntensity={0.55} transparent opacity={0.06} />
        </mesh>
      </group>

      <group ref={moon} position={[7.5, 0.6, 0]}>
        <Planet r={1.1} color="#1a1a22" emissive="#0b0b18" e={0.14} />
      </group>

      <Sparkles count={120} scale={[22, 22, 22]} size={2} speed={0.4} opacity={0.35} />
    </group>
  );
}
