"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { buildStaffLines, type StaffCategory } from "./staff-dialogue-content";

type WorldPoint = {x:number;y:number};
type Anchor = {x:number;y:number;width:number;height:number};
type Props = {
  getScreenAnchor: () => Anchor | null;
  getGuestPosition: () => WorldPoint | null;
  onOpenMenu: (category:StaffCategory) => void;
  menuOpen: boolean;
};

const clamp=(n:number,min:number,max:number)=>Math.max(min,Math.min(max,n));

/**
 * Pure DOM overlay over the Pixi scene: no new WebGL draw calls,
 * character movement, network messages or new dependencies.
 */
export function StaffDialogue({getScreenAnchor,getGuestPosition,onOpenMenu,menuOpen}:Props){
  const [month,setMonth]=useState(1);
  const lines=useMemo(()=>buildStaffLines(month),[month]);
  const [index,setIndex]=useState(0);
  const [anchor,setAnchor]=useState<{left:number;top:number;docked:boolean}|null>(null);
  const [voiceSupported,setVoiceSupported]=useState(false);
  const [voiceOn,setVoiceOn]=useState(false);
  const wasNear=useRef(false);
  const announced=useRef<string|null>(null);
  const line=lines[index%lines.length];

  useEffect(()=>{
    setMonth(new Date().getMonth()+1);
    setVoiceSupported("speechSynthesis" in window && "SpeechSynthesisUtterance" in window);
    return ()=>{if("speechSynthesis" in window)window.speechSynthesis.cancel();};
  },[]);

  useEffect(()=>{
    const update=()=>{
      const screen=getScreenAnchor();
      if(screen&&screen.width>0&&screen.height>0){
        const docked=screen.y<148||screen.x<108||screen.x>screen.width-108;
        const left=docked?Math.min(128,screen.width/2):clamp(screen.x,120,Math.max(120,screen.width-120));
        const top=docked?142:screen.y;
        setAnchor(old=>old&&Math.abs(old.left-left)<1&&Math.abs(old.top-top)<1&&old.docked===docked
          ?old:{left,top,docked});
      }
      const guest=getGuestPosition();
      const near=!!guest&&Math.abs(guest.x-249)<75&&guest.y>=215&&guest.y<=262;
      if(near&&!wasNear.current)setIndex(0);
      wasNear.current=near;
    };
    update();
    const timer=window.setInterval(update,450);
    return ()=>window.clearInterval(timer);
  },[getScreenAnchor,getGuestPosition]);

  useEffect(()=>{
    if(menuOpen)return;
    if(window.matchMedia("(prefers-reduced-motion: reduce)").matches)return;
    const timer=window.setInterval(()=>setIndex(i=>(i+1)%lines.length),11000);
    return ()=>window.clearInterval(timer);
  },[menuOpen,lines.length]);

  const speak=useCallback((text:string)=>{
    try{
      window.speechSynthesis.cancel();
      const speech=new SpeechSynthesisUtterance(text);
      speech.lang="vi-VN";speech.rate=0.94;speech.pitch=1.1;speech.volume=0.85;
      const vietnamese=window.speechSynthesis.getVoices()
        .find(v=>v.lang.toLowerCase().startsWith("vi"));
      if(vietnamese)speech.voice=vietnamese;
      window.speechSynthesis.speak(speech);
    }catch{/* Text bubble remains accessible when the device has no voice engine. */}
  },[]);

  useEffect(()=>{
    if(!voiceOn||!voiceSupported||menuOpen||document.hidden)return;
    if(announced.current===line.id)return;
    announced.current=line.id;
    speak(line.text);
  },[voiceOn,voiceSupported,menuOpen,line.id,line.text,speak]);

  useEffect(()=>{
    if(menuOpen&&"speechSynthesis" in window)window.speechSynthesis.cancel();
  },[menuOpen]);

  useEffect(()=>{
    if(menuOpen||!voiceOn)return;
    const stop=()=>{if(document.hidden&&"speechSynthesis" in window)window.speechSynthesis.cancel();};
    document.addEventListener("visibilitychange",stop);
    return ()=>document.removeEventListener("visibilitychange",stop);
  },[menuOpen,voiceOn]);

  const toggleVoice=useCallback(()=>{
    if(voiceOn){
      setVoiceOn(false);
      window.speechSynthesis.cancel();
    }else{
      // Trigger the FIRST utterance synchronously inside the click gesture;
      // mobile Safari may reject speech initiated later from a React effect.
      announced.current=line.id;
      speak(line.text);
      setVoiceOn(true);
    }
  },[voiceOn,line.id,line.text,speak]);

  if(!anchor)return null;
  return (
    <section
      className={`pg-staff-dialogue${anchor.docked?" is-docked":""}`}
      style={{left:anchor.left,top:anchor.top}}
      aria-label="Lời mời của nhân viên Vườn É"
      lang="vi"
      data-testid="staff-dialogue"
      data-line-id={line.id}
      data-promoted-id={line.promotedProductId??""}
      onPointerDown={event=>event.stopPropagation()}
      onPointerUp={event=>event.stopPropagation()}>
      <div className="pg-staff-dialogue-heading"><span aria-hidden="true">🌼</span> Nhân viên Vườn É</div>
      <p className="pg-staff-dialogue-text" data-testid="staff-line" aria-live="off">{line.text}</p>
      <div className="pg-staff-dialogue-actions">
        <button type="button" onClick={()=>onOpenMenu(line.category)} aria-label={line.category==="fruit"?"Mở trái cây tươi":"Mở thực đơn"}>
          {line.category==="fruit"?"🍓 Xem trái cây":"🥤 Xem món"}
        </button>
        <button type="button" onClick={()=>setIndex(i=>(i+1)%lines.length)} aria-label="Lời giới thiệu tiếp theo">
          ↻ Câu khác
        </button>
        {voiceSupported&&<button
          type="button"
          aria-pressed={voiceOn}
          aria-label={voiceOn?"Tắt giọng nói nhân viên":"Bật giọng nói nhân viên"}
          title={voiceOn?"Tắt giọng nói":"Bật giọng nói tiếng Việt"}
          onClick={toggleVoice}>
          {voiceOn?"🔊":"🔈"}
        </button>}
      </div>
    </section>
  );
}
