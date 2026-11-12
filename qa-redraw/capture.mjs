import { chromium } from '@playwright/test';
import { writeFileSync, mkdirSync } from 'node:fs';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1366, height: 768 } });
await page.goto('http://127.0.0.1:3000/?scene-review=1');
await page.waitForFunction(() => {
  const host = document.querySelector('.ve2d-pixi-pets');
  return host?.dataset.dogAction === 'walk' && Number(host.dataset.dogFrame) >= 0;
}, { timeout: 30000 });
await page.locator('.ve2d-pixi-pets').evaluate(el => { el.dataset.reviewHold = 'true'; });
mkdirSync('qa-redraw/sequence', { recursive: true });
const rows = [];
for (let i = 0; i < 16; i++) {
  const state = await page.evaluate(() => {
    const host = document.querySelector('.ve2d-pixi-pets');
    return { frame: host?.dataset.dogFrame, action: host?.dataset.dogAction,
      x: host?.dataset.dogX };
  });
  await page.locator('.ve2d-stage').screenshot({
    path: `qa-redraw/sequence/${String(i).padStart(2, '0')}.png`,
  });
  rows.push({ step: i, frame: state.frame, action: state.action, x: state.x });
  await page.waitForTimeout(90);
}
await page.screenshot({ path: 'qa-redraw/shop-dog-walk.png' });
writeFileSync('qa-redraw/sequence.json', JSON.stringify(rows, null, 2));
console.log(rows);
await browser.close();
