# /pixel — Half-body barista, greeting wave and customer chat

## UI implementation

- Replace the tiny head-only cashier with a larger, hand-drawn pixel bartender (green cap with leaf emblem, cream sleeves, visible green apron, happy face and a raised hand). The character is fixed behind the reference counter at (249, 170) logical world pixels. Counter-front z=217 hides only the part below the countertop; employee z=210 remains below it. No character walks out.
- Animation redraws only the forearm: 2 subtle wave frames plus idle, repeating about every eight seconds. Honors reduced-motion. The main body and head remain fixed.
- The existing speech bubble is shifted to the **left of the employee** and docked safely on mobile, keeping the larger face readable. Welcome, promotions and optional Vietnamese voice remain unchanged.
- Add a floating **Chat với Vườn É** widget, anchored above mobile bottom navigation, with typed questions, suggested topics, product information and clickable shop catalogue actions. It does **not** connect to a real human; the UI calls this out and explicitly says messages stay in browser memory (no network send, no persistent storage). No API key or remote service.
- Deterministic FAQ uses `data/catalog.ts` for SKU names, price, product characteristics and seasonal information. Unverified store hours, stock and fees are not guessed.
- The existing `/` homepage, multiplayer model, pet motion, order API, route and 15 chair positions remain unchanged. The user-supplied reference `scene.webp` and 12 foreground layers are preserved to retain 3:2 art and navigation alignment.

## QA requirements

- `npm run typecheck && npm run build && npm run test:garden:unit && npm run test:reference-art:required`.
- Chromium desktop/mobile tests: open/close chat, ask about a real product, check price, search for a newly launched product without unsupported claims, open menu and fruit category from chat, and verify disclaimers for store hours or delivery fees.
- Static-body test ensures torso position remains unchanged while forearm waving is permitted. Existing seated-guest and 2.5D motion reviewer must still pass 16/16 no-retry cases.
- Manual visual QA: inspect a full desktop 3:2 screenshot plus narrow mobile viewport to ensure face and apron visible, speech bubble does not hide the cashier, and floating chat doesn't obstruct the seating or bottom navigation.

## About the provided mock-up

The mock-up was supplied as a visual direction. We preserve the approved reference scene instead of replacing it with a differently proportioned image (generated mock-up is 4:3 versus current 3:2), which would shift the 15 seat hitboxes and menu hotspots. The cashier is reimplemented as separate Pixi artwork so he can wave while the counter and product interactions stay independent.
