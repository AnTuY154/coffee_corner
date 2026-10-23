import type { Metadata } from "next";
import { ImmersiveShop } from "@/components/3d-shop/immersive-shop";

export const metadata: Metadata = {
  title: "Ghé Vườn Ép 3D — Đi dạo và mua nước ép",
  description: "Bước vào cửa hàng nước ép Vườn Ép 3D, di chuyển đến quầy bằng WASD hoặc chạm trên điện thoại, mở menu và đặt nước ép theo mùa.",
};

export default function Shop3DPage(){return <ImmersiveShop/>;}
