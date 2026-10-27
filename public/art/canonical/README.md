# Vườn É — approved 2D image sources

Exactly four approved originals drive the shop art and all living actors. Each file in `public/art/canonical/` was transcoded at WebP quality 95 from the corresponding original user-approved PNG, with the transparent alpha retained for characters. No new AI illustrations and no previous cat/dog sprite sheet or alternate employee pose are used at runtime. The hashes in `manifest.json` track both the original approved PNG pixels and the deployed WebP derivative.

## Renderer

- Canonical artboard: **1672 × 941 (16:9)**, not the previous 1536 × 1024 composition.
- `shop.webp`: never includes baked-in people or pets.
- `employee.webp`: visible behind the counter at `(764,697)`; counter masks the lower body until the employee exits by the right passage. A subdivided mesh deforms hand, head, legs and skirt without replacing the face or clothing texture.
- `dog.webp` and `cat.webp`: independent 17×17 Pixi mesh rigs. Paw deformation and body bounce are tied to distance travelled; tail wag and breathing use a shared clock. They accelerate and decelerate rather than moving at constant speed. Alpha silhouette comes from the canonical originals.
- `ActorsDirector`: orchestrates visits, employee return path, safe target queues and simultaneous pet reactions.
- All commerce, basket, tooltips and checkout remain on the same page.

## Limits

Rig deformation of one source portrait is *not* equivalent to a full authored bone rig with hidden back-side anatomy. Extreme leg extension, turns and hand-to-pet contact are deliberately subtle to avoid distorting the four approved designs. A production-ready fully articulated walk cycle would require manual asset segmentation/inpainting strictly **from those four approved images** and additional visual sign-off. The current implementation is an intermediate genuinely deformable 2D system, not a frame-by-frame run cycle.

## QA

- `npm run test:actors`
- `npm run test:art:required`
- `npm run test:2d`
- `npm run typecheck`
- Playwright desktop and mobile visual screenshots; confirm the counter occludes the employee and both pets are drawn from canonical textures only.