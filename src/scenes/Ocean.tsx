import { useMemo, useRef } from 'react';
import type { RefObject } from 'react';
import { useFrame } from '@react-three/fiber';
import { Color, ShaderMaterial, Vector3 } from 'three';
import type { MotionState } from '../data/mission';
import { smooth, windowAt } from './geometry';

const waves = `
float wave(vec2 p, float t) {
  vec2 q=p+vec2(sin(p.y*.14+t*.16),cos(p.x*.11-t*.12))*1.5;
  return sin(q.x * .23 + t * .7) * .17 + sin(q.y * .31 - t * .6) * .14
    + sin((q.x + q.y) * .65 + t * 1.1) * .072 + sin(q.x * 1.8 - q.y * 1.3 + t) * .039
    + sin(q.x*3.7+q.y*2.1-t*1.4)*.016 + sin(q.x*5.1-q.y*3.4+t*1.8)*.009;
}`;

export default function Ocean({ motion, lite }: { motion: RefObject<MotionState>; lite: boolean }) {
  const material = useRef<ShaderMaterial>(null);
  const uniforms = useMemo(() => ({ uTime: { value: 0 }, uDanger: { value: 0 }, uDawn: { value: 0 }, uFog: { value: new Color('#0047AB') }, uEye: { value: new Vector3() } }), []);
  useFrame(({ clock, camera }) => {
    if (!material.current) return;
    // R3F retains its own uniform wrappers; update the live material, not JSX inputs.
    const live = material.current.uniforms;
    live.uTime.value = motion.current.reduced ? 0 : clock.elapsedTime;
    live.uEye.value.copy(camera.position);
    live.uDanger.value = windowAt(motion.current.chapter, 5, 6.5);
    live.uDawn.value = smooth(12.2, 13.2, motion.current.chapter);
  });
  return <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.18, 0]}>
    <planeGeometry args={[700, 700, lite ? 100 : 230, lite ? 100 : 230]} />
    <shaderMaterial ref={material} uniforms={uniforms} vertexShader={`
      uniform float uTime;
      varying vec3 vWorld;
      ${waves}
      void main() {
        vec3 p = position;
        p.z = wave(p.xy, uTime);
        vWorld = (modelMatrix * vec4(p, 1.)).xyz;
        gl_Position = projectionMatrix * viewMatrix * vec4(vWorld, 1.);
      }
    `} fragmentShader={`
      uniform float uTime;
      uniform float uDanger;
      uniform float uDawn;
      uniform vec3 uEye;
      varying vec3 vWorld;
      ${waves}
      void main() {
        vec2 p = vec2(vWorld.x, -vWorld.z);
        float e = .09;
        float dx = (wave(p + vec2(e,0.),uTime)-wave(p-vec2(e,0.),uTime))/(2.*e);
        float dz = (wave(p + vec2(0.,e),uTime)-wave(p-vec2(0.,e),uTime))/(2.*e);
        vec3 n = normalize(vec3(-dx, 1., dz));
        vec3 eye = normalize(uEye - vWorld);
        float fresnel = pow(1. - max(dot(n, eye), 0.), 3.);
        vec3 deep = mix(vec3(.0, .15, .42), vec3(.0, .09, .26), uDanger * .75);
        vec3 horizon = mix(vec3(.0, .278, .671), vec3(.48, .38, .27), uDawn);
        vec3 color = mix(deep, horizon, fresnel * .58);
        vec3 light = normalize(vec3(-.35,.25,-.8));
        vec3 halfDir = normalize(light + eye);
        float spec = pow(max(dot(n, halfDir), 0.), 260.);
        color += spec * mix(vec3(.15, .45, .95), vec3(1., .68, .35), uDawn) * .6;
        float ripple = pow(abs(sin(p.x * 2.1 + p.y * 1.9 + wave(p,uTime)*5.)), 22.);
        color += vec3(.0, .278, .671) * ripple * .035;
        float riskLight = exp(-length(vWorld.xz-vec2(0.,-3.))*.05)*uDanger;
        color += vec3(.18,.006,.002)*riskLight;
        float fog = 1. - exp(-length(uEye - vWorld) * .0028);
        color = mix(color, horizon * .62, fog);
        gl_FragColor = vec4(color, 1.);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }
    `} />
  </mesh>;
}
