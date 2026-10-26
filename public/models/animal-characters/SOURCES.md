# Animated characters: sources and licence (Vườn Ép)

## Dog — Shiba Inu (`shiba-inu.glb`)
- **Author:** Quaternius, **Ultimate Animated Animal Pack** (July 2021), CC0 1.0.
- Official pack and licence statement: https://quaternius.com/packs/ultimateanimatedanimals.html
- Poly Pizza individual page: https://poly.pizza/m/y4wdQpg767
- Mirrored, reduced-size GLB: https://github.com/SaidYaka-Work/SaidYakaBlog/blob/main/public/dog/ShibaInu.glb
- Mirror's asset-specific licence: https://github.com/SaidYaka-Work/SaidYakaBlog/blob/main/public/dog/LICENSE.md
- The original rig and baked animations are embedded. Inspected actual GLB: one skeleton/mesh and 12 named animation clips, including `AnimalArmature|Idle`, `AnimalArmature|Walk`, `AnimalArmature|Eating`. The binary is copied unchanged from the mirror. The source has independently verified CC0 from the original pack.
- Runtime uses skeleton cloning and crossfades, cached GLB loaded once. Animals walk around the garden on an ellipse with built-in rest/eat states. Respect reduced motion and mobile shadows.

## Former cat employee retired from the storefront

The earlier hybrid `Kenney npc-sunny.glb` + procedural cat-face staff character was removed from the default scene. The `RiggedCatBarista` module implementation is no longer shipped. The existing `npc-sunny.glb` remains legitimately in the project for **walking human customers**, and the skinned dog remains unchanged.

## Shin-chan-inspired Vườn Ép employee (3D authored scene)

- Source file: `components/3d-shop/shin-barista.tsx` (locally authored, editable three-dimensional mesh/geometry and animation).
- Visual research: [official Japanese Crayon Shin-chan character page](https://www.tv-asahi.co.jp/shinchan/character/); sample [Pinterest Shin cute illustration](https://www.pinterest.com/pin/980095937656420009/); [Pinterest Shin 3D reference](https://www.pinterest.com/pin/938226534914959891/).
- Visual motifs: wide, rounded-square child face; round ears/cheeks; small O-shaped mouth; short black cap hair; prominently thick curved black brows; shining black eyes; vivid red shirt; yellow shorts/shoes. A small green apron and raised takeaway cup denote the role of a juice-bar attendant.
- The model is **not** an adult Kenney humanoid rig with a mask. The child proportions, face, limbs, outfit, cup and animation pivots are authored together and render directly in the Three.js scene. Independent arm wave, head bob/tilt, blink and drink presentation support `reducedMotion`.
- Pinterest is used for visual research only. No Pinterest image, official illustration, downloaded third-party fan mesh or texture is redistributed by this repository.
- **IP / production notice:** Shin-chan is a protected third-party cartoon character. A Creative Commons licence applied to a fan-made 3D mesh (where present) does not itself authorise a commercial use of Shin-chan's underlying character/design, branding or merchandising rights. Permission from the appropriate rights holders should be obtained before using this particular character on a commercial store. A custom original mascot is the fallback for commercial launch.
- The scene, menu, checkout, human avatars, animated Quaternius dog and weather remain unchanged.

## Five evaluation checks
1. **Reference fidelity:** cheek-to-head ratio, cropped black hair, striking eyebrows and eyes, outfit silhouette and colour.
2. **Coherent 3D geometry:** not a hybrid adult rig or floating animal head; keep articulated compact arms and legs matching the oversized chibi head.
3. **Serving interaction:** visible takeaway drink and periodic friendly wave, without intercepting the kiosk click target.
4. **Performance/accessibility:** limited primitive counts, smooth materials and bounded movement, pause all cosmetic animation for reduced motion.
5. **Code regression and shipping:** immutable catalog/cart/same-scene checkout, Next.js typecheck, 3D tests and static Pages demo build, plus actual browser visual inspection if a browser preview becomes available.

CI only validates project logic and static build, not whether subjective visual resemblance, camera visibility and rendered pose are satisfactory in a real browser.
