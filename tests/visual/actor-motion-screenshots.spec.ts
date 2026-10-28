import { test, expect, type Page } from "@playwright/test";
import { mkdirSync } from "node:fs";

test.setTimeout(90_000);

// These screenshots render the REAL Pixi canvas. They don't just assert that
// the director returns a named state; mesh movement and illustrated poses
// must be visibly different in the saved frames.
async function setup(page: Page) {
  await page.goto("/?scene-review=1");
  const host = page.locator(".ve2d-pixi-pets[data-visible='true']");
  await expect(host).toHaveAttribute("data-phase", "idle");
  await host.evaluate((el: HTMLElement) => { el.dataset.reviewHold = "true"; });
  return host;
}
async function advance(page: Page, goal: string) {
  const host = page.locator(".ve2d-pixi-pets");
  await host.evaluate((el: HTMLElement, value: string) => {
    el.dataset.reviewAdvanceTo = value;
  }, goal);
  await expect(host).not.toHaveAttribute("data-review-advance-to", goal, {timeout:15_000});
  return host;
}
async function capture(page: Page, name: string) {
  mkdirSync("qa-motion", { recursive: true });
  await page.locator(".ve2d-stage").screenshot({
    path: `qa-motion/${name}.png`, animations: "disabled",
  });
}
test("the dog really barks, jumps and runs on the paved courtyard", async ({page}) => {
  const host = await setup(page);
  await capture(page, "00-shop-welcome");
  await advance(page, "dog-bark");
  await expect(host).toHaveAttribute("data-dog-mood", "bark");
  await capture(page, "01-dog-bark");
  await advance(page, "dog-jump");
  await expect(host).toHaveAttribute("data-dog-mood", "jump");
  const height = Number(await host.getAttribute("data-dog-jump-height"));
  expect(height, "jump needs actual airborne displacement, not a static pose").toBeGreaterThan(25);
  await capture(page, "02-dog-airborne");
});
test("the cat grooms itself and visibly curls up to nap on the right table", async ({page}) => {
  const host = await setup(page);
  await advance(page, "cat-groom");
  await expect(host).toHaveAttribute("data-cat-mood", "groom");
  await expect(host).toHaveAttribute("data-cat-pose-asset", "groom");
  await capture(page, "03-cat-grooming");
  await advance(page, "cat-nap");
  await expect(host).toHaveAttribute("data-cat-mood", "nap");
  await expect(host).toHaveAttribute("data-cat-pose-asset", "nap");
  await expect(host).toHaveAttribute("data-frame-rendering", "painted-sprites");
  const napFrame = Number(await host.getAttribute("data-cat-frame"));
  expect(napFrame).toBeGreaterThanOrEqual(0);
  expect(napFrame).toBeLessThan(4);
  await capture(page, "04-cat-napping");
  const x = Number(await host.getAttribute("data-cat-x"));
  expect(x).toBeGreaterThanOrEqual(1308);
  expect(x).toBeLessThanOrEqual(1353);
});
test("worker changes from waist-up greeting to full-body RUN and crouching PET", async ({page}) => {
  const host = await setup(page);
  await expect(host).toHaveAttribute("data-employee-pose-asset", /wave|idle/);
  await expect(host).toHaveAttribute("data-counter-mask-height", "650");
  await capture(page, "05-employee-behind-counter");
  await page.locator('.ve2d-hotspot[data-target="dog"]').click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await page.mouse.move(3, 3); // keep tooltip from covering the running sprite
  await advance(page, "employee-run");
  await expect(host).toHaveAttribute("data-employee-pose-asset", "run");
  await expect(host).toHaveAttribute("data-counter-mask-height", "941");
  await capture(page, "06-employee-full-body-running");
  await advance(page, "petting");
  await expect(host).toHaveAttribute("data-employee-pose-asset", "pet");
  await expect(host).toHaveAttribute("data-dog-mood", "happy");
  await capture(page, "07-employee-crouched-petting-dog");
});
