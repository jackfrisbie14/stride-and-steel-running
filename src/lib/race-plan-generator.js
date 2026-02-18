import { getAnthropicClient } from "./anthropic";
import { archetypes } from "./archetypes";

/**
 * Calculate phase breakdown for race training plan.
 * Base 35%, Build 30%, Peak 20%, Taper 15%
 */
export function calculatePhases(totalWeeks) {
  const baseWeeks = Math.max(1, Math.round(totalWeeks * 0.35));
  const buildWeeks = Math.max(1, Math.round(totalWeeks * 0.30));
  const peakWeeks = Math.max(1, Math.round(totalWeeks * 0.20));
  let taperWeeks = totalWeeks - baseWeeks - buildWeeks - peakWeeks;
  if (taperWeeks < 1) taperWeeks = 1;

  // Adjust if total doesn't match
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

/**
 * Get race-specific training guidance for the prompt.
 */
function getRaceGuidance(raceDistance) {
  const lower = raceDistance.toLowerCase();

  if (lower.includes("5k")) {
    return "Focus on speed work, tempo runs, and intervals. Include 400m and 800m repeats. Long runs should build to 6-8 miles. Add strides and drills for running economy.";
  }
  if (lower.includes("10k")) {
    return "Balance tempo runs, intervals, and threshold work. Include 800m and mile repeats. Long runs should build to 8-10 miles. Include race-pace workouts.";
  }
  if (lower.includes("half marathon")) {
    return "Focus on building aerobic base with long runs progressing to 10-12 miles. Include marathon-pace and tempo runs. Add cross-training for recovery without overloading running volume.";
  }
  if (lower.includes("marathon")) {
    return "Prioritize long run progression (up to 20-22 miles). Include marathon-pace runs, tempo work, and easy miles. Cross-training should be low-impact to support recovery from high mileage.";
  }
  if (lower.includes("ultra")) {
    return "Focus on time-on-feet rather than speed. Long runs should build significantly. Include back-to-back long run weekends. Cross-training for injury prevention, especially mobility and core work.";
  }
  if (lower.includes("triathlon") || lower.includes("ironman") || lower.includes("70.3")) {
    const isIronman = lower.includes("ironman") && !lower.includes("70.3");
    const is703 = lower.includes("70.3");
    const isOlympic = lower.includes("olympic");

    let distances = "Olympic distance (1.5km swim, 40km bike, 10km run)";
    if (is703) distances = "70.3 (1.9km swim, 90km bike, 21.1km run)";
    if (isIronman) distances = "Ironman (3.8km swim, 180km bike, 42.2km run)";

    return `This is a triathlon training plan for ${distances}. Include swim, bike, and run workouts. Add brick workouts (bike-to-run transitions). Swim workouts should include drills, intervals, and endurance sets. Bike workouts should include easy rides, tempo rides, and long rides. Run workouts follow standard progressions. Cross-training should focus on functional movements and mobility.`;
  }

  return "Build a well-rounded plan with progressive overload. Include a mix of easy runs, tempo, intervals, long runs, and recovery. Cross-training days should complement the running program with low-impact activities.";
}

/**
 * Build a prompt for a batch of weeks.
 */
export function buildBatchPrompt({ raceName, raceDate, raceDistance, trainingDays, experience, archetype, archetypeRatios, totalWeeks, phases, startWeek, endWeek, raceGoalTime }) {
  const raceGuidance = getRaceGuidance(raceDistance);
  const isTriathlon = raceDistance.toLowerCase().includes("triathlon") || raceDistance.toLowerCase().includes("ironman") || raceDistance.toLowerCase().includes("70.3");

  const workoutTypes = isTriathlon
    ? '"Run", "Swim", "Bike", "Recovery", "CrossTrain"'
    : '"Run", "Recovery", "CrossTrain"';

  // Determine which phases these weeks fall into
  const relevantPhases = phases.filter(p => p.startWeek <= endWeek && p.endWeek >= startWeek);

  return `You are a certified running coach creating a race training plan batch.

ATHLETE PROFILE:
- Race: ${raceName} (${raceDistance})
- Experience: ${experience} | Archetype: ${archetype}
- Training Days Per Week: ${trainingDays}
- Total Plan: ${totalWeeks} weeks | This batch: Weeks ${startWeek}-${endWeek}
${raceGoalTime ? `
TARGET FINISH TIME: ${raceGoalTime}
- Design running workouts with pace targets derived from this goal time.
- Include specific pace zones (easy, tempo, threshold, interval) calibrated to achieve this finish time.
- For long runs, specify target pace ranges. For intervals, specify target split times.` : ""}

PHASES:
${phases.map(p => `- ${p.name.toUpperCase()}: Weeks ${p.startWeek}-${p.endWeek}`).join("\n")}

GUIDANCE: ${raceGuidance}

REQUIREMENTS:
1. Generate weeks ${startWeek} through ${endWeek} ONLY (${endWeek - startWeek + 1} weeks)
2. Each week: EXACTLY ${trainingDays} workouts
3. Workout types: ${workoutTypes}
4. Format: { "dayNumber": 1, "day": "Monday", "type": "Run", "title": "Easy Run", "exercises": [...] }
5. Run exercises: { "name": "...", "duration": "...", "pace": "...", "notes": "..." }
6. CrossTrain exercises: { "name": "...", "duration": "...", "notes": "..." }
7. Recovery exercises: { "name": "...", "duration": "...", "notes": "..." }
${isTriathlon ? '8. Swim/Bike exercises: { "name": "...", "duration": "...", "pace": "...", "notes": "..." }\n' : ""}8. Progressive overload through phases. Week ${startWeek} intensity should reflect its position in the overall ${totalWeeks}-week plan.
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
}

/**
 * Generate a race training plan using Claude AI.
 *
 * @param {Object} params
 * @param {string} params.raceName
 * @param {string} params.raceDate - ISO date string
 * @param {string} params.raceDistance
 * @param {number} params.trainingDays
 * @param {string} params.experience
 * @param {string} params.archetype
 * @param {Object} [params.archetypeRatios] - { run, recovery } percentages
 * @returns {Promise<{ totalWeeks, phases, weeks }>}
 */
export async function generateRacePlan({ raceName, raceDate, raceDistance, trainingDays, experience, archetype, archetypeRatios, raceGoalTime }) {
  // Calculate weeks until race (cap 4-24)
  const now = new Date();
  const raceDay = new Date(raceDate);
  const diffMs = raceDay - now;
  const rawWeeks = Math.floor(diffMs / (1000 * 60 * 60 * 24 * 7));
  const totalWeeks = Math.max(4, Math.min(24, rawWeeks));

  const phases = calculatePhases(totalWeeks);

  // Generate in batches of 4 weeks to stay within token limits
  const batchSize = 4;
  const allWeeks = [];
  const client = await getAnthropicClient();

  for (let startWeek = 1; startWeek <= totalWeeks; startWeek += batchSize) {
    const endWeek = Math.min(startWeek + batchSize - 1, totalWeeks);
    const prompt = buildBatchPrompt({
      raceName,
      raceDate,
      raceDistance,
      trainingDays,
      experience,
      archetype,
      archetypeRatios,
      totalWeeks,
      phases,
      startWeek,
      endWeek,
      raceGoalTime,
    });

    // Try up to 2 times per batch
    let batchWeeks = null;
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
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

        const plan = JSON.parse(jsonStr);

        if (!plan.weeks || !Array.isArray(plan.weeks) || plan.weeks.length === 0) {
          throw new Error("Invalid plan structure: missing weeks array");
        }

        for (const week of plan.weeks) {
          if (!week.workouts || !Array.isArray(week.workouts)) {
            throw new Error(`Week ${week.weekNumber} missing workouts array`);
          }
        }

        batchWeeks = plan.weeks;
        break;
      } catch (error) {
        console.error(`Batch weeks ${startWeek}-${endWeek} attempt ${attempt + 1} failed:`, error.message);
        if (attempt === 1) {
          throw new Error(`Failed to generate weeks ${startWeek}-${endWeek} after 2 attempts`);
        }
      }
    }

    allWeeks.push(...batchWeeks);
  }

  return {
    totalWeeks,
    phases,
    weeks: allWeeks,
  };
}
