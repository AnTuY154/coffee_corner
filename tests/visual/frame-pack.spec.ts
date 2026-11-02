import { test, expect } from '@playwright/test';
import { FRAME_SEQUENCES } from '../../components/2d-shop/animation-frames';

for (const [character, actions] of Object.entries(FRAME_SEQUENCES)) {
  test(`${character}: every reviewed sequence loads in the real Pixi scene`, async ({ page }, info) => {
    test.skip(info.project.name.startsWith('mobile'), 'Full scene geometry and mobile flows are covered separately.');
    test.setTimeout(300_000);
    await page.setViewportSize({ width: 1366, height: 768 });
    await page.goto('/?scene-review=1');
    const host = page.locator('.ve2d-pixi-pets[data-visible="true"]');
    await expect(host).toBeVisible();
    await host.evaluate(el => { (el as HTMLElement).dataset.reviewHold = 'true'; });
    const actionKey = character === 'employee' ? 'employeeFrameAction' : `${character}Action`;
    for (const action of Object.keys(actions)) {
      const goal = `frame:${character}:${action}`;
      for (let attempt = 0; attempt < 8; attempt++) {
        await host.evaluate((el, goal) => { (el as HTMLElement).dataset.reviewAdvanceTo = goal; }, goal);
        await expect(host).not.toHaveAttribute('data-review-advance-to', goal);
        if (await host.evaluate((el, key) => (el as HTMLElement).dataset[key], actionKey) === action) break;
      }
      await expect.poll(() => host.evaluate((el, key) => (el as HTMLElement).dataset[key], actionKey)).toBe(action);
      await expect.poll(() => host.evaluate((el, key) => Number((el as HTMLElement).dataset[key]), `${character}Frame`),
        { timeout: 30_000 }).toBeGreaterThanOrEqual(0);
      await page.locator('.ve2d-stage').screenshot({ path: info.outputPath(`${character}-${action}.png`) });
      if (action !== 'jump') {
        const first = await host.evaluate((el, key) => (el as HTMLElement).dataset[key], `${character}Frame`);
        await expect.poll(() => host.evaluate((el, key) => (el as HTMLElement).dataset[key], `${character}Frame`)).not.toBe(first);
      }
    }
  });
}
