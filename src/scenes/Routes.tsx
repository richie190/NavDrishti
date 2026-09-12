import { useEffect, useMemo, useRef } from 'react';
import type { RefObject } from 'react';
import { useFrame } from '@react-three/fiber';
import { CatmullRomCurve3, Group, InstancedMesh, Mesh, MeshBasicMaterial, Object3D, TubeGeometry, Vector3 } from 'three';
import type { MotionState, Point } from '../data/mission';
import { smooth, windowAt } from './geometry';

const curve = (points: Point[]) => new CatmullRomCurve3(points.map(p => new Vector3(...p)));
export const originalRoute = curve([[-10, .4, 23], [-6, .4, 9], [0, .4, -4], [5, .4, -22], [0, .4, -48]]);
export const safeRoute = curve([[-10, .4, 23], [-18, .4, 9], [-32, .4, -5], [-33, .4, -23], [-18, .4, -38], [0, .4, -48]]);
export const moderateRoute = curve([[-10, .4, 23], [7, .4, 10], [28, .4, -3], [32, .4, -25], [0, .4, -48]]);
export const prediction = curve([[23, .5, -22], [15, .5, -15], [9, .5, -9], [0, .5, -4], [-12, .5, 1]]);
const history = curve([[36, .5, -43], [29, .5, -32], [23, .5, -22]]);

function RouteLine({ path, color, radius, visible, progress = 1, opacity = 1 }: { path: CatmullRomCurve3; color: string; radius: number; visible: boolean; progress?: number; opacity?: number }) {
  const geo = useMemo(() => new TubeGeometry(path, 160, radius, 5, false), [path, radius]);
  useEffect(() => () => geo.dispose(), [geo]);
  useEffect(() => { geo.setDrawRange(0, Math.floor(progress * 160) * 30); }, [geo, progress]);
  return <mesh geometry={geo} visible={visible}><meshBasicMaterial color={color} transparent opacity={opacity} depthWrite={false} toneMapped={false} /></mesh>;
}

export default function Routes({ motion }: { motion: RefObject<MotionState> }) {
  const group = useRef<Group>(null);
  const danger = useRef<Mesh>(null);
  const recommended = useRef<Group>(null);
  const unsafe = useRef<Group>(null);
  const alternate = useRef<Group>(null);
  const forecast = useRef<Group>(null);
  const particles = useRef<InstancedMesh>(null);
  const dummy = useMemo(() => new Object3D(), []);
  useFrame(({ clock }) => {
    const c = motion.current.chapter;
    const time = motion.current.reduced ? 0 : clock.elapsedTime;
    if (group.current) group.current.visible = motion.current.controls.routes;
    if (recommended.current) {
      recommended.current.visible = c > 5.7;
      const draw = smooth(6, 7.3, c);
      recommended.current.children.forEach(child => { if (child instanceof Mesh) child.geometry.setDrawRange(0, Math.floor(draw * 160) * 30); });
    }
    if (unsafe.current) unsafe.current.visible = c > 4.2 && c < 7.6;
    if (alternate.current) alternate.current.visible = c > 5.8 && c < 7.1;
    if (forecast.current) {
      forecast.current.visible = c > 3.5 && c < 8.8;
      forecast.current.children.forEach(child => { if (child instanceof Mesh) child.geometry.setDrawRange(0, Math.floor(smooth(3.5, 4.7, c) * 160) * 30); });
    }
    if (danger.current) {
      danger.current.visible = c > 4.6 && c < 7.2;
      const pulse = 1 + Math.sin(time * 1.5) * .06;
      danger.current.scale.setScalar(pulse);
      (danger.current.material as MeshBasicMaterial).opacity = windowAt(c, 5, 6.7) * .24;
    }
    if (particles.current) {
      particles.current.visible = c > 6.4;
      for (let i = 0; i < 24; i++) {
        const p = safeRoute.getPointAt((time * .04 + i / 24) % 1);
        dummy.position.copy(p); dummy.position.y += .12; dummy.scale.setScalar(i % 4 === 0 ? .2 : .09);
        dummy.updateMatrix(); particles.current.setMatrixAt(i, dummy.matrix);
      }
      particles.current.instanceMatrix.needsUpdate = true;
    }
  });
  return <group ref={group}>
    <group ref={recommended}><RouteLine path={safeRoute} color="#75edac" radius={.075} visible /><RouteLine path={safeRoute} color="#48dba3" radius={.32} opacity={.12} visible /></group>
    <group ref={unsafe}><RouteLine path={originalRoute} color="#f37162" radius={.09} visible /></group>
    <group ref={alternate}><RouteLine path={moderateRoute} color="#e6bf67" radius={.055} visible /></group>
    <group ref={forecast}><RouteLine path={prediction} color="#efc676" radius={.08} visible /><RouteLine path={prediction} color="#eec87b" radius={1.1} opacity={.065} visible /><RouteLine path={history} color="#dae8e9" radius={.045} visible /></group>
    <mesh ref={danger} rotation={[-Math.PI / 2, 0, 0]} position={[0, .45, -4]}><ringGeometry args={[3.5, 8, 80]} /><meshBasicMaterial color="#ff564c" transparent opacity={.2} depthWrite={false} /></mesh>
    <instancedMesh ref={particles} args={[undefined, undefined, 24]}><sphereGeometry args={[1, 6, 6]} /><meshBasicMaterial color="#c8ffe6" toneMapped={false} /></instancedMesh>
  </group>;
}
