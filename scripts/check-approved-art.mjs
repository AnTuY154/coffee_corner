import assert from "node:assert/strict";
import { existsSync, readFileSync, statSync } from "node:fs";
import { resolve } from "node:path";

const required = process.argv.includes("--required");
const art = resolve("public/art");
const files = [
  "vuon-e-original-composition.webp",
  "vuon-e-approved-clean.webp",
  "layers/clerk.png",
  "layers/dog.png",
  "layers/cat.png",
  "layers/clerk-body.png",
  "layers/clerk-arm.png",
  "layers/dog-tight.png",
  "layers/cat-tight.png",
];
const missing = files.filter(f => !existsSync(resolve(art, f)));
if (missing.length) {
  const msg = `Missing approved art: ${missing.join(", ")}. Scene will fall back to the intact composition, or the legacy SVG if no composition is present.`;
  if (required) throw new Error(msg);
  console.warn("ART PENDING: " + msg);
  process.exit(0);
}
function dimensions(file) {
  const buffer = readFileSync(file);
  if (buffer.toString("ascii", 0, 4) === "RIFF" && buffer.toString("ascii", 8, 12) === "WEBP") {
    const chunk = buffer.toString("ascii", 12, 16);
    if (chunk === "VP8 ") {
      assert.equal(buffer[23], 0x9d);
      assert.equal(buffer[24], 0x01);
      assert.equal(buffer[25], 0x2a);
      return [buffer.readUInt16LE(26) & 0x3fff, buffer.readUInt16LE(28) & 0x3fff];
    }
    if (chunk === "VP8X") return [1 + buffer.readUIntLE(24, 3), 1 + buffer.readUIntLE(27, 3)];
    if (chunk === "VP8L") return [
      1 + (((buffer[22] & 0x3f) | ((buffer[23] & 0x3f) << 6))),
      1 + (((buffer[23] >> 6) | (buffer[24] << 2) | ((buffer[25] & 0xf) << 10))),
    ];
    throw new Error("Unsupported WebP format: " + chunk);
  }
  assert.equal(buffer.toString("hex", 0, 8), "89504e470d0a1a0a", "Invalid PNG header");
  return [buffer.readUInt32BE(16), buffer.readUInt32BE(20)];
}
const expected = {
  "vuon-e-original-composition.webp": [1536, 1024],
  "vuon-e-approved-clean.webp": [1536, 1024],
  "layers/clerk.png": [205, 195],
  "layers/dog.png": [215, 125],
  "layers/cat.png": [180, 130],
  "layers/clerk-body.png": [205, 195],
  "layers/clerk-arm.png": [205, 195],
  "layers/dog-tight.png": [215, 125],
  "layers/cat-tight.png": [180, 130],
};
for (const f of files) {
  const path = resolve(art, f);
  assert.deepEqual(dimensions(path), expected[f], f + " has wrong artboard/sprite dimensions");
  assert(statSync(path).size > 5000, "Suspiciously small asset " + f);
  console.log("OK", f, dimensions(path).join("x"), statSync(path).size, "bytes");
}
console.log("PASS: nine real approved-art assets present and have correct dimensions.");
