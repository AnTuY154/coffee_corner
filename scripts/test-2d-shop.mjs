import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(process.cwd());
const source = path => readFileSync(resolve(root, path), "utf8");
const page = source("app/page.tsx");
const scene = source("components/2d-shop/illustrated-shop.tsx");
const style = source("components/2d-shop/illustrated-shop.css");
const art = source("components/2d-shop/shop-illustration.tsx");
const menu = source("components/3d-shop/shop-menu-2d.tsx");
const checkout = source("components/3d-shop/in-scene-checkout.tsx");

// The homepage must be a genuine DOM-overlay 2D scene, not a WebGL view.
assert.match(page, /IllustratedShop/);
assert.doesNotMatch(page, /ImmersiveShop|ShopWorld/);
assert.doesNotMatch(scene, /<Canvas|useGLTF|WebGLRenderer|router\.push/);

// No alternate illustrated fallback may introduce unapproved people or animals.
assert.doesNotMatch(scene, /<ShopIllustration/);
assert.match(art, /viewBox="0 0 1440 810"/);
assert.match(scene, /REF_W = 1672, REF_H = 941/);
assert(scene.includes("canonical/shop.webp"));
assert.match(scene, /onLoad=\{\(\) => \{ setArtLoaded\(true\)/);
assert.match(scene, /onError=\{\(\) => \{ setArtLoaded\(false\); setSpritesReady\(false\); \}\}/);
assert(style.includes("aspect-ratio:1672/941"));
assert.match(style, /object-fit:fill/);
assert.match(style, /data-approved-art=true/);
assert.match(scene, /pixel-perfect|Pixel-perfect/);
assert.match(scene, /ART_HOTSPOTS\.map/);
for (const id of ["sign", "clerk", "menu", "fruits", "cooler", "seats", "seatsRight",
  "tree", "parasol", "dog", "cat", "categories"]) {
  assert(scene.includes('id: "' + id + '"'), "missing art interaction target " + id);
}

// Cloud hints are not hard-coded into the scene image by React.
assert.match(scene, /spots\.map\(spot => <button/);
assert.match(scene, /role="tooltip"/);
assert.match(scene, /aria-describedby=\{"ve2d-cloud-" \+ spot\.id\}/);
assert.match(scene, /onPointerEnter=\{e =>/);
assert.match(scene, /onPointerLeave=\{e =>/);
assert.match(scene, /onFocus=\{e =>/);
assert.match(scene, /onBlur=\{\(\) =>/);
assert.match(scene, /coarsePointer && e\.detail !== 0 && active !== spot\.id/);
assert.match(scene, /scrollLeft/);
assert.match(scene, /trigger\.current\?\.focus\(\)/);
assert.match(scene, /e\.key === "Escape"/);
assert.match(style, /\.ve2d-cloud::after/);
assert.match(style, /prefers-reduced-motion:reduce/);
assert.match(style, /\.ve2d-ambient/);
assert.match(style, /\.ve2d-leaf/);
assert.match(style, /\.ve2d-cat-heart/);

// Same-screen ordering/checkout, including direct access to the mobile cart.
assert.match(scene, /<ShopMenu2D initialView=\{openBasket \? "cart" : "browse"\}/);
assert.match(menu, /initialView\?: "browse" \| "cart"/);
assert.match(menu, /setView\("checkout"\)/);
assert.match(checkout, /fetch\("\/api\/orders"/);
assert.match(checkout, /NEXT_PUBLIC_GITHUB_PAGES_DEMO/);
assert(!scene.includes("router.push"), "navigation must stay on the current scene");

const cleanAsset = resolve(root, "public/art/canonical/shop.webp");
if (existsSync(cleanAsset)) {
  console.log("Approved cleaned art is present; verify pixels and browser screenshot separately.");
} else {
  console.warn("ART NOT INTEGRATED: public/art/canonical/shop.webp is missing. The legacy SVG fallback is still active; DO NOT MERGE as visually complete.");
}
console.log("PASS: 16:9 scene wiring, percentage hit targets, accessible clouds and same-URL menu/checkout.");
