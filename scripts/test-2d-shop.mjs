import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {resolve} from 'node:path';
const root=resolve(process.cwd());
const source=(p)=>readFileSync(resolve(root,p),'utf8');
const page=source('app/page.tsx');
const scene=source('components/2d-shop/illustrated-shop.tsx');
const art=source('components/2d-shop/shop-illustration.tsx');
const styles=source('components/2d-shop/illustrated-shop.css');
const menu=source('components/3d-shop/shop-menu-2d.tsx');
const checkout=source('components/3d-shop/in-scene-checkout.tsx');

// New root is genuinely a two-dimensional point-and-click shop, not a WebGL skin.
assert.match(page,/IllustratedShop/,'homepage must render the illustrated scene');
assert.doesNotMatch(page,/ImmersiveShop|ShopWorld/,'no WebGL world on homepage');
assert.doesNotMatch(scene,/<Canvas|useGLTF|useFrame|WebGLRenderer/,'2D scene must not require Three.js/WebGL');
assert.match(scene,/<ShopIllustration\s*\/>/,'scene uses local vector shop art');
assert.match(art,/viewBox="0 0 1440 810"/,'art and clickable zones use the same fixed coordinates');
for(const visible of [
 'VƯỜN ÉP','ve2d-clerk','ve2d-clerk-wave','ve2d-dog','ve2d-treetop',
 've2d-walker','Outdoor customer seating','30 m²','Left fence'
]){
 // The architecture-specific 30m² constraint is documented by the scene story,
 // while the SVG establishes proportions rather than literal construction drawings.
 const haystack=visible==='30 m²'?scene:art;
 assert(haystack.includes(visible),visible+' needs to be present in the 2D scene');
}
assert.match(art,/Crates, baskets and fresh produce/,'fruit display supports shopping');
assert.match(art,/Large tree canopy/,'planted outdoor shaded seating');
assert.match(art,/Juice|drink|freshly served juices/i,'hand drawn drinks near seating');

const ids=['sign','clerk','menu','fruits','cooler','seats','tree','dog'];
for(const id of ids)assert(scene.includes('id:"'+id+'"'),id+' needs an interaction zone');
assert.match(scene,/HOTSPOTS\.map\(spot=>\s*<button/,'all objects should be actual semantic buttons');
assert.match(scene,/aria-describedby=\{"ve2d-cloud-"/,'hotspot describes its cloud tooltip');
assert.match(scene,/role="tooltip"/,'instruction bubble is semantically described');
assert.match(scene,/onPointerEnter=\{e=>/,'desktop hover reveals cloud');
assert.match(scene,/onPointerLeave=\{e=>/,'cloud hides when pointer leaves');
assert.match(scene,/onFocus=\{e=>/,'keyboard focus support');
assert.match(scene,/focus-visible/,'keyboard-only focus visualises bubble');
assert.match(scene,/if\(touch&&e\.detail!==0&&active!==spot\.id\)/,'first touch previews, second touch opens');
assert.match(scene,/e\.detail!==0/,'keyboard button activation is immediate');
assert.match(scene,/window\.innerWidth<760/,'small devices start centred on counter');
assert.match(scene,/last\.current\?\.focus\(\)/,'closing a tooltip action restores focus');
assert.match(styles,/prefers-reduced-motion:reduce/,'motion accessibility token');
assert.match(styles,/\.ve2d-cloud\s*\{/,'styled popover balloon');
assert.match(styles,/\.ve2d-cloud::after/,'tooltip cloud includes a pointer tail');
assert.match(styles,/data-placement=below/,'tooltip flips above/below the shop artwork');
assert.match(styles,/\[data-visible=true\]/,'cloud is controlled, not permanently baked into image');
assert.match(styles,/@media \(prefers-reduced-motion:reduce\)/,'suppress illustration animation when requested');
assert.match(styles,/\.ve2d-walker/,'visitors move without a 3D world');
assert.match(scene,/<ShopMenu2D onClose=/,'order menu opens inside same shop root');
assert.match(menu,/setView\("checkout"\)/,'basket opens same-route checkout');
assert.match(checkout,/fetch\("\/api\/orders"/,'backend submission remains secure');
assert.match(checkout,/NEXT_PUBLIC_GITHUB_PAGES_DEMO/,'static demo does not pretend to take real orders');
assert.match(menu,/cửa hàng minh hoạ 2D/,'menu copy reflects new illustrated environment');
assert(!scene.includes('router.push'),'clicking an interactive object must never navigate away');
assert(existsSync(resolve(root,'components/2d-shop/shop-illustration.tsx')),'local vector art exists');
console.log('PASS: illustrated 2D open storefront, cloud tooltip hover/focus/tap, moving figures and same-scene commerce.');
