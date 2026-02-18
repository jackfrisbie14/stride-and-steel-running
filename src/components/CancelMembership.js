"use client";

import { useState, useEffect } from "react";

const CANCELLATION_REASONS = [
  { value: "too_expensive", label: "Too expensive" },
  { value: "not_using", label: "Not using it enough" },
  { value: "found_alternative", label: "Found an alternative" },
  { value: "too_difficult", label: "Workouts are too difficult" },
  { value: "not_seeing_results", label: "Not seeing results" },
  { value: "other", label: "Other reason" },
];

const RETURN_OFFER_DISCOUNT = 50; // 50% off next month

export default function CancelMembership() {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState("initial"); // "initial", "customize_prompt", "survey", "offer", "confirming", "cancelled", "resubscribing"
  const [loading, setLoading] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState(null);
  const [selectedReason, setSelectedReason] = useState("");
  const [otherReason, setOtherReason] = useState("");

  // Check subscription status when opened
  useEffect(() => {
    if (isOpen && !subscriptionStatus) {
      checkSubscriptionStatus();
    }
  }, [isOpen]);

  const checkSubscriptionStatus = async () => {
    try {
      const res = await fetch("/api/stripe/subscription-status");
      const data = await res.json();
      setSubscriptionStatus(data);
    } catch (e) {
      console.error("Error checking subscription:", e);
    }
  };

  const handleStartCancel = () => {
    setStep("customize_prompt");
  };

  const handleSurveySubmit = async () => {
    if (!selectedReason) {
      alert("Please select a reason");
      return;
    }

    setLoading(true);
    try {
      // Save feedback and show offer
      await fetch("/api/stripe/cancel-feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reason: selectedReason,
          otherReason: selectedReason === "other" ? otherReason : null,
        }),
      });
      setStep("offer");
    } catch (e) {
      console.error("Error saving feedback:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptOffer = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/accept-offer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ discount: RETURN_OFFER_DISCOUNT }),
      });
      const data = await res.json();

      if (data.success) {
        alert("Great! Your discount has been applied to your next billing cycle.");
        setIsOpen(false);
        setStep("initial");
      } else {
        alert(data.error || "Failed to apply discount");
      }
    } catch (e) {
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeclineOffer = () => {
    setStep("confirming");
  };

  const handleConfirmCancel = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirmed: true }),
      });
      const data = await res.json();

      if (data.error) {
        alert(data.error);
        return;
      }

      setStep("cancelled");
      setSubscriptionStatus({ ...subscriptionStatus, cancelAtPeriodEnd: true, cancelAt: data.cancelAt });
    } catch (e) {
      alert("Failed to cancel. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResubscribe = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/resubscribe", { method: "POST" });
      const data = await res.json();

      if (data.success) {
        setSubscriptionStatus({ ...subscriptionStatus, cancelAtPeriodEnd: false, cancelAt: null });
        setStep("initial");
        alert("Welcome back! Your subscription has been reactivated.");
      } else {
        alert(data.error || "Failed to resubscribe");
      }
    } catch (e) {
      alert("Failed to resubscribe. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Show resubscribe option if subscription is set to cancel
  if (subscriptionStatus?.cancelAtPeriodEnd) {
    return (
      <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/10 px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-yellow-400">
              Your membership will end on {new Date(subscriptionStatus.cancelAt).toLocaleDateString()}
            </p>
            <p className="text-xs text-zinc-500 mt-1">
              You'll keep access until then.
            </p>
          </div>
          <button
            onClick={handleResubscribe}
            disabled={loading}
            className="text-sm text-yellow-400 hover:text-yellow-300 font-medium disabled:opacity-50"
          >
            {loading ? "..." : "Resubscribe"}
          </button>
        </div>
      </div>
    );
  }

  // Cancelled state
  if (step === "cancelled") {
    return (
      <div className="rounded-lg border border-zinc-800/50 bg-zinc-900/30 px-4 py-3">
        <p className="text-sm text-zinc-500">
          Your membership has been cancelled. You'll have access until the end of your billing period.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-zinc-800/50 bg-zinc-900/30 overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-zinc-800/30 transition-colors"
      >
        <span className="text-sm text-zinc-600">Cancel membership</span>
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
        <div className="border-t border-zinc-800/50 p-4">
          {/* Step: Initial */}
          {step === "initial" && (
            <>
              <p className="text-sm text-zinc-500 mb-4">
                If you cancel, you'll still have access until the end of your current billing period. You can resubscribe anytime.
              </p>
              <button
                onClick={handleStartCancel}
                className="w-full py-2 rounded-lg border border-zinc-700 text-zinc-500 text-sm hover:bg-zinc-800/50 hover:text-zinc-400 transition-colors"
              >
                Continue to Cancel
              </button>
            </>
          )}

          {/* Step: Customize Prompt */}
          {step === "customize_prompt" && (
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Have you tried customizing your plan?</h3>
              <p className="text-sm text-zinc-400 mb-4">
                You can adjust your training days, experience level, and intensity to get workouts that fit you better.
              </p>
              <div className="space-y-2">
                <button
                  onClick={() => {
                    setIsOpen(false);
                    setStep("initial");
                    const el = document.getElementById("customization-panel");
                    if (el) el.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="w-full py-3 rounded-lg bg-blue-500 text-white font-semibold hover:bg-blue-600 transition-colors"
                >
                  Take Me to Customization Settings
                </button>
                <button
                  onClick={() => setStep("survey")}
                  className="w-full py-2 text-sm text-zinc-500 hover:text-zinc-400 transition-colors"
                >
                  I've already tried that, continue cancelling
                </button>
              </div>
            </div>
          )}

          {/* Step: Survey */}
          {step === "survey" && (
            <>
              <p className="text-sm text-zinc-300 mb-4">
                We're sorry to see you go. Help us improve by telling us why you're leaving:
              </p>
              <div className="space-y-2 mb-4">
                {CANCELLATION_REASONS.map((reason) => (
                  <label
                    key={reason.value}
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedReason === reason.value
                        ? "border-blue-500/50 bg-blue-500/10"
                        : "border-zinc-800 hover:border-zinc-700"
                    }`}
                  >
                    <input
                      type="radio"
                      name="reason"
                      value={reason.value}
                      checked={selectedReason === reason.value}
                      onChange={(e) => setSelectedReason(e.target.value)}
                      className="accent-blue-500"
                    />
                    <span className="text-sm text-zinc-300">{reason.label}</span>
                  </label>
                ))}
              </div>

              {selectedReason === "other" && (
                <textarea
                  value={otherReason}
                  onChange={(e) => setOtherReason(e.target.value)}
                  placeholder="Please tell us more..."
                  className="w-full p-3 rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-300 text-sm mb-4 resize-none"
                  rows={3}
                />
              )}

              <button
                onClick={handleSurveySubmit}
                disabled={loading || !selectedReason}
                className="w-full py-2 rounded-lg bg-zinc-800 text-zinc-300 text-sm hover:bg-zinc-700 transition-colors disabled:opacity-50"
              >
                {loading ? "..." : "Continue"}
              </button>
            </>
          )}

          {/* Step: Return Offer */}
          {step === "offer" && (
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Wait! Here's a special offer</h3>
              <p className="text-zinc-400 mb-4">
                We'd hate to see you go. How about <span className="text-blue-400 font-bold">{RETURN_OFFER_DISCOUNT}% off</span> your next month?
              </p>
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-4">
                <p className="text-sm text-zinc-400">Your next month:</p>
                <p className="text-2xl font-bold text-white">
                  <span className="line-through text-zinc-500 text-lg">$29.99</span>{" "}
                  ${(MONTHLY_PRICE * (1 - RETURN_OFFER_DISCOUNT / 100)).toFixed(2)}
                </p>
              </div>
              <div className="space-y-2">
                <button
                  onClick={handleAcceptOffer}
                  disabled={loading}
                  className="w-full py-3 rounded-lg bg-blue-500 text-white font-semibold hover:bg-blue-600 transition-colors disabled:opacity-50"
                >
                  {loading ? "Applying..." : "Yes, I'll Stay!"}
                </button>
                <button
                  onClick={handleDeclineOffer}
                  disabled={loading}
                  className="w-full py-2 text-sm text-zinc-500 hover:text-zinc-400 transition-colors"
                >
                  No thanks, continue cancelling
                </button>
              </div>
            </div>
          )}

          {/* Step: Final Confirmation */}
          {step === "confirming" && (
            <>
              <p className="text-sm text-zinc-400 mb-4">
                Are you sure? You'll lose access to all workouts and personalized training at the end of your billing period.
              </p>
              <div className="space-y-2">
                <button
                  onClick={() => setStep("offer")}
                  className="w-full py-2 rounded-lg bg-zinc-800 text-zinc-300 text-sm hover:bg-zinc-700 transition-colors"
                >
                  Go Back
                </button>
                <button
                  onClick={handleConfirmCancel}
                  disabled={loading}
                  className="w-full py-2 rounded-lg border border-red-500/50 text-red-400 text-sm hover:bg-red-500/10 transition-colors disabled:opacity-50"
                >
                  {loading ? "Cancelling..." : "Yes, Cancel My Membership"}
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
