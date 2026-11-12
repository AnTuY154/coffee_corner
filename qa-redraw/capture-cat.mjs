import { chromium } from '@playwright/test';
import { writeFileSync, mkdirSync } from 'node:fs';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1366, height: 768 } });
await page.goto('http://127.0.0.1:3000/?scene-review=1');
const host = page.locator('.ve2d-pixi-pets');
await host.waitFor();
await host.evaluate(el => { el.dataset.reviewAdvanceTo = 'cat-walk'; });
await page.waitForFunction(() => {
  const el = document.querySelector('.ve2d-pixi-pets');
  return el?.dataset.catAction === 'walk' && Number(el.dataset.catFrame) >= 0;
});
await host.evaluate(el => { el.dataset.reviewHold = 'true'; });
mkdirSync('qa-redraw/cat-sequence', { recursive: true });
const rows = [];
for (let i = 0; i < 32; i++) {
  const state = await host.evaluate(el => ({ frame: el.dataset.catFrame,
    action: el.dataset.catAction, x: el.dataset.catX }));
  await page.locator('.ve2d-stage').screenshot({
    path: `qa-redraw/cat-sequence/${String(i).padStart(2, '0')}.png`,
  });
  rows.push({ step: i, ...state });
  await page.waitForTimeout(70);
}
writeFileSync('qa-redraw/cat-sequence.json', JSON.stringify(rows, null, 2));
console.log(rows);
await browser.close();

