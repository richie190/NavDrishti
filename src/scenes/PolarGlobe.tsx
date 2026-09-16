import { useEffect, useMemo, useRef } from 'react';
import type { RefObject } from 'react';
import { useFrame } from '@react-three/fiber';
import { AdditiveBlending, BackSide, BufferGeometry, Float32BufferAttribute, Group, ShaderMaterial, ShapeUtils, Vector2 } from 'three';
import type { MotionState } from '../data/mission';
import { antarcticCoast } from '../data/antarcticCoast';
import { windowAt } from './geometry';

function polarCap() {
  const points: number[] = [], normals: number[] = [];
  const project = (p: Vector2) => {
    const radius = p.length(), angle = Math.atan2(p.y, p.x);
    const x = Math.sin(radius) * Math.cos(angle), y = Math.cos(radius), z = Math.sin(radius) * Math.sin(angle);
    points.push(x * 22.24, y * 22.24, z * 22.24);
    normals.push(x, y, z);
  };
  const triangle = (a: Vector2, b: Vector2, c: Vector2, depth = 0) => {
    // Subdivide in polar projection so wide faces follow the sphere instead of cutting through it.
    if (depth < 5 && Math.max(a.distanceTo(b), b.distanceTo(c), c.distanceTo(a)) > .105) {
      const ab = a.clone().lerp(b, .5), bc = b.clone().lerp(c, .5), ca = c.clone().lerp(a, .5);
      triangle(a, ab, ca, depth + 1); triangle(ab, b, bc, depth + 1);
      triangle(ca, bc, c, depth + 1); triangle(ab, bc, ca, depth + 1);
    } else { project(a); project(b); project(c); }
  };
  antarcticCoast.forEach(ring => {
    const contour: Vector2[] = [];
    ring.forEach(([longitude, latitude]) => {
      const angle = longitude * Math.PI / 180, radius = (90 + latitude) * Math.PI / 180;
      const point = new Vector2(Math.cos(angle) * radius, Math.sin(angle) * radius);
      if (!contour.length || point.distanceTo(contour[contour.length - 1]) > .00001) contour.push(point);
    });
    if (contour[0].distanceTo(contour[contour.length - 1]) < .00001) contour.pop();
    ShapeUtils.triangulateShape(contour, []).forEach(([a, b, c]) => triangle(contour[a], contour[b], contour[c]));
  });
  const geo = new BufferGeometry();
  geo.setAttribute('position', new Float32BufferAttribute(points, 3));
  geo.setAttribute('normal', new Float32BufferAttribute(normals, 3));
  return geo;
}

export default function PolarGlobe({ motion }: { motion: RefObject<MotionState> }) {
  const globe = useRef<Group>(null), orbit = useRef<Group>(null);
  const material = useRef<ShaderMaterial>(null);
  const cap = useMemo(polarCap, []);
  useEffect(() => () => cap.dispose(), [cap]);
  useFrame(({ clock }) => {
    const weight = windowAt(motion.current.chapter, 2.8, 3.5);
    const t = motion.current.reduced ? 0 : clock.elapsedTime;
    if (globe.current) { globe.current.visible = weight > .005; globe.current.scale.setScalar(Math.max(.001, weight)); globe.current.rotation.y = t * .018; }
    if (orbit.current) orbit.current.rotation.y = t * .18;
    if (material.current) material.current.uniforms.uTime.value = t;
  });
  return <group ref={globe} name="polar-orbital-view" position={[-6, 76, -18]} rotation={[.85, 0, -.18]}>
    <mesh><sphereGeometry args={[22, 64, 48]} /><shaderMaterial ref={material} uniforms={{ uTime: { value: 0 } }}
      vertexShader={`varying vec3 vNormal;varying vec3 vPosition;void main(){vNormal=normalize(normalMatrix*normal);vPosition=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`}
      fragmentShader={`varying vec3 vNormal;varying vec3 vPosition;uniform float uTime;void main(){vec3 p=normalize(vPosition);float lon=atan(p.z,p.x),lat=asin(p.y);float grid=(1.-smoothstep(.012,.028,abs(sin(lon*12.))))+(1.-smoothstep(.012,.028,abs(sin(lat*18.))));float facing=pow(max(vNormal.z,0.),.6);vec3 c=mix(vec3(.005,.021,.075),vec3(.018,.10,.24),facing);c+=vec3(.12,.4,.62)*grid*.22;float sweep=1.-smoothstep(.015,.05,abs(sin(lon-uTime*.16)));c+=vec3(.13,.6,.65)*sweep*.3;gl_FragColor=vec4(c,1.);#include <tonemapping_fragment>\n#include <colorspace_fragment>}`.replace(';#include', ';\n#include')} /></mesh>
    <mesh geometry={cap}><meshStandardMaterial color="#b9e7ee" roughness={.7} metalness={.08} side={2} /></mesh>
    <mesh><sphereGeometry args={[22.7, 48, 32]} /><shaderMaterial side={BackSide} transparent depthWrite={false} blending={AdditiveBlending}
      vertexShader={`varying vec3 vNormal;varying vec3 vView;void main(){vec4 p=modelViewMatrix*vec4(position,1.);vNormal=normalize(normalMatrix*normal);vView=normalize(-p.xyz);gl_Position=projectionMatrix*p;}`}
      fragmentShader={`varying vec3 vNormal;varying vec3 vView;void main(){float rim=pow(1.-abs(dot(normalize(vNormal),normalize(vView))),3.);gl_FragColor=vec4(.18,.49,1.,rim*.5);}`} /></mesh>
    {[0, 1, 2].map(i => <mesh key={i} rotation={[Math.PI / 2 + i * .4, i * .5, .4]}><torusGeometry args={[27 + i * 2, .035, 4, 150]} /><meshBasicMaterial color={i === 0 ? '#a0e7e1' : '#517ca8'} transparent opacity={i === 0 ? .55 : .3} toneMapped={false} /></mesh>)}
    <group ref={orbit}>{[0, 1, 2].map(i => <group key={i} rotation-y={i * Math.PI * 2 / 3}><mesh position={[29, 0, 0]}><octahedronGeometry args={[.55]} /><meshBasicMaterial color="#d2f9ff" toneMapped={false} /></mesh><mesh position={[29, 0, 0]}><boxGeometry args={[3, .06, .7]} /><meshStandardMaterial color="#5091c2" metalness={.6} roughness={.3} /></mesh></group>)}</group>
  </group>;
}
