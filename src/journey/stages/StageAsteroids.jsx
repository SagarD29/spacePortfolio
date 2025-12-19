import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

export default function StageAsteroids() {
  const inst = useRef();
  const dust = useRef();

  const { dummy, transforms, dustGeo } = useMemo(() => {
    const dummyObj = new THREE.Object3D();

    const n = 2600;
    const arr = Array.from({ length: n }).map(() => {
      const a = Math.random() * Math.PI * 2;
      const r = 18 + Math.random() * 62;
      return {
        x: Math.cos(a) * r + (Math.random() - 0.5) * 10,
        y: (Math.random() - 0.5) * 18,
        z: Math.sin(a) * r + (Math.random() - 0.5) * 10,
        s: 0.06 + Math.random() * 0.55,
        rx: Math.random() * Math.PI,
        ry: Math.random() * Math.PI,
        rz: Math.random() * Math.PI,
      };
    });

    const dustCount = 9000;
    const g = new THREE.BufferGeometry();
    const pos = new Float32Array(dustCount * 3);
    for (let i = 0; i < dustCount; i++) {
      const a = Math.random() * Math.PI * 2;
      const r = 30 + Math.random() * 120;
      pos[i * 3 + 0] = Math.cos(a) * r + (Math.random() - 0.5) * 22;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 30;
      pos[i * 3 + 2] = Math.sin(a) * r + (Math.random() - 0.5) * 22;
    }
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));

    return { dummy: dummyObj, transforms: arr, dustGeo: g };
  }, []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;

    if (inst.current) {
      inst.current.rotation.y = t * 0.10;

      transforms.forEach((a, i) => {
        dummy.position.set(a.x, a.y, a.z);
        dummy.rotation.set(a.rx + t * 0.02, a.ry + t * 0.03, a.rz);
        dummy.scale.setScalar(a.s);
        dummy.updateMatrix();
        inst.current.setMatrixAt(i, dummy.matrix);
      });
      inst.current.instanceMatrix.needsUpdate = true;
    }

    if (dust.current) {
      dust.current.rotation.y = t * 0.03;
      dust.current.rotation.x = Math.sin(t * 0.05) * 0.03;
    }
  });

  return (
    <group>
      <instancedMesh ref={inst} args={[null, null, transforms.length]}>
        <icosahedronGeometry args={[1, 0]} />
        <meshStandardMaterial color="#0f0f18" roughness={0.98} metalness={0.03} />
      </instancedMesh>

      <points ref={dust} geometry={dustGeo}>
        <pointsMaterial size={0.08} color="#cfd6ff" transparent opacity={0.18} depthWrite={false} />
      </points>
    </group>
  );
}
