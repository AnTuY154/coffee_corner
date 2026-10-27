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
  "pets/dog-walk.png",
  "pets/cat-walk.png",
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
  "pets/dog-walk.png": [1920, 160],
  "pets/cat-walk.png": [1920, 160],
};
for (const f of files) {
  const path = resolve(art, f);
  assert.deepEqual(dimensions(path), expected[f], f + " has wrong artboard/sprite dimensions");
  assert(statSync(path).size > 5000, "Suspiciously small asset " + f);
  console.log("OK", f, dimensions(path).join("x"), statSync(path).size, "bytes");
}
console.log("PASS: eleven approved-art assets, including two genuine frame sheets present and have correct dimensions.");

/*
 * The employee must not be a crop of the painting. The new puppet consists
 * of three genuinely transparent SVG assets, with separate arms and legs.
 */
for (const name of ["clerk-body.svg", "clerk-arm.svg", "clerk-leg.svg"]) {
  const actorFile = resolve(art, "actors", name);
  if (!existsSync(actorFile)) {
    if (required) throw new Error("Missing transparent character part: " + actorFile);
    console.warn("ART PENDING: " + actorFile);
    continue;
  }
  const xml = readFileSync(actorFile, "utf8");
  assert.match(xml, /<svg[^>]*viewBox=/, name + " must have a consistent vector artboard");
  assert.doesNotMatch(xml, /<image|<foreignObject|data:image/i, name + " must not embed background bitmap pixels");
}

// Signed-off employee design: five distinct transparent 540x720 WebP poses.
// Keep them separate from the fixed shop painting, and fail strict CI if any
// file is missing or accidentally swapped for an empty/flattened export.
for (const pose of ["idle", "wave", "run", "pet-dog", "pet-cat"]) {
  const name = `actors/anime/${pose}.webp`;
  const file = resolve(art, name);
  if (!existsSync(file)) {
    if (required) throw new Error("Missing approved character pose: " + name);
    console.warn("ART PENDING: " + name);
    continue;
  }
  const bytes = readFileSync(file);
  assert.deepEqual(dimensions(file), [540, 720], name + " dimensions must stay consistent");
  assert(bytes.length >= 25_000, name + " image appears empty/corrupted");
  // WebP RGBA container normally uses VP8X plus ALPH image chunks.
  assert.equal(bytes.toString("ascii", 0, 4), "RIFF");
  assert.equal(bytes.toString("ascii", 8, 12), "WEBP");
  assert.equal(bytes.toString("ascii", 12, 16), "VP8X", name + " must keep transparency");
  assert((bytes[20] & 0x10) !== 0, name + " is missing alpha transparency");
  console.log("OK anime employee", name, bytes.length, "bytes");
}
