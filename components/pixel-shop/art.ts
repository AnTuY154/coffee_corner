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
  if (!withKenney) { tree(g,31,131,1.1); tree(g,452,123,1); }
  for(const t of TABLES)table(g,t.x,t.y);
  for(const s of SEATS)chair(g,s.x,s.y,s.id.endsWith("left"));
  pixel(g,285,187,14,12,C.brown);
  pixel(g,287,184,10,6,C.wood);
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
