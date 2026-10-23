import { Suspense } from "react";
import type { Metadata } from "next";
import { MenuCatalog } from "@/components/menu-catalog";
export const metadata:Metadata={title:"Thực đơn nước ép theo mùa",description:"24 công thức nước ép và trái cây xay, lọc theo mùa, tháng thu hoạch và nguyên liệu."};
export default function MenuPage(){return <div className="page-main container"><div className="page-intro"><span className="section-kicker">THỰC ĐƠN CỦA VƯỜN</span><h1>Một khu vườn <em>trong ly.</em></h1><p>Chọn loại quả bạn thích, khám phá những công thức tươi mới và đặt món ngay tại đây.</p></div><Suspense fallback={<p>Đang tải thực đơn...</p>}><MenuCatalog/></Suspense></div>}
