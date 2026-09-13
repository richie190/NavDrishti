import { Component, lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import { Chrome as ChromeIcon } from 'lucide-react';
import { useExperience } from './hooks/useExperience';
import { Header, JourneyChrome, Loading } from './components/Chrome';
import Story from './components/Story';
import CommandCenter from './components/CommandCenter';
import type { SceneControls } from './data/mission';

const World = lazy(() => import('./scenes/World'));

class RenderBoundary extends Component<{ children: ReactNode; onError: () => void }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch(error: Error, info: ErrorInfo) { console.error('Polar renderer:', error, info); this.props.onError(); }
  render() { return this.state.failed ? null : this.props.children; }
}

export default function App() {
  return <Routes>
    <Route path="/" element={<LandingPage />} />
    <Route path="/command-center" element={<CommandCenter />} />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>;
}

function LandingPage() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [lite, setLite] = useState(() => innerWidth < 800 || navigator.hardwareConcurrency <= 4);
  const [station, setStation] = useState('bharati');
  const [scenario, setScenarioState] = useState('single');
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [controls, setControls] = useState<SceneControls>({ icebergs: true, routes: true, seaIce: true, orbit: false, zoom: 1, focus: false });
  const { motion, active, go, tour, setTour, reduced, lenis } = useExperience(ready || failed);
  const simulationFrame = useRef(0);
  const handleReady = useCallback(() => setReady(true), []);
  const handleFailure = useCallback(() => setFailed(true), []);

  useEffect(() => {
    if (ready || failed) return;
    const timeout = setTimeout(handleFailure, 18000);
    return () => clearTimeout(timeout);
  }, [ready, failed, handleFailure]);
  useEffect(() => { motion.current.controls = controls; }, [controls, motion]);
  useEffect(() => { motion.current.scenario = scenario; motion.current.simulation = progress; }, [scenario, progress, motion]);
  useEffect(() => { lenis.current?.start(); }, [lenis]);
  useEffect(() => {
    if (!running) return;
    let start: number | undefined;
    let last = 0;
    const tick = (time: number) => {
      start ??= time;
      const amount = Math.min(1, (time - start) / 6500);
      motion.current.simulation = amount;
      if (time - last > 45 || amount === 1) { setProgress(amount); last = time; }
      if (amount < 1) simulationFrame.current = requestAnimationFrame(tick);
      else setRunning(false);
    };
    simulationFrame.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(simulationFrame.current);
  }, [running, motion]);
  const setControl = <K extends keyof SceneControls>(key: K, value: SceneControls[K]) => setControls(previous => ({ ...previous, [key]: value }));
  const setScenario = (id: string) => { setRunning(false); setProgress(0); setScenarioState(id); };
  const run = () => { setProgress(0); setRunning(true); };
  const command = () => navigate('/command-center');
  const selectStation = (id: string) => { setStation(id); go('stations'); };

  return <div className={`app ${reduced ? 'reduced-motion' : ''}`} data-active={active}>
    <a className="skip-link" href="#ice">Skip introduction</a>
    <div className="scene-container" aria-label="Interactive Antarctic environment">
      {!failed ? <RenderBoundary onError={handleFailure}><Suspense fallback={null}><World motion={motion} lite={lite} active={active} onReady={handleReady} onFailure={handleFailure} onStation={selectStation} /></Suspense></RenderBoundary> : <div className="fallback-scene"><div className="fallback-mountain" /><div className="fallback-ocean" /></div>}
    </div>
    <div className="scene-shade" /><div className="film-grain" /><div className="frame-corner top-left" /><div className="frame-corner bottom-right" />
    <Header go={go} command={command} tour={tour} setTour={setTour} />
    {failed && <div className="render-notice" role="status"><ChromeIcon size={14} /> Simplified view. WebGL could not start. <button onClick={() => { setFailed(false); setReady(false); setLite(true); }}>Retry in eco mode</button></div>}
    <Story go={go} command={command} controls={controls} setControl={setControl} station={station} setStation={setStation} scenario={scenario} setScenario={setScenario} running={running} progress={progress} run={run} reduced={reduced} />
    <JourneyChrome active={active} go={go} lite={lite} setLite={setLite} tour={tour} />
    <Loading ready={ready} failed={failed} reduced={reduced} />
  </div>;
}
