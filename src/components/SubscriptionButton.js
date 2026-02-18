"use client";

import { useState, useEffect } from "react";

export default function SubscriptionButton() {
  const [loading, setLoading] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState(null);

  useEffect(() => {
    checkSubscriptionStatus();
  }, []);

  const checkSubscriptionStatus = async () => {
    try {
      const res = await fetch("/api/stripe/subscription-status");
      const data = await res.json();
      setSubscriptionStatus(data);
    } catch (e) {
      console.error("Error checking subscription:", e);
    }
  };

  const handleManageSubscription = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/stripe/portal", {
        method: "POST",
      });
      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || "Something went wrong");
      }
    } catch (error) {
      console.error("Portal error:", error);
      alert("Failed to open billing portal");
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

  // If subscription is set to cancel, show resubscribe option
  if (subscriptionStatus?.cancelAtPeriodEnd) {
    return (
      <div className="flex items-center gap-3">
        <span className="text-xs text-yellow-400">
          Cancels {new Date(subscriptionStatus.cancelAt).toLocaleDateString()}
        </span>
        <button
          onClick={handleResubscribe}
          disabled={loading}
          className="text-sm text-blue-400 hover:text-blue-300 font-medium transition-colors disabled:opacity-50"
        >
          {loading ? "..." : "Resubscribe"}
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handleManageSubscription}
      disabled={loading}
      className="text-sm text-zinc-400 hover:text-zinc-200 transition-colors disabled:opacity-50"
    >
      {loading ? "Loading..." : "Manage Subscription"}
    </button>
  );
}
