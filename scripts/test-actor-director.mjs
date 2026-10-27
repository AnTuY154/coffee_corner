import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { ActorsDirector } from "../components/2d-shop/actors-director.ts";

const director = new ActorsDirector();
const initial = director.step(0);
assert.equal(initial.phase, "idle");
assert.equal(initial.worker.action, "wave");
assert.equal(initial.dog.mood, "idle");
assert.equal(initial.cat.mood, "idle");

director.request("dog");
assert.equal(director.phase, "outbound");
let pettingStarted = false, returned = false, elapsed = 0;
for (let n = 0; n < 1000; n++) {
  const frame = director.step(.05);
  elapsed += .05;
  if (frame.phase === "petting") {
    pettingStarted = true;
    assert.equal(frame.target, "dog");
    assert.equal(frame.dog.mood, "happy", "dog must react on the same tick as the worker");
    // Worker switches to the pet pose on the first tick after arrival.
    if (elapsed > 0) assert(frame.worker.x > 400, "employee moved to dog");
  }
  if (pettingStarted && frame.phase === "idle") { returned = true; break; }
}
assert(pettingStarted, "dog greeting occurs");
assert(returned, "employee returns behind the counter");
assert(elapsed < 30, "complete action within expected duration");

const other = new ActorsDirector();
other.request("cat");
let catPetting = false;
for (let n = 0; n < 450; n++) {
  const frame = other.step(.05);
  if (frame.phase === "petting") {
    catPetting = true;
    assert.equal(frame.cat.mood, "happy");
    break;
  }
}
assert(catPetting, "cat can be petted independently");

const queued = new ActorsDirector();
queued.request("dog");
queued.request("cat");
let sawDog = false, sawCat = false;
for (let n = 0; n < 900; n++) {
  const frame = queued.step(.05);
  if (frame.phase === "petting" && frame.target === "dog") sawDog = true;
  if (frame.phase === "petting" && frame.target === "cat") sawCat = true;
  if (sawDog && sawCat) break;
}
assert(sawDog && sawCat, "clicks queue safely, not interrupt current interaction");

const reduced = new ActorsDirector();
reduced.request("dog");
for (let n = 0; n < 30; n++) {
  const frame = reduced.step(.05, true);
  assert.equal(frame.phase, "idle");
  assert.equal(frame.worker.action, "idle");
}

const world = readFileSync("components/2d-shop/pets-world.tsx", "utf8");
const page = readFileSync("components/2d-shop/illustrated-shop.tsx", "utf8");
assert.match(world, /new ActorsDirector\(\)/);
assert.match(world, /data-engine="pixijs-choreographed-actors"/);
assert.match(world, /person\.action === "pet"/);
assert.match(world, /clerk\.mask/);
assert.match(page, /request=\{visitRequest\}/);
assert.doesNotMatch(page, /layers\/clerk-body\.png/);
console.log("PASS: independent actors, synchronized dog/cat petting, queueing, return and reduced motion.");
