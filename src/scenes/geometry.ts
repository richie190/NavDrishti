import { BufferGeometry, Float32BufferAttribute } from 'three';

export function random(seed: number) {
  let state = seed;
  return () => { state = Math.imul(1664525, state) + 1013904223 | 0; return (state >>> 0) / 4294967296; };
}

export function iceGeometry(seed: number, mountain = false) {
  const rand = random(seed);
  const n = mountain ? 13 : 25;
  const vertices: number[] = [], indices: number[] = [];
  const phase = rand() * Math.PI * 2;
  for (let row = 0; row <= n; row++) for (let col = 0; col <= n; col++) {
    const u = col / n * 2 - 1, v = row / n * 2 - 1;
    const angle = Math.atan2(v, u);
    const edge = 1 + Math.sin(angle * 5 + phase) * .07 + Math.cos(angle * 9 + phase) * .04;
    const x = u * Math.sqrt(1 - v * v * .35) * edge;
    const z = v * Math.sqrt(1 - u * u * .35) * edge;
    const ridge = Math.exp(-((u + .24) ** 2 * 4.8 + (v - .12) ** 2 * 3.8)) * (mountain ? 1 : .72);
    const shoulder = Math.exp(-((u - .48) ** 2 * 10 + (v + .24) ** 2 * 7)) * .5;
    const fracture = Math.abs(Math.sin(u * 13 + v * 4 + phase)) * .055 + Math.sin(v * 17 + u * 5) * .025;
    vertices.push(x, (mountain ? .06 : .28) + ridge + shoulder + fracture + (rand() - .5) * .045, z);
  }
  for (let row = 0; row < n; row++) for (let col = 0; col < n; col++) {
    const a = row * (n + 1) + col, b = a + 1, c = a + n + 1, d = c + 1;
    indices.push(a, c, b, b, c, d);
  }
  const perimeter: number[] = [];
  for (let i = 0; i < n; i++) perimeter.push(i);
  for (let i = 0; i < n; i++) perimeter.push(i * (n + 1) + n);
  for (let i = n; i > 0; i--) perimeter.push(n * (n + 1) + i);
  for (let i = n; i > 0; i--) perimeter.push(i * (n + 1));
  // Close the irregular cliff faces down to the waterline.
  const bottom = vertices.length / 3;
  perimeter.forEach(index => vertices.push(vertices[index * 3] * 1.06, -.18, vertices[index * 3 + 2] * 1.06));
  perimeter.forEach((a, i) => {
    const j = (i + 1) % perimeter.length, b = perimeter[j];
    indices.push(a, b, bottom + i, b, bottom + j, bottom + i);
  });
  const center = vertices.length / 3;
  vertices.push(0, -.18, 0);
  perimeter.forEach((_, i) => indices.push(center, bottom + i, bottom + (i + 1) % perimeter.length));
  const indexed = new BufferGeometry();
  indexed.setAttribute('position', new Float32BufferAttribute(vertices, 3)); indexed.setIndex(indices);
  const geometry = indexed.toNonIndexed(); indexed.dispose(); geometry.computeVertexNormals();
  const colors: number[] = [];
  const position = geometry.getAttribute('position');
  for (let i = 0; i < position.count; i += 3) {
    const shade = .91 + rand() * .09;
    for (let v = 0; v < 3; v++) colors.push(shade * .87, shade * .97, shade);
  }
  return { geometry, colors };
}

export const smooth = (a: number, b: number, value: number) => {
  const x = Math.min(1, Math.max(0, (value - a) / (b - a)));
  return x * x * (3 - 2 * x);
};

export const windowAt = (chapter: number, start: number, end: number) => smooth(start - 0.5, start + 0.15, chapter) * (1 - smooth(end - 0.15, end + 0.5, chapter));
