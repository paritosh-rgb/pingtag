import { cookies } from "next/headers";
import { getSupabase, supabaseConfigured } from "@/lib/supabase";
import { findTagForOwner } from "@/lib/store";

const ALERT_COLUMNS = "id, vehicle_id, reason, message, created_at";
const ALERT_LOCATION_COLUMNS = `${ALERT_COLUMNS}, location_lat, location_lng, location_accuracy, location_label, location_source`;

function isMissingLocationSchema(error) {
  return /location_(label|lat|lng|accuracy|source)|schema cache/i.test(error?.message || "");
}

function isMissingChatSchema(error) {
  return /chat_threads|schema cache/i.test(error?.message || "");
}

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
    let { data, error } = await supabase.from("alerts").select(ALERT_LOCATION_COLUMNS).eq("vehicle_id", vehicleId).order("created_at", { ascending: false }).limit(50);
    if (error && isMissingLocationSchema(error)) {
      ({ data, error } = await supabase.from("alerts").select(ALERT_COLUMNS).eq("vehicle_id", vehicleId).order("created_at", { ascending: false }).limit(50));
    }
    if (error) return Response.json({ error: error.message }, { status: 400 });
    let threads = [];
    let chatError = null;
    if (data?.length) {
      ({ data: threads, error: chatError } = await supabase.from("chat_threads").select("id,alert_id,expires_at").in("alert_id", data.map((alert) => alert.id)));
    }
    const threadByAlert = new Map((threads || []).map((thread) => [thread.alert_id, thread]));
    return Response.json({ alerts: data.map((alert) => { const thread = threadByAlert.get(alert.id); return { id: alert.id, category: alert.reason, message: alert.location_label ? `${alert.message} · Scan location: ${alert.location_label}` : alert.message, createdAt: alert.created_at, delivered: true, location: alert.location_label ? { label: alert.location_label, source: alert.location_source, latitude: alert.location_lat, longitude: alert.location_lng, accuracy: alert.location_accuracy } : null, chatThreadId: chatError && !isMissingChatSchema(chatError) ? null : thread?.id || null, chatExpiresAt: thread?.expires_at || null }; } ) });
  }

  const tag = await findTagForOwner(vehicleId, owner.id);
  if (!tag) return Response.json({ error: "Vehicle was not found." }, { status: 404 });
  const alerts = (tag.alerts || []).map((alert) => ({ ...alert, delivered: Boolean(tag.subscription), chatThreadId: alert.chat?.threadId || alert.id, chatToken: alert.chat?.token || null, chatExpiresAt: alert.chat?.expiresAt || null }));
  return Response.json({ alerts: alerts.slice(0, 50) });
}
