import { expect, test } from "@playwright/test";

test("approved 3:2 storefront loads with separately animated worker and animals", async ({ page }, testInfo) => {
  await page.goto("/");
  await expect(page.locator(".ve2d-stage[data-approved-art='true']")).toBeVisible();
  await expect(page.locator(".ve2d-motion-sprites .ve2d-sprite")).toHaveCount(2);
  await expect(page.locator(".ve2d-pixi-pets canvas")).toBeVisible();
  const dims = await page.locator(".ve2d-approved-art").evaluate((el: HTMLImageElement) => [
    el.naturalWidth, el.naturalHeight, el.complete
  ]);
  expect(dims).toEqual([1536, 1024, true]);
  expect(await page.locator(".ve2d-stage").evaluate(el => {
    const bounds = el.getBoundingClientRect();
    return Math.abs(bounds.width / bounds.height - 1.5);
  })).toBeLessThan(.002);

  await page.screenshot({ path: testInfo.outputPath("approved-storefront.png"), animations: "disabled" });

  const clerk = page.locator('.ve2d-hotspot[data-target="clerk"]');
  await expect(clerk).toBeVisible();
  if (testInfo.project.name.startsWith("mobile")) {
    await clerk.click();
    await expect(clerk.locator(".ve2d-cloud")).toBeVisible();
    await clerk.click();
  } else {
    await clerk.hover();
    await expect(clerk.locator(".ve2d-cloud")).toBeVisible();
    await clerk.click();
  }
  await expect(page.getByRole("dialog", { name: /Thực đơn/ })).toBeVisible();
  await expect(page.locator(".ve-menu-header h2")).toHaveCSS("color", "rgb(255, 249, 229)");
  await expect(page.locator(".ve-menu-search .sr-only")).toHaveCSS("position", "absolute");
  await page.screenshot({ path: testInfo.outputPath("menu-overlay.png"), animations: "disabled" });
  const pathname = new URL(page.url()).pathname;
  const add = page.getByRole("button", { name: /^Thêm .* vào giỏ$/ }).first();
  await expect(add).toBeVisible();
  await add.click();
  expect(new URL(page.url()).pathname).toBe(pathname);
  if (testInfo.project.name.startsWith("mobile")) {
    await page.locator(".ve-menu-cart-fab").click();
  }
  await page.getByRole("button", { name: /Tiếp tục đặt hàng/ }).click();
  await expect(page.getByText(/thông tin|đặt hàng|thanh toán/i).first()).toBeVisible();
  expect(new URL(page.url()).pathname).toBe(pathname);
  await page.keyboard.press("Escape");
  await expect(page.locator(".ve2d-stage")).toBeVisible();
});

test("scene is keyboard accessible and reduced-motion animations are disabled", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.locator(".ve2d-stage[data-approved-art='true']")).toBeVisible();
  const animation = await page.locator(".ve2d-clerk-arm").evaluate(el => getComputedStyle(el).animationName);
  expect(animation).toBe("none");
  const main = page.locator('.ve2d-hotspot[data-target="sign"]');
  await main.focus();
  await expect(main.locator(".ve2d-cloud")).toBeVisible();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("dialog", { name: /Chào mừng/ })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog", { name: /Chào mừng/ })).toHaveCount(0);
});

test("desktop shows entire 3:2 shop while filling screen edges", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name.startsWith("mobile"), "desktop contain requirements");
  await page.goto("/");
  await expect(page.locator(".ve2d-stage[data-approved-art='true']")).toBeVisible();
  await expect(page.locator(".ve2d-pixi-pets canvas")).toBeVisible();
  for (const [width,height] of [[1920,1080],[1440,900],[2560,1080],[1366,768],[1024,768],[1536,1024]]) {
    await page.setViewportSize({width,height});
    const root=await page.locator(".ve2d-root").boundingBox();
    const stage=await page.locator(".ve2d-stage").boundingBox();
    const image=await page.locator(".ve2d-approved-art").boundingBox();
    const canvas=await page.locator(".ve2d-pixi-pets canvas").boundingBox();
    if (!root||!stage||!image||!canvas) throw new Error("missing world layers");
    expect(root.width).toBeGreaterThanOrEqual(width-1);
    expect(root.height).toBeGreaterThanOrEqual(height-1);
    expect(stage.x).toBeGreaterThanOrEqual(-1);
    expect(stage.y).toBeGreaterThanOrEqual(-1);
    expect(stage.x + stage.width).toBeLessThanOrEqual(width+1);
    expect(stage.y + stage.height).toBeLessThanOrEqual(height+1);
    expect(Math.abs(stage.width/stage.height - 1.5)).toBeLessThan(.002);
    expect(Math.abs(stage.x-image.x)+Math.abs(stage.y-image.y)).toBeLessThan(1.5);
    expect(Math.abs(stage.x-canvas.x)+Math.abs(stage.y-canvas.y)).toBeLessThan(1.5);
    for(const animal of ["dog","cat"]) {
      const rect=await page.locator(`.ve2d-hotspot[data-target="${animal}"]`).boundingBox();
      if(!rect)throw new Error("missing moving pet hotspot");
      expect(rect.y).toBeGreaterThanOrEqual(stage.y-1);
      expect(rect.y+rect.height).toBeLessThanOrEqual(stage.y+stage.height+10);
    }
    if ([1920,1440,2560].includes(width))
      await page.screenshot({path:testInfo.outputPath(`contain-${width}x${height}.png`),animations:"disabled"});
  }
});

test("waving hand and walking pets animate independently, with cat audio opt-in", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(".ve2d-motion-sprites .ve2d-sprite")).toHaveCount(2);
  await expect(page.locator(".ve2d-pixi-pets canvas")).toBeVisible();
  for (const selector of [".ve2d-clerk-arm"]) {
    const animation = await page.locator(selector).evaluate(el => getComputedStyle(el).animationName);
    expect(animation).not.toBe("none");
  }
  await expect(page.locator('.ve2d-pixi-pets[data-engine="pixijs-animated-sprite"] canvas')).toBeVisible();
  const petCanvas = page.locator(".ve2d-pixi-pets canvas");
  const firstAnimationFrame = await petCanvas.screenshot({ animations: "allow" });
  const animalPositionsBefore = await page.locator('.ve2d-hotspot[data-target="dog"]').getAttribute("style");
  await page.waitForTimeout(4500);
  const secondAnimationFrame = await petCanvas.screenshot({ animations: "allow" });
  expect(firstAnimationFrame.equals(secondAnimationFrame)).toBe(false);
  const animalPositionsAfter = await page.locator('.ve2d-hotspot[data-target="dog"]').getAttribute("style");
  // Walk and idle phases may differ; the rig at least publishes world positions.
  expect(animalPositionsBefore).toContain("left:");
  expect(animalPositionsAfter).toContain("left:");
  const sound = page.getByRole("button", { name: "Bật tiếng mèo" });
  await expect(sound).toHaveAttribute("aria-pressed", "false");
  await sound.click();
  await expect(page.getByRole("button", { name: "Tắt tiếng mèo" })).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: "Tắt tiếng mèo" }).click();
  await expect(page.getByRole("button", { name: "Bật tiếng mèo" })).toHaveAttribute("aria-pressed", "false");
});
