import { Container, Graphics, Text } from "pixi.js";
import { placeKenneyDecorations, type KenneyAtlas } from "./kenney-art";
import { TABLES, SEATS, HOTSPOTS, type Actor } from "@/shared/garden/model";

const C = {
  sky: 0xbbe7df, skyLight: 0xe0f3dd, cream: 0xffedbd, wall: 0xf7d49e,
  roof: 0xe38a58, roofLight: 0xf7b777, brown: 0x694a42, wood: 0x986c4f,
  woodLight: 0xc18a63, grass: 0x80bd77, grassLight: 0x9dcc85, grassDark: 0x4c8a63,
  path: 0xeee0ba, shadow: 0x596855, forest: 0x326a50, leaf: 0x4b9259,
  leafLight: 0x83bc62, orange: 0xffa446, coral: 0xea7568, white: 0xfff8e2
};
const pixel = (g: Graphics, x: number, y: number, w: number, h: number, fill: number) => g.rect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)).fill(fill);
function label(text: string, x: number, y: number, fontSize = 8, color = "#fff4d6") {
  const t = new Text({ text, style: { fontFamily: "monospace", fontWeight: "bold", fontSize, fill: color, align: "center" } });
  t.anchor.set(0.5); t.position.set(x, y); t.roundPixels = true; return t;
}
function tree(g: Graphics, x: number, y: number, size = 1) {
  const s = size;
  pixel(g, x-4*s, y-4*s, 8*s, 30*s, C.brown);
  pixel(g, x-25*s, y-43*s, 50*s, 34*s, C.forest);
  pixel(g, x-31*s, y-29*s, 62*s, 19*s, C.leaf);
  pixel(g, x-21*s, y-49*s, 40*s, 14*s, C.leafLight);
  pixel(g, x-25*s, y-18*s, 49*s, 12*s, C.grassDark);
  [[-13,-34], [8,-39], [19,-24], [-23,-21]].forEach(([dx,dy]) => {
    pixel(g, x+(dx-2)*s, y+(dy-2)*s, 6*s, 6*s, C.orange);
    pixel(g, x+dx*s, y+(dy-2)*s, 2*s, 2*s, C.cream);
  });
}
function pottedPlant(g: Graphics, x: number, y: number) {
  pixel(g,x-4,y-10,8,11,C.wood); pixel(g,x-6,y-11,12,3,C.brown);
  pixel(g,x-2,y-21,4,10,C.forest);
  pixel(g,x-10,y-20,8,7,C.leaf);
  pixel(g,x+2,y-24,9,10,C.leafLight);
}
function table(g: Graphics, x: number, y: number) {
  pixel(g,x-3,y+1,6,12,C.brown);
  pixel(g,x-14,y-9,28,6,C.brown);
  pixel(g,x-12,y-11,24,6,C.woodLight);
  pixel(g,x-8,y-9,8,2,C.cream);
  pixel(g,x-2,y-16,4,6,C.coral);
  pixel(g,x-2,y-18,4,2,C.white);
}
function chair(g: Graphics, x: number, y: number, side: boolean) {
  pixel(g,x-7,y-3,14,5,C.brown);
  pixel(g,x-6,y-3,12,3,C.cream);
  pixel(g,x-7,y+2,3,9,C.wood);
  pixel(g,x+4,y+2,3,9,C.wood);
  pixel(g,x+(side ? -7 : 5),y-10,3,7,C.brown);
}
function fruitCase(g: Graphics) {
  pixel(g,318,100,84,73,C.brown);
  pixel(g,323,103,74,62,0xd5eacb);
  pixel(g,326,107,68,17,0x7bac7f);
  pixel(g,326,127,68,17,0x90b6a0);
  pixel(g,326,147,68,15,0x8fbcad);
  for(let row=0;row<3;row++)for(let i=0;i<7;i++){
    const x=330+i*9, y=109+row*20+(i%2)*2;
    const colors=[[C.orange,0xe9ca64,0xf1aa3e],[0xe86a6a,0xf0bc50,0xf9db74],[0xb9d471,0xeca878,0xf5cf64]];
    pixel(g,x,y,7,7,colors[row][i%3]);
    pixel(g,x+1,y,3,2,C.white);
  }
  for(let y=124;y<163;y+=20)pixel(g,322,y,77,4,C.woodLight);
  pixel(g,355,102,3,63,C.white); pixel(g,323,167,77,6,C.wood);
}

/**
 * Cozy Garden Café art direction.
 * Drawn in native 480x270 pixel space so the existing A* navmesh,
 * four commerce hotspots and fifteen seats never shift.
 * Kenney CC0 atlas props are composited over this self-authored foundation.
 */
const DETAIL = {
  ink: 0x29483d, pine: 0x2c694d, moss: 0x478c65, lime: 0xa2ca78,
  peach: 0xf5b785, tile: 0xf3dbc4, clay: 0xd8785a, caramel: 0x92563f,
  gold: 0xfbd87e, pink: 0xf1a5a0, lilac: 0xb39ace, cream: 0xfff5d8,
  blue: 0x82c8c0, blueDark: 0x4a9e94, pot: 0xb56c4c
};
function leafCluster(g: Graphics, x:number, y:number, color:number, variant=0) {
  pixel(g,x-8,y-6,5,5,color); pixel(g,x-4,y-11,8,7,color);
  pixel(g,x+2,y-8,7,6,color); pixel(g,x-10,y,9,5,color);
  pixel(g,x-2,y-2,11,6,color);
  pixel(g,x+(variant%3),y-8,3,3,DETAIL.lime);
  pixel(g,x-5,y-3,3,2,DETAIL.lime);
}
function bloom(g: Graphics, x:number, y:number, color:number) {
  pixel(g,x-1,y-4,2,5,DETAIL.moss);
  pixel(g,x-3,y-7,2,3,color);pixel(g,x+1,y-7,2,3,color);
  pixel(g,x-1,y-9,2,3,color);pixel(g,x-1,y-6,2,2,DETAIL.gold);
}
function hangingPlanter(g:Graphics,x:number,y:number) {
  pixel(g,x,y,1,13,DETAIL.caramel);
  pixel(g,x-4,y+11,9,5,DETAIL.clay);
  leafCluster(g,x,y+11,DETAIL.pine,x);
  pixel(g,x-3,y+14,6,2,DETAIL.pot);
}
function woodenCrate(g:Graphics,x:number,y:number,fill=DETAIL.caramel) {
  pixel(g,x,y,17,12,DETAIL.ink);
  pixel(g,x+2,y+2,13,8,fill);
  pixel(g,x+5,y+2,2,8,DETAIL.gold);pixel(g,x+11,y+2,2,8,DETAIL.gold);
}
function tilePath(g:Graphics) {
  // A lush tiled terrace, with a quiet centre aisle for the walking avatar.
  pixel(g,0,170,480,100,0x90bd79);
  pixel(g,0,175,480,4,0x709e70);
  for(let row=0;row<6;row++)for(let col=0;col<20;col++) {
    const x=col*25 + (row%2)*12, y=181+row*17;
    const tint=(row+col)%5===0 ? 0xbed39a : ((row+col)%3===0 ? 0xa4c68b : 0x9ac187);
    pixel(g,x,y,23,15,tint);
    pixel(g,x+2,y+1,18,1,0xb1cc98);
    pixel(g,x+1,y+13,20,1,0x81ac77);
  }
  // Irregular warm cobbles create a visible path between the counter and entrance.
  for(let row=0;row<6;row++)for(let col=0;col<3;col++){
    const x=205+col*23+(row%2?10:0),y=178+row*16;
    pixel(g,x,y,20,12,((col+row)%3===0)?0xf8e6c4:0xe9d6b4);
    pixel(g,x+2,y+2,14,1,DETAIL.cream);
  }
  for(let i=0;i<53;i++){
    const x=(i*83+9)%480, y=179+(i*19)%89;
    if(x>193 && x<294)continue;
    pixel(g,x,y,2,1,i%3===0?DETAIL.lime:0x608f5e);
  }
}
function terraceDetails(g:Graphics) {
  // Border hedge and flower beds are outside walkable paths.
  for(let x=6;x<480;x+=18){
    if(x>185 && x<302)continue;
    leafCluster(g,x,268, x%3 ? DETAIL.moss : DETAIL.pine,x);
    if(x%3===0)bloom(g,x+5,258,x%2?DETAIL.pink:DETAIL.gold);
  }
  for(const t of TABLES){
    // Bistro table linen and fruit drinks give seats an obvious purpose.
    pixel(g,t.x-16,t.y+3,32,2,0x769d6c);
    pixel(g,t.x-12,t.y-11,24,2,DETAIL.cream);
    pixel(g,t.x-9,t.y-10,9,2,DETAIL.tile);
    pixel(g,t.x-1,t.y-19,4,5,DETAIL.gold);
    pixel(g,t.x,t.y-20,1,3,DETAIL.pink);
    pixel(g,t.x+5,t.y-12,4,3,0xf8e3b0);
    pixel(g,t.x+6,t.y-14,2,3,DETAIL.clay);
  }
  // Flower pots do not change game collisions.
  for(const [x,y] of [[17,188],[462,190],[15,247],[466,248],[115,185],[365,184]]){
    pixel(g,x-4,y-1,9,8,DETAIL.caramel);
    pixel(g,x-5,y-3,11,3,DETAIL.clay);
    leafCluster(g,x,y-2,DETAIL.pine,x);
    bloom(g,x+3,y-9, x%2 ? DETAIL.pink:DETAIL.gold);
  }
  // Charming narrow wooden garden fence, distant from the active seats.
  for(let x=0;x<480;x+=10){
    if(x>192 && x<302)continue;
    pixel(g,x,266,3,7,DETAIL.caramel);
  }
  pixel(g,0,268,195,2,DETAIL.caramel);
  pixel(g,301,268,179,2,DETAIL.caramel);
}
function paintCafeDetails(g:Graphics){
  // Sky gradient bands, birds and sun rays on either side of the sign.
  pixel(g,0,0,480,28,0xd9f5db);
  pixel(g,0,28,480,26,0xbcebe3);
  for(let i=0;i<5;i++){
    const x=12+i*14;
    pixel(g,x,14+(i%2)*4,16,3,DETAIL.cream);
    pixel(g,x+4,11+(i%2)*4,8,3,DETAIL.cream);
  }
  for(let i=0;i<4;i++){
    const x=385+i*17;
    pixel(g,x,23+(i%2)*4,17,3,DETAIL.cream);
    pixel(g,x+4,20+(i%2)*4,8,3,DETAIL.cream);
  }
  pixel(g,355,17,22,3,0xf9ddb1);pixel(g,361,11,10,16,0xf9ddb1);
  pixel(g,363,13,6,12,DETAIL.gold);
  for(const [x,y] of [[91,19],[105,27],[335,40],[386,46]]){
    pixel(g,x,y,5,1,DETAIL.pine);pixel(g,x+5,y-2,5,1,DETAIL.pine);
  }
  // Timber storefront with two-toned masonry and vertical timber ribs.
  pixel(g,55,89,359,77,0xe7bb92);
  pixel(g,61,94,346,67,0xffe9c7);
  for(let i=0;i<14;i++){
    const x=62+i*25;
    pixel(g,x,94,1,65,0xf2d0a6);
  }
  pixel(g,55,97,360,3,DETAIL.cream);
  pixel(g,57,160,357,5,0xb77b55);
  pixel(g,62,162,350,2,DETAIL.gold);
  // Awning: fabric and scalloped fringe with proper depth.
  pixel(g,39,65,394,4,DETAIL.ink);
  pixel(g,43,68,386,22,0xf5b887);
  for(let i=0;i<12;i++){
    const x=43+i*32;
    pixel(g,x,67,16,22,i%2===0?0xffe8ae:0xe98e70);
    pixel(g,x+1,88,14,4,i%2===0?0xffe8ae:0xe98e70);
    pixel(g,x+3,91,10,2,i%2===0?0xffe8ae:0xe98e70);
  }
  pixel(g,41,64,389,3,DETAIL.caramel);
  pixel(g,42,93,388,2,DETAIL.caramel);
  // Trim posts and warm-lit windows.
  for(const x of [65,171,311,407]){
    pixel(g,x,97,5,68,DETAIL.caramel);
    pixel(g,x+1,97,2,63,0xd49c68);
  }
  pixel(g,175,99,134,55,0xb17f5b);
  pixel(g,181,102,122,48,0xd7c29e);
  for(let i=0;i<4;i++){
    const x=184+i*30;
    pixel(g,x,104,26,44,0xffe3a6);
    pixel(g,x+2,106,22,22,0xfaf1ca);
    pixel(g,x+2,130,22,15,0xcbe4c8);
  }
  // Hanging lamps and vine garlands beneath the awning.
  for(const x of [188,302]){
    pixel(g,x,95,1,15,DETAIL.caramel);
    pixel(g,x-5,110,11,3,DETAIL.ink);
    pixel(g,x-4,113,9,4,DETAIL.gold);
    pixel(g,x-2,116,5,2,0xf8eac7);
  }
  for(let i=0;i<25;i++){
    const x=72+i*13, y=95+Math.floor(Math.sin(i/3)*3);
    pixel(g,x,y,4,2,DETAIL.pine);
    pixel(g,x-1,y+2,3,5,i%2?DETAIL.moss:DETAIL.lime);
    if(i%6===0)bloom(g,x+2,y+8,DETAIL.pink);
  }
  // Left menu chalkboard and a tiny lemon-juice illustration.
  pixel(g,100,113,67,40,DETAIL.caramel);
  pixel(g,104,117,59,31,DETAIL.ink);
  pixel(g,109,123,11,11,DETAIL.gold);
  pixel(g,113,121,4,3,DETAIL.lime);
  pixel(g,109,136,45,1,0xd1d89e);
  pixel(g,109,139,36,1,0xd1d89e);
  pixel(g,109,142,43,1,0xd1d89e);
  // Menu hotspot remains x99..165, y117..148.
  // Right shop chalkboard stays inside the existing daily-board hotspot.
  pixel(g,426,115,47,39,DETAIL.caramel);
  pixel(g,430,119,40,31,DETAIL.ink);
  pixel(g,434,124,30,1,DETAIL.gold);
  for(let i=0;i<3;i++){
    pixel(g,435,129+i*6,19+i*3,2,DETAIL.cream);
    pixel(g,458,129+i*6,5,2,DETAIL.pink);
  }
  // Wooden service counter front + objects behind it.
  pixel(g,191,130,103,44,DETAIL.ink);
  pixel(g,194,132,97,40,DETAIL.caramel);
  pixel(g,197,134,91,21,0xb77f56);
  pixel(g,191,151,103,4,0xf1ba84);
  for(let i=0;i<9;i++) {
    const x=198+i*10;
    pixel(g,x,156,6,13,i%2 ? 0xa66f51 : 0xbd835d);
    pixel(g,x+1,156,2,13,0xd49a6a);
  }
  pixel(g,194,169,97,4,DETAIL.ink);
  // Blender, carafe and fruit bowls sit behind the counter top.
  pixel(g,201,124,10,13,DETAIL.blueDark);
  pixel(g,203,119,6,7,0xd9f0dc);
  pixel(g,204,118,4,2,DETAIL.cream);
  pixel(g,201,135,11,3,DETAIL.ink);
  pixel(g,278,128,9,8,DETAIL.clay);
  pixel(g,276,127,12,2,DETAIL.cream);
  for(const x of [278,282,285])pixel(g,x,123,4,5, x%2 ? DETAIL.gold:DETAIL.pink);
  // Fruit stand outer body is locked to the original interaction bounds.
  pixel(g,316,96,88,78,DETAIL.ink);
  pixel(g,319,99,82,71,DETAIL.caramel);
  pixel(g,321,102,78,65,0xebd9ae);
  for(let row=0;row<3;row++){
    const y=106+row*20;
    pixel(g,323,y,74,17,row%2?0xa0c2a4:0x8ebc9f);
    for(let col=0;col<8;col++){
      const x=327+col*9;
      const colors=[DETAIL.gold,DETAIL.pink,DETAIL.clay,DETAIL.lime];
      pixel(g,x,y+4+(col%2),7,7,colors[(row+col)%4]);
      pixel(g,x+1,y+4,3,2,DETAIL.cream);
      pixel(g,x+4,y+1,2,3,DETAIL.pine);
    }
    pixel(g,321,y+17,78,3,DETAIL.caramel);
  }
  pixel(g,358,102,2,64,DETAIL.cream);
  pixel(g,320,168,81,6,DETAIL.ink);
  // Sign board gets ornamental timber trim but is left readable.
  pixel(g,181,22,118,46,DETAIL.ink);
  pixel(g,185,25,110,39,DETAIL.caramel);
  pixel(g,189,29,102,32,DETAIL.cream);
  pixel(g,194,32,92,26,DETAIL.pine);
  pixel(g,200,34,81,2,DETAIL.moss);
  pixel(g,199,56,83,2,DETAIL.gold);
  pixel(g,183,64,114,3,DETAIL.ink);
  // Vines on the corners add a lush cafe feel without blocking the counter.
  for(let i=0;i<6;i++){
    const y=107+i*10;
    leafCluster(g,61+(i%2)*4,y, i%3 ? DETAIL.pine : DETAIL.moss,i);
    leafCluster(g,417-(i%2)*5,y, i%3 ? DETAIL.moss : DETAIL.pine,i+2);
  }
  for(const x of [75,391])hangingPlanter(g,x,94);
  woodenCrate(g,74,149);
  woodenCrate(g,391,151,DETAIL.clay);
}

function paintBackdrop(withKenney: boolean) {
  const g = new Graphics();
  pixel(g,0,0,480,176,C.sky);
  pixel(g,0,0,480,52,C.skyLight);
  for(let i=0;i<20;i++){const x=(i*79+11)%470,y=13+(i*17)%53;pixel(g,x,y,12+(i%3)*5,3,C.white);}
  pixel(g,0,153,480,117,C.grass);
  for(let j=0;j<14;j++)for(let i=0;i<28;i++){
    const x=i*18+(j%2)*6, y=158+j*9;
    pixel(g,x,y,8,2,(i+j)%3===0?C.grassLight:C.grassDark);
  }
  for(let i=0;i<18;i++){
    const x=228+((i*19)%55)-25,y=175+i*6;
    pixel(g,x,y,13,4,C.path);
  }
  pixel(g,49,68,373,104,C.brown);
  pixel(g,54,72,363,97,C.wall);
  pixel(g,54,78,363,4,C.cream);
  pixel(g,60,85,351,83,C.cream);
  pixel(g,61,100,350,3,C.roofLight);
  pixel(g,40,67,393,24,C.brown);
  pixel(g,44,65,385,24,C.roof);
  for(let i=0;i<11;i++){
    pixel(g,46+i*35,65,18,21,i%2?C.cream:C.roofLight);
    pixel(g,48+i*35,84,16,4,i%2?C.cream:C.roofLight);
  }
  pixel(g,183,24,114,42,C.brown);
  pixel(g,186,27,108,36,C.cream);
  pixel(g,193,33,94,26,C.forest);
  pixel(g,194,57,92,4,C.orange);
  for(let i=0;i<9;i++)pixel(g,192+i*11,28,5,3,C.leaf);
  pixel(g,105,95,63,60,0x8eae78);
  pixel(g,176,98,136,69,0xc2a36f);
  for(let i=0;i<4;i++)pixel(g,179+i*33,100,29,59,0xead4a4);
  pixel(g,111,119,51,26,C.brown);
  pixel(g,114,122,45,20,0x426f4e);
  pixel(g,427,119,46,34,C.brown); pixel(g,431,123,39,27,0x426f4e);
  pixel(g,192,130,99,44,C.brown);
  pixel(g,195,133,93,35,C.wood);
  pixel(g,195,151,93,15,C.woodLight);
  pixel(g,204,143,75,6,C.cream);
  fruitCase(g);
  for(let i=0;i<5;i++)pottedPlant(g,58+i*84,162);
  tilePath(g);
  paintCafeDetails(g);
  if (!withKenney) { tree(g,20,152,1.05); tree(g,462,147,1.05); }
  for(const t of TABLES)table(g,t.x,t.y);
  for(const s of SEATS)chair(g,s.x,s.y,s.id.endsWith("left"));
  pixel(g,285,187,14,12,C.brown);
  pixel(g,287,184,10,6,C.wood);
  terraceDetails(g);
  return g;
}
const shirts=[0x5b99a7,0xe6a25e,0x9d73aa,0x5eaa78,0xe17f79,0xc4bc72];
/** Single actor texture concept: all guests reuse the same pixel drawing routine and palette. */
export function drawGuest(g: Graphics, actor: Actor, tick: number, seated: boolean) {
  g.clear();
  const shirt = shirts[actor.shirt % shirts.length];
  const stride = seated ? 0 : actor.path.length > 1 ? [0,2,0,-2][Math.floor(tick*8)%4] : 0;
  const y = seated ? 5 : 0;
  pixel(g,-5,4,10,2,0x557e61); // foot shadow
  pixel(g,-6,-22+y,12,6,0x5c403b);
  pixel(g,-5,-19+y,10,7,0xf0c59a);
  if (actor.facing !== "up") {pixel(g,-3,-16+y,2,2,C.brown);pixel(g,2,-16+y,2,2,C.brown);}
  pixel(g,-6,-11+y,12,10,shirt);
  pixel(g,-8,-10+y,3,8,0xf0c59a); pixel(g,5,-10+y,3,8,0xf0c59a);
  if(seated){pixel(g,-5,-2+y,10,4,C.brown);return;}
  pixel(g,-5,-1+stride,4,5,0x4b555a); pixel(g,1,-1-stride,4,5,0x4b555a);
  if(actor.facing==="up")pixel(g,-4,-20+y,8,4,0x593a35);
  if(actor.facing==="left")pixel(g,-5,-17+y,2,3,0x593a35);
  if(actor.facing==="right")pixel(g,3,-17+y,2,3,0x593a35);
}
function staff(g: Graphics, wave: boolean, pet: boolean, step: number) {
  g.clear();
  const h=pet?14:27;
  pixel(g,-7,-h,14,5,0x583934);
  pixel(g,-6,-h+4,12,8,0xf3c7a0);
  pixel(g,-3,-h+8,2,2,C.brown);pixel(g,2,-h+8,2,2,C.brown);
  pixel(g,-7,-h+12,14,11,0x7ba97b);
  pixel(g,-3,-h+14,6,8,0x446d54);
  pixel(g,-9,-h+12,3,9,wave?0xf3c7a0:0x446d54);
  pixel(g,7,-h+(wave?4:12),3,9,0xf3c7a0);
  if(!pet){pixel(g,-6,-4,5,5,0x454d52);pixel(g,1,-4+(step%2),5,5,0x454d52);}
}
function dog(g: Graphics, tick: number) {
  g.clear();
  pixel(g,-9,-9,18,11,0xf4d49c);
  pixel(g,-11,-12,10,9,0xffe0ae);
  pixel(g,-11,-13,3,5,C.brown);pixel(g,-7,-10,2,2,C.brown);
  pixel(g,7,-12,5,4,C.cream);
  pixel(g,-7,1+(tick%2),4,5,C.wood);
  pixel(g,5,1+(1-tick%2),4,5,C.wood);
}
function cat(g: Graphics, gray: boolean, tick: number) {
  g.clear();
  const fur = gray ? 0x9296a2 : 0xeac475;
  pixel(g,-9,-7,18,8,fur);pixel(g,5,-10,8,7,fur);
  pixel(g,6,-13,4,4,fur);pixel(g,11,-13,3,4,fur);
  pixel(g,9,-7,2,2,C.brown);pixel(g,-11,-5,4,3,fur);
  if(tick%3===0)pixel(g,-13,-7,4,2,fur);
}
export function buildScene(kenney: KenneyAtlas | null = null) {
  const world = new Container(); world.sortableChildren = true;
  const backdrop=paintBackdrop(!!kenney); backdrop.zIndex=0; world.addChild(backdrop);
  if (kenney) placeKenneyDecorations(world, kenney);
  const sign=label("VƯỜN É",240,46,15); sign.zIndex=1; world.addChild(sign);
  const menu=label("NƯỚC ÉP",136,130,7);menu.zIndex=2;world.addChild(menu);
  const daily=label("HÔM NAY",450,135,6);daily.zIndex=2;world.addChild(daily);
  const fruit=label("TRÁI CÂY",360,94,7,"#624e32");fruit.zIndex=2;world.addChild(fruit);
  for (const tablePos of TABLES) {
    const front=new Graphics();
    pixel(front,tablePos.x-12,tablePos.y-8,24,4,C.woodLight);
    front.zIndex=tablePos.y+5;
    world.addChild(front);
  }
  const counterFront=new Graphics();pixel(counterFront,193,153,99,20,C.brown);pixel(counterFront,197,157,91,10,C.woodLight);counterFront.zIndex=173;world.addChild(counterFront);
  const employee=new Graphics();employee.x=241;employee.y=158;employee.zIndex=158;world.addChild(employee);
  const animals=[new Graphics(),new Graphics(),new Graphics()];
  animals[0].position.set(272,143);animals[0].zIndex=168;
  animals[1].position.set(43,209);animals[1].zIndex=211;
  animals[2].position.set(296,224);animals[2].zIndex=226;
  animals.forEach(a=>world.addChild(a));
  // Depth-sort all guests by feet within the world; no always-on-top actor layer.
  const actors=world;
  let prevStep=-1;
  function update(tick: number, reducedMotion: boolean) {
    const step = reducedMotion ? 0 : Math.floor(tick * 7);
    if(step===prevStep) return;
    prevStep=step;
    const cycle = reducedMotion ? 0 : tick % 24;
    const outside = cycle > 12 && cycle < 21;
    if (cycle < 12) {employee.x=241;employee.y=158;employee.zIndex=158;}
    else if(cycle<15) {employee.x=241-(cycle-12)*18;employee.y=158+(cycle-12)*10;employee.zIndex=191;}
    else if(cycle<18) {employee.x=187+(cycle-15)*34;employee.y=188+(cycle-15)*5;employee.zIndex=211;}
    else if(cycle<21) {employee.x=289-(cycle-18)*15;employee.y=203-(cycle-18)*16;employee.zIndex=201;}
    else {employee.x=241;employee.y=158;employee.zIndex=158;}
    staff(employee, !outside && step%7<3, cycle>=16 && cycle<18,step);
    animals[2].x=296+(reducedMotion?0:Math.sin(tick/2)*10);
    dog(animals[2],step);
    cat(animals[0],true,step);
    cat(animals[1],false,step);
  }
  update(0,false);
  return { world, actors, update };
}
