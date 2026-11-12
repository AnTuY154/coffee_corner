import { test, expect } from "@playwright/test";

test.describe("Vườn É Pixel Art 2D", () => {
  test("desktop renders room controls and opens fruit case hotspot", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name.startsWith("mobile"), "Desktop anchor test");
    await page.goto("/pixel-shop");
    await expect(page.getByRole("heading", { name: /Vườn É/ })).toBeVisible();
    await expect(page.locator(".pg-stage")).toBeVisible();
    await expect(page.locator(".pg-stage canvas, .pg-fallback").first()).toBeVisible({ timeout: 30000 });
    const stage = page.locator(".pg-stage");
    const box = await stage.boundingBox();
    expect(box).not.toBeNull();
    const width = box!.width, height = box!.height, scale = Math.min(width / 480, height / 320);
    const x = box!.x + (width - 480 * scale) / 2 + 350 * scale;
    const y = box!.y + (height - 270 * scale) / 2 + 155 * scale;
    await page.mouse.click(x, y);
    await expect(page.getByRole("heading", {name: "Trái cây tươi theo gói"})).toBeVisible();
    await expect(page.getByText("Cam tươi · gói 500 g", {exact:true}).first()).toBeVisible();
  });
  test("mobile controls and in-place cart are accessible", async ({ page }, testInfo) => {
    test.skip(!testInfo.project.name.startsWith("mobile"), "Mobile-only controls");
    await page.goto("/pixel-shop");
    await expect(page.getByRole("button", { name: "Đi lên" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Toàn sân" }).or(page.getByRole("button", { name: "Theo nhân vật" }))).toBeVisible();
    await page.getByRole("button", { name: "🍊 Trái cây" }).last().click();
    await expect(page.getByRole("heading", {name:"Trái cây tươi theo gói"})).toBeVisible();
    await page.getByRole("button", {name:"Thêm Cam tươi · gói 500 g vào giỏ"}).click();
    await expect(page.getByRole("button", {name:/Mở giỏ hàng/})).toBeVisible();
    await page.getByRole("button", {name:/Mở giỏ hàng/}).click();
    await expect(page.getByText("Cam tươi · gói 500 g", {exact:true}).last()).toBeVisible();
    await page.screenshot({ path: testInfo.outputPath("pixel-mobile-fruit-cart.png"), fullPage: true });
  });
});
