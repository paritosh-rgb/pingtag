import crypto from "node:crypto";
import { sendPush } from "@/lib/push";
import { readStore, writeStore } from "@/lib/store";
import { getSupabase, supabaseConfigured } from "@/lib/supabase";
import { findVehicleByToken } from "@/lib/vehicles";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

function isMissingLocationSchema(error) {
  return /location_(label|lat|lng|accuracy|source)|schema cache/i.test(error?.message || "");
}

function isMissingChatSchema(error) {
  return /chat_threads|chat_messages|schema cache/i.test(error?.message || "");
}

export async function POST(request) {
  const body = await request.json();
  const tagId = String(body.tagId || "").trim();
  const token = String(body.token || "").trim();
  const message = String(body.message || "").trim();
  const category = String(body.category || "Heads up").trim();
  const vercelCity = request.headers.get("x-vercel-ip-city");
  const vercelCountry = request.headers.get("x-vercel-ip-country");
  const vercelLat = Number(request.headers.get("x-vercel-ip-latitude"));
  const vercelLng = Number(request.headers.get("x-vercel-ip-longitude"));
  const inputLocation = body.location && Number.isFinite(Number(body.location.latitude)) && Number.isFinite(Number(body.location.longitude))
    ? { location_lat: Number(Number(body.location.latitude).toFixed(3)), location_lng: Number(Number(body.location.longitude).toFixed(3)), location_accuracy: Math.max(0, Math.round(Number(body.location.accuracy) || 0)), location_label: "Device location", location_source: "device" }
    : (vercelCity || vercelCountry ? { location_lat: Number.isFinite(vercelLat) ? Number(vercelLat.toFixed(2)) : null, location_lng: Number.isFinite(vercelLng) ? Number(vercelLng.toFixed(2)) : null, location_accuracy: null, location_label: [vercelCity, vercelCountry].filter(Boolean).join(", "), location_source: "network" } : {});

  if (!tagId || !message) {
    return Response.json(
      { error: "Tag and message are required." },
      { status: 400 },
    );
  }

  if (supabaseConfigured) {
    const vehicle = await findVehicleByToken(token);
    if (!vehicle || vehicle.id !== tagId) return Response.json({ error: "Vehicle was not found." }, { status: 404 });
    if (vehicle.trialExpired) return Response.json({ error: "This free trial has expired." }, { status: 410 });
    const supabase = getSupabaseAdmin();
    if (!supabase) return Response.json({ error: "Server push configuration is incomplete." }, { status: 503 });
    const { data: record, error } = await supabase.from("vehicles").select("subscription").eq("id", tagId).single();
    if (error) return Response.json({ error: error.message }, { status: 400 });
    let { data: alertRecord, error: alertError } = await supabase.from("alerts").insert({ vehicle_id: tagId, reason: category, message, ...inputLocation }).select("id").single();
    if (alertError && isMissingLocationSchema(alertError)) {
      ({ data: alertRecord, error: alertError } = await supabase.from("alerts").insert({ vehicle_id: tagId, reason: category, message }).select("id").single());
    }
    if (alertError) return Response.json({ error: alertError.message }, { status: 400 });
    let chat = null;
    const guestToken = crypto.randomBytes(24).toString("base64url");
    const { data: thread, error: chatError } = await supabase.from("chat_threads").insert({ alert_id: alertRecord.id, vehicle_id: tagId, guest_token: guestToken }).select("id,expires_at").single();
    if (!chatError) chat = { threadId: thread.id, token: guestToken, expiresAt: thread.expires_at };
    if (chatError && !isMissingChatSchema(chatError)) return Response.json({ error: chatError.message }, { status: 400 });
    if (!record.subscription) return Response.json({ ok: true, delivered: false, reason: "The owner has not enabled browser notifications yet.", chat });
    try {
      const result = await sendPush(record.subscription, { title: `ParkPing: ${category}`, body: message, url: "/dashboard" });
      return Response.json({ ok: true, ...result, chat });
    } catch (error) {
      // A 404/410 means the browser subscription is permanently invalid.
      if ([404, 410].includes(error.statusCode)) {
        await supabase.from("vehicles").update({ subscription: null }).eq("id", tagId);
      }
      return Response.json({ ok: true, delivered: false, reason: error.message || "Push delivery failed.", chat }, { status: 202 });
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
    ...(inputLocation.location_label ? { location: { label: inputLocation.location_label, source: inputLocation.location_source, latitude: inputLocation.location_lat, longitude: inputLocation.location_lng, accuracy: inputLocation.location_accuracy } } : {}),
  };

  const chat = { threadId: alert.id, token: crypto.randomBytes(24).toString("base64url"), expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString() };
  alert.chat = chat;

  tag.alerts.unshift(alert);
  tag.alerts = tag.alerts.slice(0, 25);
  await writeStore(store);

  if (!tag.subscription) {
    return Response.json({
      ok: true,
      delivered: false,
      reason: "The owner has not enabled browser notifications yet.",
      chat,
    });
  }

  try {
    const result = await sendPush(tag.subscription, {
      title: `ParkPing: ${category}`,
      body: message,
      url: "/dashboard",
    });

    return Response.json({ ok: true, ...result, chat });
  } catch (error) {
    return Response.json(
      {
        ok: true,
        delivered: false,
        reason: error.message || "Push delivery failed.",
        chat,
      },
      { status: 202 },
    );
  }
}
