import { AnimatePresence, motion } from 'framer-motion';
import { ArrowDown, ArrowUpRight, Compass, Pause, Play, UserRound, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { chapters } from '../data/mission';

export function Brand({ onClick }: { onClick?: () => void }) {
  return <button className="brand" onClick={onClick} aria-label="NAVDRISHTI, return to start"><svg viewBox="0 0 36 40" fill="none" aria-hidden="true"><path d="m18 2 15 34-15-8L3 36 18 2Z" stroke="currentColor" strokeWidth="1.4" /><path d="M18 2v26M3 36l15-18 15 18" stroke="currentColor" strokeWidth=".8" /></svg><span>NAVDRISHTI<small>POLAR INTELLIGENCE</small></span></button>;
}

export function Loading({ ready, failed, reduced }: { ready: boolean; failed: boolean; reduced: boolean }) {
  const [minimum, setMinimum] = useState(false);
  useEffect(() => { const timer = setTimeout(() => setMinimum(true), reduced ? 0 : 1600); return () => clearTimeout(timer); }, [reduced]);
  return <AnimatePresence>{!(minimum && (ready || failed)) && <motion.div className="boot-screen" initial={{ opacity: 1 }} exit={{ opacity: 0, filter: reduced ? 'none' : 'blur(12px)' }} transition={{ duration: .8 }}>
    <div className="boot-orbit"><Compass size={36} strokeWidth={1} /></div><p className="eyebrow">POLARIS / EXPEDITION 001</p><h1>NAVDRISHTI</h1><span className="boot-line" /><p className="mono">INITIALIZING ANTARCTIC INTELLIGENCE</p><small>{ready ? 'POLAR ENVIRONMENT READY' : 'BUILDING THE POLAR ENVIRONMENT'}</small>
    <div className="boot-coordinates">69°24′ S &nbsp;&nbsp; 76°11′ E</div>
  </motion.div>}</AnimatePresence>;
}

export function Header({ go, command, login, tour, setTour }: { go: (id: string) => void; command: () => void; login: () => void; tour: boolean; setTour: (value: boolean) => void }) {
  return <header className="site-header"><Brand onClick={() => go('arrival')} /><nav aria-label="Main navigation"><button onClick={() => go('ice')}>The mission</button><button onClick={() => go('twin')}>Digital twin</button><button onClick={() => go('simulation')}>Simulator</button></nav><div className="header-actions"><button className="film-button" onClick={() => setTour(!tour)} aria-label={tour ? 'Pause guided tour' : 'Play guided tour'}>{tour ? <Pause size={13} fill="currentColor" /> : <Play size={13} fill="currentColor" />}<span>{tour ? 'PAUSE FILM' : 'PLAY FILM'}</span></button><button className="login-button" onClick={login}><UserRound size={14} /><span>LOGIN</span></button><button className="command-button" onClick={command}><span>Command center</span><ArrowUpRight size={16} /></button></div></header>;
}

export function JourneyChrome({ active, go, lite, setLite, tour }: { active: number; go: (id: string) => void; lite: boolean; setLite: (value: boolean) => void; tour: boolean }) {
  const [menu, setMenu] = useState(false);
  return <>
    <div className="journey-progress" />
    <div className="side-coordinate" aria-hidden="true">SOUTHERN OCEAN &nbsp; / &nbsp; 69°24′ S &nbsp; 76°11′ E</div>
    <aside className="chapter-rail" aria-label="Chapter navigation">{chapters.map((chapter, i) => <button key={chapter.id} title={chapter.title} aria-label={`Chapter ${i + 1}: ${chapter.title}`} aria-current={active === i ? 'step' : undefined} className={active === i ? 'is-active' : ''} onClick={() => go(chapter.id)}><span>{chapter.title}</span></button>)}</aside>
    <footer className="experience-footer"><button className="chapter-index" onClick={() => setMenu(!menu)} aria-expanded={menu}><span className="status-dot" />{String(active + 1).padStart(2, '0')}<i>/ 14</i><span className="chapter-title">{chapters[active]?.title}</span>{menu ? <X size={12} /> : <ArrowDown size={12} />}</button><span className="footer-center">{tour ? 'GUIDED EXPEDITION / SCROLL TO TAKE CONTROL' : 'SCROLL TO EXPLORE THE UNKNOWN'}<span className="scroll-line" /></span><button className="quality-toggle" onClick={() => setLite(!lite)} aria-pressed={lite}><span className="status-dot" />{lite ? 'ECO RENDER' : 'HIGH FIDELITY'}<span className="quality-bars">▂▅▇</span></button></footer>
    <AnimatePresence>{menu && <motion.div className="chapter-menu" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}><p className="eyebrow">EXPEDITION INDEX</p>{chapters.map((chapter, i) => <button key={chapter.id} onClick={() => { go(chapter.id); setMenu(false); }} className={active === i ? 'selected' : ''}><small>{String(i + 1).padStart(2, '0')}</small>{chapter.title}<ArrowUpRight size={13} /></button>)}</motion.div>}</AnimatePresence>
  </>;
}
