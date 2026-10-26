"use client";
import { Component, Suspense, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useAnimations, useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { clone } from "three/examples/jsm/utils/SkeletonUtils.js";
import * as THREE from "three";
import { GardenDog } from "./characters";

// Only the animated garden dog remains in this module. The shop now employs
// the separately sculpted Shin character in shin-barista.tsx.
const BASE = process.env.NEXT_PUBLIC_BASE_PATH || "";
const DOG_RIG = `${BASE}/models/animal-characters/shiba-inu.glb`;

class AnimalBoundary extends Component<{children:ReactNode;fallback:ReactNode},{failed:boolean}>{
 state={failed:false};
 static getDerivedStateFromError(){return {failed:true};}
 render(){return this.state.failed?this.props.fallback:this.props.children;}
}

function useRiggedAnimal(scene:THREE.Group, height:number, shadow:boolean){
 const model=useMemo(()=>{
  const copy=clone(scene); // SkeletonUtils preserves the skinned mesh/bone map
  copy.traverse(o=>{
   const mesh=o as THREE.Mesh;
   if(mesh.isMesh){
    mesh.castShadow=shadow;
    mesh.receiveShadow=shadow;
    mesh.frustumCulled=false;
   }
  });
  return copy;
 },[scene,shadow]);
 const fit=useMemo(()=>{
  model.updateMatrixWorld(true);
  const box=new THREE.Box3().setFromObject(model,true);
  const h=Math.max(.001,box.max.y-box.min.y),s=height/h;
  return {s,lift:-box.min.y*s,x:-(box.min.x+box.max.x)*.5*s,
    z:-(box.min.z+box.max.z)*.5*s};
 },[model,height]);
 return {model,fit};
}

type DogPose="idle"|"walk"|"eat";
const DOG_CLIPS:Record<DogPose,string>={
 idle:"AnimalArmature|Idle",walk:"AnimalArmature|Walk",eat:"AnimalArmature|Eating"
};
function DogModel({reducedMotion,lowPower}:{reducedMotion:boolean;lowPower:boolean}){
 const {scene,animations}=useGLTF(DOG_RIG,false,true);
 const {model,fit}=useRiggedAnimal(scene,.98,!lowPower);
 const {actions}=useAnimations(animations,model);
 const group=useRef<THREE.Group>(null);
 const poseRef=useRef<DogPose>("idle");
 const [pose,setPose]=useState<DogPose>("idle");
 useEffect(()=>{
  const action=actions[DOG_CLIPS[pose]];
  if(!action)return;
  for(const key of Object.keys(DOG_CLIPS)){
   if(key!==pose)actions[DOG_CLIPS[key as DogPose]]?.fadeOut(.24);
  }
  action.reset().setEffectiveTimeScale(reducedMotion?0:(pose==="walk"?.85:.75)).fadeIn(.24).play();
  return ()=>{action.fadeOut(.18);};
 },[actions,pose,reducedMotion]);
 useEffect(()=>()=>{for(const action of Object.values(actions))action?.stop();},[actions]);
 useFrame(({clock})=>{
  if(!group.current)return;
  const t=reducedMotion?0:clock.elapsedTime%15;
  // Walk 5s, pause 2s, walk 5s, rest 3s. At end of the cycle,
  // arc=2π resets seamlessly to 0: no teleport or backwards foot-sliding.
  const angle=t<5?t/5*Math.PI:t<7?Math.PI:t<12?Math.PI+(t-7)/5*Math.PI:2*Math.PI;
  const walking=!reducedMotion&&(t<5||(t>=7&&t<12));
  const state:DogPose=walking?"walk":(!reducedMotion&&t>=12?"eat":"idle");
  if(poseRef.current!==state){poseRef.current=state;setPose(state);}
  group.current.position.set(2.48+.65*Math.cos(angle),0,5.8+.53*Math.sin(angle));
  // Model faces the tangent of the ellipse while walking.
  if(walking){
   const dx=-.65*Math.sin(angle),dz=.53*Math.cos(angle);
   group.current.rotation.y=Math.atan2(dx,dz);
  }
 });
 return <group ref={group} position={[3.13,0,5.8]}>
   <group position={[fit.x,fit.lift,fit.z]} scale={fit.s}><primitive object={model}/></group>
  </group>;
}
export function RiggedGardenDog({reducedMotion,lowPower}:{reducedMotion:boolean;lowPower:boolean}){
 const fallback=<GardenDog reducedMotion={reducedMotion}/>;
 return <AnimalBoundary fallback={fallback}>
  <Suspense fallback={fallback}>
   <DogModel reducedMotion={reducedMotion} lowPower={lowPower}/>
  </Suspense>
 </AnimalBoundary>;
}
