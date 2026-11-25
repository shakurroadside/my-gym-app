// Your default program + body targets.
// Built for: male, 32, 175 cm, 83 kg → 77 kg, <1 year training,
// 4 days/week, priority = belly/core, then upper body.

const it = (exId, sets, repMin, repMax, rest = 90, ss = null) => ({ exId, sets, repMin, repMax, rest, ...(ss ? { ss } : {}) });

// Program v2 — built for: male, 32, 175 cm, 83 → 77 kg, <1 year training, 4 days/week,
// priority: belly/core, then upper body. Fit4Less Edmonton North.
// Principles: compound lift first (fresh, longer rest) → antagonist supersets (≈35% less time, same gains)
// → core every day (anti-extension, anti-rotation, flexion, lower back) → fat-burn finisher.
export function defaultProgram() {
  return {
    name: 'Lean & Strong — 4 Day',
    v: 2,
    start: Date.now(),
    days: [
      {
        id: 'd1', name: 'Day 1 · Upper A (Chest & Shoulders)',
        warmup: { exId: 'treadmill-incline-walk', min: 5 },
        finisher: { exId: 'treadmill-incline-walk', min: 15 },
        items: [
          it('db-bench-press', 3, 6, 10, 150, 'A'),
          it('lat-pulldown', 3, 8, 12, 45, 'B'),
          it('db-shoulder-press', 3, 8, 12, 90, 'B'),
          it('machine-lateral-raise', 3, 12, 15, 30, 'C'),
          it('cable-pushdown', 2, 10, 15, 60, 'C'),
          it('cable-crunch', 3, 10, 15, 30, 'D'),
          it('side-plank', 2, 20, 45, 45, 'D'),
        ],
      },
      {
        id: 'd2', name: 'Day 2 · Lower + Core',
        warmup: { exId: 'treadmill-incline-walk', min: 5 },
        finisher: { exId: 'treadmill-incline-walk', min: 15 },
        items: [
          it('trap-bar-deadlift', 3, 6, 8, 150, 'A'),
          it('leg-press', 3, 10, 12, 45, 'B'),
          it('lying-leg-raise', 3, 10, 15, 75, 'B'),
          it('lying-leg-curl', 3, 10, 15, 30, 'C'),
          it('dead-bug', 3, 8, 12, 60, 'C'),
        ],
      },
      {
        id: 'd3', name: 'Day 3 · Upper B (Back & Arms)',
        warmup: { exId: 'treadmill-incline-walk', min: 5 },
        finisher: { exId: 'treadmill-incline-walk', min: 15 },
        items: [
          it('assisted-pullup', 3, 6, 10, 120, 'A'),
          it('machine-row', 3, 8, 12, 45, 'B'),
          it('incline-db-press', 3, 8, 12, 90, 'B'),
          it('face-pull', 3, 12, 15, 30, 'C'),
          it('ez-curl', 3, 8, 12, 60, 'C'),
          it('ab-crunch-machine', 3, 10, 15, 30, 'D'),
          it('machine-back-extension', 2, 12, 15, 60, 'D'),
        ],
      },
      {
        id: 'd4', name: 'Day 4 · Core First + Full Body + Conditioning',
        warmup: { exId: 'treadmill-incline-walk', min: 5 },
        finisher: { exId: 'treadmill-incline-walk', min: 0 },
        items: [
          it('pallof-press', 3, 10, 12, 30, 'A'),
          it('reverse-crunch', 3, 10, 15, 45, 'A'),
          it('goblet-squat', 3, 10, 12, 90, 'B'),
          it('cable-fly', 3, 12, 15, 30, 'C'),
          it('trx-row', 3, 8, 12, 60, 'C'),
          it('lateral-raise', 2, 12, 20, 30, 'D'),
          it('hammer-curl', 2, 10, 12, 45, 'D'),
          it('sled-push', 4, 20, 30, 15, 'E'),
          it('battle-ropes', 4, 20, 30, 60, 'E'),
        ],
      },
    ],
  };
}

export const WHY = [
  ['1 · Your belly is a nutrition job — your abs are a training job', 'Six controlled studies found ab exercises alone barely shrink belly fat; total fat loss does. So the calorie target (≈2,150 kcal, 150 g protein) is what flattens your stomach, and the 22 sets of core work per week build the muscle that shows when the fat is gone.'],
  ['2 · Core 4×/week, from every angle', 'Flexion (cable crunch, ab crunch, reverse crunch, leg raise) for the six-pack; anti-rotation (Pallof, side plank) for a tight waist; anti-extension (dead bug) for deep abs; back extension so your lower back stays balanced and pain-free. Day 4 trains core FIRST, while you\'re fresh.'],
  ['3 · Upper body gets the most volume', 'Per week: back ≈12 sets, chest ≈9–10, side shoulders 5 direct (+ all the presses), arms 5 each direct. Every muscle is hit twice a week — the research sweet spot for growth while dieting.'],
  ['4 · Big lift first, then supersets', 'Each day starts with one heavy compound (bench, trap-bar deadlift, pull-up) with full rest — that\'s what keeps your strength while you lose weight. Then exercises are paired (B1 → B2, rest, repeat). Pairing opposite muscles cuts session time by about a third with the same gains. Every session ≈ 60 minutes.'],
  ['5 · Free weights where they matter, machines where they\'re better', 'Dumbbells for presses (each arm works alone, better stability for your stance). Machines for isolation and for core/back extension where the machine guides your form. Trap bar instead of a barbell deadlift — the safest way to learn to lift from the floor.'],
  ['6 · How hard to push (RIR = reps in reserve)', 'Weeks 1–2: stop every set with 3 reps left — learn the movements. Weeks 3–6: stop with 1–2 left. Week 7: deload — same weights, half the sets. Then we review your numbers and add sets to your priorities. The app tells you which week you\'re in on the Today screen.'],
  ['7 · Cardio that works with a diet', 'Short warm-up, 15 min incline walk after Days 1–3, and a sled + battle-rope finisher on Day 4. Daily steps (8–10k) burn more than any single cardio session — walk on rest days.'],
];

export const SCHEDULE = 'Suggested week: Mon Day 1 · Tue Day 2 · Thu Day 3 · Sat Day 4. Walk 30–45 min on the other days. Never more than 2 lifting days in a row.';

export function phase(start) {
  const wk = Math.floor((Date.now() - (start || Date.now())) / 6048e5) % 7; // 7-week blocks
  const block = Math.floor((Date.now() - (start || Date.now())) / 6048e5 / 7) + 1;
  if (wk < 2) return { week: wk + 1, block, name: 'Learn', rir: 3, msg: 'Stop every set with about 3 reps left. Focus on setup and form.' };
  if (wk < 6) return { week: wk + 1, block, name: 'Build', rir: 1, msg: 'Stop every set with 1–2 reps left. Last set of each exercise can go to ~1.' };
  return { week: wk + 1, block, name: 'Deload', rir: 4, msg: 'Recovery week: same weights, do only HALF the sets. Next week we push again.' };
}

export function targets(profile, currentKg) {
  const w = currentKg || profile.startWeight;
  const h = profile.heightCm, a = profile.age;
  const bmr = 10 * w + 6.25 * h - 5 * a + (profile.sex === 'female' ? -161 : 5);
  const tdee = bmr * 1.5;
  const kcal = Math.round((tdee - 500) / 50) * 50;
  const protein = Math.round((w * 1.8) / 5) * 5;
  const fat = Math.round((kcal * 0.25) / 9 / 5) * 5;
  const carbs = Math.max(0, Math.round((kcal - protein * 4 - fat * 9) / 4 / 5) * 5);
  const toLose = Math.max(0, w - profile.goalWeight);
  const weeks = Math.ceil(toLose / 0.5);
  return { bmr: Math.round(bmr), tdee: Math.round(tdee), kcal, protein, fat, carbs, toLose, weeks };
}
