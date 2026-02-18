import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { determineArchetype, parseExperience } from "@/lib/archetypes";
import { generateQuizWorkouts } from "@/lib/workout-generator";
import { generateRacePlan } from "@/lib/race-plan-generator";

export async function POST(request) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { trainingDays } = body;

    if (!trainingDays || trainingDays < 3 || trainingDays > 7) {
      return NextResponse.json(
        { error: "Training days must be between 3 and 7" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Parse quiz answers for archetype
    const answersArray = Array.isArray(user.quizAnswers)
      ? user.quizAnswers
      : Object.values(user.quizAnswers || {});
    const archetype = determineArchetype(answersArray);
    const experience = user.experience || parseExperience(answersArray[3]);

    // Generate new workouts with updated day count
    const workouts = await generateQuizWorkouts({
      archetype,
      trainingDays,
      experience,
    });

    // Delete existing quiz workouts
    await prisma.workout.deleteMany({
      where: { userId: user.id, source: "quiz" },
    });

    // Store new workouts
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

    // Update user's training days
    await prisma.user.update({
      where: { id: user.id },
      data: { trainingDays },
    });

    // If race plan is active, regenerate in the background
    // This avoids blocking the response (race plan generation calls Claude AI
    // multiple times and can take 30+ seconds, exceeding Vercel's timeout)
    const needsRacePlanRegen = user.racePlanActive;

    return NextResponse.json({
      success: true,
      trainingDays,
      racePlanRegenerating: needsRacePlanRegen,
    });
  } catch (error) {
    console.error("Update training days error:", error);
    return NextResponse.json(
      { error: "Failed to update training days" },
      { status: 500 }
    );
  }
}
