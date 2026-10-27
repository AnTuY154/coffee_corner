# Vườn É — independent 2D actors

The homepage remains the single 3:2 illustrative scene. The ordering, basket and checkout still appear on top of it, without navigating away.

## Implementation

- `pets-world.tsx`: a **single PixiJS 8 canvas/ticker** with three independently animated actors; all positions refer to original 1536×1024 artwork.
- `actors-director.ts`: one deterministic choreography state machine for visits (`idle → outbound → petting → returning → idle`). The director also handles independently walking pets and queued user interactions.
- `public/art/actors/clerk-{body,arm,leg}.svg`: transparent, deliberately separated body parts. Legs swing during a run; the upper arm waves while idle and reaches down when petting.
- `public/art/pets/{dog,cat}-walk.png`: existing genuine eight-frame walk sprite sheets. PixiJS changes animation frame, facing, speed, scale and response to the employee.
- An atomic load gate switches from the original complete artwork to the cleaned background + all three independent actors. Incomplete assets cannot render duplicate characters.
- Both pets have dynamic pointer hotspots; touching one queues the employee to visit it. The employee's hotspot follows her movement as well.
- Automatic alternating dog and cat visits take place at intervals. A `prefers-reduced-motion` setting freezes cosmetic movement.

## Synchronisation invariant

At the `outbound → petting` transition, **the worker's pet pose and the visited animal's happy response become active in the same director step**. The animal stops wandering while being visited. The employee returns through the counter passage instead of sliding a PNG across the café floor.

## Quality gates

Run `npm run test:2d`, `npm run test:art:required`, `npm run typecheck` and `npm run test:actors` (Node 22+), then manually inspect the homepage in desktop and mobile browsers.

For interactive QA:
1. Confirm that the original worker, dog and cat are absent from the environmental background when sprites are ready; there must never be two copies.
2. Watch the employee wave behind the service counter, run around its side, crouch and pet the dog, then return.
3. Click the cat, then immediately click the dog: both visits should happen in sequence, without either cutting off the other.
4. Check the pet's animated legs when walking, and heart/head response aligned to the employee when being petted.
5. Check cloud tooltips, same-scene ordering, responsive fitting, reduced-motion and hidden-tab lifecycle.

## Visual-art limitation

The existing `vuon-e-approved-clean.webp` removes the original characters **but the inpainted areas are visibly smudged**. This change removes previous scenery-bearing `clerk-body.png` and `clerk-arm.png` from the runtime, but it does **not** claim the cleaned background has passed artistic sign-off. The vector clerk art is a replaceable working rig, rather than a completed hand-painted anime character. A dedicated illustration/rigging pass is still needed before visual acceptance. Pixi and the director will support upgrading only the textures, without rewriting the choreography.

## Libraries reviewed

- [PixiJS v8](https://github.com/pixijs/pixijs): selected because it already exists in the project and supports animated sprite sheets, masking, textured SVG sprites and a shared ticker.
- [Rive React](https://github.com/rive-app/rive-react): useful for a later bone/mesh-animated artist-built puppet or nuanced expressions, but requires an authored `.riv` source.
- [XState](https://github.com/statelyai/xstate): appropriate for more complex future narrative behaviours; the current visitor cycle can remain dependency-free and easier to test.
- [Spine Pixi official runtime](https://github.com/EsotericSoftware/spine-runtimes): supports high-end 2D skeletal animation but requires a licensing and authoring pipeline decision.
- [Phaser](https://github.com/phaserjs/phaser): credible game engine, not justified for replacing the already integrated Pixi renderer.
