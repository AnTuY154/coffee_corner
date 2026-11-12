/**
 * Independent sprite layers reconstructed from the user supplied Fresh Juice image.
 * Art assets: public/pixel-shop/reference/ (see docs/REFERENCE_SCENE.md).
 * World is 480x320, preserving source image's original 3:2 perspective.
 * Drawing, shopping hotspots and the server's authoritative navigation stay separate.
 */
import { Assets, Container, Graphics, Sprite, type Texture } from "pixi.js";
import { SCENE_WIDTH, SCENE_HEIGHT } from "@/shared/garden/model";
import { drawGuest, drawStaff, drawDog, drawCat } from "./art";

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
  for(const layer of REFERENCE_LAYERS){
    const tex=assets.parts.get(layer.name);if(!tex)continue;
    const item=new Sprite(tex);
    const [x0,y0,x1,y1]=layer.bbox;
    item.position.set(x0*unit,y0*unit);
    item.width=(x1-x0)*unit;item.height=(y1-y0)*unit;
    item.zIndex=layer.z;item.label="pixel:"+layer.name;
    world.addChild(item);
  }
  // All character and table layers share a single depth-sorted Pixi world.
  const employee=new Graphics();employee.position.set(249,181);employee.zIndex=210;world.addChild(employee);
  const dog=new Graphics();dog.position.set(417,279);dog.zIndex=279;world.addChild(dog);
  const cat=new Graphics();cat.position.set(104,286);cat.zIndex=286;world.addChild(cat);
  const grayCat=new Graphics();grayCat.position.set(348,252);grayCat.zIndex=252;world.addChild(grayCat);
  const lights=new Graphics();lights.zIndex=16;world.addChild(lights);
  const bulbs=[[17,61],[31,48],[46,37],[61,32],[80,41],[181,96],[233,96],[278,96],[318,94],[349,91]];
  let previous=-1;
  function update(tick:number,reducedMotion:boolean){
    const step=reducedMotion?0:Math.floor(tick*5);
    if(step===previous)return;previous=step;
    const cycle=reducedMotion?0:tick%28;
    const outside=cycle>=13&&cycle<25;
    if(!outside){employee.position.set(249,181);employee.zIndex=210;}
    else if(cycle<17){
      const p=(cycle-13)/4;employee.position.set(246-63*p,183+38*p);employee.zIndex=215+32*p;
    }else if(cycle<21){
      const p=(cycle-17)/4;employee.position.set(183+57*p,221+54*p);employee.zIndex=275;
    }else{
      const p=(cycle-21)/4;employee.position.set(240+9*p,275-94*p);employee.zIndex=275-65*p;
    }
    drawStaff(employee,!outside&&step%8<3,cycle>18&&cycle<20,step);
    employee.scale.set(outside?1.15:1.05);
    drawDog(dog,step);dog.x=417+(reducedMotion?0:Math.sin(tick*.55)*14);
    drawCat(cat,false,step);drawCat(grayCat,true,step);
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
