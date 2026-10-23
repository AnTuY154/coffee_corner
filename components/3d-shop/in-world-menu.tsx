"use client";
import {useEffect,useMemo,useState} from "react";
import {useThree} from "@react-three/fiber";
import * as THREE from "three";
import {currency,products,seasons,seasonOrder,type SeasonKey} from "@/data/catalog";

type Props={open:boolean;count:number;onAdd:(id:string)=>void;onClose:()=>void;onCheckout:()=>void};
const dark="#194b34",cream="#f8f2d9",gold="#eecb81";

/** All UI in this component is mesh geometry with textures, not DOM panels or an HTML overlay. */
function Printed({position,size,lines,background=dark,ink=cream,align="center"}:{
 position:[number,number,number];size:[number,number];lines:{text:string,size?:number,weight?:string,color?:string}[];
 background?:string;ink?:string;align?:CanvasTextAlign;
}){
 const texture=useMemo(()=>{
  const c=document.createElement("canvas");c.width=1024;c.height=256;const ctx=c.getContext("2d");
  if(ctx){ctx.fillStyle=background;ctx.fillRect(0,0,c.width,c.height);ctx.textAlign=align;ctx.textBaseline="middle";
   const lineH=220/Math.max(1,lines.length);const x=align==="left"?38:align==="right"?990:512;
   lines.forEach((line,i)=>{ctx.fillStyle=line.color||ink;ctx.font=`${line.weight||"bold"} ${line.size||Math.min(108,lineH*.65)}px Arial, sans-serif`;ctx.fillText(line.text,x,28+(i+.5)*lineH,948);});
  }
  const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=4;return t;
 },[lines.map(l=>`${l.text}:${l.size}:${l.color}`).join("|"),background,ink,align]);
 useEffect(()=>()=>texture.dispose(),[texture]);
 return <mesh position={position}><planeGeometry args={size}/><meshBasicMaterial map={texture} toneMapped={false}/></mesh>;
}
function Key({position,size,label,onClick,tone="green"}:{position:[number,number,number];size:[number,number];label:string;onClick:()=>void;tone?:"green"|"cream"|"gold"}){
 const bg=tone==="green"?"#27694a":tone==="gold"?"#efd38d":"#f6e9cb";
 const fg=tone==="cream"?dark:tone==="gold"?"#274b38":"#fff7e4";
 const [hover,setHover]=useState(false);
 return <group position={position} onClick={e=>{e.stopPropagation();onClick();}} onPointerOver={e=>{e.stopPropagation();setHover(true);document.body.style.cursor="pointer";}} onPointerOut={()=>{setHover(false);document.body.style.cursor="";}}>
   <mesh scale={hover?[1.035,1.035,1]:[1,1,1]}>
     <boxGeometry args={[size[0],size[1],.09]}/><meshStandardMaterial color={bg} emissive={hover?"#355b2d":"#000000"} emissiveIntensity={hover ? .17 : 0}/>
   </mesh>
   <Printed position={[0,0,.07]} size={[size[0]*.95,size[1]*.82]} lines={[{text:label,size:80}]} background={bg} ink={fg}/>
 </group>;
}
export function InWorldMenu({open,count,onAdd,onClose,onCheckout}:Props){
 const [season,setSeason]=useState<SeasonKey>("spring"),[index,setIndex]=useState(0),[view,setView]=useState<"menu"|"basket">("menu"),[added,setAdded]=useState(false);
 const {size}=useThree();const compact=size.width<680;
 const current=products.filter(p=>p.season===season)[index];
 const setCollection=(offset:number)=>{const i=seasonOrder.indexOf(season);setSeason(seasonOrder[(i+offset+4)%4]);setIndex(0);setAdded(false);};
 useEffect(()=>{if(!open){setView("menu");setAdded(false);}},[open]);
 useEffect(()=>{if(!open)return;const listener=(e:KeyboardEvent)=>{
   if(e.code==="Escape"){e.preventDefault();onClose();}
   if(e.code==="ArrowLeft"||e.code==="KeyA"){e.preventDefault();setIndex(i=>(i+5)%6);}
   if(e.code==="ArrowRight"||e.code==="KeyD"){e.preventDefault();setIndex(i=>(i+1)%6);}
   if(e.code==="Digit1"||e.code==="Digit2"||e.code==="Digit3"||e.code==="Digit4"){
    setSeason(seasonOrder[Number(e.code.slice(-1))-1]);setIndex(0);
   }
   if(e.code==="Enter"&&view==="menu"){e.preventDefault();onAdd(current.id);setAdded(true);}
  };window.addEventListener("keydown",listener);return()=>window.removeEventListener("keydown",listener);
 },[open,onClose,onAdd,current.id,view]);
 if(!open)return null;
 const scale=compact ? .59 : 1;
 return <group position={[0,2.75,1.10]} scale={scale}>
  {/* Backlit wooden kiosk board, physically located in front of the counter. */}
  <mesh position={[0,0,-.14]} castShadow><boxGeometry args={[6.05,4.86,.22]}/><meshStandardMaterial color="#987144" roughness={.79}/></mesh>
  <mesh position={[0,0,-.01]}><boxGeometry args={[5.83,4.64,.12]}/><meshStandardMaterial color="#f8edce" roughness={.69}/></mesh>
  <Printed position={[0,2.02,.08]} size={[5.56,.47]} lines={[{text:"VƯỜN ÉP   •   THỰC ĐƠN THEO MÙA",size:58}]} background={dark}/>
  <Key position={[-2.4,1.39,.15]} size={[.72,.54]} label="◀" tone="cream" onClick={()=>setCollection(-1)}/>
  <Printed position={[0,1.39,.10]} size={[3.7,.60]} lines={[{text:seasons[season].label.toLocaleUpperCase("vi"),size:86},{text:seasons[season].months,size:39}]} background="#e4eacb" ink={dark}/>
  <Key position={[2.4,1.39,.15]} size={[.72,.54]} label="▶" tone="cream" onClick={()=>setCollection(1)}/>
  {view==="menu"?<>
    <group position={[-1.73,-.05,.10]}>
      <mesh position={[0,0,.02]}><circleGeometry args={[.94,32]}/><meshStandardMaterial color="#d6e3ba"/></mesh>
      <mesh position={[0,0,.08]}><cylinderGeometry args={[.60,.42,1.15,24]}/><meshStandardMaterial color={current.colors[0]} roughness={.3} transparent opacity={.83}/></mesh>
      <mesh position={[0,.61,.08]}><cylinderGeometry args={[.63,.63,.10,24]}/><meshStandardMaterial color="#fff8e2"/></mesh>
      <mesh position={[.13,.89,.08]} rotation={[0,0,-.17]}><cylinderGeometry args={[.035,.035,.55,8]}/><meshStandardMaterial color="#fffaf0"/></mesh>
    </group>
    <Printed position={[.88,.40,.15]} size={[3.36,.77]} lines={[{text:current.name.toLocaleUpperCase("vi"),size:77}]} background="#f8edce" ink={dark} align="left"/>
    <Printed position={[.88,-.14,.15]} size={[3.36,.45]} lines={[{text:current.flavour.slice(0,53),size:49}]} background="#f8edce" ink="#63745b" align="left"/>
    <Printed position={[.88,-.65,.15]} size={[3.36,.52]} lines={[{text:currency(current.price)+" / LY",size:88}]} background="#f8edce" ink="#ac7142" align="left"/>
    <Key position={[-2.3,-1.25,.18]} size={[.62,.55]} label="◀" onClick={()=>{setIndex(i=>(i+5)%6);setAdded(false);}}/>
    <Printed position={[-1.71,-1.25,.17]} size={[.57,.42]} lines={[{text:`${index+1}/6`,size:90}]} background="#f8edce" ink={dark}/>
    <Key position={[-1.1,-1.25,.18]} size={[.62,.55]} label="▶" onClick={()=>{setIndex(i=>(i+1)%6);setAdded(false);}}/>
    <Key position={[1.09,-1.25,.18]} size={[2.87,.63]} label={added?"✓ ĐÃ THÊM - THÊM NỮA":"+ THÊM VÀO GIỎ"} onClick={()=>{onAdd(current.id);setAdded(true);}}/>
  </>:<>
    <Printed position={[0,.34,.12]} size={[5.3,1.6]} lines={[{text:`GIỎ HÀNG: ${count} LY`,size:102},{text:count?"Các món đã chọn được lưu trên thiết bị":"Hãy chọn một ly nước ép trước nhé!",size:47}]} background="#e4eacb" ink={dark}/>
    <Key position={[0,-1.11,.15]} size={[3.6,.65]} label="TIẾP TỤC ĐẶT HÀNG →" onClick={onCheckout}/>
  </>}
  <Key position={[-1.59,-1.92,.16]} size={[2.23,.43]} label={view==="menu"?`GIỎ HÀNG (${count})`:"THỰC ĐƠN"} tone="gold" onClick={()=>setView(v=>v==="menu"?"basket":"menu")}/>
  <Key position={[1.59,-1.92,.16]} size={[2.23,.43]} label="ĐÓNG · ESC" tone="cream" onClick={onClose}/>
 </group>;
}
