# Quaternius GLB asset provenance — Vườn Ép 3D

These seven source 3D models are individually identified as **Quaternius / CC0 1.0** in `sorryhumans/roost`'s `web/public/models/office/manifest.json`. Each binary was copied unchanged into Vườn Ép from the same repository, then placed via a reusable React Three Fiber GLB component.

Source metadata: https://github.com/sorryhumans/roost/blob/main/web/public/models/office/manifest.json
Upstream scene: https://github.com/sorryhumans/roost
Original model catalogue: https://poly.pizza (individual IDs below)

| Local asset | Upstream binary | Poly Pizza model ID | Use inside scene |
|---|---|---|---|
| `garden-chair.glb` | `chair_blue.glb` | `UfKvrZBK6C` | One garden chair |
| `garden-armchair.glb` | `armchair.glb` | `X9msj0gtb5` | Two garden armchairs |
| `garden-couch.glb` | `couch.glb` | `mWgQ94zhDZ` | Pergola couch |
| `shop-bookcase.glb` | `bookcase.glb` | `tACDGJ4CGW` | Shop back-wall display case |
| `houseplant.glb` | `plant_monstera.glb` | `bfLOqIV5uP` | Four shop-front houseplants |
| `waste-bin.glb` | `trash.glb` | `i7HDuYDLkx` | Customer-area recycling bin |
| `garden-rug.glb` | `rug_round.glb` | `ZYBzMHnSbM` | Pergola floor decoration |

**Additional Nature MegaKit GLBs (grass, rocks and clovers):** `garden-grass.glb`, `garden-rocks.glb` and `garden-clover.glb`, from the same Quaternius **Stylized Nature MegaKit** CC0 family exports. Source binaries: https://github.com/tilakpatell/tilakpatell.com/tree/main/public/kit/naturemega (`grass.glb`, `rock.glb`, `clover.glb`). Pack manifest declares `licence: CC0-1.0`: https://github.com/tilakpatell/tilakpatell.com/blob/main/public/kit/naturemega/index.json. The loader clones only a named variant node in each family, without duplicated `.lod1` meshes. Models are locally hosted and only a limited number of plants render on mobile.

**Additional Nature MegaKit GLB:** `garden-flowers.glb`, from Quaternius **Stylized Nature MegaKit** family-export (`Flower_1_Group` through `Flower_4_Group`). Source: https://github.com/tilakpatell/tilakpatell.com/blob/main/public/kit/naturemega/flower.glb. Pack manifest: https://github.com/tilakpatell/tilakpatell.com/blob/main/public/kit/naturemega/index.json (`licence: CC0-1.0`, attributed to Quaternius). Original pack: https://quaternius.com/packs/stylizednaturemegakit.html. The multi-model GLB is not rendered wholesale; a specifically named flower-group mesh is cloned, avoiding the duplicate `.lod1` geometry. This replaces six old flower clusters in the playable garden.

**License scope:** This manifest points to previously published, individually tagged CC0 assets. Do not assume new releases of Quaternius packs have identical redistribution rights: the current Quaternius Asset License may differ from historical CC0. Import only verified CC0 binaries or obtain permission when adding new models.

### Geometry / interaction constraints

- GLB models are a visual replacement; movement boundaries, world-space menu tablet, 3D shop, rigs, the animated barista and the existing same-scene ordering/checkout remain intact.
- Model boundaries are computed from true GLB geometry. Props use a floor-aligned and centred group; furniture sizes are normalised by original height, rugs by original footprint width.
- Shared GLTF cached scenes are never transformed. Static object instances clone their `scene` so multiple positions do not move each other. Per-model Suspense/error boundaries maintain gameplay if a particular GLB cannot load.
- Quaternius upholstery materials are palette-shifted toward sage green for visual consistency; original shared GLTF materials remain untouched.
- GLBs use `EXT_meshopt_compression`, and the bookcase also uses `EXT_texture_webp`. All Quaternius prop, flower and nature calls now enable `useGLTF(path, false, true)` to register the bundled Meshopt decoder. Build/static tests inspect this setting and the binary extension headers. Validate real WebGL/browser appearance and FPS separately; those are not certified by CI.
- Maintain mobile-friendly limited shadows. Models and materials can be shared across the few visible props.

### Still intentionally procedural

The original juicer, blender, custom beverage cups, piles of fruit and wooden produce crates remain bespoke meshes because no *verified, functionally matching* Quaternius GLBs were imported this round. The 3D menu interaction tablet remains the interactive source-of-truth rather than a blindly replaced decorative mesh. It would be dishonest to claim every screen object has been converted.

### Serial source review passes

1. **Gameplay reviewer → asset engineer → QA:** Audit existing world objects. Replace the four decorative `Plant` models and service shelf planks with Quaternius houseplants/bookcase while preserving the usable kiosk. Source/test checks protect the approach, checkout and menu.
2. **Garden reviewer → asset engineer → QA:** Replace wooden bench prototypes and floor rug with actual Quaternius couch, two seats, and rug, keeping the pergola and table footprint. Verify no animated NPC/avatar logic changed.
3. **Performance/licensing reviewer → engineer → QA:** Bundle exact CC0 binaries locally, implement GLB bounds normalisation, cache-safe clones, responsive shadow rules and suspense fallbacks. Verify GLB magic/byte lengths + licensed provenance and production/Pages builds. Real mobile fps, raycasting, appearance and meshopt decoding must be evaluated in an actual browser.

CI quality gates and Pages **static build** must pass before merging. GitHub Pages deployment may remain blocked on site Settings until manually enabled.
