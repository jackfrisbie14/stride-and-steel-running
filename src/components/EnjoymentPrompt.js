"use client";

import { useState } from "react";

export default function EnjoymentPrompt({ userEmail }) {
  const [state, setState] = useState("question"); // "question" | "referral" | "dismissed"
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  const dismiss = async (enjoying) => {
    setLoading(true);
    try {
      await fetch("/api/user/enjoyment-response", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enjoying }),
      });
    } catch (e) {
      console.error("Failed to dismiss enjoyment prompt:", e);
    }
    setLoading(false);
    setState("dismissed");
  };

  const handleNotReally = async () => {
    await dismiss(false);
    // Scroll to customization panel
    const panel = document.querySelector("[data-tour='customization']") || document.querySelector("details");
    if (panel) {
      panel.scrollIntoView({ behavior: "smooth", block: "start" });
      if (panel.tagName === "DETAILS") panel.open = true;
    }
  };

  const handleYes = () => {
    setState("referral");
  };

  const handleCopyLink = () => {
    const link = `https://strideandsteelrunning.com/pricing?ref=${encodeURIComponent(userEmail)}`;
    navigator.clipboard.writeText(link).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  if (state === "dismissed") return null;

  if (state === "question") {
    return (
      <div className="mb-8 rounded-xl border border-blue-500/30 bg-zinc-900 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-1 w-8 rounded-full bg-blue-500" />
          <p className="text-sm font-medium text-blue-400">Quick check-in</p>
        </div>
        <h3 className="text-lg font-bold">Are you enjoying Stride & Steel Running?</h3>
        <p className="mt-2 text-sm text-zinc-400">
          We&apos;d love to know how your training is going.
        </p>
        <div className="mt-4 flex gap-3">
          <button
            onClick={handleYes}
            disabled={loading}
            className="rounded-lg bg-blue-500 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-600 disabled:opacity-50"
          >
            Yes, I love it!
          </button>
          <button
            onClick={handleNotReally}
            disabled={loading}
            className="rounded-lg border border-zinc-700 px-5 py-2.5 text-sm font-medium text-zinc-400 transition-colors hover:border-zinc-600 hover:text-zinc-300 disabled:opacity-50"
          >
            Not really
          </button>
        </div>
      </div>
    );
  }

  // State: referral
  return (
    <div className="mb-8 rounded-xl border border-blue-500/30 bg-zinc-900 p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="h-1 w-8 rounded-full bg-blue-500" />
        <p className="text-sm font-medium text-blue-400">Spread the word & save</p>
      </div>
      <h3 className="text-lg font-bold">Share your referral code with a friend</h3>
      <p className="mt-2 text-sm text-zinc-400">
        When they subscribe, you both get 50% off a month.
      </p>

      {/* Referral code box */}
      <div className="mt-4 flex items-center gap-2">
        <div className="flex-1 rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-3 text-sm font-mono text-zinc-200 truncate">
          {userEmail}
        </div>
        <button
          onClick={handleCopyLink}
          className="shrink-0 rounded-lg bg-blue-500 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-600"
        >
          {copied ? "Copied!" : "Copy Link"}
        </button>
      </div>

      <p className="mt-3 text-xs text-zinc-500 leading-relaxed">
        Your friend gets their normal 7-day trial, then 50% off their first month.
        You get 50% off your next month when they subscribe.
      </p>

      <button
        onClick={() => dismiss(true)}
        disabled={loading}
        className="mt-4 text-xs text-zinc-600 hover:text-zinc-400 transition-colors disabled:opacity-50"
      >
        Dismiss
      </button>
    </div>
  );
}
