import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { ActorsDirector, ARTBOARD } from "../components/2d-shop/actors-director.ts";
import { deformVertices } from "../components/2d-shop/deform-rig.ts";

assert.deepEqual(ARTBOARD, { width: 1672, height: 941 });
const d = new ActorsDirector();
const start = d.step(0);
assert.equal(start.worker.behindCounter, true);
assert.equal(start.worker.action, "wave");
assert.equal(start.worker.y, 697);
let sawMovement = false, sawIdle = false;
let last = start;
for (let i=0;i<250;i++) {
  const now = d.step(.05);
  assert(now.dog.x >= 330 && now.dog.x <= 650, "dog stays on the patio");
  assert(now.cat.x >= 1300 && now.cat.x <= 1550, "cat stays on the patio");
  assert(Math.abs(now.dog.x-last.dog.x) < 3, "dog motion is not a teleport");
  assert(Math.abs(now.cat.x-last.cat.x) < 3, "cat motion is not a teleport");
  if (now.dog.mood === "walk") sawMovement = true;
  if (now.dog.mood === "idle") sawIdle = true;
  last = now;
}
assert(sawMovement && sawIdle, "dog must have both locomotion and rest cycles");

d.request("dog");
d.request("cat");
let metDog = false, metCat = false, returned = false;
let previousPhase = "";
for (let i=0;i<900;i++) {
  const p = d.step(.05);
  if (p.phase === "petting") {
    if (p.target === "dog") { metDog = true; assert.equal(p.dog.mood, "happy"); assert.equal(p.worker.action, "pet"); }
    if (p.target === "cat") { metCat = true; assert.equal(p.cat.mood, "happy"); assert.equal(p.worker.action, "pet"); }
  }
  if (p.phase === "idle" && previousPhase === "returning") { returned = true; assert(p.worker.behindCounter); }
  previousPhase = p.phase;
  if (metDog && metCat && returned) break;
}
assert(metDog && metCat && returned, "queued pet greetings complete and employee returns home");
const reduced = new ActorsDirector();
reduced.request("dog");
for (let i=0;i<20;i++) {
  const p=reduced.step(.05,true);
  assert.equal(p.phase,"idle");
  assert.equal(p.worker.action,"idle");
}
const original = new Float32Array([0,0,50,50,100,75,120,100]);
const idle = new Float32Array(original);
const moving = new Float32Array(original);
deformVertices(original, idle, 120, 100, { gait:0, speed:0, seconds:0, motion:"idle" }, "dog");
deformVertices(original, moving, 120, 100, { gait:Math.PI/2, speed:30, seconds:0, motion:"walk" }, "dog");
assert.notDeepEqual([...idle],[...moving],"paw mesh must deform with distance-driven gait");
assert.deepEqual([...original],[0,0,50,50,100,75,120,100],"deformations never mutate the canonical source geometry");
const render=readFileSync("components/2d-shop/pets-world.tsx","utf8");
assert.match(render,/MeshPlane/);
assert.match(render,/canonical\/dog\.webp/);
assert.match(render,/canonical\/cat\.webp/);
assert.match(render,/canonical\/employee\.webp/);
assert.doesNotMatch(render,/pets\/dog-walk\.png|actors\/anime\/idle\.webp/);
assert.match(render,/behindCounter \? counterMask/);
console.log("PASS canonical rigs, walking dynamics, synchronized petting, queued visits, counter masking, reduced motion");