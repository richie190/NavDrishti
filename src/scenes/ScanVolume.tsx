import { useMemo, useRef } from 'react';
import type { RefObject } from 'react';
import { useFrame } from '@react-three/fiber';
import { AdditiveBlending, Group, ShaderMaterial } from 'three';
import type { MotionState } from '../data/mission';
import { random, windowAt } from './geometry';

export default function ScanVolume({ motion }: { motion: RefObject<MotionState> }) {
  const group = useRef<Group>(null), rings = useRef<Group>(null);
  const material = useRef<ShaderMaterial>(null);
  const positions = useMemo(() => {
    const rand = random(761);
    return new Float32Array(Array.from({ length: 1600 * 3 }, (_, i) => i % 3 === 1 ? rand() * 19 : (rand() - .5) * 27));
  }, []);
  useFrame(({ clock }) => {
    const t = motion.current.reduced ? 0 : clock.elapsedTime;
    const opacity = windowAt(motion.current.chapter, 1.85, 2.45);
    if (group.current) group.current.visible = opacity > .01;
    if (rings.current) rings.current.rotation.y = t * .08;
    if (material.current) { material.current.uniforms.uTime.value = t; material.current.uniforms.uOpacity.value = opacity; }
  });
  return <group ref={group} name="iceberg-tomography" position={[10, 0, -9]}>
    <group ref={rings}>{[0, 1, 2, 3].map(i => <mesh key={i} rotation={[-Math.PI / 2 + (i === 3 ? .7 : 0), 0, i * .2]} position={[0, 1 + i * 4, 0]}><torusGeometry args={[13.3 - i * .4, .023, 5, 150, Math.PI * 1.75]} /><meshBasicMaterial color="#a9eaff" toneMapped={false} transparent opacity={.65} /></mesh>)}</group>
    <points><bufferGeometry><bufferAttribute attach="attributes-position" args={[positions, 3]} /></bufferGeometry><shaderMaterial ref={material} transparent depthWrite={false} blending={AdditiveBlending} uniforms={{ uTime: { value: 0 }, uOpacity: { value: 0 } }}
      vertexShader={`uniform float uTime;varying float vFade;void main(){vec3 p=position;float scan=mod(uTime*3.,22.);vFade=exp(-abs(p.y-scan)*.6);vec4 mv=modelViewMatrix*vec4(p,1.);gl_Position=projectionMatrix*mv;gl_PointSize=clamp(90./-mv.z,1.,3.);}`}
      fragmentShader={`uniform float uOpacity;varying float vFade;void main(){float alpha=(1.-smoothstep(.1,.5,length(gl_PointCoord-.5)))*vFade*uOpacity;gl_FragColor=vec4(.5,.87,1.,alpha);}`} /></points>
    {[-1, 1].map(x => <group key={x} position={[x * 13, 8, 0]}><mesh><boxGeometry args={[.025, 18, .025]} /><meshBasicMaterial color="#b2e3f4" transparent opacity={.5} /></mesh></group>)}
  </group>;
}
