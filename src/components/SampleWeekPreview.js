"use client";

import { useState } from "react";

const SAMPLE_WORKOUTS = [
  {
    day: "Monday",
    type: "Speed",
    title: "Interval Run",
    icon: "🏃",
    color: "text-red-400",
    bg: "bg-red-500/10",
    border: "border-red-500/30",
    duration: "45 min",
    exercises: [
      { name: "Warm-up Jog", duration: "10 min", notes: "Easy pace, gradually increase" },
      { name: "800m Repeats", duration: "6 x 800m", notes: "5K pace, 400m recovery jog between" },
      { name: "Cool-down Jog", duration: "10 min", notes: "Easy pace, bring heart rate down" },
      { name: "Standing Quad Stretch", duration: "30 sec each", notes: "Hold steady, don't bounce" },
      { name: "Calf Stretch", duration: "30 sec each", notes: "Wall stretch, straight back leg" },
    ],
  },
  {
    day: "Tuesday",
    type: "Easy",
    title: "Easy Run",
    icon: "🏃",
    color: "text-green-400",
    bg: "bg-green-500/10",
    border: "border-green-500/30",
    duration: "40 min",
    exercises: [
      { name: "Easy Pace Run", duration: "40 min", notes: "Conversational pace — you should be able to hold a full sentence" },
      { name: "Hip Circles", duration: "1 min", notes: "10 each direction, each leg" },
      { name: "Walking Lunges", duration: "2 min", notes: "Cool-down, 10 each leg" },
    ],
  },
  {
    day: "Wednesday",
    type: "Speed",
    title: "Tempo Run",
    icon: "🏃",
    color: "text-red-400",
    bg: "bg-red-500/10",
    border: "border-red-500/30",
    duration: "50 min",
    exercises: [
      { name: "Warm-up Jog", duration: "15 min", notes: "Easy pace, dynamic stretches at the end" },
      { name: "Tempo Effort", duration: "20 min", notes: "Comfortably hard — threshold pace" },
      { name: "Cool-down Jog", duration: "10 min", notes: "Easy pace" },
      { name: "Foam Roll", duration: "5 min", notes: "Quads, calves, IT band" },
    ],
  },
  {
    day: "Thursday",
    type: "Recovery",
    title: "Yoga for Runners",
    icon: "🧘",
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/30",
    duration: "30 min",
    exercises: [
      { name: "Pigeon Pose", duration: "90 sec each", notes: "Deep hip opener — breathe into tightness" },
      { name: "Downward Dog", duration: "60 sec", notes: "Pedal feet to stretch calves" },
      { name: "Low Lunge", duration: "60 sec each", notes: "Hip flexor stretch, arms overhead" },
      { name: "Seated Forward Fold", duration: "90 sec", notes: "Hamstring stretch, relax the neck" },
      { name: "Supine Spinal Twist", duration: "60 sec each", notes: "Gentle twist, knees to one side" },
      { name: "Foam Roll", duration: "5 min", notes: "Quads, hamstrings, calves, IT band" },
    ],
  },
  {
    day: "Saturday",
    type: "Easy",
    title: "Long Run",
    icon: "🏃",
    color: "text-green-400",
    bg: "bg-green-500/10",
    border: "border-green-500/30",
    duration: "90 min",
    exercises: [
      { name: "Easy Pace Run", duration: "80 min", notes: "Relaxed effort, build aerobic base" },
      { name: "Marathon Pace Finish", duration: "10 min", notes: "Pick up to goal marathon pace for the final stretch" },
      { name: "Walking Cool-down", duration: "5 min", notes: "Walk it out, hydrate" },
      { name: "Static Stretching", duration: "5 min", notes: "Quads, hamstrings, hip flexors, calves" },
    ],
  },
];

export default function SampleWeekPreview() {
  const [expandedIndex, setExpandedIndex] = useState(null);

  return (
    <div className="space-y-3">
      {SAMPLE_WORKOUTS.map((w, i) => (
        <div key={i} className="rounded-xl border border-zinc-800 bg-zinc-800/30 overflow-hidden">
          <button
            onClick={() => setExpandedIndex(expandedIndex === i ? null : i)}
            className="w-full flex items-center gap-4 p-4 text-left transition-colors hover:bg-zinc-800/50"
          >
            <div className="w-20 flex-shrink-0">
              <p className="text-xs text-zinc-500">{w.day}</p>
              <span className={`text-xs font-medium ${w.color} ${w.bg} px-2 py-0.5 rounded-full`}>
                {w.type}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-sm">{w.title}</p>
              <p className="text-xs text-zinc-500">{w.duration} · {w.exercises.length} exercises</p>
            </div>
            <svg
              className={`w-4 h-4 text-zinc-500 flex-shrink-0 transition-transform duration-200 ${expandedIndex === i ? "rotate-180" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {expandedIndex === i && (
            <div className="px-4 pb-4 border-t border-zinc-800">
              <div className="mt-3 space-y-2">
                {w.exercises.map((ex, j) => (
                  <div
                    key={j}
                    className={`flex items-start gap-3 rounded-lg border ${w.border} bg-zinc-900/50 p-3`}
                  >
                    <span className="text-sm mt-0.5">{w.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline justify-between gap-2">
                        <p className="text-sm font-medium text-white">{ex.name}</p>
                        <span className={`text-xs font-medium ${w.color} whitespace-nowrap`}>{ex.duration}</span>
                      </div>
                      <p className="text-xs text-zinc-500 mt-0.5">{ex.notes}</p>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-zinc-600 mt-3 text-center">
                Tap any exercise in the app for form tips and video demos
              </p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
