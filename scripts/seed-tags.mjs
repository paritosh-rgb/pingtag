import crypto from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";

const amount = Math.max(1, Number(process.argv[2] || 10));
const societyName = String(process.argv[3] || "").trim();
const dataDir = path.join(process.cwd(), "data");
const storePath = path.join(dataDir, "store.json");
await fs.mkdir(dataDir, { recursive: true });
let store = { tags: [], owners: [], inventory: [] };
try { store = { ...store, ...JSON.parse(await fs.readFile(storePath, "utf8")) }; } catch {}
const existing = new Set(store.inventory.map((tag) => tag.code));
const created = [];
while (created.length < amount) {
  const code = `PING-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;
  if (existing.has(code)) continue;
  existing.add(code);
  created.push({ id: `tag_${crypto.randomBytes(5).toString("hex")}`, code, status: "available", societyName, createdAt: new Date().toISOString() });
}
store.inventory.push(...created);
await fs.writeFile(storePath, JSON.stringify(store, null, 2));
console.log(created.map((tag) => tag.code).join("\n"));
