# /pixel — Static staff, roaming animals, visible seats

- Staff: single standing pose, anchored behind the bar. No wave, walking, or petting at any time.
- Dog + two cats: deterministic looping paths and simple walk/tail cadence, updated on the client only. Reduced-motion users see stationary pets.
- Seating: walking guests keep ordinary feet y-sorting; seated guests render in front of all foreground table WebPs (highest table z=295). This prevents the reference artwork from covering the actor entirely.
- Standing: a visible **Đứng dậy** button works on mobile and desktop, in addition to tapping the same chair. Local preview places the actor at that chair's approach point.
- No changes to `/`, menu content, 15 seat IDs, hotspot IDs, shared room protocol, or the realtime Worker.

## QA gates

1. `npm run test:garden:unit`: 15 seat IDs, seated depth above foreground furniture, pet route validity and deterministic movement.
2. Playwright desktop/mobile: `/pixel` must load reference art, tap table-3-bottom, see stand-up action, capture occupied-seat screenshot, stand up again.
3. Playwright desktop: capture identical barista crop at two different times (employee never animates or leaves counter).
4. Next.js typecheck/build and old homepage visual QA before merging to `main`.
