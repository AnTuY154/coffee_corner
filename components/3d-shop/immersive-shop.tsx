"use client";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, ArrowUp, ChevronDown, ChevronLeft, ChevronRight, ChevronUp, Check, GlassWater, Leaf, MapPin, Maximize, MousePointer2, Move, ShoppingBag, Sparkles, Volume2, VolumeX, X } from "lucide-react";
import { currency, products, seasons, seasonOrder, type SeasonKey } from "@/data/catalog";
import { useCart } from "@/components/cart-context";
import { COUNTER_NEAR_Z, START_POSITION, type MoveKey, type ShopControls } from "./types";

const World = dynamic(() => import("./world").then((m)=>m.ShopWorld), {
  ssr:false,
  loading:()=> <div className="shop-loading"><div className="shop-loading-sun"/><p>Đang mở cửa Vườn Ép…</p><span>Chuẩn bị quầy nước ép cho bạn</span></div>,
});

const keyMap:Record<string,MoveKey>={
  KeyW:"forward", ArrowUp:"forward", KeyS:"back", ArrowDown:"back",
  KeyA:"left", ArrowLeft:"left", KeyD:"right", ArrowRight:"right",
};

function ShopMenu({onClose}:{onClose:()=>void}) {
  const [season,setSeason]=useState<SeasonKey>(()=>{
    const month=Number(new Intl.DateTimeFormat("en-US",{timeZone:"Asia/Ho_Chi_Minh",month:"numeric"}).format(new Date()));
    return month<=3?"spring":month<=6?"summer":month<=9?"autumn":"winter";
  });
  const [justAdded,setJustAdded]=useState<string|null>(null);
  const [query,setQuery]=useState("");
  const {add,lines,count,subtotal}=useCart();
  const closeRef=useRef<HTMLButtonElement>(null);
  useEffect(()=>{
    const previous=document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    const onKey=(event:KeyboardEvent)=>{
      if(event.key==="Escape"){event.preventDefault();onClose();}
      if(event.key==="Tab"){
        const dialog=document.getElementById("shop-menu-dialog");
        const focusable=dialog?.querySelectorAll<HTMLElement>('a[href],button:not([disabled]),input:not([disabled])');
        if(!focusable?.length)return;
        const first=focusable[0];const last=focusable[focusable.length-1];
        if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}
        else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
      }
    };
    window.addEventListener("keydown",onKey);
    return ()=>{window.removeEventListener("keydown",onKey);previous?.focus?.();};
  },[onClose]);
  const selected=products.filter(p=>p.season===season && (p.name+" "+p.tagline).toLocaleLowerCase("vi").includes(query.trim().toLocaleLowerCase("vi")));
  return <div className="shop-menu-backdrop" onPointerDown={e=>e.stopPropagation()}>
    <div className="shop-menu-paper" id="shop-menu-dialog" role="dialog" aria-modal="true" aria-label="Thực đơn tại quầy Vườn Ép">
      <div className="shop-menu-head">
        <div><span className="shop-kicker">BẠN ĐÃ ĐẾN QUẦY · VƯỜN ÉP</span><h2>Chọn một ly <em>thật tươi.</em></h2><p>Chúng mình chuẩn bị theo mùa. Bạn muốn uống vị nào hôm nay?</p></div>
        <button ref={closeRef} type="button" className="shop-icon-button" aria-label="Đóng thực đơn và quay lại cửa hàng 3D" onClick={onClose}><X size={23}/></button>
      </div>
      <div className="shop-menu-seasons" role="group" aria-label="Chọn bộ sưu tập theo mùa">
        {seasonOrder.map(key=><button key={key} type="button" className={season===key?"selected":""} aria-pressed={season===key} onClick={()=>{setSeason(key);setQuery("");}}>
          <span aria-hidden="true">{seasons[key].emoji}</span> {seasons[key].label}
        </button>)}
      </div>
      <div className="shop-menu-toolbar"><div><strong>{seasons[season].label}</strong><span> · {seasons[season].months} · 6 món</span></div><label className="shop-search"><span className="sr-only">Tìm món nước ép</span><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Tìm một vị bạn thích…"/></label></div>
      <div className="shop-menu-products">
        {selected.map(product=>{
          const qty=lines.find(l=>l.id===product.id)?.quantity||0;
          return <article className="shop-menu-product" key={product.id}>
            <div className="shop-menu-product-image"><Image src={product.image} alt={`Minh hoạ món ${product.name}`} width={160} height={190}/></div>
            <div className="shop-menu-product-copy"><span>{product.method.toUpperCase()} · {product.tagline}</span><h3>{product.name}</h3><p>{product.flavour}</p><Link href={`/san-pham/${product.slug}`}>Xem công thức & nguyên liệu <ArrowRight size={12}/></Link></div>
            <div className="shop-menu-product-action"><strong>{currency(product.price)}</strong><button type="button" onClick={()=>{
              add(product.id);setJustAdded(product.id);window.setTimeout(()=>setJustAdded(null),950);
            }} aria-label={`Thêm ${product.name} vào giỏ${qty?` (đang có ${qty})`:""}`}>
              {justAdded===product.id?<Check size={15}/>:<ShoppingBag size={15}/>} <span>{qty?`Thêm · ${qty}`:"Chọn món"}</span>
            </button></div>
          </article>;
        })}
        {selected.length===0&&<p className="shop-menu-empty">Không tìm thấy món nào. Hãy thử tên khác nhé.</p>}
      </div>
      <div className="shop-menu-foot">
        <div><ShoppingBag size={21}/><div><strong>{count} món trong giỏ</strong><span>{count?`Tạm tính ${currency(subtotal)}`:"Chọn món bạn yêu thích"}</span></div></div>
        <div className="shop-menu-foot-actions"><button type="button" onClick={onClose}>Quay lại cửa hàng</button><Link href="/gio-hang" className="shop-checkout-link">Xem giỏ hàng <ArrowRight size={17}/></Link></div>
      </div>
    </div>
  </div>;
}

function MobileDirection({direction,children,onPress}:{direction:MoveKey;children:React.ReactNode;onPress:(key:MoveKey,pressed:boolean)=>void}){
  return <button type="button" aria-label={{forward:"Đi về phía quầy",back:"Đi lùi",left:"Đi sang trái",right:"Đi sang phải"}[direction]} className={`shop-dpad-${direction}`}
    onPointerDown={e=>{e.preventDefault();e.currentTarget.setPointerCapture(e.pointerId);onPress(direction,true);}}
    onPointerUp={e=>{onPress(direction,false);e.currentTarget.releasePointerCapture(e.pointerId);}}
    onPointerCancel={()=>onPress(direction,false)} onLostPointerCapture={()=>onPress(direction,false)}>{children}</button>;
}

export function ImmersiveShop(){
  const controls=useRef<ShopControls>({keys:new Set(),x:START_POSITION.x,z:START_POSITION.z,yaw:0,pitch:0,autoWalk:false,locked:false});
  const [started,setStarted]=useState(false);
  const [menuOpen,setMenuOpen]=useState(false);
  const [near,setNear]=useState(false);
  const [autowalkPending,setAutowalkPending]=useState(false);
  const [webglAvailable,setWebglAvailable]=useState<boolean|null>(null);
  const [lowPower,setLowPower]=useState(false);
  const [reducedMotion,setReducedMotion]=useState(false);
  const [audioEnabled,setAudioEnabled]=useState(false);
  const pointerRef=useRef<{x:number;y:number;active:boolean}>({x:0,y:0,active:false});
  const soundRef=useRef<AudioContext|null>(null);
  const {count}=useCart();
  useEffect(()=>{
    try{
      const test=document.createElement("canvas");
      const available=!!(test.getContext("webgl2")||test.getContext("webgl"));
      setWebglAvailable(available);
    }catch{setWebglAvailable(false);}
    setLowPower(window.innerWidth<760 || (navigator.hardwareConcurrency>0 && navigator.hardwareConcurrency<=4));
    setReducedMotion(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  },[]);
  const openMenu=useCallback(()=>{
    if(!started)return;
    if(near||controls.current.z<=COUNTER_NEAR_Z){controls.current.locked=true;setMenuOpen(true);setAutowalkPending(false);}
  },[near,started]);
  const closeMenu=useCallback(()=>{controls.current.locked=false;setMenuOpen(false);},[]);
  const goToCounter=useCallback((autoOpen:boolean)=>{
    setStarted(true);controls.current.autoWalk=true;
    setAutowalkPending(autoOpen);
    if(near){controls.current.autoWalk=false;if(autoOpen){controls.current.locked=true;setMenuOpen(true);setAutowalkPending(false);}}
  },[near]);
  const handleArrive=useCallback(()=>{
    setNear(true);
    if(autowalkPending){controls.current.locked=true;setMenuOpen(true);setAutowalkPending(false);}
  },[autowalkPending]);
  const onNearChange=useCallback((v:boolean)=>setNear(v),[]);
  const onCounterInteract=useCallback(()=>{
    if(controls.current.z<=COUNTER_NEAR_Z && Math.abs(controls.current.x)<3.5){
      controls.current.locked=true;setMenuOpen(true);
    }
  },[]);
  const press=useCallback((k:MoveKey,v:boolean)=>{
    if(v){controls.current.keys.add(k);setStarted(true);controls.current.autoWalk=false;setAutowalkPending(false);}
    else controls.current.keys.delete(k);
  },[]);
  useEffect(()=>{
    const onDown=(e:KeyboardEvent)=>{
      if((e.target instanceof HTMLElement) && (e.target.matches("input,textarea,select") || e.target.isContentEditable))return;
      if(e.code==="Escape"&&menuOpen){e.preventDefault();closeMenu();return;}
      if(menuOpen)return;
      if(e.code==="KeyE" && near){e.preventDefault();openMenu();return;}
      const k=keyMap[e.code];if(k){e.preventDefault();press(k,true);}
    };
    const onUp=(e:KeyboardEvent)=>{const k=keyMap[e.code];if(k){press(k,false);}};
    const reset=()=>controls.current.keys.clear();
    window.addEventListener("keydown",onDown);window.addEventListener("keyup",onUp);window.addEventListener("blur",reset);
    return ()=>{window.removeEventListener("keydown",onDown);window.removeEventListener("keyup",onUp);window.removeEventListener("blur",reset);};
  },[menuOpen,near,openMenu,closeMenu,press]);
  useEffect(()=>{
    if(menuOpen){document.body.style.overflow="hidden";controls.current.keys.clear();}
    return ()=>{document.body.style.overflow="";};
  },[menuOpen]);
  const pointerStart=(e:React.PointerEvent<HTMLDivElement>)=>{
    if(menuOpen||!(e.target instanceof Element)||!e.target.closest("canvas"))return;
    pointerRef.current={x:e.clientX,y:e.clientY,active:true};
  };
  const pointerMove=(e:React.PointerEvent<HTMLDivElement>)=>{
    const p=pointerRef.current;
    if(!p.active||menuOpen)return;
    controls.current.yaw=Math.max(-.95,Math.min(.95,controls.current.yaw-(e.clientX-p.x)*.0038));
    controls.current.pitch=Math.max(-.48,Math.min(.42,controls.current.pitch+(e.clientY-p.y)*.0022));
    p.x=e.clientX;p.y=e.clientY;
  };
  const playChime=()=>{
    try{
      const AudioCtx=window.AudioContext;
      if(!AudioCtx)return;
      const ctx=soundRef.current??new AudioCtx();soundRef.current=ctx;
      if(ctx.state==="suspended")void ctx.resume();
      const oscillator=ctx.createOscillator();const gain=ctx.createGain();
      oscillator.type="sine";oscillator.frequency.setValueAtTime(660,ctx.currentTime);oscillator.frequency.exponentialRampToValueAtTime(880,ctx.currentTime+.22);
      gain.gain.setValueAtTime(.0001,ctx.currentTime);gain.gain.exponentialRampToValueAtTime(.065,ctx.currentTime+.03);gain.gain.exponentialRampToValueAtTime(.0001,ctx.currentTime+.38);
      oscillator.connect(gain).connect(ctx.destination);oscillator.start();oscillator.stop(ctx.currentTime+.4);
    }catch{/* audio is entirely optional */}
  };
  const activateMenu=()=>{if(!near)goToCounter(true);else{openMenu();if(audioEnabled)playChime();}};
  useEffect(()=>()=>{void soundRef.current?.close();},[]);
  return <div className="shop-experience">
    <section className="shop-viewport" aria-label="Không gian cửa hàng nước ép 3D" onPointerDown={pointerStart} onPointerMove={pointerMove} onPointerUp={()=>pointerRef.current.active=false} onPointerCancel={()=>pointerRef.current.active=false}>
      {webglAvailable===null && <div className="shop-loading"><p>Đang chuẩn bị cửa hàng…</p></div>}
      {webglAvailable===true && <World controls={controls} onNearChange={onNearChange} onArrive={handleArrive} onCounterInteract={onCounterInteract} reducedMotion={reducedMotion} lowPower={lowPower} onCanvasError={()=>setWebglAvailable(false)}/>}
      {webglAvailable===false && <div className="shop-static-fallback"><Leaf size={55}/><h2>Vườn Ép vẫn chào đón bạn!</h2><p>Thiết bị hoặc trình duyệt của bạn chưa hỗ trợ cửa hàng 3D. Bạn vẫn có thể xem 24 món và đặt hàng bình thường.</p><Link className="shop-large-action" href="/menu">Mở thực đơn 2D <ArrowRight size={18}/></Link></div>}
      {webglAvailable===true && <>
        <div className="shop-hud-top"><span className="shop-hud-brand"><Leaf size={19}/> VƯỜN ÉP <small>3D JUICE BAR</small></span><span className="shop-live"><span/> CỬA HÀNG ĐANG CHÀO ĐÓN BẠN</span><Link href="/menu" className="shop-quick-exit">Menu 2D <ArrowRight size={14}/></Link></div>
        {!started && <div className="shop-welcome" role="region" aria-label="Chào mừng đến cửa hàng">
          <span className="shop-kicker"><Sparkles size={14}/> MỘT CHUYẾN GHÉ VƯỜN NHO NHỎ</span>
          <h1>Ghé Vườn,<br/><em>chọn một vị tươi.</em></h1>
          <p>Đi dạo tới quầy nước ép, ngắm trái cây và chọn món như đang ghé quán thật.</p>
          <div className="shop-welcome-actions"><button type="button" className="shop-large-action" onClick={()=>goToCounter(false)}>Bước vào cửa hàng <ArrowRight size={18}/></button><button type="button" className="shop-welcome-secondary" onClick={()=>goToCounter(true)}>Đi tới menu ngay</button></div>
          <span className="shop-welcome-hint"><Move size={15}/> WASD / phím mũi tên để đi · Kéo chuột để nhìn</span>
        </div>}
        {started && <>
          <div className="shop-status-pill"><MapPin size={15}/>{near?"ĐÃ ĐẾN QUẦY · SẴN SÀNG CHỌN MÓN":"DẠO BƯỚC TỚI QUẦY NƯỚC ÉP"}</div>
          {near&&!menuOpen && <button type="button" className="shop-interact" onClick={()=>{openMenu();if(audioEnabled)playChime();}}><span className="shop-keycap">E</span><span>Nhấn để <strong>mở thực đơn</strong></span><ChevronRight size={18}/></button>}
          {!menuOpen&& <div className="shop-control-bar"><div className="shop-hud-controls"><MousePointer2 size={15}/><span className="shop-control-desktop">Kéo để nhìn · WASD để đi · E để chọn món</span><span className="shop-control-mobile">Chạm và kéo để quan sát</span></div><button type="button" className="shop-counter-button" onClick={activateMenu}>{near?"Mở thực đơn":"Đi đến quầy & xem menu"} <ArrowRight size={16}/></button></div>}
          {!menuOpen&&<div className="shop-mobile-pad" aria-label="Điều khiển di chuyển">
            <MobileDirection direction="forward" onPress={press}><ChevronUp size={25}/></MobileDirection>
            <MobileDirection direction="left" onPress={press}><ChevronLeft size={25}/></MobileDirection>
            <MobileDirection direction="back" onPress={press}><ChevronDown size={25}/></MobileDirection>
            <MobileDirection direction="right" onPress={press}><ChevronRight size={25}/></MobileDirection>
          </div>}
        </>}
        <div className="shop-hud-bottom"><span><GlassWater size={17}/> 24 VỊ NƯỚC ÉP • 4 MÙA</span><Link href="/gio-hang" aria-label={`Xem giỏ hàng có ${count} món`}><ShoppingBag size={17}/> Giỏ hàng {count>0?`(${count})`:""}</Link></div>
        <button type="button" className="shop-sound" onClick={()=>{if(!audioEnabled)playChime();setAudioEnabled(v=>!v);}} aria-label={audioEnabled?"Tắt âm thanh phản hồi":"Bật âm thanh phản hồi"} title="Âm thanh phản hồi khi mở menu (không tự động phát)">{audioEnabled?<Volume2 size={17}/>:<VolumeX size={17}/>}</button>
      </>}
    </section>
    <div className="shop-explainer"><div><span className="shop-kicker">TRẢI NGHIỆM MỚI • THỬ NGAY</span><h2>Không chỉ xem menu.<br/><em>Hãy ghé quầy như ngoài đời.</em></h2></div><p>Đến gần quầy để mở thực đơn tương tác. Những món bạn chọn trong cửa hàng 3D sẽ xuất hiện trong giỏ hàng chung, sẵn sàng đặt giao tận nơi.</p><Link href="/menu">Bạn thích mua nhanh? Xem thực đơn thường <ArrowRight size={15}/></Link></div>
    {menuOpen && <ShopMenu onClose={closeMenu}/>}
  </div>;
}
