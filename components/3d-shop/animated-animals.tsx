"use client";
import { Component, Suspense, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useAnimations, useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { clone } from "three/examples/jsm/utils/SkeletonUtils.js";
import * as THREE from "three";
import { CatBarista, GardenDog } from "./characters";

const BASE = process.env.NEXT_PUBLIC_BASE_PATH || "";
// The cat is deliberately an ANTHROPOMORPHIC barista: a Kenney CC0 skinned
// humanoid rig with a new 3D feline head, fur accessories and serving props.
// A quadruped cat rig cannot correctly hold a pitcher or stand behind a counter.
const CAT_RIG = `${BASE}/models/npc-sunny.glb`;
// Shiba Inu is a real QUADRUPED, with its own CC0 Quaternius bones/animations.
const DOG_RIG = `${BASE}/models/animal-characters/shiba-inu.glb`;

class AnimalBoundary extends Component<{children:ReactNode;fallback:ReactNode},{failed:boolean}>{
 state={failed:false};
 static getDerivedStateFromError(){return {failed:true};}
 render(){return this.state.failed?this.props.fallback:this.props.children;}
}

function useRiggedAnimal(scene:THREE.Group, height:number, shadow:boolean){
 const model=useMemo(()=>{
  // SkinnedMesh MUST use SkeletonUtils.clone, never scene.clone(true).
  const copy=clone(scene);
  copy.traverse(o=>{
   const mesh=o as THREE.Mesh;
   if(mesh.isMesh){
    mesh.castShadow=shadow;mesh.receiveShadow=shadow;
    mesh.frustumCulled=false; // animated bounds differ from bind pose
   }
  });
  return copy;
 },[scene,shadow]);
 const fit=useMemo(()=>{
  model.updateMatrixWorld(true);
  const box=new THREE.Box3().setFromObject(model,true);
  const h=Math.max(.001,box.max.y-box.min.y);
  const s=height/h;
  return {s,lift:-box.min.y*s, x:-(box.min.x+box.max.x)*.5*s,
          z:-(box.min.z+box.max.z)*.5*s};
 },[model,height]);
 return {model,fit};
}

const FaceMaterial=({color,roughness=.89}:{color:string;roughness?:number})=>
 <meshStandardMaterial color={color} roughness={roughness}/>;
function FelineOrb({position,scale,color}:{position:[number,number,number];scale:[number,number,number];color:string}){
 return <mesh castShadow position={position} scale={scale}>
  <sphereGeometry args={[1,24,20]}/><FaceMaterial color={color}/>
 </mesh>;
}

/** The animated, expressive cat head is a distinct authored 3D layer.
 * It intentionally ENVELOPS the source humanoid's head to hide human features.
 * The CC0 source GLB supplies the actual skeletal torso, arms, legs and idle clip.
 */
function BaristaCatFace({head}: {head:React.RefObject<THREE.Group|null>}){
 return <group ref={head} position={[0,2.53,.16]}>
  {/* Round warm-grey face, full sculpted cheeks, ears and amber eyes. */}
  <FelineOrb position={[0,0,0]} scale={[.73,.62,.62]} color="#cbb9ae"/>
  <FelineOrb position={[0,-.18,.42]} scale={[.56,.32,.24]} color="#f9eedf"/>
  {[-1,1].map(side=><group key={side}>
   <group position={[side*.48,.49,-.04]} rotation={[0,0,-side*.26]}>
    <mesh castShadow><coneGeometry args={[.25,.48,12]}/><FaceMaterial color="#c7aea3"/></mesh>
    <mesh position={[0,-.012,.112]}><coneGeometry args={[.145,.31,10]}/><FaceMaterial color="#d9979a"/></mesh>
   </group>
   <FelineOrb position={[side*.41,-.16,.48]} scale={[.28,.24,.24]} color="#f8ecdb"/>
   <FelineOrb position={[side*.32,.11,.54]} scale={[.235,.25,.11]} color="#514036"/>
   <mesh castShadow position={[side*.32,.11,.628]} scale={[.194,.212,.075]}>
    <sphereGeometry args={[1,20,16]}/>
    <meshPhysicalMaterial color="#e8b15b" roughness={.2} clearcoat={.8}/>
   </mesh>
   <FelineOrb position={[side*.32+.015,.10,.697]} scale={[.07,.12,.025]} color="#34281e"/>
   <FelineOrb position={[side*.32-.052,.19,.702]} scale={[.032,.044,.018]} color="#fffdf4"/>
   <FelineOrb position={[side*.29,.38,.46]} scale={[.235,.075,.08]} color="#aa948b"/>
   {[-1,0,1].map(i=><mesh key={i} position={[side*.53,-.24+i*.055,.65]}
       rotation={[0,side*.19,side*(i*.17)]}>
     <cylinderGeometry args={[.004,.004,.42,4]}/>
     <FaceMaterial color="#fff4df"/>
   </mesh>)}
  </group>)}
  <FelineOrb position={[0,-.22,.686]} scale={[.095,.065,.065]} color="#cc868f"/>
  <mesh position={[0,-.315,.667]} rotation={[0,0,Math.PI]}>
   <torusGeometry args={[.072,.013,6,16,Math.PI]}/><FaceMaterial color="#71534b"/>
  </mesh>
  <FelineOrb position={[0,.43,.19]} scale={[.14,.15,.1]} color="#e4d2c0"/>
 </group>;
}

function BaristaApron(){
 return <group>
  {/* Apron retains the colour/design of the original Vườn É cat. */}
  <mesh castShadow position={[0,1.54,.40]}>
   <boxGeometry args={[.93,.93,.14]}/>
   <FaceMaterial color="#2b8059"/>
  </mesh>
  {[-.36,.36].map(x=><mesh key={x} position={[x,1.98,.33]} rotation={[0,0,x>0?.18:-.18]}>
   <boxGeometry args={[.085,.55,.09]}/><FaceMaterial color="#246748"/>
  </mesh>)}
  <mesh position={[0,1.39,.478]}><boxGeometry args={[.53,.26,.035]}/><FaceMaterial color="#1a5840"/></mesh>
  <FelineOrb position={[0,1.71,.50]} scale={[.115,.075,.03]} color="#e1eab2"/>
  {/* A playful curved tail gives the Kenney rig an identifiable cat silhouette. */}
  <mesh castShadow position={[.43,1.13,-.43]} rotation={[0,0,-.6]}>
   <torusGeometry args={[.49,.14,9,20,Math.PI*1.12]}/>
   <FaceMaterial color="#c4ab9c"/>
  </mesh>
 </group>;
}

function CatServeProps({pitcher,stream}:{pitcher:React.RefObject<THREE.Group|null>;stream:React.RefObject<THREE.Mesh|null>}){
 return <group>
  <group ref={pitcher} position={[-.85,1.85,.62]}>
   <mesh castShadow><cylinderGeometry args={[.21,.16,.37,16]}/>
    <meshPhysicalMaterial color="#c8efe2" transparent opacity={.72} roughness={.12}/>
   </mesh>
   <mesh position={[.25,0,0]} rotation={[0,Math.PI/2,0]}>
    <torusGeometry args={[.145,.034,8,18]}/><FaceMaterial color="#dcebdd"/>
   </mesh>
   <mesh position={[0,-.11,0]}><cylinderGeometry args={[.15,.14,.12,12]}/><FaceMaterial color="#e8b857"/></mesh>
  </group>
  <mesh ref={stream} visible={false} position={[-1.08,1.50,.74]}>
   <cylinderGeometry args={[.019,.024,.39,8]}/>
   <meshPhysicalMaterial color="#e6a94a" transparent opacity={.8}/>
  </mesh>
  <mesh position={[-1.08,1.28,.74]}>
   <cylinderGeometry args={[.21,.16,.30,18]}/>
   <meshPhysicalMaterial color="#f4ebd6" transparent opacity={.75} roughness={.23}/>
  </mesh>
 </group>;
}

function CatModel({reducedMotion,lowPower}:{reducedMotion:boolean;lowPower:boolean}){
 const {scene,animations}=useGLTF(CAT_RIG,false,true);
 const {model,fit}=useRiggedAnimal(scene,3.07,!lowPower);
 const {actions}=useAnimations(animations,model);
 const head=useRef<THREE.Group>(null),pitcher=useRef<THREE.Group>(null),stream=useRef<THREE.Mesh>(null);
 useEffect(()=>{
  const idle=actions.idle;
  if(!idle)return;
  idle.reset().fadeIn(.25).play();
  idle.setEffectiveTimeScale(reducedMotion?.14:.74);
  return ()=>{idle.fadeOut(.15);};
 },[actions,reducedMotion]);
 useFrame(({clock})=>{
  const t=clock.elapsedTime;
  if(head.current){head.current.rotation.z=reducedMotion?0:Math.sin(t*.85)*.04;
   head.current.position.y=2.53+(reducedMotion?0:Math.sin(t*1.4)*.028);}
  const pour=reducedMotion?0:Math.max(0,Math.sin(t*1.15));
  if(pitcher.current)pitcher.current.rotation.z=-.12-pour*.5;
  if(stream.current){stream.current.visible=pour>.5;stream.current.scale.y=Math.max(.06,(pour-.45)*2);}
 });
 return <group position={[0,0,-3.45]}>
  {/* Rigged, truly skinned GLB drives the biped character. The old sculpt is only error fallback. */}
  <group position={[fit.x,fit.lift,fit.z]} scale={fit.s}>
   <primitive object={model}/>
  </group>
  <BaristaCatFace head={head}/>
  <BaristaApron/>
  <CatServeProps pitcher={pitcher} stream={stream}/>
 </group>;
}
export function RiggedCatBarista({reducedMotion,lowPower}:{reducedMotion:boolean;lowPower:boolean}){
 const fallback=<CatBarista reducedMotion={reducedMotion}/>;
 return <AnimalBoundary fallback={fallback}>
  <Suspense fallback={fallback}>
   <CatModel reducedMotion={reducedMotion} lowPower={lowPower}/>
  </Suspense>
 </AnimalBoundary>;
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
  action.reset().setEffectiveTimeScale(pose==="walk"?.85:.75).fadeIn(.24).play();
  return ()=>action.fadeOut(.18);
 },[actions,pose]);
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
