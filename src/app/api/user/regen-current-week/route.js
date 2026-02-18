import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { determineArchetype, parseExperience } from "@/lib/archetypes";
import { getAnthropicClient } from "@/lib/anthropic";
import { buildBatchPrompt, calculatePhases } from "@/lib/race-plan-generator";

// Regenerate only the current week's race workouts.
// Used when preferences or training days change — no need to regenerate
// future weeks since they adapt to user feedback as the plan progresses.
export async function POST() {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user || !user.racePlanActive) {
      return NextResponse.json({ error: "No active race plan" }, { status: 400 });
    }

    const activePlan = await prisma.racePlan.findFirst({
      where: { userId: user.id, isActive: true },
    });

    if (!activePlan) {
      return NextResponse.json({ error: "No active race plan found" }, { status: 404 });
    }

    const currentWeek = activePlan.currentWeek;

    const answersArray = Array.isArray(user.quizAnswers)
      ? user.quizAnswers
      : Object.values(user.quizAnswers || {});
    const archetype = determineArchetype(answersArray);
    const experience = user.experience || parseExperience(answersArray[3]);
    const trainingDays = user.trainingDays || 5;
    const phases = calculatePhases(activePlan.totalWeeks);

    const prompt = buildBatchPrompt({
      raceName: activePlan.raceName,
      raceDate: activePlan.raceDate.toISOString(),
      raceDistance: activePlan.raceDistance,
      trainingDays,
      experience,
      archetype: archetype.label,
      archetypeRatios: null,
      totalWeeks: activePlan.totalWeeks,
      phases,
      startWeek: currentWeek,
      endWeek: currentWeek,
      raceGoalTime: user.raceGoalTime,
    });

    const client = await getAnthropicClient();

    let batchWeeks = null;
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

        const plan = JSON.parse(jsonStr);

        if (!plan.weeks || !Array.isArray(plan.weeks) || plan.weeks.length === 0) {
          throw new Error("Invalid plan structure");
        }

        batchWeeks = plan.weeks;
        break;
      } catch (error) {
        console.error(`Regen week ${currentWeek} attempt ${attempt + 1} failed:`, error.message);
        if (attempt === 1) {
          return NextResponse.json(
            { error: `Failed to regenerate week ${currentWeek}` },
            { status: 500 }
          );
        }
      }
    }

    // Delete only the current week's race workouts
    await prisma.workout.deleteMany({
      where: { userId: user.id, source: "race", weekNumber: currentWeek },
    });

    // Save the regenerated week
    const workoutRecords = [];
    for (const week of batchWeeks) {
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

    if (workoutRecords.length > 0) {
      await prisma.workout.createMany({ data: workoutRecords });
    }

    return NextResponse.json({
      success: true,
      weekRegenerated: currentWeek,
      workoutsGenerated: workoutRecords.length,
    });
  } catch (error) {
    console.error("Regen current week error:", error);
    return NextResponse.json(
      { error: "Failed to regenerate current week" },
      { status: 500 }
    );
  }
}
