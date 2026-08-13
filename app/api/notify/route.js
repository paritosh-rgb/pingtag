import { sendPush } from "@/lib/push";
import { readStore, writeStore } from "@/lib/store";
import { getSupabase, supabaseConfigured } from "@/lib/supabase";
import { findVehicleByToken } from "@/lib/vehicles";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export async function POST(request) {
  const body = await request.json();
  const tagId = String(body.tagId || "").trim();
  const token = String(body.token || "").trim();
  const message = String(body.message || "").trim();
  const category = String(body.category || "Heads up").trim();

  if (!tagId || !message) {
    return Response.json(
      { error: "Tag and message are required." },
      { status: 400 },
    );
  }

  if (supabaseConfigured) {
    const vehicle = await findVehicleByToken(token);
    if (!vehicle || vehicle.id !== tagId) return Response.json({ error: "Vehicle was not found." }, { status: 404 });
    const supabase = getSupabaseAdmin();
    if (!supabase) return Response.json({ error: "Server push configuration is incomplete." }, { status: 503 });
    const { data: record, error } = await supabase.from("vehicles").select("subscription").eq("id", tagId).single();
    if (error) return Response.json({ error: error.message }, { status: 400 });
    const { error: alertError } = await supabase.from("alerts").insert({ vehicle_id: tagId, reason: category, message });
    if (alertError) return Response.json({ error: alertError.message }, { status: 400 });
    if (!record.subscription) return Response.json({ ok: true, delivered: false, reason: "The owner has not enabled browser notifications yet." });
    try {
      const result = await sendPush(record.subscription, { title: `PingTag: ${category}`, body: message, url: "/dashboard" });
      return Response.json({ ok: true, ...result });
    } catch (error) {
      // A 404/410 means the browser subscription is permanently invalid.
      if ([404, 410].includes(error.statusCode)) {
        await supabase.from("vehicles").update({ subscription: null }).eq("id", tagId);
      }
      return Response.json({ ok: true, delivered: false, reason: error.message || "Push delivery failed." }, { status: 202 });
    }
  }

  const store = await readStore();
  const tag = store.tags.find((item) => item.id === tagId);

  if (!tag) {
    return Response.json({ error: "Tag was not found." }, { status: 404 });
  }

  const alert = {
    id: `${Date.now()}`,
    category,
    message,
    createdAt: new Date().toISOString(),
  };

  tag.alerts.unshift(alert);
  tag.alerts = tag.alerts.slice(0, 25);
  await writeStore(store);

  if (!tag.subscription) {
    return Response.json({
      ok: true,
      delivered: false,
      reason: "The owner has not enabled browser notifications yet.",
    });
  }

  try {
    const result = await sendPush(tag.subscription, {
      title: `PingTag: ${category}`,
      body: message,
      url: "/dashboard",
    });

    return Response.json({ ok: true, ...result });
  } catch (error) {
    return Response.json(
      {
        ok: true,
        delivered: false,
        reason: error.message || "Push delivery failed.",
      },
      { status: 202 },
    );
  }
}
