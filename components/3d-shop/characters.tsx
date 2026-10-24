"use client";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import type { ShopControls } from "./types";

/** Original low-poly/soft-clay characters. No external models or copyrighted meshes. */
const M = ({color,metalness=0,roughness=.88}:{color:string;metalness?:number;roughness?:number})=><meshStandardMaterial color={color} metalness={metalness} roughness={roughness}/>;
function Orb({position=[0,0,0],scale=[1,1,1],color}:{position?:[number,number,number];scale?:[number,number,number];color:string}){
 return <mesh castShadow position={position} scale={scale}><sphereGeometry args={[1,24,20]}/><M color={color}/></mesh>;
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
 const pitcher=useRef<THREE.Group>(null);const juiceStream=useRef<THREE.Mesh>(null);
 useFrame(({clock})=>{
   if(reducedMotion)return;
   const t=clock.getElapsedTime();
   if(root.current)root.current.position.y=1.72+Math.sin(t*1.5)*.027;
   if(paw.current)paw.current.rotation.z=-.19+Math.sin(t*2.3)*.18;
   // A short, repeated pour is performed with an actual 3D pitcher and juice stream.
   const pouring=Math.max(0,Math.sin(t*1.15));
   if(pitcher.current)pitcher.current.rotation.z=-.25-pouring*.38;
   if(juiceStream.current){juiceStream.current.visible=pouring>.55;juiceStream.current.scale.y=Math.max(.03,(pouring-.55)*2);}
   if(tail.current)tail.current.rotation.y=Math.sin(t*1.6)*.3;
   if(eyelids.current){const phase=t%5.2;
     const blink=phase>4.92 ? Math.sin(((phase-4.92)/.28)*Math.PI)**2 : .01;
     eyelids.current.scale.y=Math.max(.01,blink);}
 });
 return <group ref={root} position={[0,1.72,-3.45]}>
   <Orb position={[0,.3,0]} scale={[.62,.77,.48]} color="#b8a79c"/>
   <Orb position={[0,.26,.42]} scale={[.42,.47,.10]} color="#f0e0cc"/>
   {/* Sculpted layered coat silhouette: lightweight meshes rather than alpha fur cards. */}
   {[-1,1].map(side=>Array.from({length:5},(_,i)=><mesh key={`${side}-${i}`} castShadow position={[side*(.43+i*.016),.64-i*.21,-.055]} rotation={[0,0,side*(.36+i*.10)]}>
     <coneGeometry args={[.16-i*.012,.36,5]}/><M color={i%2?"#ae9a8f":"#c2afa1"}/>
   </mesh>))}
   {/* Actual green apron, straps and leaf badge */}
   <mesh castShadow position={[0,.22,.5]}><boxGeometry args={[.77,.8,.06]}/><M color="#246044"/></mesh>
   <Orb position={[0,.28,.557]} scale={[.10,.065,.025]} color="#d8e5ae"/>
   <mesh position={[0,-.005,.545]}><boxGeometry args={[.33,.25,.035]}/><M color="#1a4c38"/></mesh>
   <mesh position={[0,.29,.586]}><sphereGeometry args={[.033,10,8]}/><meshStandardMaterial color="#f4dc9a" metalness={.5} roughness={.26}/></mesh>
   {[-.35,.35].map(x=><mesh key={x} position={[x,.75,.27]} rotation={[0,0,x]}><boxGeometry args={[.085,.62,.07]}/><M color="#195238"/></mesh>)}
   <group ref={tail} position={[-.5,.01,-.2]} rotation={[0,0,.5]}>
     <Orb position={[-.22,-.09,-.1]} scale={[.18,.41,.17]} color="#ad998d"/>
     <Orb position={[-.4,.21,-.15]} scale={[.15,.34,.14]} color="#c2b0a2"/>
     <Orb position={[-.46,.44,-.15]} scale={[.14,.15,.14]} color="#9c8a82"/>
   </group>
   <group position={[0,1.16,0]}>
     <Ear x={-.45} rotation={.28}/><Ear x={.45} rotation={-.28}/>
     {[-1,1].map(side=><Orb key={side} position={[side*.51,.64,.04]} scale={[.22,.29,.19]} color="#bda596"/>)}
     <Orb position={[0,.10,0]} scale={[.79,.68,.68]} color="#c7b2a2"/>
     <Orb position={[0,-.19,.54]} scale={[.57,.30,.22]} color="#f1ddc5"/>
     {/* Full round cheeks, softly marked brow and forehead fur; all real geometry. */}
     {[-1,1].map(side=><group key={side}>
       <Orb position={[side*.46,-.20,.50]} scale={[.34,.27,.28]} color="#f0dec9"/>
       <Orb position={[side*.30,.52,.43]} scale={[.22,.09,.12]} color="#a89389"/>
       {Array.from({length:3},(_,i)=><mesh key={i} position={[side*(.63+i*.055),-.02-i*.12,.40]} rotation={[0,0,side*(.65+i*.2)]}>
         <coneGeometry args={[.10,.27-i*.03,5]}/><M color={i%2?"#c0ad9e":"#b19d92"}/>
       </mesh>)}
     </group>)}
     <Orb position={[0,.41,.61]} scale={[.13,.16,.083]} color="#dbc4b2"/>
     {/* Forward-facing amber eyes, dark pupils, warm highlights */}
     {[-.29,.29].map(x=><group key={x} position={[x*1.1,.15,.638]}>
       <Orb scale={[.205,.229,.078]} color="#463526"/>
       <mesh position={[0,0,.038]} scale={[.19,.212,.065]}><sphereGeometry args={[1,20,16]}/><meshPhysicalMaterial color="#e5a84d" roughness={.16} clearcoat={.82} clearcoatRoughness={.08}/></mesh>
       <Orb position={[.04,-.025,.089]} scale={[.052,.102,.009]} color="#f0bc63"/>
       <Orb position={[.015,0,.065]} scale={[.066,.13,.028]} color="#372c22"/>
       <Orb position={[-.04,.07,.095]} scale={[.027,.035,.014]} color="#fff9e5"/>
     </group>)}
     <group ref={eyelids} position={[0,.25,.707]} scale={[1,.01,1]}>
       {[-.29,.29].map(x=><Orb key={x} position={[x,0,0]} scale={[.17,.13,.03]} color="#c6afa0"/>)}
     </group>
     <Orb position={[0,-.22,.80]} scale={[.086,.055,.042]} color="#a9757b"/>
     <mesh position={[0,-.30,.80]} rotation={[0,0,Math.PI/2]}><torusGeometry args={[.055,.012,5,12,Math.PI]}/><M color="#6f5149"/></mesh>
     {[-1,1].flatMap(side=>[0,1,2].map(i=><mesh key={`${side}-${i}`} position={[side*.56,-.18+i*.065,.62]} rotation={[0,side*.25,side*(.12-i*.12)]}>
       <cylinderGeometry args={[.006,.006,.34,3]}/><M color="#f2e5d8"/>
     </mesh>))}
   </group>
   <group ref={paw} position={[-.50,.62,.25]} rotation={[0,0,-.19]}><Limb position={[-.09,-.05,.1]} rotation={[0,0,-1]} length={.57} color="#baa699"/><Orb position={[-.51,-.24,.17]} scale={[.17,.15,.16]} color="#d1bdb0"/></group>
   <group position={[.47,.53,.24]}><Limb position={[.1,-.06,.07]} rotation={[0,0,1.05]} length={.59} color="#b6a396"/><Orb position={[.50,-.30,.18]} scale={[.18,.15,.17]} color="#d5c0b2"/></group>
   {/* Juice pitcher: follows the cat's preparation gesture */}
   <group ref={pitcher} position={[-.86,.32,.77]} rotation={[0,0,-.35]}>
     <mesh><cylinderGeometry args={[.22,.17,.39,12]}/><meshPhysicalMaterial color="#c9eee0" transparent opacity={.47} roughness={.12}/></mesh>
     <mesh position={[0,-.085,0]}><cylinderGeometry args={[.16,.15,.18,12]}/><M color="#7ab065"/></mesh>
     <mesh position={[.26,0,0]} rotation={[0,0,Math.PI/2]}><torusGeometry args={[.16,.035,7,12]}/><M color="#dbeadd"/></mesh>
   </group>
   <mesh ref={juiceStream} position={[-1.14,-.04,.97]} visible={false}>
     <cylinderGeometry args={[.028,.015,.54,7]}/><meshPhysicalMaterial color="#e9a74c" transparent opacity={.73} roughness={.22}/>
   </mesh>
   <group position={[-1.13,-.12,1.0]}>
     <mesh><cylinderGeometry args={[.21,.15,.31,16]}/><meshPhysicalMaterial color="#f2e9cf" transparent opacity={.7} roughness={.18}/></mesh>
     <mesh position={[0,-.08,0]}><cylinderGeometry args={[.14,.135,.13,16]}/><M color="#edb356"/></mesh>
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
 const strideWeight=useRef(0);
 useFrame(({clock},delta)=>{
   const c=controls.current;if(!c||!root.current)return;
   const moving=!c.locked&&(c.autoWalk||c.keys.size>0);
   root.current.position.set(c.x,0,c.z);root.current.rotation.y=Math.PI+c.yaw;
   // Damped locomotion prevents legs snapping between walk and idle on key release.
   strideWeight.current=THREE.MathUtils.damp(strideWeight.current,moving&&!reducedMotion?1:0,10,Math.min(delta,.1));
   const stride=Math.sin(clock.elapsedTime*9)*.55*strideWeight.current;
   if(left.current)left.current.rotation.x=stride;
   if(right.current)right.current.rotation.x=-stride;
   if(armL.current)armL.current.rotation.x=-stride*.65;
   if(armR.current)armR.current.rotation.x=stride*.65;
   root.current.position.y=reducedMotion?0:Math.abs(Math.sin(clock.elapsedTime*9))*.027*strideWeight.current;
 });
 return <group ref={root} position={[0,0,9.4]}>
   {/* Rounded hoodie and oversized chibi head, modelled in actual geometry. */}
   <Orb position={[0,1.18,0]} scale={[.38,.48,.30]} color="#fff0dd"/>
   <Orb position={[0,.98,.20]} scale={[.29,.20,.16]} color="#e4e8d9"/>
   <Orb position={[0,1.80,0]} scale={[.43,.44,.41]} color="#efc7a7"/>
   <Orb position={[0,2.06,-.05]} scale={[.455,.255,.44]} color="#573a2b"/>
   {[-1,0,1].flatMap(row=>[-2,-1,0,1,2].map(col=>
     <Orb key={`${row}-${col}`} position={[col*.168+(row%2)*.03,2.04+Math.cos(col*.63)*.075,row*.16-.10]}
       scale={[.14,.14,.145]} color={Math.abs(col)%2?"#674735":"#503529"}/>
   ))}
   <Orb position={[0,2.23,-.22]} scale={[.18,.16,.18]} color="#674735"/>
   {[-1,1].map(side=><group key={side}>
     <Orb position={[side*.40,1.77,.01]} scale={[.09,.14,.09]} color="#edbd9d"/>
     <Orb position={[side*.24,1.80,.36]} scale={[.10,.13,.035]} color="#fffaf0"/>
     <Orb position={[side*.24,1.78,.39]} scale={[.06,.09,.019]} color="#463427"/>
     <Orb position={[side*.25,1.82,.414]} scale={[.02,.03,.01]} color="#fffefd"/>
     <Orb position={[side*.32,1.67,.34]} scale={[.095,.045,.026]} color="#eaa7a0"/>
   </group>)}
   <Orb position={[0,1.63,.41]} scale={[.06,.03,.02]} color="#b47f72"/>
   {[-.18,.18].map((x,i)=><group key={i} ref={i===0?left:right} position={[x,.89,0]}>
     <Limb position={[0,-.27,0]} length={.70} color="#60856a"/>
     <Orb position={[0,-.69,.095]} scale={[.18,.12,.27]} color="#fff8ed"/>
     <Orb position={[0,-.69,.32]} scale={[.14,.07,.055]} color="#dba97b"/>
   </group>)}
   {[-.43,.43].map((x,i)=><group key={i} ref={i===0?armL:armR} position={[x,1.49,0]}>
     <Orb position={[0,-.24,0]} scale={[.17,.33,.18]} color="#fbf0dc"/>
     <Orb position={[0,-.46,0]} scale={[.16,.10,.16]} color="#d9e4d4"/>
     <Orb position={[0,-.54,.035]} scale={[.13,.13,.14]} color="#edc09f"/>
   </group>)}
   <group position={[0,1.20,-.36]}>
     <Orb scale={[.34,.42,.20]} color="#1c6544"/>
     <Orb position={[0,-.17,-.19]} scale={[.27,.20,.075]} color="#277a53"/>
     <Orb position={[0,.07,-.21]} scale={[.10,.068,.018]} color="#c9e8af"/>
     {[-.24,.24].map(x=><Orb key={x} position={[x,.26,.18]} scale={[.08,.29,.07]} color="#317d56"/>)}
   </group>
 </group>;
}

/** Customers add life to the scene; paths remain outside the player collision strip. */
export function WalkingCustomer({reducedMotion,variant=0}:{reducedMotion:boolean;variant?:number}){
 const root=useRef<THREE.Group>(null);const left=useRef<THREE.Group>(null),right=useRef<THREE.Group>(null);
 useFrame(({clock})=>{if(!root.current)return;const t=reducedMotion?0:clock.elapsedTime*.42+variant*Math.PI;
  root.current.position.set((variant?3.95:-4.0)+Math.sin(t)*.65,0,3.6+Math.cos(t)*1.3);
  // Follow the path tangent rather than sliding sideways across the garden.
  root.current.rotation.y=reducedMotion?0:Math.atan2(.65*Math.cos(t),-1.3*Math.sin(t));
  const step=reducedMotion?0:Math.sin(clock.elapsedTime*6)*.46;
  if(left.current)left.current.rotation.x=step;if(right.current)right.current.rotation.x=-step;
 });
 return <group ref={root} position={[-4,0,4]} rotation={[0,.2,0]}>
   <Orb position={[0,1.24,0]} scale={[.33,.46,.25]} color={variant?"#91a88c":"#ecdfbd"}/>
   <Orb position={[0,1.76,0]} scale={[.39,.39,.37]} color="#edc7aa"/>
   <Orb position={[0,2.03,-.04]} scale={[.40,.20,.38]} color={variant?"#584b3a":"#44342b"}/>
   {[-1,0,1].map(i=><Orb key={i} position={[i*.24,2.10,-.26]} scale={[.15,.15,.15]} color="#50392e"/>)}
   {[-1,1].map(side=><group key={side}><Orb position={[side*.21,1.78,.345]} scale={[.078,.096,.026]} color="#4c302b"/><Orb position={[side*.28,1.65,.32]} scale={[.088,.037,.020]} color="#e8a29c"/></group>)}
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
