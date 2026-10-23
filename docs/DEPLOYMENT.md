# Vườn Ép — production deployment runbook

## Existing Google Sheet

Private business spreadsheet: https://docs.google.com/spreadsheets/d/1dpKiV2zToICNhmXpMpxzU5NAfvx5zhNIAhxcEtVK6SA/edit

Tabs: `Orders` (11 columns, frozen header and status validation) and `Hướng dẫn`. Do not make this spreadsheet public: orders contain customers' names, phone numbers and delivery addresses.

## Step A: deploy the Apps Script webhook

1. Open the Sheet link above as its owner, choose **Extensions → Apps Script**. The connected Google Drive integration cannot publish Apps Script web app deployments on your behalf, so this authorisation step is done in Google's Apps Script UI.
2. In the generated `Code.gs`, replace the editor contents with `scripts/google-apps-script.gs` from this repository. Save.
3. In **Project Settings → Script Properties**, set:
   - `SPREADSHEET_ID`: `1dpKiV2zToICNhmXpMpxzU5NAfvx5zhNIAhxcEtVK6SA`
   - `ORDER_WEBHOOK_SECRET`: generate a cryptographically secure random 32+ byte secret; **do not commit it to Git or place it in NEXT_PUBLIC_ variables**.
4. **Deploy → New deployment → Web app**. Choose **Execute as Me** and **Who has access: Anyone**. Authorise the spreadsheet write permission. Copy the `/exec` URL; never use `/dev` for production.
5. When updating the script, choose **Deploy → Manage deployments → Edit → New version → Deploy** so that the production `/exec` URL continues to reference the latest version.

## Step B: host Next.js

Use a server-capable Next.js host such as Vercel. Import repository `AnTuY154/coffee_corner`, select branch `main`, framework Next.js, Node 22; no custom build command needed. A static GitHub Pages deployment is **not sufficient** because the checkout requires `/api/orders` running server-side.

Configure **server** environment variables:

- `GOOGLE_APPS_SCRIPT_WEBHOOK_URL`: deployed Apps Script `/exec` URL.
- `ORDER_WEBHOOK_SECRET`: EXACTLY the same secret as in Apps Script.

Configure public store metadata before accepting real customers:

- `NEXT_PUBLIC_SITE_URL`: production HTTPS domain, no trailing slash.
- `NEXT_PUBLIC_STORE_PHONE`, `NEXT_PUBLIC_STORE_ADDRESS`, `NEXT_PUBLIC_STORE_HOURS`: verified real seller details.

Never expose Apps Script secrets in frontend code or a public GitHub repository. Add managed request rate limiting (e.g. platform WAF) and spam protection before accepting unrestricted orders.

## Step C: end-to-end production gate

- `npm install`, `npm run check:catalog`, `npm run test:orders`, `npm run typecheck`, `npm run build` pass.
- Confirm home, listing, all product pages, recipes, basket and responsive layout at 360 / 390 / 768 / 1440px.
- Submit a small test order with a clearly marked name and confirm exactly one row appears in the **Orders** sheet. Refresh/retry the exact same request UUID and confirm no duplicate row.
- Verify bad secret is rejected and malformed carts cannot be accepted. Test when webhook is offline; do not report order success if Google fails.
- Replace placeholder seller details, sample prices and vector mockups with approved production data and photos.
- Verify privacy notice, retention policy, service/delivery area, contact method and your billing/tax compliance obligations.

**Publication status:** publishing a GitHub commit or merging the PR is NOT a website deployment. The Apps Script web app and Next.js host each require their own deployment and secret configuration. Do not announce working online orders until Step C passes against the real owner-hosted endpoint.
