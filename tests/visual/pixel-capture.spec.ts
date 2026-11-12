import { test, expect } from "@playwright/test";
import fs from "node:fs/promises";

test.describe("Pixel Shop real browser evidence", () => {
  test("capture actual WebGL canvas and commerce on desktop/mobile", async ({ page }, testInfo) => {
    const mobile=testInfo.project.name.startsWith("mobile");
    const prefix=mobile?"mobile":"desktop";
    const errors:string[]=[];
    page.on("pageerror",error=>errors.push(error.message));
    await page.goto("/pixel",{waitUntil:"domcontentloaded"});
    await expect(page.getByRole("heading",{name:/Vườn É/})).toBeVisible();
    await expect(page.locator(".pg-stage canvas")).toBeVisible({timeout:30000});
    await expect(page.locator(".pg-fallback")).toHaveCount(0);
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
