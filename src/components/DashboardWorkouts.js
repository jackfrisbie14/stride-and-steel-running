"use client";

import { useState, useEffect } from "react";
import WorkoutCard from "./WorkoutCard";

export default function DashboardWorkouts({ workouts, isSubscribed }) {
  const [workoutLogs, setWorkoutLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch workout logs on mount
  useEffect(() => {
    async function fetchWorkoutLogs() {
      try {
        const res = await fetch("/api/workouts");
        if (res.ok) {
          const data = await res.json();
          setWorkoutLogs(data.workoutLogs || []);
        }
      } catch (error) {
        console.error("Failed to fetch workout logs:", error);
      } finally {
        setLoading(false);
      }
    }

    if (isSubscribed) {
      fetchWorkoutLogs();
    } else {
      setLoading(false);
    }
  }, [isSubscribed]);

  const handleLogWorkout = async (data) => {
    const res = await fetch("/api/workouts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      throw new Error("Failed to log workout");
    }

    // Refresh workout logs
    const refreshRes = await fetch("/api/workouts");
    if (refreshRes.ok) {
      const refreshData = await refreshRes.json();
      setWorkoutLogs(refreshData.workoutLogs || []);
    }
  };

  // Get workout log for a specific day
  const getWorkoutLog = (day) => {
    return workoutLogs.find((log) => log.dayOfWeek === day) || null;
  };

  // Calculate progress
  const completedCount = workoutLogs.filter(
    (log) => log.completed || log.skipped
  ).length;

  return (
    <div data-tour="workouts" className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">This Week's Workouts</h3>
          {isSubscribed && (
            <button
              onClick={() => document.getElementById("customization-panel")?.scrollIntoView({ behavior: "smooth" })}
              className="text-xs text-zinc-500 hover:text-blue-400 transition-colors mt-0.5"
            >
              Want to adjust? Customize your plan below
            </button>
          )}
        </div>
        {isSubscribed && !loading && (
          <span className="text-sm text-zinc-400">
            {completedCount}/{workouts.length} completed
          </span>
        )}
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="rounded-xl border border-zinc-800 bg-zinc-900 p-4 animate-pulse"
            >
              <div className="h-6 bg-zinc-800 rounded w-1/3 mb-2" />
              <div className="h-4 bg-zinc-800 rounded w-1/4" />
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {workouts.map((workout, index) => (
            <div key={index} data-tour={index === 0 ? "workout-card" : undefined}>
              <WorkoutCard
                workout={workout}
                locked={!isSubscribed && index > 1}
                workoutLog={isSubscribed ? getWorkoutLog(workout.day) : null}
                onLogWorkout={isSubscribed ? handleLogWorkout : null}
              />
            </div>
          ))}
        </div>
      )}

      {/* Week Progress Bar */}
      {isSubscribed && !loading && completedCount > 0 && (
        <div className="mt-6 p-4 rounded-xl border border-zinc-800 bg-zinc-900">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Week Progress</span>
            <span className="text-sm text-zinc-400">
              {Math.round((completedCount / workouts.length) * 100)}%
            </span>
          </div>
          <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-500"
              style={{ width: `${(completedCount / workouts.length) * 100}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
