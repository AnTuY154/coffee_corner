# Vườn É — Cozy Pixel Garden visual system (12/11/2026)

## Free and licensed art stack
- **PixiJS 8** (open-source renderer): native 480×270 canvas, nearest pixel scaling, no per-player texture fetch.
- **Kenney Tiny Farm v1.0 & Tiny Town v1.1** (CC0): packed 16px texture atlases in `public/pixel-shop/atlases`. Metadata and licensing: [ASSET_SOURCES.md](./ASSET_SOURCES.md).
- **Original procedural pixel decorations** (in `components/pixel-shop/art.ts`): timber/striped canopy, plants, flowers, chalkboard, juice service and fruit case, ceramic terrace, bistro tables, barista, cats, dog, guest variants. No paid or unlicensed graphic imports.
- **Native CSS**: redesigned warm café branding, modern mobile bottom controls, responsive frame, improved keyboard focus and motion preference.
- Reference assets reviewed but **not bundled**: [Corner Cafe (free)](https://hopefulsham.itch.io/corner-cafe-free-tileset), [Cozy Shops CC0](https://ptdesigns.itch.io/cozy-shops-pixel-art-props-tiles). Different camera projections and palettes must not be mixed into the scene without a design review.

## Art direction
- Palette: deep forest `#204C3E`, leafy green `#478C65`, warm cream `#FFF5D8`, terracotta `#D8785A`, honey `#FBD87E`, cool aqua `#82C8C0`.
- A warm, legible, lush juice bar; recognisable fruits, menu boards, human faces and five furnished outdoor bistro tables.
- Consistent character style with larger faces, highlights, expressive eyes, uniform/apron and simple walking steps. No external image generation was used.
- World depth remains a single sortable Pixi container, with counter-front masking and feet-based guest sort.

## Non-negotiable technical contracts
- Logical map `480×270`, four unchanged `HOTSPOTS`, five `TABLES` and 15 `SEATS`.
- Shared deterministic pathfinding, realtime protocol, order API and mobile camera mapping must not be altered by art.
- The UI must remain accessible without WebGL via the HTML menu fallback.
- Desktop/mobile screenshots should be captured from the real running Pixi canvas and reviewed before production merge.

## Release status
Visual redesign is a **draft PR** on `feature/pixel-art-2d-mobile-20261109`. Automated tests and captured screenshots are required, but they do **not** certify the 20-user load test, physical-device Safari/Chrome, idempotent orders or production cutover.
