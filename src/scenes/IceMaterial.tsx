import { useCallback } from 'react';
import type { MeshPhysicalMaterial } from 'three';

export default function IceMaterial() {
  const prepare = useCallback<NonNullable<MeshPhysicalMaterial['onBeforeCompile']>>((shader) => {
    shader.vertexShader = `varying vec3 vIcePoint;\n${shader.vertexShader}`.replace('#include <begin_vertex>', '#include <begin_vertex>\nvIcePoint = position;');
    shader.fragmentShader = `
      varying vec3 vIcePoint;
      float iceHash(vec3 p){ p=fract(p*.3183099+vec3(.1,.2,.3));p*=17.;return fract(p.x*p.y*p.z*(p.x+p.y+p.z)); }
      float iceNoise(vec3 p){
        vec3 i=floor(p),f=fract(p); f=f*f*(3.-2.*f);
        return mix(mix(mix(iceHash(i),iceHash(i+vec3(1,0,0)),f.x),mix(iceHash(i+vec3(0,1,0)),iceHash(i+vec3(1,1,0)),f.x),f.y),mix(mix(iceHash(i+vec3(0,0,1)),iceHash(i+vec3(1,0,1)),f.x),mix(iceHash(i+vec3(0,1,1)),iceHash(i+vec3(1,1,1)),f.x),f.y),f.z);
      }
      ${shader.fragmentShader}`.replace('#include <color_fragment>', `
        #include <color_fragment>
        vec3 ip=vIcePoint;
        float cloud=iceNoise(ip*6.)*.6+iceNoise(ip*21.)*.25+iceNoise(ip*73.)*.15;
        float strata=sin(ip.y*105.+iceNoise(ip*7.)*8.)*.5+.5;
        float ridge=iceNoise(vec3(ip.x*55.,ip.y*4.,ip.z*55.));
        float fissure=1.-smoothstep(.018,.052,abs(ridge-.48));
        float face=1.-smoothstep(.65,.95,ip.y);
        vec3 subsurface=mix(vec3(.25,.62,.73),vec3(.87,.97,.98),smoothstep(-.12,.8,ip.y));
        diffuseColor.rgb *= mix(vec3(.72,.9,.94),subsurface,.32) * (.83+cloud*.26);
        diffuseColor.rgb *= 1.-fissure*.085*face;
        diffuseColor.rgb += vec3(.08,.11,.12)*strata*.13*face;
      `);
  }, []);
  return <meshPhysicalMaterial onBeforeCompile={prepare} customProgramCacheKey={() => 'polar-ice-v1'} vertexColors color="#e5f3f0" roughness={.43} metalness={.02} clearcoat={.32} clearcoatRoughness={.3} flatShading envMapIntensity={1.1} />;
}
