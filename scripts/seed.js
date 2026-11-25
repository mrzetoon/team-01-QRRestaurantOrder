// `npm run seed` — creates ./data/qrmos.db with the demo menu, 6 tables and two accounts.
// `npm run seed -- --reset` deletes the existing database first.
//
// Passwords are NOT stored in the repository. Set SEED_MANAGER_PASSWORD and
// SEED_STAFF_PASSWORD (8+ characters) before seeding, or leave them unset and the script
// generates random ones and prints them once.
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { openDatabase } = require('../src/data/db');
const { createAccessControl } = require('../src/access/access');
const { createTables } = require('../src/tables/tables');
const { seed } = require('../src/data/seed');

const dbFile = process.env.DB_FILE || path.join(__dirname, '..', 'data', 'qrmos.db');
const port = Number(process.env.PORT || 3000);
const baseUrl = process.env.BASE_URL || `http://localhost:${port}`;

if (process.argv.includes('--reset')) {
  for (const f of [dbFile, `${dbFile}-wal`, `${dbFile}-shm`]) if (fs.existsSync(f)) fs.rmSync(f);
}
fs.mkdirSync(path.dirname(dbFile), { recursive: true });
const db = openDatabase(dbFile);

if (db.prepare('SELECT COUNT(*) AS n FROM users').get().n > 0) {
  console.log(`Database ${dbFile} is already seeded. Use \`npm run seed -- --reset\` to start again.`);
  process.exit(0);
}

const generated = [];
function password(envName) {
  if (process.env[envName]) return process.env[envName];
  const p = crypto.randomBytes(9).toString('base64url');
  generated.push([envName, p]);
  return p;
}

const users = [
  { username: 'manager', displayName: 'Manager', password: password('SEED_MANAGER_PASSWORD'), role: 'manager' },
  { username: 'server1', displayName: 'Server 1', password: password('SEED_STAFF_PASSWORD'), role: 'staff' },
];
seed({ db, access: createAccessControl(db), tables: createTables(db, { baseUrl }), users });

console.log(`Seeded ${dbFile}: 12 menu items, 6 tables, accounts "manager" and "server1".`);
for (const [name, p] of generated) {
  console.log(`  ${name === 'SEED_MANAGER_PASSWORD' ? 'manager' : 'server1'} password (generated, shown once): ${p}`);
}
