import { useEffect, useMemo, useRef } from 'react';
import type { RefObject } from 'react';
import { useFrame } from '@react-three/fiber';
import { BoxGeometry, Group, Shape, ExtrudeGeometry, Vector3 } from 'three';
import type { MotionState } from '../data/mission';
import { originalRoute, safeRoute, moderateRoute } from './Routes';
import { smooth } from './geometry';

function Box({ position, scale, color, glow = false }: { position: [number, number, number]; scale: [number, number, number]; color: string; glow?: boolean }) {
  return <mesh position={position} scale={scale} castShadow><boxGeometry /><meshStandardMaterial color={color} roughness={.5} emissive={glow ? color : '#000000'} emissiveIntensity={glow ? 1.2 : 0} /></mesh>;
}

export default function Vessel({ motion }: { motion: RefObject<MotionState> }) {
  const ref = useRef<Group>(null);
  const wake = useRef<Group>(null);
  const heading = useRef(Math.PI);
  const hull = useMemo(() => {
    const shape = new Shape();
    shape.moveTo(-1.35, -3.5); shape.lineTo(1.35, -3.5); shape.lineTo(1.55, 1.6); shape.quadraticCurveTo(1.4, 3.4, 0, 4.4); shape.quadraticCurveTo(-1.4, 3.4, -1.55, 1.6); shape.closePath();
    const geometry = new ExtrudeGeometry(shape, { depth: 1.1, bevelEnabled: true, bevelSegments: 1, steps: 1, bevelSize: .17, bevelThickness: .15 });
    geometry.rotateX(-Math.PI / 2);
    return geometry;
  }, []);
  const rails = useMemo(() => new BoxGeometry(.045, .045, 6), []);
  useEffect(() => () => { hull.dispose(); rails.dispose(); }, [hull, rails]);
  const target = useMemo(() => new Vector3(), []);
  useFrame(({ clock }, delta) => {
    if (!ref.current) return;
    const c = motion.current.chapter;
    const time = motion.current.reduced ? 0 : clock.elapsedTime;
    const changing = smooth(6.7, 7.65, c);
    let travel = .12 + smooth(0, 5, c) * .16 + smooth(7.1, 9, c) * .44;
    let route = safeRoute;
    if (c >= 11.6 && c < 12.9) {
      travel = .06 + motion.current.simulation * .86;
      route = motion.current.scenario === 'storm' ? moderateRoute : safeRoute;
      target.copy(route.getPointAt(travel));
    } else {
      target.copy(originalRoute.getPointAt(travel)).lerp(safeRoute.getPointAt(travel), changing);
    }
    ref.current.position.copy(target);
    ref.current.position.y += Math.sin(time * 1.1) * .065;
    const direction = route.getTangentAt(travel);
    if (c < 11.6) direction.copy(originalRoute.getTangentAt(travel)).lerp(safeRoute.getTangentAt(travel), changing);
    const angle = Math.atan2(-direction.x, -direction.z);
    const difference = Math.atan2(Math.sin(angle - heading.current), Math.cos(angle - heading.current));
    heading.current += difference * (1 - Math.exp(-delta * 3));
    ref.current.rotation.set(Math.sin(time * .65) * .008, heading.current, Math.sin(time * .9) * .012);
    if (wake.current) wake.current.scale.set(1 + Math.sin(time * 1.5) * .07, 1, 1 + Math.sin(time) * .12);
  });
  return <group ref={ref} scale={.8}>
    <mesh geometry={hull} position={[0, -.36, 0]} castShadow><meshStandardMaterial color="#ad4931" metalness={.25} roughness={.45} /></mesh>
    <mesh geometry={hull} position={[0, .46, 0]} scale={[1.015, .28, 1.01]}><meshStandardMaterial color="#e8e6d9" roughness={.55} /></mesh>
    <Box position={[0, 1.3, .3]} scale={[2.4, .7, 3.2]} color="#f1f1e6" />
    <Box position={[0, 1.9, -.45]} scale={[2.1, .7, 1.9]} color="#e1e9e4" />
    <Box position={[0, 2.35, -.65]} scale={[2.4, .24, 1.6]} color="#f1f1e6" />
    <Box position={[0, 1.96, -1.42]} scale={[1.85, .28, .035]} color="#79cbd4" glow />
    <Box position={[1.06, 1.96, -.65]} scale={[.035, .28, 1.3]} color="#427a89" />
    <Box position={[-1.06, 1.96, -.65]} scale={[.035, .28, 1.3]} color="#427a89" />
    <Box position={[0, 2, 1.35]} scale={[.7, 1.2, .65]} color="#d77b37" />
    <Box position={[0, 2.65, 1.35]} scale={[.75, .18, .7]} color="#1a2930" />
    <Box position={[.1, 3.1, -.7]} scale={[.07, 1.5, .07]} color="#e2e7dd" />
    <Box position={[.1, 3.6, -.7]} scale={[1.3, .07, .08]} color="#cfdcd8" />
    <Box position={[-1.23, 2.25, -.6]} scale={[.1, .1, .1]} color="#ff473b" glow />
    <Box position={[1.23, 2.25, -.6]} scale={[.1, .1, .1]} color="#62f7a9" glow />
    <mesh position={[.1, 3.9, -.7]}><sphereGeometry args={[.12, 8, 8]} /><meshBasicMaterial color="#e6eacb" /></mesh>
    {[-1.28, 1.28].map(x => <group key={x}><mesh geometry={rails} position={[x, 1.3, 0]}><meshStandardMaterial color="#e8eade" /></mesh>{[-2.7, -1.6, 0, 1.7, 2.6].map(z => <Box key={z} position={[x, 1.13, z]} scale={[.04, .35, .04]} color="#e8eade" />)}</group>)}
    <Box position={[0, 1.05, 2.8]} scale={[1.6, .5, .8]} color="#b0bdba" />
    <group ref={wake} position={[0, -.22, 6]}>
      {[0, 1, 2, 3].map(i => <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[0, -.012 * i, i * 1.8]}><ringGeometry args={[.8 + i * .6, 1.02 + i * .67, 40, 1, .12, Math.PI - .24]} /><meshBasicMaterial color="#b6f8ed" transparent opacity={.24 - i * .045} depthWrite={false} side={2} /></mesh>)}
    </group>
  </group>;
}
