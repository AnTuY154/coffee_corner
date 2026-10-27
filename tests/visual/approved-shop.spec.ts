import { expect, test } from "@playwright/test";

const ASPECT = 1672 / 941;
const CANVAS = '.ve2d-pixi-pets[data-engine="pixijs-choreographed-actors"] canvas';

async function expectCanonicalScene(page: import('@playwright/test').Page) {
  await expect(page.locator(".ve2d-stage[data-approved-art='true']")).toBeVisible();
  await expect(page.locator(CANVAS)).toBeVisible();
  await expect(page.locator('.ve2d-approved-art')).toHaveAttribute('src', /canonical\/shop\.webp/);
  const dimensions = await page.locator('.ve2d-approved-art').evaluate((el: HTMLImageElement) => [el.naturalWidth, el.naturalHeight, el.complete]);
  expect(dimensions).toEqual([1672, 941, true]);
  const ratio = await page.locator('.ve2d-stage').evaluate(el => {
    const b=el.getBoundingClientRect();return b.width/b.height;
  });
  expect(Math.abs(ratio-ASPECT)).toBeLessThan(.002);
  expect(await page.locator('.ve2d-motion-sprites .ve2d-sprite').count()).toBe(0);
}

test("four canonical Vườn É illustrations power the 16:9 scene and same-screen checkout", async ({page},testInfo) => {
  await page.goto('/');
  await expectCanonicalScene(page);
  await page.screenshot({path:testInfo.outputPath('canonical-shop.png'),animations:'disabled'});
  const clerk=page.locator('.ve2d-hotspot[data-target="clerk"]');
  await expect(clerk).toBeVisible();
  if (testInfo.project.name.startsWith('mobile')) {
    await clerk.click();
    await expect(clerk.locator('.ve2d-cloud')).toBeVisible();
    await clerk.click();
  } else {
    await clerk.hover();
    await expect(clerk.locator('.ve2d-cloud')).toBeVisible();
    await clerk.click();
  }
  await expect(page.getByRole('dialog',{name:/Thực đơn/})).toBeVisible();
  await page.screenshot({path:testInfo.outputPath('menu-overlay.png'),animations:'disabled'});
  const pathname=new URL(page.url()).pathname;
  const add=page.getByRole('button',{name:/^Thêm .* vào giỏ$/}).first();
  await expect(add).toBeVisible();
  await add.click();
  expect(new URL(page.url()).pathname).toBe(pathname);
  if (testInfo.project.name.startsWith('mobile')) await page.locator('.ve-menu-cart-fab').click();
  await page.getByRole('button',{name:/Tiếp tục đặt hàng/}).click();
  await expect(page.getByText(/thông tin|đặt hàng|thanh toán/i).first()).toBeVisible();
  expect(new URL(page.url()).pathname).toBe(pathname);
  await page.keyboard.press('Escape');
  await expect(page.locator('.ve2d-stage')).toBeVisible();
});

test('keyboard hotspots remain accessible with reduced motion',async ({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto('/');
  await expectCanonicalScene(page);
  await expect(page.locator(CANVAS)).toBeVisible();
  const sign=page.locator('.ve2d-hotspot[data-target="sign"]');
  await sign.focus();
  await expect(sign.locator('.ve2d-cloud')).toBeVisible();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('dialog',{name:/Chào mừng/})).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog',{name:/Chào mừng/})).toHaveCount(0);
});

test('desktop contains entire 16:9 shop with aligned scene and renderer',async ({page},testInfo)=>{
  test.skip(testInfo.project.name.startsWith('mobile'),'desktop viewport geometry');
  await page.goto('/');
  await expectCanonicalScene(page);
  for(const [width,height] of [[1920,1080],[1440,900],[2560,1080],[1366,768],[1024,768],[1536,1024]]){
    await page.setViewportSize({width,height});
    const root=await page.locator('.ve2d-root').boundingBox();
    const stage=await page.locator('.ve2d-stage').boundingBox();
    const image=await page.locator('.ve2d-approved-art').boundingBox();
    const canvas=await page.locator(CANVAS).boundingBox();
    if(!root||!stage||!image||!canvas) throw new Error('missing actor-world layers');
    expect(root.width).toBeGreaterThanOrEqual(width-1);
    expect(root.height).toBeGreaterThanOrEqual(height-1);
    expect(stage.x).toBeGreaterThanOrEqual(-1);
    expect(stage.y).toBeGreaterThanOrEqual(-1);
    expect(stage.x+stage.width).toBeLessThanOrEqual(width+1);
    expect(stage.y+stage.height).toBeLessThanOrEqual(height+1);
    expect(Math.abs(stage.width/stage.height-ASPECT)).toBeLessThan(.002);
    expect(Math.abs(stage.x-image.x)+Math.abs(stage.y-image.y)).toBeLessThan(1.5);
    expect(Math.abs(stage.x-canvas.x)+Math.abs(stage.y-canvas.y)).toBeLessThan(1.5);
    for(const animal of ['dog','cat']) {
      const rect=await page.locator(`.ve2d-hotspot[data-target="${animal}"]`).boundingBox();
      if (!rect)throw new Error('missing pet hotspot');
      expect(rect.y).toBeGreaterThanOrEqual(stage.y-1);
      expect(rect.y+rect.height).toBeLessThanOrEqual(stage.y+stage.height+12);
    }
    if ([1920,1440,2560].includes(width))
      await page.screenshot({path:testInfo.outputPath(`contain-${width}x${height}.png`),animations:'disabled'});
  }
});

test('source-derived 2D mesh actors move and pet audio is opt-in',async ({page})=>{
  await page.goto('/');
  await expectCanonicalScene(page);
  const canvas=page.locator(CANVAS);
  const before=await canvas.screenshot({animations:'allow'});
  const positionBefore=await page.locator('.ve2d-hotspot[data-target="dog"]').getAttribute('style');
  await page.waitForTimeout(3600);
  const after=await canvas.screenshot({animations:'allow'});
  expect(before.equals(after)).toBe(false);
  const positionAfter=await page.locator('.ve2d-hotspot[data-target="dog"]').getAttribute('style');
  expect(positionBefore).toContain('left:');
  expect(positionAfter).toContain('left:');
  const sound=page.getByRole('button',{name:'Bật tiếng mèo'});
  await expect(sound).toHaveAttribute('aria-pressed','false');
  await sound.click();
  await expect(page.getByRole('button',{name:'Tắt tiếng mèo'})).toHaveAttribute('aria-pressed','true');
  await page.getByRole('button',{name:'Tắt tiếng mèo'}).click();
  await expect(page.getByRole('button',{name:'Bật tiếng mèo'})).toHaveAttribute('aria-pressed','false');
});