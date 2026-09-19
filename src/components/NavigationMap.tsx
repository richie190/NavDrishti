import { useId, useLayoutEffect, useRef, useState } from 'react';
import type { RouteChoice } from '../data/project';

export default function NavigationMap({
  progress = 0.13,
  alternate = false,
  selected = 'IBG-001',
  onSelect,
  storm = false,
  route,
  forecastHours = 0,
  dataAge = 0,
}: {
  progress?: number;
  alternate?: boolean;
  selected?: string;
  onSelect?: (id: string) => void;
  storm?: boolean;
  route?: RouteChoice;
  forecastHours?: number;
  dataAge?: number;
}) {
  const id = useId().replaceAll(':', '');
  const mode = route ?? (alternate ? 'fastest' : 'safest');
  const vesselPath = useRef<SVGPathElement>(null);
  const [vessel, setVessel] = useState({ x: 302, y: 380 });

  const routes = {
    safest: 'M302 380C268 313 184 300 205 219S280 158 344 119',
    fastest: 'M302 380C438 351 475 286 438 216S393 145 344 119',
    efficient: 'M302 380C205 351 119 281 158 210S265 133 344 119',
  };

  useLayoutEffect(() => {
    const path = vesselPath.current;
    if (path) {
      const p = path.getPointAtLength(path.getTotalLength() * Math.max(0, Math.min(1, progress)));
      setVessel({ x: p.x, y: p.y });
    }
  }, [progress, mode]);

  return (
    <div
      className="navigation-map"
      style={{
        width: '100%',
        height: 'auto',
        display: 'block',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <svg
        viewBox="0 0 600 410"
        role="img"
        aria-label="Illustrative Antarctic navigation map with vessel, iceberg field, and recommended route"
        style={{
          width: '100%',
          height: 'auto',
          display: 'block',
          borderRadius: '6px',
        }}
      >
        <defs>
          <pattern id={`grid${id}`} width="30" height="30" patternUnits="userSpaceOnUse">
            <path d="M30 0H0V30" fill="none" stroke="#a7d8df" strokeWidth=".4" opacity=".16" />
          </pattern>
          <radialGradient id={`risk${id}`}>
            <stop stopColor="#ef735d" stopOpacity=".24" />
            <stop offset="1" stopColor="#ef735d" stopOpacity="0" />
          </radialGradient>
        </defs>

        <rect width="600" height="410" fill="#06182a" />
        <rect width="600" height="410" fill={`url(#grid${id})`} />

        <path
          d="M0 0h600v52l-27 8-24-16-26 36-36-12-32 28-40-9-20 30-40-17-32 16-22-32-31 2-33-27-39 9-38-21-35 4-35-24-25 17L0 44Z"
          fill="#5c8389"
          opacity=".4"
          stroke="#b0d1d2"
          strokeWidth=".8"
        />

        <text x="222" y="38" fill="#4b6d70" fontSize="9" letterSpacing="5">
          ANTARCTICA
        </text>

        <ellipse cx="353" cy="231" rx={storm ? 120 : 85} ry="83" fill={`url(#risk${id})`} />
        <circle cx="353" cy="231" r="61" fill="none" stroke="#d57864" strokeDasharray="3 7" opacity=".4" />

        <path d="M302 380Q344 284 353 230T344 119" fill="none" stroke="#ec8b79" strokeDasharray="4 6" opacity=".7" />

        {Object.entries(routes).map(([key, d]) => (
          <path
            key={key}
            d={d}
            fill="none"
            stroke={key === 'safest' ? '#91e9b9' : key === 'fastest' ? '#f0c772' : '#80c6ff'}
            strokeWidth={mode === key ? 2.5 : 1}
            strokeDasharray={mode === key ? undefined : '4 6'}
            opacity={mode === key ? 1 : 0.35}
          />
        ))}

        <path ref={vesselPath} d={routes[mode as keyof typeof routes]} fill="none" stroke="none" />

        <path
          d="M442 172Q396 206 350 233T266 282"
          fill="none"
          stroke="#e6bc68"
          strokeWidth={8 + forecastHours * 0.5 + dataAge * 0.35}
          opacity=".08"
        />
        <path d="M442 172Q396 206 350 233T266 282" fill="none" stroke="#e6bc68" strokeDasharray="2 5" strokeWidth="1.5" />

        {[
          { id: 'IBG-001', x: 350, y: 230 },
          { id: 'IBG-002', x: 165, y: 175 },
          { id: 'IBG-003', x: 453, y: 135 },
          { id: 'IBG-004', x: 112, y: 309 },
        ].map(ice => (
          <g
            key={ice.id}
            transform={`translate(${-forecastHours * 0.7},${forecastHours * 0.32})`}
            onClick={() => onSelect?.(ice.id)}
            role={onSelect ? 'button' : undefined}
            tabIndex={onSelect ? 0 : undefined}
            aria-label={`Select ${ice.id}`}
            onKeyDown={event => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                onSelect?.(ice.id);
              }
            }}
            className={onSelect ? 'map-object' : ''}
            style={{ cursor: onSelect ? 'pointer' : 'default' }}
          >
            <circle cx={ice.x} cy={ice.y} r="20" fill="transparent" />
            <path
              d={`M${ice.x - 8} ${ice.y + 6}l3-15 12 3 6 10-12 5Z`}
              fill={selected === ice.id ? '#588a7e' : '#3a6167'}
            />
            {selected === ice.id && (
              <circle cx={ice.x} cy={ice.y} r="16" fill="none" stroke="#588a7e" strokeWidth=".8" className="map-ping" />
            )}
            <text x={ice.x + 20} y={ice.y + 3} fill="#46666b" fontSize="8" letterSpacing="1">
              {ice.id}
            </text>
          </g>
        ))}

        <g transform={`translate(${vessel.x},${vessel.y})`}>
          <circle r="15" fill="#a7efd6" opacity=".15" />
          <path d="m0-8 5 15-5-3-5 3Z" fill="#d4f5ff" />
          <text x="15" y="3" fill="#b5d9e9" fontSize="8" letterSpacing="1">
            RV POLARIS
          </text>
        </g>

        <circle cx="344" cy="119" r="3" fill="#468a70" />
        <text x="356" y="115" fill="#468a70" fontSize="8" letterSpacing="1">
          BHARATI
        </text>

        <text x="25" y="382" fill="#3b5960" fontSize="8" letterSpacing="1">
          ILLUSTRATIVE / NOT FOR NAVIGATION
        </text>

        <path d="M540 360h35m-35-4v8m35-8v8" stroke="#84a5a9" />
        <text x="541" y="378" fill="#3e5d63" fontSize="8">
          25 NM
        </text>

        <text x="557" y="100" fill="#4c6e6b" fontSize="9">
          N
        </text>
        <path d="m560 108-4 14 4-3 4 3Z" fill="#4c6e6b" />
      </svg>

      <div className="map-legend">
        <span>
          <i className="safe" />
          Recommended
        </span>
        <span>
          <i className="warn" />
          Predicted drift
        </span>
        <span>
          <i className="danger" />
          Route conflict
        </span>
      </div>
    </div>
  );
}