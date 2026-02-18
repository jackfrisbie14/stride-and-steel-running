import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

export async function POST(request) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user?.stripeSubscriptionId) {
      return NextResponse.json({ error: "No subscription found" }, { status: 404 });
    }

    const { discount } = await request.json();

    // Create or get a coupon for the return offer
    let coupon;
    const couponId = `return_offer_${discount}`;

    try {
      coupon = await stripe.coupons.retrieve(couponId);
    } catch (e) {
      // Coupon doesn't exist, create it
      coupon = await stripe.coupons.create({
        id: couponId,
        percent_off: discount,
        duration: "once",
        name: `Return Offer - ${discount}% Off`,
      });
    }

    // Apply the coupon to the subscription for the next invoice
    await stripe.subscriptions.update(user.stripeSubscriptionId, {
      coupon: coupon.id,
    });

    // Update the feedback record to show they accepted the offer
    await prisma.cancellationFeedback.updateMany({
      where: {
        userId: user.id,
        cancelled: false,
        acceptedOffer: false,
      },
      data: {
        acceptedOffer: true,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Accept offer error:", error);
    return NextResponse.json(
      { error: "Failed to apply discount" },
      { status: 500 }
    );
  }
}
