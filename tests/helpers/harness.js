// Test harness: a fresh in-memory system per test file, the demo seed data, a clock the
// test controls, and a tiny HTTP client that keeps cookies. Test passwords are generated
// per run; none is stored in the repository.
'use strict';
const crypto = require('node:crypto');
const { createApp } = require('../../src/app');
const { seed } = require('../../src/data/seed');

function makeClock(start = '2026-11-20T18:00:00.000Z') {
  let t = new Date(start).getTime();
  const clock = () => new Date(t);
  clock.advanceMinutes = (m) => { t += m * 60000; };
  clock.advanceSeconds = (s) => { t += s * 1000; };
  return clock;
}

async function startSystem({ clock = makeClock() } = {}) {
  const passwords = { manager: crypto.randomBytes(9).toString('hex'), staff: crypto.randomBytes(9).toString('hex') };
  // Port is known only after listen, so baseUrl is patched in through a late-bound object.
  const late = { base: 'http://127.0.0.1:0' };
  const sys = createApp({ clock, baseUrl: () => late.base, quiet: true, paymentSecret: crypto.randomBytes(32).toString('hex') });
  await new Promise((resolve) => sys.server.listen(0, '127.0.0.1', resolve));
  late.base = `http://127.0.0.1:${sys.server.address().port}`;
  sys.base = late.base;
  sys.stop = () => new Promise((resolve) => { sys.server.closeAllConnections?.(); sys.server.close(resolve); });
  try {
    seed({ db: sys.db, access: sys.access, tables: sys.tables, users: [
      { username: 'manager', displayName: 'Manager', password: passwords.manager, role: 'manager' },
      { username: 'server1', displayName: 'Server 1', password: passwords.staff, role: 'staff' },
    ] });
  } catch (err) {
    await sys.stop();
    throw err;
  }
  sys.passwords = passwords;
  sys.clock = clock;
  sys.tokenOf = (n) => sys.tables.list().find((t) => t.number === n).token;
  sys.itemId = (name) => sys.db.prepare('SELECT id FROM items WHERE name = ?').get(name).id;
  sys.optionId = (itemName, optName) => sys.db.prepare(
    'SELECT o.id FROM item_options o JOIN items i ON i.id = o.item_id WHERE i.name = ? AND o.name = ?').get(itemName, optName).id;
  return sys;
}

// Minimal fetch wrapper with a cookie jar, so a "browser" can log in.
function client(base) {
  let cookie = '';
  async function req(method, path, body, headers = {}) {
    const res = await fetch(base + path, {
      method,
      redirect: 'manual',
      headers: { ...(body !== undefined ? { 'content-type': 'application/json' } : {}), ...(cookie ? { cookie } : {}), ...headers },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    const set = res.headers.get('set-cookie');
    if (set) cookie = set.split(';')[0];
    const type = res.headers.get('content-type') || '';
    const data = type.includes('json') ? await res.json() : type.includes('image') ? Buffer.from(await res.arrayBuffer()) : await res.text();
    return { status: res.status, data, headers: res.headers };
  }
  return {
    get: (p, h) => req('GET', p, undefined, h),
    post: (p, b, h) => req('POST', p, b === undefined ? {} : b, h),
    put: (p, b) => req('PUT', p, b),
    patch: (p, b) => req('PATCH', p, b),
    del: (p) => req('DELETE', p),
    get cookie() { return cookie; },
  };
}

async function loggedIn(sys, who = 'staff') {
  const c = client(sys.base);
  const username = who === 'manager' ? 'manager' : 'server1';
  const r = await c.post('/api/auth/login', { username, password: sys.passwords[who] });
  if (r.status !== 200) throw new Error(`login failed: ${r.status}`);
  return c;
}

let keyCounter = 0;
const newKey = () => `testkey-${Date.now()}-${++keyCounter}`;

module.exports = { startSystem, client, loggedIn, makeClock, newKey };
