"use client";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import type { ShopControls } from "./types";

/** Original low-poly/soft-clay characters. No external models or copyrighted meshes. */
const M = ({color,metalness=0,roughness=.88}:{color:string;metalness?:number;roughness?:number})=><meshStandardMaterial color={color} metalness={metalness} roughness={roughness}/>;
function Orb({position=[0,0,0],scale=[1,1,1],color}:{position?:[number,number,number];scale?:[number,number,number];color:string}){
 return <mesh castShadow position={position} scale={scale}><sphereGeometry args={[1,16,12]}/><M color={color}/></mesh>;
}
function Limb({position,rotation=[0,0,0],length=.55,color="#f6dfc5"}:{position:[number,number,number];rotation?:[number,number,number];length?:number;color?:string}){
 return <group position={position} rotation={rotation}><Orb position={[0,-length*.5,0]} scale={[.125,length*.58,.12]} color={color}/></group>;
}
function Ear({x,rotation=0}:{x:number;rotation?:number}){
 return <group position={[x,.84,0]} rotation={[0,0,rotation]}>
    <mesh castShadow><coneGeometry args={[.28,.58,3]}/><M color="#bca69b"/></mesh>
    <mesh position={[0,-.025,.08]} scale={[.68,.68,.33]}><coneGeometry args={[.28,.55,3]}/><M color="#d99699"/></mesh>
 </group>;
}
/** The beige/grey, round-faced amber-eyed cat in the user's photo, recreated as 3D shapes. */
export function CatBarista({reducedMotion=false}:{reducedMotion?:boolean}){
 const root=useRef<THREE.Group>(null);const paw=useRef<THREE.Group>(null);const tail=useRef<THREE.Group>(null);
 const eyelids=useRef<THREE.Group>(null);
 useFrame(({clock})=>{
   if(reducedMotion)return;
   const t=clock.getElapsedTime();
   if(root.current)root.current.position.y=1.72+Math.sin(t*1.5)*.027;
   if(paw.current)paw.current.rotation.z=-.19+Math.sin(t*2.3)*.18;
   if(tail.current)tail.current.rotation.y=Math.sin(t*1.6)*.3;
   if(eyelids.current){const blink=(t%5.2)>5.02?1:.01;eyelids.current.scale.y=blink;}
 });
 return <group ref={root} position={[0,1.72,-3.45]}>
   <Orb position={[0,.3,0]} scale={[.62,.77,.48]} color="#b8a79c"/>
   <Orb position={[0,.26,.42]} scale={[.42,.47,.10]} color="#f0e0cc"/>
   {/* Actual green apron, straps and leaf badge */}
   <mesh castShadow position={[0,.22,.5]}><boxGeometry args={[.77,.8,.06]}/><M color="#246044"/></mesh>
   <Orb position={[0,.28,.557]} scale={[.10,.065,.025]} color="#d8e5ae"/>
   {[-.35,.35].map(x=><mesh key={x} position={[x,.75,.27]} rotation={[0,0,x]}><boxGeometry args={[.085,.62,.07]}/><M color="#195238"/></mesh>)}
   <group ref={tail} position={[-.5,.01,-.2]} rotation={[0,0,.5]}><Orb position={[-.25,-.05,-.1]} scale={[.16,.5,.16]} color="#ad998d"/></group>
   <group position={[0,1.16,0]}>
     <Ear x={-.38} rotation={.26}/><Ear x={.38} rotation={-.26}/>
     <Orb position={[0,.12,0]} scale={[.68,.57,.58]} color="#bda99c"/>
     <Orb position={[0,-.15,.45]} scale={[.49,.25,.22]} color="#e3cdb8"/>
     {/* Forward-facing amber eyes, dark pupils, warm highlights */}
     {[-.29,.29].map(x=><group key={x} position={[x,.16,.503]}>
       <Orb scale={[.155,.19,.07]} color="#f0bc63"/>
       <Orb position={[.015,0,.065]} scale={[.066,.13,.028]} color="#372c22"/>
       <Orb position={[-.04,.07,.095]} scale={[.027,.035,.014]} color="#fff9e5"/>
     </group>)}
     <group ref={eyelids} position={[0,.22,.56]} scale={[1,.01,1]}>
       {[-.29,.29].map(x=><Orb key={x} position={[x,0,0]} scale={[.17,.13,.03]} color="#c6afa0"/>)}
     </group>
     <Orb position={[0,-.19,.65]} scale={[.085,.055,.035]} color="#b67f7c"/>
     <mesh position={[0,-.27,.65]} rotation={[0,0,Math.PI/2]}><torusGeometry args={[.055,.012,5,12,Math.PI]}/><M color="#6f5149"/></mesh>
     {[-1,1].flatMap(side=>[0,1,2].map(i=><mesh key={`${side}-${i}`} position={[side*.43,-.18+i*.065,.58]} rotation={[0,side*.25,side*(.12-i*.12)]}>
       <cylinderGeometry args={[.006,.006,.34,3]}/><M color="#f2e5d8"/>
     </mesh>))}
   </group>
   <group ref={paw} position={[-.50,.62,.25]} rotation={[0,0,-.19]}><Limb position={[-.09,-.05,.1]} rotation={[0,0,-1]} length={.57} color="#baa699"/><Orb position={[-.51,-.24,.17]} scale={[.17,.15,.16]} color="#d1bdb0"/></group>
   <group position={[.47,.53,.24]}><Limb position={[.1,-.06,.07]} rotation={[0,0,1.05]} length={.59} color="#b6a396"/><Orb position={[.50,-.30,.18]} scale={[.18,.15,.17]} color="#d5c0b2"/></group>
   {/* Juice pitcher: follows the cat's preparation gesture */}
   <group position={[-.86,.32,.77]} rotation={[0,0,-.35]}>
     <mesh><cylinderGeometry args={[.22,.17,.39,12]}/><meshPhysicalMaterial color="#c9eee0" transparent opacity={.47} roughness={.12}/></mesh>
     <mesh position={[0,-.085,0]}><cylinderGeometry args={[.16,.15,.18,12]}/><M color="#7ab065"/></mesh>
     <mesh position={[.26,0,0]} rotation={[0,0,Math.PI/2]}><torusGeometry args={[.16,.035,7,12]}/><M color="#dbeadd"/></mesh>
   </group>
 </group>;
}

function Person({shirt="#efe5ce",pants="#55795e",backpack=false}:{shirt?:string;pants?:string;backpack?:boolean}){
 const left=useRef<THREE.Group>(null),right=useRef<THREE.Group>(null),armL=useRef<THREE.Group>(null),armR=useRef<THREE.Group>(null);
 const walking=useRef(false);
 useFrame(({clock})=>{const s=walking.current?Math.sin(clock.elapsedTime*8)*.48:0;
  if(left.current)left.current.rotation.x=s;if(right.current)right.current.rotation.x=-s;
  if(armL.current)armL.current.rotation.x=-s*.7;if(armR.current)armR.current.rotation.x=s*.7;
 });
 return <group userData={{animationSetWalking:(v:boolean)=>{walking.current=v}}}>
   <Orb position={[0,1.23,0]} scale={[.36,.5,.26]} color={shirt}/>
   <mesh castShadow position={[0,1.78,0]}><sphereGeometry args={[.315,16,12]}/><M color="#dfbba0"/></mesh>
   <Orb position={[0,1.99,-.035]} scale={[.35,.20,.34]} color="#46342c"/>
   <Orb position={[0,2.12,-.15]} scale={[.17,.12,.15]} color="#46342c"/>
   <group ref={left} position={[-.15,.86,0]}><Limb position={[0,0,0]} length={.77} color={pants}/><Orb position={[0,-.80,.09]} scale={[.17,.10,.26]} color="#f5f0e8"/></group>
   <group ref={right} position={[.15,.86,0]}><Limb position={[0,0,0]} length={.77} color={pants}/><Orb position={[0,-.80,.09]} scale={[.17,.10,.26]} color="#f5f0e8"/></group>
   <group ref={armL} position={[-.4,1.46,0]}><Limb position={[0,0,0]} length={.63} color={shirt}/></group>
   <group ref={armR} position={[.4,1.46,0]}><Limb position={[0,0,0]} length={.63} color={shirt}/></group>
   {backpack&&<group position={[0,1.17,-.30]}><Orb scale={[.32,.43,.22]} color="#2c7650"/><Orb position={[0,.03,-.21]} scale={[.15,.10,.02]} color="#d6ebae"/></group>}
 </group>;
}

/** Visible third-person avatar controlled by the exact same position and movement state as the camera. */
export function PlayerAvatar({controls,reducedMotion}:{controls:React.RefObject<ShopControls>;reducedMotion:boolean}){
 const root=useRef<THREE.Group>(null);const left=useRef<THREE.Group>(null),right=useRef<THREE.Group>(null),armL=useRef<THREE.Group>(null),armR=useRef<THREE.Group>(null);
 useFrame(({clock})=>{
   const c=controls.current;if(!c||!root.current)return;
   const moving=!c.locked&&(c.autoWalk||c.keys.size>0);
   root.current.position.set(c.x,0,c.z);root.current.rotation.y=Math.PI+c.yaw;
   const stride=moving&&!reducedMotion?Math.sin(clock.elapsedTime*9)*.55:0;
   if(left.current)left.current.rotation.x=stride;
   if(right.current)right.current.rotation.x=-stride;
   if(armL.current)armL.current.rotation.x=-stride*.65;
   if(armR.current)armR.current.rotation.x=stride*.65;
   root.current.position.y=!reducedMotion&&moving?Math.abs(Math.sin(clock.elapsedTime*9))*.025:0;
 });
 return <group ref={root} position={[0,0,9.4]}>
   <Orb position={[0,1.2,0]} scale={[.35,.51,.26]} color="#eee9d5"/>
   <Orb position={[0,1.80,0]} scale={[.31,.33,.31]} color="#d8ad91"/>
   <Orb position={[0,2.04,-.04]} scale={[.34,.22,.30]} color="#473229"/>
   <Orb position={[0,2.15,-.2]} scale={[.18,.12,.19]} color="#473229"/>
   {[-.18,.18].map((x,i)=><group key={i} ref={i===0?left:right} position={[x,.89,0]}><Limb position={[0,-.33,0]} length={.65} color="#567759"/><Orb position={[0,-.76,-.08]} scale={[.15,.10,.23]} color="#f7f3df"/></group>)}
   {[-.44,.44].map((x,i)=><group key={i} ref={i===0?armL:armR} position={[x,1.46,0]}><Limb position={[0,-.31,0]} length={.6} color="#eee9d5"/></group>)}
   <group position={[0,1.19,-.32]}><Orb scale={[.31,.40,.22]} color="#236345"/><Orb position={[0,.06,-.21]} scale={[.10,.08,.01]} color="#c4dc9e"/></group>
 </group>;
}

/** Customers add life to the scene; paths remain outside the player collision strip. */
export function WalkingCustomer({reducedMotion}:{reducedMotion:boolean}){
 const root=useRef<THREE.Group>(null);const left=useRef<THREE.Group>(null),right=useRef<THREE.Group>(null);
 useFrame(({clock})=>{if(!root.current)return;const t=reducedMotion?0:clock.elapsedTime*.42;
  root.current.position.set(-4.0+Math.sin(t)*.42,0,3.6+Math.cos(t)*1.6);
  root.current.rotation.y=Math.sin(t)*.17;
  const step=reducedMotion?0:Math.sin(clock.elapsedTime*6)*.46;
  if(left.current)left.current.rotation.x=step;if(right.current)right.current.rotation.x=-step;
 });
 return <group ref={root} position={[-4,0,4]} rotation={[0,.2,0]}>
   <Orb position={[0,1.24,0]} scale={[.33,.46,.25]} color="#ecdfbd"/>
   <Orb position={[0,1.8,0]} scale={[.29,.32,.29]} color="#dab395"/>
   <Orb position={[0,2.0,0]} scale={[.32,.20,.31]} color="#44342b"/>
   <group ref={left} position={[-.18,.85,0]}><Limb position={[0,-.35,0]} color="#6a8375" length={.7}/></group>
   <group ref={right} position={[.18,.85,0]}><Limb position={[0,-.35,0]} color="#6a8375" length={.7}/></group>
   <Orb position={[-.42,1.23,-.08]} scale={[.13,.36,.17]} color="#ba9068"/>
 </group>;
}

export function GardenDog({reducedMotion}:{reducedMotion:boolean}){
 const root=useRef<THREE.Group>(null);const tail=useRef<THREE.Group>(null);
 useFrame(({clock})=>{if(!root.current)return;const t=clock.elapsedTime;
  root.current.position.x=2.4+(reducedMotion?0:Math.cos(t*.62)*.5);
  root.current.position.z=5.7+(reducedMotion?0:Math.sin(t*.62)*.6);
  root.current.rotation.y=-.4+(reducedMotion?0:Math.sin(t*.6)*.5);
  if(tail.current)tail.current.rotation.y=reducedMotion?0:Math.sin(t*7)*.6;
 });
 return <group ref={root} position={[2.4,0,5.7]} scale={.76}>
   <Orb position={[0,.45,0]} scale={[.46,.33,.60]} color="#bb8650"/>
   <Orb position={[0,.74,.42]} scale={[.32,.35,.32]} color="#c7945e"/>
   <Orb position={[0,.64,.69]} scale={[.27,.17,.17]} color="#f4e4cf"/>
   {[-.23,.23].map(x=><group key={x}><Orb position={[x,.99,.37]} scale={[.12,.25,.12]} color="#c58b4c"/><Orb position={[x,.77,.74]} scale={[.05,.07,.03]} color="#2b251e"/></group>)}
   {[-.28,.28].flatMap(x=>[-.39,.39].map(z=><Orb key={`${x}-${z}`} position={[x,.19,z]} scale={[.14,.25,.14]} color="#f2dfc3"/>))}
   <group ref={tail} position={[0,.7,-.50]} rotation={[.7,0,0]}><Orb position={[0,.22,-.16]} scale={[.16,.3,.18]} color="#c08b51"/></group>
 </group>;
}
