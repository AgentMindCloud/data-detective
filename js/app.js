/**
 * Claimwatch Desk — Data Detective
 * Demo + guided practice + fresh application; localStorage with reset.
 */
import {
  createRng,
  mean,
  compareAxisViews,
  valueToBarPercent,
  drawSample,
  summarizePreference,
  samplingBiasInsight,
  overallCorrelation,
  groupMeans,
  evaluateCorrelationConclusion,
  createProgress,
  progressPercent,
  addNotebookEntry,
  scoreHeadline,
  round,
} from './domain.js';
import {
  THEME,
  ONBOARDING,
  CO_PLAY_TIPS,
  NEXT_PRACTICE,
  PROVENANCE,
  BIKE_SERIES,
  CAMPUS_POPULATION,
  SAMPLING_METHODS,
  MAKER_ROWS,
  CORR_META,
  CORR_CONCLUSIONS,
} from './data.js';

const STORAGE_KEY = 'claimwatch-desk-v1';

const state = {
  screen: 'home',
  progress: createProgress(),
  lastFeedback: '',
  // graph
  graphView: 'full', // full | zoom | custom
  customMin: 3900,
  customMax: 5300,
  graphChecked: false,
  // sampling
  sampleMethod: 'volunteer_cafe',
  sampleSize: 40,
  sampleResult: null,
  sampleSeed: 42,
  largeBiasedTried: false,
  // correlation
  corrStratify: false,
  corrChoice: null,
  corrFeedback: '',
  // headline
  headlineText: '',
  headlineScore: null,
  helpLevel: 'more', // more | less
};

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const saved = JSON.parse(raw);
    if (saved && saved.progress) {
      state.progress = { ...createProgress(), ...saved.progress };
      state.screen = saved.screen || 'home';
      state.helpLevel = saved.helpLevel || 'more';
    }
  } catch (_) { /* ignore */ }
}

function save() {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        progress: state.progress,
        screen: state.screen,
        helpLevel: state.helpLevel,
      })
    );
  } catch (_) { /* private mode */ }
}

function resetAll() {
  localStorage.removeItem(STORAGE_KEY);
  Object.assign(state, {
    screen: 'home',
    progress: createProgress(),
    lastFeedback: '',
    graphView: 'full',
    customMin: 3900,
    customMax: 5300,
    graphChecked: false,
    sampleMethod: 'volunteer_cafe',
    sampleSize: 40,
    sampleResult: null,
    sampleSeed: 42,
    largeBiasedTried: false,
    corrStratify: false,
    corrChoice: null,
    corrFeedback: '',
    headlineText: '',
    headlineScore: null,
    helpLevel: 'more',
  });
  render();
}

function go(screen) {
  state.screen = screen;
  save();
  render();
  const main = document.getElementById('main');
  if (main) main.focus();
}

function note(activity, text) {
  state.progress = addNotebookEntry(state.progress, { activity, text });
  save();
}

function el(html) {
  const t = document.createElement('template');
  t.innerHTML = html.trim();
  return t.content.firstElementChild;
}

function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function header() {
  const pct = progressPercent(state.progress);
  return `
    <header class="app-header">
      <div class="brand">
        <div class="brand-mark" aria-hidden="true">CW</div>
        <div>
          <h1>${esc(THEME.title)}</h1>
          <p>${esc(THEME.brand)} · ${esc(THEME.tagline)}</p>
        </div>
      </div>
      <div class="toolbar">
        <button type="button" class="ghost" data-action="toggle-help" aria-pressed="${state.helpLevel === 'more'}">${state.helpLevel === 'more' ? 'Less help' : 'More help'}</button>
        <button type="button" class="ghost" data-action="notebook">Notebook</button>
        <button type="button" class="warn" data-action="reset">Reset lesson</button>
      </div>
    </header>
    <div class="progress-wrap" aria-label="Lesson progress">
      <div class="progress-bar" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${pct}"><span style="width:${pct}%"></span></div>
      <span class="small muted">${pct}%</span>
    </div>
  `;
}

function nav() {
  const items = [
    ['home', 'Start'],
    ['graph', '1 · Graphs'],
    ['sample', '2 · Sampling'],
    ['corr', '3 · Correlation'],
    ['headline', 'Headline'],
    ['done', 'Summary'],
  ];
  return `<nav class="nav-tabs" aria-label="Lesson activities">${items
    .map(
      ([id, label]) =>
        `<button type="button" class="${state.screen === id ? 'selected primary' : 'ghost'}" data-nav="${id}">${label}</button>`
    )
    .join('')}</nav>`;
}

function renderBars(series, minY, maxY, alt = false) {
  const bars = series.points
    .map((p) => {
      const h = valueToBarPercent(p.value, minY, maxY);
      return `<div class="bar-col"><div class="bar${alt ? ' alt' : ''}" style="height:${h}%" title="${esc(p.month)}: ${p.value} ${esc(series.unit)}"></div><div class="bar-label">${esc(p.month)}</div></div>`;
    })
    .join('');
  return `<div class="bars" role="img" aria-label="Bar chart of ${esc(series.measure)} from ${minY} to ${maxY} ${esc(series.unit)}">${bars}</div>
    <p class="axis-note">Vertical axis: ${minY} – ${maxY} ${esc(series.unit)}. Horizontal: month.</p>`;
}

function dataTable(series) {
  const rows = series.points
    .map((p) => `<tr><th scope="row">${esc(p.month)}</th><td>${p.value}</td></tr>`)
    .join('');
  return `<div class="data-table-wrap"><table class="data"><caption>Accessible data table (identical under every axis view)</caption><thead><tr><th scope="col">Month</th><th scope="col">Checkouts (${esc(series.unit)})</th></tr></thead><tbody>${rows}</tbody></table></div>`;
}

function screenHome() {
  return `
    <section class="panel" id="main" tabindex="-1">
      <h2>Start the investigation</h2>
      <p>${esc(ONBOARDING.welcome)}</p>
      <ol>${ONBOARDING.steps.map((s) => `<li>${esc(s)}</li>`).join('')}</ol>
      <p class="muted small">${esc(ONBOARDING.ageNote)}</p>
      <h3>Learning objectives</h3>
      <ul>${ONBOARDING.objectives.map((o) => `<li>${esc(o)}</li>`).join('')}</ul>
      ${
        state.helpLevel === 'more'
          ? `<p class="muted small"><strong>Setting:</strong> ${esc(THEME.setting)} Characters: ${esc(THEME.character)}.</p>`
          : ''
      }
      <p class="small muted">${esc(PROVENANCE.disclaimer)}</p>
      <div class="controls">
        <button type="button" class="primary" data-action="begin">Begin · Graph framing</button>
      </div>
    </section>
  `;
}

function screenGraph() {
  const series = BIKE_SERIES;
  let minY;
  let maxY;
  let viewLabel;
  if (state.graphView === 'zoom') {
    minY = series.views.zoom.minY;
    maxY = series.views.zoom.maxY;
    viewLabel = series.views.zoom.label;
  } else if (state.graphView === 'custom') {
    minY = Number(state.customMin);
    maxY = Number(state.customMax);
    viewLabel = `Custom window (${minY}–${maxY})`;
  } else {
    minY = series.views.full.minY;
    maxY = series.views.full.maxY;
    viewLabel = series.views.full.label;
  }
  if (!(maxY > minY)) {
    maxY = minY + 100;
  }
  const compare = compareAxisViews(series.points, series.views.full, {
    minY,
    maxY,
  });
  const values = series.points.map((p) => p.value);
  const statsLine = `Mean ${round(mean(values), 1)} · Min ${Math.min(...values)} · Max ${Math.max(...values)} (unchanged by axis)`;

  return `
    <section class="panel" id="main" tabindex="-1">
      <h2>1 · Graph framing</h2>
      <p><strong>Entity (fictional):</strong> ${esc(series.entity)}. <strong>Measure:</strong> ${esc(series.measure)} (${esc(series.unit)}).</p>
      <p class="warn-claim">${esc(series.claims.dramatic)}</p>
      ${state.helpLevel === 'more' ? `<p class="muted small">Demo: switch between a near-zero baseline and a tight zoom. Guided: drag the custom window. Fresh: decide whether the dramatic claim is fair.</p>` : ''}
      <div class="controls" role="group" aria-label="Axis view">
        <button type="button" class="${state.graphView === 'full' ? 'selected' : 'ghost'}" data-action="graph-view" data-view="full">Context view</button>
        <button type="button" class="${state.graphView === 'zoom' ? 'selected' : 'ghost'}" data-action="graph-view" data-view="zoom">Zoomed view</button>
        <button type="button" class="${state.graphView === 'custom' ? 'selected' : 'ghost'}" data-action="graph-view" data-view="custom">Custom axis</button>
        <button type="button" class="ghost" data-action="graph-reset">Reset view</button>
      </div>
      ${
        state.graphView === 'custom'
          ? `<div class="controls">
              <label>Min Y <input type="number" id="ymin" value="${state.customMin}" min="0" max="6000" step="50" /></label>
              <label>Max Y <input type="number" id="ymax" value="${state.customMax}" min="100" max="8000" step="50" /></label>
              <button type="button" class="primary" data-action="apply-custom">Apply axis</button>
            </div>`
          : ''
      }
      <div class="chart-block">
        <div class="chart-title">${esc(viewLabel)}</div>
        ${renderBars(series, minY, maxY, state.graphView !== 'full')}
        <p class="small"><strong>Computed from data (not from the picture):</strong> ${esc(statsLine)}</p>
      </div>
      ${dataTable(series)}
      <div class="controls">
        <button type="button" class="primary" data-action="graph-check">Check understanding</button>
        <button type="button" class="ghost" data-action="graph-hint">Hint</button>
        <button type="button" class="good" data-action="graph-next">Mark done · Sampling</button>
      </div>
      <div class="feedback" id="graph-feedback" role="status" aria-live="polite"></div>
      <p class="muted small">${esc(series.claims.calm)} Context matters: a zoomed axis can help spot small changes, but it can also inflate drama. Not every non-zero axis is automatically deceptive.</p>
      <p class="sr-only">Appearance changed: ${compare.appearanceChanged}. Values identical: ${compare.valuesIdentical}.</p>
    </section>
  `;
}

function popSummaryCached() {
  return summarizePreference(CAMPUS_POPULATION);
}

function screenSample() {
  const popSum = popSummaryCached();
  const methods = SAMPLING_METHODS.map(
    (m) =>
      `<button type="button" class="${state.sampleMethod === m.id ? 'selected' : 'ghost'}" data-action="set-method" data-method="${m.id}" aria-pressed="${state.sampleMethod === m.id}">${esc(m.label)}</button>`
  ).join('');
  const methodMeta = SAMPLING_METHODS.find((m) => m.id === state.sampleMethod);
  let resultHtml = '<p class="muted">Draw a sample to compare with the population.</p>';
  if (state.sampleResult) {
    const s = state.sampleResult.summary;
    const insight = samplingBiasInsight(popSum, s);
    const prefRows = Object.keys({ ...popSum.proportions, ...s.proportions })
      .map((k) => {
        const popP = round((popSum.proportions[k] || 0) * 100, 1);
        const samP = round((s.proportions[k] || 0) * 100, 1);
        return `<tr><th scope="row">${esc(k)}</th><td>${popP}%</td><td>${samP}%</td></tr>`;
      })
      .join('');
    resultHtml = `
      <div class="data-table-wrap"><table class="data">
        <caption>Preference share: population (N=${popSum.n}) vs sample (n=${s.n})</caption>
        <thead><tr><th>Space</th><th>Population</th><th>Sample</th></tr></thead>
        <tbody>${prefRows}
          <tr><th scope="row">Cafe regulars in group</th><td>${round(popSum.cafeShare * 100, 1)}%</td><td>${round(s.cafeShare * 100, 1)}%</td></tr>
        </tbody>
      </table></div>
      <p class="small">Max |sample − population| preference gap: ${round(insight.maxAbsDiff * 100, 1)} percentage points. Cafe-regular share gap: ${round(insight.cafeShareDiff * 100, 1)} pp.</p>
    `;
  }

  return `
    <section class="panel" id="main" tabindex="-1">
      <h2>2 · Sampling investigation</h2>
      <p><strong>Population (fictional):</strong> Northbridge Learning Campus roster, N=${CAMPUS_POPULATION.length}. Documented synthetic preferences for study spaces. Cafe regulars = ${Math.round(popSum.cafeShare * 100)}% of the roster.</p>
      ${state.helpLevel === 'more' ? `<p class="muted small">Demo: run the cafe volunteer intercept. Guided: compare with a simple random draw. Fresh: try a large biased sample (n=120) and see that size alone does not erase bias.</p>` : ''}
      <div class="chip-row" role="group" aria-label="Sampling method">${methods}</div>
      <p class="small muted">${esc(methodMeta?.description || '')}</p>
      <div class="controls">
        <label>Sample size
          <select id="sample-size" aria-label="Sample size">
            ${[20, 40, 80, 120].map((n) => `<option value="${n}" ${state.sampleSize === n ? 'selected' : ''}>${n}</option>`).join('')}
          </select>
        </label>
        <button type="button" class="primary" data-action="draw-sample">Draw sample</button>
        <button type="button" class="ghost" data-action="sample-large-biased">Large biased (n=120)</button>
        <button type="button" class="ghost" data-action="sample-hint">Hint</button>
        <button type="button" class="good" data-action="sample-next">Mark done · Correlation</button>
      </div>
      ${resultHtml}
      <div class="feedback" id="sample-feedback" role="status" aria-live="polite"></div>
      <p class="muted small">A larger biased sample can estimate the <em>wrong</em> population more precisely. Size ≠ representativeness.</p>
    </section>
  `;
}

function renderScatter(rows, stratify) {
  const xs = rows.map((r) => r.hours);
  const ys = rows.map((r) => r.score);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys) - 5;
  const maxY = Math.max(...ys) + 5;
  const dots = rows
    .map((r) => {
      const left = ((r.hours - minX) / (maxX - minX || 1)) * 100;
      const bottom = ((r.score - minY) / (maxY - minY || 1)) * 100;
      const cls = r.clubMember ? 'club' : 'non';
      const label = `${r.id}: ${r.hours}h, score ${r.score}, ${r.clubMember ? 'club' : 'not club'}`;
      if (stratify) {
        return `<div class="dot ${cls}" style="left:${left}%; bottom:${bottom}%" title="${esc(label)}"></div>`;
      }
      return `<div class="dot club" style="left:${left}%; bottom:${bottom}%; background:#a8c4ff" title="${esc(label)}"></div>`;
    })
    .join('');
  return `<div class="scatter" role="img" aria-label="Scatterplot of makerspace hours versus project score">${dots}</div>
    <div class="legend">${stratify ? '<span class="l-club">Club members</span><span class="l-non">Not in club</span>' : '<span class="l-club">All learners (pooled)</span>'}</div>`;
}

function screenCorr() {
  const rAll = overallCorrelation(MAKER_ROWS, 'hours', 'score');
  const groups = groupMeans(MAKER_ROWS, 'hours', 'score', 'clubMember');
  const choices = CORR_CONCLUSIONS.map(
    (c) =>
      `<button type="button" class="${state.corrChoice === c.id ? 'selected' : 'ghost'}" data-action="corr-choose" data-id="${c.id}">${esc(c.label)}</button>`
  ).join('');

  return `
    <section class="panel" id="main" tabindex="-1">
      <h2>3 · Correlation challenge</h2>
      <p><strong>Entity (fictional):</strong> ${esc(CORR_META.entity)}. ${esc(CORR_META.xLabel)} vs ${esc(CORR_META.yLabel)}.</p>
      <p class="warn-claim">${esc(CORR_META.headlineTrap)}</p>
      ${state.helpLevel === 'more' ? `<p class="muted small">Association alone does not establish causation. Stratify by club membership — a plausible third variable.</p>` : ''}
      <div class="controls">
        <button type="button" class="${!state.corrStratify ? 'selected' : 'ghost'}" data-action="corr-pooled">Pooled view</button>
        <button type="button" class="${state.corrStratify ? 'selected' : 'ghost'}" data-action="corr-stratify">Stratify by club</button>
        <button type="button" class="ghost" data-action="corr-hint">Hint</button>
      </div>
      <div class="chart-block">
        <div class="chart-title">${state.corrStratify ? 'Stratified by club membership' : 'Pooled association'}</div>
        ${renderScatter(MAKER_ROWS, state.corrStratify)}
        <p class="small"><strong>Pooled Pearson r ≈ ${round(rAll, 3)}</strong>
          ${
            state.corrStratify
              ? ` · Club r ≈ ${round(groups.true?.r, 3)} (n=${groups.true?.n}) · Non-club r ≈ ${round(groups.false?.r, 3)} (n=${groups.false?.n}). Mean scores differ by club even at similar hours.`
              : ''
          }
        </p>
      </div>
      <div class="data-table-wrap"><table class="data">
        <caption>Makerspace sprint data (synthetic)</caption>
        <thead><tr><th>ID</th><th>Hours</th><th>Score</th><th>Club</th></tr></thead>
        <tbody>${MAKER_ROWS.map((r) => `<tr><th scope="row">${r.id}</th><td>${r.hours}</td><td>${r.score}</td><td>${r.clubMember ? 'yes' : 'no'}</td></tr>`).join('')}</tbody>
      </table></div>
      <h3>Choose and justify a conclusion</h3>
      <div class="choice-list">${choices}</div>
      <div class="feedback ${state.corrFeedback ? (evaluateCorrelationConclusion(state.corrChoice).ok ? 'good' : 'warn') : ''}" id="corr-feedback" role="status" aria-live="polite">${esc(state.corrFeedback)}</div>
      <div class="controls">
        <button type="button" class="good" data-action="corr-next">Mark done · Headline</button>
      </div>
    </section>
  `;
}

function screenHeadline() {
  const score = state.headlineScore;
  return `
    <section class="panel" id="main" tabindex="-1">
      <h2>Fictional headline studio</h2>
      <p>Write a <strong>new fictional</strong> headline that combines <strong>at least two</strong> issues from this lesson (axis framing, sampling bias, correlation≠cause). Do not imply real findings.</p>
      ${state.helpLevel === 'more' ? `<p class="muted small">Exemplar: “Zoomed Riverloop chart and cafe-only survey oversell a ‘makerspace hours cause scores’ story — association isn’t proof.”</p>` : ''}
      <label for="headline">Your fictional headline</label>
      <textarea id="headline" maxlength="280" aria-describedby="headline-help">${esc(state.headlineText)}</textarea>
      <p id="headline-help" class="small muted">Self-review: Did you name two issues? Is every entity clearly made-up? Would a cautious editor publish this as satire, not news?</p>
      <div class="controls">
        <button type="button" class="primary" data-action="score-headline">Check headline</button>
        <button type="button" class="good" data-action="headline-next">Finish · Summary</button>
      </div>
      <div class="feedback ${score ? (score.ok ? 'good' : 'warn') : ''}" id="headline-feedback" role="status" aria-live="polite">${score ? esc(score.feedback) : ''}</div>
    </section>
  `;
}

function screenNotebook() {
  const items = (state.progress.notebook || [])
    .map((n) => `<li><strong>${esc(n.activity)}</strong>${esc(n.text)}</li>`)
    .join('') || '<li class="muted">No notes yet — complete checks in each activity.</li>';
  return `
    <section class="panel" id="main" tabindex="-1">
      <h2>Evidence notebook</h2>
      <p class="muted small">Stored only in this browser (localStorage). Use Reset lesson to clear.</p>
      <ul class="notebook">${items}</ul>
      <div class="controls"><button type="button" class="ghost" data-action="back">Back</button></div>
    </section>
  `;
}

function screenDone() {
  const pct = progressPercent(state.progress);
  return `
    <section class="panel" id="main" tabindex="-1">
      <h2>Investigation summary</h2>
      <p>Progress: <strong>${pct}%</strong>. You practised graph framing, sampling scrutiny, and correlation caution.</p>
      <ul>
        <li>Appearance can change while numbers stay identical — context for axis choice matters.</li>
        <li>Biased sampling is not fixed by taking more of the same bias.</li>
        <li>Association ≠ causation; third variables can reshape the story.</li>
      </ul>
      <h3>Next practice</h3>
      <ul>${NEXT_PRACTICE.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>
      ${state.helpLevel === 'more' ? `<h3>Co-play prompts</h3><ul>${CO_PLAY_TIPS.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>` : ''}
      <div class="controls">
        <button type="button" class="primary" data-action="replay">Replay from start</button>
        <button type="button" class="ghost" data-action="notebook">Open notebook</button>
      </div>
      <p class="footer-note">${esc(PROVENANCE.disclaimer)}</p>
    </section>
  `;
}

function render() {
  const root = document.getElementById('app');
  let body = '';
  switch (state.screen) {
    case 'graph':
      body = screenGraph();
      break;
    case 'sample':
      body = screenSample();
      break;
    case 'corr':
      body = screenCorr();
      break;
    case 'headline':
      body = screenHeadline();
      break;
    case 'notebook':
      body = screenNotebook();
      break;
    case 'done':
      body = screenDone();
      break;
    default:
      body = screenHome();
  }
  root.innerHTML = header() + nav() + body;
  bind();
}

function bind() {
  document.querySelectorAll('[data-nav]').forEach((btn) => {
    btn.addEventListener('click', () => go(btn.getAttribute('data-nav')));
  });
  document.querySelectorAll('[data-action]').forEach((btn) => {
    btn.addEventListener('click', () => onAction(btn.getAttribute('data-action'), btn));
  });
  const size = document.getElementById('sample-size');
  if (size) {
    size.addEventListener('change', () => {
      state.sampleSize = Number(size.value);
    });
  }
  const headline = document.getElementById('headline');
  if (headline) {
    headline.addEventListener('input', () => {
      state.headlineText = headline.value;
    });
  }
}

function onAction(action, btn) {
  switch (action) {
    case 'begin':
      state.progress.onboardingDone = true;
      save();
      go('graph');
      break;
    case 'toggle-help':
      state.helpLevel = state.helpLevel === 'more' ? 'less' : 'more';
      save();
      render();
      break;
    case 'reset':
      if (confirm('Reset the lesson and clear local progress?')) resetAll();
      break;
    case 'notebook':
      go('notebook');
      break;
    case 'back':
      go('home');
      break;
    case 'replay':
      resetAll();
      break;
    case 'graph-view':
      state.graphView = btn.getAttribute('data-view');
      render();
      break;
    case 'graph-reset':
      state.graphView = 'full';
      state.customMin = 3900;
      state.customMax = 5300;
      render();
      break;
    case 'apply-custom': {
      const ymin = document.getElementById('ymin');
      const ymax = document.getElementById('ymax');
      state.customMin = Number(ymin.value);
      state.customMax = Number(ymax.value);
      if (!(state.customMax > state.customMin)) {
        state.customMax = state.customMin + 100;
      }
      render();
      break;
    }
    case 'graph-hint': {
      const fb = document.getElementById('graph-feedback');
      fb.className = 'feedback';
      fb.textContent =
        'Hint: switch Context ↔ Zoomed. Read the mean/min/max line — those stay put. Only bar heights relative to the axis window change.';
      break;
    }
    case 'graph-check': {
      const fb = document.getElementById('graph-feedback');
      const series = BIKE_SERIES;
      const full = series.views.full;
      const zoom = series.views.zoom;
      const cmp = compareAxisViews(series.points, full, zoom);
      state.graphChecked = true;
      fb.className = 'feedback good';
      fb.textContent = cmp.appearanceChanged && cmp.valuesIdentical
        ? 'Correct pattern: the zoomed window changes appearance, but every monthly value and the mean/min/max stay identical. A tight axis is not automatically a lie — but dramatic claims need the context view too.'
        : 'Compare both views and re-check the table.';
      note('Graph framing', 'Axis window changed appearance; underlying checkout values unchanged.');
      save();
      break;
    }
    case 'graph-next':
      state.progress.graphDone = true;
      save();
      go('sample');
      break;
    case 'set-method':
      state.sampleMethod = btn.getAttribute('data-method');
      render();
      break;
    case 'draw-sample': {
      const rng = createRng(state.sampleSeed + state.sampleSize + state.sampleMethod.length);
      const drawn = drawSample(CAMPUS_POPULATION, state.sampleMethod, state.sampleSize, rng);
      const summary = summarizePreference(drawn.sample);
      state.sampleResult = { ...drawn, summary };
      const popSum = popSummaryCached();
      const insight = samplingBiasInsight(popSum, summary);
      const fb = document.getElementById('sample-feedback');
      const method = SAMPLING_METHODS.find((m) => m.id === state.sampleMethod);
      let msg;
      if (method?.biased) {
        msg = `Cafe intercept over-represents cafe regulars (sample cafe share ${round(summary.cafeShare * 100, 1)}% vs population ${round(popSum.cafeShare * 100, 1)}%). Preference estimates shift toward cafe nooks.`;
      } else {
        msg = `Less-biased draw from the full roster. Preference gaps are typically smaller (max |diff| ${round(insight.maxAbsDiff * 100, 1)} pp on this run).`;
      }
      render();
      const fb2 = document.getElementById('sample-feedback');
      if (fb2) {
        fb2.className = 'feedback ' + (method?.biased ? 'warn' : 'good');
        fb2.textContent = msg;
      }
      note('Sampling', msg);
      save();
      break;
    }
    case 'sample-large-biased': {
      state.sampleMethod = 'volunteer_cafe';
      state.sampleSize = 120;
      state.largeBiasedTried = true;
      const rng = createRng(99);
      const drawn = drawSample(CAMPUS_POPULATION, 'volunteer_cafe', 120, rng);
      const summary = summarizePreference(drawn.sample);
      state.sampleResult = { ...drawn, summary };
      state.progress.sampleDone = state.progress.sampleDone; // keep
      render();
      const fb = document.getElementById('sample-feedback');
      if (fb) {
        fb.className = 'feedback warn';
        fb.textContent =
          'Large biased sample (n=120): cafe regulars remain over-represented. Bigger n makes the biased estimate more stable — it does not magically fix who was missing.';
      }
      note('Sampling', 'Larger cafe-biased sample did not remove composition bias.');
      save();
      break;
    }
    case 'sample-hint': {
      const fb = document.getElementById('sample-feedback');
      if (fb) {
        fb.className = 'feedback';
        fb.textContent =
          'Hint: compare cafe-regular % in the sample vs 20% in the population. Then try Simple random at the same n.';
      }
      break;
    }
    case 'sample-next':
      state.progress.sampleDone = true;
      save();
      go('corr');
      break;
    case 'corr-pooled':
      state.corrStratify = false;
      render();
      break;
    case 'corr-stratify':
      state.corrStratify = true;
      render();
      break;
    case 'corr-hint': {
      state.corrFeedback =
        'Hint: turn on Stratify. Club members sit higher on score; the pooled cloud looks like a strong hours→score slope partly because two groups are mixed.';
      render();
      break;
    }
    case 'corr-choose': {
      const id = btn.getAttribute('data-id');
      state.corrChoice = id;
      const ev = evaluateCorrelationConclusion(id);
      state.corrFeedback = ev.feedback;
      if (ev.ok) {
        state.progress.corrDone = true;
        note('Correlation', ev.feedback);
      }
      save();
      render();
      break;
    }
    case 'corr-next':
      if (!state.progress.corrDone) {
        state.corrFeedback =
          'Pick a conclusion that rejects “correlation proves cause” or that flags the need for stronger design, then continue.';
        render();
        break;
      }
      go('headline');
      break;
    case 'score-headline': {
      state.headlineText = document.getElementById('headline')?.value || state.headlineText;
      state.headlineScore = scoreHeadline(state.headlineText);
      if (state.headlineScore.ok) {
        state.progress.headlineDone = true;
        note('Headline', state.headlineText);
      }
      save();
      render();
      break;
    }
    case 'headline-next':
      state.headlineText = document.getElementById('headline')?.value || state.headlineText;
      if (!state.progress.headlineDone) {
        state.headlineScore = scoreHeadline(state.headlineText);
        if (state.headlineScore.ok) {
          state.progress.headlineDone = true;
          note('Headline', state.headlineText);
          save();
        } else {
          save();
          render();
          break;
        }
      }
      go('done');
      break;
    default:
      break;
  }
}

load();
render();
