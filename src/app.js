// Application wiring: builds the server modules C3–C8 over one data store (C9) and exposes
// them over HTTP for the browser apps C1 (customer) and C2 (staff & manager). ADR-01.
'use strict';
const path = require('node:path');
const crypto = require('node:crypto');
const http = require('node:http');
const express = require('express');
const { openDatabase } = require('./data/db');
const { AppError } = require('./errors');
const { createAccessControl } = require('./access/access');
const { createMenu } = require('./menu/menu');
const { createTables } = require('./tables/tables');
const { createOrders } = require('./orders/orders');
const { createHub } = require('./live/hub');
const { createPaymentAdapter } = require('./payment/adapter');
const { createSandboxGateway } = require('./payment/sandbox-gateway');

const PUBLIC = path.join(__dirname, '..', 'public');

// Wraps a handler so thrown AppErrors (and async rejections) reach the error handler.
const h = (fn) => (req, res, next) => Promise.resolve().then(() => fn(req, res)).catch(next);

function createApp(options = {}) {
  const clock = options.clock || (() => new Date());
  // options.baseUrl may be a string or a function returning one.
  const baseUrl = () => String((typeof options.baseUrl === 'function' ? options.baseUrl() : options.baseUrl) || 'http://localhost:3000').replace(/\/$/, '');
  const db = options.db || openDatabase(options.dbFile || ':memory:');
  const secret = options.paymentSecret || crypto.randomBytes(32).toString('hex');

  const access = createAccessControl(db, { clock, secureCookies: baseUrl().startsWith('https:') });
  const menu = createMenu(db);
  const tables = createTables(db, { baseUrl, clock });
  const hub = createHub({ clock });
  const orders = createOrders(db, { menu, tables, events: hub, clock });
  const gateway = options.gateway || createSandboxGateway({ secret, publicBase: baseUrl });
  const payments = createPaymentAdapter(db, { orders, tables, events: hub, gateway, secret, baseUrl, clock });

  const app = express();
  app.disable('x-powered-by');
  app.use((req, res, next) => {
    res.set('X-Content-Type-Options', 'nosniff');
    res.set('Referrer-Policy', 'same-origin');
    next();
  });

  // ---------- payment webhook: raw body, needed for the signature (C8) ----------
  app.post('/api/payments/webhook', express.raw({ type: () => true, limit: '16kb' }), h((req, res) => {
    const sig = req.get(gateway.SIGNATURE_HEADER || 'x-sandbox-signature');
    res.json(payments.handleWebhook(req.body, sig));
  }));

  app.use(express.json({ limit: '32kb' }));

  // ---------- customer API (C1 → C4, C5, C6, C8): no login (FR-02) ----------
  const customer = express.Router();
  customer.get('/:token', h((req, res) => {
    const t = tables.byToken(req.params.token);
    const r = db.prepare('SELECT name FROM restaurant WHERE id = 1').get();
    res.json({ restaurant: r ? r.name : 'Restaurant', tableNumber: t.number, active: t.active });
  }));
  customer.get('/:token/menu', h((req, res) => {
    const t = tables.byToken(req.params.token);
    res.json({ tableNumber: t.number, active: t.active, categories: menu.getMenu(req.query.lang === 'es' ? 'es' : 'en') });
  }));
  customer.get('/:token/cart', h((req, res) => res.json(orders.getCart(req.params.token))));
  customer.post('/:token/cart/lines', h((req, res) => res.status(201).json(orders.addLine(req.params.token, req.body || {}))));
  customer.patch('/:token/cart/lines/:lineId', h((req, res) => res.json(orders.updateLine(req.params.token, req.params.lineId, req.body || {}))));
  customer.delete('/:token/cart/lines/:lineId', h((req, res) => res.json(orders.removeLine(req.params.token, req.params.lineId))));
  customer.post('/:token/orders', h((req, res) => {
    const { order, duplicate } = orders.submit(req.params.token, (req.body || {}).submissionKey);
    res.status(duplicate ? 200 : 201).json(order);
  }));
  customer.get('/:token/orders', h((req, res) => res.json(orders.sessionOrders(req.params.token))));
  customer.get('/:token/bill', h((req, res) => res.json(orders.bill(req.params.token))));
  customer.post('/:token/pay', h(async (req, res) => res.status(201).json(await payments.startCheckout(req.params.token))));
  customer.get('/:token/payments/:checkoutId', h((req, res) => res.json(payments.receipt(req.params.token, req.params.checkoutId))));
  customer.get('/:token/events', h((req, res) => {
    const t = tables.byToken(req.params.token);
    res.json(hub.since(`table:${t.token}`, req.query.after));
  }));
  app.use('/api/t', customer);

  // ---------- login (C3) ----------
  app.post('/api/auth/login', h((req, res) => {
    const { sid, user } = access.login((req.body || {}).username, (req.body || {}).password);
    res.set('Set-Cookie', access.cookieFor(sid)).json(user);
  }));
  app.post('/api/auth/logout', (req, res) => {
    const s = access.sessionFromCookieHeader(req.headers.cookie);
    if (s) access.logout(s.sid);
    res.set('Set-Cookie', `${access.SESSION_COOKIE}=; Path=/; Max-Age=0; HttpOnly; SameSite=Strict`).json({ ok: true });
  });
  app.get('/api/auth/me', access.requireRole('staff'), (req, res) => res.json(req.user));

  // ---------- staff API (C2 → C6, C4, C8): staff or manager session ----------
  const staff = express.Router();
  staff.use(access.requireRole('staff'));
  staff.get('/queue', h((req, res) => res.json(orders.queue({ view: req.query.view === 'kitchen' ? 'kitchen' : 'server' }))));
  staff.post('/orders/:id/status', h((req, res) => res.json(orders.changeStatus(req.params.id, (req.body || {}).to, req.user))));
  staff.post('/orders/:id/cancel', h((req, res) => res.json(orders.cancelOrder(req.params.id, (req.body || {}).reason, req.user))));
  staff.get('/orders/:id/history', h((req, res) => res.json(orders.history(req.params.id))));
  staff.post('/lines/:id/cancel', h((req, res) => res.json(orders.cancelLine(req.params.id, (req.body || {}).reason, req.user))));
  staff.get('/menu', h((req, res) => res.json(menu.getMenu('en'))));
  staff.post('/items/:id/availability', h((req, res) => {
    const item = menu.setAvailability(req.params.id, !!(req.body || {}).available);
    hub.publish('staff', 'menu.updated', { itemId: item.id, available: item.available });
    res.json(item);
  }));
  staff.get('/alerts', h((req, res) => res.json(payments.alerts())));
  staff.post('/alerts/:id/dismiss', h((req, res) => {
    payments.dismissAlert(req.params.id);
    res.json({ ok: true });
  }));
  staff.get('/events', h((req, res) => res.json(hub.since('staff', req.query.after))));
  app.use('/api/staff', staff);

  // ---------- manager API (C2 → C4, C5): manager session only ----------
  const manager = express.Router();
  manager.use(access.requireRole('manager'));
  manager.get('/categories', h((req, res) => res.json(menu.listCategories())));
  manager.post('/items', h((req, res) => res.status(201).json(menu.addItem(req.body || {}))));
  manager.put('/items/:id', h((req, res) => res.json(menu.editItem(req.params.id, req.body || {}))));
  manager.delete('/items/:id', h((req, res) => {
    menu.removeItem(req.params.id);
    res.status(204).end();
  }));
  manager.get('/tables', h((req, res) => res.json(tables.list())));
  manager.post('/tables', h((req, res) => res.status(201).json(tables.add((req.body || {}).number, (req.body || {}).label))));
  manager.patch('/tables/:id', h((req, res) => res.json(tables.update(req.params.id, req.body || {}))));
  manager.get('/tables/:id/qr.png', h(async (req, res) => res.type('png').send(await tables.qrPng(req.params.id))));
  app.use('/api/manager', manager);

  // ---------- sandbox gateway pages (stand-in for trust zone 4) ----------
  if (gateway.router) app.use('/sandbox-gateway', gateway.router());

  // ---------- pages ----------
  app.get('/t/:token', (req, res) => res.sendFile(path.join(PUBLIC, 'customer', 'index.html')));
  app.get('/t/:token/receipt', (req, res) => res.sendFile(path.join(PUBLIC, 'customer', 'receipt.html')));
  app.get(['/staff', '/staff/'], access.requirePageLogin('staff'), (req, res) => res.sendFile(path.join(PUBLIC, 'staff', 'index.html')));
  app.get(['/manager', '/manager/'], access.requirePageLogin('manager'), (req, res) => res.sendFile(path.join(PUBLIC, 'manager', 'index.html')));
  app.get('/', (req, res) => res.redirect('/staff'));
  app.use(express.static(PUBLIC, { index: false }));

  // ---------- errors ----------
  app.use('/api', (req, res) => res.status(404).json({ error: 'NOT_FOUND', message: 'No such endpoint' }));
  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    if (err instanceof AppError) return res.status(err.status).json({ error: err.code, message: err.message, ...(err.details || {}) });
    if (err.type === 'entity.parse.failed') return res.status(400).json({ error: 'BAD_JSON', message: 'Request body is not valid JSON' });
    if (!options.quiet) console.error(err);
    res.status(500).json({ error: 'SERVER_ERROR', message: 'Something went wrong' });
  });

  const server = http.createServer(app);
  hub.attach(server, (req, topic) => {
    if (topic === 'staff') return !!access.sessionFromCookieHeader(req.headers.cookie); // QR-05
    if (topic.startsWith('table:')) {
      try {
        tables.byToken(topic.slice('table:'.length));
        return true;
      } catch {
        return false;
      }
    }
    return false;
  });

  return { app, server, db, access, menu, tables, orders, hub, payments, gateway, secret };
}

module.exports = { createApp };
