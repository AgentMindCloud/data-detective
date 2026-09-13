/**
 * Domain helpers for Claimwatch Desk / Data Detective.
 * Pure functions — no DOM. Seeded RNG for reproducible tests.
 */

/** Mulberry32 seeded PRNG — returns () => float in [0, 1). */
export function createRng(seed = 1) {
  let t = (seed >>> 0) || 1;
  return function next() {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

export function mean(values) {
  const arr = (values || []).map(Number).filter(Number.isFinite);
  if (!arr.length) return NaN;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

export function median(values) {
  const arr = (values || []).map(Number).filter(Number.isFinite).sort((a, b) => a - b);
  if (!arr.length) return NaN;
  const mid = Math.floor(arr.length / 2);
  return arr.length % 2 ? arr[mid] : (arr[mid - 1] + arr[mid]) / 2;
}

export function sum(values) {
  return (values || []).map(Number).filter(Number.isFinite).reduce((a, b) => a + b, 0);
}

export function round(n, digits = 2) {
  const x = Number(n);
  if (!Number.isFinite(x)) return NaN;
  const f = 10 ** digits;
  return Math.round(x * f) / f;
}

/** Percent change appearance ratio of visual span vs full range. */
export function axisSpan(minY, maxY) {
  const lo = Number(minY);
  const hi = Number(maxY);
  if (!Number.isFinite(lo) || !Number.isFinite(hi) || hi <= lo) {
    return { ok: false, span: NaN };
  }
  return { ok: true, span: hi - lo, minY: lo, maxY: hi };
}

/**
 * Same series under two axis windows. Underlying values unchanged.
 * Returns stats that must match regardless of axis.
 */
export function compareAxisViews(series, viewA, viewB) {
  const values = (series || []).map((d) => Number(d.value));
  const stats = {
    mean: mean(values),
    median: median(values),
    min: Math.min(...values),
    max: Math.max(...values),
    n: values.length,
  };
  const a = axisSpan(viewA.minY, viewA.maxY);
  const b = axisSpan(viewB.minY, viewB.maxY);
  return {
    statsA: { ...stats },
    statsB: { ...stats },
    valuesIdentical: true,
    statsIdentical:
      stats.mean === mean(values) &&
      stats.min === Math.min(...values) &&
      stats.max === Math.max(...values),
    appearanceChanged: a.ok && b.ok && (a.minY !== b.minY || a.maxY !== b.maxY),
    spanA: a.span,
    spanB: b.span,
  };
}

/** Map a value into chart height percent given axis window. */
export function valueToBarPercent(value, minY, maxY) {
  const span = maxY - minY;
  if (!(span > 0)) return 0;
  const p = ((Number(value) - minY) / span) * 100;
  return Math.max(0, Math.min(100, p));
}

/**
 * Sample from a population array with a method.
 * methods: 'random' | 'volunteer_cafe' | 'systematic'
 * volunteer_cafe: oversamples people tagged cafeRegular=true
 */
export function drawSample(population, method, n, rng = Math.random) {
  const pop = population || [];
  const size = Math.max(0, Math.min(Math.floor(Number(n) || 0), pop.length));
  if (!size) return { sample: [], method, n: 0 };

  if (method === 'volunteer_cafe') {
    const cafe = pop.filter((p) => p.cafeRegular);
    const others = pop.filter((p) => !p.cafeRegular);
    // 80% from cafe regulars when available (biased convenience sample at cafe)
    const fromCafe = Math.min(cafe.length, Math.round(size * 0.8));
    const fromOthers = Math.min(others.length, size - fromCafe);
    const needCafe = fromCafe + Math.max(0, size - fromCafe - fromOthers);
    const sample = [
      ...pickWithoutReplacement(cafe, Math.min(cafe.length, needCafe), rng),
      ...pickWithoutReplacement(others, Math.min(others.length, size - Math.min(cafe.length, needCafe)), rng),
    ];
    // If still short, fill from remaining
    while (sample.length < size) {
      const remaining = pop.filter((p) => !sample.includes(p));
      if (!remaining.length) break;
      sample.push(remaining[Math.floor(rng() * remaining.length)]);
    }
    return { sample: sample.slice(0, size), method, n: size };
  }

  if (method === 'systematic') {
    if (!pop.length) return { sample: [], method, n: 0 };
    const start = Math.floor(rng() * pop.length);
    const step = Math.max(1, Math.floor(pop.length / size));
    const sample = [];
    for (let i = 0; i < size; i++) {
      sample.push(pop[(start + i * step) % pop.length]);
    }
    return { sample, method, n: size };
  }

  // default: simple random without replacement
  return {
    sample: pickWithoutReplacement(pop, size, rng),
    method: 'random',
    n: size,
  };
}

function pickWithoutReplacement(arr, k, rng) {
  const copy = arr.slice();
  const out = [];
  for (let i = 0; i < k && copy.length; i++) {
    const idx = Math.floor(rng() * copy.length);
    out.push(copy.splice(idx, 1)[0]);
  }
  return out;
}

export function summarizePreference(sample, preferenceKey = 'preferredSpace') {
  const counts = {};
  for (const row of sample || []) {
    const k = row[preferenceKey];
    counts[k] = (counts[k] || 0) + 1;
  }
  const n = (sample || []).length;
  const proportions = {};
  for (const [k, v] of Object.entries(counts)) {
    proportions[k] = n ? v / n : 0;
  }
  const cafeShare = n
    ? (sample.filter((r) => r.cafeRegular).length / n)
    : 0;
  return { counts, proportions, n, cafeShare };
}

export function samplingBiasInsight(popSummary, sampleSummary) {
  const keys = new Set([
    ...Object.keys(popSummary.proportions || {}),
    ...Object.keys(sampleSummary.proportions || {}),
  ]);
  let maxAbsDiff = 0;
  const diffs = {};
  for (const k of keys) {
    const d = (sampleSummary.proportions[k] || 0) - (popSummary.proportions[k] || 0);
    diffs[k] = d;
    maxAbsDiff = Math.max(maxAbsDiff, Math.abs(d));
  }
  return {
    diffs,
    maxAbsDiff,
    cafeShareDiff: (sampleSummary.cafeShare || 0) - (popSummary.cafeShare || 0),
    largerDoesNotFixBias: true,
  };
}

/** Pearson-ish correlation (population formula on the given pairs). */
export function pearson(xs, ys) {
  const n = Math.min(xs.length, ys.length);
  if (n < 2) return NaN;
  let sx = 0;
  let sy = 0;
  let sxx = 0;
  let syy = 0;
  let sxy = 0;
  for (let i = 0; i < n; i++) {
    const x = Number(xs[i]);
    const y = Number(ys[i]);
    sx += x;
    sy += y;
    sxx += x * x;
    syy += y * y;
    sxy += x * y;
  }
  const num = n * sxy - sx * sy;
  const den = Math.sqrt((n * sxx - sx * sx) * (n * syy - sy * sy));
  if (!(den > 0)) return 0;
  return num / den;
}

export function stratifyBy(rows, key) {
  const groups = {};
  for (const row of rows || []) {
    const g = String(row[key]);
    if (!groups[g]) groups[g] = [];
    groups[g].push(row);
  }
  return groups;
}

export function groupMeans(rows, xKey, yKey, groupKey) {
  const groups = stratifyBy(rows, groupKey);
  const out = {};
  for (const [g, list] of Object.entries(groups)) {
    out[g] = {
      n: list.length,
      meanX: mean(list.map((r) => r[xKey])),
      meanY: mean(list.map((r) => r[yKey])),
      r: pearson(
        list.map((r) => r[xKey]),
        list.map((r) => r[yKey])
      ),
    };
  }
  return out;
}

export function overallCorrelation(rows, xKey, yKey) {
  return pearson(
    (rows || []).map((r) => r[xKey]),
    (rows || []).map((r) => r[yKey])
  );
}

/**
 * Evaluate learner conclusion about correlation activity.
 * Accepts nuanced answers that note association ≠ causation or third variable.
 */
export function evaluateCorrelationConclusion(choiceId) {
  const map = {
    cause_hours: {
      ok: false,
      feedback:
        'Hours and scores move together in this synthetic set, but association alone does not prove that more hours cause higher scores. Check the third variable.',
    },
    third_variable: {
      ok: true,
      feedback:
        'Strong reasoning: club experience is a plausible third variable. Within groups, the hours–score link shrinks — association is not automatic causation.',
    },
    no_link: {
      ok: false,
      feedback:
        'There is a clear association in the pooled data. The careful claim is that we should not jump from association to cause without more design.',
    },
    need_experiment: {
      ok: true,
      feedback:
        'Good caution: an experiment or stronger design would be needed to support a causal claim. Stratifying already shows the story is more complicated.',
    },
  };
  return map[choiceId] || {
    ok: false,
    feedback: 'Pick a conclusion that fits the evidence and its limits.',
  };
}

export function createProgress() {
  return {
    onboardingDone: false,
    graphDone: false,
    sampleDone: false,
    corrDone: false,
    headlineDone: false,
    notebook: [],
  };
}

export function progressPercent(p) {
  const flags = [
    p.onboardingDone,
    p.graphDone,
    p.sampleDone,
    p.corrDone,
    p.headlineDone,
  ];
  const done = flags.filter(Boolean).length;
  return Math.round((done / flags.length) * 100);
}

export function addNotebookEntry(progress, entry) {
  const next = {
    ...progress,
    notebook: [...(progress.notebook || []), { ...entry, at: Date.now() }],
  };
  return next;
}

/** Headline scoring: must mention ≥2 issue tags from graph/sample/corr. */
export function scoreHeadline(text, requiredTags = ['axis', 'sample', 'correlation']) {
  const t = String(text || '').toLowerCase();
  const tagMatchers = {
    axis: [/axis|scale|chart|graph|zoom|frame|visual/i],
    sample: [/sample|survey|bias|volunteer|cafe|represent/i],
    correlation: [/correlat|caus|associat|third|confound|club/i],
  };
  const found = [];
  for (const tag of requiredTags) {
    const matchers = tagMatchers[tag] || [];
    if (matchers.some((re) => re.test(t))) found.push(tag);
  }
  const ok = found.length >= 2 && t.trim().length >= 24;
  return {
    ok,
    found,
    feedback: ok
      ? 'Solid fictional headline: it blends at least two scrutiny issues without claiming real findings.'
      : 'Rewrite so the fictional headline clearly combines at least two issues (axis framing, sampling bias, or correlation≠cause) in a complete sentence.',
  };
}

export function chartTableAgree(values, tableValues) {
  if (!values || !tableValues || values.length !== tableValues.length) return false;
  return values.every((v, i) => Number(v) === Number(tableValues[i]));
}
