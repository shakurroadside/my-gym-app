// Your default program + body targets.
// Built for: male, 32, 175 cm, 83 kg → 77 kg, <1 year training,
// 3 days/week (Mon/Wed/Fri), priority = belly/core, then upper body.

const it = (exId, sets, repMin, repMax, rest = 90, ss = null) => ({ exId, sets, repMin, repMax, rest, ...(ss ? { ss } : {}) });

// Program v3 — built for: male, 32, 175 cm, 83 → 77 kg, <1 year training, 3 days/week,
// priority: belly/core, then upper body. Fit4Less Edmonton North.
// Principles: compound lift first (fresh, longer rest) → antagonist supersets (≈35% less time, same gains)
// → core every day (anti-extension, anti-rotation, flexion, lower back) → fat-burn finisher.
export function defaultProgram() {
  const walk = (min) => ({ exId: 'treadmill-incline-walk', min });
  return {
    name: 'Lean & Strong — 3-Day Full Body',
    v: 3,
    start: Date.now(),
    days: [
      {
        id: 'f1', name: 'Workout A · Full Body (Chest focus)', day: 1,
        warmup: walk(5), finisher: walk(20),
        items: [
          it('db-bench-press', 3, 6, 10, 150, 'A'),
          it('leg-press', 3, 10, 12, 45, 'B'),
          it('lat-pulldown', 3, 8, 12, 90, 'B'),
          it('machine-lateral-raise', 4, 12, 15, 30, 'C'),
          it('cable-pushdown', 3, 10, 15, 60, 'C'),
          it('ab-crunch-machine', 3, 10, 15, 30, 'D'),
          it('side-plank', 2, 20, 45, 45, 'D'),
        ],
      },
      {
        id: 'f2', name: 'Workout B · Back & Hinge', day: 3,
        warmup: walk(5), finisher: walk(15),
        items: [
          it('trap-bar-deadlift', 3, 6, 8, 150, 'A'),
          it('assisted-pullup', 3, 6, 10, 45, 'B'),
          it('incline-db-press', 3, 8, 12, 90, 'B'),
          it('lying-leg-curl', 3, 10, 15, 30, 'C'),
          it('face-pull', 3, 12, 15, 60, 'C'),
          it('lying-leg-raise', 3, 10, 15, 30, 'D'),
          it('dead-bug', 3, 8, 12, 45, 'D'),
        ],
      },
      {
        id: 'f3', name: 'Workout C · Core first + Conditioning', day: 5,
        warmup: walk(5), finisher: walk(10),
        items: [
          it('pallof-press', 3, 10, 12, 30, 'A'),
          it('ab-crunch-machine', 3, 10, 15, 45, 'A'),
          it('goblet-squat', 3, 10, 12, 45, 'B'),
          it('machine-row', 3, 8, 12, 90, 'B'),
          it('db-shoulder-press', 3, 8, 12, 45, 'C'),
          it('ez-curl', 3, 8, 12, 60, 'C'),
          it('cable-fly', 2, 12, 15, 30, 'D'),
          it('machine-back-extension', 2, 12, 15, 60, 'D'),
          it('sled-push', 4, 20, 30, 15, 'E'),
          it('battle-ropes', 4, 20, 30, 60, 'E'),
        ],
      },
    ],
  };
}

export const WHY = [
  ['1 · Your belly is a nutrition job — your abs are a training job', 'Controlled trials (e.g. Vispute 2011) found that ab exercises alone don\'t noticeably shrink belly fat — losing body fat overall does. So the calorie target (≈2,150 kcal, 150 g protein) is what flattens your stomach, and the ≈19 sets of core work per week build the muscle that shows when the fat is gone.'],
  ['2 · Core every session, from every angle', 'Flexion (cable crunch, ab crunch, reverse crunch, leg raise) for the six-pack; anti-rotation (Pallof, side plank) for a tight waist; anti-extension (dead bug) for deep abs; back extension so your lower back stays balanced and pain-free. Friday trains core FIRST, while you\'re fresh. ≈19 core sets per week.'],
  ['3 · Upper body gets the most volume', 'Per week: back ≈12 sets, chest ≈8 (+ shoulder presses), side shoulders 4 direct (+ presses & face pulls), triceps 3 + biceps 3 direct (+ all presses & pulls). With 3 days, full-body sessions hit every muscle 2–3× a week — better than a split for your schedule.'],
  ['4 · Big lift first, then supersets', 'Each day starts with one heavy compound (bench, trap-bar deadlift, pull-up) with full rest — that\'s what keeps your strength while you lose weight. Then exercises are paired (B1 → B2, rest, repeat). Pairing opposite muscles cuts session time by about a third with the same gains. Every session ≈ 75–80 minutes including cardio.'],
  ['5 · Free weights where they matter, machines where they\'re better', 'Dumbbells for presses (each arm works alone, better stability for your stance). Machines for isolation and for core/back extension where the machine guides your form. Trap bar instead of a barbell deadlift — the safest way to learn to lift from the floor.'],
  ['6 · How hard to push (RIR = reps in reserve)', 'Weeks 1–2: stop every set with 3 reps left — learn the movements. Weeks 3–6: stop with 1–2 left. Week 7: deload — same weights, half the sets. Then we review your numbers and add sets to your priorities. The app tells you which week you\'re in on the Today screen.'],
  ['7 · Cardio that works with a diet', '5 min warm-up, incline walk after every session (20 / 15 / 10 min), plus a sled + battle-rope finisher on Friday. Daily steps (8–10k) burn more than any single cardio session — walk on rest days.'],
];

export const SCHEDULE = 'Your week: Workout A Monday · B Wednesday · C Friday (a rest day between each). The app follows the order A → B → C, not the calendar. Can\'t make one? Do it the next day — just keep 1 rest day between sessions. Walk 30–45 min on Tue/Thu/weekend.';

export function phase(start) {
  const wk = Math.floor((Date.now() - (start || Date.now())) / 6048e5) % 7; // 7-week blocks
  const block = Math.floor((Date.now() - (start || Date.now())) / 6048e5 / 7) + 1;
  if (wk < 2) return { week: wk + 1, block, name: 'Learn', rir: 3, msg: 'Stop every set with about 3 reps left. Focus on setup and form.' };
  if (wk < 6) return { week: wk + 1, block, name: 'Build', rir: 1, msg: 'Stop every set with 1–2 reps left. Last set of each exercise can go to ~1.' };
  return { week: wk + 1, block, name: 'Deload', rir: 4, msg: 'Recovery week: same weights, do only HALF the sets. Next week we push again.' };
}

export function targets(profile, currentKg, adj = 0) {
  const w = currentKg || profile.startWeight;
  const h = profile.heightCm, a = profile.age;
  const bmr = 10 * w + 6.25 * h - 5 * a + (profile.sex === 'female' ? -161 : 5);
  const tdee = bmr * 1.5;
  const base = Math.round((tdee - 500) / 50) * 50;
  const floor = Math.max(profile.sex === 'female' ? 1400 : 1700, Math.round(bmr / 50) * 50);
  const kcal = Math.max(floor, base + (adj || 0));
  const protein = Math.round((w * 1.8) / 5) * 5;
  const fat = Math.round((kcal * 0.25) / 9 / 5) * 5;
  const carbs = Math.max(0, Math.round((kcal - protein * 4 - fat * 9) / 4 / 5) * 5);
  const toLose = Math.max(0, w - profile.goalWeight);
  const weeks = Math.ceil(toLose / 0.5);
  return { bmr: Math.round(bmr), tdee: Math.round(tdee), base, adj: adj || 0, floor, kcal, protein, fat, carbs, toLose, weeks };
}

// Long-term roadmap shown on the Plan screen.
export const ROADMAP = [
  { id: 'p1', title: 'Phase 1 · Fat loss — Block 1', when: 'Weeks 1–7', text: 'Machines + dumbbells, trap-bar deadlift as your one heavy free-weight lift. Calorie deficit.' },
  { id: 'p1b', title: 'Phase 1 · Fat loss — Block 2', when: 'From week 8', text: 'Barbell back squat comes back on Friday (half rack, safety arms set, 8–10 reps, 2–3 in reserve). Everything else stays.' },
  { id: 'p2', title: 'Phase 2 · Strength', when: 'When you reach your goal weight', text: 'Calories up to maintenance. New plan built around barbell squat, bench and deadlift + your favourite machines. Core every session.' },
];
