"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import * as THREE from "three";

/**
 * Shin-chan-inspired employee for the Vườn Ép walk-up juice bar.
 *
 * Built as one consistent sculpted-chibi silhouette instead of putting a new
 * face on a differently-proportioned human rig (the old cat's main flaw).
 * Pinterest and official TV character images are visual references only:
 * no third-party character mesh, texture, illustration or rig is downloaded.
 *
 * The costume is recognisable from the oversized peach face, black bowl hair,
 * boldly arched eyebrows, red top, yellow shorts and yellow shoes. A removable
 * green apron makes the character read as a juice-shop worker.
 */
const PAL = {
  skin: "#f5c5a5",
  cheek: "#ecb598",
  hair: "#222327",
  brows: "#17191d",
  eye: "#151a20",
  shine: "#fffcf6",
  shirt: "#ec4643",
  sleeve: "#df3b39",
  shorts: "#f6c94f",
  sock: "#fff8ed",
  shoe: "#e3b343",
  apron: "#34825a",
  apronDark: "#24664a",
  straw: "#e8ecdd",
  juice: "#f2ac43",
} as const;

type V3 = [number,number,number];

function Puff({position,scale,color,detail=24}:{
 position:V3;scale:V3;color:string;detail?:number;
}){
 return <mesh position={position} scale={scale} castShadow>
  <sphereGeometry args={[1,detail,Math.max(12,Math.round(detail*.75))]}/>
  <meshStandardMaterial color={color} roughness={.81}/>
 </mesh>;
}

function OvalEye({x}: {x:number}){
 return <group position={[x,0,0]}>
  {/* Deep oversized glossy oval, not a realistic human eye. */}
  <mesh castShadow scale={[.175,.205,.065]}>
   <sphereGeometry args={[1,28,20]}/>
   <meshPhysicalMaterial color={PAL.eye} roughness={.17} clearcoat={.7}/>
  </mesh>
  <Puff position={[-.052,.074,.067]} scale={[.044,.051,.016]} color={PAL.shine}/>
  <Puff position={[.052,-.042,.069]} scale={[.019,.025,.013]} color="#fff1dc"/>
 </group>;
}

function ShinFace({eyes,mouth}:{
 eyes:React.RefObject<THREE.Group|null>;
 mouth:React.RefObject<THREE.Group|null>;
}){
 return <>
  {/* Generously rounded square cheek silhouette, signature broad forehead. */}
  <RoundedBox args={[1.65,1.27,1.17]} radius={.48} smoothness={8} castShadow>
   <meshStandardMaterial color={PAL.skin} roughness={.88}/>
  </RoundedBox>
  {[-1,1].map(side=><group key={side}>
   <Puff position={[side*.81,-.09,.02]} scale={[.23,.26,.24]} color={PAL.skin}/>
   <Puff position={[side*.52,-.25,.35]} scale={[.31,.26,.22]} color={PAL.skin}/>
   <Puff position={[side*.54,-.27,.54]} scale={[.125,.064,.023]} color={PAL.cheek}/>
   {/* Two thick expressive black eyebrows, higher and wider than the eyes */}
   <group position={[side*.34,.407,.565]} rotation={[0,0,-side*.26]}>
    <mesh castShadow>
     <capsuleGeometry args={[.102,.25,8,16]}/>
     <meshStandardMaterial color={PAL.brows} roughness={.65}/>
    </mesh>
   </group>
  </group>)}
  {/* Smooth black hair cap with a wide hairline and cartoon forelocks. */}
  <Puff position={[0,.555,-.105]} scale={[.80,.275,.54]} color={PAL.hair} detail={32}/>
  <Puff position={[0,.52,.332]} scale={[.73,.12,.17]} color={PAL.hair}/>
  {[-1,1].map(side=><Puff key={side} position={[side*.61,.47,.405]}
    scale={[.18,.14,.115]} color={PAL.hair}/>)}
  {/* Eyes pivot independently for a short wink every few seconds. */}
  <group ref={eyes} position={[0,.09,.606]}>
   <OvalEye x={-.35}/><OvalEye x={.35}/>
  </group>
  <Puff position={[0,-.17,.606]} scale={[.058,.045,.027]} color="#e1a282"/>
  <group ref={mouth} position={[0,-.365,.617]}>
   {/* Shin's tiny surprised 'O' face, readable from the player camera. */}
   <Puff position={[0,0,0]} scale={[.107,.137,.023]} color="#592f31"/>
   <Puff position={[0,-.056,.020]} scale={[.057,.032,.009]} color="#df7e80"/>
  </group>
 </>;
}

function ShirtAndApron(){
 return <group>
  {/* Rounded compact red shirt: shoulders stay visibly red around the apron. */}
  <RoundedBox args={[1.13,.99,.77]} radius={.31} smoothness={7}
    position={[0,1.45,-.025]} castShadow>
   <meshStandardMaterial color={PAL.shirt} roughness={.88}/>
  </RoundedBox>
  <RoundedBox args={[.69,.66,.09]} radius={.145} smoothness={5}
    position={[0,1.43,.383]} castShadow>
   <meshStandardMaterial color={PAL.apron} roughness={.91}/>
  </RoundedBox>
  {/* Forest-green bib straps + centre pocket; red remains the signature shirt. */}
  {[-.31,.31].map(x=><mesh key={x} position={[x,1.88,.385]}
      rotation={[0,0,x>0?.13:-.13]}>
   <boxGeometry args={[.072,.38,.055]}/>
   <meshStandardMaterial color={PAL.apronDark} roughness={.92}/>
  </mesh>)}
  <RoundedBox args={[.35,.19,.03]} radius={.058} smoothness={4}
      position={[0,1.29,.448]}>
   <meshStandardMaterial color={PAL.apronDark} roughness={.88}/>
  </RoundedBox>
  {/* Small embossed leaf mascot badge */}
  <Puff position={[0,1.62,.452]} scale={[.12,.062,.025]} color="#e3ecac"/>
  <mesh position={[.055,1.67,.451]} rotation={[0,0,-.55]}>
   <cylinderGeometry args={[.013,.013,.12,6]}/>
   <meshStandardMaterial color="#e3ecac"/>
  </mesh>
 </group>;
}

function Legs(){
 return <group>
  <RoundedBox args={[.89,.35,.60]} radius={.13} smoothness={5}
     position={[0,.895,-.04]} castShadow>
   <meshStandardMaterial color={PAL.shorts} roughness={.94}/>
  </RoundedBox>
  {[-1,1].map(side=><group key={side} position={[side*.235,0,0]}>
   <RoundedBox args={[.405,.37,.58]} radius={.12} smoothness={5}
      position={[0,.655,-.04]} castShadow>
    <meshStandardMaterial color={PAL.shorts} roughness={.93}/>
   </RoundedBox>
   <Puff position={[0,.37,-.06]} scale={[.147,.24,.16]} color={PAL.skin}/>
   <Puff position={[0,.16,.035]} scale={[.167,.12,.18]} color={PAL.sock}/>
   <Puff position={[0,.105,.17]} scale={[.225,.137,.34]} color={PAL.shoe}/>
   <Puff position={[0,.08,.44]} scale={[.17,.047,.07]} color="#f8dc8d"/>
  </group>)}
 </group>;
}

function JuiceInHand(){
 return <group position={[.18,-.10,.71]}>
  {/* Cup visibly above the real counter when the employee offers a drink. */}
  <mesh castShadow position={[0,.15,0]}>
   <cylinderGeometry args={[.175,.125,.35,18]}/>
   <meshPhysicalMaterial color="#f5e7c9" roughness={.21} transparent opacity={.9}/>
  </mesh>
  <mesh position={[0,.27,0]}><cylinderGeometry args={[.17,.17,.045,16]}/>
   <meshStandardMaterial color="#fffaf0" roughness={.48}/></mesh>
  <mesh position={[0,.08,.013]}><cylinderGeometry args={[.122,.113,.15,16]}/>
   <meshStandardMaterial color={PAL.juice} roughness={.46}/></mesh>
  <mesh position={[.039,.43,.005]} rotation={[0,0,-.18]}>
   <cylinderGeometry args={[.014,.014,.37,8]}/>
   <meshStandardMaterial color={PAL.straw} roughness={.68}/>
  </mesh>
  <Puff position={[.0,.10,.168]} scale={[.073,.043,.014]} color={PAL.apron}/>
 </group>;
}

function EmployeeArm({side,waving,carrying}:{
 side:-1|1;
 waving?:React.RefObject<THREE.Group|null>;
 carrying?:React.RefObject<THREE.Group|null>;
}){
 return <group ref={side<0?waving:carrying}
    position={[side*.565,1.83,.02]} rotation={[0,0,side*.19]}>
  <Puff position={[side*.05,-.105,0]} scale={[.205,.25,.23]}
     color={PAL.sleeve}/>
  <mesh castShadow position={[side*.07,-.34,.045]}
    rotation={[0,0,-side*.12]}>
   <capsuleGeometry args={[.137,.35,8,16]}/>
   <meshStandardMaterial color={PAL.skin} roughness={.89}/>
  </mesh>
  <Puff position={[side*.095,-.58,.08]} scale={[.17,.148,.158]}
     color={PAL.skin}/>
  {side>0&&<JuiceInHand/>}
 </group>;
}

/** No cat, no adult human body hidden underneath. This is one coherent
 * kid-proportioned figure with lightweight per-joint idle and serving motion.
 * Accessory motion is frozen when the user requests reduced motion.
 */
export function ShinBarista({reducedMotion=false}: {reducedMotion?:boolean}){
 const body=useRef<THREE.Group>(null);
 const head=useRef<THREE.Group>(null);
 const eyes=useRef<THREE.Group>(null);
 const mouth=useRef<THREE.Group>(null);
 const left=useRef<THREE.Group>(null);
 const right=useRef<THREE.Group>(null);
 useFrame(({clock},delta)=>{
  const t=clock.elapsedTime;
  const frame=Math.min(delta,.05);
  const active=!reducedMotion;
  if(body.current)body.current.position.y=THREE.MathUtils.damp(
    body.current.position.y,active?Math.sin(t*1.45)*.023:0,7,frame);
  if(head.current){
   head.current.rotation.z=THREE.MathUtils.damp(head.current.rotation.z,
     active?Math.sin(t*.83)*.033:0,7,frame);
   head.current.rotation.x=THREE.MathUtils.damp(head.current.rotation.x,
     active?Math.sin(t*.63)*.018:0,7,frame);
  }
  const phase=t%8;
  const blink=active&&phase>7.66?Math.sin((phase-7.66)/.34*Math.PI)**2:0;
  if(eyes.current)eyes.current.scale.y=Math.max(.045,1-blink*.96);
  const greeting=active&&phase<2?Math.sin(phase/2*Math.PI):0;
  if(left.current){
   left.current.rotation.z=THREE.MathUtils.damp(left.current.rotation.z,
     -.19-greeting*.92,7,frame);
   left.current.rotation.x=THREE.MathUtils.damp(left.current.rotation.x,
     greeting*.18,7,frame);
  }
  if(right.current)right.current.rotation.x=THREE.MathUtils.damp(
    right.current.rotation.x,active?-.07-Math.max(0,Math.sin(t*.92))*.20:0,7,frame);
  if(mouth.current)mouth.current.scale.y=active?.94+Math.sin(t*1.1)*.06:1;
 });
 return <group position={[0,0,-3.45]} rotation={[0,0,0]}>
  <group ref={body}>
   <Legs/>
   <ShirtAndApron/>
   <EmployeeArm side={-1} waving={left}/>
   <EmployeeArm side={1} carrying={right}/>
   <group ref={head} position={[0,2.48,.05]}>
    <ShinFace eyes={eyes} mouth={mouth}/>
   </group>
  </group>
 </group>;
}
