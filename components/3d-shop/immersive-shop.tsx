"use client";
import dynamic from "next/dynamic";
import {useCallback,useEffect,useRef,useState} from "react";
import {useRouter} from "next/navigation";
import {useCart} from "@/components/cart-context";
import {COUNTER_NEAR_Z,START_POSITION,type MoveKey,type ShopControls} from "./types";

const World=dynamic(()=>import("./world").then(m=>m.ShopWorld),{
 ssr:false,loading:()=> <div className="shop-loading" role="status">Đang mở cửa Vườn Ép 3D…</div>
});
const keyMap:Record<string,MoveKey>={KeyW:"forward",ArrowUp:"forward",KeyS:"back",ArrowDown:"back",KeyA:"left",ArrowLeft:"left",KeyD:"right",ArrowRight:"right"};
type Gesture={id:number;x:number;y:number;originX:number;originY:number;mode:"move"|"look"};

/** Entire customer experience is one WebGL Canvas. No HTML menu/HUD/covers. */
export function ImmersiveShop(){
 const router=useRouter();
 const controls=useRef<ShopControls>({keys:new Set(),x:START_POSITION.x,z:START_POSITION.z,yaw:0,pitch:0,autoWalk:false,locked:false});
 // One pointer per role: two fingers can walk and look simultaneously on mobile.
 const gestures=useRef<Map<number,Gesture>>(new Map());
 const [menuOpen,setMenuOpen]=useState(false);
 const [near,setNear]=useState(false);
 const [autowalkPending,setAutowalkPending]=useState(false);
 const [webglAvailable,setWebglAvailable]=useState<boolean|null>(null);
 const [reducedMotion,setReducedMotion]=useState(false);
 const [lowPower,setLowPower]=useState(false);
 const {add,count}=useCart();
 useEffect(()=>{
  try{const canvas=document.createElement("canvas");setWebglAvailable(!!(canvas.getContext("webgl2")||canvas.getContext("webgl")));}
  catch{setWebglAvailable(false);}
  setReducedMotion(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  setLowPower(window.innerWidth<760||(navigator.hardwareConcurrency>0&&navigator.hardwareConcurrency<=4));
 },[]);
 const openMenu=useCallback(()=>{
  if(controls.current.z<=COUNTER_NEAR_Z&&Math.abs(controls.current.x)<3.5){
   controls.current.locked=true;controls.current.keys.clear();controls.current.autoWalk=false;setMenuOpen(true);setAutowalkPending(false);
  }
 },[]);
 const closeMenu=useCallback(()=>{controls.current.locked=false;setMenuOpen(false);},[]);
 const goToCounter=useCallback(()=>{controls.current.keys.clear();controls.current.autoWalk=true;setAutowalkPending(true);},[]);
 const onArrive=useCallback(()=>{setNear(true);if(autowalkPending){controls.current.locked=true;setMenuOpen(true);setAutowalkPending(false);}},[autowalkPending]);
 const onNearChange=useCallback((v:boolean)=>setNear(v),[]);
 const addItem=useCallback((id:string)=>add(id),[add]);
 const checkout=useCallback(()=>router.push("/thanh-toan"),[router]);
 const press=useCallback((k:MoveKey,down:boolean)=>{if(menuOpen)return;
  if(down){controls.current.keys.add(k);controls.current.autoWalk=false;setAutowalkPending(false);}
  else controls.current.keys.delete(k);
 },[menuOpen]);
 useEffect(()=>{
  const down=(e:KeyboardEvent)=>{
   if(e.target instanceof HTMLElement && (e.target.matches("input,textarea,select")||e.target.isContentEditable))return;
   if(e.code==="Escape"&&menuOpen){closeMenu();e.preventDefault();return;}
   if(menuOpen)return;
   if(e.code==="KeyE"){e.preventDefault();if(near)openMenu();else goToCounter();return;}
   const k=keyMap[e.code];if(k){e.preventDefault();press(k,true);}
  };
  const up=(e:KeyboardEvent)=>{const k=keyMap[e.code];if(k)press(k,false);};
  const blur=()=>controls.current.keys.clear();
  window.addEventListener("keydown",down);window.addEventListener("keyup",up);window.addEventListener("blur",blur);
  return()=>{window.removeEventListener("keydown",down);window.removeEventListener("keyup",up);window.removeEventListener("blur",blur);};
 },[menuOpen,near,openMenu,closeMenu,goToCounter,press]);
 useEffect(()=>{document.body.style.overflow="hidden";return()=>{document.body.style.overflow="";};},[]);
 const handlePointerDown=(e:React.PointerEvent<HTMLElement>)=>{
  if(menuOpen||!(e.target instanceof Element)||!e.target.closest("canvas"))return;
  if(e.pointerType==="mouse"&&e.button!==0)return;
  const rect=e.currentTarget.getBoundingClientRect();
  const mode:"move"|"look"=e.pointerType==="touch"&&e.clientX<rect.left+rect.width*.48?"move":"look";
  if([...gestures.current.values()].some(p=>p.mode===mode))return;
  gestures.current.set(e.pointerId,{id:e.pointerId,x:e.clientX,y:e.clientY,originX:e.clientX,originY:e.clientY,mode});
 };
 const handlePointerMove=(e:React.PointerEvent<HTMLElement>)=>{
  const p=gestures.current.get(e.pointerId);if(!p||menuOpen)return;
  const dx=e.clientX-p.x,dy=e.clientY-p.y;
  if(p.mode==="look"){
   // Normalise angular heading; no artificial +/-1.2 radian turning limit.
   const yaw=controls.current.yaw-dx*.004;
   controls.current.yaw=Math.atan2(Math.sin(yaw),Math.cos(yaw));
   controls.current.pitch=Math.max(-.35,Math.min(.45,controls.current.pitch+dy*.002));
  }else{
   const sx=e.clientX-p.originX,sy=e.clientY-p.originY;
   // Invisible virtual joystick; the look pointer remains active independently.
   const x=Math.abs(sx)>18,y=Math.abs(sy)>18;
   for(const k of ["left","right","forward","back"] as const)controls.current.keys.delete(k);
   if(x)controls.current.keys.add(sx>0?"right":"left");
   if(y)controls.current.keys.add(sy<0?"forward":"back");
   if(x||y){controls.current.autoWalk=false;setAutowalkPending(false);}
  }
  p.x=e.clientX;p.y=e.clientY;
 };
 const handlePointerUp=(e:React.PointerEvent<HTMLElement>)=>{
  const p=gestures.current.get(e.pointerId);if(!p)return;
  gestures.current.delete(e.pointerId);
  if(p.mode==="move"){
   for(const k of ["left","right","forward","back"] as const)controls.current.keys.delete(k);
  }
 };
 const handleDoubleClick=()=>{if(menuOpen)return;if(near)openMenu();else goToCounter();};
 return <div className="ve-immersive-fullscreen" aria-label="Cửa hàng Vườn Ép nhập vai với mèo pha chế và nhân vật người chơi" onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} onPointerCancel={handlePointerUp} onDoubleClick={handleDoubleClick}>
   <p className="sr-only">Dùng WASD hoặc phím mũi tên để di chuyển avatar. Bấm E để tự đến quầy hoặc mở menu 3D khi đã đến gần. Kéo chuột để thay đổi hướng, trên điện thoại vuốt bên trái để đi và bên phải để nhìn. Tại bảng menu, chạm các nút 3D để đổi món hoặc thêm vào giỏ. Nhấn Escape để đóng bảng.</p>
   {webglAvailable===null&&<div className="shop-loading" role="status">Đang dựng cửa hàng 3D…</div>}
   {webglAvailable===false&&<div className="shop-static-fallback" role="status"><h1>Vườn Ép 3D</h1><p>Trình duyệt chưa hỗ trợ WebGL. Hãy bật tăng tốc phần cứng hoặc thử trình duyệt mới để vào quán.</p></div>}
   {webglAvailable===true&&<World controls={controls} menuOpen={menuOpen} cartCount={count} onAdd={addItem} onCheckout={checkout} onCloseMenu={closeMenu} onNearChange={onNearChange} onArrive={onArrive} onCounterInteract={openMenu} onApproach={goToCounter} reducedMotion={reducedMotion} lowPower={lowPower} onCanvasError={()=>setWebglAvailable(false)}/>}
 </div>;
}
