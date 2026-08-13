import { cookies } from "next/headers";
import { sendPush } from "@/lib/push";
import { getSupabase, supabaseConfigured } from "@/lib/supabase";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export async function POST(request) {
  if (!supabaseConfigured) return Response.json({ error: "Supabase is not configured." }, { status: 503 });

  const { tagId } = await request.json();
  if (!tagId) return Response.json({ error: "Vehicle is required." }, { status: 400 });

  const token = (await cookies()).get("ping_supabase_token")?.value;
  if (!token) return Response.json({ error: "Please log in." }, { status: 401 });

  const ownerClient = getSupabase(token);
  const { data: userData } = await ownerClient.auth.getUser();
  if (!userData.user) return Response.json({ error: "Please log in again." }, { status: 401 });

  const admin = getSupabaseAdmin();
  const { data: vehicle, error } = await admin
    .from("vehicles")
    .select("id, owner_id, subscription, vehicle_number")
    .eq("id", tagId)
    .eq("owner_id", userData.user.id)
    .single();
  if (error || !vehicle) return Response.json({ error: "Vehicle was not found." }, { status: 404 });
  if (!vehicle.subscription) return Response.json({ error: "Enable notifications for this tag first." }, { status: 400 });

  try {
    const result = await sendPush(vehicle.subscription, {
      title: "PingTag notifications are on",
      body: `Test alert for ${vehicle.vehicle_number}. Your phone is ready to receive pings.`,
      url: "/dashboard",
    });
    return Response.json({ ok: true, ...result });
  } catch (pushError) {
    if ([404, 410].includes(pushError.statusCode)) {
      await admin.from("vehicles").update({ subscription: null }).eq("id", tagId);
    }
    return Response.json({ error: pushError.message || "The browser push service rejected this subscription." }, { status: 502 });
  }
}
