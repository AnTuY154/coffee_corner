"use client";
import {Component, Suspense, useMemo, type ReactNode} from "react";
import {useGLTF} from "@react-three/drei";
import * as THREE from "three";

export type QuaterniusPropKind="garden-chair"|"garden-armchair"|"garden-couch"|"shop-bookcase"|"houseplant"|"waste-bin"|"garden-rug"|"fruit-crate";
export type QuaterniusPropProps={
 kind:QuaterniusPropKind;position:[number,number,number];
 height?:number;width?:number;size?:[number,number,number];rotation?:number;
 lowPower?:boolean;fallback?:ReactNode;
};
const BASE=process.env.NEXT_PUBLIC_BASE_PATH||"";
const PATHS:Record<QuaterniusPropKind,string>={
 "garden-chair":`${BASE}/models/quaternius/garden-chair.glb`,
 "garden-armchair":`${BASE}/models/quaternius/garden-armchair.glb`,
 "garden-couch":`${BASE}/models/quaternius/garden-couch.glb`,
 "shop-bookcase":`${BASE}/models/quaternius/shop-bookcase.glb`,
 houseplant:`${BASE}/models/quaternius/houseplant.glb`,
 "waste-bin":`${BASE}/models/quaternius/waste-bin.glb`,
 "garden-rug":`${BASE}/models/quaternius/garden-rug.glb`,
 "fruit-crate":`${BASE}/models/quaternius/fruit-crate.glb`,
};

/** Static asset instances are clones: never rescale or recolour Drei's shared GLTF scene. */
function Model({kind,position,height,width,size,rotation=0,lowPower=false}:QuaterniusPropProps){
 // GLBs use EXT_meshopt_compression: the third argument MUST be true.
 const {scene}=useGLTF(PATHS[kind],false,true);
 const model=useMemo(()=>{
  const copy=scene.clone(true);
  copy.traverse(object=>{
   const mesh=object as THREE.Mesh;
   if(mesh.isMesh){
    mesh.castShadow=!lowPower&&kind!=="garden-rug";
    mesh.receiveShadow=!lowPower;
    const original=Array.isArray(mesh.material)?mesh.material:[mesh.material];
    // Give Quaternius's blue lounge seating a warm sage upholstery without touching cached materials.
    if(kind==="garden-chair"||kind==="garden-couch"||kind==="fruit-crate"){
     const altered=original.map(material=>{
      if(!(material instanceof THREE.MeshStandardMaterial))return material;
      const duplicate=material.clone();
      if(kind==="fruit-crate"){
       if(/darkwood/i.test(duplicate.name))duplicate.color.set("#875d40");
       else if(/^wood$/i.test(duplicate.name))duplicate.color.set("#b88960");
      }else if(/chair|couch_blue/i.test(duplicate.name))duplicate.color.set("#88a787");
      return duplicate;
     });
     mesh.material=Array.isArray(mesh.material)?altered:altered[0];
    }
   }
  });
  return copy;
 },[scene,kind,lowPower]);
 const fit=useMemo(()=>{
  model.updateMatrixWorld(true);
  const bounds=new THREE.Box3().setFromObject(model,true);
  const sizeOf=bounds.getSize(new THREE.Vector3());
  const selectedSize=width?Math.max(sizeOf.x,sizeOf.z):sizeOf.y;
  const uniform=(width??height??1)/Math.max(selectedSize,.001);
  // Wooden produce bins are intentionally shallow. Scale authored geometry to the bin's
  // usable footprint rather than applying one square/cube dimension to every axis.
  const scales:[number,number,number]=size?[
   size[0]/Math.max(sizeOf.x,.001),
   size[1]/Math.max(sizeOf.y,.001),
   size[2]/Math.max(sizeOf.z,.001)
  ]:[uniform,uniform,uniform];
  return {
   scale:scales,
   x:-(bounds.min.x+bounds.max.x)*.5*scales[0],
   y:-bounds.min.y*scales[1],
   z:-(bounds.min.z+bounds.max.z)*.5*scales[2]
  };
 },[model,width,height,size]);
 return <group position={position} rotation={[0,rotation,0]}>
   <group position={[fit.x,fit.y,fit.z]} scale={fit.scale}>
     <primitive object={model}/>
   </group>
 </group>;
}

class AssetBoundary extends Component<{children:ReactNode;fallback:ReactNode},{failed:boolean}>{
 state={failed:false};
 static getDerivedStateFromError(){return {failed:true};}
 render(){return this.state.failed?this.props.fallback:this.props.children;}
}

/** Suspense + error fallback keep the shop playable if a specific GLB fails to load. */
export function QuaterniusProp({fallback=null,...props}:QuaterniusPropProps){
 return <AssetBoundary fallback={fallback}>
   <Suspense fallback={fallback}><Model {...props}/></Suspense>
 </AssetBoundary>;
}

const FLOWER_GLB=`${BASE}/models/quaternius/garden-flowers.glb`;
const FLOWER_VARIANTS=["Flower_1_Group","Flower_2_Group","Flower_3_Group","Flower_4_Group"] as const;

function FlowerModel({position,height,variant,lowPower}:{
 position:[number,number,number];height:number;variant:0|1|2|3;lowPower:boolean;
}){
 const {scene}=useGLTF(FLOWER_GLB,false,true);
 const model=useMemo(()=>{
  const original=scene.getObjectByName(FLOWER_VARIANTS[variant]);
  if(!original)throw new Error("Quaternius flower model missing: "+FLOWER_VARIANTS[variant]);
  const copy=original.clone(true);
  copy.traverse(obj=>{const mesh=obj as THREE.Mesh;if(mesh.isMesh){mesh.castShadow=!lowPower;mesh.receiveShadow=false;}});
  return copy;
 },[scene,variant,lowPower]);
 const bounds=useMemo(()=>{
  model.updateMatrixWorld(true);
  const box=new THREE.Box3().setFromObject(model,true);
  const h=Math.max(.001,box.max.y-box.min.y);
  const size=height/h;
  return {size,x:-(box.min.x+box.max.x)*size/2,y:-box.min.y*size,z:-(box.min.z+box.max.z)*size/2};
 },[model,height]);
 return <group position={position}>
  <group position={[bounds.x,bounds.y,bounds.z]} scale={bounds.size}><primitive object={model}/></group>
 </group>;
}
/** Select one real flower mesh from Quaternius's multi-asset GLB; never display all LODs together. */
export function QuaterniusFlowers({position,height=.62,variant=0,lowPower=false,fallback=null}:{
 position:[number,number,number];height?:number;variant?:0|1|2|3;lowPower?:boolean;fallback?:ReactNode;
}){
 return <AssetBoundary fallback={fallback}>
  <Suspense fallback={fallback}><FlowerModel position={position} height={height} variant={variant} lowPower={lowPower}/></Suspense>
 </AssetBoundary>;
}

/** Single-mesh selections from the official CC0 Stylized Nature MegaKit.
 * Do not mount the whole family scene: it includes every variant and .lod1 duplicate.
 */
export type QuaterniusNatureKind = "rock" | "grass" | "clover";
const NATURE_PATHS: Record<QuaterniusNatureKind, string> = {
 rock: `${BASE}/models/quaternius/garden-rocks.glb`,
 grass: `${BASE}/models/quaternius/garden-grass.glb`,
 clover: `${BASE}/models/quaternius/garden-clover.glb`,
};
const NATURE_VARIANTS: Record<QuaterniusNatureKind, readonly string[]> = {
 rock: ["Rock_Big_1","Rock_Big_2","Rock_Medium_1","Rock_Medium_3"],
 grass: ["Grass_Common_Short","Grass_Wide_Tall","Grass_Wispy_Short","Grass_Wispy_Tall"],
 clover: ["Clover_1","Clover_2"],
};
type NatureProps = {
 kind: QuaterniusNatureKind;
 position: [number,number,number];
 height: number;
 variant?: 0|1|2|3;
 rotation?: number;
 lowPower?: boolean;
 fallback?: ReactNode;
};
function NatureModel({kind,position,height,variant=0,rotation=0,lowPower=false}:NatureProps){
 const {scene}=useGLTF(NATURE_PATHS[kind],false,true);
 const model=useMemo(()=>{
  const key=NATURE_VARIANTS[kind][variant % NATURE_VARIANTS[kind].length];
  const original=scene.getObjectByName(key);
  if(!original)throw new Error("Quaternius "+kind+" variant missing: "+key);
  const copy=original.clone(true);
  copy.traverse(obj=>{
   const mesh=obj as THREE.Mesh;
   if(!mesh.isMesh)return;
   mesh.castShadow=!lowPower && kind==="rock";
   mesh.receiveShadow=!lowPower && kind==="rock";
  });
  return copy;
 },[scene,kind,variant,lowPower]);
 const fit=useMemo(()=>{
  model.updateMatrixWorld(true);
  const box=new THREE.Box3().setFromObject(model,true);
  const scale=height/Math.max(box.max.y-box.min.y,.001);
  return {
   scale,
   x:-(box.min.x+box.max.x)*scale*.5,
   y:-box.min.y*scale,
   z:-(box.min.z+box.max.z)*scale*.5
  };
 },[model,height]);
 return <group position={position} rotation={[0,rotation,0]}>
  <group position={[fit.x,fit.y,fit.z]} scale={fit.scale}><primitive object={model}/></group>
 </group>;
}
export function QuaterniusNature({fallback=null,...props}:NatureProps){
 return <AssetBoundary fallback={fallback}>
  <Suspense fallback={fallback}><NatureModel {...props}/></Suspense>
 </AssetBoundary>;
}
