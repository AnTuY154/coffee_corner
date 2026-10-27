"use client";

import {useEffect,useRef,useState} from "react";
import {useCart} from "@/components/cart-context";
import {ShopMenu2D} from "@/components/3d-shop/shop-menu-2d";
import {ShopIllustration} from "./shop-illustration";
import "./illustrated-shop.css";

type Action="order"|"intro"|"seats"|"garden"|"dog";
type Key="sign"|"clerk"|"menu"|"fruits"|"cooler"|"seats"|"tree"|"dog";
type Hotspot={id:Key;name:string;hint:string;x:number;y:number;w:number;h:number;action:Action;position?:"below"|"left"};
export const HOTSPOTS:Hotspot[]=[
 {id:"sign",name:"Biển hiệu Vườn Ép",hint:"Chào mừng đến quán! Nhấn để xem câu chuyện của chúng mình.",x:47,y:22,w:33,h:15,action:"intro",position:"below"},
 {id:"clerk",name:"Nhân viên bán hàng",hint:"Chào bạn! Nhấp vào mình để gọi nước ép tươi nhé!",x:52,y:50,w:15,h:22,action:"order"},
 {id:"menu",name:"Bảng thực đơn",hint:"Hôm nay uống gì? Nhấn để chọn nước ép theo mùa!",x:61,y:51,w:13,h:17,action:"order"},
 {id:"fruits",name:"Giỏ trái cây",hint:"Cam, táo, xoài và nhiều trái cây tươi. Nhấn để chọn món!",x:20,y:76,w:16,h:18,action:"order"},
 {id:"cooler",name:"Tủ nước ép",hint:"Tươi mát quá! Nhấn để chọn thức uống nhé.",x:75,y:56,w:8,h:30,action:"order",position:"left"},
 {id:"seats",name:"Bàn ghế ngoài hiên",hint:"Góc ngồi đón nắng đây rồi! Nhấn để xem chỗ ngồi nhé.",x:45,y:86,w:28,h:19,action:"seats"},
 {id:"tree",name:"Cây xanh",hint:"Một góc xanh dịu mát. Nhấn để ngắm khu vườn nhé!",x:85,y:23,w:24,h:21,action:"garden",position:"below"},
 {id:"dog",name:"Chú chó nhỏ",hint:"Gâu gâu! Nhấn để chào người bạn của quán.",x:66,y:86,w:11,h:12,action:"dog"}
];
const STORY:Record<Exclude<Action,"order">,{icon:string;title:string;body:string}>={
 intro:{icon:"✿",title:"Chào mừng đến Vườn Ép!",body:"Cửa hàng nước ép có mặt tiền khoảng 6 m, không gian mở rộng 30 m², quầy nhận đơn bên trong và chỗ ngồi dưới tán cây ở phía trước. Chọn bất kỳ vật phẩm nào để khám phá nhé!"},
 seats:{icon:"☀",title:"Góc hiên xanh",body:"Bàn gỗ được đặt trước cửa hàng để khách ngồi thư giãn thưởng thức nước ép. Bạn có thể ghé quầy gọi món bất cứ lúc nào."},
 garden:{icon:"❀",title:"Vườn nhỏ trước quán",body:"Cây dây leo, chậu lá và nắng sớm làm không gian mát lành. Một góc bình yên để nhâm nhi trái cây theo mùa."},
 dog:{icon:"♡",title:"Chú chó thân thiện",body:"Gâu! Chú chó đang nghỉ chân ngoài hiên và rất vui khi được bạn ghé chào."}
};

/** 2D single-URL shop. DOM buttons make hotspots accessible on mouse, touch and keyboard. */
export function IllustratedShop(){
 const [active,setActive]=useState<Key|null>(null);
 const [menuOpen,setMenuOpen]=useState(false);
 const [story,setStory]=useState<Exclude<Action,"order">|null>(null);
 const [touch,setTouch]=useState(false);
 const [dogHappy,setDogHappy]=useState(false);
 const last=useRef<HTMLButtonElement|null>(null);
 const closeStoryRef=useRef<HTMLButtonElement|null>(null);
 const {count}=useCart();
 useEffect(()=>{setTouch(window.matchMedia("(hover: none)").matches);},[]);
 useEffect(()=>{if(story)closeStoryRef.current?.focus();},[story]);
 useEffect(()=>{const previous=document.body.style.overflow;document.body.style.overflow="hidden";return()=>{document.body.style.overflow=previous;};},[]);
 const closeStory=()=>{setStory(null);last.current?.focus();};
 useEffect(()=>{const onKey=(e:KeyboardEvent)=>{
  if(e.key==="Escape"&&story){e.preventDefault();setStory(null);last.current?.focus();}
 };window.addEventListener("keydown",onKey);return()=>window.removeEventListener("keydown",onKey);},[story]);
 const interact=(spot:Hotspot)=>{
  setActive(null);
  if(spot.action==="order"){setStory(null);setMenuOpen(true);}
  else {setStory(spot.action);if(spot.action==="dog")setDogHappy(true);}
 };
 return <div className="ve2d-root" aria-label="Vườn Ép: cửa hàng minh họa 2D">
  <div className="ve2d-viewport">
   <div className="ve2d-stage">
    <ShopIllustration/>
    {HOTSPOTS.map(spot=><button key={spot.id} type="button"
      className="ve2d-hotspot" data-target={spot.id}
      data-visible={active===spot.id} data-placement={spot.position||"above"}
      style={{left:spot.x+"%",top:spot.y+"%",width:spot.w+"%",height:spot.h+"%"}}
      aria-label={spot.name+". "+spot.hint} aria-describedby={"ve2d-cloud-"+spot.id}
      onPointerEnter={e=>{if(e.pointerType!=="touch")setActive(spot.id);}}
      onPointerLeave={e=>{if(e.pointerType!=="touch")setActive(v=>v===spot.id?null:v);}}
      onFocus={e=>{if(e.currentTarget.matches(":focus-visible"))setActive(spot.id);}}
      onBlur={()=>setActive(v=>v===spot.id?null:v)}
      onClick={e=>{
       // Touch: first tap previews the cloud; second tap activates.
       // Keyboard event.detail === 0 always activates immediately.
       if(touch&&e.detail!==0&&active!==spot.id){setActive(spot.id);return;}
       last.current=e.currentTarget;
       interact(spot);
      }}>
     <span className="ve2d-dot" aria-hidden="true">✦</span>
     <span id={"ve2d-cloud-"+spot.id} className="ve2d-cloud" role="tooltip" aria-hidden={active!==spot.id}>
      <strong>{spot.name}</strong><span>{spot.hint}</span>
      <small>{touch?"Chạm lần nữa để mở":"Nhấp để khám phá"} ↗</small>
     </span>
    </button>)}
    {dogHappy&&<span className="ve2d-dog-heart" aria-hidden="true">♡</span>}
   </div>
  </div>
  <header className="ve2d-header">
   <span>✿ <strong>VƯỜN ÉP</strong> <small>góc nước ép trong vườn</small></span>
   <button type="button" className="ve2d-cart" onClick={()=>{setStory(null);setMenuOpen(true);}}>🧺 Giỏ hàng <strong>{count}</strong></button>
  </header>
  <p className="ve2d-instruction">✦ Rê chuột vào vật phẩm để xem gợi ý · Nhấp để tương tác</p>
  {touch&&<p className="ve2d-touch-guide">Vuốt ngang để khám phá · Chạm một lần xem gợi ý, hai lần mở</p>}
  {story&&<div className="ve2d-story-shade" onClick={e=>{if(e.target===e.currentTarget)closeStory();}}>
   <section className="ve2d-story" role="dialog" aria-modal="true" aria-labelledby="ve2d-story-title">
    <span className="ve2d-story-icon" aria-hidden="true">{STORY[story].icon}</span>
    <button type="button" ref={closeStoryRef} className="ve2d-story-close" onClick={closeStory} aria-label="Đóng">✕</button>
    <h2 id="ve2d-story-title">{STORY[story].title}</h2>
    <p>{STORY[story].body}</p>
    <button type="button" className="ve2d-story-order" onClick={()=>{setStory(null);setMenuOpen(true);}}>Xem thực đơn nước ép ↗</button>
   </section>
  </div>}
  {menuOpen&&<ShopMenu2D onClose={()=>{setMenuOpen(false);last.current?.focus();}}/>}
 </div>;
}
