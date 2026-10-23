# Vườn Ép agent workflow

Operate six dedicated specialised agent configurations in `.claude/agents/`. These are **agent definitions**, not a claim that separate agent sessions have been executed. Suggested delegation order:
1. `seasonality-researcher` -> harvest calendar, sourcing and recipe season correctness.
2. `product-architect` -> buyer journeys, truthful pricing and checkout specification.
3. `ui-art-director` -> visual and mobile review.
4. `commerce-integrator` -> Next.js-to-Google-Sheets persistence and safety.
5. `seo-content` -> copy and discoverability.
6. `qa-accessibility` -> validation and release gate.

For each change, run at least 5 quality passes against the checklist in `docs/FIVE_REVIEWS.md`. Every pass must identify real issues or state verified evidence; do not mark browser tests passed unless actually run.
