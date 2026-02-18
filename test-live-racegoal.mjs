import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();
const BASE_URL = "https://strideandsteel.com";
const TEST_EMAIL = "test-live-raceplan@test.com";
const TEST_PASSWORD = "TestPass123!";

async function main() {
  // 1. Create test user with hashed password and quiz data
  let user = await prisma.user.findUnique({ where: { email: TEST_EMAIL } });
  if (user) {
    await prisma.workout.deleteMany({ where: { userId: user.id } });
    await prisma.racePlan.deleteMany({ where: { userId: user.id } });
    await prisma.account.deleteMany({ where: { userId: user.id } });
    await prisma.session.deleteMany({ where: { userId: user.id } });
    await prisma.user.delete({ where: { email: TEST_EMAIL } });
  }

  const hashedPassword = await bcrypt.hash(TEST_PASSWORD, 10);
  user = await prisma.user.create({
    data: {
      email: TEST_EMAIL,
      password: hashedPassword,
      quizAnswers: [
        "\u{1F3C3} Marathon runner who wants to stay strong",
        "Run faster without losing muscle",
        "5 days a week",
        "Intermediate - been training for a while",
        "I feel slow when I add lifting to my routine",
        "3-4 times per week",
        "Hitting faster race times while maintaining strength",
        "Height/weight data",
        "Male",
        "\u{1F3C3} Run a faster 5K or 10K",
      ],
      archetype: "The Iron Runner",
      trainingDays: 5,
    },
  });
  console.log("1. Created test user:", user.id);

  // 2. Get CSRF token
  const csrfRes = await fetch(`${BASE_URL}/api/auth/csrf`);
  const { csrfToken } = await csrfRes.json();
  const cookies = csrfRes.headers.getSetCookie();
  console.log("2. Got CSRF token");

  // 3. Sign in
  const signInRes = await fetch(`${BASE_URL}/api/auth/callback/credentials`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Cookie: cookies.join("; "),
    },
    body: new URLSearchParams({
      csrfToken,
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
    }),
    redirect: "manual",
  });

  const signInCookies = signInRes.headers.getSetCookie();
  const allCookies = [...cookies, ...signInCookies].join("; ");
  console.log("3. Signed in, status:", signInRes.status);

  // 4. Verify session
  const sessionRes = await fetch(`${BASE_URL}/api/auth/session`, {
    headers: { Cookie: allCookies },
  });
  const session = await sessionRes.json();
  console.log("4. Session verified:", session.user?.email || "NO SESSION");

  if (!session.user?.email) {
    console.error("ERROR: Failed to establish session. Cannot proceed.");
    await cleanup(user.id);
    return;
  }

  // 5. POST to race-goal API
  const raceDate = new Date();
  raceDate.setDate(raceDate.getDate() + 12 * 7);

  console.log("");
  console.log("=== Calling POST /api/user/race-goal on LIVE site ===");
  console.log(`URL: ${BASE_URL}/api/user/race-goal`);
  console.log("Race: Spring Half Marathon 2026");
  console.log("Date:", raceDate.toISOString().split("T")[0]);
  console.log("Distance: Half Marathon");
  console.log("(Generating via Claude Haiku 4.5 in batches...)");
  console.log("");

  const startTime = Date.now();
  const raceGoalRes = await fetch(`${BASE_URL}/api/user/race-goal`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: allCookies,
    },
    body: JSON.stringify({
      raceName: "Spring Half Marathon 2026",
      raceDate: raceDate.toISOString(),
      raceDistance: "Half Marathon",
    }),
  });

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  const raceGoalData = await raceGoalRes.json();
  console.log(`Response (${elapsed}s, status ${raceGoalRes.status}):`);
  console.log(JSON.stringify(raceGoalData, null, 2));
  console.log("");

  if (raceGoalData.error) {
    console.error("ERROR: Race goal API failed:", raceGoalData.error);
    await cleanup(user.id);
    return;
  }

  // 6. Verify GET returns plan info
  const getRes = await fetch(`${BASE_URL}/api/user/race-goal`, {
    headers: { Cookie: allCookies },
  });
  const getData = await getRes.json();
  console.log("=== GET /api/user/race-goal ===");
  console.log("racePlanActive:", getData.racePlanActive);
  console.log("planInfo:", JSON.stringify(getData.planInfo));
  console.log("");

  // 7. Verify DB
  const workouts = await prisma.workout.findMany({
    where: { userId: user.id, source: "race" },
    orderBy: [{ weekNumber: "asc" }, { dayNumber: "asc" }],
  });
  console.log("=== DB Verification ===");
  console.log(`Total race workouts: ${workouts.length}`);

  const typeCounts = {};
  workouts.forEach((w) => { typeCounts[w.type] = (typeCounts[w.type] || 0) + 1; });
  console.log("By type:", JSON.stringify(typeCounts));

  const week1 = workouts.filter((w) => w.weekNumber === 1);
  console.log("\nWeek 1:");
  week1.forEach((w) => console.log(`  Day ${w.dayNumber} (${w.day}): ${w.type} - ${w.title}`));

  const lastWeekNum = Math.max(...workouts.map((w) => w.weekNumber));
  const lastWeek = workouts.filter((w) => w.weekNumber === lastWeekNum);
  console.log(`\nWeek ${lastWeekNum} (race week):`);
  lastWeek.forEach((w) => console.log(`  Day ${w.dayNumber} (${w.day}): ${w.type} - ${w.title}`));
  console.log("");

  // 8. Test DELETE
  console.log("=== Calling DELETE /api/user/race-goal ===");
  const deleteRes = await fetch(`${BASE_URL}/api/user/race-goal`, {
    method: "DELETE",
    headers: { Cookie: allCookies },
  });
  const deleteData = await deleteRes.json();
  console.log("Delete response:", JSON.stringify(deleteData));

  const raceAfter = await prisma.workout.count({ where: { userId: user.id, source: "race" } });
  const quizAfter = await prisma.workout.count({ where: { userId: user.id, source: "quiz" } });
  console.log(`Race workouts after delete: ${raceAfter}`);
  console.log(`Quiz workouts regenerated: ${quizAfter}`);
  console.log("");

  // 9. Cleanup
  await cleanup(user.id);
}

async function cleanup(userId) {
  await prisma.workout.deleteMany({ where: { userId } });
  await prisma.racePlan.deleteMany({ where: { userId } });
  await prisma.account.deleteMany({ where: { userId } });
  await prisma.session.deleteMany({ where: { userId } });
  await prisma.user.delete({ where: { email: TEST_EMAIL } });
  console.log("Test data cleaned up.");
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error("ERROR:", e);
  process.exit(1);
});
