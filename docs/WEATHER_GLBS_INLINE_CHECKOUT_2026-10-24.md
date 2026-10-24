# Vườn Ép — in-scene checkout, GLB nature and simulated weather
Date: 2026-10-24. Base: `18d7426ec12bb5e3192f9c89f77cd6d29c3681a5`.

## Changed in source code
- Do **not** navigate to `/thanh-toan` from the 3D shop. The single `ShopMenu2D` modal now switches from browse/cart to a fully working checkout, then order confirmation, without replacing the Canvas or changing the URL.
- Production checkout still uses `POST /api/orders` with the same `requestId`, `items`, customer fields, honeypot, payment method and strict server validation. Only display success after the API returns `{ok:true,orderId}`. Retain the request ID for retries and do not clear the basket on an error. The checkout UI collects no card credentials and makes no payment.
- GitHub Pages static demo explicitly blocks personal information collection and live ordering; no fabricated confirmation.
- Simulated weather cycles `sunny → overcast → windy → rainy` every 45 seconds, pausing automatic changes for reduced-motion clients. Sky, visible sun disc, cloud mass, fog, main light, environment fill, particles and foliage winds change. Weather is a **game simulation** and is not a realtime forecast.
- `RainParticles` uses a **single Three.js Points draw call**, with lower count on mobile. Weather-dependent lighting has a single shadow-producing directional light on desktop and no expensive shadows on low-power hardware.
- Replace the four major placeholder icosahedron trees with local Quaternius **Stylized Nature MegaKit** GLB trees; add three GLB shrubs. Proper cloned instances, bounding-box scale normalisation, wind sway and React Suspense error fallback. Source: https://github.com/anshaneja5/skyline-run; pack https://quaternius.com/packs/stylizednaturemegakit.html, CC0 licence included at `public/models/QUATERNIUS-SCENERY-LICENSE.txt`. Original source credits: https://github.com/anshaneja5/skyline-run/blob/main/CREDITS.md.
- Barista remains the **original animated upright custom cat**, with upgraded rounded ears, sculpted PBR micro-fur texture on actual 3D surfaces, softer cheeks, smooth green apron and head motion. No four-legged cat asset was misrepresented as a rigged biped barista. A custom Blender-authored rigged GLB remains the aesthetic improvement opportunity.

## Three serial review loops (source-based, not live browser runs)

### Pass 1 — Game UX reviewer / commerce engineer / QA
- Problem: checkout routed to a different URL, discarded immersive context.
- Fix: in-modal checkout and verified success; return to the same live Canvas. Demo safety block. Reuse existing order API.
- Verification: static tests assert `router.push` absent from immersive shop, modal invokes inline checkout, API is called in non-demo, demo never shows a form, orderID/clear on success only. Real-browser form workflow not yet confirmed.

### Pass 2 — Environment reviewer / 3D engineer / QA
- Problem: world static and green with no visible sun, rain or clouds reacting to weather.
- Fix: four state machine modes, sun/sky/fog/lighting shifts, cloud movement, low-cost Points rain, stronger windy foliage animation.
- Verification: deterministic weather sequence/values, scene source tests, desktop/mobile construction variants, unchanged collision/camera. Real-device FPS unmeasured.

### Pass 3 — Art reviewer / asset engineer / QA
- Problem: environment still has low-poly placeholder tree crowns and the cat body was too flat.
- Fix: legally bundled CC0 nature GLBs with fallbacks and wind, upgraded material and silhouette for original two-legged cat.
- Verification: checks parse three asset GLB signatures and sizes, preserve gameplay/commerce/cat animation, TS and production/static CI required before merge. Does **not** claim photorealistic cat or a new rig.

## Acceptance
No fake 2D backdrop for the world; one live WebGL Canvas remains mounted behind the commerce modal. Keep all 24 products, 4 seasons, basket and server-side order validation. Merge only after CI and static export pass. GitHub Pages external configuration 404 must not be called a successful deployment.
