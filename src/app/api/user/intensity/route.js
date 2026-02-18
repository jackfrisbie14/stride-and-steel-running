import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { determineArchetype, parseExperience } from "@/lib/archetypes";
import { generateQuizWorkouts } from "@/lib/workout-generator";

const VALID_LEVELS = ["beginner", "intermediate", "advanced"];

export async function POST(request) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { experience } = body;

    if (!experience || !VALID_LEVELS.includes(experience)) {
      return NextResponse.json(
        { error: "Experience must be one of: beginner, intermediate, advanced" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Save experience override
    await prisma.user.update({
      where: { id: user.id },
      data: { experience },
    });

    // Parse quiz answers for archetype
    const answersArray = Array.isArray(user.quizAnswers)
      ? user.quizAnswers
      : Object.values(user.quizAnswers || {});
    const archetype = determineArchetype(answersArray);

    // Regenerate quiz workouts with new experience level
    const workouts = await generateQuizWorkouts({
      archetype,
      trainingDays: user.trainingDays || 5,
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

    return NextResponse.json({
      success: true,
      racePlanRegenerating: user.racePlanActive,
    });
  } catch (error) {
    console.error("Update intensity error:", error);
    return NextResponse.json(
      { error: "Failed to update intensity" },
      { status: 500 }
    );
  }
}
