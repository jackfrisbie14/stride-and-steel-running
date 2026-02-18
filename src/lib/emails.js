import { resend } from "@/lib/resend";
import { prisma } from "@/lib/prisma";

const BASE_URL = "https://strideandsteelrunning.com";

function unsubscribeUrl(userId) {
  const token = Buffer.from(userId).toString("base64");
  return `${BASE_URL}/api/email/unsubscribe?token=${token}`;
}

function layout(content, userId) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin:0;padding:0;background-color:#09090b;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#09090b;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;">
          <!-- Logo -->
          <tr>
            <td style="padding-bottom:32px;text-align:center;">
              <span style="color:#3b82f6;font-size:24px;font-weight:700;letter-spacing:-0.5px;">Stride & Steel Running</span>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="background-color:#18181b;border-radius:12px;padding:40px 32px;">
              ${content}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding-top:24px;text-align:center;">
              <a href="${unsubscribeUrl(userId)}" style="color:#71717a;font-size:12px;text-decoration:underline;">Unsubscribe from these emails</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function ctaButton(text, href) {
  return `
<table width="100%" cellpadding="0" cellspacing="0" style="margin-top:32px;">
  <tr>
    <td align="center">
      <a href="${href}" style="display:inline-block;background-color:#3b82f6;color:#ffffff;font-size:16px;font-weight:700;text-decoration:none;padding:14px 32px;border-radius:8px;">${text}</a>
    </td>
  </tr>
</table>`;
}

const PRICING_URL = `${BASE_URL}/pricing`;

const templates = {
  drip_1hr: (user) => ({
    subject: "Your training plan is ready — start your trial",
    html: layout(
      `<h1 style="color:#ffffff;font-size:22px;margin:0 0 16px;">Your plan is waiting for you</h1>
       <p style="color:#d4d4d8;font-size:15px;line-height:1.6;margin:0 0 16px;">
         Hey${user.name ? ` ${user.name}` : ""},
       </p>
       <p style="color:#d4d4d8;font-size:15px;line-height:1.6;margin:0 0 16px;">
         We just built you a personalized training plan based on your <strong style="color:#3b82f6;">${user.archetype || "Runner"}</strong> profile. It's sitting in your dashboard right now — workouts tailored to your goals, your schedule, and your experience level.
       </p>
       <p style="color:#d4d4d8;font-size:15px;line-height:1.6;margin:0 0 16px;">
         Try everything for <strong style="color:#ffffff;">just $0.99</strong> for your first 7 days. No commitment — cancel anytime.
       </p>
       ${ctaButton("Start Your 7-Day Trial →", PRICING_URL)}`,
      user.id
    ),
  }),

  drip_24hr: (user) => ({
    subject: "Most runners waste months training wrong",
    html: layout(
      `<h1 style="color:#ffffff;font-size:22px;margin:0 0 16px;">What's your training actually costing you?</h1>
       <p style="color:#d4d4d8;font-size:15px;line-height:1.6;margin:0 0 16px;">
         Let's be real about what personalized coaching costs:
       </p>
       <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
         <tr>
           <td style="padding:12px 16px;border-left:3px solid #3b82f6;background-color:#1c1c1f;border-radius:0 8px 8px 0;margin-bottom:8px;">
             <span style="color:#71717a;font-size:13px;">Personal running coach</span><br/>
             <span style="color:#ffffff;font-size:18px;font-weight:700;">$200–400/month</span>
           </td>
         </tr>
         <tr><td style="height:8px;"></td></tr>
         <tr>
           <td style="padding:12px 16px;border-left:3px solid #3b82f6;background-color:#1c1c1f;border-radius:0 8px 8px 0;margin-bottom:8px;">
             <span style="color:#71717a;font-size:13px;">Generic training plan app</span><br/>
             <span style="color:#ffffff;font-size:18px;font-weight:700;">$15–30/month</span>
           </td>
         </tr>
         <tr><td style="height:8px;"></td></tr>
         <tr>
           <td style="padding:12px 16px;border-left:3px solid #3b82f6;background-color:#1c1c1f;border-radius:0 8px 8px 0;">
             <span style="color:#71717a;font-size:13px;">Stride & Steel Running (personalized)</span><br/>
             <span style="color:#3b82f6;font-size:18px;font-weight:700;">$29.99/month</span>
           </td>
         </tr>
       </table>
       <p style="color:#d4d4d8;font-size:15px;line-height:1.6;margin:0 0 16px;">
         Your <strong style="color:#3b82f6;">${user.archetype || "Runner"}</strong> plan provides a complete running system personalized to your goals — speed work, easy runs, recovery, and race prep all in one.
       </p>
       <p style="color:#d4d4d8;font-size:15px;line-height:1.6;margin:0 0 16px;">
         Try it for <strong style="color:#ffffff;">$0.99</strong>. See the difference in one week.
       </p>
       ${ctaButton("Try It for $0.99 →", PRICING_URL)}`,
      user.id
    ),
  }),

  drip_72hr: (user) => ({
    subject: "Last chance: your custom plan expires soon",
    html: layout(
      `<h1 style="color:#ffffff;font-size:22px;margin:0 0 16px;">Your plan won't wait forever</h1>
       <p style="color:#d4d4d8;font-size:15px;line-height:1.6;margin:0 0 16px;">
         ${user.name ? `${user.name}, we` : "We"} built a training plan specifically for your <strong style="color:#3b82f6;">${user.archetype || "Runner"}</strong> profile — your goals, your schedule, your experience level.
       </p>
       <p style="color:#d4d4d8;font-size:15px;line-height:1.6;margin:0 0 16px;">
         Right now, it's sitting in your dashboard unused. Every day without proper programming is a day of wasted potential — or worse, a day closer to injury from random workouts.
       </p>
       <p style="color:#d4d4d8;font-size:15px;line-height:1.6;margin:0 0 16px;">
         This is your last reminder. <strong style="color:#ffffff;">$0.99 for 7 days</strong> — less than a cup of coffee to see if structured training actually works for you.
       </p>
       ${ctaButton("Claim Your Plan for $0.99 →", PRICING_URL)}`,
      user.id
    ),
  }),
};

export async function sendDripEmail(user, emailType) {
  if (user.unsubscribedFromEmail) return { skipped: true, reason: "unsubscribed" };
  if (!resend) return { skipped: true, reason: "resend_not_configured" };

  const template = templates[emailType];
  if (!template) return { skipped: true, reason: "unknown_email_type" };

  const { subject, html } = template(user);

  const { error } = await resend.emails.send({
    from: "Stride & Steel Running <onboarding@resend.dev>",
    to: user.email,
    subject,
    html,
  });

  if (error) {
    console.error(`Failed to send ${emailType} to ${user.email}:`, error);
    return { sent: false, error };
  }

  await prisma.emailLog.create({
    data: {
      userId: user.id,
      emailType,
    },
  });

  return { sent: true };
}
