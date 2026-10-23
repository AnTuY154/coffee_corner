# Vườn Ép — immersive experience, 3 evaluation/fix loops

Date: 2026-10-23. Scope: user-provided image of beige-grey amber-eyed cat, stylised 3D shop reference, and current GitHub Next.js project.

**Review protocol:** Three sequential role-based passes. In each pass one reviewer role records user-experience defects, an implementer role changes code, and a QA role checks acceptance criteria. These are three reviews in one implementation session, **not** three independently executed autonomous agent sessions or browser user tests. Automated checks and GitHub Actions are evidence where explicitly recorded.

## Loop 1: Experience Reviewer → 3D World Builder → QA

**User-experience feedback:** The current scene contains equipment and plants but no visible player body and no living store personnel. First-person viewing is inconsistent with the reference image and does not communicate game character movement.

**Implementation:**
- `components/3d-shop/characters.tsx`: original procedural 3D beige/grey cat barista, round head, triangular ears with pink interiors, amber eyes, muzzle, whiskers, dark green apron, tail and mixing motion. Built from real Three.js meshes; photo used as visual reference, never as a flat image in-world.
- Add visible third-person human avatar with backpack, moving arms and legs.
- Add walking customer on a repeating path and animated dog; preserve reduced-motion preference.
- `components/3d-shop/world.tsx`: third-person camera and active 3D characters.
- `components/3d-shop/garden.tsx`: 3D trees, pergola, bulbs, flowers, stepping stones, tables.

**Review outcome:** Meets scene inhabitants/player representation in code. No claim of photorealistic asset parity with concept image.

## Loop 2: Experience Reviewer → Interaction Engineer → QA

**Feedback:** The former left welcome panel, top HUD and HTML card menu break immersion. A touch-only player had no discoverable route to the order tablet, and text planes could swallow clicks to mesh buttons.

**Implementation:**
- Root `/` and legacy `/menu` both open the same 3D scene; global header/footer no longer render.
- Remove former full-screen 2D menu dialog and all HUD overlays from `ImmersiveShop`.
- `in-world-menu.tsx`: 3D physical menu board, four seasonal collections, six drinks each, prev/next, cart/checkout interaction and escape via mesh raycasts.
- Bind handlers to clickable 3D groups so text planes do not intercept clicks.
- Add in-world **VÀO QUẦY** sign with tap/click for automatic walking; E on desktop. On mobile drag left side to move and right side to turn.

**Review outcome:** One immersive viewport with no 2D catalogue overlay. Checkout must still use accessible HTML forms after the player chooses to order; a WebGL-only personal-data form is not appropriate. GitHub Pages remains demo-only.

## Loop 3: Experience Reviewer → Performance Engineer → QA

**Feedback:** 3D introduces GPU/battery cost, tap targets and camera sizing vary between wide desktop/portrait mobile, stale tests refer to deleted popups. The game must remain usable if the renderer is lost.

**Implementation:**
- Device-sensitive DPR and optional shadows in R3F Canvas; fog limits scene depth; reduced motion disables procedural animation.
- Camera moves closer to 3D menu; board scales down on portrait mobile.
- `scripts/test-immersive-world.mjs` validates root 3D-only scene, cat, avatar, NPC motion, in-world menu and interaction coverage.
- `scripts/test-3d-shop.mjs` updated to assert new game behavior rather than obsolete DOM menu.
- Degraded WebGL support shows a **non-commerce informational error**, no fake successful order.
- Keep `/api/orders` backend untouched for production; in GitHub Pages static export, an existing guard disables real checkout.

**Local verification:** TSX syntax parser: 8 source files, no parse diagnostics. `npm run test:immersive`, `npm run test:3d`, `npm run check:catalog`, `npm run test:orders`: passed. Full Next.js `typecheck` and production build must pass in GitHub Actions before merge.

## Remaining fidelity/production tasks

1. Replace primitive meshes with sculpted GLB character assets, groomed fur materials and PBR textures for the concept image’s cinematic quality. Reference photograph is not a rigged 3D model.
2. Test WebGL interaction and performance on real iOS/Android/desktop. In-world 3D text still needs usability validation on narrow screens.
3. Optional dedicated skeletal animation clips: Idle/Walk/Pour/Serve/Customer Queue, particle juice pouring, environment sound.
4. Deploy GitHub Pages by enabling Pages under repo Settings → Pages; this action requires owner permissions. Static Pages is a demo; live orders need an API host and deployed Apps Script.
