import { useEffect, useMemo, useRef } from 'react';
import type { RefObject } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { BufferAttribute, ExtrudeGeometry, Group, InstancedMesh, MeshBasicMaterial, Object3D, Shape } from 'three';
import { icebergData } from '../data/mission';
import type { MotionState, Point } from '../data/mission';
import { iceGeometry, random, windowAt } from './geometry';
import IceMaterial from './IceMaterial';

function Iceberg({ data, motion, labels }: { data: typeof icebergData[number]; motion: RefObject<MotionState>; labels: boolean }) {
  const group = useRef<Group>(null);
  const scanner = useRef<Group>(null);
  const scanMaterial = useRef<MeshBasicMaterial>(null);
  const geometry = useMemo(() => {
    const { geometry, colors } = iceGeometry(data.seed);
    geometry.setAttribute('color', new BufferAttribute(new Float32Array(colors), 3));
    return geometry;
  }, [data.seed]);
  useEffect(() => () => geometry.dispose(), [geometry]);
  useFrame(({ clock }) => {
    const time = motion.current.reduced ? 0 : clock.elapsedTime;
    if (group.current) {
      group.current.position.y = Math.sin(time * .35 + data.seed) * .1;
      group.current.rotation.z = Math.sin(time * .2 + data.seed) * .006;
      group.current.visible = motion.current.controls.icebergs;
    }
    if (scanner.current && scanMaterial.current) {
      const strength = windowAt(motion.current.chapter, 2, 4);
      scanner.current.visible = strength > .01;
      scanner.current.position.y = 1 + (Math.sin(time * .9) * .5 + .5) * data.scale[1];
      scanMaterial.current.opacity = strength * .2;
    }
  });
  return <group position={data.position}><group ref={group}>
    <mesh geometry={geometry} scale={data.scale} castShadow receiveShadow>
      <IceMaterial />
    </mesh>
    <mesh geometry={geometry} scale={[data.scale[0] * 1.2, -data.scale[1] * .8, data.scale[2] * 1.25]} position={[0, -.7, 0]}>
      <meshStandardMaterial color="#1a8893" transparent opacity={.65} roughness={.4} />
    </mesh>
    {data.id === 'IBG-001' && <group ref={scanner}><mesh rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[25, 22]} /><meshBasicMaterial ref={scanMaterial} color="#85ffe9" transparent opacity={.2} depthWrite={false} side={2} /></mesh>
      <mesh><boxGeometry args={[25, .04, 22]} /><meshBasicMaterial color="#8cffe5" wireframe /></mesh>
    </group>}
    {labels && <Html position={[0, data.scale[1] + 2, 0]} center distanceFactor={55} zIndexRange={[5, 0]} style={{ pointerEvents: 'none' }}><div className="object-label"><span>{data.id}</span><small>{data.speed}</small></div></Html>}
  </group></group>;
}

export default function Icebergs({ motion, labels }: { motion: RefObject<MotionState>; labels: boolean }) {
  return <>{icebergData.map(data => <Iceberg key={data.id} data={data} motion={motion} labels={labels} />)}</>;
}

export function SeaIce({ motion, lite }: { motion: RefObject<MotionState>; lite: boolean }) {
  const ref = useRef<InstancedMesh>(null);
  const count = lite ? 45 : 110;
  useEffect(() => {
    if (!ref.current) return;
    const rand = random(934);
    const dummy = new Object3D();
    for (let i = 0; i < count; i++) {
      const x = (rand() - .5) * 180;
      const z = -rand() * 140 + 20;
      dummy.position.set(x, -.1, z);
      dummy.rotation.set(0, rand() * Math.PI, 0);
      const size = .4 + rand() * 2.4;
      dummy.scale.set(size, .1 + rand() * .16, size * .8);
      dummy.updateMatrix(); ref.current.setMatrixAt(i, dummy.matrix);
    }
    ref.current.instanceMatrix.needsUpdate = true;
  }, [count]);
  useFrame(() => { if (ref.current) ref.current.visible = motion.current.controls.seaIce; });
  return <instancedMesh ref={ref} args={[undefined, undefined, count]}><dodecahedronGeometry args={[1, 0]} /><meshStandardMaterial color="#b0d5d5" roughness={.8} /></instancedMesh>;
}

function Mountain({ seed, position, scale }: { seed: number; position: Point; scale: Point }) {
  const geometry = useMemo(() => iceGeometry(seed, true).geometry, [seed]);
  useEffect(() => () => geometry.dispose(), [geometry]);
  return <mesh geometry={geometry} position={position} scale={scale} receiveShadow><meshStandardMaterial color="#8caeaf" flatShading roughness={.92} /></mesh>;
}

export function Antarctica() {
  const continent = useMemo(() => {
    const rand = random(402);
    const shape = new Shape();
    for (let i = 0; i < 60; i++) {
      const angle = i / 60 * Math.PI * 2;
      const radius = .8 + rand() * .2 + Math.sin(angle * 3) * .15;
      const x = Math.cos(angle) * 120 * radius;
      const y = Math.sin(angle) * 70 * radius;
      if (i === 0) shape.moveTo(x, y); else shape.lineTo(x, y);
    }
    shape.closePath();
    const geo = new ExtrudeGeometry(shape, { depth: 2.3, bevelEnabled: true, bevelSize: 1.6, bevelThickness: .6, bevelSegments: 1 });
    geo.rotateX(-Math.PI / 2);
    return geo;
  }, []);
  useEffect(() => () => continent.dispose(), [continent]);
  const mountains = useMemo(() => {
    const rand = random(825);
    return Array.from({ length: 24 }, (_, i) => ({ seed: i * 13 + 5, position: [(i - 12) * 12, -1.5, -88 - rand() * 18] as Point, scale: [12 + rand() * 8, 5 + rand() * 19, 12 + rand() * 15] as Point }));
  }, []);
  return <group><mesh geometry={continent} position={[0, -.8, -132]}><meshStandardMaterial color="#c6dcdb" roughness={1} /></mesh>{mountains.map(item => <Mountain key={item.seed} {...item} />)}</group>;
}
