import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { resolve } from "node:path";
const base=resolve("public/pixel-shop/reference");
const required=process.argv.includes("--required");
const scene=resolve(base,"scene.webp");
if(!existsSync(scene)){
  console.log("SKIP reference scene: assets missing; Kenney fallback remains active.");
  if(required)process.exitCode=1;
}else{
  const expected=[
    "roof-sign","canopy","menu-board","fruit-display","counter-front",
    "table-left","table-center","table-right","table-back-left",
    "table-back-right","tree-canopy-left","tree-canopy-right"
  ];
  for(const item of ["scene",...expected]){
    const p=resolve(base,item+".webp");
    assert(existsSync(p), "Missing reference sprite "+item);
    const bytes=readFileSync(p);
    assert(bytes.subarray(0,4).toString()==="RIFF" &&
      bytes.subarray(8,12).toString()==="WEBP","Invalid WebP: "+item);
    assert(bytes.length>400,"Empty sprite "+item);
  }
  const manifest=JSON.parse(readFileSync(resolve(base,"manifest.json"),"utf8"));
  assert.deepEqual(manifest.world,{width:480,height:320});
  assert.equal(Object.keys(manifest.layers).length,12);
  assert.equal(manifest.hotspots.length,4);
  assert.equal(createHash("sha256").update(readFileSync(scene)).digest("hex"),
    "6fa4e926d5bd884355c5dd447c3720aa53377f2840f44aadb3153ffbb9d79f32");
  console.log("PASS reference scene 480x320, 12 alpha layers, 4 hotspots, WebP and SHA256.");
}
