import Anthropic from "@anthropic-ai/sdk";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Inline the race plan generator logic for standalone testing
function calculatePhases(totalWeeks) {
  const baseWeeks = Math.max(1, Math.round(totalWeeks * 0.35));
  const buildWeeks = Math.max(1, Math.round(totalWeeks * 0.30));
  const peakWeeks = Math.max(1, Math.round(totalWeeks * 0.20));
  let taperWeeks = totalWeeks - baseWeeks - buildWeeks - peakWeeks;
  if (taperWeeks < 1) taperWeeks = 1;
  const sum = baseWeeks + buildWeeks + peakWeeks + taperWeeks;
  const diff = totalWeeks - sum;
  const adjustedBuildWeeks = buildWeeks + diff;

  return [
    { name: "base", startWeek: 1, endWeek: baseWeeks, weeks: baseWeeks },
    { name: "build", startWeek: baseWeeks + 1, endWeek: baseWeeks + adjustedBuildWeeks, weeks: adjustedBuildWeeks },
    { name: "peak", startWeek: baseWeeks + adjustedBuildWeeks + 1, endWeek: baseWeeks + adjustedBuildWeeks + peakWeeks, weeks: peakWeeks },
    { name: "taper", startWeek: baseWeeks + adjustedBuildWeeks + peakWeeks + 1, endWeek: totalWeeks, weeks: taperWeeks },
  ];
}

async function main() {
  const email = "test-raceplan@test.com";

  // Clean up any previous test data
  let user = await prisma.user.findUnique({ where: { email } });
  if (user) {
    await prisma.workout.deleteMany({ where: { userId: user.id } });
    await prisma.racePlan.deleteMany({ where: { userId: user.id } });
    await prisma.user.delete({ where: { email } });
  }

  // Create test user
  user = await prisma.user.create({
    data: {
      email,
      quizAnswers: [
        "🏃 Marathon runner who wants to stay strong",
        "Run faster without losing muscle",
        "5 days a week",
        "Intermediate - been training for a while",
        "I feel slow when I add lifting to my routine",
        "3-4 times per week",
        "Hitting faster race times while maintaining strength",
        "Height/weight data",
        "Male",
        "🏃 Run a faster 5K or 10K",
      ],
      archetype: "The Iron Runner",
      trainingDays: 5,
    },
  });
  console.log("Created test user:", user.id);
  console.log("");

  // Set up race parameters
  const raceDate = new Date();
  raceDate.setDate(raceDate.getDate() + 12 * 7); // 12 weeks out
  const totalWeeks = 12;
  const trainingDays = 5;
  const phases = calculatePhases(totalWeeks);

  console.log("=== Generating Half Marathon Race Plan ===");
  console.log("Race: Spring Half Marathon 2026");
  console.log("Date:", raceDate.toISOString().split("T")[0]);
  console.log("Distance: Half Marathon");
  console.log("Training Days:", trainingDays);
  console.log("Experience: intermediate");
  console.log("Archetype: The Iron Runner");
  console.log("Total Weeks:", totalWeeks);
  console.log("Phases:");
  phases.forEach((p) => console.log(`  ${p.name}: weeks ${p.startWeek}-${p.endWeek}`));
  console.log("");
  console.log("Calling Claude Haiku 4.5 (batched: 4 weeks per call)...");
  console.log("");

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const batchSize = 4;
  const allWeeks = [];
  const startTime = Date.now();

  for (let startWeek = 1; startWeek <= totalWeeks; startWeek += batchSize) {
    const endWeek = Math.min(startWeek + batchSize - 1, totalWeeks);
    const relevantPhases = phases.filter(p => p.startWeek <= endWeek && p.endWeek >= startWeek);

    const prompt = `You are a certified running coach creating a race training plan batch.

ATHLETE PROFILE:
- Race: Spring Half Marathon 2026 (Half Marathon)
- Experience: intermediate | Archetype: The Iron Runner
- Training Days Per Week: ${trainingDays}
- Total Plan: ${totalWeeks} weeks | This batch: Weeks ${startWeek}-${endWeek}

PHASES:
${phases.map((p) => `- ${p.name.toUpperCase()}: Weeks ${p.startWeek}-${p.endWeek}`).join("\n")}

GUIDANCE: Focus on building aerobic base with long runs progressing to 10-12 miles. Include marathon-pace and tempo runs. Strength training should complement running without causing excessive fatigue.

REQUIREMENTS:
1. Generate weeks ${startWeek} through ${endWeek} ONLY (${endWeek - startWeek + 1} weeks)
2. Each week: EXACTLY ${trainingDays} workouts
3. Workout types: "Run", "Lift", "Recovery"
4. Format: { "dayNumber": 1, "day": "Monday", "type": "Run", "title": "Easy Run", "exercises": [...] }
5. Run exercises: { "name": "...", "duration": "...", "pace": "...", "notes": "..." }
6. Lift exercises: { "name": "...", "sets": 3, "reps": "8-10", "rest": "90 sec" }
7. Recovery exercises: { "name": "...", "duration": "...", "notes": "..." }
8. Progressive overload through phases. Week ${startWeek} intensity should reflect its position in the overall ${totalWeeks}-week plan.
9. Days: Monday-Friday (first ${trainingDays} weekdays), dayNumber 1-${trainingDays}
10. Keep exercises concise: 3-5 exercises per workout max

Respond with ONLY valid JSON (no markdown):
{
  "weeks": [
    {
      "weekNumber": ${startWeek},
      "phase": "${relevantPhases[0]?.name || "base"}",
      "workouts": [{ "dayNumber": 1, "day": "Monday", "type": "Run", "title": "Easy Run", "exercises": [...] }]
    }
  ]
}`;

    console.log(`  Generating weeks ${startWeek}-${endWeek}...`);
    const response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 8192,
      messages: [{ role: "user", content: prompt }],
    });

    const text = response.content[0]?.text || "";
    let jsonStr = text.trim();
    if (jsonStr.startsWith("```")) {
      jsonStr = jsonStr.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
    }

    const batch = JSON.parse(jsonStr);
    allWeeks.push(...batch.weeks);
    console.log(`  ✓ Got ${batch.weeks.length} weeks`);
  }

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  const plan = { weeks: allWeeks };

  console.log(`Plan generated in ${elapsed}s`);
  console.log(`Total weeks returned: ${plan.weeks.length}`);
  console.log("");

  // Show first 3 weeks
  for (let i = 0; i < Math.min(3, plan.weeks.length); i++) {
    const week = plan.weeks[i];
    console.log(`--- Week ${week.weekNumber} (${week.phase} phase) ---`);
    week.workouts.forEach((w) => {
      console.log(`  Day ${w.dayNumber} (${w.day}): ${w.type} - ${w.title}`);
      if (w.exercises?.length > 0) {
        w.exercises.slice(0, 2).forEach((ex) => {
          if (ex.sets) console.log(`    -> ${ex.name}: ${ex.sets}x${ex.reps}`);
          else if (ex.duration) console.log(`    -> ${ex.name}: ${ex.duration}${ex.pace ? " @ " + ex.pace : ""}`);
        });
        if (w.exercises.length > 2) console.log(`    -> ... +${w.exercises.length - 2} more exercises`);
      }
    });
    console.log("");
  }

  // Show last week (taper / race week)
  const lastWeek = plan.weeks[plan.weeks.length - 1];
  console.log(`--- Week ${lastWeek.weekNumber} (${lastWeek.phase} phase - RACE WEEK) ---`);
  lastWeek.workouts.forEach((w) => {
    console.log(`  Day ${w.dayNumber} (${w.day}): ${w.type} - ${w.title}`);
  });
  console.log("");

  // Store in DB
  await prisma.racePlan.create({
    data: {
      userId: user.id,
      raceName: "Spring Half Marathon 2026",
      raceDate,
      raceDistance: "Half Marathon",
      totalWeeks,
      currentWeek: 1,
      phases,
      isActive: true,
    },
  });

  const workoutRecords = [];
  for (const week of plan.weeks) {
    for (const workout of week.workouts) {
      workoutRecords.push({
        userId: user.id,
        day: workout.day,
        type: workout.type,
        title: workout.title,
        exercises: workout.exercises,
        dayNumber: workout.dayNumber,
        source: "race",
        weekNumber: week.weekNumber,
        phase: week.phase,
      });
    }
  }

  await prisma.workout.createMany({ data: workoutRecords });
  await prisma.user.update({
    where: { id: user.id },
    data: { racePlanActive: true, raceName: "Spring Half Marathon 2026", raceDate, raceDistance: "Half Marathon" },
  });

  console.log("=== Stored in DB ===");
  console.log("RacePlan record created");
  console.log(`Total workouts stored: ${workoutRecords.length}`);
  console.log("Workout types:");
  const types = {};
  workoutRecords.forEach((w) => { types[w.type] = (types[w.type] || 0) + 1; });
  Object.entries(types).forEach(([type, count]) => console.log(`  ${type}: ${count}`));
  console.log("");

  // Verify DB reads correctly
  const storedPlan = await prisma.racePlan.findFirst({ where: { userId: user.id, isActive: true } });
  const week1Workouts = await prisma.workout.findMany({
    where: { userId: user.id, source: "race", weekNumber: 1 },
    orderBy: { dayNumber: "asc" },
  });
  console.log("=== DB Verification ===");
  console.log(`RacePlan found: ${!!storedPlan}, totalWeeks: ${storedPlan?.totalWeeks}, currentWeek: ${storedPlan?.currentWeek}`);
  console.log(`Week 1 workouts from DB: ${week1Workouts.length}`);
  week1Workouts.forEach((w) => console.log(`  ${w.day}: ${w.type} - ${w.title}`));

  // Cleanup
  await prisma.workout.deleteMany({ where: { userId: user.id } });
  await prisma.racePlan.deleteMany({ where: { userId: user.id } });
  await prisma.user.delete({ where: { email } });
  console.log("");
  console.log("Test data cleaned up.");

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error("ERROR:", e);
  process.exit(1);
});
