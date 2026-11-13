"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { replyToCustomer, type ShopReply } from "./shop-chat-replies";

type ChatMessage={id:number;from:"customer"|"assistant";text:string;category?:ShopReply["category"]};
type Props={onOpenMenu:(category:"all"|"fruit"|"daily")=>void;seated:boolean};

const welcome:ChatMessage={
  id:0,from:"assistant",
  text:"Vườn É chào bạn! 🌿 Mình là trợ lý tự động. Bạn có thể hỏi về nước ép, trái cây hoặc cách đặt hàng."
};
const examples=["Gợi ý món ngon","Trái cây tươi","Giá bao nhiêu?","Cách đặt hàng"];

export function CustomerChat({onOpenMenu,seated}:Props){
  const [open,setOpen]=useState(false);
  const [messages,setMessages]=useState<ChatMessage[]>([welcome]);
  const [draft,setDraft]=useState("");
  const nextId=useRef(1);
  const endRef=useRef<HTMLDivElement|null>(null);
  const inputRef=useRef<HTMLInputElement|null>(null);
  const storePhone=process.env.NEXT_PUBLIC_STORE_PHONE;

  useEffect(()=>{
    if(open){
      inputRef.current?.focus();
      endRef.current?.scrollIntoView({block:"end",behavior:"instant"});
    }
  },[open,messages.length]);

  useEffect(()=>{
    if(!open)return;
    const onKey=(e:KeyboardEvent)=>{if(e.key==="Escape"){e.stopPropagation();setOpen(false);}};
    window.addEventListener("keydown",onKey);
    return ()=>window.removeEventListener("keydown",onKey);
  },[open]);

  const send=(raw:string)=>{
    const question=raw.trim().slice(0,240);
    if(!question)return;
    const reply=replyToCustomer(question,new Date().getMonth()+1);
    setMessages(old=>[
      ...old.slice(-16),
      {id:nextId.current++,from:"customer",text:question},
      {id:nextId.current++,from:"assistant",text:reply.text,category:reply.category}
    ]);
    setDraft("");
  };
  const submit=(event:FormEvent<HTMLFormElement>)=>{event.preventDefault();send(draft);};

  return (
    <aside className={"pg-customer-chat"+(seated?" is-seated":"")} data-testid="customer-chat">
      {!open?(
        <button
          className="pg-chat-launcher"
          type="button"
          aria-label="Mở trò chuyện tư vấn Vườn É"
          aria-expanded="false"
          onClick={()=>setOpen(true)}>
          <span className="pg-chat-launcher-icon" aria-hidden="true">💬</span>
          <span><strong>Chat với Vườn É</strong><small>Tư vấn món & đặt hàng</small></span>
        </button>
      ):(
        <section className="pg-chat-panel" role="dialog" aria-modal="false" aria-label="Trò chuyện tư vấn Vườn É">
          <header className="pg-chat-header">
            <div><strong><span aria-hidden="true">🍊</span> Trò chuyện cùng Vườn É</strong>
              <small>Trợ lý tự động · không phải nhân viên trực tuyến</small>
            </div>
            <button type="button" aria-label="Đóng chat" onClick={()=>setOpen(false)}>✕</button>
          </header>
          <div className="pg-chat-messages" role="log" aria-label="Nội dung trò chuyện" aria-live="polite" aria-relevant="additions text">
            {messages.map(message=>
              <div key={message.id} className={"pg-chat-message "+(message.from==="customer"?"from-customer":"from-assistant")}>
                <p>{message.text}</p>
                {message.from==="assistant"&&message.category&&
                  <button type="button" onClick={()=>{setOpen(false);onOpenMenu(message.category!);}}>
                    {message.category==="fruit"?"🍓 Xem trái cây":"🥤 Xem thực đơn"}
                  </button>}
              </div>
            )}
            <div ref={endRef}/>
          </div>
          {messages.length<4&&<div className="pg-chat-suggestions" aria-label="Câu hỏi gợi ý">
            {examples.map(example=><button key={example} type="button" onClick={()=>send(example)}>{example}</button>)}
          </div>}
          <form className="pg-chat-form" onSubmit={submit}>
            <label className="pg-chat-input-label" htmlFor="pg-chat-question">Câu hỏi của bạn</label>
            <input ref={inputRef} id="pg-chat-question" data-testid="chat-input"
              type="text" maxLength={240} autoComplete="off" value={draft}
              onChange={event=>setDraft(event.target.value)}
              placeholder="Hỏi về sản phẩm, đơn hàng..." />
            <button type="submit" disabled={!draft.trim()} aria-label="Gửi câu hỏi">➤</button>
          </form>
          <div className="pg-chat-footer">
            <span>Không nhập thông tin nhạy cảm. Nội dung chat không gửi lên máy chủ.</span>
            {storePhone&&<a href={"tel:"+storePhone}>Gọi cửa hàng</a>}
          </div>
        </section>
      )}
    </aside>
  );
}
