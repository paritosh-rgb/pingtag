import { getPublicVapidKey } from "@/lib/push";
import { readStore, writeStore } from "@/lib/store";
import { getSupabase, supabaseConfigured } from "@/lib/supabase";
import { rateLimit, readJson, sameOrigin, tooManyRequests } from "@/lib/security";

export async function GET() {
  return Response.json({ publicKey: getPublicVapidKey() });
}

export async function POST(request) {
  if (!sameOrigin(request)) return Response.json({ error: "Invalid request origin." }, { status: 403 });
  const retryAfter = rateLimit(request, "subscribe", 12, 60_000);
  if (retryAfter) return tooManyRequests(retryAfter);
  const body = await readJson(request);
  if (!body) return Response.json({ error: "Invalid request body." }, { status: 400 });
  const { tagId, ownerKey, subscription } = body;

  if (!tagId || !subscription || (!ownerKey && !supabaseConfigured)) {
    return Response.json(
      { error: "Tag, owner key, and subscription are required." },
      { status: 400 },
    );
  }

  if (supabaseConfigured) {
    const bearer = request.headers.get("authorization")?.replace("Bearer ", "") || (await (await import("next/headers")).cookies()).get("ping_supabase_token")?.value;
    if (!bearer) return Response.json({ error: "Please log in with your Supabase account." }, { status: 401 });
    const supabase = getSupabase(bearer);
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return Response.json({ error: "Please log in again." }, { status: 401 });
    const { data, error } = await supabase.from("vehicles").update({ subscription }).eq("id", tagId).eq("owner_id", userData.user.id).select("id").maybeSingle();
    if (error) return Response.json({ error: error.message }, { status: 400 });
    if (!data) return Response.json({ error: "Tag was not found." }, { status: 404 });
    return Response.json({ ok: true });
  }

  const store = await readStore();
  const tag = store.tags.find((item) => item.id === tagId);

  if (!tag || tag.ownerKey !== ownerKey) {
    return Response.json({ error: "Tag was not found." }, { status: 404 });
  }

  tag.subscription = subscription;
  tag.subscribedAt = new Date().toISOString();
  await writeStore(store);

  return Response.json({ ok: true });
}
