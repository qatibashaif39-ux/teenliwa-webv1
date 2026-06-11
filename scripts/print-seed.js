#!/usr/bin/env node
import crypto from 'node:crypto';

function makeId() { return crypto.randomUUID(); }

const categories = [
  { id: makeId(), name: 'تين', sort_order: 1 },
  { id: makeId(), name: 'تمور', sort_order: 2 },
  { id: makeId(), name: 'فواكه', sort_order: 3 },
  { id: makeId(), name: 'مكسرات', sort_order: 4 }
];

const catMap = Object.fromEntries(categories.map(c => [c.name, c.id]));

const products = [
  { id: makeId(), name: 'تين أحمر طازج', description: 'كيلو تين أحمر طبيعي 100% طازج ولذيذ. القص والتوصيل في نفس اليوم!', price: 100, seed_key: 'red-fig', available: true, category_id: catMap['تين'], sort_order: 1 },
  { id: makeId(), name: 'تين أصفر طازج', description: 'كيلو تين أصفر طازج طبيعي كالعسل — القص والتوصيل في نفس اليوم!', price: 100, seed_key: 'yellow-fig', available: true, category_id: catMap['تين'], sort_order: 2 },
  { id: makeId(), name: 'تمر جلاكسي سكري', description: 'تمر سكري الطعم عسل، عبوة فاخرة.', price: 150, seed_key: 'dates', available: true, category_id: catMap['تمور'], sort_order: 3 },
  { id: makeId(), name: 'تمر صقعي (3 كيلو)', description: 'تمر صقعي فاخر — عبوة 3 كيلو.', price: 150, seed_key: 'dates', available: true, category_id: catMap['تمور'], sort_order: 4 },
  { id: makeId(), name: 'تمر شيشي (3 كيلو)', description: 'تمر شيشي فاخر — عبوة 3 كيلو.', price: 150, seed_key: 'dates', available: true, category_id: catMap['تمور'], sort_order: 5 },
  { id: makeId(), name: 'تمر صفوي (3 كيلو)', description: 'تمر صفوي فاخر — عبوة 3 كيلو.', price: 150, seed_key: 'dates', available: false, category_id: catMap['تمور'], sort_order: 6 },
  { id: makeId(), name: 'توت طويل', description: 'توت كيلو ب 100 درهم فاخر الطعم عسل.', price: 100, seed_key: 'mulberry', available: false, category_id: catMap['فواكه'], sort_order: 7 },
  { id: makeId(), name: 'صبار كيلو', description: 'صبار طازج كيلو الطعم سكر.', price: 100, seed_key: 'cactus', available: false, category_id: catMap['فواكه'], sort_order: 8 },
  { id: makeId(), name: 'فقع علبة 400 جرام', description: 'فقع درجة أولى — وزن 400 جرام.', price: 150, seed_key: 'truffle', available: true, category_id: catMap['فواكه'], sort_order: 9 },
  { id: makeId(), name: 'لوز الحبان البحريني', description: 'لوز الحبان البحريني الفاخر.', price: 200, seed_key: 'almonds', available: true, category_id: catMap['مكسرات'], sort_order: 10 }
];

console.log('\n=== Categories (JSON) ===\n');
console.log(JSON.stringify(categories, null, 2));

console.log('\n=== Products (JSON) ===\n');
console.log(JSON.stringify(products, null, 2));

console.log('\n=== SQL INSERTS ===\n');
for (const c of categories) {
  console.log(`INSERT INTO categories (id, name, sort_order) VALUES ('${c.id}', '${c.name.replace(/'/g, "''")}', ${c.sort_order});`);
}
for (const p of products) {
  const desc = p.description.replace(/'/g, "''");
  console.log(`INSERT INTO products (id, name, description, price, image_url, seed_key, available, category_id, sort_order, min_qty) VALUES ('${p.id}', '${p.name.replace(/'/g, "''")}', '${desc}', ${p.price}, NULL, '${p.seed_key}', ${p.available ? 'TRUE' : 'FALSE'}, '${p.category_id}', ${p.sort_order}, 1);`);
}

console.log('\nDone. Run these SQL statements or `npm run seed` after you have Postgres set up.\n');
