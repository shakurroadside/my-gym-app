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

function drawFigure(j, hl) {
  const H = (k) => (hl.includes(k) ? ' dg-hl' : '');
  let s = '';
  if (j.front) {
    s += line([j.hipL, j.knL, j.anL, j.toeL], 'dg-limb' + H('leg'));
    s += line([j.hipR, j.knR, j.anR, j.toeR], 'dg-limb' + H('leg'));
    s += line([j.hipL, j.hipR], 'dg-limb' + H('torso'));
    s += line([j.hip, j.neck], 'dg-body' + H('torso'));
    s += line([j.shL, j.shR], 'dg-limb' + H('shoulder'));
    s += line([j.shL, j.elL, j.haL], 'dg-limb' + H('arm'));
    s += line([j.shR, j.elR, j.haR], 'dg-limb' + H('arm'));
    s += `<circle cx="${f(j.head[0])}" cy="${f(j.head[1])}" r="${L.head}" class="dg-head"/>`;
    return s;
  }
  if (j.kn2) s += line([j.hip, j.kn2, j.an2, j.toe2], 'dg-limb dg-far' + H('leg'));
  if (j.el2) s += line([j.sh, j.el2, j.ha2], 'dg-limb dg-far' + H('arm'));
  s += line([j.hip, j.kn, j.an, j.toe], 'dg-limb' + H('leg'));
  s += line([j.hip, j.sh], 'dg-body' + H('torso'));
  s += `<circle cx="${f(j.head[0])}" cy="${f(j.head[1])}" r="${L.head}" class="dg-head"/>`;
  s += line([j.sh, j.el, j.ha], 'dg-limb' + H('arm'));
  return s;
}

export function frame(d, t) {
  const pose = lerpPose(d.A, d.B, t);
  const j = skeleton(pose);
  const back = (d.props || []).filter((p) => !p.front);
  const front = (d.props || []).filter((p) => p.front);
  return (
    back.map((p) => drawProp(p, j)).join('') +
    drawFigure(j, d.hl || []) +
    front.map((p) => drawProp(p, j)).join('')
  );
}

export function svg(d, t = 1, cls = '') {
  return `<svg viewBox="0 0 200 160" class="dg ${cls}" aria-hidden="true">${frame(d, t)}</svg>`;
}

// Animate: hold A, move to B, hold B, return. Returns a stop function.
export function animate(el, d, period = 2800) {
  if (!el || !d) return () => {};
  let raf = 0, stopped = false;
  const t0 = performance.now();
  const ease = (x) => 0.5 - 0.5 * Math.cos(Math.PI * x);
  const tick = (now) => {
    if (stopped) return;
    const p = ((now - t0) % period) / period;
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
