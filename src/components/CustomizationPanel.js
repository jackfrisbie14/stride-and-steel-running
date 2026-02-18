"use client";

import { useState } from "react";
import TrainingDaySelector from "./TrainingDaySelector";
import IntensitySelector from "./IntensitySelector";

export default function CustomizationPanel({
  initialDays,
  initialExperience,
  racePlanActive,
}) {
  const [visible, setVisible] = useState(true);
  const [days, setDays] = useState(initialDays);
  const [experience, setExperience] = useState(initialExperience);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState(null);

  const hasChanges =
    days !== initialDays ||
    experience !== initialExperience;

  const handleSave = async () => {
    if (!hasChanges) return;

    setSaving(true);
    setError(null);
    setStatus("Saving settings & regenerating workouts...");

    try {
      const res = await fetch("/api/user/customize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          trainingDays: days,
          experience,
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        let msg;
        try { msg = JSON.parse(text).error; } catch { msg = text; }
        throw new Error(msg || `Server error ${res.status}`);
      }

      const data = await res.json();

      if (data.racePlanRegenerating) {
        setStatus("Regenerating this week's race workouts...");

        const regenRes = await fetch("/api/user/regen-current-week", { method: "POST" });
        if (!regenRes.ok) {
          const text = await regenRes.text();
          let msg;
          try { msg = JSON.parse(text).error; } catch { msg = text; }
          throw new Error(msg || "Failed to regenerate race workouts");
        }
      }

      setStatus(null);
      window.location.href = window.location.href;
    } catch (e) {
      setError(e.message);
      setStatus(null);
      setSaving(false);
    }
  };

  const busy = saving || !!status;

  return (
    <div id="customization-panel" className="mt-12">
      <button
        onClick={() => setVisible(!visible)}
        className="w-full flex items-center justify-center gap-2 rounded-xl border border-zinc-700 bg-zinc-900 px-5 py-3 text-sm font-medium text-zinc-300 hover:bg-zinc-800 hover:text-white hover:border-zinc-600 transition-colors mb-6"
      >
        <svg
          className={`w-4 h-4 transition-transform ${visible ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
        {visible ? "Hide Customization Settings" : "Show Customization Settings"}
      </button>

      {visible && (
        <div className="border-t border-zinc-800/50 pt-8">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-zinc-200">
              Not happy with the workouts generated?
            </h3>
            <p className="text-sm text-zinc-500 mt-1">
              Adjust your settings below, then save to regenerate your plan.
            </p>
          </div>

          {error && (
            <div className="mb-4 rounded-lg bg-red-500/10 border border-red-500/30 p-3">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {status && (
            <div className="mb-4 rounded-lg bg-blue-500/10 border border-blue-500/30 p-3 flex items-center gap-2">
              <span className="inline-block w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin flex-shrink-0" />
              <p className="text-sm text-blue-400">{status}</p>
            </div>
          )}

          <TrainingDaySelector days={days} onChange={setDays} disabled={busy} />

          <IntensitySelector level={experience} onChange={setExperience} disabled={busy} />

          {/* Single save button */}
          <div className="mt-8">
            <button
              onClick={handleSave}
              disabled={busy || !hasChanges}
              className="w-full rounded-xl bg-blue-500 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-600 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {busy ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Regenerating...
                </span>
              ) : (
                "Save & Regenerate Workouts"
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
