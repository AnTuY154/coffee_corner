import { test, expect } from "@playwright/test";
import { mkdirSync } from "node:fs";

test.setTimeout(90_000);

/**
 * Focused, isolated acceptance snapshot for the exact user request:
 * the clerk must show only the belly-up portion above the wooden countertop.
 * This suite uploads ONLY a few PNG files so an external reviewer can inspect
 * them; the project's complete visual test generates oversized artifacts.
 */
test("counter employee visible only belly-up, face enlarged", async ({page}) => {
  await page.goto("/?scene-review=1");
  const host = page.locator(".ve2d-pixi-pets[data-visible='true']");
  await expect(host).toHaveAttribute("data-phase", "idle");
  await host.evaluate((el: HTMLElement) => { el.dataset.reviewHold = "true"; });
  await expect(host).toHaveAttribute("data-employee-scale", "1.430");
  await expect(host).toHaveAttribute("data-counter-mask-height", "650");
  const p = await host.evaluate((el: HTMLElement) => ({...el.dataset}));
  const fraction = Number(p.employeeVisibleFraction);
  expect(fraction).toBeGreaterThan(.39);
  expect(fraction).toBeLessThan(.46);
  expect(p.employeeY).toBe("810");
  mkdirSync("qa-counter", {recursive:true});
  const stage = page.locator(".ve2d-stage");
  await stage.screenshot({path:"qa-counter/01-full-cafe.png",animations:"disabled"});
  const bounds=await stage.boundingBox();
  if (!bounds) throw Error("Missing stage");
  await page.screenshot({
    path:"qa-counter/02-waist-up-closeup.png",
    clip:{
      x:bounds.x+bounds.width*.355,
      y:bounds.y+bounds.height*.49,
      width:bounds.width*.24,
      height:bounds.height*.30,
    },
    animations:"disabled"
  });
});
