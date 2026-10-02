import { Redis } from "@upstash/redis";

export const EVENTS_KEY = "events";
export const MAX_EVENTS = 50000;

let redis = null;
export function getRedis() {
  if (!redis) {
    const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
    if (!url || !token) throw new Error("Redis env vars missing");
    redis = new Redis({ url, token });
  }
  return redis;
}

const ALLOWED_ORIGINS = [
  "https://advikara.github.io",
  "http://localhost:8000",
  "http://127.0.0.1:8000"
];

export function corsHeaders(req) {
  const origin = req.headers.origin || "";
  const allow = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allow,
    "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Max-Age": "86400",
    "Vary": "Origin"
  };
}

export function applyHeaders(res, headers) {
  for (const [k, v] of Object.entries(headers)) res.setHeader(k, v);
}

export function isAuthorized(req) {
  const secret = process.env.TRACKER_SECRET;
  if (!secret) return false;
  const header = req.headers.authorization || "";
  const bearer = header.startsWith("Bearer ") ? header.slice(7) : "";
  const url = new URL(req.url, "http://x");
  const key = bearer || url.searchParams.get("key") || "";
  return key.length > 0 && key === secret;
}

export function clientIp(req) {
  const fwd = req.headers["x-forwarded-for"];
  if (typeof fwd === "string" && fwd.length) return fwd.split(",")[0].trim();
  return req.headers["x-real-ip"] || req.socket?.remoteAddress || "";
}

export function geo(req) {
  const h = req.headers;
  const dec = (v) => {
    if (!v) return "";
    try { return decodeURIComponent(String(v)); } catch { return String(v); }
  };
  return {
    country: dec(h["x-vercel-ip-country"]),
    region: dec(h["x-vercel-ip-country-region"]),
    city: dec(h["x-vercel-ip-city"]),
    lat: dec(h["x-vercel-ip-latitude"]),
    lon: dec(h["x-vercel-ip-longitude"])
  };
}
