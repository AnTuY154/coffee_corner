# Vườn Ép 3D — Art direction & asset plan (2026-10-24)

## Goal and reference
The second user image is the **visual target**, not an existing reproducible model. A warm, sunny stylised 3D garden juice stall with a believable cute round cat barista, a short chibi customer, lush plants, PBR wood, hanging bulbs and readable physical menus. **No 2D fake scene or screenshot background.**

### Style bible
- Palette: deep emerald shop #174b35, leaf greens #6eaa53/#9dca75, warm cream #fff4d9, honey gold #eec479, peach wood #ae7144, warm soft skylight.
- Player: head-to-height ratio ~1:3, curly grouped hair tufts, rosy cheeks, rounded hoodie, green backpack, oversized white trainers; preserve third-person movement.
- Cat: large round beige-grey head, cream cheeks, triangular ears with pink interiors, glossy large amber irises, delicate whiskers, tiny pink nose, green apron. Add Blink / Idle / Pour / Serve clips when a verified rig exists.
- World: depth from near foliage, midscreen playable avatar and counter, far sky/trees. Avoid cable, poles or signs piercing the camera line.
- Use fewer strong lights, soft shadows and high-quality roughness/normal textures before post-processing. Avoid expensive full-screen effects on mobile.
- Keep actual 3D menu physically offset from main counter, preserving 24 products/4 seasons/cart. Checkout remains a separate secure real-data HTML form.

## Reviewed first-party / primary sources

| Need | Source | License or use |
| --- | --- | --- |
| Cute game-ready humanoid, rigged and glTF | https://quaternius.com/packs/universalbasecharacters | CC0, source page, approx 13k triangles |
| Free chibi-style humanoids with animations | https://kenney.nl/assets/mini-characters | CC0, verify pack aesthetics vs target |
| Cute animated character assets | https://kaylousberg.itch.io/kaykit-adventurers | CC0; art style more low-poly than the reference |
| Humanoid animation clips for compatible rig | https://kaylousberg.itch.io/kaykit-character-animations | CC0, glTF/FBX |
| Stylised garden models (trees, flowers, plants) | https://quaternius.com/packs/stylizednaturemegakit.html | CC0, over 110 models |
| Alternative nature starter set | https://kenney.nl/assets/nature-kit | CC0, 330 files |
| Smaller animated animal set to inspect for pets | https://quaternius.com/packs/ultimateanimatedanimals.html | CC0, review pack contents before claiming a cat is included |
| Custom cat and rigging | https://docs.blender.org/manual/en/4.2/addons/import_export/scene_gltf2.html | Blender glTF exporter docs; build own cat to match reference |
| Optional humanoid auto-rigging (not cats) | https://helpx.adobe.com/creative-cloud/faq/mixamo-faq.html | commercial usage allowed; auto-rigger is humanoid-only |
| GLB → component with model optimisation | https://github.com/pmndrs/gltfjsx | inspect --transform / --types |
| Animation mixer integration | https://drei.docs.pmnd.rs/abstractions/use-animations | Drei useGLTF + useAnimations |
| Optimise GLB geometry and textures | https://gltf-transform.dev/ | WebP, meshopt/Draco, KTX2 where suitable |
| Model reuse & LOD/instancing | https://r3f.docs.pmnd.rs/next/advanced/scaling-performance | keep draw calls low |
| Mobile adaptive rendering | https://drei.docs.pmnd.rs/performances/adaptive-dpr | measure and dynamically adjust resolution |
| Physically based colour management | https://threejs.org/manual/pages/color-management.html | proper sRGB colour textures and linear normals |

Do **not** copy screenshots or hotlink asset site previews as a substitute for a game scene. Record the exact asset URL, download date, original licence and attribution with each imported model. No external paid/third-party binaries were silently added in this change.

## GLB production pipeline for the next asset-quality phase
1. Sculpt cat and chibi in Blender using image 2 solely as inspiration; original mesh should have cute proportions, facial blendshapes (Blink/Smile), clean topology, UVs, PBR roughness/normal and a manageable hair/fur geometry approach (not millions of live strands).
2. Rig a cat-specific armature for head, paws, tail, apron and pitcher. Use action clips **Idle / Blink / Pour / Serve** and named NLA tracks; humanoid motion clips **Idle / Walk / Turn** for player.
3. Export as binary glTF (`.glb`) with skinning, clips and PBR. Test in a standalone viewer, then compress via glTF-Transform (texture 1024 or less initially, test KTX2 and meshopt against actual device metrics).
4. Store locally under `public/models/`; use `useGLTF` and `useAnimations` in R3F, a graceful geometry fallback if loading fails, dispose appropriately, and support reduced motion.
5. QA real Chrome desktop, Chrome Android and Safari iPhone: no camera obstruction, readable menu, pointer/touch interaction, walk/collision/checkout, FPS frame time, memory and GLB network cost. Capture screenshots from the **running WebGL app** and compare with supplied reference.

## Three sequential source review → code change → QA rounds

**Round 1 — Spatial UX Review → 3D Engineering → QA**
- Observed: huge vertical pole in centre and visible screen-reader instructions. In source, a 15.2-unit cylinder used the cylinder default Y-axis with near-zero rotation.
- Fixed: rotate lamp cable horizontally and CSS-clip `.sr-only` under the full-screen app. Moved and scaled down the physical menu and panned interaction camera right.
- QA: deterministic source checks added to `test:immersive`. Browser screenshot re-test needed; source check alone is not visual testing.

**Round 2 — Character UX Review → Character Engineering → QA**
- Observed: egg-like procedural player and bland cat face/eyes, distant from concept art.
- Fixed: true meshes for larger chibi player head, hair curls, expressive eyes, cheeks, cuffs, sneakers and backpack; rounder cat head/cream cheeks, eye placement and ear details; friendlier NPC face. Keep already-functional pour/blink/locomotion motion.
- QA: preserve player movement refs, existing tests and cat animation source. This is an intermediate stylised geometry improvement, not an authored GLB rig.

**Round 3 — Environment UX Review → Scene Engineering → QA**
- Observed: flat pale-green sky and no layers of hanging vegetation around the shop.
- Fixed: blue sunny backdrop, real 3D clouds, grouped hanging vines with low-power geometry limits, revised fog and normal-biased shadow.
- QA: preserve mobile-aware Canvas settings and static Pages build gates. FPS and parity to reference still require actual browser/device tests.

## Shipping gates
Merge only if catalogue/order tests, immersive/3D tests, TypeScript and Next production builds pass. GitHub Pages static demo is not a live order backend; Pages enablement is separate. **Do not state reference-grade appearance, true cat rigging, or mobile FPS success until visually measured.**
