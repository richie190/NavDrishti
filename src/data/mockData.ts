export type Coordinate = [number, number];

export type RouteType = 'safest' | 'fastest' | 'fuel-efficient';

export type CandidateRoute = {
  type: RouteType;
  label: string;
  color: string;
  points: Coordinate[];
  polarisRIO: number;
  etaDays: number;
  fuelUsed: number;
  distanceKm: number;
  confidencePct: number;
  hazardsNear: number;
};

export type HeatmapFeature = {
  type: 'Feature';
  geometry: {
    type: 'Point';
    coordinates: [number, number];
  };
  properties: {
    intensity: number;
    radiusKm: number;
  };
};

export const vessel = {
  name: 'RV Dakshin Sentinel',
  iceClass: 'Polar Class 5',
  draft: '8.2 m',
  speed: '13.5 kt',
  fuelCapacity: '5,400 t',
};

export const voyage = {
  origin: 'Cape Town',
  destination: 'Bharati Station',
  startDate: '2027-01-04',
  endDate: '2027-02-09 to 2027-02-13',
  dataAsOf: '03 Jan 2027, 1800 UTC',
};

export const historicalRoute = {
  date: '2025-02-18',
  points: [
    [-33.9249, 18.4241],
    [-39.8, 24.6],
    [-47.6, 33.2],
    [-55.4, 46.8],
    [-62.7, 61.4],
    [-67.4, 72.1],
    [-69.4075, 76.1874],
  ] satisfies Coordinate[],
  distanceKm: 7850,
  fuelUsed: 4620,
  durationDays: 38,
  hazardsNear: 7,
};

export const routes: CandidateRoute[] = [
  {
    type: 'safest',
    label: 'Safest',
    color: '#7CFC6E',
    points: [
      [-33.9249, 18.4241],
      [-40.8, 21.8],
      [-48.2, 29.7],
      [-55.8, 42.3],
      [-62.4, 57.8],
      [-66.9, 69.7],
      [-69.4075, 76.1874],
    ],
    polarisRIO: -1,
    etaDays: 32,
    fuelUsed: 3820,
    distanceKm: 7205,
    confidencePct: 91,
    hazardsNear: 2,
  },
  {
    type: 'fastest',
    label: 'Fastest',
    color: '#4dd2ff',
    points: [
      [-33.9249, 18.4241],
      [-39.2, 26.3],
      [-48.8, 38.7],
      [-58.4, 52.6],
      [-65.8, 68.4],
      [-69.4075, 76.1874],
    ],
    polarisRIO: -4,
    etaDays: 27,
    fuelUsed: 4160,
    distanceKm: 6760,
    confidencePct: 78,
    hazardsNear: 5,
  },
  {
    type: 'fuel-efficient',
    label: 'Fuel-Efficient',
    color: '#ffd23f',
    points: [
      [-33.9249, 18.4241],
      [-40.4, 20.7],
      [-49.3, 28.6],
      [-57.6, 39.4],
      [-63.5, 53.8],
      [-67.8, 67.9],
      [-69.4075, 76.1874],
    ],
    polarisRIO: -2,
    etaDays: 35,
    fuelUsed: 3490,
    distanceKm: 7388,
    confidencePct: 86,
    hazardsNear: 3,
  },
];

export const icebergs = [
  { lat: -49.9, lng: 35.6, sizeCategory: 'L' },
  { lat: -53.7, lng: 44.1, sizeCategory: 'M' },
  { lat: -57.9, lng: 51.8, sizeCategory: 'XL' },
  { lat: -61.3, lng: 58.9, sizeCategory: 'M' },
  { lat: -63.9, lng: 63.6, sizeCategory: 'S' },
  { lat: -66.4, lng: 70.8, sizeCategory: 'M' },
  { lat: -59.2, lng: 43.7, sizeCategory: 'S' },
  { lat: -51.8, lng: 29.4, sizeCategory: 'M' },
];

export const heatmapStates = [
  {
    id: 'ice-now',
    features: [
      { type: 'Feature', geometry: { type: 'Point', coordinates: [39.5, -54.2] }, properties: { intensity: 0.42, radiusKm: 410 } },
      { type: 'Feature', geometry: { type: 'Point', coordinates: [55.1, -60.8] }, properties: { intensity: 0.68, radiusKm: 520 } },
      { type: 'Feature', geometry: { type: 'Point', coordinates: [69.2, -66.2] }, properties: { intensity: 0.84, radiusKm: 360 } },
    ] satisfies HeatmapFeature[],
  },
  {
    id: 'ice-plus-12h',
    features: [
      { type: 'Feature', geometry: { type: 'Point', coordinates: [42.2, -55.1] }, properties: { intensity: 0.48, radiusKm: 430 } },
      { type: 'Feature', geometry: { type: 'Point', coordinates: [58.4, -61.9] }, properties: { intensity: 0.76, radiusKm: 545 } },
      { type: 'Feature', geometry: { type: 'Point', coordinates: [71.6, -66.9] }, properties: { intensity: 0.72, radiusKm: 380 } },
    ] satisfies HeatmapFeature[],
  },
  {
    id: 'ice-plus-24h',
    features: [
      { type: 'Feature', geometry: { type: 'Point', coordinates: [45.6, -56.3] }, properties: { intensity: 0.55, radiusKm: 450 } },
      { type: 'Feature', geometry: { type: 'Point', coordinates: [61.8, -62.6] }, properties: { intensity: 0.81, radiusKm: 560 } },
      { type: 'Feature', geometry: { type: 'Point', coordinates: [73.8, -67.5] }, properties: { intensity: 0.66, radiusKm: 390 } },
    ] satisfies HeatmapFeature[],
  },
  {
    id: 'ice-plus-36h',
    features: [
      { type: 'Feature', geometry: { type: 'Point', coordinates: [49.1, -57.1] }, properties: { intensity: 0.62, radiusKm: 470 } },
      { type: 'Feature', geometry: { type: 'Point', coordinates: [64.5, -63.4] }, properties: { intensity: 0.78, radiusKm: 580 } },
      { type: 'Feature', geometry: { type: 'Point', coordinates: [75.2, -68.1] }, properties: { intensity: 0.58, radiusKm: 410 } },
    ] satisfies HeatmapFeature[],
  },
];

export const alertEvent = {
  triggerProgressPct: 33,
  message: 'AIS Live Position Check: vessel within 12nm of iceberg cluster - reroute advised.',
};
