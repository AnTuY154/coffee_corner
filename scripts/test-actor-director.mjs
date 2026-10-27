import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { ActorsDirector, ARTBOARD, DOG_GROUND_Y, CAT_TABLE_Y,
  interpolateRoute } from "../components/2d-shop/actors-director.ts";
import { deformVertices } from "../components/2d-shop/deform-rig.ts";

assert.deepEqual(ARTBOARD, { width: 1672, height: 941 });
assert(DOG_GROUND_Y > CAT_TABLE_Y + 60, "dog is on patio, cat is on table");
for (const [t,expected] of [[0,0],[1,3]]) {
  const pos = interpolateRoute([{x:0,y:0},{x:1,y:1},{x:3,y:4}],t);
  assert.equal(pos.x,expected);
}

const d = new ActorsDirector();
const start = d.step(0);
assert.equal(start.worker.behindCounter, true);
assert.equal(start.worker.action, "wave");
assert.equal(start.worker.y, 694);
let sawDogWalk = false, sawDogBark = false, sawDogJump = false;
let sawCatGroom = false, sawCatNap = false, sawCatWalk = false;
let last = start;
for (let i = 0; i < 1600; i++) {
  const now = d.step(.05);
  assert(now.dog.x >= 310 && now.dog.x <= 1010, "dog stays on patio path");
  assert(now.cat.x >= 1350 && now.cat.x <= 1475, "cat stays on outdoor tabletop");
  assert.equal(now.dog.y,DOG_GROUND_Y);
  assert.equal(now.cat.y,CAT_TABLE_Y);
  assert(Math.abs(now.dog.x-last.dog.x) < 7, "dog never teleports");
  assert(Math.abs(now.cat.x-last.cat.x) < 4, "cat never teleports");
  assert(Math.abs(now.worker.x-last.worker.x) < 26, "worker never teleports");
  assert(Math.abs(now.worker.y-last.worker.y) < 26, "worker never teleports vertically");
  if (now.worker.action === "run" && now.worker.x > 950 && now.worker.x < 1230) {
    assert(now.worker.y >= 860, "employee never runs through tall drink refrigerators");
  }
  if(now.dog.mood === "walk") sawDogWalk = true;
  if(now.dog.mood === "bark") sawDogBark = true;
  if(now.dog.mood === "jump") sawDogJump = true;
  if(now.cat.mood === "walk") sawCatWalk = true;
  if(now.cat.mood === "groom") sawCatGroom = true;
  if(now.cat.mood === "nap") sawCatNap = true;
  last = now;
}
assert(sawDogWalk && sawDogBark && sawDogJump, "dog walks, barks and jumps");
assert(sawCatWalk && sawCatGroom && sawCatNap, "cat walks on table, grooms and naps");

const visits = new ActorsDirector();
visits.request("dog");
visits.request("cat");
let metDog = false, metCat = false, returned = false;
let previousPhase = "", previousPos = visits.step(0);
for (let i = 0; i < 1800; i++) {
  const state = visits.step(.05);
  assert(Math.hypot(state.worker.x-previousPos.worker.x,state.worker.y-previousPos.worker.y)<26,
    "no jump at counter exit, grooming or return");
  if (state.phase === "petting") {
    if(state.target === "dog") {
      metDog = true;
      assert.equal(state.dog.mood,"happy");
      assert.equal(state.worker.action,"pet");
      assert(Math.abs(state.worker.y - state.dog.y)<10);
    }
    if(state.target === "cat") {
      metCat = true;
      assert.equal(state.cat.mood,"happy");
      assert.equal(state.worker.action,"pet");
      assert(state.worker.y > CAT_TABLE_Y + 60,"employee remains on ground beside cat table");
    }
  }
  if(state.phase === "idle" && previousPhase === "returning") {
    returned = true;
    assert(state.worker.behindCounter,"worker greets again from behind counter");
  }
  previousPhase=state.phase;
  previousPos=state;
  if(metDog && metCat && returned) break;
}
assert(metDog && metCat && returned,"queued visits both complete and employee returns");
const reduced = new ActorsDirector();
reduced.request("cat");
for(let i=0;i<25;i++) {
  const p=reduced.step(.05,true);
  assert.equal(p.phase,"idle");
  assert.equal(p.worker.action,"idle");
  assert.equal(p.cat.mood,"nap");
}

const original=new Float32Array([0,0,50,50,100,75,120,100]);
for(const [kind,motion] of [["dog","walk"],["dog","bark"],["dog","jump"],
  ["cat","groom"],["cat","nap"],["employee","wave"],["employee","pet"]]) {
  const copy=new Float32Array(original);
  deformVertices(original,copy,120,100,{gait:1.6,speed:30,seconds:1.1,
    motion,actionProgress:.48},kind);
  assert.notDeepEqual([...copy],[...original],kind+" "+motion+" has animated vertex geometry");
  assert(copy.every(Number.isFinite),"no broken rig vertices");
}
assert.deepEqual([...original],[0,0,50,50,100,75,120,100],"canonical geometry is immutable");
const renderer=readFileSync("components/2d-shop/pets-world.tsx","utf8");
for(const p of ["MeshPlane","canonical/dog.webp","canonical/cat.webp","canonical/employee.webp",
  "state.mood === \"jump\"","state.mood === \"bark\"","state.mood === \"nap\"","onBarkRef","behindCounter ? counterMask"])
  assert(renderer.includes(p),"renderer missing behavior: "+p);
assert.doesNotMatch(renderer,/pets\/dog-walk\.png|actors\/anime\/idle\.webp/);
console.log("PASS: canonical art, ground/table paths, no teleport, employee visits, bark/jump/tail, groom/nap, accessible reduced motion");