import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

/**
 * StageAsteroids (original layout preserved)
 * - Keeps your instancedMesh transforms & dust
 * - Adds procedural rocky texture to the asteroids (no image files)
 * - Implemented by patching MeshStandardMaterial via onBeforeCompile (keeps PBR lighting + instancing)
 */

export default function StageAsteroids() {
  const inst = useRef();
  const dust = useRef();

  const { dummy, transforms, dustGeo, asteroidMat } = useMemo(() => {
    const dummyObj = new THREE.Object3D();

    // ---------------------------
    // Original asteroid transforms
    // ---------------------------
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
        seed: Math.random() * 1000,
      };
    });

    // ---------------------------
    // Original dust geometry
    // ---------------------------
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

    // ---------------------------
    // Material: MeshStandardMaterial + shader patch
    // ---------------------------
    const mat = new THREE.MeshStandardMaterial({
      color: new THREE.Color("#0f0f18"),
      roughness: 0.98,
      metalness: 0.03,
    });

    // Add uniforms for animation + consistent noise scale
    mat.userData.uTime = { value: 0 };
    mat.userData.uTexScale = { value: 0.55 }; // overall texture frequency
    mat.userData.uCrater = { value: 0.55 }; // crater intensity
    mat.userData.uRidge = { value: 0.65 }; // ridge intensity

    mat.onBeforeCompile = (shader) => {
      shader.uniforms.uTime = mat.userData.uTime;
      shader.uniforms.uTexScale = mat.userData.uTexScale;
      shader.uniforms.uCrater = mat.userData.uCrater;
      shader.uniforms.uRidge = mat.userData.uRidge;

      // 1) Inject varyings to carry world position/normal
      shader.vertexShader = shader.vertexShader
        .replace(
          "#include <common>",
          `#include <common>
varying vec3 vPosW;
varying vec3 vNormalW;
`
        )
        .replace(
          "#include <worldpos_vertex>",
          `#include <worldpos_vertex>
vPosW = worldPosition.xyz;
vNormalW = normalize( mat3(modelMatrix) * normal );
`
        );

      // 2) Add noise + texture logic into fragment shader
      shader.fragmentShader = shader.fragmentShader
        .replace(
          "#include <common>",
          `#include <common>
varying vec3 vPosW;
varying vec3 vNormalW;

uniform float uTime;
uniform float uTexScale;
uniform float uCrater;
uniform float uRidge;

// --- value noise / fbm (no textures) ---
float hash(vec3 p) {
  p = fract(p * 0.3183099 + vec3(0.1, 0.2, 0.3));
  p *= 17.0;
  return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
}

float noise(vec3 p) {
  vec3 i = floor(p);
  vec3 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);

  float n000 = hash(i + vec3(0,0,0));
  float n100 = hash(i + vec3(1,0,0));
  float n010 = hash(i + vec3(0,1,0));
  float n110 = hash(i + vec3(1,1,0));
  float n001 = hash(i + vec3(0,0,1));
  float n101 = hash(i + vec3(1,0,1));
  float n011 = hash(i + vec3(0,1,1));
  float n111 = hash(i + vec3(1,1,1));

  float n00 = mix(n000, n100, f.x);
  float n10 = mix(n010, n110, f.x);
  float n01 = mix(n001, n101, f.x);
  float n11 = mix(n011, n111, f.x);

  float n0 = mix(n00, n10, f.y);
  float n1 = mix(n01, n11, f.y);

  return mix(n0, n1, f.z);
}

float fbm(vec3 p) {
  float a = 0.55;
  float f = 0.0;
  for (int i=0; i<5; i++) {
    f += a * noise(p);
    p *= 2.02;
    a *= 0.5;
  }
  return f;
}

float ridged(vec3 p) {
  float a = 0.55;
  float f = 0.0;
  for (int i=0; i<4; i++) {
    float n = noise(p);
    n = 1.0 - abs(2.0*n - 1.0);
    f += a * n;
    p *= 2.12;
    a *= 0.55;
  }
  return f;
}

float craterMask(vec3 p) {
  // layered pits (cheap crater feel)
  float c = 0.0;
  c += smoothstep(0.70, 0.98, fbm(p * 3.5));
  c += 0.65 * smoothstep(0.72, 0.99, fbm(p * 7.5));
  return clamp(c, 0.0, 1.0);
}
`
        )
        // 3) Apply procedural albedo mod AFTER base color is computed
        .replace(
          "#include <color_fragment>",
          `#include <color_fragment>

// --- Procedural rock texture (affects diffuseColor.rgb) ---
vec3 N = normalize(vNormalW);

// Stable domain: world position + tiny time drift (very subtle)
vec3 P = vPosW * uTexScale + vec3(0.0, uTime * 0.02, 0.0);

// Macro variation
float base = fbm(P * 1.2);
float ridge = ridged(P * 2.0);
float pits = craterMask(P * 1.0);

// Palette shaping
vec3 darkRock  = vec3(0.05, 0.05, 0.07);
vec3 midRock   = vec3(0.12, 0.11, 0.10);
vec3 lightRock = vec3(0.22, 0.20, 0.18);

vec3 tex = mix(darkRock, midRock, smoothstep(0.18, 0.78, base));
tex = mix(tex, lightRock, smoothstep(0.55, 0.95, ridge) * uRidge);

// crater darkening
tex *= 1.0 - pits * (0.35 * uCrater);

// subtle mineral tint
float tint = fbm(P * 4.5);
tex += vec3(0.02, 0.015, 0.01) * (tint - 0.5);

// Multiply into the existing albedo
diffuseColor.rgb *= tex;
`
        );
    };

    return { dummy: dummyObj, transforms: arr, dustGeo: g, asteroidMat: mat };
  }, []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;

    // drive shader animation
    if (asteroidMat) {asteroidMat.userData.uTime.value = t;}

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
      {/* KEEP ORIGINAL DESIGN: instancing + transforms */}
      <instancedMesh ref={inst} args={[null, null, transforms.length]}>
        <icosahedronGeometry args={[1, 0]} />
        <primitive object={asteroidMat} attach="material" />
      </instancedMesh>

      {/* Dust stays the same */}
      <points ref={dust} geometry={dustGeo}>
        <pointsMaterial
          size={0.08}
          color="#cfd6ff"
          transparent
          opacity={0.18}
          depthWrite={false}
        />
      </points>
    </group>
  );
}
