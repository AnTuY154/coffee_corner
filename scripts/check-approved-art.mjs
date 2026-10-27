import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const required = process.argv.includes("--required");
const art = resolve("public/art/canonical");
const manifestPath = resolve(art, "manifest.json");
if (!existsSync(manifestPath)) {
  if (required) throw new Error("Missing 4-source manifest");
  console.warn("Canonical art not yet installed");
  process.exit(0);
}
const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
const expected = {
  shop: [1672, 941], employee: [1086, 1448],
  dog: [1254, 1254], cat: [1254, 1254],
};
function dimensions(buffer) {
  assert.equal(buffer.toString("ascii", 0, 4), "RIFF");
  assert.equal(buffer.toString("ascii", 8, 12), "WEBP");
  const chunk = buffer.toString("ascii", 12, 16);
  if (chunk === "VP8X") return [1 + buffer.readUIntLE(24, 3), 1 + buffer.readUIntLE(27, 3)];
  if (chunk === "VP8 ") return [buffer.readUInt16LE(26) & 0x3fff, buffer.readUInt16LE(28) & 0x3fff];
  throw new Error("Unsupported WebP chunk: " + chunk);
}
assert.deepEqual(Object.keys(manifest.images).sort(), Object.keys(expected).sort(),
  "Exactly four approved image sources are permitted");
for (const [name, size] of Object.entries(expected)) {
  const file = resolve(art, name + ".webp");
  if (!existsSync(file)) {
    if (required) throw new Error("Missing canonical source: " + name);
    console.warn("Not installed:", name);
    continue;
  }
  const raw = readFileSync(file);
  assert(raw.length >= 80_000, "Suspiciously small image: " + name);
  assert.deepEqual(dimensions(raw), size, "Wrong scene/character size: " + name);
  const hash = createHash("sha256").update(raw).digest("hex");
  assert.equal(hash, manifest.images[name].canonicalWebP_SHA256, "Source changed without approval: " + name);
  if (name !== "shop") {
    assert.equal(raw.toString("ascii", 12, 16), "VP8X", "Character must use alpha-enabled WebP: " + name);
    assert((raw[20] & 0x10) !== 0, "Missing transparent background: " + name);
  }
  console.log("OK canonical source", name, size.join("x"), hash.slice(0, 12));
}
console.log("PASS: only the four approved source illustrations are required at runtime.");
