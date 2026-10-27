import { expect, test } from "@playwright/test";

test("approved 3:2 storefront loads with separately animated worker and animals", async ({ page }, testInfo) => {
  await page.goto("/");
  await expect(page.locator(".ve2d-stage[data-approved-art='true']")).toBeVisible();
  await expect(page.locator(".ve2d-motion-sprites .ve2d-sprite")).toHaveCount(3);
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
  await page.screenshot({ path: testInfo.outputPath("menu-overlay.png"), animations: "disabled" });
  const pathname = new URL(page.url()).pathname;
  const add = page.getByRole("button", { name: /^Thêm .* vào giỏ$/ }).first();
  await expect(add).toBeVisible();
  await add.click();
  expect(new URL(page.url()).pathname).toBe(pathname);
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
  const animation = await page.locator(".ve2d-sprite-clerk").evaluate(el => getComputedStyle(el).animationName);
  expect(animation).toBe("none");
  const main = page.locator('.ve2d-hotspot[data-target="sign"]');
  await main.focus();
  await expect(main.locator(".ve2d-cloud")).toBeVisible();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("dialog", { name: /Chào mừng/ })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog", { name: /Chào mừng/ })).toHaveCount(0);
});
