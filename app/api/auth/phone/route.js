import { cookies } from "next/headers";
import { getSupabaseAdmin, identityForPhone, normalizePhone } from "@/lib/supabase-admin";
import { cleanText, rateLimit, readJson, sameOrigin, tooManyRequests } from "@/lib/security";

export async function POST(request) {
  if (!sameOrigin(request)) return Response.json({ error: "Invalid request origin." }, { status: 403 });
  const retryAfter = rateLimit(request, "phone-auth", 8, 15 * 60_000);
  if (retryAfter) return tooManyRequests(retryAfter);
  const admin = getSupabaseAdmin();
  if (!admin) return Response.json({ error: "Authentication is temporarily unavailable." }, { status: 503 });
  const body = await readJson(request);
  if (!body) return Response.json({ error: "Invalid request body." }, { status: 400 });
  const mode = body.mode === "login" ? "login" : "signup";
  const phoneNumber = normalizePhone(cleanText(body.phoneNumber, 24));
  const password = String(body.password || "").slice(0, 128);
  if (phoneNumber.length < 10 || password.length < 6) return Response.json({ error: "Enter a valid phone number and a password of at least 6 characters." }, { status: 400 });

  let email = identityForPhone(phoneNumber);
  if (mode === "signup") {
    const { data: existing, error: profileError } = await admin.from("profiles").select("id").eq("phone_number", phoneNumber).maybeSingle();
    if (profileError) return Response.json({ error: profileError.message }, { status: 400 });
    if (existing) return Response.json({ error: "An account already exists for this phone number. Please log in." }, { status: 409 });
    const { error } = await admin.auth.admin.createUser({ email, password, email_confirm: true, user_metadata: { phone_number: phoneNumber } });
    if (error) return Response.json({ error: error.message }, { status: 400 });
  }

  if (mode === "login") {
    const { data: profile } = await admin.from("profiles").select("id").eq("phone_number", phoneNumber).maybeSingle();
    if (profile?.id) {
      const { data: userData } = await admin.auth.admin.getUserById(profile.id);
      if (userData.user?.email) email = userData.user.email;
    }
  }

  const { data: session, error: loginError } = await admin.auth.signInWithPassword({ email, password });
  if (loginError || !session.session) return Response.json({ error: loginError?.message || "Phone number or password is incorrect." }, { status: 401 });
  const cookieStore = await cookies();
  cookieStore.set("ping_supabase_token", session.session.access_token, { httpOnly: true, maxAge: 60 * 60 * 24 * 7, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/" });
  return Response.json({ ok: true });
}
