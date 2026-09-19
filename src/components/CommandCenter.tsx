
import 'leaflet/dist/leaflet.css';
import * as L from 'leaflet';
import { motion } from 'framer-motion';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { Circle, MapContainer, Marker, Polyline, TileLayer, Tooltip, useMap } from 'react-leaflet';
import {
  AlertTriangle,
  Anchor,
  ChevronLeft,
  Compass,
  Fuel,
  Gauge,
  Info,
  Play,
  Radar,
  Route as RouteIcon,
  ShieldAlert,
  Ship,
  Snowflake,
  Timer,
} from 'lucide-react';

import PolarChatbot from './PolarChatbot';

type SimulationMode = 'idle' | 'replay' | 'complete';
type Coordinate = [number, number];
type RouteType = 'historical' | 'safest' | 'fastest' | 'fuel';

interface IcebergSighting {
  id: string;
  position: Coordinate;
  size: 'small' | 'medium' | 'large';
  note: string;
}

const analysisStages = [
  'Fetching User & Vessel Mission Profile...',
  'Ingesting SAR imagery (Copernicus Sentinel-1)',
  'Retrieving real-time ice data (NSIDC/AMSR2)',
  'Processing hydrographic & drift telemetry',
  'Running Polaris risk-optimisation algorithm',
];

export interface RouteOption {
  type: RouteType;
  label: string;
  badge: string;
  color: string;
  etaDays: number;
  fuelUsed: number;
  distanceKm: number;
  polarisRIO: number;
  hazardsNear: number;
  description: string;
  points: Coordinate[];
}

export interface CaseStudy {
  id: string;
  buttonLabel: string;
  subtitle: string;
  shipName: string;
  year: number;
  statusTag: 'CRASHED & SUNK' | 'TRAPPED & DELAYED' | 'OPTIMAL SUCCESS';
  shipSize: string;
  fuelLimit: string;
  iceResistance: string;
  crewPassengers: string;
  incidentDetails: string;
  startPort: string;
  destination: string;
  startCoords: Coordinate;
  endCoords: Coordinate;
  recommendedRouteType: RouteType;
  recommendationReason: string;
  icebergs: IcebergSighting[];
  routes: RouteOption[];
}

const numberFormatter = new Intl.NumberFormat('en-IN');

const caseStudies: CaseStudy[] = [
  {
    id: 'explorer-2007',
    buttonLabel: '1. "MV Explorer, 2007"',
    subtitle: 'Ship Which Crashed',
    shipName: 'MV Explorer',
    year: 2007,
    statusTag: 'CRASHED & SUNK',
    shipSize: '75 meters (246 ft) / 2,398 GT',
    fuelLimit: '280 tonnes (Marine Gas Oil)',
    iceResistance: '1A Ice Class (Ice-hardened double hull; non-icebreaker)',
    crewPassengers: '100 Passengers, 54 Crew members',
    incidentDetails:
      'Struck submerged multi-year ice in the Bransfield Strait after misjudging ice thickness. Sustained a 10-inch hull puncture and sank within 16 hours. Required emergency lifeboat evacuation.',
    startPort: 'Ushuaia / Drake Passage',
    destination: 'King George Island',
    startCoords: [-54.8, -68.3],
    endCoords: [-62.2, -58.9],
    recommendedRouteType: 'safest',
    recommendationReason: 'Avoid the dense Bransfield Strait iceberg field that caused the original loss.',
    icebergs: [
      [-57.5, -64.8], [-58.5, -63.6], [-59.5, -62.4], [-58.0, -62.5], [-59.0, -61.0], [-60.5, -60.0]
    ].map((position, index) => ({
      id: `explorer-berg-${index + 1}`,
      position: position as Coordinate,
      size: index % 6 === 0 ? 'large' : index % 3 === 0 ? 'medium' : 'small',
      note: index % 6 === 0 ? 'Large multi-year iceberg detected near the historical corridor.' : 'Iceberg or growler sighting in dense pack ice.',
    })),
    routes: [
      {
        type: 'historical',
        label: 'Historical Route (Crash Site)',
        badge: 'CRASHED',
        color: '#FF4155',
        etaDays: 5.5,
        fuelUsed: 145,
        distanceKm: 1280,
        polarisRIO: -12,
        hazardsNear: 14,
        description: 'Direct passage through thick multi-year pack ice. Lead to hull breach and sinking.',
        points: [[-54.8, -68.3], [-58.5, -63.6], [-62.2, -58.9]],
      },
      {
        type: 'safest',
        label: 'Safest Route (Recommended)',
        badge: 'RECOMMENDED',
        color: '#10B981',
        etaDays: 4.8,
        fuelUsed: 105,
        distanceKm: 1390,
        polarisRIO: 8,
        hazardsNear: 0,
        description: 'Wide western detachment around Bransfield Strait multi-year ice fields.',
        points: [[-54.8, -68.3], [-56.0, -71.0], [-61.0, -66.0], [-62.2, -58.9]],
      },
      {
        type: 'fastest',
        label: 'Fastest Route',
        badge: 'HIGH RISK',
        color: '#F59E0B',
        etaDays: 4.1,
        fuelUsed: 128,
        distanceKm: 1210,
        polarisRIO: -4,
        hazardsNear: 8,
        description: 'Skirts northern ice edge at maximum service speed; vulnerable to growlers.',
        points: [[-54.8, -68.3], [-57.0, -61.0], [-62.2, -58.9]],
      },
      {
        type: 'fuel',
        label: 'Fuel Efficient Route',
        badge: 'ECO-PASSAGE',
        color: '#06B6D4',
        etaDays: 5.0,
        fuelUsed: 92,
        distanceKm: 1295,
        polarisRIO: 4,
        hazardsNear: 3,
        description: 'Leverages Antarctic Circumpolar drift currents to cut fuel consumption by 36%.',
        points: [[-54.8, -68.3], [-59.0, -67.0], [-62.2, -58.9]],
      },
    ],
  },
  {
    id: 'magdalena-2002',
    buttonLabel: '2. "MV Magdalena Oldendorff, 2002"',
    subtitle: 'Ship Which Wasted Fuel',
    shipName: 'MV Magdalena Oldendorff',
    year: 2002,
    statusTag: 'TRAPPED & DELAYED',
    shipSize: '186 meters (610 ft) / 18,600 GT',
    fuelLimit: '2,500 tonnes (Heavy Marine Diesel)',
    iceResistance: 'Germanischer Lloyd E4 (Ice-strengthened cargo liner)',
    crewPassengers: '79 Scientists, 28 Crew members',
    incidentDetails:
      'Beset and trapped by rapidly shifting pack ice in Muskegbukta Bay near Maitri station. Remained ice-locked for months, burning massive fuel reserves to power generators while waiting for icebreakers.',
    startPort: 'Cape Town (CPT)',
    destination: 'Maitri Station / Queen Maud Land',
    startCoords: [-33.9, 18.4],
    endCoords: [-70.7, 11.7],
    recommendedRouteType: 'safest',
    recommendationReason: 'Use the open-lead corridor and preserve fuel reserves instead of entering closing pack ice.',
    icebergs: [
      [-60.0, 15.0], [-62.0, 14.5], [-64.0, 14.0], [-66.0, 13.5], [-63.0, 12.0], [-65.0, 16.0], [-68.0, 13.0]
    ].map((position, index) => ({
      id: `magdalena-berg-${index + 1}`,
      position: position as Coordinate,
      size: index % 5 === 0 ? 'large' : index % 2 === 0 ? 'medium' : 'small',
      note: 'Mock iceberg sighting in a rapidly closing pack-ice zone.',
    })),
    routes: [
      {
        type: 'historical',
        label: 'Historical Route (Trapped Site)',
        badge: 'BESET IN ICE',
        color: '#FF4155',
        etaDays: 19.2,
        fuelUsed: 890,
        distanceKm: 4620,
        polarisRIO: -8,
        hazardsNear: 18,
        description: 'Trapped in closing ice leads in Muskegbukta Bay due to delayed ice chart data.',
        points: [[-33.9, 18.4], [-55.0, 16.0], [-65.0, 14.0], [-70.7, 11.7]],
      },
      {
        type: 'safest',
        label: 'Safest Route (Recommended)',
        badge: 'RECOMMENDED',
        color: '#10B981',
        etaDays: 14.1,
        fuelUsed: 540,
        distanceKm: 4450,
        polarisRIO: 10,
        hazardsNear: 0,
        description: 'Navigates open leads identified by predictive SAR satellite trajectories.',
        points: [[-33.9, 18.4], [-50.0, 28.0], [-62.0, 25.0], [-70.7, 11.7]],
      },
      {
        type: 'fastest',
        label: 'Fastest Route',
        badge: 'DIRECT SPRINT',
        color: '#F59E0B',
        etaDays: 12.8,
        fuelUsed: 670,
        distanceKm: 4210,
        polarisRIO: 2,
        hazardsNear: 6,
        description: 'Straight Great-Circle route through thin first-year pack ice corridor.',
        points: [[-33.9, 18.4], [-55.0, 10.0], [-65.0, 9.0], [-70.7, 11.7]],
      },
      {
        type: 'fuel',
        label: 'Fuel Efficient Route',
        badge: 'OPTIMIZED',
        color: '#06B6D4',
        etaDays: 13.9,
        fuelUsed: 480,
        distanceKm: 4320,
        polarisRIO: 7,
        hazardsNear: 3,
        description: 'Minimizes ice-ramming manoeuvres, reducing fuel burn by 46% compared to actual trip.',
        points: [[-33.9, 18.4], [-55.0, 22.0], [-65.0, 20.0], [-70.7, 11.7]],
      },
    ],
  },
  {
    id: 'vasiliy-2022',
    buttonLabel: '3. "MV Vasiliy Golovnin, 2022"',
    subtitle: 'Normal & Optimal Success',
    shipName: 'MV Vasiliy Golovnin',
    year: 2022,
    statusTag: 'OPTIMAL SUCCESS',
    shipSize: '160 meters (524 ft) / 14,200 GT',
    fuelLimit: '3,200 tonnes (High Endurance Resupply Tanker)',
    iceResistance: 'Russian Arc7 Ice Class (Heavy diesel-electric icebreaker)',
    crewPassengers: '41st Indian Expedition Team & Crew',
    incidentDetails:
      "Successful resupply mission to India's Maitri and Bharati research stations. Traversed dense pack ice without incident, hull fatigue, or schedule delays.",
    startPort: 'Cape Town (CPT)',
    destination: 'Bharati Station (Larsemann Hills)',
    startCoords: [-33.9, 18.4],
    endCoords: [-69.4, 76.2],
    recommendedRouteType: 'fuel',
    recommendationReason: "The ice-strengthened vessel can use the lower-resistance southern corridor to save fuel while retaining a positive safety margin.",
    icebergs: [
      [-55.0, 45.0], [-60.0, 52.0], [-63.0, 68.0], [-67.0, 70.0], [-58.0, 60.0], [-66.0, 62.0], [-64.0, 55.0]
    ].map((position, index) => ({
      id: `vasiliy-berg-${index + 1}`,
      position: position as Coordinate,
      size: index === 2 ? 'large' : index % 2 === 0 ? 'medium' : 'small',
      note: "Mock iceberg sighting monitored by the vessel's ice-navigation team.",
    })),
    routes: [
      {
        type: 'historical',
        label: 'Historical Route (Executed)',
        badge: 'COMPLETED',
        color: '#FF4155',
        etaDays: 12.2,
        fuelUsed: 460,
        distanceKm: 5120,
        polarisRIO: 6,
        hazardsNear: 5,
        description: 'Original route executed using standard ice navigators and helicopter reconnaissance.',
        points: [[-33.9, 18.4], [-55.0, 45.0], [-65.0, 65.0], [-69.4, 76.2]],
      },
      {
        type: 'safest',
        label: 'Safest Route (Recommended)',
        badge: 'RECOMMENDED',
        color: '#10B981',
        etaDays: 11.0,
        fuelUsed: 390,
        distanceKm: 4980,
        polarisRIO: 14,
        hazardsNear: 0,
        description: 'Bypasses iceberg cluster off Prydz Bay using AI drift forecasting.',
        points: [[-33.9, 18.4], [-45.0, 55.0], [-55.0, 75.0], [-69.4, 76.2]],
      },
      {
        type: 'fastest',
        label: 'Fastest Route',
        badge: 'EXPRESS PASSAGE',
        color: '#F59E0B',
        etaDays: 9.8,
        fuelUsed: 430,
        distanceKm: 4790,
        polarisRIO: 9,
        hazardsNear: 4,
        description: 'Direct high-latitude transit leveraging Arc7 hull ice-breaking capability.',
        points: [[-33.9, 18.4], [-60.0, 40.0], [-67.0, 60.0], [-69.4, 76.2]],
      },
      {
        type: 'fuel',
        label: 'Fuel Efficient Route',
        badge: 'ECO-PASSAGE',
        color: '#06B6D4',
        etaDays: 10.5,
        fuelUsed: 350,
        distanceKm: 4890,
        polarisRIO: 12,
        hazardsNear: 2,
        description: 'Optimized throttle profiling saving 110 tonnes of station resupply fuel.',
        points: [[-33.9, 18.4], [-52.0, 50.0], [-60.0, 65.0], [-69.4, 76.2]],
      },
    ],
  },
];

function getCaseBounds(caseStudy: CaseStudy): L.LatLngBounds {
  const allPoints = caseStudy.routes.flatMap(r => r.points);
  const icebergPoints = caseStudy.icebergs.map(b => b.position);
  return L.latLngBounds([...allPoints, ...icebergPoints] as L.LatLngExpression[]);
}

interface CommandCenterProps {
  navigate?: (path: string) => void;
}

export default function CommandCenter({ navigate: propNavigate }: CommandCenterProps) {
  const navigate = propNavigate || ((path: string) => { window.location.href = path; });

  const [activeCaseIndex, setActiveCaseIndex] = useState<number | null>(null);
  const [selectedRouteType, setSelectedRouteType] = useState<string>('safest');
  const [mode, setMode] = useState<SimulationMode>('idle');
  const [progress, setProgress] = useState(0);
  const [heatmapOn, setHeatmapOn] = useState(true);
  const [isAnalysing, setIsAnalysing] = useState(false);
  const frame = useRef(0);
  const analysisTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const activeCase = activeCaseIndex === null ? null : caseStudies[activeCaseIndex];
  const selectedRoute = useMemo(
    () => activeCase?.routes.find(r => r.type === selectedRouteType) ?? activeCase?.routes[1] ?? null,
    [activeCase, selectedRouteType]
  );
  const dynamicBounds = useMemo(() => activeCase ? getCaseBounds(activeCase) : null, [activeCase]);

  const handleSelectCase = (index: number) => {
    setActiveCaseIndex(index);
    setSelectedRouteType(caseStudies[index].recommendedRouteType);
    setMode('idle');
    setProgress(0);
    setIsAnalysing(true);

    if (analysisTimer.current) clearTimeout(analysisTimer.current);

    analysisTimer.current = setTimeout(() => {
      setIsAnalysing(false);
    }, 5200);
  };

  const startReplay = () => {
    if (!activeCase) return;
    setMode('replay');
    setProgress(0);
  };

  useEffect(() => () => {
    if (analysisTimer.current) clearTimeout(analysisTimer.current);
  }, []);

  useEffect(() => {
    if (mode !== 'replay') return undefined;
    let lastTime: number | undefined;

    const tick = (time: number) => {
      lastTime ??= time;
      const delta = time - lastTime;
      lastTime = time;
      setProgress(prev => {
        const next = prev + (delta * 1.5) / 30000;
        if (next >= 1) {
          setMode('complete');
          return 1;
        }
        return next;
      });
      frame.current = requestAnimationFrame(tick);
    };

    frame.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame.current);
  }, [mode]);

  return (
    <main className="command-page">
      <header className="command-topbar">
        <button className="command-back" onClick={() => navigate('/')} aria-label="Back to landing page">
          <ChevronLeft size={17} /> NAVDRISHTI
        </button>
        <div className="command-title-block">
          <p className="eyebrow">
            <Radar size={13} /> POLAR INTELLIGENCE COMMAND CENTER
          </p>
          <h1>Antarctic Ship-Routing Case Studies</h1>
        </div>
        <div className="command-clock">
          <span>SELECTED CASE</span>
          <strong>{activeCase?.shipName ?? 'Choose a case study'}</strong>
        </div>
      </header>

      <section className="command-layout" aria-label="Antarctic route decision dashboard">
        <aside className="command-side-panel left">
          <div className="panel-heading" style={{ marginBottom: '12px' }}>
            <Ship size={17} />
            <span>HISTORICAL CASE STUDIES</span>
          </div>

          <div className="case-study-boxes-container" style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
            {caseStudies.map((caseItem, idx) => (
              <button
                key={caseItem.id}
                className={`case-rectangular-box ${activeCaseIndex === idx ? 'is-active' : ''}`}
                onClick={() => handleSelectCase(idx)}
                style={{
                  textAlign: 'left',
                  padding: '10px 14px',
                  borderRadius: '6px',
                  border: activeCaseIndex === idx ? '2px solid #1E60D5' : '1px solid rgba(0, 71, 171, 0.35)',
                  backgroundColor: activeCaseIndex === idx ? 'rgba(30, 96, 213, 0.12)' : 'rgba(0, 38, 99, 0.3)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                <div style={{ fontSize: '13px', fontWeight: 600, color: activeCaseIndex === idx ? '#fff' : '#a0b3c6', marginBottom: '2px' }}>
                  {caseItem.buttonLabel}
                </div>
                <div style={{ fontSize: '11px', color: '#68829e', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {caseItem.subtitle}
                </div>
              </button>
            ))}
          </div>

          {activeCase ? (
            <motion.div
              key={activeCase.id}
              className="dossier-card"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}
            >
              <div className="dossier-header" style={{ marginBottom: '4px' }}>
                <span className={`status-badge ${activeCase.statusTag.replace(/\s+/g, '-').toLowerCase()}`}>
                  {activeCase.statusTag}
                </span>
                <h2 style={{ fontSize: '1.25rem', margin: '4px 0' }}>{activeCase.shipName}</h2>
                <small className="mono">YEAR {activeCase.year}</small>
              </div>

              <div className="dossier-grid" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <InfoRow label="Ship Size" value={activeCase.shipSize} icon={<Ship size={13} />} />
                <InfoRow label="Fuel Capacity" value={activeCase.fuelLimit} icon={<Fuel size={13} />} />
                <InfoRow label="Ice Resistance" value={activeCase.iceResistance} icon={<ShieldAlert size={13} />} />
                <InfoRow label="Personnel" value={activeCase.crewPassengers} icon={<Anchor size={13} />} />
                <InfoRow label="Passage" value={`${activeCase.startPort} to ${activeCase.destination}`} icon={<Compass size={13} />} />
              </div>

              <div className="incident-summary" style={{ marginTop: 'auto', padding: '12px', backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: '6px' }}>
                <p className="eyebrow" style={{ marginBottom: '6px', fontSize: '10px' }}><Info size={12} /> INCIDENT BRIEF</p>
                <p style={{ margin: 0, fontSize: '13px', lineHeight: '1.4', color: '#cbd5e1' }}>{activeCase.incidentDetails}</p>
              </div>
            </motion.div>
          ) : (
            <SelectionNote
              icon={<Compass size={22} />}
              title="Select a case study"
              description="Choose one of the three historical voyages above to view the vessel, route options, and operational briefing."
            />
          )}
        </aside>

        <section className="command-map-panel">
          {activeCase && selectedRoute && dynamicBounds ? (
            <>
              <div className="command-map-toolbar">
                <div className="legend-pills">
                  {activeCase.routes.map(r => (
                    <button
                      key={r.type}
                      className={`route-pill ${selectedRouteType === r.type ? 'is-active' : ''}`}
                      onClick={() => setSelectedRouteType(r.type)}
                      style={{ '--pill-color': r.color } as CSSProperties}
                    >
                      <span className="dot" />
                      <strong>{r.label}</strong>
                    </button>
                  ))}
                </div>

                <button
                  className={`heatmap-toggle ${heatmapOn ? 'is-on' : ''}`}
                  onClick={() => setHeatmapOn(v => !v)}
                  aria-pressed={heatmapOn}
                >
                  <Snowflake size={15} /> Ice Heatmap
                </button>
              </div>

              <div
                className="map-visual-legend"
                style={{
                  position: 'absolute',
                  top: '65px',
                  right: '14px',
                  zIndex: 500,
                  background: 'rgba(0, 23, 54, 0.85)',
                  backdropFilter: 'blur(8px)',
                  padding: '12px 14px',
                  borderRadius: '8px',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                  minWidth: '180px',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                }}
              >
                <div style={{ color: '#8ca8b4', fontSize: '9px', fontWeight: 'bold', letterSpacing: '0.05em', marginBottom: '2px' }}>
                  MAP LEGEND
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {activeCase.routes.map(r => (
                    <div key={r.type} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div
                        style={{
                          width: '24px',
                          height: r.type === 'historical' ? '0px' : '3px',
                          background: r.type === 'historical' ? 'transparent' : r.color,
                          borderTop: r.type === 'historical' ? `3px dashed ${r.color}` : 'none',
                          borderRadius: '2px',
                        }}
                      />
                      <span style={{ fontSize: '11px', color: '#fff' }}>{r.label}</span>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '4px', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                  <div
                    style={{
                      width: '16px',
                      height: '16px',
                      background: 'rgba(0, 229, 255, 0.2)',
                      border: '1.5px dashed #00e5ff',
                      borderRadius: '50%',
                    }}
                  />
                  <span style={{ fontSize: '11px', color: '#fff' }}>Iceberg Danger Zone</span>
                </div>
              </div>

              <MapShell
                activeCase={activeCase}
                selectedRouteType={selectedRouteType}
                progress={progress}
                mode={mode}
                heatmapOn={heatmapOn}
                dynamicBounds={dynamicBounds}
                onSelectRoute={type => setSelectedRouteType(type)}
                isAnalysing={isAnalysing}
              />

              <div className="map-overlay-bottom">
                {isAnalysing ? (
                  <AnalysisPopup />
                ) : mode === 'idle' ? (
                  <button className="start-simulation-button" onClick={startReplay}>
                    <Play size={16} fill="currentColor" /> Simulate Passage ({selectedRoute.label})
                  </button>
                ) : (
                  <div className="replay-controls" style={{ paddingRight: '24px' }}>
                    <div className="replay-meta">
                      <span>REPLAYING: {selectedRoute.label}</span>
                      <strong>{Math.round(progress * 100)}% COMPLETE</strong>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={Math.round(progress * 100)}
                      onChange={e => setProgress(Number(e.target.value) / 100)}
                      style={{ width: '100%' }}
                    />
                  </div>
                )}
              </div>
            </>
          ) : (
            <div
              className="case-selection-map"
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                gap: '12px',
                textAlign: 'center',
                padding: '24px',
              }}
            >
              <Radar size={38} color="#00e5ff" />
              <span style={{ fontSize: '11px', color: '#00e5ff', letterSpacing: '0.1em', fontFamily: 'var(--mono)' }}>
                COMMAND CENTRE READY
              </span>
              <strong style={{ fontSize: '18px', color: '#ffffff' }}>
                Select a historical case study to initialise the map.
              </strong>
              <p style={{ fontSize: '12px', color: '#8899ac', maxWidth: '320px', margin: 0, lineHeight: '1.5' }}>
                The map and route analysis remain focused on your selected voyage.
              </p>
            </div>
          )}
        </section>

        <aside className="command-side-panel right">
          <div className="panel-heading">
            <Gauge size={17} />
            <span>ROUTE COMPARISON</span>
          </div>

          {activeCase && selectedRoute ? (
            <>
              <div
                style={{
                  margin: '12px 0',
                  padding: '10px 12px',
                  borderRadius: '6px',
                  border: '1px solid rgba(30, 96, 213, 0.4)',
                  background: 'rgba(0, 38, 99, 0.35)',
                  fontSize: '11px',
                  lineHeight: '1.5',
                  color: '#a8c4e8',
                }}
              >
                <p style={{ margin: '0 0 4px', fontFamily: 'var(--mono)', fontSize: '9px', letterSpacing: '0.1em', color: '#1E60D5' }}>
                  AI RECOMMENDATION
                </p>
                <p style={{ margin: 0 }}>{activeCase.recommendationReason}</p>
              </div>
              <motion.div
                key={selectedRoute.type}
                className="route-detail-card"
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <div className="route-detail-heading">
                  <span style={{ color: selectedRoute.color }}>{selectedRoute.label}</span>
                  <small className="mono">{selectedRoute.badge}</small>
                </div>

                <div className="rio-readout">
                  <span>POLARIS RIO SCORE</span>
                  <strong style={{ color: selectedRoute.polarisRIO < 0 ? '#FF4155' : '#10B981' }}>
                    {selectedRoute.polarisRIO > 0 ? `+${selectedRoute.polarisRIO}` : selectedRoute.polarisRIO}
                  </strong>
                  <p>{selectedRoute.polarisRIO < 0 ? 'High Risk Corridor (Danger)' : 'Safe Passage Permitted'}</p>
                </div>

                <div className="route-stat-grid">
                  <Metric icon={<Timer size={14} />} label="ETA" value={`${selectedRoute.etaDays} days`} />
                  <Metric icon={<Fuel size={14} />} label="Fuel Usage" value={`${numberFormatter.format(selectedRoute.fuelUsed)} t`} />
                  <Metric icon={<RouteIcon size={14} />} label="Distance" value={`${numberFormatter.format(selectedRoute.distanceKm)} km`} />
                  <Metric icon={<AlertTriangle size={14} />} label="Hazards Near" value={String(selectedRoute.hazardsNear)} />
                </div>

                <div className="route-description-box">
                  <p className="eyebrow">PASSAGE SUMMARY</p>
                  <p>{selectedRoute.description}</p>
                </div>
              </motion.div>
            </>
          ) : (
            <SelectionNote
              icon={<RouteIcon size={22} />}
              title="Route comparison awaits"
              description="Select a case study to compare safety, speed, fuel use, and nearby hazards."
            />
          )}
        </aside>
      </section>

      <PolarChatbot />
    </main>
  );
}

function SelectionNote({ icon, title, description }: { icon: ReactNode; title: string; description: string }) {
  return (
    <div className="case-selection-note">
      {icon}
      <strong>{title}</strong>
      <p>{description}</p>
    </div>
  );
}

function AnalysisPopup() {
  return (
    <div className="analysis-popup" role="status" aria-live="polite">
      <div className="analysis-popup-heading">
        <Radar size={16} />
        <span>ROUTE ANALYSIS IN PROGRESS</span>
      </div>
      {analysisStages.map((stage, index) => (
        <div className="analysis-stage" style={{ '--stage-delay': `${index * 0.9}s` } as CSSProperties} key={stage}>
          <span className="analysis-spinner" />
          <span>{stage}</span>
        </div>
      ))}
    </div>
  );
}

function MapShell({
  activeCase,
  selectedRouteType,
  progress,
  mode,
  heatmapOn,
  dynamicBounds,
  onSelectRoute,
  isAnalysing,
}: {
  activeCase: CaseStudy;
  selectedRouteType: string;
  progress: number;
  mode: SimulationMode;
  heatmapOn: boolean;
  dynamicBounds: L.LatLngBounds;
  onSelectRoute: (type: string) => void;
  isAnalysing: boolean;
}) {
  const selectedRoute = activeCase.routes.find(r => r.type === selectedRouteType) ?? activeCase.routes[1];
  const shipPos = mode === 'replay' ? pointAtProgress(selectedRoute.points, progress) : activeCase.routes[0].points[0];

  return (
    <div className="command-map-shell" style={{ width: '100%', height: '100%', position: 'relative' }}>
      <MapContainer
        className="command-leaflet"
        center={activeCase.routes[0].points[0]}
        zoom={3}
        minZoom={2}
        maxZoom={7}
        scrollWheelZoom={false}
        attributionControl={false}
        zoomControl={false}
      >
        <MapViewport bounds={dynamicBounds} />

        <TileLayer
           url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
  attribution='Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, SRTM | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a>'
        />

        {!isAnalysing &&
          heatmapOn &&
          activeCase.icebergs.map(berg => {
            const baseRadius = activeCase.id === 'explorer-2007' ? 35000 : activeCase.id === 'magdalena-2002' ? 160000 : 160000;
            const sizeMultiplier = berg.size === 'large' ? 1.5 : berg.size === 'medium' ? 1.2 : 0.8;
            return (
              <Circle
                key={berg.id}
                center={berg.position}
                radius={baseRadius * sizeMultiplier}
                pathOptions={{
                  className: 'heatmap-cell',
                  color: '#00e5ff',
                  weight: 2,
                  dashArray: '6 8',
                  fillColor: '#00e5ff',
                  fillOpacity: 0.2,
                }}
              />
            );
          })}

        {!isAnalysing &&
          activeCase.routes.map(r => {
            const isSelected = r.type === selectedRouteType;
            return (
              <Polyline
                key={r.type}
                positions={r.points}
                pathOptions={{
                  color: r.color,
                  weight: isSelected ? 6 : 3,
                  opacity: isSelected ? 1 : 0.45,
                  dashArray: r.type === 'historical' ? '8 6' : undefined,
                  lineCap: 'round',
                }}
                eventHandlers={{ click: () => onSelectRoute(r.type) }}
              >
                <Tooltip sticky>
                  <strong>{r.label}</strong> - RIO: {r.polarisRIO} | Fuel: {r.fuelUsed}t
                </Tooltip>
              </Polyline>
            );
          })}

        <Marker position={activeCase.routes[0].points[0]} icon={portIcon('START')} />
        <Marker position={activeCase.routes[0].points[activeCase.routes[0].points.length - 1]} icon={portIcon('DEST')} />
        {!isAnalysing && <Marker position={shipPos} icon={shipIcon()} zIndexOffset={1000} />}
      </MapContainer>
    </div>
  );
}

function MapViewport({ bounds }: { bounds: L.LatLngBounds }) {
  const map = useMap();
  useEffect(() => {
    map.invalidateSize();
    map.setMinZoom(2);
    map.flyToBounds(bounds, { padding: [120, 120], duration: 1.25 });
  }, [map, bounds]);
  return null;
}

function InfoRow({ label, value, icon }: { label: string; value: string; icon: ReactNode }) {
  return (
    <div
      className="dossier-row"
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: '12px',
        padding: '6px 0',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
      }}
    >
      <span className="row-label" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#8899ac' }}>
        {icon} {label}
      </span>
      <strong className="row-val" style={{ textAlign: 'right', maxWidth: '60%', color: '#e2e8f0', lineHeight: '1.2' }}>
        {value}
      </strong>
    </div>
  );
}

function Metric({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="route-metric">
      {icon}
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function pointAtProgress(points: Coordinate[], progress: number): Coordinate {
  const safeProgress = Math.max(0, Math.min(1, progress));
  if (points.length < 2) return points[0];

  const segmentDistances = points.slice(1).map((point, index) => greatCircleDistance(points[index], point));
  const totalDistance = segmentDistances.reduce((total, distance) => total + distance, 0);
  let distanceTravelled = safeProgress * totalDistance;

  for (let index = 0; index < segmentDistances.length; index += 1) {
    const segmentDistance = segmentDistances[index];
    if (distanceTravelled <= segmentDistance || index === segmentDistances.length - 1) {
      return interpolateGreatCircle(points[index], points[index + 1], segmentDistance === 0 ? 0 : distanceTravelled / segmentDistance);
    }
    distanceTravelled -= segmentDistance;
  }

  return points[points.length - 1];
}

function greatCircleDistance([fromLat, fromLng]: Coordinate, [toLat, toLng]: Coordinate): number {
  const toRadians = Math.PI / 180;
  const latDelta = (toLat - fromLat) * toRadians;
  const lngDelta = (toLng - fromLng) * toRadians;
  const a = Math.sin(latDelta / 2) ** 2 + Math.cos(fromLat * toRadians) * Math.cos(toLat * toRadians) * Math.sin(lngDelta / 2) ** 2;
  return 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function interpolateGreatCircle([fromLat, fromLng]: Coordinate, [toLat, toLng]: Coordinate, fraction: number): Coordinate {
  const toRadians = Math.PI / 180;
  const toDegrees = 180 / Math.PI;
  const clampedFraction = Math.max(0, Math.min(1, fraction));
  const distance = greatCircleDistance([fromLat, fromLng], [toLat, toLng]);
  if (distance === 0) return [fromLat, fromLng];

  const fromLatRadians = fromLat * toRadians;
  const fromLngRadians = fromLng * toRadians;
  const toLatRadians = toLat * toRadians;
  const toLngRadians = toLng * toRadians;
  const startWeight = Math.sin((1 - clampedFraction) * distance) / Math.sin(distance);
  const endWeight = Math.sin(clampedFraction * distance) / Math.sin(distance);
  const x = startWeight * Math.cos(fromLatRadians) * Math.cos(fromLngRadians) + endWeight * Math.cos(toLatRadians) * Math.cos(toLngRadians);
  const y = startWeight * Math.cos(fromLatRadians) * Math.sin(fromLngRadians) + endWeight * Math.cos(toLatRadians) * Math.sin(toLngRadians);
  const z = startWeight * Math.sin(fromLatRadians) + endWeight * Math.sin(toLatRadians);

  return [Math.atan2(z, Math.hypot(x, y)) * toDegrees, Math.atan2(y, x) * toDegrees];
}

function shipIcon() {
  return L.divIcon({
    className: 'ship-div-icon live',
    html: '<span class="ship-core"></span>',
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
}

function portIcon(code: string) {
  return L.divIcon({
    className: 'port-div-icon',
    html: `<span>${code}</span>`,
    iconSize: [44, 22],
    iconAnchor: [22, 11],
  });
}