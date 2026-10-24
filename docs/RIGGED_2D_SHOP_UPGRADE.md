# Vườn Ép — rigged characters + 2D shop menu (2026-10-24)

## Implementation / licensing

- First-party 3D world stays full screen. The counter's actual 3D touch target and proximity/E interaction still open product selection.
- At the user's request, product **selection is now an accessible 2D dialog**, not a raycast-operated 3D menu. Four seasonal filters + 'all' (24 products), search by drink/ingredient, recipe ingredients, editable basket and existing checkout route.
- Game movement is locked while menu is open and restored on close. The user can close by the visible X, Escape or clicking the backdrop.
- Skinned GLBs (not primitive actors): `public/models/player-skater.glb` and `public/models/npc-sunny.glb`, copied unaltered from https://github.com/prabinpebam/atiya (commit provenance is upstream's Kenney model builder).
- Kenney **Animated Characters: Protagonists 1.1**, originally https://kenney.nl/assets/animated-characters-protagonists, CC0 1.0. License copied verbatim to `public/models/KENNEY-CHARACTERS-LICENSE.txt`. Source conversion documented at https://github.com/prabinpebam/atiya/blob/main/scripts/build-character.mjs. Male 'skater' and female 'Sunny' share the Kenney skeleton, rigged Idle/Run/Jump animations, with a customised hair mesh on Sunny. The generated derivative models use CC0 source textures and geometry.
- `rigged-characters.tsx` uses `useGLTF`, `SkeletonUtils.clone`, `useAnimations` with Idle/Run cross-fades. Sizes are derived from GLB bounding boxes rather than hard-coded authoring units.
- React Suspense and an error boundary retain the old playable procedural avatar/NPC on model loading errors. This is a fallback, **not** the default.
- `NEXT_PUBLIC_BASE_PATH` respects GitHub Pages `/coffee_corner`. Static export remains demo-only and cannot accept real orders.

## Review pass 1: UX Tester → UI Engineer → QA

Observation: world-space menu obscures the cat and makes touch-selection / keyboard tab navigation difficult. Design change: a responsive HTML dialog with season filters, product images, 2D add-to-basket controls, total and editing. QA source checks assert four seasons, actual 24-product catalogue binding, focus restoration, existing checkout and no permanent HUD. Real mobile Safari tapping still requires visual testing.

## Review pass 2: Character Tester → Character Engineer → QA

Observation: player and NPCs from spheres looked flat, especially compared with the user's art reference. Change: locally bundle two licensed, already textured rigged character GLBs with real Idle/Run/Jump clips; use skeletal clone to avoid cross-character animation contamination. QA source checks assert local binaries, rigged renderers, animation usage, fallback and unchanged game controller. Need visual screenshot confirmation of perceived cuteness, face detail and clipping. Cat barista remains the customised procedural upright bartender because available quadruped cats cannot substitute for a biped barista with pour animation without a newly authored rig.

## Review pass 3: Game QA → Integration Engineer → QA

Observation: static Pages export uses a base path; loading `/models/*.glb` without a prefix would 404. Change: dynamic model paths include `NEXT_PUBLIC_BASE_PATH`, existing from `scripts/build-github-pages.mjs`; unchanged API cart/backend invariants. QA CI requires tests, typecheck, production build and Pages export before merge; no claims of Chrome/iOS GPU FPS or direct GLB visual parity from CI.

## Production art follow-up

The next major aesthetic improvement is a hand-authored **upright cat barista** with shape keys, hair cards, green apron, Idle/Blink/Pour/Serve and a bespoke rig. A bipedal cat in the reference concept cannot be reproduced by taking an unrelated four-legged cat model. Measure silhouette/reference likeness on a browser before releasing.
