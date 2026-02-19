import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { stripe, PRICE_ID } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { sendFBEvent } from "@/lib/facebook";

export async function POST(request) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if user already has an active subscription
    if (user.stripeSubscriptionId && user.stripeCurrentPeriodEnd) {
      const isActive = new Date(user.stripeCurrentPeriodEnd) > new Date();
      if (isActive) {
        return NextResponse.json(
          { error: "Already subscribed" },
          { status: 400 }
        );
      }
    }

    // Parse referral code from request body
    let referralCode = null;
    try {
      const body = await request.json();
      referralCode = body.referralCode || null;
    } catch {
      // No body or invalid JSON — proceed without referral
    }

    // Validate referral code
    let validReferral = false;
    if (referralCode) {
      try {
        // Don't allow self-referral
        if (referralCode.toLowerCase() === session.user.email.toLowerCase()) {
          referralCode = null;
        } else {
          const referrer = await prisma.user.findUnique({
            where: { email: referralCode },
          });

          if (referrer && referrer.stripeSubscriptionId) {
            validReferral = true;
            // Store referredBy on the user immediately
            await prisma.user.update({
              where: { id: user.id },
              data: { referredBy: referralCode },
            });
          }
        }
      } catch (e) {
        console.error("Referral validation error:", e);
        // Proceed without referral on error
      }
    }

    // Create or retrieve Stripe customer
    let stripeCustomerId = user.stripeCustomerId;

    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: session.user.email,
        name: session.user.name || undefined,
        metadata: {
          userId: user.id,
        },
      });
      stripeCustomerId = customer.id;

      await prisma.user.update({
        where: { id: user.id },
        data: { stripeCustomerId },
      });
    }

    // Create checkout session with free 7-day trial (auth charge only)
    const lineItems = [
      {
        price: PRICE_ID,
        quantity: 1,
      },
    ];

    // Build subscription_data
    const subscriptionData = {
      trial_period_days: 7,
      metadata: {
        userId: user.id,
      },
    };

    // Apply referral discount if valid
    if (validReferral) {
      // Create or retrieve the referral coupon
      let coupon;
      try {
        coupon = await stripe.coupons.retrieve("referral_50");
      } catch {
        coupon = await stripe.coupons.create({
          id: "referral_50",
          percent_off: 50,
          duration: "once",
          name: "Referral - 50% Off First Month",
        });
      }

      subscriptionData.discounts = [{ coupon: coupon.id }];
      subscriptionData.metadata.referredBy = referralCode;
    }

    const checkoutSession = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: lineItems,
      subscription_data: subscriptionData,
      success_url: `${process.env.NEXTAUTH_URL?.trim()}/dashboard?success=true`,
      cancel_url: `${process.env.NEXTAUTH_URL?.trim()}/pricing?canceled=true`,
      metadata: {
        userId: user.id,
      },
    });

    sendFBEvent("InitiateCheckout", { email: session.user.email });
    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
