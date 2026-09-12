import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, Radio, X } from 'lucide-react';
import NavigationMap from './NavigationMap';

export default function CommandCenter({ open, onClose, simulate }: { open: boolean; onClose: () => void; simulate: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [selected, setSelected] = useState('IBG-001');
  const [alternate, setAlternate] = useState(false);
  useEffect(() => {
    if (open) dialog.current?.showModal();
    else dialog.current?.close();
  }, [open]);
  return <dialog ref={dialog} className="command-dialog" onClose={onClose} onClick={event => { if (event.target === dialog.current) onClose(); }} aria-labelledby="command-title" data-lenis-prevent>
    <div className="command-content"><div className="command-heading"><div><p className="eyebrow"><Radio size={12} /> POLARIS / MISSION CONTROL</p><h2 id="command-title">The whole picture.</h2></div><button className="icon-button" onClick={onClose} aria-label="Close command center"><X size={22} /></button></div>
      <div className="command-stats">{[['SEA ICE', '32%', 'Moderate'], ['NEARBY ICEBERGS', '12', 'Tracked'], ['ROUTE SAFETY', alternate ? '0.64' : '0.78', alternate ? 'Moderate' : 'Good'], ['FUEL SAVING', alternate ? '11%' : '18%', 'Estimated']].map(([label, value, status]) => <div key={label}><span className="eyebrow">{label}</span><strong>{value}</strong><small>{status}</small></div>)}</div>
      <div className="command-grid"><NavigationMap selected={selected} onSelect={setSelected} alternate={alternate} /><aside><p className="eyebrow">OBJECT INSPECTOR</p><h3>{selected}</h3><div className="inspector-rows"><span>Classification<b>{selected === 'IBG-001' ? 'Tabular' : 'Irregular'}</b></span><span>Confidence<b>{selected === 'IBG-001' ? '94' : '89'}%</b></span><span>Drift speed<b>{selected === 'IBG-001' ? '0.8' : '1.2'} KT</b></span><span>Direction<b>NE</b></span></div><p className="eyebrow">ROUTE COMPARISON</p><button className={`route-option ${!alternate ? 'selected' : ''}`} onClick={() => setAlternate(false)}><span className="status-dot" />Western passage<small>RECOMMENDED</small></button><button className={`route-option ${alternate ? 'selected' : ''}`} onClick={() => setAlternate(true)}><span className="status-dot warning" />Eastern passage<small>ALTERNATE</small></button><button className="primary-button" onClick={simulate}>Test a scenario<ArrowUpRight size={17} /></button></aside></div>
      <p className="prototype-note">Interactive prototype. All observations, risk estimates, routes, and environmental readings are simulated. Not for operational navigation.</p>
    </div>
  </dialog>;
}
