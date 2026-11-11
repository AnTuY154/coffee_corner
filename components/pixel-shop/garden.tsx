"use client";
import { useCallback, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import type { Application, Graphics } from "pixi.js";
import { useCart } from "@/components/cart-context";
import { ShopMenu2D } from "@/components/3d-shop/shop-menu-2d";
import { createGardenNetwork, type RoomStatus } from "./network";
import { loadKenneyAtlas } from "./kenney-art";
import { SCENE_HEIGHT, SCENE_WIDTH, SPAWN, WALK_SPEED, HOTSPOTS, SEATS, findPath, hotspotAt, nearestWalkable, positionAt, facingFromPath, type Actor, type ClientIntent, type Facing, type Point, type ServerEvent } from "@/shared/garden/model";
import "./pixel-shop.css";

type MenuCategory = "all" | "fruit" | "daily";
type GardenCommand = {type:"goTo";target:Point}|{type:"direction";direction:Facing}|{type:"stop"}|{type:"sit";seatId:string}|{type:"stand"};
type CameraMode = "all" | "follow";
type Engine = {
  app: Application; world: import("pixi.js").Container;
  update: (tick: number, reducedMotion: boolean) => void;
  graphics: Map<string, Graphics>;
  frame: Map<string, number>;
  draw: (g: Graphics, actor: Actor, tick: number, seated: boolean) => void;
  makeGraphics: () => Graphics;
};
const defaultActor = (): Actor => ({ id:"solo", x:SPAWN.x, y:SPAWN.y, shirt:1, facing:"down", epoch:"solo", seq:0, path:[],startAt:Date.now(),speed:WALK_SPEED,seatId:null });
const roomLabels: Record<RoomStatus, string> = {
  solo:"Tham quan một người · chưa kết nối phòng", connecting:"Đang vào sân chung…",
  online:"Đã vào sân chung", reconnecting:"Đang nối lại sân · vẫn chọn món được",
  transferred:"Phiên này đã chuyển sang tab khác", offline:"Sân tạm gián đoạn · vẫn chọn món được",
  full:"Sân đã đủ người · chọn món trực tiếp"
};
export function PixelGarden() {
  const mountRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<Engine | null>(null);
  const actorsRef = useRef<Map<string,Actor>>(new Map([["solo",defaultActor()]]));
  const selfRef=useRef("solo");
  const networkRef=useRef<ReturnType<typeof createGardenNetwork>|null>(null);
  const seqRef=useRef(0);
  const clockOffsetRef=useRef(0);
  const cameraRef=useRef<{ mode:CameraMode; x:number; y:number; scale:number }>({ mode:"all", x:0,y:0,scale:1 });
  const pendingSeat=useRef<string|null>(null);
  const reducedMotion=useRef(false);
  const pressed=useRef(new Set<string>());
  const menuOpenRef=useRef(false);
  const [roomStatus,setRoomStatus]=useState<RoomStatus>("solo");
  const [people,setPeople]=useState(1);
  const [camera,setCamera]=useState<CameraMode>("all");
  useEffect(()=>{if(window.innerWidth<800)setCamera("follow");},[]);
  const [menu,setMenu]=useState<MenuCategory|null>(null);
  const [menuInitialView,setMenuInitialView]=useState<"browse"|"cart">("browse");
  const [hover,setHover]=useState<{ label:string; x:number; y:number }|null>(null);
  const [notice,setNotice]=useState("");
  const [renderError,setRenderError]=useState(false);
  const {count}=useCart();
  const opened=menu!==null;
  menuOpenRef.current=opened;
  cameraRef.current.mode=camera;

  const handleEvent = useCallback((e:ServerEvent) => {
    const roster=actorsRef.current;
    switch(e.type) {
      case "snapshot":
        if(e.protocolVersion!==1||e.sceneVersion!=="pixel-garden-1"||e.navVersion!=="pixel-nav-1"){setRoomStatus("offline");setNotice("Phiên bản sân chưa tương thích.");return;}
        roster.clear(); for(const actor of e.actors) roster.set(actor.id,actor);
        selfRef.current=e.selfId; seqRef.current=0; clockOffsetRef.current=e.serverNow-Date.now(); setPeople(roster.size); break;
      case "joined": roster.set(e.actor.id,e.actor); setPeople(roster.size); break;
      case "left": if(roster.get(e.actorId)?.epoch===e.epoch) {roster.delete(e.actorId);setPeople(roster.size);} break;
      case "moveAccepted": {
        const actor=roster.get(e.actorId);
        if(!actor||actor.epoch!==e.epoch||e.seq<actor.seq)break;
        actor.x=e.path[0]?.[0]??actor.x;actor.y=e.path[0]?.[1]??actor.y;
        actor.path=e.path;actor.startAt=e.startAt;actor.speed=e.speed;
        actor.facing=facingFromPath(e.path,actor.facing);actor.seq=e.seq;break;
      }
      case "stopped":{
        const actor=roster.get(e.actorId);
        if(!actor||actor.epoch!==e.epoch||e.seq<actor.seq)break;
        Object.assign(actor,{x:e.x,y:e.y,path:[],facing:e.facing,seq:e.seq});break;
      }
      case "seated":{
        const actor=roster.get(e.actorId),seat=SEATS.find(s=>s.id===e.seatId);
        if(actor&&seat){Object.assign(actor,{x:seat.x,y:seat.y,path:[],seatId:seat.id,facing:seat.facing,seq:e.seq});}
        if(e.actorId===selfRef.current)pendingSeat.current=null;
        break;
      }
      case "stood": {const actor=roster.get(e.actorId);if(actor){actor.seatId=null;actor.seq=e.seq;}break;}
      case "seatBusy": setNotice("Ghế này đã có khách, hãy chọn ghế khác nhé.");pendingSeat.current=null;break;
      case "error": setNotice(e.message);break;
    }
  },[]);
  useEffect(()=>{
    reducedMotion.current=window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const network=createGardenNetwork({onEvent:handleEvent,onStatus:status=>{
      setRoomStatus(status);
      if(status==="online") setNotice("");
      if(status==="solo") {actorsRef.current=new Map([["solo",defaultActor()]]);selfRef.current="solo";clockOffsetRef.current=0;setPeople(1);}
      if(status==="transferred") setNotice("Đã chuyển sang tab mới. Tải lại nếu muốn chơi ở đây.");
    }});
    networkRef.current=network;
    return ()=>{network.close();networkRef.current=null;};
  },[handleEvent]);
  const send=useCallback((intent:GardenCommand) => {
    const seq=++seqRef.current;
    const command={...intent,seq} as ClientIntent;
    if(networkRef.current?.send(command))return;
    // Explicit local preview; no invented remote participants.
    if(selfRef.current!=="solo")return;
    const actor=actorsRef.current.get("solo")!;
    const now=Date.now()+clockOffsetRef.current;
    const pos=positionAt(actor,now);
    if(intent.type==="stop"){Object.assign(actor,{x:pos.x,y:pos.y,path:[],seq,startAt:now});return;}
    if(intent.type==="stand"){actor.seatId=null;actor.seq=seq;return;}
    if(intent.type==="sit"){
      const seat=SEATS.find(s=>s.id===(intent as {seatId:string}).seatId);
      if(seat&&Math.hypot(pos.x-seat.approach.x,pos.y-seat.approach.y)<=24){
        Object.assign(actor,{x:seat.x,y:seat.y,path:[],seatId:seat.id,facing:seat.facing,seq});
      }
      return;
    }
    if(actor.seatId)return;
    let target:Point|null=null;
    if(intent.type==="goTo")target=(intent as {target:Point}).target;
    if(intent.type==="direction"){
      const d=(intent as {direction:Facing}).direction;
      const v={up:[0,-48],down:[0,48],left:[-48,0],right:[48,0]}[d];
      target={x:pos.x+v[0],y:pos.y+v[1]};
    }
    if(!target)return;
    const end=nearestWalkable(target);
    const path=end?findPath(pos,end):null;
    if(path)Object.assign(actor,{x:pos.x,y:pos.y,path,startAt:now,seq,facing:facingFromPath(path,actor.facing)});
  },[]);
  useEffect(()=>{
    const mount=mountRef.current;
    if(!mount)return;
    let disposed=false;
    let app:Application|null=null;
    let resizeObserver:ResizeObserver|null=null;
    let tickHandler:((ticker:import("pixi.js").Ticker)=>void)|null=null;
    const start=async()=>{
      try{
        const PIXI=await import("pixi.js");
        const art=await import("./art");
        if(disposed)return;
        const application=new PIXI.Application();
        app=application;
        await application.init({resizeTo:mount,backgroundColor:0xbde7da,antialias:false,preference:"webgl",resolution:Math.min(window.devicePixelRatio||1,2),autoDensity:true});
        if(disposed){application.destroy(true,{children:true});return;}
        mount.appendChild(application.canvas);
        const kenney=await loadKenneyAtlas();
        if(disposed){application.destroy(true,{children:true});return;}
        const build=art.buildScene(kenney);
        application.stage.addChild(build.world);
        const engine:Engine={app:application,world:build.world,update:build.update,graphics:new Map(),frame:new Map(),draw:art.drawGuest,makeGraphics:()=>new PIXI.Graphics()};
        engineRef.current=engine;
        const render=(ticker:import("pixi.js").Ticker)=>{
          const now=Date.now()+clockOffsetRef.current,elapsed=ticker.lastTime/1000;
          build.update(elapsed,reducedMotion.current);
          const roster=actorsRef.current;
          for(const [id, actor] of roster){
            let g=engine.graphics.get(id);
            if(!g){g=engine.makeGraphics();engine.world.addChild(g);engine.graphics.set(id,g);}
            const p=positionAt(actor,now);
            g.position.set(Math.round(p.x),Math.round(p.y));
            g.zIndex=Math.round(p.y);
            const frame=(reducedMotion.current?0:Math.floor(elapsed*7)) + (actor.seatId?100000:0) + ({up:0,down:200000,left:400000,right:600000}[actor.facing]);
            if(engine.frame.get(id)!==frame){engine.draw(g,actor,elapsed,!!actor.seatId);engine.frame.set(id,frame);}
          }
          for(const [id,g] of engine.graphics)if(!roster.has(id)){engine.world.removeChild(g);g.destroy();engine.graphics.delete(id);engine.frame.delete(id);}
          const own=roster.get(selfRef.current);
          if(own && pendingSeat.current){
            const seat=SEATS.find(s=>s.id===pendingSeat.current);
            const p=positionAt(own,now);
            if(seat && Math.hypot(p.x-seat.approach.x,p.y-seat.approach.y)<18){
              send({type:"sit",seatId:seat.id});
              pendingSeat.current=null;
            }
          }
          const width=mount.clientWidth,height=mount.clientHeight;
          const allScale=Math.min(width/SCENE_WIDTH,height/SCENE_HEIGHT);
          const scale=cameraRef.current.mode==="follow" && width<=800
            ? Math.max(2,Math.floor(Math.min(width/180,height/225))) : allScale;
          const focus=own?positionAt(own,now):SPAWN;
          let x=(width-SCENE_WIDTH*scale)/2,y=(height-SCENE_HEIGHT*scale)/2;
          if(scale>allScale){
            x=Math.max(width-SCENE_WIDTH*scale,Math.min(0,width/2-focus.x*scale));
            y=Math.max(height-SCENE_HEIGHT*scale,Math.min(0,height/2-focus.y*scale));
          }
          build.world.scale.set(scale);build.world.position.set(x,y);
          cameraRef.current={...cameraRef.current,x,y,scale};
        };
        tickHandler=render;
        application.ticker.add(render);
        resizeObserver=new ResizeObserver(()=>application.resize());
        resizeObserver.observe(mount);
      }catch{if(!disposed)setRenderError(true);}
    };
    void start();
    return()=>{
      disposed=true;resizeObserver?.disconnect();
      if(app){if(tickHandler)app.ticker.remove(tickHandler);app.destroy(true,{children:true});}
      engineRef.current=null;
    };
  },[send]);

  useEffect(()=>{
    const mapping:Record<string,Facing>={w:"up",arrowup:"up",s:"down",arrowdown:"down",a:"left",arrowleft:"left",d:"right",arrowright:"right"};
    const onDown=(e:KeyboardEvent)=>{
      if(e.key==="Escape"){setMenu(null);setMenuInitialView("browse");return;}
      if(menuOpenRef.current || e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)return;
      const dir=mapping[e.key.toLowerCase()];
      if(!dir||e.repeat)return;
      e.preventDefault();pressed.current.add(e.key.toLowerCase());
      send({type:"direction",direction:dir});
    };
    const onUp=(e:KeyboardEvent)=>{
      if(!mapping[e.key.toLowerCase()])return;
      pressed.current.delete(e.key.toLowerCase());
      send({type:"stop"});
    };
    const onBlur=()=>{pressed.current.clear();send({type:"stop"});};
    window.addEventListener("keydown",onDown);window.addEventListener("keyup",onUp);
    window.addEventListener("blur",onBlur);
    return()=>{window.removeEventListener("keydown",onDown);window.removeEventListener("keyup",onUp);window.removeEventListener("blur",onBlur);};
  },[send]);

  const worldPoint=(event:ReactPointerEvent<HTMLElement>):Point|null=>{
    const mount=mountRef.current;
    if(!mount)return null;
    const rect=mount.getBoundingClientRect(),c=cameraRef.current;
    return {x:(event.clientX-rect.left-c.x)/c.scale,y:(event.clientY-rect.top-c.y)/c.scale};
  };
  const onTap=(event:ReactPointerEvent<HTMLDivElement>)=>{
    if(event.button!==0)return;
    const p=worldPoint(event);if(!p)return;
    const hotspot=hotspotAt(p);
    if(hotspot){setMenu(hotspot.action==="fruit"?"fruit":hotspot.action==="daily"?"daily":"all");return;}
    const seat=SEATS.find(s=>Math.hypot(p.x-s.x,p.y-s.y)<12);
    const own=actorsRef.current.get(selfRef.current);
    if(seat&&own){
      if(own.seatId===seat.id){send({type:"stand"});return;}
      if(own.seatId){setNotice("Hãy đứng dậy trước khi chọn ghế khác.");return;}
      pendingSeat.current=seat.id;send({type:"goTo",target:seat.approach});return;
    }
    const end=nearestWalkable(p);
    if(end) {pendingSeat.current=null;send({type:"goTo",target:end});}
  };
  const onHover=(event:ReactPointerEvent<HTMLDivElement>)=>{
    if(event.pointerType!=="mouse")return;
    const p=worldPoint(event);
    const target=p?hotspotAt(p):undefined;
    if(!target){setHover(null);return;}
    const c=cameraRef.current, width=mountRef.current?.clientWidth??480;
    setHover({
      label:target.label,
      x:Math.max(74,Math.min(width-74,c.x+(target.x+target.w/2)*c.scale)),
      y:Math.max(8,c.y+target.y*c.scale-43)
    });
  };
  const dpad=(dir:Facing)=><button key={dir} type="button" aria-label={"Đi "+({up:"lên",down:"xuống",left:"trái",right:"phải"}[dir])} onPointerDown={e=>{e.preventDefault();send({type:"direction",direction:dir});}} onPointerUp={e=>{e.preventDefault();send({type:"stop"});}} onPointerCancel={()=>send({type:"stop"})}>{({up:"▲",down:"▼",left:"◀",right:"▶"}[dir])}</button>;
  return <div className="pg-root">
    <header className="pg-header">
      <div><span className="pg-kicker">FRESH PIXEL GARDEN</span><h1>Vườn É <span>✿</span></h1><p>Ghé chơi, chọn nước ép và ngồi giữa khu vườn.</p></div>
      <div className="pg-heading-actions"><span className="pg-guests" aria-live="polite">● {people}/20 khách</span><button type="button" onClick={()=>setMenu("all")}>Thực đơn</button><button type="button" onClick={()=>{setMenuInitialView("cart");setMenu("all");}}>Giỏ hàng ({count})</button></div>
    </header>
    <div className="pg-status" role="status" aria-live="polite">{roomLabels[roomStatus]}</div>
    <div className="pg-stage-shell">
      <div className="pg-stage" ref={mountRef} onPointerUp={onTap} onPointerMove={onHover} onPointerLeave={()=>setHover(null)} role="application" aria-label="Sân Pixel Art Vườn É, nhấn vào sân để đi hoặc chạm tủ trái cây để mua">
        {renderError && <div className="pg-fallback" role="status"><strong>Đang hiển thị chế độ nhẹ</strong><p>Thiết bị không hỗ trợ WebGL. Bạn vẫn có thể mở thực đơn và đặt món.</p><button type="button" onClick={()=>setMenu("all")}>Mở thực đơn</button></div>}
        {hover && <div className="pg-tooltip" role="tooltip" style={{left:hover.x,top:hover.y}}>{hover.label} · Nhấn để khám phá</div>}
      </div>
      <div className="pg-game-controls">
        <button type="button" onClick={()=>setCamera(c=>c==="all"?"follow":"all")} aria-pressed={camera==="follow"}>{camera==="all"?"Theo nhân vật":"Toàn sân"}</button>
        <button type="button" onClick={()=>setMenu("fruit")}>🍊 Trái cây</button>
        <button type="button" onClick={()=>setMenu("daily")}>✨ Gợi ý</button>
      </div>
      <div className="pg-dpad" role="group" aria-label="Điều khiển di chuyển trên điện thoại">
        <div>{dpad("up")}</div><div>{dpad("left")}{dpad("down")}{dpad("right")}</div>
      </div>
    </div>
    <div className="pg-help">Desktop: WASD / phím mũi tên hoặc click để đi. Mobile: chạm mặt đất hoặc dùng phím điều hướng. Chạm ghế để ngồi.</div>
    {notice && <div className="pg-notice" role="status">{notice}<button type="button" onClick={()=>setNotice("")} aria-label="Đóng thông báo">✕</button></div>}
    <nav className="pg-mobile-nav" aria-label="Mua hàng trên điện thoại">
      <button type="button" onClick={()=>setMenu("all")}>🥤 Nước ép</button>
      <button type="button" onClick={()=>setMenu("fruit")}>🍊 Trái cây</button>
      <button type="button" onClick={()=>{setMenuInitialView("cart");setMenu("all");}}>🧺 Giỏ ({count})</button>
    </nav>
    {opened&&<ShopMenu2D key={menu+"-"+menuInitialView} initialCategory={menu} initialView={menuInitialView} onClose={()=>{setMenu(null);setMenuInitialView("browse");}}/>}
  </div>;
}
