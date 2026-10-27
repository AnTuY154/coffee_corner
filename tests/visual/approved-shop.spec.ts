import { expect, test } from "@playwright/test";

const WORLD_RATIO = 1672 / 941;

async function sceneReady(page: import("@playwright/test").Page) {
  await page.goto("/");
  await expect(page.locator(".ve2d-stage[data-approved-art='true']")).toBeVisible();
  await expect(page.locator('.ve2d-pixi-pets[data-engine="pixijs-choreographed-actors"] canvas')).toBeVisible();
  await expect(page.locator(".ve2d-pixi-pets[data-visible='true']")).toBeVisible();
}

test("only canonical shop and 3 animated actors, correct 16:9 scene", async ({ page }, info) => {
  await sceneReady(page);
  const image = page.locator(".ve2d-approved-art");
  expect(await image.evaluate((node: HTMLImageElement) =>
    [node.naturalWidth, node.naturalHeight, node.complete])).toEqual([1672, 941, true]);
  const ratio = await page.locator(".ve2d-stage").evaluate(node => {
    const rect = node.getBoundingClientRect();
    return rect.width / rect.height;
  });
  expect(Math.abs(ratio - WORLD_RATIO)).toBeLessThan(.005);
  expect(await image.getAttribute("src")).toContain("/art/canonical/shop.webp");
  await expect(page.locator(".ve2d-motion-sprites .ve2d-sprite")).toHaveCount(0);
  await page.screenshot({ path: info.outputPath("vuon-e-canonical-actors.png"), animations: "disabled" });
});

test("puppy stays below tabletop cat while their hotspots follow them", async ({ page }) => {
  await sceneReady(page);
  const dog = page.locator('.ve2d-hotspot[data-target="dog"]');
  const cat = page.locator('.ve2d-hotspot[data-target="cat"]');
  const initialDog = await dog.boundingBox();
  const initialCat = await cat.boundingBox();
  expect(initialDog && initialCat).toBeTruthy();
  // Different sprite sizes mean comparing box TOP coordinates is invalid.
  // Compare vertical actor centres in the canonical artboard coordinate space.
  const stage = await page.locator(".ve2d-stage").boundingBox();
  if (!stage) throw new Error("missing stage");
  const worldScale = stage.height / 941;
  const yCenter = (r: {y:number;height:number}) => r.y + r.height / 2;
  expect((yCenter(initialDog!) - yCenter(initialCat!)) / worldScale).toBeGreaterThan(40);
  await page.waitForTimeout(1300);
  const nextDog = await dog.boundingBox();
  const nextCat = await cat.boundingBox();
  expect(nextDog && nextCat).toBeTruthy();
  expect((yCenter(nextDog!) - yCenter(nextCat!)) / worldScale).toBeGreaterThan(40);
});

test("shop menu, cart, checkout remain in the same URL", async ({ page }) => {
  await sceneReady(page);
  const before = new URL(page.url()).pathname;
  const clerk = page.locator('.ve2d-hotspot[data-target="clerk"]');
  const fruits = page.locator('.ve2d-hotspot[data-target="fruits"]');
  await expect(clerk).toBeVisible();
  const employeeLayer = await clerk.evaluate(node => Number(getComputedStyle(node).zIndex));
  const fruitLayer = await fruits.evaluate(node => Number(getComputedStyle(node).zIndex));
  expect(employeeLayer).toBeGreaterThan(fruitLayer);
  if (test.info().project.name.startsWith("mobile")) {
    await clerk.click();
    await expect(clerk.locator(".ve2d-cloud")).toBeVisible();
  } else {
    await clerk.hover();
    await expect(clerk.locator(".ve2d-cloud")).toBeVisible();
  }
  await clerk.click();
  await expect(page.getByRole("dialog", { name: /Thực đơn/ })).toBeVisible();
  await page.getByRole("button", { name: /^Thêm .* vào giỏ$/ }).first().click();
  expect(new URL(page.url()).pathname).toBe(before);
  if (test.info().project.name.startsWith("mobile"))
    await page.locator(".ve-menu-cart-fab").click();
  await page.getByRole("button", { name: /Tiếp tục đặt hàng/ }).click();
  expect(new URL(page.url()).pathname).toBe(before);
});

test("desktop contains every part of the storefront; reduced motion remains usable", async ({ page }, info) => {
  test.skip(info.project.name.startsWith("mobile"), "desktop screen coverage");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await sceneReady(page);
  for (const [width,height] of [[1920,1080],[1366,768],[1024,768],[1536,1024]]) {
    await page.setViewportSize({ width, height });
    const rect = await page.locator(".ve2d-stage").boundingBox();
    if (!rect) throw new Error("The stage disappeared");
    expect(rect.x).toBeGreaterThanOrEqual(-1);
    expect(rect.y).toBeGreaterThanOrEqual(-1);
    expect(rect.x + rect.width).toBeLessThanOrEqual(width + 1);
    expect(rect.y + rect.height).toBeLessThanOrEqual(height + 1);
    expect(Math.abs(rect.width / rect.height - WORLD_RATIO)).toBeLessThan(.005);
  }
  await page.locator('.ve2d-hotspot[data-target="sign"]').focus();
  await expect(page.locator('.ve2d-hotspot[data-target="sign"] .ve2d-cloud')).toBeVisible();
});
