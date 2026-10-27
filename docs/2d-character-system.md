# Vườn É — 4 locked illustrations and source-driven 2D animation

**Source of truth**: `public/art/canonical/{shop,employee,dog,cat}.webp` with checksums and original PNG source hashes in `manifest.json`. The image art source is fixed by the user's most recent approval. Alternate employee-pose exports, scenery-bearing crops, original dog/cat sprite sheets and SVG placeholders are obsolete and MUST NOT be used by the active 2D page.

The canonical shop image is **1672 × 941 / 16:9**. All actors share that coordinate space, and both the pointer hotspots and the Pixi viewport are transformed by the same scale.

## Runtime rendering

- `illustrated-shop.tsx`: preload the four source images, then switch atomically to the clean canonical background plus actors. If images have not loaded, render a neutral loading surface, **not** old illustrated fallback characters.
- `pets-world.tsx`: exactly three PixiJS MeshPlane character instances. Each reads the corresponding canonical source WebP, retains its alpha silhouette and builds its own geometry.
- `deform-rig.ts`: 17×17 source-texture mesh deformation with body breathing, dog/cat leg motion coupled to distance travelled, head motion, tail wag and restrained employee greeting/run/pet deformation. No frame is made using unrelated visual data.
- `actors-director.ts`: unified state/timeline: worker idle/wave behind counter, leave through right counter exit, reach pet, synchronize pet reaction on same frame, return behind counter. Animal locomotion accelerates/decelerates, pauses for interactions, and avoids sudden directional flips.
- All menu/ordering/basket/checkout remain on the same page. Respect motion reduction and background-tab ticker suspension.

## QA

- `npm run test:art:required` validates exactly four source names, artboard sizes, alpha and SHA-256 hashes.
- `npm run test:actors` tests gait geometry, state machines, interaction synchronisation, safe world bounds, counter masking and reduced motion.
- `npm run test:2d` + `npm run typecheck` + `npm run build`.
- Playwright browser screenshots for laptop fullscreen and mobile; ensure no clipping, two-dimensional proportions, no repeated characters and intact checkout.

## Deliberate quality limit

A single approved illustration cannot magically expose the hidden surfaces required for full traditional 2D skeletal animation. Pixi MeshPlane provides real per-vertex movements and nuanced gait motion now. Fully independent articulated paws or a dramatic new petting posture would require a supervised derived segmentation/repainting pass from **the exact same four source illustrations**, not replacement designs. Do not claim those advanced cycles are already available.
