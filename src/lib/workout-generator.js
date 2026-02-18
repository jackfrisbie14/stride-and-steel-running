import { archetypes } from "./archetypes";
import { getAnthropicClient } from "./anthropic";

// ─── Run Template Pools ────────────────────────────────────────────────

const runTemplates = {
  easy: {
    beginner: {
      title: "Easy Run",
      exercises: [
        { name: "Warm-up Walk", duration: "5 min", pace: "Easy" },
        { name: "Easy Run", duration: "20 min", pace: "Conversational pace (Zone 2)" },
        { name: "Cool-down Walk", duration: "5 min", pace: "Easy" },
        { name: "Post-Run Stretching", duration: "10 min", notes: "Focus on hips, quads, calves" },
      ],
    },
    intermediate: {
      title: "Easy Run",
      exercises: [
        { name: "Warm-up Walk", duration: "5 min", pace: "Easy" },
        { name: "Easy Run", duration: "30 min", pace: "Conversational pace (Zone 2)" },
        { name: "Cool-down Walk", duration: "5 min", pace: "Easy" },
        { name: "Post-Run Stretching", duration: "10 min", notes: "Focus on hips, quads, calves" },
      ],
    },
    advanced: {
      title: "Easy Run",
      exercises: [
        { name: "Warm-up Jog", duration: "5 min", pace: "Easy" },
        { name: "Easy Run", duration: "40 min", pace: "Conversational pace (Zone 2)" },
        { name: "Cool-down Jog", duration: "5 min", pace: "Easy" },
        { name: "Post-Run Stretching", duration: "10 min", notes: "Focus on hips, quads, calves" },
      ],
    },
  },
  tempo: {
    beginner: {
      title: "Tempo Run",
      exercises: [
        { name: "Warm-up Jog", duration: "10 min", pace: "Easy" },
        { name: "Tempo Run", duration: "12 min", pace: "Comfortably hard (Zone 3)" },
        { name: "Cool-down Jog", duration: "8 min", pace: "Easy" },
        { name: "Dynamic Stretching", duration: "5 min", notes: "Leg swings, hip circles" },
      ],
    },
    intermediate: {
      title: "Tempo Run",
      exercises: [
        { name: "Warm-up Jog", duration: "10 min", pace: "Easy" },
        { name: "Tempo Run", duration: "20 min", pace: "Comfortably hard (Zone 3-4)" },
        { name: "Cool-down Jog", duration: "10 min", pace: "Easy" },
        { name: "Dynamic Stretching", duration: "5 min", notes: "Leg swings, hip circles" },
      ],
    },
    advanced: {
      title: "Tempo Run",
      exercises: [
        { name: "Warm-up Jog", duration: "10 min", pace: "Easy" },
        { name: "Tempo Run", duration: "30 min", pace: "Lactate threshold (Zone 4)" },
        { name: "Cool-down Jog", duration: "10 min", pace: "Easy" },
        { name: "Dynamic Stretching", duration: "5 min", notes: "Leg swings, hip circles" },
      ],
    },
  },
  long: {
    beginner: {
      title: "Long Run",
      exercises: [
        { name: "Warm-up Walk", duration: "5 min", pace: "Easy" },
        { name: "Long Run", duration: "30-40 min", pace: "Easy/Conversational (Zone 2)" },
        { name: "Cool-down Walk", duration: "5 min", pace: "Easy" },
        { name: "Foam Rolling", duration: "15 min", notes: "IT band, quads, calves, glutes" },
      ],
    },
    intermediate: {
      title: "Long Run",
      exercises: [
        { name: "Warm-up Walk", duration: "5 min", pace: "Easy" },
        { name: "Long Run", duration: "45-60 min", pace: "Easy/Conversational (Zone 2)" },
        { name: "Cool-down Walk", duration: "5 min", pace: "Easy" },
        { name: "Foam Rolling", duration: "15 min", notes: "IT band, quads, calves, glutes" },
      ],
    },
    advanced: {
      title: "Long Run",
      exercises: [
        { name: "Warm-up Jog", duration: "10 min", pace: "Easy" },
        { name: "Long Run", duration: "60-90 min", pace: "Easy/Conversational (Zone 2)" },
        { name: "Cool-down Jog", duration: "5 min", pace: "Easy" },
        { name: "Foam Rolling", duration: "15 min", notes: "IT band, quads, calves, glutes" },
      ],
    },
  },
  intervals: {
    beginner: {
      title: "Interval Run",
      exercises: [
        { name: "Warm-up Jog", duration: "10 min", pace: "Easy" },
        { name: "Intervals", duration: "6 × 1 min hard / 2 min easy", pace: "Zone 4-5 / Zone 1" },
        { name: "Cool-down Jog", duration: "10 min", pace: "Easy" },
        { name: "Stretching", duration: "5 min", notes: "Full body" },
      ],
    },
    intermediate: {
      title: "Interval Run",
      exercises: [
        { name: "Warm-up Jog", duration: "10 min", pace: "Easy" },
        { name: "Intervals", duration: "8 × 400m", pace: "5K pace with 90 sec jog rest" },
        { name: "Cool-down Jog", duration: "10 min", pace: "Easy" },
        { name: "Stretching", duration: "5 min", notes: "Full body" },
      ],
    },
    advanced: {
      title: "Interval Run",
      exercises: [
        { name: "Warm-up Jog", duration: "15 min", pace: "Easy" },
        { name: "Intervals", duration: "10 × 400m", pace: "Sub-5K pace with 60 sec jog rest" },
        { name: "Cool-down Jog", duration: "10 min", pace: "Easy" },
        { name: "Strides", duration: "4 × 100m", pace: "Fast & relaxed" },
      ],
    },
  },
  hills: {
    beginner: {
      title: "Hill Repeats",
      exercises: [
        { name: "Warm-up Jog", duration: "10 min", pace: "Easy" },
        { name: "Hill Repeats", duration: "4 × 30 sec uphill", pace: "Hard effort, jog down recovery" },
        { name: "Cool-down Jog", duration: "10 min", pace: "Easy" },
        { name: "Stretching", duration: "5 min", notes: "Calves, quads, glutes" },
      ],
    },
    intermediate: {
      title: "Hill Repeats",
      exercises: [
        { name: "Warm-up Jog", duration: "10 min", pace: "Easy" },
        { name: "Hill Repeats", duration: "6 × 45 sec uphill", pace: "Hard effort, jog down recovery" },
        { name: "Cool-down Jog", duration: "10 min", pace: "Easy" },
        { name: "Strides", duration: "4 × 100m flat", pace: "Fast & relaxed" },
      ],
    },
    advanced: {
      title: "Hill Repeats",
      exercises: [
        { name: "Warm-up Jog", duration: "15 min", pace: "Easy" },
        { name: "Hill Repeats", duration: "8 × 60 sec uphill", pace: "Hard effort, jog down recovery" },
        { name: "Cool-down Jog", duration: "10 min", pace: "Easy" },
        { name: "Strides", duration: "4 × 100m flat", pace: "Fast & relaxed" },
      ],
    },
  },
  fartlek: {
    beginner: {
      title: "Fartlek Run",
      exercises: [
        { name: "Warm-up Jog", duration: "10 min", pace: "Easy" },
        { name: "Fartlek", duration: "15 min", pace: "Alternate 1 min fast / 2 min easy" },
        { name: "Cool-down Jog", duration: "5 min", pace: "Easy" },
        { name: "Stretching", duration: "5 min", notes: "Full body" },
      ],
    },
    intermediate: {
      title: "Fartlek Run",
      exercises: [
        { name: "Warm-up Jog", duration: "10 min", pace: "Easy" },
        { name: "Fartlek", duration: "20 min", pace: "Mix surges of 30s-3min, recover by feel" },
        { name: "Cool-down Jog", duration: "10 min", pace: "Easy" },
        { name: "Stretching", duration: "5 min", notes: "Full body" },
      ],
    },
    advanced: {
      title: "Fartlek Run",
      exercises: [
        { name: "Warm-up Jog", duration: "10 min", pace: "Easy" },
        { name: "Fartlek", duration: "30 min", pace: "1-2-3-2-1 min ladder, easy jog between" },
        { name: "Cool-down Jog", duration: "10 min", pace: "Easy" },
        { name: "Strides", duration: "4 × 100m", pace: "Fast & relaxed" },
      ],
    },
  },
  progression: {
    beginner: {
      title: "Progression Run",
      exercises: [
        { name: "Easy Pace", duration: "15 min", pace: "Conversational (Zone 2)" },
        { name: "Moderate Pace", duration: "5 min", pace: "Slightly faster (Zone 3)" },
        { name: "Cool-down Walk", duration: "5 min", pace: "Easy" },
        { name: "Stretching", duration: "5 min", notes: "Focus on calves and hips" },
      ],
    },
    intermediate: {
      title: "Progression Run",
      exercises: [
        { name: "Easy Pace", duration: "15 min", pace: "Conversational (Zone 2)" },
        { name: "Moderate Pace", duration: "10 min", pace: "Tempo effort (Zone 3)" },
        { name: "Fast Finish", duration: "5 min", pace: "Hard (Zone 4)" },
        { name: "Cool-down Walk", duration: "5 min", pace: "Easy" },
      ],
    },
    advanced: {
      title: "Progression Run",
      exercises: [
        { name: "Easy Pace", duration: "20 min", pace: "Conversational (Zone 2)" },
        { name: "Moderate Pace", duration: "10 min", pace: "Tempo effort (Zone 3)" },
        { name: "Fast Finish", duration: "10 min", pace: "Threshold (Zone 4)" },
        { name: "Cool-down Jog", duration: "5 min", pace: "Easy" },
      ],
    },
  },
  recovery: {
    beginner: {
      title: "Recovery Run",
      exercises: [
        { name: "Warm-up Walk", duration: "5 min", pace: "Easy" },
        { name: "Recovery Run", duration: "15 min", pace: "Very easy, shuffle pace" },
        { name: "Cool-down Walk", duration: "5 min", pace: "Easy" },
        { name: "Foam Rolling", duration: "10 min", notes: "IT band, quads, calves" },
      ],
    },
    intermediate: {
      title: "Recovery Run",
      exercises: [
        { name: "Warm-up Walk", duration: "5 min", pace: "Easy" },
        { name: "Recovery Run", duration: "20 min", pace: "Very easy, conversational" },
        { name: "Cool-down Walk", duration: "5 min", pace: "Easy" },
        { name: "Foam Rolling", duration: "10 min", notes: "IT band, quads, calves" },
      ],
    },
    advanced: {
      title: "Recovery Run",
      exercises: [
        { name: "Warm-up Walk", duration: "5 min", pace: "Easy" },
        { name: "Recovery Run", duration: "25 min", pace: "Very easy, 60-90 sec slower than easy pace" },
        { name: "Cool-down Walk", duration: "5 min", pace: "Easy" },
        { name: "Foam Rolling", duration: "10 min", notes: "IT band, quads, calves" },
      ],
    },
  },
};

const crossTrainingTemplates = {
  yoga: {
    title: "Yoga for Runners",
    exercises: [
      { name: "Downward Dog", duration: "5 breaths", notes: "Stretch calves and hamstrings" },
      { name: "Low Lunge + Hip Opener", duration: "60 sec each side", notes: "Deep hip flexor stretch" },
      { name: "Pigeon Pose", duration: "60 sec each side", notes: "Glute and piriformis release" },
      { name: "Reclined Hamstring Stretch", duration: "60 sec each side", notes: "Gentle hamstring opening" },
      { name: "Supine Twist", duration: "60 sec each side", notes: "Spinal mobility" },
    ],
  },
  cycling: {
    title: "Cross-Training: Cycling",
    exercises: [
      { name: "Easy Spin Warm-up", duration: "5 min", pace: "Easy, high cadence" },
      { name: "Moderate Cycling", duration: "30 min", pace: "Steady effort, 80-90 RPM" },
      { name: "Cool-down Spin", duration: "5 min", pace: "Very easy" },
      { name: "Post-Ride Stretching", duration: "10 min", notes: "Quads, hip flexors, back" },
    ],
  },
  swimming: {
    title: "Cross-Training: Swimming",
    exercises: [
      { name: "Easy Freestyle Warm-up", duration: "200m", pace: "Easy" },
      { name: "Steady Swimming", duration: "20 min", pace: "Comfortable effort, mix strokes" },
      { name: "Easy Backstroke Cool-down", duration: "100m", pace: "Very easy" },
      { name: "Post-Swim Stretching", duration: "5 min", notes: "Shoulders, back, hips" },
    ],
  },
};

const recoveryTemplate = {
  title: "Active Recovery & Mobility",
  exercises: [
    { name: "Light Walk", duration: "20-30 min", pace: "Very easy" },
    { name: "Hip Mobility Flow", duration: "10 min", notes: "90/90 stretches, pigeon pose" },
    { name: "Lower Body Stretching", duration: "10 min", notes: "Calves, quads, hamstrings, hip flexors" },
    { name: "Foam Rolling", duration: "10 min", notes: "Full body, focus on legs" },
    { name: "Deep Breathing", duration: "5 min", notes: "Box breathing or meditation" },
  ],
};

// ─── Day Names ─────────────────────────────────────────────────────────

const dayNames = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

// ─── Day Allocation ────────────────────────────────────────────────────

function allocateDayTypes(trainingDays, ratios) {
  const { speed, easy, recovery } = ratios;
  const total = speed + easy + recovery;

  // Calculate raw counts
  let speedCount = Math.round((speed / total) * trainingDays);
  let easyCount = Math.round((easy / total) * trainingDays);
  let recoveryCount = Math.max(1, Math.round((recovery / total) * trainingDays));

  // Ensure at least 1 of each main type
  speedCount = Math.max(1, speedCount);
  easyCount = Math.max(1, easyCount);

  // Adjust to match total
  let currentTotal = speedCount + easyCount + recoveryCount;
  while (currentTotal > trainingDays) {
    if (recoveryCount > 1) recoveryCount--;
    else if (easyCount > speedCount) easyCount--;
    else speedCount--;
    currentTotal = speedCount + easyCount + recoveryCount;
  }
  while (currentTotal < trainingDays) {
    if (easy >= speed) easyCount++;
    else speedCount++;
    currentTotal = speedCount + easyCount + recoveryCount;
  }

  return { speedCount, easyCount, recoveryCount };
}

// ─── Schedule Builder ──────────────────────────────────────────────────

function buildSchedule(speedCount, easyCount, recoveryCount, experience) {
  const workouts = [];
  const totalDays = speedCount + easyCount + recoveryCount;

  // Speed day templates: intervals, tempo, hills, fartlek
  const speedTypes = ["intervals", "tempo", "hills", "fartlek"];
  const speedWorkouts = [];
  for (let i = 0; i < speedCount; i++) {
    const runType = speedTypes[i % speedTypes.length];
    const template = runTemplates[runType][experience];
    speedWorkouts.push({ type: "Run", ...template });
  }

  // Easy day templates: easy, long, progression, recovery run
  const easyTypes = ["easy", "long", "progression", "easy"];
  const easyWorkouts = [];
  for (let i = 0; i < easyCount; i++) {
    const runType = easyTypes[i % easyTypes.length];
    const template = runTemplates[runType][experience];
    easyWorkouts.push({ type: "Run", ...template });
  }

  // Recovery days: cross-training and recovery
  const crossTrainTypes = ["yoga", "cycling", "swimming"];
  const recoveryWorkouts = [];
  for (let i = 0; i < recoveryCount; i++) {
    if (i === 0) {
      // First recovery day is active recovery
      recoveryWorkouts.push({ type: "Recovery", ...recoveryTemplate });
    } else {
      // Additional recovery days are cross-training
      const ctType = crossTrainTypes[(i - 1) % crossTrainTypes.length];
      recoveryWorkouts.push({ type: "CrossTrain", ...crossTrainingTemplates[ctType] });
    }
  }

  // ── Arrange schedule ──
  // Place long run on Saturday (or second-to-last day), recovery on Sunday (or last day)
  const schedule = new Array(totalDays);

  // Place recovery last (Sunday)
  for (let i = 0; i < recoveryCount; i++) {
    schedule[totalDays - 1 - i] = recoveryWorkouts[i];
  }

  // Place long run on the day before recovery (typically Saturday)
  const longRunIndex = easyWorkouts.findIndex((w) => w.title === "Long Run");
  if (longRunIndex >= 0) {
    const saturdaySlot = totalDays - 1 - recoveryCount;
    schedule[saturdaySlot] = easyWorkouts[longRunIndex];
    easyWorkouts.splice(longRunIndex, 1);
  }

  // Fill remaining slots alternating speed/easy
  let speedIdx = 0;
  let easyIdx = 0;
  let lastType = null;

  for (let i = 0; i < totalDays; i++) {
    if (schedule[i]) continue; // Already placed

    // Prefer alternating speed and easy
    if (lastType === "speed" && easyIdx < easyWorkouts.length) {
      schedule[i] = easyWorkouts[easyIdx++];
      lastType = "easy";
    } else if (lastType === "easy" && speedIdx < speedWorkouts.length) {
      schedule[i] = speedWorkouts[speedIdx++];
      lastType = "speed";
    } else if (speedIdx < speedWorkouts.length) {
      schedule[i] = speedWorkouts[speedIdx++];
      lastType = "speed";
    } else if (easyIdx < easyWorkouts.length) {
      schedule[i] = easyWorkouts[easyIdx++];
      lastType = "easy";
    }
  }

  // Assign day names
  for (let i = 0; i < totalDays; i++) {
    if (schedule[i]) {
      workouts.push({
        day: dayNames[i],
        dayNumber: i + 1,
        type: schedule[i].type,
        title: schedule[i].title,
        exercises: schedule[i].exercises,
      });
    }
  }

  return workouts;
}

// ─── AI Custom Workout Generator ──────────────────────────────────────

async function generateCustomWorkouts({ archetype, trainingDays, experience }) {
  const archetypeData = typeof archetype === "string"
    ? (archetypes[archetype] || Object.values(archetypes).find(a => a.label === archetype) || archetypes.everydayRunner)
    : archetype;

  const prompt = `You are a certified running coach creating a weekly running training plan.

ATHLETE PROFILE:
- Archetype: ${archetypeData.label} (${archetypeData.description})
- Training Days Per Week: ${trainingDays}
- Experience Level: ${experience}
- Speed/Easy/Recovery ratio: ${archetypeData.ratios.speed}% speed work, ${archetypeData.ratios.easy}% easy running, ${archetypeData.ratios.recovery}% recovery/cross-training

REQUIREMENTS:
1. Generate EXACTLY ${trainingDays} workouts for one week
2. Workout types: "Run", "Recovery", "CrossTrain"
3. Run exercises format: { "name": "...", "duration": "...", "pace": "...", "notes": "..." }
4. Recovery/CrossTrain exercises format: { "name": "...", "duration": "...", "notes": "..." }
5. Days: Monday through Sunday, dayNumber 1-${trainingDays}
6. 3-6 exercises per workout
7. Place long run on Saturday if possible, recovery on Sunday if possible.
8. Speed work includes: intervals, tempo runs, hill repeats, fartlek
9. Easy days include: easy runs, long runs, progression runs
10. Recovery/CrossTrain: yoga for runners, cycling, swimming, active recovery, foam rolling
11. NO weight training, NO gym exercises, NO lifting. This is a running-only program.

Respond with ONLY valid JSON (no markdown):
{
  "workouts": [
    { "dayNumber": 1, "day": "Monday", "type": "Run", "title": "Easy Run", "exercises": [...] }
  ]
}`;

  const client = await getAnthropicClient();

  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const response = await client.messages.create({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 4096,
        messages: [{ role: "user", content: prompt }],
      });

      const text = response.content[0]?.text || "";
      let jsonStr = text.trim();
      if (jsonStr.startsWith("```")) {
        jsonStr = jsonStr.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
      }

      const result = JSON.parse(jsonStr);

      if (!result.workouts || !Array.isArray(result.workouts) || result.workouts.length === 0) {
        throw new Error("Invalid response: missing workouts array");
      }

      return result.workouts;
    } catch (error) {
      console.error(`Custom workout generation attempt ${attempt + 1} failed:`, error.message);
      if (attempt === 1) {
        throw new Error("Failed to generate custom workouts after 2 attempts");
      }
    }
  }
}

// ─── Main Generator ────────────────────────────────────────────────────

/**
 * Generate personalized quiz-based running workouts.
 *
 * @param {Object} params
 * @param {Object} params.archetype - Archetype object from determineArchetype()
 * @param {number} params.trainingDays - Number of training days (3-7)
 * @param {string} params.experience - "beginner", "intermediate", or "advanced"
 * @returns {Array|Promise<Array>} Array of workout objects matching { day, dayNumber, type, title, exercises }
 */
export function generateQuizWorkouts({ archetype, trainingDays = 5, experience = "intermediate" }) {
  const archetypeData = typeof archetype === "string" ? archetypes[archetype] : archetype;
  const ratios = archetypeData?.ratios || archetypes.everydayRunner.ratios;
  const days = Math.max(3, Math.min(7, trainingDays));

  // Use static templates
  const { speedCount, easyCount, recoveryCount } = allocateDayTypes(days, ratios);
  return buildSchedule(speedCount, easyCount, recoveryCount, experience);
}
