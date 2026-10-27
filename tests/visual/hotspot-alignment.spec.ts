import { expect, test, type Page } from "@playwright/test";

/**
 * Independent pixel-space alignment audit.
 * Canonical 1672x941 art rectangles are [LEFT,TOP,WIDTH,HEIGHT].
 * Unlike past tests, compare the ACTUAL DOM hit areas to these rectangles,
 * including stage scale, centered contain layout and mobile horizontal scroll.
 */
test.setTimeout(90_000);
const W = 1672, H = 941;
const fixed: Record<string, readonly [number, number, number, number]> = {
  sign: [582, 90, 561, 176],
  juiceBoard: [45, 339, 199, 94],
  smoothieBoard: [38, 410, 204, 90],
  freshFruitBoard: [32, 480, 214, 90],
  snackBoard: [26, 550, 221, 93],
  menu: [654, 346, 382, 132],
  fruits: [809, 589, 165, 80],
  cooler: [985, 541, 148, 251],
  seats: [487, 810, 345, 124],
  seatsRight: [1158, 795, 413, 143],
  tree: [0, 0, 426, 310],
  parasol: [1351, 487, 319, 154],
};
const close = (a: number, b: number, label: string) =>
  expect(Math.abs(a - b), `${label}: expected ${b}, rendered ${a}`).toBeLessThan(2.2);

async function loaded(page: Page) {
  await page.goto("/");
  await expect(page.locator('.ve2d-pixi-pets[data-visible="true"]')).toBeVisible();
}

async function auditFixed(page: Page) {
  // Take ONE DOM layout snapshot for all 9 hotspots. Playwright's individual
  // boundingBox calls can take seconds each in software Chromium, causing a
  // false CI timeout even though every rectangle is positioned correctly.
  const snapshot = async () => page.evaluate((ids: string[]) => {
    const rect = (selector: string) => {
      const node = document.querySelector<HTMLElement>(selector);
      if (!node) return null;
      const r = node.getBoundingClientRect();
      return { x: r.x, y: r.y, width: r.width, height: r.height };
    };
    const boxes = Object.fromEntries(ids.map(id => [
      id, rect(`.ve2d-hotspot[data-target="${id}"]`),
    ]));
    return {
      stage: rect(".ve2d-stage"),
      image: rect(".ve2d-approved-art"),
      canvas: rect(".ve2d-pixi-pets canvas"),
      boxes,
    };
  }, Object.keys(fixed));
  // Allow exactly one ResizeObserver turn after changing the viewport.
  await expect.poll(async () => {
    const { stage, canvas } = await snapshot();
    return stage && canvas
      ? Math.abs(stage.width - canvas.width) + Math.abs(stage.height - canvas.height)
      : Infinity;
  }, { timeout: 8_000, intervals: [100, 150, 300] }).toBeLessThan(2.2);

  const {stage, image, canvas, boxes} = await snapshot();
  if (!stage || !image || !canvas) throw new Error("Scene geometry unavailable");
  close(image.x, stage.x, "image left");
  close(image.y, stage.y, "image top");
  close(image.width, stage.width, "image width");
  close(image.height, stage.height, "image height");
  close(canvas.x, stage.x, "Pixi left");
  close(canvas.y, stage.y, "Pixi top");
  close(canvas.width, stage.width, "Pixi width");
  close(canvas.height, stage.height, "Pixi height");
  const sx = stage.width / W, sy = stage.height / H;
  close(sx, sy, "image uniform scale");
  for (const [id, [x, y, w, h]] of Object.entries(fixed)) {
    const hit = boxes[id];
    if (!hit) throw new Error(`Missing ${id} hotspot`);
    close(hit.x, stage.x + x * sx, id + " left");
    close(hit.y, stage.y + y * sy, id + " top");
    close(hit.width, w * sx, id + " width");
    close(hit.height, h * sy, id + " height");
  }
}

test("static hover rectangles align with canonical image on desktop and mobile", async ({ page }, info) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await loaded(page);
  await auditFixed(page);
  if (!info.project.name.startsWith("mobile")) {
    for (const [width, height] of [[1920,1080], [1440,900], [1024,768]]) {
      await page.setViewportSize({width, height});
      await auditFixed(page);
    }
    await page.setViewportSize({width:1536, height:1024});
    for (const id of ["sign", "menu", "juiceBoard", "smoothieBoard", "freshFruitBoard", "snackBoard", "cooler"]) {
      const hotspot = page.locator(`.ve2d-hotspot[data-target="${id}"]`);
      await hotspot.hover();
      await expect(page.locator(`.ve2d-floating-tooltip[data-tooltip-target="${id}"]`)).toBeVisible();
      await page.screenshot({path: info.outputPath(`hover-${id}.png`), animations:"disabled"});
    }
  } else {
    // Mobile's wide stage scrolls horizontally; world-space hit areas
    // remain locked to the background even at nonzero scrollLeft.
    await page.locator(".ve2d-viewport").evaluate(e => {e.scrollLeft = 180;});
    await auditFixed(page);
  }
});

test("employee, dog and cat hover centers follow real Pixi actors", async ({page}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await loaded(page);
  const world = page.locator(".ve2d-pixi-pets");
  await expect(world).toHaveAttribute("data-dog-x", /\d+/);
  const stage = await page.locator(".ve2d-stage").boundingBox();
  if (!stage) throw new Error("Missing stage");
  const sx = stage.width / W, sy = stage.height / H;
  const p = await world.evaluate((e: HTMLElement) => ({...e.dataset}));
  for (const [key, x, y] of [
    ["dog", Number(p.dogX), Number(p.dogY) - 56],
    ["cat", Number(p.catX), Number(p.catY) - 42],
    ["clerk", Number(p.employeeX), Number(p.employeeY) - 104],
  ] as const) {
    const box = await page.locator(`.ve2d-hotspot[data-target="${key}"]`).boundingBox();
    if (!box) throw new Error(`Missing ${key} hotspot`);
    close(box.x + box.width / 2, stage.x + x * sx, key + " center x");
    close(box.y + box.height / 2, stage.y + y * sy, key + " center y");
  }
});
