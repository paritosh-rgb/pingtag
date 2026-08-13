import { cookies } from "next/headers";
import { makeId, readStore, writeStore } from "@/lib/store";
import { supabaseConfigured } from "@/lib/supabase";

export async function POST(request) {
  if (supabaseConfigured) return Response.json({ error: "Supabase authentication is enabled. Use the Supabase login form." }, { status: 400 });
  const body = await request.json();
  const mode = body.mode === "login" ? "login" : "register";
  const phoneNumber = String(body.phoneNumber || "").trim();
  const password = String(body.password || "");

  if (!phoneNumber || password.length < 6) {
    return Response.json({ error: "Enter a phone number and a password of at least 6 characters." }, { status: 400 });
  }

  const store = await readStore();
  let owner = store.owners.find((item) => item.phoneNumber === phoneNumber);

  if (mode === "register") {
    if (owner) return Response.json({ error: "An account already exists for this phone number." }, { status: 409 });
    owner = { id: makeId("owner"), phoneNumber, password };
    store.owners.push(owner);
    await writeStore(store);
  } else if (!owner || owner.password !== password) {
    return Response.json({ error: "Phone number or password is incorrect." }, { status: 401 });
  }

  const cookieStore = await cookies();
  cookieStore.set("ping_owner", owner.id, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/" });
  return Response.json({ owner: { id: owner.id, phoneNumber: owner.phoneNumber } });
}

export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.delete("ping_owner");
  return Response.json({ ok: true });
}
