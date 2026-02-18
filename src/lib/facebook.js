import { createHash, randomUUID } from "crypto";

const FB_PIXEL_ID = process.env.FB_PIXEL_ID;
const FB_ACCESS_TOKEN = process.env.FB_ACCESS_TOKEN;

function hashSHA256(value) {
  return createHash("sha256").update(value.trim().toLowerCase()).digest("hex");
}

export async function sendFBEvent(
  eventName,
  { email, sourceUrl, userAgent, value, currency } = {}
) {
  if (!FB_PIXEL_ID || !FB_ACCESS_TOKEN) return;

  const userData = {};
  if (email) userData.em = [hashSHA256(email)];
  if (userAgent) userData.client_user_agent = userAgent;

  const eventData = {
    event_name: eventName,
    event_time: Math.floor(Date.now() / 1000),
    event_id: randomUUID(),
    action_source: "website",
    user_data: userData,
  };

  if (sourceUrl) eventData.event_source_url = sourceUrl;
  if (value != null && currency) {
    eventData.custom_data = { value, currency };
  }

  try {
    const res = await fetch(
      `https://graph.facebook.com/v21.0/${FB_PIXEL_ID}/events`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          data: [eventData],
          access_token: FB_ACCESS_TOKEN,
          ...(process.env.FB_TEST_EVENT_CODE && {
            test_event_code: process.env.FB_TEST_EVENT_CODE,
          }),
        }),
      }
    );

    if (!res.ok) {
      const text = await res.text();
      console.error("FB CAPI error:", res.status, text);
    }
  } catch (err) {
    console.error("FB CAPI fetch failed:", err);
  }
}
