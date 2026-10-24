# Vườn Ép – Quaternius nature pass + runtime decoder repair

- Repair a genuine runtime loading bug: `useGLTF(url, false, false)` disabled the Meshopt decoder even though Quaternius scene GLBs require `EXT_meshopt_compression`. Now every Quaternius loader uses `useGLTF(url, false, true)`. Drei supplies the decoder from `three-stdlib`; no additional CDN necessary.
- Add three real, locally bundled Quaternius Stylized Nature MegaKit GLBs: `garden-grass.glb`, `garden-rocks.glb`, `garden-clover.glb`. Source: `tilakpatell/tilakpatell.com/public/kit/naturemega` with `CC0-1.0` pack declaration. Only selected named nodes render, not the entire model family or duplicate LODs.
- Garden uses tasteful rock/grass/clover clusters around the boundaries, keeps walking lane clear and reduces visual extras on low-power devices.
- Retain cat vendor, Kenney rigged player/NPC, 2D ordering overlay inside full-screen 3D, same-route checkout, sun, rain, cloud and wind. The business-specific blender, juicer, fruit, boxes and drink cups are not falsely labelled as Quaternius without exact matching licensed GLBs.
- Static regression tests now check Meshopt activation plus valid GLB headers, required extension and real named variant nodes.
- Known limitation: CI checks are not equivalent to a real WebGL visual/device smoke test. Confirm actual rendering, frame rate and scene styling in desktop and mobile browsers before declaring photorealistic quality.
