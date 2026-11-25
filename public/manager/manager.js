// C2 Staff & Manager Web App (manager part) — menu editing (UC-05, FR-12) and tables with
// printable QR codes (UC-06, FR-01, FR-15).
(function () {
  'use strict';
  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  async function call(path, opts = {}) {
    const r = await fetch(path, { credentials: 'same-origin', headers: { 'content-type': 'application/json' }, ...opts });
    if (r.status === 401 || r.status === 403) { location.href = '/login.html?next=%2Fmanager'; throw new Error('login'); }
    const body = r.status === 204 ? null : await r.json();
    if (!r.ok) throw new Error(body && body.message);
    return body;
  }
  const fail = (e) => { $('err').textContent = e.message; $('err').classList.remove('hidden'); };

  async function loadItems() {
    const [cats, menu] = await Promise.all([call('/api/manager/categories'), call('/api/staff/menu')]);
    $('nCat').innerHTML = cats.map((c) => `<option value="${c.id}">${esc(c.name)}</option>`).join('');
    $('items').innerHTML = '<tr><th>Item</th><th>Category</th><th>Price ($)</th><th>Allergens</th><th>Available</th><th></th></tr>' +
      menu.flatMap((c) => c.items.map((i) => `<tr data-id="${i.id}">
        <td>${esc(i.name)}</td><td>${esc(c.name)}</td>
        <td><input type="number" min="0" step="0.01" value="${(i.priceCents / 100).toFixed(2)}" aria-label="Price of ${esc(i.name)}"></td>
        <td class="muted small">${esc(i.allergens.join(', '))}</td>
        <td>${i.available ? 'Yes' : '<span class="badge CANCELLED">Sold out</span>'}</td>
        <td><button class="btn small" type="button" data-save>Save price</button> <button class="btn small danger" type="button" data-del>Delete</button></td></tr>`)).join('');
  }

  $('items').addEventListener('click', async (e) => {
    const tr = e.target.closest('tr[data-id]');
    if (!tr) return;
    try {
      if (e.target.hasAttribute('data-save')) {
        const cents = Math.round(Number(tr.querySelector('input').value) * 100);
        await call(`/api/manager/items/${tr.dataset.id}`, { method: 'PUT', body: JSON.stringify({ priceCents: cents }) });
      } else if (e.target.hasAttribute('data-del')) {
        await call(`/api/manager/items/${tr.dataset.id}`, { method: 'DELETE' });
      } else return;
      await loadItems();
    } catch (err) { fail(err); }
  });

  $('addItem').addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
      await call('/api/manager/items', { method: 'POST', body: JSON.stringify({
        name: $('nName').value, nameEs: $('nNameEs').value || null, categoryId: Number($('nCat').value),
        priceCents: Math.round(Number($('nPrice').value) * 100), description: $('nDesc').value,
        allergens: $('nAll').value.split(',').map((s) => s.trim()).filter(Boolean),
      }) });
      e.target.reset();
      await loadItems();
    } catch (err) { fail(err); }
  });

  async function loadTables() {
    const list = await call('/api/manager/tables');
    $('tables').innerHTML = list.map((t) => `<div class="panel tcard" data-id="${t.id}">
      <strong>${esc(t.label)}</strong> ${t.active ? '' : '<span class="badge CANCELLED">Inactive</span>'}
      <div><img src="/api/manager/tables/${t.id}/qr.png" alt="QR code for ${esc(t.label)}"></div>
      <div class="url">${esc(t.url)}</div>
      <button class="btn small ${t.active ? 'danger' : 'primary'}" type="button" data-active="${t.active ? 0 : 1}">${t.active ? 'Deactivate' : 'Activate'}</button></div>`).join('');
  }

  $('tables').addEventListener('click', async (e) => {
    const card = e.target.closest('[data-id]');
    if (!card || !e.target.dataset.active) return;
    try {
      await call(`/api/manager/tables/${card.dataset.id}`, { method: 'PATCH', body: JSON.stringify({ active: e.target.dataset.active === '1' }) });
      await loadTables();
    } catch (err) { fail(err); }
  });

  $('addTable').addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
      await call('/api/manager/tables', { method: 'POST', body: JSON.stringify({ number: Number($('tNum').value) }) });
      e.target.reset();
      await loadTables();
    } catch (err) { fail(err); }
  });

  loadItems().catch(fail);
  loadTables().catch(fail);
})();
