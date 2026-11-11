import { Assets, Container, Rectangle, Sprite, Texture } from "pixi.js";

export type KenneyPack = "farm" | "town";
export type KenneyAtlas = { tile: (pack: KenneyPack, col: number, row: number, columns?: number, rows?: number) => Texture };
const TILE = 16;
export async function loadKenneyAtlas(): Promise<KenneyAtlas | null> {
  const prefix = window.location.pathname.startsWith("/coffee_corner/") ? "/coffee_corner" : "";
  try {
    const [farm,town] = await Promise.all([
      Assets.load<Texture>({ alias:"ve-kenney-farm", src:prefix+"/pixel-shop/atlases/kenney-tiny-farm.png", data:{scaleMode:"nearest"} }),
      Assets.load<Texture>({ alias:"ve-kenney-town", src:prefix+"/pixel-shop/atlases/kenney-tiny-town.png", data:{scaleMode:"nearest"} })
    ]);
    farm.source.scaleMode="nearest";
    town.source.scaleMode="nearest";
    const source={farm,town};
    const cache=new Map<string,Texture>();
    return { tile(pack,col,row,columns=1,rows=1) {
      if (![col,row,columns,rows].every(Number.isInteger) || col<0 || row<0 || columns<1 || rows<1 || (col+columns)*TILE>192 || (row+rows)*TILE>176) {
        throw new Error("Kenney tile out of range");
      }
      const key=[pack,col,row,columns,rows].join(":");
      let texture=cache.get(key);
      if(!texture) {
        texture=new Texture({source:source[pack].source,frame:new Rectangle(col*TILE,row*TILE,columns*TILE,rows*TILE)});
        cache.set(key,texture);
      }
      return texture;
    }};
  } catch {
    return null; // Graphics fallback remains playable offline.
  }
}

/** Add curated CC0 foliage and fruit from Tiny Town/Farm. Pixel textures are reused. */
export function placeKenneyDecorations(world:Container,atlas:KenneyAtlas) {
  function add(pack:KenneyPack,col:number,row:number,w:number,h:number,x:number,y:number,scale:number,z:number) {
    const s=new Sprite(atlas.tile(pack,col,row,w,h));
    s.anchor.set(0.5,1);s.position.set(x,y);s.scale.set(scale);s.roundPixels=true;s.zIndex=z;
    world.addChild(s);
  }
  // The environment is composed from just two coherent 16x16 Kenney tilesheets.
  add("town",5,0,3,3,33,165,1.05,166);
  add("town",8,0,3,3,450,162,1.05,163);
  add("farm",10,6,1,1,85,172,1.1,173);
  add("farm",10,6,1,1,415,172,1.1,173);
  add("farm",9,6,1,1,75,183,0.9,184);
  add("farm",8,6,1,1,408,183,0.9,184);
  add("farm",4,5,1,1,24,265,0.8,266);
  add("farm",5,5,1,1,456,265,0.8,266);
  add("farm",7,4,1,1,339,151,0.8,155);
  add("farm",8,4,1,1,360,151,0.8,155);
  add("farm",9,4,1,1,382,151,0.8,155);
  add("farm",6,3,1,1,213,151,0.65,155);
  add("farm",7,3,1,1,271,151,0.65,155);
}
