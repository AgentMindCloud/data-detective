# TEST_REPORT — Claimwatch Desk / Data Detective

Task: TSK-5DV55M47 / `0x95c8e16df43973aff8db7c08ca4e21da4cf28ae880d675f81c23d4a04db317fe`

Date: 2026-09-13. Environment: Linux box, Node v20.19.2, Google Chrome headless, python3 http.server.

**Do not invent results.** Figures below are from actual runs in this session.

## Automated domain tests

Command:

```bash
node tests/test_domain.mjs
```

**Result: Passed: 44 / Failed: 0**

Coverage includes: seeded RNG reproducibility; axis-view identity of values/stats vs appearance change; population cafe share 20%; biased cafe sample over-representation; random/systematic draws; large biased n=120 still biased; makerspace pooled r > 0.7 with weaker within-group r; conclusion evaluator; headline ≥2-issue heuristic; progress percent.

## Acceptance examples → evidence

| Acceptance example | Evidence |
|---|---|
| Changing an axis changes rendering but not underlying values/stats | `compareAxisViews` tests PASS; UI shows mean/min/max unchanged; table identical. Screenshot `assets/screenshots/graph-1280.png` (zoomed view + feedback). |
| Charts have labelled axes/units, accessible table, reset | Graph screen: axis note with units; accessible table; Reset view button. |
| Biased and less-biased procedures match docs | Cafe volunteer vs random/systematic definitions in `js/data.js`; tests assert cafe over-representation and unique random ids. Screenshot `sample-1280.png`. |
| Repeated sampling reproducible in tests | Seeded `createRng` sampling identity PASS. |
| Correlation activity states association ≠ causation | On-screen trap headline + conclusion choices; evaluator rejects pure-cause option. Screenshot `corr-1280.png` (stratified). |
| Final response: claim + observation + limitation feedback | Headline studio + self-review checklist; `scoreHeadline` feedback. |

## Manual / browser checks (Chrome headless + live local server)

| Check | Viewport | Steps | Outcome |
|---|---|---|---|
| Home loads | 1280×800 | Open `/` | Claimwatch Desk start screen; 0% progress. Shot: `home-1280.png` |
| Mobile layout | 360×740 | Open `/` | No horizontal document overflow (`scrollWidth` check false). Shot: `home-360.png` |
| Tablet | 768×900 | Navigate to Graphs | No overflow. Shot: `graph-768.png` |
| Desktop activities | 1280 | Graph zoom+check; sample draw; corr stratify | Shots: `graph-1280.png`, `sample-1280.png`, `corr-1280.png` |
| Keyboard | 1280 | Tab from load | Focus moves to interactive controls (observed `BUTTON:Less help` after tabs; skip link present in markup) |
| Reset | — | Reset lesson confirm | Clears `localStorage` key `claimwatch-desk-v1` and returns home |
| Reduced motion | CSS | `prefers-reduced-motion: reduce` rules in `css/styles.css` | Animations/transitions forced off |

## Numbered screenshot walkthrough

1. `home-1280.png` — Start / onboarding  
2. `home-360.png` — Mobile start  
3. `graph-1280.png` — Graph framing (zoomed axis + check feedback)  
4. `graph-768.png` — Graph framing tablet width  
5. `sample-1280.png` — Sampling investigation after draw  
6. `corr-1280.png` — Correlation stratified by club  

(Video omitted; numbered screenshots satisfy the walkthrough alternative.)

## Known limitations observed

- Headline scoring is heuristic (keywords), not prose understanding.
- Scatterplot is CSS-positioned dots (adequate for lesson, not a full charting library).
