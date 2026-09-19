
import 'leaflet/dist/leaflet.css';
import * as L from 'leaflet';
import { motion } from 'framer-motion';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const routerNavigate = useNavigate();
  const navigate = propNavigate || routerNavigate;

  const [session, setSession] = useState<{ role: string; code: string; callsign: string } | null>(null);
  const [activeCaseIndex, setActiveCaseIndex] = useState<number | null>(0);
  const [selectedRouteType, setSelectedRouteType] = useState<string>('safest');
  const [mode, setMode] = useState<SimulationMode>('idle');
  const [progress, setProgress] = useState(0);
  const [heatmapOn, setHeatmapOn] = useState(true);
  const [isAnalysing, setIsAnalysing] = useState(false);
  const frame = useRef(0);
  const analysisTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem('navdrishti_session');
      if (raw) {
        setSession(JSON.parse(raw));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

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
      {/* Top Header Bar */}
      <header className="command-topbar">
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button
            className="command-back"
            onClick={() => navigate('/')}
            aria-label="Back to landing page"
            title="Return to 3D Landing Page"
          >
            <ChevronLeft size={16} /> LANDING
          </button>
          <button
            className="command-back"
            onClick={() => navigate('/login')}
            aria-label="Back to role selection"
            title="Switch station role"
          >
            <Anchor size={14} /> STATION LOGIN
          </button>
        </div>

        <div className="command-title-block">
          <p className="command-eyebrow">
            <Radar size={13} /> POLAR INTELLIGENCE COMMAND CENTER
          </p>
          <h1 className="command-heading">Antarctic Ship-Routing Case Studies</h1>
        </div>

        <div className="command-header-right">
          <div className="command-clock">
            <span className="selected-case-label">SELECTED CASE</span>
            <strong className="selected-case-name">{activeCase?.shipName ?? 'Choose a case study'}</strong>
          </div>

          {session ? (
            <button
              className="officer-session-pill"
              onClick={() => navigate('/login')}
              title="Click to change role or re-authenticate"
            >
              <span className="officer-status-dot" />
              <div className="officer-info mono">
                <span className="officer-post">{session.code}: {session.role}</span>
                <span className="officer-callsign">{session.callsign}</span>
              </div>
            </button>
          ) : (
            <button
              className="officer-session-pill is-guest"
              onClick={() => navigate('/login')}
              title="Authenticate officer station"
            >
              <span className="officer-status-dot yellow" />
              <div className="officer-info mono">
                <span className="officer-post">STATION: UNASSIGNED</span>
                <span className="officer-callsign">CLICK TO LOGIN</span>
              </div>
            </button>
          )}
        </div>
      </header>

      {/* Main 3-Column Command Layout */}
      <section className="command-layout" aria-label="Antarctic route decision dashboard">
        {/* Left Side Panel: Historical Case Studies & Vessel Dossier */}
        <aside className="command-side-panel left">
          <div className="panel-heading">
            <Ship size={16} />
            <span>HISTORICAL CASE STUDIES</span>
          </div>

          <div className="case-study-boxes-container">
            {caseStudies.map((caseItem, idx) => (
              <button
                key={caseItem.id}
                className={`case-rectangular-box ${activeCaseIndex === idx ? 'is-active' : ''}`}
                onClick={() => handleSelectCase(idx)}
              >
                <div className="case-button-label">
                  {caseItem.buttonLabel}
                </div>
                <div className="case-button-subtitle mono">
                  {caseItem.subtitle}
                </div>
              </button>
            ))}
          </div>

          {activeCase ? (
            <motion.div
              key={activeCase.id}
              className="dossier-card"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="dossier-header">
                <span className={`status-badge ${activeCase.statusTag.includes('CRASHED') ? 'status-crashed' : activeCase.statusTag.includes('TRAPPED') ? 'status-trapped' : 'status-success'}`}>
                  {activeCase.statusTag}
                </span>
                <h2 className="dossier-ship-name">{activeCase.shipName}</h2>
                <small className="dossier-year mono">YEAR {activeCase.year}</small>
              </div>

              <div className="dossier-grid">
                <InfoRow label="Ship Size" value={activeCase.shipSize} icon={<Ship size={14} />} />
                <InfoRow label="Fuel Capacity" value={activeCase.fuelLimit} icon={<Fuel size={14} />} />
                <InfoRow label="Ice Resistance" value={activeCase.iceResistance} icon={<ShieldAlert size={14} />} />
                <InfoRow label="Personnel" value={activeCase.crewPassengers} icon={<Anchor size={14} />} />
                <InfoRow label="Passage" value={`${activeCase.startPort} to ${activeCase.destination}`} icon={<Compass size={14} />} />
              </div>

              <div className="incident-summary">
                <p className="incident-eyebrow mono">
                  <Info size={13} /> INCIDENT BRIEF
                </p>
                <p className="incident-text">{activeCase.incidentDetails}</p>
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

        {/* Center Panel: Interactive Map, Route Tabs & Simulation Controls */}
        <section className="command-map-panel">
          {activeCase && selectedRoute && dynamicBounds ? (
            <>
              <div className="command-map-toolbar">
                <div className="route-nav-tabs">
                  {activeCase.routes.map(r => (
                    <button
                      key={r.type}
                      className={`route-tab-button ${selectedRouteType === r.type ? 'is-active' : ''}`}
                      onClick={() => setSelectedRouteType(r.type)}
                      style={{ '--route-accent': r.color } as CSSProperties}
                    >
                      <span>{r.label}</span>
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

              {/* Floating Map Legend (Top-Right inside Map) */}
              <div className="map-visual-legend">
                <div className="legend-title mono">
                  MAP LEGEND
                </div>

                <div className="legend-items-list">
                  {activeCase.routes.map(r => (
                    <div key={r.type} className="legend-item-row">
                      <div
                        className="legend-line"
                        style={{
                          width: '24px',
                          height: r.type === 'historical' ? '0px' : '3px',
                          background: r.type === 'historical' ? 'transparent' : r.color,
                          borderTop: r.type === 'historical' ? `3px dashed ${r.color}` : 'none',
                          borderRadius: '2px',
                        }}
                      />
                      <span className="legend-item-text">{r.label}</span>
                    </div>
                  ))}
                </div>

                <div className="legend-hazard-row">
                  <div className="legend-hazard-symbol" />
                  <span className="legend-item-text">Iceberg Danger Zone</span>
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
                    <Play size={15} fill="currentColor" /> SIMULATE PASSAGE ({selectedRoute.label.toUpperCase()})
                  </button>
                ) : (
                  <div className="replay-controls">
                    <div className="replay-meta mono">
                      <span>REPLAYING: {selectedRoute.label}</span>
                      <strong>{Math.round(progress * 100)}% COMPLETE</strong>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={Math.round(progress * 100)}
                      onChange={e => setProgress(Number(e.target.value) / 100)}
                      className="replay-range"
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

        {/* Right Side Panel: Route Comparison & Polaris Metrics */}
        <aside className="command-side-panel right">
          <div className="panel-heading">
            <Gauge size={16} />
            <span>ROUTE COMPARISON</span>
          </div>

          {activeCase && selectedRoute ? (
            <>
              <div className="ai-recommendation-box">
                <p className="ai-rec-label mono">
                  AI RECOMMENDATION
                </p>
                <p className="ai-rec-body">{activeCase.recommendationReason}</p>
              </div>

              <motion.div
                key={selectedRoute.type}
                className="route-detail-card"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
              >
                <div className="route-detail-heading">
                  <h3 className="route-detail-name" style={{ color: selectedRoute.color }}>
                    {selectedRoute.label}
                  </h3>
                  <span className="route-badge-pill mono">{selectedRoute.badge}</span>
                </div>

                <div className="rio-readout-card">
                  <span className="rio-score-label mono">POLARIS RIO SCORE</span>
                  <strong className="rio-score-number" style={{ color: selectedRoute.polarisRIO < 0 ? '#FF4155' : '#10B981' }}>
                    {selectedRoute.polarisRIO > 0 ? `+${selectedRoute.polarisRIO}` : selectedRoute.polarisRIO}
                  </strong>
                  <p className="rio-score-status mono">
                    {selectedRoute.polarisRIO < 0 ? 'High Risk Corridor (Danger)' : 'Safe Passage Permitted'}
                  </p>
                </div>

                <div className="route-stat-grid">
                  <Metric icon={<Timer size={15} />} label="ETA" value={`${selectedRoute.etaDays} days`} />
                  <Metric icon={<Fuel size={15} />} label="Fuel Usage" value={`${numberFormatter.format(selectedRoute.fuelUsed)} t`} />
                  <Metric icon={<RouteIcon size={15} />} label="Distance" value={`${numberFormatter.format(selectedRoute.distanceKm)} km`} />
                  <Metric icon={<AlertTriangle size={15} />} label="Hazards Near" value={String(selectedRoute.hazardsNear)} />
                </div>

                <div className="route-description-box">
                  <p className="passage-summary-eyebrow mono">PASSAGE SUMMARY</p>
                  <p className="passage-summary-text">{selectedRoute.description}</p>
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
    <div className="dossier-row">
      <span className="row-label">
        <span className="row-icon">{icon}</span>
        <span>{label}</span>
      </span>
      <strong className="row-val">
        {value}
      </strong>
    </div>
  );
}

function Metric({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="route-metric-card">
      <div className="metric-header">
        <span className="metric-icon">{icon}</span>
        <span className="metric-label">{label}</span>
      </div>
      <strong className="metric-value">{value}</strong>
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