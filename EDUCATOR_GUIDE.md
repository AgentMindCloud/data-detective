# Educator guide — Claimwatch Desk / Data Detective

## Objectives

Learners (~age 15) will:

1. Explain how graph presentation (especially vertical-axis range) can alter perceived effect size while numbers stay identical.
2. Identify a sampling limitation by comparing a biased convenience sample with a less-biased roster draw, including why a larger biased sample need not fix bias.
3. Distinguish correlation from causal evidence, use stratification by a third variable, and assemble a cautious conclusion plus a fictional multi-issue headline.

## Prerequisites

- Comfortable reading tables and simple percentages.
- Informal idea of “average” / mean.
- No prior statistics course required; Pearson *r* is shown as a summary number with plain-language framing.

## Suggested session length

10–15 minutes for the core path (graph → sampling → correlation → headline). Optional deeper exploration: custom axis, systematic sampling, notebook review, co-play prompts (~25 minutes).

## Activity walkthrough

### 1. Graph framing (Riverloop Shared Cycles — fictional)

- Switch **Context view** (baseline near 0) and **Zoomed view** (tight window).
- Optionally set a **custom** min/max.
- Check understanding: appearance changed; monthly values and mean/min/max did not.
- Teaching point: zoomed axes can help spot small changes **and** can inflate drama — context matters; do **not** teach “every nonzero axis is deceptive.”

### 2. Sampling investigation (Northbridge Learning Campus — fictional)

- Population N=200 with documented 20% cafe regulars and space preferences (`assets/data/datasets.json`).
- Draw **Cafe volunteer intercept** (biased) vs **simple random** or **systematic** (less biased).
- Use **Large biased (n=120)** to see that size alone does not restore representativeness.

### 3. Correlation challenge (Makerspace Sprint — fictional)

- Pooled hours vs score shows a strong positive association.
- **Stratify by club**: within-group associations weaken; club members have higher typical scores and hours.
- Choose a conclusion that rejects “correlation proves cause” or that calls for stronger design.
- Write a **fictional** headline combining ≥2 issues; self-review checklist provided.

## Differentiation / co-play

- **More help / Less help** toggles scaffolding copy.
- Co-play prompts: “Did the numbers change or only the picture?”; “Who is missing from the cafe sample?”; “What else differs between club and non-club?”
- Unlimited retry; no ranking or shame language.

## Content sources & model limitations

Synthetic data were constructed for instruction (see provenance in-app and `DATA_DICTIONARY` in `js/data.js`). They are **not** real measurements and must not be cited as scientific findings.

Simplifications: CSS charts; heuristic headline feedback; Pearson *r* without inference tests; sampling without finite-population correction pedagogy.

**Do not claim** validated learning gains, diagnostic value, or universal age suitability.

## Reputable references (adult-facing)

1. **Calling Bullshit** (University of Washington course materials on misleading data presentations) — https://www.callingbullshit.org/ — supports the graph-framing discussion of visual emphasis vs underlying quantities.
2. **Guidelines for Assessment and Instruction in Statistics Education (GAISE) College Report** — https://www.amstat.org/docs/default-source/amstat-documents/gaisecollege_full.pdf — supports sampling-process awareness and cautious conclusions from data.
3. **Khan Academy — Correlation coefficient review / association ideas** — https://www.khanacademy.org/math/statistics-probability/describing-relationships-quantitative-data/introduction-to-scatterplots/a/correlation-coefficient-review — supports secondary-friendly correlation vs causation language.

## Offline follow-up

Ask learners to find one public chart, note its axis range, sketch a zero-baseline version, and write one sentence on what each view emphasises — without collecting personal data.

## Adaptations

- Screen-reader users: every chart has an accessible data table; buttons are labelled; skip link provided.
- Reduced motion: CSS disables non-essential animation/transition when `prefers-reduced-motion: reduce`.
