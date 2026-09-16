import { useEffect, useMemo } from 'react';
import type { RefObject } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import type { MotionState } from '../data/mission';
import { windowAt } from './geometry';

export default function CinematicFX({ motion }: { motion: RefObject<MotionState> }) {
  const { gl, scene, camera, size } = useThree();
  const pipeline = useMemo(() => {
    const composer = new EffectComposer(gl);
    const render = new RenderPass(scene, camera);
    const lens = new ShaderPass({ uniforms: { tDiffuse: { value: null }, uIntensity: { value: 0 } },
      vertexShader: `varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
      fragmentShader: `uniform sampler2D tDiffuse;uniform float uIntensity;varying vec2 vUv;void main(){vec2 p=vUv-.5;vec2 offset=p*dot(p,p)*.006*uIntensity;vec3 c=texture2D(tDiffuse,vUv).rgb;c.r=texture2D(tDiffuse,vUv+offset).r;c.b=texture2D(tDiffuse,vUv-offset).b;float vignette=1.-dot(p,p)*.6;c*=vignette;gl_FragColor=vec4(c,1.);}` });
    const output = new OutputPass(); composer.addPass(render); composer.addPass(lens); composer.addPass(output);
    return { composer, render, lens, output };
  }, [gl, scene, camera]);
  useEffect(() => { pipeline.composer.setSize(size.width, size.height); }, [pipeline, size]);
  useEffect(() => () => { pipeline.lens.dispose(); pipeline.output.dispose(); pipeline.composer.dispose(); }, [pipeline]);
  useFrame((_, delta) => {
    pipeline.lens.uniforms.uIntensity.value = motion.current.reduced ? 0 : .2 + windowAt(motion.current.chapter, 5, 6.4);
    pipeline.composer.render(delta);
  }, 1);
  return null;
}
