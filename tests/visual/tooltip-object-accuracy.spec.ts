import { expect, test, type Page } from "@playwright/test";

const WORLD_WIDTH = 1672, WORLD_HEIGHT = 941;

// Manually chosen interior points on the APPROVED PAINTING, not derived
// from the application's hotspot declarations. This catches tautological
// tests where a button matches its own wrong coordinates.
const OBJECT_SAMPLES = [
  { id: "sign", x: 880, y: 183 },
  { id: "juiceBoard", x: 130, y: 376 },
  { id: "smoothieBoard", x: 130, y: 447 },
  { id: "freshFruitBoard", x: 130, y: 519 },
  { id: "snackBoard", x: 130, y: 589 },
  { id: "menu", x: 718, y: 388 },
  { id: "fruits", x: 875, y: 625 },
  { id: "cooler", x: 1061, y: 612 },
  { id: "seats", x: 653, y: 866 },
  { id: "seatsRight", x: 1430, y: 866 },
  { id: "tree", x: 192, y: 126 },
  { id: "parasol", x: 1482, y: 551 },
] as const;

async function ready(page: Page) {
  await page.goto("/");
  await expect(page.locator(".ve2d-pixi-pets[data-visible='true']")).toBeVisible();
}

test("cloud attaches to the actual hovered item, near pointer, never clipped by stage", async ({page}, info) => {
  test.skip(info.project.name.startsWith("mobile"), "desktop mouse hover");
  await ready(page);
  const stage = await page.locator(".ve2d-stage").boundingBox();
  if (!stage) throw new Error("No storefront stage");
  const scaleX = stage.width / WORLD_WIDTH, scaleY = stage.height / WORLD_HEIGHT;
  const {width: viewportWidth, height: viewportHeight} = page.viewportSize()!;
  for (const item of OBJECT_SAMPLES) {
    const mouseX = stage.x + item.x * scaleX;
    const mouseY = stage.y + item.y * scaleY;
    await page.mouse.move(mouseX, mouseY);
    const cloud = page.locator(`.ve2d-floating-tooltip[data-tooltip-target="${item.id}"]`);
    await expect(cloud, `Wrong object hovered at ${item.id}`).toBeVisible();
    const box = await cloud.boundingBox();
    if (!box) throw new Error("Missing tooltip rectangle");
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.y).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(viewportWidth + 1);
    expect(box.y + box.height).toBeLessThanOrEqual(viewportHeight + 1);
    // All static objects are now anchored to a physical edge of their
    // painted item. Do NOT compare tooltip origin to pointer coordinates.
    // Large regions (fridge and fruit shelves) had a naturally huge drift.
    const object = await page.locator(`.ve2d-hotspot[data-target="${item.id}"]`).boundingBox();
    if (!object) throw new Error("No object rectangle");
    const side = ["juiceBoard", "smoothieBoard", "freshFruitBoard", "snackBoard"].includes(item.id)
      ? "right" : ["menu", "sign", "tree"].includes(item.id)
      ? "below" : ["cooler", "parasol"].includes(item.id) ? "left" : "above";
    if (side === "right") {
      expect(box.x, item.id + " should open beside the wooden board")
        .toBeGreaterThanOrEqual(object.x + object.width + 5);
      expect(Math.abs((box.y + box.height / 2) - (object.y + object.height / 2)))
        .toBeLessThan(42);
    } else if (side === "below") {
      expect(box.y, item.id + " should open below its object")
        .toBeGreaterThanOrEqual(object.y + object.height + 5);
      expect(Math.abs((box.x + box.width / 2) - (object.x + object.width / 2)))
        .toBeLessThan(20);
    } else if (side === "left") {
      expect(box.x + box.width).toBeLessThanOrEqual(object.x - 5);
    } else {
      expect(box.y + box.height).toBeLessThanOrEqual(object.y - 5);
    }
    if (["menu", "fruits", "cooler"].includes(item.id)) {
      await page.screenshot({path:info.outputPath(`pointer-cloud-${item.id}.png`)});
    }
  }
});


test("the central three-poster menu tooltip stays BELOW and centered, never floating left", async ({ page }, info) => {
  test.skip(info.project.name.startsWith("mobile"), "desktop pointer placement");
  await ready(page);
  for (const size of [{width:1536,height:1024},{width:1366,height:768},{width:1920,height:1080}]) {
    await page.setViewportSize(size);
    const menu = page.locator('.ve2d-hotspot[data-target="menu"]');
    await menu.hover();
    const cloud = page.locator('.ve2d-floating-tooltip[data-tooltip-target="menu"]');
    await expect(cloud).toBeVisible();
    const rect = await menu.boundingBox(), tip = await cloud.boundingBox();
    if (!rect || !tip) throw new Error("Menu or tooltip bounds missing");
    expect(tip.y, "Menu cloud must start beneath the physical 3-panel sign")
      .toBeGreaterThanOrEqual(rect.y + rect.height + 8);
    expect(Math.abs((tip.x + tip.width / 2) - (rect.x + rect.width / 2)),
      "Menu cloud should be horizontally centered on hanging boards").toBeLessThan(20);
    // Prior implementation chased cursor even inside one menu hotspot.
    const x = rect.x + rect.width * .3, y = rect.y + rect.height * .4;
    await page.mouse.move(x, y);
    const second = await cloud.boundingBox();
    if (!second) throw new Error("Tooltip disappeared while traversing menu");
    expect(Math.abs(tip.x - second.x)).toBeLessThan(2);
    expect(Math.abs(tip.y - second.y)).toBeLessThan(2);
    await page.screenshot({path:info.outputPath(`menu-tooltip-anchored-${size.width}.png`)});
  }
});

test("three requested left signs always reveal their own correctly anchored tooltips", async ({page}, info) => {
  test.skip(info.project.name.startsWith("mobile"), "desktop mouse hover");
  await ready(page);
  const stage = await page.locator(".ve2d-stage").boundingBox();
  if (!stage) throw new Error("Missing stage");
  const sample = [
    {id:"juiceBoard", x:130, y:376},
    {id:"smoothieBoard", x:130, y:447},
    {id:"freshFruitBoard", x:130, y:519},
    {id:"snackBoard", x:130, y:589},
  ] as const;
  for (const item of sample) {
    await page.mouse.move(stage.x + item.x * stage.width / WORLD_WIDTH,
      stage.y + item.y * stage.height / WORLD_HEIGHT);
    const tooltip = page.locator(`.ve2d-floating-tooltip[data-tooltip-target="${item.id}"]`);
    await expect(tooltip).toBeVisible();
    const board = await page.locator(`.ve2d-hotspot[data-target="${item.id}"]`).boundingBox();
    const cloud = await tooltip.boundingBox();
    if (!board || !cloud) throw new Error("Missing board or tooltip");
    // Cloud on the RIGHT side of each separate wooden board, at its level,
    // rather than centred on the whole four-board stack.
    expect(cloud.x).toBeGreaterThanOrEqual(board.x + board.width - 8);
    expect(Math.abs((cloud.y + cloud.height / 2) - (board.y + board.height / 2)))
      .toBeLessThan(70);
  }
});

test("on mobile tooltip remains in viewport after tapping fixed item", async ({page}, info) => {
  test.skip(!info.project.name.startsWith("mobile"), "touch-only");
  await ready(page);
  const menu = page.locator('.ve2d-hotspot[data-target="menu"]');
  await menu.click();
  const tooltip = page.locator('.ve2d-floating-tooltip[data-tooltip-target="menu"]');
  await expect(tooltip).toBeVisible();
  const rect = await tooltip.boundingBox();
  const viewport = page.viewportSize();
  if (!rect || !viewport) throw new Error("Missing touch tooltip geometry");
  expect(rect.x).toBeGreaterThanOrEqual(0);
  expect(rect.x + rect.width).toBeLessThanOrEqual(viewport.width + 2);
  expect(rect.y).toBeGreaterThanOrEqual(0);
  expect(rect.y + rect.height).toBeLessThanOrEqual(viewport.height + 2);
  await menu.click();
  await expect(page.getByRole("dialog", {name:/Thực đơn/})).toBeVisible();
});

test("diagnostic overlay shows where approved painting's click shapes are", async ({page}, info) => {
  test.skip(info.project.name.startsWith("mobile"), "single desktop calibration screenshot");
  await page.goto("/?hotspot-debug=1");
  await expect(page.locator(".ve2d-root[data-hotspot-debug=true]")).toBeVisible();
  await expect(page.locator(".ve2d-pixi-pets[data-visible='true']")).toBeVisible();
  await page.screenshot({path:info.outputPath("calibrated-hotspots-on-canonical-shop.png")});
});
