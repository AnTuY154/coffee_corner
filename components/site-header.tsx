"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, ShoppingBag, Leaf } from "lucide-react";
import { useCart } from "@/components/cart-context";
import { useState } from "react";
const links=[{href:"/",label:"Trang chủ"},{href:"/3d-shop",label:"Vào quán 3D"},{href:"/menu",label:"Thực đơn"},{href:"/lich-mua",label:"Lịch trái cây"},{href:"/ve-chung-toi",label:"Về Vườn"}];
export function SiteHeader(){const [menu,setMenu]=useState(false);const {count}=useCart();const pathname=usePathname();return <>
  <div className="notice-bar">TƯƠI THEO MÙA, NGON THEO CÁCH CỦA BẠN <span aria-hidden="true">✺</span> ĐẶT HÀNG TRỰC TUYẾN</div>
  <header className="site-header"><div className="container nav-wrap">
    <Link className="brand" href="/" onClick={()=>setMenu(false)} aria-label="Vườn Ép - về trang chủ"><span className="brand-mark"><Leaf size={25} strokeWidth={2.25}/></span><span>vườn<span className="brand-dot">.</span>ép<small>THE SEASONAL JUICE BAR</small></span></Link>
    <nav className={`nav-links ${menu?'nav-open':''}`} aria-label="Điều hướng chính">{links.map(l=><Link key={l.href} href={l.href} className={`${pathname===l.href?'active':''} ${l.href==='/3d-shop'?'nav-3d-link':''}`} onClick={()=>setMenu(false)}>{l.label}</Link>)}</nav>
    <div className="nav-actions"><Link href="/gio-hang" className="cart-nav" aria-label={`Giỏ hàng có ${count} sản phẩm`}><ShoppingBag size={20}/>{count>0&&<span className="cart-count">{count}</span>}</Link><button className="mobile-menu" type="button" aria-label={menu?"Đóng menu":"Mở menu"} aria-expanded={menu} onClick={()=>setMenu(x=>!x)}>{menu?<X/>:<Menu/>}</button></div>
  </div></header>
  </>}
