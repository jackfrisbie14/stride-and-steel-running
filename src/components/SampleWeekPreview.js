"use client";

import { useState, useEffect } from "react";

// ---------------------------------------------------------------------------
// Sample workout data with exercise tutorials
// ---------------------------------------------------------------------------
const SAMPLE_WORKOUTS = [
  {
    day: "Monday",
    type: "Speed",
    title: "Interval Run",
    icon: "\u{1F3C3}",
    color: "text-red-400",
    bg: "bg-red-500/10",
    border: "border-red-500/30",
    accent: "blue",
    duration: "45 min",
    exercises: [
      {
        name: "Warm-up Jog",
        duration: "10 min",
        notes: "Easy pace, gradually increase",
        tutorial: {
          category: "Warm-up",
          difficulty: "Beginner",
          steps: [
            "Start walking briskly for 2 minutes to get blood flowing.",
            "Transition into a very easy jog — slower than your easy run pace.",
            "Gradually increase pace over the next 6-8 minutes until you feel loose.",
            "Finish with 30 seconds of leg swings and high knees.",
          ],
          tips: [
            "You should be able to hold a full conversation the entire time.",
            "Don't skip this — it reduces injury risk significantly.",
            "Focus on relaxed shoulders and natural arm swing.",
          ],
          mistakes: [
            "Starting too fast — this isn't a workout, it's preparation.",
            "Skipping the warm-up entirely to save time.",
            "Static stretching before running (save that for after).",
          ],
        },
      },
      {
        name: "800m Repeats",
        duration: "6 x 800m",
        notes: "5K pace, 400m recovery jog between",
        tutorial: {
          category: "Speed Work",
          difficulty: "Intermediate",
          steps: [
            "Run 800 meters (2 laps) at your current 5K race pace.",
            "Jog 400 meters (1 lap) slowly for recovery — don't stop completely.",
            "Repeat 6 times total, maintaining consistent pace across all reps.",
            "If pace drops more than 10 seconds, stop early — quality over quantity.",
          ],
          tips: [
            "Run the first rep slightly conservative — you should feel strong through rep 4.",
            "Focus on turnover and staying relaxed, especially in the arms and jaw.",
            "Use a GPS watch or track to keep honest splits.",
          ],
          mistakes: [
            "Going out too fast on rep 1 and dying by rep 4.",
            "Standing still during recovery instead of jogging.",
            "Running these on back-to-back days with other hard workouts.",
          ],
        },
      },
      {
        name: "Cool-down Jog",
        duration: "10 min",
        notes: "Easy pace, bring heart rate down",
        tutorial: {
          category: "Cool-down",
          difficulty: "Beginner",
          steps: [
            "Slow to a very easy jog immediately after your last repeat.",
            "Maintain a shuffle pace for 8-10 minutes — slower than warm-up.",
            "Finish with 2-3 minutes of walking.",
            "Do static stretches: quads, hamstrings, calves, hip flexors (30 sec each).",
          ],
          tips: [
            "This helps flush lactate and speeds up recovery.",
            "Resist the urge to stop immediately after the last hard rep.",
            "Good time to reflect on the workout — what went well?",
          ],
          mistakes: [
            "Stopping abruptly after the last interval.",
            "Skipping post-run stretching.",
            "Running the cool-down too fast.",
          ],
        },
      },
      {
        name: "Standing Quad Stretch",
        duration: "30 sec each",
        notes: "Hold steady, don't bounce",
        tutorial: {
          category: "Stretching",
          difficulty: "Beginner",
          steps: [
            "Stand on one leg (use a wall for balance if needed).",
            "Grab your opposite ankle and pull your heel toward your glute.",
            "Keep your knees together and hips square — don't lean forward.",
            "Hold for 30 seconds, then switch legs.",
          ],
          tips: [
            "You should feel a stretch in the front of your thigh, not pain.",
            "Squeeze your glute on the stretching side for a deeper stretch.",
            "Breathe steadily — don't hold your breath.",
          ],
          mistakes: [
            "Bouncing or pulsing the stretch.",
            "Letting the knee flare out to the side.",
            "Arching your lower back.",
          ],
        },
      },
      {
        name: "Calf Stretch",
        duration: "30 sec each",
        notes: "Wall stretch, straight back leg",
        tutorial: {
          category: "Stretching",
          difficulty: "Beginner",
          steps: [
            "Face a wall and place both hands on it at shoulder height.",
            "Step one foot back about 2-3 feet, keeping the heel on the ground.",
            "Lean into the wall until you feel a stretch in the back calf.",
            "Hold 30 seconds, then switch legs. Repeat with a bent knee for the soleus.",
          ],
          tips: [
            "Keep the back leg completely straight for the gastrocnemius stretch.",
            "Point your toes straight ahead — not turned out.",
            "For a deeper stretch, move the back foot further away.",
          ],
          mistakes: [
            "Lifting the back heel off the ground.",
            "Bending the back knee (for the straight-leg variation).",
            "Rushing through — hold the full 30 seconds.",
          ],
        },
      },
    ],
  },
  {
    day: "Tuesday",
    type: "Easy",
    title: "Easy Run",
    icon: "\u{1F3C3}",
    color: "text-green-400",
    bg: "bg-green-500/10",
    border: "border-green-500/30",
    accent: "blue",
    duration: "40 min",
    exercises: [
      {
        name: "Easy Pace Run",
        duration: "40 min",
        notes: "Conversational pace — you should be able to hold a full sentence",
        tutorial: {
          category: "Base Building",
          difficulty: "Beginner",
          steps: [
            "Start at a relaxed pace — slower than you think.",
            "Maintain a pace where you could comfortably chat with a friend.",
            "If breathing gets heavy, slow down. No ego on easy days.",
            "Keep a consistent effort for the full 40 minutes.",
          ],
          tips: [
            "Easy runs build your aerobic engine — they're the foundation of all running.",
            "Heart rate should stay in zone 2 (roughly 60-70% of max HR).",
            "These runs should feel genuinely easy. Most people run them too fast.",
          ],
          mistakes: [
            "Running easy days too fast — this is the #1 mistake runners make.",
            "Comparing your easy pace to other runners.",
            "Skipping easy runs because they feel 'too slow' to matter.",
          ],
        },
      },
      {
        name: "Hip Circles",
        duration: "1 min",
        notes: "10 each direction, each leg",
        tutorial: {
          category: "Mobility",
          difficulty: "Beginner",
          steps: [
            "Stand on one leg (hold a wall for balance).",
            "Lift the other knee to waist height.",
            "Make large circles with the knee — 10 forward, 10 backward.",
            "Switch legs and repeat.",
          ],
          tips: ["Go slow and controlled.", "Keep your standing leg slightly bent.", "Great for hip mobility and injury prevention."],
          mistakes: ["Rushing through the circles.", "Using momentum instead of control.", "Skipping this because it seems too easy."],
        },
      },
      {
        name: "Walking Lunges",
        duration: "2 min",
        notes: "Cool-down, 10 each leg",
        tutorial: {
          category: "Cool-down",
          difficulty: "Beginner",
          steps: [
            "Step forward into a lunge — front knee over ankle, back knee near the ground.",
            "Push through the front heel and step the back foot forward into the next lunge.",
            "Alternate legs for 10 reps each side.",
            "Keep your torso upright and core engaged.",
          ],
          tips: ["Focus on balance, not speed.", "Keep your front knee tracking over your toes.", "Great for active recovery after a run."],
          mistakes: ["Letting the front knee cave inward.", "Leaning too far forward.", "Taking steps that are too short."],
        },
      },
    ],
  },
  {
    day: "Wednesday",
    type: "Speed",
    title: "Tempo Run",
    icon: "\u{1F3C3}",
    color: "text-red-400",
    bg: "bg-red-500/10",
    border: "border-red-500/30",
    accent: "blue",
    duration: "50 min",
    exercises: [
      {
        name: "Warm-up Jog",
        duration: "15 min",
        notes: "Easy pace, dynamic stretches at the end",
        tutorial: {
          category: "Warm-up",
          difficulty: "Beginner",
          steps: ["Start with a 10-minute easy jog.", "Transition into dynamic drills: high knees, butt kicks, leg swings.", "Do 4-6 strides (80% effort for 15-20 seconds each).", "You should feel warm and ready to push."],
          tips: ["The warm-up is especially important before tempo work.", "Strides help 'wake up' your fast-twitch muscles.", "Don't rush — 15 minutes is worth it."],
          mistakes: ["Cutting the warm-up short before tempo efforts.", "Skipping dynamic drills.", "Going too hard on the strides."],
        },
      },
      {
        name: "Tempo Effort",
        duration: "20 min",
        notes: "Comfortably hard — threshold pace",
        tutorial: {
          category: "Threshold",
          difficulty: "Intermediate",
          steps: ["Settle into your tempo pace — comfortably hard, not all-out.", "Maintain a steady effort for the full 20 minutes.", "You should be able to say short phrases but not hold a conversation.", "If you can't maintain pace, slow slightly rather than stopping."],
          tips: ["Tempo pace is roughly your half-marathon race pace.", "Focus on relaxed form — don't clench your fists or hunch your shoulders.", "This workout builds your lactate threshold — crucial for racing."],
          mistakes: ["Starting too fast and fading.", "Running tempo runs too frequently (1x per week is enough).", "Confusing tempo with interval pace — tempo is steady, not all-out."],
        },
      },
      {
        name: "Cool-down Jog",
        duration: "10 min",
        notes: "Easy pace",
        tutorial: {
          category: "Cool-down",
          difficulty: "Beginner",
          steps: ["Slow to a very easy jog after the tempo block.", "Maintain an easy shuffle for 10 minutes.", "Walk for the last 2 minutes.", "Stretch major muscle groups."],
          tips: ["Don't stop immediately after the tempo block.", "Let your heart rate come down gradually.", "Hydrate as soon as you finish."],
          mistakes: ["Stopping cold after the hard effort.", "Skipping the cool-down.", "Running the cool-down at tempo pace."],
        },
      },
      {
        name: "Foam Roll",
        duration: "5 min",
        notes: "Quads, calves, IT band",
        tutorial: {
          category: "Recovery",
          difficulty: "Beginner",
          steps: ["Place the roller under your quads and roll from hip to knee (1 min each leg).", "Roll your calves from ankle to knee (1 min each).", "Lie on your side and roll the IT band from hip to knee (30 sec each).", "Pause on any tender spots for 15-20 seconds."],
          tips: ["Don't roll directly on joints or bones.", "Moderate pressure — it shouldn't be excruciating.", "Roll slowly, not fast."],
          mistakes: ["Rolling too fast.", "Applying too much pressure on sensitive areas.", "Only foam rolling after hard workouts (do it daily)."],
        },
      },
    ],
  },
  {
    day: "Thursday",
    type: "Recovery",
    title: "Yoga for Runners",
    icon: "\u{1F9D8}",
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/30",
    accent: "blue",
    duration: "30 min",
    exercises: [
      {
        name: "Pigeon Pose",
        duration: "90 sec each",
        notes: "Deep hip opener — breathe into tightness",
        tutorial: {
          category: "Yoga",
          difficulty: "Beginner",
          steps: ["From a plank, bring your right knee forward behind your right wrist.", "Extend your left leg straight back, top of the foot on the floor.", "Square your hips and slowly lower your torso over the front leg.", "Hold for 90 seconds, breathing deeply, then switch sides."],
          tips: ["Place a block or pillow under your hip if it doesn't reach the floor.", "Focus on deep belly breathing to release tension.", "Don't force it — flexibility comes over time."],
          mistakes: ["Collapsing to one side instead of keeping hips square.", "Holding your breath through the discomfort.", "Forcing depth too quickly."],
        },
      },
      {
        name: "Downward Dog",
        duration: "60 sec",
        notes: "Pedal feet to stretch calves",
        tutorial: {
          category: "Yoga",
          difficulty: "Beginner",
          steps: ["Start on hands and knees, then push your hips up and back.", "Straighten your arms and press your chest toward your thighs.", "Pedal your feet — alternately bending each knee to stretch the calves.", "Hold for 60 seconds with steady breathing."],
          tips: ["It's okay if your heels don't touch the ground.", "Focus on lengthening the spine, not forcing straight legs.", "Spread your fingers wide for a solid base."],
          mistakes: ["Rounding the upper back.", "Locking the knees.", "Holding your breath."],
        },
      },
      {
        name: "Low Lunge",
        duration: "60 sec each",
        notes: "Hip flexor stretch, arms overhead",
        tutorial: {
          category: "Yoga",
          difficulty: "Beginner",
          steps: ["Step your right foot forward into a deep lunge, left knee on the ground.", "Tuck your left toes under or place the top of the foot flat.", "Reach both arms overhead and gently press hips forward.", "Hold 60 seconds, then switch sides."],
          tips: ["Squeeze your glute on the back leg for a deeper hip flexor stretch.", "Keep your front knee directly over the ankle.", "This is one of the best stretches for runners."],
          mistakes: ["Letting the front knee go past the toes.", "Arching the lower back excessively.", "Not holding long enough to get a real stretch."],
        },
      },
      {
        name: "Seated Forward Fold",
        duration: "90 sec",
        notes: "Hamstring stretch, relax the neck",
        tutorial: {
          category: "Yoga",
          difficulty: "Beginner",
          steps: ["Sit with legs extended straight in front of you.", "Hinge at the hips and reach toward your toes.", "Let your head relax and your neck drop.", "Hold for 90 seconds, breathing into tight hamstrings."],
          tips: ["Bend your knees slightly if hamstrings are very tight.", "Lead with your chest, not your head.", "Focus on the stretch, not touching your toes."],
          mistakes: ["Rounding the upper back to reach further.", "Bouncing to force more range.", "Holding your breath."],
        },
      },
      {
        name: "Supine Spinal Twist",
        duration: "60 sec each",
        notes: "Gentle twist, knees to one side",
        tutorial: {
          category: "Yoga",
          difficulty: "Beginner",
          steps: ["Lie on your back, arms out in a T position.", "Bring both knees to your chest, then drop them to the right.", "Keep both shoulders on the ground and look to the left.", "Hold 60 seconds, then switch sides."],
          tips: ["This releases the lower back and IT band.", "Let gravity do the work — don't force the knees down.", "Great for after long runs."],
          mistakes: ["Lifting the opposite shoulder off the floor.", "Rushing through the hold.", "Forcing the knees to the ground."],
        },
      },
      {
        name: "Foam Roll",
        duration: "5 min",
        notes: "Quads, hamstrings, calves, IT band",
        tutorial: {
          category: "Recovery",
          difficulty: "Beginner",
          steps: ["Roll each major muscle group for about 45-60 seconds.", "Start with quads, then hamstrings, calves, and IT band.", "Pause on any tender spots for 15-20 seconds.", "Use moderate pressure — breathe through it."],
          tips: ["Do this consistently, not just when sore.", "Roll slowly and deliberately.", "Pair with deep breathing."],
          mistakes: ["Rolling too fast.", "Skipping the IT band (runners need this most).", "Using too much pressure on already inflamed areas."],
        },
      },
    ],
  },
  {
    day: "Saturday",
    type: "Easy",
    title: "Long Run",
    icon: "\u{1F3C3}",
    color: "text-green-400",
    bg: "bg-green-500/10",
    border: "border-green-500/30",
    accent: "blue",
    duration: "90 min",
    exercises: [
      {
        name: "Easy Pace Run",
        duration: "80 min",
        notes: "Relaxed effort, build aerobic base",
        tutorial: {
          category: "Endurance",
          difficulty: "Intermediate",
          steps: ["Start conservatively — even slower than your normal easy pace.", "Settle into a relaxed rhythm by mile 2.", "Stay disciplined with pace — the goal is time on feet, not speed.", "Take water/fuel every 30-40 minutes if needed."],
          tips: ["Long runs are the single most important workout for distance runners.", "Heart rate zone 2 — you should be able to talk comfortably.", "Plan your route with water access or carry a bottle."],
          mistakes: ["Starting too fast because you feel fresh.", "Not fueling or hydrating on runs longer than 60 minutes.", "Running the long run at marathon pace throughout."],
        },
      },
      {
        name: "Marathon Pace Finish",
        duration: "10 min",
        notes: "Pick up to goal marathon pace for the final stretch",
        tutorial: {
          category: "Race Prep",
          difficulty: "Intermediate",
          steps: ["With 10 minutes remaining, gradually increase to marathon pace.", "Focus on maintaining good form as fatigue sets in.", "Practice the mental discipline of pushing when tired.", "Finish strong and transition to a walk."],
          tips: ["This teaches your body to run fast on tired legs — key for race day.", "Don't sprint — just a controlled increase to marathon effort.", "If you can't hold pace, that's useful data about your fitness."],
          mistakes: ["Going all-out — this is controlled, not a sprint.", "Skipping this because you're tired (that's the point).", "Forgetting to cool down after."],
        },
      },
      {
        name: "Walking Cool-down",
        duration: "5 min",
        notes: "Walk it out, hydrate",
        tutorial: {
          category: "Cool-down",
          difficulty: "Beginner",
          steps: ["Walk at an easy pace for 5 minutes.", "Focus on deep breathing and bringing your heart rate down.", "Sip water — don't gulp.", "Follow with static stretching."],
          tips: ["Walking immediately after a long run helps prevent blood pooling.", "Start refueling within 30 minutes (carbs + protein).", "This is a good time to assess how the run went."],
          mistakes: ["Sitting down immediately after finishing.", "Not rehydrating.", "Skipping the walking cool-down."],
        },
      },
      {
        name: "Static Stretching",
        duration: "5 min",
        notes: "Quads, hamstrings, hip flexors, calves",
        tutorial: {
          category: "Stretching",
          difficulty: "Beginner",
          steps: ["Hold each stretch for 30-45 seconds. Don't bounce.", "Quad stretch: standing, pull heel to glute.", "Hamstring stretch: seated forward fold or standing toe touch.", "Calf stretch: wall lean with straight back leg, then bent knee."],
          tips: ["Post-run is the best time for static stretching.", "Breathe deeply into each stretch.", "Hit the hip flexors too — runners are chronically tight there."],
          mistakes: ["Bouncing or forcing the stretch.", "Only stretching for 10 seconds per position.", "Skipping stretching because you're tired."],
        },
      },
    ],
  },
];

// ---------------------------------------------------------------------------
// Rating labels for pre/post workout check-ins
// ---------------------------------------------------------------------------
const ratingLabels = {
  preEnergyLevel: ["Exhausted", "Tired", "Okay", "Good", "Energized"],
  preSoreness: ["Very sore", "Sore", "Slight", "Fresh", "Great"],
  preMotivation: ["None", "Low", "Okay", "High", "Pumped"],
  difficulty: ["Too Easy", "Easy", "Just Right", "Hard", "Too Hard"],
  performance: ["Poor", "Below Avg", "Average", "Good", "Great"],
  enjoyment: ["Hated it", "Meh", "Okay", "Liked it", "Loved it"],
};

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function RatingButton({ value, selected, onClick, label }) {
  return (
    <button
      type="button"
      onClick={() => onClick(value)}
      className={`flex-1 py-2 px-1 text-xs rounded-lg transition-all ${
        selected ? "bg-blue-500 text-white" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
      }`}
    >
      {label}
    </button>
  );
}

function RatingGroup({ label, name, value, onChange, labels }) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-zinc-300">{label}</label>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((num) => (
          <RatingButton key={num} value={num} selected={value === num} onClick={onChange} label={labels[num - 1]} />
        ))}
      </div>
    </div>
  );
}

function ExerciseDetailModal({ exercise, onClose }) {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = "unset"; };
  }, []);

  useEffect(() => {
    const handleEscape = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  const t = exercise.tutorial;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-zinc-900 border border-zinc-800" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 bg-zinc-900 border-b border-zinc-800 p-4 flex items-center justify-between z-10">
          <div>
            <h2 className="text-lg font-bold">{exercise.name}</h2>
            <p className="text-sm text-zinc-500">{t.category} · {t.difficulty}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-zinc-800 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* How To */}
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-500/20 text-blue-500 text-xs">1</span>
              How To Perform
            </h3>
            <ol className="space-y-2">
              {t.steps.map((step, i) => (
                <li key={i} className="flex gap-3 text-sm text-zinc-300">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-zinc-800 text-zinc-500 text-xs flex items-center justify-center mt-0.5">{i + 1}</span>
                  {step}
                </li>
              ))}
            </ol>
          </div>

          {/* Tips */}
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-green-500/20 text-green-500 text-xs">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              </span>
              Form Tips
            </h3>
            <ul className="space-y-2">
              {t.tips.map((tip, i) => (
                <li key={i} className="flex gap-3 text-sm text-zinc-300">
                  <span className="flex-shrink-0 text-green-500 mt-0.5"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg></span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>

          {/* Common Mistakes */}
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-red-500/20 text-red-500 text-xs">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </span>
              Common Mistakes
            </h3>
            <ul className="space-y-2">
              {t.mistakes.map((m, i) => (
                <li key={i} className="flex gap-3 text-sm text-zinc-300">
                  <span className="flex-shrink-0 text-red-500 mt-0.5"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></span>
                  {m}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

function PreWorkoutModal({ workout, onClose, onSubmit }) {
  const [energy, setEnergy] = useState(null);
  const [soreness, setSoreness] = useState(null);
  const [motivation, setMotivation] = useState(null);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = "unset"; };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl bg-zinc-900 border border-zinc-800" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 bg-zinc-900 border-b border-zinc-800 p-4 flex items-center justify-between">
          <div>
            <p className="text-sm text-zinc-500">{workout.day}</p>
            <h2 className="text-lg font-bold">{workout.title}</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-zinc-800 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="p-6 space-y-6">
          <div className="text-center">
            <h3 className="text-xl font-semibold">Pre-Workout Check-in</h3>
            <p className="text-sm text-zinc-400 mt-1">How are you feeling before this workout?</p>
          </div>
          <RatingGroup label="Energy Level" name="energy" value={energy} onChange={setEnergy} labels={ratingLabels.preEnergyLevel} />
          <RatingGroup label="Muscle Soreness" name="soreness" value={soreness} onChange={setSoreness} labels={ratingLabels.preSoreness} />
          <RatingGroup label="Motivation" name="motivation" value={motivation} onChange={setMotivation} labels={ratingLabels.preMotivation} />
          <div className="flex gap-3 pt-2">
            <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-zinc-700 text-zinc-400 hover:bg-zinc-800 transition-colors">Skip Workout</button>
            <button
              onClick={() => { if (energy && soreness && motivation) onSubmit({ energy, soreness, motivation }); }}
              disabled={!energy || !soreness || !motivation}
              className="flex-1 py-3 rounded-xl bg-blue-500 font-semibold text-white hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Start Workout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function PostWorkoutModal({ workout, onClose, onSubmit }) {
  const [difficulty, setDifficulty] = useState(null);
  const [performance, setPerformance] = useState(null);
  const [enjoyment, setEnjoyment] = useState(null);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = "unset"; };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl bg-zinc-900 border border-zinc-800" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 bg-zinc-900 border-b border-zinc-800 p-4 flex items-center justify-between">
          <div>
            <p className="text-sm text-zinc-500">{workout.day}</p>
            <h2 className="text-lg font-bold">{workout.title}</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-zinc-800 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="p-6 space-y-6">
          <div className="text-center">
            <h3 className="text-xl font-semibold">Post-Workout Feedback</h3>
            <p className="text-sm text-zinc-400 mt-1">How did the workout go?</p>
          </div>
          <RatingGroup label="Difficulty" name="difficulty" value={difficulty} onChange={setDifficulty} labels={ratingLabels.difficulty} />
          <RatingGroup label="Performance" name="performance" value={performance} onChange={setPerformance} labels={ratingLabels.performance} />
          <RatingGroup label="Enjoyment" name="enjoyment" value={enjoyment} onChange={setEnjoyment} labels={ratingLabels.enjoyment} />
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">Notes (optional)</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Any thoughts about today's workout..." className="w-full h-20 rounded-lg bg-zinc-800 px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-zinc-700 text-zinc-400 hover:bg-zinc-800 transition-colors">Didn&apos;t Finish</button>
            <button
              onClick={() => { if (difficulty && performance && enjoyment) onSubmit({ difficulty, performance, enjoyment, notes }); }}
              disabled={!difficulty || !performance || !enjoyment}
              className="flex-1 py-3 rounded-xl bg-green-500 font-semibold text-white hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Complete!
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function SampleWeekPreview() {
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [completedExercises, setCompletedExercises] = useState({});
  const [workoutStates, setWorkoutStates] = useState({});
  const [preModal, setPreModal] = useState(null);
  const [postModal, setPostModal] = useState(null);

  const toggleExercise = (workoutIdx, exerciseIdx) => {
    const key = `${workoutIdx}-${exerciseIdx}`;
    setCompletedExercises((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const getWorkoutState = (idx) => workoutStates[idx] || "idle"; // idle | in_progress | completed

  const completedCount = (workoutIdx, workout) => {
    return workout.exercises.filter((_, j) => completedExercises[`${workoutIdx}-${j}`]).length;
  };

  return (
    <>
      <div className="space-y-3">
        {SAMPLE_WORKOUTS.map((w, i) => {
          const state = getWorkoutState(i);
          const done = completedCount(i, w);
          const total = w.exercises.length;

          return (
            <div
              key={i}
              className={`rounded-xl border bg-zinc-800/30 overflow-hidden transition-colors ${
                state === "completed" ? "border-green-500/30" : state === "in_progress" ? "border-yellow-500/30" : "border-zinc-800"
              }`}
            >
              {/* Header */}
              <button
                onClick={() => setExpandedIndex(expandedIndex === i ? null : i)}
                className="w-full flex items-center gap-4 p-4 text-left transition-colors hover:bg-zinc-800/50"
              >
                <div className="w-20 flex-shrink-0">
                  <p className="text-xs text-zinc-500">{w.day}</p>
                  <span className={`text-xs font-medium ${w.color} ${w.bg} px-2 py-0.5 rounded-full`}>{w.type}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-sm">{w.title}</p>
                  <p className="text-xs text-zinc-500">{w.duration} · {total} exercises</p>
                </div>
                <div className="flex items-center gap-2">
                  {state === "completed" && (
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400 border border-green-500/30 flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                      Done
                    </span>
                  )}
                  {state === "in_progress" && (
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full animate-pulse" />
                      {done}/{total}
                    </span>
                  )}
                  <svg className={`w-4 h-4 text-zinc-500 flex-shrink-0 transition-transform duration-200 ${expandedIndex === i ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>

              {/* Expanded content */}
              {expandedIndex === i && (
                <div className="border-t border-zinc-800">
                  {/* Exercise list */}
                  <div className="p-4 space-y-1">
                    {w.exercises.map((ex, j) => {
                      const checked = !!completedExercises[`${i}-${j}`];
                      return (
                        <div key={j} className={`flex items-center gap-3 rounded-lg p-3 transition-colors ${checked ? "bg-green-500/5" : "hover:bg-zinc-800/50"}`}>
                          {/* Checkbox */}
                          {state === "in_progress" && (
                            <button
                              onClick={() => toggleExercise(i, j)}
                              className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                                checked ? "bg-green-500 border-green-500" : "border-zinc-600 hover:border-zinc-400"
                              }`}
                            >
                              {checked && (
                                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                              )}
                            </button>
                          )}
                          {/* Exercise info */}
                          <button
                            onClick={() => setSelectedExercise(ex)}
                            className="flex-1 min-w-0 text-left group"
                          >
                            <div className="flex items-baseline justify-between gap-2">
                              <p className={`text-sm font-medium group-hover:text-blue-400 transition-colors flex items-center gap-1.5 ${checked ? "line-through text-zinc-500" : "text-white"}`}>
                                {ex.name}
                                <svg className="w-3.5 h-3.5 text-zinc-600 group-hover:text-blue-400 transition-colors flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                              </p>
                              <span className={`text-xs font-medium whitespace-nowrap ${checked ? "text-zinc-600" : w.color}`}>{ex.duration}</span>
                            </div>
                            <p className={`text-xs mt-0.5 ${checked ? "text-zinc-600" : "text-zinc-500"}`}>{ex.notes}</p>
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  {/* Action button */}
                  <div className="border-t border-zinc-800 p-4">
                    {state === "idle" && (
                      <button
                        onClick={() => setPreModal(i)}
                        className="w-full py-3 rounded-xl bg-blue-500 font-semibold text-white hover:bg-blue-600 transition-colors"
                      >
                        Start Workout
                      </button>
                    )}
                    {state === "in_progress" && (
                      <button
                        onClick={() => setPostModal(i)}
                        className="w-full py-3 rounded-xl bg-green-500 font-semibold text-white hover:bg-green-600 transition-colors"
                      >
                        Complete Workout
                      </button>
                    )}
                    {state === "completed" && (
                      <div className="bg-zinc-800/30 rounded-xl p-3 text-center">
                        <p className="text-sm text-green-400 font-medium">Workout completed</p>
                        <p className="text-xs text-zinc-500 mt-1">Great work! Your feedback has been recorded.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Modals */}
      {selectedExercise && (
        <ExerciseDetailModal exercise={selectedExercise} onClose={() => setSelectedExercise(null)} />
      )}
      {preModal !== null && (
        <PreWorkoutModal
          workout={SAMPLE_WORKOUTS[preModal]}
          onClose={() => setPreModal(null)}
          onSubmit={() => {
            setWorkoutStates((prev) => ({ ...prev, [preModal]: "in_progress" }));
            setPreModal(null);
          }}
        />
      )}
      {postModal !== null && (
        <PostWorkoutModal
          workout={SAMPLE_WORKOUTS[postModal]}
          onClose={() => setPostModal(null)}
          onSubmit={() => {
            setWorkoutStates((prev) => ({ ...prev, [postModal]: "completed" }));
            // Mark all exercises as done
            const updates = {};
            SAMPLE_WORKOUTS[postModal].exercises.forEach((_, j) => { updates[`${postModal}-${j}`] = true; });
            setCompletedExercises((prev) => ({ ...prev, ...updates }));
            setPostModal(null);
          }}
        />
      )}
    </>
  );
}
