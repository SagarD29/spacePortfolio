import * as THREE from "three";

export const clamp01 = (x) => Math.max(0, Math.min(1, x));
export const smooth01 = (x) => {
  const t = clamp01(x);
  return t * t * (3 - 2 * t);
};
export const remap = (x, a, b) => clamp01((x - a) / (b - a));
export const damp = (current, target, lambda, dt) => THREE.MathUtils.damp(current, target, lambda, dt);
export const lerp = (a, b, t) => a + (b - a) * t;
export const v3 = (x, y, z) => new THREE.Vector3(x, y, z);
