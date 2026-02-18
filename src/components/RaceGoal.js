"use client";

import { useState, useEffect } from "react";

const RACE_DISTANCES = [
  { value: "5K", label: "5K" },
  { value: "10K", label: "10K" },
  { value: "Half Marathon", label: "Half Marathon" },
  { value: "Marathon", label: "Marathon" },
  { value: "Ultra", label: "Ultra Marathon" },
  { value: "Triathlon - Olympic", label: "Triathlon - Olympic" },
  { value: "Triathlon - 70.3", label: "Triathlon - 70.3" },
  { value: "Triathlon - Ironman", label: "Triathlon - Ironman" },
  { value: "Other", label: "Other" },
];

function RaceCountdown({ raceDate, raceName }) {
  const [timeLeft, setTimeLeft] = useState(null);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const race = new Date(raceDate);
      const diff = race - now;

      if (diff <= 0) {
        return { days: 0, weeks: 0, isPast: true };
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const weeks = Math.floor(days / 7);
      const remainingDays = days % 7;

      return { days, weeks, remainingDays, isPast: false };
    };

    setTimeLeft(calculateTimeLeft());
    const interval = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000 * 60 * 60); // Update every hour

    return () => clearInterval(interval);
  }, [raceDate]);

  if (!timeLeft) return null;

  if (timeLeft.isPast) {
    return (
      <div className="text-center">
        <p className="text-zinc-400">Race day has passed!</p>
        <p className="text-sm text-zinc-500 mt-1">How did {raceName} go?</p>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center gap-4">
      <div className="text-center">
        <p className="text-3xl font-bold text-blue-500">{timeLeft.weeks}</p>
        <p className="text-xs text-zinc-500">weeks</p>
      </div>
      <div className="text-center">
        <p className="text-3xl font-bold text-blue-400">{timeLeft.remainingDays}</p>
        <p className="text-xs text-zinc-500">days</p>
      </div>
      <div className="text-center border-l border-zinc-700 pl-4">
        <p className="text-2xl font-bold text-zinc-300">{timeLeft.days}</p>
        <p className="text-xs text-zinc-500">total days</p>
      </div>
    </div>
  );
}

export default function RaceGoal({ initialRaceGoal, racePlanActive, racePlanInfo, goalTime }) {
  const [raceGoal, setRaceGoal] = useState(initialRaceGoal);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generatingPlan, setGeneratingPlan] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [formData, setFormData] = useState({
    raceName: "",
    raceDate: "",
    raceDistance: "",
    raceGoalTime: "",
  });

  // Load minimized state from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsMinimized(localStorage.getItem("ss_race_prompt_minimized") === "true");
    }
  }, []);

  const handleMinimize = () => {
    setIsMinimized(true);
    localStorage.setItem("ss_race_prompt_minimized", "true");
  };

  const handleExpand = () => {
    setIsMinimized(false);
    localStorage.removeItem("ss_race_prompt_minimized");
  };

  useEffect(() => {
    if (raceGoal) {
      setFormData({
        raceName: raceGoal.raceName || "",
        raceDate: raceGoal.raceDate ? new Date(raceGoal.raceDate).toISOString().split("T")[0] : "",
        raceDistance: raceGoal.raceDistance || "",
        raceGoalTime: goalTime || "",
      });
    }
  }, [raceGoal, goalTime]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setGeneratingPlan(true);

    try {
      const res = await fetch("/api/user/race-goal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Failed to save");

      const data = await res.json();
      setRaceGoal(data);
      setIsEditing(false);

      // Reload page to show race workouts
      window.location.reload();
    } catch (e) {
      console.error("Error saving race goal:", e);
      setGeneratingPlan(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Remove your race goal? This will switch back to your quiz-based training plan.")) return;
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/user/race-goal", { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");

      setRaceGoal(null);
      setFormData({ raceName: "", raceDate: "", raceDistance: "", raceGoalTime: "" });
      setIsEditing(false);

      // Reload to show quiz workouts
      window.location.reload();
    } catch (e) {
      console.error("Error deleting race goal:", e);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Generating plan loading screen
  if (generatingPlan) {
    return (
      <div className="mb-8 rounded-xl border border-blue-500/30 bg-gradient-to-br from-blue-500/10 to-zinc-900 p-8 text-center">
        <div className="inline-block mb-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
        <h3 className="text-lg font-bold mb-2">Generating Your Race Plan...</h3>
        <p className="text-sm text-zinc-400">
          Our AI coach is building a personalized training plan tailored to your race goal and fitness level.
        </p>
        <p className="text-xs text-zinc-500 mt-2">This could take up to a few minutes</p>
      </div>
    );
  }

  // No race goal set - show prompt (can be minimized)
  if (!raceGoal?.raceName && !isEditing) {
    if (isMinimized) {
      return (
        <div className="mb-8">
          <button
            onClick={handleExpand}
            className="w-full rounded-xl border border-dashed border-zinc-800 bg-zinc-900/30 p-3 flex items-center justify-center gap-2 text-zinc-500 hover:text-zinc-300 hover:border-zinc-700 transition-colors"
          >
            <span>🏁</span>
            <span className="text-sm">Training for a race? Set a goal</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      );
    }

    return (
      <div className="mb-8 rounded-xl border border-dashed border-zinc-700 bg-zinc-900/50 p-6 relative">
        <button
          onClick={handleMinimize}
          className="absolute top-3 right-3 p-1.5 rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-colors"
          title="Minimize"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
        </button>
        <div className="text-center">
          <span className="text-4xl mb-3 block">🏁</span>
          <h3 className="text-lg font-semibold mb-2">Training for a Race?</h3>
          <p className="text-sm text-zinc-400 mb-4">
            Set a race goal and our AI coach will build a progressive training plan to peak on race day.
          </p>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => setIsEditing(true)}
              className="px-6 py-2 rounded-lg bg-blue-500 text-white font-medium hover:bg-blue-600 transition-colors"
            >
              Add Race Goal
            </button>
            <button
              onClick={handleMinimize}
              className="px-4 py-2 rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-colors text-sm"
            >
              Not right now
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Editing mode
  if (isEditing) {
    return (
      <div className="mb-8 rounded-xl border border-blue-500/30 bg-zinc-900 p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <span>🏁</span> Set Your Race Goal
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Race Name
            </label>
            <input
              type="text"
              value={formData.raceName}
              onChange={(e) => setFormData({ ...formData, raceName: e.target.value })}
              placeholder="e.g., Boston Marathon 2026"
              className="w-full px-4 py-3 rounded-lg bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Race Date
              </label>
              <input
                type="date"
                value={formData.raceDate}
                onChange={(e) => setFormData({ ...formData, raceDate: e.target.value })}
                className="w-full px-4 py-3 rounded-lg bg-zinc-800 border border-zinc-700 text-white focus:outline-none focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Distance
              </label>
              <select
                value={formData.raceDistance}
                onChange={(e) => setFormData({ ...formData, raceDistance: e.target.value })}
                className="w-full px-4 py-3 rounded-lg bg-zinc-800 border border-zinc-700 text-white focus:outline-none focus:border-blue-500"
                required
              >
                <option value="">Select distance</option>
                {RACE_DISTANCES.map((d) => (
                  <option key={d.value} value={d.value}>
                    {d.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Goal Time <span className="text-zinc-500 font-normal">(optional)</span>
            </label>
            <input
              type="text"
              value={formData.raceGoalTime}
              onChange={(e) => setFormData({ ...formData, raceGoalTime: e.target.value })}
              placeholder="e.g. 3:45:00"
              className="w-full px-4 py-3 rounded-lg bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500"
            />
            <p className="text-xs text-zinc-500 mt-1">Set a target finish time for pace-specific workouts</p>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="flex-1 py-3 rounded-xl border border-zinc-700 text-zinc-400 hover:bg-zinc-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-3 rounded-xl bg-blue-500 font-semibold text-white hover:bg-blue-600 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? "Generating Plan..." : "Generate Race Plan"}
            </button>
          </div>
        </form>
      </div>
    );
  }

  // Display race goal
  return (
    <div className="mb-8 rounded-xl border border-blue-500/30 bg-gradient-to-br from-blue-500/10 to-zinc-900 p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🏁</span>
          <div>
            <p className="text-sm text-blue-400">Your Race Goal</p>
            <h3 className="text-xl font-bold">{raceGoal.raceName}</h3>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setIsEditing(true)}
            className="p-2 rounded-lg hover:bg-zinc-800 transition-colors text-zinc-400 hover:text-white"
            title="Edit"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </button>
          <button
            onClick={handleDelete}
            className="p-2 rounded-lg hover:bg-zinc-800 transition-colors text-zinc-400 hover:text-red-400"
            title="Remove"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      <div className="flex items-center gap-4 mb-4 flex-wrap">
        <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-500/20 text-blue-400 border border-blue-500/30">
          {raceGoal.raceDistance}
        </span>
        {goalTime && (
          <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-500/20 text-blue-400 border border-blue-500/30">
            Goal: {goalTime}
          </span>
        )}
        <span className="text-sm text-zinc-400">
          {new Date(raceGoal.raceDate).toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
            year: "numeric",
          })}
        </span>
      </div>

      {/* Race plan info when active */}
      {racePlanActive && racePlanInfo && (
        <div className="mb-4 p-3 rounded-lg bg-zinc-800/50 border border-zinc-700">
          <div className="flex items-center justify-between text-sm">
            <span className="text-zinc-400">
              AI Training Plan: Week {racePlanInfo.currentWeek} of {racePlanInfo.totalWeeks}
            </span>
            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400 capitalize">
              {racePlanInfo.currentPhase} Phase
            </span>
          </div>
        </div>
      )}

      <div className="pt-4 border-t border-zinc-800">
        <p className="text-xs text-zinc-500 text-center mb-3">Time until race day</p>
        <RaceCountdown raceDate={raceGoal.raceDate} raceName={raceGoal.raceName} />
      </div>

      <div className="mt-4 pt-4 border-t border-zinc-800">
        <p className="text-xs text-zinc-500 text-center">
          {racePlanActive
            ? "Your workouts are set to your AI-generated race plan"
            : "Your training will automatically adjust to help you peak on race day"}
        </p>
      </div>
    </div>
  );
}
