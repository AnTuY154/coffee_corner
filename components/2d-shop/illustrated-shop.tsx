"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useCart } from "@/components/cart-context";
import { ShopMenu2D } from "@/components/3d-shop/shop-menu-2d";
import { PetsWorld, type PetPositions, type VisitRequest } from "./pets-world";
import type { CSSProperties } from "react";
import "./illustrated-shop.css";

type Action = "order" | "intro" | "seats" | "garden" | "dog" | "cat";
type Key = "sign" | "clerk" | "menu" | "fruits" | "cooler" | "seats" | "seatsRight" | "tree" | "parasol" | "dog" | "cat" | "categories"
  | "juiceBoard" | "smoothieBoard" | "freshFruitBoard" | "snackBoard";
type Hotspot = {
  id: Key; name: string; hint: string;
  x: number; y: number; w: number; h: number;
  action: Action; placement?: "above" | "below" | "left" | "right";
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
  { id: "sign", name: "Vườn É", hint: "Chào bạn! Khám phá câu chuyện Vườn É nhé!", box: [582, 90, 561, 176], action: "intro", placement: "below" },
  // The four diagonal wooden boards are four separate objects, NOT one large
  // categories rectangle. Pixel bounds measured on immutable shop.webp
  // 1672×941. Each polygon's top/bottom tracks the slanted painted wood.
  { id: "juiceBoard", name: "Nước Ép", hint: "Nước ép trái cây tươi, chọn món yêu thích nhé!", box: [45, 339, 199, 94], action: "order" },
  { id: "smoothieBoard", name: "Sinh Tố", hint: "Sinh tố thơm mịn đang chờ bạn!", box: [38, 410, 204, 90], action: "order" },
  { id: "freshFruitBoard", name: "Trái Cây Tươi", hint: "Khám phá trái cây tươi mỗi ngày!", box: [32, 480, 214, 90], action: "order" },
  { id: "snackBoard", name: "Đồ Ăn Nhẹ", hint: "Chọn một món ăn nhẹ cùng ly nước nhé!", box: [26, 550, 221, 93], action: "order" },
  { id: "menu", name: "Bảng thực đơn", hint: "Xem tất cả nước ép theo mùa!", box: [654, 346, 382, 132], action: "order", placement: "right" },
  { id: "clerk", name: "Nhân viên dễ thương", hint: "Nhấn vào nhân viên để gọi món nhé!", box: [705, 524, 118, 132], action: "order" },
  { id: "fruits", name: "Quầy trái cây", hint: "Trái cây tươi vừa về quầy!", box: [809, 589, 165, 80], action: "order" },
  { id: "cooler", name: "Tủ nước ép", hint: "Nước ép mát lành đang chờ bạn!", box: [985, 541, 148, 251], action: "order", placement: "left" },
  { id: "seats", name: "Bàn ghế bên trái", hint: "Ngồi uống nước dưới tán cây nhé!", box: [487, 810, 345, 124], action: "seats" },
  { id: "seatsRight", name: "Bàn bên phải", hint: "Một góc ngồi ngắm khu vườn!", box: [1158, 795, 413, 143], action: "seats" },
  { id: "tree", name: "Tán cây xanh", hint: "Hít thở không khí trong lành!", box: [0, 0, 426, 310], action: "garden", placement: "below" },
  { id: "parasol", name: "Dù che nắng", hint: "Nhấn để ngắm không gian bên ngoài!", box: [1351, 487, 319, 154], action: "seats", placement: "left" },
  { id: "dog", name: "Chú chó nhỏ", hint: "Gâu gâu! Chào bạn!", box: [892, 807, 118, 110], action: "dog" },
  { id: "cat", name: "Chú mèo", hint: "Meo meo! Mình thích nắng sớm!", box: [1287, 769, 86, 84], action: "cat", placement: "left" },
];
// Approved art rectangles are [LEFT, TOP, WIDTH, HEIGHT] in pixel units.
// CSS hotspots are centered by translate(-50%, -50%), so the CSS left/top
// MUST point to the rectangle's CENTER, never its top-left corner.
export const WOODEN_BOARD_IDS: ReadonlySet<Key> = new Set([
  "juiceBoard", "smoothieBoard", "freshFruitBoard", "snackBoard",
]);

export const HOTSPOTS: Hotspot[] = ART_HOTSPOTS.map(({ box: [x, y, w, h], ...spot }) => ({
  ...spot,
  x: (x + w / 2) / REF_W * 100,
  y: (y + h / 2) / REF_H * 100,
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
  const [petPositions, setPetPositions] = useState<PetPositions>({ dog: { x: 951, y: 862 }, cat: { x: 1330, y: 811 }, clerk: { x: 764, y: 587 } });
  const [visitRequest, setVisitRequest] = useState<VisitRequest>(null);
  const [active, setActive] = useState<Key | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 24, y: 24 });
  const [hotspotDebug, setHotspotDebug] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [openBasket, setOpenBasket] = useState(false);
  const [story, setStory] = useState<StoryAction | null>(null);
  const [coarsePointer, setCoarsePointer] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const audioContext = useRef<AudioContext | null>(null);
  const trigger = useRef<HTMLButtonElement | null>(null);
  const compositionImage = useRef<HTMLImageElement | null>(null);
  const viewport = useRef<HTMLDivElement | null>(null);
  const closeStoryButton = useRef<HTMLButtonElement | null>(null);
  const { count } = useCart();

  // Tooltip is an independent viewport overlay. Nesting it in a moving
  // hotspot previously pinned it to the far edge of a large hit rectangle
  // and clipped it against the 16:9 stage overflow.
  const placeTooltip = useCallback((clientX: number, clientY: number) => {
    const estimatedWidth = Math.min(230, window.innerWidth - 24);
    const estimatedHeight = 125;
    const above = clientY > estimatedHeight + 30;
    const desiredX = clientX + 18;
    const desiredY = above ? clientY - estimatedHeight - 16 : clientY + 18;
    setTooltipPosition({
      x: Math.max(12, Math.min(desiredX, window.innerWidth - estimatedWidth - 12)),
      y: Math.max(10, Math.min(desiredY, window.innerHeight - estimatedHeight - 12)),
    });
  }, []);
  const placeTooltipAtElement = useCallback((
    element: HTMLElement, preferred: "above" | "below" | "left" | "right" = "above",
  ) => {
    // An anchored cloud must be positioned from the ACTUAL element rectangle
    // (already scaled with the 1672×941 stage), not pointer coordinates.
    // Old behaviour made the "Bảng thực đơn" cloud drift over the
    // shop. Place it beside the menu cards without covering the employee.
    const bounds = element.getBoundingClientRect();
    const width = Math.min(230, window.innerWidth - 24);
    // 130px accommodates the largest Vietnamese hint and extra padding.
    const height = 130, gap = 14, margin = 12;
    const clamp = (n: number, min: number, max: number) =>
      Math.max(min, Math.min(n, Math.max(min, max)));
    const centeredX = bounds.left + (bounds.width - width) / 2;
    const centeredY = bounds.top + (bounds.height - height) / 2;
    let x = centeredX, y = centeredY;
    if (preferred === "below") {
      y = bounds.bottom + gap;
      // If the item touches the bottom of the viewport, place above instead.
      if (y + height > window.innerHeight - margin) y = bounds.top - height - gap;
    } else if (preferred === "above") {
      y = bounds.top - height - gap;
      if (y < margin) y = bounds.bottom + gap;
    } else {
      const right = bounds.right + gap;
      const left = bounds.left - width - gap;
      if (preferred === "right") {
        x = right + width <= window.innerWidth - margin ? right : left;
      } else {
        x = left >= margin ? left : right;
      }
    }
    setTooltipPosition({
      x: clamp(x, margin, window.innerWidth - width - margin),
      y: clamp(y, margin, window.innerHeight - height - margin),
    });
  }, []);

  const getTooltipSide = useCallback((spot: Hotspot) =>
    WOODEN_BOARD_IDS.has(spot.id) ? "right" as const : (spot.placement ?? "above"),
  []);

  const artBase = `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/art`;
  const compositionSrc = `${artBase}/canonical/shop.webp`;
  const strippedSrc = compositionSrc;
  const spots = artLoaded ? HOTSPOTS : LEGACY_HOTSPOTS;
  const sceneReady = spritesReady && petsReady;
  const focusedSpot = spots.find(spot => spot.id === active);

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
  // Bark only when sound has been enabled by a user gesture.
  const playBark = useCallback(() => {
    const ctx = audioContext.current;
    if (!soundEnabled || !ctx || ctx.state !== "running" || document.hidden) return;
    const when = ctx.currentTime + .008;
    for (const offset of [0, .17]) {
      const start = when + offset;
      const voice = ctx.createOscillator();
      const rumble = ctx.createOscillator();
      const lowpass = ctx.createBiquadFilter();
      const envelope = ctx.createGain();
      voice.type = "sawtooth";
      rumble.type = "triangle";
      lowpass.type = "lowpass";
      lowpass.frequency.setValueAtTime(1150, start);
      lowpass.frequency.exponentialRampToValueAtTime(430, start + .15);
      voice.frequency.setValueAtTime(255, start);
      voice.frequency.exponentialRampToValueAtTime(120, start + .14);
      rumble.frequency.setValueAtTime(110, start);
      rumble.frequency.exponentialRampToValueAtTime(73, start + .14);
      envelope.gain.setValueAtTime(.0001, start);
      envelope.gain.exponentialRampToValueAtTime(.037, start + .025);
      envelope.gain.exponentialRampToValueAtTime(.0001, start + .16);
      voice.connect(lowpass);
      rumble.connect(lowpass);
      lowpass.connect(envelope);
      envelope.connect(ctx.destination);
      voice.start(start); rumble.start(start);
      voice.stop(start + .165); rumble.stop(start + .165);
    }
  }, [soundEnabled]);

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
    setHotspotDebug(new URLSearchParams(window.location.search).has("hotspot-debug"));
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
      if (spot.action === "dog") { setVisitRequest({ id: Date.now(), target: "dog" }); }
      if (spot.action === "cat") { setVisitRequest({ id: Date.now(), target: "cat" }); if (soundEnabled) playMeow(); }
    }
  }

  return <div className="ve2d-root" aria-label="Vườn É: cửa hàng nước ép minh hoạ 2D"
    data-approved-art={artLoaded} data-hotspot-debug={hotspotDebug}
    style={{ "--ve2d-backdrop": `url("${compositionSrc}")` } as CSSProperties}>
    <div className="ve2d-viewport" ref={viewport}>
      <div className="ve2d-stage" data-approved-art={artLoaded}>
        {/* Do not render the legacy SVG: it contains unapproved characters. */}
        {!artLoaded && <div className="ve2d-art-loading" role="status">Vườn É đang mở cửa...</div>}
        <img
          ref={compositionImage}
          className="ve2d-approved-art" src={sceneReady ? strippedSrc : compositionSrc} width={REF_W} height={REF_H}
          alt="" aria-hidden="true" decoding="async" draggable={false}
          data-visible={artLoaded}
          onLoad={() => { setArtLoaded(true); setActive(null); }}
          onError={() => { setArtLoaded(false); setSpritesReady(false); }}
        />
        {spritesReady && <PetsWorld artBase={artBase} visible={sceneReady} request={visitRequest}
          onReady={() => setPetsReady(true)} onMove={setPetPositions} onBark={playBark} />}
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
            width: (sceneReady && spot.id === "clerk" && petPositions.clerk.y > 625
              ? 116 / REF_W * 100 : spot.w) + "%",
            height: (sceneReady && spot.id === "clerk" && petPositions.clerk.y > 625
              ? 170 / REF_H * 100 : spot.h) + "%",
          }}
          aria-label={spot.name + ". " + spot.hint}
          aria-describedby={active === spot.id ? "ve2d-floating-tooltip" : undefined}
          onPointerEnter={e => {
            if (e.pointerType !== "touch") {
              setActive(spot.id);
              if (spot.id === "dog" || spot.id === "cat" || spot.id === "clerk") {
                placeTooltip(e.clientX, e.clientY);
              } else {
                // Static objects stay fixed; in particular, the central menu
                // tooltip stays to the RIGHT of the three hanging poster boards.
                placeTooltipAtElement(e.currentTarget, getTooltipSide(spot));
              }
            }
          }}
          onPointerMove={e => {
            if (e.pointerType !== "touch" && active === spot.id &&
              (spot.id === "dog" || spot.id === "cat" || spot.id === "clerk")) {
              placeTooltip(e.clientX, e.clientY);
            }
          }}
          onPointerLeave={e => {
            if (e.pointerType !== "touch") setActive(v => v === spot.id ? null : v);
          }}
          onFocus={e => {
            if (e.currentTarget.matches(":focus-visible")) {
              setActive(spot.id);
              placeTooltipAtElement(e.currentTarget, getTooltipSide(spot));
            }
          }}
          onBlur={() => setActive(v => v === spot.id ? null : v)}
          onClick={e => {
            // Moving animal hit regions should work on the FIRST touch.
            // Requiring two taps on a walking sprite makes the target move
            // away from the finger between taps, especially on small screens.
            const movingPet = spot.id === "dog" || spot.id === "cat";
            if (coarsePointer && !movingPet && e.detail !== 0 && active !== spot.id) {
              setActive(spot.id);
              placeTooltipAtElement(e.currentTarget, getTooltipSide(spot));
              return;
            }
            trigger.current = e.currentTarget;
            interact(spot);
          }}>
          <span className="ve2d-dot" aria-hidden="true">✦</span>
        </button>)}
        {artLoaded && <div className="ve2d-ambient" aria-hidden="true"><span className="ve2d-light" /><span className="ve2d-leaf" /></div>}
      </div>
    </div>
    {focusedSpot && !menuOpen && !story && <div
      id="ve2d-floating-tooltip" className="ve2d-cloud ve2d-floating-tooltip"
      data-tooltip-target={focusedSpot.id}
      role="tooltip" style={{ left: tooltipPosition.x, top: tooltipPosition.y }}>
      <strong>{focusedSpot.name}</strong>
      <span>{focusedSpot.hint}</span>
      <small>{coarsePointer && focusedSpot.id !== "dog" && focusedSpot.id !== "cat"
        ? "Chạm lần nữa để mở" : "Nhấp để khám phá"}</small>
    </div>}
    <header className="ve2d-header">
      {!artLoaded && <span>✿ <strong>VƯỜN É</strong> <small>nước ép tự nhiên</small></span>}
      {artLoaded && <span className="ve2d-wide-brand">✿ <strong>VƯỜN É</strong> <small>nước ép tự nhiên</small></span>}
      <div className="ve2d-controls">
        <button type="button" className="ve2d-sound" onClick={() => void toggleSound()} aria-pressed={soundEnabled} aria-label={soundEnabled ? "Tắt âm thanh thú cưng" : "Bật âm thanh thú cưng"} title={soundEnabled ? "Tắt âm thanh thú cưng" : "Bật âm thanh thú cưng"}>
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
