import { cookies } from "next/headers";
import { activateVehicle, listVehicles } from "@/lib/vehicles";
import { getSupabase, supabaseConfigured } from "@/lib/supabase";

async function getOwner(request) {
  const bearer = request.headers.get("authorization")?.replace("Bearer ", "");
  if (supabaseConfigured && bearer) {
    const supabase = getSupabase(bearer);
    const { data } = await supabase.auth.getUser();
    if (data.user) return { id: data.user.id, accessToken: bearer };
  }
  const cookieStore = await cookies();
  const token = cookieStore.get("ping_supabase_token")?.value;
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
  return Response.json({ vehicles: await listVehicles({ ownerId: owner.id, accessToken: owner.accessToken }) });
}

export async function POST(request) {
  const owner = await getOwner(request);
  if (!owner) return Response.json({ error: "Please log in." }, { status: 401 });
  const body = await request.json();
  if (!body.tagCode || !body.vehicleNumber || !body.phoneNumber) return Response.json({ error: "Tag code, vehicle number, and phone number are required." }, { status: 400 });
  const origin = request.headers.get("origin") || new URL(request.url).origin;
  try {
    const vehicle = await activateVehicle({ ...body, ownerId: owner.id, accessToken: owner.accessToken, origin });
    return Response.json({ vehicle });
  } catch (error) {
    return Response.json({ error: error.message || "Could not activate tag." }, { status: 400 });
  }
}
