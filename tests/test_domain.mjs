/**
 * Automated domain tests for Claimwatch Desk / Data Detective.
 * Run: node tests/test_domain.mjs
 */
import {
  createRng,
  mean,
  median,
  compareAxisViews,
  valueToBarPercent,
  drawSample,
  summarizePreference,
  samplingBiasInsight,
  pearson,
  overallCorrelation,
  groupMeans,
  evaluateCorrelationConclusion,
  createProgress,
  progressPercent,
  scoreHeadline,
  chartTableAgree,
  round,
} from '../js/domain.js';
import {
  THEME,
  ONBOARDING,
  BIKE_SERIES,
  CAMPUS_POPULATION,
  SAMPLING_METHODS,
  MAKER_ROWS,
  CORR_CONCLUSIONS,
  EDUCATOR_SOURCES,
  PROVENANCE,
  DATA_DICTIONARY,
} from '../js/data.js';

let passed = 0;
let failed = 0;
const failures = [];

function assert(cond, msg) {
  if (cond) {
    passed++;
    console.log('  PASS:', msg);
  } else {
    failed++;
    failures.push(msg);
    console.log('  FAIL:', msg);
  }
}

console.log('=== Claimwatch Desk / Data Detective domain tests ===\n');

console.log('Theme & content gates');
assert(THEME.brand === 'Claimwatch Desk', 'brand Claimwatch Desk');
assert(ONBOARDING.objectives.length >= 3, '≥3 objectives');
assert(PROVENANCE.fictional === true, 'provenance marks fictional');
assert(DATA_DICTIONARY.length >= 6, 'data dictionary entries');
assert(EDUCATOR_SOURCES.length >= 2, '≥2 educator sources');
assert(EDUCATOR_SOURCES.every((s) => s.url && s.title), 'sources have title+url');

console.log('\nSeeded RNG reproducibility');
const r1 = createRng(42);
const r2 = createRng(42);
const seq1 = [r1(), r1(), r1()];
const seq2 = [r2(), r2(), r2()];
assert(seq1.every((v, i) => v === seq2[i]), 'same seed → same sequence');
assert(seq1[0] !== seq1[1], 'rng varies');

console.log('\nGraph framing');
const values = BIKE_SERIES.points.map((p) => p.value);
assert(BIKE_SERIES.points.length === 12, '12 monthly points');
assert(chartTableAgree(values, values), 'chart/table values agree with themselves');
const full = BIKE_SERIES.views.full;
const zoom = BIKE_SERIES.views.zoom;
const cmp = compareAxisViews(BIKE_SERIES.points, full, zoom);
assert(cmp.valuesIdentical, 'axis change keeps values identical flag');
assert(cmp.appearanceChanged, 'full vs zoom appearance differs');
assert(cmp.statsA.mean === cmp.statsB.mean, 'mean identical across views');
assert(cmp.statsA.mean === mean(values), 'mean from series');
assert(median(values) === median([...values].reverse()), 'median order-invariant');
const hFull = valueToBarPercent(5180, full.minY, full.maxY);
const hZoom = valueToBarPercent(5180, zoom.minY, zoom.maxY);
assert(hZoom > hFull, 'same value taller % in zoomed axis');
assert(full.minY === 0, 'context view uses zero-ish baseline');
assert(zoom.minY > 0, 'zoomed view non-zero min — not automatically labeled deceptive in UI copy');

console.log('\nSampling investigation');
assert(CAMPUS_POPULATION.length === 200, 'population N=200');
const popSum = summarizePreference(CAMPUS_POPULATION);
assert(Math.abs(popSum.cafeShare - 0.2) < 1e-9, '20% cafe regulars in population');
assert(SAMPLING_METHODS.some((m) => m.biased) && SAMPLING_METHODS.some((m) => !m.biased), 'biased + less-biased methods');

const rngB = createRng(7);
const biased = drawSample(CAMPUS_POPULATION, 'volunteer_cafe', 40, rngB);
const biasedSum = summarizePreference(biased.sample);
assert(biased.sample.length === 40, 'biased sample n=40');
assert(biasedSum.cafeShare > popSum.cafeShare, 'cafe method over-represents cafe regulars');

const rngR = createRng(7);
const random = drawSample(CAMPUS_POPULATION, 'random', 40, rngR);
const randomSum = summarizePreference(random.sample);
assert(random.sample.length === 40, 'random sample n=40');
assert(new Set(random.sample.map((r) => r.id)).size === 40, 'random sample unique ids');

const rngSys = createRng(11);
const sys = drawSample(CAMPUS_POPULATION, 'systematic', 40, rngSys);
assert(sys.sample.length === 40, 'systematic n=40');

const insightB = samplingBiasInsight(popSum, biasedSum);
assert(insightB.largerDoesNotFixBias === true, 'documents larger≠fix bias');
assert(insightB.cafeShareDiff > 0, 'positive cafe share diff under bias');

const rngBig = createRng(99);
const bigBias = drawSample(CAMPUS_POPULATION, 'volunteer_cafe', 120, rngBig);
const bigSum = summarizePreference(bigBias.sample);
assert(bigSum.n === 120, 'large biased n=120');
assert(bigSum.cafeShare > popSum.cafeShare, 'large biased still over-represents cafe');

// reproducibility
const a1 = drawSample(CAMPUS_POPULATION, 'random', 30, createRng(123));
const a2 = drawSample(CAMPUS_POPULATION, 'random', 30, createRng(123));
assert(
  a1.sample.map((r) => r.id).join() === a2.sample.map((r) => r.id).join(),
  'seeded sampling reproducible'
);

console.log('\nCorrelation challenge');
assert(MAKER_ROWS.length === 20, '20 maker rows');
const rAll = overallCorrelation(MAKER_ROWS, 'hours', 'score');
assert(rAll > 0.7, 'strong pooled positive association');
const groups = groupMeans(MAKER_ROWS, 'hours', 'score', 'clubMember');
assert(groups.true && groups.false, 'stratified groups exist');
assert(groups.true.meanY > groups.false.meanY, 'club mean score higher');
assert(Math.abs(groups.true.r) < 0.4 && Math.abs(groups.false.r) < 0.4, 'within-group associations much weaker than pooled');

const bad = evaluateCorrelationConclusion('cause_hours');
const good = evaluateCorrelationConclusion('third_variable');
const good2 = evaluateCorrelationConclusion('need_experiment');
assert(!bad.ok && good.ok && good2.ok, 'conclusion evaluator accepts careful options');
assert(CORR_CONCLUSIONS.length >= 4, '≥4 conclusion choices');
assert(pearson([1, 2, 3], [1, 2, 3]) === 1, 'perfect pearson');

console.log('\nHeadline + progress');
const weak = scoreHeadline('cool chart');
const strong = scoreHeadline(
  'Fictional Pulse: zoomed axis and cafe sample inflate a correlation-as-cause makerspace claim'
);
assert(!weak.ok, 'short/weak headline rejected');
assert(strong.ok && strong.found.length >= 2, 'headline with ≥2 issues accepted');
const p0 = createProgress();
assert(progressPercent(p0) === 0, 'empty progress 0%');
const p1 = { ...p0, onboardingDone: true, graphDone: true, sampleDone: true, corrDone: true, headlineDone: true };
assert(progressPercent(p1) === 100, 'full progress 100%');
assert(round(1.239, 2) === 1.24, 'round helper');

console.log('\n=== Results ===');
console.log(`Passed: ${passed}`);
console.log(`Failed: ${failed}`);
if (failed) {
  console.log('Failures:');
  failures.forEach((f) => console.log(' -', f));
  process.exit(1);
}
console.log('All tests passed.');
