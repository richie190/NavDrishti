import { useMemo, useRef } from 'react';
import type { RefObject } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { Group, InstancedMesh, Object3D, ShaderMaterial } from 'three';
import type { MotionState } from '../data/mission';
import { random, windowAt } from './geometry';

export default function IntelligenceField({ motion, labels, lite }: { motion: RefObject<MotionState>; labels: boolean; lite: boolean }) {
  const grid = useRef<Group>(null);
  const material = useRef<ShaderMaterial>(null);
  const flow = useRef<InstancedMesh>(null);
  const dummy = useMemo(() => new Object3D(), []);
  const count = lite ? 45 : 130;
  const seeds = useMemo(() => {
    const rand = random(275);
    return Array.from({ length: count }, () => [rand() * 110 - 55, rand() * 90 - 55, rand()] as const);
  }, [count]);
  const uniforms = useMemo(() => ({ uTime: { value: 0 }, uOpacity: { value: 0 } }), []);
  useFrame(({ clock }) => {
    const c = motion.current.chapter;
    const t = motion.current.reduced ? 0 : clock.elapsedTime;
    const opacity = Math.max(windowAt(c, 2.3, 3.8), windowAt(c, 5.8, 6.8) * .7, windowAt(c, 8.9, 10) * .25);
    if (material.current) { material.current.uniforms.uTime.value = t; material.current.uniforms.uOpacity.value = opacity; }
    if (grid.current) grid.current.visible = opacity > .01;
    if (!flow.current) return;
    flow.current.visible = c > 5.5 && c < 10.6;
    seeds.forEach(([x, z, offset], i) => {
      const dx = ((x + t * (1 + offset * 2) + 60) % 120) - 60;
      dummy.position.set(dx, .6, z + Math.sin(dx * .05 + offset * 6) * 4);
      dummy.rotation.y = Math.atan2(1, Math.cos(dx * .05 + offset * 6) * .2);
      dummy.scale.set(.025, .025, .3 + offset * .4);
      dummy.updateMatrix(); flow.current!.setMatrixAt(i, dummy.matrix);
    });
    flow.current.instanceMatrix.needsUpdate = true;
  });
  return <>
    <group ref={grid}><mesh position={[7, .34, -13]} rotation-x={-Math.PI / 2}><planeGeometry args={[100, 100]} /><shaderMaterial ref={material} transparent depthWrite={false} uniforms={uniforms}
      vertexShader={`varying vec2 vUv; void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`}
      fragmentShader={`uniform float uTime;uniform float uOpacity;varying vec2 vUv;void main(){vec2 p=(vUv-.5)*100.;vec2 cell=abs(fract(p/4.-.5)-.5)/fwidth(p/4.);float grid=1.-min(min(cell.x,cell.y),1.);float d=length(p);float ring=1.-smoothstep(.08,.4,abs(d-mod(uTime*5.,65.)));float edge=1.-smoothstep(30.,49.,d);gl_FragColor=vec4(.57,.92,.8,(grid*.13+ring*.5)*edge*uOpacity);}`} /></mesh></group>
    <instancedMesh ref={flow} args={[undefined, undefined, count]}><boxGeometry /><meshBasicMaterial color="#9bd8cc" transparent opacity={.35} depthWrite={false} /></instancedMesh>
    {labels && <>{[[9, '+6 HOURS'], [0, '+12 HOURS'], [-12, '+24 HOURS']].map(([x, text], index) => <Html key={text} position={[Number(x), 1.5, -9 + index * 5]} center zIndexRange={[4, 0]} style={{ pointerEvents: 'none' }}><div className="forecast-label">{text}</div></Html>)}</>}
  </>;
}
