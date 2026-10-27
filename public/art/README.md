# Vườn É — illustration asset integration

The website is wired to `/art/vuon-e-approved-clean.webp`, and uses the existing SVG while the image is absent.

## Required file

Add `public/art/vuon-e-approved-clean.webp` at **1536×1024 (3:2)**, derived **only** from the exact approved user image `Quán nước ép Vườn É đáng yêu(2).png`. Keep the image uncropped and in the same illustration style. Image generation of a merely similar storefront does not qualify.

**Before naming the asset "clean":** remove all original painted-on instruction balloons, help icons, welcome overlay, and shopping-cart widget. Reconstruct background details hidden underneath. Verify worker, signage, trees, cat, dog, patio tables and shop remain unchanged.

The original source image is stored in the user conversation, **not** committed here. The GitHub connector in this implementation cannot upload the conversation's local binary file directly. Never replace this with a broken URL or a generated stand-in.

## Behaviour

- Original approved dimensions: **1536×1024**, CSS stage: **3:2**.
- Desktop viewport may letterbox; the image is NEVER cropped or distorted.
- Mobile keeps the same hit target coordinate space and scrolls to the centre.
- Mouse hover and keyboard focus show HTML cloud hints; touch needs two taps.
- Menu/cart/checkout stay on the same URL; legacy /3d-shop remains available.
- `NEXT_PUBLIC_BASE_PATH` is applied so GitHub Pages at `/coffee_corner` resolves assets.
- Reduced-motion preference turns off ambient effects.
- The original 16:9 SVG remains the active fallback until the WEBP is provided.

## Before merging

1. Confirm the source artwork matches the approved conversation image.
2. Inspect 100% crop for hand/face/leaf details and inpainting seams.
3. Commit the binary file above; verify `out/art/vuon-e-approved-clean.webp` on static build.
4. Run unit tests, TypeScript and build.
5. Capture Playwright screenshots for desktop 1536×1024 and mobile 390×844; inspect hotspots and overlay.
6. Confirm accessibility (Tab, Escape, touch), checkout and no URL navigation.

Do not mark the PR ready solely because static tests are green: missing or wrong art is a visual blocker.
