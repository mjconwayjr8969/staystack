// netlify/functions/sms.js
const cors = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "POST,OPTIONS",
  "access-control-allow-headers": "content-type",
};

export default async (req) => {
  if (req.method === "OPTIONS") return new Response("", { headers: cors });
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405, headers: cors });
  }

  let payload = {};
  try { payload = await req.json(); } catch {}
  const { to, text } = payload;

  if (!to || !text) {
    return new Response(JSON.stringify({ ok: false, error: "Missing 'to' or 'text'." }), {
      status: 400, headers: { "content-type": "application/json", ...cors }
    });
  }

  const sid   = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from  = process.env.TWILIO_FROM_NUMBER; // +12025550123

  if (!sid || !token || !from) {
    return new Response(JSON.stringify({ ok:false, error:"Twilio env vars not set" }), {
      status: 500, headers: { "content-type":"application/json", ...cors }
    });
  }

  const body = new URLSearchParams({ To: to, From: from, Body: text });
  const auth = btoa(`${sid}:${token}`);

  const r = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
    method: "POST",
    headers: { Authorization: `Basic ${auth}`, "Content-Type": "application/x-www-form-urlencoded" },
    body
  });

  const j = await r.json().catch(() => ({}));
  return new Response(JSON.stringify({ ok: r.ok, sid: j.sid, error: j.message || j.error_message }), {
    status: r.ok ? 200 : 500,
    headers: { "content-type": "application/json", ...cors }
  });
}
