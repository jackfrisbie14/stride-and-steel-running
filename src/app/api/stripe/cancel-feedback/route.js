import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

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

    const { reason, otherReason } = await request.json();

    // Create cancellation feedback record
    await prisma.cancellationFeedback.create({
      data: {
        userId: user.id,
        reason,
        otherReason,
        offerDiscount: 50, // We'll offer 50% off
        acceptedOffer: false,
        cancelled: false,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Cancel feedback error:", error);
    return NextResponse.json(
      { error: "Failed to save feedback" },
      { status: 500 }
    );
  }
}
