/**
 * Independent sprite layers reconstructed from the user supplied Fresh Juice image.
 * Art assets: public/pixel-shop/reference/ (see docs/REFERENCE_SCENE.md).
 * World is 480x320, preserving source image's original 3:2 perspective.
 * Drawing, shopping hotspots and the server's authoritative navigation stay separate.
 */
import { Assets, Container, Graphics, Sprite, type Texture } from "pixi.js";
import { SCENE_WIDTH, SCENE_HEIGHT } from "@/shared/garden/model";
import { drawGuest, drawStaff, drawDog, drawCat } from "./art";
import { PET_ROUTES, petRouteAt, depthScaleAt } from "./pet-motion";

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
export type ReferenceAssets={base:Texture;parts:Map<string,Texture>};
export async function loadReferenceAssets():Promise<ReferenceAssets|null>{
  const prefix=window.location.pathname.startsWith("/coffee_corner/")?"/coffee_corner":"";
  const path=prefix+"/pixel-shop/reference/";
  try{
    const base=await Assets.load<Texture>({alias:"ve-ref-scene",src:path+"scene.webp"});
    if(!base||base.width<100||base.height<100)return null;
    base.source.scaleMode="linear";
    const parts=new Map<string,Texture>();
    const loaded=await Promise.allSettled(REFERENCE_LAYERS.map(async layer=>{
      const tex=await Assets.load<Texture>({alias:"ve-ref-"+layer.name,src:path+layer.file});
      return {name:layer.name,tex};
    }));
    for(const result of loaded){
      if(result.status!=="fulfilled")continue;
      result.value.tex.source.scaleMode="linear";
      parts.set(result.value.name,result.value.tex);
    }
    return {base,parts};
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
    const tex=assets.parts.get(layer.name);if(!tex)continue;
    const item=new Sprite(tex);
    const [x0,y0,x1,y1]=layer.bbox;
    item.position.set(x0*unit,y0*unit);
    item.width=(x1-x0)*unit;item.height=(y1-y0)*unit;
    item.zIndex=layer.z;item.label="pixel:"+layer.name;
    const cutoff=tableForegroundY[layer.name];
    if(cutoff!==undefined){
      const lowerMask=new Graphics().rect(x0*unit,cutoff*unit,(x1-x0)*unit,(y1-cutoff)*unit).fill(0xffffff);
      lowerMask.label="occluder:"+layer.name;
      world.addChild(lowerMask);
      item.mask=lowerMask;
    }
    world.addChild(item);
  }
  // All character and table layers share a single depth-sorted Pixi world.
  const employee=new Graphics();employee.position.set(249,181);employee.zIndex=210;employee.label="staff:stationary";world.addChild(employee);
  // One stable barista pose behind the foreground counter. No waves, exits or pet interactions.
  drawStaff(employee,false,false,1);employee.scale.set(1.05);
  const dog=new Graphics();dog.label="pet:dog";world.addChild(dog);
  const cat=new Graphics();cat.label="pet:ginger-cat";world.addChild(cat);
  const grayCat=new Graphics();grayCat.label="pet:gray-cat";world.addChild(grayCat);
  const lights=new Graphics();lights.zIndex=16;world.addChild(lights);
  const bulbs=[[17,61],[31,48],[46,37],[61,32],[80,41],[181,96],[233,96],[278,96],[318,94],[349,91]];
  let previous=-1;
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
