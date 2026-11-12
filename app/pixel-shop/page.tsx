import type { Metadata } from "next";
import { PixelShopEntry } from "@/components/pixel-shop/entry";
import { products } from "@/data/catalog";
export const metadata:Metadata={title:"Vườn É — Cửa hàng Pixel Art 2D",description:"Đi dạo trong khu vườn pixel, gặp bạn bè, chọn nước ép và trái cây tươi."};
export default function PixelShopPage(){
  return <><PixelShopEntry/><noscript><section style={{padding:"1rem"}}><h2>Thực đơn Vườn É</h2><p>Cần bật JavaScript để điều khiển nhân vật. Bạn vẫn xem được danh sách món:</p>{products.map(p=><p key={p.id}><a href={`/san-pham/${p.slug}`}>{p.name}</a> — {p.price.toLocaleString("vi-VN")}đ</p>)}</section></noscript></>;
}
