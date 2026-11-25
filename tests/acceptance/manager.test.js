// Acceptance tests for the manager side (UC-05, UC-06). Owner: Mohmmad Abuzetoon.
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { startSystem, client, loggedIn, newKey } = require('../helpers/harness');

let sys;
let mgr;
test.before(async () => { sys = await startSystem(); mgr = await loggedIn(sys, 'manager'); });
test.after(() => sys && sys.stop());

const menuItems = async () => (await client(sys.base).get(`/api/t/${sys.tokenOf(1)}/menu`)).data.categories.flatMap((c) => c.items);

test('T45 a manager\'s add, edit and delete each appear on a freshly loaded customer menu', async () => {
  // Oracle: FR-12 acceptance ("add, edit and delete one item: each change appears on a freshly
  // loaded customer menu").
  const cat = (await mgr.get('/api/manager/categories')).data.find((c) => c.name === 'Desserts');
  const added = await mgr.post('/api/manager/items', { name: 'Kunafa', categoryId: cat.id, priceCents: 750, description: 'Cheese pastry', allergens: ['milk', 'wheat'] });
  assert.equal(added.status, 201);
  assert.equal((await menuItems()).find((i) => i.name === 'Kunafa').priceCents, 750);
  await mgr.put(`/api/manager/items/${added.data.id}`, { priceCents: 800, name: 'Kunafa Slice' });
  const edited = (await menuItems()).find((i) => i.id === added.data.id);
  assert.deepEqual([edited.name, edited.priceCents], ['Kunafa Slice', 800]);
  assert.equal((await mgr.del(`/api/manager/items/${added.data.id}`)).status, 204);
  assert.ok(!(await menuItems()).some((i) => i.id === added.data.id));
});

test('T46 a negative price or an empty name is refused', async () => {
  // Oracle: FR-03 (each item shows a name and a price); a negative price cannot be charged.
  const cat = (await mgr.get('/api/manager/categories')).data[0];
  assert.equal((await mgr.post('/api/manager/items', { name: 'X', categoryId: cat.id, priceCents: -1 })).status, 400);
  assert.equal((await mgr.post('/api/manager/items', { name: '  ', categoryId: cat.id, priceCents: 100 })).status, 400);
  assert.equal((await mgr.post('/api/manager/items', { name: 'Free water', categoryId: cat.id, priceCents: 0 })).status, 201);
});

test('T47 a deactivated table says it is not taking orders and refuses Submit, keeping the cart', async () => {
  // Oracle: FR-15 acceptance ("deactivate table 4 and scan its code: the page says the table
  // is not active and the Submit action is unavailable") and UC-01 alternate 12b ("the cart is kept").
  const token = sys.tokenOf(4);
  const phone = client(sys.base);
  await phone.post(`/api/t/${token}/cart/lines`, { itemId: sys.itemId('Hummus Plate') });
  const t4 = (await mgr.get('/api/manager/tables')).data.find((t) => t.number === 4);
  await mgr.patch(`/api/manager/tables/${t4.id}`, { active: false });
  assert.equal((await phone.get(`/api/t/${token}/menu`)).data.active, false);
  const r = await phone.post(`/api/t/${token}/orders`, { submissionKey: newKey() });
  assert.equal(r.status, 403);
  assert.equal(r.data.error, 'TABLE_INACTIVE');
  assert.equal((await phone.get(`/api/t/${token}/cart`)).data.lineCount, 1);
  await mgr.patch(`/api/manager/tables/${t4.id}`, { active: true });
  assert.equal((await phone.post(`/api/t/${token}/orders`, { submissionKey: newKey() })).status, 201);
});

test('T48 a manager can add a table; a duplicate table number is refused', async () => {
  // Oracle: FR-15 ("add, rename and deactivate tables") and FR-01 ("a URL unique to that table").
  const r = await mgr.post('/api/manager/tables', { number: 7 });
  assert.equal(r.status, 201);
  assert.match(r.data.url, /\/t\/[A-Za-z0-9_-]{10}$/);
  assert.equal((await mgr.post('/api/manager/tables', { number: 7 })).status, 409);
  assert.equal((await mgr.patch(`/api/manager/tables/${r.data.id}`, { label: 'Patio 7' })).data.label, 'Patio 7');
});
