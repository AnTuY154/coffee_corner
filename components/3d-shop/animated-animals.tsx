"use client";
import { Component, Suspense, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { RoundedBox, useAnimations, useGLTF } from "@react-three/drei";
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

function useRiggedAnimal(scene:THREE.Group, height:number, shadow:boolean, catPalette=false){
 const model=useMemo(()=>{
  // SkinnedMesh MUST use SkeletonUtils.clone, never scene.clone(true).
  const copy=clone(scene);
  copy.traverse(o=>{
   const mesh=o as THREE.Mesh;
   if(mesh.isMesh){
    mesh.castShadow=shadow;mesh.receiveShadow=shadow;
    mesh.frustumCulled=false; // animated bounds differ from bind pose
    if(catPalette){
     // The original human skin/clothes texture reads as a human under the mask.
     // Give this cloned skinned mesh a soft fur colour; never mutate the shared
     // Kenney GLTF material still used by the human NPC elsewhere in the shop.
     const tint=(material:THREE.Material):THREE.Material=>{
      if(!(material instanceof THREE.MeshStandardMaterial))return material;
      const fur=material.clone();
      fur.map=null;fur.normalMap=null;fur.color.set("#d2bfb1");
      fur.roughness=.98;fur.metalness=0;fur.needsUpdate=true;
      return fur;
     };
     mesh.material=Array.isArray(mesh.material)?mesh.material.map(tint):tint(mesh.material);
    }
   }
  });
  return copy;
 },[scene,shadow,catPalette]);
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

/** Cute chibi mascot head. Wide silhouette and forward-facing amber eyes conceal
 * the human rig beneath it. All forms stay real 3D; no flat face sprite.
 */
function BaristaCatFace({head,blink}: {
 head:React.RefObject<THREE.Group|null>;
 blink:React.RefObject<THREE.Group|null>;
}){
 return <group ref={head} position={[0,2.46,.20]}>
  {/* Oversized, soft-clay round head and short muzzle */}
  <FelineOrb position={[0,0,0]} scale={[.86,.74,.72]} color="#d6c3b6"/>
  <FelineOrb position={[0,-.19,.49]} scale={[.62,.35,.28]} color="#fff2e5"/>
  {[-1,1].map(side=><group key={side}>
   {/* Rounded kitten ears, rather than long pointed wolf ears */}
   <group position={[side*.52,.59,-.08]} rotation={[0,0,-side*.16]}>
    <mesh castShadow scale={[1,.94,1]}>
     <coneGeometry args={[.27,.39,16]}/><FaceMaterial color="#cbb0a5"/>
    </mesh>
    <mesh position={[0,-.012,.115]}>
     <coneGeometry args={[.155,.26,16]}/><FaceMaterial color="#e5a0a8"/>
    </mesh>
    <FelineOrb position={[0,-.14,0]} scale={[.29,.18,.20]} color="#cbb0a5"/>
   </group>
   {/* Plump cream cheeks sit just below the eyes */}
   <FelineOrb position={[side*.41,-.20,.49]} scale={[.29,.25,.25]} color="#fff4e9"/>
   {/* Oversized glassy amber eyes with large dark pupils and two catchlights */}
   <FelineOrb position={[side*.29,.13,.626]} scale={[.237,.257,.09]} color="#4a362d"/>
   <mesh position={[side*.29,.13,.691]} scale={[.195,.218,.076]}>
    <sphereGeometry args={[1,24,20]}/>
    <meshPhysicalMaterial color="#f0b75d" roughness={.12} clearcoat={1} clearcoatRoughness={.06}/>
   </mesh>
   <FelineOrb position={[side*.29,.11,.759]} scale={[.068,.117,.026]} color="#30241f"/>
   <FelineOrb position={[side*.29-.062,.207,.782]} scale={[.040,.053,.016]} color="#fffdf8"/>
   <FelineOrb position={[side*.29+.05,.066,.784]} scale={[.018,.024,.012]} color="#fff6da"/>
   <FelineOrb position={[side*.32,.42,.43]} scale={[.20,.070,.08]} color="#b6a095"/>
   {/* Blush is in front of the cheek, visible from the service camera */}
   <FelineOrb position={[side*.56,-.17,.67]} scale={[.097,.056,.025]} color="#efa6b0"/>
   {[-1,0,1].map(i=><mesh key={i}
      position={[side*.62,-.25+i*.067,.67]}
      rotation={[0,side*.21,side*(i*.15)]}>
     <cylinderGeometry args={[.0035,.0035,.37,4]}/><FaceMaterial color="#fff8ee"/>
   </mesh>)}
  </group>)}
  {/* Gentle independent blink without resetting the rig animations */}
  <group ref={blink} position={[0,.14,.793]} scale={[1,.01,1]}>
   {[-.29,.29].map(x=><FelineOrb key={x} position={[x,0,0]} scale={[.182,.20,.025]} color="#d6c3b6"/>)}
  </group>
  <FelineOrb position={[0,-.23,.775]} scale={[.085,.059,.048]} color="#dc929f"/>
  <mesh position={[0,-.315,.767]} rotation={[0,0,Math.PI]}>
   <torusGeometry args={[.066,.012,7,18,Math.PI]}/><FaceMaterial color="#71534a"/>
  </mesh>
  {/* Small fluffy cowlick */}
  <group position={[0,.645,.16]} rotation={[.24,0,-.24]}>
   <mesh castShadow><coneGeometry args={[.105,.24,12]}/><FaceMaterial color="#efe2d4"/></mesh>
  </group>
 </group>;
}

function BaristaApron({tail}: {tail:React.RefObject<THREE.Group|null>}){
 return <group>
  {/* Plush cream belly over the human chest, then a rounded green apron */}
  <FelineOrb position={[0,1.58,.13]} scale={[.49,.65,.37]} color="#e3d2c5"/>
  <RoundedBox args={[.79,.82,.15]} radius={.16} smoothness={5}
      position={[0,1.47,.48]} castShadow>
   <FaceMaterial color="#2f885f" roughness={.94}/>
  </RoundedBox>
  {[-.30,.30].map(x=><mesh key={x} position={[x,1.92,.34]} rotation={[0,0,x>0?.16:-.16]}>
   <boxGeometry args={[.074,.48,.08]}/><FaceMaterial color="#246b4b"/>
  </mesh>)}
  <RoundedBox args={[.40,.22,.04]} radius={.06} smoothness={4} position={[0,1.29,.57]}>
   <FaceMaterial color="#1e6548"/>
  </RoundedBox>
  <FelineOrb position={[0,1.71,.574]} scale={[.11,.073,.029]} color="#e3edb7"/>
  {/* Short rounded paws and pink pads make the silhouette less human */}
  {[-1,1].map(side=><group key={side}>
   <FelineOrb position={[side*.58,1.42,.32]} scale={[.19,.36,.18]} color="#d4c1b3"/>
   <FelineOrb position={[side*.58,1.13,.43]} scale={[.22,.16,.19]} color="#fff0df"/>
   <FelineOrb position={[side*.59,1.13,.598]} scale={[.09,.047,.02]} color="#e4a7aa"/>
  </group>)}
  <group ref={tail} position={[.43,1.02,-.36]}>
   <mesh castShadow rotation={[0,0,-.68]}>
    <torusGeometry args={[.45,.13,10,22,Math.PI*1.14]}/>
    <FaceMaterial color="#c8b2a4"/>
   </mesh>
  </group>
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
 const {model,fit}=useRiggedAnimal(scene,2.72,!lowPower,true);
 const {actions}=useAnimations(animations,model);
 const head=useRef<THREE.Group>(null),blink=useRef<THREE.Group>(null),tail=useRef<THREE.Group>(null);
 const pitcher=useRef<THREE.Group>(null),stream=useRef<THREE.Mesh>(null);
 useEffect(()=>{
  const idle=actions.idle;
  if(!idle)return;
  idle.reset().fadeIn(.25).play();
  idle.setEffectiveTimeScale(reducedMotion?0:.74);
  return ()=>{idle.fadeOut(.15);};
 },[actions,reducedMotion]);
 useFrame(({clock})=>{
  const t=clock.elapsedTime;
  if(head.current){
   head.current.rotation.z=reducedMotion?0:Math.sin(t*1.2)*.045;
   head.current.rotation.x=reducedMotion?0:Math.sin(t*.9)*.02;
   head.current.position.y=2.46+(reducedMotion?0:Math.sin(t*1.8)*.028);
  }
  if(blink.current){
   const phase=t%4.7;
   const closed=!reducedMotion&&phase>4.49?Math.sin((phase-4.49)/.21*Math.PI)**2:0;
   blink.current.scale.y=Math.max(.01,closed);
  }
  if(tail.current)tail.current.rotation.y=reducedMotion?0:Math.sin(t*1.25)*.22;
  const pour=reducedMotion?0:Math.max(0,Math.sin(t*1.1));
  if(pitcher.current)pitcher.current.rotation.z=-.08-pour*.42;
  if(stream.current){stream.current.visible=pour>.56;stream.current.scale.y=Math.max(.06,(pour-.5)*2);}
 });
 return <group position={[0,0,-3.45]} scale={.96}>
  {/* Rigged, truly skinned GLB drives the biped character. The old sculpt is only error fallback. */}
  <group position={[fit.x,fit.lift,fit.z]} scale={fit.s}>
   <primitive object={model}/>
  </group>
  <BaristaCatFace head={head} blink={blink}/>
  <BaristaApron tail={tail}/>
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
