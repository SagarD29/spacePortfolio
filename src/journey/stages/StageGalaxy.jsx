import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

function makeSpiralPoints() {
  const count = 26000;
  const arr = new Float32Array(count * 3);
  const arms = 4;
  for (let i = 0; i < count; i++) {
    const r = Math.pow(Math.random(), 0.55) * 320;
    const arm = i % arms;
    const base = (arm / arms) * Math.PI * 2;
    const theta = base + r * 0.038 + (Math.random() - 0.5) * 0.45;
    arr[i * 3 + 0] = Math.cos(theta) * r + (Math.random() - 0.5) * 18;
    arr[i * 3 + 2] = Math.sin(theta) * r + (Math.random() - 0.5) * 18;
    arr[i * 3 + 1] = (Math.random() - 0.5) * 18 * (1 - r / 320);
  }
  return arr;
}

export default function StageGalaxy() {
  const ref = useRef();
  const positions = useMemo(() => makeSpiralPoints(), []);
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return g;
  }, [positions]);

  useFrame((state) => {
    if (!ref.current) {return;}
    ref.current.rotation.y = state.clock.elapsedTime * 0.02;
  });

  return (
    <points ref={ref} geometry={geo}>
      <pointsMaterial size={0.22} sizeAttenuation depthWrite={false} color="#cfd6ff" transparent opacity={0.95} />
    </points>
  );
}
