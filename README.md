# Vườn Ép — Seasonal Juice Store

Next.js 15 + React 19 + TypeScript, a fresh buyer-facing seasonal juice storefront written from scratch for `AnTuY154/coffee_corner`.

**Current state:** customer pages, 24 season-linked drinks with unique local illustrations, product recipes, basket and checkout UI, a validated `/api/orders` endpoint and an Apps Script Google Sheets adapter. **Not production-live:** shop-specific merchant details and Google Sheet secrets have not been configured, and an external integration test is pending. Prices/recipes/illustrations are demonstration content.

## Start locally

Requires Node 20.9+:

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open http://localhost:3000. The menu, detail pages and basket work without Google Sheets. Checkout intentionally returns an error until configured.

## Connect Google Sheets to orders

1. Use the [existing private Vườn Ép Google Sheet](https://docs.google.com/spreadsheets/d/1dpKiV2zToICNhmXpMpxzU5NAfvx5zhNIAhxcEtVK6SA/edit), which already contains `Orders` and `Hướng dẫn`.
2. In Google Sheets, choose **Extensions → Apps Script**. Paste `scripts/google-apps-script.gs` into the editor.
3. In **Project Settings → Script Properties**, create `SPREADSHEET_ID` and `ORDER_WEBHOOK_SECRET` (choose a long random secret). The same secret must be set in Next.js server environment.
4. In Apps Script **Deploy → New deployment → Web app**, choose **Execute as: Me** and **Who has access: Anyone**. Copy the deployed `/exec` URL (not a test `/dev` URL). Permissions are needed for script to write to your private Sheet.
5. Set server environment variables:

```dotenv
GOOGLE_APPS_SCRIPT_WEBHOOK_URL=https://script.google.com/macros/s/DEPLOYMENT_ID/exec
ORDER_WEBHOOK_SECRET=your-long-random-secret
NEXT_PUBLIC_STORE_PHONE=...
NEXT_PUBLIC_STORE_ADDRESS=...
NEXT_PUBLIC_STORE_HOURS=...
NEXT_PUBLIC_SITE_URL=https://yourdomain.vn
```

6. Restart/redeploy Next.js, submit a small test order, and check the new `Orders` sheet. A row with `NEW_UNCONFIRMED` means the seller must still confirm price, stock, delivery zone/fee and timing. No cards are charged here.

**Important:** The Apps Script `/exec` endpoint is accessible to the public, but the shared secret is never sent by the customer browser: only the Next.js server calls it. Do not put either secret or the Google Spreadsheet ID in `NEXT_PUBLIC_` variables. For an Internet-facing launch, add managed rate-limiting and spam protection and publish a real privacy policy.

## Quality checks

```bash
npm run check:catalog
npm run test:orders
npm run typecheck
npm run build
```

The source includes a GitHub Actions workflow to run these quality gates on pull requests and main. Hosting deployment is a separate step; see `docs/DEPLOYMENT.md`.

## Specialised agents and five passes

Six Claude Code agent prompts are provided at `.claude/agents/` and their roles are described in `CLAUDE.md`. Full product plan: `docs/PLAN.md`. The five static review passes, mitigations and still-pending browser/integration gates: `docs/FIVE_REVIEWS.md`.

## Source and usage

Images in `public/products/` are **original vector illustrations** generated for this prototype. They are not actual beverage photos, and should be replaced/augmented after product photo shoots. Fruit months are indicative, not real-time stock data.


## Cửa hàng 3D nhập vai

Vào `/3d-shop` để di chuyển bằng WASD/phím mũi tên hoặc D-pad trên mobile. Đến gần quầy và nhấn E/chạm để mở menu. Có chế độ đi đến quầy tự động. Món thêm từ menu 3D dùng chung giỏ hàng và checkout hiện có. Nếu WebGL không khả dụng thì sử dụng `/menu`. Xem `docs/3D_SHOP_SPEC.md`.

Bản đầu dựng cảnh 3D bằng hình học procedural, chưa phải bộ model sản phẩm photorealistic. Google Apps Script Web App và hosting cần được kích hoạt riêng; xem `docs/DEPLOYMENT.md`.
