# Vườn É — approved 2D storefront reference (27 October 2026)

## Status: **Approved 3:2 art integrated on PR #16; awaiting final browser visual QA**

**Sole approved visual reference:** user-supplied file `Quán nước ép Vườn É đáng yêu(2).png`.
**Asset verification:** 1536 × 1024 pixels (3:2), RGBA PNG, SHA-256
`6b7bed377b935a74fe09be76e36077f87cb51da6732ad5176adeb37958bd1525`.

**Update:** The original full-resolution source remains in the conversation, and two retouched 1536×1024 WEBP derivatives plus clerk/dog/cat transparent sprites have now been committed as real Git binary blobs on PR #16. Review the browser screenshots for remaining inpainting seams before design sign-off.

### Non-negotiable visual design

- **Use the attached image itself** as the art source. Do not substitute a newly illustrated SVG, random stock artwork, generic 3D models or another AI image for the approved backdrop.
- The scene is an **open-front Vietnamese 30 m² juice shop, roughly 6 m wide**, with a single order counter, hanging hand-lettered menu, bottle coolers, fruit stands, timber furniture, shade parasol and **customer seating on the pavement directly outside**.
- Preserve composition, handmade watercolour/anime-line finish, warm morning sunlight, lush overhanging green foliage, cream walls, warm timber, lively fruit-colour palette, a cute green-capped worker, a resting dog and cat.
- The approved sign reads **“Vườn É”** and **“NƯỚC ÉP TỰ NHIÊN”**; avoid silently replacing the mark with “Vườn Ép”. Text requirements outside the illustration are a separate brand/product decision.
- One immersive **2D point-and-click screen**, not an avatar walking through a 3D scene. No route change during menu, basket or checkout.
- The image has **instruction clouds, shopping basket, and help widgets baked into it**. These must first be painted out in a *clean* reproduction, restoring obscured background in the original style; the real UI is HTML layered above the clean image. Never leave duplicate bubbles or fake carts visible underneath interactive components.

### Production assets (to be created)

1. `public/art/vuon-e-original-composition.webp`: clean UI-free 3:2 artwork with characters retained, serving as fail-safe fallback. `public/art/vuon-e-approved-clean.webp`: painted-out character-free backdrop for independently animated sprites.
2. `public/art/layers/clerk.png`, `dog.png`, and `cat.png`: initial transparent actor layers are committed and animated. Leaf is currently procedural CSS; finer face/arm/tail rigging remains potential polish beyond the initial pass.
3. Store original high-resolution image in the art-production source archive with its SHA-256. Do not overwrite or downsample the original master.
4. Do not claim SAM 2 can reconstruct occluded areas: segmentation and inpainting are separate operations. Krita/manual retouch needed for consistent edges.

### Approximate interactive positions on approved 1536 × 1024 artboard

These bounds are **draft hit targets**, not tight segmentation masks. Each is a centre coordinate plus width and height in pixels. Validate visibly against the clean illustration, then translate to percentages (`x / 1536 * 100`, `y / 1024 * 100`). Avoid overlapping hotspots; allow a minimum finger-friendly interaction area on mobile.

| Target | Centre (x,y) | Box (w×h) | Action |
| --- | ---: | ---: | --- |
| Main “Vườn É” sign | 784, 176 | 520×150 | Welcome/brand |
| Hanging menu boards | 768, 407 | 360×134 | Open 2D catalogue |
| Worker behind counter | 653, 572 | 185×169 | Open 2D catalogue |
| Fruit/crate counter area | 827, 620 | 140×109 | Open fruit selection |
| Bottle cooler | 961, 652 | 125×270 | Open drinks |
| Left outdoor table | 579, 863 | 255×204 | Seating story |
| Right outdoor table/drinks | 1246, 842 | 220×176 | Drink detail / seating |
| Tree canopy | 261, 172 | 350×251 | Garden story |
| Parasol | 1358, 558 | 285×169 | Outdoor seating story |
| Dog in foreground | 370, 931 | 210×101 | Friendly animal interaction |
| Cat at right | 1394, 817 | 175×135 | Friendly animal interaction |
| Wooden category signs | 134, 492 | 220×303 | Category menu |

### Interaction and accessibility contract

- Mouse hover / keyboard focus: a **single** softly animated HTML cloud tooltip, never one permanently printed on the scene.
- Click or Enter/Space: activate target. On coarse pointers, first tap previews and second tap activates, accompanied by clear touch guidance.
- Menu, basket and checkout are dialogs/overlays **on the same page URL**, keyboard accessible, Escape dismissible, with focus returned to the triggering control.
- Scene remains aligned at **3:2**. On portrait/mobile, use natural cropping / scrollable viewport focused on the counter, without distorting the artwork or decoupling image and hotspot coordinate systems.
- Keep cart state, existing product catalogue and server order route. GitHub Pages build must continue to be labelled **demo**; never pretend static demo checkout places a real order.
- Animate leaves, worker waves, small animal movements and subtle sunlight with CSS/GSAP or optional sprites. Honour `prefers-reduced-motion`. Do not alter the approved shape/style of characters during animation.

### Why the current homepage is NOT visually approved

At commit `af23fdb76b1839c0459811b91a66cb2a7dddd715` the homepage renders `components/2d-shop/shop-illustration.tsx`, a different hand-coded **1440 × 810 (16:9) SVG** and `components/2d-shop/illustrated-shop.css` uses `aspect-ratio:16/9`. Its hotspot registry targets that different layout. Working hotspot logic does **not** imply visual fidelity to the reference. Do not merge a “done” label on the strength of static source assertions alone.

### Delivery gates

- Clean asset reviewed at native resolution against the approved image.
- Layer seams and reconstructed background inspected at 100% zoom.
- Automated Playwright screenshots at desktop **1536×1024** and mobile **390×844**, with stable font/layout loads; use `pixelmatch` only on suitable deterministic regions and a human visual review for artistic fidelity.
- Hover cloud stays near every target; no baked instruction is visible before hover.
- Clickable menu, add/remove cart, checkout overlay and `location.pathname` persistence verified in a running browser.
- Test reduced motion, keyboard/tab, touch and GH Pages `/coffee_corner` base path.
- The image files are present; merge only after image-dependent CI and screenshots have been reviewed.

## Implementation order

**1.** Original image → retouched *clean background*; **2.** isolate foreground motion sprites; **3.** bind approved coordinate map to relative image artboard; **4.** reuse existing React menu/cart/checkout overlays; **5.** browser screenshots and 3–5 focused feedback rounds; **6.** merge only after visual and functional verification.

The existing SVG is now an emergency fallback; the committed approved-art WEBP scene is loaded by default when assets are available. The deployed main site changes only after PR merge.
