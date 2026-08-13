import QRCode from "qrcode";
import { getAdmin } from "@/lib/admin";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

function needsSocietyMigration(error) {
  return /society_name|schema cache/i.test(error?.message || "");
}

export async function GET(request) {
  const adminUser = await getAdmin();
  if (!adminUser) return Response.json({ error: "Admin access required." }, { status: 403 });
  const supabase = getSupabaseAdmin();
  let { data: tags, error: tagError } = await supabase.from("tags").select("id,code,status,society_name,created_at").order("created_at", { ascending: false });
  let setupRequired = false;
  if (tagError && needsSocietyMigration(tagError)) {
    ({ data: tags, error: tagError } = await supabase.from("tags").select("id,code,status,created_at").order("created_at", { ascending: false }));
    setupRequired = true;
  }
  const [{ data: vehicles, error: vehicleError }, { data: profiles, error: profileError }] = await Promise.all([
    supabase.from("vehicles").select("id,owner_id,tag_id,vehicle_number,phone_number,society_name,flat_number,scan_url,qr_data_url,created_at"),
    supabase.from("profiles").select("id,phone_number"),
  ]);
  if (tagError || vehicleError || profileError) return Response.json({ error: tagError?.message || vehicleError?.message || profileError?.message }, { status: 400 });

  const vehicleByTag = new Map((vehicles || []).map((vehicle) => [vehicle.tag_id, vehicle]));
  const phoneByOwner = new Map((profiles || []).map((profile) => [profile.id, profile.phone_number]));
  const origin = request.headers.get("x-forwarded-host") ? `https://${request.headers.get("x-forwarded-host")}` : new URL(request.url).origin;
  const result = await Promise.all((tags || []).map(async (tag) => {
    const vehicle = vehicleByTag.get(tag.id);
    const scanUrl = vehicle?.scan_url || `${origin}/tag/${tag.code}`;
    return {
      id: tag.id,
      code: tag.code,
      status: tag.status,
      societyName: tag.society_name || "",
      createdAt: tag.created_at,
      scanUrl,
      qrDataUrl: vehicle?.qr_data_url || await QRCode.toDataURL(scanUrl, { margin: 2, width: 260 }),
      vehicle: vehicle ? {
        id: vehicle.id,
        number: vehicle.vehicle_number,
        phoneNumber: vehicle.phone_number,
        ownerPhone: phoneByOwner.get(vehicle.owner_id) || "",
        societyName: vehicle.society_name || "",
        flatNumber: vehicle.flat_number || "",
        createdAt: vehicle.created_at,
      } : null,
    };
  }));
  return Response.json({ tags: result, setupRequired });
}

export async function PATCH(request) {
  const adminUser = await getAdmin();
  if (!adminUser) return Response.json({ error: "Admin access required." }, { status: 403 });
  const body = await request.json();
  const tagId = String(body.tagId || "").trim();
  const societyName = String(body.societyName || "").trim();
  if (!tagId) return Response.json({ error: "Tag is required." }, { status: 400 });
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.from("tags").update({ society_name: societyName || null }).eq("id", tagId).select("id, society_name").single();
  if (error) return Response.json({ error: error.message }, { status: 400 });
  return Response.json({ tag: { id: data.id, societyName: data.society_name || "" } });
}
