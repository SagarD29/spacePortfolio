import { Sparkles } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

function AtmosphereShell({ radius, color, opacity }) {
  return (
    <mesh scale={1.0}>
      <sphereGeometry args={[radius, 96, 96]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={1.0}
        transparent
        opacity={opacity}
        roughness={1}
        metalness={0}
      />
    </mesh>
  );
}

function FresnelGlow({ radius, color }) {
  const mat = useMemo(() => {
    const m = new THREE.MeshBasicMaterial({
      color: new THREE.Color(color),
      transparent: true,
      opacity: 0.12,
      side: THREE.BackSide,
      depthWrite: false,
    });
    return m;
  }, [color]);

  return (
    <mesh scale={1.08} material={mat}>
      <sphereGeometry args={[radius, 96, 96]} />
    </mesh>
  );
}

function CloudBand({ radius }) {
  const ref = useRef();
  useFrame((state) => {
    if (!ref.current) {return;}
    const t = state.clock.elapsedTime;
    ref.current.rotation.y = t * 0.08;
    ref.current.rotation.x = Math.sin(t * 0.06) * 0.05;
  });

  return (
    <mesh ref={ref} scale={1.02}>
      <sphereGeometry args={[radius, 96, 96]} />
      <meshStandardMaterial
        color="#0b0b18"
        emissive="#cfd6ff"
        emissiveIntensity={0.25}
        transparent
        opacity={0.05}
        roughness={1}
        metalness={0}
      />
    </mesh>
  );
}

function NightLights({ radius }) {
  const ref = useRef();
  useFrame((state) => {
    if (!ref.current) {return;}
    ref.current.rotation.y = state.clock.elapsedTime * 0.18;
  });

  return (
    <mesh ref={ref} scale={1.003}>
      <sphereGeometry args={[radius, 96, 96]} />
      <meshStandardMaterial
        color="#05050b"
        emissive="#7aa2ff"
        emissiveIntensity={0.55}
        transparent
        opacity={0.06}
        roughness={1}
        metalness={0}
      />
    </mesh>
  );
}

function OrbitalDebris({ count = 900 }) {
  const pts = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2;
      const r = 10 + Math.random() * 18;
      arr[i * 3 + 0] = Math.cos(a) * r + (Math.random() - 0.5) * 0.6;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 4.5;
      arr[i * 3 + 2] = Math.sin(a) * r + (Math.random() - 0.5) * 0.6;
    }
    g.setAttribute("position", new THREE.BufferAttribute(arr, 3));
    return g;
  }, [count]);

  const ref = useRef();
  useFrame((state) => {
    if (!ref.current) {return;}
    ref.current.rotation.y = state.clock.elapsedTime * 0.03;
  });

  return (
    <points ref={ref} geometry={pts}>
      <pointsMaterial size={0.06} color="#cfd6ff" transparent opacity={0.25} depthWrite={false} />
    </points>
  );
}

export default function StageEarth() {
  const earth = useRef();
  const moon = useRef();

  useFrame((state, dt) => {
    const t = state.clock.elapsedTime;

    if (earth.current) {earth.current.rotation.y += dt * 0.18;}

    if (moon.current) {
      // moon orbit (shared with StageMoon)
      const a = t * 0.35;
      moon.current.position.set(Math.cos(a) * 7.5, 0.6, Math.sin(a) * 7.5);
      moon.current.rotation.y += dt * 0.14;
    }
  });

  return (
    <group>
      {/* EARTH */}
      <group ref={earth} position={[0, 0, 0]}>
        <mesh>
          <sphereGeometry args={[2.7, 96, 96]} />
          <meshPhysicalMaterial
            color="#061a44"
            emissive="#0b2a66"
            emissiveIntensity={0.12}
            roughness={0.55}
            metalness={0.0}
            clearcoat={0.2}
            clearcoatRoughness={0.65}
          />
        </mesh>

        {/* cloud + lights + atmosphere */}
        <CloudBand radius={2.7} />
        <NightLights radius={2.7} />
        <AtmosphereShell radius={2.86} color="#7aa2ff" opacity={0.06} />
        <FresnelGlow radius={2.7} color="#7aa2ff" />
      </group>

      {/* MOON */}
      <group ref={moon}>
        <mesh>
          <sphereGeometry args={[1.1, 80, 80]} />
          <meshStandardMaterial
            color="#1a1a22"
            emissive="#0b0b18"
            emissiveIntensity={0.20}
            roughness={1}
            metalness={0}
          />
        </mesh>
      </group>

      {/* extra space dust + sparkles */}
      <OrbitalDebris />
      <Sparkles count={280} scale={[26, 26, 26]} size={2.2} speed={0.45} opacity={0.45} />
    </group>
  );
}
