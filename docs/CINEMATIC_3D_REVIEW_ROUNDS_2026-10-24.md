# Vườn Ép — cinematic world review rounds (2026-10-24)

Base: `main` at `1b12f7d14d3e20a5e7455f745c80cdfcc64c9063`.

## Review protocol and evidence

Three **sequential role-based code-review passes**, not independent agents or live browser-user tests. Each role's observations are tied to inspected source. The engineering changes below were actually committed to `feature/cinematic-characters-camera-mobile-v2`. Automated build verification is provided by the linked PR GitHub Actions runs (not this document until those runs complete). Source assertions are not evidence of realistic rendering.

### Round 1 — UX/Game Tester → 3D Character Engineer → QA

- **Observed:** The cat face has simple ellipsoids and flat eyes; the pitcher does not actually tilt or emit juice. The player legs immediately snap between walk and idle.
- **Engineered:** `characters.tsx` adds layered cheek/coat tufts, clear-coated amber iris geometry, eyebrow/muzzle contours, apron pocket and richer tail; a tilting pitcher and short cylindrical juice stream animate on a cycle. Player stride is damped rather than switching instantly.
- **QA checks:** Preserve original animation signifier `Math.sin(t*2.3)`, amber pigments, gameplay refs and stable R3F materials. Automated source regression checks added. Real cat-reference similarity, animation alignment and GPU frame timing **not browser-tested**.
- **Remaining:** Procedural cat is still stylised rather than a groomed rigged Blender/GLB model. Animation is procedural, not an AnimationMixer clip.

### Round 2 — UX/Game Tester → Camera & Input Engineer → QA

- **Observed:** The follow camera stays mainly on world +Z, so rotating yaw does not produce correct over-the-shoulder third-person play. Yaw is artificially constrained to ±1.2rad; only one touch pointer can be tracked.
- **Engineered:** Heading-relative orbit camera and pitch tracking, smoothed look-at, extracted pure `cameraAnchor` function, wrapped yaw over the full circle; independent touch-pointer tracking for one `move` and one `look` touch.
- **QA checks:** New deterministic tests assert camera behind the player when facing 0°, 90° and 180°, plus pitch effect. Source check asserts two-pointer map and yaw normalisation. Physical iOS/Android swipe/tap latency **not tested**.
- **Remaining:** Device QA must verify that mesh interactions, browser gestures and the world-space board work on Safari/Chrome touchscreens.

### Round 3 — UX/Game Tester → Lighting/Performance Engineer → QA

- **Observed:** Bulb strings instantiate one dynamic PointLight per decorative bulb (11 storefront bulbs and 7–13 garden bulbs). This can multiply real-time lighting cost on older mobile GPUs. Walking NPC slides sideways rather than facing movement.
- **Engineered:** Storefront light string uses two shared dynamic lights; garden uses two desktop lights and zero extra garden lights on low-power devices. Emissive-looking bulbs remain 3D meshes. Adds ACES tone mapping, a slightly more balanced ambient fill, sign texture disposal, and a second differently coloured NPC on desktop with motion-facing orientation; mobile keeps a single NPC.
- **QA checks:** CI typecheck, tests, Node production build and Pages export must pass before any merge. Real-device battery, FPS and draw-call budgets **not yet measured**.
- **Remaining:** Optional authored GLB rigged assets, texture compression, instancing foliage and physically measured real-device performance will be separate improvements.

## Acceptance and constraints

- Do not add landing page, HTML menu/HUD, or faux 2D scene.
- Keep the complete existing 24-product, 4-season, cart/checkout catalogue. None of its data or backend files were edited in these rounds.
- GitHub Pages is **demo-only**, not a live order backend. A 404 from `deploy-pages` on main is an external Pages activation blocker, not a TypeScript/build error.
- Do not claim visual parity with the reference cat image or production mobile readiness without real browser/device evidence.

## Validation record

- Before changes: base `main` had successful CI (`39942187729`) and Pages build, but failed deploy (`39942187734`, HTTP 404 at create Pages deployment).
- New branch regression scripts now test camera orbit, multi-touch source contract, animated pour and lighting pipeline.
- At the time this report was created, **new branch CI still awaited PR submission**; see the PR checks for definitive results.
