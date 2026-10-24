"use client";
import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { RoundedBox, Float } from "@react-three/drei";
import * as THREE from "three";
import type { ShopControls } from "./types";
import { cameraAnchor, stepMovement } from "./types";
import { CatBarista, PlayerAvatar, WalkingCustomer, GardenDog } from "./characters";
import { GardenDetails } from "./garden";
import { InWorldMenu } from "./in-world-menu";

const COLORS = {
  pine: "#235c3d", deep: "#1b4836", leaf: "#77a76a", lime: "#b3c989",
  wall: "#f1e9cf", warm: "#fff8e7", clay: "#d68e63", wood: "#a87147",
  darkWood: "#795033", citrus: "#f6af45", shade: "#eee2c8", stone: "#d8d5c4",
};

function Block({ position, size, color, radius=0.07, metalness=0, roughness=0.84, onClick }: {
  position: [number,number,number]; size: [number,number,number]; color: string; radius?: number;
  metalness?:number; roughness?:number; onClick?:()=>void;
}) {
  return <RoundedBox args={size} radius={radius} smoothness={3} position={position} onClick={onClick}>
    <meshStandardMaterial color={color} metalness={metalness} roughness={roughness}/>
  </RoundedBox>;
}
function Cylinder({ position, args, color, rotation, metalness=0, roughness=0.7 }: {
  position:[number,number,number]; args:[number,number,number,number?]; color:string;
  rotation?:[number,number,number];metalness?:number;roughness?:number;
}) {
  return <mesh position={position} rotation={rotation} castShadow receiveShadow>
    <cylinderGeometry args={args}/>
    <meshStandardMaterial color={color} metalness={metalness} roughness={roughness}/>
  </mesh>;
}
function Fruit({ type, position, size=0.22 }: {type:"orange"|"lemon"|"apple"|"strawberry"|"mango"|"lime";position:[number,number,number];size?:number}) {
  const shades:Record<string,string>={orange:"#ef9f35",lemon:"#f1cf55",apple:"#d54d45",strawberry:"#cb4c55",mango:"#efa94d",lime:"#93ac56"};
  return <group position={position}>
    <mesh scale={type==="mango"?[1.1,0.9,0.8]:type==="strawberry"?[0.9,1.1,0.9]:[1,1,1]} castShadow>
      {type==="strawberry"?<coneGeometry args={[size,size*2,10]}/>:<sphereGeometry args={[size,12,10]}/>}
      <meshStandardMaterial color={shades[type]} roughness={0.44}/>
    </mesh>
    <mesh position={[0,size*.95,0]} rotation={[0,0,-.35]}>
      <coneGeometry args={[size*.22,size*.6,5]}/><meshStandardMaterial color="#477645"/>
    </mesh>
  </group>;
}
function Pineapple({ position, scale=1 }: {position:[number,number,number];scale?:number}) {
  return <group position={position} scale={scale}>
    <mesh castShadow><cylinderGeometry args={[.17,.22,.55,10,1]}/><meshStandardMaterial color="#ddb04b" roughness={.8}/></mesh>
    {Array.from({length:6},(_,i)=><mesh key={i} position={[Math.sin(i*1.047)*.05,.34+(.05*(i%3)),Math.cos(i*1.047)*.05]} rotation={[Math.sin(i*1.047)*.65,0,Math.cos(i*1.047)*.65]}>
      <coneGeometry args={[.09,.5,5]}/><meshStandardMaterial color="#3e794d"/></mesh>)}
  </group>;
}
function Crate({ position, fruit="orange", rotation=0 }: {position:[number,number,number];fruit?:"orange"|"lemon"|"apple"|"strawberry"|"mango"|"lime";rotation?:number}) {
  return <group position={position} rotation={[0,rotation,0]}>
    <Block position={[0,.2,0]} size={[1.25,.42,.8]} color={COLORS.wood}/>
    <Block position={[0,.27,.42]} size={[1.3,.2,.08]} color={COLORS.darkWood}/>
    <Block position={[0,.27,-.42]} size={[1.3,.2,.08]} color={COLORS.darkWood}/>
    {Array.from({length:8},(_,i)=><Fruit key={i} type={fruit} size={fruit==="strawberry"?.13:.19} position={[-.43+(i%4)*.28,.5+(i%2)*.08,-.2+Math.floor(i/4)*.36]}/>)}
  </group>;
}
function Plant({ position, size=1 }: {position:[number,number,number];size?:number}) {
  return <group position={position} scale={size}>
    <Cylinder position={[0,.25,0]} args={[.31,.25,.52,8]} color="#c87956"/>
    <Cylinder position={[0,.52,0]} args={[.31,.31,.05,9]} color="#ae6349"/>
    <Cylinder position={[0,1,0]} args={[.07,.075,1.13,7]} color="#49683d"/>
    {Array.from({length:7},(_,i)=>{
      const a=i*Math.PI*2/7, len=.46+(i%2)*.18;
      return <group key={i} position={[Math.sin(a)*len*.5,1.12+(i%3)*.15,Math.cos(a)*len*.5]} rotation={[Math.sin(a)*.35,a,Math.cos(a)*-.42]}>
        <mesh scale={[.18,.45,.1]}><sphereGeometry args={[1,8,8]}/><meshStandardMaterial color={i%3===0?"#97b77d":"#598d59"} side={THREE.DoubleSide}/></mesh>
      </group>
    })}
  </group>;
}
function Cup({ position, color="#f2a04b", scale=1 }: {position:[number,number,number];color?:string;scale?:number}) {
  return <group position={position} scale={scale}>
    <Cylinder position={[0,.22,0]} args={[.18,.145,.45,20]} color={color} roughness={0.3}/>
    <Cylinder position={[0,.46,0]} args={[.2,.2,.055,20]} color="#f8f4e8"/>
    <Cylinder position={[.05,.68,0]} args={[.016,.016,.44,8]} color="#e9f0dd" rotation={[0,0,-.2]}/>
    <Block position={[0,.25,.174]} size={[.22,.11,.013]} color="#f5eacc" radius={.01}/>
  </group>;
}
function Blender({position,variant="mint"}:{position:[number,number,number];variant?:"mint"|"orange"}) {
  return <group position={position}>
    <Block position={[0,.15,0]} size={[.48,.32,.44]} color={variant==="mint"?"#91ab84":"#e0aa79"} radius={.08}/>
    <Cylinder position={[0,.51,0]} args={[.24,.18,.55,9]} color="#e0ece5" metalness={.18} roughness={.18}/>
    <Cylinder position={[0,.40,0]} args={[.2,.2,.25,9]} color={variant==="mint"?"#97be77":"#eea143"} roughness={.48}/>
    <Cylinder position={[0,.81,0]} args={[.26,.26,.10,9]} color="#546f57"/>
    <Cylinder position={[0,.13,.23]} args={[.05,.05,.04,12]} color="#e8ede2" rotation={[Math.PI/2,0,0]}/>
  </group>;
}
function Juicer({ position }: {position:[number,number,number]}) {
  return <group position={position}>
    <Block position={[0,.16,0]} size={[.8,.28,.48]} color="#c7cebb" metalness={.2}/>
    <Cylinder position={[.03,.54,-.08]} args={[.23,.3,.52,14]} color="#e6e6db" metalness={.45} roughness={.3}/>
    <Cylinder position={[.03,.93,-.08]} args={[.11,.23,.31,12]} color="#69816d"/>
    <Cylinder position={[.35,.55,.23]} args={[.03,.03,.4,10]} color="#bfcac1" rotation={[1.1,0,.4]}/>
    <Cup position={[.34,-.05,.46]} scale={.7}/>
  </group>;
}

// CanvasTexture signs make the storefront legible without font downloads or external 3D assets.
function ShopSign({ position, dimensions, main, sub, color=COLORS.deep, accent="#e4cf9f" }: {
  position:[number,number,number];dimensions:[number,number];main:string;sub:string;color?:string;accent?:string;
}) {
  const texture=useMemo(()=>{
    const canvas=document.createElement("canvas"); canvas.width=1024;canvas.height=256;
    const ctx=canvas.getContext("2d");
    if(ctx){ctx.fillStyle=color;ctx.fillRect(0,0,1024,256);ctx.strokeStyle=accent;ctx.lineWidth=6;ctx.strokeRect(17,17,990,222);ctx.textAlign="center";ctx.fillStyle="#fff9e8";
      ctx.font=main.length>14?"bold 69px Georgia":"bold 103px Georgia";ctx.fillText(main,512,137);
      ctx.font="bold 25px Arial";ctx.fillStyle=accent;ctx.fillText(sub.toUpperCase(),512,193);
    }
    const out=new THREE.CanvasTexture(canvas);out.colorSpace=THREE.SRGBColorSpace;out.anisotropy=4;return out;
  },[main,sub,color,accent]);
  useEffect(()=>()=>texture.dispose(),[texture]);
  return <mesh position={position}><planeGeometry args={dimensions}/><meshBasicMaterial map={texture} toneMapped={false}/></mesh>;
}
function StringLights() {
  return <group>
    {Array.from({length:11},(_,i)=>{
      const x=-6.1+i*1.22;
      const y=4.5-.27*Math.sin(i/10*Math.PI);
      return <group key={i} position={[x,y,1.2]}>
        <mesh><sphereGeometry args={[.09,8,8]}/><meshBasicMaterial color={i%3===0?"#fcd57a":"#ffe6a8"}/></mesh>
        {/* Emissive glass is cheap; only two shared lights illuminate the full string. */}
        {(i===2||i===8)&&<pointLight color="#ffcd82" intensity={.34} distance={3.5}/> }
      </group>;
    })}
    <mesh position={[0,4.75,1.2]}><boxGeometry args={[12.6,.023,.02]}/><meshStandardMaterial color="#d3ad68"/></mesh>
  </group>;
}
function ShopArchitecture({onCounterInteract,lowPower}:{onCounterInteract:()=>void;lowPower:boolean}) {
  return <group>
    <mesh rotation={[-Math.PI/2,0,0]} receiveShadow><planeGeometry args={[180,180]}/><meshStandardMaterial color="#dce7d0"/></mesh>
    <mesh position={[0,-.045,3]} rotation={[-Math.PI/2,0,0]} receiveShadow><planeGeometry args={[12.8,22]}/><meshStandardMaterial color="#eadfce"/></mesh>
    {/* Pavement & tiled approach */}
    {Array.from({length:9},(_,i)=><mesh key={i} position={[(i%2===0?-.2:.2),-.028,4+i*.85]} rotation={[-Math.PI/2,0,0]}><planeGeometry args={[5.4,.02]}/><meshStandardMaterial color="#f8f4e9"/></mesh>)}
    <Block position={[0,2.6,-6.9]} size={[12.3,5.25,.4]} color={COLORS.wall}/>
    <Block position={[-6,2.85,-3.8]} size={[.33,5.85,6.7]} color={COLORS.pine}/>
    <Block position={[6,2.85,-3.8]} size={[.33,5.85,6.7]} color={COLORS.pine}/>
    <Block position={[0,5.7,-3.65]} size={[12.8,.34,7.25]} color="#56774f"/>
    <Block position={[0,5.55,-.32]} size={[13,.28,1.2]} color={COLORS.deep}/>
    <Block position={[0,4.3,-6.65]} size={[10.7,.16,.15]} color="#c7b999"/>
    <ShopSign position={[0,4.67,-.935]} dimensions={[7.45,1.66]} main="VƯỜN ÉP" sub="JUICE BAR  •  TƯƠI TỪ TRÁI CHÍN"/>
    {/* Striped market awning */}
    {Array.from({length:13},(_,i)=><mesh key={i} position={[-5.7+i*.95,3.65,.02]} rotation={[.26,0,0]}>
      <boxGeometry args={[.96,.09,2.4]}/><meshStandardMaterial color={i%2===0?"#f6e5bf":"#62895d"}/>
    </mesh>)}
    <StringLights/>
    {/* Wooden service bar & tasting counter */}
    <Block position={[0,.76,-1.85]} size={[9.25,1.45,1.5]} color={COLORS.wood}/>
    {Array.from({length:8},(_,i)=><Block key={i} position={[-3.9+i*1.12,.76,-1.075]} size={[.06,1.24,.035]} color="#c89262" radius={.012}/>)}
    <Block position={[0,1.52,-1.75]} size={[9.8,.2,1.97]} color="#f5deb7" radius={.09}/>
    <Block position={[0,1.63,-2.5]} size={[9.35,.11,.13]} color="#967052" radius={.014}/>
    {/* Display shelves and decor */}
    {[-5.6,-4.35,-3.1].map((x,i)=><Block key={i} position={[x,2.9,-6.55]} size={[.11,2.5,.2]} color={COLORS.wood}/>)}
    {[2.55,3.58].map((y,i)=><Block key={i} position={[-4.34,y,-6.39]} size={[3.7,.13,.85]} color={COLORS.wood}/>)}
    {Array.from({length:5},(_,i)=><Cup key={i} position={[-5.6+i*.55,3.64,-6.35]} color={i%2===0?"#f3b157":"#b2c66e"} scale={.75}/>)}
    <Blender position={[-3.25,1.67,-2.08]} />
    <Blender position={[-2.38,1.67,-2.08]} variant="orange"/>
    <Juicer position={[-4.27,1.68,-2.06]}/>
    <Block position={[1.1,1.7,-1.87]} size={[1.05,.08,.7]} color="#e7be84" />
    <Fruit type="orange" position={[1.01,1.93,-1.9]} size={.22}/>
    <Fruit type="lemon" position={[1.43,1.91,-1.7]} size={.17}/>
    {/* Interactive display tablet */}
    <group position={[3.1,1.66,-1.88]} rotation={[-.32,0,0]} onClick={onCounterInteract}>
      <Block position={[0,.47,0]} size={[1.05,.8,.1]} color="#2d4536"/>
      <ShopSign position={[0,.46,.057]} dimensions={[.94,.68]} main="MENU" sub="CHẠM ĐỂ CHỌN" color="#2f624a"/>
      <Block position={[0,.03,.27]} size={[.7,.08,.52]} color="#566c58"/>
    </group>
    <Cup position={[4.1,1.66,-1.87]} scale={.82}/>
    <Cup position={[3.7,1.66,-2.43]} color="#e6b952" scale={.75}/>
    {/* Fruit baskets outside storefront */}
    <Crate position={[-5.3,.06,.1]} fruit="orange" rotation={-.25}/>
    <Crate position={[-4.8,.36,.15]} fruit="lime" rotation={.17}/>
    <Crate position={[5,.04,.05]} fruit="mango" rotation={.28}/>
    <Crate position={[5.2,.43,.02]} fruit="apple" rotation={-.12}/>
    <Pineapple position={[5.9,.49,.3]} />
    <Pineapple position={[-5.87,.56,.33]} scale={.9}/>
    <Plant position={[-6.45,0,-.05]} size={1.8}/>
    <Plant position={[6.55,0,-.1]} size={1.65}/>
    <Plant position={[-5.6,0,5.5]} size={1.3}/>
    <Plant position={[5.75,0,5.2]} size={1.3}/>
    {/* Chalkboard next to queue */}
    <Block position={[-5.5,1.5,2.1]} size={[1.7,2.6,.18]} color="#93623f" radius={.08}/>
    <ShopSign position={[-5.5,1.56,2.2]} dimensions={[1.53,2.33]} main="FRESH" sub="NƯỚC ÉP MỖI MÙA" color="#214b3c"/>
    <Block position={[-5.95,.26,2.15]} size={[.12,.55,.6]} color="#93623f"/>
    <Block position={[-5.05,.26,2.15]} size={[.12,.55,.6]} color="#93623f"/>
    {/* Floor planter separators and stepping stones */}
    {Array.from({length:12},(_,i)=><mesh key={i} position={[(i%2===0?-1:1)*(3+(i%3)*.85),-.006,3.6+Math.floor(i/2)*1.05]} rotation={[-Math.PI/2,0,(i%4)*.5]}>
      <circleGeometry args={[.26+(i%3)*.05,9]}/><meshStandardMaterial color="#d0cfb4"/>
    </mesh>)}
    <ambientLight intensity={.55}/><hemisphereLight color="#fff9d8" groundColor="#617c50" intensity={.95}/>
    <directionalLight position={[-5,10,5]} intensity={2.0} color="#fff4da" castShadow={!lowPower} shadow-mapSize={[1024,1024]} shadow-camera-left={-12} shadow-camera-right={12} shadow-camera-top={12} shadow-camera-bottom={-12}/>
  </group>;
}

function SkyDecor({reducedMotion}:{reducedMotion:boolean}) {
  const deco=<group>
    <mesh position={[-3.3,7.45,-3.8]} rotation={[0,0,.3]}><icosahedronGeometry args={[.24,0]}/><meshStandardMaterial color="#e8bc67"/></mesh>
    <mesh position={[3.1,7.17,-3.0]} rotation={[.2,0,-.3]}><octahedronGeometry args={[.16,0]}/><meshStandardMaterial color="#a3bc75"/></mesh>
    <mesh position={[-2.2,6.72,-2.5]} rotation={[0,0,.45]}><coneGeometry args={[.16,.33,6]}/><meshStandardMaterial color="#71966a"/></mesh>
  </group>;
  return reducedMotion?deco:<Float speed={1.4} rotationIntensity={.15} floatIntensity={.3}>{deco}</Float>;
}
function ThirdPersonCamera({controls,menuOpen,onNearChange,onArrive}: {
  controls:React.RefObject<ShopControls>;menuOpen:boolean;
  onNearChange:(near:boolean)=>void;onArrive:()=>void;
}) {
  const nearRef=useRef(false);
  const dest=useMemo(()=>new THREE.Vector3(),[]);
  const target=useMemo(()=>new THREE.Vector3(),[]);
  const smoothTarget=useMemo(()=>new THREE.Vector3(0,1.83,4),[]);
  useFrame(({camera,size},delta)=>{
    const c=controls.current;if(!c)return;
    const {near,arrived}=stepMovement(c,delta);
    const compact=size.width<680;
    if(menuOpen){
      dest.set(0,compact?3.25:3.02,compact?8.15:7.5);
      target.set(0,2.65,1.1);
    }else{
      const anchor=cameraAnchor(c,compact);
      dest.set(...anchor.position);
      target.set(...anchor.lookAt);
    }
    camera.position.lerp(dest,1-Math.exp(-5*Math.min(delta,.06)));
    // The camera looks over the player's shoulder; it is not a first-person view.
    smoothTarget.lerp(target,1-Math.exp(-8*Math.min(delta,.06)));
    camera.lookAt(smoothTarget);
    if(near!==nearRef.current){nearRef.current=near;onNearChange(near);}
    if(arrived)onArrive();
  });
  return null;
}
export function ShopWorld({controls,menuOpen,cartCount,onAdd,onCheckout,onCloseMenu,onNearChange,onArrive,onCounterInteract,onApproach,reducedMotion,lowPower,onCanvasError}: {
  controls:React.RefObject<ShopControls>;
  menuOpen:boolean;
  cartCount:number;
  onAdd:(id:string)=>void;
  onCheckout:()=>void;
  onCloseMenu:()=>void;
  onNearChange:(near:boolean)=>void;
  onArrive:()=>void;
  onCounterInteract:()=>void;
  onApproach:()=>void;
  reducedMotion:boolean;
  lowPower:boolean;
  onCanvasError:()=>void;
}) {
  return <Canvas
    camera={{position:[0,2.9,13.8],fov:59,near:.08,far:160}}
    dpr={lowPower?[1,1.2]:[1,1.65]}
    gl={{antialias:!lowPower,powerPreference:"high-performance",alpha:false}}
    shadows={!lowPower}
    onCreated={({gl})=>{
      gl.setClearColor("#cee7d0");
      gl.toneMapping=THREE.ACESFilmicToneMapping;
      gl.toneMappingExposure=1.12;
      gl.domElement.addEventListener("webglcontextlost",onCanvasError,{once:true});
    }}
    fallback={<div className="shop-webgl-fallback">Thiết bị không hỗ trợ WebGL.</div>}
  >
    <fog attach="fog" args={["#cee7d0",28,86]}/>
    <ShopArchitecture onCounterInteract={onCounterInteract} lowPower={lowPower}/>
    {/* Touchable 3D wayfinding sign, not a 2D overlay. */}
    <group onClick={e=>{e.stopPropagation();onApproach();}} position={[3.4,1.3,6.6]} rotation={[0,-.2,0]}>
      <Block position={[0,-.6,-.15]} size={[.11,1.9,.11]} color="#996845"/>
      <ShopSign position={[0,.27,.02]} dimensions={[2.3,1.02]} main="VÀO QUẦY" sub="CHẠM HOẶC NHẤN E" color="#1b583e"/>
    </group>
    <GardenDetails reducedMotion={reducedMotion} lowPower={lowPower}/>
    <CatBarista reducedMotion={reducedMotion}/>
    <WalkingCustomer reducedMotion={reducedMotion}/>
    {!lowPower&&<WalkingCustomer reducedMotion={reducedMotion} variant={1}/>}
    <GardenDog reducedMotion={reducedMotion}/>
    <PlayerAvatar controls={controls} reducedMotion={reducedMotion}/>
    <SkyDecor reducedMotion={reducedMotion}/>
    <InWorldMenu open={menuOpen} count={cartCount} onAdd={onAdd} onClose={onCloseMenu} onCheckout={onCheckout}/>
    <ThirdPersonCamera controls={controls} menuOpen={menuOpen} onNearChange={onNearChange} onArrive={onArrive}/>
  </Canvas>;
}
