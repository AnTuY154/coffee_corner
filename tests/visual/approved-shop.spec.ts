import { expect, test } from "@playwright/test";

test("approved 3:2 storefront loads with separately animated worker and animals", async ({ page }, testInfo) => {
  await page.goto("/");
  await expect(page.locator(".ve2d-stage[data-approved-art='true']")).toBeVisible();
  await expect(page.locator(".ve2d-motion-sprites .ve2d-sprite")).toHaveCount(4);
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

test("desktop scene fills every viewport without stretching the watercolour or hotspots", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name.startsWith("mobile"), "desktop cover requirements");
  await page.goto("/");
  await expect(page.locator(".ve2d-stage[data-approved-art='true']")).toBeVisible();
  for (const [width, height] of [[1920,1080], [1440,900], [2560,1080], [1366,768], [1024,768], [1536,1024]]) {
    await page.setViewportSize({ width, height });
    const stage = await page.locator(".ve2d-stage").boundingBox();
    if (!stage) throw new Error("Approved stage missing");
    expect(stage.x).toBeLessThanOrEqual(1);
    expect(stage.y).toBeLessThanOrEqual(1);
    expect(stage.x + stage.width).toBeGreaterThanOrEqual(width - 1);
    expect(stage.y + stage.height).toBeGreaterThanOrEqual(height - 1);
    expect(Math.abs(stage.width / stage.height - 1.5)).toBeLessThan(.002);
    await expect(page.locator(".ve2d-hotspot[data-target='clerk']")).toBeVisible();
    if (width === 1920 || width === 2560 || width === 1440) {
      await page.screenshot({ path: testInfo.outputPath(`desktop-cover-${width}x${height}.png`), animations: "disabled" });
    }
  }
});

test("waving hand and walking pets animate independently, with cat audio opt-in", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(".ve2d-motion-sprites .ve2d-sprite")).toHaveCount(4);
  for (const selector of [".ve2d-clerk-arm", ".ve2d-actor-dog", ".ve2d-actor-cat"]) {
    const animation = await page.locator(selector).evaluate(el => getComputedStyle(el).animationName);
    expect(animation).not.toBe("none");
  }
  const sound = page.getByRole("button", { name: "Bật tiếng mèo" });
  await expect(sound).toHaveAttribute("aria-pressed", "false");
  await sound.click();
  await expect(page.getByRole("button", { name: "Tắt tiếng mèo" })).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: "Tắt tiếng mèo" }).click();
  await expect(page.getByRole("button", { name: "Bật tiếng mèo" })).toHaveAttribute("aria-pressed", "false");
});
