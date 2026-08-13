import { cookies } from "next/headers";
import { getSupabaseAdmin, identityForPhone, normalizePhone } from "@/lib/supabase-admin";

export async function POST(request) {
  const admin = getSupabaseAdmin();
  if (!admin) return Response.json({ error: "Add SUPABASE_SERVICE_ROLE_KEY to .env.local before using phone login." }, { status: 503 });
  const body = await request.json();
  const mode = body.mode === "login" ? "login" : "signup";
  const phoneNumber = normalizePhone(body.phoneNumber);
  const password = String(body.password || "");
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
  cookieStore.set("ping_supabase_token", session.session.access_token, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/" });
  return Response.json({ ok: true });
}
