"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useCart } from "@/components/cart-context";
import { ShopMenu2D } from "@/components/3d-shop/shop-menu-2d";
import { ShopIllustration } from "./shop-illustration";
import { PetsWorld, type PetPositions, type VisitRequest } from "./pets-world";
import type { CSSProperties } from "react";
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
 * Pixel-perfect coordinate system: canonical character-free background 1672×941.
 * Hit areas intentionally stop short of neighbouring interactable objects.
 * The shop and all actor meshes share an un-cropped 16:9 coordinate system.
 */
const REF_W = 1672, REF_H = 941;
type PixelHotspot = Omit<Hotspot, "x" | "y" | "w" | "h"> & { box: readonly [number, number, number, number] };
const ART_HOTSPOTS: PixelHotspot[] = [
  { id: "sign", name: "Vườn É", hint: "Chào bạn! Khám phá câu chuyện Vườn É nhé!", box: [600, 95, 572, 166], action: "intro", placement: "below" },
  { id: "categories", name: "Các loại nước ép", hint: "Chọn danh mục nước ép, sinh tố và trái cây!", box: [33, 332, 225, 314], action: "order", placement: "left" },
  { id: "menu", name: "Bảng thực đơn", hint: "Xem tất cả nước ép theo mùa!", box: [647, 340, 406, 137], action: "order", placement: "below" },
  { id: "clerk", name: "Nhân viên dễ thương", hint: "Nhấn vào nhân viên để gọi món nhé!", box: [698, 522, 148, 148], action: "order" },
  { id: "fruits", name: "Quầy trái cây", hint: "Trái cây tươi vừa về quầy!", box: [775, 565, 149, 98], action: "order" },
  { id: "cooler", name: "Tủ nước ép", hint: "Nước ép mát lành đang chờ bạn!", box: [990, 551, 130, 230], action: "order", placement: "left" },
  { id: "seats", name: "Bàn ghế bên trái", hint: "Ngồi uống nước dưới tán cây nhé!", box: [480, 794, 345, 138], action: "seats" },
  { id: "seatsRight", name: "Bàn bên phải", hint: "Một góc ngồi ngắm khu vườn!", box: [1177, 790, 374, 139], action: "seats" },
  { id: "tree", name: "Tán cây xanh", hint: "Hít thở không khí trong lành!", box: [0, 1, 434, 253], action: "garden", placement: "below" },
  { id: "parasol", name: "Dù che nắng", hint: "Nhấn để ngắm không gian bên ngoài!", box: [1370, 472, 290, 158], action: "seats", placement: "left" },
  { id: "dog", name: "Chú chó nhỏ", hint: "Gâu gâu! Chào bạn!", box: [358, 814, 138, 115], action: "dog" },
  { id: "cat", name: "Chú mèo", hint: "Meo meo! Mình thích nắng sớm!", box: [1365, 812, 144, 125], action: "cat", placement: "left" },
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
  const [spritesReady, setSpritesReady] = useState(false);
  const [petsReady, setPetsReady] = useState(false);
  const [petPositions, setPetPositions] = useState<PetPositions>({ dog: { x: 415, y: 815 }, cat: { x: 1420, y: 826 }, clerk: { x: 764, y: 567 } });
  const [visitRequest, setVisitRequest] = useState<VisitRequest>(null);
  const [active, setActive] = useState<Key | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [openBasket, setOpenBasket] = useState(false);
  const [story, setStory] = useState<StoryAction | null>(null);
  const [coarsePointer, setCoarsePointer] = useState(false);
  const [dogHappy, setDogHappy] = useState(false);
  const [catHappy, setCatHappy] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const audioContext = useRef<AudioContext | null>(null);
  const trigger = useRef<HTMLButtonElement | null>(null);
  const compositionImage = useRef<HTMLImageElement | null>(null);
  const viewport = useRef<HTMLDivElement | null>(null);
  const closeStoryButton = useRef<HTMLButtonElement | null>(null);
  const { count } = useCart();

  const artBase = `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/art`;
  const compositionSrc = `${artBase}/canonical/shop.webp`;
  const strippedSrc = compositionSrc;
  const spots = artLoaded ? HOTSPOTS : LEGACY_HOTSPOTS;
  const sceneReady = spritesReady && petsReady;

  // Two soft pitch glides approximate a small "meo meo". No audio is played
  // until a real user gesture explicitly enables sound (browser autoplay policy).
  const playMeow = useCallback(() => {
    const ctx = audioContext.current;
    if (!ctx || ctx.state !== "running" || document.hidden) return;
    const start = ctx.currentTime + .015;
    [0, .38].forEach((delay, index) => {
      const when = start + delay;
      const wave = ctx.createOscillator();
      const warmth = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      const volume = ctx.createGain();
      wave.type = "triangle";
      warmth.type = "sine";
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(1500, when);
      filter.frequency.exponentialRampToValueAtTime(760, when + .31);
      wave.frequency.setValueAtTime(index ? 550 : 640, when);
      wave.frequency.exponentialRampToValueAtTime(index ? 810 : 930, when + .11);
      wave.frequency.exponentialRampToValueAtTime(385, when + .31);
      warmth.frequency.setValueAtTime(1150, when);
      warmth.frequency.exponentialRampToValueAtTime(680, when + .30);
      volume.gain.setValueAtTime(0.0001, when);
      volume.gain.exponentialRampToValueAtTime(.055, when + .045);
      volume.gain.exponentialRampToValueAtTime(.0001, when + .32);
      wave.connect(filter);
      warmth.connect(filter);
      filter.connect(volume);
      volume.connect(ctx.destination);
      wave.start(when);
      warmth.start(when);
      wave.stop(when + .34);
      warmth.stop(when + .34);
    });
  }, []);
  const toggleSound = useCallback(async () => {
    if (soundEnabled) { setSoundEnabled(false); await audioContext.current?.suspend(); return; }
    try {
      const AudioCtor = window.AudioContext;
      if (!AudioCtor) return;
      const ctx = audioContext.current ?? new AudioCtor();
      audioContext.current = ctx;
      await ctx.resume();
      setSoundEnabled(true);
    } catch {
      setSoundEnabled(false);
    }
  }, [soundEnabled]);
  useEffect(() => {
    if (!soundEnabled) return;
    let timer: ReturnType<typeof setTimeout>;
    const schedule = () => {
      timer = setTimeout(() => { playMeow(); schedule(); }, 13000 + Math.random() * 14000);
    };
    schedule();
    return () => clearTimeout(timer);
  }, [soundEnabled, playMeow]);
  useEffect(() => () => { void audioContext.current?.close(); audioContext.current = null; }, []);

  useEffect(() => {
    // Load exactly the four canonical source images; no baked-in character is ever displayed.
    if (!artLoaded) return;
    let cancelled = false;
    const preload = (url: string) => new Promise<void>((resolve, reject) => {
      const image = new window.Image();
      image.onload = () => resolve();
      image.onerror = () => reject(new Error(`Could not load ${url}`));
      image.src = url;
    });
    Promise.all([
      preload(strippedSrc),
      preload(`${artBase}/canonical/employee.webp`),
      preload(`${artBase}/canonical/dog.webp`),
      preload(`${artBase}/canonical/cat.webp`),
    ]).then(() => { if (!cancelled) setSpritesReady(true); })
      .catch(() => { if (!cancelled) setSpritesReady(false); });
    return () => { cancelled = true; };
  }, [artLoaded, artBase, strippedSrc]);

  useEffect(() => {
    // The browser may load a server-rendered <img> before React hydration
    // attaches onLoad. Check the already-decoded image on mount as well.
    const image = compositionImage.current;
    if (image?.complete && image.naturalWidth === REF_W && image.naturalHeight === REF_H) {
      setArtLoaded(true);
    }
  }, []);

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
    if (spot.action === "order") { setStory(null); setOpenBasket(false); setMenuOpen(true); }
    else {
      setStory(spot.action);
      if (spot.action === "dog") { setDogHappy(true); setVisitRequest({ id: Date.now(), target: "dog" }); }
      if (spot.action === "cat") { setCatHappy(true); setVisitRequest({ id: Date.now(), target: "cat" }); if (soundEnabled) playMeow(); }
    }
  }

  return <div className="ve2d-root" aria-label="Vườn É: cửa hàng nước ép minh hoạ 2D"
    data-approved-art={artLoaded}
    style={{ "--ve2d-backdrop": `url("${compositionSrc}")` } as CSSProperties}>
    <div className="ve2d-viewport" ref={viewport}>
      <div className="ve2d-stage" data-approved-art={artLoaded}>
        {/* The SVG remains a usable fallback until the approved cleaned image is shipped. */}
        {!artLoaded && <ShopIllustration />}
        <img
          ref={compositionImage}
          className="ve2d-approved-art" src={sceneReady ? strippedSrc : compositionSrc} width={REF_W} height={REF_H}
          alt="" aria-hidden="true" decoding="async" draggable={false}
          data-visible={artLoaded}
          onLoad={() => { setArtLoaded(true); setActive(null); }}
          onError={() => { setArtLoaded(false); setSpritesReady(false); }}
        />
        {spritesReady && <PetsWorld artBase={artBase} visible={sceneReady} request={visitRequest}
          onReady={() => setPetsReady(true)} onMove={setPetPositions} />}
        {sceneReady && soundEnabled && <span className="ve2d-meow-mark" aria-hidden="true" style={{
          left: (petPositions.cat.x / REF_W * 100) + "%",
          top: (petPositions.cat.y / REF_H * 100 - 10) + "%",
        }}>♪</span>}
        {spots.map(spot => <button
          key={spot.id} type="button" className="ve2d-hotspot"
          data-target={spot.id} data-visible={active === spot.id}
          data-placement={spot.placement ?? "above"}
          style={{
            left: (artLoaded && (spot.id === "dog" || spot.id === "cat" || spot.id === "clerk")
              ? (petPositions[spot.id].x / REF_W * 100) : spot.x) + "%",
            top: (artLoaded && (spot.id === "dog" || spot.id === "cat" || spot.id === "clerk")
              ? (petPositions[spot.id].y / REF_H * 100) : spot.y) + "%",
            width: spot.w + "%", height: spot.h + "%",
          }}
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
        {dogHappy && <span className="ve2d-dog-heart" style={artLoaded ? {
          left: (petPositions.dog.x / REF_W * 100) + "%",
          top: (petPositions.dog.y / REF_H * 100 - 9) + "%",
        } : undefined} aria-hidden="true">♡</span>}
        {catHappy && artLoaded && <span className="ve2d-cat-heart" style={{
          left: (petPositions.cat.x / REF_W * 100) + "%",
          top: (petPositions.cat.y / REF_H * 100 - 10) + "%",
        }} aria-hidden="true">♡</span>}
        {artLoaded && <div className="ve2d-ambient" aria-hidden="true"><span className="ve2d-light" /><span className="ve2d-leaf" /></div>}
      </div>
    </div>
    <header className="ve2d-header">
      {!artLoaded && <span>✿ <strong>VƯỜN É</strong> <small>nước ép tự nhiên</small></span>}
      {artLoaded && <span className="ve2d-wide-brand">✿ <strong>VƯỜN É</strong> <small>nước ép tự nhiên</small></span>}
      <div className="ve2d-controls">
        <button type="button" className="ve2d-sound" onClick={() => void toggleSound()} aria-pressed={soundEnabled} aria-label={soundEnabled ? "Tắt tiếng mèo" : "Bật tiếng mèo"} title={soundEnabled ? "Tắt tiếng mèo" : "Bật tiếng mèo"}>
          {soundEnabled ? "🔊" : "🔇"}
        </button>
      <button type="button" className="ve2d-cart" onClick={e => { trigger.current = e.currentTarget; setStory(null); setOpenBasket(true); setMenuOpen(true); }}>
        🛒 Giỏ hàng <strong>{count}</strong>
      </button></div>
    </header>
    {!artLoaded && <p className="ve2d-instruction">✦ Rê chuột vào vật phẩm để xem gợi ý · Nhấp để tương tác</p>}
    {coarsePointer && <p className="ve2d-touch-guide">Vuốt ngang để khám phá · Chạm 1 lần để xem hướng dẫn, 2 lần để mở</p>}
    {story && <div className="ve2d-story-shade" onPointerDown={e => { if (e.target === e.currentTarget) closeStory(); }}>
      <section id="ve2d-story" className="ve2d-story" role="dialog" aria-modal="true" aria-labelledby="ve2d-story-title">
        <span className="ve2d-story-icon" aria-hidden="true">{STORY[story].icon}</span>
        <button type="button" ref={closeStoryButton} className="ve2d-story-close" onClick={closeStory} aria-label="Đóng">✕</button>
        <h2 id="ve2d-story-title">{STORY[story].title}</h2>
        <p>{STORY[story].body}</p>
        <button type="button" className="ve2d-story-order" onClick={() => { setStory(null); setOpenBasket(false); setMenuOpen(true); }}>
          Xem thực đơn nước ép ↗
        </button>
      </section>
    </div>}
    {menuOpen && <ShopMenu2D initialView={openBasket ? "cart" : "browse"} onClose={() => { setMenuOpen(false); trigger.current?.focus(); }} />}
  </div>;
}
