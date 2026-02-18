import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

const ADMIN_EMAIL = "jackfrisbie14@gmail.com";

// GET - List all refund requests
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.email || session.user.email !== ADMIN_EMAIL) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const refundRequests = await prisma.refundRequest.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    // Get user details for each request
    const requestsWithUsers = await Promise.all(
      refundRequests.map(async (request) => {
        const user = await prisma.user.findUnique({
          where: { id: request.userId },
          select: { email: true, name: true },
        });
        return { ...request, user };
      })
    );

    // Get summary stats
    const stats = {
      total: refundRequests.length,
      pending: refundRequests.filter(r => r.status === "pending").length,
      approved: refundRequests.filter(r => r.status === "approved").length,
      processed: refundRequests.filter(r => r.status === "processed").length,
      denied: refundRequests.filter(r => r.status === "denied").length,
      totalRefunded: refundRequests
        .filter(r => r.status === "processed")
        .reduce((sum, r) => sum + (r.amountCents || 0), 0) / 100,
    };

    return NextResponse.json({ refundRequests: requestsWithUsers, stats });
  } catch (error) {
    console.error("Admin refunds error:", error);
    return NextResponse.json({ error: "Failed to get refunds" }, { status: 500 });
  }
}

// POST - Approve or deny a refund request
export async function POST(request) {
  try {
    const session = await auth();

    if (!session?.user?.email || session.user.email !== ADMIN_EMAIL) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { requestId, action, denialReason } = body;

    if (!requestId || !["approve", "deny"].includes(action)) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const refundRequest = await prisma.refundRequest.findUnique({
      where: { id: requestId },
    });

    if (!refundRequest) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    if (refundRequest.status !== "pending") {
      return NextResponse.json({ error: "Request already processed" }, { status: 400 });
    }

    if (action === "deny") {
      await prisma.refundRequest.update({
        where: { id: requestId },
        data: {
          status: "denied",
          reviewedBy: session.user.email,
          reviewedAt: new Date(),
          denialReason: denialReason || "Does not meet refund requirements",
        },
      });

      return NextResponse.json({ success: true, status: "denied" });
    }

    // Approve and process refund
    const user = await prisma.user.findUnique({
      where: { id: refundRequest.userId },
    });

    if (!user?.stripeSubscriptionId) {
      return NextResponse.json({ error: "No subscription to refund" }, { status: 400 });
    }

    // Get payment intent from invoice
    let paymentIntentId = null;
    try {
      const invoices = await stripe.invoices.list({
        subscription: user.stripeSubscriptionId,
        limit: 1,
      });
      if (invoices.data.length > 0 && invoices.data[0].payment_intent) {
        paymentIntentId = invoices.data[0].payment_intent;
      }
    } catch (e) {
      console.error("Error fetching invoice:", e);
    }

    if (!paymentIntentId) {
      return NextResponse.json({ error: "Could not find payment to refund" }, { status: 400 });
    }

    // Process refund
    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
      reason: "requested_by_customer",
    });

    // Cancel subscription
    await stripe.subscriptions.cancel(user.stripeSubscriptionId);

    // Update user
    await prisma.user.update({
      where: { id: user.id },
      data: {
        stripeSubscriptionId: null,
        stripePriceId: null,
        stripeCurrentPeriodEnd: null,
      },
    });

    // Update refund request
    await prisma.refundRequest.update({
      where: { id: requestId },
      data: {
        status: "processed",
        stripeRefundId: refund.id,
        reviewedBy: session.user.email,
        reviewedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      status: "processed",
      refundId: refund.id,
    });
  } catch (error) {
    console.error("Admin refund action error:", error);
    return NextResponse.json({ error: "Failed to process action" }, { status: 500 });
  }
}
