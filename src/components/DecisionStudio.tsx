import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, Check, Compass, Radio, ShieldCheck, Wifi, WifiOff, X } from 'lucide-react';
import NavigationMap from './NavigationMap';
import { routeChoices } from '../data/project';
import type { RouteChoice } from '../data/project';

export default function DecisionStudio({
  open,
  onClose,
  simulate,
  onOpenMissionCenter,
}: {
  open: boolean;
  onClose: () => void;
  simulate: () => void;
  onOpenMissionCenter?: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [selected, setSelected] = useState('IBG-001');
  const [route, setRoute] = useState<RouteChoice>('safest');
  const [hours, setHours] = useState(0);
  const [age, setAge] = useState(3);
  const [offline, setOffline] = useState(false);
  const [iceClass, setIceClass] = useState('PC6');
  const [approved, setApproved] = useState(false);
  const [question, setQuestion] = useState('route');

  const choice = routeChoices.find(item => item.id === route)!;
  const rio = Number(choice.rio) - (iceClass === 'PC5' ? 0 : iceClass === 'PC6' ? 3 : 8);
  const confidence = Math.max(35, 94 - age * 1.1 - hours * 0.45);

  useEffect(() => {
    if (open) dialog.current?.showModal();
    else dialog.current?.close();
  }, [open]);

  useEffect(() => {
    setApproved(false);
  }, [route, iceClass, age, hours, offline]);

  return (
    <dialog
      ref={dialog}
      className="command-dialog decision-studio"
      onClose={onClose}
      onClick={event => {
        if (event.target === dialog.current) onClose();
      }}
      aria-labelledby="command-title"
      data-lenis-prevent
    >
      <div className="command-content">
        <div className="command-heading">
          <div>
            <p className="eyebrow">
              <Radio size={12} /> NAVDHRISHTI / DECISION STUDIO
            </p>
            <h2 id="command-title">Intelligence. With accountability.</h2>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {onOpenMissionCenter && (
              <button
                type="button"
                className="text-button"
                style={{
                  margin: 0,
                  padding: '6px 12px',
                  fontSize: '9px',
                  letterSpacing: '0.08em',
                  fontFamily: 'var(--mono)',
                  border: '1px solid #729bcc55',
                  background: '#0a2640',
                }}
                onClick={() => {
                  onClose();
                  onOpenMissionCenter();
                }}
              >
                <Compass size={13} />
                FULL MISSION DECK ↗
              </button>
            )}
            <button className="icon-button" onClick={onClose} aria-label="Close command center">
              <X size={22} />
            </button>
          </div>
        </div>

        <div className="decision-toolbar">
          <label>
            VESSEL ICE CLASS
            <select value={iceClass} onChange={e => setIceClass(e.target.value)} aria-label="Vessel ice class">
              <option>PC5</option>
              <option>PC6</option>
              <option>PC7</option>
            </select>
          </label>
          <button
            onClick={() => {
              setOffline(!offline);
              if (!offline) setAge(9);
            }}
            aria-pressed={offline}
          >
            {offline ? <WifiOff size={14} /> : <Wifi size={14} />}
            {offline ? 'Cached-data demo' : 'Connected demo'}
          </button>
          <span className="monitoring-loop">
            <Radio size={12} /> AIS PROXIMITY CHECKS <i /> 12h ROUTE REVIEW
          </span>
        </div>

        <div className="command-stats">
          {[
            ['DEMO RIO', (rio >= 0 ? '+' : '') + rio, rio >= 0 ? 'Within demo threshold' : 'Excluded by demo rule'],
            ['OBSERVATION AGE', age + 'h', offline ? 'Cached scenario' : 'Demonstration timestamp'],
            ['FORECAST CONFIDENCE', Math.round(confidence) + '%', 'Illustrative uncertainty'],
            ['SELECTED ETA', choice.hours, choice.name],
          ].map(([label, value, status]) => (
            <div key={label}>
              <span className="eyebrow">{label}</span>
              <strong>{value}</strong>
              <small>{status}</small>
            </div>
          ))}
        </div>

        <div className="command-grid">
          <div className="decision-map-column">
            <NavigationMap
              selected={selected}
              onSelect={setSelected}
              route={route}
              forecastHours={hours}
              dataAge={age}
              progress={0.12 + hours / 40}
            />
            <div className="timeline-controls">
              <label htmlFor="forecast-time">
                FORECAST HORIZON <strong>+{hours} HOURS</strong>
              </label>
              <input
                id="forecast-time"
                aria-label="Forecast horizon"
                type="range"
                min="0"
                max="24"
                step="6"
                value={hours}
                onChange={e => setHours(Number(e.target.value))}
              />
              <div className="timeline-ticks">
                <span>NOW</span>
                <span>+6h</span>
                <span>+12h</span>
                <span>+18h</span>
                <span>+24h</span>
              </div>
            </div>

            <div className="freshness-control">
              <label htmlFor="data-age">
                OBSERVATION AGE <strong>{age} HOURS</strong>
              </label>
              <input
                id="data-age"
                aria-label="Observation age"
                type="range"
                min="0"
                max="48"
                step="1"
                value={age}
                onChange={e => setAge(Number(e.target.value))}
              />
              <p>
                Older observations widen the uncertainty corridor. The demo keeps working from its preset data; no live sync
                is being performed.
              </p>
            </div>

            <div className="decision-explainer">
              <div role="group" aria-label="Decision explanation">
                <button className={question === 'route' ? 'selected' : ''} onClick={() => setQuestion('route')}>
                  Why this route?
                </button>
                <button className={question === 'age' ? 'selected' : ''} onClick={() => setQuestion('age')}>
                  Why data age matters
                </button>
              </div>
              <p>
                {question === 'route'
                  ? choice.description
                  : 'The most recent observation is not the present position. Uncertainty grows with elapsed time, so older data should prompt more conservative review.'}
              </p>
            </div>
          </div>

          <aside>
            <p className="eyebrow">OBJECT INSPECTOR / DEMO</p>
            <h3>{selected}</h3>
            <div className="inspector-rows">
              <span>
                Classification<b>{selected === 'IBG-001' ? 'Tabular' : 'Irregular'}</b>
              </span>
              <span>
                Drift speed<b>{selected === 'IBG-001' ? '0.8' : '1.2'} KT</b>
              </span>
              <span>
                Minimum separation<b>{choice.separation}</b>
              </span>
            </div>

            <p className="eyebrow">COMPARE THREE PASSAGES</p>
            {routeChoices.map(item => (
              <button
                key={item.id}
                className={'route-option ' + (route === item.id ? 'selected' : '')}
                aria-pressed={route === item.id}
                onClick={() => setRoute(item.id)}
              >
                <span className="status-dot" style={{ background: item.color }} />
                <b>{item.name}</b>
                <small>
                  {item.passage} / {item.hours}
                </small>
              </button>
            ))}

            <div className="approval-gate">
              <p className="eyebrow">
                <ShieldCheck size={13} /> OFFICER SIGN-OFF
              </p>
              <p>
                {rio < 0
                  ? 'This option falls below the configured demonstration threshold. Choose another route or vessel profile.'
                  : approved
                  ? 'Review recorded for this demonstration configuration.'
                  : 'Review the evidence before accepting a recommendation.'}
              </p>
              <button
                className="primary-button"
                disabled={rio < 0 || approved}
                onClick={() => setApproved(true)}
              >
                {approved ? 'Review recorded' : 'Approve demo route'}
                <Check size={15} />
              </button>
              <span role="status">
                {approved ? 'DEMO APPROVED / NO VESSEL COMMAND SENT' : 'AWAITING REVIEW'}
              </span>
            </div>

            <button className="text-button" onClick={simulate}>
              Test a scenario
              <ArrowUpRight size={17} />
            </button>
          </aside>
        </div>

        <p className="prototype-note">
          All routes, RIO values, conditions, time changes and scores are illustrative presets, not an operational POLARIS
          calculation. Approval records this demo state only. Live AIS, satellite delta-sync and production routing are
          proposed integrations.
        </p>
      </div>
    </dialog>
  );
}
