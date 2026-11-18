// Progression engine, stats and small helpers.

export const LB = 0.45359237;
export const toKg = (w, unit) => (unit === 'lb' ? w * LB : w);
export const roundTo = (w, inc) => (inc > 0 ? Math.round(w / inc) * inc : w);
export const fmtW = (w) => (Number.isInteger(w) ? String(w) : String(Math.round(w * 100) / 100));
export const e1rm = (w, reps) => (reps > 0 ? w * (1 + Math.min(reps, 15) / 30) : 0);

export function workingSets(entry) {
  return (entry?.sets || []).filter((s) => s.done && !s.warm);
}

// history: entries for this exercise, newest first: [{date, unit, sets:[...]}]
export function suggest(ex, item, history) {
  const unit = ex.unit;
  const inc = Number(ex.inc) || 0;
  const n = item.sets;
  const last = history.find((h) => workingSets(h).length);

  if (ex.type === 'cardio') return { kind: 'new', msg: '' };

  if (!last) {
    if (ex.type === 'time')
      return { kind: 'new', secs: item.repMin, msg: `First time: hold ${item.repMin}s with perfect form. Go longer if it feels easy.` };
    if (ex.bw && !inc)
      return { kind: 'new', reps: item.repMin, msg: `First time: aim for ${item.repMin}–${item.repMax} clean reps. Note how many you get.` };
    return {
      kind: 'new', reps: item.repMax,
      msg: `First time: pick a weight you could lift about ${item.repMax + 2} times. Stop each set with 1–2 reps left.`,
    };
  }

  const sets = workingSets(last);

  if (ex.type === 'time') {
    const secs = sets.map((s) => +s.secs || 0);
    const allTop = sets.length >= n && secs.every((x) => x >= item.repMax);
    const best = Math.max(...secs);
    if (allTop) return { kind: 'up', secs: item.repMax + 10, msg: `⬆ You held ${item.repMax}s+ on every set — go for ${item.repMax + 10}s (or a harder version).` };
    return { kind: 'same', secs: Math.min(best + 5, item.repMax), msg: `Beat last time: aim for ${Math.min(best + 5, item.repMax)}s per set (last best ${best}s).` };
  }

  const lastUnit = last.unit || unit;
  const weights = sets.map((s) => +s.w || 0);
  let topW = Math.max(...weights);
  if (lastUnit !== unit) topW = roundTo(unit === 'lb' ? topW / LB : topW * LB, inc || 1);
  const top = sets.filter((s) => (+s.w || 0) === Math.max(...weights));
  const reps = top.map((s) => +s.reps || 0);
  const allTop = top.length >= n && reps.every((r) => r >= item.repMax);
  const anyLow = reps.some((r) => r < item.repMin);
  const lastStr = `last: ${fmtW(topW)}${topW ? unit : ''} × ${reps.join(', ')}`;

  // bodyweight without added load
  if (ex.bw && !topW) {
    if (allTop) return { kind: 'up', w: 0, reps: item.repMax + 2, msg: `⬆ Hit ${item.repMax} on every set — add 2 reps per set, or hold a light weight.` };
    return { kind: 'same', w: 0, reps: Math.min(Math.max(...reps) + 1, item.repMax), msg: `Add a rep on any set you can (${lastStr}).` };
  }

  // assisted machine: going UP in progress means LESS assistance
  if (ex.assisted) {
    if (allTop) {
      const w = Math.max(0, roundTo(topW - inc, inc));
      return { kind: 'up', w, reps: item.repMin, msg: `⬆ Stronger! Lower the assistance to ${fmtW(w)} ${unit} (${lastStr}).` };
    }
    return { kind: 'same', w: topW, reps: Math.min(Math.max(...reps) + 1, item.repMax), msg: `Same assistance — add a rep where you can (${lastStr}).` };
  }

  if (allTop) {
    const w = roundTo(topW + inc, inc);
    return { kind: 'up', w, reps: item.repMin, msg: `⬆ Increase to ${fmtW(w)} ${unit} — you hit ${item.repMax}+ reps on every set (${lastStr}).` };
  }

  // two sessions in a row below the range at the same weight → back off
  const prev = history.filter((h) => workingSets(h).length)[1];
  if (anyLow && prev) {
    const pw = Math.max(...workingSets(prev).map((s) => +s.w || 0));
    const prevLow = workingSets(prev).some((s) => (+s.reps || 0) < item.repMin);
    if (pw === topW && prevLow && (prev.unit || unit) === lastUnit) {
      const w = roundTo(topW * 0.9, inc || 1);
      return { kind: 'down', w, reps: item.repMin, msg: `⬇ Drop to ${fmtW(w)} ${unit} and build the reps back up with clean form.` };
    }
  }

  const target = Math.min(Math.max(...reps) + (anyLow ? 0 : 1), item.repMax);
  return { kind: 'same', w: topW, reps: Math.max(target, item.repMin), msg: `Same weight — beat last time by 1 rep on any set (${lastStr}).` };
}

export function entryStats(entry, unit) {
  const sets = workingSets(entry);
  let vol = 0, best = 0, bestW = 0;
  for (const s of sets) {
    const w = toKg(+s.w || 0, unit), r = +s.reps || 0;
    vol += w * r;
    best = Math.max(best, e1rm(w, r));
    bestW = Math.max(bestW, +s.w || 0);
  }
  return { vol, best, bestW, sets: sets.length };
}

export const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);

export function dayKey(ts) {
  const d = new Date(ts);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function startOfWeek(ts = Date.now()) {
  const d = new Date(ts);
  const day = (d.getDay() + 6) % 7; // Monday = 0
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - day);
  return d.getTime();
}

export function fmtDate(ts, opts = { weekday: 'short', day: 'numeric', month: 'short' }) {
  return new Date(ts).toLocaleDateString(undefined, opts);
}

export function fmtDur(ms) {
  const m = Math.round(ms / 60000);
  return m >= 60 ? `${Math.floor(m / 60)}h ${m % 60}m` : `${m} min`;
}

export function fmtClock(sec) {
  sec = Math.max(0, Math.round(sec));
  return `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`;
}

export const esc = (s) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
