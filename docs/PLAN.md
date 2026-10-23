# VƯỜN ÉP — Product plan & implementation specification (v1)

**Repository:** `AnTuY154/coffee_corner` (fresh Next.js App Router rewrite; original files intentionally not reused).
**Audience:** Vietnamese customers ordering seasonal juice from mobile first, desktop second.
**Objective:** Understand the drink, see actual recipe and seasonal availability, add to basket, submit order for seller confirmation via Google Sheets.

## 1. Brand / Visual direction

- Working name: **Vườn Ép** (provisional until the owner approves it).
- Art direction: a small Vietnamese garden in natural daylight; ivory/leaf green/sunflower/coral, serif headlines + clear sans-serif body, large whitespace, editorial cards and 4 season colour families.
- Interaction: gently floating product illustration, cards lifting on hover, reveal via layout transitions and accessible navigation. No autoplay videos, heavy parallax or scroll-jacking. Honour `prefers-reduced-motion`.
- Mobile: 360–430px first. Sticky top navbar with cart badge and hamburger menu. Two-column product tiles on narrow screens. Desktop: four-column cards. Keyboard focus, accessible alt text, form labels and skip link.
- Current visuals: **24 original local SVG drink illustrations**, NOT product photographs. Real drink photos and commercial identities are a prelaunch requirement.

## 2. Information architecture

| Route | Purpose |
|---|---|
| `/` | Editorial hero, 4 seasons, seasonal selection, brand principles, CTAs |
| `/menu` | 24 recipes; season/month/search filters |
| `/san-pham/[slug]` | Individual illustration, selling price, months, measured ingredient recipe, preparation steps, fruit explanations |
| `/lich-mua` | Month 1–12 harvest guide and citations |
| `/gio-hang` | Locally persisted basket and quantities |
| `/thanh-toan` | Contact/address, preferred payment, notes, submit for confirmation |
| `/ve-chung-toi` | Seller contact and brand concept |
| `POST /api/orders` | Server-side validation and secured Google Apps Script bridge |

## 3. Research-based merchandising and season definitions

Vietnam does not have one nationwide harvest schedule; north, south and Central Highlands differ. Our marketing collections group the calendar into four **three-month product seasons**, not meteorological claims. Ingredient availability can change with region/variety/weather and requires seller confirmation.

| Collection | Months | Example season anchors | Recipes |
|---|---|---|---:|
| Mùa xuân | 1–3 | cam, quýt, bưởi, dâu tây, dưa hấu | 6 |
| Mùa hạ | 4–6 | xoài, dứa, vải, mận, chôm chôm, măng cụt | 6 |
| Mùa thu | 7–9 | nhãn lồng, bơ, thanh long, na, ổi, bưởi sớm | 6 |
| Cuối năm | 10–12 | cam, quýt, bưởi, hồng giòn, ổi, dâu đầu vụ | 6 |

All 12 month entries and each recipe's specific narrower months are in `data/catalog.ts`. For a soft fruit (mango, avocado, na, etc), call its **method 'Xay'** rather than misrepresenting it as cold-pressed juice. No unverified health/medical benefit claims.

Sources to re-check annually:
- ACIAR fruit season table: https://www.aciar.gov.au/sites/default/files/legacy/node/13111/tr26_pdf_40751.pdf
- TTXVN 2026 lychee: https://baotintuc.vn/kinh-te/mua-vai-2026-chu-trong-chat-luong-thuong-hieu-va-gia-tri-gia-tang-20260528064735360.htm
- Regional month-by-month cross-check: https://roots.vn/blog/vietnamese-seasonal-fruits-a-month-by-month-harvest-calendar-how-to-choose-fresh-fruit

## 4. Product data spec

```ts
Product = {id,slug,name,tagline,season,months:number[],price:number,image,
 colors,ingredients:[{name,amount}],method:'Ép'|'Xay',steps,flavour,description,badge}
```

Price and ingredients in repository are **sample business assumptions**, not confirmed selling prices or exact production recipes. Use real recipes and input costs before opening orders. Seller info from `NEXT_PUBLIC_STORE_PHONE`, `_ADDRESS`, `_HOURS` and placeholder when missing. No fabricated seller identity.

## 5. Checkout and Sheets specification

1. Cart persists only product IDs/quantities in localStorage (no customer PII).
2. Checkout collects name, Vietnamese phone, delivery address, optional instructions, COD or transfer **after** confirmation.
3. Next `POST /api/orders` checks structure, phone, quantities, recomputes server prices, size caps and validates Apps Script URL. Shared secret is kept in environment variables only. A stable browser `requestId` is used to avoid duplicate saves when network retries.
4. Apps Script validates secret, locks writing, de-duplicates order ID, escapes spreadsheet formula prefixes and appends one row to `Orders`.
5. Success UI only appears when Apps Script returns `{ok:true,orderId}`. No fake success, no online charging and **no automatic shipping-fee quotation**.
6. Seller confirms actual fruit inventory, price, delivery fee and delivery time by phone before order is accepted.

Columns: `Order ID`, `Created At (UTC)`, `Customer`, `Phone`, `Address`, `Payment method`, `Items (JSON)`, `Subtotal (VND)`, `Delivery fee`, `Status`, `Note`.

Known limitation for production: anonymous endpoint abuse/rate limiting, spam checks, legal privacy policy/retention, delivery zones & cost rules, operating hours and actual inventory. Add shared persistent rate limiting and CAPTCHA/Turnstile if accepting unrestricted Internet traffic.

## 6. Technical stack & nonfunctional requirements

- Next.js 15 App Router, React 19, TypeScript strict, CSS responsive, `lucide-react`, no database required for initial catalog, no user accounts.
- Semantic markup, keyboard tab navigation, alt images, motion reduction; verify with axe/Lighthouse before launch.
- SEO metadata, unique product metadata, sitemap, robots and Vietnamese language attributes.
- Performance targets (on a deployed instance): LCP <=2.5s, CLS <0.1, INP <200ms on representative mobile; targets require measurement, not claimed test results.
- Security: HTTPS, server-kept webhook and script secret, recomputed prices, request validation, anti-formula-injection, anti-frame headers; privacy content still requires merchant legal review.

## 7. Delivery phases

| Phase | Deliverables | Definition of done |
|---|---|---|
| A — Research and SPEC | Calendar, segmentation, 24 recipes, UX flows, agent responsibilities | >=5 recipes/season; source cautions; all routes specified |
| B — Visuals and customer UI | Landing, responsive catalog, detailed product pages, 24 visual assets, microanimation | Every product has a local image and dedicated detail route |
| C — Basket and orders | Cart, checkout, server endpoint, Apps Script | No order success unless verified Sheet append |
| D — Technical QA | Static catalog check, TS typecheck, Next build in CI, mobile/a11y review | CI green; 5 review passes documented; manual tests verified |
| E — Merchant launch | Real price, images, seller details, Google Sheet deployment, domain, shipping and privacy | Real order end-to-end with merchant-provided configuration |

## 8. Explicit launch gates / owner inputs

- Confirm brand/trade name, logo approval, seller contact number and physical/business address, opening hours.
- Supply real prices, cups/volumes, production recipes, ingredient procurement, service radius, delivery policies and payment transfer account if enabled.
- Create a Google Spreadsheet (private), deploy `scripts/google-apps-script.gs` as Web App, set Script Properties, configure server secrets and test a real order.
- Upload real photographs/licensed assets; original local illustrations can remain placeholders for demonstration.
- Run live browser tests on iOS Safari, Android Chrome and desktop, and verify privacy/terms/cancellation notices.

**Honest status:** Implementation is provided as a source branch/project; it is not a publicly deployed shop and cannot record actual Google Sheet orders until merchant secrets and script deployment are configured.
