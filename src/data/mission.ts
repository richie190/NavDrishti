export type Point = [number, number, number];
export type SceneControls = { icebergs: boolean; routes: boolean; seaIce: boolean; orbit: boolean; zoom: number; focus: boolean };
export type MotionState = { chapter: number; reduced: boolean; pointer: { x: number; y: number }; controls: SceneControls; scenario: string; simulation: number };

export const chapters = [
  { id: 'arrival', title: 'The unknown', tag: '01 / ANTARCTIC EXPEDITION' },
  { id: 'ice', title: 'Living ice', tag: '02 / A WORLD IN MOTION' },
  { id: 'detection', title: 'First contact', tag: '03 / OBJECT INTELLIGENCE' },
  { id: 'satellite', title: 'Eyes in orbit', tag: '04 / SATELLITE DETECTION' },
  { id: 'prediction', title: 'See the future', tag: '05 / TRAJECTORY PREDICTION' },
  { id: 'conflict', title: 'Point of impact', tag: '06 / COLLISION RISK' },
  { id: 'analysis', title: 'Intelligence at work', tag: '07 / ENVIRONMENTAL ANALYSIS' },
  { id: 'reroute', title: 'Another way', tag: '08 / ROUTE OPTIMIZATION' },
  { id: 'escape', title: 'Clear passage', tag: '09 / SAFE NAVIGATION' },
  { id: 'twin', title: 'The whole picture', tag: '10 / ANTARCTIC DIGITAL TWIN' },
  { id: 'capabilities', title: 'Connected intelligence', tag: '11 / ONE INTELLIGENT SYSTEM' },
  { id: 'stations', title: 'A purpose beyond', tag: '12 / RESEARCH OPERATIONS' },
  { id: 'simulation', title: 'What if?', tag: '13 / MISSION SIMULATOR' },
  { id: 'horizon', title: 'Ready for tomorrow', tag: '14 / THE NEXT HORIZON' },
] as const;

export const cameraShots: { position: Point; target: Point; fov: number }[] = [
  { position: [32, 13, 47], target: [0, 4, -6], fov: 47 },
  { position: [-27, 8, 30], target: [5, 3, -7], fov: 52 },
  { position: [27, 9, 15], target: [10, 5, -9], fov: 43 },
  { position: [42, 112, 75], target: [0, 76, -18], fov: 46 },
  { position: [9, 49, 38], target: [2, 0, -5], fov: 48 },
  { position: [-15, 18, 30], target: [4, 0, -1], fov: 55 },
  { position: [0, 51, 10], target: [0, 0, -9], fov: 57 },
  { position: [30, 32, 34], target: [-1, 0, -10], fov: 52 },
  { position: [-23, 5, 9], target: [-17, 2, -20], fov: 55 },
  { position: [48, 95, 102], target: [0, 0, -24], fov: 52 },
  { position: [34, 31, 45], target: [0, 2, -17], fov: 53 },
  { position: [-10, 45, 50], target: [-5, 3, -38], fov: 50 },
  { position: [0, 61, 36], target: [0, 0, -12], fov: 55 },
  { position: [12, 32, 85], target: [0, 6, -45], fov: 48 },
];

export const icebergData: { id: string; position: Point; scale: Point; seed: number; speed: string }[] = [
  { id: 'IBG-001', position: [10, 0, -9], scale: [10, 14, 8], seed: 14, speed: '0.8 KT / NE' },
  { id: 'IBG-002', position: [-21, 0, -22], scale: [5, 6, 6], seed: 42, speed: '1.2 KT / E' },
  { id: 'IBG-003', position: [27, 0, -34], scale: [7, 8, 5], seed: 81, speed: '0.6 KT / N' },
  { id: 'IBG-004', position: [-35, 0, 3], scale: [4, 4, 5], seed: 26, speed: '0.4 KT / NE' },
  { id: 'IBG-005', position: [33, 0, 14], scale: [3, 4, 3], seed: 12, speed: '0.7 KT / E' },
  { id: 'IBG-006', position: [-7, 0, -40], scale: [4, 5, 3], seed: 53, speed: '0.9 KT / N' },
];

export const features = [
  ['01', 'Hybrid route search', 'Isochrone for the voyage. A* at the hazard boundary.', 'reroute'],
  ['02', 'POLARIS assessment', 'Ice class, ice type and concentration inform vessel-specific risk.', 'analysis'],
  ['03', 'AIS + 12-hour review', 'Position-triggered checks alongside scheduled route reassessment.', 'conflict'],
  ['04', 'Vessel-aware decisions', 'Account for ice class, draft, speed and fuel constraints.', 'twin'],
  ['05', 'Multi-source fusion', 'Ice, iceberg tracks, wind and currents in a shared spatial context.', 'satellite'],
  ['06', 'Officer approval', 'Three explained options. The final decision stays with the officer.', 'reroute'],
  ['07', 'Offline-first design', 'Cached data, visible age and proposed satellite delta-sync.', 'simulation'],
];

export const scenarios = [
  { id: 'single', title: 'Single iceberg', risk: 42, safety: 96, fuel: 91, score: 94, detail: 'One drifting object. A controlled deviation to port.' },
  { id: 'multiple', title: 'Iceberg field', risk: 78, safety: 94, fuel: 88, score: 92, detail: 'Multiple crossing trajectories. A wider western passage.' },
  { id: 'ice', title: 'Heavy sea ice', risk: 69, safety: 91, fuel: 82, score: 88, detail: 'Dense floes. Reduced speed and a lower-concentration corridor.' },
  { id: 'storm', title: 'Storm + iceberg', risk: 91, safety: 89, fuel: 78, score: 85, detail: 'Limited visibility and strong drift. A conservative diversion.' },
  { id: 'offline', title: 'Signal blackout', risk: 61, safety: 90, fuel: 85, score: 88, detail: 'Cached observations. Increased separation for stale-data uncertainty.' },
];

export const stations = [
  { id: 'bharati', name: 'Bharati', coords: '69°24′ S / 76°11′ E', distance: '286', eta: '18h 42m', temp: '-11', wind: '22', position: [22, 3, -64] as Point },
  { id: 'maitri', name: 'Maitri', coords: '70°46′ S / 11°44′ E', distance: '412', eta: '27h 15m', temp: '-16', wind: '18', position: [-30, 4, -58] as Point },
];
