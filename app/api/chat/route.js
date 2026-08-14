import { cookies } from "next/headers";
import { getSupabase, supabaseConfigured } from "@/lib/supabase";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

function cleanMessage(value) {
  return String(value || "").trim().slice(0, 500);
}

async function getOwner() {
  if (!supabaseConfigured) return null;
  const token = (await cookies()).get("ping_supabase_token")?.value;
  if (!token) return null;
  const client = getSupabase(token);
  const { data } = await client.auth.getUser();
  return data.user ? { id: data.user.id, accessToken: token } : null;
}

async function getThread({ threadId, guestToken, ownerId }) {
  const admin = getSupabaseAdmin();
  if (!admin) return { error: "Chat service is not configured." };
  let query = admin.from("chat_threads").select("id, alert_id, vehicle_id, guest_token, expires_at");
  if (guestToken) query = query.eq("guest_token", guestToken);
  else if (threadId) query = query.eq("id", threadId);
  else return { error: "Chat thread is required." };
  const { data: thread, error } = await query.single();
  if (error || !thread) return { error: "This private chat is no longer available." };
  if (new Date(thread.expires_at) <= new Date()) return { error: "This private chat has expired." };
  if (ownerId) {
    const { data: vehicle } = await admin.from("vehicles").select("owner_id").eq("id", thread.vehicle_id).single();
    if (!vehicle || vehicle.owner_id !== ownerId) return { error: "You cannot access this chat." };
  }
  return { admin, thread };
}

export async function GET(request) {
  const url = new URL(request.url);
  const guestToken = url.searchParams.get("token")?.trim();
  const threadId = url.searchParams.get("threadId")?.trim();
  const owner = await getOwner();
  const result = await getThread({ threadId, guestToken, ownerId: owner?.id });
  if (result.error) return Response.json({ error: result.error }, { status: 403 });
  const { data: messages, error } = await result.admin.from("chat_messages").select("id,sender,body,created_at").eq("thread_id", result.thread.id).order("created_at", { ascending: true }).limit(100);
  if (error) return Response.json({ error: error.message }, { status: 400 });
  return Response.json({ thread: { id: result.thread.id, expiresAt: result.thread.expires_at }, messages: (messages || []).map((item) => ({ id: item.id, sender: item.sender, body: item.body, createdAt: item.created_at })) }, { headers: { "Cache-Control": "no-store, max-age=0" } });
}

export async function POST(request) {
  const body = await request.json();
  const message = cleanMessage(body.message);
  if (!message) return Response.json({ error: "Message is required." }, { status: 400 });
  const owner = await getOwner();
  const guestToken = String(body.token || "").trim();
  const result = await getThread({ threadId: body.threadId, guestToken, ownerId: owner?.id });
  if (result.error) return Response.json({ error: result.error }, { status: 403 });
  const sender = owner ? "owner" : guestToken ? "scanner" : null;
  if (!sender) return Response.json({ error: "Chat access is required." }, { status: 401 });
  const { data: recent } = await result.admin.from("chat_messages").select("id").eq("thread_id", result.thread.id).eq("sender", sender).gte("created_at", new Date(Date.now() - 2000).toISOString()).limit(1);
  if (recent?.length) return Response.json({ error: "Please wait a moment before sending another message." }, { status: 429 });
  const { data, error } = await result.admin.from("chat_messages").insert({ thread_id: result.thread.id, sender, body: message }).select("id,sender,body,created_at").single();
  if (error) return Response.json({ error: error.message }, { status: 400 });
  return Response.json({ message: { id: data.id, sender: data.sender, body: data.body, createdAt: data.created_at } });
}
