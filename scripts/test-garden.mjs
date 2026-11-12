import assert from "node:assert/strict";
import { PET_ROUTES, petRouteAt, guestVisualDepth } from "../components/pixel-shop/pet-motion.ts";
import { SPAWN, HOTSPOTS, SEATS, OBSTACLES, isWalkable, findPath, positionAt, hotspotAt, nearestWalkable, facingFromPath } from "../shared/garden/model.ts";
assert.equal(SEATS.length, 15);
assert.equal(new Set(SEATS.map(s => s.id)).size, 15);
assert.equal(HOTSPOTS.length, 4);
assert.ok(hotspotAt({x:345,y:155})?.action === "fruit");
assert.ok(!isWalkable({x:58,y:233}));
assert.ok(!isWalkable({x:-1,y:-1}));
assert.equal(findPath(SPAWN,{x:58,y:233}),null);
const path = findPath({x:105,y:239},{x:180,y:280});
assert.ok(path?.length >= 3);
for(const [x,y] of path.slice(1)){ assert.ok(isWalkable({x,y}), 'path point must avoid obstacles'); }
assert.equal(nearestWalkable({x:58,y:233})!==null,true);
assert.equal(findPath({x:20,y:190},{x:Infinity,y:200}),null);
assert.deepEqual(positionAt({x:80,y:128,path:[[80,128],[80,160],[120,160]],startAt:501200,speed:32},501700),{x:80,y:144});
assert.deepEqual(positionAt({x:80,y:128,path:[[80,128],[80,160],[120,160]],startAt:501200,speed:32},502200),{x:80,y:160});
assert.equal(facingFromPath([[0,0],[20,0]],"up"),"right");
assert.ok(OBSTACLES.length >= 5);
console.log("PASS: 15 seats, hotspot anchors, navigation and authoritative path interpolation.");

// Visual layering regression: topmost reference table foreground is at z=295.
for(const seat of SEATS){
  assert.ok(guestVisualDepth(seat.y,seat.id)>295,seat.id+" must draw above furniture");
  assert.equal(guestVisualDepth(seat.y,null),Math.round(seat.y));
}
// Decorative animals move on local routes; no server actors or seat changes.
for(const [kind,route] of Object.entries(PET_ROUTES)){
  assert.ok(route.length>=4,kind+" must have a visible multi-stop patrol");
  for(const point of route) assert.ok(isWalkable(point),kind+" route must avoid tables");
  const start=petRouteAt(0,route,8),moved=petRouteAt(2,route,8);
  assert.notDeepEqual([start.x,start.y],[moved.x,moved.y],kind+" should actually move");
  assert.deepEqual(petRouteAt(2,route,8),moved,kind+" animation must be deterministic");
  const stopped=petRouteAt(5,route,0);
  assert.equal(stopped.moving,false,kind+" should respect reduced motion");
}
console.log("PASS: static guest seat visibility over 12 reference overlays and independent pet patrols.");
