# Animated characters: sources and licence (Vườn Ép)

## Dog — Shiba Inu (`shiba-inu.glb`)
- **Author:** Quaternius, **Ultimate Animated Animal Pack** (July 2021), CC0 1.0.
- Official pack and licence statement: https://quaternius.com/packs/ultimateanimatedanimals.html
- Poly Pizza individual page: https://poly.pizza/m/y4wdQpg767
- Mirrored, reduced-size GLB: https://github.com/SaidYaka-Work/SaidYakaBlog/blob/main/public/dog/ShibaInu.glb
- Mirror's asset-specific licence: https://github.com/SaidYaka-Work/SaidYakaBlog/blob/main/public/dog/LICENSE.md
- The original rig and baked animations are embedded. Inspected actual GLB: one skeleton/mesh and 12 named animation clips, including `AnimalArmature|Idle`, `AnimalArmature|Walk`, `AnimalArmature|Eating`. The binary is copied unchanged from the mirror. The source has independently verified CC0 from the original pack.
- Runtime uses skeleton cloning and crossfades, cached GLB loaded once. Animals walk around the garden on an ellipse with built-in rest/eat states. Respect reduced motion and mobile shadows.

## Cat barista — hybrid anthropomorphic character using an actual skinned GLB rig
- **Skeleton, mesh and baked `idle` animation:** `public/models/npc-sunny.glb` already bundled and attributed as **Kenney Animated Characters: Protagonists**, CC0.
- Kenney pack: https://kenney.nl/assets/animated-characters-protagonists
- This rigged CC0 character is adapted in React Three Fiber to remain **upright behind the juice-bar counter**. A new bespoke sculpted 3D cat face, ears, warm grey fur details, amber eyes, green apron, tail, glass pitcher and juice stream are rendered as accessories. GLB armature drives the torso/legs/arms; props follow a separate pour cycle.
- The original `CatBarista` implementation remains an error/Suspense fallback; it is not the default visual.
- **Limitation / visual QA requirement:** This is **not** a single custom rigged cat GLB. The cat head/apron/tail are added in-world, not skin-weighted into the same armature, so very close animation inspection may reveal minor alignment, human-body shading, or clipping issues. The preferred future art step is a Blender-authored CC0/licensed feline character whose complete skinned mesh and custom Pour/Serve clips replace the hybrid. Do **not** advertise the cat as a standalone commissioned GLB.

## Invariants retained
Existing playable user avatar, moving visitors, seasonal product catalogue and basket, 2D overlay within the 3D shop, same-URL secure checkout, dynamic sun/rain/clouds/wind, mobile controls. Local model URLs are prefixed by `NEXT_PUBLIC_BASE_PATH` for the GitHub Pages static export. Original fallbacks ensure game resilience.

## Review
1. Source/licence: individually check pack CC0 and exact mirrored binary.
2. Rig QA: verify GLB header, real skeletons, skin and Idle/Walk/Eating keyframe clips.
3. Store UX: cat remains two-legged and behind the service counter with pouring; no blocking camera mesh, use in-world kiosk unchanged.
4. Motion/performance: SkeletonUtils clones, animation fades, bounded path, no full-scene re-renders per frame, low-power shadow reduction.
5. Release: run `npm run test:3d`, `npm run test:immersive`, `npm run typecheck`, `npm run build` and Pages export in CI. CI does not prove exact pose alignment or device FPS; manually review at desktop and mobile sizes.
