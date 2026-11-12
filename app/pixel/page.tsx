import type { Metadata } from "next";
import { PixelShopEntry } from "@/components/pixel-shop/entry";
import { products } from "@/data/catalog";

/**
 * Vườn É — the NEW Pixel Art experience.
 *
 * "/" deliberately remains the existing IllustratedShop, while
 * "/pixel" is opt-in and does not require a feature flag or a redirect.
 * The old "/pixel-shop" preview continues to work.
 */
export const metadata: Metadata = {
  title: "Vườn É Pixel Art — Quán nước ép trong khu vườn",
  description: "Khám phá quán Vườn É phiên bản Pixel Art, di chuyển trong sân vườn, chọn nước ép và trái cây tươi.",
};

export default function PixelPage() {
  return (
    <>
      <PixelShopEntry />
      <noscript>
        <section style={{ padding: "1rem" }}>
          <h2>Thực đơn Vườn É</h2>
          <p>Hãy bật JavaScript để di chuyển và khám phá quán Pixel Art. Bạn vẫn có thể xem sản phẩm tại đây.</p>
          {products.map(product => (
            <p key={product.id}>
              <a href={`/san-pham/${product.slug}`}>{product.name}</a> — {product.price.toLocaleString("vi-VN")}đ
            </p>
          ))}
        </section>
      </noscript>
    </>
  );
}
