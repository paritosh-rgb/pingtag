const attempts = new Map();

export const APP_ORIGIN = process.env.NEXT_PUBLIC_APP_URL || "https://getping.co.in";

export function jsonError(message = "Invalid request body.") {
  return Response.json({ error: message }, { status: 400 });
}

export async function readJson(request) {
  const contentType = request.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) return null;
  try {
    return await request.json();
  } catch {
    return null;
  }
}

export function sameOrigin(request) {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  try {
    const requestOrigin = new URL(request.url).origin;
    return origin === requestOrigin || origin === APP_ORIGIN;
  } catch {
    return false;
  }
}

export function canonicalOrigin(request) {
  const requestOrigin = new URL(request.url).origin;
  if (process.env.NODE_ENV !== "production") return requestOrigin;
  return APP_ORIGIN;
}

export function rateLimit(request, scope, limit, windowMs) {
  const forwarded = request.headers.get("x-forwarded-for") || "";
  const ip = forwarded.split(",")[0].trim() || request.headers.get("x-real-ip") || "unknown";
  const key = `${scope}:${ip}`;
  const now = Date.now();
  const active = (attempts.get(key) || []).filter((time) => now - time < windowMs);
  if (active.length >= limit) {
    attempts.set(key, active);
    return Math.ceil((windowMs - (now - active[0])) / 1000);
  }
  active.push(now);
  attempts.set(key, active);
  return 0;
}

export function tooManyRequests(retryAfter) {
  return Response.json(
    { error: "Please wait a moment before trying again." },
    { status: 429, headers: { "Retry-After": String(retryAfter), "Cache-Control": "no-store" } },
  );
}

export function cleanText(value, maxLength) {
  return String(value || "").replace(/[\u0000-\u001f\u007f]/g, " ").trim().slice(0, maxLength);
}
