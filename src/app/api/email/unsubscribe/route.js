import { prisma } from "@/lib/prisma";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");

  if (!token) {
    return new Response("Missing token", { status: 400 });
  }

  let userId;
  try {
    userId = Buffer.from(token, "base64").toString("utf-8");
  } catch {
    return new Response("Invalid token", { status: 400 });
  }

  try {
    await prisma.user.update({
      where: { id: userId },
      data: { unsubscribedFromEmail: true },
    });
  } catch {
    // User not found — still show confirmation page (don't leak info)
  }

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Unsubscribed — Stride & Steel</title>
</head>
<body style="margin:0;padding:0;background-color:#09090b;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;">
  <div style="text-align:center;padding:40px 20px;">
    <h1 style="color:#3b82f6;font-size:24px;font-weight:700;margin:0 0 16px;">Stride & Steel</h1>
    <p style="color:#ffffff;font-size:18px;margin:0 0 8px;">You've been unsubscribed.</p>
    <p style="color:#71717a;font-size:14px;margin:0;">You won't receive any more emails from us.</p>
  </div>
</body>
</html>`;

  return new Response(html, {
    headers: { "Content-Type": "text/html" },
  });
}
