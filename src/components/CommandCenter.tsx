import 'leaflet/dist/leaflet.css';
import * as L from 'leaflet';
import { motion } from 'framer-motion';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Circle, MapContainer, Marker, Polyline, Tooltip, useMap } from 'react-leaflet';
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

type SimulationMode = 'idle' | 'replay' | 'complete';
type Coordinate = [number, number];

const analysisStages = [
  'Fetching satellite imagery',
  'Retrieving live ice-chart data',
  'Processing sea-ice conditions',
  'Running route-optimisation algorithm',
];

export interface RouteOption {
  type: 'historical' | 'safest' | 'fastest' | 'fuel';
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
  routes: RouteOption[];
}

const numberFormatter = new Intl.NumberFormat('en-IN');

// Real-World Antarctic Case Studies Dataset
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
        points: [[-54.8, -68.3], [-57.5, -65.1], [-60.2, -61.8], [-62.2, -58.9]],
      },
      {
        type: 'safest',
        label: 'Safest Route (AI Preferred)',
        badge: 'RECOMMENDED',
        color: '#10B981', 
        etaDays: 4.8,
        fuelUsed: 105,
        distanceKm: 1390,
        polarisRIO: 8,
        hazardsNear: 1,
        description: 'Wide western detachment around Bransfield Strait multi-year ice fields.',
        points: [[-54.8, -68.3], [-56.8, -69.5], [-59.9, -64.2], [-62.2, -58.9]],
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
        points: [[-54.8, -68.3], [-57.1, -64.0], [-60.8, -60.5], [-62.2, -58.9]],
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
        points: [[-54.8, -68.3], [-57.8, -66.8], [-60.5, -62.0], [-62.2, -58.9]],
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
        points: [[-33.9, 18.4], [-44.2, 16.1], [-56.8, 14.2], [-65.1, 12.8], [-70.7, 11.7]],
      },
      {
        type: 'safest',
        label: 'Safest Route (AI Preferred)',
        badge: 'RECOMMENDED',
        color: '#10B981', 
        etaDays: 14.1,
        fuelUsed: 540,
        distanceKm: 4450,
        polarisRIO: 10,
        hazardsNear: 2,
        description: 'Navigates open leads identified by predictive SAR satellite trajectories.',
        points: [[-33.9, 18.4], [-45.0, 22.1], [-57.1, 20.4], [-66.0, 16.2], [-70.7, 11.7]],
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
        points: [[-33.9, 18.4], [-43.8, 17.5], [-55.2, 15.0], [-64.8, 13.1], [-70.7, 11.7]],
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
        points: [[-33.9, 18.4], [-44.5, 19.8], [-56.5, 17.8], [-65.2, 14.5], [-70.7, 11.7]],
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
      'Successful resupply mission to India’s Maitri and Bharati research stations. Traversed dense pack ice without incident, hull fatigue, or schedule delays.',
    startPort: 'Cape Town (CPT)',
    destination: 'Bharati Station (Larsemann Hills)',
    startCoords: [-33.9, 18.4],
    endCoords: [-69.4, 76.2],
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
        points: [[-33.9, 18.4], [-46.1, 35.2], [-58.4, 52.1], [-65.2, 68.0], [-69.4, 76.2]],
      },
      {
        type: 'safest',
        label: 'Safest Route (AI Preferred)',
        badge: 'RECOMMENDED',
        color: '#10B981', 
        etaDays: 11.0,
        fuelUsed: 390,
        distanceKm: 4980,
        polarisRIO: 14,
        hazardsNear: 1,
        description: 'Bypasses iceberg cluster off Prydz Bay using AI drift forecasting.',
        points: [[-33.9, 18.4], [-45.5, 38.0], [-57.0, 56.4], [-64.8, 71.0], [-69.4, 76.2]],
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
        points: [[-33.9, 18.4], [-47.0, 36.5], [-59.1, 54.0], [-66.1, 70.2], [-69.4, 76.2]],
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
        points: [[-33.9, 18.4], [-45.8, 37.1], [-57.8, 55.2], [-65.0, 70.5], [-69.4, 76.2]],
      },
    ],
  },
];

// Helper to dynamically calculate precise map bounds based on selected case study
function getCaseBounds(caseStudy: CaseStudy): L.LatLngBounds {
  const allPoints = caseStudy.routes.flatMap(r => r.points);
  const lats = allPoints.map(p => p[0]);
  const lngs = allPoints.map(p => p[1]);
  return L.latLngBounds(
    [Math.min(...lats) - 2, Math.min(...lngs) - 4],
    [Math.max(...lats) + 2, Math.max(...lngs) + 4]
  );
}

export default function CommandCenter() {
  const navigate = useNavigate();
  const [activeCaseIndex, setActiveCaseIndex] = useState<number | null>(null);
  const [selectedRouteType, setSelectedRouteType] = useState<string>('safest');
  const [mode, setMode] = useState<SimulationMode>('idle');
  const [progress, setProgress] = useState(0);
  const [heatmapOn, setHeatmapOn] = useState(false);
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
    setSelectedRouteType('safest');
    setMode('idle');
    setProgress(0);
    setIsAnalysing(false);
    if (analysisTimer.current) clearTimeout(analysisTimer.current);
  };

  const startReplay = () => {
    if (!activeCase) return;
    setIsAnalysing(true);
    setMode('idle');
    setProgress(0);
    analysisTimer.current = setTimeout(() => {
      setIsAnalysing(false);
      setMode('replay');
    }, 5000);
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
        const next = prev + (delta * 1.5) / 30000; // Hardcoded optimal simulation speed
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
        {/* Compact, anti-scroll Left Panel */}
        <aside className="command-side-panel left" style={{ paddingBottom: '12px', display: 'flex', flexDirection: 'column' }}>
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
                  border: activeCaseIndex === idx ? '2px solid #4dd2ff' : '1px solid rgba(255, 255, 255, 0.1)',
                  backgroundColor: activeCaseIndex === idx ? 'rgba(77, 210, 255, 0.08)' : 'rgba(255, 255, 255, 0.02)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
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

          {activeCase ? <motion.div
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
              <InfoRow label="Passage" value={`${activeCase.startPort} → ${activeCase.destination}`} icon={<Compass size={13} />} />
            </div>

            <div className="incident-summary" style={{ marginTop: 'auto', padding: '12px', backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: '6px' }}>
              <p className="eyebrow" style={{ marginBottom: '6px', fontSize: '10px' }}><Info size={12} /> INCIDENT BRIEF</p>
              <p style={{ margin: 0, fontSize: '13px', lineHeight: '1.4', color: '#cbd5e1' }}>{activeCase.incidentDetails}</p>
            </div>
          </motion.div> : <SelectionNote
            icon={<Compass size={22} />}
            title="Select a case study"
            description="Choose one of the three historical voyages above to view the vessel, route options, and operational briefing."
          />}
        </aside>

        <section className="command-map-panel">
          {activeCase && selectedRoute && dynamicBounds ? <>
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

          <MapShell
            activeCase={activeCase}
            selectedRouteType={selectedRouteType}
            progress={progress}
            mode={mode}
            heatmapOn={heatmapOn}
            dynamicBounds={dynamicBounds}
            onSelectRoute={type => setSelectedRouteType(type)}
          />

          <div className="map-overlay-bottom">
            {isAnalysing ? <AnalysisPopup /> : mode === 'idle' ? (
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
          </> : <div className="case-selection-map">
            <Radar size={38} />
            <span>COMMAND CENTRE READY</span>
            <strong>Select a historical case study to initialise the map.</strong>
            <p>The map and route analysis remain focused on your selected voyage.</p>
          </div>}
        </section>

        <aside className="command-side-panel right">
          <div className="panel-heading">
            <Gauge size={17} />
            <span>ROUTE COMPARISON</span>
          </div>

          {selectedRoute ? <motion.div
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
          </motion.div> : <SelectionNote
            icon={<RouteIcon size={22} />}
            title="Route comparison awaits"
            description="Select a case study to compare safety, speed, fuel use, and nearby hazards."
          />}
        </aside>
      </section>
    </main>
  );
}

function SelectionNote({ icon, title, description }: { icon: ReactNode; title: string; description: string }) {
  return <div className="case-selection-note">
    {icon}
    <strong>{title}</strong>
    <p>{description}</p>
  </div>;
}

function AnalysisPopup() {
  return <div className="analysis-popup" role="status" aria-live="polite">
    <div className="analysis-popup-heading"><Radar size={16} /><span>ROUTE ANALYSIS IN PROGRESS</span></div>
    {analysisStages.map((stage, index) => <div className="analysis-stage" style={{ '--stage-delay': `${index * 1.15}s` } as CSSProperties} key={stage}>
      <span className="analysis-spinner" />
      <span>{stage}</span>
    </div>)}
  </div>;
}

function MapShell({
  activeCase,
  selectedRouteType,
  progress,
  mode,
  heatmapOn,
  dynamicBounds,
  onSelectRoute,
}: {
  activeCase: CaseStudy;
  selectedRouteType: string;
  progress: number;
  mode: SimulationMode;
  heatmapOn: boolean;
  dynamicBounds: L.LatLngBounds;
  onSelectRoute: (type: string) => void;
}) {
  const selectedRoute = activeCase.routes.find(r => r.type === selectedRouteType) ?? activeCase.routes[1];
  const shipPos = mode === 'replay' ? pointAtProgress(selectedRoute.points, progress) : activeCase.routes[0].points[0];

  return (
    <div className="command-map-shell">
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

        {heatmapOn && activeCase.routes.flatMap(route => route.points.slice(1, -1)).map((position, index) => (
          <Circle
            key={`${position.join('-')}-${index}`}
            center={position}
            radius={90000}
            pathOptions={{
              className: 'heatmap-cell',
              color: '#4dd2ff',
              fillColor: '#4dd2ff',
              fillOpacity: 0.16,
              opacity: 0,
              weight: 0,
            }}
          />
        ))}

        {activeCase.routes.map(r => {
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
                <strong>{r.label}</strong> — RIO: {r.polarisRIO} | Fuel: {r.fuelUsed}t
              </Tooltip>
            </Polyline>
          );
        })}

        <Marker position={activeCase.routes[0].points[0]} icon={portIcon('START')} />
        <Marker position={activeCase.routes[0].points[activeCase.routes[0].points.length - 1]} icon={portIcon('DEST')} />
        <Marker position={shipPos} icon={shipIcon()} zIndexOffset={1000} />
      </MapContainer>
    </div>
  );
}

function MapViewport({ bounds }: { bounds: L.LatLngBounds }) {
  const map = useMap();
  useEffect(() => {
    map.flyToBounds(bounds, { padding: [40, 40], duration: 1.25 });
  }, [map, bounds]);
  return null;
}

function InfoRow({ label, value, icon }: { label: string; value: string; icon: ReactNode }) {
  return (
    <div className="dossier-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
      <span className="row-label" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#8899ac' }}>
        {icon} {label}
      </span>
      <strong className="row-val" style={{ textAlign: 'right', maxWidth: '60%', color: '#e2e8f0', lineHeight: '1.2' }}>{value}</strong>
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
  const index = Math.min(points.length - 1, Math.floor(safeProgress * (points.length - 1)));
  return points[index];
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
