import { LIBRARY, LIB, MUSCLES } from './exercises.js';
import { svg, animate } from './diagram.js';
import { WHY, SCHEDULE, targets, defaultProgram } from './program.js';
import { load, save, defaults, requestPersist, putPhoto, delPhoto, allPhotos, resizeImage, exportAll, importAll } from './store.js';
import { suggest, entryStats, workingSets, uid, dayKey, startOfWeek, fmtDate, fmtDur, fmtClock, fmtW, esc, toKg, e1rm } from './logic.js';
import { lineChart } from './charts.js';

let S = load();
let saveT = 0;
const commit = (now = false) => {
  clearTimeout(saveT);
  if (now) save(S);
  else saveT = setTimeout(() => save(S), 300);
};
window.addEventListener('pagehide', () => save(S));
document.addEventListener('visibilitychange', () => { if (document.hidden) save(S); });

const $ = (sel, root = document) => root.querySelector(sel);
const main = $('#main');
const ui = { libQ: '', libM: 'All', editDay: null, photos: [], photoUrls: {} };

// ───────────────────────── exercises ─────────────────────────
function getEx(id) {
  const base = LIB[id] || S.customEx[id];
  if (!base) return null;
  const ov = S.exOverrides[id] || {};
  return { ...base, unit: ov.unit || base.unit || 'kg', inc: ov.inc ?? base.inc ?? 0 };
}
const diagramOf = (ex) => ex?.d || LIB[ex?.like]?.d || LIB.plank.d;
const allEx = () => [...LIBRARY.map((e) => getEx(e.id)), ...Object.keys(S.customEx).map(getEx)];

function history(exId) {
  const out = [];
  for (let i = S.workouts.length - 1; i >= 0; i--) {
    const w = S.workouts[i];
    for (const e of w.entries) if (e.exId === exId) out.push({ date: w.start, unit: e.unit, sets: e.sets, wid: w.id });
  }
  return out;
}

function latestWeight() {
  const b = [...S.body].sort((a, z) => a.date - z.date);
  return b.length ? b[b.length - 1].kg : S.profile.startWeight;
}

// ───────────────────────── icons ─────────────────────────
const I = {
  home: '<path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
  plan: '<path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01"/>',
  lib: '<path d="M6.5 6.5v11M17.5 6.5v11M3 9v6M21 9v6M6.5 12h11"/>',
  prog: '<path d="M4 19V5M4 19h16M8 15l4-4 3 3 5-6"/>',
  gear: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>',
  swap: '<path d="M7 4L3 8l4 4M3 8h14M17 20l4-4-4-4M21 16H7"/>',
  x: '<path d="M6 6l12 12M18 6L6 18"/>',
  back: '<path d="M15 5l-7 7 7 7"/>',
  up: '<path d="M6 15l6-6 6 6"/>',
  down: '<path d="M6 9l6 6 6-6"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  cam: '<path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>',
  play: '<path d="M8 5v14l11-7z"/>',
};
const icon = (n, cls = '') => `<svg viewBox="0 0 24 24" class="ic ${cls}" aria-hidden="true">${I[n]}</svg>`;

// ───────────────────────── routing ─────────────────────────
const TABS = [
  ['today', 'Today', 'home'],
  ['plan', 'Plan', 'plan'],
  ['library', 'Exercises', 'lib'],
  ['progress', 'Progress', 'prog'],
  ['settings', 'Settings', 'gear'],
];
let route = location.hash.slice(1) || 'today';
window.addEventListener('hashchange', () => { route = location.hash.slice(1) || 'today'; render(true); });
function go(r) { if (location.hash.slice(1) !== r) location.hash = r; else render(true); }

function render(scrollTop = false) {
  if (route === 'workout' && !S.active) route = 'today';
  const views = { today: vToday, plan: vPlan, library: vLibrary, progress: vProgress, settings: vSettings, workout: vWorkout };
  const y = window.scrollY;
  main.innerHTML = (views[route] || vToday)();
  document.body.classList.toggle('in-workout', route === 'workout');
  $('#nav').innerHTML = TABS.map(([k, label, ic]) => `<button data-act="nav" data-to="${k}" class="${route === k ? 'on' : ''}">${icon(ic)}<span>${label}</span></button>`).join('');
  window.scrollTo(0, scrollTop ? 0 : y);
  if (route === 'progress') loadPhotos();
  tick();
}

// ───────────────────────── TODAY ─────────────────────────
function weekDots() {
  const wk = startOfWeek();
  const days = new Set(S.workouts.filter((w) => w.start >= wk).map((w) => (new Date(w.start).getDay() + 6) % 7));
  const today = (new Date().getDay() + 6) % 7;
  return ['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => `<div class="dot ${days.has(i) ? 'done' : ''} ${i === today ? 'today' : ''}"><span>${d}</span></div>`).join('');
}

function vToday() {
  const P = S.program, day = P.days[S.nextDay % P.days.length];
  const kg = latestWeight();
  const T = targets(S.profile, kg);
  const start = S.profile.startWeight, goal = S.profile.goalWeight;
  const pct = Math.max(0, Math.min(100, ((start - kg) / Math.max(0.1, start - goal)) * 100));
  const wkCount = S.workouts.filter((w) => w.start >= startOfWeek()).length;
  let ups = 0;
  for (const itx of day?.items || []) {
    const ex = getEx(itx.exId);
    if (ex && suggest(ex, itx, history(itx.exId)).kind === 'up') ups++;
  }
  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
  const standalone = navigator.standalone || matchMedia('(display-mode: standalone)').matches;
  const hr = new Date().getHours();
  const hello = hr < 12 ? 'Good morning' : hr < 18 ? 'Good afternoon' : 'Good evening';

  return `
  <header class="top"><div><p class="eyebrow">${fmtDate(Date.now(), { weekday: 'long', day: 'numeric', month: 'long' })}</p><h1>${hello}${S.profile.name ? ', ' + esc(S.profile.name) : ''}</h1></div></header>
  ${isIOS && !standalone ? `<div class="card hint">📲 <b>Install on your iPhone:</b> tap the <b>Share</b> button in Safari → <b>Add to Home Screen</b>. It then opens like an app and works offline.</div>` : ''}
  ${S.active ? `<button class="card resume" data-act="nav" data-to="workout"><span class="pulse"></span><div><b>Workout in progress</b><small>${esc(S.active.dayName)} · started ${fmtDur(Date.now() - S.active.start)} ago</small></div><span class="chev">Resume ›</span></button>` : ''}

  ${day ? `<section class="card next">
    <p class="eyebrow">Next workout</p>
    <h2>${esc(day.name)}</h2>
    <p class="muted">${day.items.length} exercises${day.warmup?.min ? ` · ${day.warmup.min} min warm-up` : ''}${day.finisher?.min ? ` · ${day.finisher.min} min incline walk` : ''}</p>
    ${ups ? `<p class="badge up">⬆ ${ups} weight increase${ups > 1 ? 's' : ''} ready</p>` : ''}
    <ul class="mini-list">${day.items.map((x) => `<li>${esc(getEx(x.exId)?.name || x.exId)} <span>${x.sets}×${x.repMin}–${x.repMax}${getEx(x.exId)?.type === 'time' ? 's' : ''}</span></li>`).join('')}</ul>
    ${S.active ? '' : `<button class="btn primary big" data-act="start" data-day="${S.nextDay % P.days.length}">Start workout</button>`}
    <div class="row-scroll">${P.days.map((d, i) => (i === S.nextDay % P.days.length ? '' : `<button class="chip" data-act="${S.active ? 'noop' : 'start'}" data-day="${i}">${esc(d.name.split('·')[0].trim())}</button>`)).join('')}<span class="muted small">or start another day</span></div>
  </section>` : ''}

  <section class="card">
    <div class="split"><div><p class="eyebrow">Goal</p><h3>${fmtW(Math.round(kg * 10) / 10)} kg → ${goal} kg</h3></div><button class="btn sm" data-act="weigh">Log weight</button></div>
    <div class="bar"><span style="width:${pct}%"></span></div>
    <p class="muted small">${T.toLose > 0 ? `${fmtW(Math.round(T.toLose * 10) / 10)} kg to go · about ${T.weeks} weeks at 0.5 kg/week (${fmtDate(Date.now() + T.weeks * 6048e5, { day: 'numeric', month: 'short', year: 'numeric' })})` : '🎉 Goal reached! Set a new one in Settings.'}</p>
  </section>

  <section class="card">
    <div class="split"><div><p class="eyebrow">This week</p><h3>${wkCount} / ${P.days.length} workouts</h3></div></div>
    <div class="dots">${weekDots()}</div>
  </section>

  <section class="card">
    <p class="eyebrow">Daily targets for fat loss</p>
    <div class="stats">
      <div><b>${T.kcal}</b><small>calories</small></div>
      <div><b>${T.protein} g</b><small>protein</small></div>
      <div><b>8–10k</b><small>steps</small></div>
    </div>
    <p class="muted small">≈ ${T.carbs} g carbs · ${T.fat} g fat · 2.5–3 L water. Protein at every meal keeps your muscle while the fat comes off. Estimated maintenance: ${T.tdee} kcal/day.</p>
  </section>`;
}

// ───────────────────────── PLAN ─────────────────────────
function vPlan() {
  const P = S.program;
  return `
  <header class="top"><div><p class="eyebrow">Your program</p><h1>${esc(P.name)}</h1></div></header>
  <p class="muted pad">${SCHEDULE}</p>
  ${P.days.map((d, di) => planDay(d, di)).join('')}
  <details class="card why"><summary><b>Why this plan fits you</b></summary>${WHY.map(([h, t]) => `<h4>${h}</h4><p>${t}</p>`).join('')}</details>
  <button class="btn ghost" data-act="add-day">${icon('plus')} Add a day</button>`;
}

function planDay(d, di) {
  const editing = ui.editDay === d.id;
  const next = di === S.nextDay % S.program.days.length;
  const rows = d.items.map((x, ii) => {
    const ex = getEx(x.exId);
    const u = ex?.type === 'time' ? 's' : '';
    if (!editing)
      return `<li><button class="link" data-act="ex-detail" data-id="${x.exId}">${svg(diagramOf(ex), 1, 'thumb')}<span><b>${esc(ex?.name || x.exId)}</b><small>${x.sets} sets × ${x.repMin}–${x.repMax}${u}${ex?.perSide ? ' each side' : ''} · rest ${x.rest}s</small></span></button></li>`;
    return `<li class="edit-row">
      <div class="split"><b>${esc(ex?.name || x.exId)}</b><span class="tools">
        <button class="ib" data-act="it-move" data-d="${di}" data-i="${ii}" data-dir="-1" aria-label="Move up">${icon('up')}</button>
        <button class="ib" data-act="it-move" data-d="${di}" data-i="${ii}" data-dir="1" aria-label="Move down">${icon('down')}</button>
        <button class="ib" data-act="it-swap" data-d="${di}" data-i="${ii}" aria-label="Swap">${icon('swap')}</button>
        <button class="ib danger" data-act="it-del" data-d="${di}" data-i="${ii}" aria-label="Remove">${icon('x')}</button></span></div>
      <div class="edit-fields">
        <label>Sets<input type="number" inputmode="numeric" data-in="it" data-d="${di}" data-i="${ii}" data-f="sets" value="${x.sets}"></label>
        <label>${u ? 'Min sec' : 'Min reps'}<input type="number" inputmode="numeric" data-in="it" data-d="${di}" data-i="${ii}" data-f="repMin" value="${x.repMin}"></label>
        <label>${u ? 'Max sec' : 'Max reps'}<input type="number" inputmode="numeric" data-in="it" data-d="${di}" data-i="${ii}" data-f="repMax" value="${x.repMax}"></label>
        <label>Rest s<input type="number" inputmode="numeric" data-in="it" data-d="${di}" data-i="${ii}" data-f="rest" value="${x.rest}"></label>
      </div></li>`;
  }).join('');
  return `<section class="card day ${next ? 'is-next' : ''}">
    <div class="split">
      ${editing ? `<input class="title-input" data-in="day-name" data-d="${di}" value="${esc(d.name)}">` : `<div>${next ? '<p class="eyebrow accent">Up next</p>' : ''}<h3>${esc(d.name)}</h3></div>`}
      <button class="btn sm ${editing ? 'primary' : ''}" data-act="edit-day" data-id="${d.id}">${editing ? 'Done' : 'Edit'}</button>
    </div>
    ${editing ? `<div class="edit-fields two"><label>Warm-up walk (min)<input type="number" inputmode="numeric" data-in="cardio" data-d="${di}" data-f="warmup" value="${d.warmup?.min ?? 0}"></label><label>Incline walk after (min)<input type="number" inputmode="numeric" data-in="cardio" data-d="${di}" data-f="finisher" value="${d.finisher?.min ?? 0}"></label></div>`
      : `<p class="muted small">🏃 ${d.warmup?.min ? `${d.warmup.min} min treadmill warm-up` : 'No warm-up'}${d.finisher?.min ? ` · ${d.finisher.min} min incline walk after` : ''}</p>`}
    <ul class="plan-list">${rows}</ul>
    ${editing ? `<div class="btn-row"><button class="btn sm" data-act="it-add" data-d="${di}">${icon('plus')} Add exercise</button><button class="btn sm" data-act="set-next" data-d="${di}">Make next</button><button class="btn sm danger" data-act="day-del" data-d="${di}">Delete day</button></div>` : ''}
  </section>`;
}

// ───────────────────────── LIBRARY ─────────────────────────
function libList() {
  const q = ui.libQ.trim().toLowerCase();
  const list = allEx().filter((e) => (ui.libM === 'All' || e.muscle === ui.libM) && (!q || (e.name + ' ' + e.target + ' ' + e.equip).toLowerCase().includes(q)));
  if (!list.length) return `<p class="muted pad">No exercises match. Add your own machine below.</p>`;
  return list.map((e) => `<button class="lib-row" data-act="ex-detail" data-id="${e.id}">${svg(diagramOf(e), 1, 'thumb')}<span><b>${esc(e.name)}${e.custom ? ' <em class="tag">My gym</em>' : ''}</b><small>${esc(e.target || e.muscle)} · ${esc(e.equip)}</small></span></button>`).join('');
}

function vLibrary() {
  return `
  <header class="top"><div><p class="eyebrow">${allEx().length} exercises</p><h1>Exercises</h1></div><button class="btn sm primary" data-act="custom-new">${icon('plus')} My machine</button></header>
  <input class="search" type="search" placeholder="Search exercises or machines" data-in="lib-q" value="${esc(ui.libQ)}">
  <div class="row-scroll chips">${['All', ...MUSCLES].map((m) => `<button class="chip ${ui.libM === m ? 'on' : ''}" data-act="lib-m" data-m="${m}">${m}</button>`).join('')}</div>
  <div id="lib-list" class="card list">${libList()}</div>`;
}

// ───────────────────────── PROGRESS ─────────────────────────
function vProgress() {
  const body = [...S.body].sort((a, z) => a.date - z.date);
  const kg = latestWeight();
  const first = body[0]?.kg ?? S.profile.startWeight;
  const waist = body.filter((b) => b.waist);
  const prs = [];
  const seen = new Set();
  for (const w of S.workouts) for (const e of w.entries) seen.add(e.exId);
  for (const id of seen) {
    const ex = getEx(id);
    if (!ex || ex.type !== 'reps') continue;
    let best = null;
    for (const h of history(id)) for (const s of workingSets(h)) {
      const v = e1rm(toKg(+s.w || 0, h.unit), +s.reps || 0);
      if (!best || v > best.v) best = { v, s, unit: h.unit, date: h.date };
    }
    if (best && best.v > 0) prs.push({ ex, ...best });
  }
  prs.sort((a, z) => z.date - a.date);
  const wos = [...S.workouts].reverse();

  return `
  <header class="top"><div><p class="eyebrow">Progress</p><h1>${body.length > 1 ? `${fmtW(Math.abs(Math.round((kg - first) * 10) / 10))} kg ${kg <= first ? 'lost' : 'gained'}` : 'Your progress'}</h1></div><button class="btn sm primary" data-act="weigh">Log weight</button></header>

  <section class="card">
    <div class="split"><h3>Body weight</h3><small class="muted">${body.length} entries</small></div>
    ${lineChart(body.map((b) => ({ x: b.date, y: b.kg })), { goal: S.profile.goalWeight, unit: 'kg' })}
    <div class="stats"><div><b>${first}</b><small>start kg</small></div><div><b>${fmtW(Math.round(kg * 10) / 10)}</b><small>now kg</small></div><div><b>${fmtW(Math.max(0, Math.round((kg - S.profile.goalWeight) * 10) / 10))}</b><small>to go kg</small></div></div>
    <p class="muted small">Weigh in the morning, after the toilet, before eating. Watch the weekly trend — daily numbers jump around with water.</p>
  </section>

  <section class="card">
    <div class="split"><h3>Waist</h3><small class="muted">best belly-fat tracker</small></div>
    ${waist.length ? lineChart(waist.map((b) => ({ x: b.date, y: b.waist })), { unit: 'cm' }) : '<p class="muted small">Measure around your belly button, relaxed, once a week. Add it when you log your weight.</p>'}
  </section>

  <section class="card">
    <div class="split"><h3>Progress photos</h3><label class="btn sm">${icon('cam')} Add<input type="file" accept="image/*" hidden data-in="photo-add" data-kind="progress"></label></div>
    <div id="photos" class="photos"><p class="muted small">Loading…</p></div>
  </section>

  <section class="card">
    <h3>Personal records</h3>
    ${prs.length ? `<ul class="pr-list">${prs.slice(0, 12).map((p) => `<li><button class="link" data-act="ex-detail" data-id="${p.ex.id}"><span>${esc(p.ex.name)}</span><b>${fmtW(+p.s.w)} ${p.unit} × ${p.s.reps}</b></button></li>`).join('')}</ul>` : '<p class="muted small">Finish a workout to start setting records.</p>'}
  </section>

  <section class="card">
    <div class="split"><h3>Workout history</h3><small class="muted">${S.workouts.length} total</small></div>
    ${wos.length ? `<ul class="hist">${wos.slice(0, 40).map((w) => {
      const vol = w.entries.reduce((a, e) => a + entryStats(e, e.unit).vol, 0);
      return `<li><button class="link" data-act="wo-detail" data-id="${w.id}"><span><b>${esc(w.dayName)}</b><small>${fmtDate(w.start)} · ${fmtDur(w.end - w.start)} · ${w.entries.length} exercises</small></span><b>${Math.round(vol).toLocaleString()} kg</b></button></li>`;
    }).join('')}</ul>` : '<p class="muted small">No workouts yet.</p>'}
  </section>`;
}

async function loadPhotos() {
  const box = $('#photos');
  if (!box) return;
  try {
    ui.photos = (await allPhotos()).filter((p) => p.kind === 'progress').sort((a, z) => z.date - a.date);
  } catch { ui.photos = []; }
  if (!$('#photos')) return;
  $('#photos').innerHTML = ui.photos.length
    ? ui.photos.map((p) => `<button class="ph" data-act="photo-view" data-id="${p.id}"><img src="${photoUrl(p)}" alt=""><span>${fmtDate(p.date, { day: 'numeric', month: 'short' })}</span></button>`).join('')
    : '<p class="muted small">Take a photo every 2 weeks, same spot, same light. The mirror lies less than you think — photos show what the scale can\'t.</p>';
}
function photoUrl(p) {
  if (!ui.photoUrls[p.id]) ui.photoUrls[p.id] = URL.createObjectURL(p.blob);
  return ui.photoUrls[p.id];
}

// ───────────────────────── SETTINGS ─────────────────────────
function vSettings() {
  const p = S.profile;
  const f = (k, label, type = 'number', extra = '') => `<label>${label}<input type="${type}" ${type === 'number' ? 'inputmode="decimal"' : ''} data-in="profile" data-f="${k}" value="${esc(p[k])}" ${extra}></label>`;
  return `
  <header class="top"><div><p class="eyebrow">Settings</p><h1>You</h1></div></header>
  <section class="card form">
    ${f('name', 'Name', 'text')}
    <div class="grid2">${f('age', 'Age')}${f('heightCm', 'Height (cm)')}${f('startWeight', 'Start weight (kg)')}${f('goalWeight', 'Goal weight (kg)')}</div>
    <label>Sex<select data-in="profile" data-f="sex"><option value="male" ${p.sex === 'male' ? 'selected' : ''}>Male</option><option value="female" ${p.sex === 'female' ? 'selected' : ''}>Female</option></select></label>
    <p class="muted small">Used for your calorie & protein targets. 6 ft = 183 cm.</p>
  </section>
  <section class="card form">
    <h3>Workout</h3>
    <label class="toggle"><span>Beep when rest is over</span><input type="checkbox" data-in="setting" data-f="sound" ${S.settings.sound ? 'checked' : ''}></label>
    <p class="muted small">Each exercise remembers its own unit (kg or lb) and weight jump — change them on the exercise's page or by tapping the KG/LB header during a workout.</p>
  </section>
  <section class="card form">
    <h3>Backup</h3>
    <p class="muted small">Your data is stored only on this phone. Save a backup now and then (to Files / iCloud Drive).</p>
    <div class="btn-row"><button class="btn" data-act="export">Save backup</button><label class="btn">Restore backup<input type="file" accept="application/json,.json" hidden data-in="import"></label></div>
  </section>
  <section class="card form">
    <h3>Reset</h3>
    <div class="btn-row"><button class="btn" data-act="reset-plan">Reset plan to recommended</button><button class="btn danger" data-act="wipe">Erase all data</button></div>
  </section>
  <p class="muted small center">My Gym · works offline · v1</p>`;
}

// ───────────────────────── WORKOUT ─────────────────────────
function makeEntry(exId, item, planIdx = null) {
  const ex = getEx(exId);
  const hist = history(exId);
  const sug = suggest(ex, item, hist);
  const last = hist.find((h) => workingSets(h).length);
  const lastW = last ? Math.max(...workingSets(last).map((s) => +s.w || 0)) : '';
  const w = sug.w ?? (last && last.unit === ex.unit ? lastW : '');
  const sets = Array.from({ length: item.sets }, () => ({
    w: ex.type === 'reps' && !(ex.bw && !w) ? (w === 0 && !ex.bw ? '' : w) : '',
    reps: ex.type === 'reps' ? sug.reps ?? '' : '',
    secs: ex.type === 'time' ? sug.secs ?? item.repMin : '',
    done: false,
  }));
  return { exId, unit: ex.unit, item: { ...item }, sug, sets, planIdx };
}

function startWorkout(di) {
  const d = S.program.days[di];
  if (!d) return;
  S.active = {
    id: uid(), dayIdx: di, dayId: d.id, dayName: d.name, start: Date.now(),
    warm: d.warmup?.min ? { exId: d.warmup.exId, min: d.warmup.min, speed: '', incline: '', done: false } : null,
    fin: d.finisher?.min ? { exId: d.finisher.exId, min: d.finisher.min, speed: '', incline: '', done: false } : null,
    entries: d.items.map((x, i) => makeEntry(x.exId, x, i)),
  };
  commit(true);
  wake(true);
  unlockAudio();
  go('workout');
}

function cardioCard(c, key, title) {
  if (!c) return '';
  const ex = getEx(c.exId);
  return `<section class="card cardio ${c.done ? 'is-done' : ''}">
    <div class="split"><button class="link" data-act="ex-detail" data-id="${c.exId}">${svg(diagramOf(ex), 1, 'thumb sm')}<span><p class="eyebrow">${title}</p><b>${esc(ex?.name)}</b></span></button>
    <button class="check ${c.done ? 'on' : ''}" data-act="cardio-done" data-k="${key}" aria-label="Done">${icon('check')}</button></div>
    <div class="edit-fields three">
      <label>Minutes<input type="number" inputmode="decimal" data-in="cardio-log" data-k="${key}" data-f="min" value="${esc(c.min)}"></label>
      <label>Speed km/h<input type="number" inputmode="decimal" data-in="cardio-log" data-k="${key}" data-f="speed" value="${esc(c.speed)}" placeholder="5.5"></label>
      <label>Incline %<input type="number" inputmode="decimal" data-in="cardio-log" data-k="${key}" data-f="incline" value="${esc(c.incline)}" placeholder="10"></label>
    </div></section>`;
}

function vWorkout() {
  const A = S.active;
  const done = A.entries.reduce((a, e) => a + e.sets.filter((s) => s.done).length, 0);
  const total = A.entries.reduce((a, e) => a + e.sets.length, 0);
  return `
  <header class="wk-head">
    <button class="ib" data-act="nav" data-to="today" aria-label="Minimise">${icon('back')}</button>
    <div class="wk-title"><b>${esc(A.dayName)}</b><small><span id="elapsed">0:00</span> · ${done}/${total} sets</small></div>
    <button class="btn sm primary" data-act="finish">Finish</button>
  </header>
  <div class="bar thin"><span style="width:${total ? (done / total) * 100 : 0}%"></span></div>
  ${cardioCard(A.warm, 'warm', 'Warm-up')}
  ${A.entries.map((e, i) => exCard(e, i)).join('')}
  ${cardioCard(A.fin, 'fin', 'Fat-burn finisher')}
  <button class="btn ghost" data-act="wk-add">${icon('plus')} Add exercise</button>
  <button class="btn ghost danger" data-act="discard">Discard workout</button>`;
}

function exCard(e, i) {
  const ex = getEx(e.exId);
  const hist = history(e.exId);
  const prev = hist.find((h) => workingSets(h).length);
  const prevSets = prev ? workingSets(prev) : [];
  const isTime = ex.type === 'time';
  const bwOnly = ex.bw && !ex.inc;
  const note = S.exNotes[e.exId] || '';
  const allDone = e.sets.length && e.sets.every((s) => s.done);
  const rows = e.sets.map((s, j) => {
    const p = prevSets[j];
    const prevTxt = p ? (isTime ? `${p.secs}s` : `${+p.w ? fmtW(+p.w) + '×' : ''}${p.reps}`) : '—';
    return `<div class="set-row ${s.done ? 'done' : ''}">
      <button class="set-n ${s.warm ? 'warm' : ''}" data-act="set-warm" data-i="${i}" data-j="${j}" aria-label="Toggle warm-up set">${s.warm ? 'W' : j + 1}</button>
      <span class="prev">${prevTxt}</span>
      ${isTime
        ? `<input type="number" inputmode="numeric" data-in="set" data-i="${i}" data-j="${j}" data-f="secs" value="${esc(s.secs)}" placeholder="${e.item.repMin}"><button class="ib hold" data-act="hold" data-i="${i}" data-j="${j}" aria-label="Start hold timer">${icon('play')}</button>`
        : `<input type="number" inputmode="decimal" step="any" data-in="set" data-i="${i}" data-j="${j}" data-f="w" value="${esc(s.w)}" placeholder="${bwOnly ? 'BW' : e.unit}">
           <input type="number" inputmode="numeric" data-in="set" data-i="${i}" data-j="${j}" data-f="reps" value="${esc(s.reps)}" placeholder="${e.item.repMin}-${e.item.repMax}">`}
      <button class="check ${s.done ? 'on' : ''}" data-act="set-done" data-i="${i}" data-j="${j}" aria-label="Set done">${icon('check')}</button>
    </div>`;
  }).join('');
  const sugCls = e.sug?.kind === 'up' ? 'up' : e.sug?.kind === 'down' ? 'down' : '';
  return `<section class="card ex ${allDone ? 'is-done' : ''}" id="ex-${i}">
    <div class="ex-head">
      <button class="link" data-act="ex-detail" data-id="${e.exId}">${svg(diagramOf(ex), 1, 'thumb')}<span><b>${esc(ex.name)}</b><small>${e.item.sets} × ${e.item.repMin}–${e.item.repMax}${isTime ? 's' : ''}${ex.perSide ? ' each side' : ''} · rest ${e.item.rest}s</small></span></button>
      <div class="tools"><button class="ib" data-act="ex-detail" data-id="${e.exId}" aria-label="How to">${icon('info')}</button><button class="ib" data-act="wk-swap" data-i="${i}" aria-label="Swap">${icon('swap')}</button><button class="ib" data-act="wk-del" data-i="${i}" aria-label="Remove">${icon('x')}</button></div>
    </div>
    ${e.sug?.msg ? `<p class="sug ${sugCls}">${esc(e.sug.msg)}</p>` : ''}
    <input class="note" data-in="ex-note" data-id="${e.exId}" value="${esc(note)}" placeholder="📝 Machine settings (seat, pin, handle)…">
    <div class="set-row head"><span>Set</span><span>Last</span>${isTime ? '<span>Seconds</span><span></span>' : `<button class="unit" data-act="ex-unit" data-i="${i}">${bwOnly ? '+kg' : e.unit.toUpperCase()} ⇄</button><span>Reps</span>`}<span>✓</span></div>
    ${rows}
    <div class="btn-row"><button class="btn sm" data-act="set-add" data-i="${i}">${icon('plus')} Set</button>${e.sets.length > 1 ? `<button class="btn sm" data-act="set-rm" data-i="${i}">− Set</button>` : ''}</div>
  </section>`;
}

function finishWorkout() {
  const A = S.active;
  const entries = A.entries
    .map((e) => ({ exId: e.exId, unit: e.unit, sets: e.sets.filter((s) => s.done).map(({ w, reps, secs, warm }) => ({ w: w === '' ? 0 : +w, reps: +reps || 0, secs: +secs || 0, warm: !!warm, done: true })) }))
    .filter((e) => e.sets.length);
  const cardio = [A.warm, A.fin].filter((c) => c && c.done).map((c) => ({ exId: c.exId, min: +c.min || 0, speed: +c.speed || 0, incline: +c.incline || 0 }));
  if (!entries.length && !cardio.length) {
    if (confirm('No sets ticked off. Discard this workout?')) { S.active = null; commit(true); wake(false); go('today'); }
    return;
  }
  // records
  const prs = [];
  for (const e of entries) {
    const ex = getEx(e.exId);
    if (ex?.type !== 'reps') continue;
    const now = entryStats(e, e.unit).best;
    const before = history(e.exId).reduce((m, h) => Math.max(m, entryStats(h, h.unit).best), 0);
    if (before > 0 && now > before + 0.01) prs.push(ex.name);
  }
  const w = { id: A.id, dayId: A.dayId, dayName: A.dayName, start: A.start, end: Date.now(), entries, cardio };
  S.workouts.push(w);
  if (A.dayIdx != null) S.nextDay = (A.dayIdx + 1) % S.program.days.length;
  S.active = null;
  stopTimer();
  commit(true);
  wake(false);
  const vol = entries.reduce((a, e) => a + entryStats(e, e.unit).vol, 0);
  const sets = entries.reduce((a, e) => a + workingSets(e).length, 0);
  go('today');
  openSheet(`<div class="done-sheet">
    <div class="big-emoji">💪</div><h2>Workout done!</h2>
    <div class="stats"><div><b>${fmtDur(w.end - w.start)}</b><small>time</small></div><div><b>${sets}</b><small>sets</small></div><div><b>${Math.round(vol).toLocaleString()}</b><small>kg lifted</small></div></div>
    ${prs.length ? `<div class="card pr"><b>🏆 New records</b><ul>${prs.map((n) => `<li>${esc(n)}</li>`).join('')}</ul></div>` : ''}
    ${cardio.length ? `<p class="muted">🏃 ${cardio.reduce((a, c) => a + c.min, 0)} min on the treadmill</p>` : ''}
    <p class="muted">Next up: <b>${esc(S.program.days[S.nextDay % S.program.days.length]?.name || '')}</b></p>
    <button class="btn primary big" data-act="sheet-close">Nice</button></div>`);
}

// ───────────────────────── timer, sound, wake lock ─────────────────────────
let T = null;
let actx = null;
function unlockAudio() {
  try {
    actx = actx || new (window.AudioContext || window.webkitAudioContext)();
    if (actx.state === 'suspended') actx.resume();
  } catch {}
}
function beep(n = 3) {
  if (!S.settings.sound || !actx) return;
  for (let k = 0; k < n; k++) {
    const o = actx.createOscillator(), g = actx.createGain();
    o.frequency.value = k === n - 1 ? 1320 : 880;
    o.connect(g); g.connect(actx.destination);
    const t = actx.currentTime + k * 0.28;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.4, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.22);
    o.start(t); o.stop(t + 0.24);
  }
  navigator.vibrate?.([200, 100, 200]);
}
function startTimer(sec, label = 'Rest') {
  T = { end: Date.now() + sec * 1000, total: sec, label };
  tick();
}
function stopTimer() { T = null; tick(); }
function tick() {
  const el = $('#timer');
  const ep = $('#elapsed');
  if (ep && S.active) ep.textContent = fmtClock((Date.now() - S.active.start) / 1000);
  if (!T) { el.hidden = true; return; }
  const left = (T.end - Date.now()) / 1000;
  if (left <= 0) {
    const lbl = T.label;
    T = null;
    el.hidden = true;
    beep();
    toast(lbl === 'Hold' ? 'Time! ✅ Tick the set.' : 'Rest over — next set! 💪');
    return;
  }
  el.hidden = false;
  el.innerHTML = `<div class="t-fill" style="width:${(left / T.total) * 100}%"></div>
    <span class="t-lbl">${T.label}</span><b class="t-time">${fmtClock(left)}</b>
    <button data-act="t-add" data-s="-15">−15</button><button data-act="t-add" data-s="15">+15</button><button data-act="t-skip">Skip</button>`;
}
setInterval(tick, 250);

let lock = null;
async function wake(on) {
  try {
    if (on && 'wakeLock' in navigator && !lock) { lock = await navigator.wakeLock.request('screen'); lock.addEventListener('release', () => (lock = null)); }
    if (!on && lock) { await lock.release(); lock = null; }
  } catch {}
}
document.addEventListener('visibilitychange', () => { if (!document.hidden && S.active) wake(true); });

function toast(msg) {
  const t = $('#toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toast.t);
  toast.t = setTimeout(() => t.classList.remove('show'), 2600);
}

// ───────────────────────── sheets ─────────────────────────
let stopAnim = () => {};
function openSheet(html, mount) {
  stopAnim();
  const sh = $('#sheet');
  sh.innerHTML = `<div class="sheet-bg" data-act="sheet-close"></div><div class="sheet-body" role="dialog"><button class="ib sheet-x" data-act="sheet-close" aria-label="Close">${icon('x')}</button>${html}</div>`;
  sh.hidden = false;
  document.body.classList.add('sheet-open');
  requestAnimationFrame(() => sh.classList.add('open'));
  mount?.(sh);
}
function closeSheet() {
  stopAnim();
  const sh = $('#sheet');
  sh.classList.remove('open');
  document.body.classList.remove('sheet-open');
  setTimeout(() => { if (!sh.classList.contains('open')) { sh.hidden = true; sh.innerHTML = ''; } }, 220);
}

async function exDetail(id) {
  const ex = getEx(id);
  if (!ex) return;
  const hist = history(id);
  const pts = [];
  for (const h of [...hist].reverse()) {
    const st = entryStats(h, h.unit);
    if (ex.type === 'reps' && st.best > 0) pts.push({ x: h.date, y: Math.round(st.best * 10) / 10 });
    if (ex.type === 'time') pts.push({ x: h.date, y: Math.max(...workingSets(h).map((s) => +s.secs || 0)) });
  }
  let machinePhoto = null;
  try { machinePhoto = (await allPhotos()).filter((p) => p.kind === 'machine' && p.exId === id).sort((a, z) => z.date - a.date)[0]; } catch {}
  const cues = ex.cues?.length ? ex.cues : [];
  openSheet(`
    <div class="dg-big"><svg viewBox="0 0 200 160" class="dg" id="dg-anim"></svg></div>
    <h2>${esc(ex.name)}</h2>
    <div class="row-wrap"><span class="chip on">${esc(ex.muscle)}</span><span class="chip">${esc(ex.equip)}</span>${ex.perSide ? '<span class="chip">each side</span>' : ''}</div>
    ${ex.target ? `<p class="muted">Works: ${esc(ex.target)}</p>` : ''}
    ${cues.length ? `<h4>How to do it</h4><ol class="cues">${cues.map((c) => `<li>${esc(c)}</li>`).join('')}</ol>` : ''}
    ${ex.avoid ? `<p class="avoid">⚠️ Avoid: ${esc(ex.avoid)}</p>` : ''}
    <h4>Your machine</h4>
    ${machinePhoto ? `<img class="machine-photo" src="${photoUrl(machinePhoto)}" alt="">` : ''}
    <label class="btn sm">${icon('cam')} ${machinePhoto ? 'Replace photo' : 'Add photo of your machine'}<input type="file" accept="image/*" hidden data-in="photo-add" data-kind="machine" data-id="${id}"></label>
    <label class="field">Notes (seat height, pin, grip…)<textarea data-in="ex-note" data-id="${id}" rows="2">${esc(S.exNotes[id] || '')}</textarea></label>
    ${ex.type === 'reps' ? `<div class="grid2">
      <label class="field">Unit on this machine<select data-in="ex-ov" data-id="${id}" data-f="unit"><option value="kg" ${ex.unit === 'kg' ? 'selected' : ''}>kg</option><option value="lb" ${ex.unit === 'lb' ? 'selected' : ''}>lb</option></select></label>
      <label class="field">Weight jump (${ex.unit})<input type="number" inputmode="decimal" step="any" data-in="ex-ov" data-id="${id}" data-f="inc" value="${ex.inc}"></label></div>` : ''}
    ${pts.length ? `<h4>${ex.type === 'time' ? 'Best hold (s)' : 'Strength trend (est. 1-rep max, kg)'}</h4>${lineChart(pts, {})}` : ''}
    ${hist.length ? `<h4>Recent sessions</h4><ul class="hist small">${hist.slice(0, 6).map((h) => `<li><span>${fmtDate(h.date)}</span><span>${workingSets(h).map((s) => (ex.type === 'time' ? `${s.secs}s` : `${+s.w ? fmtW(+s.w) + h.unit + '×' : ''}${s.reps}`)).join(' · ')}</span></li>`).join('')}</ul>` : ''}
    ${ex.custom ? `<button class="btn ghost danger" data-act="custom-del" data-id="${id}">Delete this exercise</button>` : ''}
  `, (sh) => { stopAnim = animate($('#dg-anim', sh), diagramOf(ex)); });
}

function pickExercise(title, onPick, muscle = null) {
  const list = allEx().filter((e) => !muscle || e.muscle === muscle);
  const groups = muscle ? [muscle] : MUSCLES;
  ui.onPick = onPick;
  openSheet(`<h2>${title}</h2>
    ${muscle ? `<p class="muted">Same muscle group: ${muscle}. <button class="link inline" data-act="pick-all">Show all</button></p>` : ''}
    ${groups.map((g) => {
      const items = list.filter((e) => e.muscle === g);
      return items.length ? `<h4>${g}</h4><div class="list">${items.map((e) => `<button class="lib-row" data-act="pick" data-id="${e.id}">${svg(diagramOf(e), 1, 'thumb')}<span><b>${esc(e.name)}</b><small>${esc(e.target || '')}</small></span></button>`).join('')}</div>` : '';
    }).join('')}`);
  ui.pickTitle = title;
}

function customForm() {
  openSheet(`<h2>Add your machine</h2>
    <p class="muted">Use the name on the machine. Pick the diagram that moves the same way.</p>
    <form id="cf" class="form">
      <label class="field">Name<input name="name" required placeholder="e.g. Hammer Strength Iso Row"></label>
      <div class="grid2">
        <label class="field">Muscle group<select name="muscle">${MUSCLES.map((m) => `<option>${m}</option>`).join('')}</select></label>
        <label class="field">Type<select name="type"><option value="reps">Weight × reps</option><option value="bw">Bodyweight reps</option><option value="time">Timed hold</option></select></label>
        <label class="field">Unit<select name="unit"><option value="lb">lb</option><option value="kg">kg</option></select></label>
        <label class="field">Weight jump<input name="inc" type="number" step="any" inputmode="decimal" value="5"></label>
      </div>
      <label class="field">Diagram looks like<select name="like">${LIBRARY.map((e) => `<option value="${e.id}">${esc(e.muscle)} — ${esc(e.name)}</option>`).join('')}</select></label>
      <label class="field">What it works (optional)<input name="target" placeholder="e.g. upper back, lats"></label>
      <label class="field">Steps / cues — one per line (optional)<textarea name="cues" rows="3"></textarea></label>
      <button class="btn primary big" type="submit">Save machine</button>
    </form>`, (sh) => {
    const fm = $('#cf', sh);
    const sync = () => {
      const m = fm.muscle.value;
      const first = LIBRARY.find((e) => e.muscle === m);
      if (first && LIB[fm.like.value]?.muscle !== m) fm.like.value = first.id;
    };
    fm.muscle.addEventListener('change', sync);
    fm.addEventListener('submit', (ev) => {
      ev.preventDefault();
      const id = 'c-' + uid();
      const type = fm.type.value;
      S.customEx[id] = {
        id, custom: true, name: fm.name.value.trim(), muscle: fm.muscle.value, target: fm.target.value.trim(),
        equip: 'Machine', type: type === 'bw' ? 'reps' : type, bw: type !== 'reps', unit: fm.unit.value,
        inc: +fm.inc.value || 0, like: fm.like.value, cues: fm.cues.value.split('\n').map((x) => x.trim()).filter(Boolean),
        avoid: '',
      };
      commit(true);
      toast('Machine added');
      closeSheet();
      render();
      exDetail(id);
    });
  });
}

function weighForm() {
  const last = [...S.body].sort((a, z) => z.date - a.date)[0];
  openSheet(`<h2>Log weight</h2><form id="wf" class="form">
    <div class="grid2"><label class="field">Weight (kg)<input name="kg" type="number" step="0.1" inputmode="decimal" required value="${last?.kg ?? S.profile.startWeight}"></label>
    <label class="field">Waist (cm, optional)<input name="waist" type="number" step="0.1" inputmode="decimal" value="${last?.waist ?? ''}"></label></div>
    <button class="btn primary big" type="submit">Save</button>
    ${S.body.length ? `<h4>Recent</h4><ul class="hist small">${[...S.body].sort((a, z) => z.date - a.date).slice(0, 8).map((b) => `<li><span>${fmtDate(b.date)}</span><span>${b.kg} kg${b.waist ? ' · ' + b.waist + ' cm' : ''} <button type="button" class="link inline danger" data-act="body-del" data-id="${b.id}">delete</button></span></li>`).join('')}</ul>` : ''}
  </form>`, (sh) => {
    $('#wf', sh).addEventListener('submit', (ev) => {
      ev.preventDefault();
      const f = ev.target;
      const today = dayKey(Date.now());
      S.body = S.body.filter((b) => dayKey(b.date) !== today);
      S.body.push({ id: uid(), date: Date.now(), kg: +f.kg.value, waist: f.waist.value ? +f.waist.value : null });
      commit(true);
      closeSheet();
      render();
      toast('Weight saved');
    });
  });
}

function woDetail(id) {
  const w = S.workouts.find((x) => x.id === id);
  if (!w) return;
  openSheet(`<h2>${esc(w.dayName)}</h2><p class="muted">${fmtDate(w.start, { weekday: 'long', day: 'numeric', month: 'long' })} · ${fmtDur(w.end - w.start)}</p>
    ${(w.cardio || []).map((c) => `<p>🏃 ${esc(getEx(c.exId)?.name)}: ${c.min} min${c.speed ? ` @ ${c.speed} km/h` : ''}${c.incline ? `, ${c.incline}%` : ''}</p>`).join('')}
    <ul class="hist">${w.entries.map((e) => {
      const ex = getEx(e.exId);
      return `<li><span><b>${esc(ex?.name || e.exId)}</b><small>${e.sets.map((s) => (ex?.type === 'time' ? `${s.secs}s` : `${s.w ? fmtW(s.w) + e.unit + '×' : ''}${s.reps}`) + (s.warm ? ' (W)' : '')).join(' · ')}</small></span></li>`;
    }).join('')}</ul>
    <button class="btn ghost danger" data-act="wo-del" data-id="${w.id}">Delete this workout</button>`);
}

// ───────────────────────── actions ─────────────────────────
const A = {
  nav: (el) => go(el.dataset.to),
  noop: () => toast('Finish your current workout first'),
  start: (el) => startWorkout(+el.dataset.day),
  weigh: weighForm,
  'sheet-close': closeSheet,
  'ex-detail': (el) => exDetail(el.dataset.id),
  'wo-detail': (el) => woDetail(el.dataset.id),
  'wo-del': (el) => {
    if (!confirm('Delete this workout from your history?')) return;
    S.workouts = S.workouts.filter((w) => w.id !== el.dataset.id);
    commit(true); closeSheet(); render();
  },
  'body-del': (el) => { S.body = S.body.filter((b) => b.id !== el.dataset.id); commit(true); closeSheet(); render(); },
  'lib-m': (el) => { ui.libM = el.dataset.m; render(); },
  'custom-new': customForm,
  'custom-del': (el) => {
    const id = el.dataset.id;
    const used = S.program.days.some((d) => d.items.some((x) => x.exId === id));
    if (used) return alert('This exercise is in your plan. Remove it from the plan first.');
    if (!confirm('Delete this exercise? Its past logs stay in history.')) return;
    delete S.customEx[id];
    commit(true); closeSheet(); render();
  },
  pick: (el) => { const f = ui.onPick; closeSheet(); f?.(el.dataset.id); },
  'pick-all': () => pickExercise(ui.pickTitle, ui.onPick),

  // plan
  'edit-day': (el) => { ui.editDay = ui.editDay === el.dataset.id ? null : el.dataset.id; render(); },
  'it-move': (el) => {
    const d = S.program.days[+el.dataset.d], i = +el.dataset.i, j = i + +el.dataset.dir;
    if (j < 0 || j >= d.items.length) return;
    [d.items[i], d.items[j]] = [d.items[j], d.items[i]];
    commit(); render();
  },
  'it-del': (el) => { S.program.days[+el.dataset.d].items.splice(+el.dataset.i, 1); commit(); render(); },
  'it-swap': (el) => {
    const d = S.program.days[+el.dataset.d], it = d.items[+el.dataset.i];
    pickExercise('Swap for…', (id) => { it.exId = id; fixRange(it, getEx(id)); commit(); render(); }, getEx(it.exId)?.muscle);
  },
  'it-add': (el) => {
    const d = S.program.days[+el.dataset.d];
    pickExercise('Add exercise', (id) => {
      const it = { exId: id, sets: 3, repMin: 8, repMax: 12, rest: 90 };
      fixRange(it, getEx(id));
      d.items.push(it); commit(); render();
    });
  },
  'set-next': (el) => { S.nextDay = +el.dataset.d; commit(); toast('Set as next workout'); render(); },
  'day-del': (el) => {
    if (S.program.days.length <= 1) return alert('You need at least one day.');
    if (!confirm('Delete this whole day?')) return;
    S.program.days.splice(+el.dataset.d, 1);
    S.nextDay = S.nextDay % S.program.days.length;
    commit(); render();
  },
  'add-day': () => {
    const id = 'd' + uid();
    S.program.days.push({ id, name: `Day ${S.program.days.length + 1} · New`, warmup: { exId: 'treadmill-incline-walk', min: 5 }, finisher: { exId: 'treadmill-incline-walk', min: 15 }, items: [] });
    ui.editDay = id; commit(); render();
  },

  // workout
  'set-done': (el) => {
    const e = S.active.entries[+el.dataset.i], s = e.sets[+el.dataset.j];
    const ex = getEx(e.exId);
    unlockAudio();
    s.done = !s.done;
    if (s.done) {
      if (ex.type === 'reps' && s.reps === '') s.reps = e.sug?.reps ?? e.item.repMin;
      if (ex.type === 'time' && s.secs === '') s.secs = e.item.repMin;
      const isLastSet = e.sets.every((x) => x.done);
      const isLastEx = S.active.entries.every((x) => x.sets.every((y) => y.done));
      if (!isLastEx) startTimer(isLastSet ? Math.max(60, e.item.rest) : e.item.rest, 'Rest');
      else stopTimer();
      navigator.vibrate?.(30);
    }
    commit(); render();
  },
  'set-warm': (el) => { const s = S.active.entries[+el.dataset.i].sets[+el.dataset.j]; s.warm = !s.warm; commit(); render(); },
  'set-add': (el) => {
    const e = S.active.entries[+el.dataset.i];
    const l = e.sets[e.sets.length - 1] || {};
    e.sets.push({ w: l.w ?? '', reps: l.reps ?? '', secs: l.secs ?? '', done: false });
    commit(); render();
  },
  'set-rm': (el) => { const e = S.active.entries[+el.dataset.i]; if (e.sets.length > 1) e.sets.pop(); commit(); render(); },
  hold: (el) => {
    const e = S.active.entries[+el.dataset.i], s = e.sets[+el.dataset.j];
    unlockAudio();
    startTimer(+s.secs || e.item.repMin, 'Hold');
  },
  'ex-unit': (el) => {
    const e = S.active.entries[+el.dataset.i];
    const ex = getEx(e.exId);
    if (ex.bw && !ex.inc) return toast('Bodyweight exercise — type extra weight in kg if you add any');
    e.unit = e.unit === 'kg' ? 'lb' : 'kg';
    S.exOverrides[e.exId] = { ...(S.exOverrides[e.exId] || {}), unit: e.unit, inc: e.unit === 'lb' ? (ex.equip === 'Dumbbell' ? 5 : 10) : ex.equip === 'Dumbbell' ? 2 : 5 };
    toast(`${ex.name}: now in ${e.unit.toUpperCase()}`);
    commit(); render();
  },
  'wk-swap': (el) => {
    const i = +el.dataset.i, e = S.active.entries[i];
    pickExercise('Swap for…', (id) => {
      const fresh = makeEntry(id, fixRange({ ...e.item }, getEx(id)), e.planIdx);
      S.active.entries[i] = fresh;
      if (e.planIdx != null && confirm('Also use this exercise in your plan from now on?')) {
        const d = S.program.days.find((x) => x.id === S.active.dayId);
        if (d?.items[e.planIdx]) { d.items[e.planIdx].exId = id; fixRange(d.items[e.planIdx], getEx(id)); }
      }
      commit(); render();
    }, getEx(e.exId)?.muscle);
  },
  'wk-del': (el) => { if (confirm('Remove this exercise from today\'s workout?')) { S.active.entries.splice(+el.dataset.i, 1); commit(); render(); } },
  'wk-add': () => pickExercise('Add exercise', (id) => {
    const it = fixRange({ exId: id, sets: 3, repMin: 8, repMax: 12, rest: 90 }, getEx(id));
    S.active.entries.push(makeEntry(id, it));
    commit(); render();
    setTimeout(() => $(`#ex-${S.active.entries.length - 1}`)?.scrollIntoView({ behavior: 'smooth' }), 50);
  }),
  'cardio-done': (el) => { const c = S.active[el.dataset.k]; c.done = !c.done; commit(); render(); },
  finish: () => {
    const open = S.active.entries.reduce((a, e) => a + e.sets.filter((s) => !s.done).length, 0);
    if (open && !confirm(`${open} set${open > 1 ? 's are' : ' is'} not ticked. Finish anyway? (Unticked sets are not saved.)`)) return;
    finishWorkout();
  },
  discard: () => { if (confirm('Discard this workout? Nothing will be saved.')) { S.active = null; stopTimer(); commit(true); wake(false); go('today'); } },
  't-add': (el) => { if (T) { T.end += +el.dataset.s * 1000; T.total = Math.max(T.total, (T.end - Date.now()) / 1000); tick(); } },
  't-skip': stopTimer,

  // photos
  'photo-view': (el) => {
    const p = ui.photos.find((x) => x.id === el.dataset.id);
    if (!p) return;
    openSheet(`<h2>${fmtDate(p.date, { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' })}</h2><img class="full-photo" src="${photoUrl(p)}" alt=""><button class="btn ghost danger" data-act="photo-del" data-id="${p.id}">Delete photo</button>`);
  },
  'photo-del': async (el) => { if (!confirm('Delete this photo?')) return; await delPhoto(el.dataset.id); closeSheet(); render(); },

  // settings
  export: async () => {
    const json = await exportAll(S);
    const name = `my-gym-backup-${dayKey(Date.now())}.json`;
    const file = new File([json], name, { type: 'application/json' });
    if (navigator.canShare?.({ files: [file] })) {
      try { await navigator.share({ files: [file], title: 'My Gym backup' }); return; } catch (e) { if (e.name === 'AbortError') return; }
    }
    const a = document.createElement('a');
    a.href = URL.createObjectURL(file); a.download = name; a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  },
  'reset-plan': () => { if (confirm('Replace your plan with the recommended 4-day plan? Your history stays.')) { S.program = defaultProgram(); S.nextDay = 0; commit(true); render(); toast('Plan reset'); } },
  wipe: () => {
    if (!confirm('Erase ALL data on this phone — workouts, weights, plan? This cannot be undone.')) return;
    if (!confirm('Really erase everything?')) return;
    S = defaults(); commit(true); indexedDB.deleteDatabase('mygym-photos'); location.hash = 'today'; location.reload();
  },
};

function fixRange(it, ex) {
  if (ex?.type === 'time' && it.repMax <= 20) { it.repMin = 30; it.repMax = 60; it.rest = 45; }
  else if (ex?.type === 'reps' && it.repMax > 25) { it.repMin = 8; it.repMax = 12; it.rest = 90; }
  return it;
}

document.addEventListener('click', (ev) => {
  const el = ev.target.closest('[data-act]');
  if (!el) return;
  const fn = A[el.dataset.act];
  if (fn) { ev.preventDefault(); fn(el, ev); }
});

// ───────────────────────── inputs ─────────────────────────
const IN = {
  set: (el) => { S.active.entries[+el.dataset.i].sets[+el.dataset.j][el.dataset.f] = el.value; commit(); },
  'ex-note': (el) => { S.exNotes[el.dataset.id] = el.value; commit(); },
  'lib-q': (el) => { ui.libQ = el.value; $('#lib-list').innerHTML = libList(); },
  it: (el) => {
    const it = S.program.days[+el.dataset.d].items[+el.dataset.i];
    const v = parseInt(el.value, 10);
    if (v > 0) { it[el.dataset.f] = v; if (it.repMin > it.repMax && el.dataset.f !== 'sets' && el.dataset.f !== 'rest') {} commit(); }
  },
  'day-name': (el) => { S.program.days[+el.dataset.d].name = el.value; commit(); },
  cardio: (el) => {
    const d = S.program.days[+el.dataset.d], k = el.dataset.f;
    d[k] = { exId: d[k]?.exId || 'treadmill-incline-walk', min: Math.max(0, parseInt(el.value, 10) || 0) };
    commit();
  },
  'cardio-log': (el) => { S.active[el.dataset.k][el.dataset.f] = el.value; commit(); },
  profile: (el) => {
    const f = el.dataset.f;
    S.profile[f] = el.type === 'number' ? (parseFloat(el.value) || 0) : el.value;
    commit();
  },
  setting: (el) => { S.settings[el.dataset.f] = el.type === 'checkbox' ? el.checked : el.value; commit(); },
  'ex-ov': (el) => {
    const id = el.dataset.id, f = el.dataset.f;
    S.exOverrides[id] = { ...(S.exOverrides[id] || {}), [f]: f === 'inc' ? parseFloat(el.value) || 0 : el.value };
    if (S.active) for (const e of S.active.entries) if (e.exId === id && f === 'unit') e.unit = el.value;
    commit();
  },
  'photo-add': async (el) => {
    const file = el.files?.[0];
    if (!file) return;
    try {
      const blob = await resizeImage(file);
      const kind = el.dataset.kind;
      if (kind === 'machine') {
        const old = (await allPhotos()).filter((p) => p.kind === 'machine' && p.exId === el.dataset.id);
        for (const p of old) await delPhoto(p.id);
      }
      await putPhoto({ id: uid(), kind, exId: el.dataset.id || null, date: Date.now(), blob });
      toast('Photo saved');
      if (kind === 'machine') exDetail(el.dataset.id);
      else render();
    } catch (e) { alert('Could not save photo: ' + e.message); }
  },
  import: async (el) => {
    const file = el.files?.[0];
    if (!file) return;
    try {
      const st = await importAll(await file.text());
      if (!confirm('Replace the data on this phone with this backup?')) return;
      S = { ...defaults(), ...st }; commit(true); render(); toast('Backup restored');
    } catch (e) { alert(e.message); }
  },
};
const onIn = (ev) => {
  const el = ev.target.closest('[data-in]');
  if (!el) return;
  const fn = IN[el.dataset.in];
  if (!fn) return;
  // file inputs and selects only on change; text on input
  if ((el.type === 'file' || el.tagName === 'SELECT' || el.type === 'checkbox') && ev.type !== 'change') return;
  if (el.dataset.in === 'it' && ev.type === 'change') { fn(el); render(); return; }
  if (el.type !== 'file' && el.tagName !== 'SELECT' && el.type !== 'checkbox' && ev.type === 'change') return;
  fn(el);
};
document.addEventListener('input', onIn);
document.addEventListener('change', onIn);

// select-all on focus makes typing new numbers fast
document.addEventListener('focusin', (ev) => { if (ev.target.matches('.set-row input')) setTimeout(() => ev.target.select?.(), 0); });

// ───────────────────────── boot ─────────────────────────
requestPersist();
if (S.active) wake(true);
render(true);
if ('serviceWorker' in navigator && location.protocol !== 'file:') navigator.serviceWorker.register('./sw.js').catch(() => {});
