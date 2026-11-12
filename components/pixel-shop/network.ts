import type { ClientIntent, ServerEvent } from "@/shared/garden/model";
export type RoomStatus = "solo" | "connecting" | "online" | "reconnecting" | "transferred" | "offline" | "full";
type Handlers = { onEvent: (event: ServerEvent) => void; onStatus: (status: RoomStatus) => void };
/** Per-browser WS only. A stable room ID and rendering timeline live on the Worker. */
export function createGardenNetwork(handlers: Handlers) {
  const base = process.env.NEXT_PUBLIC_GARDEN_HTTP_URL?.trim();
  if (!base) {
    handlers.onStatus("solo");
    return { send: (_intent: ClientIntent) => false, close: () => {} };
  }
  let disposed = false, ws: WebSocket | null = null, attempt = 0;
  let retry: ReturnType<typeof setTimeout> | null = null;
  let controller: AbortController | null = null;
  const boot = async () => {
    if (disposed) return;
    handlers.onStatus(attempt ? "reconnecting" : "connecting");
    controller = new AbortController();
    try {
      const endpoint = new URL(base);
      if (endpoint.protocol !== "https:" && endpoint.hostname !== "localhost" && endpoint.hostname !== "127.0.0.1") throw new Error("HTTPS realtime is required");
      const response = await fetch(new URL("/v1/guest", endpoint), { method: "POST", credentials: "include", signal: controller.signal, cache: "no-store" });
      if (!response.ok) throw new Error("Guest session rejected");
      if (disposed) return;
      const url = new URL("/v1/gardens/main", endpoint);
      url.protocol = endpoint.protocol === "https:" ? "wss:" : "ws:";
      const socket = new WebSocket(url);
      ws = socket;
      socket.onopen = () => { attempt = 0; handlers.onStatus("online"); };
      socket.onmessage = message => {
        if (typeof message.data !== "string" || message.data.length > 200_000) return;
        try { handlers.onEvent(JSON.parse(message.data) as ServerEvent); } catch { /* malformed frame is ignored */ }
      };
      socket.onclose = event => {
        if (disposed || ws !== socket) return;
        ws = null;
        if (event.code === 4001) { handlers.onStatus("transferred"); return; }
        scheduleRetry();
      };
      socket.onerror = () => { socket.close(); };
    } catch {
      if (!disposed) scheduleRetry();
    }
  };
  const scheduleRetry = () => {
    if (disposed) return;
    handlers.onStatus("reconnecting");
    const delay = Math.min(20_000, 750 * 2 ** Math.min(attempt++, 5));
    retry = setTimeout(boot, delay * (0.75 + Math.random() * 0.5));
  };
  void boot();
  return {
    send(intent: ClientIntent) {
      if (ws?.readyState !== WebSocket.OPEN) return false;
      ws.send(JSON.stringify(intent));
      return true;
    },
    close() { disposed = true; if (retry) clearTimeout(retry); controller?.abort(); ws?.close(1000, "Leaving garden"); ws = null; }
  };
}
