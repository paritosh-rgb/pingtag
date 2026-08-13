import QRCode from "qrcode";
import { getSupabase, supabaseConfigured } from "@/lib/supabase";
import { findInventoryTag, findTag, makeId, readStore, writeStore } from "@/lib/store";

function publicVehicle(vehicle) {
  const qrToken = vehicle.qr_token || vehicle.id;
  const isTrial = qrToken.startsWith("TRIAL-");
  const trialExpiresAt = vehicle.trial_expires_at || vehicle.tags?.created_at ? new Date(new Date(vehicle.tags?.created_at || vehicle.created_at).getTime() + 14 * 86400000).toISOString() : null;
  return {
    id: vehicle.id,
    vehicleNumber: vehicle.vehicle_number || vehicle.vehicleNumber,
    societyName: vehicle.society_name || vehicle.societyName || "",
    flatNumber: vehicle.flat_number || vehicle.flatNumber || "",
    qrToken,
    tagCode: vehicle.code || vehicle.tag_code || vehicle.qr_token || vehicle.id,
    scanUrl: vehicle.scan_url || vehicle.scanUrl,
    qrDataUrl: vehicle.qr_data_url || vehicle.qrDataUrl,
    isTrial,
    trialExpiresAt: isTrial ? trialExpiresAt : null,
    trialExpired: isTrial && trialExpiresAt ? new Date(trialExpiresAt) < new Date() : false,
  };
}

export async function activateVehicle({ accessToken, ownerId, origin, tagCode, ...input }) {
  const qrToken = tagCode.trim().toUpperCase();
  const scanUrl = `${origin}/tag/${qrToken}`;
  const qrDataUrl = await QRCode.toDataURL(scanUrl, { margin: 2, width: 320 });

  if (supabaseConfigured) {
    const supabase = getSupabase(accessToken);
    const { data: tag, error: tagError } = await supabase.from("tags").select("id, code, status").eq("code", qrToken).single();
    if (tagError || !tag || tag.status !== "available") throw new Error("That tag code is invalid or already activated.");
    const { data, error } = await supabase.from("vehicles").insert({
        owner_id: ownerId,
        vehicle_number: input.vehicleNumber,
        phone_number: input.phoneNumber,
        address: input.address || null,
        society_name: input.societyName || null,
        flat_number: input.flatNumber || null,
        tag_id: tag.id,
        qr_token: tag.code,
        scan_url: scanUrl,
        qr_data_url: qrDataUrl,
      })
      .select()
      .single();
    if (error) throw error;
    const { error: statusError } = await supabase.from("tags").update({ status: "activated" }).eq("id", tag.id).eq("status", "available");
    if (statusError) throw statusError;
    return { ...publicVehicle({ ...data, qr_data_url: qrDataUrl }), scanUrl, qrDataUrl, phoneNumber: input.phoneNumber, address: input.address || "" };
  }

  const store = await readStore();
  const inventoryTag = await findInventoryTag(qrToken);
  if (!inventoryTag || inventoryTag.status !== "available") throw new Error("That tag code is invalid or already activated.");
  const tag = {
    id: qrToken,
    tagCode: qrToken,
    ownerKey: ownerId,
    ownerName: input.ownerName || "Vehicle owner",
    vehicleNumber: input.vehicleNumber,
    phoneNumber: input.phoneNumber,
    address: input.address || "",
    societyName: input.societyName || "",
    flatNumber: input.flatNumber || "",
    contactPreference: "push",
    scanUrl,
    qrDataUrl,
    subscription: null,
    alerts: [],
  };
  store.tags.push(tag);
  inventoryTag.status = "activated";
  await writeStore(store);
  return { ...tag, phoneNumber: tag.phoneNumber, address: tag.address };
}

export async function findVehicleByToken(token) {
  if (supabaseConfigured) {
    const supabase = getSupabase();
    const { data, error } = await supabase.from("public_vehicle_tags").select("*").eq("qr_token", token).single();
    if (error) return null;
    const { data: tag } = await supabase.from("tags").select("created_at").eq("code", token).single();
    return publicVehicle({ ...data, tags: tag });
  }
  return findTag(token);
}

export async function findPrintedTag(token) {
  if (supabaseConfigured) {
    const supabase = getSupabase();
    const { data } = await supabase.from("tags").select("code, status").eq("code", token.toUpperCase()).single();
    return data;
  }
  return findInventoryTag(token);
}

export async function listVehicles({ accessToken, ownerId }) {
  if (supabaseConfigured) {
    const supabase = getSupabase(accessToken);
    const { data, error } = await supabase.from("vehicles").select("*").eq("owner_id", ownerId).order("created_at", { ascending: false });
    if (error) throw error;
    const tagIds = data.map((vehicle) => vehicle.tag_id).filter(Boolean);
    const { data: tags } = await supabase.from("tags").select("id,created_at").in("id", tagIds);
    const tagById = new Map((tags || []).map((tag) => [tag.id, tag]));
    return data.map((vehicle) => publicVehicle({ ...vehicle, tags: tagById.get(vehicle.tag_id) }));
  }
  const store = await readStore();
  return store.tags.filter((tag) => tag.ownerKey === ownerId);
}
