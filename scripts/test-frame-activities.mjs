import assert from "node:assert/strict";
import { animationFrameAt, employeeFrameAction, petFrameAction, FRAME_SEQUENCES } from "../components/2d-shop/animation-frames.ts";

assert.equal(employeeFrameAction("pet","dog"),"pet_dog");
assert.equal(employeeFrameAction("pet","cat"),"pet_cat");
assert.equal(employeeFrameAction("run",null),"run");
for (const action of ["idle", "wave", "talk", "prepare", "walk", "run"]) {
  assert.equal(employeeFrameAction(action, null), action);
}
for (const mood of ["idle","walk","turn","happy","bark","jump","groom","nap"]) {
  for (const animal of ["dog","cat"]) {
    const action = petFrameAction(animal,mood,0);
    assert(action in FRAME_SEQUENCES[animal], `No sequence for ${animal}/${mood}`);
  }
}
assert.equal(petFrameAction("dog","walk",90),"run");
assert.equal(petFrameAction("cat","walk",25),"run");
assert.equal(petFrameAction("cat","groom"),"groom");
assert.equal(petFrameAction("dog","bark"),"happy");
assert.equal(animationFrameAt(.25,12,8),3);
assert.equal(animationFrameAt(1,12,8),4);
assert.equal(animationFrameAt(1,12,8,false),7);
console.log("PASS: simulation activities resolve to real declared frame sequences.");
