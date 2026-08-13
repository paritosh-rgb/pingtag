import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";

const dataDir = path.join(process.cwd(), "data");
const storePath = path.join(dataDir, "store.json");

async function ensureStore() {
  await fs.mkdir(dataDir, { recursive: true });
  try {
    await fs.access(storePath);
  } catch {
    await fs.writeFile(storePath, JSON.stringify({ tags: [], owners: [], inventory: [] }, null, 2));
  }
}

export async function readStore() {
  await ensureStore();
  const raw = await fs.readFile(storePath, "utf8");
  const store = JSON.parse(raw);
  return { tags: [], owners: [], inventory: [], ...store };
}

export async function writeStore(store) {
  await ensureStore();
  await fs.writeFile(storePath, JSON.stringify(store, null, 2));
}

export function makeId(prefix) {
  return `${prefix}_${crypto.randomBytes(5).toString("hex")}`;
}

export async function findTag(tagId) {
  const store = await readStore();
  return store.tags.find((tag) => tag.id === tagId) || null;
}

export async function findTagForOwner(tagId, ownerKey) {
  const tag = await findTag(tagId);
  return tag && tag.ownerKey === ownerKey ? tag : null;
}

export async function findInventoryTag(code) {
  const store = await readStore();
  return store.inventory.find((tag) => tag.code.toLowerCase() === code.toLowerCase()) || null;
}
