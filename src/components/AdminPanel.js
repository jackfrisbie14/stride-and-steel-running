"use client";

import { useState, useEffect } from "react";

const FUNNEL_LABELS = {
  landing: "Landing Page",
  quiz_start: "Started Quiz",
  quiz_complete: "Completed Quiz",
  signup_page: "Signup Page",
  signup_complete: "Signed Up",
  checkout_page: "Checkout Page",
  subscribed: "Subscribed",
  dashboard: "Dashboard",
};

const CANCELLATION_REASON_LABELS = {
  too_expensive: "Too expensive",
  not_using: "Not using enough",
  found_alternative: "Found alternative",
  too_difficult: "Too difficult",
  not_seeing_results: "Not seeing results",
  other: "Other",
};

function FunnelChart({ funnelCounts }) {
  const steps = ["landing", "quiz_start", "quiz_complete", "signup_page", "signup_complete", "checkout_page", "subscribed", "dashboard"];
  const maxCount = Math.max(...steps.map((s) => funnelCounts[s] || 0), 1);

  return (
    <div className="space-y-3">
      {steps.map((step, index) => {
        const count = funnelCounts[step] || 0;
        const prevCount = index > 0 ? funnelCounts[steps[index - 1]] || 0 : count;
        const conversionRate = prevCount > 0 ? Math.round((count / prevCount) * 100) : 0;
        const barWidth = (count / maxCount) * 100;

        return (
          <div key={step}>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-zinc-400">{FUNNEL_LABELS[step]}</span>
              <div className="flex items-center gap-2">
                <span className="text-zinc-300 font-medium">{count}</span>
                {index > 0 && (
                  <span className={`${conversionRate >= 50 ? "text-green-500" : conversionRate >= 25 ? "text-yellow-500" : "text-red-500"}`}>
                    ({conversionRate}%)
                  </span>
                )}
              </div>
            </div>
            <div className="h-6 bg-zinc-800 rounded overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500"
                style={{ width: `${barWidth}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function generateSummary(stats) {
  const parts = [];
  const fc = stats.funnelCounts || {};

  // Revenue & subscribers
  if (stats.activeSubscriptions > 0) {
    const arpu = stats.mrr / stats.activeSubscriptions;
    parts.push(`You're at $${stats.mrr.toLocaleString()} MRR from ${stats.activeSubscriptions} active subscriber${stats.activeSubscriptions === 1 ? "" : "s"} ($${arpu.toFixed(2)}/user).`);
  } else {
    parts.push(`No active subscribers yet. ${stats.totalUsers} user${stats.totalUsers === 1 ? " has" : "s have"} signed up so far.`);
  }

  // Growth
  if (stats.signupsLast7Days > 0) {
    parts.push(`${stats.signupsLast7Days} new signup${stats.signupsLast7Days === 1 ? "" : "s"} in the last 7 days.`);
  }

  // Funnel analysis — find the biggest drop-off
  const steps = ["landing", "quiz_start", "quiz_complete", "signup_page", "signup_complete", "checkout_page", "subscribed"];
  let worstDrop = null;
  let worstRate = 100;
  for (let i = 1; i < steps.length; i++) {
    const prev = fc[steps[i - 1]] || 0;
    const curr = fc[steps[i]] || 0;
    if (prev > 0) {
      const rate = Math.round((curr / prev) * 100);
      if (rate < worstRate) {
        worstRate = rate;
        worstDrop = { from: steps[i - 1], to: steps[i], rate, prev, curr };
      }
    }
  }

  if (fc.landing > 0 && fc.subscribed !== undefined) {
    const overallRate = fc.landing > 0 ? ((fc.subscribed || 0) / fc.landing * 100).toFixed(1) : 0;
    parts.push(`Overall funnel: ${overallRate}% of landing visitors convert to paid (${fc.landing} → ${fc.subscribed || 0}).`);
  }

  if (worstDrop && worstDrop.prev > 2) {
    parts.push(`Biggest drop-off: ${FUNNEL_LABELS[worstDrop.from]} → ${FUNNEL_LABELS[worstDrop.to]} at ${worstDrop.rate}% (${worstDrop.prev} → ${worstDrop.curr}). This is where to focus.`);
  }

  // Engagement
  const totalWorkouts = stats.totalWorkoutsCompleted + stats.totalWorkoutsSkipped;
  if (totalWorkouts > 0) {
    const completionRate = Math.round((stats.totalWorkoutsCompleted / totalWorkouts) * 100);
    parts.push(`Workout completion rate: ${completionRate}% (${stats.totalWorkoutsCompleted} done, ${stats.totalWorkoutsSkipped} skipped).`);
  }

  // Cancellation
  const cs = stats.cancellationStats;
  if (cs && cs.total > 0) {
    parts.push(`${cs.total} cancellation attempt${cs.total === 1 ? "" : "s"} — saved ${cs.saved} (${cs.saveRate}% save rate).`);
    const topReason = Object.entries(cs.reasonCounts || {}).sort(([, a], [, b]) => b - a)[0];
    if (topReason) {
      parts.push(`Top cancel reason: "${CANCELLATION_REASON_LABELS[topReason[0]] || topReason[0]}".`);
    }
  }

  return parts.join(" ");
}

function StatCard({ label, value, subtext, icon, color = "text-blue-500" }) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-2xl">{icon}</span>
        <span className={`text-2xl font-bold ${color}`}>{value}</span>
      </div>
      <p className="text-sm text-zinc-400">{label}</p>
      {subtext && <p className="text-xs text-zinc-600 mt-1">{subtext}</p>}
    </div>
  );
}

export default function AdminPanel() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [refunds, setRefunds] = useState(null);
  const [refundsLoading, setRefundsLoading] = useState(false);
  const [processingRefund, setProcessingRefund] = useState(null);

  useEffect(() => {
    if (isOpen && !stats) {
      fetchStats();
      fetchRefunds();
    }
  }, [isOpen]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/stats");
      if (!res.ok) throw new Error("Failed to fetch stats");
      const data = await res.json();
      setStats(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchRefunds = async () => {
    try {
      setRefundsLoading(true);
      const res = await fetch("/api/admin/refunds");
      if (!res.ok) throw new Error("Failed to fetch refunds");
      const data = await res.json();
      setRefunds(data);
    } catch (e) {
      console.error("Error fetching refunds:", e);
    } finally {
      setRefundsLoading(false);
    }
  };

  const handleRefundAction = async (requestId, action) => {
    const confirmMsg = action === "approve"
      ? "This will process the refund and cancel their subscription. Continue?"
      : "This will deny the refund request. Continue?";

    if (!confirm(confirmMsg)) return;

    setProcessingRefund(requestId);
    try {
      const res = await fetch("/api/admin/refunds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId, action }),
      });

      if (!res.ok) throw new Error("Failed to process");

      fetchRefunds();
      fetchStats();
    } catch (e) {
      alert("Error: " + e.message);
    } finally {
      setProcessingRefund(null);
    }
  };

  return (
    <div className="mb-8">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full rounded-xl border border-red-500/30 bg-red-500/10 p-4 flex items-center justify-between hover:bg-red-500/20 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">👑</span>
          <div className="text-left">
            <p className="font-semibold text-red-400">Admin Dashboard</p>
            <p className="text-sm text-zinc-500">View company stats and metrics</p>
          </div>
        </div>
        <svg
          className={`w-5 h-5 text-red-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="mt-4 rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
          {loading && (
            <div className="flex items-center justify-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-700 border-t-red-500" />
            </div>
          )}

          {error && (
            <div className="text-center py-8 text-red-400">
              Error: {error}
            </div>
          )}

          {stats && !loading && (
            <>
              {/* Key Metrics */}
              <h3 className="text-lg font-semibold mb-4 text-zinc-300">Key Metrics</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                <StatCard
                  icon="💰"
                  label="MRR"
                  value={`$${stats.mrr.toLocaleString()}`}
                  color="text-green-500"
                />
                <StatCard
                  icon="⭐"
                  label="Active Subs"
                  value={stats.activeSubscriptions}
                  color="text-yellow-500"
                />
                <StatCard
                  icon="👥"
                  label="Total Users"
                  value={stats.totalUsers}
                  color="text-blue-500"
                />
                <StatCard
                  icon="📈"
                  label="New (30d)"
                  value={stats.newUsersLast30Days}
                  color="text-purple-500"
                />
              </div>

              {/* Summary */}
              <div className="rounded-lg border border-zinc-700 bg-zinc-800/50 p-4 mb-6">
                <p className="text-sm text-zinc-300 leading-relaxed">{generateSummary(stats)}</p>
              </div>

              {/* Traffic Stats */}
              <h3 className="text-lg font-semibold mb-4 text-zinc-300">Traffic</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                <StatCard
                  icon="👁️"
                  label="Page Views (7d)"
                  value={stats.pageViewsLast7Days?.toLocaleString() || 0}
                  color="text-cyan-500"
                />
                <StatCard
                  icon="📊"
                  label="Views Today"
                  value={stats.pageViewsToday?.toLocaleString() || 0}
                  color="text-cyan-400"
                />
                <StatCard
                  icon="🧑‍💻"
                  label="Unique Visitors"
                  value={stats.uniqueVisitors?.toLocaleString() || 0}
                  color="text-indigo-500"
                />
                <StatCard
                  icon="📈"
                  label="Visitors (7d)"
                  value={stats.uniqueVisitorsLast7Days?.toLocaleString() || 0}
                  color="text-indigo-400"
                />
              </div>

              {/* Funnel */}
              {stats.funnelCounts && (
                <>
                  <h3 className="text-lg font-semibold mb-4 text-zinc-300">Conversion Funnel</h3>
                  <div className="rounded-lg border border-zinc-800 p-4 mb-6">
                    <FunnelChart funnelCounts={stats.funnelCounts} />
                  </div>
                </>
              )}

              {/* Top Pages */}
              {stats.pageViewsByPath && stats.pageViewsByPath.length > 0 && (
                <>
                  <h3 className="text-lg font-semibold mb-4 text-zinc-300">Top Pages</h3>
                  <div className="rounded-lg border border-zinc-800 overflow-hidden mb-6">
                    <table className="w-full text-sm">
                      <thead className="bg-zinc-800">
                        <tr>
                          <th className="text-left p-3 text-zinc-400 font-medium">Page</th>
                          <th className="text-right p-3 text-zinc-400 font-medium">Views</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stats.pageViewsByPath.map((page, i) => (
                          <tr key={i} className="border-t border-zinc-800">
                            <td className="p-3 text-zinc-300 font-mono text-xs">{page.path}</td>
                            <td className="p-3 text-right text-zinc-400">{page.views.toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}

              {/* Engagement Stats */}
              <h3 className="text-lg font-semibold mb-4 text-zinc-300">Engagement</h3>
              <div className="grid grid-cols-3 gap-4 mb-6">
                <StatCard
                  icon="✅"
                  label="Workouts Done"
                  value={stats.totalWorkoutsCompleted}
                  color="text-green-500"
                />
                <StatCard
                  icon="⏭️"
                  label="Workouts Skipped"
                  value={stats.totalWorkoutsSkipped}
                  color="text-zinc-500"
                />
                <StatCard
                  icon="🆕"
                  label="Signups (7d)"
                  value={stats.signupsLast7Days}
                  color="text-blue-500"
                />
              </div>

              {/* Recent Users */}
              <h3 className="text-lg font-semibold mb-4 text-zinc-300">Recent Users</h3>
              <div className="rounded-lg border border-zinc-800 overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-zinc-800">
                    <tr>
                      <th className="text-left p-3 text-zinc-400 font-medium">User</th>
                      <th className="text-left p-3 text-zinc-400 font-medium hidden sm:table-cell">Joined</th>
                      <th className="text-right p-3 text-zinc-400 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recentUsers.map((user) => {
                      const isActive = user.stripeCurrentPeriodEnd && new Date(user.stripeCurrentPeriodEnd) > new Date();
                      return (
                        <tr key={user.id} className="border-t border-zinc-800">
                          <td className="p-3">
                            <p className="font-medium text-zinc-300">{user.name || "—"}</p>
                            <p className="text-xs text-zinc-500">{user.email}</p>
                          </td>
                          <td className="p-3 text-zinc-500 hidden sm:table-cell">
                            {new Date(user.createdAt).toLocaleDateString()}
                          </td>
                          <td className="p-3 text-right">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              isActive
                                ? "bg-green-500/20 text-green-400"
                                : "bg-zinc-700 text-zinc-400"
                            }`}>
                              {isActive ? "Pro" : "Free"}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Refund Requests */}
              <h3 className="text-lg font-semibold mb-4 text-zinc-300 mt-6 pt-6 border-t border-zinc-800">
                Refund Requests
                {refunds?.stats?.pending > 0 && (
                  <span className="ml-2 px-2 py-0.5 rounded-full text-xs bg-red-500/20 text-red-400">
                    {refunds.stats.pending} pending
                  </span>
                )}
              </h3>

              {refundsLoading ? (
                <div className="flex items-center justify-center py-4">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-700 border-t-red-500" />
                </div>
              ) : refunds?.refundRequests?.length > 0 ? (
                <>
                  {/* Refund Stats */}
                  <div className="grid grid-cols-4 gap-2 mb-4">
                    <div className="bg-zinc-800/50 rounded-lg p-2 text-center">
                      <p className="text-lg font-bold text-yellow-400">{refunds.stats.pending}</p>
                      <p className="text-xs text-zinc-500">Pending</p>
                    </div>
                    <div className="bg-zinc-800/50 rounded-lg p-2 text-center">
                      <p className="text-lg font-bold text-green-400">{refunds.stats.processed}</p>
                      <p className="text-xs text-zinc-500">Processed</p>
                    </div>
                    <div className="bg-zinc-800/50 rounded-lg p-2 text-center">
                      <p className="text-lg font-bold text-red-400">{refunds.stats.denied}</p>
                      <p className="text-xs text-zinc-500">Denied</p>
                    </div>
                    <div className="bg-zinc-800/50 rounded-lg p-2 text-center">
                      <p className="text-lg font-bold text-zinc-300">${refunds.stats.totalRefunded}</p>
                      <p className="text-xs text-zinc-500">Refunded</p>
                    </div>
                  </div>

                  {/* Refund List */}
                  <div className="space-y-2">
                    {refunds.refundRequests.map((request) => (
                      <div
                        key={request.id}
                        className={`rounded-lg border p-3 ${
                          request.status === "pending"
                            ? "border-yellow-500/30 bg-yellow-500/5"
                            : request.status === "processed"
                            ? "border-green-500/30 bg-green-500/5"
                            : "border-zinc-800 bg-zinc-800/30"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-zinc-300 truncate">
                              {request.user?.email || "Unknown"}
                            </p>
                            <p className="text-xs text-zinc-500">
                              {request.workoutDaysCompleted}/14 days •
                              ${(request.amountCents / 100).toFixed(2)} •
                              {new Date(request.createdAt).toLocaleDateString()}
                            </p>
                            {request.eligible ? (
                              <span className="text-xs text-green-400">✓ Eligible</span>
                            ) : (
                              <span className="text-xs text-yellow-400">⚠ {request.eligibilityReason}</span>
                            )}
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            {request.status === "pending" ? (
                              <>
                                <button
                                  onClick={() => handleRefundAction(request.id, "approve")}
                                  disabled={processingRefund === request.id}
                                  className="px-2 py-1 rounded text-xs bg-green-500/20 text-green-400 hover:bg-green-500/30 disabled:opacity-50"
                                >
                                  {processingRefund === request.id ? "..." : "Approve"}
                                </button>
                                <button
                                  onClick={() => handleRefundAction(request.id, "deny")}
                                  disabled={processingRefund === request.id}
                                  className="px-2 py-1 rounded text-xs bg-red-500/20 text-red-400 hover:bg-red-500/30 disabled:opacity-50"
                                >
                                  Deny
                                </button>
                              </>
                            ) : (
                              <span className={`px-2 py-1 rounded text-xs ${
                                request.status === "processed"
                                  ? "bg-green-500/20 text-green-400"
                                  : "bg-zinc-700 text-zinc-400"
                              }`}>
                                {request.status}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <p className="text-zinc-500 text-sm text-center py-4">No refund requests yet</p>
              )}

              {/* Cancellation Feedback */}
              {stats.cancellationStats && (
                <>
                  <h3 className="text-lg font-semibold mb-4 text-zinc-300 mt-6 pt-6 border-t border-zinc-800">
                    Cancellation Feedback
                    {stats.cancellationStats.saved > 0 && (
                      <span className="ml-2 px-2 py-0.5 rounded-full text-xs bg-green-500/20 text-green-400">
                        {stats.cancellationStats.saveRate}% saved
                      </span>
                    )}
                  </h3>

                  {/* Cancellation Stats */}
                  <div className="grid grid-cols-4 gap-2 mb-4">
                    <div className="bg-zinc-800/50 rounded-lg p-2 text-center">
                      <p className="text-lg font-bold text-zinc-300">{stats.cancellationStats.total}</p>
                      <p className="text-xs text-zinc-500">Total</p>
                    </div>
                    <div className="bg-zinc-800/50 rounded-lg p-2 text-center">
                      <p className="text-lg font-bold text-green-400">{stats.cancellationStats.saved}</p>
                      <p className="text-xs text-zinc-500">Saved</p>
                    </div>
                    <div className="bg-zinc-800/50 rounded-lg p-2 text-center">
                      <p className="text-lg font-bold text-red-400">{stats.cancellationStats.cancelled}</p>
                      <p className="text-xs text-zinc-500">Cancelled</p>
                    </div>
                    <div className="bg-zinc-800/50 rounded-lg p-2 text-center">
                      <p className="text-lg font-bold text-green-400">{stats.cancellationStats.saveRate}%</p>
                      <p className="text-xs text-zinc-500">Save Rate</p>
                    </div>
                  </div>

                  {/* Reason Breakdown */}
                  {Object.keys(stats.cancellationStats.reasonCounts || {}).length > 0 && (
                    <div className="mb-4">
                      <p className="text-sm text-zinc-400 mb-2">Why users try to cancel:</p>
                      <div className="space-y-2">
                        {Object.entries(stats.cancellationStats.reasonCounts)
                          .sort(([, a], [, b]) => b - a)
                          .map(([reason, count]) => {
                            const percentage = Math.round((count / stats.cancellationStats.total) * 100);
                            return (
                              <div key={reason}>
                                <div className="flex justify-between text-xs mb-1">
                                  <span className="text-zinc-400">
                                    {CANCELLATION_REASON_LABELS[reason] || reason}
                                  </span>
                                  <span className="text-zinc-300">{count} ({percentage}%)</span>
                                </div>
                                <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-gradient-to-r from-red-500 to-blue-500"
                                    style={{ width: `${percentage}%` }}
                                  />
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  )}

                  {/* Recent Feedback */}
                  {stats.cancellationFeedback && stats.cancellationFeedback.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm text-zinc-400 mb-2">Recent feedback:</p>
                      {stats.cancellationFeedback.slice(0, 5).map((fb) => (
                        <div
                          key={fb.id}
                          className={`rounded-lg border p-2 text-xs ${
                            fb.acceptedOffer
                              ? "border-green-500/30 bg-green-500/5"
                              : fb.cancelled
                              ? "border-red-500/30 bg-red-500/5"
                              : "border-zinc-800 bg-zinc-800/30"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-zinc-300">
                              {CANCELLATION_REASON_LABELS[fb.reason] || fb.reason}
                            </span>
                            <span className={
                              fb.acceptedOffer
                                ? "text-green-400"
                                : fb.cancelled
                                ? "text-red-400"
                                : "text-yellow-400"
                            }>
                              {fb.acceptedOffer ? "✓ Saved" : fb.cancelled ? "✗ Cancelled" : "⏳ Pending"}
                            </span>
                          </div>
                          {fb.otherReason && (
                            <p className="text-zinc-500 mt-1 italic">"{fb.otherReason}"</p>
                          )}
                          <p className="text-zinc-600 mt-1">
                            {new Date(fb.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}

              {/* Refresh Button */}
              <button
                onClick={() => { fetchStats(); fetchRefunds(); }}
                className="mt-4 w-full py-2 rounded-lg border border-zinc-700 text-zinc-400 hover:bg-zinc-800 transition-colors text-sm"
              >
                Refresh Stats
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
