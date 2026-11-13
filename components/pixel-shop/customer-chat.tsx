"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { answerShopQuestion, type ChatAction } from "./customer-chat-content";

type ChatMessage = {
  id:number;
  sender:"visitor"|"bot";
  text:string;
  action?:ChatAction;
};
type Props = {
  menuOpen:boolean;
  onOpenMenu:(category:ChatAction)=>void;
};
const greeting:ChatMessage={
  id:0,
  sender:"bot",
  text:"Xin chào! 🌼 Mình là trợ lý tự động của Vườn É. Bạn có thể hỏi về các món nước, giá, trái cây hay cách đặt hàng nhé!"
};
const quickQuestions=["Món mới có gì?","Gợi ý nước ép","Trái cây tươi","Đặt hàng thế nào?"];

/** User-controlled shop FAQ chat. No network, fake human operator or PII storage. */
export function CustomerChat({menuOpen,onOpenMenu}:Props){
  const [open,setOpen]=useState(false);
  const [draft,setDraft]=useState("");
  const [month,setMonth]=useState(1);
  const [messages,setMessages]=useState<ChatMessage[]>([greeting]);
  const nextId=useRef(1);
  const inputRef=useRef<HTMLInputElement>(null);
  const messagesRef=useRef<HTMLDivElement>(null);
  useEffect(()=>setMonth(new Date().getMonth()+1),[]);
  useEffect(()=>{
    if(menuOpen)setOpen(false);
  },[menuOpen]);
  useEffect(()=>{
    if(!open)return;
    const focus=window.requestAnimationFrame(()=>inputRef.current?.focus());
    return ()=>window.cancelAnimationFrame(focus);
  },[open]);
  useEffect(()=>{
    if(open&&messagesRef.current)messagesRef.current.scrollTop=messagesRef.current.scrollHeight;
  },[messages,open]);

  const send=(raw:string)=>{
    const query=raw.trim().slice(0,320);
    if(!query)return;
    const reply=answerShopQuestion(query,month);
    setMessages(previous=>[
      ...previous.slice(-38),
      {id:nextId.current++,sender:"visitor",text:query},
      {id:nextId.current++,sender:"bot",text:reply.text,action:reply.action}
    ]);
    setDraft("");
  };
  const submit=(e:FormEvent<HTMLFormElement>)=>{
    e.preventDefault();
    send(draft);
  };
  return (
    <aside className="pg-customer-chat" data-testid="customer-chat">
      {open&&<section id="pg-customer-chat-panel" role="dialog" aria-modal="false"
        aria-labelledby="pg-chat-title" aria-describedby="pg-chat-explanation"
        className="pg-chat-panel"
        onPointerDown={e=>e.stopPropagation()}
        onPointerUp={e=>e.stopPropagation()}
        onKeyDown={event=>{
          if(event.key==="Escape"){event.stopPropagation();setOpen(false);}
        }}>
        <header className="pg-chat-heading">
          <div className="pg-chat-avatar" aria-hidden="true">🍊</div>
          <div className="pg-chat-headings">
            <strong id="pg-chat-title">Chat với Vườn É</strong>
            <span id="pg-chat-explanation">Trợ lý tự động · tư vấn theo menu</span>
          </div>
          <button type="button" className="pg-chat-close" aria-label="Đóng khung chat" onClick={()=>setOpen(false)}>✕</button>
        </header>
        <div ref={messagesRef} className="pg-chat-messages" role="log" aria-label="Nội dung trò chuyện" aria-live="polite" aria-relevant="additions">
          {messages.map(message=><div key={message.id}
            className={"pg-chat-message "+(message.sender==="bot"?"is-bot":"is-guest")}>
            {message.sender==="bot"&&<span className="pg-chat-speaker">Vườn É</span>}
            <p>{message.text}</p>
            {message.action&&<button type="button" className="pg-chat-menu-cta" onClick={()=>{
              onOpenMenu(message.action!);setOpen(false);
            }}>🌿 {message.action==="fruit"?"Xem trái cây tươi":"Mở thực đơn"}</button>}
          </div>)}

        </div>
        {messages.length<=3&&<div className="pg-chat-quick" aria-label="Câu hỏi gợi ý">
          {quickQuestions.map(question=><button key={question} type="button" onClick={()=>send(question)}>{question}</button>)}
        </div>}
        <form className="pg-chat-input-row" onSubmit={submit}>
          <label className="sr-only" htmlFor="pg-chat-input">Nhập câu hỏi cho Vườn É</label>
          <input id="pg-chat-input" ref={inputRef} type="text" autoComplete="off"
            maxLength={320} placeholder="Hỏi về món, giá, đặt hàng..."
            value={draft} onChange={e=>setDraft(e.target.value)}/>
          <button type="submit" aria-label="Gửi tin nhắn" disabled={!draft.trim()}>➤</button>
        </form>
        <p className="pg-chat-disclaimer">Chỉ tư vấn tự động từ thực đơn; không kết nối nhân viên thật. Tin nhắn không được lưu hay gửi lên máy chủ.</p>
      </section>}
      <button className="pg-chat-launch" type="button" aria-controls="pg-customer-chat-panel"
        aria-expanded={open} aria-label={open?"Thu gọn chat Vườn É":"Mở chat Vườn É"}
        onClick={()=>setOpen(o=>!o)}>
        <span className="pg-chat-launch-icon" aria-hidden="true">{open?"✕":"💬"}</span>
        {!open&&<span className="pg-chat-launch-copy"><strong>Chat với Vườn É</strong><small>Hỏi món, giá & đặt hàng</small></span>}
      </button>
    </aside>
  );
}
