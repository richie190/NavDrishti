import { useRef } from 'react';
import type { RefObject } from 'react';
import { useFrame } from '@react-three/fiber';
import { Group, Mesh, MeshBasicMaterial } from 'three';
import type { MotionState } from '../data/mission';
import { windowAt } from './geometry';

export default function Satellite({ motion }: { motion: RefObject<MotionState> }) {
  const satellite = useRef<Group>(null);
  const beam = useRef<Mesh>(null);
  useFrame(({ clock }) => {
    const t = motion.current.reduced ? 0 : clock.elapsedTime;
    const show = windowAt(motion.current.chapter, 2.7, 3.8) + windowAt(motion.current.chapter, 8.8, 10.2);
    if (satellite.current) { satellite.current.visible = show > .01; satellite.current.position.set(10 + Math.sin(t * .07) * 4, 35, -9); satellite.current.rotation.y = t * .08; }
    if (beam.current) { beam.current.visible = show > .01; (beam.current.material as MeshBasicMaterial).opacity = show * (.04 + Math.sin(t * 2) * .012); }
  });
  return <group>
    <group ref={satellite} position={[10, 35, -9]} rotation={[.1, 0, .1]}>
      <mesh><boxGeometry args={[1.5, 1.9, 1.5]} /><meshStandardMaterial color="#cdb779" metalness={.75} roughness={.3} /></mesh>
      {[-1, 1].map(side => <group key={side} position={[side * 3.5, 0, 0]}><mesh><boxGeometry args={[4.6, .09, 2.7]} /><meshStandardMaterial color="#153951" metalness={.65} roughness={.3} /></mesh>{Array.from({ length: 7 }, (_, i) => <mesh key={i} position={[-2.1 + i * .7, .055, 0]}><boxGeometry args={[.018, .01, 2.7]} /><meshBasicMaterial color="#6b9bad" /></mesh>)}</group>)}
      <mesh position={[0, -1.2, 0]} rotation={[Math.PI, 0, 0]}><coneGeometry args={[1.1, .6, 20, 1, true]} /><meshStandardMaterial color="#d3ddda" side={2} metalness={.5} roughness={.3} /></mesh>
    </group>
    <mesh ref={beam} position={[10, 18, -9]}><coneGeometry args={[12, 32, 40, 1, true]} /><meshBasicMaterial color="#8de9d2" transparent opacity={.05} depthWrite={false} side={2} /></mesh>
  </group>;
}
