// Stick-figure exercise diagrams.
// Each exercise defines two poses (A = start, B = end) using joint angles,
// so limbs keep their length while the figure animates between them.
// Angles are in degrees, SVG style: 0 = right, 90 = down, -90 = up.

const L = { torso: 46, neck: 7, head: 9, ua: 27, fa: 25, th: 37, sh: 37, foot: 10 };
const R = Math.PI / 180;

function add(p, a, len) {
  return [p[0] + Math.cos(a * R) * len, p[1] + Math.sin(a * R) * len];
}
const m = (a) => 180 - a; // mirror an angle left/right

function sideSkeleton(p) {
  const hip = [p.x, p.y];
  const sh = add(hip, p.t, L.torso);
  const head = add(sh, p.hd ?? p.t, L.neck + L.head);
  const el = add(sh, p.ua, L.ua * (p.uas ?? 1));
  const ha = add(el, p.fa, L.fa * (p.fas ?? 1));
  const kn = add(hip, p.th, L.th * (p.ths ?? 1));
  const an = add(kn, p.sh, L.sh * (p.shs ?? 1));
  const toe = add(an, p.ft ?? 0, L.foot);
  const j = { hip, sh, head, el, ha, kn, an, toe };
  if (p.ua2 != null) {
    j.el2 = add(sh, p.ua2, L.ua * (p.uas2 ?? 1));
    j.ha2 = add(j.el2, p.fa2 ?? p.ua2, L.fa * (p.fas2 ?? 1));
  }
  if (p.th2 != null) {
    j.kn2 = add(hip, p.th2, L.th * (p.ths2 ?? 1));
    j.an2 = add(j.kn2, p.sh2 ?? p.th2, L.sh * (p.shs2 ?? 1));
    j.toe2 = add(j.an2, p.ft2 ?? p.ft ?? 0, L.foot);
  }
  return j;
}

function frontSkeleton(p) {
  const x = p.x, y = p.y;
  const neck = [x, y - L.torso];
  const head = [x, y - L.torso - L.neck - L.head];
  const shR = [x + 15, y - L.torso + 2], shL = [x - 15, y - L.torso + 2];
  const hipR = [x + 8, y], hipL = [x - 8, y];
  const uas = p.uas ?? 1, fas = p.fas ?? 1, ths = p.ths ?? 1, shs = p.shs ?? 1;
  const elR = add(shR, p.ua, L.ua * uas), haR = add(elR, p.fa, L.fa * fas);
  const elL = add(shL, m(p.ua), L.ua * uas), haL = add(elL, m(p.fa), L.fa * fas);
  const knR = add(hipR, p.th, L.th * ths), anR = add(knR, p.sh, L.sh * shs);
  const knL = add(hipL, m(p.th), L.th * ths), anL = add(knL, m(p.sh), L.sh * shs);
  return {
    front: true, hip: [x, y], neck, head, shR, shL, hipR, hipL,
    elR, haR, elL, haL, knR, anR, knL, anL,
    toeR: [anR[0] + 6, anR[1]], toeL: [anL[0] - 6, anL[1]],
  };
}

export function skeleton(p) {
  return p.v === 'f' ? frontSkeleton(p) : sideSkeleton(p);
}

function lerpPose(a, b, t) {
  const o = {};
  for (const k of Object.keys(a)) {
    const va = a[k], vb = b[k];
    o[k] = typeof va === 'number' && typeof vb === 'number' ? va + (vb - va) * t : va;
  }
  for (const k of Object.keys(b)) if (!(k in o)) o[k] = b[k];
  return o;
}

const f = (n) => Math.round(n * 10) / 10;
const pt = (p) => `${f(p[0])},${f(p[1])}`;
const line = (pts, cls, w) =>
  `<polyline points="${pts.map(pt).join(' ')}" class="${cls}"${w ? ` stroke-width="${w}"` : ''}/>`;

function resolve(j, ref) {
  if (Array.isArray(ref)) return ref;
  if (ref.startsWith('mid:')) {
    const [, a, b] = ref.split(':');
    return [(j[a][0] + j[b][0]) / 2, (j[a][1] + j[b][1]) / 2];
  }
  return j[ref];
}

function drawProp(pr, j) {
  switch (pr.k) {
    case 'floor':
      return `<line x1="0" y1="${pr.y ?? 156}" x2="200" y2="${pr.y ?? 156}" class="dg-floor"/>`;
    case 'line':
      return line(pr.p, 'dg-prop', pr.w ?? 3);
    case 'pad':
      return line(pr.p, 'dg-pad', pr.w ?? 7);
    case 'stack': {
      const { x, y, w, h } = pr;
      let s = `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="2" class="dg-frame"/>`;
      for (let i = 1; i < 6; i++) s += `<line x1="${x + 3}" x2="${x + w - 3}" y1="${y + h - i * 5}" y2="${y + h - i * 5}" class="dg-thin"/>`;
      return s;
    }
    case 'db': {
      const p = resolve(j, pr.at);
      return `<circle cx="${f(p[0])}" cy="${f(p[1])}" r="${pr.r ?? 5.5}" class="dg-weight"/>`;
    }
    case 'plate': {
      const p = resolve(j, pr.at);
      return `<circle cx="${f(p[0])}" cy="${f(p[1])}" r="${pr.r ?? 12}" class="dg-plate"/><circle cx="${f(p[0])}" cy="${f(p[1])}" r="2" class="dg-weight"/>`;
    }
    case 'handle': {
      const p = resolve(j, pr.at);
      return `<circle cx="${f(p[0])}" cy="${f(p[1])}" r="${pr.r ?? 3.5}" class="dg-handle"/>`;
    }
    case 'wheel': {
      const p = resolve(j, pr.at);
      return `<circle cx="${f(p[0])}" cy="${f(p[1] + 2)}" r="8" class="dg-plate"/><circle cx="${f(p[0])}" cy="${f(p[1] + 2)}" r="2" class="dg-weight"/>`;
    }
    case 'roller': {
      const p = resolve(j, pr.at);
      const dx = pr.dx ?? 0, dy = pr.dy ?? 0;
      return `<circle cx="${f(p[0] + dx)}" cy="${f(p[1] + dy)}" r="${pr.r ?? 5}" class="dg-roller"/>`;
    }
    case 'cable': {
      const a = resolve(j, pr.from), b = resolve(j, pr.to);
      return `<line x1="${f(a[0])}" y1="${f(a[1])}" x2="${f(b[0])}" y2="${f(b[1])}" class="dg-cable"/><circle cx="${f(a[0])}" cy="${f(a[1])}" r="3.5" class="dg-frame"/>`;
    }
    case 'hbar': {
      const a = resolve(j, pr.a), b = resolve(j, pr.b);
      const e = pr.ext ?? 12;
      return `<line x1="${f(a[0] - e)}" y1="${f(a[1])}" x2="${f(b[0] + e)}" y2="${f(b[1])}" class="dg-bar"/>`;
    }
    case 'mid': {
      // a segment perpendicular-ish pad attached between two joints (e.g. knee pad)
      const a = resolve(j, pr.a), b = resolve(j, pr.b);
      const dy = pr.dy ?? 0;
      return `<line x1="${f(a[0] - (pr.ext ?? 4))}" y1="${f(a[1] + dy)}" x2="${f(b[0] + (pr.ext ?? 4))}" y2="${f(b[1] + dy)}" class="dg-pad" stroke-width="${pr.w ?? 6}"/>`;
    }
    case 'sled': {
      // foot plate attached to a joint, at an angle
      const p = resolve(j, pr.at);
      const a = (pr.ang ?? 0) * R, h = (pr.len ?? 28) / 2;
      const ox = (pr.off ?? 4) * Math.cos(a - Math.PI / 2), oy = (pr.off ?? 4) * Math.sin(a - Math.PI / 2);
      return `<line x1="${f(p[0] + ox - Math.cos(a) * h)}" y1="${f(p[1] + oy - Math.sin(a) * h)}" x2="${f(p[0] + ox + Math.cos(a) * h)}" y2="${f(p[1] + oy + Math.sin(a) * h)}" class="dg-pad" stroke-width="5"/>`;
    }
    case 'follow': {
      // a pad that follows a joint with a fixed offset (e.g. chest pad)
      const p = resolve(j, pr.at);
      return line(pr.p.map(([dx, dy]) => [p[0] + dx, p[1] + dy]), 'dg-pad', pr.w ?? 6);
    }
    default:
      return '';
  }
}

// ── Body renderer: shaped grey body + working muscles in red ──
const V = (a, b) => [b[0] - a[0], b[1] - a[1]];
const nrm = (v) => { const l = Math.hypot(v[0], v[1]) || 1; return [v[0] / l, v[1] / l]; };
const at = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
const poly = (pts, cls) => `<path d="M${pts.map(pt).join('L')}Z" class="${cls}"/>`;
const circ = (c, r, cls) => `<circle cx="${f(c[0])}" cy="${f(c[1])}" r="${f(r)}" class="${cls}"/>`;
function cap(a, b, w1, w2, cls, grow = 0) {
  const u = nrm(V(a, b)), n = [-u[1], u[0]];
  const h1 = w1 / 2 + grow, h2 = w2 / 2 + grow;
  return poly([[a[0] + n[0] * h1, a[1] + n[1] * h1], [b[0] + n[0] * h2, b[1] + n[1] * h2], [b[0] - n[0] * h2, b[1] - n[1] * h2], [a[0] - n[0] * h1, a[1] - n[1] * h1]], cls) + circ(a, h1, cls) + circ(b, h2, cls);
}
// strip of muscle along a segment. side: +1 front, -1 back, 0 centre. front normal given.
function strip(a, b, w1, w2, side, fn, t0, t1, cls) {
  const pA = at(a, b, t0), pB = at(a, b, t1);
  const wA = w1 + (w2 - w1) * t0, wB = w1 + (w2 - w1) * t1;
  const off = (w, k) => [fn[0] * w * k * (side || 1), fn[1] * w * k * (side || 1)];
  const [i0, o0] = side ? [0.02, 0.44] : [-0.38, 0.38];
  const P = (p, w, k) => { const o = off(w, k); return [p[0] + o[0], p[1] + o[1]]; };
  return poly([P(pA, wA, i0), P(pA, wA, o0), P(pB, wB, o0), P(pB, wB, i0)], cls);
}
const FALLBACK = { leg: ['quads'], arm: ['biceps'], torso: ['abs'], shoulder: ['sdelt'] };

function sideBody(j, M, flip) {
  const sg = flip ? -1 : 1;
  const fT = (a, b) => { const u = nrm(V(a, b)); return [-u[1] * sg, u[0] * sg]; }; // torso (hip→shoulder)
  const fL = (a, b) => { const u = nrm(V(a, b)); return [u[1] * sg, -u[0] * sg]; }; // limbs (proximal→distal)
  const W = { torso: [19, 22], ua: [9.5, 7.5], fa: [7.5, 5], th: [14, 9.5], sh: [9.5, 6.5] };
  const gl = (() => { const n = fT(j.hip, j.sh); return [j.hip[0] - n[0] * 5.5, j.hip[1] - n[1] * 5.5]; })();
  const legParts = (hip, kn, an, toe, k) => [['cap', hip, kn, ...W.th], ['cap', kn, an, ...W.sh], ['cap', an, toe, 6, 4]];
  const armParts = (sh, el, ha) => [['circ', sh, 7], ['cap', sh, el, ...W.ua], ['cap', el, ha, ...W.fa], ['circ', ha, 3.4]];
  const draw = (parts, cls, grow) => parts.map((q) => (q[0] === 'cap' ? cap(q[1], q[2], q[3], q[4], cls, grow) : circ(q[1], q[2] + grow, cls))).join('');
  const group = (parts, muscles) => draw(parts, 'b-out', 1.4) + draw(parts, 'b-skin', 0) + muscles;
  const mus = (k) => (M[0].includes(k) ? 'm1' : M[1].includes(k) ? 'm2' : null);
  const legM = (hip, kn, an) => {
    let o = '';
    const fth = fL(hip, kn), fsh = fL(kn, an);
    if (mus('quads')) o += strip(hip, kn, ...W.th, 1, fth, 0.12, 0.92, mus('quads'));
    if (mus('hipflex') && !mus('quads')) o += strip(hip, kn, ...W.th, 1, fth, 0.05, 0.35, mus('hipflex'));
    if (mus('hams')) o += strip(hip, kn, ...W.th, -1, fth, 0.15, 0.9, mus('hams'));
    if (mus('calves')) o += strip(kn, an, ...W.sh, -1, fsh, 0.1, 0.6, mus('calves'));
    return o;
  };
  const armM = (sh, el, ha) => {
    let o = '';
    const fu = fL(sh, el);
    if (mus('biceps')) o += strip(sh, el, ...W.ua, 1, fu, 0.2, 0.9, mus('biceps'));
    if (mus('triceps')) o += strip(sh, el, ...W.ua, -1, fu, 0.15, 0.9, mus('triceps'));
    if (mus('forearm')) o += strip(el, ha, ...W.fa, 0, fu, 0.1, 0.75, mus('forearm'));
    const d = mus('fdelt') || mus('sdelt') || mus('rdelt');
    if (d) o += circ(sh, 5.6, d);
    return o;
  };
  let s = '';
  if (j.kn2) s += `<g class="far">${group(legParts(j.hip, j.kn2, j.an2, j.toe2), legM(j.hip, j.kn2, j.an2))}</g>`;
  if (j.el2) s += `<g class="far">${group(armParts(j.sh, j.el2, j.ha2), armM(j.sh, j.el2, j.ha2))}</g>`;
  // torso + glutes + neck + head + near leg as one silhouette
  const head = j.head, neckEnd = at(j.sh, head, 0.55);
  const bodyParts = [['cap', j.hip, j.sh, ...W.torso], ['circ', gl, 8], ['cap', j.sh, neckEnd, 8, 7], ['circ', head, 9], ...legParts(j.hip, j.kn, j.an, j.toe)];
  let tm = '';
  const ft = fT(j.hip, j.sh);
  if (mus('chest')) tm += strip(j.hip, j.sh, ...W.torso, 1, ft, 0.6, 0.95, mus('chest'));
  if (mus('abs')) tm += strip(j.hip, j.sh, ...W.torso, 1, ft, 0.1, 0.58, mus('abs'));
  if (mus('obliques')) tm += strip(j.hip, j.sh, ...W.torso, 0, ft, 0.12, 0.5, mus('obliques'));
  if (mus('lats') || mus('midback') || mus('traps')) tm += strip(j.hip, j.sh, ...W.torso, -1, ft, 0.45, 0.95, mus('lats') || mus('midback') || mus('traps'));
  if (mus('lowback')) tm += strip(j.hip, j.sh, ...W.torso, -1, ft, 0.08, 0.45, mus('lowback'));
  if (mus('glutes')) tm += circ(gl, 6.5, mus('glutes'));
  s += group(bodyParts, tm + legM(j.hip, j.kn, j.an));
  s += group(armParts(j.sh, j.el, j.ha), armM(j.sh, j.el, j.ha));
  return s;
}

function frontBody(j, M) {
  const mus = (k) => (M[0].includes(k) ? 'm1' : M[1].includes(k) ? 'm2' : null);
  const x = j.hip[0], y = j.hip[1], sy = j.shR[1];
  const torso = [[j.shL[0] - 3, sy - 1], [j.shR[0] + 3, sy - 1], [j.hipR[0] + 4, y + 2], [j.hipL[0] - 4, y + 2]];
  const W = { ua: [9, 7], fa: [7, 5], th: [13, 9], sh: [9, 6] };
  const legParts = (hp, kn, an, toe) => [['cap', hp, kn, ...W.th], ['cap', kn, an, ...W.sh], ['cap', an, toe, 6, 4]];
  const armParts = (sh, el, ha) => [['circ', sh, 7], ['cap', sh, el, ...W.ua], ['cap', el, ha, ...W.fa], ['circ', ha, 3.4]];
  const draw = (parts, cls, grow) => parts.map((q) => (q[0] === 'cap' ? cap(q[1], q[2], q[3], q[4], cls, grow) : q[0] === 'circ' ? circ(q[1], q[2] + grow, cls) : `<path d="M${q[1].map(pt).join('L')}Z" class="${cls}" stroke-width="${6 + grow * 2}" stroke-linejoin="round"/>`)).join('');
  const group = (parts, m) => draw(parts, 'b-out', 1.4) + draw(parts, 'b-skin', 0) + m;
  const neckTop = [x, j.head[1] + 6];
  const body = [['poly', torso], ['cap', j.neck, neckTop, 8, 7], ['circ', j.head, 9], ...legParts(j.hipL, j.knL, j.anL, j.toeL), ...legParts(j.hipR, j.knR, j.anR, j.toeR)];
  let m = '';
  const c = mus('chest'); if (c) m += `<ellipse cx="${f(x - 6.5)}" cy="${f(sy + 7)}" rx="6.5" ry="5" class="${c}"/><ellipse cx="${f(x + 6.5)}" cy="${f(sy + 7)}" rx="6.5" ry="5" class="${c}"/>`;
  const a = mus('abs'); if (a) { m += `<rect x="${f(x - 5)}" y="${f(sy + 14)}" width="10" height="${f(y - sy - 16)}" rx="3" class="${a}"/>`; for (let k = 1; k < 4; k++) m += `<line x1="${f(x - 5)}" x2="${f(x + 5)}" y1="${f(sy + 14 + ((y - sy - 16) * k) / 4)}" y2="${f(sy + 14 + ((y - sy - 16) * k) / 4)}" class="b-line"/>`; m += `<line x1="${f(x)}" x2="${f(x)}" y1="${f(sy + 14)}" y2="${f(y - 2)}" class="b-line"/>`; }
  const o = mus('obliques'); if (o) m += `<rect x="${f(x - 13)}" y="${f(sy + 18)}" width="6" height="${f(y - sy - 22)}" rx="3" class="${o}"/><rect x="${f(x + 7)}" y="${f(sy + 18)}" width="6" height="${f(y - sy - 22)}" rx="3" class="${o}"/>`;
  const l = mus('lats') || mus('midback'); if (l) m += `<path d="M${f(x - 16)},${f(sy + 4)}L${f(x - 9)},${f(sy + 26)}L${f(x - 14)},${f(sy + 26)}Z" class="${l}"/><path d="M${f(x + 16)},${f(sy + 4)}L${f(x + 9)},${f(sy + 26)}L${f(x + 14)},${f(sy + 26)}Z" class="${l}"/>`;
  const tr = mus('traps'); if (tr) m += `<path d="M${f(x - 4)},${f(sy - 8)}L${f(x - 12)},${f(sy)}L${f(x + 12)},${f(sy)}L${f(x + 4)},${f(sy - 8)}Z" class="${tr}"/>`;
  const legM = (hp, kn, an) => { let r = ''; const q = mus('quads') || mus('hipflex') || mus('glutes'); if (q) r += strip(hp, kn, ...W.th, 0, [1, 0], 0.12, 0.9, q); const cv = mus('calves'); if (cv) r += strip(kn, an, ...W.sh, 0, [1, 0], 0.12, 0.6, cv); return r; };
  m += legM(j.hipL, j.knL, j.anL) + legM(j.hipR, j.knR, j.anR);
  let s = group(body, m);
  const armM = (sh, el, ha) => { let r = ''; const d = mus('sdelt') || mus('fdelt') || mus('rdelt'); if (d) r += circ(sh, 5.8, d); const b = mus('biceps') || mus('triceps'); if (b) r += strip(sh, el, ...W.ua, 0, [1, 0], 0.22, 0.9, b); const fo = mus('forearm'); if (fo) r += strip(el, ha, ...W.fa, 0, [1, 0], 0.1, 0.75, fo); return r; };
  s += group(armParts(j.shL, j.elL, j.haL), armM(j.shL, j.elL, j.haL)) + group(armParts(j.shR, j.elR, j.haR), armM(j.shR, j.elR, j.haR));
  return s;
}

function drawFigure(j, d) {
  let M = [d.mus || [], d.mus2 || []];
  if (!M[0].length) M = [(d.hl || []).flatMap((h) => FALLBACK[h] || []), []];
  return j.front ? frontBody(j, M) : sideBody(j, M, d.flip);
}

export function frame(d, t) {
  const pose = lerpPose(d.A, d.B, t);
  const j = skeleton(pose);
  const back = (d.props || []).filter((p) => !p.front);
  const front = (d.props || []).filter((p) => p.front);
  return (
    back.map((p) => drawProp(p, j)).join('') +
    drawFigure(j, d) +
    front.map((p) => drawProp(p, j)).join('')
  );
}

export function svg(d, t = 1, cls = '') {
  return `<svg viewBox="0 0 200 160" class="dg ${cls}" aria-hidden="true">${frame(d, t)}</svg>`;
}

// Animate: hold A, move to B, hold B, return. Returns a stop function.
export function animate(el, d, opts = {}) {
  if (!el || !d) return () => {};
  let raf = 0, stopped = false;
  const period = opts.period || 2800;
  let t0 = performance.now();
  const ease = (x) => 0.5 - 0.5 * Math.cos(Math.PI * x);
  let last = t0, clock = 0;
  const tick = (now) => {
    if (stopped) return;
    const dt = now - last; last = now;
    if (!opts.paused?.()) clock += dt * (opts.speed?.() || 1);
    const p = (clock % period) / period;
    let t;
    if (p < 0.12) t = 0;
    else if (p < 0.45) t = ease((p - 0.12) / 0.33);
    else if (p < 0.6) t = 1;
    else t = 1 - ease((p - 0.6) / 0.4);
    el.innerHTML = frame(d, t);
    raf = requestAnimationFrame(tick);
  };
  raf = requestAnimationFrame(tick);
  return () => { stopped = true; cancelAnimationFrame(raf); };
}
