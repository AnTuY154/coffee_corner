"use client";
import {useRef} from "react";
import {useFrame} from "@react-three/fiber";
import * as THREE from "three";

function Wood({position,size,color="#a77a4d"}:{position:[number,number,number];size:[number,number,number];color?:string}){
 return <mesh position={position} castShadow><boxGeometry args={size}/><meshStandardMaterial color={color} roughness={.9}/></mesh>;
}
function FlowerCluster({position,amount=8}:{position:[number,number,number];amount?:number}){
 return <group position={position}>{Array.from({length:amount},(_,i)=>{const x=Math.sin(i*2.4)*.37,z=Math.cos(i*2.4)*.34;
 return <group key={i} position={[x,0,z]}>
  <mesh position={[0,.23,0]}><coneGeometry args={[.13,.44,6]}/><meshStandardMaterial color={i%2?"#58884a":"#81aa64"}/></mesh>
  <mesh position={[.05,.43,.03]}><sphereGeometry args={[.060,7,6]}/><meshStandardMaterial color="#f9e5ab"/></mesh>
  </group>;})}</group>;
}
function LeafyTree({position,scale=1,reducedMotion}:{position:[number,number,number];scale?:number;reducedMotion:boolean}){
 const crown=useRef<THREE.Group>(null);
 useFrame(({clock})=>{if(crown.current)crown.current.rotation.z=reducedMotion?0:Math.sin(clock.elapsedTime*.53+position[0])*.025;});
 return <group position={position} scale={scale}>
   <mesh castShadow position={[0,1.56,0]}><cylinderGeometry args={[.31,.52,3.2,9]}/><meshStandardMaterial color="#8e633e"/></mesh>
   <group ref={crown} position={[0,3.2,0]}>
    {Array.from({length:8},(_,i)=>{const a=i*Math.PI*2/8;return <mesh castShadow key={i} position={[Math.cos(a)*1.08,(i%3)*.35,Math.sin(a)*.85]} scale={[1.1,.92,1.05]}>
     <icosahedronGeometry args={[1.1,1]}/><meshStandardMaterial color={i%3===0?"#8fb568":i%3===1?"#699850":"#7da95e"} flatShading roughness={.9}/>
    </mesh>})}
   </group>
  </group>;
}
function GardenLamp({position,illuminate=false}:{position:[number,number,number];illuminate?:boolean}){
 return <group position={position}>
  <mesh><sphereGeometry args={[.14,10,8]}/><meshBasicMaterial color="#fff4c7"/></mesh>
  {illuminate&&<pointLight color="#ffdb8f" intensity={.55} distance={4.5}/>}
 </group>;
}
export function GardenDetails({reducedMotion,lowPower}:{reducedMotion:boolean;lowPower:boolean}){
 return <group>
  <LeafyTree position={[-9,0,5]} scale={1.3} reducedMotion={reducedMotion}/>
  <LeafyTree position={[9,0,5]} scale={1.18} reducedMotion={reducedMotion}/>
  <LeafyTree position={[-11,0,-7]} scale={1.6} reducedMotion={reducedMotion}/>
  <LeafyTree position={[11,0,-8]} scale={1.55} reducedMotion={reducedMotion}/>
  {/* Cafe pergola / outdoor seating left of the shop */}
  {[-10,-6.9].map(x=><Wood key={x} position={[x,2.0,1.3]} size={[.19,4,.19]}/>)}
  {[-10,-6.9].map(x=><Wood key={x} position={[x,2.0,5.4]} size={[.19,4,.19]}/>)}
  {Array.from({length:6},(_,i)=><Wood key={i} position={[-10+i*.63,4.1,3.35]} size={[.19,.14,4.4]}/>)}
  <Wood position={[-8.45,2.2,3.35]} size={[3.45,.12,4.5]}/>
  <mesh position={[-8.2,.92,3.25]}><cylinderGeometry args={[.91,.91,.15,12]}/><meshStandardMaterial color="#ac7748" roughness={.9}/></mesh>
  <mesh position={[-8.2,.48,3.25]}><cylinderGeometry args={[.08,.13,.84,8]}/><meshStandardMaterial color="#96633e"/></mesh>
  <Wood position={[-8.75,.52,4.0]} size={[.95,.17,.4]}/>
  <Wood position={[-7.85,.52,4.0]} size={[.95,.17,.4]}/>
  {/* Orange and cream stepping stone path */}
  {Array.from({length:12},(_,i)=>{
   const row=Math.floor(i/2);return <mesh key={i} position={[(i%2===0?-.8:.8)+(row%2)*.16,.01,2.25+row*1.52]} rotation={[-Math.PI/2,0,(i%3)*.08]}>
    <circleGeometry args={[.66,8]}/><meshStandardMaterial color={i%3===0?"#f3e8cc":"#e8dcc2"}/>
   </mesh>;
  })}
  {[-5.5,-4.5,4.6,5.6].map((x,i)=><FlowerCluster key={i} position={[x,.03,3.8+i%2*2.7]} amount={lowPower?4:9}/>)}
  <FlowerCluster position={[-8.1,0,6.7]} amount={lowPower?5:10}/>
  <FlowerCluster position={[8.2,0,7]} amount={lowPower?5:10}/>
  {/* The cord is a horizontal 3D line; cylinderGeometry points along Y by default.
      Correct rotation prevents the 15-metre pole cutting through the camera. */}
  <mesh position={[0,5.17,5.8]} rotation={[0,0,Math.PI/2]}>
    <cylinderGeometry args={[.018,.018,15.2,6]}/>
    <meshStandardMaterial color="#5a5942" roughness={.9}/>
  </mesh>
  {Array.from({length:lowPower?7:13},(_,i)=>{
    const x=lowPower?-5.8+i*1.9:-6.5+i*1.09;
    return <GardenLamp key={i} position={[x,5.17+.03*x,5.8]} illuminate={!lowPower&&(i===3||i===9)}/>;
  })}
 </group>;
}
