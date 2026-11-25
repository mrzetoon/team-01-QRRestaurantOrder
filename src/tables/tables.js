// C5 Table & QR Manager — tables, table links, QR images, active/inactive (FR-01, FR-15).
'use strict';
const crypto = require('node:crypto');
const QRCode = require('qrcode');
const { AppError } = require('../errors');

function newToken() {
  // 10 URL-safe characters: hard to guess, short enough for a QR code.
  return crypto.randomBytes(8).toString('base64url').slice(0, 10);
}

function createTables(db, { baseUrl, clock = () => new Date() }) {
  function view(row) {
    return { id: row.id, number: row.number, label: row.label, token: row.token, active: row.active === 1, url: urlFor(row.token) };
  }

  // baseUrl may be a string or a function (the tests learn their port only after listen).
  const base = () => String(typeof baseUrl === 'function' ? baseUrl() : baseUrl).replace(/\/$/, '');

  function urlFor(token) {
    return `${base()}/t/${token}`;
  }

  function list() {
    return db.prepare('SELECT * FROM tables ORDER BY number').all().map(view);
  }

  function add(number, label) {
    const n = Number(number);
    if (!Number.isInteger(n) || n < 1) throw new AppError(400, 'BAD_TABLE', 'Table number must be 1 or more');
    if (db.prepare('SELECT id FROM tables WHERE number = ?').get(n)) throw new AppError(409, 'TABLE_EXISTS', `Table ${n} already exists`);
    let token = newToken();
    while (db.prepare('SELECT id FROM tables WHERE token = ?').get(token)) token = newToken();
    const r = db.prepare('INSERT INTO tables (number, label, token, active) VALUES (?, ?, ?, 1)').run(n, label || `Table ${n}`, token);
    return byId(Number(r.lastInsertRowid));
  }

  function byId(id) {
    const row = db.prepare('SELECT * FROM tables WHERE id = ?').get(Number(id));
    if (!row) throw new AppError(404, 'NO_TABLE', 'No such table');
    return view(row);
  }

  function byToken(token) {
    const row = db.prepare('SELECT * FROM tables WHERE token = ?').get(String(token));
    if (!row) throw new AppError(404, 'NO_TABLE', 'This table link is not valid');
    return view(row);
  }

  function update(id, { label, active }) {
    const t = byId(id);
    db.prepare('UPDATE tables SET label = ?, active = ? WHERE id = ?')
      .run(label ?? t.label, active === undefined ? (t.active ? 1 : 0) : active ? 1 : 0, t.id);
    return byId(t.id);
  }

  // The open session of a table, created on first use; a session closes when its bill is
  // fully paid (C6), and the next scan starts a new one.
  function currentSession(tableId) {
    const s = db.prepare('SELECT * FROM table_sessions WHERE table_id = ? AND closed_at IS NULL ORDER BY id DESC').get(tableId);
    if (s) return s;
    const r = db.prepare('INSERT INTO table_sessions (table_id, opened_at) VALUES (?, ?)').run(tableId, clock().toISOString());
    return db.prepare('SELECT * FROM table_sessions WHERE id = ?').get(Number(r.lastInsertRowid));
  }

  async function qrPng(id) {
    const t = byId(id);
    return QRCode.toBuffer(t.url, { type: 'png', width: 320, margin: 2, errorCorrectionLevel: 'M' });
  }

  return { list, add, byId, byToken, update, currentSession, qrPng, urlFor };
}

module.exports = { createTables };
