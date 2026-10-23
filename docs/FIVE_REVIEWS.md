# Five-pass UI / SPEC review log

**Scope:** Five sequential static reviews of the spec, catalogue and implementation. Dedicated agent prompts have been created but **not invoked as separate parallel Claude Code sessions** here. A full mobile browser QA and external Sheets write test remain launch gates.

| Pass | Reviewer lens | Issue discovered | Change applied / decision | Status |
|---|---|---|---|---|
| 1 | Product + seasonality | October is not reliably called 'winter' in Hanoi; nationwide fruit calendar cannot be reduced to one rigid harvest window | Label October–December collection as **Cuối năm** and include note about region/variety/year; use recipe-specific month arrays | Static review complete; regional supply still needs seller confirmation |
| 2 | Culinary + truthful content | Soft fruits such as mango, avocado, mangosteen and na cannot be honestly described as the same 'ép' preparation as citrus | Added `method: 'Ép'/'Xay'`, measured ingredients, preparation and ingredient explanations, all on detail pages | Static data check complete; recipes require kitchen testing |
| 3 | Buyer UX | A checkout that hides delivery fees and pretends to accept orders creates financial and trust risk | Display **Tạm tính**, disclose unquoted delivery fee, show seller verification and never mark order confirmed | Static UX review complete; merchant must supply contact and delivery rules |
| 4 | Commerce + security | Client prices are forgeable, Sheets can evaluate pasted formulae, unstable order IDs can duplicate submissions | Server-side price lookup and quantity cap; Apps Script shared secret/lock/formula escaping; stable request UUID used for retry de-duplication | Static implementation review complete; remote integration untested |
| 5 | Mobile + accessibility + SEO | Mobile nav/keyboard users need discoverable focus and simpler controls; visual effects should respect reduced-motion | Responsive 2-column mobile cards, labelled navigation/forms, skip link, reduced-motion CSS, descriptive alt, metadata/sitemap/robots | Static check complete; real devices/a11y audit pending |

## Acceptance tests (not to be called passed until executed)

- [x] All four collections have at least six product objects.
- [x] The entire January–December calendar is represented.
- [x] All 24 products have individual local illustration files and structured recipes.
- [x] Customer contact and quote-confirmation placeholders are explicit.
- [x] Server ignores client prices and includes an Apps Script adapter.
- [ ] TypeScript compile **in an environment with npm packages installed**.
- [ ] Next.js production build + CI green.
- [ ] Manual keyboard/360px mobile/desktop checkout check.
- [ ] Confirm a real order row in an owner-configured Google Sheet.
- [ ] Replace demo menu prices/illustrations, add legal merchant details, test production shipping.

## Next QA order

Run `npm install && npm run check:catalog && npm run typecheck && npm run build`, then verify source-to-Sheets end-to-end with the real webhook and a test order, then manual phone/desktop and axe checks.
