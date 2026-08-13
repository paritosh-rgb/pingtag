import crypto from "node:crypto";
import QRCode from "qrcode";
import { cookies } from "next/headers";
import { getSupabase, supabaseConfigured } from "@/lib/supabase";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { listVehicles } from "@/lib/vehicles";

async function getOwner() {
  const token = (await cookies()).get("ping_supabase_token")?.value;
  if (!supabaseConfigured || !token) return null;
  const client = getSupabase(token);
  const { data } = await client.auth.getUser();
  return data.user ? { id: data.user.id, accessToken: token } : null;
}

export async function POST(request) {
  const owner = await getOwner();
  if (!owner) return Response.json({ error: "Please log in." }, { status: 401 });
  const body = await request.json();
  if (!body.vehicleNumber || !body.phoneNumber) return Response.json({ error: "Vehicle number and phone number are required." }, { status: 400 });

  const existing = (await listVehicles(owner)).find((vehicle) => vehicle.isTrial);
  if (existing) return Response.json({ vehicle: existing, existing: true });

  const admin = getSupabaseAdmin();
  const host = request.headers.get("x-forwarded-host") || request.headers.get("host");
  const proto = request.headers.get("x-forwarded-proto") || "https";
  const origin = `${proto}://${host}`;
  const code = `TRIAL-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
  const scanUrl = `${origin}/tag/${code}`;
  const qrDataUrl = await QRCode.toDataURL(scanUrl, { margin: 2, width: 360 });
  const { data: tag, error: tagError } = await admin.from("tags").insert({ code, status: "activated" }).select("id,created_at").single();
  if (tagError) return Response.json({ error: tagError.message }, { status: 400 });
  const { data: vehicle, error: vehicleError } = await admin.from("vehicles").insert({ owner_id: owner.id, vehicle_number: body.vehicleNumber, phone_number: body.phoneNumber, address: body.address || null, society_name: body.societyName || null, flat_number: body.flatNumber || null, tag_id: tag.id, qr_token: code, scan_url: scanUrl, qr_data_url: qrDataUrl }).select().single();
  if (vehicleError) { await admin.from("tags").delete().eq("id", tag.id); return Response.json({ error: vehicleError.message }, { status: 400 }); }
  return Response.json({ vehicle: { id: vehicle.id, vehicleNumber: vehicle.vehicle_number, phoneNumber: vehicle.phone_number, societyName: vehicle.society_name || "", flatNumber: vehicle.flat_number || "", qrToken: code, tagCode: code, scanUrl, qrDataUrl, isTrial: true, trialExpiresAt: new Date(new Date(tag.created_at).getTime() + 14 * 86400000).toISOString(), trialExpired: false } });
}
