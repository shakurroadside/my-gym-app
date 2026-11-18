// Built-in exercise library. Machines from your gym can be added in the app
// (Library → "Add your machine") and reuse any of these diagrams.
//
// type: 'reps' | 'time' (seconds) | 'cardio' (minutes)
// bw: bodyweight — weight is optional
// inc: weight jump used when the app tells you to go up
// d: diagram — A = start pose, B = end pose (see diagram.js)

const FLOOR = { k: 'floor', y: 157 };
const ST = { x: 100, y: 78, t: -90, ua: 90, fa: 90, th: 90, sh: 90, ft: 0 }; // standing, side
const SS = { x: 85, y: 112, t: -92, ua: 88, fa: 88, th: 0, sh: 90, ft: 0 }; // seated, side
const FST = { v: 'f', x: 100, y: 80, ua: 84, fa: 88, th: 87, sh: 90 }; // standing, front
const FSE = { v: 'f', x: 100, y: 102, ua: 84, fa: 88, th: 55, ths: 0.5, sh: 90 }; // seated, front
const SEAT = [{ k: 'pad', p: [[66, 119], [110, 119]], w: 6 }, { k: 'line', p: [[88, 122], [88, 157]] }];
const FSEAT = [{ k: 'pad', p: [[80, 108], [120, 108]], w: 6 }, { k: 'line', p: [[100, 111], [100, 157]] }];
const s = (base, o) => ({ ...base, ...o });

export const MUSCLES = ['Core', 'Chest', 'Back', 'Shoulders', 'Arms', 'Legs', 'Cardio'];

export const LIBRARY = [
  // ───────────── CORE ─────────────
  {
    id: 'plank', name: 'Plank', muscle: 'Core', target: 'Deep abs (transverse), whole core',
    equip: 'Bodyweight', type: 'time', bw: true, inc: 0,
    cues: ['Forearms on the floor, elbows under shoulders.', 'Squeeze glutes and pull belly button toward spine.', 'Body in one straight line — no sagging hips, no raised butt.', 'Breathe slowly through the hold.'],
    avoid: 'Holding your breath or letting the lower back sag.',
    d: {
      A: { x: 85, y: 126, t: -4, ua: 90, fa: 0, th: 163, sh: 163, ft: 100 },
      B: { x: 85, y: 125, t: -5, ua: 90, fa: 0, th: 163, sh: 163, ft: 100 },
      props: [FLOOR], hl: ['torso'],
    },
  },
  {
    id: 'side-plank', name: 'Side Plank', muscle: 'Core', target: 'Obliques (side abs), waist',
    equip: 'Bodyweight', type: 'time', bw: true, inc: 0, perSide: true,
    cues: ['Lie on your side, elbow under shoulder, feet stacked.', 'Lift hips until body is a straight line.', 'Hold — then switch sides.', 'Easier: bottom knee on the floor.'],
    avoid: 'Hips dropping toward the floor.',
    d: {
      A: { x: 85, y: 134, t: -14, ua: 90, fa: 0, th: 170, sh: 170, ft: 100 },
      B: { x: 85, y: 125, t: -4, ua: 90, fa: 0, th: 163, sh: 163, ft: 100 },
      props: [FLOOR], hl: ['torso'],
    },
  },
  {
    id: 'dead-bug', name: 'Dead Bug', muscle: 'Core', target: 'Deep abs, lower abs, core control',
    equip: 'Bodyweight', type: 'reps', bw: true, inc: 0, perSide: true,
    cues: ['Lie on your back, arms straight up, knees bent 90° above hips.', 'Press your lower back flat into the floor.', 'Slowly extend one arm overhead and the opposite leg out.', 'Return and switch sides. Slow = better.'],
    avoid: 'Lower back lifting off the floor.',
    d: {
      A: { x: 112, y: 146, t: 180, hd: 180, ua: -90, fa: -90, ua2: -90, fa2: -90, th: -90, sh: 0, ft: -90, th2: -90, sh2: 0, ft2: -90 },
      B: { x: 112, y: 146, t: 180, hd: 180, ua: 172, fa: 172, ua2: -90, fa2: -90, th: -6, sh: -6, ft: -90, th2: -90, sh2: 0, ft2: -90 },
      props: [FLOOR], hl: ['torso'],
    },
  },
  {
    id: 'ab-crunch-machine', name: 'Ab Crunch Machine', muscle: 'Core', target: 'Upper & middle abs (six-pack)',
    equip: 'Machine', type: 'reps', inc: 5,
    cues: ['Set seat so the pads sit on your chest/shoulders.', 'Breathe out and curl your ribs down toward your hips.', 'Squeeze abs 1 second at the bottom.', 'Return slowly — don\'t let the stack slam.'],
    avoid: 'Pulling with your arms instead of curling with your abs.',
    d: {
      A: s(SS, { t: -95, ua: 100, fa: -40 }),
      B: s(SS, { t: -50, hd: -40, ua: 145, fa: 5 }),
      props: [{ k: 'stack', x: 18, y: 30, w: 18, h: 120 }, ...SEAT, { k: 'roller', at: 'an', dx: 6, dy: -6 }, { k: 'handle', at: 'ha', front: true }],
      hl: ['torso'],
    },
  },
  {
    id: 'cable-crunch', name: 'Kneeling Cable Crunch', muscle: 'Core', target: 'Upper & middle abs (six-pack)',
    equip: 'Cable', type: 'reps', inc: 2.5,
    cues: ['Rope on high pulley. Kneel facing the machine, hands by your ears.', 'Keep hips still and high.', 'Crunch: curl your chest down toward your knees using abs.', 'Pause, then return slowly.'],
    avoid: 'Sitting back onto your heels — that turns it into a hip movement.',
    d: {
      A: { x: 92, y: 113, t: -78, hd: -70, ua: -40, fa: 175, th: 90, sh: 180, ft: 90 },
      B: { x: 92, y: 113, t: 20, hd: 45, ua: 70, fa: -80, th: 90, sh: 180, ft: 90 },
      props: [FLOOR, { k: 'line', p: [[150, 157], [150, 4], [118, 4]] }, { k: 'cable', from: [118, 6], to: 'ha' }],
      hl: ['torso'],
    },
  },
  {
    id: 'hanging-knee-raise', name: "Captain's Chair Knee Raise", muscle: 'Core', target: 'Lower abs, hip flexors',
    equip: 'Machine', type: 'reps', bw: true, inc: 0,
    cues: ['Forearms on the pads, back flat on the back pad.', 'Brace abs, then lift your knees toward your chest.', 'Curl your pelvis up at the top (that hits lower abs).', 'Lower slowly — no swinging.'],
    avoid: 'Swinging legs or arching the lower back.',
    d: {
      A: { x: 97, y: 76, t: -90, ua: 90, fa: 0, th: 92, sh: 90, ft: 10 },
      B: { x: 99, y: 74, t: -86, ua: 90, fa: 0, th: -12, sh: 85, ft: 10 },
      props: [FLOOR, { k: 'pad', p: [[89, 26], [89, 92]], w: 6 }, { k: 'pad', p: [[92, 62], [126, 62]], w: 5 }, { k: 'line', p: [[84, 157], [84, 20]] }],
      hl: ['torso', 'leg'],
    },
  },
  {
    id: 'lying-leg-raise', name: 'Lying Leg Raise', muscle: 'Core', target: 'Lower abs, hip flexors',
    equip: 'Bodyweight', type: 'reps', bw: true, inc: 0,
    cues: ['Lie flat, hands under your lower back/hips.', 'Keep legs straight (or slightly bent) and together.', 'Lift legs to vertical, then lower slowly.', 'Stop just above the floor and go again.'],
    avoid: 'Lower back arching off the floor as legs come down.',
    d: {
      A: { x: 92, y: 146, t: 180, hd: 180, ua: 2, fa: 2, th: -6, sh: -6, ft: -80 },
      B: { x: 92, y: 146, t: 180, hd: 180, ua: 2, fa: 2, th: -88, sh: -88, ft: 0 },
      props: [FLOOR], hl: ['torso', 'leg'],
    },
  },
  {
    id: 'reverse-crunch', name: 'Reverse Crunch', muscle: 'Core', target: 'Lower abs',
    equip: 'Bodyweight', type: 'reps', bw: true, inc: 0,
    cues: ['Lie on your back, knees bent, feet off the floor.', 'Use your abs to roll your hips up off the floor.', 'Knees travel toward your chest.', 'Lower slowly, one vertebra at a time.'],
    avoid: 'Using momentum to swing the legs.',
    d: {
      A: { x: 100, y: 146, t: 180, hd: 180, ua: 4, fa: 4, th: -50, sh: 25, ft: 0 },
      B: { x: 100, y: 138, t: 172, hd: 180, ua: 4, fa: 4, th: -125, sh: -20, ft: 0 },
      props: [FLOOR], hl: ['torso'],
    },
  },
  {
    id: 'pallof-press', name: 'Pallof Press', muscle: 'Core', target: 'Obliques, anti-rotation core strength',
    equip: 'Cable', type: 'reps', inc: 2.5, perSide: true,
    cues: ['Cable at chest height. Stand side-on to the machine.', 'Hold handle at your chest, feet shoulder-width.', 'Press straight out — don\'t let the cable twist you.', 'Hold 2 seconds, bring back. Switch sides.'],
    avoid: 'Rotating toward the machine.',
    d: {
      A: s(ST, { ua: 100, fa: -25, th: 86, th2: 94, sh2: 90 }),
      B: s(ST, { ua: 0, fa: 0, th: 86, th2: 94, sh2: 90 }),
      props: [FLOOR, { k: 'stack', x: 6, y: 10, w: 16, h: 147 }, { k: 'cable', from: [22, 46], to: 'ha' }, { k: 'handle', at: 'ha', front: true }],
      hl: ['torso'],
    },
  },
  {
    id: 'ab-wheel', name: 'Ab Wheel Rollout', muscle: 'Core', target: 'Whole abs (advanced)',
    equip: 'Other', type: 'reps', bw: true, inc: 0,
    cues: ['Kneel, hands on the wheel under your shoulders.', 'Brace abs hard, roll forward slowly.', 'Go only as far as you can keep your back flat.', 'Pull back with your abs.'],
    avoid: 'Hips sagging — that loads the lower back.',
    d: {
      A: { x: 50, y: 113, t: -30, ua: 80, fa: 80, th: 82, sh: 180, ft: 90 },
      B: { x: 85, y: 129, t: -6, ua: 26, fa: 26, th: 145, sh: 180, ft: 90 },
      props: [FLOOR, { k: 'wheel', at: 'ha', front: true }], hl: ['torso'],
    },
  },
  {
    id: 'back-extension', name: 'Back Extension (45°)', muscle: 'Core', target: 'Lower back, glutes',
    equip: 'Machine', type: 'reps', bw: true, inc: 5,
    cues: ['Hip bone just above the pad, ankles locked under the rollers.', 'Arms crossed on chest.', 'Lower your torso, then raise until your body is in a straight line.', 'Squeeze glutes at the top — don\'t over-arch.'],
    avoid: 'Hyper-extending past straight.',
    d: {
      A: { x: 110, y: 78, t: 100, hd: 110, ua: 30, fa: -90, th: 135, sh: 135, ft: 225 },
      B: { x: 110, y: 78, t: -45, hd: -45, ua: 135, fa: -45, th: 135, sh: 135, ft: 225 },
      props: [FLOOR, { k: 'pad', p: [[118, 85], [92, 111]], w: 7 }, { k: 'roller', at: 'an', dx: -6, dy: 4 }, { k: 'line', p: [[105, 100], [105, 157]] }, { k: 'line', p: [[58, 140], [58, 157]] }],
      hl: ['torso'],
    },
  },
  {
    id: 'mountain-climber', name: 'Mountain Climbers', muscle: 'Core', target: 'Abs + fat-burning conditioning',
    equip: 'Bodyweight', type: 'time', bw: true, inc: 0,
    cues: ['High plank: hands under shoulders.', 'Drive one knee toward your chest, switch fast.', 'Keep hips level with your shoulders.', 'Steady breathing.'],
    avoid: 'Butt sticking up high.',
    d: {
      A: { x: 82, y: 112, t: -15, ua: 90, fa: 90, th: 153, sh: 153, ft: 100, th2: 153, sh2: 153 },
      B: { x: 82, y: 112, t: -15, ua: 90, fa: 90, th: 55, sh: 150, ft: 100, th2: 153, sh2: 153 },
      props: [FLOOR], hl: ['torso', 'leg'],
    },
  },

  // ───────────── CHEST ─────────────
  {
    id: 'machine-chest-press', name: 'Seated Chest Press (Machine)', muscle: 'Chest', target: 'Chest, front shoulders, triceps',
    equip: 'Machine', type: 'reps', inc: 5,
    cues: ['Set seat so handles line up with mid-chest.', 'Back and head against the pad, shoulder blades pinched.', 'Press forward until arms are almost straight.', 'Return slowly until you feel a chest stretch.'],
    avoid: 'Shoulders rolling forward off the pad.',
    d: {
      A: s(SS, { t: -95, ua: 160, fa: -15 }),
      B: s(SS, { t: -95, ua: -4, fa: -4 }),
      props: [FLOOR, ...SEAT, { k: 'pad', p: [[73, 112], [69, 60]], w: 7 }, { k: 'handle', at: 'ha', front: true }],
      hl: ['arm'],
    },
  },
  {
    id: 'db-bench-press', name: 'Dumbbell Bench Press', muscle: 'Chest', target: 'Chest, front shoulders, triceps',
    equip: 'Dumbbell', type: 'reps', inc: 2,
    cues: ['Lie on a flat bench, feet flat on the floor.', 'Dumbbells at chest level, elbows ~45° from your body.', 'Press up until arms are straight over your chest.', 'Lower under control to a deep stretch.'],
    avoid: 'Flaring elbows straight out at 90°.',
    d: {
      A: { x: 112, y: 104, t: 180, hd: 180, ua: 155, fa: -75, th: 15, sh: 92, ft: 0 },
      B: { x: 112, y: 104, t: 180, hd: 180, ua: -88, fa: -88, th: 15, sh: 92, ft: 0 },
      props: [FLOOR, { k: 'pad', p: [[40, 112], [120, 112]], w: 6 }, { k: 'line', p: [[60, 115], [60, 157]] }, { k: 'line', p: [[110, 115], [110, 157]] }, { k: 'db', at: 'ha', front: true }],
      hl: ['arm'],
    },
  },
  {
    id: 'incline-db-press', name: 'Incline Dumbbell Press', muscle: 'Chest', target: 'Upper chest, front shoulders',
    equip: 'Dumbbell', type: 'reps', inc: 2,
    cues: ['Bench at 30–45°.', 'Dumbbells at upper-chest level.', 'Press up and slightly together over your face.', 'Lower slowly to a stretch.'],
    avoid: 'Bench too steep — it becomes a shoulder press.',
    d: {
      A: { x: 112, y: 112, t: -140, hd: -120, ua: 150, fa: -80, th: 10, sh: 92, ft: 0 },
      B: { x: 112, y: 112, t: -140, hd: -120, ua: -95, fa: -95, th: 10, sh: 92, ft: 0 },
      props: [FLOOR, { k: 'pad', p: [[112, 120], [70, 82]], w: 6 }, { k: 'line', p: [[95, 116], [95, 157]] }, { k: 'db', at: 'ha', front: true }],
      hl: ['arm'],
    },
  },
  {
    id: 'pec-deck', name: 'Pec Deck / Machine Fly', muscle: 'Chest', target: 'Chest (inner & middle)',
    equip: 'Machine', type: 'reps', inc: 5,
    cues: ['Seat so handles are at chest height.', 'Slight bend in elbows — keep it fixed.', 'Bring handles together in a hugging arc.', 'Open slowly until you feel a stretch.'],
    avoid: 'Letting the weight pull your arms too far back.',
    d: {
      A: s(FSE, { ua: 2, fa: -70 }),
      B: s(FSE, { ua: 178, uas: 0.45, fa: -85 }),
      props: [FLOOR, ...FSEAT, { k: 'handle', at: 'haR', front: true }, { k: 'handle', at: 'haL', front: true }],
      hl: ['arm', 'shoulder'],
    },
  },
  {
    id: 'cable-fly', name: 'Cable Fly (High to Low)', muscle: 'Chest', target: 'Lower & inner chest',
    equip: 'Cable', type: 'reps', inc: 2.5,
    cues: ['Pulleys high. Step forward, slight lean.', 'Soft bend in elbows.', 'Sweep hands down and together in front of your hips.', 'Return slowly with control.'],
    avoid: 'Turning it into a press by bending the elbows a lot.',
    d: {
      A: s(FST, { ua: -25, fa: -20 }),
      B: s(FST, { ua: 115, fa: 100 }),
      props: [FLOOR, { k: 'cable', from: [195, 8], to: 'haR' }, { k: 'cable', from: [5, 8], to: 'haL' }, { k: 'handle', at: 'haR', front: true }, { k: 'handle', at: 'haL', front: true }],
      hl: ['arm', 'shoulder'],
    },
  },
  {
    id: 'push-up', name: 'Push-Up', muscle: 'Chest', target: 'Chest, triceps, core',
    equip: 'Bodyweight', type: 'reps', bw: true, inc: 0,
    cues: ['Hands slightly wider than shoulders.', 'Body in a straight line, abs tight.', 'Lower chest to just above the floor.', 'Push back up. Easier: hands on a bench.'],
    avoid: 'Hips sagging or elbows flared wide.',
    d: {
      A: { x: 86, y: 108, t: -18, ua: 90, fa: 90, th: 152, sh: 152, ft: 100 },
      B: { x: 92, y: 136, t: -2, ua: 162, fa: 22, th: 174, sh: 174, ft: 100 },
      props: [FLOOR], hl: ['arm'],
    },
  },

  // ───────────── BACK ─────────────
  {
    id: 'lat-pulldown', name: 'Lat Pulldown', muscle: 'Back', target: 'Lats (back width), biceps',
    equip: 'Cable', type: 'reps', inc: 5,
    cues: ['Thighs locked under the pads, grip slightly wider than shoulders.', 'Lean back slightly, chest up.', 'Pull the bar to your upper chest, elbows down and back.', 'Let it rise slowly to a full stretch.'],
    avoid: 'Swinging back hard or pulling behind your neck.',
    d: {
      A: s(FSE, { ua: -62, fa: -78 }),
      B: s(FSE, { ua: 55, fa: -88 }),
      props: [FLOOR, ...FSEAT, { k: 'cable', from: [100, 2], to: 'mid:haL:haR' }, { k: 'hbar', a: 'haL', b: 'haR', ext: 14, front: true }],
      hl: ['arm', 'torso'],
    },
  },
  {
    id: 'seated-cable-row', name: 'Seated Cable Row', muscle: 'Back', target: 'Mid-back, lats, rear shoulders',
    equip: 'Cable', type: 'reps', inc: 5,
    cues: ['Feet on the platform, knees slightly bent.', 'Sit tall, chest up.', 'Pull the handle to your belly, squeeze shoulder blades together.', 'Reach forward slowly to stretch.'],
    avoid: 'Rocking your whole body back and forth.',
    d: {
      A: { x: 60, y: 128, t: -78, ua: 2, fa: 2, th: -4, sh: 14, ft: -80 },
      B: { x: 60, y: 128, t: -96, ua: 160, fa: -5, th: -4, sh: 14, ft: -80 },
      props: [FLOOR, { k: 'pad', p: [[40, 134], [80, 134]], w: 6 }, { k: 'line', p: [[60, 137], [60, 157]] }, { k: 'line', p: [[146, 112], [146, 150]], w: 5 }, { k: 'cable', from: [170, 120], to: 'ha' }, { k: 'handle', at: 'ha', front: true }],
      hl: ['arm', 'torso'],
    },
  },
  {
    id: 'machine-row', name: 'Chest-Supported Row (Machine)', muscle: 'Back', target: 'Mid-back, lats, rear shoulders',
    equip: 'Machine', type: 'reps', inc: 5,
    cues: ['Chest against the pad, seat so handles are at chest level.', 'Pull handles back, elbows close to the body.', 'Squeeze shoulder blades together for 1 second.', 'Return slowly.'],
    avoid: 'Lifting your chest off the pad.',
    d: {
      A: s(SS, { t: -80, ua: 5, fa: 5 }),
      B: s(SS, { t: -80, ua: 165, fa: 0 }),
      props: [FLOOR, ...SEAT, { k: 'pad', p: [[106, 92], [102, 66]], w: 7 }, { k: 'handle', at: 'ha', front: true }],
      hl: ['arm', 'torso'],
    },
  },
  {
    id: 'db-row', name: 'One-Arm Dumbbell Row', muscle: 'Back', target: 'Lats, mid-back',
    equip: 'Dumbbell', type: 'reps', inc: 2, perSide: true,
    cues: ['One knee and hand on a bench, back flat.', 'Let the dumbbell hang straight down.', 'Pull it to your hip, elbow close to the body.', 'Lower slowly to a stretch.'],
    avoid: 'Twisting your torso to lift the weight.',
    d: {
      A: { x: 62, y: 82, t: -6, hd: -10, ua: 90, fa: 90, ua2: 95, fa2: 85, th: 90, sh: 180, ft: 90, th2: 100, sh2: 92 },
      B: { x: 62, y: 82, t: -6, hd: -10, ua: -150, fa: 95, ua2: 95, fa2: 85, th: 90, sh: 180, ft: 90, th2: 100, sh2: 92 },
      props: [FLOOR, { k: 'pad', p: [[18, 123], [125, 123]], w: 6 }, { k: 'line', p: [[30, 126], [30, 157]] }, { k: 'line', p: [[115, 126], [115, 157]] }, { k: 'db', at: 'ha', front: true }],
      hl: ['arm', 'torso'],
    },
  },
  {
    id: 'assisted-pullup', name: 'Assisted Pull-Up (Machine)', muscle: 'Back', target: 'Lats, biceps',
    equip: 'Machine', type: 'reps', inc: 5, assisted: true,
    cues: ['Kneel on the pad, hands wide on the handles.', 'More weight on the stack = MORE help (easier).', 'Pull your chest toward the bar, elbows down.', 'Lower slowly to straight arms.'],
    avoid: 'Kipping or half reps.',
    d: {
      A: { v: 'f', x: 100, y: 106, ua: -66, fa: -80, th: 85, sh: 90, shs: 0.35 },
      B: { v: 'f', x: 100, y: 76, ua: 35, fa: -88, th: 85, sh: 90, shs: 0.35 },
      props: [{ k: 'line', p: [[50, 12], [150, 12]], w: 4 }, { k: 'line', p: [[46, 157], [46, 8]] }, { k: 'line', p: [[154, 157], [154, 8]] }, { k: 'mid', a: 'anL', b: 'anR', dy: 4, ext: 8, w: 6 }],
      hl: ['arm', 'torso'],
    },
  },
  {
    id: 'straight-arm-pulldown', name: 'Straight-Arm Pulldown', muscle: 'Back', target: 'Lats',
    equip: 'Cable', type: 'reps', inc: 2.5,
    cues: ['Rope or bar on the high pulley. Hinge slightly forward.', 'Arms straight (soft elbows).', 'Sweep hands down to your thighs using your back.', 'Return slowly up to eye level.'],
    avoid: 'Bending elbows — that turns it into a triceps move.',
    d: {
      A: s(ST, { x: 92, t: -78, ua: -35, fa: -35 }),
      B: s(ST, { x: 92, t: -78, ua: 82, fa: 82 }),
      props: [FLOOR, { k: 'line', p: [[188, 157], [188, 4], [170, 4]] }, { k: 'cable', from: [170, 6], to: 'ha' }, { k: 'handle', at: 'ha', front: true }],
      hl: ['arm', 'torso'],
    },
  },

  // ───────────── SHOULDERS ─────────────
  {
    id: 'machine-shoulder-press', name: 'Shoulder Press (Machine)', muscle: 'Shoulders', target: 'Front & side shoulders, triceps',
    equip: 'Machine', type: 'reps', inc: 5,
    cues: ['Seat so handles start at shoulder height.', 'Back flat against the pad.', 'Press up until arms are almost straight.', 'Lower slowly to shoulder level.'],
    avoid: 'Arching your lower back off the pad.',
    d: {
      A: s(FSE, { ua: 15, fa: -88 }),
      B: s(FSE, { ua: -76, fa: -86 }),
      props: [FLOOR, ...FSEAT, { k: 'handle', at: 'haR', front: true }, { k: 'handle', at: 'haL', front: true }],
      hl: ['arm', 'shoulder'],
    },
  },
  {
    id: 'db-shoulder-press', name: 'Seated Dumbbell Shoulder Press', muscle: 'Shoulders', target: 'Front & side shoulders, triceps',
    equip: 'Dumbbell', type: 'reps', inc: 2,
    cues: ['Bench upright, back supported.', 'Dumbbells at ear level, palms forward.', 'Press up until they nearly touch overhead.', 'Lower slowly to ear level.'],
    avoid: 'Leaning back to push the weight.',
    d: {
      A: s(FSE, { ua: 15, fa: -88 }),
      B: s(FSE, { ua: -76, fa: -86 }),
      props: [FLOOR, ...FSEAT, { k: 'db', at: 'haR', front: true }, { k: 'db', at: 'haL', front: true }],
      hl: ['arm', 'shoulder'],
    },
  },
  {
    id: 'lateral-raise', name: 'Dumbbell Lateral Raise', muscle: 'Shoulders', target: 'Side shoulders (width)',
    equip: 'Dumbbell', type: 'reps', inc: 1,
    cues: ['Stand tall, slight bend in elbows.', 'Raise dumbbells out to the sides.', 'Stop at shoulder height, pinkies slightly up.', 'Lower slowly (2–3 seconds).'],
    avoid: 'Shrugging or swinging the weights up.',
    d: {
      A: s(FST, { ua: 78, fa: 78 }),
      B: s(FST, { ua: -4, fa: -8 }),
      props: [FLOOR, { k: 'db', at: 'haR', front: true }, { k: 'db', at: 'haL', front: true }],
      hl: ['shoulder', 'arm'],
    },
  },
  {
    id: 'cable-lateral-raise', name: 'Cable Lateral Raise', muscle: 'Shoulders', target: 'Side shoulders (width)',
    equip: 'Cable', type: 'reps', inc: 2.5, perSide: true,
    cues: ['Low pulley, stand side-on, handle in the far hand.', 'Raise arm out to the side to shoulder height.', 'Lead with the elbow.', 'Lower slowly.'],
    avoid: 'Leaning your whole body away.',
    d: {
      A: s(FST, { ua: 100, fa: 100 }),
      B: s(FST, { ua: -4, fa: -8 }),
      props: [FLOOR, { k: 'cable', from: [5, 150], to: 'haR' }, { k: 'handle', at: 'haR', front: true }],
      hl: ['shoulder', 'arm'],
    },
  },
  {
    id: 'face-pull', name: 'Face Pull', muscle: 'Shoulders', target: 'Rear shoulders, upper back (posture)',
    equip: 'Cable', type: 'reps', inc: 2.5,
    cues: ['Rope at face height. Step back, arms straight.', 'Pull the rope toward your forehead, elbows high.', 'Pull the rope ends apart at the end.', 'Return slowly.'],
    avoid: 'Elbows dropping down to your sides.',
    d: {
      A: s(ST, { x: 92, ua: -12, fa: -12, th: 84, th2: 96, sh2: 90 }),
      B: s(ST, { x: 92, ua: 180, fa: -50, th: 84, th2: 96, sh2: 90 }),
      props: [FLOOR, { k: 'line', p: [[192, 157], [192, 6]] }, { k: 'cable', from: [190, 20], to: 'ha' }, { k: 'handle', at: 'ha', front: true }],
      hl: ['shoulder', 'arm'],
    },
  },
  {
    id: 'reverse-pec-deck', name: 'Reverse Pec Deck (Rear Delt)', muscle: 'Shoulders', target: 'Rear shoulders, upper back',
    equip: 'Machine', type: 'reps', inc: 5,
    cues: ['Face the pad, chest against it.', 'Arms straight out in front, slight elbow bend.', 'Open your arms out wide behind you.', 'Return slowly.'],
    avoid: 'Squeezing shoulder blades so hard you shrug.',
    d: {
      A: s(FSE, { ua: 178, uas: 0.4, fa: 178, fas: 0.35 }),
      B: s(FSE, { ua: 0, fa: 0 }),
      props: [FLOOR, ...FSEAT, { k: 'handle', at: 'haR', front: true }, { k: 'handle', at: 'haL', front: true }],
      hl: ['shoulder', 'arm'],
    },
  },

  // ───────────── ARMS ─────────────
  {
    id: 'cable-pushdown', name: 'Triceps Pushdown (Cable)', muscle: 'Arms', target: 'Triceps',
    equip: 'Cable', type: 'reps', inc: 2.5,
    cues: ['Rope or bar on the high pulley.', 'Elbows pinned to your sides.', 'Push down until arms are straight, spread the rope.', 'Let forearms rise slowly to chest level.'],
    avoid: 'Elbows drifting forward.',
    d: {
      A: s(ST, { x: 92, t: -84, ua: 96, fa: -40 }),
      B: s(ST, { x: 92, t: -84, ua: 96, fa: 86 }),
      props: [FLOOR, { k: 'line', p: [[160, 157], [160, 4], [128, 4]] }, { k: 'cable', from: [128, 6], to: 'ha' }, { k: 'handle', at: 'ha', front: true }],
      hl: ['arm'],
    },
  },
  {
    id: 'overhead-triceps', name: 'Overhead Triceps Extension (DB)', muscle: 'Arms', target: 'Triceps (long head)',
    equip: 'Dumbbell', type: 'reps', inc: 2,
    cues: ['Sit upright, hold one dumbbell with both hands overhead.', 'Lower it behind your head, elbows pointing up.', 'Extend back up to straight arms.', 'Keep elbows close to your head.'],
    avoid: 'Elbows flaring wide.',
    d: {
      A: s(SS, { ua: -102, fa: 115 }),
      B: s(SS, { ua: -102, fa: -98 }),
      props: [FLOOR, ...SEAT, { k: 'db', at: 'ha', front: true }],
      hl: ['arm'],
    },
  },
  {
    id: 'db-curl', name: 'Dumbbell Biceps Curl', muscle: 'Arms', target: 'Biceps',
    equip: 'Dumbbell', type: 'reps', inc: 1,
    cues: ['Stand tall, elbows at your sides.', 'Curl the dumbbells up, palms facing up.', 'Squeeze at the top.', 'Lower slowly all the way down.'],
    avoid: 'Swinging your body or elbows moving forward.',
    d: {
      A: s(ST, { ua: 88, fa: 88 }),
      B: s(ST, { ua: 84, fa: -65 }),
      props: [FLOOR, { k: 'db', at: 'ha', front: true }], hl: ['arm'],
    },
  },
  {
    id: 'hammer-curl', name: 'Hammer Curl', muscle: 'Arms', target: 'Biceps, forearms',
    equip: 'Dumbbell', type: 'reps', inc: 1,
    cues: ['Palms facing each other (like holding a hammer).', 'Elbows pinned at your sides.', 'Curl up, then lower slowly.'],
    avoid: 'Swinging.',
    d: {
      A: s(ST, { ua: 88, fa: 88 }),
      B: s(ST, { ua: 84, fa: -65 }),
      props: [FLOOR, { k: 'db', at: 'ha', front: true }], hl: ['arm'],
    },
  },
  {
    id: 'cable-curl', name: 'Cable Curl', muscle: 'Arms', target: 'Biceps',
    equip: 'Cable', type: 'reps', inc: 2.5,
    cues: ['Bar or rope on the low pulley.', 'Elbows at your sides.', 'Curl up, squeeze, lower slowly.'],
    avoid: 'Leaning back.',
    d: {
      A: s(ST, { x: 90, ua: 88, fa: 80 }),
      B: s(ST, { x: 90, ua: 84, fa: -65 }),
      props: [FLOOR, { k: 'line', p: [[150, 157], [150, 140]], w: 5 }, { k: 'cable', from: [150, 150], to: 'ha' }, { k: 'handle', at: 'ha', front: true }],
      hl: ['arm'],
    },
  },
  {
    id: 'preacher-curl-machine', name: 'Preacher Curl (Machine)', muscle: 'Arms', target: 'Biceps',
    equip: 'Machine', type: 'reps', inc: 5,
    cues: ['Armpits snug on top of the pad.', 'Curl up fully, squeeze.', 'Lower slowly — stop just before fully straight.'],
    avoid: 'Lifting your elbows off the pad.',
    d: {
      A: s(SS, { t: -80, ua: 45, fa: 40 }),
      B: s(SS, { t: -80, ua: 45, fa: -95 }),
      props: [FLOOR, ...SEAT, { k: 'pad', p: [[100, 74], [122, 96]], w: 7 }, { k: 'line', p: [[130, 104], [130, 157]] }, { k: 'handle', at: 'ha', front: true }],
      hl: ['arm'],
    },
  },

  // ───────────── LEGS ─────────────
  {
    id: 'leg-press', name: 'Leg Press', muscle: 'Legs', target: 'Quads, glutes',
    equip: 'Machine', type: 'reps', inc: 10,
    cues: ['Back flat on the pad, feet shoulder-width in the middle of the plate.', 'Lower until knees are about 90°.', 'Push through your heels — don\'t lock knees hard.', 'Keep your lower back on the pad.'],
    avoid: 'Lowering so deep your hips curl off the seat.',
    d: {
      A: { x: 66, y: 118, t: -150, hd: -130, ua: 60, fa: 20, th: -62, sh: 22, ft: -60 },
      B: { x: 66, y: 118, t: -150, hd: -130, ua: 60, fa: 20, th: -36, sh: -36, ft: -100 },
      props: [FLOOR, { k: 'pad', p: [[70, 126], [24, 100]], w: 7 }, { k: 'line', p: [[60, 128], [60, 157]] }, { k: 'line', p: [[100, 157], [190, 30]], w: 2 }, { k: 'sled', at: 'an', ang: 55, len: 30, off: -4, front: true }],
      hl: ['leg'],
    },
  },
  {
    id: 'goblet-squat', name: 'Goblet Squat', muscle: 'Legs', target: 'Quads, glutes, core',
    equip: 'Dumbbell', type: 'reps', inc: 2,
    cues: ['Hold a dumbbell vertically at your chest.', 'Feet shoulder-width, toes slightly out.', 'Sit down between your heels, chest up.', 'Stand up by driving through the whole foot.'],
    avoid: 'Heels lifting or knees caving in.',
    d: {
      A: s(ST, { ua: 100, fa: -70 }),
      B: { x: 76, y: 111, t: -62, hd: -75, ua: 120, fa: -40, th: 10, sh: 110, ft: -2 },
      props: [FLOOR, { k: 'db', at: 'ha', r: 6, front: true }], hl: ['leg'],
    },
  },
  {
    id: 'leg-extension', name: 'Leg Extension', muscle: 'Legs', target: 'Quads',
    equip: 'Machine', type: 'reps', inc: 5,
    cues: ['Knees line up with the machine\'s pivot point.', 'Roller pad on the front of your lower shins.', 'Straighten your legs, squeeze the quads for 1 second.', 'Lower slowly.'],
    avoid: 'Kicking the weight up with momentum.',
    d: {
      A: s(SS, { y: 106, t: -98, ua: 80, fa: 50, sh: 92 }),
      B: s(SS, { y: 106, t: -98, ua: 80, fa: 50, sh: -4 }),
      props: [FLOOR, { k: 'pad', p: [[66, 113], [118, 113]], w: 6 }, { k: 'line', p: [[88, 116], [88, 157]] }, { k: 'pad', p: [[72, 108], [66, 58]], w: 7 }, { k: 'roller', at: 'an', dx: 4, dy: -2, r: 5.5 }],
      hl: ['leg'],
    },
  },
  {
    id: 'seated-leg-curl', name: 'Seated Leg Curl', muscle: 'Legs', target: 'Hamstrings',
    equip: 'Machine', type: 'reps', inc: 5,
    cues: ['Knees line up with the pivot, thigh pad locked down.', 'Roller behind your lower calves.', 'Curl your heels down and back under the seat.', 'Return slowly.'],
    avoid: 'Lifting your hips off the seat.',
    d: {
      A: s(SS, { y: 106, t: -98, ua: 80, fa: 50, sh: -4 }),
      B: s(SS, { y: 106, t: -98, ua: 80, fa: 50, sh: 110 }),
      props: [FLOOR, { k: 'pad', p: [[66, 113], [118, 113]], w: 6 }, { k: 'line', p: [[88, 116], [88, 157]] }, { k: 'pad', p: [[72, 108], [66, 58]], w: 7 }, { k: 'pad', p: [[104, 100], [130, 100]], w: 6 }, { k: 'roller', at: 'an', dx: 0, dy: 6, r: 5.5 }],
      hl: ['leg'],
    },
  },
  {
    id: 'lying-leg-curl', name: 'Lying Leg Curl', muscle: 'Legs', target: 'Hamstrings',
    equip: 'Machine', type: 'reps', inc: 5,
    cues: ['Lie face down, knees just off the end of the pad.', 'Roller on the back of your ankles.', 'Curl heels toward your butt.', 'Lower slowly — keep hips down.'],
    avoid: 'Hips lifting off the pad.',
    d: {
      A: { x: 96, y: 108, t: 180, hd: 185, ua: 95, fa: 0, th: 0, sh: 0, ft: 90 },
      B: { x: 96, y: 108, t: 180, hd: 185, ua: 95, fa: 0, th: 2, sh: -118, ft: -30 },
      props: [FLOOR, { k: 'pad', p: [[40, 116], [125, 116]], w: 7 }, { k: 'line', p: [[60, 119], [60, 157]] }, { k: 'line', p: [[110, 119], [110, 157]] }, { k: 'roller', at: 'an', dx: 0, dy: -6, r: 5 }],
      hl: ['leg'],
    },
  },
  {
    id: 'db-rdl', name: 'Dumbbell Romanian Deadlift', muscle: 'Legs', target: 'Hamstrings, glutes, lower back',
    equip: 'Dumbbell', type: 'reps', inc: 2,
    cues: ['Stand tall, dumbbells in front of thighs, knees soft.', 'Push your hips BACK, keep back flat.', 'Lower until you feel a strong hamstring stretch (about knee height).', 'Drive hips forward to stand up.'],
    avoid: 'Rounding your back or turning it into a squat.',
    d: {
      A: s(ST, { ua: 92, fa: 92 }),
      B: { x: 87, y: 82, t: -18, hd: -25, ua: 90, fa: 90, th: 70, sh: 98, ft: -2 },
      props: [FLOOR, { k: 'db', at: 'ha', front: true }], hl: ['leg', 'torso'],
    },
  },
  {
    id: 'db-lunge', name: 'Dumbbell Lunge', muscle: 'Legs', target: 'Quads, glutes',
    equip: 'Dumbbell', type: 'reps', inc: 2, perSide: true,
    cues: ['Dumbbells at your sides, stand tall.', 'Step forward and lower until both knees are ~90°.', 'Front knee over the middle of the foot.', 'Push back up through the front heel.'],
    avoid: 'Front knee caving inward.',
    d: {
      A: s(ST, { th: 90, sh: 90, th2: 92, sh2: 90 }),
      B: { x: 96, y: 107, t: -90, ua: 90, fa: 90, th: 18, sh: 92, ft: 0, th2: 120, sh2: 168, ft2: 80 },
      props: [FLOOR, { k: 'db', at: 'ha', front: true }], hl: ['leg'],
    },
  },

  // ───────────── CARDIO ─────────────
  {
    id: 'treadmill-incline-walk', name: 'Treadmill Incline Walk', muscle: 'Cardio', target: 'Fat burning, heart health',
    equip: 'Cardio', type: 'cardio', inc: 0,
    cues: ['Incline 8–12%, speed 5–6 km/h (brisk walk).', 'Don\'t hold the handrails — swing your arms.', 'You should be breathing hard but able to talk.', 'Best done AFTER weights for fat loss.'],
    avoid: 'Hanging on the rails — it cuts the calories burned a lot.',
    d: {
      A: { x: 92, y: 82, t: -88, ua: 108, fa: 70, ua2: 72, fa2: 50, th: 68, sh: 100, ft: 0, th2: 110, sh2: 96 },
      B: { x: 92, y: 82, t: -88, ua: 72, fa: 50, ua2: 108, fa2: 70, th: 110, sh: 96, ft: 0, th2: 68, sh2: 100 },
      props: [{ k: 'line', p: [[30, 156], [170, 148]], w: 5 }, { k: 'line', p: [[165, 148], [178, 70], [150, 74]] }],
      hl: ['leg'],
    },
  },
  {
    id: 'treadmill-run', name: 'Treadmill Run / Jog', muscle: 'Cardio', target: 'Fat burning, endurance',
    equip: 'Cardio', type: 'cardio', inc: 0,
    cues: ['Easy pace: you can still speak in short sentences.', 'Short steps, land under your hips.', 'Relaxed shoulders, arms swing forward-back.'],
    avoid: 'Over-striding and landing hard on your heels.',
    d: {
      A: { x: 92, y: 80, t: -82, ua: 120, fa: 40, ua2: 60, fa2: -20, th: 50, sh: 110, ft: 0, th2: 130, sh2: 170 },
      B: { x: 92, y: 80, t: -82, ua: 60, fa: -20, ua2: 120, fa2: 40, th: 130, sh: 170, ft: 80, th2: 50, sh2: 110 },
      props: [{ k: 'line', p: [[30, 156], [170, 152]], w: 5 }, { k: 'line', p: [[165, 152], [178, 70], [150, 74]] }],
      hl: ['leg'],
    },
  },
];

// Fit4Less: dumbbells run 5–75 lb in 5 lb steps.
for (const e of LIBRARY) if (e.equip === 'Dumbbell') { e.unit = 'lb'; e.inc = 5; }

export const LIB = Object.fromEntries(LIBRARY.map((e) => [e.id, e]));
