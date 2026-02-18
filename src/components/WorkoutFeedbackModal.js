"use client";

import { useState, useEffect } from "react";

const ratingLabels = {
  preEnergyLevel: ["Exhausted", "Tired", "Okay", "Good", "Energized"],
  preSoreness: ["Very sore", "Sore", "Slight", "Fresh", "Great"],
  preMotivation: ["None", "Low", "Okay", "High", "Pumped"],
  difficulty: ["Too Easy", "Easy", "Just Right", "Hard", "Too Hard"],
  performance: ["Poor", "Below Avg", "Average", "Good", "Great"],
  enjoyment: ["Hated it", "Meh", "Okay", "Liked it", "Loved it"],
};

function RatingButton({ value, selected, onClick, label }) {
  return (
    <button
      type="button"
      onClick={() => onClick(value)}
      className={`flex-1 py-2 px-1 text-xs sm:text-sm rounded-lg transition-all ${
        selected
          ? "bg-blue-500 text-white"
          : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
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
          <RatingButton
            key={num}
            value={num}
            selected={value === num}
            onClick={onChange}
            label={labels[num - 1]}
          />
        ))}
      </div>
    </div>
  );
}

export default function WorkoutFeedbackModal({
  workout,
  existingLog,
  onClose,
  onSubmit,
}) {
  // If pre-workout ratings exist, show post-workout step (user already did pre-workout)
  const [step, setStep] = useState(existingLog?.preEnergyLevel ? "post" : "pre");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Pre-workout ratings
  const [preEnergyLevel, setPreEnergyLevel] = useState(existingLog?.preEnergyLevel || null);
  const [preSoreness, setPreSoreness] = useState(existingLog?.preSoreness || null);
  const [preMotivation, setPreMotivation] = useState(existingLog?.preMotivation || null);

  // Post-workout ratings
  const [difficulty, setDifficulty] = useState(existingLog?.difficulty || null);
  const [performance, setPerformance] = useState(existingLog?.performance || null);
  const [enjoyment, setEnjoyment] = useState(existingLog?.enjoyment || null);
  const [notes, setNotes] = useState(existingLog?.notes || "");

  // Close on escape
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  // Prevent body scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  const handlePreSubmit = async () => {
    setIsSubmitting(true);
    try {
      await onSubmit({
        dayOfWeek: workout.day,
        workoutType: workout.type,
        workoutTitle: workout.title,
        preEnergyLevel,
        preSoreness,
        preMotivation,
      });
      // Close modal after pre-workout - user will do workout and come back for post-workout
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePostSubmit = async (completed) => {
    setIsSubmitting(true);
    try {
      await onSubmit({
        dayOfWeek: workout.day,
        workoutType: workout.type,
        workoutTitle: workout.title,
        difficulty,
        performance,
        enjoyment,
        notes,
        completed,
        skipped: !completed,
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = async () => {
    setIsSubmitting(true);
    try {
      await onSubmit({
        dayOfWeek: workout.day,
        workoutType: workout.type,
        workoutTitle: workout.title,
        skipped: true,
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl bg-zinc-900 border border-zinc-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-zinc-900 border-b border-zinc-800 p-4 flex items-center justify-between">
          <div>
            <p className="text-sm text-zinc-500">{workout.day}</p>
            <h2 className="text-lg font-bold">{workout.title}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-zinc-800 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-6">
          {step === "pre" ? (
            <>
              <div className="text-center mb-6">
                <h3 className="text-xl font-semibold">Pre-Workout Check-in</h3>
                <p className="text-sm text-zinc-400 mt-1">
                  How are you feeling before this workout?
                </p>
              </div>

              <RatingGroup
                label="Energy Level"
                name="preEnergyLevel"
                value={preEnergyLevel}
                onChange={setPreEnergyLevel}
                labels={ratingLabels.preEnergyLevel}
              />

              <RatingGroup
                label="Muscle Soreness"
                name="preSoreness"
                value={preSoreness}
                onChange={setPreSoreness}
                labels={ratingLabels.preSoreness}
              />

              <RatingGroup
                label="Motivation"
                name="preMotivation"
                value={preMotivation}
                onChange={setPreMotivation}
                labels={ratingLabels.preMotivation}
              />

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleSkip}
                  disabled={isSubmitting}
                  className="flex-1 py-3 rounded-xl border border-zinc-700 text-zinc-400 hover:bg-zinc-800 transition-colors disabled:opacity-50"
                >
                  Skip Workout
                </button>
                <button
                  onClick={handlePreSubmit}
                  disabled={isSubmitting || !preEnergyLevel || !preSoreness || !preMotivation}
                  className="flex-1 py-3 rounded-xl bg-blue-500 font-semibold text-white hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Saving..." : "Start Workout"}
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="text-center mb-6">
                <h3 className="text-xl font-semibold">Post-Workout Feedback</h3>
                <p className="text-sm text-zinc-400 mt-1">
                  How did the workout go?
                </p>
              </div>

              <RatingGroup
                label="Difficulty"
                name="difficulty"
                value={difficulty}
                onChange={setDifficulty}
                labels={ratingLabels.difficulty}
              />

              <RatingGroup
                label="Performance"
                name="performance"
                value={performance}
                onChange={setPerformance}
                labels={ratingLabels.performance}
              />

              <RatingGroup
                label="Enjoyment"
                name="enjoyment"
                value={enjoyment}
                onChange={setEnjoyment}
                labels={ratingLabels.enjoyment}
              />

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Notes (optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any thoughts about today's workout..."
                  className="w-full h-20 rounded-lg bg-zinc-800 px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => handlePostSubmit(false)}
                  disabled={isSubmitting}
                  className="flex-1 py-3 rounded-xl border border-zinc-700 text-zinc-400 hover:bg-zinc-800 transition-colors disabled:opacity-50"
                >
                  Didn't Finish
                </button>
                <button
                  onClick={() => handlePostSubmit(true)}
                  disabled={isSubmitting || !difficulty || !performance || !enjoyment}
                  className="flex-1 py-3 rounded-xl bg-green-500 font-semibold text-white hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Saving..." : "Complete!"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
