/**
 * Learning content + synthetic datasets for Claimwatch Desk / Data Detective.
 * All organisations, people, and headlines are fictional.
 */

export const THEME = {
  title: 'Data Detective: Can You Trust This Claim?',
  brand: 'Claimwatch Desk',
  tagline: 'Scrutinise charts, samples, and headlines — without discarding every number.',
  setting: 'A quiet newsroom desk that reviews civic and campus data claims before they go viral.',
  character: 'Editor Nova (desk lead) and Analyst Remy',
};

export const ONBOARDING = {
  welcome:
    'Welcome to Claimwatch Desk. You will inspect three common ways numbers get oversold: chart framing, sampling shortcuts, and mistaking association for cause.',
  steps: [
    'Compare two views of the same series — appearance can change while the numbers stay identical.',
    'Draw biased and less-biased samples from a documented synthetic population.',
    'Probe a correlation, stratify by a third variable, then write a careful conclusion.',
    'Finish with a fictional headline that combines at least two scrutiny issues.',
  ],
  ageNote: 'Written for about age 15. Work at your own pace; hints and an evidence notebook are available.',
  objectives: [
    'Explain how axis framing can change perceived effect size without changing the data.',
    'Identify a sampling limitation and why a larger biased sample need not fix bias.',
    'Distinguish correlation from causal evidence and justify a cautious conclusion.',
  ],
};

export const CO_PLAY_TIPS = [
  'Ask: “Did the numbers change, or only the picture?”',
  'After a cafe volunteer sample, ask who is missing from the room.',
  'When hours and scores rise together, ask what else differs between groups.',
  'Invite a rewrite of a viral-sounding claim into a limited, evidence-based sentence.',
];

export const NEXT_PRACTICE = [
  'Find a public chart and note its axis range; sketch the same series with a zero baseline and with a zoomed window — then write what each view emphasises.',
  'Design a 10-question survey and name one convenience sample that would skew it, plus one fairer sampling plan.',
];

/** Provenance for all bundled synthetic data. */
export const PROVENANCE = {
  generator: 'Claimwatch Desk synthetic constructor (deterministic seed profiles)',
  fictional: true,
  disclaimer:
    'Every organisation, person, and headline here is fictional. Datasets were constructed for education; they are not real measurements and must not be cited as scientific findings.',
  constructed:
    'Series and populations were hand-specified or generated with a fixed seed so classroom results are stable. Units and labels are documented in the data dictionary.',
};

/**
 * Activity 1 — Riverloop Shared Cycles monthly checkouts (fictional).
 * Units: checkouts per month.
 */
export const BIKE_SERIES = {
  id: 'riverloop-checkouts-2025',
  entity: 'Riverloop Shared Cycles (fictional)',
  measure: 'Monthly bicycle checkouts',
  unit: 'checkouts',
  yearLabel: 'Synthetic year 2025',
  points: [
    { month: 'Jan', value: 4120 },
    { month: 'Feb', value: 3980 },
    { month: 'Mar', value: 4310 },
    { month: 'Apr', value: 4550 },
    { month: 'May', value: 4820 },
    { month: 'Jun', value: 5010 },
    { month: 'Jul', value: 5180 },
    { month: 'Aug', value: 5095 },
    { month: 'Sep', value: 4760 },
    { month: 'Oct', value: 4480 },
    { month: 'Nov', value: 4225 },
    { month: 'Dec', value: 4050 },
  ],
  views: {
    full: { id: 'full', label: 'Context view (near-zero baseline)', minY: 0, maxY: 6000 },
    zoom: { id: 'zoom', label: 'Zoomed view (tight window)', minY: 3900, maxY: 5300 },
  },
  claims: {
    dramatic:
      'CLAIM (fictional Meridian Daily Pulse): “Riverloop checkouts exploded — the chart shows a dramatic surge!”',
    calm:
      'COUNTER-NOTE: Same monthly totals; only the vertical window changed. Ask what the axis emphasises.',
  },
};

/**
 * Activity 2 — Northbridge Learning Campus study-space preferences (fictional).
 * Population N=200 (manageable for browser); constructed with known cafe-regular share.
 */
function buildPopulation() {
  // Fixed synthetic roster — not random at build time so tests & UI share identity.
  const spaces = ['Quiet library', 'Group studio', 'Courtyard', 'Cafe nooks'];
  const rows = [];
  // 200 learners: 40 cafe regulars (20%), 160 non-regulars
  // Preference rates differ by cafeRegular to create clear bias under cafe sampling.
  // Cafe regulars: heavily prefer Cafe nooks
  // Others: mix favoring Quiet library
  let id = 1;
  for (let i = 0; i < 40; i++) {
    const roll = i % 10;
    let preferredSpace;
    if (roll < 7) preferredSpace = 'Cafe nooks';
    else if (roll < 8) preferredSpace = 'Group studio';
    else if (roll < 9) preferredSpace = 'Courtyard';
    else preferredSpace = 'Quiet library';
    rows.push({
      id: `N${String(id++).padStart(3, '0')}`,
      cafeRegular: true,
      preferredSpace,
      yearBand: i % 2 === 0 ? 'Y10-11' : 'Y12-13',
    });
  }
  for (let i = 0; i < 160; i++) {
    const roll = i % 10;
    let preferredSpace;
    if (roll < 5) preferredSpace = 'Quiet library';
    else if (roll < 7) preferredSpace = 'Group studio';
    else if (roll < 9) preferredSpace = 'Courtyard';
    else preferredSpace = 'Cafe nooks';
    rows.push({
      id: `N${String(id++).padStart(3, '0')}`,
      cafeRegular: false,
      preferredSpace,
      yearBand: i % 3 === 0 ? 'Y10-11' : 'Y12-13',
    });
  }
  return rows;
}

export const CAMPUS_POPULATION = buildPopulation();

export const SAMPLING_METHODS = [
  {
    id: 'volunteer_cafe',
    label: 'Cafe volunteer intercept (biased)',
    biased: true,
    description:
      'Ask whoever is sitting in the campus cafe during one lunch block. Cafe regulars are heavily over-represented.',
  },
  {
    id: 'random',
    label: 'Simple random draw (less biased)',
    biased: false,
    description:
      'Draw names without replacement from the full documented roster — every learner has equal chance.',
  },
  {
    id: 'systematic',
    label: 'Systematic every-kth from roster (less biased)',
    biased: false,
    description:
      'Start at a random roster position and take every k-th learner. Still uses the full list.',
  },
];

/**
 * Activity 3 — Makerspace hours vs project score + club membership (fictional).
 */
export const MAKER_ROWS = [
  // Club members: high scores ~86, hours vary 8–17, near-flat within group
  { id: 'M01', hours: 8, score: 88, clubMember: true },
  { id: 'M02', hours: 9, score: 85, clubMember: true },
  { id: 'M03', hours: 10, score: 87, clubMember: true },
  { id: 'M04', hours: 11, score: 84, clubMember: true },
  { id: 'M05', hours: 12, score: 89, clubMember: true },
  { id: 'M06', hours: 13, score: 86, clubMember: true },
  { id: 'M07', hours: 14, score: 85, clubMember: true },
  { id: 'M08', hours: 15, score: 88, clubMember: true },
  { id: 'M09', hours: 16, score: 84, clubMember: true },
  { id: 'M10', hours: 17, score: 87, clubMember: true },
  // Non-members: low scores ~58, hours vary 1–10, near-flat within group
  { id: 'M11', hours: 1, score: 60, clubMember: false },
  { id: 'M12', hours: 2, score: 55, clubMember: false },
  { id: 'M13', hours: 3, score: 59, clubMember: false },
  { id: 'M14', hours: 4, score: 56, clubMember: false },
  { id: 'M15', hours: 5, score: 61, clubMember: false },
  { id: 'M16', hours: 6, score: 57, clubMember: false },
  { id: 'M17', hours: 7, score: 58, clubMember: false },
  { id: 'M18', hours: 8, score: 54, clubMember: false },
  { id: 'M19', hours: 9, score: 60, clubMember: false },
  { id: 'M20', hours: 10, score: 56, clubMember: false },
];

export const CORR_META = {
  entity: 'Northbridge Makerspace Sprint (fictional)',
  xKey: 'hours',
  yKey: 'score',
  xLabel: 'Makerspace hours (week)',
  yLabel: 'Project review score (0–100)',
  groupKey: 'clubMember',
  groupLabels: { true: 'Club members', false: 'Not in club' },
  headlineTrap:
    'TRAP HEADLINE (fictional): “More makerspace hours cause higher project scores, data prove it.”',
};

export const CORR_CONCLUSIONS = [
  {
    id: 'cause_hours',
    label: 'More hours cause higher scores — the positive correlation proves it.',
  },
  {
    id: 'third_variable',
    label:
      'Hours and scores are associated overall, but club membership is a plausible third variable; association alone is not causation.',
  },
  {
    id: 'no_link',
    label: 'There is no meaningful association in these numbers.',
  },
  {
    id: 'need_experiment',
    label:
      'We see association, but we would need a stronger design (e.g., experiment) before claiming cause.',
  },
];

export const EDUCATOR_SOURCES = [
  {
    title: 'Calling Bullshit — Chapter on misleading visualizations (University of Washington course materials)',
    url: 'https://www.callingbullshit.org/',
    supports: 'Graph framing activity: how axis choices and visual encoding change perceived magnitude.',
  },
  {
    title: 'Guidelines for Assessment and Instruction in Statistics Education (GAISE) Report',
    url: 'https://www.amstat.org/docs/default-source/amstat-documents/gaisecollege_full.pdf',
    supports: 'Sampling and inference habits; emphasising variability, sampling process, and cautious conclusions.',
  },
  {
    title: 'Khan Academy — Correlation and causality',
    url: 'https://www.khanacademy.org/math/statistics-probability/describing-relationships-quantitative-data/introduction-to-scatterplots/a/correlation-coefficient-review',
    supports: 'Correlation challenge: association vs causation language for secondary learners.',
  },
];

export const DATA_DICTIONARY = [
  {
    dataset: 'riverloop-checkouts-2025',
    field: 'month',
    type: 'string',
    unit: 'calendar month label',
    notes: 'Synthetic month labels for fictional Riverloop Shared Cycles.',
  },
  {
    dataset: 'riverloop-checkouts-2025',
    field: 'value',
    type: 'integer',
    unit: 'checkouts',
    notes: 'Monthly checkout counts; constructed, not observed.',
  },
  {
    dataset: 'northbridge-campus-roster',
    field: 'id',
    type: 'string',
    unit: '—',
    notes: 'Synthetic learner id.',
  },
  {
    dataset: 'northbridge-campus-roster',
    field: 'cafeRegular',
    type: 'boolean',
    unit: '—',
    notes: 'True if constructed as a frequent cafe visitor (drives volunteer-sample bias).',
  },
  {
    dataset: 'northbridge-campus-roster',
    field: 'preferredSpace',
    type: 'categorical',
    unit: '—',
    notes: 'Quiet library | Group studio | Courtyard | Cafe nooks',
  },
  {
    dataset: 'makerspace-sprint',
    field: 'hours',
    type: 'number',
    unit: 'hours / week',
    notes: 'Self-reported makerspace time in fictional sprint.',
  },
  {
    dataset: 'makerspace-sprint',
    field: 'score',
    type: 'number',
    unit: 'points 0–100',
    notes: 'Synthetic project review score.',
  },
  {
    dataset: 'makerspace-sprint',
    field: 'clubMember',
    type: 'boolean',
    unit: '—',
    notes: 'Third-variable flag: prior club experience.',
  },
];
