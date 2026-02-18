// Template workouts for running-only program
export const templateWorkouts = {
  monday: {
    day: "Monday",
    type: "Run",
    title: "Interval Run",
    exercises: [
      { name: "Warm-up Jog", duration: "10 min", pace: "Easy" },
      { name: "Intervals", duration: "8 × 400m", pace: "5K pace with 90 sec jog rest" },
      { name: "Cool-down Jog", duration: "10 min", pace: "Easy" },
      { name: "Stretching", duration: "5 min", notes: "Full body" },
    ],
  },
  tuesday: {
    day: "Tuesday",
    type: "Run",
    title: "Easy Run",
    exercises: [
      { name: "Warm-up Walk", duration: "5 min", pace: "Easy" },
      { name: "Easy Run", duration: "30 min", pace: "Conversational pace (Zone 2)" },
      { name: "Cool-down Walk", duration: "5 min", pace: "Easy" },
      { name: "Post-Run Stretching", duration: "10 min", notes: "Focus on hips, quads, calves" },
    ],
  },
  wednesday: {
    day: "Wednesday",
    type: "Run",
    title: "Tempo Run",
    exercises: [
      { name: "Warm-up Jog", duration: "10 min", pace: "Easy" },
      { name: "Tempo Run", duration: "20 min", pace: "Comfortably hard (Zone 3-4)" },
      { name: "Cool-down Jog", duration: "10 min", pace: "Easy" },
      { name: "Dynamic Stretching", duration: "5 min", notes: "Leg swings, hip circles" },
    ],
  },
  thursday: {
    day: "Thursday",
    type: "Run",
    title: "Easy Run + Strides",
    exercises: [
      { name: "Easy Run", duration: "25 min", pace: "Conversational pace (Zone 2)" },
      { name: "Strides", duration: "6 × 100m", pace: "Fast & relaxed with walk-back recovery" },
      { name: "Cool-down Walk", duration: "5 min", pace: "Easy" },
      { name: "Post-Run Stretching", duration: "10 min", notes: "Focus on hips, quads, calves" },
    ],
  },
  friday: {
    day: "Friday",
    type: "Run",
    title: "Fartlek Run",
    exercises: [
      { name: "Warm-up Jog", duration: "10 min", pace: "Easy" },
      { name: "Fartlek", duration: "20 min", pace: "Mix surges of 30s-3min, recover by feel" },
      { name: "Cool-down Jog", duration: "10 min", pace: "Easy" },
      { name: "Stretching", duration: "5 min", notes: "Full body" },
    ],
  },
  saturday: {
    day: "Saturday",
    type: "Run",
    title: "Long Run",
    exercises: [
      { name: "Warm-up Walk", duration: "5 min", pace: "Easy" },
      { name: "Long Run", duration: "45-60 min", pace: "Easy/Conversational (Zone 2)" },
      { name: "Cool-down Walk", duration: "5 min", pace: "Easy" },
      { name: "Foam Rolling", duration: "15 min", notes: "IT band, quads, calves, glutes" },
    ],
  },
  sunday: {
    day: "Sunday",
    type: "Recovery",
    title: "Active Recovery & Mobility",
    exercises: [
      { name: "Light Walk", duration: "20-30 min", pace: "Very easy" },
      { name: "Hip Mobility Flow", duration: "10 min", notes: "90/90 stretches, pigeon pose" },
      { name: "Lower Body Stretching", duration: "10 min", notes: "Calves, quads, hamstrings, hip flexors" },
      { name: "Foam Rolling", duration: "10 min", notes: "Full body, focus on legs" },
      { name: "Deep Breathing", duration: "5 min", notes: "Box breathing or meditation" },
    ],
  },
};

export function getWorkoutsArray() {
  return [
    templateWorkouts.monday,
    templateWorkouts.tuesday,
    templateWorkouts.wednesday,
    templateWorkouts.thursday,
    templateWorkouts.friday,
    templateWorkouts.saturday,
    templateWorkouts.sunday,
  ];
}

export function getWorkoutEmailHtml(workouts) {
  const workoutSections = workouts
    .map(
      (workout) => `
    <div style="margin-bottom: 24px; padding: 20px; background: #18181b; border-radius: 12px;">
      <h2 style="color: #3b82f6; margin: 0 0 4px 0; font-size: 18px;">${workout.day}</h2>
      <h3 style="color: #fafafa; margin: 0 0 16px 0; font-size: 16px;">${workout.title}</h3>
      <table style="width: 100%; border-collapse: collapse;">
        ${workout.exercises
          .map(
            (ex) => `
          <tr style="border-bottom: 1px solid #27272a;">
            <td style="padding: 8px 0; color: #fafafa;">${ex.name}</td>
            <td style="padding: 8px 0; color: #a1a1aa; text-align: right;">
              ${ex.sets ? `${ex.sets} x ${ex.reps}` : ex.duration || ""}
              ${ex.pace ? ` @ ${ex.pace}` : ""}
            </td>
          </tr>
        `
          )
          .join("")}
      </table>
    </div>
  `
    )
    .join("");

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; background: #09090b; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <div style="text-align: center; margin-bottom: 32px;">
            <h1 style="color: #fafafa; margin: 0; font-size: 28px;">Stride & Steel <span style="color: #3b82f6;">Running</span></h1>
            <p style="color: #3b82f6; margin: 8px 0 0 0; font-size: 14px;">Run Smarter. Get Faster. Train With Purpose.</p>
          </div>

          <div style="background: #18181b; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
            <h2 style="color: #fafafa; margin: 0 0 8px 0; font-size: 20px;">Your Custom Running Plan</h2>
            <p style="color: #a1a1aa; margin: 0; font-size: 14px;">Here's your personalized week of running workouts.</p>
          </div>

          ${workoutSections}

          <div style="text-align: center; margin-top: 32px; padding: 24px; background: #18181b; border-radius: 12px;">
            <p style="color: #a1a1aa; margin: 0 0 16px 0; font-size: 14px;">Ready to track your progress?</p>
            <a href="${process.env.NEXTAUTH_URL || "https://strideandsteelrunning.com"}/quiz"
               style="display: inline-block; background: #3b82f6; color: #ffffff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">
              Create Your Account
            </a>
          </div>

          <p style="color: #52525b; font-size: 12px; text-align: center; margin-top: 32px;">
            &copy; ${new Date().getFullYear()} Stride & Steel Running. All rights reserved.
          </p>
        </div>
      </body>
    </html>
  `;
}
