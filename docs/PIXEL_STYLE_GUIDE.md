# Cozy Garden Café — style guide for /pixel-shop

- Main CC0 art: Kenney Tiny Farm 1.0 and Tiny Town 1.1, each a 16×16 tilesheet.
- Source and licenses: [ASSET_SOURCES.md](./ASSET_SOURCES.md).
- Palette: cream #FFEDBD, roof #E38A58, wood #986C4F, grass #80BD77, dark green #326A50, orange #FFA446.
- Canvas keeps a logical 480×270 map; map model owns 4 hotspots, 5 tables and 15 seating spots.
- Pixel art must use nearest filtering, reusable Texture subrectangles, no per-player image downloads.
- Draw order: backdrop, props, employee standing behind counter, counter front, guests depth-sorted by foot Y.
- Mobile follows avatar; Toàn sân can be selected. Menus use HTML/CSS for accessible text.
- Keep Graphics fallback when CC0 atlas cannot load; never ship paid art or unclear-license PNGs.
- G0/G1 graphics checkpoint only; NOT approval of 20-player backend, mobile-device QA, animated animals, 30-minute load testing or production cutover.
