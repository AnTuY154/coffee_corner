import type { NextConfig } from "next";
// GitHub Pages is a public static DEMO only. Production still runs with the Node.js API.
const isPages = process.env.GITHUB_PAGES_EXPORT === "1";
const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ["three"],
  poweredByHeader: false,
  ...(isPages
    ? {
        output: "export" as const,
        basePath: "/coffee_corner",
        trailingSlash: true,
        images: {
          loader: "custom" as const,
          loaderFile: "./pages-image-loader.ts",
        },
      }
    : {
        async headers() {
          return [{source:"/(.*)",headers:[
            {key:"X-Content-Type-Options",value:"nosniff"},
            {key:"Referrer-Policy",value:"strict-origin-when-cross-origin"},
            {key:"X-Frame-Options",value:"DENY"},
            {key:"Permissions-Policy",value:"camera=(), microphone=(), geolocation=()"}
          ]}];
        }
      }),
};
export default nextConfig;
