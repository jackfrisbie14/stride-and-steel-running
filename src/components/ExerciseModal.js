"use client";

import { useEffect, useState } from "react";

// Keywords that indicate a cardio/running/recovery exercise — ExerciseDB
// is a strength database and returns misleading GIFs for these.
const CARDIO_KEYWORDS = [
  // Running
  "run", "jog", "sprint", "stride", "fartlek", "tempo", "interval",
  "repeat", "marathon", "half marathon", "5k", "10k", "pace",
  "threshold", "mile repeat", "400m", "800m",
  // Warm-up / cool-down (all variants)
  "warmup", "warm-up", "warm up", "cooldown", "cool-down", "cool down",
  // Other cardio
  "swim", "bike", "cycle", "rowing", "spin", "elliptical", "brick",
  "walk", "hike",
  // Recovery / mobility
  "stretch", "yoga", "foam roll", "mobility", "breathing", "meditation",
  "rest day", "recovery",
];

function isCardioExercise(name, localData) {
  if (localData?.category === "Cardio" || localData?.category === "Recovery") {
    return true;
  }
  const lower = name.toLowerCase();
  return CARDIO_KEYWORDS.some((kw) => lower.includes(kw));
}

export default function ExerciseModal({ exercise, exerciseName, onClose }) {
  const skipGifLookup = isCardioExercise(exerciseName, exercise);
  const [gifData, setGifData] = useState(null);
  const [gifLoading, setGifLoading] = useState(!skipGifLookup);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  // Fetch GIF from ExerciseDB (skip for cardio/running/recovery exercises)
  useEffect(() => {
    if (skipGifLookup) return;

    const fetchGif = async () => {
      setGifLoading(true);
      try {
        const res = await fetch(`/api/exercises/search?q=${encodeURIComponent(exerciseName)}`);
        const data = await res.json();
        if (data.exercises?.length > 0) {
          setGifData(data.exercises[0]);
        }
      } catch (err) {
        console.error("Failed to fetch exercise GIF:", err);
      } finally {
        setGifLoading(false);
      }
    };

    if (exerciseName) {
      fetchGif();
    }
  }, [exerciseName, skipGifLookup]);

  if (!exercise) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
        onClick={onClose}
      >
        <div
          className="w-full max-w-lg rounded-2xl bg-zinc-900 border border-zinc-800 p-6"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">{exerciseName}</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-zinc-800 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* GIF for exercises without tutorial data */}
          {gifLoading ? (
            <div className="w-full h-48 bg-zinc-800 rounded-xl flex items-center justify-center">
              <div className="flex items-center gap-2 text-zinc-500">
                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Loading demo...
              </div>
            </div>
          ) : gifData?.gifUrl ? (
            <div className="w-full rounded-xl overflow-hidden bg-zinc-800">
              <img
                src={gifData.gifUrl}
                alt={gifData.name}
                className="w-full h-auto"
              />
              <div className="p-3 space-y-2">
                {gifData.targetMuscles?.length > 0 && (
                  <p className="text-xs text-zinc-500">
                    Target: <span className="text-zinc-400">{gifData.targetMuscles.join(", ")}</span>
                  </p>
                )}
                {gifData.equipments?.length > 0 && (
                  <p className="text-xs text-zinc-500">
                    Equipment: <span className="text-zinc-400">{gifData.equipments.join(", ")}</span>
                  </p>
                )}
                {gifData.instructions?.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-zinc-700">
                    <p className="text-xs font-semibold text-zinc-400 mb-2">Instructions</p>
                    <ol className="space-y-1">
                      {gifData.instructions.map((step, i) => (
                        <li key={i} className="text-xs text-zinc-400 flex gap-2">
                          <span className="text-zinc-600 flex-shrink-0">{i + 1}.</span>
                          {step}
                        </li>
                      ))}
                    </ol>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div>
              <p className="text-zinc-400">Tutorial coming soon for this exercise.</p>
              <a
                href={`https://www.youtube.com/results?search_query=${encodeURIComponent(exerciseName + " exercise tutorial")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814z" />
                  <path fill="#000" d="M9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
                Search on YouTube
              </a>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-zinc-900 border border-zinc-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-zinc-900 border-b border-zinc-800 p-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">{exerciseName}</h2>
            <p className="text-sm text-zinc-500">{exercise.category}</p>
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
          {/* Exercise GIF or Placeholder */}
          <div className="relative w-full bg-zinc-800 rounded-xl overflow-hidden">
            {gifLoading ? (
              <div className="h-48 flex items-center justify-center">
                <div className="flex items-center gap-2 text-zinc-500">
                  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Loading demo...
                </div>
              </div>
            ) : gifData?.gifUrl ? (
              <img
                src={gifData.gifUrl}
                alt={exerciseName}
                className="w-full h-auto"
              />
            ) : (
              <div className="h-48 flex items-center justify-center">
                <div className="text-center">
                  <svg className="w-16 h-16 mx-auto text-zinc-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <a
                    href={`https://www.youtube.com/results?search_query=${encodeURIComponent(exerciseName + " exercise tutorial")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    Search on YouTube
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Quick Info */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-zinc-800/50 rounded-lg p-3 text-center">
              <p className="text-xs text-zinc-500 mb-1">Difficulty</p>
              <p className="text-sm font-medium text-blue-400">{exercise.difficulty}</p>
            </div>
            <div className="bg-zinc-800/50 rounded-lg p-3 text-center">
              <p className="text-xs text-zinc-500 mb-1">Equipment</p>
              <p className="text-sm font-medium">{exercise.equipment}</p>
            </div>
            <div className="col-span-2 bg-zinc-800/50 rounded-lg p-3 text-center">
              <p className="text-xs text-zinc-500 mb-1">Target Muscles</p>
              <p className="text-sm font-medium">{exercise.muscles.join(", ")}</p>
            </div>
          </div>

          {/* Description */}
          <div>
            <p className="text-zinc-300">{exercise.description}</p>
          </div>

          {/* How To */}
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-500/20 text-blue-500 text-sm">
                1
              </span>
              How To Perform
            </h3>
            <ol className="space-y-2">
              {exercise.steps.map((step, index) => (
                <li key={index} className="flex gap-3 text-zinc-300">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-zinc-800 text-zinc-500 text-xs flex items-center justify-center mt-0.5">
                    {index + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </div>

          {/* Tips */}
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-green-500/20 text-green-500 text-sm">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </span>
              Form Tips
            </h3>
            <ul className="space-y-2">
              {exercise.tips.map((tip, index) => (
                <li key={index} className="flex gap-3 text-zinc-300">
                  <span className="flex-shrink-0 text-green-500 mt-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>

          {/* Common Mistakes */}
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-red-500/20 text-red-500 text-sm">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </span>
              Common Mistakes to Avoid
            </h3>
            <ul className="space-y-2">
              {exercise.commonMistakes.map((mistake, index) => (
                <li key={index} className="flex gap-3 text-zinc-300">
                  <span className="flex-shrink-0 text-red-500 mt-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </span>
                  {mistake}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
