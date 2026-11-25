// Your default program + body targets.
// Built for: male, 32, 175 cm, 83 kg → 77 kg, <1 year training,
// 4 days/week, priority = belly/core, then upper body.

const it = (exId, sets, repMin, repMax, rest = 90) => ({ exId, sets, repMin, repMax, rest });

export function defaultProgram() {
  return {
    name: 'Lean & Core — 4 Day',
    days: [
      {
        id: 'd1', name: 'Day 1 · Upper Push + Core',
        warmup: { exId: 'treadmill-incline-walk', min: 5 },
        finisher: { exId: 'treadmill-incline-walk', min: 20 },
        items: [
          it('machine-chest-press', 3, 8, 12, 120),
          it('incline-db-press', 3, 8, 12, 90),
          it('machine-shoulder-press', 3, 8, 12, 90),
          it('machine-lateral-raise', 3, 12, 15, 60),
          it('cable-pushdown', 3, 10, 15, 60),
          it('cable-crunch', 3, 10, 15, 60),
          it('plank', 3, 30, 60, 45),
        ],
      },
      {
        id: 'd2', name: 'Day 2 · Legs + Core',
        warmup: { exId: 'treadmill-incline-walk', min: 5 },
        finisher: { exId: 'treadmill-incline-walk', min: 15 },
        items: [
          it('leg-press', 3, 10, 12, 120),
          it('db-rdl', 3, 8, 12, 90),
          it('lying-leg-curl', 3, 10, 15, 60),
          it('glute-drive', 3, 10, 12, 90),
          it('hanging-knee-raise', 3, 8, 15, 60),
          it('dead-bug', 3, 8, 12, 45),
          it('side-plank', 2, 20, 45, 30),
        ],
      },
      {
        id: 'd3', name: 'Day 3 · Upper Pull + Core',
        warmup: { exId: 'treadmill-incline-walk', min: 5 },
        finisher: { exId: 'treadmill-incline-walk', min: 20 },
        items: [
          it('lat-pulldown', 3, 8, 12, 120),
          it('seated-cable-row', 3, 8, 12, 90),
          it('db-row', 2, 10, 12, 60),
          it('face-pull', 3, 12, 15, 60),
          it('db-curl', 3, 10, 12, 60),
          it('ab-crunch-machine', 3, 10, 15, 60),
          it('machine-back-extension', 2, 12, 15, 60),
          it('pallof-press', 3, 10, 12, 45),
        ],
      },
      {
        id: 'd4', name: 'Day 4 · Core Focus + Upper',
        warmup: { exId: 'treadmill-incline-walk', min: 5 },
        finisher: { exId: 'treadmill-incline-walk', min: 20 },
        items: [
          it('lying-leg-raise', 3, 10, 15, 45),
          it('reverse-crunch', 3, 10, 15, 45),
          it('db-bench-press', 3, 8, 12, 90),
          it('assisted-pullup', 3, 6, 10, 90),
          it('db-shoulder-press', 3, 8, 12, 90),
          it('pec-deck', 2, 12, 15, 60),
          it('overhead-triceps', 2, 10, 15, 60),
          it('hammer-curl', 2, 10, 12, 60),
          it('mountain-climber', 3, 20, 40, 30),
        ],
      },
    ],
  };
}

export const WHY = [
  ['Belly fat comes off with diet, not crunches', 'Nobody can burn fat from one spot. Your stomach flattens when your total body fat drops — that\'s the calorie target below. Core training then builds the muscle that shows when the fat is gone.'],
  ['Core every session', 'You train abs 4× a week: upper abs (crunches), lower abs (leg/knee raises), obliques (Pallof, side plank) and deep core (plank, dead bug). Day 4 starts with core while you\'re fresh.'],
  ['Upper body 3× a week', 'Chest, back and shoulders each get worked twice a week — the sweet spot for growing muscle as a beginner.'],
  ['One leg day', 'Legs are your biggest muscles; training them burns a lot of calories and protects muscle while you diet. Kept to one day so upper body stays the focus.'],
  ['Treadmill: short warm-up, longer walk after', '5 min easy at the start warms you up without tiring you. The 15–20 min incline walk after lifting is when it burns fat best. You can change this in Plan.'],
  ['Weights that progress automatically', 'Each exercise has a rep range (e.g. 8–12). When you hit the top of the range on every set, the app tells you to go up in weight. Leave 1–2 reps "in the tank" on each set.'],
];

export const SCHEDULE = 'Suggested week: Mon Day 1 · Tue Day 2 · Thu Day 3 · Sat Day 4. Any 4 days work — just avoid more than 2 in a row.';

// Mifflin–St Jeor
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
