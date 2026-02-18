"use client";

import { useState, useEffect } from "react";

function ProgressBar({ current, required, label }) {
  const percentage = Math.min((current / required) * 100, 100);
  const isComplete = current >= required;

  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-zinc-400">{label}</span>
        <span className={isComplete ? "text-green-400" : "text-zinc-300"}>
          {current}/{required} {isComplete && "✓"}
        </span>
      </div>
      <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-500 ${isComplete ? "bg-green-500" : "bg-blue-500"}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

export default function RefundRequest() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [eligibility, setEligibility] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  const checkEligibility = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/refund");
      const data = await res.json();
      setEligibility(data);
    } catch (e) {
      console.error("Error checking eligibility:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && !eligibility) {
      checkEligibility();
    }
  }, [isOpen]);

  const handleSubmit = async () => {
    if (!confirm(eligibility?.eligible
      ? "This will process your refund and cancel your subscription. Continue?"
      : "You don't meet all requirements. Your request will be submitted for manual review. Continue?"
    )) {
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/refund", { method: "POST" });
      const data = await res.json();
      setResult(data);
    } catch (e) {
      console.error("Error submitting refund:", e);
      setResult({ error: "Failed to submit request" });
    } finally {
      setSubmitting(false);
    }
  };

  // Already processed
  if (result?.success) {
    return (
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
        <div className="text-center">
          {result.refundRequest?.status === "processed" ? (
            <>
              <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-green-400 mb-2">Refund Processed</h3>
              <p className="text-zinc-400 mb-2">{result.message}</p>
              <p className="text-2xl font-bold text-white">${result.refundAmount?.toFixed(2)} refunded</p>
              <p className="text-sm text-zinc-500 mt-4">
                The refund will appear on your statement within 5-10 business days.
              </p>
            </>
          ) : (
            <>
              <div className="w-16 h-16 rounded-full bg-yellow-500/20 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-yellow-400 mb-2">Request Submitted</h3>
              <p className="text-zinc-400">{result.message}</p>
              <p className="text-sm text-zinc-500 mt-4">
                We'll review your request and email you within 2-3 business days.
              </p>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-zinc-800/50 bg-zinc-900/30 overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-zinc-800/30 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-sm text-zinc-500">Need help?</span>
          <span className="text-sm text-zinc-600">Request a refund</span>
        </div>
        <svg
          className={`w-4 h-4 text-zinc-600 transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="border-t border-zinc-800 p-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-700 border-t-blue-500" />
            </div>
          ) : eligibility?.existingRequest ? (
            <div className="text-center py-4">
              <p className="text-zinc-400">{eligibility.reason}</p>
              <p className="text-sm text-zinc-500 mt-2">
                Status: <span className="text-blue-400 capitalize">{eligibility.existingRequest.status}</span>
              </p>
            </div>
          ) : eligibility?.canRequest === false && !eligibility?.details ? (
            <div className="text-center py-4">
              <p className="text-zinc-400">{eligibility.reason}</p>
            </div>
          ) : eligibility ? (
            <>
              {/* Eligibility Status */}
              <div className={`rounded-lg p-4 mb-6 ${eligibility.eligible
                ? "bg-green-500/10 border border-green-500/30"
                : "bg-yellow-500/10 border border-yellow-500/30"
              }`}>
                <div className="flex items-center gap-3">
                  {eligibility.eligible ? (
                    <>
                      <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                        <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-semibold text-green-400">You're Eligible!</p>
                        <p className="text-sm text-zinc-400">Your refund can be processed instantly</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center">
                        <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-semibold text-yellow-400">Not Yet Eligible</p>
                        <p className="text-sm text-zinc-400">{eligibility.reason}</p>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Requirements */}
              <div className="space-y-4 mb-6">
                <h4 className="font-semibold text-zinc-300">Requirements</h4>

                <ProgressBar
                  current={eligibility.details?.workoutDaysCompleted || 0}
                  required={eligibility.details?.requiredWorkoutDays || 14}
                  label="Workout days completed"
                />

                <div className="flex items-center justify-between text-sm">
                  <span className="text-zinc-400">Within refund window</span>
                  <span className={eligibility.details?.withinWindow ? "text-green-400" : "text-red-400"}>
                    {eligibility.details?.daysSincePurchase} / {eligibility.details?.refundWindowDays} days
                    {eligibility.details?.withinWindow ? " ✓" : " ✗"}
                  </span>
                </div>
              </div>

              {/* Refund Amount */}
              {eligibility.details?.refundAmount > 0 && (
                <div className="bg-zinc-800/50 rounded-lg p-4 mb-6">
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-400">Refund Amount</span>
                    <span className="text-2xl font-bold text-white">
                      ${eligibility.details.refundAmount.toFixed(2)}
                    </span>
                  </div>
                </div>
              )}

              {/* Workout History */}
              {eligibility.workoutHistory?.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-semibold text-zinc-300 mb-3">Recent Workout History</h4>
                  <div className="max-h-40 overflow-y-auto space-y-2">
                    {eligibility.workoutHistory.slice(0, 10).map((workout, i) => (
                      <div key={i} className="flex items-center justify-between text-sm bg-zinc-800/30 rounded-lg px-3 py-2">
                        <span className="text-zinc-300">{workout.title}</span>
                        <span className="text-zinc-500">
                          {new Date(workout.date).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Submit Button */}
              {eligibility.canRequest && (
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className={`w-full py-3 rounded-xl font-semibold transition-colors disabled:opacity-50 ${
                    eligibility.eligible
                      ? "bg-green-500 text-white hover:bg-green-600"
                      : "bg-yellow-500 text-black hover:bg-yellow-600"
                  }`}
                >
                  {submitting
                    ? "Processing..."
                    : eligibility.eligible
                      ? "Process Refund Now"
                      : "Submit for Review"
                  }
                </button>
              )}

              {!eligibility.canRequest && (
                <p className="text-center text-zinc-500 text-sm">
                  {eligibility.reason}
                </p>
              )}

              <p className="text-xs text-zinc-600 text-center mt-4">
                By requesting a refund, you agree to our refund policy terms.
              </p>
            </>
          ) : (
            <p className="text-center text-zinc-500">Failed to load eligibility data</p>
          )}
        </div>
      )}
    </div>
  );
}
