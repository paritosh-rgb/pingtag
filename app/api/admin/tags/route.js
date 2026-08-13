import QRCode from "qrcode";
import { getAdmin } from "@/lib/admin";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export async function GET(request) {
  const adminUser = await getAdmin();
  if (!adminUser) return Response.json({ error: "Admin access required." }, { status: 403 });
  const supabase = getSupabaseAdmin();
  const [{ data: tags, error: tagError }, { data: vehicles, error: vehicleError }, { data: profiles, error: profileError }] = await Promise.all([
    supabase.from("tags").select("id,code,status,created_at").order("created_at", { ascending: false }),
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
  return Response.json({ tags: result });
}
