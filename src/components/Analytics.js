"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

// Generate or retrieve visitor ID
function getVisitorId() {
  if (typeof window === "undefined") return null;

  let visitorId = localStorage.getItem("ss_visitor_id");
  if (!visitorId) {
    visitorId = "v_" + Math.random().toString(36).substring(2) + Date.now().toString(36);
    localStorage.setItem("ss_visitor_id", visitorId);
  }
  return visitorId;
}

// Track a page view
async function trackPageView(path) {
  const visitorId = getVisitorId();
  if (!visitorId) return;

  try {
    await fetch("/api/analytics/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "pageview",
        path,
        visitorId,
        referrer: document.referrer || null,
        userAgent: navigator.userAgent || null,
      }),
    });
  } catch (e) {
    // Silently fail
  }
}

// Track a funnel event
export async function trackFunnelEvent(step, metadata = null) {
  const visitorId = getVisitorId();
  if (!visitorId) return;

  try {
    await fetch("/api/analytics/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "funnel",
        step,
        visitorId,
        metadata,
      }),
    });
  } catch (e) {
    // Silently fail
  }
}

// Map paths to funnel steps
const pathToFunnelStep = {
  "/": "landing",
  "/quiz": "quiz_start",
  "/results": "quiz_complete",
  "/signup": "signup_page",
  "/signin": "signin_page",
  "/checkout": "checkout_page",
  "/dashboard": "dashboard",
};

export default function Analytics() {
  const pathname = usePathname();

  useEffect(() => {
    // Track page view
    trackPageView(pathname);

    // Track funnel step if applicable
    const funnelStep = pathToFunnelStep[pathname];
    if (funnelStep) {
      trackFunnelEvent(funnelStep);
    }
  }, [pathname]);

  return null; // This component doesn't render anything
}
