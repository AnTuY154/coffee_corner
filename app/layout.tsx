import type { Metadata, Viewport } from "next";
import { CartProvider } from "@/components/cart-context";
import "./globals.css";
const siteUrl=process.env.NEXT_PUBLIC_SITE_URL||"http://localhost:3000";
export const metadata: Metadata = {title:{default:"Vườn Ép — Nước ép theo mùa",template:"%s | Vườn Ép"},description:"Khám phá nước ép và trái cây xay theo mùa, công thức rõ ràng, thông tin nguyên liệu và đặt hàng trực tuyến.",metadataBase:new URL(siteUrl),openGraph:{title:"Vườn Ép — Nước ép theo mùa",description:"Mỗi mùa một vị ngọt, từ trái cây tươi của Việt Nam.",type:"website",locale:"vi_VN"}};
export const viewport:Viewport={width:"device-width",initialScale:1,themeColor:"#f8f7ed"};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="vi"><body><a className="skip-link" href="#main-content">Chuyển đến nội dung chính</a><CartProvider><main id="main-content">{children}</main></CartProvider></body></html>}
