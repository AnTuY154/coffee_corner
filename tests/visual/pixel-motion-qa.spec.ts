import {test,expect,type Page} from "@playwright/test";
import {mkdir,writeFile} from "node:fs/promises";

/**
 * REAL Chromium E2E audit of /pixel (not an animation mock).
 * Build the app with NEXT_PUBLIC_PIXEL_MOTION_QA=1; the QA hooks are compiled
 * out of ordinary production builds. Test all 15 positions, then actual motion.
 */
const seats=[
  "table-1-left","table-1-right","table-1-bottom",
  "table-2-left","table-2-right","table-2-bottom",
  "table-3-left","table-3-right","table-3-bottom",
  "table-4-left","table-4-right","table-4-bottom",
  "table-5-left","table-5-right","table-5-bottom"
];
const tables=[{x:58,y:233},{x:135,y:274},{x:235,y:246},{x:336,y:274},{x:419,y:233}];
const seatPos=(id:string)=>{
  const match=/^table-(\d)-(left|right|bottom)$/.exec(id);
  if(!match)throw new Error("Bad seat ID "+id);
  const t=tables[Number(match[1])-1];
  return match[2]==="left"?{x:t.x-20,y:t.y+3}
    :match[2]==="right"?{x:t.x+20,y:t.y+3}:{x:t.x,y:t.y+18};
};
type QASnapshot=NonNullable<ReturnType<NonNullable<Window["__VUONE_PIXEL_QA__"]>["snapshot"]>>;
async function snapshot(page:Page):Promise<QASnapshot>{
  const s=await page.evaluate(()=>window.__VUONE_PIXEL_QA__?.snapshot());
  expect(s,"QA-only telemetry must exist in browser").toBeTruthy();
  return s!;
}
async function launch(page:Page,mobile:boolean){
  const failures:string[]=[];
  page.on("pageerror",e=>failures.push(e.message));
  await page.goto("/pixel",{waitUntil:"domcontentloaded"});
  await expect(page.locator(".pg-stage")).toHaveAttribute("data-art-mode","reference",{timeout:30000});
  await expect.poll(async()=>Boolean((await page.evaluate(()=>window.__VUONE_PIXEL_QA__?.snapshot()))?.self)).toBe(true);
  if(mobile)await page.getByRole("button",{name:"Toàn sân"}).click();
  return failures;
}
async function screenshotClip(page:Page,x:number,y:number){
  const bounds=await page.locator(".pg-stage").boundingBox();
  expect(bounds).not.toBeNull();
  const {width,height}=bounds!;
  const scale=Math.min(width/480,height/320);
  const left=bounds!.x+(width-480*scale)/2+(x-13)*scale;
  const top=bounds!.y+(height-320*scale)/2+(y-28)*scale;
  return page.screenshot({clip:{x:left,y:top,width:26*scale,height:35*scale}});
}
async function pixelDifference(page:Page,visible:Buffer,hidden:Buffer){
  return page.evaluate(async({a,b})=>{
    async function rgba(data:string){
      const bytes=Uint8Array.from(atob(data),c=>c.charCodeAt(0));
      const bitmap=await createImageBitmap(new Blob([bytes],{type:"image/png"}));
      const canvas=document.createElement("canvas");
      canvas.width=bitmap.width;canvas.height=bitmap.height;
      const ctx=canvas.getContext("2d",{willReadFrequently:true});
      if(!ctx)throw new Error("2D screenshot decoder unavailable");
      ctx.drawImage(bitmap,0,0);
      return ctx.getImageData(0,0,bitmap.width,bitmap.height);
    }
    const aa=await rgba(a),bb=await rgba(b);
    if(aa.width!==bb.width||aa.height!==bb.height)throw new Error("Screenshot clips do not match");
    let changed=0;
    for(let k=0;k<aa.data.length;k+=4){
      const dr=Math.abs(aa.data[k]-bb.data[k]);
      const dg=Math.abs(aa.data[k+1]-bb.data[k+1]);
      const db=Math.abs(aa.data[k+2]-bb.data[k+2]);
      if(dr+dg+db>55)changed++;
    }
    return changed;
  },{a:visible.toString("base64"),b:hidden.toString("base64")});
}
async function telemetryFor(page:Page,durationMs:number){
  const samples:QASnapshot[]=[];
  for(let t=0;t<durationMs;t+=95){
    samples.push(await snapshot(page));
    await page.waitForTimeout(95);
  }
  return samples;
}
function verifySmooth(samples:QASnapshot[],label:string){
  let movingSamples=0;
  for(let i=1;i<samples.length;i++){
    const a=samples[i-1],b=samples[i];
    expect(b.self, label+" actor missing").not.toBeNull();
    expect(b.self?.visible,label+" actor invisible").toBe(true);
    expect(b.self?.renderable,label+" not renderable").toBe(true);
    expect(b.self?.alpha,label+" transparent").toBe(1);
    const expectedScale=0.83+0.23*Math.max(0,Math.min(1,((b.self?.y??216)-216)/92));
    expect(Math.abs((b.self?.scale??0)-expectedScale),label+" perspective does not match world Y").toBeLessThan(.03);
    const deltaMs=Math.max(0,b.time-a.time);
    const distance=Math.hypot((b.self?.x??0)-(a.self?.x??0),(b.self?.y??0)-(a.self?.y??0));
    // 32 world pixels/second plus rounding and CI scheduling tolerance.
    expect(distance,label+" teleported between frames").toBeLessThanOrEqual(32*deltaMs/1000+5);
    if(b.self?.moving)movingSamples++;
  }
  expect(movingSamples,label+" never began moving").toBeGreaterThan(4);
}
test.describe("Pixel 2.5D movement QA agent — real browser",()=>{
  test("up/down paths remain smooth and all decorative pets move",async({page},testInfo)=>{
    test.setTimeout(90_000);
    const errors=await launch(page,testInfo.project.name.startsWith("mobile"));
    await page.evaluate(()=>window.__VUONE_PIXEL_QA__?.goTo(300,300));
    await expect.poll(async()=> (await snapshot(page)).self?.x??0,{timeout:7000}).toBeGreaterThan(294);
    await page.evaluate(()=>window.__VUONE_PIXEL_QA__?.goTo(300,230));
    const up=await telemetryFor(page,2400);
    verifySmooth(up,"upward");
    expect((up[0].self?.y??0)-(up.at(-1)?.self?.y??0),"up must decrease world Y").toBeGreaterThan(30);
    await page.evaluate(()=>window.__VUONE_PIXEL_QA__?.goTo(300,300));
    const down=await telemetryFor(page,2400);
    verifySmooth(down,"downward");
    expect((down.at(-1)?.self?.y??0)-(down[0].self?.y??0),"down must increase world Y").toBeGreaterThan(30);
    for(const pet of up[0].pets){
      const last=down.at(-1)?.pets.find(p=>p.name===pet.name);
      expect(last,"pet disappeared: "+pet.name).toBeTruthy();
      expect(Math.hypot(last!.x-pet.x,last!.y-pet.y),"pet frozen: "+pet.name).toBeGreaterThan(2);
      expect(last!.visible).toBe(true);
    }
    const frames=down.at(-1)?.framesMs??[];
    expect(frames.length,"not enough real Pixi animation frames").toBeGreaterThan(40);
    const sorted=[...frames].sort((a,b)=>a-b);
    const p50=sorted[Math.floor(sorted.length*.5)],p95=sorted[Math.floor(sorted.length*.95)];
    expect(p50,"median frame budget should be at least ~24 FPS on CI").toBeLessThanOrEqual(42);
    expect(p95,"95th percentile frame budget should avoid freezes").toBeLessThanOrEqual(130);
    const mobile=testInfo.project.name.startsWith("mobile");
    await mkdir("qa-captures",{recursive:true});
    await writeFile("qa-captures/motion-metrics-"+(mobile?"mobile":"desktop")+".json",
      JSON.stringify({project:testInfo.project.name,iteration:testInfo.repeatEachIndex,up:up.map(s=>({t:s.time,x:s.self?.x,y:s.self?.y,visible:s.self?.visible})),
        down:down.map(s=>({t:s.time,x:s.self?.x,y:s.self?.y,visible:s.self?.visible})),frame:{p50,p95,max:Math.max(...frames)},pets:down.at(-1)?.pets},null,2));
    expect(errors,"JavaScript errors must be zero").toEqual([]);
  });
  test("walking behind all five tables keeps visible head pixels",async({page},testInfo)=>{
    test.setTimeout(90000);
    const errors=await launch(page,testInfo.project.name.startsWith("mobile"));
    await page.evaluate(()=>window.__VUONE_PIXEL_QA__?.freezeDecorations(true));
    const hardLocations=[
      {name:"umbrella-left",x:58,y:220},
      {name:"umbrella-center",x:235,y:225},
      {name:"umbrella-right",x:419,y:220},
      {name:"front-left",x:135,y:256},
      {name:"front-right",x:336,y:256}
    ];
    const checks:{place:string;pixelDifference:number}[]=[];
    for(const pt of hardLocations){
      await page.evaluate(({x,y})=>window.__VUONE_PIXEL_QA__?.seedAt(x,y),pt);
      await expect.poll(async()=>{
        const a=await snapshot(page);
        return [a.self?.x,a.self?.y];
      }).toEqual([pt.x,pt.y]);
      await page.waitForTimeout(50);
      const actual=await snapshot(page);
      expect(actual.self?.visible).toBe(true);
      expect(actual.self?.renderable).toBe(true);
      const shown=await screenshotClip(page,pt.x,pt.y);
      await page.evaluate(()=>window.__VUONE_PIXEL_QA__?.setGuestVisible(false));
      await page.waitForTimeout(60);
      const hidden=await screenshotClip(page,pt.x,pt.y);
      await page.evaluate(()=>window.__VUONE_PIXEL_QA__?.setGuestVisible(true));
      const count=await pixelDifference(page,shown,hidden);
      checks.push({place:pt.name,pixelDifference:count});
      expect(count,pt.name+" walking avatar is completely covered").toBeGreaterThan(15);
    }
    await mkdir("qa-captures",{recursive:true});
    const mobile=testInfo.project.name.startsWith("mobile");
    await writeFile("qa-captures/walk-occlusion-"+(mobile?"mobile":"desktop")+".json",
      JSON.stringify(checks,null,2));
    expect(errors).toEqual([]);
  });
  test("all 15 seats render a real non-occluded avatar and staff stays fixed",async({page},testInfo)=>{
    test.setTimeout(120_000);
    const errors=await launch(page,testInfo.project.name.startsWith("mobile"));
    await page.evaluate(()=>window.__VUONE_PIXEL_QA__?.freezeDecorations(true));
    const initial=await snapshot(page);
    expect(initial.staff).not.toBeNull();
    expect(initial.pets).toHaveLength(3);
    const evidence:{seat:string;changedPixels:number}[]=[];
    for(const seatId of seats){
      const position=seatPos(seatId);
      await page.evaluate(id=>window.__VUONE_PIXEL_QA__?.seedSeat(id),seatId);
      await expect.poll(async()=> (await snapshot(page)).self?.seatId).toBe(seatId);
      await page.waitForTimeout(60);
      const active=await snapshot(page);
      expect(active.self?.visible).toBe(true);
      expect(active.self?.renderable).toBe(true);
      expect(active.self?.zIndex??0,seatId+" should render above PNG furniture").toBeGreaterThan(295);
      const shown=await screenshotClip(page,position.x,position.y);
      await page.evaluate(()=>window.__VUONE_PIXEL_QA__?.setGuestVisible(false));
      await page.waitForTimeout(50);
      const hidden=await screenshotClip(page,position.x,position.y);
      await page.evaluate(()=>window.__VUONE_PIXEL_QA__?.setGuestVisible(true));
      const changedPixels=await pixelDifference(page,shown,hidden);
      evidence.push({seat:seatId,changedPixels});
      expect(changedPixels,seatId+" actor is covered by furniture or out of frame").toBeGreaterThan(15);
      const staff= (await snapshot(page)).staff;
      expect(staff,"cashier disappeared").toEqual(initial.staff);
    }
    await mkdir("qa-captures",{recursive:true});
    const mobile=testInfo.project.name.startsWith("mobile");
    await writeFile("qa-captures/seat-visibility-"+(mobile?"mobile":"desktop")+".json",JSON.stringify(evidence,null,2));
    await page.screenshot({path:"qa-captures/seat-qa-"+(mobile?"mobile":"desktop")+".png",fullPage:true});
    expect(errors).toEqual([]);
  });
});
