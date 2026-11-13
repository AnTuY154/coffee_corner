/**
 * Independent sprite layers reconstructed from the user supplied Fresh Juice image.
 * Art assets: public/pixel-shop/reference/ (see docs/REFERENCE_SCENE.md).
 * World is 480x320, preserving source image's original 3:2 perspective.
 * Drawing, shopping hotspots and the server's authoritative navigation stay separate.
 */
import { Assets, Container, Graphics, Rectangle, Sprite, Texture } from "pixi.js";
import { SCENE_WIDTH, SCENE_HEIGHT } from "@/shared/garden/model";
import { drawGuest, drawStaff, drawDog, drawCat } from "./art";
import { PET_ROUTES, petRouteAt, depthScaleAt } from "./pet-motion";

// The master scene already contains these static details. Only sprites that
// must cover moving characters require a second GPU draw. This halves the
// number of large textures submitted per frame on software WebGL.
const OCCLUDER_LAYERS=new Set([
  "counter-front","table-left","table-center","table-right",
  "table-back-left","table-back-right"
]);

export const REFERENCE_LAYERS = [
  {name:"roof-sign",file:"roof-sign.webp",bbox:[562,113,1045,226],z:5},
  {name:"canopy",file:"canopy.webp",bbox:[181,0,1377,300],z:6},
  {name:"menu-board",file:"menu-board.webp",bbox:[965,292,1222,467],z:90},
  {name:"fruit-display",file:"fruit-display.webp",bbox:[1017,456,1225,562],z:181},
  {name:"counter-front",file:"counter-front.webp",bbox:[633,526,1236,690],z:217},
  {name:"table-left",file:"table-left.webp",bbox:[8,544,369,830],z:249},
  {name:"table-center",file:"table-center.webp",bbox:[584,581,912,866],z:256},
  {name:"table-right",file:"table-right.webp",bbox:[1180,542,1535,830],z:249},
  {name:"table-back-left",file:"table-back-left.webp",bbox:[270,714,595,962],z:295},
  {name:"table-back-right",file:"table-back-right.webp",bbox:[902,713,1249,966],z:295},
  {name:"tree-canopy-left",file:"tree-canopy-left.webp",bbox:[0,0,605,480],z:18},
  {name:"tree-canopy-right",file:"tree-canopy-right.webp",bbox:[1120,65,1535,618],z:18}
] as const;
export type ReferenceAssets={base:Texture;parts:Map<string,Texture>;barista:Texture|null};
export async function loadReferenceAssets():Promise<ReferenceAssets|null>{
  const prefix=window.location.pathname.startsWith("/coffee_corner/")?"/coffee_corner":"";
  const path=prefix+"/pixel-shop/reference/";
  try{
    const base=await Assets.load<Texture>({alias:"ve-ref-scene",src:path+"scene.webp"});
    if(!base||base.width<100||base.height<100)return null;
    base.source.scaleMode="linear";
    const parts=new Map<string,Texture>();
    const loaded=await Promise.allSettled(REFERENCE_LAYERS.filter(layer=>OCCLUDER_LAYERS.has(layer.name)).map(async layer=>{
      const tex=await Assets.load<Texture>({alias:"ve-ref-"+layer.name,src:path+layer.file});
      return {name:layer.name,tex};
    }));
    for(const result of loaded){
      if(result.status!=="fulfilled")continue;
      result.value.tex.source.scaleMode="linear";
      parts.set(result.value.name,result.value.tex);
    }
    // The illustrated upper-body cashier comes from the approved artwork.
    // Keep the procedural barista as a safe fallback if this optional asset
    // cannot be loaded (e.g. older cached deployment).
    let barista:Texture|null=null;
    try{
      barista=await Assets.load<Texture>({
        alias:"ve-barista-wave-illustrated",
        src:prefix+"/pixel-shop/barista/wave-a.png"
      });
      barista.source.scaleMode="linear";
    }catch{/* Older releases still use the hand-drawn fallback. */}
    return {base,parts,barista};
  }catch{return null;}
}
export function buildReferenceScene(assets:ReferenceAssets){
  const world=new Container();world.sortableChildren=true;
  const image=new Sprite(assets.base);image.width=SCENE_WIDTH;image.height=SCENE_HEIGHT;image.zIndex=-1000;
  world.addChild(image);
  const unit=SCENE_WIDTH/1536;
  // Background already includes umbrellas, tables and chairs; an entire PNG
  // duplicated in front of a guest can cover the head. Only the lower chair
  // and tabletop region should be permitted to occlude a passing visitor.
  // Cutoff values use source-image pixels, not the 480x320 world.
  const tableForegroundY:Record<string,number>={
    "table-left":700,"table-center":738,"table-right":700,
    "table-back-left":826,"table-back-right":826
  };
  for(const layer of REFERENCE_LAYERS){
    if(!OCCLUDER_LAYERS.has(layer.name))continue; // Already visible in scene.webp.
    const tex=assets.parts.get(layer.name);if(!tex)continue;
    const [x0,y0,x1,y1]=layer.bbox;
    const cutoff=tableForegroundY[layer.name];
    // A frame is a cheap GPU texture view. Cropping the five furniture
    // sprites once avoids five costly per-frame stencil masks, especially
    // on headless Chromium software WebGL.
    const frame=cutoff===undefined?tex
      :new Texture({source:tex.source,frame:new Rectangle(0,cutoff-y0,x1-x0,y1-cutoff)});
    const item=new Sprite(frame);
    item.position.set(x0*unit,(cutoff??y0)*unit);
    item.width=(x1-x0)*unit;item.height=(y1-(cutoff??y0))*unit;
    item.zIndex=layer.z;item.label="pixel:"+layer.name;
    world.addChild(item);
  }
  // All character and table layers share a single depth-sorted Pixi world.
  // The approved illustrated 80×93 transparent PNG shows the *whole* face,
  // apron and waving arm, instead of the old blocky 22px head. The bottom
  // pixels are masked naturally by the counter-front at depth 217.
  const employee:Graphics|Sprite=assets.barista?new Sprite(assets.barista):new Graphics();
  employee.label="staff:stationary";
  employee.position.set(249,170);
  employee.zIndex=210;
  if(employee instanceof Sprite){
    employee.anchor.set(0.5,1);
    employee.width=52;
    employee.height=60;
  }else{
    drawStaff(employee,true,false,0);
    employee.scale.set(1.04);
  }
  world.addChild(employee);
  // Light rays beside the already-raised hand provide an unmistakable,
  // small greeting animation without moving the cashier's body.
  const waveAccent=new Graphics();
  waveAccent.label="staff:wave-accent";
  waveAccent.zIndex=211;
  waveAccent.rect(279,126,2,7).fill(0xffcd61);
  waveAccent.rect(283,135,6,2).fill(0xffdc81);
  waveAccent.rect(274,121,3,4).fill(0xffcd61);
  world.addChild(waveAccent);
  const dog=new Graphics();dog.label="pet:dog";world.addChild(dog);
  const cat=new Graphics();cat.label="pet:ginger-cat";world.addChild(cat);
  const grayCat=new Graphics();grayCat.label="pet:gray-cat";world.addChild(grayCat);
  const lights=new Graphics();lights.zIndex=16;world.addChild(lights);
  const bulbs=[[17,61],[31,48],[46,37],[61,32],[80,41],[181,96],[233,96],[278,96],[318,94],[349,91]];
  let previous=-1;
  let lastWaveFrame=-1;
  function update(tick:number,reducedMotion:boolean){
    const time=reducedMotion?0:tick;
    const dogPose=petRouteAt(time,PET_ROUTES.dog,11);
    const gingerPose=petRouteAt(time,PET_ROUTES.ginger,7,13);
    const grayPose=petRouteAt(time,PET_ROUTES.gray,6,37);
    for(const [sprite,pose] of [[dog,dogPose],[cat,gingerPose],[grayCat,grayPose]] as const){
      sprite.position.set(pose.x,pose.y);
      const scale=depthScaleAt(pose.y);
      sprite.scale.set(pose.direction*scale,scale);
      // User-facing animals stay visible when crossing transparent furniture overlays.
      sprite.zIndex=320+Math.round(pose.y);
    }
    const waveFrame=reducedMotion?0:(tick%8<3.3?1+Math.floor(tick*2.5)%2:0);
    if(waveFrame!==lastWaveFrame){
      waveAccent.visible=waveFrame>0;
      waveAccent.alpha=waveFrame===2?0.65:1;
      if(employee instanceof Graphics)drawStaff(employee,waveFrame>0,false,Math.max(0,waveFrame-1));
      lastWaveFrame=waveFrame;
    }
    const step=reducedMotion?0:Math.floor(tick*6);
    if(step===previous)return;previous=step;
    drawDog(dog,step);drawCat(cat,false,step);drawCat(grayCat,true,step);
    lights.clear();
    for(let i=0;i<bulbs.length;i++){
      const [x,y]=bulbs[i],pulse=reducedMotion?.3:.23+.1*(1+Math.sin(tick*2+i));
      lights.circle(x,y,3.5).fill({color:0xffdd9a,alpha:pulse*.35});
      lights.circle(x,y,1.5).fill({color:0xffffdc,alpha:pulse});
    }
  }
  update(0,false);
  return {world,actors:world,update,drawGuest};
}
