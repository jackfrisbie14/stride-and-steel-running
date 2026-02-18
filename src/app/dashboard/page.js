export const dynamic = "force-dynamic";

import { auth, signOut } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import DashboardWorkouts from "@/components/DashboardWorkouts";
import { getWorkoutsArray } from "@/lib/workouts";
import { prisma } from "@/lib/prisma";
import AdminPanel from "@/components/AdminPanel";
import RaceGoal from "@/components/RaceGoal";
import RefundRequest from "@/components/RefundRequest";
import CancelMembership from "@/components/CancelMembership";
import OnboardingTutorial from "@/components/OnboardingTutorial";
import CustomizationPanel from "@/components/CustomizationPanel";
import EnjoymentPrompt from "@/components/EnjoymentPrompt";
import { determineArchetype, parseTrainingDays, parseExperience } from "@/lib/archetypes";
import { generateQuizWorkouts } from "@/lib/workout-generator";

const ADMIN_EMAIL = "jackfrisbie14@gmail.com";
const FREE_ACCESS_EMAILS = [ADMIN_EMAIL, "dlmanning1919@gmail.com", "hbetron@yahoo.com"];

// Archetype descriptions keyed by label
const archetypeDescriptions = {
  "The Speed Demon": "You live for PRs and the track. Speed work and intervals are your bread and butter.",
  "The Distance Runner": "You're built for the long haul. Endurance and steady mileage fuel your engine.",
  "The Racer": "You train with purpose — structured race prep with a clear target on the calendar.",
  "The Everyday Runner": "You run for the joy of it. Consistency and enjoyment keep you lacing up day after day.",
};

export default async function Dashboard() {
  const session = await auth();

  if (!session?.user) {
    redirect("/signin");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      id: true,
      stripeCurrentPeriodEnd: true,
      raceName: true,
      raceDate: true,
      raceDistance: true,
      archetype: true,
      trainingDays: true,
      racePlanActive: true,
      experience: true,
      raceGoalTime: true,
      quizAnswers: true,
      referredBy: true,
      referralRewardApplied: true,
      enjoymentPromptDismissed: true,
      firstPaidAt: true,
      tourCompleted: true,
    },
  });

  const isAdmin = session.user.email === ADMIN_EMAIL;

  const raceGoal = user?.raceName ? {
    raceName: user.raceName,
    raceDate: user.raceDate,
    raceDistance: user.raceDistance,
  } : null;

  const isSubscribed =
    FREE_ACCESS_EMAILS.includes(session.user.email) ||
    (user?.stripeCurrentPeriodEnd &&
    new Date(user.stripeCurrentPeriodEnd) > new Date());

  // Enjoyment prompt: show after 30 days of first paid month
  const showEnjoymentPrompt = isSubscribed
    && user?.firstPaidAt
    && new Date(user.firstPaidAt).getTime() + 30 * 24 * 60 * 60 * 1000 < Date.now()
    && !user?.enjoymentPromptDismissed;

  // Get race plan info if active
  let racePlanInfo = null;
  if (user?.racePlanActive) {
    const activePlan = await prisma.racePlan.findFirst({
      where: { userId: user.id, isActive: true },
      select: { currentWeek: true, totalWeeks: true, phases: true },
    });
    if (activePlan) {
      // Determine current phase
      const phases = activePlan.phases;
      let currentPhase = "base";
      if (Array.isArray(phases)) {
        for (const p of phases) {
          if (activePlan.currentWeek >= p.startWeek && activePlan.currentWeek <= p.endWeek) {
            currentPhase = p.name;
            break;
          }
        }
      }
      racePlanInfo = {
        currentWeek: activePlan.currentWeek,
        totalWeeks: activePlan.totalWeeks,
        currentPhase,
        phases: Array.isArray(phases) ? phases : [],
      };
    }
  }

  // Determine which week to show
  const currentWeekNum = racePlanInfo?.currentWeek || 1;

  // Query stored workouts from DB
  let workouts = await prisma.workout.findMany({
    where: {
      userId: user.id,
      source: user.racePlanActive ? "race" : "quiz",
      weekNumber: currentWeekNum,
    },
    orderBy: { dayNumber: "asc" },
  });

  // Migration safety: if no stored workouts exist but user has quiz answers, generate on the fly
  if (workouts.length === 0 && user?.quizAnswers) {
    const answersArray = Array.isArray(user.quizAnswers) ? user.quizAnswers : Object.values(user.quizAnswers || {});
    const archetype = determineArchetype(answersArray);
    const trainingDays = user.trainingDays || parseTrainingDays(answersArray[2]);
    const experience = user.experience || parseExperience(answersArray[3]);

    const generated = await generateQuizWorkouts({
      archetype,
      trainingDays,
      experience,
    });

    // Store them
    if (generated.length > 0) {
      await prisma.workout.createMany({
        data: generated.map((w) => ({
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

      // Update user archetype if not set
      if (!user.archetype) {
        await prisma.user.update({
          where: { id: user.id },
          data: { archetype: archetype.label, trainingDays },
        });
      }

      workouts = generated;
    }
  }

  // Fall back to static template if still no workouts
  if (workouts.length === 0) {
    workouts = getWorkoutsArray();
  }

  // Calculate workout type counts from actual workouts
  const speedDays = workouts.filter((w) => w.type === "Run" && (w.title.includes("Interval") || w.title.includes("Tempo") || w.title.includes("Hill") || w.title.includes("Fartlek"))).length;
  const easyDays = workouts.filter((w) => w.type === "Run" && !w.title.includes("Interval") && !w.title.includes("Tempo") && !w.title.includes("Hill") && !w.title.includes("Fartlek")).length;
  const recoveryDays = workouts.filter((w) => w.type === "Recovery" || w.type === "CrossTrain").length;

  const archetypeLabel = user?.archetype || "The Everyday Runner";
  const archetypeDescription = archetypeDescriptions[archetypeLabel] ||
    "You run for the joy of it. Consistency and enjoyment keep you lacing up day after day.";

  // Compute effective experience level (stored override or quiz-derived)
  const answersForExperience = user?.quizAnswers
    ? (Array.isArray(user.quizAnswers) ? user.quizAnswers : Object.values(user.quizAnswers || {}))
    : [];
  const effectiveExperience = user?.experience || parseExperience(answersForExperience[3]);

  return (
    <main className="min-h-screen pb-20">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="mx-auto max-w-4xl px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">
              Stride & Steel <span className="text-blue-500">Running</span>
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              {session.user.image && (
                <img
                  src={session.user.image}
                  alt={session.user.name || "User"}
                  className="w-8 h-8 rounded-full"
                />
              )}
              <span className="text-sm text-zinc-400 hidden sm:block">
                {session.user.name || session.user.email}
              </span>
            </div>
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/signin" });
              }}
            >
              <button
                type="submit"
                className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="mx-auto max-w-4xl px-6 py-8">
        {/* Admin Panel - Only for admin */}
        {isAdmin && <AdminPanel />}

        {/* Subscription Banner */}
        {!isSubscribed && (
          <div className="mb-8 rounded-xl border border-blue-500/30 bg-blue-500/10 p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold">Unlock Full Access</h2>
                <p className="text-sm text-zinc-400">
                  Subscribe to get personalized running workouts and full features.
                </p>
              </div>
              <Link
                href="/pricing"
                className="inline-block rounded-lg bg-blue-500 px-6 py-3 font-semibold text-white transition-colors hover:bg-blue-600 text-center"
              >
                Subscribe - $29.99/mo
              </Link>
            </div>
          </div>
        )}

        {/* Welcome Section */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold sm:text-3xl">
              Welcome back, {session.user.name?.split(" ")[0] || "Runner"}!
            </h2>
            <p className="mt-2 text-zinc-400">
              {isSubscribed
                ? "Here's your personalized running plan for this week."
                : "Preview your training plan below."}
            </p>
          </div>
        </div>

        {/* Race Mode Banner */}
        {user?.racePlanActive && racePlanInfo && (
          <div className="mb-8 rounded-xl border border-blue-500/30 bg-gradient-to-r from-blue-500/10 to-zinc-900 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🏁</span>
                <div>
                  <p className="text-sm text-blue-400 font-medium">Race Training Mode</p>
                  <p className="text-lg font-bold">
                    Week {racePlanInfo.currentWeek} of {racePlanInfo.totalWeeks}
                  </p>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-500/20 text-blue-400 border border-blue-500/30 capitalize">
                {racePlanInfo.currentPhase} Phase
              </span>
            </div>

            {/* Overall progress */}
            <div className="mt-4 h-2 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-500"
                style={{ width: `${(racePlanInfo.currentWeek / racePlanInfo.totalWeeks) * 100}%` }}
              />
            </div>
            <p className="text-xs text-zinc-500 mt-1 text-right">
              {Math.round((racePlanInfo.currentWeek / racePlanInfo.totalWeeks) * 100)}% to race day
            </p>

            {/* Phase breakdown */}
            {racePlanInfo.phases.length > 0 && (
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
                {racePlanInfo.phases.map((phase) => {
                  const isCurrent = racePlanInfo.currentPhase === phase.name;
                  const isCompleted = racePlanInfo.currentWeek > phase.endWeek;
                  const weeksIntoPhase = Math.max(0, Math.min(phase.weeks, racePlanInfo.currentWeek - phase.startWeek + 1));
                  const phaseProgress = isCompleted ? 100 : isCurrent ? Math.round((weeksIntoPhase / phase.weeks) * 100) : 0;

                  const phaseColors = {
                    base: { bar: "bg-blue-500", text: "text-blue-400", border: "border-blue-500/30", bg: "bg-blue-500/10" },
                    build: { bar: "bg-blue-600", text: "text-blue-300", border: "border-blue-600/30", bg: "bg-blue-600/10" },
                    peak: { bar: "bg-red-500", text: "text-red-400", border: "border-red-500/30", bg: "bg-red-500/10" },
                    taper: { bar: "bg-green-500", text: "text-green-400", border: "border-green-500/30", bg: "bg-green-500/10" },
                  };
                  const colors = phaseColors[phase.name] || phaseColors.base;

                  return (
                    <div
                      key={phase.name}
                      className={`rounded-lg border p-3 ${isCurrent ? `${colors.border} ${colors.bg}` : "border-zinc-800 bg-zinc-900"} ${isCompleted ? "opacity-60" : ""}`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <p className={`text-xs font-semibold capitalize ${isCurrent ? colors.text : "text-zinc-400"}`}>
                          {phase.name}
                        </p>
                        <p className="text-xs text-zinc-500">{phase.weeks}w</p>
                      </div>
                      <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${colors.bar} transition-all duration-500 rounded-full`}
                          style={{ width: `${phaseProgress}%` }}
                        />
                      </div>
                      <p className={`text-xs mt-1 ${isCurrent ? colors.text : "text-zinc-600"}`}>
                        {isCompleted ? "Complete" : isCurrent ? `${phaseProgress}%` : `Wk ${phase.startWeek}-${phase.endWeek}`}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Archetype Badge */}
        <div className="mb-8 rounded-xl border border-blue-500/30 bg-blue-500/10 p-6 text-center">
          <p className="text-sm text-blue-400 mb-2">Your Running Archetype</p>
          <p className="text-xl font-bold">{archetypeLabel}</p>
          <p className="text-sm text-zinc-400 mt-2">{archetypeDescription}</p>
        </div>

        {/* Race Goal - For subscribed users */}
        <div data-tour="race-goal">
          {isSubscribed && <RaceGoal initialRaceGoal={raceGoal} racePlanActive={user?.racePlanActive} racePlanInfo={racePlanInfo} goalTime={user?.raceGoalTime} />}
        </div>

        {/* Stats Overview */}
        <div data-tour="stats" className="grid grid-cols-3 gap-4 mb-8">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4 text-center">
            <p className="text-2xl font-bold text-blue-500">{speedDays}</p>
            <p className="text-sm text-zinc-500">Speed Days</p>
          </div>
          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4 text-center">
            <p className="text-2xl font-bold text-green-500">{easyDays}</p>
            <p className="text-sm text-zinc-500">Easy Days</p>
          </div>
          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4 text-center">
            <p className="text-2xl font-bold text-purple-500">{recoveryDays}</p>
            <p className="text-sm text-zinc-500">Recovery</p>
          </div>
        </div>

        {/* Enjoyment Prompt + Referral */}
        {showEnjoymentPrompt && <EnjoymentPrompt userEmail={session.user.email} />}

        {/* Workouts */}
        <DashboardWorkouts workouts={workouts} isSubscribed={isSubscribed} />

        {/* Customization Settings - For subscribed users */}
        {isSubscribed && (
          <div data-tour="customization">
            <CustomizationPanel
              initialDays={user?.trainingDays || 5}
              initialExperience={effectiveExperience}
              racePlanActive={user?.racePlanActive}
            />
          </div>
        )}

        {/* Account Settings - Discreet */}
        {isSubscribed && (
          <div className="mt-16 pt-6 border-t border-zinc-800/50">
            <details className="group">
              <summary className="flex items-center gap-2 text-xs text-zinc-600 cursor-pointer hover:text-zinc-500 transition-colors list-none">
                <svg className="w-3 h-3 transition-transform group-open:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                Account settings
              </summary>
              <div className="mt-4 space-y-3">
                <div className="rounded-lg border border-green-500/30 bg-green-500/10 p-3 flex items-center gap-3">
                  <svg className="h-4 w-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-sm text-green-400">
                    Pro subscription active until{" "}
                    {new Date(user.stripeCurrentPeriodEnd).toLocaleDateString()}
                  </span>
                </div>
                <CancelMembership />
                <RefundRequest />
              </div>
            </details>
          </div>
        )}

        {/* Disclaimer */}
        <div className="mt-16 pt-6 border-t border-zinc-800/50 text-xs text-zinc-600 max-w-2xl mx-auto leading-relaxed text-center">
          <p className="font-semibold text-zinc-500 mb-2">Disclaimer</p>
          <p>
            Stride & Steel Running provides general fitness information and AI-generated training plans for educational purposes only. This content is not medical advice and is not intended to diagnose, treat, cure, or prevent any condition or disease. Always consult a qualified healthcare provider or certified fitness professional before beginning any exercise program, especially if you have pre-existing health conditions, injuries, or concerns.
          </p>
          <p className="mt-2">
            By using this service, you acknowledge that all physical activity carries inherent risks of injury. Stride & Steel Running, its owners, employees, and affiliates assume no liability for any injuries, damages, or losses resulting from the use of information or training plans provided through this platform. You participate in any suggested workouts entirely at your own risk.
          </p>
        </div>

      </div>

      {/* Onboarding Tutorial for new subscribers */}
      {isSubscribed && !user?.tourCompleted && <OnboardingTutorial show={true} />}
    </main>
  );
}
