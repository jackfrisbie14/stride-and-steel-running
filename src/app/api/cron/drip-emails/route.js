import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { resend } from "@/lib/resend";
import { sendDripEmail } from "@/lib/emails";

const DRIP_SCHEDULE = [
  { emailType: "drip_1hr", delayMs: 1 * 60 * 60 * 1000 },
  { emailType: "drip_24hr", delayMs: 24 * 60 * 60 * 1000 },
  { emailType: "drip_72hr", delayMs: 72 * 60 * 60 * 1000 },
];

const BATCH_LIMIT = 50;
const DAILY_WARN_THRESHOLD = 80; // 80% of Resend free tier (100/day)
const ADMIN_EMAIL = "jackfrisbie14@gmail.com";

export async function GET(request) {
  // Verify cron secret (Vercel injects this for cron routes)
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const results = {};

  for (const { emailType, delayMs } of DRIP_SCHEDULE) {
    const cutoff = new Date(Date.now() - delayMs);

    const users = await prisma.user.findMany({
      where: {
        password: { not: null },
        stripeSubscriptionId: null,
        unsubscribedFromEmail: false,
        createdAt: { lte: cutoff },
        email: { not: null },
        NOT: {
          emailLogs: {
            some: { emailType },
          },
        },
      },
      take: BATCH_LIMIT,
    });

    let sent = 0;
    let failed = 0;
    let skipped = 0;

    for (const user of users) {
      try {
        const result = await sendDripEmail(user, emailType);
        if (result.sent) sent++;
        else if (result.skipped) skipped++;
        else failed++;
      } catch (err) {
        console.error(`Error sending ${emailType} to ${user.id}:`, err);
        failed++;
      }
    }

    results[emailType] = { eligible: users.length, sent, failed, skipped };
  }

  // Check if approaching Resend free tier daily limit
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const todayCount = await prisma.emailLog.count({
    where: { sentAt: { gte: startOfDay } },
  });

  if (todayCount >= DAILY_WARN_THRESHOLD && resend) {
    // Only alert once per day — check if we already sent one today
    const alreadyAlerted = await prisma.emailLog.findFirst({
      where: {
        emailType: "usage_alert",
        sentAt: { gte: startOfDay },
      },
    });

    if (!alreadyAlerted) {
      await resend.emails.send({
        from: "Stride & Steel <onboarding@resend.dev>",
        to: ADMIN_EMAIL,
        subject: `⚠️ Resend usage alert: ${todayCount} emails sent today`,
        html: `<p>You've sent <strong>${todayCount}</strong> emails today. The Resend free tier limit is 100/day.</p><p>Time to upgrade to the Pro plan ($20/mo for 50k emails/month): <a href="https://resend.com/pricing">resend.com/pricing</a></p>`,
      });

      await prisma.emailLog.create({
        data: { userId: "system", emailType: "usage_alert" },
      });
    }
  }

  return NextResponse.json({ success: true, results, todayCount });
}
