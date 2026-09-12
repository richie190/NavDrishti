import { Color, Vector3 } from 'three';
import { ConvexGeometry } from 'three/addons/geometries/ConvexGeometry.js';

export function random(seed: number) {
  let state = seed;
  return () => { state = Math.imul(1664525, state) + 1013904223 | 0; return (state >>> 0) / 4294967296; };
}

export function iceGeometry(seed: number, mountain = false) {
  const rand = random(seed);
  const points: Vector3[] = [];
  const sides = mountain ? 9 : 15;
  for (let ring = 0; ring < 4; ring++) {
    for (let i = 0; i < sides; i++) {
      const angle = i / sides * Math.PI * 2 + (ring % 2) * 0.16;
      const radius = (ring === 3 ? (mountain ? 0.08 : 0.56) : ring === 2 ? 0.78 : 1) * (0.76 + rand() * 0.4);
      const y = ring === 0 ? -0.17 : ring === 1 ? 0.05 : ring === 2 ? 0.48 + rand() * 0.15 : 0.76 + rand() * 0.33;
      points.push(new Vector3(Math.cos(angle) * radius + ring * 0.06, y, Math.sin(angle) * radius));
    }
  }
  const geometry = new ConvexGeometry(points);
  const colors: number[] = [];
  const position = geometry.getAttribute('position');
  const tint = new Color();
  for (let i = 0; i < position.count; i += 3) {
    const shade = 0.82 + rand() * 0.18;
    tint.setRGB(shade * 0.81, shade * 0.95, shade);
    for (let v = 0; v < 3; v++) colors.push(tint.r, tint.g, tint.b);
  }
  return { geometry, colors };
}

export const smooth = (a: number, b: number, value: number) => {
  const x = Math.min(1, Math.max(0, (value - a) / (b - a)));
  return x * x * (3 - 2 * x);
};

export const windowAt = (chapter: number, start: number, end: number) => smooth(start - 0.5, start + 0.15, chapter) * (1 - smooth(end - 0.15, end + 0.5, chapter));
