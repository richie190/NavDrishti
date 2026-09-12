import { ArrowUpRight, Radio } from 'lucide-react';
import NavigationMap from './NavigationMap';

export default function CommandReveal({ open }: { open: () => void }) {
  return <div className="command-reveal">
    <div className="command-reveal-copy" data-reveal><p className="eyebrow">FROM INTELLIGENCE TO ACTION</p><h3>Your expedition.<br /><em>Understood.</em></h3><p>The environment is complex.<br />Your next decision shouldn’t be.</p><button className="text-button" onClick={open}>Enter command center<ArrowUpRight size={17} /></button></div>
    <div className="command-preview-stage"><button className="command-preview" onClick={open} aria-label="Open the interactive command center"><div className="preview-header"><span><Radio size={12} /> NAVDRISHTI / COMMAND</span><span className="preview-badge">SIMULATION</span></div><div className="preview-stats">{[['SEA ICE', '32%'], ['ICEBERGS', '12'], ['ROUTE SAFETY', '0.78'], ['FUEL SAVING', '18%']].map(([label, value]) => <div key={label}><small>{label}</small><strong>{value}</strong></div>)}</div><NavigationMap /><div className="preview-footer"><span className="status-dot" />RV POLARIS / WESTERN PASSAGE<span>OPEN LIVE DEMO ↗</span></div></button></div>
  </div>;
}
