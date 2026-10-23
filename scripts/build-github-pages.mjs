/**
 * Builds a fully static demo for GitHub Pages without shipping the order API.
 * The production API file is restored even if the static build fails.
 */
import { existsSync, mkdirSync, renameSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { spawnSync } from "node:child_process";

const serverOnlyRoute=resolve("app/api/orders/route.ts");
const temporaryRoute=resolve("app/api/orders/route.github-pages-disabled");
if (!existsSync(serverOnlyRoute)) {
  throw new Error("Could not find the production order API. Refusing demo build.");
}
if (existsSync(temporaryRoute)) {
  throw new Error("Temporary file already exists. Check for interrupted build.");
}
renameSync(serverOnlyRoute,temporaryRoute);
try {
  const env={...process.env,
    GITHUB_PAGES_EXPORT:"1",
    NEXT_PUBLIC_GITHUB_PAGES_DEMO:"1",
    NEXT_PUBLIC_SITE_URL:"https://antuy154.github.io/coffee_corner",
    NEXT_PUBLIC_BASE_PATH:"/coffee_corner",
  };
  const result=spawnSync(process.execPath,["node_modules/next/dist/bin/next","build"],{env,stdio:"inherit"});
  if(result.error) throw result.error;
  if(result.status!==0) throw new Error("GitHub Pages export failed with status "+String(result.status));
  if (!existsSync("out/index.html") || !existsSync("out/3d-shop/index.html")) {
    throw new Error("Static output missing homepage or immersive 3D shop");
  }
  mkdirSync("out",{recursive:true});
  writeFileSync("out/.nojekyll","");
  console.log("GitHub Pages demo output is ready in out/");
} finally {
  renameSync(temporaryRoute,serverOnlyRoute);
}
