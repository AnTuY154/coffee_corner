"use client";
import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { WeatherMode } from "./weather";
import { WEATHER_PROFILE } from "./weather";

/** Individual particles use one Points draw call, not hundreds of transparent meshes. */
function RainParticles({mode,lowPower,reducedMotion}:{mode:WeatherMode;lowPower:boolean;reducedMotion:boolean}){
 const density=lowPower?155:430;
 const {positions,geometry}=useMemo(()=>{
  const p=new Float32Array(density*3);
  for(let i=0;i<density;i++){
   // Deterministic hash, stable over React remounts and across the 4 weather modes.
   const rand=(seed:number)=>((Math.sin(seed*127.1+i*78.233)*43758.5453)%1+1)%1;
   p[i*3]=(rand(1)-.5)*27;
   p[i*3+1]=1+rand(2)*13;
   p[i*3+2]=(rand(3)-.5)*28;
  }
  const g=new THREE.BufferGeometry();
  g.setAttribute("position",new THREE.BufferAttribute(p,3).setUsage(THREE.DynamicDrawUsage));
  return {positions:p,geometry:g};
 },[density]);
 const material=useMemo(()=>new THREE.PointsMaterial({
  color:"#d8eaf0",size:lowPower?.065:.075,opacity:0,transparent:true,depthWrite:false,
  sizeAttenuation:true,blending:THREE.NormalBlending
 }),[lowPower]);
 useEffect(()=>()=>{geometry.dispose();material.dispose();},[geometry,material]);
 useFrame((_,dt)=>{
  material.opacity=THREE.MathUtils.damp(material.opacity,mode==="rainy"&&!reducedMotion?.65:0,2.5,Math.min(dt,.1));
  if(material.opacity<.01||reducedMotion)return;
  const delta=Math.min(dt,.06);
  for(let i=0;i<positions.length;i+=3){
   positions[i]+=.8*delta;
   positions[i+1]-=(lowPower?13:17)*delta;
   if(positions[i+1]<0){positions[i+1]+=13;positions[i]=(positions[i]+15)%30-15;}
   if(positions[i]>14)positions[i]-=28;
  }
  (geometry.attributes.position as THREE.BufferAttribute).needsUpdate=true;
 });
 return <points geometry={geometry} material={material} frustumCulled={false}/>;
}
function CloudMass({position,scale=1}:{position:[number,number,number];scale?:number}){
 return <group position={position} scale={scale}>
  {[-1.6,-.8,0,.9,1.65].map((x,i)=><mesh key={i} position={[x,i%2?.12:.45,0]} scale={[1.23+(i%2)*.18,.77+(i%3)*.14,.8]}>
   <sphereGeometry args={[1,12,9]}/><meshStandardMaterial color="#e4e9e2" transparent opacity={.89} depthWrite={false} roughness={1}/>
  </mesh>)}
 </group>;
}
/** Warm visible sun and independently shaded cloud banks (no image billboards). */
export function WeatherSystem({mode,lowPower,reducedMotion}:{mode:WeatherMode;lowPower:boolean;reducedMotion:boolean}){
 const light=useRef<THREE.DirectionalLight>(null);
 const ambient=useRef<THREE.AmbientLight>(null);
 const hemisphere=useRef<THREE.HemisphereLight>(null);
 const sun=useRef<THREE.Group>(null);
 const clouds=useRef<THREE.Group>(null);
 const sky=useMemo(()=>new THREE.Color("#a3d5e8"),[]);
 const fogColor=useMemo(()=>new THREE.Color("#dae9dd"),[]);
 const desired=useMemo(()=>new THREE.Color(),[]);
 const cloudBank=useRef(0);
 useFrame(({scene,clock},delta)=>{
  const dt=Math.min(delta,.08);
  const p=WEATHER_PROFILE[mode],blend=1-Math.exp(-.75*dt);
  desired.set(p.sky);sky.lerp(desired,blend);
  // All materials react to one shared changing environmental light profile.
  scene.background=sky;
  desired.set(p.fog);fogColor.lerp(desired,blend);
  if(scene.fog instanceof THREE.Fog)scene.fog.color.copy(fogColor);
  if(light.current)light.current.intensity=THREE.MathUtils.damp(light.current.intensity,p.sun,1.1,dt);
  if(ambient.current)ambient.current.intensity=THREE.MathUtils.damp(ambient.current.intensity,p.ambient,1.1,dt);
  if(hemisphere.current)hemisphere.current.intensity=THREE.MathUtils.damp(hemisphere.current.intensity,p.hemi,1.1,dt);
  if(sun.current){
   const k=THREE.MathUtils.damp(sun.current.scale.x,mode==="rainy"?.35:mode==="overcast"?.68:1,1.2,dt);
   sun.current.scale.setScalar(k);
   if(!reducedMotion)sun.current.rotation.z=Math.sin(clock.elapsedTime*.07)*.035;
  }
  cloudBank.current=THREE.MathUtils.damp(cloudBank.current,p.cloud,1.1,dt);
  if(clouds.current){
   clouds.current.scale.y=.9+cloudBank.current*.23;
   clouds.current.position.x=reducedMotion?0:Math.sin(clock.elapsedTime*.045)*2.2;
   clouds.current.children.forEach(obj=>{
    obj.traverse(child=>{
     const mesh=child as THREE.Mesh;
     if(mesh.isMesh&&mesh.material instanceof THREE.MeshStandardMaterial)mesh.material.opacity=.18+cloudBank.current*.75;
    });
   });
  }
 });
 return <>
  <fog attach="fog" args={["#dae9dd",34,98]}/>
  <ambientLight ref={ambient} intensity={WEATHER_PROFILE.sunny.ambient}/>
  <hemisphereLight ref={hemisphere} args={["#fff4da","#507a56",WEATHER_PROFILE.sunny.hemi]}/>
  <directionalLight ref={light} position={[-9,15,5]} color="#fff2cc" intensity={WEATHER_PROFILE.sunny.sun}
   castShadow={!lowPower} shadow-bias={-.00025} shadow-normalBias={.025} shadow-mapSize={[lowPower?512:1024,lowPower?512:1024]}
   shadow-camera-left={-14} shadow-camera-right={14} shadow-camera-top={14} shadow-camera-bottom={-14}/>
  <group ref={sun} position={[-12,16,-33]}>
    <mesh><sphereGeometry args={[2.35,24,18]}/><meshBasicMaterial color="#fff0ac" fog={false}/></mesh>
    <mesh scale={1.4}><sphereGeometry args={[2.35,20,16]}/><meshBasicMaterial color="#ffe2a0" transparent opacity={.13} depthWrite={false} fog={false}/></mesh>
    <mesh scale={1.85}><sphereGeometry args={[2.35,20,16]}/><meshBasicMaterial color="#fff8dd" transparent opacity={.065} depthWrite={false} fog={false}/></mesh>
  </group>
  <group ref={clouds}>
   <CloudMass position={[-16,11,-30]} scale={2.1}/>
   <CloudMass position={[5,13,-35]} scale={1.9}/>
   <CloudMass position={[19,10,-30]} scale={2.3}/>
   {!lowPower&&<CloudMass position={[-24,9,-47]} scale={2.6}/>}
  </group>
  <RainParticles mode={mode} lowPower={lowPower} reducedMotion={reducedMotion}/>
 </>;
}
