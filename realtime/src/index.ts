import { findPath, nearestWalkable, positionAt, facingFromPath, SEATS, SPAWN, WALK_SPEED, PROTOCOL_VERSION, SCENE_VERSION, NAV_VERSION, shirtFor, type Actor, type ClientIntent, type Point, type ServerEvent, type Facing } from "../../shared/garden/model";

interface Env { GARDEN: DurableObjectNamespace; GUEST_SECRET: string; ALLOWED_ORIGINS: string }
type ConnectionState = { id: string; connectionId: string; actor: Actor };
const encoder = new TextEncoder();
const base64url = (input: Uint8Array) => btoa(String.fromCharCode(...input)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
const fromBase64url = (value: string) => Uint8Array.from(atob(value.replace(/-/g, "+").replace(/_/g, "/")), c => c.charCodeAt(0));
async function hmacKey(secret: string) { return crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign", "verify"]); }
async function issueGuest(secret: string) {
  const data = { id: crypto.randomUUID(), exp: Date.now() + 7 * 86400_000 };
  const body = base64url(encoder.encode(JSON.stringify(data)));
  const key = await hmacKey(secret);
  const sig = base64url(new Uint8Array(await crypto.subtle.sign("HMAC", key, encoder.encode(body))));
  return body + "." + sig;
}
async function verifyGuest(request: Request, secret: string): Promise<string | null> {
  const token = request.headers.get("cookie")?.match(/(?:^|;\s*)ve_guest=([^;]+)/)?.[1];
  if (!token) return null;
  const [body, signature, extra] = token.split(".");
  if (!body || !signature || extra || body.length > 1000) return null;
  try {
    const key = await hmacKey(secret);
    const ok = await crypto.subtle.verify("HMAC", key, fromBase64url(signature), encoder.encode(body));
    if (!ok) return null;
    const data = JSON.parse(new TextDecoder().decode(fromBase64url(body))) as { id?: string; exp?: number };
    return typeof data.id === "string" && /^[a-f0-9-]{36}$/i.test(data.id) && typeof data.exp === "number" && data.exp > Date.now() ? data.id : null;
  } catch { return null; }
}
const cors = (origin: string) => ({
  "Access-Control-Allow-Origin": origin,
  "Access-Control-Allow-Credentials": "true",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Vary": "Origin",
  "Cache-Control": "no-store"
});
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const path = new URL(request.url).pathname;
    if (path === "/health") return Response.json({ ok: true, protocolVersion: PROTOCOL_VERSION, sceneVersion: SCENE_VERSION, navVersion: NAV_VERSION }, { headers: { "Cache-Control": "no-store" } });
    const origin = request.headers.get("origin") ?? "";
    const allowed = env.ALLOWED_ORIGINS.split(",").map(s => s.trim()).filter(Boolean);
    if (!origin || !allowed.includes(origin)) return new Response("Origin forbidden", { status: 403 });
    if (!env.GUEST_SECRET || env.GUEST_SECRET.length < 32) return new Response("Realtime not configured", { status: 503 });
    if (request.method === "OPTIONS" && path === "/v1/guest") return new Response(null, { status: 204, headers: cors(origin) });
    if (path === "/v1/guest" && request.method === "POST") {
      const existing = await verifyGuest(request, env.GUEST_SECRET);
      const token = existing ? null : await issueGuest(env.GUEST_SECRET);
      const headers = new Headers(cors(origin));
      if (token) headers.append("Set-Cookie", "ve_guest=" + token + "; Path=/; Max-Age=604800; HttpOnly; Secure; SameSite=Lax");
      return Response.json({ ok: true }, { headers });
    }
    if (path === "/v1/gardens/main" && request.method === "GET") {
      if (request.headers.get("upgrade")?.toLowerCase() !== "websocket") return new Response("WebSocket required", { status: 426 });
      const guestId = await verifyGuest(request, env.GUEST_SECRET);
      if (!guestId) return new Response("Guest session missing", { status: 401 });
      const headers = new Headers(request.headers);
      headers.set("x-garden-guest-id", guestId);
      const id = env.GARDEN.idFromName("garden-main");
      return env.GARDEN.get(id).fetch(new Request(request, { headers }));
    }
    return new Response("Not found", { status: 404, headers: cors(origin) });
  }
};

export class GardenRoom implements DurableObject {
  private actors = new Map<string, Actor>();
  private clients = new Map<string, WebSocket>();
  private lastIntent = new Map<string, number>();
  private burst = new Map<string, { at: number; count: number }>();
  private hydrated = false;
  constructor(private ctx: DurableObjectState, private env: Env) {}
  private restore() {
    if (this.hydrated) return;
    this.hydrated = true;
    for (const ws of this.ctx.getWebSockets()) {
      const state = ws.deserializeAttachment() as ConnectionState | null;
      if (!state?.id || !state.actor || !state.connectionId) continue;
      this.actors.set(state.id, state.actor);
      this.clients.set(state.id, ws);
    }
  }
  private emit(ws: WebSocket, event: ServerEvent) {
    try { ws.send(JSON.stringify(event)); } catch { /* socket will be removed on close */ }
  }
  private broadcast(event: ServerEvent, exceptId?: string) {
    for (const [id, ws] of this.clients) if (id !== exceptId) this.emit(ws, event);
  }
  private attachment(id: string, ws: WebSocket) {
    const old = ws.deserializeAttachment() as ConnectionState;
    ws.serializeAttachment({ id, connectionId: old.connectionId, actor: this.actors.get(id)! } satisfies ConnectionState);
  }
  private occupancy() {
    return Object.fromEntries([...this.actors.values()].filter(a => a.seatId).map(a => [a.seatId!, a.id]));
  }
  async fetch(request: Request): Promise<Response> {
    this.restore();
    const id = request.headers.get("x-garden-guest-id");
    if (!id || !/^[a-f0-9-]{36}$/i.test(id) || request.headers.get("upgrade")?.toLowerCase() !== "websocket") return new Response("Forbidden", { status: 403 });
    if (!this.actors.has(id) && this.actors.size >= 20) return new Response("Garden full; use quick shop", { status: 503 });
    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair);
    const connectionId = crypto.randomUUID();
    const prior = this.clients.get(id);
    const previous = this.actors.get(id);
    const actor: Actor = previous
      ? { ...previous, epoch: connectionId, seq: 0, x: positionAt(previous, Date.now()).x, y: positionAt(previous, Date.now()).y, startAt: Date.now(), path: [], seatId: previous.seatId }
      : { id, x: SPAWN.x, y: SPAWN.y, shirt: shirtFor(id), facing: "down", epoch: connectionId, seq: 0, path: [], startAt: Date.now(), speed: WALK_SPEED, seatId: null };
    this.ctx.acceptWebSocket(server, [id]);
    server.serializeAttachment({ id, connectionId, actor } satisfies ConnectionState);
    // New connection wins immediately. A stale close must never delete it.
    this.clients.set(id, server);
    this.actors.set(id, actor);
    this.lastIntent.delete(id);
    this.burst.delete(id);
    if (prior) { try { prior.close(4001, "Transferred to a new tab"); } catch {} }
    this.emit(server, { type: "snapshot", protocolVersion: PROTOCOL_VERSION, sceneVersion: SCENE_VERSION, navVersion: NAV_VERSION, selfId: id, serverNow: Date.now(), actors: [...this.actors.values()], seats: this.occupancy() });
    this.broadcast({ type: "joined", actor }, id);
    return new Response(null, { status: 101, webSocket: client });
  }
  async webSocketMessage(ws: WebSocket, data: string | ArrayBuffer) {
    this.restore();
    const conn = ws.deserializeAttachment() as ConnectionState | null;
    if (!conn || this.clients.get(conn.id) !== ws || typeof data !== "string" || data.length > 1024) { try { ws.close(1008, "Invalid client"); } catch {} return; }
    let input: ClientIntent;
    try { input = JSON.parse(data) as ClientIntent; } catch { this.emit(ws, { type: "error", code: "badJson", message: "Invalid command" }); return; }
    if (input.type === "resync") {
      const now = Date.now();
      if (now - (this.lastIntent.get(conn.id) ?? 0) < 1500) return;
      this.lastIntent.set(conn.id, now);
      this.emit(ws, { type: "snapshot", protocolVersion: PROTOCOL_VERSION, sceneVersion: SCENE_VERSION, navVersion: NAV_VERSION, selfId: conn.id, serverNow: now, actors: [...this.actors.values()], seats: this.occupancy() }); return;
    }
    const actor = this.actors.get(conn.id)!;
    const seq = input.seq;
    if (!Number.isSafeInteger(seq) || seq < 1 || seq <= actor.seq) return;
    const now = Date.now();
    const bucket = this.burst.get(conn.id) ?? { at: now, count: 0 };
    if (now - bucket.at > 1000) { bucket.at = now; bucket.count = 0; }
    bucket.count += 1; this.burst.set(conn.id, bucket);
    // Stop and stand remain available under rate limiting.
    if (bucket.count > 12 && input.type !== "stop" && input.type !== "stand") return;
    if (input.type === "stop") {
      const p = positionAt(actor, now);
      Object.assign(actor, { x: p.x, y: p.y, startAt: now, path: [], seq });
      this.attachment(conn.id, ws);
      this.emit(ws, { type: "stopped", actorId: conn.id, epoch: actor.epoch, seq, x: p.x, y: p.y, facing: actor.facing });
      this.broadcast({ type: "stopped", actorId: conn.id, epoch: actor.epoch, seq, x: p.x, y: p.y, facing: actor.facing }, conn.id);
      return;
    }
    if (input.type === "stand") {
      const seatId = actor.seatId;
      actor.seatId = null; actor.seq = seq; this.attachment(conn.id, ws);
      const event: ServerEvent = { type: "stood", actorId: conn.id, seatId, seq };
      this.emit(ws, event); this.broadcast(event, conn.id); return;
    }
    if (input.type === "sit") {
      const seat = SEATS.find(s => s.id === input.seatId);
      if (!seat) return;
      const occupied = [...this.actors.values()].some(other => other.id !== conn.id && other.seatId === seat.id);
      if (occupied) { this.emit(ws, { type: "seatBusy", seatId: seat.id, seq }); return; }
      const p = positionAt(actor, now);
      if (Math.hypot(p.x - seat.approach.x, p.y - seat.approach.y) > 24) {
        this.emit(ws, { type: "error", code: "tooFar", message: "Walk closer to this seat" }); return;
      }
      // No await between checking seat owner and assigning it.
      Object.assign(actor, { x: seat.x, y: seat.y, facing: seat.facing, path: [], startAt: now, seq, seatId: seat.id });
      this.attachment(conn.id, ws);
      const event: ServerEvent = { type: "seated", actorId: conn.id, seatId: seat.id, seq };
      this.emit(ws, event); this.broadcast(event, conn.id); return;
    }
    if (input.type !== "goTo" && input.type !== "direction") return;
    if (actor.seatId) return;
    const current = positionAt(actor, now);
    let target: Point;
    if (input.type === "goTo") {
      if (!input.target || !Number.isFinite(input.target.x) || !Number.isFinite(input.target.y)) return;
      target = input.target;
    } else {
      const v: Record<Facing, Point> = { up: {x:0,y:-1}, down: {x:0,y:1}, left: {x:-1,y:0}, right: {x:1,y:0} };
      if (!Object.prototype.hasOwnProperty.call(v, input.direction)) return;
      target = { x: current.x + v[input.direction].x * 64, y: current.y + v[input.direction].y * 64 };
      target = nearestWalkable(target) ?? current;
    }
    const end = nearestWalkable(target);
    if (!end) return;
    const path = findPath(current, end);
    if (!path) return;
    Object.assign(actor, { x: current.x, y: current.y, path, speed: WALK_SPEED, startAt: now, facing: input.type === "direction" ? input.direction : facingFromPath(path, actor.facing), seq });
    this.attachment(conn.id, ws);
    const event: ServerEvent = { type: "moveAccepted", actorId: conn.id, epoch: actor.epoch, seq, startAt: now, speed: WALK_SPEED, path };
    this.emit(ws, event); this.broadcast(event, conn.id);
  }
  async webSocketClose(ws: WebSocket) {
    this.restore();
    const conn = ws.deserializeAttachment() as ConnectionState | null;
    if (!conn || this.clients.get(conn.id) !== ws) return;
    this.clients.delete(conn.id); this.actors.delete(conn.id); this.burst.delete(conn.id); this.lastIntent.delete(conn.id);
    this.broadcast({ type: "left", actorId: conn.id, epoch: conn.connectionId });
  }
  async webSocketError(ws: WebSocket) { await this.webSocketClose(ws); }
}
