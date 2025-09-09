import { getStore } from "@netlify/blobs";

// one JSON blob for the whole app state
const STORE = "staystack";
const KEY = "state.json";

const cors = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET,POST,PUT,PATCH,OPTIONS",
  "access-control-allow-headers": "content-type"
};

export default async (req) => {
  if (req.method === "OPTIONS") return new Response("", { headers: cors });

  const store = getStore({ name: STORE });

  if (req.method === "GET") {
    const json = (await store.get(KEY, { type: "json" })) || null;
    return new Response(JSON.stringify(json || {}), {
      headers: { "content-type": "application/json", ...cors }
    });
  }

  if (["POST", "PUT", "PATCH"].includes(req.method)) {
    const incoming = await req.json().catch(() => ({}));
    const current = (await store.get(KEY, { type: "json" })) || {};
    const next = req.method === "PATCH" ? { ...current, ...incoming } : incoming;

    await store.set(KEY, JSON.stringify(next), {
      contentType: "application/json"
    });

    return new Response(JSON.stringify({ ok: true }), {
      headers: { "content-type": "application/json", ...cors }
    });
  }

  return new Response("Method Not Allowed", { status: 405, headers: cors });
};
