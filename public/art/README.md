# Vườn É — approved 3:2 art package for PR #16

The React scene now supports **two backgrounds and three extracted moving actors**, not a recreated SVG.

### Exact files required (relative to repository root)

- `public/art/vuon-e-original-composition.webp` — 1536×1024 approved layout without baked speech bubbles/UI, but with worker/dog/cat still visible. **Fail-safe art fallback**.
- `public/art/vuon-e-approved-clean.webp` — 1536×1024 *same scene*, with worker/dog/cat removed and the hidden environment roughly reconstructed.
- `public/art/layers/clerk.png` — 205×195 transparent worker.
- `public/art/layers/dog.png` — 215×125 transparent dog.
- `public/art/layers/cat.png` — 180×130 transparent cat.

The original approved master is the user's 1536×1024 PNG in the conversation. **No new SVG or newly generated alternate shop is acceptable as its replacement.**

### Runtime behavior

1. Load `vuon-e-original-composition.webp` and position HTML hotspots on the same 3:2 image.
2. Preload the character-removed backdrop and **all three** transparent PNGs.
3. Only when all four preloads succeed, atomically switch to the reconstructed backdrop with animated sprites in exactly corresponding pixel coordinates.
4. If some assets are absent, never show a blank cashier/cat/dog: fall back to intact `vuon-e-original-composition.webp`.
5. If even the composition is unavailable, preserve the old 16:9 React SVG shop as a temporary fallback. **That fallback does not satisfy visual approval.**

The `NEXT_PUBLIC_BASE_PATH` is applied to all asset URLs, including GitHub Pages `/coffee_corner`.

### QA commands

```sh
npm run test:art:required
npm run test:2d
npm run test:immersive
npm run typecheck
npm run build
npm run test:2d:visual
```

The last command needs Playwright Chromium and a built Next.js app. The dedicated GitHub Actions **Approved Vườn É 2D visual QA** workflow runs these asset-required/browser checks and uploads screenshots. It intentionally fails if the 5 binary art files are not in GitHub.

### Progress and known imperfections

- All five assets have been produced **locally** and packaged as `vuon-e-complete-asset-pack.zip` in the ChatGPT conversation.
- The GitHub connector currently handles text/base64, but does not transfer local binary attachments automatically; so the real 5 image assets must still be committed before merging PR #16.
- Inpainting of the old top-left welcome label and umbrella instruction cloud has visible painterly artifacts at high zoom; sprite alpha boundaries may include a few background fragments. They require visual review before final approval.
- Playwright screenshots have been verified against a standalone HTML simulation both at 1536×1024 and 390×844. Browser CI for **the actual Next.js site** runs only after the five assets are present.

Do not merge solely because TypeScript/unit builds are green. The finished storefront is blocked on **real art upload and visual sign-off**.
