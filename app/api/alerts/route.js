import { cookies } from "next/headers";
import { getSupabase, supabaseConfigured } from "@/lib/supabase";
import { findTagForOwner } from "@/lib/store";

async function getOwner(request) {
  const bearer = request.headers.get("authorization")?.replace("Bearer ", "");
  const cookieStore = await cookies();
  const token = bearer || cookieStore.get("ping_supabase_token")?.value;
  if (supabaseConfigured && token) {
    const supabase = getSupabase(token);
    const { data } = await supabase.auth.getUser();
    if (data.user) return { id: data.user.id, accessToken: token };
  }
  if (supabaseConfigured) return null;
  const ownerId = cookieStore.get("ping_owner")?.value;
  return ownerId ? { id: ownerId } : null;
}

export async function GET(request) {
  const owner = await getOwner(request);
  if (!owner) return Response.json({ error: "Please log in." }, { status: 401 });
  const vehicleId = new URL(request.url).searchParams.get("vehicleId");
  if (!vehicleId) return Response.json({ error: "Vehicle is required." }, { status: 400 });

  if (supabaseConfigured) {
    const supabase = getSupabase(owner.accessToken);
    const { data, error } = await supabase.from("alerts").select("id, vehicle_id, reason, message, created_at, location_lat, location_lng, location_accuracy").eq("vehicle_id", vehicleId).order("created_at", { ascending: false }).limit(50);
    if (error) return Response.json({ error: error.message }, { status: 400 });
    return Response.json({ alerts: data.map((alert) => ({ id: alert.id, category: alert.reason, message: alert.location_lat == null ? alert.message : `${alert.message} · Approximate location shared`, createdAt: alert.created_at, delivered: true, location: alert.location_lat == null ? null : { latitude: alert.location_lat, longitude: alert.location_lng, accuracy: alert.location_accuracy } })) });
  }

  const tag = await findTagForOwner(vehicleId, owner.id);
  if (!tag) return Response.json({ error: "Vehicle was not found." }, { status: 404 });
  const alerts = (tag.alerts || []).map((alert) => ({ ...alert, delivered: Boolean(tag.subscription) }));
  return Response.json({ alerts: alerts.slice(0, 50) });
}
