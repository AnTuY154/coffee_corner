"use client";

import { useEffect, useRef, useState } from "react";
import { useCart } from "@/components/cart-context";
import { ShopMenu2D } from "@/components/3d-shop/shop-menu-2d";
import { ShopIllustration } from "./shop-illustration";
import "./illustrated-shop.css";

type Action = "order" | "intro" | "seats" | "garden" | "dog" | "cat";
type Key = "sign" | "clerk" | "menu" | "fruits" | "cooler" | "seats" | "seatsRight" | "tree" | "parasol" | "dog" | "cat" | "categories";
type Hotspot = {
  id: Key; name: string; hint: string;
  x: number; y: number; w: number; h: number;
  action: Action; placement?: "above" | "below" | "left";
};
type StoryAction = Exclude<Action, "order">;

/** Fallback hotspots match the existing 1440×810 SVG until the approved art is available. */
const LEGACY_HOTSPOTS: Hotspot[] = [
  { id: "sign", name: "Biển hiệu Vườn É", hint: "Nhấn để tìm hiểu về Vườn É nhé!", x: 47, y: 22, w: 33, h: 15, action: "intro", placement: "below" },
  { id: "clerk", name: "Nhân viên", hint: "Nhấn vào mình để gọi nước ép nhé!", x: 52, y: 50, w: 15, h: 22, action: "order" },
  { id: "menu", name: "Thực đơn", hint: "Khám phá nước ép theo mùa!", x: 61, y: 51, w: 13, h: 17, action: "order" },
  { id: "fruits", name: "Trái cây", hint: "Chọn trái cây tươi ngon mỗi ngày!", x: 20, y: 76, w: 16, h: 18, action: "order" },
  { id: "cooler", name: "Tủ nước ép", hint: "Mở thực đơn đồ uống nhé!", x: 75, y: 56, w: 8, h: 30, action: "order", placement: "left" },
  { id: "seats", name: "Bàn ghế ngoài hiên", hint: "Chọn một góc ngồi thật xinh!", x: 45, y: 86, w: 28, h: 19, action: "seats" },
  { id: "tree", name: "Cây xanh", hint: "Khám phá khu vườn nhỏ!", x: 85, y: 23, w: 24, h: 21, action: "garden", placement: "below" },
  { id: "dog", name: "Chú chó", hint: "Chào người bạn nhỏ của Vườn É!", x: 66, y: 86, w: 11, h: 12, action: "dog" },
];

/**
 * Pixel-perfect coordinate system: original approved composition 1536×1024.
 * Hit areas intentionally stop short of neighbouring interactable objects.
 * Keep the source PNG / cleaned WEBP at its un-cropped 3:2 aspect ratio.
 */
const REF_W = 1536, REF_H = 1024;
type PixelHotspot = Omit<Hotspot, "x" | "y" | "w" | "h"> & { box: readonly [number, number, number, number] };
const ART_HOTSPOTS: PixelHotspot[] = [
  { id: "sign", name: "Vườn É", hint: "Chào bạn! Khám phá câu chuyện Vườn É nhé!", box: [784, 176, 500, 145], action: "intro", placement: "below" },
  { id: "categories", name: "Các loại nước ép", hint: "Chọn danh mục nước ép, sinh tố và trái cây!", box: [131, 494, 202, 315], action: "order", placement: "left" },
  { id: "menu", name: "Bảng thực đơn", hint: "Xem tất cả nước ép theo mùa!", box: [772, 407, 355, 134], action: "order", placement: "below" },
  { id: "clerk", name: "Nhân viên dễ thương", hint: "Nhấn vào nhân viên để gọi món nhé!", box: [653, 572, 170, 150], action: "order" },
  { id: "fruits", name: "Quầy trái cây", hint: "Trái cây tươi vừa về quầy!", box: [827, 620, 135, 100], action: "order" },
  { id: "cooler", name: "Tủ nước ép", hint: "Nước ép mát lành đang chờ bạn!", box: [961, 650, 119, 250], action: "order", placement: "left" },
  { id: "seats", name: "Bàn ghế bên trái", hint: "Ngồi uống nước dưới tán cây nhé!", box: [579, 867, 225, 176], action: "seats" },
  { id: "seatsRight", name: "Bàn bên phải", hint: "Một góc ngồi ngắm khu vườn!", box: [1246, 849, 190, 146], action: "seats" },
  { id: "tree", name: "Tán cây xanh", hint: "Hít thở không khí trong lành!", box: [263, 150, 320, 218], action: "garden", placement: "below" },
  { id: "parasol", name: "Dù che nắng", hint: "Nhấn để ngắm không gian bên ngoài!", box: [1350, 550, 264, 135], action: "seats", placement: "left" },
  { id: "dog", name: "Chú chó nhỏ", hint: "Gâu gâu! Chào bạn!", box: [378, 935, 197, 96], action: "dog" },
  { id: "cat", name: "Chú mèo", hint: "Meo meo! Mình thích nắng sớm!", box: [1399, 813, 153, 98], action: "cat", placement: "left" },
];
export const HOTSPOTS: Hotspot[] = ART_HOTSPOTS.map(({ box: [x, y, w, h], ...spot }) => ({
  ...spot, x: x / REF_W * 100, y: y / REF_H * 100,
  w: w / REF_W * 100, h: h / REF_H * 100,
}));

const STORY: Record<StoryAction, { icon: string; title: string; body: string }> = {
  intro: { icon: "✿", title: "Chào mừng tới Vườn É!", body: "Một cửa hàng nước ép tự nhiên rộng khoảng 30 m², mặt tiền 6 m, nhiều cây xanh và một quầy nhận đơn xinh xắn. Mời bạn chọn món và ngồi thư giãn ở hiên nhé!" },
  seats: { icon: "☀", title: "Góc hiên mát lành", body: "Những bộ bàn ghế gỗ nằm ngay trước cửa hàng để bạn tận hưởng một ly nước ép và ngắm phố dưới tán lá xanh." },
  garden: { icon: "❀", title: "Khu vườn của Vườn É", body: "Hoa lá, giỏ cây treo và ánh sáng ấm áp tạo nên một góc thư giãn dịu dàng giữa phố." },
  dog: { icon: "♡", title: "Bạn cún đáng yêu", body: "Gâu gâu! Chú cún đang nghỉ ngơi ở sân trước, và rất vui khi có bạn ghé chơi." },
  cat: { icon: "♡", title: "Bạn mèo lười", body: "Meo! Chú mèo đang nằm tận hưởng nắng sớm bên bộ bàn ghế gỗ." },
};

/** One URL for the scene, ordering, basket and checkout. */
export function IllustratedShop() {
  const [artLoaded, setArtLoaded] = useState(false);
  const [active, setActive] = useState<Key | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [story, setStory] = useState<StoryAction | null>(null);
  const [coarsePointer, setCoarsePointer] = useState(false);
  const [dogHappy, setDogHappy] = useState(false);
  const [catHappy, setCatHappy] = useState(false);
  const trigger = useRef<HTMLButtonElement | null>(null);
  const viewport = useRef<HTMLDivElement | null>(null);
  const closeStoryButton = useRef<HTMLButtonElement | null>(null);
  const { count } = useCart();

  const artSrc = `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/art/vuon-e-approved-clean.webp`;
  const spots = artLoaded ? HOTSPOTS : LEGACY_HOTSPOTS;

  useEffect(() => {
    const media = window.matchMedia("(hover: none)");
    const update = () => setCoarsePointer(media.matches);
    update();
    media.addEventListener?.("change", update);
    return () => media.removeEventListener?.("change", update);
  }, []);
  useEffect(() => {
    const el = viewport.current;
    if (el && window.innerWidth < 760) {
      // Focus the counter on portrait screens; the stage and its hotspots scroll together.
      el.scrollLeft = Math.max(0, (el.scrollWidth - el.clientWidth) / 2);
    }
  }, [artLoaded]);
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previous; };
  }, []);
  useEffect(() => { if (story) closeStoryButton.current?.focus(); }, [story]);

  const closeStory = () => { setStory(null); trigger.current?.focus(); };
  useEffect(() => {
    if (!story) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { e.preventDefault(); closeStory(); }
      if (e.key !== "Tab") return;
      const area = document.getElementById("ve2d-story");
      const nodes = Array.from(area?.querySelectorAll<HTMLButtonElement>("button:not([disabled])") ?? []);
      if (!nodes.length) return;
      if (e.shiftKey && document.activeElement === nodes[0]) { e.preventDefault(); nodes[nodes.length - 1].focus(); }
      else if (!e.shiftKey && document.activeElement === nodes[nodes.length - 1]) { e.preventDefault(); nodes[0].focus(); }
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [story]);

  function interact(spot: Hotspot) {
    setActive(null);
    if (spot.action === "order") { setStory(null); setMenuOpen(true); }
    else {
      setStory(spot.action);
      if (spot.action === "dog") setDogHappy(true);
      if (spot.action === "cat") setCatHappy(true);
    }
  }

  return <div className="ve2d-root" aria-label="Vườn É: cửa hàng nước ép minh hoạ 2D" data-approved-art={artLoaded}>
    <div className="ve2d-viewport" ref={viewport}>
      <div className="ve2d-stage" data-approved-art={artLoaded}>
        {/* The SVG remains a usable fallback until the approved cleaned image is shipped. */}
        {!artLoaded && <ShopIllustration />}
        <img
          className="ve2d-approved-art" src={artSrc} width={REF_W} height={REF_H}
          alt="" aria-hidden="true" decoding="async" draggable={false}
          data-visible={artLoaded}
          onLoad={() => { setArtLoaded(true); setActive(null); }}
          onError={() => setArtLoaded(false)}
        />
        {spots.map(spot => <button
          key={spot.id} type="button" className="ve2d-hotspot"
          data-target={spot.id} data-visible={active === spot.id}
          data-placement={spot.placement ?? "above"}
          style={{ left: spot.x + "%", top: spot.y + "%", width: spot.w + "%", height: spot.h + "%" }}
          aria-label={spot.name + ". " + spot.hint}
          aria-describedby={"ve2d-cloud-" + spot.id}
          onPointerEnter={e => { if (e.pointerType !== "touch") setActive(spot.id); }}
          onPointerLeave={e => { if (e.pointerType !== "touch") setActive(v => v === spot.id ? null : v); }}
          onFocus={e => { if (e.currentTarget.matches(":focus-visible")) setActive(spot.id); }}
          onBlur={() => setActive(v => v === spot.id ? null : v)}
          onClick={e => {
            if (coarsePointer && e.detail !== 0 && active !== spot.id) { setActive(spot.id); return; }
            trigger.current = e.currentTarget;
            interact(spot);
          }}>
          <span className="ve2d-dot" aria-hidden="true">✦</span>
          <span id={"ve2d-cloud-" + spot.id} className="ve2d-cloud" role="tooltip" aria-hidden={active !== spot.id}>
            <strong>{spot.name}</strong><span>{spot.hint}</span>
            <small>{coarsePointer ? "Chạm lần nữa để mở" : "Nhấp để khám phá"} ↗</small>
          </span>
        </button>)}
        {dogHappy && <span className="ve2d-dog-heart" aria-hidden="true">♡</span>}
        {catHappy && artLoaded && <span className="ve2d-cat-heart" aria-hidden="true">♡</span>}
        {artLoaded && <div className="ve2d-ambient" aria-hidden="true"><span className="ve2d-light" /><span className="ve2d-leaf" /></div>}
      </div>
    </div>
    <header className="ve2d-header">
      {!artLoaded && <span>✿ <strong>VƯỜN É</strong> <small>nước ép tự nhiên</small></span>}
      <button type="button" className="ve2d-cart" onClick={e => { trigger.current = e.currentTarget; setStory(null); setMenuOpen(true); }}>
        🛒 Giỏ hàng <strong>{count}</strong>
      </button>
    </header>
    {!artLoaded && <p className="ve2d-instruction">✦ Rê chuột vào vật phẩm để xem gợi ý · Nhấp để tương tác</p>}
    {coarsePointer && <p className="ve2d-touch-guide">Vuốt ngang để khám phá · Chạm 1 lần để xem hướng dẫn, 2 lần để mở</p>}
    {story && <div className="ve2d-story-shade" onPointerDown={e => { if (e.target === e.currentTarget) closeStory(); }}>
      <section id="ve2d-story" className="ve2d-story" role="dialog" aria-modal="true" aria-labelledby="ve2d-story-title">
        <span className="ve2d-story-icon" aria-hidden="true">{STORY[story].icon}</span>
        <button type="button" ref={closeStoryButton} className="ve2d-story-close" onClick={closeStory} aria-label="Đóng">✕</button>
        <h2 id="ve2d-story-title">{STORY[story].title}</h2>
        <p>{STORY[story].body}</p>
        <button type="button" className="ve2d-story-order" onClick={() => { setStory(null); setMenuOpen(true); }}>
          Xem thực đơn nước ép ↗
        </button>
      </section>
    </div>}
    {menuOpen && <ShopMenu2D onClose={() => { setMenuOpen(false); trigger.current?.focus(); }} />}
  </div>;
}
