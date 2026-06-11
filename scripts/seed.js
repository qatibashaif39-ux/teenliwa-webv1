#!/usr/bin/env node
import pg from 'pg';
import process from 'node:process';

const { Pool } = pg;
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('ERROR: DATABASE_URL environment variable is not set.');
  process.exit(1);
}

const pool = new Pool({ connectionString });

async function seed() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { rows } = await client.query('SELECT COUNT(*)::int as count FROM categories');
    const count = Number(rows[0]?.count ?? 0);
    if (count > 0) {
      console.log('Database already seeded (categories exist).');
      await client.query('COMMIT');
      return;
    }

    console.log('Seeding database with initial categories and products...');

    const categoriesToSeed = [
      { id: crypto.randomUUID(), name: 'تين', sort_order: 1 },
      { id: crypto.randomUUID(), name: 'تمور', sort_order: 2 },
      { id: crypto.randomUUID(), name: 'فواكه', sort_order: 3 },
      { id: crypto.randomUUID(), name: 'مكسرات', sort_order: 4 }
    ];

    for (const cat of categoriesToSeed) {
      await client.query(
        'INSERT INTO categories (id, name, sort_order) VALUES ($1, $2, $3)',
        [cat.id, cat.name, cat.sort_order]
      );
    }

    const catMap = {};
    for (const c of categoriesToSeed) catMap[c.name] = c.id;

    const productsToSeed = [
      {
        id: crypto.randomUUID(),
        name: 'تين أحمر طازج',
        description: 'كيلو تين أحمر طبيعي 100% طازج ولذيذ. القص والتوصيل في نفس اليوم!',
        price: 100,
        seed_key: 'red-fig',
        available: true,
        category_id: catMap['تين'],
        sort_order: 1
      },
      {
        id: crypto.randomUUID(),
        name: 'تين أصفر طازج',
        description: 'كيلو تين أصفر طازج طبيعي كالعسل — القص والتوصيل في نفس اليوم!',
        price: 100,
        seed_key: 'yellow-fig',
        available: true,
        category_id: catMap['تين'],
        sort_order: 2
      },
      {
        id: crypto.randomUUID(),
        name: 'تمر جلاكسي سكري',
        description: 'تمر سكري الطعم عسل، عبوة فاخرة.',
        price: 150,
        seed_key: 'dates',
        available: true,
        category_id: catMap['تمور'],
        sort_order: 3
      },
      {
        id: crypto.randomUUID(),
        name: 'تمر صقعي (3 كيلو)',
        description: 'تمر صقعي فاخر — عبوة 3 كيلو.',
        price: 150,
        seed_key: 'dates',
        available: true,
        category_id: catMap['تمور'],
        sort_order: 4
      },
      {
        id: crypto.randomUUID(),
        name: 'تمر شيشي (3 كيلو)',
        description: 'تمر شيشي فاخر — عبوة 3 كيلو.',
        price: 150,
        seed_key: 'dates',
        available: true,
        category_id: catMap['تمور'],
        sort_order: 5
      },
      {
        id: crypto.randomUUID(),
        name: 'تمر صفوي (3 كيلو)',
        description: 'تمر صفوي فاخر — عبوة 3 كيلو.',
        price: 150,
        seed_key: 'dates',
        available: false,
        category_id: catMap['تمور'],
        sort_order: 6
      },
      {
        id: crypto.randomUUID(),
        name: 'توت طويل',
        description: 'توت كيلو ب 100 درهم فاخر الطعم عسل.',
        price: 100,
        seed_key: 'mulberry',
        available: false,
        category_id: catMap['فواكه'],
        sort_order: 7
      },
      {
        id: crypto.randomUUID(),
        name: 'صبار كيلو',
        description: 'صبار طازج كيلو الطعم سكر.',
        price: 100,
        seed_key: 'cactus',
        available: false,
        category_id: catMap['فواكه'],
        sort_order: 8
      },
      {
        id: crypto.randomUUID(),
        name: 'فقع علبة 400 جرام',
        description: 'فقع درجة أولى — وزن 400 جرام.',
        price: 150,
        seed_key: 'truffle',
        available: true,
        category_id: catMap['فواكه'],
        sort_order: 9
      },
      {
        id: crypto.randomUUID(),
        name: 'لوز الحبان البحريني',
        description: 'لوز الحبان البحريني الفاخر.',
        price: 200,
        seed_key: 'almonds',
        available: true,
        category_id: catMap['مكسرات'],
        sort_order: 10
      }
    ];

    for (const prod of productsToSeed) {
      await client.query(
        `INSERT INTO products (id, name, description, price, image_url, seed_key, available, category_id, sort_order, min_qty)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
        [prod.id, prod.name, prod.description, prod.price, null, prod.seed_key, prod.available, prod.category_id, prod.sort_order, 1]
      );
    }

    await client.query('COMMIT');
    console.log('Seed completed.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Seed failed:', err);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
