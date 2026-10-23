import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {resolve,dirname} from 'node:path';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const {nearCounter,stepMovement,START_POSITION}=await import('../components/3d-shop/types.ts');
const make=()=>({keys:new Set(),x:START_POSITION.x,z:START_POSITION.z,yaw:0,pitch:0,locked:false,autoWalk:false});
{
 const c=make(); assert.equal(nearCounter(c.x,c.z),false);
 c.keys.add('forward');for(let i=0;i<400;i++)stepMovement(c,1/60);
 assert(c.z>=1.9 && c.z<3.25);assert.equal(nearCounter(c.x,c.z),true);
 c.keys.clear();c.keys.add('back');for(let i=0;i<500;i++)stepMovement(c,1/60);
 assert(c.z<=10.5);assert.equal(nearCounter(c.x,c.z),false);
}
{
 const c=make();c.autoWalk=true;let arrived=false;
 for(let i=0;i<300;i++){
   const r=stepMovement(c,1/60);if(r.arrived){arrived=true;break;}
 }
 assert(arrived);assert.equal(c.autoWalk,false);assert.equal(c.z,2.6);assert.equal(nearCounter(c.x,c.z),true);
}
{
 const c=make();c.keys.add('forward');c.locked=true;stepMovement(c,1);
 assert.equal(c.z,START_POSITION.z);
}
{
 const c=make();c.yaw=1.57;c.keys.add('forward');stepMovement(c,1/60);
 assert(c.x<0);assert(Math.abs(c.z-START_POSITION.z)<.001);
}
const file=(p)=>readFileSync(resolve(root,p),'utf8');
const page=file('app/3d-shop/page.tsx'),wrapper=file('components/3d-shop/immersive-shop.tsx'),world=file('components/3d-shop/world.tsx');
assert(page.includes('ImmersiveShop'));
assert(wrapper.includes('"KeyE"')&&wrapper.includes('openMenu()')&&wrapper.includes('goToCounter(true)'));
assert(wrapper.includes('useCart()') && wrapper.includes('add(product.id)'));
assert(wrapper.includes('webglAvailable===false'));
assert(wrapper.includes('aria-modal="true"'));
assert(world.includes('Blender')&&world.includes('Juicer')&&world.includes('Crate')&&world.includes('Pineapple'));
assert(file('app/page.tsx').includes('href="/3d-shop"'));
assert(file('components/site-header.tsx').includes('Vào quán 3D'));
assert(existsSync(resolve(root,'app/api/orders/route.ts')),'existing order API must remain');
console.log('3D shop movement, navigation, fallbacks, basket and prop invariants passed.');
