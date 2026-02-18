import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { determineArchetype, parseExperience } from "@/lib/archetypes";
import { getAnthropicClient } from "@/lib/anthropic";
import { buildBatchPrompt, calculatePhases } from "@/lib/race-plan-generator";

// Step 2: Generate one batch of weeks (4 weeks) and save to DB.
// Called multiple times by the client to build the full race plan.
export async function POST(request) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { startWeek, endWeek } = body;

    if (!startWeek || !endWeek) {
      return NextResponse.json({ error: "startWeek and endWeek required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const activePlan = await prisma.racePlan.findFirst({
      where: { userId: user.id, isActive: true },
    });

    if (!activePlan) {
      return NextResponse.json({ error: "No active race plan" }, { status: 404 });
    }

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
      startWeek,
      endWeek,
      raceGoalTime: user.raceGoalTime,
    });

    const client = await getAnthropicClient();

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
          throw new Error("Invalid plan structure");
        }

        batchWeeks = plan.weeks;
        break;
      } catch (error) {
        console.error(`Batch ${startWeek}-${endWeek} attempt ${attempt + 1} failed:`, error.message);
        if (attempt === 1) {
          return NextResponse.json(
            { error: `Failed to generate weeks ${startWeek}-${endWeek}` },
            { status: 500 }
          );
        }
      }
    }

    // Save this batch of workouts to DB
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
      weeksGenerated: batchWeeks.length,
      workoutsGenerated: workoutRecords.length,
    });
  } catch (error) {
    console.error("Batch race plan error:", error);
    return NextResponse.json(
      { error: "Failed to generate batch" },
      { status: 500 }
    );
  }
}
