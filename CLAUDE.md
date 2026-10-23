# Vườn Ép agent workflow

Operate six dedicated specialised agent configurations in `.claude/agents/`. These are **agent definitions**, not a claim that separate agent sessions have been executed. Suggested delegation order:
1. `seasonality-researcher` -> harvest calendar, sourcing and recipe season correctness.
2. `product-architect` -> buyer journeys, truthful pricing and checkout specification.
3. `ui-art-director` -> visual and mobile review.
4. `commerce-integrator` -> Next.js-to-Google-Sheets persistence and safety.
5. `seo-content` -> copy and discoverability.
6. `qa-accessibility` -> validation and release gate.

For each change, run at least 5 quality passes against the checklist in `docs/FIVE_REVIEWS.md`. Every pass must identify real issues or state verified evidence; do not mark browser tests passed unless actually run.

## 3D shop agents
Use `3d-world-builder`, `3d-interaction-engineer`, `3d-performance-auditor` along with existing UX, QA, and commerce agents. See `docs/3D_SHOP_SPEC.md` and run `npm run test:3d` before build. Do not replace checkout with WebGL UI.

## 3D experience evaluation
Three role-based review/fix loops and evidence: docs/IMMERSIVE_REVIEW_LOOPS.md. Agent roles in .claude/agents/immersive-*.md. Do not regenerate a static image instead of modifying R3F code.
