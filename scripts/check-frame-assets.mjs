import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import assert from "node:assert/strict";

const base = resolve("public/art");
const expected = {
  employee: { idle:6, wave:6, talk:6, run:12, walk:8, pet_dog:8, pet_cat:8, prepare:6 },
  dog: { idle:6, walk:8, run:12, happy:8, jump:8, nap:6 },
  cat: { idle:6, walk:8, run:8, happy:8, jump:8, nap:6, groom:8 }
};
const manifestPath = resolve(base,"manifest.json");
assert(existsSync(manifestPath), "Missing public/art/manifest.json — reviewed frame pack is not installed.");
const manifest = JSON.parse(readFileSync(manifestPath,"utf8"));
assert(manifest.approved && typeof manifest.approved === "object",
  "Frame counts alone are not approval; manifest.approved is required after visual review.");
let total=0;
for (const [who, actions] of Object.entries(expected)) {
 for (const [action,count] of Object.entries(actions)) {
  assert.equal(manifest.approved[who]?.[action],count,`Unreviewed or incomplete frames: ${who}/${action}`);
  for(let i=0;i<count;i++) {
   const path=resolve(base,"frames",who,action,String(i).padStart(2,"0")+".webp");
   assert(existsSync(path),`Missing frame ${path}`);
   total++;
  }
 }
}
console.log(`PASS: ${total} reviewed Vườn É animation frame paths installed.`);
