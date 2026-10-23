"use client";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { products } from "@/data/catalog";
export type CartLine = { id: string; quantity: number };
type CartContextValue = { lines:CartLine[]; count:number; subtotal:number; add:(id:string)=>void; update:(id:string,quantity:number)=>void; remove:(id:string)=>void; clear:()=>void };
const CartContext = createContext<CartContextValue|null>(null);
const KEY = "vuon-ep-cart-v1";
export function CartProvider({ children }:{children:React.ReactNode}) {
  const [lines,setLines] = useState<CartLine[]>([]);
  const [hydrated,setHydrated]=useState(false);
  useEffect(()=>{
    try { const raw=JSON.parse(localStorage.getItem(KEY)||"[]") as unknown;
      if(Array.isArray(raw)) setLines(raw.filter((x):x is CartLine=>!!x&&typeof x.id==="string"&&Number.isInteger(x.quantity)&&x.quantity>=1&&x.quantity<=20&&products.some(p=>p.id===x.id)).slice(0,24));
    } catch { /* invalid persisted cart: start empty */ }
    setHydrated(true);
  },[]);
  useEffect(()=>{if(hydrated) localStorage.setItem(KEY,JSON.stringify(lines));},[hydrated,lines]);
  const value=useMemo<CartContextValue>(()=>({
    lines,count:lines.reduce((s,x)=>s+x.quantity,0),subtotal:lines.reduce((s,x)=>s+(products.find(p=>p.id===x.id)?.price??0)*x.quantity,0),
    add:(id)=>{if(!products.some(p=>p.id===id))return;setLines(previous=>{const found=previous.find(x=>x.id===id);return found?previous.map(x=>x.id===id?{...x,quantity:Math.min(20,x.quantity+1)}:x):[...previous,{id,quantity:1}];});},
    update:(id,quantity)=>setLines(previous=>quantity<=0?previous.filter(x=>x.id!==id):previous.map(x=>x.id===id?{...x,quantity:Math.min(20,Math.max(1,Math.floor(quantity)))}:x)),
    remove:(id)=>setLines(previous=>previous.filter(x=>x.id!==id)),clear:()=>setLines([])
  }),[lines]);
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
export function useCart(){const context=useContext(CartContext);if(!context)throw new Error("useCart requires CartProvider");return context;}
