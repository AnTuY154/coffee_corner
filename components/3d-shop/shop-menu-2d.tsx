"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useCart } from "@/components/cart-context";
import { InSceneCheckout } from "./in-scene-checkout";
import { currency, currentSeason, products, seasonOrder, seasons, type SeasonKey } from "@/data/catalog";

type Filter = SeasonKey | "all";
type Props = { onClose: () => void };
const normalise = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").toLowerCase();

/** The 3D counter opens this accessible 2D commerce layer; the shop behind remains WebGL. */
export function ShopMenu2D({ onClose }: Props) {
  const [season, setSeason] = useState<Filter>(() => currentSeason(new Date().getMonth() + 1));
  const [query, setQuery] = useState("");
  const [cartVisible, setCartVisible] = useState(false);
  const [view, setView] = useState<"browse"|"checkout">("browse");
  const [recent, setRecent] = useState<string | null>(null);
  const { lines, add, update, remove, count, subtotal } = useCart();
  const panel = useRef<HTMLElement>(null);
  const firstFocus = useRef<HTMLInputElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    previousFocus.current = document.activeElement as HTMLElement | null;
    firstFocus.current?.focus();
    return () => previousFocus.current?.focus();
  }, []);
  useEffect(() => {
    // This dialog handles its own keyboard semantics; game key bindings pause while open.
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") { event.preventDefault(); event.stopPropagation(); onClose(); }
      if (event.key !== "Tab" || !panel.current) return;
      const focusable = [...panel.current.querySelectorAll<HTMLElement>('button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])')]
        .filter(el => !el.hasAttribute("hidden") && el.getClientRects().length > 0);
      if (!focusable.length) return;
      const first = focusable[0], last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", onKeyDown, true);
    return () => document.removeEventListener("keydown", onKeyDown, true);
  }, [onClose]);

  const text = normalise(query.trim());
  const matches = products.filter(p => (season === "all" || p.season === season)
    && (!text || normalise([p.name, p.tagline, p.flavour, ...p.ingredients.map(x => x.name)].join(" ")).includes(text)));
  const checkout = () => { if (count) { setCartVisible(false); setView("checkout"); } };

  return <div className="ve-menu-overlay" onPointerDown={e => e.stopPropagation()} onClick={e => {
    if (e.target === e.currentTarget) onClose();
  }}>
    <section className="ve-menu-dialog" ref={panel} role="dialog" aria-modal="true" aria-labelledby="ve-menu-title" aria-describedby="ve-menu-description">
      <header className="ve-menu-header">
        <div className="ve-menu-brand">
          <span className="ve-menu-flower" aria-hidden="true">✿</span>
          <div><p className="ve-menu-kicker">FRESH FROM THE GARDEN</p><h2 id="ve-menu-title">Thực đơn Vườn Ép</h2></div>
        </div>
        <button className="ve-menu-close" type="button" onClick={onClose} aria-label="Đóng thực đơn, quay lại cửa hàng">✕</button>
      </header>
      {view==="checkout" ? <InSceneCheckout onBack={()=>setView("browse")} onCompleted={()=>setCartVisible(false)} onReturnToShop={onClose}/> : <div className="ve-menu-body">
        <section className="ve-menu-catalogue" aria-label="Danh sách nước ép">
          <div className="ve-menu-intro">
            <div><p className="ve-menu-kicker">MÙA NÀO THỨC ẤY</p><p id="ve-menu-description">Chọn nước ép tươi, xem nguyên liệu và thêm vào giỏ. Bạn vẫn đang ở trong cửa hàng 3D.</p></div>
            <label className="ve-menu-search">
              <span className="sr-only">Tìm tên đồ uống hoặc nguyên liệu</span>
              <input ref={firstFocus} type="search" value={query} onChange={e => setQuery(e.target.value)} placeholder="Tìm nước ép, trái cây..." />
              <span aria-hidden="true">⌕</span>
            </label>
          </div>
          <div className="ve-menu-seasons" role="group" aria-label="Lọc theo mùa">
            <button type="button" aria-pressed={season === "all"} className={season === "all" ? "active" : ""} onClick={() => setSeason("all")}>Tất cả <small>24 món</small></button>
            {seasonOrder.map(key => <button type="button" aria-pressed={season === key} className={season === key ? "active" : ""} key={key} onClick={() => setSeason(key)}>
              <span aria-hidden="true">{seasons[key].emoji}</span> {seasons[key].label}<small>{seasons[key].months}</small>
            </button>)}
          </div>
          <div className="ve-menu-section-title"><h3>{season === "all" ? "Hương vị bốn mùa" : seasons[season].label}</h3><span>{matches.length} thức uống</span></div>
          <div className="ve-menu-grid">
            {matches.map(product => <article className="ve-menu-card" key={product.id}>
              <div className="ve-menu-product-art" style={{background:`linear-gradient(145deg, ${product.colors[1]}, #fff9e9)`}}>
                <Image src={product.image} alt={`Minh họa ${product.name}`} width={220} height={240} sizes="(max-width: 650px) 115px, 180px" />
                {product.badge && <span className="ve-menu-product-badge">{product.badge}</span>}
              </div>
              <div className="ve-menu-card-details">
                <span className="ve-menu-product-meta">{product.method} · {product.tagline}</span>
                <h4>{product.name}</h4>
                <p>{product.flavour}</p>
                <details className="ve-menu-ingredients"><summary>Nguyên liệu</summary><ul>{product.ingredients.map(item => <li key={item.name}>{item.name}: {item.amount}</li>)}</ul></details>
                <div className="ve-menu-product-bottom">
                  <strong>{currency(product.price)}</strong>
                  <button type="button" className="ve-menu-add" onClick={() => { add(product.id); setRecent(product.id); }} aria-label={`Thêm ${product.name} vào giỏ`}>
                    {recent === product.id ? "✓ Đã thêm" : "+ Thêm"}
                  </button>
                </div>
              </div>
            </article>)}
          </div>
          {matches.length === 0 && <p className="ve-menu-empty">Chưa tìm thấy thức uống phù hợp. Thử một mùa khác nhé!</p>}
        </section>
        <aside className={`ve-menu-basket ${cartVisible ? "is-open" : ""}`} aria-label="Giỏ hàng">
          <div className="ve-menu-basket-top"><div><p className="ve-menu-kicker">GÓC NHỎ CỦA BẠN</p><h3>Giỏ hàng <span>({count})</span></h3></div>
            <button type="button" className="ve-menu-mobile-close" onClick={() => setCartVisible(false)} aria-label="Thu gọn giỏ hàng">✕</button>
          </div>
          <div className="ve-menu-basket-lines">
            {lines.length === 0 ? <div className="ve-menu-empty-basket"><span aria-hidden="true">🍊</span><p>Giỏ hàng đang trống</p><small>Thêm một chút vitamin tươi mát nhé!</small></div>
            : lines.map(line => {
              const product = products.find(p => p.id === line.id);
              if (!product) return null;
              return <div className="ve-menu-basket-line" key={line.id}>
                <div><strong>{product.name}</strong><small>{currency(product.price)}</small></div>
                <div className="ve-menu-qty">
                  <button type="button" aria-label={`Giảm ${product.name}`} onClick={() => update(line.id, line.quantity - 1)}>−</button>
                  <span aria-live="polite">{line.quantity}</span>
                  <button type="button" aria-label={`Tăng ${product.name}`} onClick={() => update(line.id, line.quantity + 1)}>+</button>
                  <button type="button" className="ve-menu-remove" aria-label={`Xóa ${product.name}`} onClick={() => remove(line.id)}>✕</button>
                </div>
              </div>;
            })}
          </div>
          <div className="ve-menu-basket-bottom">
            <div className="ve-menu-subtotal"><span>Tạm tính</span><strong>{currency(subtotal)}</strong></div>
            <button type="button" className="ve-menu-checkout" disabled={count === 0} onClick={checkout}>Tiếp tục đặt hàng <span>→</span></button>
            <p>Phí giao hàng và xác nhận đơn sẽ được thông báo ở bước tiếp theo.</p>
          </div>
        </aside>
      </div>}
      {view==="browse"&&<button type="button" className="ve-menu-cart-fab" onClick={() => setCartVisible(v => !v)} aria-expanded={cartVisible} aria-label="Mở giỏ hàng">
        <span>🧺 Giỏ hàng ({count})</span><strong>{currency(subtotal)}</strong>
      </button>}
    </section>
  </div>;
}
