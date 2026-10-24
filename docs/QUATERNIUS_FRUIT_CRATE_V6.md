# Vườn Ép – authored Quaternius produce crates

## Implementation
Four wooden produce crate shells previously modelled as three RoundedBoxes per crate now render a local Quaternius-authored `fruit-crate.glb`. Original binary: [solid-akkadi Crate](https://github.com/age2pierre/solid-akkadi/blob/main/demo-app/public/assets/Crate.glb). Exact upstream artist/source: [Quaternius, Crate, 3VGWnZPXmG](https://poly.pizza/m/3VGWnZPXmG), individually licensed CC0.

The model is normalised to the previously occupied 1.25m × 0.42m × 0.80m bin footprint. Fruit remains explicit, coloured, season-specific 3D geometry on top of the crate; do not misrepresent these fruit shapes as Quaternius models. Clones can safely recolour DarkWood/Wood materials without changing the shared GLTF cache. Provide old lightweight three-box fallback when model load fails.

## Five pragmatic quality checks
1. **Asset QA:** read the original GLB header and model geometry; verify author/licence by exact source model ID, not pack-wide assumption.
2. **Gameplay UX:** counter interaction and menu remain unchanged; no extra kiosk, no middle-screen obstruction.
3. **World engineering:** preserve fruit pile positions and original crate collision footprint; new nonuniform world-space fitting does not affect the scene cache.
4. **Performance:** use GLTF cache, a limited number of crate clones, and mobile shadow controls.
5. **Release QA:** binary tests, client TypeScript, Next.js build and Pages static export are required; a browser/device visual review is still needed to confirm actual look/FPS.

## Unchanged behaviours
Single immersive shop route; rigged avatar/NPC; animated cat vendor; 2D seasonal product ordering overlay with cart, real same-route checkout; sun/rain/wind/cloud simulation. Juicer, blender, cups and ingredient-specific fruit remain procedural pending equivalent, verified GLBs.
