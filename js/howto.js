// Precise setup / stance for every exercise + which muscles work.
// p = main muscles, s = helper muscles (keys from bodymap.js)

export const HOWTO = {
  plank: { p: ['abs'], s: ['obliques', 'fdelt', 'glutes', 'quads'], setup: [
    'Forearms on the floor, elbows directly under your shoulders, hands in loose fists.',
    'Legs straight back, feet hip-width, up on your toes.',
    'Head in line with your spine — look at the floor just in front of your hands.',
    'Tuck your tailbone slightly under so your lower back is flat, not arched.',
  ] },
  'side-plank': { p: ['obliques'], s: ['abs', 'sdelt', 'glutes'], setup: [
    'Lie on your side, elbow directly under your shoulder, forearm pointing forward.',
    'Stack your feet (or put the top foot in front for balance).',
    'Shoulder, hip and ankle in one straight line — don\'t bend forward at the hips.',
    'Free hand on your hip.',
  ] },
  'dead-bug': { p: ['abs'], s: ['obliques', 'hipflex'], setup: [
    'Lie on your back, arms straight up above your shoulders.',
    'Lift your legs: knees bent 90°, knees right above hips, shins parallel to the floor.',
    'Press your lower back into the floor — no gap under it.',
    'Chin slightly tucked, head stays down.',
  ] },
  'ab-crunch-machine': { p: ['abs'], s: ['obliques'], setup: [
    'Adjust the seat so the pads/handles sit at your upper chest.',
    'Hook your feet under the rollers (or flat on the footrest).',
    'Sit tall, hips all the way back in the seat.',
    'Hold the handles lightly — they only keep you in position.',
  ] },
  'cable-crunch': { p: ['abs'], s: ['obliques'], setup: [
    'Rope attachment on the HIGH pulley.',
    'Kneel 1–2 steps away from the machine, facing it, knees hip-width.',
    'Hold the rope ends next to your ears / forehead.',
    'Hips stacked over your knees — they stay there the whole set.',
  ] },
  'hanging-knee-raise': { p: ['abs'], s: ['hipflex', 'obliques'], setup: [
    'Step up and put your back flat against the back pad.',
    'Forearms flat on the arm pads, grip the handles.',
    'Push your shoulders down away from your ears (no shrugging).',
    'Let the legs hang straight and still before each rep.',
  ] },
  'lying-leg-raise': { p: ['abs'], s: ['hipflex'], setup: [
    'Lie flat on a mat or flat bench.',
    'Hands flat under your lower back / glutes for support.',
    'Legs straight and together (a small knee bend is fine).',
    'Press your lower back down before every rep.',
  ] },
  'reverse-crunch': { p: ['abs'], s: ['hipflex'], setup: [
    'Lie on your back, arms flat by your sides, palms down.',
    'Lift your legs so knees are bent ~90° above your hips.',
    'Press your lower back into the floor.',
  ] },
  'pallof-press': { p: ['obliques'], s: ['abs'], setup: [
    'Set the cable handle at chest height.',
    'Stand SIDEWAYS to the machine, one big step away so the cable is tight.',
    'Feet shoulder-width, knees soft, hips and chest facing straight ahead.',
    'Hold the handle with both hands at the middle of your chest.',
  ] },
  'ab-wheel': { p: ['abs'], s: ['lats', 'obliques'], setup: [
    'Kneel on a mat, knees hip-width.',
    'Hands on the wheel, directly under your shoulders.',
    'Squeeze your glutes and tuck your pelvis — slight round in the upper back.',
  ] },
  'back-extension': { p: ['lowback'], s: ['glutes', 'hams'], setup: [
    'Set the pad so its top edge is just BELOW your hip bones (you must be able to bend).',
    'Heels locked under the ankle rollers.',
    'Start straight, arms crossed on your chest.',
  ] },
  'mountain-climber': { p: ['abs'], s: ['hipflex', 'fdelt', 'quads'], setup: [
    'Push-up position: hands under shoulders, arms straight.',
    'Body straight from head to heels, abs tight.',
    'Shoulders over your hands.',
  ] },
  'machine-chest-press': { p: ['chest'], s: ['fdelt', 'triceps'], setup: [
    'Seat height: handles level with the middle of your chest (nipple line).',
    'Back and head against the pad.',
    'Feet flat on the floor, about hip-width.',
    'Squeeze your shoulder blades together and down — keep them there.',
    'Wrists straight, not bent back.',
  ] },
  'db-bench-press': { p: ['chest'], s: ['fdelt', 'triceps'], setup: [
    'Sit on the end of the bench, dumbbells standing on your thighs.',
    'Lie back and use your knees to help bring them to your chest.',
    'Feet flat on the floor, a bit wider than hips.',
    'Shoulder blades squeezed together, small natural arch in the lower back.',
    'Dumbbells start beside your chest, forearms vertical.',
  ] },
  'incline-db-press': { p: ['chest'], s: ['fdelt', 'triceps'], setup: [
    'Bench at 30–45° (usually the 2nd or 3rd notch).',
    'Sit back with dumbbells on your thighs, kick them up as you lie back.',
    'Feet flat, back and head on the bench.',
    'Shoulder blades pinched, chest up.',
  ] },
  'pec-deck': { p: ['chest'], s: ['fdelt'], setup: [
    'Seat height: handles level with your chest.',
    'Back flat on the pad, feet flat on the floor.',
    'Grip the handles with a slight bend in the elbows.',
    'Chest up, shoulders down and back.',
  ] },
  'cable-fly': { p: ['chest'], s: ['fdelt'], setup: [
    'Both pulleys set HIGH (above your head).',
    'Handle in each hand, take one step forward between the towers.',
    'Staggered stance (one foot forward), small forward lean.',
    'Arms out wide, slight bend in the elbows, chest up.',
  ] },
  'push-up': { p: ['chest'], s: ['triceps', 'fdelt', 'abs'], setup: [
    'Hands on the floor slightly wider than shoulders, fingers forward.',
    'Legs straight back, feet together or hip-width.',
    'Squeeze glutes and abs — one straight plank from head to heels.',
    'Elbows point back at about 45°, not straight out.',
  ] },
  'lat-pulldown': { p: ['lats'], s: ['biceps', 'midback', 'rdelt'], setup: [
    'Adjust the thigh pad so your legs are locked in snugly.',
    'Grip the bar a bit wider than shoulders, palms facing away.',
    'Sit down with arms straight overhead.',
    'Lean back slightly (10–15°), chest lifted toward the bar.',
  ] },
  'seated-cable-row': { p: ['midback'], s: ['lats', 'biceps', 'rdelt'], setup: [
    'Sit on the bench, feet on the foot plates, knees slightly bent.',
    'Grab the handle and sit up tall — back straight, chest up.',
    'Shoulders relaxed and down, arms straight.',
  ] },
  'machine-row': { p: ['midback'], s: ['lats', 'biceps', 'rdelt'], setup: [
    'Seat height: handles line up with your lower chest.',
    'Chest pressed firmly against the chest pad.',
    'Feet flat, arms straight forward.',
  ] },
  'db-row': { p: ['lats'], s: ['midback', 'biceps', 'rdelt'], setup: [
    'For the RIGHT arm: left knee and left hand on a flat bench.',
    'Right foot on the floor, out to the side for balance.',
    'Back flat like a table, parallel to the floor.',
    'Dumbbell hanging straight down under your shoulder.',
  ] },
  'assisted-pullup': { p: ['lats'], s: ['biceps', 'midback'], setup: [
    'Pick the assistance weight — MORE weight = MORE help.',
    'Step up and kneel (or stand) on the pad.',
    'Grip the handles wide, palms facing away.',
    'Hang with arms straight, shoulders pulled down.',
  ] },
  'straight-arm-pulldown': { p: ['lats'], s: ['triceps', 'abs'], setup: [
    'Bar or rope on the HIGH pulley.',
    'Step back 1–2 steps, feet hip-width.',
    'Hinge forward at the hips about 20°, knees soft.',
    'Arms straight out in front, hands at head height.',
  ] },
  'machine-shoulder-press': { p: ['fdelt'], s: ['sdelt', 'triceps'], setup: [
    'Seat height: handles start at shoulder height.',
    'Back flat against the pad, feet flat.',
    'Wrists straight, stacked above your elbows.',
  ] },
  'db-shoulder-press': { p: ['fdelt'], s: ['sdelt', 'triceps'], setup: [
    'Bench upright (straight up, or one notch back).',
    'Kick the dumbbells up to shoulder height.',
    'Back against the pad, feet flat.',
    'Palms face forward, elbows slightly in front of your body.',
  ] },
  'lateral-raise': { p: ['sdelt'], s: ['traps'], setup: [
    'Stand tall, feet hip-width, knees soft.',
    'Dumbbells at your sides, palms facing in.',
    'Lean forward very slightly from the hips.',
    'Small bend in the elbows — keep it fixed.',
  ] },
  'cable-lateral-raise': { p: ['sdelt'], s: [], setup: [
    'Handle on the LOWEST pulley.',
    'Stand sideways; hold the handle with the hand farther from the machine.',
    'Hold the machine with your free hand for balance.',
  ] },
  'face-pull': { p: ['rdelt'], s: ['midback', 'traps'], setup: [
    'Rope on the pulley at face height or a bit higher.',
    'Grab the rope with thumbs pointing toward you.',
    'Step back until arms are straight, feet hip-width.',
  ] },
  'reverse-pec-deck': { p: ['rdelt'], s: ['midback'], setup: [
    'Sit FACING the machine, chest against the pad.',
    'Set the handles to the most forward position.',
    'Grip with arms straight in front, at shoulder height.',
  ] },
  'cable-pushdown': { p: ['triceps'], s: [], setup: [
    'Bar or rope on the HIGH pulley.',
    'Stand close to the machine, feet hip-width.',
    'Lean forward slightly, elbows tucked tight to your sides.',
    'Forearms start at about chest height.',
  ] },
  'overhead-triceps': { p: ['triceps'], s: [], setup: [
    'Sit on an upright bench, back supported.',
    'Hold ONE dumbbell by the top plate with both hands.',
    'Press it overhead, arms straight, elbows close to your ears.',
  ] },
  'db-curl': { p: ['biceps'], s: ['forearm'], setup: [
    'Stand tall, feet hip-width, knees soft.',
    'Dumbbells at your sides, palms facing forward.',
    'Elbows pinned against your sides, shoulders back.',
  ] },
  'hammer-curl': { p: ['biceps'], s: ['forearm'], setup: [
    'Stand tall, feet hip-width.',
    'Dumbbells at your sides, palms facing your legs.',
    'Elbows pinned against your sides.',
  ] },
  'cable-curl': { p: ['biceps'], s: ['forearm'], setup: [
    'Bar or rope on the LOWEST pulley.',
    'Stand close, feet hip-width, palms facing up.',
    'Elbows pinned to your sides, arms straight.',
  ] },
  'preacher-curl-machine': { p: ['biceps'], s: [], setup: [
    'Seat height: armpits rest on the top edge of the pad.',
    'Backs of your upper arms flat on the pad.',
    'Grip the handles palms up.',
  ] },
  'leg-press': { p: ['quads'], s: ['glutes', 'hams'], setup: [
    'Sit back: lower back and head flat on the pad.',
    'Feet in the middle of the platform, shoulder-width, toes slightly out.',
    'Push the platform up, then release the safety handles.',
    'Knees track in line with your toes the whole time.',
  ] },
  'goblet-squat': { p: ['quads'], s: ['glutes', 'abs'], setup: [
    'Hold one dumbbell vertically against your chest, hands cupping the top.',
    'Feet slightly wider than shoulders, toes turned out 15–30°.',
    'Chest up, eyes forward.',
    'Weight spread over the whole foot — big toe, little toe, heel.',
  ] },
  'leg-extension': { p: ['quads'], s: [], setup: [
    'Move the back pad so your knees line up with the machine\'s pivot (often a coloured dot).',
    'Set the roller on your lower shins, just above the ankles.',
    'Sit back and grip the side handles.',
  ] },
  'seated-leg-curl': { p: ['hams'], s: ['calves'], setup: [
    'Move the back pad so your knees line up with the pivot.',
    'Roller just above your heels (back of the ankles).',
    'Lower the thigh pad until it locks your legs down snugly.',
    'Grip the handles and sit tall.',
  ] },
  'lying-leg-curl': { p: ['hams'], s: ['calves'], setup: [
    'Lie face down with knees just past the end of the pad.',
    'Roller on the back of your ankles, above the heels.',
    'Hold the handles, hips pressed into the pad.',
  ] },
  'db-rdl': { p: ['hams'], s: ['glutes', 'lowback'], setup: [
    'Feet hip-width, toes forward.',
    'Dumbbells in front of your thighs, palms facing you.',
    'Soft knees (slight bend) — keep that same bend the whole time.',
    'Shoulders back, chest proud, back flat.',
  ] },
  'db-lunge': { p: ['quads'], s: ['glutes', 'hams'], setup: [
    'Stand tall, dumbbells at your sides, feet hip-width.',
    'Take a big step — long enough that both knees can bend to 90°.',
    'Keep your torso upright.',
  ] },
  'treadmill-incline-walk': { p: ['glutes', 'calves'], s: ['hams', 'quads'], setup: [
    'Incline 8–12%, speed 5–6 km/h.',
    'Stand tall and look forward, not down at your feet.',
    'Let your arms swing — hands off the rails.',
  ] },
  'treadmill-run': { p: ['quads', 'calves'], s: ['glutes', 'hams'], setup: [
    'Start walking, then raise speed to an easy jog.',
    'Stand tall with a slight forward lean from the ankles.',
  ] },
  'glute-drive': { p: ['glutes'], s: ['hams', 'quads'], setup: [
    'Load plates on the side pegs (start with just one 25 lb plate per side).',
    'Sit on the seat with your upper back against the back pad, shoulder blades on its edge.',
    'Swing the hip pad over and settle it across your hip bones (not your stomach).',
    'Feet flat on the platform, hip-width, shins vertical at the top position.',
    'Release the safety/start lever before your first rep.',
  ] },
  'bb-bench': { p: ['chest'], s: ['fdelt', 'triceps'], setup: [
    'Empty Olympic bar = 45 lb. Start with just the bar or small plates.',
    'Lie down with your eyes directly under the bar.',
    'Grip a little wider than shoulders, wrists straight over elbows.',
    'Feet flat, shoulder blades squeezed together and down, small arch in lower back.',
  ] },
  'bb-incline': { p: ['chest'], s: ['fdelt', 'triceps'], setup: [
    'Empty Olympic bar = 45 lb.',
    'Adjust the seat so the bar is right above your face when you sit back.',
    'Grip slightly wider than shoulders.',
    'Feet flat, shoulder blades back and down.',
  ] },
  'ez-curl': { p: ['biceps'], s: ['forearm'], setup: [
    'Pick a fixed EZ bar from the rack — the weight is printed on the end (lb).',
    'Stand tall, feet hip-width, knees soft.',
    'Grip the inner bends of the bar, palms facing up/in.',
  ] },
  'hack-squat': { p: ['quads'], s: ['glutes', 'hams'], setup: [
    'Empty sled = about 80 lb of resistance. Log only the plates you add.',
    'Back flat on the pad, shoulders under the shoulder pads.',
    'Feet shoulder-width in the middle of the plate, toes slightly out.',
    'Hold the side handles and release the safety lever.',
  ] },
  'belt-squat': { p: ['quads', 'glutes'], s: ['hams'], setup: [
    'Load plates on the pegs; clip the belt chain to the lever arm.',
    'Fasten the belt around your hips (below your belly button).',
    'Stand on the platform, feet a little wider than shoulders.',
    'Stand up to take the weight, then release the start handle.',
  ] },
  'bb-squat': { p: ['quads', 'glutes'], s: ['abs', 'lowback', 'hams'], setup: [
    'Set the J-hooks at mid-chest height and the safety arms just below your lowest squat.',
    'Empty Olympic bar = 45 lb. Start with just the bar to learn the movement.',
    'Duck under, bar across your upper back, grip just outside shoulders.',
    'Step back 2 small steps, feet shoulder-width, toes slightly out.',
  ] },
  'trap-bar-deadlift': { p: ['glutes', 'hams'], s: ['quads', 'lowback', 'traps', 'forearm'], setup: [
    'The hex bar is in the bar rack by the functional area. Load plates on both ends.',
    'Step inside, feet hip-width, handles in line with your ankle bones.',
    'Push hips back, bend knees, grab the handles at their middle.',
    'Chest up, back flat, arms straight — then push the floor away.',
  ] },
  'pull-up': { p: ['lats'], s: ['biceps', 'midback', 'abs'], setup: [
    'Use the bar on top of the half rack (step on a box if you can\'t reach).',
    'Grip a little wider than shoulders, palms facing away.',
    'Hang with straight arms, shoulders pulled down from your ears.',
  ] },
  'standing-calf': { p: ['calves'], s: [], setup: [
    'Adjust the shoulder pads so you must bend your knees slightly to get under them.',
    'Balls of your feet on the platform edge, heels hanging off.',
    'Stand up to lift the weight, knees soft.',
  ] },
  'seated-calf': { p: ['calves'], s: [], setup: [
    'Empty machine = about 35 lb. Load plates on the peg.',
    'Sit, balls of your feet on the foot bar.',
    'Adjust the knee pad so it presses snugly on your lower thighs.',
  ] },
};

export function breathing(ex) {
  if (ex.type === 'time') return 'Breathe slowly and steadily through the whole hold — never hold your breath.';
  if (ex.type === 'cardio') return 'Steady breathing. You should be able to talk in short sentences.';
  return 'Breathe OUT on the hard part (lifting / squeezing), breathe IN on the way back.';
}

export function tempo(ex) {
  if (ex.type === 'time' || ex.type === 'cardio') return '';
  return 'Lift in about 1 second · pause · lower slowly in 2–3 seconds. No bouncing.';
}
