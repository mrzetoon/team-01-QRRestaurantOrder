// Spike 01 — minimal order server used only to measure live delivery.
// Not production code: no database, no auth, no validation.
const http = require('http');
const { WebSocketServer } = require('ws');

const PORT = Number(process.env.PORT || 8081);
const orders = [];          // in-memory order book
let nextNumber = 1;

const server = http.createServer((req, res) => {
  if (req.method === 'POST' && req.url === '/orders') {
    let body = '';
    req.on('data', c => (body += c));
    req.on('end', () => {
      const o = JSON.parse(body);
      const order = { number: nextNumber++, table: o.table, items: o.items, sentAt: o.sentAt, status: 'Received' };
      orders.push(order);
      const msg = JSON.stringify(order);
      for (const ws of wss.clients) if (ws.readyState === 1) ws.send(msg); // push to every open staff screen
      res.writeHead(201, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ number: order.number }));
    });
    return;
  }
  if (req.method === 'GET' && req.url.startsWith('/orders?after=')) {
    const after = Number(req.url.split('=')[1]);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(orders.filter(o => o.number > after)));
    return;
  }
  res.writeHead(404); res.end();
});

const wss = new WebSocketServer({ server, path: '/live' });
server.listen(PORT, () => console.log(`spike server on :${PORT}`));
