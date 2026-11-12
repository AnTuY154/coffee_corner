import { chromium } from '@playwright/test';
import { writeFileSync, mkdirSync } from 'node:fs';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1366, height: 768 } });
await page.goto('http://127.0.0.1:3000/?scene-review=1');
const host = page.locator('.ve2d-pixi-pets');
await host.waitFor();
await host.evaluate(el => { el.dataset.reviewAdvanceTo = 'dog-run'; });
await page.waitForFunction(() => {
  const el = document.querySelector('.ve2d-pixi-pets');
  return el?.dataset.dogAction === 'run' && Number(el.dataset.dogFrame) >= 0;
});
await host.evaluate(el => { el.dataset.reviewHold = 'true'; });
mkdirSync('qa-redraw/dog-run-sequence', { recursive: true });
const rows = [];
for (let i = 0; i < 32; i++) {
  const state = await host.evaluate(el => ({ frame: el.dataset.dogFrame,
    action: el.dataset.dogAction, x: el.dataset.dogX }));
  await page.locator('.ve2d-stage').screenshot({
    path: `qa-redraw/dog-run-sequence/${String(i).padStart(2, '0')}.png`,
  });
  rows.push({ step: i, ...state });
  await page.waitForTimeout(70);
}
writeFileSync('qa-redraw/dog-run-sequence.json', JSON.stringify(rows, null, 2));
console.log(rows);
await browser.close();

