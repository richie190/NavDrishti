import { Suspense, useEffect, useMemo, useRef } from 'react';
import type { RefObject } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Lightformer, Html } from '@react-three/drei';
import { ACESFilmicToneMapping, Color, DirectionalLight, PerspectiveCamera, Vector3 } from 'three';
import { cameraShots, stations } from '../data/mission';
import type { MotionState } from '../data/mission';
import Ocean from './Ocean';
import Icebergs, { Antarctica, SeaIce } from './Icebergs';
import { Atmosphere, Snow } from './Atmosphere';
import Routes from './Routes';
import { safeRoute } from './Routes';
import Vessel from './Vessel';
import Satellite from './Satellite';
import IntelligenceField from './IntelligenceField';
import { smooth, windowAt } from './geometry';

type Props = { motion: RefObject<MotionState>; lite: boolean; active: number; onReady: () => void; onFailure: () => void; onStation: (id: string) => void };

function Director({ motion, onReady }: { motion: RefObject<MotionState>; onReady: () => void }) {
  const position = useMemo(() => new Vector3(), []);
  const target = useMemo(() => new Vector3(), []);
  const nextPosition = useMemo(() => new Vector3(), []);
  const nextTarget = useMemo(() => new Vector3(), []);
  const up = useMemo(() => new Vector3(0, 1, 0), []);
  const dawnColor = useMemo(() => new Color('#ffb575'), []);
  const dangerColor = useMemo(() => new Color('#272e3a'), []);
  const fogDawn = useMemo(() => new Color('#8b8b7e'), []);
  const look = useRef(new Vector3(...cameraShots[0].target));
  const light = useRef<DirectionalLight>(null);
  const chapter = useRef(0);
  const orbitAngle = useRef(0);
  const zoom = useRef(1);
  useEffect(onReady, [onReady]);
  useFrame(({ camera, clock, scene }, delta) => {
    const state = motion.current;
    chapter.current += (state.chapter - chapter.current) * (1 - Math.exp(-Math.min(delta, .1) * 3.5));
    const c = Math.max(0, Math.min(cameraShots.length - 1, chapter.current));
    const index = Math.floor(c);
    const a = cameraShots[index], b = cameraShots[Math.min(index + 1, cameraShots.length - 1)];
    const blend = smooth(0, 1, c - index);
    position.set(...a.position).lerp(nextPosition.set(...b.position), blend);
    target.set(...a.target).lerp(nextTarget.set(...b.target), blend);
    const time = state.reduced ? 0 : clock.elapsedTime;
    if (!state.reduced) { position.x += Math.sin(time * .11) * .6 + state.pointer.x * .45; position.y += Math.cos(time * .15) * .18 - state.pointer.y * .25; }
    const intro = state.reduced ? 0 : (1 - smooth(.3, 5.5, time)) * (1 - smooth(0, .6, c));
    position.add(nextPosition.set(intro * 32, intro * 70, intro * 30));
    const chase = windowAt(c, 7.9, 8.5);
    if (chase > 0) {
      const vessel = safeRoute.getPointAt(.28 + smooth(7.1, 9, c) * .44);
      position.lerp(nextPosition.copy(vessel).add(nextTarget.set(3, 5, 17)), chase);
      target.lerp(nextPosition.copy(vessel).add(nextTarget.set(0, 1.5, -13)), chase);
    }
    if (index === 9) {
      zoom.current += (state.controls.zoom - zoom.current) * (1 - Math.exp(-delta * 4));
      position.sub(target).multiplyScalar(zoom.current).add(target);
      if (state.controls.orbit && !state.reduced) orbitAngle.current += Math.min(delta, .1) * .18;
      position.sub(target).applyAxisAngle(up, orbitAngle.current).add(target);
      if (state.controls.focus) { const vessel = safeRoute.getPointAt(.72); target.copy(vessel); position.copy(vessel).add(nextPosition.set(8, 10, 15)); }
    }
    camera.position.copy(position);
    look.current.copy(target);
    camera.up.set(Math.sin(c * Math.PI) * (state.reduced ? 0 : .025), 1, 0);
    camera.lookAt(look.current);
    if (camera instanceof PerspectiveCamera) { camera.fov = a.fov + (b.fov - a.fov) * blend + (innerWidth < 760 ? 12 : 0); camera.updateProjectionMatrix(); }
    const danger = windowAt(c, 5, 6.5);
    if (light.current) { light.current.color.set('#d6f8f2').lerp(dawnColor, smooth(12, 13, c)); light.current.intensity = 3.1 - danger * 1.8; }
    if (scene.fog && 'color' in scene.fog) scene.fog.color.set('#41676d').lerp(dangerColor, danger).lerp(fogDawn, smooth(12, 13, c));
  });
  return <directionalLight ref={light} position={[-40, 60, -35]} intensity={3.1} color="#d6f8f2" />;
}

function WorldContents({ motion, lite, active, onReady, onStation }: Omit<Props, 'onFailure'>) {
  return <>
    <fogExp2 attach="fog" args={['#41676d', .0035]} />
    <Director motion={motion} onReady={onReady} />
    <ambientLight intensity={.45} color="#9acbd3" />
    <hemisphereLight args={['#a8e2df', '#183337', 1.8]} />
    <Environment resolution={64} frames={1}><Lightformer form="rect" intensity={3} position={[0, 25, -10]} scale={[70, 30, 1]} rotation-x={Math.PI / 2} /><Lightformer intensity={2} color="#96dbed" position={[35, 5, 0]} scale={[25, 15, 1]} rotation-y={-Math.PI / 2} /></Environment>
    <Atmosphere motion={motion} />
    <Ocean motion={motion} lite={lite} />
    <Antarctica />
    <Icebergs motion={motion} labels={active >= 1 && active <= 4 || active === 9} />
    <SeaIce motion={motion} lite={lite} />
    <Vessel motion={motion} />
    <Satellite motion={motion} />
    <Routes motion={motion} />
    <IntelligenceField motion={motion} labels={active === 4} lite={lite} />
    <Snow motion={motion} lite={lite} />
    {(active === 9 || active === 11) && stations.map(station => <group key={station.id} position={station.position}>
      <mesh><cylinderGeometry args={[.15, .15, 5, 8]} /><meshBasicMaterial color="#b9fbd7" /></mesh>
      <mesh rotation-x={-Math.PI / 2} position={[0, -2, 0]}><ringGeometry args={[1, 1.2, 32]} /><meshBasicMaterial color="#b9fbd7" /></mesh>
      <Html position={[0, 5, 0]} center zIndexRange={[6, 0]}><button className="station-marker" onClick={() => onStation(station.id)}>{station.name.toUpperCase()} <span>↗</span></button></Html>
    </group>)}
  </>;
}

export default function World(props: Props) {
  const { lite, onFailure } = props;
  return <Canvas className="world-canvas" dpr={lite ? 1 : [1, 1.6]} camera={{ position: cameraShots[0].position, fov: 47, near: .2, far: 1000 }} gl={{ antialias: !lite, alpha: false, powerPreference: lite ? 'low-power' : 'high-performance' }}
    onCreated={({ gl }) => { gl.toneMapping = ACESFilmicToneMapping; gl.toneMappingExposure = 1.15; gl.domElement.addEventListener('webglcontextlost', onFailure, { once: true }); }}>
    <Suspense fallback={null}><WorldContents {...props} /></Suspense>
  </Canvas>;
}
