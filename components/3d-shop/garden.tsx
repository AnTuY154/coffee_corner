"use client";
import {useRef} from "react";
import {useFrame} from "@react-three/fiber";
import * as THREE from "three";
import {GardenModel} from "./garden-models";
import {QuaterniusProp,QuaterniusFlowers} from "./quaternius-props";
import {WEATHER_PROFILE,type WeatherMode} from "./weather";

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
function LeafyTree({position,scale=1,reducedMotion,weather}:{position:[number,number,number];scale?:number;reducedMotion:boolean;weather:WeatherMode}){
 const crown=useRef<THREE.Group>(null);
 useFrame(({clock})=>{if(crown.current)crown.current.rotation.z=reducedMotion?0:Math.sin(clock.elapsedTime*.53+position[0])*.025*WEATHER_PROFILE[weather].wind;});
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
export function GardenDetails({reducedMotion,lowPower,weather}:{reducedMotion:boolean;lowPower:boolean;weather:WeatherMode}){
 return <group>
  {/* Actual locally hosted Quaternius CC0 GLB foliage replaces previous blocky tree canopies. */}
  <GardenModel kind="tree-a" position={[-9,0,5]} height={7.2} weather={weather} reducedMotion={reducedMotion} lowPower={lowPower} phase={.8}/>
  <GardenModel kind="tree-b" position={[9,0,5]} height={6.8} weather={weather} reducedMotion={reducedMotion} lowPower={lowPower} phase={2.3}/>
  <GardenModel kind="tree-b" position={[-11,0,-7]} height={9.1} weather={weather} reducedMotion={reducedMotion} lowPower={lowPower} phase={1.8}/>
  <GardenModel kind="tree-a" position={[11,0,-8]} height={8.8} weather={weather} reducedMotion={reducedMotion} lowPower={lowPower} phase={3.2}/>
  <GardenModel kind="bush" position={[-7.15,0,7]} height={1.25} weather={weather} reducedMotion={reducedMotion} lowPower={lowPower} phase={.1}/>
  <GardenModel kind="bush" position={[7.2,0,7.1]} height={1.18} weather={weather} reducedMotion={reducedMotion} lowPower={lowPower} phase={2}/>
  {!lowPower&&<GardenModel kind="bush" position={[-9.8,0,1]} height={1.4} weather={weather} reducedMotion={reducedMotion} lowPower={lowPower} phase={4}/>}
  {/* Cafe pergola / outdoor seating left of the shop */}
  {[-10,-6.9].map(x=><Wood key={x} position={[x,2.0,1.3]} size={[.19,4,.19]}/>)}
  {[-10,-6.9].map(x=><Wood key={x} position={[x,2.0,5.4]} size={[.19,4,.19]}/>)}
  {Array.from({length:6},(_,i)=><Wood key={i} position={[-10+i*.63,4.1,3.35]} size={[.19,.14,4.4]}/>)}
  {/* Actual Quaternius GLB furniture softens the garden seating area. */}
  <QuaterniusProp kind="garden-rug" position={[-8.45,.018,3.35]} width={3.25} lowPower={lowPower}/>
  <QuaterniusProp kind="garden-couch" position={[-8.45,0,4.25]} height={1.2} rotation={Math.PI} lowPower={lowPower}/>
  <QuaterniusProp kind="garden-chair" position={[-7.15,0,2.65]} height={1.22} rotation={-1.28} lowPower={lowPower}/>
  <QuaterniusProp kind="garden-armchair" position={[-9.82,0,2.65]} height={1.15} rotation={1.3} lowPower={lowPower}/>
  {/* Table remains a small collision-free mesh to preserve the intended tabletop height. */}
  <mesh position={[-8.4,.71,3.12]}><cylinderGeometry args={[.59,.57,.09,16]}/><meshStandardMaterial color="#c28e5f" roughness={.85}/></mesh>
  <Wood position={[-8.4,.36,3.12]} size={[.13,.65,.13]}/>
  {/* Orange and cream stepping stone path */}
  {Array.from({length:12},(_,i)=>{
   const row=Math.floor(i/2);return <mesh key={i} position={[(i%2===0?-.8:.8)+(row%2)*.16,.01,2.25+row*1.52]} rotation={[-Math.PI/2,0,(i%3)*.08]}>
    <circleGeometry args={[.66,8]}/><meshStandardMaterial color={i%3===0?"#f3e8cc":"#e8dcc2"}/>
   </mesh>;
  })}
  {/* Grouped flowers are now actual Quaternius MegaKit GLB meshes (each variant selects one node). */}
  {[-5.5,-4.5,4.6,5.6].map((x,i)=><QuaterniusFlowers key={i}
    position={[x,.03,3.8+i%2*2.7]} variant={(i%4) as 0|1|2|3} lowPower={lowPower} height={.72}
    fallback={<FlowerCluster position={[x,.03,3.8+i%2*2.7]} amount={lowPower?4:9}/>}/>)}
  <QuaterniusFlowers position={[-8.1,0,6.7]} lowPower={lowPower} variant={2} height={.9}
    fallback={<FlowerCluster position={[-8.1,0,6.7]} amount={lowPower?5:10}/>}/>
  <QuaterniusFlowers position={[8.2,0,7]} lowPower={lowPower} variant={3} height={.88}
    fallback={<FlowerCluster position={[8.2,0,7]} amount={lowPower?5:10}/>}/>
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
