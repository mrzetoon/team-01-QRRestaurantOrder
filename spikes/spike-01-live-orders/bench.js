// Spike 01 benchmark: 20 tables x 5 rounds = 100 orders.
// Measures, for each order, the time from "customer presses Submit" to
// "order is visible on the staff screen", for two delivery methods:
//   push : staff screen holds an open WebSocket and is sent each new order
//   poll : staff screen asks the server for new orders every POLL_MS
// NET_MS simulates one-way network delay (phone -> server and server -> tablet).
const { spawn } = require('child_process');
const http = require('http');
const WebSocket = require('ws');

const PORT = 8081;
const TABLES = 20, ROUNDS = 5;
const ROUND_GAP_MS = 3300;      // not a multiple of the poll interval, so poll phase varies
const JITTER_MS = 1000;         // all 20 tables submit within 1 s of each other
const POLL_MS = Number(process.env.POLL_MS || 3000);
const NET_MS = Number(process.env.NET_MS || 0);

const sleep = ms => new Promise(r => setTimeout(r, ms));
const now = () => performance.timeOrigin + performance.now();

function post(order) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(order);
    const req = http.request({ port: PORT, path: '/orders', method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) } },
      res => { res.resume(); res.on('end', resolve); });
    req.on('error', reject); req.end(data);
  });
}
function getJSON(path) {
  return new Promise((resolve, reject) => {
    http.get({ port: PORT, path }, res => {
      let b = ''; res.on('data', c => (b += c)); res.on('end', () => resolve(JSON.parse(b)));
    }).on('error', reject);
  });
}
function stats(a) {
  const s = [...a].sort((x, y) => x - y), q = p => s[Math.min(s.length - 1, Math.ceil(p * s.length) - 1)];
  return { n: s.length, p50: +q(0.5).toFixed(1), p95: +q(0.95).toFixed(1), max: +s[s.length - 1].toFixed(1),
           within3s: s.filter(x => x <= 3000).length };
}

(async () => {
  const srv = spawn(process.execPath, ['server.js'], { env: { ...process.env, PORT }, stdio: 'ignore' });
  await sleep(500);

  const pushSeen = new Map(), pollSeen = new Map();
  const ws = new WebSocket(`ws://localhost:${PORT}/live`);
  await new Promise(r => ws.on('open', r));
  ws.on('message', m => { const o = JSON.parse(m); setTimeout(() => pushSeen.set(o.number, now()), NET_MS); });

  let lastSeen = 0, polling = true;
  (async function poll() {
    while (polling) {
      await sleep(NET_MS);                                    // request travels to server
      const fresh = await getJSON(`/orders?after=${lastSeen}`);
      await sleep(NET_MS);                                    // response travels back
      const t = now();
      for (const o of fresh) { pollSeen.set(o.number, t); lastSeen = Math.max(lastSeen, o.number); }
      await sleep(POLL_MS);
    }
  })();

  const sentAt = new Map(); const sends = [];
  for (let r = 0; r < ROUNDS; r++) {
    for (let t = 1; t <= TABLES; t++) {
      sends.push((async () => {
        await sleep(Math.random() * JITTER_MS);
        const t0 = now();
        await sleep(NET_MS);                                  // phone -> server
        const resBody = await new Promise((resolve, reject) => {
          const data = JSON.stringify({ table: t, items: [{ item: 'burger', qty: 1 }], sentAt: t0 });
          const req = http.request({ port: PORT, path: '/orders', method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) } },
            res => { let b = ''; res.on('data', c => (b += c)); res.on('end', () => resolve(JSON.parse(b))); });
          req.on('error', reject); req.end(data);
        });
        sentAt.set(resBody.number, t0);
      })());
    }
    await sleep(ROUND_GAP_MS);
  }
  await Promise.all(sends);
  await sleep(POLL_MS + 4 * NET_MS + 500);
  polling = false; ws.close(); srv.kill();

  const push = [], poll = [];
  for (const [n, t0] of sentAt) { push.push(pushSeen.get(n) - t0); poll.push(pollSeen.get(n) - t0); }
  const result = { date: new Date().toISOString(), node: process.version, tables: TABLES, orders: sentAt.size,
                   netDelayMsOneWay: NET_MS, pollIntervalMs: POLL_MS, pushMs: stats(push), pollMs: stats(poll) };
  console.log(JSON.stringify(result));
})();
