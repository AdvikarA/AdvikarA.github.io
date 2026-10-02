import { getRedis, EVENTS_KEY, corsHeaders, applyHeaders, isAuthorized } from "./_lib.js";

export default async function handler(req, res) {
  applyHeaders(res, { ...corsHeaders(req), "Cache-Control": "no-store" });
  if (req.method === "OPTIONS") return res.status(204).end();
  if (!isAuthorized(req)) return res.status(401).json({ error: "unauthorized" });

  if (req.method !== "GET" && req.method !== "DELETE") return res.status(405).json({ error: "GET or DELETE" });

  try {
    const redis = getRedis();
    if (req.method === "DELETE") {
      await redis.del(EVENTS_KEY);
      return res.status(200).json({ ok: true });
    }
    const url = new URL(req.url, "http://x");
    const limit = Math.min(20000, Math.max(1, Number(url.searchParams.get("limit")) || 3000));
    const raw = await redis.lrange(EVENTS_KEY, 0, limit - 1);
    const total = await redis.llen(EVENTS_KEY);
    const events = raw.map((r) => (typeof r === "string" ? JSON.parse(r) : r));
    return res.status(200).json({ total, events });
  } catch (err) {
    console.error("events failed", err);
    return res.status(503).json({ error: "store unavailable: " + (err && err.message ? err.message : "unknown") });
  }
}
