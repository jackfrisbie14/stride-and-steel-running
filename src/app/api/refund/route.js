import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

const REQUIRED_WORKOUT_DAYS = 14;
const REFUND_WINDOW_DAYS = 30;

// GET - Check refund eligibility
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        trainingWeeks: {
          include: {
            workoutLogs: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if user has an active subscription
    if (!user.stripeSubscriptionId) {
      return NextResponse.json({
        eligible: false,
        reason: "No active subscription found",
        canRequest: false,
      });
    }

    // Check for existing refund request
    const existingRequest = await prisma.refundRequest.findFirst({
      where: {
        userId: user.id,
        status: { in: ["pending", "approved", "processed"] },
      },
    });

    if (existingRequest) {
      return NextResponse.json({
        eligible: false,
        reason: existingRequest.status === "processed"
          ? "You have already received a refund"
          : "You have a pending refund request",
        canRequest: false,
        existingRequest: {
          status: existingRequest.status,
          createdAt: existingRequest.createdAt,
        },
      });
    }

    // Get subscription details from Stripe
    let subscription;
    let firstPaymentDate;
    try {
      subscription = await stripe.subscriptions.retrieve(user.stripeSubscriptionId);
      firstPaymentDate = new Date(subscription.start_date * 1000);
    } catch (e) {
      return NextResponse.json({
        eligible: false,
        reason: "Could not retrieve subscription details",
        canRequest: false,
      });
    }

    // Check if within refund window
    const daysSincePurchase = Math.floor((Date.now() - firstPaymentDate.getTime()) / (1000 * 60 * 60 * 24));
    const withinWindow = daysSincePurchase <= REFUND_WINDOW_DAYS;

    // Count completed workout days
    const completedWorkouts = user.trainingWeeks.flatMap(week =>
      week.workoutLogs.filter(log => log.completed)
    );

    // Count unique days with completed workouts
    const uniqueDays = new Set(
      completedWorkouts.map(log =>
        new Date(log.completedAt || log.createdAt).toDateString()
      )
    );
    const workoutDaysCompleted = uniqueDays.size;

    // Determine eligibility
    const meetsWorkoutRequirement = workoutDaysCompleted >= REQUIRED_WORKOUT_DAYS;
    const eligible = withinWindow && meetsWorkoutRequirement;

    let reason = "";
    if (!withinWindow) {
      reason = `Refund window has expired (${daysSincePurchase} days since purchase, limit is ${REFUND_WINDOW_DAYS} days)`;
    } else if (!meetsWorkoutRequirement) {
      reason = `You need ${REQUIRED_WORKOUT_DAYS - workoutDaysCompleted} more workout days to qualify (${workoutDaysCompleted}/${REQUIRED_WORKOUT_DAYS} completed)`;
    } else {
      reason = "You meet all requirements for a refund";
    }

    // Get refund amount (first month's payment)
    let refundAmount = 0;
    try {
      const invoices = await stripe.invoices.list({
        subscription: user.stripeSubscriptionId,
        limit: 1,
      });
      if (invoices.data.length > 0) {
        refundAmount = invoices.data[0].amount_paid;
      }
    } catch (e) {
      console.error("Error fetching invoice:", e);
    }

    return NextResponse.json({
      eligible,
      reason,
      canRequest: withinWindow, // Can still request even if not eligible, will be reviewed
      details: {
        daysSincePurchase,
        refundWindowDays: REFUND_WINDOW_DAYS,
        withinWindow,
        workoutDaysCompleted,
        requiredWorkoutDays: REQUIRED_WORKOUT_DAYS,
        meetsWorkoutRequirement,
        refundAmount: refundAmount / 100,
        purchaseDate: firstPaymentDate,
      },
      workoutHistory: completedWorkouts.map(log => ({
        date: log.completedAt || log.createdAt,
        title: log.workoutTitle,
        type: log.workoutType,
      })).sort((a, b) => new Date(b.date) - new Date(a.date)),
    });
  } catch (error) {
    console.error("Refund eligibility check error:", error);
    return NextResponse.json(
      { error: "Failed to check eligibility" },
      { status: 500 }
    );
  }
}

// POST - Submit refund request
export async function POST(request) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        trainingWeeks: {
          include: {
            workoutLogs: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (!user.stripeSubscriptionId) {
      return NextResponse.json({ error: "No active subscription" }, { status: 400 });
    }

    // Check for existing request
    const existingRequest = await prisma.refundRequest.findFirst({
      where: {
        userId: user.id,
        status: { in: ["pending", "approved", "processed"] },
      },
    });

    if (existingRequest) {
      return NextResponse.json({ error: "Refund request already exists" }, { status: 400 });
    }

    // Get subscription details
    const subscription = await stripe.subscriptions.retrieve(user.stripeSubscriptionId);
    const firstPaymentDate = new Date(subscription.start_date * 1000);
    const daysSincePurchase = Math.floor((Date.now() - firstPaymentDate.getTime()) / (1000 * 60 * 60 * 24));

    // Count workout days
    const completedWorkouts = user.trainingWeeks.flatMap(week =>
      week.workoutLogs.filter(log => log.completed)
    );
    const uniqueDays = new Set(
      completedWorkouts.map(log =>
        new Date(log.completedAt || log.createdAt).toDateString()
      )
    );
    const workoutDaysCompleted = uniqueDays.size;

    // Check eligibility
    const withinWindow = daysSincePurchase <= REFUND_WINDOW_DAYS;
    const meetsWorkoutRequirement = workoutDaysCompleted >= REQUIRED_WORKOUT_DAYS;
    const eligible = withinWindow && meetsWorkoutRequirement;

    let eligibilityReason = "";
    if (!withinWindow) {
      eligibilityReason = "Outside refund window";
    } else if (!meetsWorkoutRequirement) {
      eligibilityReason = `Only ${workoutDaysCompleted}/${REQUIRED_WORKOUT_DAYS} workout days completed`;
    } else {
      eligibilityReason = "Meets all requirements";
    }

    // Get refund amount
    let refundAmountCents = 0;
    let paymentIntentId = null;
    try {
      const invoices = await stripe.invoices.list({
        subscription: user.stripeSubscriptionId,
        limit: 1,
      });
      if (invoices.data.length > 0 && invoices.data[0].payment_intent) {
        refundAmountCents = invoices.data[0].amount_paid;
        paymentIntentId = invoices.data[0].payment_intent;
      }
    } catch (e) {
      console.error("Error fetching invoice:", e);
    }

    // If eligible, process refund automatically
    if (eligible && paymentIntentId) {
      try {
        // Create refund in Stripe
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

        // Create refund request record
        const refundRequest = await prisma.refundRequest.create({
          data: {
            userId: user.id,
            status: "processed",
            purchaseDate: firstPaymentDate,
            workoutDaysCompleted,
            eligible: true,
            eligibilityReason,
            amountCents: refundAmountCents,
            stripeRefundId: refund.id,
            reviewedAt: new Date(),
          },
        });

        return NextResponse.json({
          success: true,
          message: "Refund processed successfully",
          refundRequest,
          refundAmount: refundAmountCents / 100,
        });
      } catch (e) {
        console.error("Error processing refund:", e);
        return NextResponse.json({ error: "Failed to process refund" }, { status: 500 });
      }
    }

    // Not eligible - create pending request for review
    const refundRequest = await prisma.refundRequest.create({
      data: {
        userId: user.id,
        status: "pending",
        purchaseDate: firstPaymentDate,
        workoutDaysCompleted,
        eligible: false,
        eligibilityReason,
        amountCents: refundAmountCents,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Refund request submitted for review",
      refundRequest,
      eligible: false,
      reason: eligibilityReason,
    });
  } catch (error) {
    console.error("Refund request error:", error);
    return NextResponse.json(
      { error: "Failed to submit refund request" },
      { status: 500 }
    );
  }
}
