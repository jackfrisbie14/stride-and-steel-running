import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { sendFBEvent } from "@/lib/facebook";

export async function POST(request) {
  try {
    const body = await request.json();
    const { type, path, step, visitorId, referrer, userAgent, metadata } = body;

    if (!visitorId) {
      return NextResponse.json({ error: "Missing visitorId" }, { status: 400 });
    }

    // Get user ID if logged in
    let userId = null;
    try {
      const session = await auth();
      if (session?.user?.email) {
        const user = await prisma.user.findUnique({
          where: { email: session.user.email },
          select: { id: true },
        });
        userId = user?.id;
      }
    } catch (e) {
      // Ignore auth errors for analytics
    }

    if (type === "pageview" && path) {
      await prisma.pageView.create({
        data: {
          path,
          visitorId,
          userId,
          referrer: referrer || null,
          userAgent: userAgent || null,
        },
      });
    }

    if (type === "funnel" && step) {
      // Check if this step was already tracked for this visitor (prevent duplicates)
      const existing = await prisma.funnelEvent.findFirst({
        where: {
          visitorId,
          step,
        },
      });

      if (!existing) {
        await prisma.funnelEvent.create({
          data: {
            step,
            visitorId,
            userId,
            metadata: metadata || null,
          },
        });

        if (step === "landing") {
          sendFBEvent("ViewContent", {
            userAgent: userAgent || request.headers.get("user-agent") || undefined,
          });
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Analytics track error:", error);
    // Don't fail the request for analytics errors
    return NextResponse.json({ success: true });
  }
}
