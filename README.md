# Data Detective: Can You Trust This Claim?

Free, static educational website (~age 15) for scrutinising **graph framing**, **sampling bias**, and **correlation vs causation**. Original **Claimwatch Desk** investigative theme — all organisations and headlines are fictional. No login, ads, analytics, or wallets.

**Live preview:** https://agentmindcloud.github.io/data-detective/

**Commit:**  (main)



**TaskMarket:** TSK-5DV55M47 / `0x95c8e16df43973aff8db7c08ca4e21da4cf28ae880d675f81c23d4a04db317fe` (free submission path, paid=false).

## Quick start (no install)

ES modules need HTTP (not `file://`):

```bash
python3 -m http.server 8080
# open http://127.0.0.1:8080/
```

Or: `npx --yes serve -l 8080`

**No build step.** Production = these files.

## Features

1. **Graph framing** — two (plus custom) views of the same Riverloop checkout series; axis window changes appearance; mean/min/max and table stay identical; copy explains context (not “all nonzero axes are deceptive”).
2. **Sampling investigation** — documented N=200 synthetic campus roster; cafe volunteer (biased) vs simple random / systematic (less biased); large biased sample demo.
3. **Correlation challenge** — makerspace hours vs score with club membership third variable; stratify; choose a careful conclusion; fictional headline combining ≥2 issues.

Also: onboarding, nav, progress, evidence notebook, hints, More/Less help, reset without reload, `localStorage` with clear Reset.

## Automated tests

```bash
node tests/test_domain.mjs
```

Requires Node 18+ (ESM). See `TEST_REPORT.md`.

## Architecture note

- `js/data.js` — learning copy + synthetic datasets + dictionary metadata.
- `js/domain.js` — pure calculations (axis compare, sampling, Pearson, scoring); seeded RNG.
- `js/app.js` — UI state machine; progress in memory/`localStorage` only.
- `assets/data/datasets.json` — bundled export of the same synthetic data.

## Privacy & safety

- No login, wallet, email, ads, analytics, or tracking
- No learner demographics collection
- No runtime generative AI or paid APIs
- Progress stays in the browser only

## Supported browsers / viewports

- Current Chrome, Firefox, Safari, Edge; Mobile Safari / Chrome Android
- Designed for 360px, 768px, 1280px widths
- Keyboard accessible; `prefers-reduced-motion` respected

## Known limitations

- Charts are CSS bar/scatter visuals, not a charting library — fine for the lesson, not for research plotting.
- Headline check is keyword/heuristic self-review, not NLP grading of free prose.
- Optional adult references live in `EDUCATOR_GUIDE.md`, not as a learner outbound-link maze.

## License

MIT — see `LICENSE`.
