import fs from "node:fs";
import assert from "node:assert/strict";
import crypto from "node:crypto";
for (const [file,folder] of [["kenney-tiny-farm.png","tiny-farm"],["kenney-tiny-town.png","tiny-town"]]) {
  const png=fs.readFileSync(new URL("../public/pixel-shop/atlases/"+file,import.meta.url));
  assert.equal(png.subarray(0,8).toString("hex"),"89504e470d0a1a0a",file+" PNG");
  assert.equal(png.readUInt32BE(16),176,file+" width");
  assert.equal(png.readUInt32BE(20),192,file+" height");
  assert.ok(png.length<65536,file+" file size");
  const license=fs.readFileSync(new URL("../third_party/pixel-art/kenney/"+folder+"/LICENSE.txt",import.meta.url),"utf8");
  assert.match(license,/CC0/i);
  console.log(file,png.length,"bytes, SHA-256",crypto.createHash("sha256").update(png).digest("hex"));
}
