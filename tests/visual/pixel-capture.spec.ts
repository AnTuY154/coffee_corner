import { test, expect } from "@playwright/test";
import fs from "node:fs/promises";

test.describe("Pixel Shop real browser evidence", () => {

  test("customer can chat about real products and open the correct menu",async({page},testInfo)=>{
    const errors:string[]=[];
    page.on("pageerror",e=>errors.push(e.message));
    await page.goto("/pixel",{waitUntil:"domcontentloaded"});
    await expect(page.locator(".pg-stage")).toHaveAttribute("data-art-mode","reference",{timeout:30000});
    const chat=page.getByTestId("customer-chat");
    const launcher=chat.getByRole("button",{name:"Mở chat Vườn É"});
    await expect(launcher).toBeVisible();
    await launcher.click();
    const panel=chat.getByRole("dialog",{name:"Chat với Vườn É"});
    await expect(panel).toBeVisible();
    await expect(chat.locator(".pg-chat-disclaimer")).toContainText("không kết nối nhân viên thật");
    await chat.getByRole("button",{name:"Món mới có gì?"}).click();
    await expect(chat.locator(".pg-chat-message.is-guest")).toContainText(["Món mới có gì?"]);
    const reply=chat.locator(".pg-chat-message.is-bot").last();
    await expect(reply).toContainText(/món|Món|Gợi ý/);
    await chat.getByRole("button",{name:"Mở thực đơn"}).last().click();
    await expect(page.getByRole("heading",{name:"Thực đơn Vườn É"})).toBeVisible();
    await expect(chat.getByRole("dialog")).toHaveCount(0);
    await page.getByRole("button",{name:"Đóng thực đơn, quay lại cửa hàng"}).click();
    await chat.getByRole("button",{name:"Mở chat Vườn É"}).click();
    await chat.getByRole("textbox",{name:"Nhập câu hỏi cho Vườn É"}).fill("Bưởi Vàng");
    await chat.getByRole("button",{name:"Gửi tin nhắn"}).click();
    await expect(chat.locator(".pg-chat-message.is-bot").last()).toContainText("45.000");
    const mobile=testInfo.project.name.startsWith("mobile");
    await fs.mkdir("qa-captures",{recursive:true});
    await page.screenshot({
      path:"qa-captures/pixel-"+(mobile?"mobile":"desktop")+"-customer-chat.png",
      fullPage:false,animations:"disabled"
    });
    expect(errors).toEqual([]);
  });

  test("customer chat gives honest delivery and opening-hours answers",async({page})=>{
    await page.goto("/pixel",{waitUntil:"domcontentloaded"});
    await expect(page.locator(".pg-stage")).toHaveAttribute("data-art-mode","reference",{timeout:30000});
    const chat=page.getByTestId("customer-chat");
    await chat.getByRole("button",{name:"Mở chat Vườn É"}).click();
    const input=chat.getByRole("textbox",{name:"Nhập câu hỏi cho Vườn É"});
    await input.fill("Mở cửa mấy giờ?");
    await input.press("Enter");
    await expect(chat.locator(".pg-chat-message.is-bot").last()).toContainText("chưa có thông tin giờ mở cửa");
    await input.fill("Phí ship bao nhiêu?");
    await input.press("Enter");
    await expect(chat.locator(".pg-chat-message.is-bot").last()).toContainText("chưa thể báo trước");
    await chat.getByRole("button",{name:"Đóng khung chat"}).click();
    await expect(chat.getByRole("dialog")).toHaveCount(0);
    await expect(page.locator(".pg-stage canvas")).toBeVisible();
  });



  test("barista says hello and recommends a real seasonal menu item",async({page},testInfo)=>{
    const mobile=testInfo.project.name.startsWith("mobile");
    const errors:string[]=[];
    page.on("pageerror",e=>errors.push(e.message));
    await page.goto("/pixel",{waitUntil:"domcontentloaded"});
    await expect(page.locator(".pg-stage")).toHaveAttribute("data-art-mode","reference",{timeout:30000});
    const bubble=page.getByTestId("staff-dialogue");
    await expect(bubble).toBeVisible();
    await expect(bubble).toHaveAttribute("data-line-id","welcome");
    await expect(bubble.getByTestId("staff-line")).toContainText("Vườn É xin chào");
    await fs.mkdir("qa-captures",{recursive:true});
    await bubble.screenshot({
      path:"qa-captures/pixel-"+(mobile?"mobile":"desktop")+"-staff-bubble.png",
      animations:"disabled"
    });
    // Compressed viewport capture for lightweight human review of bubble placement.
    await page.screenshot({
      path:"qa-captures/pixel-"+(mobile?"mobile":"desktop")+"-dialogue-view.jpg",
      type:"jpeg",quality:72,fullPage:false
    });
    await bubble.getByRole("button",{name:"Lời giới thiệu tiếp theo"}).click();
    await expect(bubble).toHaveAttribute("data-line-id","invite");
    await bubble.getByRole("button",{name:"Lời giới thiệu tiếp theo"}).click();
    await expect(bubble).toHaveAttribute("data-line-id","seasonal");
    const productId=await bubble.getAttribute("data-promoted-id");
    expect(productId,"product recommendation must come from the actual catalogue").toBeTruthy();
    const line=await bubble.getByTestId("staff-line").innerText();
    const name=line.includes("Gợi ý mới")
      ?line.split(": ")[1]?.split(", vị")[0]
      :line.split("món mới ")[1]?.split(":")[0];
    expect(name).toBeTruthy();
    await bubble.getByRole("button",{name:"Mở thực đơn"}).click();
    await expect(page.getByRole("heading",{name:"Thực đơn Vườn É"})).toBeVisible();
    await expect(page.getByRole("heading",{name:name!,exact:true})).toBeVisible();
    await fs.mkdir("qa-captures",{recursive:true});
    await page.screenshot({path:"qa-captures/pixel-"+(mobile?"mobile":"desktop")+"-staff-product.png",fullPage:true,animations:"disabled"});
    expect(errors).toEqual([]);
  });

  test("barista can promote the existing fresh-fruit category",async({page})=>{
    await page.goto("/pixel",{waitUntil:"domcontentloaded"});
    await expect(page.locator(".pg-stage")).toHaveAttribute("data-art-mode","reference",{timeout:30000});
    const bubble=page.getByTestId("staff-dialogue");
    await expect(bubble).toBeVisible();
    for(let i=0;i<8;i++){
      if(await bubble.getAttribute("data-line-id")==="fruit")break;
      await bubble.getByRole("button",{name:"Lời giới thiệu tiếp theo"}).click();
    }
    await expect(bubble).toHaveAttribute("data-line-id","fruit");
    await bubble.getByRole("button",{name:"Mở trái cây tươi"}).click();
    await expect(page.getByRole("heading",{name:"Trái cây tươi theo gói"})).toBeVisible();
  });

  test("Vietnamese voice is silent until the user opts in",async({page})=>{
    await page.addInitScript(()=>{
      const w=window as typeof window&{__spokenStaff:string[]};
      w.__spokenStaff=[];
      try{
        Object.defineProperty(window.speechSynthesis,"speak",{
          configurable:true,
          value:(utterance:SpeechSynthesisUtterance)=>w.__spokenStaff.push(utterance.text)
        });
      }catch{/* A browser without a voice engine can still display the bubble. */}
    });
    await page.goto("/pixel",{waitUntil:"domcontentloaded"});
    await expect(page.locator(".pg-stage")).toHaveAttribute("data-art-mode","reference",{timeout:30000});
    const bubble=page.getByTestId("staff-dialogue");
    await expect(bubble).toBeVisible();
    const getSpeech=()=>page.evaluate(()=>(
      window as typeof window&{__spokenStaff:string[]}
    ).__spokenStaff);
    expect(await getSpeech()).toEqual([]);
    const canSpeak=await page.evaluate(()=>"speechSynthesis" in window);
    const enable=bubble.getByRole("button",{name:"Bật giọng nói nhân viên"});
    if(!canSpeak){await expect(enable).toHaveCount(0);return;}
    await expect(enable).toBeVisible();
    await enable.click();
    await expect(bubble.getByRole("button",{name:"Tắt giọng nói nhân viên"})).toHaveAttribute("aria-pressed","true");
    await expect.poll(async()=>(await getSpeech()).length).toBeGreaterThan(0);
    await bubble.getByRole("button",{name:"Lời giới thiệu tiếp theo"}).click();
    await expect.poll(async()=>(await getSpeech()).length).toBeGreaterThan(1);
    await bubble.getByRole("button",{name:"Tắt giọng nói nhân viên"}).click();
    await expect(enable).toHaveAttribute("aria-pressed","false");
  });

  test("existing home page stays independent from the new /pixel scene", async ({page}, testInfo) => {
    test.skip(testInfo.project.name.startsWith("mobile"), "Desktop regression smoke");
    await page.goto("/", {waitUntil: "domcontentloaded"});
    await expect(page.locator(".pg-root")).toHaveCount(0);
    await expect(page.locator(".pg-stage")).toHaveCount(0);
  });

  test("seated guest remains visible and can stand up on desktop/mobile", async ({page},testInfo) => {
    const mobile=testInfo.project.name.startsWith("mobile");
    await page.goto("/pixel", {waitUntil:"domcontentloaded"});
    await expect(page.locator(".pg-stage")).toHaveAttribute("data-art-mode","reference",{timeout:30000});
    await expect(page.locator(".pg-stage canvas")).toBeVisible();
    // Mobile camera follows the guest by default; use the full-scene camera for stable hit targets.
    if(mobile)await page.getByRole("button",{name:"Toàn sân"}).click();
    const box=await page.locator(".pg-stage").boundingBox();
    expect(box).not.toBeNull();
    const scale=Math.min(box!.width/480,box!.height/320);
    const x=box!.x+(box!.width-480*scale)/2+235*scale;
    const y=box!.y+(box!.height-320*scale)/2+264*scale;
    await page.mouse.click(x,y); // table-3-bottom; one of 15 existing seats
    const stand=page.getByRole("button",{name:/Đứng dậy/});
    await expect(stand).toBeVisible({timeout:15000});
    if(mobile){
      const a=await stand.boundingBox();
      const b=await page.getByTestId("customer-chat").getByRole("button",{name:"Mở chat Vườn É"}).boundingBox();
      expect(a&&b,"stand-up and chat launch controls must be present").toBeTruthy();
      expect(a!.x+a!.width+4,"chat launcher must not obstruct standing up").toBeLessThan(b!.x);
    }
    await page.waitForTimeout(400);
    await fs.mkdir("qa-captures",{recursive:true});
    await page.screenshot({path:`qa-captures/pixel-${mobile?"mobile":"desktop"}-seated.png`,fullPage:true,animations:"disabled"});
    await stand.click();
    await expect(stand).toHaveCount(0);
    await expect(page.locator(".pg-stage canvas")).toBeVisible();
  });
  test("barista stays visually stationary behind the counter",async ({page},testInfo)=>{
    test.skip(testInfo.project.name.startsWith("mobile"),"Desktop pixel-stability sample");
    await page.goto("/pixel",{waitUntil:"domcontentloaded"});
    await expect(page.locator(".pg-stage")).toHaveAttribute("data-art-mode","reference",{timeout:30000});
    const box=await page.locator(".pg-stage").boundingBox();
    expect(box).not.toBeNull();
    const scale=Math.min(box!.width/480,box!.height/320);
    const clip={x:Math.round(box!.x+(box!.width-480*scale)/2+236*scale),
      y:Math.round(box!.y+(box!.height-320*scale)/2+144*scale),
      width:Math.round(28*scale),height:Math.round(51*scale)};
    await page.waitForTimeout(350);
    const before=await page.screenshot({clip});
    await page.waitForTimeout(1300);
    const after=await page.screenshot({clip});
    expect(before.equals(after),"barista must not wave or leave the counter").toBe(true);
  });
  test("capture actual WebGL canvas and commerce on desktop/mobile", async ({ page }, testInfo) => {
    const mobile=testInfo.project.name.startsWith("mobile");
    const prefix=mobile?"mobile":"desktop";
    const errors:string[]=[];
    page.on("pageerror",error=>errors.push(error.message));
    await page.goto("/pixel",{waitUntil:"domcontentloaded"});
    await expect(page.getByRole("heading",{name:/Vườn É/})).toBeVisible();
    await expect(page.locator(".pg-stage canvas")).toBeVisible({timeout:30000});
    await expect(page.locator(".pg-fallback")).toHaveCount(0);
    // Must use the uploaded Fresh Juice artwork, never silently fall back to Kenney.
    await expect(page.locator(".pg-stage")).toHaveAttribute("data-art-mode", "reference", {timeout: 30000});
    await page.waitForTimeout(2200);
    await fs.mkdir("qa-captures",{recursive:true});
    await page.screenshot({path:`qa-captures/pixel-${prefix}-garden.png`,fullPage:true,animations:"disabled"});
    if(mobile) {
      await expect(page.getByRole("button",{name:"Đi lên"})).toBeVisible();
      await page.getByRole("button",{name:"🍊 Trái cây"}).last().click();
      await expect(page.getByRole("heading",{name:"Trái cây tươi theo gói"})).toBeVisible();
    } else {
      await page.getByRole("button",{name:"Thực đơn",exact:true}).click();
      await expect(page.getByRole("heading",{name:"Thực đơn Vườn É"})).toBeVisible();
    }
    await page.screenshot({path:`qa-captures/pixel-${prefix}-menu.png`,fullPage:true,animations:"disabled"});
    expect(errors,"No uncaught browser page exceptions").toEqual([]);
  });
});
