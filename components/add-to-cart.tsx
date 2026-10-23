"use client";
import { useState } from "react";
import { ShoppingBag, Check } from "lucide-react";
import { useCart } from "@/components/cart-context";
export function AddToCart({id,large=false}:{id:string;large?:boolean}){
 const {add}=useCart();const [added,setAdded]=useState(false);
 return <button type="button" className={`add-button ${large?'add-button-large':''}`} onClick={()=>{add(id);setAdded(true);window.setTimeout(()=>setAdded(false),1400);}} aria-label={added?"Đã thêm vào giỏ":"Thêm vào giỏ hàng"}>{added?<Check size={19}/>:<ShoppingBag size={19}/>}<span>{added?"Đã thêm":large?"Thêm vào giỏ":"Thêm"}</span></button>;
}
