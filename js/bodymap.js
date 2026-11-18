// Front + back body map. Primary muscles glow in the accent colour,
// helper muscles in a lighter tint.

const FRONT = {
  traps: ['M44 30 L33 37 L44 36 Z', 'M56 30 L67 37 L56 36 Z'],
  fdelt: ['M33 36 Q25 37 25 47 L31 49 Q34 42 38 38 Z', 'M67 36 Q75 37 75 47 L69 49 Q66 42 62 38 Z'],
  sdelt: ['M25 41 Q23 45 24 50 L27 49 Z', 'M75 41 Q77 45 76 50 L73 49 Z'],
  chest: ['M49 37 L38 38 Q32 44 34 51 Q40 55 49 53 Z', 'M51 37 L62 38 Q68 44 66 51 Q60 55 51 53 Z'],
  biceps: ['M25 50 Q23 58 25 66 L30 66 Q32 58 31 50 Z', 'M75 50 Q77 58 75 66 L70 66 Q68 58 69 50 Z'],
  forearm: ['M24 68 Q20 78 21 88 L26 88 Q30 78 30 68 Z', 'M76 68 Q80 78 79 88 L74 88 Q70 78 70 68 Z'],
  abs: ['M44 55 h12 v31 q-6 4 -12 0 Z'],
  obliques: ['M36 54 L43 56 L43 85 L38 80 Q35 68 36 54 Z', 'M64 54 L57 56 L57 85 L62 80 Q65 68 64 54 Z'],
  hipflex: ['M39 86 L46 92 L44 100 L38 94 Z', 'M61 86 L54 92 L56 100 L62 94 Z'],
  quads: ['M37 95 Q34 112 38 132 L46 132 Q49 112 46 100 Z', 'M63 95 Q66 112 62 132 L54 132 Q51 112 54 100 Z'],
  calves: ['M38 142 Q36 155 39 170 L43 170 Q45 155 44 142 Z', 'M62 142 Q64 155 61 170 L57 170 Q55 155 56 142 Z'],
};
const BACK = {
  traps: ['M50 29 L36 37 L44 44 L50 58 L56 44 L64 37 Z'],
  rdelt: ['M35 37 Q26 38 25 47 L31 48 Q34 42 40 40 Z', 'M65 37 Q74 38 75 47 L69 48 Q66 42 60 40 Z'],
  sdelt: ['M25 41 Q23 45 24 50 L27 49 Z', 'M75 41 Q77 45 76 50 L73 49 Z'],
  midback: ['M41 43 L48 49 L48 60 L41 56 Z', 'M59 43 L52 49 L52 60 L59 56 Z'],
  lats: ['M36 47 L42 57 L47 62 L45 76 Q38 70 35 58 Z', 'M64 47 L58 57 L53 62 L55 76 Q62 70 65 58 Z'],
  lowback: ['M46 64 h3 v22 h-5 Z', 'M54 64 h-3 v22 h5 Z'],
  triceps: ['M25 50 Q23 58 25 66 L30 66 Q32 58 31 50 Z', 'M75 50 Q77 58 75 66 L70 66 Q68 58 69 50 Z'],
  forearm: ['M24 68 Q20 78 21 88 L26 88 Q30 78 30 68 Z', 'M76 68 Q80 78 79 88 L74 88 Q70 78 70 68 Z'],
  glutes: ['M37 87 Q36 100 42 103 Q49 104 49 96 L49 87 Z', 'M63 87 Q64 100 58 103 Q51 104 51 96 L51 87 Z'],
  hams: ['M37 105 Q35 118 38 134 L46 134 Q48 118 47 106 Z', 'M63 105 Q65 118 62 134 L54 134 Q52 118 53 106 Z'],
  calves: ['M37 140 Q34 152 38 166 L44 166 Q46 152 45 140 Z', 'M63 140 Q66 152 62 166 L56 166 Q54 152 55 140 Z'],
};

const SIL =
  '<circle cx="50" cy="15" r="10"/>' +
  '<path d="M45 24 h10 v6 h-10 Z"/>' +
  '<path d="M36 31 Q50 27 64 31 Q73 33 76 41 L80 88 L72 90 L69 52 L66 60 Q66 76 63 86 Q66 100 64 108 L64 135 L62 172 L64 180 L54 180 L54 140 L52 104 L48 104 L46 140 L46 180 L36 180 L38 172 L36 135 L36 108 Q34 100 37 86 Q34 76 34 60 L31 52 L28 90 L20 88 L24 41 Q27 33 36 31 Z"/>';

function view(map, prim, sec, label) {
  let s = `<g class="bm-sil">${SIL}</g>`;
  for (const [k, paths] of Object.entries(map)) {
    if (k === 'abs' && map === FRONT) { const c = prim.includes(k) ? 'bm-p' : sec.includes(k) ? 'bm-s' : 'bm-o'; s += paths.map((d) => `<path d="${d}" class="${c}"/>`).join('') + '<path d="M44 65 h12 M44 75 h12 M50 55 v31" class="bm-cut"/>'; continue; }
    const cls = prim.includes(k) ? 'bm-p' : sec.includes(k) ? 'bm-s' : 'bm-o';
    s += paths.map((d) => `<path d="${d}" class="${cls}"/>`).join('');
  }
  return s + `<text x="50" y="194" text-anchor="middle" class="bm-lbl">${label}</text>`;
}

export const MUSCLE_NAMES = {
  chest: 'Chest', fdelt: 'Front shoulders', sdelt: 'Side shoulders', rdelt: 'Rear shoulders', traps: 'Traps',
  biceps: 'Biceps', triceps: 'Triceps', forearm: 'Forearms', abs: 'Abs', obliques: 'Obliques (side abs)',
  hipflex: 'Hip flexors', lats: 'Lats', midback: 'Mid-back', lowback: 'Lower back', glutes: 'Glutes',
  quads: 'Quads (front thigh)', hams: 'Hamstrings', calves: 'Calves',
};

export function bodyMap(prim = [], sec = []) {
  return `<svg viewBox="0 0 210 200" class="bodymap" role="img" aria-label="Muscles worked">
    <g transform="translate(2,0)">${view(FRONT, prim, sec, 'FRONT')}</g>
    <g transform="translate(108,0)">${view(BACK, prim, sec, 'BACK')}</g>
  </svg>`;
}
