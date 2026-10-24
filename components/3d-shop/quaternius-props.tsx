"use client";
import {Component, Suspense, useMemo, type ReactNode} from "react";
import {useGLTF} from "@react-three/drei";
import * as THREE from "three";

export type QuaterniusPropKind="garden-chair"|"garden-armchair"|"garden-couch"|"shop-bookcase"|"houseplant"|"waste-bin"|"garden-rug";
export type QuaterniusPropProps={
 kind:QuaterniusPropKind;position:[number,number,number];
 height?:number;width?:number;rotation?:number;
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
};

/** Static asset instances are clones: never rescale or recolour Drei's shared GLTF scene. */
function Model({kind,position,height,width,rotation=0,lowPower=false}:QuaterniusPropProps){
 const {scene}=useGLTF(PATHS[kind],false,false);
 const model=useMemo(()=>{
  const copy=scene.clone(true);
  copy.traverse(object=>{
   const mesh=object as THREE.Mesh;
   if(mesh.isMesh){
    mesh.castShadow=!lowPower&&kind!=="garden-rug";
    mesh.receiveShadow=!lowPower;
    const original=Array.isArray(mesh.material)?mesh.material:[mesh.material];
    // Give Quaternius's blue lounge seating a warm sage upholstery without touching cached materials.
    if(kind==="garden-chair"||kind==="garden-couch"){
     const altered=original.map(material=>{
      if(!(material instanceof THREE.MeshStandardMaterial))return material;
      const duplicate=material.clone();
      if(/chair|couch_blue/i.test(duplicate.name))duplicate.color.set("#88a787");
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
  const size=bounds.getSize(new THREE.Vector3());
  const selectedSize=width?Math.max(size.x,size.z):size.y;
  const scale=(width??height??1)/Math.max(selectedSize,.001);
  return {
   scale, x:-(bounds.min.x+bounds.max.x)*.5*scale,
   y:-bounds.min.y*scale,
   z:-(bounds.min.z+bounds.max.z)*.5*scale
  };
 },[model,width,height]);
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
 const {scene}=useGLTF(FLOWER_GLB,false,false);
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
