// Run against deployed staging only; do not aim load tests at GitHub Pages.
// k6 run -e BASE=https://garden.example.com -e ORIGIN=https://shop.example.com tests/load/garden.js
import http from "k6/http";
import ws from "k6/ws";
import { check } from "k6";
import { Counter, Trend } from "k6/metrics";

const acknowledgements = new Counter("garden_acks");
const snapshots = new Counter("garden_snapshots");
const broadcasts = new Counter("garden_broadcasts");
const ackTime = new Trend("garden_ack_ms", true);
export const options = {
  vus: Number(__ENV.VUS || 20),
  duration: __ENV.DURATION || "30m",
  thresholds: { http_req_failed:["rate<0.005"], garden_ack_ms:["p(95)<250"] }
};
const base = __ENV.BASE;
const origin = __ENV.ORIGIN;
if (!base || !origin) throw Error("Set BASE and ORIGIN for real staging endpoints");
export default function() {
  const response = http.post(base + "/v1/guest", "{}", {headers:{Origin:origin,"Content-Type":"application/json"}});
  check(response,{ "guest bootstrap succeeds": r => r.status===200 });
  const guest = http.cookieJar().cookiesForURL(base).ve_guest?.[0];
  if(!guest)throw Error("No signed cookie from staging; check same-site configuration");
  const url = base.replace(/^http/, "ws") + "/v1/gardens/main";
  const result = ws.connect(url, {headers: {Origin: origin, Cookie: "ve_guest=" + guest}}, socket => {
    let seq = 0;
    const pending = new Map();
    const start = Date.now();
    socket.on("message", data => {
      try {
        const event=JSON.parse(data);
        if(event.type==="snapshot")snapshots.add(1);
        if(event.type==="joined"||event.type==="left"||event.type==="moveAccepted")broadcasts.add(1);
        if(event.type==="moveAccepted"&&event.actorId&&pending.has(event.seq)){
          acknowledgements.add(1);ackTime.add(Date.now()-pending.get(event.seq));pending.delete(event.seq);
        }
      }catch{}
    });
    socket.setInterval(()=>{
      const elapsed=Date.now()-start;
      if(elapsed < 5*60_000)return; // 5 minutes idle: no movement events.
      if(elapsed<20*60_000&&__VU>6)return; // 6 people, one command every 2s.
      const every=elapsed>=20*60_000?500:2000; // 10 minutes: all 20, 2 commands/s.
      if(elapsed - (socket.__lastMove||0) < every)return;
      socket.__lastMove=elapsed;
      const target = seq%2?{x:220,y:297}:{x:260,y:297};
      ++seq;pending.set(seq,Date.now());
      socket.send(JSON.stringify({type:"goTo",seq,target}));
    },250);
    socket.setTimeout(()=>socket.close(),Number(__ENV.DURATION_MS||1800000));
  });
  check(result,{ "socket upgraded": r=>r && r.status===101 });
}
