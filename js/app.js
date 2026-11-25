import { LIBRARY, LIB, MUSCLES } from './exercises.js';
import { svg, animate } from './diagram.js';
import { WHY, SCHEDULE, targets, defaultProgram } from './program.js';
import { load, save, defaults, requestPersist, putPhoto, delPhoto, allPhotos, getPhoto, resizeImage, exportAll, importAll } from './store.js';
import { suggest, entryStats, workingSets, uid, dayKey, startOfWeek, fmtDate, fmtDur, fmtClock, fmtW, esc, toKg, e1rm } from './logic.js';
import { lineChart } from './charts.js';
import { bodyMap, MUSCLE_NAMES } from './bodymap.js';
import { HOWTO, breathing, tempo } from './howto.js';
import { FOODS, FOOD, FOOD_CATS, MEALS, MEAL_SLOTS, itemTotals } from './foods.js';
import { GYM, GYM_NAME } from './gym.js';
import { getKey, setKey, estimatePlate, extractRecipe } from './ai.js';

let S = load();
S.migr = S.migr || {};
if (!S.migr.glute) {
  const d2 = S.program?.days?.find((d) => d.id === 'd2');
  const it = d2?.items.find((x) => x.exId === 'leg-extension');
  if (it && !d2.items.some((x) => x.exId === 'glute-drive')) Object.assign(it, { exId: 'glute-drive', sets: 3, repMin: 10, repMax: 12, rest: 90 });
  S.migr.glute = true;
}
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
  const g = GYM[id] || {};
  return { ...base, gym: g.where ? g : null, unit: ov.unit || g.unit || base.unit || 'kg', inc: ov.inc ?? g.inc ?? base.inc ?? 0 };
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
  food: '<path d="M7 3v8a2 2 0 0 0 4 0V3M9 11v10M17 3c-2 0-3 2.5-3 6s1 4 3 4v8"/>',
};
const icon = (n, cls = '') => `<svg viewBox="0 0 24 24" class="ic ${cls}" aria-hidden="true">${I[n]}</svg>`;

// ───────────────────────── routing ─────────────────────────
const TABS = [
  ['today', 'Today', 'home'],
  ['plan', 'Plan', 'plan'],
  ['food', 'Food', 'food'],
  ['library', 'Exercises', 'lib'],
  ['progress', 'Progress', 'prog'],
];
let route = location.hash.slice(1) || 'today';
window.addEventListener('hashchange', () => { route = location.hash.slice(1) || 'today'; render(true); });
function go(r) { if (location.hash.slice(1) !== r) location.hash = r; else render(true); }

function render(scrollTop = false) {
  if (route === 'workout' && !S.active) route = 'today';
  const views = { today: vToday, plan: vPlan, food: vFood, library: vLibrary, progress: vProgress, settings: vSettings, workout: vWorkout };
  const y = window.scrollY;
  main.innerHTML = (views[route] || vToday)();
  document.body.classList.toggle('in-workout', route === 'workout');
  $('#nav').innerHTML = TABS.map(([k, label, ic]) => `<button data-act="nav" data-to="${k}" class="${route === k ? 'on' : ''}">${icon(ic)}<span>${label}</span></button>`).join('');
  window.scrollTo(0, scrollTop ? 0 : y);
  if (route === 'progress') loadPhotos();
  if (route === 'food') loadMealPhotos();
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
  <header class="top"><div><p class="eyebrow">${fmtDate(Date.now(), { weekday: 'long', day: 'numeric', month: 'long' })}</p><h1>${hello}${S.profile.name ? ', ' + esc(S.profile.name) : ''}</h1></div><button class="ib" data-act="nav" data-to="settings" aria-label="Settings">${icon('gear')}</button></header>
  ${isIOS && !standalone ? `<div class="card hint">📲 <b>Install on your iPhone:</b> tap the <b>Share</b> button in Safari → <b>Add to Home Screen</b>. It then opens like an app and works offline.</div>` : ''}
  ${resumable() ? `<div class="card undo-card"><div><b>Finished ${esc(resumable().dayName.split('·')[0].trim())} by mistake?</b><small>Ended ${fmtDur(Date.now() - resumable().end)} ago</small></div><button class="btn sm" data-act="wo-resume" data-id="${resumable().id}">↩︎ Resume</button></div>` : ''}
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

  ${(() => { const ft = dayTotals(dayKey(Date.now())); return `<button class="card food-card" data-act="nav" data-to="food"><div class="split"><div><p class="eyebrow">Food today</p><h3>${r0(ft.k)} / ${T.kcal} kcal</h3></div><span class="chev accent">Log food ›</span></div><div class="bar"><span style="width:${Math.min(100, (ft.k / T.kcal) * 100)}%"></span></div><p class="muted small">Protein ${r0(ft.p)} / ${T.protein} g</p></button>`; })()}
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
      return `<li><button class="link" data-act="ex-detail" data-id="${x.exId}">${svg(diagramOf(ex), 1, 'thumb')}<span><b>${esc(ex?.name || x.exId)}${ex && !ex.gym && !ex.custom ? ' <em class="tag q">not seen yet</em>' : ''}</b><small>${x.sets} sets × ${x.repMin}–${x.repMax}${u}${ex?.perSide ? ' each side' : ''} · rest ${x.rest}s</small></span></button></li>`;
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
  const list = allEx().filter((e) => (ui.libM === 'All' || (ui.libM === 'My gym' ? e.gym || e.custom : e.muscle === ui.libM)) && (!q || (e.name + ' ' + e.target + ' ' + e.equip).toLowerCase().includes(q)));
  if (!list.length) return `<p class="muted pad">No exercises match. Add your own machine below.</p>`;
  return list.map((e) => `<button class="lib-row" data-act="ex-detail" data-id="${e.id}">${svg(diagramOf(e), 1, 'thumb')}<span><b>${esc(e.name)}${e.custom || e.gym ? ' <em class="tag">📍</em>' : ''}</b><small>${esc(e.target || e.muscle)} · ${esc(e.equip)}</small></span></button>`).join('');
}

function vLibrary() {
  return `
  <header class="top"><div><p class="eyebrow">${allEx().length} exercises</p><h1>Exercises</h1></div><button class="btn sm primary" data-act="custom-new">${icon('plus')} My machine</button></header>
  <input class="search" type="search" placeholder="Search exercises or machines" data-in="lib-q" value="${esc(ui.libQ)}">
  <div class="row-scroll chips">${['All', 'My gym', ...MUSCLES].map((m) => `<button class="chip ${ui.libM === m ? 'on' : ''}" data-act="lib-m" data-m="${m}">${m}</button>`).join('')}</div>
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

// ───────────────────────── FOOD ─────────────────────────
const foodOf = (id) => FOOD[id] || S.customFoods?.[id] || null;
const entryFood = (e) => e.x || foodOf(e.fid) || { name: '?', portion: '', k: 0, p: 0, c: 0, f: 0 };
const r0 = (n) => Math.round(n);
function foodDay(day = ui.foodDay) {
  S.food = S.food || {};
  if (!S.food[day]) S.food[day] = { breakfast: [], lunch: [], dinner: [], snack: [], photos: {} };
  return S.food[day];
}
const peekDay = (day) => S.food?.[day] || null;
function slotTotals(list) {
  const t = { k: 0, p: 0, c: 0, f: 0 };
  for (const e of list || []) { const f = entryFood(e); t.k += f.k * e.q; t.p += f.p * e.q; t.c += f.c * e.q; t.f += f.f * e.q; }
  return t;
}
function dayTotals(day) {
  const d = peekDay(day);
  const t = { k: 0, p: 0, c: 0, f: 0 };
  if (!d) return t;
  for (const [slot] of MEAL_SLOTS) { const s = slotTotals(d[slot]); t.k += s.k; t.p += s.p; t.c += s.c; t.f += s.f; }
  return t;
}
const shiftDay = (key, n) => { const d = new Date(key + 'T12:00:00'); d.setDate(d.getDate() + n); return dayKey(d.getTime()); };
const qtyTxt = (q) => (q === 0.5 ? '½' : q === 0.25 ? '¼' : q === 0.75 ? '¾' : q === 1.5 ? '1½' : String(q));
const mealLookup = (id) => foodOf(id);

function weekPlan() {
  const wk = startOfWeek();
  if (!S.mealPlan || S.mealPlan.week !== wk) {
    S.mealPlan = { week: wk, days: Array.from({ length: 7 }, (_, i) => ({ breakfast: i % 4, lunch: (i + 1) % 4, dinner: (i + 2) % 4, snack: (i + 3) % 4 })) };
    commit();
  }
  return S.mealPlan;
}

function vFood() {
  ui.foodDay = ui.foodDay || dayKey(Date.now());
  const today = dayKey(Date.now());
  const T = targets(S.profile, latestWeight());
  const ft = ui.foodTab || 'log';
  const tabs = `<div class="seg three">${[['log', 'Food log'], ['plan', 'Meal plan'], ['recipes', 'Recipes']].map(([k, l]) => `<button class="${ft === k ? 'on' : ''}" data-act="food-tab" data-t="${k}">${l}</button>`).join('')}</div>`;
  if (ft === 'recipes') return `<header class="top"><div><p class="eyebrow">From Osta & videos</p><h1>Recipes</h1></div></header>${tabs}${vRecipes()}`;
  if (ui.foodTab === 'plan') return `<header class="top"><div><p class="eyebrow">3 meals + 1 snack</p><h1>Meal plan</h1></div></header>${tabs}${vMealPlan(T)}`;

  const t = dayTotals(ui.foodDay);
  const left = T.kcal - t.k;
  const label = ui.foodDay === today ? 'Today' : ui.foodDay === shiftDay(today, -1) ? 'Yesterday' : fmtDate(new Date(ui.foodDay + 'T12:00:00').getTime());
  const pct = (a, b) => Math.min(100, (a / b) * 100);
  const d = peekDay(ui.foodDay) || {};
  const yest = peekDay(shiftDay(ui.foodDay, -1));
  const plan = weekPlan();
  const dow = (new Date(ui.foodDay + 'T12:00:00').getDay() + 6) % 7;
  return `
  <header class="top"><div><p class="eyebrow">Food</p><h1>${label}</h1></div>
    <div class="daynav"><button class="ib" data-act="food-day" data-n="-1" aria-label="Previous day">${icon('back')}</button><button class="ib flip" data-act="food-day" data-n="1" aria-label="Next day" ${ui.foodDay >= today ? 'disabled' : ''}>${icon('back')}</button></div></header>
  ${tabs}
  <section class="card">
    <div class="split"><div><b class="big-num">${r0(t.k)}</b> <span class="muted">/ ${T.kcal} kcal</span></div><b class="${left < 0 ? 'warn' : 'accent'}">${left >= 0 ? `${r0(left)} left` : `${r0(-left)} over`}</b></div>
    <div class="bar"><span style="width:${pct(t.k, T.kcal)}%;${left < 0 ? 'background:var(--down)' : ''}"></span></div>
    <div class="split small"><span>Protein <b>${r0(t.p)}</b> / ${T.protein} g</span><span class="muted">C ${r0(t.c)} g · F ${r0(t.f)} g</span></div>
    <div class="bar thin2"><span style="width:${pct(t.p, T.protein)}%;background:var(--prot)"></span></div>
  </section>
  ${MEAL_SLOTS.map(([slot, title, emo]) => {
    const list = d[slot] || [];
    const st = slotTotals(list);
    const pid = d.photos?.[slot];
    const pm = MEALS[slot][plan.days[dow][slot]];
    return `<section class="card meal">
      <div class="split"><h3>${emo} ${title}</h3><span class="muted small">${r0(st.k)} kcal · ${r0(st.p)} g P</span></div>
      ${pid ? `<div class="meal-photo"><img data-photo-id="${pid}" alt="Plate photo"><div class="btn-row"><button class="btn sm primary" data-act="ai-est" data-slot="${slot}">✨ Estimate calories</button><button class="btn sm" data-act="meal-photo-del" data-slot="${slot}">Remove photo</button></div></div>` : ''}
      ${list.length ? `<ul class="food-list">${list.map((e, i) => { const f = entryFood(e); return `<li><button class="link" data-act="fe-edit" data-slot="${slot}" data-i="${i}"><span><b>${esc(f.name)}</b><small>${qtyTxt(e.q)} × ${esc(f.portion)}</small></span><span class="kc">${r0(f.k * e.q)}<small>${r0(f.p * e.q)} g P</small></span></button></li>`; }).join('')}</ul>` : ''}
      <div class="btn-row">
        <button class="btn sm" data-act="food-add" data-slot="${slot}">${icon('plus')} Add food</button>
        <label class="btn sm">${icon('cam')} Photo<input type="file" accept="image/*" hidden data-in="meal-photo" data-slot="${slot}"></label>
        ${!list.length && pm ? `<button class="btn sm" data-act="log-plan" data-slot="${slot}" data-m="${pm.id}">📋 ${esc(pm.name)}</button>` : ''}
        ${!list.length && yest?.[slot]?.length ? `<button class="btn sm" data-act="food-copy" data-slot="${slot}">↺ Same as yesterday</button>` : ''}
        ${list.length > 1 ? `<button class="btn sm" data-act="meal-save" data-slot="${slot}">★ Save meal</button>` : ''}
      </div></section>`;
  }).join('')}
  <p class="muted small pad">Numbers are estimates — being roughly right every day beats being perfect some days. Your weekly weight trend tells you if it's working.</p>`;
}

function vMealPlan(T) {
  const plan = weekPlan();
  const dow = (new Date().getDay() + 6) % 7;
  const names = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  return `
  <section class="card">
    <p class="muted small">Target ${T.kcal} kcal · ${T.protein} g protein. Each day below lands close to that. Tap any meal to swap it. Meal 3 is your post-gym meal — it has the most carbs to refuel.</p>
    <button class="btn sm" data-act="grocery">🛒 Grocery list for the week</button>
  </section>
  ${plan.days.map((day, i) => {
    let tk = 0, tp = 0;
    const rows = MEAL_SLOTS.map(([slot, title, emo]) => {
      const m = MEALS[slot][day[slot]];
      const t = itemTotals(m.items, mealLookup);
      tk += t.k; tp += t.p;
      return `<li><button class="link" data-act="plan-swap" data-d="${i}" data-slot="${slot}"><span>${emo} <b>${esc(m.name)}</b><small>${m.items.map(([id, q]) => `${qtyTxt(q)} ${esc(FOOD[id].name.toLowerCase())}`).join(', ')}</small></span><span class="kc">${r0(t.k)}<small>${r0(t.p)} g P</small></span></button></li>`;
    }).join('');
    return `<section class="card ${i === dow ? 'is-next' : ''}"><div class="split"><h3>${names[i]}${i === dow ? ' · today' : ''}</h3><span class="muted small">${r0(tk)} kcal · ${r0(tp)} g P</span></div><ul class="food-list">${rows}</ul>
      ${i === dow ? `<button class="btn sm primary" data-act="plan-log-day" data-d="${i}">Log today's plan</button>` : ''}</section>`;
  }).join('')}`;
}

function grocerySheet() {
  const plan = weekPlan();
  const tot = {};
  for (const day of plan.days) for (const [slot] of MEAL_SLOTS) for (const [id, q] of MEALS[slot][day[slot]].items) tot[id] = (tot[id] || 0) + q;
  const rows = Object.entries(tot).sort((a, z) => FOOD[a[0]].cat.localeCompare(FOOD[z[0]].cat)).map(([id, q]) => {
    const f = FOOD[id];
    const grams = f.g ? ` <span class="muted">(≈ ${q * f.g >= 1000 ? (Math.round((q * f.g) / 100) / 10) + ' kg' : Math.round(q * f.g) + ' g'} cooked)</span>` : '';
    const unit = f.portion.replace(/^1 /, '');
    return `<li><label class="chk"><input type="checkbox"><span><b>${esc(f.name)}</b> — ${Math.round(q * 4) / 4} × ${esc(unit)}${grams}</span></label></li>`;
  }).join('');
  openSheet(`<h2>🛒 Grocery list</h2><p class="muted">Everything for this week's plan. Raw meat weighs about ⅓ more than cooked.</p><ul class="groc">${rows}</ul>`);
}

function addFoodSheet(slot) {
  ui.addSlot = slot;
  ui.foodQ = '';
  ui.foodCat = ui.foodCat || 'Recent';
  openSheet(`<h2>Add to ${esc(MEAL_SLOTS.find((x) => x[0] === slot)[1])}</h2>
    <input class="search" type="search" placeholder="Search: injera, chicken, eggs…" data-in="food-q">
    <div class="row-scroll chips">${['Recent', 'My meals', 'Recipes', ...FOOD_CATS, 'My foods'].map((c) => `<button class="chip ${ui.foodCat === c ? 'on' : ''}" data-act="food-cat" data-c="${c}">${c}</button>`).join('')}</div>
    <div id="food-results" class="list">${foodResults()}</div>
    <div class="btn-row"><button class="btn sm" data-act="quick-add">⚡ Quick add calories</button><button class="btn sm" data-act="food-new">${icon('plus')} Create a food</button></div>`);
}

function recentFoods() {
  const seen = new Map();
  const days = Object.keys(S.food || {}).sort().reverse().slice(0, 14);
  for (const d of days) for (const [slot] of MEAL_SLOTS) for (const e of S.food[d][slot] || []) if (e.fid && !seen.has(e.fid)) seen.set(e.fid, e.q);
  return [...seen.keys()].map(foodOf).filter(Boolean);
}

function foodResults() {
  const q = (ui.foodQ || '').trim().toLowerCase();
  const all = [...FOODS, ...Object.values(S.customFoods || {})];
  if (!q && ui.foodCat === 'My meals') {
    const ms = S.savedMeals || [];
    return ms.length ? ms.map((m) => { const t = itemTotals(m.items, mealLookup); return `<button class="lib-row" data-act="meal-use" data-id="${m.id}"><span><b>★ ${esc(m.name)}</b><small>${m.items.length} foods · ${r0(t.k)} kcal · ${r0(t.p)} g P</small></span></button>`; }).join('')
      : '<p class="muted small pad">No saved meals yet. Log a meal, then tap ★ Save meal to reuse it with one tap.</p>';
  }
  let list;
  if (q) {
    const rs = (S.recipes || []).filter((r) => r.name.toLowerCase().includes(q));
    list = all.filter((f) => (f.name + ' ' + f.cat).toLowerCase().includes(q));
    const rh = rs.map((r) => `<button class="lib-row" data-act="rec-pick" data-id="${r.id}"><span><b>🍽 ${esc(r.name)}</b><small>recipe · 1 serving · ${r.per.k} kcal · ${r.per.p} g P</small></span></button>`).join('');
    if (rh) return rh + list.map((f) => `<button class="lib-row" data-act="food-pick" data-id="${f.id}"><span><b>${esc(f.name)}</b><small>${esc(f.portion)} · ${f.k} kcal · ${f.p} g P</small></span></button>`).join('');
  }
  else if (ui.foodCat === 'Recent') { list = recentFoods(); if (!list.length) list = FOODS.filter((f) => ['injera', 'egg', 'chicken-breast', 'rice', 'potato', 'shiro', 'tibs', 'cheddar', 'ayib', 'misir'].includes(f.id)); }
  else if (ui.foodCat === 'Recipes') {
    const rs = S.recipes || [];
    return rs.length ? rs.map((r) => `<button class="lib-row" data-act="rec-pick" data-id="${r.id}"><span><b>${esc(r.name)}</b><small>1 serving · ${r.per.k} kcal · ${r.per.p} g P</small></span></button>`).join('') : '<p class="muted small pad">No recipes yet — add them in Food → Recipes.</p>';
  }
  else if (ui.foodCat === 'My foods') list = Object.values(S.customFoods || {});
  else list = all.filter((f) => f.cat === ui.foodCat);
  if (!list.length) return '<p class="muted small pad">Nothing here yet. Use “Create a food” for anything missing.</p>';
  return list.map((f) => `<button class="lib-row" data-act="food-pick" data-id="${f.id}"><span><b>${esc(f.name)}</b><small>${esc(f.portion)} · ${f.k} kcal · ${f.p} g P</small></span></button>`).join('');
}

function qtySheet({ food, q = 1, title, onSave, onDelete }) {
  ui.q = q;
  ui.qFood = food;
  ui.qSave = onSave;
  ui.qDel = onDelete;
  openSheet(`<h2>${esc(food.name)}</h2>
    <p class="muted">1 portion = ${esc(food.portion)}${food.hint ? ` · ${esc(food.hint)}` : ''}</p>
    <div class="stepper"><button class="btn" data-act="q-step" data-d="-0.5" aria-label="Less">−</button><b id="q-val">${qtyTxt(q)}</b><button class="btn" data-act="q-step" data-d="0.5" aria-label="More">+</button></div>
    <div class="row-wrap center-row">${[0.5, 1, 1.5, 2, 3].map((v) => `<button class="chip" data-act="q-set" data-v="${v}">${qtyTxt(v)}</button>`).join('')}</div>
    <div class="stats" id="q-tot">${qtyStats()}</div>
    <button class="btn primary big" data-act="q-save">${title || 'Add'}</button>
    ${onDelete ? '<button class="btn ghost danger" data-act="q-del">Remove</button>' : ''}`);
}
function qtyStats() {
  const f = ui.qFood, q = ui.q;
  return `<div><b>${r0(f.k * q)}</b><small>kcal</small></div><div><b>${r0(f.p * q)} g</b><small>protein</small></div><div><b>${r0(f.c * q)}/${r0(f.f * q)}</b><small>carbs/fat g</small></div>`;
}

function quickAddSheet() {
  openSheet(`<h2>Quick add</h2><p class="muted">For restaurant meals or when you already know the numbers.</p>
    <form id="qa" class="form"><label class="field">What was it?<input name="name" placeholder="e.g. Dinner at a friend's" required></label>
    <div class="grid2"><label class="field">Calories<input name="k" type="number" inputmode="numeric" required></label><label class="field">Protein g (optional)<input name="p" type="number" inputmode="numeric"></label></div>
    <button class="btn primary big">Add</button></form>`, (sh) => {
    $('#qa', sh).addEventListener('submit', (ev) => {
      ev.preventDefault();
      const f = ev.target;
      foodDay()[ui.addSlot].push({ id: uid(), q: 1, x: { name: f.name.value.trim(), portion: 'quick add', k: +f.k.value || 0, p: +f.p.value || 0, c: 0, f: 0 } });
      commit(); closeSheet(); render(); toast('Added');
    });
  });
}

function newFoodSheet() {
  openSheet(`<h2>Create a food</h2><p class="muted">Check the label, or give your best guess. It's saved for next time.</p>
    <form id="nf" class="form"><label class="field">Name<input name="name" required placeholder="e.g. Mom's shiro"></label>
    <label class="field">1 portion is…<input name="portion" required placeholder="e.g. 1 cup, 1 piece, 100 g"></label>
    <div class="grid2"><label class="field">Calories<input name="k" type="number" inputmode="decimal" required></label><label class="field">Protein g<input name="p" type="number" inputmode="decimal" value="0"></label>
    <label class="field">Carbs g<input name="c" type="number" inputmode="decimal" value="0"></label><label class="field">Fat g<input name="f" type="number" inputmode="decimal" value="0"></label></div>
    <button class="btn primary big">Save & add</button></form>`, (sh) => {
    $('#nf', sh).addEventListener('submit', (ev) => {
      ev.preventDefault();
      const f = ev.target;
      const id = 'cf-' + uid();
      S.customFoods = S.customFoods || {};
      S.customFoods[id] = { id, name: f.name.value.trim(), cat: 'My foods', portion: f.portion.value.trim(), k: +f.k.value || 0, p: +f.p.value || 0, c: +f.c.value || 0, f: +f.f.value || 0, g: 0 };
      foodDay()[ui.addSlot].push({ id: uid(), fid: id, q: 1 });
      commit(); closeSheet(); render(); toast('Saved & added');
    });
  });
}

async function loadMealPhotos() {
  const imgs = document.querySelectorAll('img[data-photo-id]');
  if (!imgs.length) return;
  for (const img of imgs) {
    try { const p = await getPhoto(img.dataset.photoId); if (p) img.src = photoUrl(p); } catch {}
  }
}

async function aiEstimate(slot) {
  const pid = foodDay().photos?.[slot];
  if (!pid) return;
  if (!getKey()) {
    openSheet(`<h2>✨ Photo calorie estimates</h2>
      <p>This uses Claude (AI) to look at your plate photo and estimate each food. It needs your own Anthropic API key — a one-time setup. Each photo costs about 1–2 US cents.</p>
      <ol class="cues"><li>On a computer or phone, go to <b>console.anthropic.com</b> and sign up.</li><li>Add a little credit under <b>Billing</b> (e.g. $5 lasts for hundreds of photos).</li><li>Go to <b>API Keys → Create key</b> and copy it.</li><li>Paste it in <b>Settings → Photo calorie estimates</b> in this app.</li></ol>
      <p class="muted small">The key is stored only on this phone. Until then, add the foods by hand — the photo stays as a reminder.</p>
      <button class="btn primary big" data-act="go-settings">Open Settings</button>`);
    return;
  }
  const p = await getPhoto(pid);
  openSheet(`<div class="done-sheet"><div class="big-emoji spin">✨</div><h2>Looking at your plate…</h2><p class="muted">This takes about 10–20 seconds.</p></div>`);
  try {
    const out = await estimatePlate(p.blob);
    ui.aiItems = out.items.map((it) => ({ ...it, on: true }));
    ui.aiNote = out.note;
    ui.aiSlot = slot;
    aiResultSheet();
  } catch (e) {
    openSheet(`<div class="done-sheet"><div class="big-emoji">😕</div><h2>Couldn't estimate</h2><p>${esc(e.message)}</p><button class="btn big" data-act="sheet-close">OK</button></div>`);
  }
}
function aiResultSheet() {
  const on = ui.aiItems.filter((x) => x.on);
  const tk = on.reduce((a, x) => a + x.kcal, 0), tp = on.reduce((a, x) => a + x.protein_g, 0);
  openSheet(`<h2>✨ What I see</h2><p class="muted small">${esc(ui.aiNote || '')}</p>
    <ul class="food-list">${ui.aiItems.map((it, i) => `<li><label class="chk"><input type="checkbox" data-in="ai-on" data-i="${i}" ${it.on ? 'checked' : ''}><span><b>${esc(it.name)}</b><small>${esc(it.portion)}</small></span><span class="kc">${r0(it.kcal)}<small>${r0(it.protein_g)} g P</small></span></label></li>`).join('')}</ul>
    <div class="stats"><div><b>${r0(tk)}</b><small>kcal</small></div><div><b>${r0(tp)} g</b><small>protein</small></div><div><b>${on.length}</b><small>foods</small></div></div>
    <p class="muted small">AI estimates can be off by 20–30%, mostly from hidden oil. Untick anything wrong, then fix portions later by tapping the food.</p>
    <button class="btn primary big" data-act="ai-add">Add ${on.length} to meal</button>`);
}

// ───────────────────────── RECIPES ─────────────────────────
const recipeFood = (r) => ({ id: r.id, name: r.name, portion: '1 serving', k: r.per.k, p: r.per.p, c: r.per.c, f: r.per.f });

// Best-effort reader for text shared from Osta / websites (no AI needed).
function parseRecipeText(txt) {
  const lines = txt.split(/\r?\n/).map((l) => l.trim());
  const num = (re) => { const m = txt.match(re); return m ? parseFloat(m[1]) : 0; };
  const link = (txt.match(/https?:\/\/\S+/) || [''])[0].replace(/[)\].,]+$/, '');
  const name = lines.find((l) => l && !/^https?:/i.test(l) && !/^(ingredients|instructions|directions|steps|method|nutrition)/i.test(l)) || '';
  const section = (start, stop) => {
    const i = lines.findIndex((l) => start.test(l));
    if (i < 0) return [];
    const out = [];
    for (const l of lines.slice(i + 1)) { if (stop.test(l)) break; if (l) out.push(l.replace(/^(?:[-•*▢☐◦]\s*|\d+[.)]\s+)/, '').trim()); }
    return out.filter(Boolean);
  };
  return {
    name, link,
    servings: num(/(?:serves|servings?|portions?)\s*[:\-]?\s*(\d+)/i) || 1,
    ingredients: section(/^ingredients/i, /^(instructions|directions|steps|method|preparation|nutrition|macros)/i),
    steps: section(/^(instructions|directions|steps|method|preparation)/i, /^(nutrition|macros|notes)/i),
    per: {
      k: num(/(\d+(?:\.\d+)?)\s*(?:k?cal|calories)/i) || num(/calories\s*[:\-]?\s*(\d+(?:\.\d+)?)/i),
      p: num(/protein\s*[:\-]?\s*(\d+(?:\.\d+)?)/i) || num(/(\d+(?:\.\d+)?)\s*g\s*protein/i),
      c: num(/carb(?:ohydrate)?s?\s*[:\-]?\s*(\d+(?:\.\d+)?)/i) || num(/(\d+(?:\.\d+)?)\s*g\s*carbs?/i),
      f: num(/fats?\s*[:\-]?\s*(\d+(?:\.\d+)?)/i) || num(/(\d+(?:\.\d+)?)\s*g\s*fats?/i),
    },
  };
}

function vRecipes() {
  const q = (ui.recQ || '').toLowerCase();
  const list = (S.recipes || []).filter((r) => !q || (r.name + ' ' + r.ingredients.join(' ')).toLowerCase().includes(q));
  return `
  <div class="split pad"><p class="muted small">${(S.recipes || []).length} recipes</p><button class="btn sm primary" data-act="rec-new">${icon('plus')} Add recipe</button></div>
  ${(S.recipes || []).length ? `<input class="search" type="search" placeholder="Search recipes or ingredients" data-in="rec-q" value="${esc(ui.recQ || '')}">` : ''}
  <div id="rec-list">${recList(list)}</div>`;
}
function recList(list) {
  if (!(S.recipes || []).length) return `<section class="card"><h3>Bring your Osta recipes here</h3>
    <ol class="cues"><li>In Osta, open a recipe and tap <b>Share → Copy</b> (or take <b>screenshots</b> of the recipe page).</li><li>Here, tap <b>Add recipe</b> and paste the text or pick the screenshots.</li><li>Check the numbers and save. Then log a serving into any meal with one tap.</li></ol></section>`;
  if (!list.length) return '<p class="muted pad">No recipes match.</p>';
  return `<div class="card list">${list.map((r) => `<button class="lib-row" data-act="rec-view" data-id="${r.id}"><span class="rec-ic">${r.link ? '▶' : '🍽'}</span><span><b>${esc(r.name)}</b><small>${r.per.k} kcal · ${r.per.p} g protein per serving${r.est ? ' · estimated' : ''}</small></span></button>`).join('')}</div>`;
}

function recipeAddSheet() {
  const ai = !!getKey();
  ui.pendingShots = [];
  openSheet(`<h2>Add a recipe</h2>
    <h4>📸 From Instagram / TikTok</h4>
    <ol class="cues small-cues">
      <li><b>In Instagram:</b> tap <b>…more</b> under the post to open the full caption, then <b>take a screenshot</b> (press side button + volume up). Take 2–3 if it's long.</li>
      <li>Still there: tap <b>Share (✈︎) → Copy link</b>.</li>
      <li><b>Here:</b> tap <b>Paste link</b>, then <b>Add screenshots</b>.</li>
    </ol>
    <div class="link-row"><input id="rec-link" class="paste" type="url" inputmode="url" placeholder="Video link" value="${esc(ui.recLink || '')}"><button class="btn sm" data-act="rec-paste-link">📋 Paste link</button></div>
    <label class="btn primary big">${icon('cam')} Add screenshots<input type="file" accept="image/*" multiple hidden data-in="rec-shots"></label>
    <p class="muted small">${ai ? '✨ The AI will read the screenshots and fill in everything.' : 'The screenshots are saved inside the recipe so you can always read the ingredients. You just type the name, calories and protein.'}</p>
    <h4>📋 Or paste the recipe text</h4>
    <details class="tip"><summary>Instagram won't let you copy the caption? Use this iPhone trick</summary>
      <ol class="cues small-cues"><li>Open your caption screenshot in the <b>Photos</b> app.</li><li><b>Press and hold</b> on the words until they highlight (Live Text).</li><li>Tap <b>Select All → Copy</b>.</li><li>Come back here and paste in the box below.</li></ol></details>
    <textarea id="rec-paste" class="paste" rows="5" placeholder="Paste recipe text (from Osta, Photos Live Text, or a website)"></textarea>
    <div class="btn-row"><button class="btn sm primary" data-act="rec-parse">Read it</button>${ai ? '<button class="btn sm" data-act="rec-parse-ai">✨ Read it with AI</button>' : ''}</div>
    <button class="btn ghost" data-act="rec-link-manual">Type everything in myself</button>`);
}
const curLink = () => ($('#rec-link')?.value || ui.recLink || '').trim();

function shotsHtml(ids = []) {
  if (!ids?.length) return '';
  return `<div class="shots">${ids.map((id) => `<img data-photo-id="${id}" alt="Recipe screenshot" data-act="shot-view">`).join('')}</div>`;
}

function recipeForm(r = {}, editId = null) {
  const per = r.per || { k: '', p: '', c: '', f: '' };
  openSheet(`<h2>${editId ? 'Edit recipe' : 'Check & save'}</h2>
    ${r.warning ? `<p class="avoid">⚠️ ${esc(r.warning)}</p>` : ''}
    ${r.est ? '<p class="muted small">Calories were not in the recipe, so they were estimated from the ingredients.</p>' : ''}
    ${shotsHtml(r.shots || ui.pendingShots)}
    ${(r.shots || ui.pendingShots || []).length && !r.name ? '<p class="muted small">👆 Swipe through your screenshots and copy the numbers into the boxes below. Ingredients are optional — the screenshots stay saved in the recipe.</p>' : ''}
    <form id="rf" class="form">
      <label class="field">Name<input name="name" required value="${esc(r.name || '')}"></label>
      <label class="field">Video / website link<input name="link" type="url" inputmode="url" placeholder="https://www.tiktok.com/…" value="${esc(r.link || '')}"></label>
      <label class="field">Servings the recipe makes<input name="servings" type="number" inputmode="decimal" step="any" value="${r.servings || 1}"></label>
      <p class="eyebrow">Per serving</p>
      <div class="grid2"><label class="field">Calories<input name="k" type="number" inputmode="decimal" step="any" required value="${per.k}"></label><label class="field">Protein g<input name="p" type="number" inputmode="decimal" step="any" value="${per.p}"></label>
      <label class="field">Carbs g<input name="c" type="number" inputmode="decimal" step="any" value="${per.c}"></label><label class="field">Fat g<input name="f" type="number" inputmode="decimal" step="any" value="${per.f}"></label></div>
      <label class="toggle"><span>These numbers are for the WHOLE recipe</span><input type="checkbox" name="whole"></label>
      <label class="field">Ingredients (one per line)<textarea name="ing" rows="6">${esc((r.ingredients || []).join('\n'))}</textarea></label>
      <label class="field">Steps (one per line)<textarea name="steps" rows="5">${esc((r.steps || []).join('\n'))}</textarea></label>
      <button class="btn primary big">Save recipe</button>
    </form>`, (sh) => {
    loadMealPhotos();
    $('#rf', sh).addEventListener('submit', (ev) => {
      ev.preventDefault();
      const f = ev.target;
      const sv = +f.servings.value || 1;
      const div = f.whole.checked ? sv : 1;
      const rr = (v) => Math.round(((+v || 0) / div) * 10) / 10;
      const rec = {
        id: editId || 'r-' + uid(), name: f.name.value.trim(), link: f.link.value.trim(), servings: sv,
        per: { k: Math.round((+f.k.value || 0) / div), p: rr(f.p.value), c: rr(f.c.value), f: rr(f.f.value) },
        ingredients: f.ing.value.split('\n').map((x) => x.trim()).filter(Boolean),
        steps: f.steps.value.split('\n').map((x) => x.trim()).filter(Boolean),
        est: !!r.est, created: r.created || Date.now(),
        shots: r.shots || ui.pendingShots || [],
      };
      ui.pendingShots = [];
      S.recipes = S.recipes || [];
      const i = S.recipes.findIndex((x) => x.id === rec.id);
      if (i >= 0) S.recipes[i] = rec; else S.recipes.unshift(rec);
      commit(true); closeSheet(); ui.foodTab = 'recipes'; render(); toast('Recipe saved');
    });
  });
}

function recipeView(id) {
  const r = (S.recipes || []).find((x) => x.id === id);
  if (!r) return;
  const safeLink = /^https?:\/\//i.test(r.link || '') ? r.link : '';
  openSheet(`<h2>${esc(r.name)}</h2>
    ${safeLink ? `<a class="btn primary big" href="${esc(safeLink)}" target="_blank" rel="noopener">▶ Watch the video</a>` : ''}
    <div class="stats"><div><b>${r.per.k}</b><small>kcal / serving</small></div><div><b>${r.per.p} g</b><small>protein</small></div><div><b>${r.per.c}/${r.per.f}</b><small>carbs/fat g</small></div></div>
    <p class="muted small">Makes ${r.servings} serving${r.servings === 1 ? '' : 's'}${r.est ? ' · calories estimated' : ''}</p>
    ${shotsHtml(r.shots)}
    <h4>Log a serving to</h4>
    <div class="row-wrap">${MEAL_SLOTS.map(([slot, title, emo]) => `<button class="chip" data-act="rec-log" data-id="${r.id}" data-slot="${slot}">${emo} ${esc(title.split('·')[1]?.trim() || title)}</button>`).join('')}</div>
    ${r.ingredients.length ? `<h4>Ingredients</h4><ul class="groc">${r.ingredients.map((x) => `<li><label class="chk"><input type="checkbox"><span>${esc(x)}</span></label></li>`).join('')}</ul>` : ''}
    ${r.steps.length ? `<h4>Steps</h4><ol class="cues">${r.steps.map((x) => `<li>${esc(x)}</li>`).join('')}</ol>` : ''}
    <div class="btn-row"><button class="btn sm" data-act="rec-edit" data-id="${r.id}">Edit</button><button class="btn sm danger" data-act="rec-del" data-id="${r.id}">Delete</button></div>`, () => loadMealPhotos());
}

async function recipeAI(blobs, text) {
  openSheet(`<div class="done-sheet"><div class="big-emoji spin">✨</div><h2>Reading the recipe…</h2><p class="muted">About 10–30 seconds.</p></div>`);
  try {
    const o = await extractRecipe(blobs, text);
    recipeForm({ name: o.name, link: o.link || (text.match(/https?:\/\/\S+/) || [''])[0], servings: o.servings, ingredients: o.ingredients, steps: o.steps, warning: o.warning, est: o.macros_source === 'estimated',
      per: { k: Math.round(o.per_serving.kcal), p: Math.round(o.per_serving.protein_g), c: Math.round(o.per_serving.carbs_g), f: Math.round(o.per_serving.fat_g) } });
  } catch (e) {
    openSheet(`<div class="done-sheet"><div class="big-emoji">😕</div><h2>Couldn't read it</h2><p>${esc(e.message)}</p><button class="btn big" data-act="rec-new">Try another way</button></div>`);
  }
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
    <p class="muted small">Used for your calorie & protein targets.</p>
  </section>
  <section class="card form">
    <h3>Workout</h3>
    <label class="toggle"><span>Beep when rest is over</span><input type="checkbox" data-in="setting" data-f="sound" ${S.settings.sound ? 'checked' : ''}></label>
    <p class="muted small">Each exercise remembers its own unit (kg or lb) and weight jump — change them on the exercise's page or by tapping the KG/LB header during a workout.</p>
  </section>
  <section class="card form">
    <h3>Photo calorie estimates (optional)</h3>
    <p class="muted small">Snap your plate and Claude estimates each food. Needs your own Anthropic API key from console.anthropic.com (about 1–2 cents per photo). The key stays on this phone only — it's not in backups or on GitHub.</p>
    <label class="field">API key<input type="password" autocomplete="off" data-in="ai-key" placeholder="sk-ant-…" value="${getKey() ? '••••••••••••' : ''}"></label>
    ${getKey() ? '<button class="btn sm danger" data-act="ai-key-del">Remove key</button>' : ''}
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
  // keep a full copy so a mistaken "Finish" can be undone (only the latest workout keeps one)
  for (const o of S.workouts) delete o.snap;
  w.snap = JSON.parse(JSON.stringify({ ...A, prevNext: S.nextDay }));
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
    <button class="btn primary big" data-act="sheet-close">Nice</button>
    <button class="btn ghost" data-act="wo-resume" data-id="${w.id}">↩︎ Oops, I wasn't done — resume workout</button></div>`);
}

function resumeWorkout(id) {
  if (S.active) return toast('Finish or discard your current workout first');
  const w = S.workouts.find((x) => x.id === id);
  if (!w?.snap) return toast('This workout can\'t be resumed');
  const A = w.snap;
  A.start += Date.now() - w.end; // don't count the time it was closed
  if (A.prevNext != null) S.nextDay = A.prevNext;
  delete A.prevNext;
  S.workouts = S.workouts.filter((x) => x.id !== id);
  S.active = A;
  commit(true);
  closeSheet();
  wake(true);
  go('workout');
  toast('Workout resumed 💪');
}
const resumable = () => {
  const w = S.workouts[S.workouts.length - 1];
  return !S.active && w?.snap && Date.now() - w.end < 12 * 3600e3 ? w : null;
};

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

const dgState = { paused: false, speed: 1 };
const howOf = (ex) => HOWTO[ex.id] || HOWTO[ex.like] || {};

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
  const H = howOf(ex);
  const d = diagramOf(ex);
  const cues = ex.cues?.length ? ex.cues : LIB[ex.like]?.cues || [];
  const setup = H.setup || [];
  const prim = H.p || [], sec = H.s || [];
  const avoid = ex.avoid || LIB[ex.like]?.avoid;
  const tp = tempo(ex);
  dgState.paused = false; dgState.speed = 1;
  openSheet(`
    <div class="dg-big"><svg viewBox="0 0 200 160" class="dg" id="dg-anim"></svg></div>
    <div class="dg-ctrl"><button class="chip" data-act="dg-pause">❚❚ Pause</button><button class="chip" data-act="dg-slow">🐢 Slow motion</button></div>
    <div class="dg-steps"><figure>${svg(d, 0)}<figcaption>1 · Start position</figcaption></figure><figure>${svg(d, 1)}<figcaption>2 · End position</figcaption></figure></div>
    <h2>${esc(ex.name)}</h2>
    <div class="row-wrap"><span class="chip on">${esc(ex.muscle)}</span><span class="chip">${esc(ex.equip)}</span>${ex.perSide ? '<span class="chip">each side</span>' : ''}</div>
    ${ex.gym ? `<div class="gym-box">📍 <div><b>At your gym:</b> ${esc(ex.gym.where)}${ex.gym.tip ? `<small>${esc(ex.gym.tip)}</small>` : ''}</div></div>`
      : ex.custom ? '' : `<div class="gym-box warnbox">❓ <div><b>Not seen at ${GYM_NAME} yet.</b><small>Send a photo if you find it — or tap ⇄ in your plan to swap it.</small></div></div>`}
    ${prim.length ? `<h4>Muscles worked</h4><div class="bm-wrap">${bodyMap(prim, sec)}
      <div class="bm-legend"><p><span class="lg p"></span><b>Main:</b> ${prim.map((k) => MUSCLE_NAMES[k]).join(', ')}</p>${sec.length ? `<p><span class="lg s"></span><b>Helping:</b> ${sec.map((k) => MUSCLE_NAMES[k]).join(', ')}</p>` : ''}</div></div>`
      : ex.target ? `<p class="muted">Works: ${esc(ex.target)}</p>` : ''}
    ${setup.length ? `<h4>Step 1 · Setup & stance</h4><ol class="cues">${setup.map((c) => `<li>${esc(c)}</li>`).join('')}</ol>` : ''}
    ${cues.length ? `<h4>Step 2 · The movement</h4><ol class="cues">${cues.map((c) => `<li>${esc(c)}</li>`).join('')}</ol>` : ''}
    <div class="tips"><p>🫁 <span>${breathing(ex)}</span></p>${tp ? `<p>⏱ <span>${tp}</span></p>` : ''}</div>
    ${avoid ? `<p class="avoid">⚠️ Avoid: ${esc(avoid)}</p>` : ''}
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
  `, (sh) => { stopAnim = animate($('#dg-anim', sh), d, { speed: () => dgState.speed, paused: () => dgState.paused }); });
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
    ${w.snap && !S.active ? `<button class="btn ghost" data-act="wo-resume" data-id="${w.id}">↩︎ Resume this workout</button>` : ''}
    <button class="btn ghost danger" data-act="wo-del" data-id="${w.id}">Delete this workout</button>`);
}

// ───────────────────────── actions ─────────────────────────
const A = {
  'rec-new': recipeAddSheet,
  'rec-blank': () => recipeForm({}),
  'shot-view': (el) => el.classList.toggle('zoom'),
  'rec-paste-link': async () => {
    try {
      const t = (await navigator.clipboard.readText()) || '';
      const m = t.match(/https?:\/\/\S+/);
      if (!m) return toast('No link copied — tap Share → Copy link on the post first');
      ui.recLink = m[0];
      $('#rec-link').value = m[0];
      toast(/instagram|tiktok|youtu/i.test(m[0]) ? 'Link pasted ✓' : 'Link pasted');
    } catch {
      $('#rec-link')?.focus();
      toast('Tap the box, then long-press → Paste');
    }
  },
  'rec-link-manual': () => { const link = curLink(); ui.recLink = ''; recipeForm({ link }); },
  'rec-parse': () => {
    const t = $('#rec-paste')?.value || '';
    if (!t.trim()) return toast('Paste the recipe first');
    const r = parseRecipeText(t);
    if (!r.per.k && getKey()) { recipeAI([], t); return; }
    recipeForm(r);
  },
  'rec-parse-ai': () => { const t = $('#rec-paste')?.value || ''; if (!t.trim()) return toast('Paste the recipe first'); recipeAI([], t); },
  'rec-view': (el) => recipeView(el.dataset.id),
  'rec-edit': (el) => { const r = S.recipes.find((x) => x.id === el.dataset.id); recipeForm(r, r.id); },
  'rec-del': (el) => { if (!confirm('Delete this recipe? Meals you already logged stay.')) return; for (const id of S.recipes.find((x) => x.id === el.dataset.id)?.shots || []) delPhoto(id).catch(() => {}); S.recipes = S.recipes.filter((x) => x.id !== el.dataset.id); commit(true); closeSheet(); render(); },
  'rec-log': (el) => {
    const r = S.recipes.find((x) => x.id === el.dataset.id), slot = el.dataset.slot;
    ui.foodDay = ui.foodDay || dayKey(Date.now());
    qtySheet({ food: recipeFood(r), q: 1, title: 'Add to meal', onSave: (q) => { foodDay()[slot].push({ id: uid(), q, x: { ...recipeFood(r), name: r.name }, rid: r.id }); toast('Logged'); } });
  },
  'rec-pick': (el) => {
    const r = S.recipes.find((x) => x.id === el.dataset.id), slot = ui.addSlot;
    qtySheet({ food: recipeFood(r), q: 1, title: 'Add', onSave: (q) => { foodDay()[slot].push({ id: uid(), q, x: { ...recipeFood(r), name: r.name }, rid: r.id }); toast(`Added ${r.name}`); } });
  },
  'food-tab': (el) => { ui.foodTab = el.dataset.t; render(true); },
  'food-day': (el) => { ui.foodDay = shiftDay(ui.foodDay, +el.dataset.n); render(); },
  'food-add': (el) => addFoodSheet(el.dataset.slot),
  'food-cat': (el) => { ui.foodCat = el.dataset.c; ui.foodQ = ''; const s = $('.sheet .search'); if (s) s.value = ''; document.querySelectorAll('.sheet .chips .chip').forEach((c) => c.classList.toggle('on', c.dataset.c === ui.foodCat)); $('#food-results').innerHTML = foodResults(); },
  'food-pick': (el) => {
    const f = foodOf(el.dataset.id), slot = ui.addSlot;
    qtySheet({ food: f, q: 1, title: 'Add', onSave: (q) => { foodDay()[slot].push({ id: uid(), fid: f.id, q }); toast(`Added ${f.name}`); } });
  },
  'fe-edit': (el) => {
    const list = foodDay()[el.dataset.slot], i = +el.dataset.i, e = list[i];
    qtySheet({ food: entryFood(e), q: e.q, title: 'Save', onSave: (q) => { e.q = q; }, onDelete: () => list.splice(i, 1) });
  },
  'q-step': (el) => { ui.q = Math.max(0.25, Math.round((ui.q + +el.dataset.d) * 4) / 4); $('#q-val').textContent = qtyTxt(ui.q); $('#q-tot').innerHTML = qtyStats(); },
  'q-set': (el) => { ui.q = +el.dataset.v; $('#q-val').textContent = qtyTxt(ui.q); $('#q-tot').innerHTML = qtyStats(); },
  'q-save': () => { ui.qSave?.(ui.q); commit(); closeSheet(); render(); },
  'q-del': () => { ui.qDel?.(); commit(); closeSheet(); render(); },
  'quick-add': quickAddSheet,
  'food-new': newFoodSheet,
  'food-copy': (el) => {
    const slot = el.dataset.slot, y = peekDay(shiftDay(ui.foodDay, -1));
    foodDay()[slot] = (y?.[slot] || []).map((e) => ({ ...e, id: uid() }));
    commit(); render(); toast('Copied from yesterday');
  },
  'log-plan': (el) => {
    const slot = el.dataset.slot, m = MEALS[slot].find((x) => x.id === el.dataset.m);
    foodDay()[slot].push(...m.items.map(([fid, q]) => ({ id: uid(), fid, q })));
    commit(); render(); toast(`Logged ${m.name}`);
  },
  'plan-log-day': (el) => {
    const day = weekPlan().days[+el.dataset.d];
    ui.foodDay = dayKey(Date.now());
    const fd = foodDay();
    for (const [slot] of MEAL_SLOTS) if (!fd[slot].length) fd[slot].push(...MEALS[slot][day[slot]].items.map(([fid, q]) => ({ id: uid(), fid, q })));
    ui.foodTab = 'log'; commit(); render(true); toast('Today\'s plan logged — adjust anything you changed');
  },
  'plan-swap': (el) => { const d = weekPlan().days[+el.dataset.d], s = el.dataset.slot; d[s] = (d[s] + 1) % MEALS[s].length; commit(); render(); },
  grocery: grocerySheet,
  'meal-save': (el) => {
    const slot = el.dataset.slot, list = foodDay()[slot];
    const name = prompt('Name this meal (e.g. "My usual breakfast")');
    if (!name) return;
    S.savedMeals = S.savedMeals || [];
    const items = list.filter((e) => e.fid).map((e) => [e.fid, e.q]);
    if (!items.length) return toast('Only foods from the list can be saved');
    S.savedMeals.unshift({ id: uid(), name: name.trim(), items });
    commit(); toast('Meal saved ★');
  },
  'meal-use': (el) => {
    const m = (S.savedMeals || []).find((x) => x.id === el.dataset.id);
    if (!m) return;
    foodDay()[ui.addSlot].push(...m.items.map(([fid, q]) => ({ id: uid(), fid, q })));
    commit(); closeSheet(); render(); toast(`Added ${m.name}`);
  },
  'meal-photo-del': async (el) => {
    const d = foodDay(), pid = d.photos?.[el.dataset.slot];
    if (pid) { try { await delPhoto(pid); } catch {} delete d.photos[el.dataset.slot]; }
    commit(); render();
  },
  'ai-est': (el) => aiEstimate(el.dataset.slot),
  'ai-add': () => {
    const list = foodDay()[ui.aiSlot];
    for (const it of ui.aiItems.filter((x) => x.on)) list.push({ id: uid(), q: 1, x: { name: it.name, portion: it.portion + ' (AI estimate)', k: r0(it.kcal), p: r0(it.protein_g), c: r0(it.carbs_g), f: r0(it.fat_g) } });
    commit(); closeSheet(); render(); toast('Added to your meal');
  },
  'ai-key-del': () => { setKey(''); render(); toast('Key removed'); },
  'go-settings': () => { closeSheet(); go('settings'); },
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
    const done = S.active.entries.reduce((a, e) => a + e.sets.filter((s) => s.done).length, 0);
    openSheet(`<div class="done-sheet"><div class="big-emoji">🏁</div><h2>Finish workout?</h2>
      <p class="muted">${done} set${done === 1 ? '' : 's'} done${open ? ` · <b class="warn">${open} not ticked</b> (they won't be saved)` : ''}</p>
      <button class="btn big" data-act="sheet-close">Keep training</button>
      <button class="btn primary big" data-act="finish-yes">Yes, finish & save</button>
      <p class="muted small">Pressed by mistake later? You can still resume it from the Today screen.</p></div>`);
  },
  'finish-yes': () => { closeSheet(); finishWorkout(); },
  'wo-resume': (el) => resumeWorkout(el.dataset.id),
  'dg-pause': (el) => { dgState.paused = !dgState.paused; el.textContent = dgState.paused ? '▶ Play' : '❚❚ Pause'; },
  'dg-slow': (el) => { dgState.speed = dgState.speed === 1 ? 0.4 : 1; el.textContent = dgState.speed === 1 ? '🐢 Slow motion' : '⚡ Normal speed'; el.classList.toggle('on', dgState.speed !== 1); },
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
  'rec-q': (el) => { ui.recQ = el.value; const q = el.value.toLowerCase(); $('#rec-list').innerHTML = recList((S.recipes || []).filter((r) => (r.name + ' ' + r.ingredients.join(' ')).toLowerCase().includes(q))); },
  'rec-shots': async (el) => {
    const files = [...(el.files || [])].slice(0, 6);
    if (!files.length) return;
    const link = curLink();
    ui.recLink = '';
    toast('Saving screenshots…');
    const blobs = [];
    ui.pendingShots = [];
    for (const f of files) {
      const b = await resizeImage(f, 1568);
      blobs.push(b);
      const id = uid();
      await putPhoto({ id, kind: 'recipe', date: Date.now(), blob: b });
      ui.pendingShots.push(id);
    }
    if (getKey()) recipeAI(blobs, link ? `Video link: ${link}\nRead the recipe from the caption screenshots.` : '');
    else recipeForm({ link });
  },
  'food-q': (el) => { ui.foodQ = el.value; $('#food-results').innerHTML = foodResults(); },
  'ai-on': (el) => { ui.aiItems[+el.dataset.i].on = el.checked; aiResultSheet(); },
  'ai-key': (el) => { const v = el.value.trim(); if (v && !v.startsWith('•')) { setKey(v); toast('Key saved on this phone'); render(); } },
  'meal-photo': async (el) => {
    const file = el.files?.[0];
    if (!file) return;
    try {
      const blob = await resizeImage(file, 1280);
      const id = uid();
      await putPhoto({ id, kind: 'meal', day: ui.foodDay, date: Date.now(), blob });
      const d = foodDay();
      d.photos = d.photos || {};
      if (d.photos[el.dataset.slot]) { try { await delPhoto(d.photos[el.dataset.slot]); } catch {} }
      d.photos[el.dataset.slot] = id;
      commit(true); render();
      if (getKey()) aiEstimate(el.dataset.slot); else toast('Photo saved');
    } catch (e) { alert('Could not save photo: ' + e.message); }
  },
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
  if (el.dataset.in === 'ai-key') { if (ev.type === 'change') fn(el); return; }
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
