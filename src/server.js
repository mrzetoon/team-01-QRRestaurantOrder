// Entry point: `npm start`. Configuration comes from environment variables only; nothing
// secret lives in the repository (P2 6.4).
//   PORT                     default 3000
//   BASE_URL                 default http://localhost:<PORT>  (use http://<laptop-ip>:<PORT> so phones can scan)
//   DB_FILE                  default ./data/qrmos.db
//   PAYMENT_WEBHOOK_SECRET   default: random per run (fine for the sandbox gateway)
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const { createApp } = require('./app');
const { openDatabase } = require('./data/db');

const port = Number(process.env.PORT || 3000);
const baseUrl = process.env.BASE_URL || `http://localhost:${port}`;
const dbFile = process.env.DB_FILE || path.join(__dirname, '..', 'data', 'qrmos.db');
fs.mkdirSync(path.dirname(dbFile), { recursive: true });

const db = openDatabase(dbFile);
if (!db.prepare('SELECT COUNT(*) AS n FROM users').get().n) {
  console.warn('No staff accounts yet. Run `npm run seed` first (see README).');
}
const { server } = createApp({ db, baseUrl, paymentSecret: process.env.PAYMENT_WEBHOOK_SECRET });
server.listen(port, () => {
  console.log(`QRMOS running at ${baseUrl}`);
  console.log(`  Staff screen:   ${baseUrl}/staff`);
  console.log(`  Manager screen: ${baseUrl}/manager`);
  for (const t of db.prepare('SELECT number, token FROM tables WHERE active = 1 ORDER BY number').all()) {
    console.log(`  Table ${t.number}:        ${baseUrl}/t/${t.token}`);
  }
});
