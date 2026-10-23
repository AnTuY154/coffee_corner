# Vườn Ép — GitHub Pages 3D demo

## Purpose
Publish the immersive **static DEMO** at `https://antuy154.github.io/coffee_corner/` and the game at `https://antuy154.github.io/coffee_corner/3d-shop/` once Pages is activated.

**Important:** GitHub Pages cannot execute the Next.js `POST /api/orders` route. The demo deliberately does **not** accept customer details or submit orders. Order placement requires a production Node.js host + configured Google Apps Script. The 3D shop, seasonal menu, product details and local cart work without a server.

## GitHub Actions
The workflow `.github/workflows/github-pages.yml` runs on pushes to main and on manual dispatch:
- npm install, checks, static export using `npm run build:pages`
- Uploads `out/` as a Pages artifact
- Deploys from main with `actions/deploy-pages`

`build:pages` temporarily renames the POST API route *only inside the CI checkout* and restores it afterwards; source in main retains the real API for production. Image paths are prefixed with `/coffee_corner` by the build-only loader.

## One-time GitHub Pages activation
If the deployment job says Pages is not enabled or deployment is blocked:
1. Open https://github.com/AnTuY154/coffee_corner/settings/pages
2. Under **Build and deployment → Source**, select **GitHub Actions**.
3. Re-run **GitHub Pages 3D demo** at https://github.com/AnTuY154/coffee_corner/actions/workflows/github-pages.yml
4. Verify Pages actually returns HTTP 200 and the product images work before sharing.

No secret should be put into this public static bundle.

## Test locally
Run `npm install` then `npm run build:pages`; output is `out/`. Serve `out/` underneath the URL prefix `/coffee_corner`, not at domain root. Test paths:
- `/coffee_corner/`
- `/coffee_corner/3d-shop/`
- `/coffee_corner/menu/`
- `/coffee_corner/san-pham/<slug>/`
- `/coffee_corner/gio-hang/`
- `/coffee_corner/thanh-toan/` (demo banner; no customer form)
