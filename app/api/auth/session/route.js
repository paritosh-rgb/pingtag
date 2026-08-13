import { cookies } from "next/headers";
import { getSupabase } from "@/lib/supabase";

export async function POST(request) {
  const { accessToken } = await request.json();
  const supabase = getSupabase(accessToken);
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return Response.json({ error: "Invalid session." }, { status: 401 });
  const cookieStore = await cookies();
  cookieStore.set("ping_supabase_token", accessToken, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/" });
  return Response.json({ ok: true });
}

export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.delete("ping_supabase_token");
  cookieStore.delete("ping_owner");
  return Response.json({ ok: true });
}
