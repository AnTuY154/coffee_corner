import { test, expect } from "@playwright/test";
import fs from "node:fs/promises";

test.describe("Pixel Shop real browser evidence", () => {
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
