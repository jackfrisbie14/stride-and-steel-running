import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { determineArchetype, parseExperience } from "@/lib/archetypes";

// Step 1: Set up the new race plan shell and return batch info.
// The client then calls /api/user/regen-race-plan-batch for each batch.
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

    // Calculate total weeks
    const now = new Date();
    const raceDay = new Date(activePlan.raceDate);
    const diffMs = raceDay - now;
    const rawWeeks = Math.floor(diffMs / (1000 * 60 * 60 * 24 * 7));
    const totalWeeks = Math.max(4, Math.min(24, rawWeeks));

    // Calculate phases
    const baseWeeks = Math.max(1, Math.round(totalWeeks * 0.35));
    const buildWeeks = Math.max(1, Math.round(totalWeeks * 0.30));
    const peakWeeks = Math.max(1, Math.round(totalWeeks * 0.20));
    let taperWeeks = totalWeeks - baseWeeks - buildWeeks - peakWeeks;
    if (taperWeeks < 1) taperWeeks = 1;
    const sum = baseWeeks + buildWeeks + peakWeeks + taperWeeks;
    const diff = totalWeeks - sum;
    const adjustedBuildWeeks = buildWeeks + diff;

    const phases = [
      { name: "base", startWeek: 1, endWeek: baseWeeks, weeks: baseWeeks },
      { name: "build", startWeek: baseWeeks + 1, endWeek: baseWeeks + adjustedBuildWeeks, weeks: adjustedBuildWeeks },
      { name: "peak", startWeek: baseWeeks + adjustedBuildWeeks + 1, endWeek: baseWeeks + adjustedBuildWeeks + peakWeeks, weeks: peakWeeks },
      { name: "taper", startWeek: baseWeeks + adjustedBuildWeeks + peakWeeks + 1, endWeek: totalWeeks, weeks: taperWeeks },
    ];

    // Deactivate old plan
    await prisma.racePlan.update({
      where: { id: activePlan.id },
      data: { isActive: false },
    });

    // Create new plan shell
    const newPlan = await prisma.racePlan.create({
      data: {
        userId: user.id,
        raceName: activePlan.raceName,
        raceDate: activePlan.raceDate,
        raceDistance: activePlan.raceDistance,
        totalWeeks,
        currentWeek: Math.min(activePlan.currentWeek, totalWeeks),
        phases,
        isActive: true,
      },
    });

    // Delete old race workouts
    await prisma.workout.deleteMany({
      where: { userId: user.id, source: "race" },
    });

    // Build batch list (4 weeks each)
    const batchSize = 4;
    const batches = [];
    for (let startWeek = 1; startWeek <= totalWeeks; startWeek += batchSize) {
      batches.push({
        startWeek,
        endWeek: Math.min(startWeek + batchSize - 1, totalWeeks),
      });
    }

    return NextResponse.json({
      success: true,
      planId: newPlan.id,
      totalWeeks,
      batches,
    });
  } catch (error) {
    console.error("Setup race plan error:", error);
    return NextResponse.json(
      { error: "Failed to set up race plan" },
      { status: 500 }
    );
  }
}
