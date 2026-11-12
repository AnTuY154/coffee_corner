/** Shared deterministic geometry and protocol. Never use CSS pixels as room coordinates. */
export const SCENE_WIDTH = 480;
export const SCENE_HEIGHT = 320;
export const TILE_SIZE = 16;
export const GRID_STEP = 4;
export const WALK_SPEED = 32;
export const PROTOCOL_VERSION = 1;
export const SCENE_VERSION = "pixel-garden-2";
export const NAV_VERSION = "pixel-nav-2";

export type Point = { x: number; y: number };
export type PathPoint = [number, number];
export type Facing = "up" | "down" | "left" | "right";
export type Seat = { id: string; x: number; y: number; approach: Point; facing: Facing };
export type HotspotAction = "menu" | "fruit" | "daily" | "counter";
export type Hotspot = { id: string; x: number; y: number; w: number; h: number; label: string; action: HotspotAction };
export type Actor = {
  id: string; x: number; y: number; shirt: number; facing: Facing;
  epoch: string; seq: number; path: PathPoint[]; startAt: number;
  speed: number; seatId: string | null;
};
export type ClientIntent =
  | { type: "goTo"; seq: number; target: Point }
  | { type: "direction"; seq: number; direction: Facing }
  | { type: "stop"; seq: number }
  | { type: "sit"; seq: number; seatId: string }
  | { type: "stand"; seq: number }
  | { type: "resync" };
export type ServerEvent =
  | { type: "snapshot"; protocolVersion: number; sceneVersion: string; navVersion: string; selfId: string; serverNow: number; actors: Actor[]; seats: Record<string, string> }
  | { type: "joined"; actor: Actor }
  | { type: "left"; actorId: string; epoch: string }
  | { type: "moveAccepted"; actorId: string; epoch: string; seq: number; startAt: number; speed: number; path: PathPoint[] }
  | { type: "stopped"; actorId: string; epoch: string; seq: number; x: number; y: number; facing: Facing }
  | { type: "seated"; actorId: string; seatId: string; seq: number }
  | { type: "stood"; actorId: string; seatId: string | null; seq: number }
  | { type: "seatBusy"; seatId: string; seq: number }
  | { type: "error"; code: string; message: string };

export const SPAWN: Point = { x: 238, y: 301 };
/**
 * Layout mapped directly from the user-supplied 1536x1024 reference:
 * X = sourceX * 480/1536, Y = sourceY * 320/1024.
 * Preserve stable hotspot and seat IDs while upgrading map geometry.
 */
export const HOTSPOTS: Hotspot[] = [
  { id: "menu-board", x: 303, y: 93, w: 78, h: 49, label: "Nước ép & sinh tố", action: "menu" },
  { id: "fruit-case", x: 320, y: 144, w: 61, h: 34, label: "Trái cây tươi", action: "fruit" },
  { id: "daily-board", x: 273, y: 174, w: 58, h: 17, label: "Gợi ý hôm nay", action: "daily" },
  { id: "counter", x: 203, y: 165, w: 179, h: 47, label: "Gọi món tại quầy", action: "counter" }
];
export const TABLES = [
  { id: "table-1", x: 58, y: 233 },
  { id: "table-2", x: 135, y: 274 },
  { id: "table-3", x: 235, y: 246 },
  { id: "table-4", x: 336, y: 274 },
  { id: "table-5", x: 419, y: 233 }
] as const;
export const SEATS: Seat[] = TABLES.flatMap(({ id, x, y }) => [
  { id: id + "-left", x: x - 20, y: y + 3, approach: { x: x - 30, y: y + 12 }, facing: "right" as const },
  { id: id + "-right", x: x + 20, y: y + 3, approach: { x: x + 30, y: y + 12 }, facing: "left" as const },
  { id: id + "-bottom", x, y: y + 18, approach: { x, y: y + 23 }, facing: "up" as const }
]);
type Rect = { x: number; y: number; w: number; h: number };
export const OBSTACLES: Rect[] = [
  ...TABLES.map(table => ({ x: table.x - 13, y: table.y - 10, w: 26, h: 22 })),
  { x: 284, y: 185, w: 15, h: 15 }
];
const finitePoint = (p: Point) => Number.isFinite(p?.x) && Number.isFinite(p?.y);
export const validPoint = (p: Point) => finitePoint(p) && p.x >= 12 && p.x <= 468 && p.y >= 216 && p.y <= 308;
export function isWalkable(p: Point, radius = 4): boolean {
  return validPoint(p) && !OBSTACLES.some(r => p.x + radius > r.x && p.x - radius < r.x + r.w && p.y + radius > r.y && p.y - radius < r.y + r.h);
}
export const hotspotAt = (p: Point) => HOTSPOTS.find(h => p.x >= h.x && p.x <= h.x + h.w && p.y >= h.y && p.y <= h.y + h.h);
export function nearestWalkable(point: Point): Point | null {
  if (!finitePoint(point)) return null;
  const x = Math.max(12, Math.min(468, Math.round(point.x / GRID_STEP) * GRID_STEP));
  const y = Math.max(216, Math.min(308, Math.round(point.y / GRID_STEP) * GRID_STEP));
  if (isWalkable({ x, y })) return { x, y };
  for (let radius = GRID_STEP; radius < 72; radius += GRID_STEP) {
    for (let dx = -radius; dx <= radius; dx += GRID_STEP) {
      for (const dy of [-radius, radius]) {
        const p = { x: x + dx, y: y + dy };
        if (isWalkable(p)) return p;
      }
    }
    for (let dy = -radius + GRID_STEP; dy < radius; dy += GRID_STEP) {
      for (const dx of [-radius, radius]) {
        const p = { x: x + dx, y: y + dy };
        if (isWalkable(p)) return p;
      }
    }
  }
  return null;
}
type Node = { id: number; score: number };
class MinQueue {
  data: Node[] = [];
  push(n: Node) {
    const a = this.data; a.push(n);
    let i = a.length - 1;
    while (i > 0) {
      const p = (i - 1) >> 1; if (a[p].score <= n.score) break;
      a[i] = a[p]; i = p;
    }
    a[i] = n;
  }
  pop(): Node | undefined {
    const a = this.data; if (!a.length) return undefined;
    const result = a[0]; const tail = a.pop()!;
    if (!a.length) return result;
    let i = 0;
    for (;;) {
      let child = i * 2 + 1;
      if (child >= a.length) break;
      if (child + 1 < a.length && a[child + 1].score < a[child].score) child++;
      if (a[child].score >= tail.score) break;
      a[i] = a[child]; i = child;
    }
    a[i] = tail; return result;
  }
  get size() { return this.data.length; }
}
const COLS = SCENE_WIDTH / GRID_STEP;
const idOf = (x: number, y: number) => Math.round(y / GRID_STEP) * COLS + Math.round(x / GRID_STEP);
const pointOf = (id: number): Point => ({ x: (id % COLS) * GRID_STEP, y: Math.floor(id / COLS) * GRID_STEP });
/** A* on the exact shared four-pixel nav grid; 4-neighbour movement prevents corner cutting. */
export function findPath(from: Point, to: Point): PathPoint[] | null {
  if (!finitePoint(from) || !isWalkable(to)) return null;
  const start = nearestWalkable(from);
  const goal = nearestWalkable(to);
  if (!start || !goal) return null;
  const startId = idOf(start.x, start.y), goalId = idOf(goal.x, goal.y);
  const queue = new MinQueue(), score = new Map<number, number>([[startId, 0]]);
  const prev = new Map<number, number>(), visited = new Set<number>();
  const heuristic = (p: Point) => Math.abs(goal.x - p.x) + Math.abs(goal.y - p.y);
  queue.push({ id: startId, score: heuristic(start) });
  while (queue.size) {
    const current = queue.pop()!;
    if (visited.has(current.id)) continue;
    visited.add(current.id);
    if (current.id === goalId) {
      const ids = [goalId];
      while (ids[0] !== startId) ids.unshift(prev.get(ids[0])!);
      const points: PathPoint[] = [[from.x, from.y]];
      for (const id of ids.slice(1)) {
        const p = pointOf(id); points.push([p.x, p.y]);
      }
      if (points.length === 1) points.push([goal.x, goal.y]);
      // Collapse collinear segments to reduce network payload without changing geometry.
      const compact: PathPoint[] = [];
      for (const p of points) {
        const n = compact.length;
        if (n >= 2) {
          const a = compact[n - 2], b = compact[n - 1];
          if ((a[0] === b[0] && b[0] === p[0]) || (a[1] === b[1] && b[1] === p[1])) { compact[n - 1] = p; continue; }
        }
        compact.push(p);
      }
      return compact;
    }
    const p = pointOf(current.id);
    for (const d of [[GRID_STEP,0],[-GRID_STEP,0],[0,GRID_STEP],[0,-GRID_STEP]]) {
      const q = { x: p.x + d[0], y: p.y + d[1] };
      if (!isWalkable(q)) continue;
      const next = idOf(q.x, q.y);
      const candidate = score.get(current.id)! + GRID_STEP;
      if (candidate < (score.get(next) ?? Infinity)) {
        score.set(next, candidate); prev.set(next, current.id);
        queue.push({ id: next, score: candidate + heuristic(q) });
      }
    }
  }
  return null;
}
export function positionAt(actor: Pick<Actor, "x" | "y" | "path" | "startAt" | "speed">, now: number): Point {
  const path = actor.path;
  if (path.length < 2 || !Number.isFinite(now)) return { x: actor.x, y: actor.y };
  let remaining = Math.max(0, (now - actor.startAt) / 1000) * actor.speed;
  for (let i = 1; i < path.length; i++) {
    const [ax, ay] = path[i - 1], [bx, by] = path[i];
    const length = Math.hypot(bx - ax, by - ay);
    if (remaining <= length) {
      const t = length > 0 ? remaining / length : 1;
      return { x: ax + (bx - ax) * t, y: ay + (by - ay) * t };
    }
    remaining -= length;
  }
  const [x, y] = path[path.length - 1];
  return { x, y };
}
export function facingFromPath(path: PathPoint[], fallback: Facing): Facing {
  if (path.length < 2) return fallback;
  const a = path[0], b = path[1];
  return Math.abs(b[0] - a[0]) > Math.abs(b[1] - a[1])
    ? (b[0] >= a[0] ? "right" : "left")
    : (b[1] >= a[1] ? "down" : "up");
}
export const shirtFor = (id: string) => [...id].reduce((h, c) => ((h * 31 + c.charCodeAt(0)) >>> 0), 0) % 6;
