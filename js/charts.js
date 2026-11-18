// Tiny SVG line chart. points: [{x: timestamp, y: number}]
export function lineChart(points, { goal = null, unit = '', height = 150, decimals = 1 } = {}) {
  if (!points.length) return '<div class="empty-chart">No data yet</div>';
  const W = 340, H = height, pl = 34, pr = 10, pt = 12, pb = 22;
  const xs = points.map((p) => p.x), ys = points.map((p) => p.y);
  let minY = Math.min(...ys, goal ?? Infinity), maxY = Math.max(...ys, goal ?? -Infinity);
  if (minY === maxY) { minY -= 1; maxY += 1; }
  const pad = (maxY - minY) * 0.12;
  minY -= pad; maxY += pad;
  let minX = Math.min(...xs), maxX = Math.max(...xs);
  if (minX === maxX) { minX -= 86400000; maxX += 86400000; }
  const X = (x) => pl + ((x - minX) / (maxX - minX)) * (W - pl - pr);
  const Y = (y) => pt + (1 - (y - minY) / (maxY - minY)) * (H - pt - pb);
  const r = (n) => Math.round(n * 10) / 10;
  const fmt = (n) => (Math.round(n * 10 ** decimals) / 10 ** decimals).toString();
  let s = `<svg viewBox="0 0 ${W} ${H}" class="chart" role="img">`;
  for (let i = 0; i <= 3; i++) {
    const v = minY + ((maxY - minY) * i) / 3;
    s += `<line x1="${pl}" x2="${W - pr}" y1="${r(Y(v))}" y2="${r(Y(v))}" class="ch-grid"/><text x="${pl - 5}" y="${r(Y(v)) + 3}" class="ch-lbl" text-anchor="end">${fmt(v)}</text>`;
  }
  if (goal != null) s += `<line x1="${pl}" x2="${W - pr}" y1="${r(Y(goal))}" y2="${r(Y(goal))}" class="ch-goal"/><text x="${W - pr}" y="${r(Y(goal)) - 4}" class="ch-goal-lbl" text-anchor="end">goal ${goal}${unit}</text>`;
  const d = points.map((p, i) => `${i ? 'L' : 'M'}${r(X(p.x))},${r(Y(p.y))}`).join('');
  s += `<path d="${d}" class="ch-line"/>`;
  for (const p of points.slice(-30)) s += `<circle cx="${r(X(p.x))}" cy="${r(Y(p.y))}" r="3" class="ch-dot"/>`;
  const dl = (t) => new Date(t).toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
  s += `<text x="${pl}" y="${H - 5}" class="ch-lbl">${dl(minX)}</text><text x="${W - pr}" y="${H - 5}" class="ch-lbl" text-anchor="end">${dl(maxX)}</text>`;
  return s + '</svg>';
}
