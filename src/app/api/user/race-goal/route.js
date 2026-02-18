import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { generateRacePlan } from "@/lib/race-plan-generator";
import { determineArchetype, parseExperience } from "@/lib/archetypes";
import { generateQuizWorkouts } from "@/lib/workout-generator";

// GET - Get user's race goal
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        raceName: true,
        raceDate: true,
        raceDistance: true,
        racePlanActive: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get active race plan info
    let planInfo = null;
    if (user.racePlanActive) {
      const plan = await prisma.racePlan.findFirst({
        where: { userId: (await prisma.user.findUnique({ where: { email: session.user.email } })).id, isActive: true },
        select: { totalWeeks: true, currentWeek: true, phases: true },
      });
      if (plan) {
        planInfo = { totalWeeks: plan.totalWeeks, currentWeek: plan.currentWeek };
      }
    }

    return NextResponse.json({
      raceName: user.raceName,
      raceDate: user.raceDate,
      raceDistance: user.raceDistance,
      racePlanActive: user.racePlanActive,
      planInfo,
    });
  } catch (error) {
    console.error("Get race goal error:", error);
    return NextResponse.json(
      { error: "Failed to get race goal" },
      { status: 500 }
    );
  }
}

// POST - Set or update race goal with AI plan generation
export async function POST(request) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { raceName, raceDate, raceDistance, raceGoalTime } = body;

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Update user's race fields and activate race mode
    await prisma.user.update({
      where: { id: user.id },
      data: {
        raceName: raceName || null,
        raceDate: raceDate ? new Date(raceDate) : null,
        raceDistance: raceDistance || null,
        raceGoalTime: raceGoalTime || null,
        racePlanActive: true,
      },
    });

    // Deactivate any existing race plans
    await prisma.racePlan.updateMany({
      where: { userId: user.id, isActive: true },
      data: { isActive: false },
    });

    // Parse user profile for AI generation
    const answersArray = Array.isArray(user.quizAnswers)
      ? user.quizAnswers
      : Object.values(user.quizAnswers || {});
    const archetype = determineArchetype(answersArray);
    const experience = user.experience || parseExperience(answersArray[3]);

    // Generate AI race plan
    const plan = await generateRacePlan({
      raceName,
      raceDate,
      raceDistance,
      trainingDays: user.trainingDays || 5,
      experience,
      archetype: archetype.label,
      archetypeRatios: archetype.ratios,
      raceGoalTime: raceGoalTime || null,
    });

    // Create RacePlan record
    await prisma.racePlan.create({
      data: {
        userId: user.id,
        raceName,
        raceDate: new Date(raceDate),
        raceDistance,
        totalWeeks: plan.totalWeeks,
        currentWeek: 1,
        phases: plan.phases,
        isActive: true,
      },
    });

    // Delete existing race workouts
    await prisma.workout.deleteMany({
      where: { userId: user.id, source: "race" },
    });

    // Store all weeks' workouts
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

    if (workoutRecords.length > 0) {
      await prisma.workout.createMany({ data: workoutRecords });
    }

    return NextResponse.json({
      raceName,
      raceDate: new Date(raceDate).toISOString(),
      raceDistance,
      planGenerated: true,
      totalWeeks: plan.totalWeeks,
      currentWeek: 1,
    });
  } catch (error) {
    console.error("Set race goal error:", error);
    return NextResponse.json(
      { error: "Failed to set race goal" },
      { status: 500 }
    );
  }
}

// DELETE - Remove race goal and revert to quiz workouts
export async function DELETE() {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Clear race fields and deactivate race mode
    await prisma.user.update({
      where: { id: user.id },
      data: {
        raceName: null,
        raceDate: null,
        raceDistance: null,
        raceGoalTime: null,
        racePlanActive: false,
      },
    });

    // Deactivate race plans
    await prisma.racePlan.updateMany({
      where: { userId: user.id, isActive: true },
      data: { isActive: false },
    });

    // Delete race workouts
    await prisma.workout.deleteMany({
      where: { userId: user.id, source: "race" },
    });

    // If no quiz workouts exist, regenerate them
    const quizWorkoutCount = await prisma.workout.count({
      where: { userId: user.id, source: "quiz" },
    });

    if (quizWorkoutCount === 0 && user.quizAnswers) {
      const answersArray = Array.isArray(user.quizAnswers)
        ? user.quizAnswers
        : Object.values(user.quizAnswers || {});
      const archetype = determineArchetype(answersArray);
      const experience = user.experience || parseExperience(answersArray[3]);

      const workouts = generateQuizWorkouts({
        archetype,
        trainingDays: user.trainingDays || 5,
        experience,
      });

      if (workouts.length > 0) {
        await prisma.workout.createMany({
          data: workouts.map((w) => ({
            userId: user.id,
            day: w.day,
            type: w.type,
            title: w.title,
            exercises: w.exercises,
            dayNumber: w.dayNumber,
            source: "quiz",
            weekNumber: 1,
          })),
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete race goal error:", error);
    return NextResponse.json(
      { error: "Failed to delete race goal" },
      { status: 500 }
    );
  }
}
