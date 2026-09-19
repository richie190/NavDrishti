import { useState } from 'react';
import { ArrowDown, ArrowUpRight, Check, Database, ShieldCheck, WifiOff } from 'lucide-react';
import { architecture, futureScope, sourceLayers } from '../data/project';

export default function SystemBlueprint() {
  const [step, setStep] = useState(0);
  return <div className="system-blueprint">
    <div className="blueprint-heading" data-reveal><p className="eyebrow">THE NAVDHRISHTI BLUEPRINT</p><h3>Every signal.<br /><em>A reason to act.</em></h3><p>A proposed architecture for Antarctic research and resupply voyages, from Cape Town to Bharati and Maitri.</p></div>
    <div className="architecture-explorer" data-reveal>
      <div className="architecture-tabs" role="tablist" aria-label="System architecture">{architecture.map((item, i) => <button key={item.id} role="tab" id={`step-${item.id}`} aria-selected={i === step} aria-controls="architecture-detail" onClick={() => setStep(i)}><span>0{i + 1}</span>{item.name}<ArrowUpRight size={14} /></button>)}</div>
      <div id="architecture-detail" role="tabpanel" aria-labelledby={`step-${architecture[step].id}`} className="architecture-detail"><span className="architecture-number" aria-hidden="true">0{step + 1}</span><p className="eyebrow">{architecture[step].code}</p><h4>{architecture[step].name}</h4><p>{architecture[step].detail}</p><div className="architecture-flow"><span>OBSERVE</span><ArrowDown size={12} /><span>ASSESS</span><ArrowDown size={12} /><span>EXPLAIN</span><ArrowDown size={12} /><span>APPROVE</span></div></div>
    </div>
    <div className="blueprint-principles" data-reveal><div><WifiOff size={19} /><h4>Beyond the signal.</h4><p>Planned onboard caching keeps risk checks close to the vessel. Display data age, reduce confidence as observations age, and sync changes during satellite windows.</p></div><div><ShieldCheck size={19} /><h4>People remain in command.</h4><p>A recommendation is not an order. The officer compares the safest, fastest, and fuel-efficient options before sign-off.</p></div><div><Database size={19} /><h4>Keep the evidence visible.</h4><p>Ice type is different from total ice coverage. Source conflicts, timestamps and vessel capabilities belong beside every recommendation.</p></div></div>
    <div className="source-heading" data-reveal><p className="eyebrow">PROPOSED DATA INTEGRATIONS</p><span>NO LIVE FEEDS CONNECTED IN THIS DEMO</span></div><div className="source-grid">{sourceLayers.map(source => <div key={source.name} data-reveal><p className="eyebrow">{source.name}</p><h4>{source.use}</h4><p>{source.note}</p></div>)}</div>
    <p className="regulation-note" data-reveal>POLARIS is an ice-operability assessment methodology described in <a href="https://www.imo.org/en/mediacentre/pages/whatsnew-1566.aspx" target="_blank" rel="noreferrer">IMO guidance (MSC.1/Circ.1519)</a>. This prototype does not certify compliance or replace vessel-specific operating limits and officer judgment.</p>
    <div className="future-scope" data-reveal><div><p className="eyebrow">BEYOND THE PROTOTYPE</p><h4>The next horizon.</h4></div><div>{futureScope.map(item => <span key={item}><Check size={12} />{item}</span>)}</div></div>
  </div>;
}