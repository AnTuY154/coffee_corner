# Vườn Ép — 3D Juice Bar

- Procedurally modelled, original 3D scene using `@react-three/fiber` v9, `three`, `@react-three/drei` v10, with no external asset downloads.
- First-person style controls: WASD/arrows, pointer drag to look, interaction `E` near counter; step-by-step auto-walk for mobile.
- Customer spawn: `x=0, z=9.4`; service counter access: `|x| <= 3.5, z <= 3.25`.
- Products are the same 24 items in `data/catalog.ts`; menu uses existing cart context and existing checkout.
- Route: `/3d-shop`. 2D `/menu` remains available as accessibility and low-performance fallback.
- Google Sheets order flow is unchanged. It requires real Google Apps Script deployment and secret configuration.
- `World` renders only on client, with webgl capability detection, capped DPR, reduced-motion support, no untrusted external 3D assets.
- Tests: `scripts/test-3d-shop.mjs` validates movement, proximity and critical 3D integration invariants.
- Planned asset upgrade: replace primitive geometry with optimised glTF/GLB Blender artwork (separate licensed assets). Keep collision and interaction semantics.
