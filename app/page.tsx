import { IllustratedShop } from "@/components/2d-shop/illustrated-shop";
import { PixelShopEntry } from "@/components/pixel-shop/entry";
export const metadata={title:"Vườn É — Nước ép và trái cây tươi"};
// Keep the old landing page as a rollback until QA01–QA12 are accepted.
export default function Home(){return process.env.NEXT_PUBLIC_PIXEL_SHOP_ENABLED === "1" ? <PixelShopEntry/> : <IllustratedShop/>;}
