"use client";

import { useState, Suspense } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

function PricingContent() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  const canceled = searchParams.get("canceled");
  const refParam = searchParams.get("ref");

  const [referralCode, setReferralCode] = useState(refParam || "");
  const [showReferralInput, setShowReferralInput] = useState(false);

  const handleSubscribe = async () => {
    if (!session) {
      window.location.href = "/signin";
      return;
    }

    setLoading(true);
    try {
      const body = {};
      if (referralCode) {
        body.referralCode = referralCode;
      }

      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || "Something went wrong");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      alert("Failed to start checkout");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen px-6 py-20">
      <div className="mx-auto max-w-4xl text-center">
        {canceled && (
          <div className="mb-8 rounded-lg bg-yellow-500/10 border border-yellow-500/30 p-4 text-yellow-500">
            Checkout was canceled. You can try again when you're ready.
          </div>
        )}

        {refParam && (
          <div className="mb-8 rounded-lg bg-green-500/10 border border-green-500/30 p-4 text-green-400">
            You were referred by a friend! You&apos;ll get 50% off your first month after your trial.
          </div>
        )}

        <h1 className="text-4xl font-bold sm:text-5xl">
          Unlock Your Full <span className="text-blue-500">Training Potential</span>
        </h1>

        <p className="mt-6 text-lg text-zinc-400">
          Get access to personalized running programs, weekly training plans,
          and everything you need to become a stronger, faster runner.
        </p>

        {/* Pricing Card */}
        <div className="mt-12 mx-auto max-w-md rounded-2xl border border-blue-500/30 bg-zinc-900 p-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold">Stride & Steel Running Pro</h2>
            <p className="mt-2 text-zinc-400">Full access to all features</p>

            <div className="mt-6">
              <span className="text-5xl font-bold">$0.99</span>
            </div>
            <p className="text-lg text-blue-400 font-medium mt-2">for your first 7 days</p>
            {referralCode ? (
              <p className="text-green-400 text-sm mt-1 font-medium">then $14.99 for your first month, $29.99/month after</p>
            ) : (
              <p className="text-zinc-500 text-sm mt-1">then $29.99/month</p>
            )}

            <ul className="mt-8 space-y-4 text-left">
              <li className="flex items-center gap-3">
                <svg className="h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Personalized weekly workout plans
              </li>
              <li className="flex items-center gap-3">
                <svg className="h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Running programs tailored to your archetype
              </li>
              <li className="flex items-center gap-3">
                <svg className="h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Progress tracking dashboard
              </li>
              <li className="flex items-center gap-3">
                <svg className="h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                New workouts every week
              </li>
              <li className="flex items-center gap-3">
                <svg className="h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Cancel anytime
              </li>
            </ul>

            <button
              onClick={handleSubscribe}
              disabled={loading}
              className="mt-8 w-full rounded-xl bg-blue-500 py-4 font-semibold text-white transition-colors hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Loading..." : "Start 7-Day Trial for $0.99"}
            </button>

            <p className="mt-4 text-xs text-zinc-500">
              $0.99 charged today. After 7 days, $29.99/month. Cancel anytime.
            </p>
          </div>
        </div>

        {/* Referral code input (when not already provided via URL) */}
        {!refParam && (
          <div className="mt-6 mx-auto max-w-md">
            {!showReferralInput ? (
              <button
                onClick={() => setShowReferralInput(true)}
                className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                Have a referral code?
              </button>
            ) : (
              <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
                <label className="block text-sm text-zinc-400 mb-2 text-left">
                  Referral code (friend&apos;s email)
                </label>
                <input
                  type="email"
                  value={referralCode}
                  onChange={(e) => setReferralCode(e.target.value)}
                  placeholder="friend@example.com"
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-sm text-zinc-200 placeholder-zinc-600 focus:border-blue-500 focus:outline-none"
                />
                {referralCode && (
                  <p className="mt-2 text-xs text-green-400">
                    50% off your first month will be applied at checkout!
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        <Link href="/welcome" className="mt-8 inline-block text-sm text-zinc-500 hover:text-zinc-300">
          &larr; Back to Home
        </Link>
      </div>
    </main>
  );
}

export default function Pricing() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <PricingContent />
    </Suspense>
  );
}
