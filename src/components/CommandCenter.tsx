import 'leaflet/dist/leaflet.css';
import * as L from 'leaflet';
import { AnimatePresence, motion } from 'framer-motion';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Circle, MapContainer, Marker, Polygon, Polyline, Tooltip, useMap } from 'react-leaflet';
import {
  Activity,
  CheckCircle2,
  ChevronLeft,
  Fuel,
  Gauge,
  LockKeyhole,
  Play,
  Radar,
  RotateCcw,
  Route as RouteIcon,
  Ship,
  Snowflake,
  Timer,
  X,
  Zap,
} from 'lucide-react';
import {
  alertEvent,
  heatmapStates,
  historicalRoute,
  icebergs,
  routes,
  vessel,
  voyage,
  type CandidateRoute,
  type Coordinate,
  type RouteType,
} from '../data/mockData';

type SimulationMode = 'idle' | 'planning' | 'replay' | 'complete';

const REPLAY_DURATION_MS = 38000;
const START_POINT = historicalRoute.points[0];
const END_POINT = historicalRoute.points[historicalRoute.points.length - 1];
const mapBounds = L.latLngBounds([[-72, 13], [-31, 82]]);
const numberFormatter = new Intl.NumberFormat('en-IN');
const dateFormatter = new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' });

export default function CommandCenter() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<SimulationMode>('idle');
  const [selectedType, setSelectedType] = useState<RouteType | null>(null);
  const [heatmapOn, setHeatmapOn] = useState(false);
  const [progress, setProgress] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [alertTriggered, setAlertTriggered] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const frame = useRef(0);

  const started = mode !== 'idle';
  const locked = mode === 'replay' || mode === 'complete';
  const selectedRoute = useMemo(() => routes.find(route => route.type === selectedType) ?? null, [selectedType]);
  const heatmapIndex = heatmapOn ? Math.min(heatmapStates.length - 1, Math.floor(progress * heatmapStates.length)) : 0;
  const currentDate = selectedRoute ? formatDateAtProgress(voyage.startDate, selectedRoute.etaDays, progress) : formatDateAtProgress(voyage.startDate, 0, 0);
  const comparison = selectedRoute ? buildComparison(selectedRoute) : null;

  const startSimulation = () => {
    setMode('planning');
    setSelectedType(null);
    setProgress(0);
    setSpeed(1);
    setAlertTriggered(false);
    setAlertVisible(false);
  };

  const selectRoute = useCallback((type: RouteType) => {
    if (locked) return;
    setSelectedType(type);
  }, [locked]);

  const approveRoute = () => {
    if (!selectedRoute) return;
    setMode('replay');
    setProgress(0);
    setAlertTriggered(false);
    setAlertVisible(false);
  };

  const restartToLanding = () => navigate('/');

  useEffect(() => {
    if (mode !== 'replay' || !selectedRoute) return undefined;
    let lastTime: number | undefined;

    const tick = (time: number) => {
      lastTime ??= time;
      const delta = time - lastTime;
      lastTime = time;
      setProgress(previous => Math.min(1, previous + (delta * speed) / REPLAY_DURATION_MS));
      frame.current = requestAnimationFrame(tick);
    };

    frame.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame.current);
  }, [mode, selectedRoute, speed]);

  useEffect(() => {
    if (mode === 'replay' && progress >= 1) setMode('complete');
  }, [mode, progress]);

  useEffect(() => {
    const triggerAt = alertEvent.triggerProgressPct / 100;
    if (mode === 'replay' && progress >= triggerAt && !alertTriggered) {
      setAlertTriggered(true);
      setAlertVisible(true);
    }
  }, [alertTriggered, mode, progress]);

  return <main className="command-page">
    <header className="command-topbar">
      <button className="command-back" onClick={() => navigate('/')} aria-label="Back to landing page"><ChevronLeft size={17} />NAVDHRISHTI</button>
      <div className="command-title-block">
        <p className="eyebrow"><Radar size={13} /> POLARIS DECISION SUPPORT</p>
        <h1>Antarctic Ship-Routing Command Center</h1>
      </div>
      <div className="command-clock"><span>SIM TIME</span><strong>{currentDate}</strong></div>
    </header>

    <section className="command-layout" aria-label="Antarctic route decision dashboard">
      <LeftPanel started={started} />
      <section className="command-map-panel">
        <div className="command-map-toolbar">
          <div>
            <span className={`command-live-dot ${mode === 'replay' ? 'is-live' : ''}`} />
            <strong>{mode === 'idle' ? 'MAP STANDBY' : mode === 'planning' ? 'ROUTE REVEAL' : mode === 'replay' ? 'REPLAY ACTIVE' : 'ARRIVED'}</strong>
          </div>
          <button className={`heatmap-toggle ${heatmapOn ? 'is-on' : ''}`} onClick={() => setHeatmapOn(value => !value)} aria-pressed={heatmapOn}>
            <Snowflake size={15} />Ice Heatmap
          </button>
        </div>
        <RouteMap
          started={started}
          locked={locked}
          mode={mode}
          progress={progress}
          selectedType={selectedType}
          heatmapOn={heatmapOn}
          heatmapIndex={heatmapIndex}
          onSelect={selectRoute}
        />
        <AnimatePresence>
          {mode === 'idle' && <motion.div className="start-simulation-overlay" initial={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: .45 }}>
            <button className="start-simulation-button" onClick={startSimulation}><Play size={18} fill="currentColor" />Start Simulation</button>
          </motion.div>}
        </AnimatePresence>
        {(mode === 'replay' || mode === 'complete') && selectedRoute && <ReplayControls
          progress={progress}
          speed={speed}
          route={selectedRoute}
          currentDate={currentDate}
          onSpeed={setSpeed}
          onScrub={value => setProgress(value)}
        />}
      </section>
      <RightPanel route={selectedRoute} started={started} locked={locked} onApprove={approveRoute} />
    </section>

    <AnimatePresence>
      {alertVisible && <motion.aside className="route-alert-toast" initial={{ opacity: 0, y: 20, scale: .98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 16, scale: .98 }} role="status">
        <div><Activity size={16} /><strong>AIS LIVE POSITION CHECK</strong></div>
        <p>{alertEvent.message}</p>
        <button onClick={() => setAlertVisible(false)}>Acknowledge<X size={13} /></button>
      </motion.aside>}
    </AnimatePresence>

    <AnimatePresence>
      {mode === 'complete' && selectedRoute && comparison && <SummaryModal route={selectedRoute} comparison={comparison} onRestart={restartToLanding} />}
    </AnimatePresence>
  </main>;
}

function LeftPanel({ started }: { started: boolean }) {
  const rows = [
    ['Vessel', vessel.name],
    ['Ice class', vessel.iceClass],
    ['Draft', vessel.draft],
    ['Service speed', vessel.speed],
    ['Fuel capacity', vessel.fuelCapacity],
    ['Voyage start', voyage.startDate],
    ['ETA window', voyage.endDate],
    ['Route', `${voyage.origin} -> ${voyage.destination}`],
  ];

  return <aside className="command-side-panel left" aria-label="Vessel details">
    <div className="panel-heading"><Ship size={17} /><span>VESSEL PACKAGE</span></div>
    <div className="vessel-identity">
      <span>{started ? 'EXPEDITION 001' : '-------'}</span>
      <strong>{started ? vessel.name : '---'}</strong>
    </div>
    <div className="panel-rows">
      {rows.map(([label, value]) => <InfoRow key={label} label={label} value={started ? value : '---'} />)}
    </div>
    <div className="data-tag"><span className="status-dot" />DATA AS OF {started ? voyage.dataAsOf : '---'}</div>
  </aside>;
}

function RightPanel({ route, started, locked, onApprove }: { route: CandidateRoute | null; started: boolean; locked: boolean; onApprove: () => void }) {
  return <aside className="command-side-panel right" aria-label="Route details">
    <div className="panel-heading"><Gauge size={17} /><span>ROUTE INTELLIGENCE</span></div>
    {!route && <div className="route-placeholder">
      <span>{started ? 'SELECT ROUTE' : 'STANDBY'}</span>
      <strong>---</strong>
      <p>POLARIS RIO ---</p>
      <div className="placeholder-grid">{Array.from({ length: 6 }, (_, index) => <i key={index} />)}</div>
    </div>}
    {route && <motion.div className="route-detail-card" key={route.type} initial={{ opacity: 0, x: 18 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: .25 }}>
      <div className="route-detail-heading">
        <span style={{ color: route.color }}>{route.label}</span>
        {locked ? <small><LockKeyhole size={12} />SIGNED OFF</small> : <small>AWAITING APPROVAL</small>}
      </div>
      <div className="rio-readout">
        <span>POLARIS RIO</span>
        <strong>{route.polarisRIO}</strong>
        <p>{route.polarisRIO <= -3 ? 'High caution corridor' : 'Requires officer judgement'}</p>
      </div>
      <div className="route-stat-grid">
        <Metric icon={<Timer size={14} />} label="ETA" value={`${route.etaDays} days`} />
        <Metric icon={<Fuel size={14} />} label="Fuel use" value={`${numberFormatter.format(route.fuelUsed)} t`} />
        <Metric icon={<RouteIcon size={14} />} label="Distance" value={`${numberFormatter.format(route.distanceKm)} km`} />
        <Metric icon={<Zap size={14} />} label="Confidence" value={`${route.confidencePct}%`} />
      </div>
      <div className="confidence-block">
        <div><span>CONFIDENCE CONE</span><strong>{route.confidencePct}%</strong></div>
        <div className="confidence-cone"><i style={{ width: `${route.confidencePct}%` }} /></div>
      </div>
      {!locked && <button className="approve-route-button" onClick={onApprove}>
        <CheckCircle2 size={16} />Approve Route - POLARIS RIO: {route.polarisRIO} <span>requires officer judgement</span>
      </button>}
      {locked && <div className="locked-note"><LockKeyhole size={14} />Route selection locked for replay.</div>}
    </motion.div>}
  </aside>;
}

function RouteMap({ started, locked, mode, progress, selectedType, heatmapOn, heatmapIndex, onSelect }: {
  started: boolean;
  locked: boolean;
  mode: SimulationMode;
  progress: number;
  selectedType: RouteType | null;
  heatmapOn: boolean;
  heatmapIndex: number;
  onSelect: (type: RouteType) => void;
}) {
  const activeRoute = routes.find(route => route.type === selectedType) ?? routes[0];
  const replaying = mode === 'replay' || mode === 'complete';
  const shipPosition = replaying && selectedType ? pointAtProgress(activeRoute.points, progress) : START_POINT;
  const ghostPosition = replaying && selectedType ? pointAtProgress(historicalRoute.points, progress) : null;

  return <div className="command-map-shell">
    <MapContainer className="command-leaflet" center={[-53, 48]} zoom={3.25} zoomSnap={.25} minZoom={2.5} maxZoom={6} maxBounds={mapBounds} scrollWheelZoom={false} attributionControl={false} zoomControl={false}>
      <MapViewport started={started} />
      <PolarBasemap />
      {started && heatmapOn && <HeatmapLayer index={heatmapIndex} />}
      {started && <Polyline positions={historicalRoute.points} pathOptions={{ color: '#ff4155', weight: 4, opacity: .88, dashArray: '10 8', className: 'historical-route' }} />}
      {started && <Marker position={midpoint(historicalRoute.points)} icon={labelIcon(`Historical Voyage - ${historicalRoute.date}`, 'historical-label')} interactive={false} />}
      {started && routes.map(route => {
        const selected = selectedType === route.type;
        const dimmed = selectedType !== null && !selected;
        const className = `candidate-route candidate-${route.type} ${selected ? 'is-selected' : ''} ${dimmed ? 'is-dimmed' : ''} ${locked ? 'is-locked' : ''}`;
        return <Polyline
          key={route.type}
          positions={route.points}
          pathOptions={{ color: route.color, weight: selected ? 7 : 3, opacity: dimmed ? .25 : .92, dashArray: selected ? undefined : '12 10', lineCap: 'round', lineJoin: 'round', className }}
          eventHandlers={{ click: () => onSelect(route.type) }}
        />;
      })}
      {started && !locked && routes.map(route => <Polyline
        key={`${route.type}-hit`}
        positions={route.points}
        pathOptions={{ color: route.color, weight: 22, opacity: 0, lineCap: 'round' }}
        eventHandlers={{ click: () => onSelect(route.type) }}
      />)}
      {started && routes.map(route => <Marker key={`${route.type}-label`} position={routeLabelPoint(route.points)} icon={labelIcon(route.label, `candidate-label ${route.type}`)} interactive={false} />)}
      {started && icebergs.map(iceberg => <Marker key={`${iceberg.lat}-${iceberg.lng}`} position={[iceberg.lat, iceberg.lng]} icon={icebergIcon(iceberg.sizeCategory)} interactive={false}>
        <Tooltip direction="top" offset={[0, -12]} opacity={.92}>Iceberg cluster {iceberg.sizeCategory}</Tooltip>
      </Marker>)}
      {started && <Marker position={START_POINT} icon={portIcon('CPT')} interactive={false} />}
      {started && <Marker position={END_POINT} icon={stationIcon()} interactive={false} />}
      {started && <Marker position={shipPosition} icon={shipIcon(replaying ? 'live' : 'parked')} zIndexOffset={900} interactive={false} />}
      {ghostPosition && <Marker position={ghostPosition} icon={ghostShipIcon()} zIndexOffset={700} interactive={false} />}
    </MapContainer>
  </div>;
}

function ReplayControls({ progress, speed, route, currentDate, onSpeed, onScrub }: {
  progress: number;
  speed: number;
  route: CandidateRoute;
  currentDate: string;
  onSpeed: (speed: number) => void;
  onScrub: (progress: number) => void;
}) {
  return <div className="replay-controls">
    <div className="replay-meta">
      <span>{currentDate}</span>
      <strong>{route.label} replay</strong>
      <span>{Math.round(progress * 100)}%</span>
    </div>
    <input type="range" min="0" max="100" value={Math.round(progress * 100)} onChange={event => onScrub(Number(event.target.value) / 100)} aria-label="Replay time position" />
    <div className="speed-control" aria-label="Replay speed">
      {[1, 2, 4].map(value => <button key={value} className={speed === value ? 'is-active' : ''} onClick={() => onSpeed(value)}>{value}x</button>)}
    </div>
  </div>;
}

function SummaryModal({ route, comparison, onRestart }: { route: CandidateRoute; comparison: ReturnType<typeof buildComparison>; onRestart: () => void }) {
  return <motion.div className="summary-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
    <motion.section className="summary-modal" initial={{ y: 28, scale: .98 }} animate={{ y: 0, scale: 1 }} exit={{ y: 22, scale: .98 }} role="dialog" aria-modal="true" aria-labelledby="summary-title">
      <div className="summary-heading">
        <div><p className="eyebrow"><CheckCircle2 size={13} /> ARRIVAL CONFIRMED</p><h2 id="summary-title">Route outcome summary</h2></div>
        <button onClick={onRestart} aria-label="Restart simulation"><RotateCcw size={18} /></button>
      </div>
      <p className="summary-callout">Recommended route: {comparison.shorterPct}% shorter, {comparison.fuelPct}% less fuel, {comparison.fewerHazards} fewer hazard encounters.</p>
      <div className="summary-columns">
        <SummaryColumn title={`${route.label} Route`} rows={[
          ['Total distance', `${numberFormatter.format(route.distanceKm)} km`],
          ['Fuel used', `${numberFormatter.format(route.fuelUsed)} t`],
          ['Time taken', `${route.etaDays} days`],
          ['Flagged hazards', String(route.hazardsNear)],
        ]} accent={route.color} />
        <SummaryColumn title="Historical Route" rows={[
          ['Total distance', `${numberFormatter.format(historicalRoute.distanceKm)} km`],
          ['Fuel used', `${numberFormatter.format(historicalRoute.fuelUsed)} t`],
          ['Time taken', `${historicalRoute.durationDays} days`],
          ['Flagged hazards', String(historicalRoute.hazardsNear)],
        ]} accent="#ff4155" />
      </div>
      <button className="restart-button" onClick={onRestart}><RotateCcw size={16} />Restart Simulation</button>
    </motion.section>
  </motion.div>;
}

function SummaryColumn({ title, rows, accent }: { title: string; rows: [string, string][]; accent: string }) {
  return <div className="summary-column" style={{ '--summary-accent': accent } as CSSProperties}>
    <h3>{title}</h3>
    {rows.map(([label, value]) => <InfoRow key={label} label={label} value={value} />)}
  </div>;
}

function PolarBasemap() {
  const meridians = [20, 35, 50, 65, 80];
  const parallels = [-38, -46, -54, -62, -70];

  return <>
    {meridians.map(lng => <Polyline key={`lng-${lng}`} positions={[[-72, lng], [-32, lng]]} pathOptions={{ color: '#4dd2ff', opacity: .08, weight: 1, dashArray: '4 10' }} interactive={false} />)}
    {parallels.map(lat => <Polyline key={`lat-${lat}`} positions={[[lat, 14], [lat, 82]]} pathOptions={{ color: '#4dd2ff', opacity: .08, weight: 1, dashArray: '4 10' }} interactive={false} />)}
    <Polygon positions={[[-70.7, 48], [-70.1, 54], [-70.5, 61], [-69.8, 68], [-70.2, 76], [-72, 82], [-72, 28], [-71.2, 36]]} pathOptions={{ fillColor: '#d8f7ff', fillOpacity: .12, color: '#bdf5ff', opacity: .28, weight: 1 }} interactive={false} />
    <Polygon positions={[[-63.8, 16], [-64.4, 22], [-63.6, 28], [-64.8, 35], [-66.7, 39], [-66.5, 30], [-68.4, 22], [-67.2, 16]]} pathOptions={{ fillColor: '#88e7ff', fillOpacity: .08, color: '#9deeff', opacity: .18, weight: 1 }} interactive={false} />
  </>;
}

function HeatmapLayer({ index }: { index: number }) {
  return <>
    {heatmapStates[index].features.map((feature, featureIndex) => {
      const [lng, lat] = feature.geometry.coordinates;
      const intensity = feature.properties.intensity;
      return <Circle
        key={`${heatmapStates[index].id}-${featureIndex}`}
        center={[lat, lng]}
        radius={feature.properties.radiusKm * 1000}
        pathOptions={{
          color: 'transparent',
          fillColor: intensity > .7 ? '#ffd23f' : '#4dd2ff',
          fillOpacity: .08 + intensity * .18,
          className: 'heatmap-cell',
        }}
        interactive={false}
      />;
    })}
  </>;
}

function MapViewport({ started }: { started: boolean }) {
  const map = useMap();

  useEffect(() => {
    map.fitBounds(mapBounds, { padding: [22, 22], animate: false });
    const timer = window.setTimeout(() => map.invalidateSize(), 90);
    return () => window.clearTimeout(timer);
  }, [map, started]);

  return null;
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return <div className="info-row"><span>{label}</span><strong>{value}</strong></div>;
}

function Metric({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return <div className="route-metric">{icon}<span>{label}</span><strong>{value}</strong></div>;
}

function pointAtProgress(points: Coordinate[], progress: number): Coordinate {
  const safeProgress = Math.max(0, Math.min(1, progress));
  const segments = points.slice(1).map((point, index) => {
    const previous = points[index];
    return { from: previous, to: point, distance: roughDistance(previous, point) };
  });
  const total = segments.reduce((sum, segment) => sum + segment.distance, 0);
  let travelled = safeProgress * total;

  for (const segment of segments) {
    if (travelled <= segment.distance) {
      const ratio = segment.distance === 0 ? 0 : travelled / segment.distance;
      return [
        segment.from[0] + (segment.to[0] - segment.from[0]) * ratio,
        segment.from[1] + (segment.to[1] - segment.from[1]) * ratio,
      ];
    }
    travelled -= segment.distance;
  }

  return points[points.length - 1];
}

function roughDistance(from: Coordinate, to: Coordinate) {
  const latKm = (to[0] - from[0]) * 111;
  const lngKm = (to[1] - from[1]) * 111 * Math.cos(((from[0] + to[0]) / 2) * Math.PI / 180);
  return Math.hypot(latKm, lngKm);
}

function midpoint(points: Coordinate[]) {
  return points[Math.floor(points.length / 2)];
}

function routeLabelPoint(points: Coordinate[]) {
  return pointAtProgress(points, .55);
}

function formatDateAtProgress(startDate: string, durationDays: number, progress: number) {
  const start = new Date(`${startDate}T00:00:00Z`).getTime();
  const current = start + durationDays * progress * 24 * 60 * 60 * 1000;
  return dateFormatter.format(new Date(current));
}

function buildComparison(route: CandidateRoute) {
  return {
    shorterPct: Math.max(0, Math.round((1 - route.distanceKm / historicalRoute.distanceKm) * 100)),
    fuelPct: Math.max(0, Math.round((1 - route.fuelUsed / historicalRoute.fuelUsed) * 100)),
    fewerHazards: Math.max(0, historicalRoute.hazardsNear - route.hazardsNear),
  };
}

function shipIcon(state: 'live' | 'parked') {
  return L.divIcon({
    className: `ship-div-icon ${state}`,
    html: '<span class="ship-core"><span class="ship-nose"></span></span>',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
}

function ghostShipIcon() {
  return L.divIcon({
    className: 'ship-div-icon ghost',
    html: '<span class="ship-core"><span class="ship-nose"></span></span>',
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
}

function icebergIcon(sizeCategory: string) {
  return L.divIcon({
    className: 'iceberg-div-icon',
    html: `<span class="iceberg-shape"><i>${sizeCategory}</i></span>`,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
  });
}

function portIcon(code: string) {
  return L.divIcon({
    className: 'port-div-icon',
    html: `<span>${code}</span>`,
    iconSize: [44, 24],
    iconAnchor: [22, 12],
  });
}

function stationIcon() {
  return L.divIcon({
    className: 'station-div-icon',
    html: '<span>BHARATI</span>',
    iconSize: [76, 26],
    iconAnchor: [38, 13],
  });
}

function labelIcon(label: string, className: string) {
  return L.divIcon({
    className: `route-label-div-icon ${className}`,
    html: `<span>${label}</span>`,
    iconSize: [150, 24],
    iconAnchor: [75, 12],
  });
}
