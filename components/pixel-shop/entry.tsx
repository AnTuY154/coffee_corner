"use client";
import dynamic from "next/dynamic";
const Garden = dynamic(() => import("./garden").then(m => m.PixelGarden), {
  ssr: false,
  loading: () => <div className="pg-loading" role="status">Đang mở khu vườn Pixel Art…</div>
});
export function PixelShopEntry(){return <Garden/>;}
