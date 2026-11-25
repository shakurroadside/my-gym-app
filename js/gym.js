// Your gym: Fit4Less Edmonton North City Centre — what's confirmed from your photos.
const STACK = 'Weight stack is in lb. Use the small 5 lb add-on weight beside the stack to go up by 5 instead of 10.';

export const GYM_NAME = 'Fit4Less · Edmonton North';

// exId → where to do it + gym-specific tip. Units/jumps default from here unless you change them.
const LNL = 'Inspiration machine with Lock N Load: flip the plate you want to ON, all others OFF.';
export const GYM = {
  'machine-shoulder-press': { where: 'Nautilus Inspiration Shoulder Press', unit: 'lb', inc: 10, tip: 'Red bar at the seat base: handles start at shoulder level. Two grip options — pick the comfortable one. ' + LNL },
  'machine-triceps-ext': { where: 'Nautilus Inspiration Triceps Extension', unit: 'lb', inc: 10, tip: LNL },
  'triceps-press': { where: 'Nautilus Inspiration Triceps Press', unit: 'lb', inc: 10, tip: LNL },
  'smith-squat': { where: 'Smith machine (by the half racks)', unit: 'lb', inc: 10, tip: 'Log only the plates you add. Twist the bar to hook/unhook.' },
  'smith-incline': { where: 'Smith machine + adjustable bench', unit: 'lb', inc: 10, tip: 'Log only the plates you add. Good for pressing safely without a spotter.' },
  'bb-curl': { where: 'Fixed straight-bar rack', unit: 'lb', inc: 10, tip: 'Weight printed on the bar ends. Go up one bar when the app says so.' },
  'machine-back-extension': { where: 'Nautilus Inspiration Back Extension', unit: 'lb', inc: 10, tip: 'Start light — this is a small muscle group. ' + LNL },
  'seated-leg-press': { where: 'Nautilus Inspiration Leg Press (weight stack)', unit: 'lb', inc: 10, tip: 'Easier to load than the plate machine — great for learning. ' + LNL },
  'machine-chest-press': { where: 'Nautilus Inspiration Chest Press', unit: 'lb', inc: 10, tip: 'Red bar at the seat base sets height — upper arms level with the floor when holding the handles. Red knobs on the arms set the start stretch. ' + LNL },
  'machine-row': { where: 'Nautilus Inspiration Row', unit: 'lb', inc: 10, tip: 'Seat height: chest pad at mid-chest. Red knob moves the pad for the start stretch. Pull until the grips are level with your torso. ' + LNL },
  'preacher-curl-machine': { where: 'Nautilus Inspiration Bilateral Arm Curl', unit: 'lb', inc: 10, tip: 'Set the seat so your upper arms lie flat on the pad and elbows line up with the red pivot dot. ' + LNL },
  'machine-lateral-raise': { where: 'Nautilus Inspiration Deltoid Raise', unit: 'lb', inc: 10, tip: 'Shoulders in line with the red pivot dot. ' + LNL },
  'seated-leg-curl': { where: 'Nautilus Inspiration Leg Curl (seated)', unit: 'lb', inc: 10, tip: 'Knees in line with the red pivot dot, thigh pad snug. ' + LNL },
  'ab-crunch-machine': { where: 'Nautilus Inspiration Ab Crunch', unit: 'lb', inc: 10, tip: 'Set the seat so the axis lines up with your belly button. Hands on the upper handles, elbows forward. ' + LNL },
  'assisted-pullup': { where: 'Nautilus Impact Chin / Dip Assist', unit: 'lb', inc: 10, tip: 'More stack weight = more help. Upper handles for pull-ups; kneel on the pad.' },
  'assisted-dip': { where: 'Nautilus Impact Chin / Dip Assist', unit: 'lb', inc: 10, tip: 'Lower angled handles for dips. Lower the assistance as you get stronger.' },
  'glute-drive': { where: 'Nautilus Glute Drive (plate-loaded)', unit: 'lb', inc: 10, tip: 'Plates go on the side pegs: 45, 35, 25 lb. Add 5 lb per side = 10 lb jump.' },
  'lat-pulldown': { where: 'Nautilus Multi Station — Lat Pulldown', unit: 'lb', inc: 10, tip: 'Lock your thighs under the pad (red pop-pin adjusts it). ' + STACK },
  'seated-cable-row': { where: 'Nautilus Multi Station — Low Row', unit: 'lb', inc: 10, tip: 'Feet on the foot plates. ' + STACK },
  'cable-crunch': { where: 'Multi Station Cable Station (or Inspiration cable tower)', unit: 'lb', inc: 10, tip: 'The Cable Station label shows this exact move (ab crunch). Use the rope. ' + STACK },
  'cable-curl': { where: 'Multi Station Cable Station', unit: 'lb', inc: 10, tip: 'Pulley at the bottom. ' + STACK },
  'cable-pushdown': { where: 'Inspiration cable tower (pulley at top)', unit: 'lb', inc: 10, tip: 'Slide the pulley carriage to the top hole. ' + STACK },
  'face-pull': { where: 'Inspiration cable tower (pulley at face height)', unit: 'lb', inc: 10, tip: 'Pull the pin and slide the pulley to face height; use the rope. ' + STACK },
  'pallof-press': { where: 'Inspiration cable tower (pulley at chest height)', unit: 'lb', inc: 10, tip: 'Move the pulley to chest height and stand sideways. ' + STACK },
  'straight-arm-pulldown': { where: 'Inspiration cable tower (pulley at top)', unit: 'lb', inc: 10, tip: STACK },
  'cable-fly': { where: 'Inspiration cable tower (both pulleys high)', unit: 'lb', inc: 10, tip: 'Set both pulleys to the same high hole. ' + STACK },
  'cable-lateral-raise': { where: 'Inspiration cable tower (pulley at bottom)', unit: 'lb', inc: 10, tip: STACK },
  'leg-press': { where: 'Nautilus Angled Leg Press (plate-loaded)', unit: 'lb', inc: 20, tip: 'The empty sled already counts as 100 lb of resistance — log only the plates you add. Twist both red handles to release the safety stops; lock them again before getting out.' },
  'leg-extension': { where: 'Nautilus Inspiration Leg Extension', unit: 'lb', inc: 10, tip: 'Red handle behind the back pad lines your knees up with the pivot. Handle beside the seat moves the roller to just above your ankles.' },
  'lying-leg-curl': { where: 'Nautilus Impact Leg Curl (lying)', unit: 'lb', inc: 10, tip: 'Knees in line with the pivot point. Red knob moves the roller to just above your heels. Hold the handles.' },
  'hack-squat': { where: 'Nautilus Hack Squat (plate-loaded)', unit: 'lb', inc: 20, tip: 'Empty sled counts as about 80 lb. Add plates in pairs (10 lb each side = 20 lb jump).' },
  'belt-squat': { where: 'Nautilus Belt Squat (plate-loaded)', unit: 'lb', inc: 20, tip: 'Clip the belt chain to the arm; load plates in pairs.' },
  'bb-squat': { where: 'Half rack on the lifting platform', unit: 'lb', inc: 10, tip: 'Always set the safety arms. Bar = 45 lb.' },
  'pull-up': { where: 'Pull-up bar on top of the half rack', tip: '' },
  'trap-bar-deadlift': { where: 'Hex/trap bar (bar rack by the functional area)', unit: 'lb', inc: 10, tip: 'Bar weight is usually 45 lb — check the sticker on it.' },
  'standing-calf': { where: 'Nautilus Impact Standing Calf', unit: 'lb', inc: 10, tip: '' },
  'seated-calf': { where: 'Nautilus Tilt Seat Calf (plate-loaded)', unit: 'lb', inc: 10, tip: 'Empty machine counts as 35 lb. Red handle releases the safety stop.' },
  'bb-bench': { where: 'Olympic flat bench', unit: 'lb', inc: 10, tip: 'Bar = 45 lb. Plates: 45, 35, 25 (+ smaller on the trees). No safety bars — keep 2 reps in reserve or ask for a spot.' },
  'bb-incline': { where: 'Olympic incline bench', unit: 'lb', inc: 10, tip: 'Bar = 45 lb. Adjust the seat so the bar sits above your face.' },
  'ez-curl': { where: 'Fixed EZ-bar rack (next to the dumbbells)', unit: 'lb', inc: 10, tip: 'Weight is printed on each bar end. Go up one bar when the app says so.' },
};
for (const id of ['db-bench-press', 'incline-db-press', 'db-row', 'db-shoulder-press', 'lateral-raise', 'overhead-triceps', 'db-curl', 'hammer-curl', 'goblet-squat', 'db-rdl', 'db-lunge']) {
  GYM[id] = { where: 'Dumbbell rack (5–75 lb) + adjustable bench', unit: 'lb', inc: 5, tip: 'Dumbbells go up in 5 lb steps.' };
}
for (const id of ['treadmill-incline-walk', 'treadmill-run']) GYM[id] = { where: 'Cardio area treadmills', tip: '' };
for (const id of ['plank', 'side-plank', 'dead-bug', 'lying-leg-raise', 'reverse-crunch', 'mountain-climber', 'push-up']) GYM[id] = { where: 'Stretching / floor area (grab a mat)', tip: '' };
