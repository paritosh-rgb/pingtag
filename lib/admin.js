import { cookies } from "next/headers";
import { getSupabase } from "@/lib/supabase";
import { getSupabaseAdmin, normalizePhone } from "@/lib/supabase-admin";

export async function getAdmin() {
  const token = (await cookies()).get("ping_supabase_token")?.value;
  if (!token) return null;
  const client = getSupabase(token);
  const { data: userData } = await client.auth.getUser();
  if (!userData.user) return null;

  const admin = getSupabaseAdmin();
  const { data: profile } = await admin.from("profiles").select("phone_number").eq("id", userData.user.id).maybeSingle();
  const allowed = String(process.env.PINGTAG_ADMIN_PHONES || "")
    .split(",")
    .map(normalizePhone)
    .filter(Boolean);
  if (!profile?.phone_number || !allowed.includes(normalizePhone(profile.phone_number))) return null;
  return { id: userData.user.id, phoneNumber: profile.phone_number };
}
