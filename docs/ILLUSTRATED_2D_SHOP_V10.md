# Vườn Ép — illustrated 2D point-and-click shop

## User-directed experience
The new root `/` is a **single responsive 2D storefront**. The creative reference was a hand-painted, pastel open-front shop with lush plants, one employee behind a counter and café seating outside. The implementation is an **original local React SVG illustration**, not an embedded static screenshot of the concept. That makes interactive object positions, changing effects, accessibility and source-editable details controllable without WebGL or remote assets.

The intended **physical concept** is a 30 m² open shop with approx. 6 m street frontage, a front-facing order counter, seasonal fruit displays, a cooler and two patio tables/four seats at the front. The 2D illustration is evocative rather than an architectural drawing of exact dimensions. Warm timber, sage leaves, ivory canvas awning, paper-grain touches and slight autonomous motions match the approved illustrated direction.

The player **is not a visible avatar**. The player controls an on-screen cursor, hovering/focusing and selecting objects. The original avatar/cat/Shin and GLB architecture are **not instantiated on the home route**.

## Tooltip cloud system
`components/2d-shop/illustrated-shop.tsx` has a central `HOTSPOTS` registry. Each spot specifies:
- `id`, `name`, `hint`, `x`, `y`, `w`, `h` in percentages of a fixed 1440×810 illustration.
- `action`: order, intro, seats, garden or dog.
- `position`: above/below/left; cloud can flip near edges.

The cloud is a **DOM tooltip** with a hand-drawn border and tiny speech tail, *not embedded text baked into the art*. It is hidden until mouse hover, keyboard focus or first touch. Click activates a hotspot; on touch the first tap displays the tip and the second tap activates. Keyboard button activation opens immediately. Each button includes an accessible label and `aria-describedby` association.

Shop employee, menu blackboard, fruit baskets and cooler all open existing `ShopMenu2D`; signup, cart, and checkout stay on the same `/` URL. Intro, patio chairs, plants and dog open small explanatory dialogue cards.

## Motion and screen sizes
- Clerk waves, dog breathes, leaves sway, one decorative customer walks.
- `prefers-reduced-motion: reduce` disables all decorative illustration motion.
- Desktop uses a 16:9 artboard and logical pointer positions.
- Mobile can scroll the oversized scene horizontally, initially centred on the counter, without losing the tooltip positions. Each touch interaction exposes visible guidance.

## What remains unchanged
- Catalogue of 24 drinks and seasonal recipes
- Menu, basket and quantity controls
- Real protected `/api/orders` server checkout
- GitHub Pages static build **demo only** (must not collect a real order)
- Legacy `/3d-shop` code retained as a compatibility reference, but no WebGL required on the home route.

## QA and limitations
Run `npm run test:2d`, `npm run test:immersive`, `npm run test:3d`, `npm run typecheck`, `npm run build` and `npm run build:pages`. GitHub Actions should succeed prior to merge. Static assertions, even when green, **do not prove pixel-level image fidelity, CSS positioning or browser device performance**; these require actual desktop/mobile browser screenshots and manual walkthroughs.

## Suggested next art production step
If greater fidelity to the generated watercolor concept is desired, produce a new licensed, layered clean-background illustration (with **no preprinted clickable instructions**) and position the *same* hotspot registry above that image. Keep the component API/commerce logic intact.
