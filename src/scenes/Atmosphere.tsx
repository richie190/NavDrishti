import { useMemo, useRef } from 'react';
import type { RefObject } from 'react';
import { useFrame } from '@react-three/fiber';
import { BackSide, Color, Points, ShaderMaterial } from 'three';
import type { MotionState } from '../data/mission';
import { random, smooth, windowAt } from './geometry';

export function Atmosphere({ motion }: { motion: RefObject<MotionState> }) {
  const material = useRef<ShaderMaterial>(null);
  const uniforms = useMemo(() => ({ uDawn: { value: 0 }, uDanger: { value: 0 } }), []);
  useFrame(() => {
    if (!material.current) return;
    material.current.uniforms.uDawn.value = smooth(12, 13.1, motion.current.chapter);
    material.current.uniforms.uDanger.value = windowAt(motion.current.chapter, 5, 6.5);
  });
  return <mesh><sphereGeometry args={[490, 32, 20]} /><shaderMaterial ref={material} side={BackSide} depthWrite={false} uniforms={uniforms}
    vertexShader={`varying vec3 vPosition; void main(){vPosition=position; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`}
    fragmentShader={`
      varying vec3 vPosition; uniform float uDawn; uniform float uDanger;
      void main(){
        vec3 p=normalize(vPosition);
        float h=max(p.y,0.);
        vec3 top=mix(vec3(.018,.055,.075),vec3(.09,.18,.24),uDawn);
        vec3 horizon=mix(vec3(.35,.54,.55),vec3(.77,.54,.34),uDawn);
        vec3 color=mix(horizon,top,pow(h,.32));
        vec3 sunDir=normalize(vec3(-.38,.14,-.92));
        float sun=max(dot(p,sunDir),0.);
        color+=pow(sun,25.)*mix(vec3(.1,.2,.19),vec3(.6,.27,.09),uDawn);
        color+=smoothstep(.9991,.9997,sun)*mix(vec3(.6,.85,.8),vec3(1.,.8,.5),uDawn)*1.8;
        color=mix(color,color*vec3(.48,.49,.57),uDanger*.65);
        gl_FragColor=vec4(color,1.);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`} /></mesh>;
}

export function Snow({ motion, lite }: { motion: RefObject<MotionState>; lite: boolean }) {
  const points = useRef<Points>(null);
  const material = useRef<ShaderMaterial>(null);
  const count = lite ? 180 : 850;
  const positions = useMemo(() => {
    const rand = random(192);
    return new Float32Array(Array.from({ length: count * 3 }, (_, i) => (rand() - .5) * (i % 3 === 1 ? 48 : 150)));
  }, [count]);
  const uniforms = useMemo(() => ({ uTime: { value: 0 }, uSize: { value: lite ? 1.6 : 2.2 }, uTint: { value: new Color('#c7f3f3') } }), [lite]);
  useFrame(({ clock }) => {
    if (material.current) material.current.uniforms.uTime.value = motion.current.reduced ? 0 : clock.elapsedTime;
  });
  return <points ref={points} frustumCulled={false}>
    <bufferGeometry><bufferAttribute attach="attributes-position" args={[positions, 3]} /></bufferGeometry>
    <shaderMaterial ref={material} transparent depthWrite={false} uniforms={uniforms}
      vertexShader={`uniform float uTime; uniform float uSize; varying float vAlpha; void main(){vec3 p=position; p.x+=sin(uTime*.1+position.z)*2.; p.y=mod(p.y-uTime*.65+24.,48.); vec4 mv=modelViewMatrix*vec4(p,1.); gl_Position=projectionMatrix*mv; gl_PointSize=clamp(uSize*85./-mv.z,1.,4.); vAlpha=(1.-smoothstep(12.,140.,-mv.z))*.45;}`}
      fragmentShader={`uniform vec3 uTint; varying float vAlpha; void main(){float d=length(gl_PointCoord-.5); gl_FragColor=vec4(uTint,(1.-smoothstep(.05,.5,d))*vAlpha);}`} />
  </points>;
}
