"use client";

export default function TrainingDaySelector({ days, onChange, disabled }) {
  return (
    <div className="mb-8 rounded-xl border border-zinc-800 bg-zinc-900 p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-zinc-300">Training Days per Week</p>
          <p className="text-xs text-zinc-500">How many days you want to train</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => days > 3 && onChange(days - 1)}
            disabled={days <= 3 || disabled}
            className="w-8 h-8 rounded-lg border border-zinc-700 bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center"
          >
            -
          </button>
          <span className="text-xl font-bold text-blue-500 w-6 text-center">
            {days}
          </span>
          <button
            onClick={() => days < 7 && onChange(days + 1)}
            disabled={days >= 7 || disabled}
            className="w-8 h-8 rounded-lg border border-zinc-700 bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center"
          >
            +
          </button>
        </div>
      </div>
      {days >= 7 && (
        <p className="text-xs text-yellow-500 mt-3">
          Training 7 days a week with no rest days increases injury risk. Consider keeping at least one recovery day.
        </p>
      )}
    </div>
  );
}
