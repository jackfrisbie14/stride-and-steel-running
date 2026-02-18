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
    const { trainingDays, experience } = body;

    // Validate trainingDays
    if (trainingDays !== undefined && (trainingDays < 3 || trainingDays > 7)) {
      return NextResponse.json({ error: "Training days must be between 3 and 7" }, { status: 400 });
    }

    // Validate experience
    if (experience !== undefined && !VALID_LEVELS.includes(experience)) {
      return NextResponse.json({ error: "Experience must be one of: beginner, intermediate, advanced" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Build update data — only include fields that were sent
    const updateData = {};
    if (trainingDays !== undefined) updateData.trainingDays = trainingDays;
    if (experience !== undefined) updateData.experience = experience;

    // Save all settings at once
    await prisma.user.update({
      where: { id: user.id },
      data: updateData,
    });

    // Use the new values for regeneration
    const finalDays = trainingDays !== undefined ? trainingDays : user.trainingDays || 5;
    const finalExperience = experience !== undefined
      ? experience
      : (user.experience || parseExperience(
          (Array.isArray(user.quizAnswers) ? user.quizAnswers : Object.values(user.quizAnswers || {}))[3]
        ));

    // Parse archetype from quiz
    const answersArray = Array.isArray(user.quizAnswers)
      ? user.quizAnswers
      : Object.values(user.quizAnswers || {});
    const archetype = determineArchetype(answersArray);

    // Regenerate quiz workouts once with all new settings
    const workouts = await generateQuizWorkouts({
      archetype,
      trainingDays: finalDays,
      experience: finalExperience,
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
    console.error("Update customization error:", error);
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 }
    );
  }
}
