"use client";

const LEVELS = [
  {
    value: "beginner",
    label: "Beginner",
    description: "Shorter distances, more walk breaks",
  },
  {
    value: "intermediate",
    label: "Intermediate",
    description: "Moderate distances",
  },
  {
    value: "advanced",
    label: "Advanced",
    description: "Longer distances, faster paces",
  },
];

export default function IntensitySelector({ level, onChange, disabled }) {
  return (
    <div className="border-t border-zinc-800/50 mt-8 pt-8">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-zinc-200">
          First week too easy or too hard?
        </h3>
        <p className="text-sm text-zinc-500 mt-1">
          Adjust your experience level to change workout intensity.
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        {LEVELS.map((l) => (
          <button
            key={l.value}
            onClick={() => l.value !== level && onChange(l.value)}
            disabled={disabled}
            className={`rounded-lg px-4 py-3 text-left transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
              level === l.value
                ? "bg-blue-500 text-white"
                : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-300"
            }`}
          >
            <span className="text-sm font-medium block">{l.label}</span>
            <span className={`text-xs block mt-0.5 ${level === l.value ? "text-blue-100" : "text-zinc-500"}`}>
              {l.description}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
