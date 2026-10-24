"use client";
import { Component, Suspense, useMemo, useRef, type ReactNode } from "react";
import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { clone } from "three/examples/jsm/utils/SkeletonUtils.js";
import * as THREE from "three";
import type { WeatherMode } from "./weather";
import { WEATHER_PROFILE } from "./weather";

type Props={kind:"tree-a"|"tree-b"|"bush";position:[number,number,number];height:number;weather:WeatherMode;reducedMotion:boolean;lowPower:boolean;phase:number};
const prefix=process.env.NEXT_PUBLIC_BASE_PATH||"";
const MODEL_URLS={
 "tree-a":`${prefix}/models/garden-tree-a.glb`,
 "tree-b":`${prefix}/models/garden-tree-b.glb`,
 bush:`${prefix}/models/garden-bush.glb`
};
function StylizedPlant({kind,position,height,weather,reducedMotion,lowPower,phase}:Props){
 const url=MODEL_URLS[kind];
 const {scene}=useGLTF(url,false,false);
 const sway=useRef<THREE.Group>(null);
 const model=useMemo(()=>{
  const copy=clone(scene);
  copy.traverse(obj=>{const mesh=obj as THREE.Mesh;if(mesh.isMesh){
   mesh.castShadow=!lowPower;mesh.receiveShadow=!lowPower;mesh.frustumCulled=false;
  }});
  return copy;
 },[scene,lowPower]);
 const fit=useMemo(()=>{
  model.updateMatrixWorld(true);
  const box=new THREE.Box3().setFromObject(model,true);
  const target=Math.max(.001,box.max.y-box.min.y);
  const scale=height/target;
  return {scale,lift:-box.min.y*scale,offsetX:-(box.min.x+box.max.x)*scale*.5,offsetZ:-(box.min.z+box.max.z)*scale*.5};
 },[model,height]);
 useFrame(({clock},delta)=>{
  if(!sway.current)return;
  const strength=reducedMotion?0:WEATHER_PROFILE[weather].wind;
  const time=clock.elapsedTime;
  const angle=Math.sin(time*(weather==="windy"?1.65:.75)+phase)*.032*strength;
  sway.current.rotation.z=THREE.MathUtils.damp(sway.current.rotation.z,angle,2.2,Math.min(delta,.08));
  sway.current.rotation.x=THREE.MathUtils.damp(sway.current.rotation.x,Math.cos(time*1.05+phase)*.013*strength,2.2,Math.min(delta,.08));
 });
 return <group position={position} ref={sway}>
  <group position={[fit.offsetX,fit.lift,fit.offsetZ]} scale={fit.scale}>
   <primitive object={model}/>
  </group>
 </group>;
}
class TreeBoundary extends Component<{children:ReactNode;fallback:ReactNode},{failed:boolean}>{
 state={failed:false};
 static getDerivedStateFromError(){return {failed:true};}
 render(){return this.state.failed?this.props.fallback:this.props.children;}
}
function FallbackTree({position,height}:{position:[number,number,number];height:number}){
 return <group position={position}>
  <mesh castShadow position={[0,height*.32,0]}><cylinderGeometry args={[.13,.22,height*.63,7]}/><meshStandardMaterial color="#816446"/></mesh>
  <mesh castShadow position={[0,height*.73,0]} scale={[height*.24,height*.29,height*.23]}>
   <icosahedronGeometry args={[1,1]}/><meshStandardMaterial color="#659b5c" roughness={.9}/>
  </mesh>
 </group>;
}
export function GardenModel(props:Props){
 return <TreeBoundary fallback={<FallbackTree position={props.position} height={props.height}/>}>
  <Suspense fallback={<FallbackTree position={props.position} height={props.height}/>}>
   <StylizedPlant {...props}/>
  </Suspense>
 </TreeBoundary>;
}
