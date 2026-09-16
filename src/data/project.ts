export const project = { name: 'NAVDHRISHTI', tagline: 'AI-optimized navigation for safe Antarctic routing', mission: 'Cape Town / Bharati / Maitri', source: 'NAVDHRISHTI - Feature Summary & Architecture' };

export const architecture = [
  { id: 'fusion', name: 'Fuse the environment', detail: 'Ice type, concentration, iceberg tracks, currents, wind, AIS and vessel particulars, aligned by time and location.', code: '01 / MULTI-SOURCE DATA FUSION' },
  { id: 'risk', name: 'Understand this vessel', detail: 'Keep iceberg proximity, vessel-specific POLARIS ice risk, and environmental fuel/time cost as separate, explainable factors.', code: '02 / THREE INDEPENDENT LAYERS' },
  { id: 'route', name: 'Find the passage', detail: 'Isochrone search sketches the voyage. A* refines flagged hazard boundaries. Configured no-go cells are excluded from both.', code: '03 / ISOCHRONE + A*' },
  { id: 'monitor', name: 'Watch every movement', detail: 'AIS-triggered proximity checks complement a scheduled 12-hour route review. A new hazard can trigger a recalculation.', code: '04 / TWO MONITORING LOOPS' },
  { id: 'approve', name: 'Keep people in command', detail: 'Present the safest, fastest and fuel-efficient options with reasons. The master or officer reviews and approves the recommendation.', code: '05 / OFFICER SIGN-OFF' },
];

export const sourceLayers = [
  { name: 'NIC / SIGRID-3', use: 'Ice type + partial concentration', note: 'Inputs proposed for the POLARIS assessment layer.' },
  { name: 'NSIDC', use: 'Sea-ice concentration', note: 'Coverage context; concentration alone cannot supply ice type.' },
  { name: 'NIC / BYU', use: 'Iceberg positions + drift history', note: 'Tracked observations, with their own update timestamps.' },
  { name: 'COPERNICUS MARINE', use: 'Currents + waves', note: 'Environmental cost and iceberg-drift context.' },
  { name: 'ECMWF ERA5', use: 'Historical wind fields', note: 'Reanalysis for modelling and historical demonstrations.' },
  { name: 'SATELLITE AIS', use: 'Vessel position + heading', note: 'Proposed open-ocean monitoring; the current vessel track is simulated.' },
];

export const routeChoices = [
  { id: 'safest', name: 'Safest', passage: 'Western passage', hours: '18h 42m', fuel: '-12%', separation: '8.6 NM', rio: '+12', color: '#9cedc8', description: 'More separation from predicted iceberg motion and fewer constrained ice cells.' },
  { id: 'fastest', name: 'Fastest', passage: 'Eastern passage', hours: '16h 10m', fuel: '-5%', separation: '5.1 NM', rio: '+4', color: '#ebc680', description: 'A shorter demonstration passage, with less clearance and a smaller ice-risk margin.' },
  { id: 'efficient', name: 'Fuel-efficient', passage: 'Current-assisted passage', hours: '20h 05m', fuel: '-18%', separation: '7.3 NM', rio: '+9', color: '#80c6ff', description: 'A longer demonstration passage following more favorable current and wind conditions.' },
] as const;
export type RouteChoice = typeof routeChoices[number]['id'];
export const futureScope = ['Sentinel-1 SAR crack and calving detection', 'Onboard depth and ice-thickness sensors', 'Bridge-system / ECDIS export', 'Multi-vessel coordination', 'Arctic research operations'];
