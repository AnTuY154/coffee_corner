import { products, type Product } from "../../data/catalog";

export type StaffCategory = "all" | "fruit" | "daily";
export type StaffLine = Readonly<{
  id: string;
  text: string;
  category: StaffCategory;
  promotedProductId?: string;
}>;

const juice = (item: Product) => item.category !== "fresh-fruit";

/**
 * A new recommendation is not a claim that the SKU has just launched.
 * Only products explicitly flagged "Mới" may be called newly launched.
 * Avoid stock, discount and price claims until production inventory is live.
 */
export function buildStaffLines(month: number): StaffLine[] {
  const validMonth = Number.isInteger(month) && month >= 1 && month <= 12 ? month : 1;
  const seasonal = products.filter(item => juice(item) && item.months.includes(validMonth));
  const featured = seasonal.find(item => item.badge === "Mới")
    ?? seasonal.find(item => item.badge === "Theo mùa")
    ?? seasonal[0]
    ?? products.find(juice);
  const favourite = seasonal.find(item => item.badge === "Bán chạy" && item.id !== featured?.id)
    ?? seasonal.find(item => item.id !== featured?.id)
    ?? featured;

  const lines: StaffLine[] = [
    {
      id: "welcome",
      text: "Vườn É xin chào! Mời bạn ghé quầy chọn một ly nước thật ngon nhé! 🍹",
      category: "all"
    },
    {
      id: "invite",
      text: "Ở đây có nước ép và sinh tố trái cây. Bạn mở thực đơn xem món mình thích nha! 🌿",
      category: "all"
    }
  ];
  if (featured) {
    lines.push({
      id: "seasonal",
      text: featured.badge === "Mới"
        ? `Vườn É vừa có món mới ${featured.name}: ${featured.tagline}. Bạn muốn thử không? ✨`
        : `Gợi ý mới cho bạn đây: ${featured.name}, vị ${featured.flavour.toLowerCase()}. Mình giới thiệu nhé! ✨`,
      category: "all",
      promotedProductId: featured.id
    });
  }
  if (favourite && favourite.id !== featured?.id) {
    lines.push({
      id: "recommend",
      text: `Mình còn gợi ý món ${favourite.name} – ${favourite.tagline}. Xem thử nhé! 🍊`,
      category: "all",
      promotedProductId: favourite.id
    });
  }
  if (products.some(item => item.category === "fresh-fruit")) {
    lines.push({
      id: "fruit",
      text: "Bạn thích trái cây nguyên quả? Quầy có cả danh mục trái cây tươi theo gói để bạn khám phá nữa đó! 🍓",
      category: "fruit"
    });
  }
  lines.push({
    id: "goodbye",
    text: "Cứ thong thả dạo vườn nha, cần tư vấn thì ghé quầy gọi mình nhé! 🌼",
    category: "all"
  });
  return lines;
}
