export default async () =>
  new Response(JSON.stringify({ ok: true, now: Date.now() }), {
    headers: { "content-type": "application/json" }
  });
