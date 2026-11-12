import { chromium } from '@playwright/test';
import { writeFileSync, mkdirSync } from 'node:fs';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1366, height: 768 } });
await page.goto('http://127.0.0.1:3000/?scene-review=1');
const host = page.locator('.ve2d-pixi-pets');
await host.waitFor();
await host.evaluate(el => { el.dataset.reviewHold = 'true'; el.dataset.reviewAdvanceTo = 'employee-walk'; });
await page.waitForFunction(() => {
  const el = document.querySelector('.ve2d-pixi-pets');
  return el?.dataset.employeeFrameAction === 'walk' && Number(el.dataset.employeeFrame) >= 0;
});
await host.evaluate(el => { el.dataset.reviewHold = 'true'; });
mkdirSync('qa-redraw/employee-walk-sequence', { recursive: true });
const rows = [];
for (let i = 0; i < 12; i++) {
  const state = await host.evaluate(el => ({ frame: el.dataset.employeeFrame,
    action: el.dataset.employeeFrameAction, x: el.dataset.employeeX }));
  await page.locator('.ve2d-stage').screenshot({
    path: `qa-redraw/employee-walk-sequence/${String(i).padStart(2, '0')}.png`,
  });
  rows.push({ step: i, ...state });
  await page.waitForTimeout(70);
}
writeFileSync('qa-redraw/employee-walk-sequence.json', JSON.stringify(rows, null, 2));
console.log(rows);
await browser.close();


