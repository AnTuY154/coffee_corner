export const dynamic = "force-static";
import type { MetadataRoute } from "next";
export default function robots():MetadataRoute.Robots {const base=process.env.NEXT_PUBLIC_SITE_URL||"http://localhost:3000";return {rules:process.env.NEXT_PUBLIC_GITHUB_PAGES_DEMO==="1"?[{userAgent:"*",disallow:"/"}]:[{userAgent:"*",allow:"/",disallow:["/thanh-toan","/gio-hang","/api/"]}],sitemap:`${base}/sitemap.xml`};}
