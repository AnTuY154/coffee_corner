import { test, expect, type Page } from "@playwright/test";

/**
 * INDEPENDENT VISUAL ACCEPTANCE GATE (not the implementation's unit tests).
 * Reproduces the original production bug: Pixi's 1672x650 white stencil
 * becomes a visible scene object when the employee leaves the counter.
 * Also checks the actual world/surface coordinates, not simply relative Y.
 */
test.setTimeout(90_000);

async function ready(page: Page) {
  await page.goto("/?scene-review=1");
  const host = page.locator(".ve2d-pixi-pets[data-visible='true']");
  await expect(host).toBeVisible();
  await expect(host).toHaveAttribute("data-phase", "idle");
  // Hold the real simulation at each named state so screenshots do not
  // accidentally show the NEXT action after slow CI image sampling.
  await host.evaluate((element: HTMLElement) => {
    element.dataset.reviewHold = "true";
  });
  return host;
}

async function checkNoWhitePanel(page: Page, caption: string) {
  const stage = page.locator(".ve2d-stage[data-approved-art='true']");
  const bitmap = (await stage.screenshot({ animations: "disabled" })).toString("base64");
  const measured = await page.evaluate(async image64 => {
    const img = new Image();
    img.src = `data:image/png;base64,${image64}`;
    await img.decode();
    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) throw new Error("Browser canvas unavailable for QA");
    ctx.drawImage(img, 0, 0);
    let white = 0, count = 0;
    // 24 samples across the TOP area that used to turn solid white.
    // Original storefront contains colored signage, plants and lanterns.
    for (const fy of [.10, .28, .43, .60]) {
      for (const fx of [.08, .23, .39, .54, .72, .91]) {
        const pixel = ctx.getImageData(Math.floor(fx * canvas.width),
          Math.floor(fy * canvas.height), 1, 1).data;
        if (pixel[0] > 247 && pixel[1] > 247 && pixel[2] > 247) white++;
        count++;
      }
    }
    return { white, count, width: canvas.width, height: canvas.height };
  }, bitmap);
  // The reported bug makes nearly ALL of these samples white.
  expect(measured.white / measured.count, `${caption}: white overlay covered the café`)
    .toBeLessThan(.40);
  return measured;
}

async function assertSurfaceCoords(page: Page) {
  const host = page.locator(".ve2d-pixi-pets");
  const p = await host.evaluate((el: HTMLElement) => ({ ...el.dataset }));
  const xDog = Number(p.dogX), yDog = Number(p.dogY);
  const xCat = Number(p.catX), yCat = Number(p.catY);
  expect(xDog).toBeGreaterThanOrEqual(870);
  expect(xDog).toBeLessThanOrEqual(1080);
  expect(yDog).toBe(918);
  expect(xCat).toBeGreaterThanOrEqual(1308);
  expect(xCat).toBeLessThanOrEqual(1353);
  expect(yCat).toBe(853);
}

async function askForVisit(page: Page, animal: "dog" | "cat") {
  const hotspot = page.locator(`.ve2d-hotspot[data-target="${animal}"]`);
  await hotspot.click();
  // Moving pets respond on the first tap even on touch devices; two taps
  // were flaky because the actor moved out from under the finger.
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await page.mouse.move(3, 3);
  await expect(page.getByRole("dialog")).toHaveCount(0);
}

async function simulateUntil(page: Page, goal: "off-counter" | "petting" | "home") {
  const host = page.locator(".ve2d-pixi-pets");
  await host.evaluate((element: HTMLElement, requested: string) => {
    element.dataset.reviewAdvanceTo = requested;
  }, goal);
  if (goal === "off-counter") {
    await expect(host).toHaveAttribute("data-counter-mask-height", "941", { timeout: 8_000 });
  } else if (goal === "petting") {
    await expect(host).toHaveAttribute("data-phase", "petting", { timeout: 8_000 });
  } else {
    await expect(host).toHaveAttribute("data-phase", "idle", { timeout: 8_000 });
  }
}

test("employee leaves counter without giant white graphics panel; dog remains on pavement", async ({ page }, info) => {
  const host = await ready(page);
  await assertSurfaceCoords(page);
  await expect(host).toHaveAttribute("data-employee-scale", "1.430");
  await expect(host).toHaveAttribute("data-employee-y", "810");
  // Visual geometry invariant: only the first ~53% of the full-body texture
  // is above the opaque counter edge. The former implementation exposed
  // ~78%, including the entire green apron and part of the dress.
  const portraitFraction = Number(await host.getAttribute("data-employee-visible-fraction"));
  expect(portraitFraction, "worker must be cropped precisely at belly/waist")
    .toBeGreaterThan(.39);
  expect(portraitFraction).toBeLessThan(.46);
  await expect(host).toHaveAttribute("data-counter-mask-height", "650");
  await checkNoWhitePanel(page, "before visit");
  await page.screenshot({path: info.outputPath("employee-closeup-behind-counter.png")});
  // Clicking the animal requests a visit; dismiss the story popup to inspect
  // the real shop and moving Pixi canvas without a modal dimming overlay.
  await askForVisit(page, "dog");
  await simulateUntil(page, "off-counter");
  await expect(host).toHaveAttribute("data-employee-pose-asset", "run");
  await checkNoWhitePanel(page, "employee outside counter");
  await page.screenshot({path: info.outputPath("employee-real-running-pose.png")});

  await simulateUntil(page, "petting");
  await expect(host).toHaveAttribute("data-employee-action", "pet");
  await expect(host).toHaveAttribute("data-employee-pose-asset", "pet");
  await checkNoWhitePanel(page, "employee petting dog");
  await assertSurfaceCoords(page);
  await page.screenshot({ path: info.outputPath("dog-visit-no-white-overlay.png") });

  await simulateUntil(page, "home");
  await expect(host).toHaveAttribute("data-counter-mask-height", "650");
  await expect(host).toHaveAttribute("data-employee-y", "760");
  const backAtCounter = Number(await host.getAttribute("data-employee-visible-fraction"));
  expect(backAtCounter).toBeGreaterThan(.39);
  expect(backAtCounter).toBeLessThan(.46);
  await checkNoWhitePanel(page, "employee returned behind counter");
});

test("cat stays on table while worker pets it from the floor", async ({ page }, info) => {
  const host = await ready(page);
  await assertSurfaceCoords(page);
  await askForVisit(page, "cat");
  await simulateUntil(page, "petting");
  await expect(host).toHaveAttribute("data-counter-mask-height", "852");
  await expect(host).toHaveAttribute("data-employee-pose-asset", "pet");
  await assertSurfaceCoords(page);
  const coords = await host.evaluate((el: HTMLElement) => ({ ...el.dataset }));
  expect(Number(coords.employeeY)).toBeGreaterThan(Number(coords.catY) + 50);
  await checkNoWhitePanel(page, "employee petting tabletop cat");
  await page.screenshot({ path: info.outputPath("cat-on-table-no-white-overlay.png") });
});
