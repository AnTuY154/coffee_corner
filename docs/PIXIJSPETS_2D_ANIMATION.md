# PixiJS Vườn É moving pets (2026-10-27)

**Current implementation:** `components/2d-shop/pets-world.tsx` renders a single transparent PixiJS v8 canvas inside the actual 1536×1024 scene. The library's `AnimatedSprite` cycles through **8 distinct drawings with articulated feet**, not a single still bitmap translated via CSS. The dog and cat retain the colours and facial cut-outs of the approved illustration.

## Asset layout

- `public/art/pets/dog-walk.png` – RGBA 1920×160, **8 horizontal frames × 240×160**.
- `public/art/pets/cat-walk.png` – RGBA 1920×160, **8 horizontal frames × 240×160**.
- Each frame is a separately redrawn stance with alternating front/back legs, moving tail and bobbing head. This is an **initial custom motion asset**, not professional multi-view hand-painted animation.
- The original foreground lying animals are removed from `public/art/vuon-e-approved-clean.webp`. The intact `vuon-e-original-composition.webp` is the fallback until both sprite sheets and the PixiJS renderer load.
- The employee keeps two separate transparent layers (`clerk-body.png`, `clerk-arm.png`) for shoulder-based waving.

## State machine / rendering

- `idle`: stand with a static frame, random wait
- `turn`: short pause, choose a route direction
- `walk`: frame playback at approximately 9 FPS, move at 25–30 artboard px/sec
- `idle` again at path limit or end of walk duration
- Reduced-motion users stay in `idle`.
- Cat voice is opt-in only; the current meow remains synthesized (real licensed recording may replace it later).

The single world container scales by `stageWidth/1536` and `stageHeight/1024`. React DOM hotspots receive the animals' live world positions at 10 updates per second. **Do not use `position:fixed` or viewport pixel positions for animals**: it breaks contact with the floor, particularly on ultrawide displays.

## Fullscreen without cutting the approved artwork

A 3:2 image cannot be distorted to 16:9 or 21:9 *and* keep all source elements visible. Desktop uses an uncropped, centred `contain` stage, while blurred colour-matched extensions fill the remaining horizontal screen space. The shop sign, worker, outdoor tables and the pet walking plane remain fully visible. Mobile retains horizontal panning.

## Quality/testing

- `npm run test:art:required`: validates the two 1920×160 frame sheets along with original and transparent sprite assets.
- `npm run test:2d:visual`: 1536×1024/mobile interactions, desktop at 1920×1080, 1440×900, 2560×1080 and other resolutions; asserts image/canvas co-registration and **captures two different frames** of the moving Pixi canvas.
- `npm run build` and `npm run build:pages`: Next.js and static preview.
- Check visual quality by viewing sequential frames: passing a build does not certify that hand-drawn animal anatomy is commercially polished.

## Underlying references

- https://github.com/pixijs/pixi-react — React integration option
- https://github.com/pixijs/pixijs — PixiJS v8 runtime used here
- https://github.com/pixijs/pixijs-skills/blob/main/skills/pixijs-scene-sprite/references/animated-sprite.md — `AnimatedSprite` usage
- https://opengameart.org/content/cat-dog-free-sprites — CC0 animation state *reference*, **not copied or shipped**; no pixel-art from another style used in this product.
