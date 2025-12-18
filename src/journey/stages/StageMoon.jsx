import { useFrame } from "@react-three/fiber";
import { useRef } from "react";

function Planet({ r, color, emissive, e, roughness = 0.55, metalness = 0.05 }) {
  return (
    <mesh>
      <sphereGeometry args={[r, 64, 64]} />
      <meshStandardMaterial
        color={color}
        emissive={emissive}
        emissiveIntensity={e}
        roughness={roughness}
        metalness={metalness}
      />
    </mesh>
  );
}

export default function StageMoon() {
  const earth = useRef();
  const moon = useRef();

  useFrame((state, dt) => {
    const t = state.clock.elapsedTime;

    if (earth.current) {earth.current.rotation.y += dt * 0.12;}

    if (moon.current) {
      // Same orbit equation as Earth stage => continuity
      const a = t * 0.35;
      moon.current.position.set(Math.cos(a) * 7.5, 0.6, Math.sin(a) * 7.5);
      moon.current.rotation.y += dt * 0.14;
    }
  });

  return (
    <group>
      {/* Earth stays in background */}
      <group ref={earth} position={[0, 0, 0]}>
        <Planet r={2.7} color="#071d4a" emissive="#0b2a66" e={0.06} roughness={0.7} metalness={0.02} />
        <mesh scale={1.02}>
          <sphereGeometry args={[2.7, 64, 64]} />
          <meshStandardMaterial
            color="#0b0b18"
            emissive="#7aa2ff"
            emissiveIntensity={0.35}
            transparent
            opacity={0.05}
          />
        </mesh>
      </group>

      {/* Moon orbits Earth, but will be kept in focus by the camera */}
      <group ref={moon}>
        <Planet r={1.1} color="#1a1a22" emissive="#0b0b18" e={0.18} roughness={1} metalness={0} />
      </group>
    </group>
  );
}
