import { getRedis, EVENTS_KEY, MAX_EVENTS, corsHeaders, applyHeaders, clientIp, geo } from "./_lib.js";

const ALLOWED_TYPES = new Set(["pageview", "click", "leave"]);
const STR = (v, n) => (typeof v === "string" ? v.slice(0, n) : "");
const NUM = (v, max) => {
  const x = Number(v);
  return Number.isFinite(x) ? Math.max(0, Math.min(max, Math.round(x))) : 0;
};

export default async function handler(req, res) {
  applyHeaders(res, corsHeaders(req));
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });

  let data = req.body;
  if (typeof data === "string") {
    try { data = JSON.parse(data); } catch { data = null; }
  }
  if (!data || typeof data !== "object") return res.status(400).json({ error: "bad body" });

  const type = ALLOWED_TYPES.has(data.type) ? data.type : "pageview";
  const event = {
    ts: Date.now(),
    type,
    vid: STR(data.vid, 40),
    path: STR(data.path, 300),
    title: STR(data.title, 160),
    ref: STR(data.ref, 300),
    href: STR(data.href, 500),
    text: STR(data.text, 120),
    tag: STR(data.tag, 16),
    seconds: NUM(data.seconds, 86400),
    scroll: NUM(data.scroll, 100),
    screen: STR(data.screen, 24),
    lang: STR(data.lang, 24),
    tz: STR(data.tz, 64),
    ua: STR(req.headers["user-agent"], 300),
    ip: clientIp(req),
    ...geo(req)
  };

  try {
    const redis = getRedis();
    await redis.lpush(EVENTS_KEY, JSON.stringify(event));
    await redis.ltrim(EVENTS_KEY, 0, MAX_EVENTS - 1);
  } catch (err) {
    console.error("collect failed", err);
    return res.status(500).json({ error: "store failed" });
  }
  return res.status(204).end();
}
