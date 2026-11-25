// Demo data for the demonstration and the tests: one restaurant, 6 tables, an invented
// 12-item menu in English and Spanish. No real restaurant's menu and no personal data.
'use strict';

const RESTAURANT = 'QRMOS Demo Kitchen';

const CATEGORIES = [
  { key: 'starters', name: 'Starters', nameEs: 'Entradas' },
  { key: 'mains', name: 'Mains', nameEs: 'Platos principales' },
  { key: 'desserts', name: 'Desserts', nameEs: 'Postres' },
  { key: 'drinks', name: 'Drinks', nameEs: 'Bebidas' },
];

// Prices in cents. Allergens follow the common-allergen list used on the menu (FR-25).
const ITEMS = [
  { cat: 'starters', name: 'Hummus Plate', nameEs: 'Plato de hummus', desc: 'Chickpea dip with olive oil and warm pita.', descEs: 'Puré de garbanzo con aceite de oliva y pan pita caliente.', price: 695, allergens: ['sesame', 'wheat'] },
  { cat: 'starters', name: 'Lentil Soup', nameEs: 'Sopa de lentejas', desc: 'Red lentils, cumin and lemon.', descEs: 'Lentejas rojas, comino y limón.', price: 550, allergens: [],
    options: [{ group: 'Size', name: 'Cup', nameEs: 'Taza', delta: 0 }, { group: 'Size', name: 'Bowl', nameEs: 'Tazón', delta: 250 }] },
  { cat: 'starters', name: 'Falafel (6)', nameEs: 'Falafel (6)', desc: 'Crisp chickpea fritters with tahini.', descEs: 'Croquetas de garbanzo con tahini.', price: 750, allergens: ['sesame'] },
  { cat: 'mains', name: 'Chicken Shawarma', nameEs: 'Shawarma de pollo', desc: 'Marinated chicken, garlic sauce, pickles, fries.', descEs: 'Pollo marinado, salsa de ajo, encurtidos y papas.', price: 1495, allergens: ['milk', 'wheat'],
    options: [{ group: 'Size', name: 'Regular', nameEs: 'Normal', delta: 0 }, { group: 'Size', name: 'Large', nameEs: 'Grande', delta: 400 }] },
  { cat: 'mains', name: 'Beef Burger', nameEs: 'Hamburguesa de res', desc: 'Grilled beef patty, lettuce, tomato, cheese.', descEs: 'Carne a la parrilla, lechuga, tomate y queso.', price: 1350, allergens: ['milk', 'wheat', 'egg'],
    options: [{ group: 'Size', name: 'Regular', nameEs: 'Normal', delta: 0 }, { group: 'Size', name: 'Large', nameEs: 'Grande', delta: 300 },
      { group: 'Side', name: 'Fries', nameEs: 'Papas fritas', delta: 0 }, { group: 'Side', name: 'Salad', nameEs: 'Ensalada', delta: 100 }] },
  { cat: 'mains', name: 'Lamb Kebab', nameEs: 'Kebab de cordero', desc: 'Two skewers with rice and grilled vegetables.', descEs: 'Dos brochetas con arroz y verduras asadas.', price: 1895, allergens: [] },
  { cat: 'mains', name: 'Veggie Bowl', nameEs: 'Tazón vegetariano', desc: 'Rice, roasted vegetables, chickpeas and nuts.', descEs: 'Arroz, verduras asadas, garbanzos y nueces.', price: 1250, allergens: ['tree nuts'] },
  { cat: 'desserts', name: 'Baklava', nameEs: 'Baklava', desc: 'Layers of filo, pistachio and honey syrup.', descEs: 'Capas de masa filo, pistacho y almíbar de miel.', price: 595, allergens: ['tree nuts', 'wheat', 'milk'] },
  { cat: 'desserts', name: 'Rice Pudding', nameEs: 'Arroz con leche', desc: 'Cold rice pudding with cinnamon.', descEs: 'Arroz con leche frío con canela.', price: 495, allergens: ['milk'] },
  { cat: 'drinks', name: 'Mint Lemonade', nameEs: 'Limonada con menta', desc: 'Fresh lemon and mint.', descEs: 'Limón fresco y menta.', price: 395, allergens: [] },
  { cat: 'drinks', name: 'Turkish Coffee', nameEs: 'Café turco', desc: 'Strong, unfiltered coffee.', descEs: 'Café fuerte sin filtrar.', price: 350, allergens: [] },
  { cat: 'drinks', name: 'Bottled Water', nameEs: 'Agua embotellada', desc: '500 ml.', descEs: '500 ml.', price: 200, allergens: [] },
];

// Fills an empty database. `users` is a list of { username, displayName, password, role }.
function seed({ db, access, tables, users = [], tableCount = 6 }) {
  db.prepare('INSERT OR REPLACE INTO restaurant (id, name) VALUES (1, ?)').run(RESTAURANT);
  const catIds = {};
  CATEGORIES.forEach((c, i) => {
    const r = db.prepare('INSERT INTO categories (name, name_es, position) VALUES (?, ?, ?)').run(c.name, c.nameEs, i);
    catIds[c.key] = Number(r.lastInsertRowid);
  });
  for (const it of ITEMS) {
    const r = db.prepare(`INSERT INTO items (category_id, name, name_es, description, description_es, price_cents, allergens)
      VALUES (?, ?, ?, ?, ?, ?, ?)`).run(catIds[it.cat], it.name, it.nameEs, it.desc, it.descEs, it.price, it.allergens.join(','));
    const id = Number(r.lastInsertRowid);
    for (const o of it.options || []) {
      db.prepare('INSERT INTO item_options (item_id, group_name, name, name_es, price_delta_cents) VALUES (?, ?, ?, ?, ?)')
        .run(id, o.group, o.name, o.nameEs, o.delta);
    }
  }
  for (let n = 1; n <= tableCount; n += 1) tables.add(n, `Table ${n}`);
  for (const u of users) access.createUser(u);
}

module.exports = { seed, ITEMS, CATEGORIES, RESTAURANT };
