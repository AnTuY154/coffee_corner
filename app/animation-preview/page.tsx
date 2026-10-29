"use client";

import { useEffect, useMemo, useState } from "react";
import { FRAME_FPS, FRAME_SEQUENCES, framePath, type CharacterId } from "@/components/2d-shop/animation-frames";

type Installed = Partial<Record<CharacterId, Record<string, number>>>;

/** Standalone diagnostic page — never replaces the approved storefront. */
export default function AnimationPreviewPage() {
  const [actor, setActor] = useState<CharacterId>("employee");
  const [action, setAction] = useState<string>("run");
  const [fps, setFps] = useState(12);
  const [paused, setPaused] = useState(false);
  const [mirror, setMirror] = useState(false);
  const [frame, setFrame] = useState(0);
  const [installed, setInstalled] = useState<Installed>({});
  const [loadError, setLoadError] = useState(false);
  const artBase = `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/art`;
  const actions = useMemo(() => Object.keys(FRAME_SEQUENCES[actor]), [actor]);
  const count = (FRAME_SEQUENCES[actor] as Record<string, number>)[action] ?? 0;
  const available = installed[actor]?.[action] === count && count > 0;

  useEffect(() => {
    let cancelled = false;
    fetch(`${artBase}/manifest.json`, { cache: "no-store" })
      .then(response => response.ok ? response.json() : {})
      .then((data: { approved?: Installed }) => { if (!cancelled) setInstalled(data.approved ?? {}); })
      .catch(() => { if (!cancelled) setInstalled({}); });
    return () => { cancelled = true; };
  }, [artBase]);

  useEffect(() => {
    if (!available || paused) return;
    const timer = window.setInterval(() => setFrame(old => (old + 1) % count), 1000 / fps);
    return () => window.clearInterval(timer);
  }, [available, paused, count, fps]);

  useEffect(() => { setLoadError(false); }, [actor, action, frame]);

  const selectActor = (value: CharacterId) => {
    setActor(value);
    setAction(Object.keys(FRAME_SEQUENCES[value])[0]);
    setFrame(0);
    setLoadError(false);
  };
  const selectAction = (value: string) => { setAction(value); setFrame(0); setLoadError(false); };
  const src = available && !loadError
    ? framePath(artBase, actor, action, frame % count)
    : `${artBase}/canonical/${actor === "employee" ? "employee" : actor}.webp`;

  return <main style={{ margin: "24px auto", maxWidth: 840, padding: 24, fontFamily: "sans-serif" }}>
    <h1>Vườn É — kiểm tra frame animation</h1>
    <p>Kiểm tra ảnh đã cài đặt. Các ảnh thiếu hoặc không đạt chuẩn sẽ không được tự động kích hoạt trong cửa hàng.</p>
    <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 24 }}>
      <label>Nhân vật{" "}<select value={actor} onChange={e => selectActor(e.target.value as CharacterId)}>
        <option value="employee">Cô gái</option><option value="dog">Chó</option><option value="cat">Mèo</option>
      </select></label>
      <label>Động tác{" "}<select value={action} onChange={e => selectAction(e.target.value)}>
        {actions.map(value => <option key={value} value={value}>{value}</option>)}
      </select></label>
      <label>FPS{" "}<input aria-label="FPS" type="range" min={1} max={24} value={fps}
        onChange={e => setFps(Number(e.target.value))} /> {fps}</label>
      <label><input type="checkbox" checked={paused} onChange={e => setPaused(e.target.checked)} /> Dừng</label>
      <label><input type="checkbox" checked={mirror} onChange={e => setMirror(e.target.checked)} /> Đổi hướng</label>
    </div>
    <div style={{ height: 320, display: "grid", placeItems: "end center", background: "#eaf3e4", borderRadius: 16 }}>
      {/* Uses a normal img on purpose: the diagnostic viewer must work without WebGL. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={`${actor} / ${action} / frame ${frame + 1}`}
        onError={() => setLoadError(true)}
        style={{ height: 285, width: 240, objectFit: "contain", transform: mirror ? "scaleX(-1)" : undefined }} />
    </div>
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 16, padding: 16 }}>
      <button onClick={() => { setPaused(true); setFrame(old => (old + count - 1) % Math.max(1, count)); }}>Trước</button>
      <strong>{frame + 1} / {count}</strong>
      <button onClick={() => { setPaused(true); setFrame(old => (old + 1) % Math.max(1, count)); }}>Sau</button>
    </div>
    <p role="status">{!available
      ? "Chưa có đủ frame đã được duyệt trong public/art/manifest.json — đang dùng hình gốc."
      : loadError ? "Không tải được frame này — hãy kiểm tra đường dẫn asset."
      : `Đang xem ${actor}/${action} · ${fps} FPS`}</p>
    <small>FPS tham khảo: {(FRAME_FPS[actor] as Record<string, number>)[action] ?? 8}. Trang này chỉ dùng để nghiệm thu, không thay đổi UI cửa hàng.</small>
  </main>;
}
