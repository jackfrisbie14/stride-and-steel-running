// 4 Running Archetypes with Speed/Easy/Recovery ratios
export const archetypes = {
  speedDemon: {
    key: "speedDemon",
    label: "The Speed Demon",
    description: "You live for PRs and the track. Speed work and intervals are your bread and butter.",
    ratios: { speed: 40, easy: 40, recovery: 20 },
  },
  distanceRunner: {
    key: "distanceRunner",
    label: "The Distance Runner",
    description: "You're built for the long haul. Endurance and steady mileage fuel your engine.",
    ratios: { speed: 20, easy: 55, recovery: 25 },
  },
  racer: {
    key: "racer",
    label: "The Racer",
    description: "You train with purpose — structured race prep with a clear target on the calendar.",
    ratios: { speed: 35, easy: 45, recovery: 20 },
  },
  everydayRunner: {
    key: "everydayRunner",
    label: "The Everyday Runner",
    description: "You run for the joy of it. Consistency and enjoyment keep you lacing up day after day.",
    ratios: { speed: 25, easy: 45, recovery: 30 },
  },
};

/**
 * Determine archetype from quiz answers using a points-based scoring system.
 * Quiz stores full strings with emojis, so we use .includes() for matching.
 *
 * @param {string[]} answers - Array of 10 quiz answer strings
 * @returns {{ key: string, label: string, description: string }}
 */
export function determineArchetype(answers) {
  const scores = {
    speedDemon: 0,
    distanceRunner: 0,
    racer: 0,
    everydayRunner: 0,
  };

  if (!answers || !Array.isArray(answers) || answers.length === 0) {
    return archetypes.everydayRunner;
  }

  // Q1 (index 0) — Runner type
  const q1 = (answers[0] || "").toLowerCase();
  if (q1.includes("competitive")) scores.speedDemon += 3;
  else if (q1.includes("casual")) scores.everydayRunner += 3;
  else if (q1.includes("beginner")) scores.everydayRunner += 2;
  else if (q1.includes("returning")) scores.racer += 2;

  // Q2 (index 1) — Main goal
  const q2 = (answers[1] || "").toLowerCase();
  if (q2.includes("faster 5k") || q2.includes("speed")) scores.speedDemon += 3;
  else if (q2.includes("half marathon") || q2.includes("marathon")) scores.distanceRunner += 3;
  else if (q2.includes("general fitness") || q2.includes("consistently")) scores.everydayRunner += 3;

  // Q5 (index 4) — Biggest challenge
  const q5 = (answers[4] || "").toLowerCase();
  if (q5.includes("speed")) scores.speedDemon += 2;
  else if (q5.includes("endurance")) scores.distanceRunner += 2;
  else if (q5.includes("consistency") || q5.includes("motivation")) scores.everydayRunner += 2;
  else if (q5.includes("injuries")) scores.racer += 2;

  // Q6 (index 5) — Race coming up
  const q6 = (answers[5] || "").toLowerCase();
  if (q6.includes("within 3") || q6.includes("3-6")) scores.racer += 3;
  else if (q6.includes("don't race")) scores.everydayRunner += 2;

  // Q7 (index 6) — 12-week success vision
  const q7 = (answers[6] || "").toLowerCase();
  if (q7.includes("pr") || q7.includes("faster")) scores.speedDemon += 3;
  else if (q7.includes("farther") || q7.includes("distance")) scores.distanceRunner += 3;
  else if (q7.includes("consistently")) scores.everydayRunner += 2;
  else if (q7.includes("enjoy")) scores.everydayRunner += 3;

  // Q10 (index 9) — Primary distance
  const q10 = (answers[9] || "").toLowerCase();
  if (q10.includes("5k") || q10.includes("10k")) scores.speedDemon += 3;
  else if (q10.includes("half") || q10.includes("marathon") || q10.includes("ultra")) scores.distanceRunner += 3;
  else if (q10.includes("no specific")) scores.everydayRunner += 2;

  // Find the archetype with the highest score
  let maxKey = "everydayRunner";
  let maxScore = scores.everydayRunner;

  for (const [key, score] of Object.entries(scores)) {
    if (score > maxScore) {
      maxScore = score;
      maxKey = key;
    }
  }

  return archetypes[maxKey];
}

/**
 * Parse training days from Q3 answer string.
 * Expects strings like "3 days", "4 days", "5 days", "6+ days"
 */
export function parseTrainingDays(answer) {
  if (!answer) return 5;
  const match = answer.match(/(\d+)/);
  if (match) {
    const days = parseInt(match[1], 10);
    return Math.max(3, Math.min(7, days));
  }
  return 5;
}

/**
 * Parse experience level from Q4 answer string.
 * Returns "beginner", "intermediate", or "advanced"
 */
export function parseExperience(answer) {
  if (!answer) return "intermediate";
  const lower = answer.toLowerCase();
  if (lower.includes("beginner") || lower.includes("new") || lower.includes("just starting")) return "beginner";
  if (lower.includes("advanced") || lower.includes("years") || lower.includes("experienced")) return "advanced";
  return "intermediate";
}
