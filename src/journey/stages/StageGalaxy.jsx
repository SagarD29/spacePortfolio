import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

function makeGalaxy(count, radius, arms, thickness, twist) {
  const arr = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const r = Math.pow(Math.random(), 0.55) * radius;
    const arm = i % arms;
    const base = (arm / arms) * Math.PI * 2;
    const theta = base + r * twist + (Math.random() - 0.5) * 0.55;

    arr[i * 3 + 0] = Math.cos(theta) * r + (Math.random() - 0.5) * 18;
    arr[i * 3 + 2] = Math.sin(theta) * r + (Math.random() - 0.5) * 18;
    arr[i * 3 + 1] = (Math.random() - 0.5) * thickness * (1 - r / radius);
  }
  return arr;
}

function makeHalo(count, radius) {
  const arr = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const r = Math.pow(Math.random(), 0.4) * radius;
    const a = Math.random() * Math.PI * 2;
    const b = (Math.random() - 0.5) * Math.PI * 0.35;
    arr[i * 3 + 0] = Math.cos(a) * Math.cos(b) * r;
    arr[i * 3 + 1] = Math.sin(b) * r * 0.6;
    arr[i * 3 + 2] = Math.sin(a) * Math.cos(b) * r;
  }
  return arr;
}

export default function StageGalaxy() {
  const armsRef = useRef();
  const coreRef = useRef();
  const haloRef = useRef();

  const { armsGeo, coreGeo, haloGeo } = useMemo(() => {
    const arms = new THREE.BufferGeometry();
    arms.setAttribute("position", new THREE.BufferAttribute(makeGalaxy(52000, 380, 4, 26, 0.038), 3));

    const core = new THREE.BufferGeometry();
    core.setAttribute("position", new THREE.BufferAttribute(makeGalaxy(18000, 120, 3, 18, 0.06), 3));

    const halo = new THREE.BufferGeometry();
    halo.setAttribute("position", new THREE.BufferAttribute(makeHalo(26000, 520), 3));

    return { armsGeo: arms, coreGeo: core, haloGeo: halo };
  }, []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (armsRef.current) {armsRef.current.rotation.y = t * 0.018;}
    if (coreRef.current) {coreRef.current.rotation.y = t * 0.03;}
    if (haloRef.current) {haloRef.current.rotation.y = -t * 0.01;}
  });

  return (
    <group>
      <points ref={haloRef} geometry={haloGeo}>
        <pointsMaterial size={0.22} sizeAttenuation depthWrite={false} color="#7aa2ff" transparent opacity={0.10} />
      </points>

      <points ref={armsRef} geometry={armsGeo}>
        <pointsMaterial size={0.22} sizeAttenuation depthWrite={false} color="#cfd6ff" transparent opacity={0.9} />
      </points>

      <points ref={coreRef} geometry={coreGeo}>
        <pointsMaterial size={0.35} sizeAttenuation depthWrite={false} color="#ffd36e" transparent opacity={0.75} />
      </points>

      {/* core glow */}
      <mesh>
        <sphereGeometry args={[28, 48, 48]} />
        <meshBasicMaterial color="#ffd36e" transparent opacity={0.05} side={THREE.BackSide} depthWrite={false} />
      </mesh>
    </group>
  );
}
