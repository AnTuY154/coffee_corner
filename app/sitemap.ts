import type { MetadataRoute } from "next";
import { products } from "@/data/catalog";
export default function sitemap():MetadataRoute.Sitemap {const base=process.env.NEXT_PUBLIC_SITE_URL||"http://localhost:3000";return ["/","/menu","/lich-mua","/ve-chung-toi",...products.map(p=>`/san-pham/${p.slug}`)].map(path=>({url:`${base}${path}`,changeFrequency:"monthly" as const,priority:path==="/"?1:0.7}));}
