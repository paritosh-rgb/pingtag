import { cookies } from "next/headers";
import { getSupabase } from "@/lib/supabase";
import { cleanText, rateLimit, readJson, sameOrigin, tooManyRequests } from "@/lib/security";

export async function POST(request) {
  if (!sameOrigin(request)) return Response.json({ error: "Invalid request origin." }, { status: 403 });
  const retryAfter = rateLimit(request, "session", 20, 60_000);
  if (retryAfter) return tooManyRequests(retryAfter);
  const body = await readJson(request);
  if (!body) return Response.json({ error: "Invalid request body." }, { status: 400 });
  const accessToken = cleanText(body.accessToken, 4096);
  if (!accessToken) return Response.json({ error: "Invalid session." }, { status: 401 });
  const supabase = getSupabase(accessToken);
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return Response.json({ error: "Invalid session." }, { status: 401 });
  const cookieStore = await cookies();
  cookieStore.set("ping_supabase_token", accessToken, { httpOnly: true, maxAge: 60 * 60 * 24 * 7, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/" });
  return Response.json({ ok: true });
}

export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.delete("ping_supabase_token");
  cookieStore.delete("ping_owner");
  return Response.json({ ok: true });
}
