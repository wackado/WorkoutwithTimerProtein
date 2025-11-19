// Strong Women Workout Builder JavaScript
let selectedWeek = 1,
  selectedDay = "monday",
  selectedDuration = "standard",
  selectedLocation = "home",
  trainingWeek = 1,
  progressionLevel = 1;
let userEquipment = { home: {}, gym: {} };
let workoutSelections = {},
  completedExercises = {},
  openPhases = new Set();
let customRounds = {};
let completedRounds = {};
let userAge = null;
let maxHR = null;

// Load saved age and maxHR on page load
if (sessionStorage.getItem("userAge")) {
  userAge = parseInt(sessionStorage.getItem("userAge"));
  maxHR = parseInt(sessionStorage.getItem("maxHR"));
}

// Calculate Max Heart Rate - MUST be at top level and global
window.calculateMaxHR = function () {
  const ageInput = document.getElementById("ageInput");
  if (!ageInput) {
    console.error("Age input not found");
    return;
  }

  const age = parseInt(ageInput.value);

  if (!age || age < 18 || age > 100) {
    alert("Please enter a valid age between 18 and 100");
    return;
  }

  userAge = age;
  maxHR = 220 - age;

  sessionStorage.setItem("userAge", userAge);
  sessionStorage.setItem("maxHR", maxHR);

  updateApp();
};

// Global event delegation for dynamic buttons - capture phase for best coverage
document.addEventListener(
  "click",
  (e) => {
    // Heart rate calculator button - use data attribute instead of onclick
    const calcBtn = e.target.closest("[data-action='calculate-hr']");
    if (calcBtn) {
      e.preventDefault();
      e.stopPropagation();
      window.calculateMaxHR();
      return;
    }

    // Generate Workout button
    const genBtn = e.target.closest("#generateWorkoutBtn");
    if (genBtn) {
      e.preventDefault();
      e.stopPropagation();
      generateWorkoutSummary();
      return;
    }

    // Edit Workout button
    const editBtn = e.target.closest("#editWorkoutBtn");
    if (editBtn) {
      e.preventDefault();
      e.stopPropagation();
      editWorkout();
      return;
    }

    // Timer Start button
    const timerStartBtn = e.target.closest("#timerStartBtn");
    if (timerStartBtn) {
      e.preventDefault();
      e.stopPropagation();
      startTimer();
      return;
    }

    // Exercise timer start button
    const exerciseStartBtn = e.target.closest(".timer-start-btn");
    if (exerciseStartBtn) {
      e.preventDefault();
      e.stopPropagation();
      const exerciseName = exerciseStartBtn.dataset.exercise;
      selectExerciseForTimer(exerciseName, 1);
      return;
    }

    // Exercise timer pause button
    const exercisePauseBtn = e.target.closest(".timer-pause-btn");
    if (exercisePauseBtn) {
      e.preventDefault();
      e.stopPropagation();
      pauseExerciseTimer(exercisePauseBtn.dataset.exercise);
      return;
    }

    // Exercise timer reset button
    const exerciseResetBtn = e.target.closest(".timer-reset-btn");
    if (exerciseResetBtn) {
      e.preventDefault();
      e.stopPropagation();
      resetExerciseTimer(exerciseResetBtn.dataset.exercise);
      return;
    }

    // Timer Pause button
    const timerPauseBtn = e.target.closest("#timerPauseBtn");
    if (timerPauseBtn) {
      e.preventDefault();
      e.stopPropagation();
      pauseTimer();
      return;
    }

    // Timer Reset button
    const timerResetBtn = e.target.closest("#timerResetBtn");
    if (timerResetBtn) {
      e.preventDefault();
      e.stopPropagation();
      resetTimer();
      return;
    }
  },
  true
);

const weeklyFrameworks = {
  1: {
    monday: {
      type: "Jump + Resistance",
      duration: { standard: 40, quick: 30, extended: 50 },
      phases: ["activation", "jump", "strength", "cooldown"],
    },
    tuesday: {
      type: "SIT Session",
      duration: { standard: 20, quick: 15, extended: 25 },
      phases: ["activation", "sit", "cooldown"],
    },
    wednesday: {
      type: "Rest or Mobility",
      duration: { standard: 20, quick: 10, extended: 30 },
      phases: ["mobility", "cooldown"],
    },
    thursday: {
      type: "Jump + Resistance",
      duration: { standard: 40, quick: 30, extended: 50 },
      phases: ["activation", "jump", "strength", "cooldown"],
    },
    friday: {
      type: "Rest or Mobility",
      duration: { standard: 20, quick: 10, extended: 30 },
      phases: ["mobility", "cooldown"],
    },
    saturday: {
      type: "Resistance Training",
      duration: { standard: 35, quick: 25, extended: 45 },
      phases: ["activation", "strength", "cooldown"],
    },
    sunday: {
      type: "SIT Session",
      duration: { standard: 25, quick: 15, extended: 35 },
      phases: ["activation", "sit", "cooldown"],
    },
  },
  2: {
    monday: {
      type: "Jump + Resistance",
      duration: { standard: 45, quick: 35, extended: 50 },
      phases: ["activation", "jump", "strength", "cooldown"],
    },
    tuesday: {
      type: "SIT Session",
      duration: { standard: 30, quick: 20, extended: 40 },
      phases: ["activation", "sit", "cooldown"],
    },
    wednesday: {
      type: "Rest or Mobility/Core",
      duration: { standard: 25, quick: 15, extended: 35 },
      phases: ["mobility", "cooldown"],
    },
    thursday: {
      type: "Jump + Resistance",
      duration: { standard: 45, quick: 35, extended: 50 },
      phases: ["activation", "jump", "strength", "cooldown"],
    },
    friday: {
      type: "Rest or Mobility/Core",
      duration: { standard: 25, quick: 15, extended: 35 },
      phases: ["mobility", "cooldown"],
    },
    saturday: {
      type: "Jump + Resistance",
      duration: { standard: 45, quick: 35, extended: 50 },
      phases: ["activation", "jump", "strength", "cooldown"],
    },
    sunday: {
      type: "SIT Session",
      duration: { standard: 25, quick: 18, extended: 30 },
      phases: ["activation", "sit", "cooldown"],
    },
  },
  3: {
    monday: {
      type: "Jump + Heavy Resistance",
      duration: { standard: 50, quick: 40, extended: 60 },
      phases: ["activation", "jump", "strength", "cooldown"],
    },
    tuesday: {
      type: "SIT Session",
      duration: { standard: 30, quick: 20, extended: 35 },
      phases: ["activation", "sit", "cooldown"],
    },
    wednesday: {
      type: "Rest or Mobility/Core",
      duration: { standard: 30, quick: 20, extended: 40 },
      phases: ["mobility", "cooldown"],
    },
    thursday: {
      type: "Jump + Heavy Resistance",
      duration: { standard: 50, quick: 40, extended: 60 },
      phases: ["activation", "jump", "strength", "cooldown"],
    },
    friday: {
      type: "Rest or Mobility/Core",
      duration: { standard: 30, quick: 20, extended: 40 },
      phases: ["mobility", "cooldown"],
    },
    saturday: {
      type: "Power + Integration",
      duration: { standard: 45, quick: 35, extended: 55 },
      phases: ["activation", "power", "integration", "cooldown"],
    },
    sunday: {
      type: "SIT Session",
      duration: { standard: 30, quick: 20, extended: 35 },
      phases: ["activation", "sit", "cooldown"],
    },
  },
  4: {
    monday: {
      type: "Deload - Recovery Movement",
      duration: { standard: 20, quick: 15, extended: 25 },
      phases: ["activation", "deload", "cooldown"],
    },
    tuesday: {
      type: "Deload - Recovery Movement",
      duration: { standard: 20, quick: 15, extended: 25 },
      phases: ["activation", "deload", "cooldown"],
    },
    wednesday: {
      type: "Deload - Rest or Light Mobility",
      duration: { standard: 15, quick: 10, extended: 20 },
      phases: ["deload", "cooldown"],
    },
    thursday: {
      type: "Deload - Recovery Movement",
      duration: { standard: 20, quick: 15, extended: 25 },
      phases: ["activation", "deload", "cooldown"],
    },
    friday: {
      type: "Deload - Rest or Stretching",
      duration: { standard: 15, quick: 10, extended: 20 },
      phases: ["deload", "cooldown"],
    },
    saturday: {
      type: "Deload - Recovery Movement",
      duration: { standard: 20, quick: 15, extended: 25 },
      phases: ["activation", "deload", "cooldown"],
    },
    sunday: {
      type: "Deload - Complete Rest or Yoga",
      duration: { standard: 15, quick: 10, extended: 20 },
      phases: ["cooldown"],
    },
  },
};

const equipmentDatabase = {
  home: [
    { id: "dumbbells-5", name: "Dumbbells (5 lbs)", essential: true },
    { id: "dumbbells-10", name: "Dumbbells (10 lbs)", essential: true },
    { id: "dumbbells-15", name: "Dumbbells (15 lbs)", essential: true },
    { id: "dumbbells-25", name: "Dumbbells (25+ lbs)", essential: true },
    { id: "chair", name: "Sturdy Chair", essential: true },
    { id: "resistance-bands", name: "Resistance Bands", essential: false },
    { id: "yoga-mat", name: "Yoga Mat", essential: false },
  ],
  gym: [
    { id: "gym-dumbbells", name: "Full Dumbbell Range", essential: true },
    { id: "gym-barbell", name: "Barbell", essential: true },
    { id: "gym-bench", name: "Bench", essential: true },
    { id: "gym-cable", name: "Cable Machine", essential: true },
  ],
};

const phaseExplanations = {
  activation:
    "Activation prepares your nervous system, increases blood flow to muscles, lubricates joints, and raises core temperature. This 'wake-up' process reduces injury risk and improves performance - especially critical for peri/postmenopausal women with reduced joint lubrication and slower neuromuscular response.",
  jump: "Jump training provides the high-impact bone loading stimulus necessary to maintain and build bone density - your body needs impact forces 4-5x bodyweight to trigger bone formation. Plyometrics also preserve power, improve balance, and reduce fall risk by training rapid force production and reactive strength.",
  power:
    "Power training preserves fast-twitch muscle fibers that decline rapidly during menopause. These explosive movements improve your ability to react quickly (fall prevention), maintain bone density, and perform daily activities with confidence and strength.",
  sit: "SIT (Sprint Interval Training) sessions should be SHORT and INTENSE. Mix different exercises to keep it interesting while maintaining maximum effort. Target 80-100% of your maximum heart rate during work intervals!",
};

const phaseInstructions = {
  activation:
    "Select exercises below to fill your activation time. The app will calculate rounds to reach your target duration.",
  jump: "Choose explosive exercises to fill your jump training time. Focus on power and soft landings.",
  strength:
    "Pick strength exercises to fill your strength training time. Build muscle, bone density, and functional power.",
  power:
    "Select explosive movements to fill your power training time. Preserve fast-twitch muscle fibers and build confidence.",
  sit: "Choose high-intensity exercises to fill your SIT time. Focus on maximum effort during work intervals.",
  integration:
    "Pick combination movements to fill your integration time. Challenge multiple muscle groups and movement patterns.",
  mobility:
    "Select stretches and flows to fill your mobility time. Maintain flexibility and promote recovery.",
  deload:
    "[DELOAD WEEK] Select mixed-modality, low-CNS movements to fill your recovery time. Focus on movement quality, proprioceptive feedback, and nervous system recovery. Lower intensity allows HPA axis restoration and parasympathetic activation.",
  cooldown:
    "Choose restorative movements to fill your cooldown time. Help your body return to rest and promote recovery.",
};

const exerciseOptions = {
  jump: [
    {
      name: "Squat Jump with Loading",
      reps: "20s",
      weight: "bodyweight",
      time: "2 rounds",
      rest: "90s",
      description:
        "Stand with feet shoulder-width apart. Lower into deep squat (90 degree knee bend), explode upward with maximum velocity. Land softly with bent knees absorbing force through entire kinetic chain. Hold landing 2 seconds. Provides 4-5x bodyweight impact force critical for bone density stimulus. Maximum eccentric loading on landing trains reactive strength essential for fall prevention.",
    },
    {
      name: "Stiff-Leg Reactive Hops",
      reps: "20s",
      weight: "bodyweight",
      time: "2 rounds",
      rest: "60s",
      description:
        "[RESEARCH-BACKED] Minimal knee bend, rapid ground contact (0.5-1 second per hop). Feet stay rigid, using only ankle/calf to generate vertical force. This targets fast-twitch muscle fibers rapidly declining during menopause and improves ground reaction force. Critical for reactive strength and preventing falls. Requires maximum force production in shortest ground contact time.",
    },
    {
      name: "Broad Jump with Deceleration",
      reps: "20s",
      weight: "bodyweight",
      time: "2 rounds",
      rest: "2min",
      description:
        "[RESEARCH-BACKED] Jump forward maximally, land on both feet with bent knees. Stick landing for 3 seconds emphasizing deceleration - eccentric muscle loading is critical for bone formation and joint stability. This horizontal plyometric develops fast-twitch fibers while the landing phase trains eccentric strength preventing knee/ankle injuries. High neurological demand requires full recovery.",
    },
    {
      name: "Single-Leg Hops (Lateral Ankle Stability)",
      reps: "20s each leg",
      weight: "bodyweight",
      time: "1 round",
      rest: "90s",
      description:
        "[RESEARCH-BACKED] Balance on single leg, hop forward with rapid, small rebounds focusing on stable ankle position. Postmenopausal women lose proprioceptive feedback - this unilateral movement restores ankle stability and prevents inversion ankle sprains. Develops strength asymmetries correcting side-to-side deficits common after menopause.",
    },
    {
      name: "Lateral Bounds (Frontal Plane)",
      reps: "20s",
      weight: "bodyweight",
      time: "1 round",
      rest: "90s",
      description:
        "[RESEARCH-BACKED] Jump laterally from single leg to single leg, controlling landing through hip abductors. Stick each landing 2 seconds. Most falls occur in frontal plane - lateral movements train anti-gravity muscles and dynamic stability in this critical direction. Develops hip abductor strength essential for balance and preventing lateral falls.",
    },
    {
      name: "Tuck Jumps (Max Power)",
      reps: "20s",
      weight: "bodyweight",
      time: "1 round",
      rest: "2min",
      description:
        "Jump maximum height bringing knees to chest. Land and stick 3 seconds emphasizing deceleration. Maximal fast-twitch recruitment in concentric phase; eccentric loading in deceleration. Menopause causes preferential fast-twitch atrophy - this counteracts that loss. Full CNS recovery required between sets.",
    },
    {
      name: "Depth Jump with Vertical Pop",
      reps: "20s",
      weight: "bodyweight",
      time: "1 round",
      rest: "2min",
      description:
        "[RESEARCH-BACKED] Step off low platform (8-12 inches), land on both feet, immediately jump maximum height. Minimal ground contact time (reactive) develops stretch-shortening cycle critical for power preservation. Trains rate of force development - the ability to produce force quickly - declining significantly after menopause.",
    },
    {
      name: "Calf Jumps (Ankle Reactivity)",
      reps: "20s",
      weight: "bodyweight",
      time: "2 rounds",
      rest: "60s",
      description:
        "[RESEARCH-BACKED] Small rapid hops using only ankle/calf, minimal knee bend. Stay on balls of feet maintaining constant contact rhythm. Rapid ground contact trains lower leg reactivity and prevents ankle sprains. Single-joint movement isolates calf power critical for balance and proprioception in older women.",
    },
    {
      name: "Transverse Rotation Jumps (Anti-Rotation)",
      reps: "20s",
      weight: "bodyweight",
      time: "2 rounds",
      rest: "90s",
      description:
        "[RESEARCH-BACKED] Stand with feet hip-width apart. Rotate torso maximally left, then jump rotating torso right with feet landing in rotated position. Alternate sides. This transverse plane movement prevents rotational falls - a common cause of injury in postmenopausal women. Trains core anti-rotation strength.",
    },
    {
      name: "Jump Rope (Coordinated Bone Loading)",
      reps: "20s",
      weight: "jump rope",
      time: "2 rounds",
      rest: "90s",
      description:
        "Jump with both feet, rotate rope with wrist action. Land softly on balls of feet. Provides consistent 2-3x bodyweight impact stimulus while maintaining coordination and rhythm - cognitive challenge important for fall prevention and agility maintenance.",
    },
  ],
  strength: [
    {
      name: "Goblet Squat",
      reps: "8-10 reps",
      weight: "15-25 lbs",
      time: "1 round",
      rest: "90-120s",
      description:
        "Hold dumbbell vertically at chest. Squat down keeping chest up and elbows inside knees. Full body engagement - legs, core, shoulders.",
    },
    {
      name: "DB Deadlift",
      reps: "8-10 reps",
      weight: "15-25 lbs",
      time: "1 round",
      rest: "90-120s",
      description:
        "Hold dumbbells at sides. Hinge at hips, lower weights toward floor keeping back flat. Drive through heels to stand. Engages posterior chain, core, grip.",
    },
    {
      name: "Renegade Rows",
      reps: "6/arm",
      weight: "10-15 lbs",
      time: "1 round",
      rest: "90s",
      description:
        "Plank position on dumbbells. Row one weight to ribcage while stabilizing with other arm. Alternate. Full body anti-rotation strength.",
    },
    {
      name: "Thruster Complex",
      reps: "8 reps",
      weight: "10-15 lbs",
      time: "1 round",
      rest: "2min",
      description:
        "Squat with weights at shoulders, drive up and press overhead in one fluid motion. Total body power - legs, core, shoulders, arms.",
    },
    {
      name: "Single-Leg RDL",
      reps: "6/leg",
      weight: "10-15 lbs",
      time: "1 round",
      rest: "60-90s",
      description:
        "Balance on left leg, hinge at hip lowering dumbbell while extending right leg behind. Keep back straight. Challenges balance, posterior chain, core stability.",
    },
    {
      name: "Step-Up with Bicep Curl",
      reps: "8-10/leg",
      weight: "10-15 lbs",
      time: "1 round",
      rest: "60-90s",
      description:
        "Hold dumbbells at sides. Step up onto chair with right foot while simultaneously curling both weights to shoulders. Step down with control. Complete 8-10 reps on right leg, then switch to left leg. One round = both legs completed.",
    },
    {
      name: "Reverse Lunge with Hammer Curl to Press",
      reps: "8/leg",
      weight: "8-12 lbs",
      time: "1 round",
      rest: "90s",
      description:
        "Hold dumbbells at sides. Step back into reverse lunge with right leg, at bottom of lunge curl weights to shoulders (hammer grip). As you step forward and stand, press weights overhead. Complete 8 reps on right leg, then 8 on left leg. One round = both legs completed.",
    },
    {
      name: "Deadlift to Upright Row to Curl",
      reps: "8 sequences",
      weight: "12-15 lbs",
      time: "1 round",
      rest: "90s",
      description:
        "Start with dumbbells at mid-shin. Perform Romanian deadlift to standing, immediately pull weights up to chest (upright row), then curl to shoulders, lower back to start. That is 1 rep. Complete 8 full sequences per round.",
    },
    {
      name: "Side Lunge with Overhead Press",
      reps: "8/side",
      weight: "8-12 lbs",
      time: "1 round",
      rest: "60s",
      description:
        "Hold dumbbells at shoulders. Lunge laterally to the right while simultaneously pressing weights overhead. Return to center lowering weights to shoulders. Complete 8 reps to right side, then 8 to left side. One round = both sides completed.",
    },
    {
      name: "Single-Leg Deadlift with Lateral Raise",
      reps: "6-8/leg",
      weight: "5-8 lbs",
      time: "1 round",
      rest: "90s",
      description:
        "Balance on left leg holding dumbbells at sides. Hinge forward into single-leg deadlift while simultaneously raising arms laterally to shoulder height. Return to standing while lowering arms. Complete 6-8 reps on left leg, then switch to right. One round = both legs completed.",
    },
    {
      name: "Squat Hold with Alternating Shoulder Press",
      reps: "10 presses",
      weight: "8-12 lbs",
      time: "1 round",
      rest: "90s",
      description:
        "Hold dumbbells at shoulders. Squat down to bottom position and HOLD. While holding the squat, press right arm overhead, lower, then press left arm overhead, lower. That is 2 reps. Continue alternating until you complete 10 total presses, then stand. Rest and repeat.",
    },
    {
      name: "Curtsy Lunge with Lateral Raise",
      reps: "8-10/leg",
      weight: "5-8 lbs",
      time: "1 round",
      rest: "60s",
      description:
        "Hold dumbbells at sides. Cross right leg behind and to the left into curtsy position while simultaneously raising arms laterally to shoulder height. Return to standing while lowering arms. Complete 8-10 reps with right leg crossing, then 8-10 with left leg crossing. One round = both sides completed.",
    },
    {
      name: "Sumo Squat with Bicep Curl Hold",
      reps: "8-10 curls",
      weight: "10-15 lbs",
      time: "1 round",
      rest: "90s",
      description:
        "Hold dumbbells at sides in wide sumo stance. Squat down and HOLD bottom position. While holding the squat, perform 8-10 complete bicep curls, then stand up. That is 1 round. Rest and repeat for 3 total rounds.",
    },
    {
      name: "Walking Lunge with Bicep Curl to Press",
      reps: "10 lunges",
      weight: "8-12 lbs",
      time: "1 round",
      rest: "90s",
      description:
        "Hold dumbbells at sides. Lunge forward with right leg, at the bottom curl weights to shoulders, then press overhead as you step the left foot forward into the next lunge. Continue alternating legs for 10 total lunges (5 per leg). One round = 10 total lunges completed.",
    },
    {
      name: "Bulgarian Split Squat with Tricep Extension",
      reps: "8/leg",
      weight: "8-10 lbs",
      time: "1 round",
      rest: "90s",
      description:
        "Hold one dumbbell overhead with both hands, rear foot elevated on chair. Lower into split squat position and HOLD. While holding the lunge, perform 8 overhead tricep extensions (bending elbows behind head), then stand. Complete all 8 reps on right leg forward, then switch to left leg forward. One round = both legs completed.",
    },
    {
      name: "Goblet Squat with Arnold Press",
      reps: "8 sequences",
      weight: "12-18 lbs",
      time: "1 round",
      rest: "90s",
      description:
        "Hold dumbbell vertically at chest (goblet position). Squat down, then as you stand rotate dumbbell and press overhead (palms facing forward at top). Lower weight back to goblet position with rotation. That is 1 rep. Complete 8 full squat-to-press sequences per round.",
    },
    {
      name: "Squat to Calf Raise with Overhead Press",
      reps: "8-10 sequences",
      weight: "8-12 lbs",
      time: "1 round",
      rest: "90s",
      description:
        "Hold dumbbells at shoulders. Squat down, drive up to standing, immediately rise onto toes (calf raise) while pressing weights overhead. Lower from toes and bring weights back to shoulders. That is 1 rep. Complete 8-10 full sequences per round.",
    },
    {
      name: "Turkish Get-Up",
      reps: "3/side",
      weight: "10-15 lbs",
      time: "1 round",
      rest: "90-120s",
      description:
        "Complex movement from lying to standing while keeping dumbbell overhead. Ultimate full-body stability, coordination, and strength builder.",
    },
    {
      name: "Push-Up to T-Rotation",
      reps: "6/side",
      weight: "bodyweight",
      time: "1 round",
      rest: "90s",
      description:
        "Perform push-up, rotate to side plank raising arm to ceiling. Return and repeat other side. Chest, core, shoulders, rotation.",
    },
    {
      name: "DB Clean and Press",
      reps: "6 reps",
      weight: "12-20 lbs",
      time: "1 round",
      rest: "2min",
      description:
        "Explosively pull dumbbells from floor to shoulders, then press overhead. Full body power movement engaging legs, back, shoulders, core.",
    },
    {
      name: "Sumo Squat to High Pull",
      reps: "10 reps",
      weight: "15-20 lbs",
      time: "1 round",
      rest: "90s",
      description:
        "Wide stance squat holding weight between legs. Drive up and pull weight to chin. Targets legs, posterior chain, upper back, shoulders.",
    },
    {
      name: "Bear Complex",
      reps: "5 reps",
      weight: "10-15 lbs",
      time: "1 round",
      rest: "2min",
      description:
        "Clean to front squat, press overhead, lower to back, back squat, press overhead, lower. Ultimate compound movement - every muscle group.",
    },
  ],
  power: [
    {
      name: "Light DB Swings",
      reps: "15 reps",
      weight: "10-15 lbs",
      time: "1 round",
      rest: "60-90s",
      description:
        "Hold dumbbell with both hands. Stand with feet wider than shoulders. Push hips back and swing weight between legs, then explosively drive hips forward to swing weight to chest height. Like a pendulum powered by your hips.",
    },
    {
      name: "Modified Thrusters",
      reps: "6 reps",
      weight: "5-10 lbs",
      time: "1 round",
      rest: "60s",
      description:
        "Hold light dumbbells at shoulder level. Perform a squat, then as you stand up, press the weights overhead in one fluid motion. Lower weights back to shoulders and repeat.",
    },
    {
      name: "DB Snatch",
      reps: "5/arm",
      weight: "10-15 lbs",
      time: "1 round",
      rest: "90s",
      description:
        "Start in squat holding dumbbell between legs with one hand. Explosively stand while pulling weight from floor to overhead in one powerful motion. Like starting a lawnmower but finishing with weight overhead.",
    },
    {
      name: "DB Thruster",
      reps: "8 reps",
      weight: "10-15 lbs",
      time: "1 round",
      rest: "90s",
      description:
        "Hold dumbbells at shoulders. Squat down, then explosively drive up while pressing both weights overhead simultaneously. This combines a squat with an overhead press in one explosive movement.",
    },
    {
      name: "Heavy DB Swings",
      reps: "20 reps",
      weight: "20-25 lbs",
      time: "1 round",
      rest: "2min",
      description:
        "Same technique as light swings but with heavier weight. Focus on explosive hip snap to drive weight to chest height. Keep core tight and drive power from hips, not arms.",
    },
    {
      name: "Medicine Ball Slams",
      reps: "10 reps",
      weight: "10-15 lbs",
      time: "1 round",
      rest: "60-90s",
      description:
        "Hold medicine ball (or heavy dumbbell) overhead. Explosively slam it down toward the ground while engaging your core. Pick it up and repeat. Imagine throwing it through the floor.",
    },
    {
      name: "Power Cleans",
      reps: "6 reps",
      weight: "15-25 lbs",
      time: "1 round",
      rest: "2min",
      description:
        "Start with dumbbells at mid-shin. Explosively extend hips and knees while pulling weights up. Catch weights at shoulder level with elbows pointing forward. Lower and repeat.",
    },
    {
      name: "Heavy Snatches",
      reps: "6/arm",
      weight: "15-25 lbs",
      time: "1 round",
      rest: "2min",
      description:
        "Single-arm version of snatch with heavier weight. Explosively pull dumbbell from squat position to overhead in one motion. Requires maximum power and coordination.",
    },
    {
      name: "Explosive Push-Ups",
      reps: "5 reps",
      weight: "bodyweight",
      time: "1 round",
      rest: "90s",
      description:
        "Start in push-up position. Push up so explosively that your hands leave the ground. Land softly with control and immediately lower for next rep. Modify on knees if needed.",
    },
  ],
  sit: [
    {
      name: "Modified Jump Squats (20s)",
      reps: "20-30s",
      weight: "bodyweight",
      time: "1 round",
      rest: "2-3min (until HR recovers)",
      description:
        "[RECOMMENDED] Stand with feet shoulder-width apart. Squat down then jump up 6-12 inches. Land softly and immediately squat again. Work at HIGH INTENSITY (80-100% max HR). This interval preserves form quality - critical for postmenopausal women who experience faster neuromuscular fatigue. Form degradation after 45 seconds increases injury risk. Allow 2-3 minutes recovery until heart rate returns to normal.",
    },
    {
      name: "Light Thrusters (20s)",
      reps: "20-30s",
      weight: "5-8 lbs",
      time: "1 round",
      rest: "2-3min (until HR recovers)",
      description:
        "Hold light dumbbells at shoulders. Squat down, then explosively stand while pressing weights overhead. Lower weights back to shoulders and immediately squat again. Work continuously at MAXIMUM EFFORT (80-100% max HR). The work interval optimizes metabolic stimulus while maintaining movement quality and reducing joint stress from excessive fatigue. Allow 2-3 minutes recovery until heart rate returns to normal.",
    },
    {
      name: "Fast Bodyweight Squats (20s)",
      reps: "20-30s",
      weight: "bodyweight",
      time: "1 round",
      rest: "2-3min (until HR recovers)",
      description:
        "Bodyweight squats performed as fast as possible while maintaining proper form. Keep chest up, knees tracking over toes. Work at near-maximal speed. Count reps - aim for maximum within this interval. This duration allows higher volume while still maintaining form quality. Allow 2-3 minutes recovery until heart rate returns to normal.",
    },
    {
      name: "Burpee Intervals (20s)",
      reps: "20-30s",
      weight: "bodyweight",
      time: "1 round",
      rest: "3-4min (until HR recovers)",
      description:
        "[RECOMMENDED] Squat down, place hands on floor, jump feet back to plank, do a push-up, jump feet back to squat, then jump up with arms overhead. Repeat at MAXIMUM INTENSITY. Keep core tight, elbows close to body on push-up. This interval provides maximal cardiovascular and metabolic stimulus while protecting form quality essential for postmenopausal women. Allow 3-4 minutes recovery until heart rate returns to normal.",
    },
    {
      name: "Mountain Climbers (20s)",
      reps: "20-30s",
      weight: "bodyweight",
      time: "1 round",
      rest: "3-4min (until HR recovers)",
      description:
        "Start in plank position. Rapidly alternate bringing knees toward chest as if running in place horizontally. Keep hands planted, core tight. Move as fast as possible. This interval is optimal for maintaining rapid cadence without form breakdown. Allow 3-4 minutes recovery until heart rate returns to normal.",
    },
    {
      name: "High Knees (20s)",
      reps: "20-30s",
      weight: "bodyweight",
      time: "1 round",
      rest: "2-3min (until HR recovers)",
      description:
        "[RECOMMENDED] Run in place bringing knees up to waist height or higher. Pump arms rapidly and explosively. This should feel like sprinting in place - maximum effort at 80-100% max HR. The cardiovascular demand and lower body power output combine to preserve fast-twitch fibers and improve reactive capacity. Allow 2-3 minutes recovery until heart rate returns to normal.",
    },
    {
      name: "Sprint Intervals (20s)",
      reps: "20-30s",
      weight: "bodyweight",
      time: "1 round",
      rest: "4min (until HR recovers)",
      description:
        "[RECOMMENDED - PEAK POWER] If outdoors: sprint at maximum speed. If indoors: high knees, butt kicks, or fast feet in place. Give 100% effort as if running from danger. This interval provides maximum anaerobic stimulus without excessive fatigue that compromises movement quality and increases injury risk in postmenopausal athletes. Allow 4 minutes recovery until heart rate returns to normal.",
    },
    {
      name: "Complex Circuit (20s)",
      reps: "20-30s",
      weight: "various",
      time: "1 round",
      rest: "4min (until HR recovers)",
      description:
        "[BEGINNER] Perform continuously without rest: 5 burpees, immediately into 10 jump squats, immediately into 15 light thrusters (5-8 lbs). Complete entire sequence as many times as possible in your work interval. This represents optimal duration for postmenopausal women - maintain form quality throughout. Allow 4 minutes recovery until heart rate returns to normal.",
    },
  ],
  activation: [
    {
      name: "Arm Swings (Dynamic Warm-Up)",
      reps: "30s forward + 30s backward",
      weight: "bodyweight",
      time: "1 round",
      rest: "flow",
      description:
        "Perform arm circles forward for 30 seconds, gradually increasing circle size. Then perform backward arm circles for 30 seconds (60s total per round). Activates rotator cuff and increases blood flow to upper body. Gradually increase circle size to warm shoulders and increase core temperature.",
    },
    {
      name: "Marching with High Knees",
      reps: "60s continuous",
      weight: "bodyweight",
      time: "1 round",
      rest: "flow",
      description:
        "[NERVOUS SYSTEM PRIMING] March bringing knees to waist height for 60 seconds. Gradually increase pace throughout the round, activating core and hip flexors. This rhythmic movement activates the nervous system and increases overall core temperature. Critical pre-movement activation before explosive work.",
    },
    {
      name: "Leg Swings (Hip Mobility)",
      reps: "60s all directions",
      weight: "bodyweight",
      time: "1 round",
      rest: "flow",
      description:
        "[PROPRIOCEPTIVE] Hold wall for balance for full 60 seconds. Swing right leg forward/back for ~15 seconds, then side-to-side for ~15 seconds. Repeat with left leg (~30 seconds total). Mobilizes hip joints and activates hip stabilizers. Single-leg stance requirement activates proprioceptive feedback and ankle stabilizers. Critical balance foundation for older women.",
    },
    {
      name: "Glute Bridge Pulses",
      reps: "60s continuous pulses",
      weight: "bodyweight",
      time: "1 round",
      rest: "flow",
      description:
        "[RESEARCH-BACKED] Lie on back, knees bent, feet flat. Raise hips, perform continuous small pulses up and down while squeezing glutes for 60 seconds. Activates major hip extensor and stabilizer - critical for postmenopausal women losing hip power. Develops neuromuscular connection essential before jumping.",
    },
    {
      name: "Torso Twists (Core Activation)",
      reps: "60s continuous",
      weight: "bodyweight",
      time: "1 round",
      rest: "flow",
      description:
        "Rotate torso left and right continuously for full 60 seconds, keeping hips forward. Maintain steady rhythm. Warms spine and core. Activates obliques and anti-rotation strength needed for transverse plane movements in plyometric work.",
    },
    {
      name: "Cat-Cow Warm-Up",
      reps: "60s continuous flow",
      weight: "bodyweight",
      time: "1 round",
      rest: "flow",
      description:
        "On hands and knees, perform flowing cat-cow movements for 60 seconds: arch back (cow) then round spine (cat) repeatedly. Maintain smooth, continuous movement. Mobilizes spine and activates core for movement. Improves spinal mobility and core stability before loading.",
    },
    {
      name: "Sun Salutation Flow",
      reps: "60s flow",
      weight: "bodyweight",
      time: "1 round",
      rest: "flow",
      description:
        "Perform continuous sun salutation flow for 60 seconds: Mountain pose  ->  forward fold  ->  half lift  ->  low lunge  ->  downward dog  ->  cobra  ->  back to mountain. Repeat sequence as many times as possible within 60 seconds. Warms entire body with flowing movement. Comprehensive warm-up increasing body temperature and activating multiple movement patterns.",
    },
    {
      name: "Single-Leg Balance Hold",
      reps: "5 x 60s each leg",
      weight: "bodyweight",
      time: "1 round",
      rest: "flow",
      description:
        "[PROPRIOCEPTIVE] Stand on single leg for 60 seconds focusing on ankle and hip stability, eyes open. Repeat 5 times total (5 x 60s). This activates proprioceptive receptors and engages smaller stabilizer muscles critical for balance. Essential preparation for single-leg plyometric movements to follow. Each 60-second hold ensures adequate proprioceptive training stimulus for postmenopausal women.",
    },
    {
      name: "Shoulder Blade Squeezes",
      reps: "60s continuous",
      weight: "bodyweight",
      time: "1 round",
      rest: "flow",
      description:
        "Squeeze shoulder blades together, hold 2 seconds, release. Repeat continuously for 60 seconds. Activates postural muscles and scapular stabilizers. Important for upper body control and coordination during compound movements.",
    },
    {
      name: "Light Jump Activation",
      reps: "60s continuous small jumps",
      weight: "bodyweight",
      time: "1 round",
      rest: "flow",
      description:
        "[NERVOUS SYSTEM PRIMING] Perform small squat jumps continuously for 60 seconds, focusing on soft landings. Jump only 6-12 inches high for activation. Low-intensity introduction to plyometric movement pattern. Wakes up stretch-shortening cycle before higher-intensity jumps.",
    },
  ],
  deload: [
    {
      name: "Bodyweight Glute Bridge",
      reps: "8-10 reps",
      weight: "bodyweight",
      time: "1 round",
      rest: "60s",
      description:
        "Lie on back with knees bent, feet flat. Press heels down and lift hips toward ceiling, squeezing glutes at top. Hold 2 seconds, lower slowly. This gentle movement reactivates dormant glutes after sitting and prepares lower body for return to intensity. Essential for postmenopausal women - weak glutes correlate with poor bone density and high fall risk.",
    },
    {
      name: "Single-Leg Glute Bridge",
      reps: "6/leg",
      weight: "bodyweight",
      time: "2 rounds",
      rest: "90s",
      description:
        "Lie on back with knees bent. Press right foot into floor and lift hips, extending left leg straight. Squeeze glutes throughout. Lower and repeat on left side. One round = both legs completed. Single-leg work restores proprioceptive feedback and unilateral strength without intense impact.",
    },
    {
      name: "Resistance Band Glute Bridge",
      reps: "12-15 reps",
      weight: "resistance band",
      time: "2 rounds",
      rest: "60s",
      description:
        "Loop resistance band above knees. Lie on back with knees bent, feet flat hip-width apart. Lift hips pressing knees outward against band, squeezing glutes. Low-impact glute activation with band resistance - perfect for deload. Maintains strength and neural activation without systemic fatigue.",
    },
    {
      name: "Bodyweight Squats",
      reps: "10-12 reps",
      weight: "bodyweight",
      time: "1 round",
      rest: "60-90s",
      description:
        "Stand feet shoulder-width apart. Lower hips back and down keeping chest up, knees tracking over toes. Stand back up. Full range of motion emphasizes eccentric control. Light, controlled bodyweight squats build movement confidence and maintain neuromuscular patterns without joint stress.",
    },
    {
      name: "Wall Assisted Squats",
      reps: "12 reps",
      weight: "bodyweight",
      time: "2 rounds",
      rest: "45s",
      description:
        "Back against wall, feet 12 inches away, shoulder-width apart. Slide down into squat to 90 degrees if comfortable, hold 2 seconds, slide back up. Wall support reduces load on joints while maintaining quad and glute activation. Ideal for recovery week - teaches proper squat pattern safely.",
    },
    {
      name: "Clamshells",
      reps: "15/side",
      weight: "bodyweight",
      time: "2 rounds",
      rest: "45s",
      description:
        "Lie on side with knees bent, hips stacked, feet together. Lift top knee keeping feet touching. Feel glute medius work. Lower with control. Awakens often-neglected hip abductors crucial for knee stability, pelvic alignment, and fall prevention. Low-impact glute isolation.",
    },
    {
      name: "Resistance Band Lateral Walks",
      reps: "12/direction",
      weight: "resistance band",
      time: "2 rounds",
      rest: "60s",
      description:
        "Loop resistance band above knees (or ankles). Stand feet hip-width apart, slight squat. Step out sideways keeping knees apart against band, step other foot to meet it. This frontal plane movement challenges hip abductors and lateral stability without impact - critical deload week exercise.",
    },
    {
      name: "Child's Pose Flow",
      reps: "5 breaths per hold",
      weight: "bodyweight",
      time: "flow",
      rest: "flow",
      description:
        "On hands and knees, sink hips back to heels, arms extended forward. Rest forehead. Breathe deeply into belly and sides. Hold 5-10 breaths, come back to hands and knees, repeat. Gentle spinal flexion, psoas release, calming nervous system. Reduces muscle tension and promotes recovery.",
    },
    {
      name: "Cat-Cow Flow",
      reps: "8-10 cycles",
      weight: "bodyweight",
      time: "2 rounds",
      rest: "flow",
      description:
        "On hands and knees. COW: inhale, drop belly, lift gaze, open chest. CAT: exhale, round spine, tuck chin. Flow between positions with breath. Mobilizes entire spine, gently activates core through full range without impact. Essential for spinal health and postmenopausal mobility.",
    },
    {
      name: "Pilates Pelvic Curl (Bridge Hold)",
      reps: "5-8 reps",
      weight: "bodyweight",
      time: "2 rounds",
      rest: "60s",
      description:
        "Lie on back, knees bent, feet flat. Peel spine off mat one vertebra at a time, creating straight line from knees to shoulders. Hold 2 seconds at top squeezing glutes. Lower spine one vertebra at a time. Controlled spinal articulation improves proprioception and strengthens posterior chain safely.",
    },
    {
      name: "Pilates Hundred (Modified)",
      reps: "100 pumps total",
      weight: "bodyweight",
      time: "1 round",
      rest: "flow",
      description:
        "Lie on back, knees bent or extended (modify as needed). Curl head and shoulders, float arms. Pump arms while breathing - 5 counts inhale, 5 counts exhale. Fundamental Pilates core work that improves stability and breathing control without high-impact stress. Strengthens deep core muscles.",
    },
    {
      name: "Seated Spinal Twist",
      reps: "5/side",
      weight: "bodyweight",
      time: "2 rounds",
      rest: "flow",
      description:
        "Sit tall, cross right leg over left knee. Place left elbow outside right knee. Rotate spine to right, looking over shoulder. Keep sitting bones down. Gentle spinal rotation, improves thoracic mobility, aids digestion. Relaxing stretch perfect for recovery week.",
    },
    {
      name: "Hip Flexor Stretch",
      reps: "30s/side",
      weight: "bodyweight",
      time: "2 rounds",
      rest: "flow",
      description:
        "Half-kneeling position, back knee down. Push hips forward feeling stretch in front of back leg's hip. Postmenopausal women often have tight hip flexors from sitting - this stretch is critical for pelvic alignment, lower back health, and counteracting anterior pelvic tilt.",
    },
    {
      name: "Glute Squeeze Hold",
      reps: "10 reps",
      weight: "bodyweight",
      time: "2 rounds",
      rest: "30s",
      description:
        "Stand or sit. Maximally squeeze glutes for 2 seconds, fully relax for 2 seconds. Repeat. Neurological glute re-education - wakes up sleepy glutes after decades of sitting. Palpate glutes with hands to ensure activation. Essential deload week neural priming for return to intensity.",
    },
  ],
  mobility: [
    {
      name: "Cat-Cow Stretches",
      reps: "30s",
      weight: "bodyweight",
      time: "2 rounds",
      rest: "20s",
      description:
        "Arch back (cow) then round spine (cat). Mobilizes entire spine and relieves tension.",
    },
    {
      name: "Hip Flexor Stretch",
      reps: "30s each side",
      weight: "bodyweight",
      time: "2 rounds",
      rest: "20s",
      description:
        "Lunge position, sink hips forward. Stretches front of rear hip and thigh.",
    },
    {
      name: "Glute Bridge Hold",
      reps: "30s",
      weight: "bodyweight",
      time: "1 round",
      rest: "30s",
      description:
        "Lift hips squeezing glutes. Creates straight line from knees to shoulders.",
    },
    {
      name: "Thoracic Rotation",
      reps: "30s",
      weight: "bodyweight",
      time: "2 rounds",
      rest: "20s",
      description:
        "On hands and knees, rotate elbow down then up toward ceiling. Improves mid-back mobility.",
    },
    {
      name: "Hamstring Stretch",
      reps: "30s each leg",
      weight: "bodyweight",
      time: "2 rounds",
      rest: "20s",
      description:
        "Sit with one leg extended, lean forward from hips. Keep back straight, hinge from hips.",
    },
    {
      name: "Chest Stretch",
      reps: "30s",
      weight: "bodyweight",
      time: "2 rounds",
      rest: "20s",
      description:
        "Forearms against doorframe at shoulder height. Step forward to stretch chest and shoulders.",
    },
    {
      name: "Spinal Waves",
      reps: "30s",
      weight: "bodyweight",
      time: "2 rounds",
      rest: "20s",
      description:
        "Wave motion through spine from head to tailbone. Move slowly focusing on each vertebra.",
    },
    {
      name: "Child Pose",
      reps: "45s",
      weight: "bodyweight",
      time: "2 rounds",
      rest: "20s",
      description:
        "Kneel and fold forward extending arms. Decompresses spine and promotes relaxation.",
    },
    {
      name: "Seated Spinal Twist",
      reps: "30s each side",
      weight: "bodyweight",
      time: "2 rounds",
      rest: "20s",
      description:
        "Sit tall, rotate torso looking over shoulder. Improves spinal rotation.",
    },
  ],
  integration: [
    {
      name: "Squat to Calf Raise",
      reps: "6+6",
      weight: "10-15 lbs",
      time: "1 round",
      rest: "90s",
      description:
        "Hold dumbbells at sides. Do 6 goblet squats (holding weight at chest), then immediately do 6 calf raises (rise up on toes) with same weight. No rest between exercises.",
    },
    {
      name: "Row to Overhead",
      reps: "8+8",
      weight: "8-12 lbs",
      time: "1 round",
      rest: "90s",
      description:
        "Support one hand on chair, row dumbbell to ribcage 8 times. Immediately stand and press same weight overhead 8 times. Combines pulling and pushing movements.",
    },
    {
      name: "Squat to Jump Complex",
      reps: "6+3",
      weight: "20-25 lbs",
      time: "1 round",
      rest: "2min",
      description:
        'Do 6 heavy goblet squats with control, then immediately drop weight and do 3 explosive jump squats. This "contrast training" primes muscles for power.',
    },
    {
      name: "Row to Thrusters",
      reps: "8+8",
      weight: "12-15 lbs",
      time: "1 round",
      rest: "2min",
      description:
        "Bent-over row for 8 reps, then immediately perform 8 thrusters (squat to overhead press). Integrates pulling, squatting, and pressing in sequence.",
    },
    {
      name: "Lunge to Curl",
      reps: "6+6/leg",
      weight: "8-12 lbs",
      time: "1 round",
      rest: "60s",
      description:
        "Step back into reverse lunge while simultaneously curling dumbbells to shoulders. Step together and repeat. Challenges balance while building strength.",
    },
    {
      name: "Deadlift to Upright Row",
      reps: "8+8",
      weight: "10-15 lbs",
      time: "1 round",
      rest: "90s",
      description:
        "Romanian deadlift for 8 reps (hinge at hips, lower weights toward floor), then immediately do 8 upright rows (pull weights up to chest level).",
    },
    {
      name: "Step-Up to Press",
      reps: "6/leg",
      weight: "8-12 lbs",
      time: "1 round",
      rest: "90s",
      description:
        "Step up onto chair while simultaneously pressing dumbbells overhead. Step down with control. Combines lower body and upper body in multiple planes of movement.",
    },
    {
      name: "Squat to Rotation",
      reps: "8/side",
      weight: "8-15 lbs",
      time: "1 round",
      rest: "60s",
      description:
        "Hold weight at chest, squat down, then as you stand rotate torso fully to the right, then left. Adds rotational movement to traditional squat pattern.",
    },
    {
      name: "Plank to T-Rotation",
      reps: "6/side",
      weight: "5-10 lbs",
      time: "1 round",
      rest: "90s",
      description:
        'Start in plank holding light weight in one hand. Rotate to side plank while lifting weight toward ceiling, forming a "T" shape. Return to plank and repeat.',
    },
  ],
  cooldown: [
    {
      name: "Walking in Place",
      reps: "2min",
      weight: "bodyweight",
      time: "1 round",
      rest: "flow",
      description:
        "Gradually decrease pace over 2 minutes. Brings heart rate down gently.",
    },
    {
      name: "Deep Breathing",
      reps: "5 breaths",
      weight: "bodyweight",
      time: "2 rounds",
      rest: "flow",
      description:
        "Inhale 4 counts, hold 2, exhale 6. Activates parasympathetic nervous system.",
    },
    {
      name: "Seated Forward Fold",
      reps: "45s",
      weight: "bodyweight",
      time: "2 rounds",
      rest: "flow",
      description:
        "Fold forward from hips letting arms hang. Decompresses spine after exercise.",
    },
    {
      name: "Neck Rolls",
      reps: "5/dir",
      weight: "bodyweight",
      time: "1 round",
      rest: "flow",
      description:
        "Slowly roll head in complete circles. Releases neck and shoulder tension.",
    },
    {
      name: "Gentle Spinal Twist",
      reps: "30s/side",
      weight: "bodyweight",
      time: "2 rounds",
      rest: "flow",
      description:
        "Gentle rotation looking over shoulder. Helps decompress spine.",
    },
    {
      name: "Ankle Circles",
      reps: "8/dir",
      weight: "bodyweight",
      time: "1 round",
      rest: "flow",
      description:
        "Slow circles with ankles. Promotes circulation and prevents stiffness.",
    },
    {
      name: "Child Pose to Cobra Flow",
      reps: "5 flows",
      weight: "bodyweight",
      time: "2 rounds",
      rest: "flow",
      description:
        "Start in child pose, flow forward to cobra pose, return to child pose. Gentle spinal movement and deep relaxation.",
    },
    {
      name: "Legs Up the Wall",
      reps: "2min",
      weight: "bodyweight",
      time: "1 round",
      rest: "flow",
      description:
        "Lie on back with legs up against wall or chair. Promotes circulation and activates rest response.",
    },
    {
      name: "Restorative Twist",
      reps: "1min/side",
      weight: "bodyweight",
      time: "1 round",
      rest: "flow",
      description:
        "Lie on back, drop both knees to one side, arms in T-shape. Hold and breathe deeply. Releases tension and promotes relaxation.",
    },
    {
      name: "Progressive Relaxation",
      reps: "3min",
      weight: "bodyweight",
      time: "1 round",
      rest: "flow",
      description:
        "Tense then relax each muscle group from toes up. Promotes deep relaxation.",
    },
    {
      name: "Gentle Side Bend",
      reps: "30s/side",
      weight: "bodyweight",
      time: "2 rounds",
      rest: "flow",
      description:
        "Reach one arm overhead, lean to opposite side. Stretches lateral muscles.",
    },
    {
      name: "Shoulder Blade Squeezes",
      reps: "10 slow",
      weight: "bodyweight",
      time: "2 rounds",
      rest: "flow",
      description:
        "Squeeze shoulder blades together, hold 3 seconds. Resets posture after exercise.",
    },
    {
      name: "Savasana (Final Relaxation)",
      reps: "3-5min",
      weight: "bodyweight",
      time: "1 round",
      rest: "flow",
      description:
        "Lie flat on back, arms at sides, palms up. Close eyes and focus on breath. Complete mental and physical relaxation.",
    },
  ],
  deload: [
    {
      name: "Bodyweight Glute Bridge",
      reps: "8-10 reps",
      weight: "bodyweight",
      time: "2-3 rounds",
      rest: "60s",
      description:
        "Lie on back with knees bent, feet flat. Press heels down and lift hips toward ceiling, squeezing glutes at top. Hold 2 seconds, lower slowly. Gentle movement reactivates dormant glutes after sitting and prepares lower body for return to intensity. Essential for postmenopausal women - weak glutes correlate with poor bone density and high fall risk.",
    },
    {
      name: "Single-Leg Glute Bridge",
      reps: "6/leg",
      weight: "bodyweight",
      time: "2 rounds",
      rest: "90s",
      description:
        "Lie on back with knees bent. Press right foot into floor and lift hips, extending left leg straight. Squeeze glutes throughout. Lower and repeat on left side. Single-leg work restores proprioceptive feedback and unilateral strength without intense impact.",
    },
    {
      name: "Resistance Band Glute Bridge",
      reps: "12-15 reps",
      weight: "resistance band",
      time: "2 rounds",
      rest: "60s",
      description:
        "Loop resistance band above knees. Lie on back with knees bent, feet flat hip-width apart. Lift hips pressing knees outward against band, squeezing glutes. Low-impact glute activation with band resistance - perfect for deload. Maintains strength and neural activation without systemic fatigue.",
    },
    {
      name: "Bodyweight Squats",
      reps: "10-12 reps",
      weight: "bodyweight",
      time: "2-3 rounds",
      rest: "60-90s",
      description:
        "Stand feet shoulder-width apart. Lower hips back and down keeping chest up, knees tracking over toes. Stand back up. Full range of motion emphasizes eccentric control. Controlled bodyweight squats build movement confidence and maintain neuromuscular patterns without joint stress.",
    },
    {
      name: "Wall Assisted Squats",
      reps: "12 reps",
      weight: "bodyweight",
      time: "2 rounds",
      rest: "45s",
      description:
        "Back against wall, feet 12 inches away, shoulder-width apart. Slide down into squat to 90 degrees if comfortable, hold 2 seconds, slide back up. Wall support reduces load on joints while maintaining quad and glute activation. Ideal for recovery week - teaches proper squat pattern safely.",
    },
    {
      name: "Clamshells",
      reps: "15/side",
      weight: "bodyweight",
      time: "2 rounds",
      rest: "45s",
      description:
        "Lie on side with knees bent, hips stacked, feet together. Lift top knee keeping feet touching. Feel glute medius work. Lower with control. Awakens hip abductors crucial for knee stability, pelvic alignment, and fall prevention. Low-impact glute isolation.",
    },
    {
      name: "Resistance Band Lateral Walks",
      reps: "12/direction",
      weight: "resistance band",
      time: "2 rounds",
      rest: "60s",
      description:
        "Loop resistance band above knees (or ankles). Stand feet hip-width apart, slight squat. Step out sideways keeping knees apart against band, step other foot to meet it. Frontal plane movement challenges hip abductors and lateral stability without impact - critical deload exercise.",
    },
    {
      name: "Child's Pose Flow",
      reps: "5 breaths per hold",
      weight: "bodyweight",
      time: "flow",
      rest: "flow",
      description:
        "On hands and knees, sink hips back to heels, arms extended forward. Rest forehead. Breathe deeply into belly and sides. Hold 5-10 breaths, come back to hands and knees, repeat. Gentle spinal flexion, psoas release, calming nervous system. Reduces muscle tension and promotes recovery.",
    },
    {
      name: "Cat-Cow Flow",
      reps: "8-10 cycles",
      weight: "bodyweight",
      time: "2 rounds",
      rest: "flow",
      description:
        "On hands and knees. COW: inhale, drop belly, lift gaze, open chest. CAT: exhale, round spine, tuck chin. Flow between positions with breath. Mobilizes entire spine, gently activates core through full range without impact. Essential for spinal health and postmenopausal mobility.",
    },
    {
      name: "Pilates Pelvic Curl (Bridge Hold)",
      reps: "5-8 reps",
      weight: "bodyweight",
      time: "2 rounds",
      rest: "60s",
      description:
        "Lie on back, knees bent, feet flat. Peel spine off mat one vertebra at a time, creating straight line from knees to shoulders. Hold 2 seconds at top squeezing glutes. Lower spine one vertebra at a time. Controlled spinal articulation improves proprioception and strengthens posterior chain safely.",
    },
    {
      name: "Pilates Hundred (Modified)",
      reps: "100 pumps total",
      weight: "bodyweight",
      time: "1 round",
      rest: "flow",
      description:
        "Lie on back, knees bent or extended (modify as needed). Curl head and shoulders, float arms. Pump arms while breathing - 5 counts inhale, 5 counts exhale. Fundamental Pilates core work that improves stability and breathing control without high-impact stress. Strengthens deep core muscles.",
    },
    {
      name: "Seated Spinal Twist",
      reps: "5/side",
      weight: "bodyweight",
      time: "2 rounds",
      rest: "flow",
      description:
        "Sit tall, cross right leg over left knee. Place left elbow outside right knee. Rotate spine to right, looking over shoulder. Keep sitting bones down. Gentle spinal rotation, improves thoracic mobility, aids digestion. Relaxing stretch perfect for recovery week.",
    },
    {
      name: "Hip Flexor Stretch",
      reps: "30s/side",
      weight: "bodyweight",
      time: "2 rounds",
      rest: "flow",
      description:
        "Half-kneeling position, back knee down. Push hips forward feeling stretch in front of back leg's hip. Postmenopausal women often have tight hip flexors from sitting - this stretch is critical for pelvic alignment, lower back health, and counteracting anterior pelvic tilt.",
    },
    {
      name: "Glute Squeeze Hold",
      reps: "10 reps",
      weight: "bodyweight",
      time: "2 rounds",
      rest: "30s",
      description:
        "Stand or sit. Maximally squeeze glutes for 2 seconds, fully relax for 2 seconds. Repeat. Neurological glute re-education - wakes up sleepy glutes after decades of sitting. Palpate glutes with hands to ensure activation. Essential deload week neural priming for return to intensity.",
    },
  ],
};

// Continue with rest of the code...
function getCurrentWorkout() {
  return (
    weeklyFrameworks[selectedWeek]?.[selectedDay] || {
      type: "",
      duration: { standard: 0 },
      phases: [],
    }
  );
}

function getPhaseTitle(phase) {
  const targetTime = getPhaseTargetTime(phase);

  const titles = {
    jump: "Jump Training",
    strength: "Strength Training",
    sit: "Sprint Interval Training",
    activation: "Activation",
    power: "Power Training",
    mobility: "Mobility Work",
    integration: "Integration",
    deload: "Deload",
    cooldown: "Cool Down",
  };

  // For SIT phase, show duration-based time
  if (phase === "sit") {
    // Show 20-30s for all levels
    return `${titles[phase]} - 20-30s`;
  }

  const timeDisplay = targetTime === null ? "" : `(${targetTime}min)`;
  return `${titles[phase] || phase} ${timeDisplay}`.trim();
}

// NEW FUNCTION: Auto-collapse previous phase when opening new phase
function handlePhaseToggle(clickedPhase) {
  // Simply toggle the clicked phase - don't close other phases
  if (openPhases.has(clickedPhase)) {
    openPhases.delete(clickedPhase);
  } else {
    openPhases.add(clickedPhase);
  }

  updateApp();
}

// Base times in minutes for exercises
const exerciseBaseTimes = {
  jump: {
    // Jump times in MINUTES - varies by training level (selectedWeek)
    // Week 1 (Beginner): 40 seconds = 0.67 min
    // Week 2 (Intermediate): 30 seconds = 0.5 min
    // Week 3 (Advanced): 20 seconds = 0.33 min
    "Squat Jump with Landing": 0.5,
    "Step-Up with Knee Drive": 0.5,
    "Box Step Downs": 0.5,
    "Broad Jump": 0.5,
    "Lateral Bounds": 0.5,
    "Tuck Jumps": 0.5,
    "Depth Jumps": 0.5,
    "Single Leg Hops": 0.5,
    "Split Jump Lunges": 0.5,
    "Calf Hops": 0.5,
    "Jump Rope": 0.5,
    "Jumping Jacks": 0.5,
    "Forward Hops": 0.5,
  },
  strength: {
    "Goblet Squat": 2.5,
    "DB Deadlift": 2.5,
    "Renegade Rows": 3,
    "Thruster Complex": 3,
    "Single-Leg RDL": 2.5,
    "Step-Up with Bicep Curl": 2.5,
    "Reverse Lunge with Hammer Curl to Press": 3,
    "Deadlift to Upright Row to Curl": 3,
    "Side Lunge with Overhead Press": 2.5,
    "Single-Leg Deadlift with Lateral Raise": 3,
    "Squat Hold with Alternating Shoulder Press": 3,
    "Curtsy Lunge with Lateral Raise": 2.5,
    "Sumo Squat with Bicep Curl Hold": 3,
    "Walking Lunge with Bicep Curl to Press": 3,
    "Bulgarian Split Squat with Tricep Extension": 3,
    "Goblet Squat with Arnold Press": 3,
    "Squat to Calf Raise with Overhead Press": 3,
    "Turkish Get-Up": 4,
    "Push-Up to T-Rotation": 3,
    "DB Clean and Press": 3.5,
    "Sumo Squat to High Pull": 3,
    "Bear Complex": 4,
  },
  power: {
    "Light DB Swings": 2,
    "Modified Thrusters": 1.5,
    "DB Snatch": 2.5,
    "DB Thruster": 2.5,
    "Heavy DB Swings": 3,
    "Medicine Ball Slams": 2,
    "Power Cleans": 3,
    "Heavy Snatches": 3,
    "Explosive Push-Ups": 2.5,
  },
  sit: {
    // SIT times in MINUTES - varies by training level (selectedWeek)
    // Week 1 (Beginner): 20 seconds = 0.33 min
    // Week 2 (Intermediate): 30 seconds = 0.5 min
    // Week 3 (Advanced): 40 seconds = 0.67 min
    "Modified Jump Squats": 0.5,
    "Light Thrusters": 0.5,
    "Fast Squats": 0.5,
    "Burpee Intervals": 0.5,
    "Mountain Climbers": 0.5,
    "High Knees": 0.5,
    "Sprint Intervals": 0.5,
    "Complex Circuit": 0.5,
  },
  activation: {
    // Activation exercises: 1 minute per round (1.0 min)
    // Time for nervous system priming + proprioceptive work
    // Examples: 30s forward + 30s backward, or full 60s flow
    "Arm Swings (Dynamic Warm-Up)": 1.0,
    "Marching with High Knees": 1.0,
    "Leg Swings (Hip Mobility)": 1.0,
    "Glute Bridge Pulses": 1.0,
    "Torso Twists (Core Activation)": 1.0,
    "Cat-Cow Warm-Up": 1.0,
    "Sun Salutation Flow": 1.0,
    "Single-Leg Balance Hold": 1.0,
    "Shoulder Blade Squeezes": 1.0,
    "Light Jump Activation": 1.0,
  },
  mobility: {
    "Cat-Cow Stretches": 1.5,
    "Hip Flexor Stretch": 2,
    "Glute Bridge Hold": 1.5,
    "Thoracic Rotation": 1.5,
    "Hamstring Stretch": 1.5,
    "Chest Stretch": 1.5,
    "Spinal Waves": 1.5,
    "Child Pose": 2,
    "Seated Spinal Twist": 1.5,
  },
  integration: {
    "Squat to Calf Raise": 2,
    "Row to Overhead": 2,
    "Squat to Jump Complex": 3,
    "Row to Thrusters": 3,
    "Lunge to Curl": 1.5,
    "Deadlift to Upright Row": 2,
    "Step-Up to Press": 2,
    "Squat to Rotation": 1.5,
    "Plank to T-Rotation": 2,
  },
  deload: {
    // Deload week recovery exercises - gentle, low-impact, neural priming
    "Bodyweight Glute Bridge": 1.5,
    "Single-Leg Glute Bridge": 2,
    "Resistance Band Glute Bridge": 1.5,
    "Bodyweight Squats": 1.5,
    "Wall Assisted Squats": 1.5,
    Clamshells: 1.25,
    "Resistance Band Lateral Walks": 1.5,
    "Child's Pose Flow": 1,
    "Cat-Cow Flow": 1.25,
    "Pilates Pelvic Curl (Bridge Hold)": 2,
    "Pilates Hundred (Modified)": 2,
    "Seated Spinal Twist": 1,
    "Hip Flexor Stretch": 1.25,
    "Glute Squeeze Hold": 1,
  },
  cooldown: {
    "Walking in Place": 2,
    "Deep Breathing": 0.5,
    "Seated Forward Fold": 1,
    "Neck Rolls": 0.25,
    "Gentle Spinal Twist": 1,
    "Ankle Circles": 0.25,
    "Child Pose to Cobra Flow": 1.5,
    "Legs Up the Wall": 2,
    "Restorative Twist": 2,
    "Progressive Relaxation": 3,
    "Gentle Side Bend": 1,
    "Shoulder Blade Squeezes": 0.5,
    "Savasana (Final Relaxation)": 4,
  },
};

const exerciseMaxRounds = {
  jump: {
    "Squat Jump with Landing": 8,
    "Step-Up with Knee Drive": 8,
    "Box Step Downs": 8,
    "Broad Jump": 8,
    "Lateral Bounds": 8,
    "Tuck Jumps": 8,
    "Depth Jumps": 8,
    "Single Leg Hops": 8,
    "Split Jump Lunges": 8,
    "Calf Hops": 8,
    "Jump Rope": 8,
    "Jumping Jacks": 8,
    "Forward Hops": 8,
  },
  strength: {
    "Goblet Squat": 8,
    "DB Deadlift": 8,
    "Renegade Rows": 8,
    "Thruster Complex": 8,
    "Single-Leg RDL": 8,
    "Step-Up with Bicep Curl": 8,
    "Reverse Lunge with Hammer Curl to Press": 8,
    "Deadlift to Upright Row to Curl": 8,
    "Side Lunge with Overhead Press": 8,
    "Single-Leg Deadlift with Lateral Raise": 8,
    "Squat Hold with Alternating Shoulder Press": 8,
    "Curtsy Lunge with Lateral Raise": 8,
    "Sumo Squat with Bicep Curl Hold": 8,
    "Walking Lunge with Bicep Curl to Press": 8,
    "Bulgarian Split Squat with Tricep Extension": 8,
    "Goblet Squat with Arnold Press": 8,
    "Squat to Calf Raise with Overhead Press": 8,
    "Turkish Get-Up": 6,
    "Push-Up to T-Rotation": 8,
    "DB Clean and Press": 8,
    "Sumo Squat to High Pull": 8,
    "Bear Complex": 6,
  },
  power: {
    "Light DB Swings": 8,
    "Modified Thrusters": 8,
    "DB Snatch": 8,
    "DB Thruster": 8,
    "Heavy DB Swings": 8,
    "Medicine Ball Slams": 8,
    "Power Cleans": 8,
    "Heavy Snatches": 6,
    "Explosive Push-Ups": 8,
  },
  sit: {
    "Modified Jump Squats": 6,
    "Light Thrusters": 6,
    "Fast Squats": 6,
    "Burpee Intervals": 6,
    "Mountain Climbers": 6,
    "High Knees": 6,
    "Sprint Intervals": 6,
    "Complex Circuit": 6,
  },
  activation: {
    "Arm Swings (Dynamic Warm-Up)": 8,
    "Marching with High Knees": 8,
    "Leg Swings (Hip Mobility)": 8,
    "Glute Bridge Pulses": 8,
    "Torso Twists (Core Activation)": 8,
    "Cat-Cow Warm-Up": 8,
    "Sun Salutation Flow": 8,
    "Single-Leg Balance Hold": 8,
    "Shoulder Blade Squeezes": 8,
    "Light Jump Activation": 8,
  },
  mobility: {
    "Cat-Cow Stretches": 8,
    "Hip Flexor Stretch": 8,
    "Glute Bridge Hold": 8,
    "Thoracic Rotation": 8,
    "Hamstring Stretch": 8,
    "Chest Stretch": 8,
    "Spinal Waves": 8,
    "Child Pose": 8,
    "Seated Spinal Twist": 8,
  },
  integration: {
    "Squat to Calf Raise": 8,
    "Row to Overhead": 8,
    "Squat to Jump Complex": 6,
    "Row to Thrusters": 8,
    "Lunge to Curl": 8,
    "Deadlift to Upright Row": 8,
    "Step-Up to Press": 8,
    "Squat to Rotation": 8,
    "Plank to T-Rotation": 8,
  },
  cooldown: {
    "Walking in Place": 8,
    "Deep Breathing": 10,
    "Seated Forward Fold": 8,
    "Neck Rolls": 10,
    "Gentle Spinal Twist": 8,
    "Ankle Circles": 10,
    "Child Pose to Cobra Flow": 8,
    "Legs Up the Wall": 8,
    "Restorative Twist": 8,
    "Progressive Relaxation": 8,
    "Gentle Side Bend": 8,
    "Shoulder Blade Squeezes": 8,
    "Savasana (Final Relaxation)": 8,
  },
  deload: {
    // Deload week exercises - increased round maximums to allow user flexibility
    "Bodyweight Glute Bridge": 8,
    "Single-Leg Glute Bridge": 6,
    "Resistance Band Glute Bridge": 6,
    "Bodyweight Squats": 8,
    "Wall Assisted Squats": 8,
    Clamshells: 6,
    "Resistance Band Lateral Walks": 6,
    "Child's Pose Flow": 8,
    "Cat-Cow Flow": 8,
    "Pilates Pelvic Curl (Bridge Hold)": 6,
    "Pilates Hundred (Modified)": 4,
    "Seated Spinal Twist": 8,
    "Hip Flexor Stretch": 8,
    "Glute Squeeze Hold": 6,
  },
};

function calculateRounds(phase, selectedExercises) {
  const targetTime = getPhaseTargetTime(phase);
  const exercisePhase = getExercisePhase(phase);

  if (selectedExercises.length === 0) return {};

  // Special case for SIT phase - use preset rounds per exercise, don't divide by time
  if (phase === "sit") {
    const rounds = {};
    const numExercises = selectedExercises.length;
    
    // Auto-balance: 6 rounds for 1 exercise, 3 each for 2, 2 each for 3, etc.
    let baseRounds = 6;
    if (numExercises > 1) {
      baseRounds = Math.max(2, Math.floor(6 / numExercises));
    }

    selectedExercises.forEach((exerciseName) => {
      const customKey = `${selectedWeek}-${selectedDay}-${phase}-${exerciseName}`;
      if (customRounds[customKey] !== undefined) {
        rounds[exerciseName] = customRounds[customKey];
      } else {
        rounds[exerciseName] =
          trainingWeek === 4 ? Math.ceil(baseRounds * 0.6) : baseRounds;
      }
    });
    return rounds;
  }

  // Determine work interval time based on training level for jump phase
  let workIntervalMinutes = 1; // default for other phases
  if (phase === "jump") {
    if (selectedWeek === 1) {
      workIntervalMinutes = 20 / 60; // Beginner: 20 seconds
    } else if (selectedWeek === 2) {
      workIntervalMinutes = 30 / 60; // Intermediate: 30 seconds
    } else if (selectedWeek === 3) {
      workIntervalMinutes = 30 / 60; // Advanced: 30 seconds
    } else if (selectedWeek === 4) {
      workIntervalMinutes = 20 / 60; // Deload: beginner level (20 seconds)
    }
  }

  const rounds = {};

  // For jump phase: target jump time based on training level
  let targetJumpMinutes = 3; // default
  if (phase === "jump") {
    if (selectedWeek === 1) {
      targetJumpMinutes = 3; // Beginner: 3 minutes
    } else if (selectedWeek === 2) {
      targetJumpMinutes = 4; // Intermediate: 4 minutes
    } else if (selectedWeek === 3) {
      targetJumpMinutes = 5; // Advanced: 5 minutes
    } else if (selectedWeek === 4) {
      targetJumpMinutes = 3; // Deload: beginner level (3 minutes)
    }
  }

  // DIVIDE target time by number of exercises
  const timePerExercise =
    (phase === "jump" ? targetJumpMinutes : targetTime) /
    selectedExercises.length;

  selectedExercises.forEach((exerciseName) => {
    const customKey = `${selectedWeek}-${selectedDay}-${phase}-${exerciseName}`;

    if (customRounds[customKey] !== undefined) {
      rounds[exerciseName] = customRounds[customKey];
    } else {
      let baseTime;

      if (phase === "jump") {
        baseTime = workIntervalMinutes;
      } else {
        baseTime = exerciseBaseTimes[exercisePhase]?.[exerciseName] || 2;
      }

      const calculatedRounds = Math.max(
        1,
        Math.round(timePerExercise / baseTime)
      );
      // For jump phase, allow more rounds to hit target time; for other phases cap at 6
      const cappedRounds =
        phase === "jump" ? calculatedRounds : Math.min(calculatedRounds, 6);

      rounds[exerciseName] =
        trainingWeek === 4 ? Math.ceil(cappedRounds * 0.6) : cappedRounds;
    }
  });

  return rounds;
}

function adjustRounds(phase, exerciseName, action) {
  const customKey = `${selectedWeek}-${selectedDay}-${phase}-${exerciseName}`;
  const selectedExercises = getSelectedExercises(phase);
  const currentRounds = calculateRounds(phase, selectedExercises);
  const current = currentRounds[exerciseName] || 1;
  const exercisePhase = getExercisePhase(phase);
  const exerciseMax = exerciseMaxRounds[exercisePhase]?.[exerciseName] || 5;

  // Get the initial calculated rounds (without any custom overrides)
  let initialCalculatedRounds = 1;
  selectedExercises.forEach((ex) => {
    if (ex === exerciseName) {
      const baseTime = exerciseBaseTimes[exercisePhase]?.[ex] || 2;
      const targetTime = getPhaseTargetTime(phase);
      const timePerExercise = targetTime / selectedExercises.length;
      initialCalculatedRounds = Math.max(
        1,
        Math.round(timePerExercise / baseTime)
      );
    }
  });

  // Allow user to increase rounds up to the exerciseMaxRounds setting
  // This lets them extend their workout to meet time requirements
  const effectiveMax = exerciseMax;

  if (action === "increase") {
    // Allow increasing up to the exercise-specific max
    if (current < effectiveMax) {
      const newRounds = current + 1;
      customRounds[customKey] = newRounds;
      balanceRounds(phase, exerciseName);
    }
  } else if (action === "decrease" && current > 1) {
    customRounds[customKey] = current - 1;
    balanceRounds(phase, exerciseName);
  }

  updateApp();
}

function balanceRounds(phase, changedExercise) {
  // Disabled auto-balancing - users have full control to adjust rounds as they wish
  // This allows them to increase rounds on one exercise to make up phase time
  // No automatic reductions or additions to other exercises
  return;
}

function showRemovalPrompt(phase, increasedExercise, exercisesToRemove) {
  const modal = document.createElement("div");
  modal.className = "celebration-modal";
  modal.innerHTML = `
    <div class="celebration-content" style="background: #f59e0b; max-width: 500px;">
        <h2 style="font-size: 24px; margin-bottom: 16px; color: white;">  Time Limit Reached</h2>
        <p style="font-size: 16px; margin-bottom: 20px; color: white;">
            Adding more rounds to <strong>${increasedExercise}</strong> puts you over your target time.
            <br><br>
            Would you like to remove an exercise to make room?
        </p>
        <div style="margin-bottom: 20px;">
            ${exercisesToRemove
              .map(
                (ex) => `
                <button onclick="removeExerciseAndContinue('${phase}', '${ex}')" 
                        style="background: white; color: #f59e0b; border: none; padding: 8px 16px; border-radius: 6px; font-size: 14px; margin: 4px; cursor: pointer;">
                    Remove "${ex}"
                </button>
            `
              )
              .join("")}
        </div>
        <button onclick="cancelRoundIncrease('${phase}', '${increasedExercise}')" 
                style="background: rgba(255,255,255,0.2); color: white; border: none; padding: 8px 16px; border-radius: 6px; font-size: 14px; cursor: pointer;">
            Cancel
        </button>
    </div>
`;
  document.body.appendChild(modal);
}

function playBeep() {
  try {
    // Try Tone.js first if available
    if (typeof Tone !== 'undefined' && toneInitialized) {
      const synth = new Tone.Synth({
        oscillator: { type: 'sine' },
        envelope: { attack: 0.005, decay: 0.3, sustain: 0, release: 0.1 }
      }).toDestination();
      synth.triggerAttackRelease('800Hz', '0.5');
      console.log("Beep played with Tone.js");
      return;
    }
    
    const ctx = getAudioContext();
    
    if (ctx.state === "suspended") {
      ctx.resume();
    }
    
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.frequency.value = 800;
    osc.type = "sine";

    gain.gain.setValueAtTime(0.5, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);

    osc.start(now);
    osc.stop(now + 0.5);

    console.log("Beep played with Web Audio");
  } catch (error) {
    console.log("Error playing beep:", error);
  }
}

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs
    .toString()
    .padStart(2, "0")}`;
}

function startTimer() {
  if (timerRunning) return;

  // Get exercise duration in seconds (extract from reps field like "30s" or "60s")
  let duration = 30; // default
  if (currentExercise) {
    const exercisePhase = Object.keys(exerciseOptions).find(
      (phase) =>
        exerciseOptions[phase] &&
        exerciseOptions[phase].find((ex) => ex.name === currentExercise)
    );
    if (exercisePhase && exerciseOptions[exercisePhase]) {
      const exercise = exerciseOptions[exercisePhase].find(
        (ex) => ex.name === currentExercise
      );
      if (exercise && exercise.reps) {
        const match = exercise.reps.match(/(\d+)/);
        if (match) {
          duration = parseInt(match[1]);
        }
      }
    }
  }

  timerSeconds = duration;
  timerRunning = true;

  const startBtn = document.getElementById("timerStartBtn");
  const pauseBtn = document.getElementById("timerPauseBtn");

  if (startBtn) {
    startBtn.disabled = true;
    startBtn.style.cursor = "not-allowed";
    startBtn.style.opacity = "1";
  }
  if (pauseBtn) {
    pauseBtn.disabled = false;
    pauseBtn.style.cursor = "pointer";
    pauseBtn.style.opacity = "1";
  }

  updateTimerDisplay();

  timerInterval = setInterval(() => {
    timerSeconds--;
    updateTimerDisplay();

    // Beep when countdown reaches 0
    if (timerSeconds <= 0) {
      clearInterval(timerInterval);
      timerRunning = false;
      timerSeconds = 0;

      // Play bell sound notification
      playBellSound();

      // Increment round counter
      const counterEl = document.getElementById(
        `round-counter-${currentExercise}`
      );
      if (counterEl) {
        const text = counterEl.textContent;
        const [current, total] = text.split("/");
        const newCurrent = Math.min(parseInt(current) + 1, parseInt(total));
        counterEl.textContent = `${newCurrent}/${total}`;
      }

      // Play beep
      try {
        playBeep();
      } catch (e) {
        console.log("Beep failed:", e);
      }

      if (startBtn) {
        startBtn.disabled = false;
        startBtn.style.cursor = "pointer";
        startBtn.style.opacity = "1";
      }
      if (pauseBtn) {
        pauseBtn.disabled = true;
        pauseBtn.style.cursor = "not-allowed";
        pauseBtn.style.opacity = "0.5";
      }
    }
  }, 1000);
}

function pauseTimer() {
  if (!timerRunning) return;

  timerRunning = false;
  clearInterval(timerInterval);

  const startBtn = document.getElementById("timerStartBtn");
  const pauseBtn = document.getElementById("timerPauseBtn");

  if (startBtn) {
    startBtn.disabled = false;
    startBtn.style.cursor = "pointer";
    startBtn.style.opacity = "1";
  }
  if (pauseBtn) {
    pauseBtn.disabled = true;
    pauseBtn.style.cursor = "not-allowed";
    pauseBtn.style.opacity = "0.5";
  }
}

function resetTimer() {
  clearInterval(timerInterval);
  timerRunning = false;
  timerSeconds = 0;
  updateTimerDisplay();

  const startBtn = document.getElementById("timerStartBtn");
  const pauseBtn = document.getElementById("timerPauseBtn");

  if (startBtn) {
    startBtn.disabled = false;
    startBtn.style.cursor = "pointer";
  }
  if (pauseBtn) {
    pauseBtn.disabled = true;
    pauseBtn.style.cursor = "not-allowed";
  }
}

function updateTimerDisplay() {
  const minutes = Math.floor(timerSeconds / 60);
  const seconds = timerSeconds % 60;
  const display = `${String(minutes).padStart(2, "0")}:${String(
    seconds
  ).padStart(2, "0")}`;

  const timerDisplay = document.getElementById("timerDisplay");
  if (timerDisplay) {
    timerDisplay.textContent = display;
  }
}

function selectExerciseForTimer(exerciseName, roundCount) {
  console.log("Timer: Selected exercise", exerciseName);

  // CRITICAL FIX: Clear any existing timer before starting new one
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
  timerRunning = false;

  currentExercise = exerciseName;
  currentExerciseRounds = roundCount;
  timerSeconds = 0;

  // Get exercise duration
  let duration = 30;
  const exercisePhase = Object.keys(exerciseOptions).find(
    (phase) =>
      exerciseOptions[phase] &&
      exerciseOptions[phase].find((ex) => ex.name === exerciseName)
  );
  if (exercisePhase && exerciseOptions[exercisePhase]) {
    const exercise = exerciseOptions[exercisePhase].find(
      (ex) => ex.name === exerciseName
    );

    // For Strength phase, use rest time; for others, use reps
    if (exercisePhase === "strength" && exercise && exercise.rest) {
      const match = exercise.rest.match(/(\d+)/);
      if (match) {
        duration = parseInt(match[1]);
      }
    } else if (exercise && exercise.reps) {
      const match = exercise.reps.match(/(\d+)/);
      if (match) {
        duration = parseInt(match[1]);
      }
    }
  }

  timerSeconds = duration;
  timerRunning = true;

  // Only disable the CURRENT exercise's start button, keep others enabled
  const startBtn = document.querySelector(
    `.timer-start-btn[data-exercise="${exerciseName}"]`
  );
  const pauseBtn = document.querySelector(
    `.timer-pause-btn[data-exercise="${exerciseName}"]`
  );

  if (startBtn) {
    startBtn.disabled = true;
    startBtn.style.opacity = "0.5";
  }
  if (pauseBtn) {
    pauseBtn.disabled = false;
    pauseBtn.style.opacity = "1";
  }

  updateExerciseTimerDisplay(exerciseName);

  timerInterval = setInterval(() => {
    timerSeconds--;
    updateExerciseTimerDisplay(exerciseName);

    if (timerSeconds <= 0) {
      clearInterval(timerInterval);
      timerRunning = false;
      timerSeconds = 0;
      playBeep();

      const counterEl = document.getElementById(
        `round-counter-${exerciseName}`
      );
      if (counterEl) {
        const text = counterEl.textContent;
        const [current, total] = text.split("/");
        const newCurrent = Math.min(parseInt(current) + 1, parseInt(total));
        counterEl.textContent = `${newCurrent}/${total}`;
      }

      if (startBtn) {
        startBtn.disabled = false;
        startBtn.style.opacity = "1";
      }
      if (pauseBtn) {
        pauseBtn.disabled = true;
        pauseBtn.style.opacity = "0.5";
      }
    }
  }, 1000);
}

function updateExerciseTimerDisplay(exerciseName) {
  const minutes = Math.floor(timerSeconds / 60);
  const seconds = timerSeconds % 60;
  const display = `${String(minutes).padStart(2, "0")}:${String(
    seconds
  ).padStart(2, "0")}`;
  const display_el = document.getElementById(`timer-${exerciseName}`);
  if (display_el) {
    display_el.textContent = display;
  }
}

function pauseExerciseTimer(exerciseName) {
  if (!timerRunning) return;
  timerRunning = false;
  clearInterval(timerInterval);

  const startBtn = document.querySelector(
    `.timer-start-btn[data-exercise="${exerciseName}"]`
  );
  const pauseBtn = document.querySelector(
    `.timer-pause-btn[data-exercise="${exerciseName}"]`
  );

  if (startBtn) {
    startBtn.disabled = false;
    startBtn.style.opacity = "1";
  }
  if (pauseBtn) {
    pauseBtn.disabled = true;
    pauseBtn.style.opacity = "0.5";
  }
}

function resetExerciseTimer(exerciseName) {
  clearInterval(timerInterval);
  timerRunning = false;
  timerSeconds = 0;
  updateExerciseTimerDisplay(exerciseName);

  const startBtn = document.querySelector(
    `.timer-start-btn[data-exercise="${exerciseName}"]`
  );
  const pauseBtn = document.querySelector(
    `.timer-pause-btn[data-exercise="${exerciseName}"]`
  );

  if (startBtn) {
    startBtn.disabled = false;
  }
  if (pauseBtn) {
    pauseBtn.disabled = true;
  }
}

window.selectExerciseForTimer = selectExerciseForTimer;

window.startTimer = startTimer;
window.pauseTimer = pauseTimer;
window.resetTimer = resetTimer;

function selectExerciseForTiming(phase, exerciseName, totalRounds) {
  currentSelectedExercise = { phase, exerciseName, totalRounds };

  const currentExerciseSpan = document.getElementById("currentExerciseName");
  const roundsSpan = document.getElementById("currentRound");
  const totalSpan = document.getElementById("totalRounds");

  if (currentExerciseSpan) currentExerciseSpan.textContent = exerciseName;
  if (roundsSpan) roundsSpan.textContent = "1";
  if (totalSpan) totalSpan.textContent = totalRounds;

  // Highlight the selected exercise card
  document.querySelectorAll(".exercise-card").forEach((card) => {
    card.style.boxShadow = "none";
  });

  const selectedCard = document.querySelector(`[data-key*="${exerciseName}"]`);
  if (selectedCard) {
    selectedCard.style.boxShadow =
      "0 0 0 3px #10b981, 0 4px 12px rgba(16, 185, 129, 0.4)";
  }
}

window.startTimer = window.startTimer;
window.pauseTimer = window.pauseTimer;
window.resetTimer = window.resetTimer;
window.selectExerciseForTiming = selectExerciseForTiming;
// ========== END TIMER FUNCTIONS ==========

function generateWorkoutSummary() {
  const selectedExercises = getSelectedExercises();

  if (Object.keys(workoutSelections).length === 0) {
    alert("Please select at least one exercise to generate your workout!");
    return;
  }

  const workout = getCurrentWorkout();
  const summaryContent = document.getElementById("workoutSummary");

  // Build summary by phase
  let summaryHTML = ``;

  // Build summary by phase
  workout.phases.forEach((phase) => {
    const phaseExercises = getSelectedExercises(phase);

    if (phaseExercises.length === 0) return;

    const phaseTitle = getPhaseTitle(phase);
    const rounds = calculateRounds(phase, phaseExercises);

    summaryHTML += `
      <div style="margin-bottom: 24px; padding-bottom: 16px; border-bottom: 1px solid #e5e7eb;">
        <h4 style="margin: 0 0 12px 0; color: #1f2937;">${phaseTitle}</h4>
        <div style="display: grid; gap: 12px;">
    `;

    phaseExercises.forEach((exerciseName) => {
      const roundCount = rounds[exerciseName] || 1;
      const exercisePhase = getExercisePhase(phase);
      const exerciseData = exerciseOptions[exercisePhase]?.find(
        (e) => e.name === exerciseName
      );

      if (exerciseData) {
        const roundDisplay =
          phase === "jump" || phase === "sit" || phase === "activation"
            ? `${roundCount} × ${
                phase === "activation"
                  ? "30s"
                  : selectedWeek === 1
                  ? "20s"
                  : selectedWeek === 2
                  ? "30s"
                  : "40s"
              }`
            : `${roundCount} ${roundCount === 1 ? "round" : "rounds"}`;

        summaryHTML += `
          <div style="background: #f9fafb; padding: 12px; border-radius: 6px; border-left: 4px solid #10b981;">
            <div style="display: flex; flex-direction: column; gap: 12px;" class="exercise-flex-${exerciseName.replace(
              /\s+/g,
              "-"
            )}">
              <div style="flex: 1; width: 100%;">
                <div style="font-weight: 600; margin-bottom: 4px;">${exerciseName}</div>
                <div style="font-size: 13px; color: #6b7280; margin-bottom: 4px;">
                  ${exerciseData.reps} - ${exerciseData.weight} - Rest: ${
          exerciseData.rest
        }
                </div>
                <div style="font-size: 12px; font-weight: 600; color: #10b981; margin-bottom: 12px;">${roundDisplay}</div>
                <div style="font-size: 12px; color: #4b5563; line-height: 1.4; background: white; padding: 10px; border-radius: 4px; border: 1px solid #e5e7eb; width: 100%; box-sizing: border-box;" class="desc-box-${exerciseName.replace(
                  /\s+/g,
                  "-"
                )}">${exerciseData.description}</div>
              </div>
              <div style="display: flex; flex-direction: column; gap: 6px; width: 100%;">
                <div style="font-size: 11px; font-weight: 600; color: #374151; margin-bottom: 4px;">Track Rounds</div>
                <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                  ${Array.from(
                    { length: roundCount },
                    (_, i) => `
                    <label style="display: flex; align-items: center; gap: 4px; cursor: pointer; font-size: 13px; color: #374151;">
                      R${i + 1}
                      <input type="checkbox" class="round-checkbox" data-exercise="${exerciseName.replace(
                        /\s+/g,
                        "-"
                      )}" data-round="${i + 1}" style="cursor: pointer;" />
                    </label>
                  `
                  ).join("")}
                </div>
              </div>
            </div>
          </div>
          <style>
            @media (max-width: 768px) {
              .exercise-flex-${exerciseName.replace(/\s+/g, "-")} {
                flex-direction: column !important;
                align-items: stretch !important;
                gap: 12px !important;
              }
              .desc-box-${exerciseName.replace(/\s+/g, "-")} {
                width: 100% !important;
                box-sizing: border-box !important;
                margin-bottom: 0 !important;
                max-width: 100% !important;
              }
            }
          </style>
        `;
      }
    });

    summaryHTML += `</div></div>`;
  });

  summaryContent.innerHTML = summaryHTML;

  // Add event listeners for round checkboxes
  document.querySelectorAll(".round-checkbox").forEach((checkbox) => {
    checkbox.addEventListener("change", (e) => {
      const exerciseName = e.target.dataset.exercise;
      const roundNum = e.target.dataset.round;
      const key = `round-${exerciseName}-${roundNum}`;

      if (e.target.checked) {
        completedRounds[key] = true;
      } else {
        delete completedRounds[key];
      }
    });
  });

  // Restore checkbox states
  document.querySelectorAll(".round-checkbox").forEach((checkbox) => {
    const exerciseName = checkbox.dataset.exercise;
    const roundNum = checkbox.dataset.round;
    const key = `round-${exerciseName}-${roundNum}`;

    if (completedRounds[key]) {
      checkbox.checked = true;
    }
  });

  // Hide exercise selection, show summary
  document.getElementById("exerciseSelection").classList.add("hidden");
  document.getElementById("workoutSummary").classList.remove("hidden");
  document.getElementById("generateWorkoutBtn").classList.add("hidden");
  document.getElementById("editWorkoutBtn").classList.remove("hidden");

  // Apply color palette to timer
  const timerPanel = document.querySelector('[style*="667eea"]')?.parentElement;
  if (timerPanel) {
    timerPanel.style.background =
      "linear-gradient(135deg, #3f88c5 0%, #1c3144 100%)";
  }
}

function editWorkout() {
  // Reset exercise when going back to edit
  currentExercise = null;
  currentExerciseRounds = 0;

  // Show exercise selection, hide summary
  document.getElementById("exerciseSelection").classList.remove("hidden");
  document.getElementById("workoutSummary").classList.add("hidden");
  document.getElementById("generateWorkoutBtn").classList.remove("hidden");
  document.getElementById("editWorkoutBtn").classList.add("hidden");
}

// ========== EVENT DELEGATION FIX FOR ROUND BUTTONS ==========
function setupRoundButtonListeners() {
  const workoutContainer = document.getElementById("exerciseSelection");
  if (!workoutContainer) {
    console.warn("exerciseSelection container not found");
    return;
  }

  if (workoutContainer._roundBtnListener) {
    workoutContainer.removeEventListener(
      "click",
      workoutContainer._roundBtnListener
    );
  }

  const delegationListener = (e) => {
    const btn = e.target.closest(".round-btn");
    if (!btn) return;

    e.stopPropagation();
    e.preventDefault();

    try {
      const action = btn.dataset.action;
      const exerciseName = btn.dataset.exercise;
      const phase = btn.dataset.phase;

      if (!action || !exerciseName || !phase) {
        console.warn("Missing data on round button", {
          action,
          exerciseName,
          phase,
        });
        return;
      }

      adjustRounds(phase, exerciseName, action);
    } catch (error) {
      console.error("Error adjusting rounds:", error);
    }
  };

  workoutContainer.addEventListener("click", delegationListener); // Bubble phase (default)
  workoutContainer._roundBtnListener = delegationListener;
}
// ========== END EVENT DELEGATION FIX ==========

function addEventListeners() {
  document.querySelectorAll("[data-toggle]").forEach((h) => {
    h.addEventListener("click", () => {
      try {
        const p = h.dataset.toggle;
        handlePhaseToggle(p);
      } catch (error) {
        console.error("Error toggling phase:", error);
      }
    });
  });

  document.querySelectorAll(".exercise-card").forEach((card) => {
    card.addEventListener("click", (e) => {
      try {
        // Ignore clicks on elements that have their own handlers
        const target = e.target;

        // Skip if clicked on: round button, checkbox, or any button
        if (
          target.closest(".round-btn") ||
          target.closest(".round-checkbox") ||
          target.tagName === "BUTTON"
        ) {
          return;
        }

        const key = card.dataset.key;
        const phase = card.dataset.phase;

        if (!key || !phase) {
          console.error("Missing key or phase data on exercise card");
          return;
        }

        const isSelected = workoutSelections[key];

        if (isSelected) {
          delete workoutSelections[key];
        } else {
          workoutSelections[key] = true;
        }

        openPhases.add(phase);
        updateApp();
      } catch (error) {
        console.error("Error selecting exercise:", error);
      }
    });
  });

  // FIX: Use event delegation for round buttons
  setupRoundButtonListeners();

  document.querySelectorAll(".round-checkbox").forEach((checkbox) => {
    checkbox.addEventListener("change", (e) => {
      try {
        e.stopPropagation();
        const phase = checkbox.dataset.phase;
        const exerciseName = checkbox.dataset.exercise;
        const roundIndex = parseInt(checkbox.dataset.round);

        if (!phase || !exerciseName || isNaN(roundIndex)) {
          console.error("Missing or invalid data attributes on checkbox");
          return;
        }

        toggleRoundCompletion(phase, exerciseName, roundIndex);
      } catch (error) {
        console.error("Error toggling round completion:", error);
      }
    });

    checkbox.addEventListener("click", (e) => {
      e.stopPropagation();
    });
  });

  // Generate and Edit buttons are handled by global event delegation above
  // No need for additional listeners here
}

function restoreOpenPhases() {
  openPhases.forEach((p) => {
    const content = document.querySelector(`[data-content="${p}"]`);
    const arrow = document.querySelector(`[data-toggle="${p}"] .toggle-arrow`);
    if (content && arrow) {
      content.classList.add("show");
      arrow.textContent = "▲";
    }
  });
}

function showEquipmentModal() {
  document.getElementById("equipmentModal").classList.remove("hidden");
  document.getElementById("equipmentContent").innerHTML = `
    <h4>${selectedLocation === "home" ? "Home" : "Gym"} Equipment</h4>
    ${equipmentDatabase[selectedLocation]
      .map(
        (item) => `
        <div style="margin:8px 0">
            <input type="checkbox" id="${item.id}" ${
          userEquipment[selectedLocation][item.id] ? "checked" : ""
        }>
            <label for="${item.id}">${item.name}</label>
        </div>
    `
      )
      .join("")}
`;

  equipmentDatabase[selectedLocation].forEach((item) => {
    document.getElementById(item.id)?.addEventListener("change", (e) => {
      userEquipment[selectedLocation][item.id] = e.target.checked;
    });
  });
}

// Nutrition Guide Function
function showNutritionGuide() {
  document.getElementById("nutritionModal").classList.remove("hidden");
  document.getElementById("nutritionContent").innerHTML = `
    <div class="nutrition-section">
      <h4>Pre-Workout Fueling (15-30 minutes before)</h4>
      <div class="nutrition-timing">
        <strong>Why It Matters:</strong>
        <p>Fasted workouts are NOT recommended for women. Your body needs fuel to optimize performance, preserve muscle, and support hormonal balance during training.</p>
      </div>
      <div class="nutrition-timing">
        <strong>Target: 15g protein + 30g carbohydrates</strong>
        <p>This combination provides energy and supports muscle protein synthesis without causing digestive discomfort during exercise.</p>
      </div>
      <div class="nutrition-examples">
        <strong>Quick Pre-Workout Options:</strong>
        <ul>
          <li>Greek yogurt (150g) + banana</li>
          <li>Protein shake with oats and berries</li>
          <li>Turkey sandwich on whole wheat</li>
          <li>Hard-boiled eggs + apple + cheese</li>
          <li>Cottage cheese + granola + berries</li>
          <li>Chicken breast + sweet potato</li>
        </ul>
      </div>
    </div>

    <div class="nutrition-section">
      <h4>Post-Workout Recovery (within 60 minutes)</h4>
      <div class="nutrition-timing">
        <strong>Critical Timing Window:</strong>
        <p>Women have a critical recovery window for muscle adaptation. Consume protein + carbs within 60 minutes to maximize muscle adaptation and bone health.</p>
      </div>
      <div class="nutrition-timing">
        <strong>Target: 40g protein + carbohydrates</strong>
        <p>Higher protein intake supports muscle maintenance and adaptation during perimenopause and postmenopause when muscle protein synthesis is naturally compromised.</p>
      </div>
      <div class="nutrition-examples">
        <strong>Quick Post-Workout Options:</strong>
        <ul>
          <li>Protein shake (30-40g) + banana + berries</li>
          <li>Grilled chicken breast + rice + vegetables</li>
          <li>Salmon + sweet potato + broccoli</li>
          <li>Greek yogurt bowl with granola and fruit</li>
          <li>Tuna sandwich + avocado on whole wheat</li>
          <li>Cottage cheese + pineapple + almonds</li>
          <li>Lean beef + quinoa + roasted vegetables</li>
        </ul>
      </div>
    </div>

    <div class="nutrition-section">
      <h4>Hydration During Workouts</h4>
      <div class="nutrition-timing">
        <strong>Standard Sessions (under 60 minutes):</strong>
        <p>Water is sufficient. Drink 6-8 oz every 15-20 minutes during exercise.</p>
      </div>
      <div class="nutrition-timing">
        <strong>Extended Sessions (60+ minutes):</strong>
        <p>Add electrolytes (sodium) and small amounts of carbohydrates to maintain performance and support electrolyte balance during prolonged training.</p>
      </div>
    </div>

    <div class="nutrition-callout">
      <p>
        <strong>💡 Research Insight:</strong> Recent meta-analyses show that women have a critical recovery window for muscle adaptation and hormonal resilience. Combined with proper pre-exercise fueling, strategic post-workout nutrition is critical for muscle adaptation, bone health, and long-term training success.
      </p>
    </div>

    <div style="margin-top: 16px; padding: 16px; background: #e8f4f8; border-radius: 8px; border-left: 4px solid var(--steel-blue);">
      <p style="margin: 0; font-size: 13px; color: #1c3144; line-height: 1.5;">
        <strong>Remember:</strong> These recommendations support your body's ability to recover from training. Combined with your 3+1 training cycle and deload weeks, proper nutrition is essential for long-term strength gains, bone health, and hormonal resilience.
      </p>
    </div>
  `;
}

document.addEventListener("DOMContentLoaded", function () {
  document.getElementById("weekSelect").addEventListener("change", (e) => {
    progressionLevel = parseInt(e.target.value);
    // Calculate selectedWeek: if trainingWeek is 4 (deload), always use 4, otherwise use progressionLevel
    if (trainingWeek === 4) {
      selectedWeek = 4; // Keep deload week selected
    } else {
      selectedWeek = progressionLevel; // Use the progression level for weeks 1-3
    }
    clearCelebrationFlags();
    updateApp();
  });
  document
    .getElementById("trainingWeekSelect")
    .addEventListener("change", (e) => {
      trainingWeek = parseInt(e.target.value);
      // Calculate selectedWeek: if trainingWeek is 4 (deload), always use 4, otherwise use progressionLevel
      if (trainingWeek === 4) {
        selectedWeek = 4; // Deload week
      } else {
        selectedWeek = progressionLevel; // Use the progression level for weeks 1-3
      }
      clearCelebrationFlags();
      updateApp();
    });
  document.getElementById("daySelect").addEventListener("change", (e) => {
    selectedDay = e.target.value;
    clearCelebrationFlags();
    updateApp();
  });
  document.getElementById("durationSelect").addEventListener("change", (e) => {
    selectedDuration = e.target.value;
    updateApp();
  });
  document.getElementById("locationSelect").addEventListener("change", (e) => {
    selectedLocation = e.target.value;
  });
  document
    .getElementById("equipmentButton")
    .addEventListener("click", showEquipmentModal);
  document
    .getElementById("closeModal")
    .addEventListener("click", () =>
      document.getElementById("equipmentModal").classList.add("hidden")
    );

  // Nutrition Guide button listeners
  document
    .getElementById("nutritionButton")
    .addEventListener("click", showNutritionGuide);
  document
    .getElementById("closeNutritionModal")
    .addEventListener("click", () =>
      document.getElementById("nutritionModal").classList.add("hidden")
    );

  // Close nutrition modal when clicking outside
  document.getElementById("nutritionModal").addEventListener("click", (e) => {
    if (e.target.id === "nutritionModal") {
      document.getElementById("nutritionModal").classList.add("hidden");
    }
  });

  updateApp();
});

function clearCelebrationFlags() {
  const keys = Object.keys(sessionStorage);
  keys.forEach((key) => {
    if (
      key.includes(`${selectedWeek}-${selectedDay}`) &&
      key.includes("celebrated")
    ) {
      sessionStorage.removeItem(key);
    }
  });
}

window.resetCelebrations = function () {
  sessionStorage.clear();
  console.log("All celebration flags cleared");
};

function removeExerciseAndContinue(phase, exerciseToRemove) {
  const key = `${selectedWeek}-${selectedDay}-${phase}-${exerciseToRemove}`;
  delete workoutSelections[key];

  const customKey = `${selectedWeek}-${selectedDay}-${phase}-${exerciseToRemove}`;
  delete customRounds[customKey];

  closeRemovalPrompt();
  updateApp();
}

function cancelRoundIncrease(phase, exerciseName) {
  const customKey = `${selectedWeek}-${selectedDay}-${phase}-${exerciseName}`;
  if (customRounds[customKey] > 1) {
    customRounds[customKey] = customRounds[customKey] - 1;
  } else {
    delete customRounds[customKey];
  }

  closeRemovalPrompt();
  updateApp();
}

function closeRemovalPrompt() {
  const modal = document.querySelector(".celebration-modal");
  if (modal) {
    modal.parentNode.removeChild(modal);
  }
}

window.removeExerciseAndContinue = removeExerciseAndContinue;
window.cancelRoundIncrease = cancelRoundIncrease;

// Get the appropriate exercise phase - maps Week 4 intense phases to deload
function getExercisePhase(phase) {
  // Week 4 (deload) uses gentle deload exercises instead of intensity phases
  if (
    selectedWeek === 4 &&
    (phase === "strength" || phase === "jump" || phase === "sit")
  ) {
    return "deload";
  }
  return phase;
}

function getSelectedExercises(phase) {
  const exercisePhase = getExercisePhase(phase);
  const exercises = [];
  Object.keys(workoutSelections).forEach((key) => {
    if (
      key.startsWith(`${selectedWeek}-${selectedDay}-${phase}`) &&
      workoutSelections[key]
    ) {
      const exerciseName = key.split("-").slice(3).join("-");
      exercises.push(exerciseName);
    }
  });
  return exercises;
}

function toggleRoundCompletion(phase, exerciseName, roundIndex) {
  const key = `${selectedWeek}-${selectedDay}-${phase}-${exerciseName}-${roundIndex}`;
  completedRounds[key] = !completedRounds[key];
  updateApp();

  setTimeout(() => {
    checkForPhaseCompletion(phase);
    checkWorkoutCompletion();
  }, 100);
}

function getRoundCompletionKey(phase, exerciseName, roundIndex) {
  return `${selectedWeek}-${selectedDay}-${phase}-${exerciseName}-${roundIndex}`;
}

function isRoundCompleted(phase, exerciseName, roundIndex) {
  const key = getRoundCompletionKey(phase, exerciseName, roundIndex);
  return completedRounds[key] || false;
}

function checkForPhaseCompletion(phase) {
  if (phase === "cooldown") {
    return;
  }

  const selectedExercises = getSelectedExercises(phase);
  const rounds = calculateRounds(phase, selectedExercises);

  if (selectedExercises.length === 0) {
    return;
  }

  let phaseRounds = 0;
  let phaseCompleted = 0;

  selectedExercises.forEach((exerciseName) => {
    const exerciseRounds = rounds[exerciseName] || 1;
    phaseRounds += exerciseRounds;

    for (let i = 1; i <= exerciseRounds; i++) {
      if (isRoundCompleted(phase, exerciseName, i)) {
        phaseCompleted++;
      }
    }
  });

  const isPhaseComplete = phaseRounds > 0 && phaseCompleted === phaseRounds;

  if (isPhaseComplete) {
    const celebrationKey = `${selectedWeek}-${selectedDay}-${phase}-celebrated`;
    const alreadyCelebrated = sessionStorage.getItem(celebrationKey);

    if (!alreadyCelebrated) {
      showMotivationalMoment(phase);
      sessionStorage.setItem(celebrationKey, "true");
    }
  }
}

function checkWorkoutCompletion() {
  const w = getCurrentWorkout();

  if (window.showingMotivationalMoment) {
    return;
  }

  let totalRounds = 0;
  let completedCount = 0;
  let workoutComplete = true;

  w.phases.forEach((phase) => {
    const selectedExercises = getSelectedExercises(phase);
    const rounds = calculateRounds(phase, selectedExercises);

    selectedExercises.forEach((exerciseName) => {
      const exerciseRounds = rounds[exerciseName] || 1;
      totalRounds += exerciseRounds;

      for (let i = 1; i <= exerciseRounds; i++) {
        if (isRoundCompleted(phase, exerciseName, i)) {
          completedCount++;
        } else {
          workoutComplete = false;
        }
      }
    });
  });

  if (totalRounds > 0 && workoutComplete && w.phases.includes("cooldown")) {
    const cooldownComplete = checkPhaseComplete("cooldown");
    if (cooldownComplete) {
      const finalCelebrationKey = `${selectedWeek}-${selectedDay}-final-celebration`;
      const alreadyShowedFinal = sessionStorage.getItem(finalCelebrationKey);

      if (!alreadyShowedFinal) {
        setTimeout(() => {
          const existingModal = document.querySelector(".celebration-modal");
          if (!existingModal) {
            showCelebration();
            sessionStorage.setItem(finalCelebrationKey, "true");
          } else {
            setTimeout(() => {
              if (!document.querySelector(".celebration-modal")) {
                showCelebration();
                sessionStorage.setItem(finalCelebrationKey, "true");
              }
            }, 1000);
          }
        }, 500);
      }
    }
  }
}

function checkPhaseComplete(phase) {
  const selectedExercises = getSelectedExercises(phase);
  const rounds = calculateRounds(phase, selectedExercises);

  if (selectedExercises.length === 0) return true;

  let phaseRounds = 0;
  let phaseCompleted = 0;

  selectedExercises.forEach((exerciseName) => {
    const exerciseRounds = rounds[exerciseName] || 1;
    phaseRounds += exerciseRounds;

    for (let i = 1; i <= exerciseRounds; i++) {
      if (isRoundCompleted(phase, exerciseName, i)) {
        phaseCompleted++;
      }
    }
  });

  return phaseRounds > 0 && phaseCompleted === phaseRounds;
}

function showMotivationalMoment(phase) {
  const activationJumpQuotes = [
    "Way to go!",
    "Keep going!",
    "You got this!",
    "Nice work!",
    "Crushing it!",
    "Looking strong!",
    "Keep it up!",
    "You're doing great!",
    "Fantastic start!",
    "On fire!",
    "Momentum building!",
    "Perfect form!",
  ];

  const strengthSITQuotes = [
    "Don't you feel less like tearing someone's head off, now?",
    "Hopefully, for at least 5 minutes, no one has 'Mom, Mom, MOM'ed you!",
    "While you're feeling this good, imagine yourself on a beach with a delicious frozen drink.",
    "Can you tolerate your MIL a little while longer now?",
    "I'm doing this for me... but I'm also doing it for ice cream!",
    "One rep closer to outlasting your grandkids' energy!",
    "This is your 'I survived menopause and all I got was this killer arm day' moment.",
    "Sweat now, shine later (and by 'shine,' I mean glow like a woman who just said 'no' to folding laundry).",
    "You're not getting older, you're getting more interesting and way stronger.",
    "Remember: Every squat is a 'take that' to gravity.",
    "If you can lift this, you can lift your own groceries without judging the bagger.",
    "This workout is cheaper than therapy and way more effective.",
    "You're not just burning calories - you're burning patriarchy.",
    "Strong is the new 'I'll show you who's too old for this.'",
    "You're not just lifting weights, you're lifting standards.",
    "Every rep is a high-five to your future self.",
    "If you can survive hot flashes, you can survive anything.",
    "This is your 'I don't need a man, I need a spotter' era.",
    "You're not 'tired,' you're marinating in endorphins.",
    "This kind of strngth will come in handy when your boss won't stop talking.",
    "You're not 'aging,' you're upgrading.",
    "This workout is your 'I don't have time for nonsense' cardio.",
    "Sweat is just your fat cells crying.",
    "Your vintage behind just kicked that phase's behind!",
    "Every lunge is a step away from 'I can't' and toward 'Watch me.'",
    "You're not just working out, you're practicing for your 'I told you so' moment.",
    "This is your 'I can still touch my toes and my patience is almost restored' time.",
    "You're beauty is a result of your age not diminished by it!",
    "You're 1 workout closer to opening your own damn jars!",
    "Remember: You're not just lifting weights, you're lifting your own damn spirits.",
  ];

  const cooldownQuotes = [
    "Now go and tackle your day!",
    "You're a queen!",
    "You came, you saw, you conquered this workout!",
    "Cross one more thing off your list!",
    "Workout: DONE. What's next?",
    "You showed up and crushed it!",
    "Time to seize the day!",
    "Mission accomplished!",
    "Today's workout: Complete. Today's attitude: Unstoppable.",
    "You did the work - now enjoy the results!",
    "Another workout in the books!",
    "Feeling strong and ready for anything!",
    "You earned this post-workout glow!",
  ];

  const phaseNames = {
    activation: "Activation Phase",
    jump: "Jump Phase",
    strength: "Strength Phase",
    power: "Power Phase",
    sit: "SIT Phase",
    integration: "Integration Phase",
    mobility: "Mobility Phase",
    cooldown: "Cool Down Phase",
  };

  const phaseName = phaseNames[phase] || "Phase";

  let randomComment;
  if (phase === "activation" || phase === "jump") {
    randomComment =
      activationJumpQuotes[
        Math.floor(Math.random() * activationJumpQuotes.length)
      ];
  } else if (
    phase === "strength" ||
    phase === "sit" ||
    phase === "power" ||
    phase === "integration"
  ) {
    randomComment =
      strengthSITQuotes[Math.floor(Math.random() * strengthSITQuotes.length)];
  } else if (phase === "cooldown") {
    randomComment =
      cooldownQuotes[Math.floor(Math.random() * cooldownQuotes.length)];
  } else {
    randomComment =
      activationJumpQuotes[
        Math.floor(Math.random() * activationJumpQuotes.length)
      ];
  }

  const existingModals = document.querySelectorAll(".celebration-modal");
  existingModals.forEach((modal) => modal.remove());

  const modal = document.createElement("div");
  modal.className = "celebration-modal motivational-modal";
  modal.style.background = "rgba(0,0,0,0.6)";
  modal.style.zIndex = "10001";
  modal.innerHTML = `
  <div class="celebration-content" style="background: #10b981; max-width: 450px;">
      <h2 style="font-size: 24px; margin-bottom: 16px; color: white;">Way to go! You've completed the ${phaseName}!</h2>
      <p style="font-size: 16px; margin-bottom: 24px; color: white; font-style: italic;">${randomComment}</p>
      <button onclick="closeMotivationalMoment()" style="background: white; color: #10b981; border: none; padding: 10px 20px; border-radius: 6px; font-size: 14px; font-weight: 600; cursor: pointer;">
          Continue Workout
      </button>
  </div>
`;

  document.body.appendChild(modal);
}

function closeMotivationalMoment() {
  const modals = document.querySelectorAll(".motivational-modal");
  modals.forEach((modal) => modal.remove());
}

window.closeMotivationalMoment = closeMotivationalMoment;

function showCelebration() {
  const confettiContainer = document.createElement("div");
  confettiContainer.className = "confetti";
  document.body.appendChild(confettiContainer);

  const colors = [
    "#f39c12",
    "#e74c3c",
    "#3498db",
    "#2ecc71",
    "#9b59b6",
    "#f1c40f",
  ];
  for (let i = 0; i < 150; i++) {
    const piece = document.createElement("div");
    piece.className = "confetti-piece";
    piece.style.left = Math.random() * 100 + "%";
    piece.style.background = colors[Math.floor(Math.random() * colors.length)];
    piece.style.animationDelay = Math.random() * 2 + "s";
    piece.style.animationDuration = Math.random() * 2 + 2 + "s";
    confettiContainer.appendChild(piece);
  }

  const motivationalQuotes = [
    "Every step forward is a victory worth celebrating!",
    "You're not just building strength, you're building your future!",
    "Progress isn't just physical - it's mental, emotional, and spiritual!",
    "You're writing a story of resilience with every workout!",
    "Strong women lift each other up - including their future selves!",
    "Your commitment today creates the confident woman of tomorrow!",
    "You're not just exercising, you're practicing self-love!",
    "Every workout is an investment in the amazing woman you're becoming!",
    "You're proof that dedication and determination create magic!",
    "Your strength journey inspires everyone around you!",
    "Today's effort becomes tomorrow's strength and confidence!",
    "You're building more than muscle - you're building character!",
  ];

  const randomQuote =
    motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];

  const modal = document.createElement("div");
  modal.className = "celebration-modal";
  modal.innerHTML = `
    <div class="celebration-content">
        <h1 style="font-size: 48px; margin-bottom: 20px; color: white;">ðŸŽ‰ Amazing!</h1>
        <h2 style="font-size: 32px; margin-bottom: 16px; color: white;">Workout Complete!</h2>
        <p style="font-size: 18px; margin-bottom: 30px; color: white; font-style: italic;">${randomQuote}</p>
    </div>
`;
  document.body.appendChild(modal);

  setTimeout(() => {
    if (confettiContainer.parentNode) {
      confettiContainer.parentNode.removeChild(confettiContainer);
    }
  }, 5000);

  setTimeout(() => {
    if (modal.parentNode) {
      modal.parentNode.removeChild(modal);
    }
  }, 6000);
}

function closeCelebration() {
  const modal = document.querySelector(".celebration-modal");
  if (modal) {
    modal.parentNode.removeChild(modal);
  }
}

window.closeCelebration = closeCelebration;

function getPhaseTargetTime(phase) {
  // For jump phase, return time based on training level
  if (phase === "jump") {
    if (selectedWeek === 1) {
      return 3; // Beginner: 3 minutes
    } else if (selectedWeek === 2) {
      return 4; // Intermediate: 4 minutes
    } else if (selectedWeek === 3) {
      return 5; // Advanced: 5 minutes
    } else if (selectedWeek === 4) {
      return 3; // Deload: 3 minutes
    }
  }

  const baseTimes = {
    jump: 10, // fallback (shouldn't reach here due to above)
    strength: 25,
    sit: null, // SIT calculates time from exercise selections, not target time
    activation: 5,
    power: 18,
    mobility: 15,
    integration: 20,
    deload: 10,
    cooldown: 5,
  };

  const baseTime = baseTimes[phase];
  if (baseTime === null) return null; // SIT phase

  const durationMultipliers = {
    quick: 0.7,
    standard: 1.0,
    extended: 1.3,
  };

  const multiplier = durationMultipliers[selectedDuration] || 1.0;
  return Math.round(baseTime * multiplier);
}

// Calculate total SIT time from selected exercises and their rounds
function calculateSITPhaseTime(selectedExercises) {
  if (selectedExercises.length === 0) return 0;

  const rounds = calculateRounds("sit", selectedExercises);
  let totalSeconds = 0;

  selectedExercises.forEach((exerciseName) => {
    const numRounds = rounds[exerciseName] || 3; // Default to 3 rounds if not found

    // Each SIT exercise: 20s work + rest time
    const restTimes = {
      "Modified Jump Squats (20s)": 100, // HR<120
      "Light Thrusters (20s)": 100,
      "Fast Bodyweight Squats (20s)": 90, // HR<125
      "Burpee Intervals (20s)": 90,
      "Mountain Climbers (20s)": 90,
      "High Knees (20s)": 100,
      "Sprint Intervals (20s)": 120, // 2min recovery
      "Complex Circuit (20s)": 120,
    };

    const restPerRound = restTimes[exerciseName] || 90;
    const workTime = 20; // 20 seconds work
    const timePerRound = workTime + restPerRound;
    totalSeconds += timePerRound * numRounds;
  });

  return Math.round(totalSeconds / 60); // Return minutes
}

function getMaxSelections(phase) {
  return (
    {
      jump: 4,
      sit: 6,
      activation: 3,
      mobility: 5,
      cooldown: 4,
      strength: 4,
      power: 4,
      integration: 4,
    }[phase] || 4
  );
}

function getSelectedCount(phase) {
  return Object.keys(workoutSelections).filter(
    (k) =>
      k.startsWith(`${selectedWeek}-${selectedDay}-${phase}`) &&
      workoutSelections[k]
  ).length;
}

function getCalculatedTime(phase) {
  const selectedExercises = getSelectedExercises(phase);

  // Special handling for SIT phase - calculate from exercises with rest
  if (phase === "sit") {
    return calculateSITPhaseTime(selectedExercises);
  }

  const exercisePhase = getExercisePhase(phase);
  const rounds = calculateRounds(phase, selectedExercises);

  // Determine work interval based on training level (for jump phase)
  let workIntervalMinutes = 1; // default for other phases
  if (phase === "jump") {
    if (selectedWeek === 1) {
      workIntervalMinutes = 20 / 60; // Beginner: 20 seconds
    } else if (selectedWeek === 2) {
      workIntervalMinutes = 30 / 60; // Intermediate: 30 seconds
    } else if (selectedWeek === 3) {
      workIntervalMinutes = 30 / 60; // Advanced: 30 seconds
    } else if (selectedWeek === 4) {
      workIntervalMinutes = 20 / 60; // Deload: beginner level
    }
  }

  let totalTime = 0;
  selectedExercises.forEach((exerciseName) => {
    let baseTime;

    if (phase === "jump") {
      // Use the training-level work interval for jump
      baseTime = workIntervalMinutes;
    } else {
      // Use exerciseBaseTimes for other phases
      baseTime = exerciseBaseTimes[exercisePhase]?.[exerciseName] || 2;
    }

    const exerciseRounds = rounds[exerciseName] || 1;
    totalTime += baseTime * exerciseRounds;
  });

  return Math.round(totalTime);
}

function updateApp() {
  const w = getCurrentWorkout();
  document.getElementById("workoutTitle").textContent = `${
    selectedDay.charAt(0).toUpperCase() + selectedDay.slice(1)
  }: ${w.type}${selectedWeek === 4 ? " (DELOAD WEEK)" : ""}`;

  // Hide duration selector for SIT-only workouts
  const durationSelectContainer =
    document.getElementById("durationSelect").parentElement.parentElement;
  const isSITOnly =
    (w.phases.length === 1 && w.phases[0] === "sit") ||
    (w.phases.length === 2 &&
      w.phases.includes("sit") &&
      w.phases.includes("cooldown")) ||
    (w.phases.length === 2 &&
      w.phases.includes("sit") &&
      w.phases.includes("activation"));

  if (isSITOnly) {
    durationSelectContainer.style.display = "none";
  } else {
    durationSelectContainer.style.display = "block";
  }

  document.getElementById(
    "workoutDuration"
  ).textContent = `${w.duration[selectedDuration]} minutes`;
  document.getElementById("phasesList").innerHTML = w.phases
    .map((p) => `<span class="phase-badge">${getPhaseTitle(p)}</span>`)
    .join("");

  document.getElementById("exerciseSelection").innerHTML = w.phases
    .map((phase) => {
      const selected = getSelectedCount(phase);
      const max = getMaxSelections(phase);
      const selectedExercises = getSelectedExercises(phase);
      const rounds = calculateRounds(phase, selectedExercises);
      const calculatedTime = getCalculatedTime(phase);
      const targetTime = getPhaseTargetTime(phase);
      const timeStatus =
        phase === "cooldown" || phase === "sit"
          ? "good"
          : calculatedTime <= targetTime + 2
          ? "good"
          : "over";
      const isPhaseOpen = openPhases.has(phase);

      const exercisePhase = getExercisePhase(phase);
      const exercises = (exerciseOptions[exercisePhase] || []).map((ex) => {
        const key = `${selectedWeek}-${selectedDay}-${phase}-${ex.name}`;
        const isSelected = workoutSelections[key];
        const exerciseRounds = rounds[ex.name] || 0;
        return { ex, key, isSelected, exerciseRounds };
      });

      let hrCalculatorHTML = "";
      if (phase === "sit") {
        const hr80 = maxHR ? Math.round(maxHR * 0.8) : null;
        const hr90 = maxHR ? Math.round(maxHR * 0.9) : null;
        const hr100 = maxHR ? Math.round(maxHR * 1.0) : null;

        hrCalculatorHTML = `
            <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px; margin-bottom: 16px; border-radius: 4px;">
                <div style="margin-bottom: 12px;">
                    <label style="font-size: 14px; font-weight: 600; color: #92400e; margin-bottom: 8px; display: block;">
                        Calculate Your Target Heart Rate
                    </label>
                    <div style="display: flex; gap: 8px; align-items: center;">
                        <input type="number" id="ageInput" placeholder="Enter your age" 
                               style="padding: 8px; border: 1px solid #d97706; border-radius: 4px; width: 150px; font-size: 14px;"
                               value="${userAge || ""}"
                               min="18" max="100">
                        <button data-action="calculate-hr" 
                                style="background: #f59e0b; color: white; border: none; padding: 8px 16px; border-radius: 4px; font-size: 14px; font-weight: 600; cursor: pointer; transition: background-color 0.2s ease;">
                            Calculate
                        </button>
                    </div>
                </div>
                ${
                  maxHR
                    ? `
                    <div style="background: white; padding: 12px; border-radius: 4px; margin-top: 8px;">
                        <p style="margin: 0 0 8px 0; font-size: 14px; color: #92400e; font-weight: 600;">
                            Your Target Heart Rate Zones for SIT:
                        </p>
                        <div style="display: flex; flex-direction: column; gap: 6px;">
                            <div style="display: flex; justify-content: space-between; align-items: center; padding: 6px; background: #fef3c7; border-radius: 4px;">
                                <span style="font-size: 13px; color: #92400e;">80% Max HR (Moderate):</span>
                                <span style="font-weight: 600; font-size: 14px; color: #92400e;">${hr80} bpm</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; align-items: center; padding: 6px; background: #fed7aa; border-radius: 4px;">
                                <span style="font-size: 13px; color: #92400e;">90% Max HR (Hard):</span>
                                <span style="font-weight: 600; font-size: 14px; color: #92400e;">${hr90} bpm</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; align-items: center; padding: 6px; background: #fb923c; border-radius: 4px;">
                                <span style="font-size: 13px; color: white;">100% Max HR (Maximum):</span>
                                <span style="font-weight: 600; font-size: 14px; color: white;">${hr100} bpm</span>
                            </div>
                        </div>
                        <p style="margin: 8px 0 0 0; font-size: 12px; color: #92400e; font-style: italic;">
                            Target 80-100% during work intervals. Use a heart rate monitor or fitness tracker for best results.
                        </p>
                    </div>
                `
                    : ""
                }
            </div>
        `;
      }

      const shouldShowCompactView = !isPhaseOpen && selected > 0;

      return `
        <div class="phase-section" data-phase="${phase}">
            <div class="phase-header" data-toggle="${phase}">
                <h3 style="margin:0">${getPhaseTitle(phase)}</h3>
                <div style="display:flex;gap:12px;align-items:center">
                    <span class="badge" style="background: ${
                      timeStatus === "over" ? "#fef2f2" : "#dbeafe"
                    }; color: ${
        timeStatus === "over" ? "#dc2626" : "#1e40af"
      }; font-size: 14px;">
                        ${
                          phase === "sit"
                            ? calculatedTime === 0
                              ? "Choose 4-6 exercises"
                              : `${calculatedTime} min`
                            : `${calculatedTime}/${targetTime} min`
                        }
                    </span>
                    <span class="toggle-arrow">${isPhaseOpen ? "▲" : "▼"}</span>
                </div>
            </div>
            <style>
              @media (max-width: 768px) {
                .badge {
                  font-size: 12px !important;
                  white-space: nowrap;
                }
              }
            </style>
            <div class="phase-content ${
              isPhaseOpen ? "show" : ""
            }" data-content="${phase}">
                ${isPhaseOpen ? hrCalculatorHTML : ""}
                ${
                  isPhaseOpen && phaseExplanations[phase]
                    ? `
                    <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px; margin-bottom: 16px; border-radius: 4px;">
                        <p style="margin: 0; font-size: 14px; color: #92400e; line-height: 1.4;">
                            <strong>Why This Matters:</strong> ${phaseExplanations[phase]}
                        </p>
                    </div>
                `
                    : ""
                }
                ${isPhaseOpen && phase === "activation" ? `` : ""}
                ${
                  exercises.filter((e) => e.isSelected).length
                    ? `
                    <div style="margin-bottom:16px">
                        <h4>${isPhaseOpen ? "Your Workout Plan" : ""}</h4>
                        <div class="exercise-grid">
                            ${exercises
                              .filter((e) => e.isSelected)
                              .map(
                                ({ ex, key, exerciseRounds }) => `
                                <div class="exercise-card selected" data-key="${key}" data-phase="${phase}">
                                    <div style="display: flex; justify-content: flex-start; align-items: flex-start; margin-bottom: 4px; gap: 12px; flex-wrap: wrap;">
                                        <h4 style="margin: 0; flex-grow: 1;">${
                                          ex.name
                                        }</h4>
                                        ${
                                          isPhaseOpen
                                            ? `
                                        <div style="display: flex; align-items: center; gap: 8px;">
                                            <button class="round-btn" data-action="decrease" data-exercise="${
                                              ex.name
                                            }" data-phase="${phase}" style="width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;">-</button>
                                            <span style="background: #dcfce7; color: #166534; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 600; min-width: 80px; text-align: center; white-space: nowrap;">
                                                ${
                                                  phase === "jump"
                                                    ? `${exerciseRounds} rounds × ${
                                                        selectedWeek === 1
                                                          ? "20s"
                                                          : selectedWeek === 2
                                                          ? "30s"
                                                          : selectedWeek === 3
                                                          ? "30s"
                                                          : "20s"
                                                      } each`
                                                    : phase === "sit" ||
                                                      phase === "activation"
                                                    ? `${exerciseRounds} rounds × ${ex.reps}`
                                                    : `${exerciseRounds} ${
                                                        exerciseRounds === 1
                                                          ? "round"
                                                          : "rounds"
                                                      }`
                                                }
                                            </span>
                                            <button class="round-btn" data-action="increase" data-exercise="${
                                              ex.name
                                            }" data-phase="${phase}" style="width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;">+</button>
                                        </div>
                                        `
                                            : `
                                        <span style="background: #dcfce7; color: #166534; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 600; white-space: nowrap;">
                                            ${
                                              phase === "jump"
                                                ? `${exerciseRounds} × ${
                                                    selectedWeek === 1
                                                      ? "20s"
                                                      : selectedWeek === 2
                                                      ? "30s"
                                                      : selectedWeek === 3
                                                      ? "30s"
                                                      : "20s"
                                                  }`
                                                : phase === "sit" ||
                                                  phase === "activation"
                                                ? `${exerciseRounds} × ${ex.reps}`
                                                : `${exerciseRounds} ${
                                                    exerciseRounds === 1
                                                      ? "round"
                                                      : "rounds"
                                                  }`
                                            }
                                        </span>
                                        `
                                        }
                                    </div>
                                    ${
                                      isPhaseOpen
                                        ? `
                                    <div class="exercise-details">
                                        <span>
                                          ${
                                            phase === "jump" || phase === "sit"
                                              ? `${
                                                  selectedWeek === 1
                                                    ? "20s"
                                                    : selectedWeek === 2
                                                    ? "30s"
                                                    : selectedWeek === 3
                                                    ? "40s"
                                                    : "20s"
                                                } work`
                                              : phase === "activation"
                                              ? `60s`
                                              : ex.reps
                                          }
                                        </span>
                                        <span>${ex.weight}</span>
                                        <span>Rest: ${ex.rest}</span>
                                    </div>
                                    <p style="margin-top: 8px; font-size: 13px; color: #6b7280; line-height: 1.3; width: 100%; box-sizing: border-box; word-wrap: break-word; overflow-wrap: break-word; word-break: break-word;">${
                                      ex.description
                                    }</p>
                                    `
                                        : ""
                                    }
                                </div>
                            `
                              )
                              .join("")}
                        </div>
                    </div>
                `
                    : ""
                }
                ${
                  isPhaseOpen && exercises.filter((e) => !e.isSelected).length
                    ? `
                    <div>
                        <h4>Available Exercises</h4>
                        <div class="exercise-grid">
                            ${exercises
                              .filter((e) => !e.isSelected)
                              .map(
                                ({ ex, key }) => `
                                <div class="exercise-card" data-key="${key}" data-phase="${phase}">
                                    <h4>${ex.name}</h4>
                                    <div class="exercise-details">
                                        <span>${
                                          phase === "jump"
                                            ? `${
                                                selectedWeek === 1
                                                  ? "20s"
                                                  : selectedWeek === 2
                                                  ? "30s"
                                                  : selectedWeek === 3
                                                  ? "30s"
                                                  : "20s"
                                              }`
                                            : ex.reps
                                        }</span>
                                        <span>${ex.weight}</span>
                                        <span>Rest: ${ex.rest}</span>
                                    </div>
                                    <p style="margin-top: 8px; font-size: 13px; color: #6b7280; line-height: 1.3;">${
                                      ex.description
                                    }</p>
                                </div>
                            `
                              )
                              .join("")}
                        </div>
                    </div>
                `
                    : ""
                }
            </div>
        </div>
    `;
    })
    .join("");

  addEventListeners();
  restoreOpenPhases();
}

// ========== FLOATING INTERVAL TIMER WIDGET ==========
// Independent timer widget - does not affect any existing functionality

let timerState = {
  isRunning: false,
  timeLeft: 30,
  totalTime: 30,
  intervalId: null,
};

function initializeTimerWidget() {
  // Create timer widget HTML
  const timerWidget = document.createElement("div");
  timerWidget.id = "floating-timer-widget";
  timerWidget.innerHTML = `
    <div style="position: fixed; bottom: 80px; right: 20px; z-index: 999; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;">
      <!-- Collapsed button -->
      <button id="timer-toggle-btn" style="
        position: absolute;
        bottom: 0;
        right: 0;
        width: 56px;
        height: 56px;
        border-radius: 50%;
        background: #3f88c5;
        color: white;
        border: none;
        font-size: 24px;
        cursor: pointer;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.3s ease;
      " title="Open Timer">⏱</button>

      <!-- Expanded timer panel -->
      <div id="timer-panel" style="
        position: absolute;
        bottom: 80px;
        right: 0;
        background: white;
        border-radius: 12px;
        box-shadow: 0 8px 24px rgba(0,0,0,0.2);
        padding: 20px;
        width: 280px;
        display: none;
      ">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
          <h3 style="margin: 0; font-size: 16px; color: #1c3144;">Interval Timer</h3>
          <button id="timer-close-btn" style="background: none; border: none; font-size: 20px; cursor: pointer; color: #6b7280;">&times;</button>
        </div>

        <!-- Audio Alert Reminder -->
        <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 8px; margin-bottom: 12px; border-radius: 4px;">
          <p style="margin: 0; font-size: 12px; color: #92400e;">Click <strong>Test Sound</strong> first to enable audio alerts at countdown completion.</p>
        </div>

        <!-- Time Input -->
        <div style="margin-bottom: 12px;">
          <label style="display: block; font-size: 12px; font-weight: 600; color: #374151; margin-bottom: 6px;">Time (seconds)</label>
          <input type="number" id="timer-input" min="1" max="300" value="30" style="
            width: 100%;
            padding: 8px;
            border: 1px solid #d1d5db;
            border-radius: 6px;
            font-size: 14px;
            box-sizing: border-box;
          " />
        </div>

        <!-- Quick Presets -->
        <div style="display: flex; gap: 6px; margin-bottom: 12px;">
          <button class="timer-preset" data-time="20" style="flex: 1; padding: 8px; background: #f3f4f6; border: 1px solid #d1d5db; border-radius: 6px; font-size: 12px; font-weight: 600; cursor: pointer; color: #374151;">20s</button>
          <button class="timer-preset" data-time="30" style="flex: 1; padding: 8px; background: #f3f4f6; border: 1px solid #d1d5db; border-radius: 6px; font-size: 12px; font-weight: 600; cursor: pointer; color: #374151;">30s</button>
          <button class="timer-preset" data-time="60" style="flex: 1; padding: 8px; background: #f3f4f6; border: 1px solid #d1d5db; border-radius: 6px; font-size: 12px; font-weight: 600; cursor: pointer; color: #374151;">60s</button>
        </div>

        <div style="display: flex; gap: 6px; margin-bottom: 12px;">
          <button class="timer-preset" data-time="90" style="flex: 1; padding: 8px; background: #f3f4f6; border: 1px solid #d1d5db; border-radius: 6px; font-size: 12px; font-weight: 600; cursor: pointer; color: #374151;">90s</button>
          <button class="timer-preset" data-time="120" style="flex: 1; padding: 8px; background: #f3f4f6; border: 1px solid #d1d5db; border-radius: 6px; font-size: 12px; font-weight: 600; cursor: pointer; color: #374151;">2min</button>
        </div>

        <!-- Timer Display -->
        <div id="timer-display" style="
          font-size: 48px;
          font-weight: bold;
          text-align: center;
          color: #3f88c5;
          font-family: 'Courier New', monospace;
          letter-spacing: 2px;
          margin: 20px 0;
        ">00:30</div>

        <!-- Controls -->
        <div style="display: flex; gap: 8px;">
          <button id="timer-start-btn" style="
            flex: 1;
            padding: 10px;
            background: #ffba08;
            color: black;
            border: none;
            border-radius: 6px;
            font-weight: 600;
            cursor: pointer;
            font-size: 14px;
          ">Start</button>
          <button id="timer-pause-btn" style="
            flex: 1;
            padding: 10px;
            background: #d00000;
            color: white;
            border: none;
            border-radius: 6px;
            font-weight: 600;
            cursor: pointer;
            font-size: 14px;
            display: none;
          ">Pause</button>
          <button id="timer-reset-btn" style="
            flex: 1;
            padding: 10px;
            background: #a2aebb;
            color: white;
            border: none;
            border-radius: 6px;
            font-weight: 600;
            cursor: pointer;
            font-size: 14px;
          ">Reset</button>
        </div>

        <div style="margin-top: 12px; display: flex; gap: 6px;">
          <button id="timer-test-btn" style="
            flex: 1;
            padding: 8px;
            background: #10b981;
            color: white;
            border: none;
            border-radius: 6px;
            font-weight: 600;
            cursor: pointer;
            font-size: 12px;
          ">Test Sound</button>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(timerWidget);

  // Event listeners for timer
  document.getElementById("timer-toggle-btn").addEventListener("click", () => {
    const panel = document.getElementById("timer-panel");
    panel.style.display = panel.style.display === "none" ? "block" : "none";
  });

  document.getElementById("timer-close-btn").addEventListener("click", () => {
    document.getElementById("timer-panel").style.display = "none";
  });

  // Preset buttons
  document.querySelectorAll(".timer-preset").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const time = parseInt(e.target.dataset.time);
      document.getElementById("timer-input").value = time;
      timerState.totalTime = time;
      timerState.timeLeft = time;
      updateTimerDisplay();
    });
  });

  // Input change
  document.getElementById("timer-input").addEventListener("change", (e) => {
    const time = parseInt(e.target.value) || 30;
    timerState.totalTime = time;
    timerState.timeLeft = time;
    updateTimerDisplay();
  });

  // Start button
  document
    .getElementById("timer-start-btn")
    .addEventListener("click", startTimer);

  // Pause button
  document
    .getElementById("timer-pause-btn")
    .addEventListener("click", pauseTimer);

  // Reset button
  document
    .getElementById("timer-reset-btn")
    .addEventListener("click", resetTimer);

  // Test sound button
  document.getElementById("timer-test-btn").addEventListener("click", () => {
    playTimerBeep();
    console.log("Test sound triggered");
  });
}

function updateTimerDisplay() {
  const minutes = Math.floor(Math.max(0, timerState.timeLeft) / 60);
  const seconds = Math.max(0, timerState.timeLeft) % 60;
  const display = `${String(minutes).padStart(2, "0")}:${String(
    seconds
  ).padStart(2, "0")}`;
  const timerDisplay = document.getElementById("timer-display");
  if (timerDisplay) {
    timerDisplay.textContent = display;
  }
}

function startTimer() {
  if (timerState.isRunning) return;

  // Initialize Tone on user interaction
  initTone();

  timerState.isRunning = true;
  document.getElementById("timer-start-btn").style.display = "none";
  document.getElementById("timer-pause-btn").style.display = "flex";
  document.getElementById("timer-input").disabled = true;

  timerState.intervalId = setInterval(() => {
    timerState.timeLeft--;
    updateTimerDisplay();

    if (timerState.timeLeft <= 0) {
      console.log("Timer hit 0 - calling playTimerBeep");
      clearInterval(timerState.intervalId);
      timerState.isRunning = false;

      // Use same beep as test button
      playTimerBeep();
      console.log("playTimerBeep() called");

      document.getElementById("timer-start-btn").style.display = "flex";
      document.getElementById("timer-pause-btn").style.display = "none";
      document.getElementById("timer-input").disabled = false;
    }
  }, 1000);
}

function pauseTimer() {
  if (!timerState.isRunning) return;

  clearInterval(timerState.intervalId);
  timerState.isRunning = false;
  document.getElementById("timer-start-btn").style.display = "flex";
  document.getElementById("timer-pause-btn").style.display = "none";
}

function resetTimer() {
  clearInterval(timerState.intervalId);
  timerState.isRunning = false;
  timerState.timeLeft = timerState.totalTime;
  updateTimerDisplay();
  document.getElementById("timer-start-btn").style.display = "flex";
  document.getElementById("timer-pause-btn").style.display = "none";
  document.getElementById("timer-input").disabled = false;
}

function playTimerBeep() {
  try {
    const vibrationEnabled =
      document.getElementById("timer-vibration-toggle")?.checked || false;

    // Use global context that was initialized on first user interaction
    const ctx = globalAudioContext || getAudioContext();
    
    if (ctx.state === "suspended") {
      ctx.resume();
    }

    playWebAudioBeep(ctx);

    if (vibrationEnabled && navigator.vibrate) {
      navigator.vibrate([200, 100, 200]);
    }
  } catch (error) {
    console.log("Error playing beep:", error);
  }
}

let globalAudioContext = null;
let toneInitialized = false;

function initTone() {
  if (toneInitialized) return;
  try {
    if (typeof Tone !== 'undefined') {
      Tone.start();
      toneInitialized = true;
      console.log("Tone.js initialized");
    }
  } catch (e) {
    console.log("Tone.js init error:", e);
  }
}

function getAudioContext() {
  if (!globalAudioContext) {
    globalAudioContext = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (globalAudioContext.state === "suspended") {
    globalAudioContext.resume().catch(e => console.log("Resume failed:", e));
  }
  return globalAudioContext;
}

function playWebAudioBeep(audioContext) {
  try {
    const ctx = audioContext || getAudioContext();
    
    if (ctx.state === "suspended") {
      ctx.resume();
    }
    
    // Play 3 beeps
    for (let i = 0; i < 3; i++) {
      setTimeout(() => {
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.frequency.value = 800;
        osc.type = "sine";

        gain.gain.setValueAtTime(0.5, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

        osc.start(now);
        osc.stop(now + 0.3);
      }, i * 400);
    }

    console.log("Web Audio beep played (3x)");
  } catch (e) {
    console.log("Beep error:", e);
  }
}

// Initialize audio context on first user interaction
function initAudioContext() {
  try {
    const audioContext = new (window.AudioContext ||
      window.webkitAudioContext)();
    if (audioContext.state === "suspended") {
      audioContext.resume();
    }
    globalAudioContext = audioContext;
  } catch (e) {
    console.log("Audio context init:", e);
  }
}

document.addEventListener("click", initAudioContext, { once: true });
document.addEventListener("touchstart", initAudioContext, { once: true });

// Re-initialize on orientation change
window.addEventListener("orientationchange", () => {
  console.log("Orientation changed - resuming audio context");
  if (globalAudioContext && globalAudioContext.state === "suspended") {
    globalAudioContext.resume();
  }
});

window.addEventListener("resize", () => {
  if (globalAudioContext && globalAudioContext.state === "suspended") {
    globalAudioContext.resume();
  }
});

// Initialize timer when page loads
document.addEventListener("DOMContentLoaded", initializeTimerWidget);
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeTimerWidget);
} else {
  initializeTimerWidget();
}
