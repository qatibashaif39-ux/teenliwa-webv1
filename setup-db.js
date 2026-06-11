#!/usr/bin/env node
import pg from 'pg';
import crypto from 'crypto';
import dns from 'dns';

// محاولة إصلاح DNS (لحل مشكلة ENOTFOUND أحياناً)
dns.setServers(['8.8.8.8', '1.1.1.1']);

const { Pool } = pg;

// استخدم رابط Session pooler الصحيح (عدّل كلمة المرور إذا لزم الأمر)
const connectionString = process.env.DATABASE_URL || 'postgresql://postgres.vxwdmjwdkphqhywlfazc:Teen-liwe147@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres';

console.log('🔌 محاولة الاتصال بقاعدة البيانات...');

const pool = new Pool({ 
  connectionString,
  connectionTimeoutMillis: 10000,
  idleTimeoutMillis: 30000,
});

async function setupDatabase() {
  const client = await pool.connect();
  try {
    console.log('✅ تم الاتصال بقاعدة البيانات.');

    // بدء المعاملة
    await client.query('BEGIN');

    // 1. إنشاء الجداول
    console.log('📦 إنشاء الجداول (categories, products, orders)...');
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        sort_order INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMP NOT NULL DEFAULT now(),
        updated_at TIMESTAMP NOT NULL DEFAULT now()
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS products (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT NOT NULL DEFAULT '',
        price NUMERIC NOT NULL DEFAULT 0,
        image_url TEXT,
        seed_key TEXT,
        available BOOLEAN NOT NULL DEFAULT TRUE,
        category_id TEXT REFERENCES categories(id) ON DELETE SET NULL,
        sort_order INTEGER NOT NULL DEFAULT 0,
        min_qty INTEGER NOT NULL DEFAULT 1,
        created_at TIMESTAMP NOT NULL DEFAULT now(),
        updated_at TIMESTAMP NOT NULL DEFAULT now()
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id TEXT PRIMARY KEY,
        tracking TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        phone TEXT NOT NULL,
        address TEXT NOT NULL,
        items_json TEXT NOT NULL,
        total NUMERIC NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        created_at BIGINT NOT NULL,
        cancelled_at BIGINT
      );
    `);

    // 2. تفعيل pgcrypto لتوليد UUID (إن لم يكن موجوداً)
    await client.query(`CREATE EXTENSION IF NOT EXISTS pgcrypto;`);

    // 3. التحقق مما إذا كانت التصنيفات موجودة بالفعل
    const res = await client.query(`SELECT COUNT(*)::int as count FROM categories`);
    const count = res.rows[0].count;
    
    if (count > 0) {
      console.log('⚠️ البيانات موجودة مسبقاً (جدول التصنيفات ليس فارغاً). لن يتم إدراج بيانات جديدة.');
      await client.query('COMMIT');
      console.log('✅ العملية كاملة (لم يتم تغيير أي شيء).');
      return;
    }

    console.log('🌱 إدراج التصنيفات والمنتجات الأولية...');

    // إدراج التصنيفات
    const categories = [
      { name: 'تين', sort_order: 1 },
      { name: 'تمور', sort_order: 2 },
      { name: 'فواكه', sort_order: 3 },
      { name: 'مكسرات', sort_order: 4 }
    ];

    const catMap = {};
    for (const cat of categories) {
      const id = crypto.randomUUID();
      await client.query(
        `INSERT INTO categories (id, name, sort_order) VALUES ($1, $2, $3) ON CONFLICT (name) DO NOTHING`,
        [id, cat.name, cat.sort_order]
      );
      catMap[cat.name] = id;
    }

    // إعادة استرجاع معرفات التصنيفات (في حال تم إدراجها مسبقاً)
    const { rows: catRows } = await client.query(`SELECT id, name FROM categories`);
    for (const row of catRows) {
      catMap[row.name] = row.id;
    }

    // إدراج المنتجات
    const products = [
      { name: 'تين أحمر طازج', description: 'كيلو تين أحمر طبيعي 100% طازج ولذيذ. القص والتوصيل في نفس اليوم!', price: 100, seed_key: 'red-fig', available: true, sort_order: 1, cat_name: 'تين' },
      { name: 'تين أصفر طازج', description: 'كيلو تين أصفر طازج طبيعي كالعسل — القص والتوصيل في نفس اليوم!', price: 100, seed_key: 'yellow-fig', available: true, sort_order: 2, cat_name: 'تين' },
      { name: 'تمر جلاكسي سكري', description: 'تمر سكري الطعم عسل، عبوة فاخرة.', price: 150, seed_key: 'dates', available: true, sort_order: 3, cat_name: 'تمور' },
      { name: 'تمر صقعي (3 كيلو)', description: 'تمر صقعي فاخر — عبوة 3 كيلو.', price: 150, seed_key: 'dates', available: true, sort_order: 4, cat_name: 'تمور' },
      { name: 'تمر شيشي (3 كيلو)', description: 'تمر شيشي فاخر — عبوة 3 كيلو.', price: 150, seed_key: 'dates', available: true, sort_order: 5, cat_name: 'تمور' },
      { name: 'تمر صفوي (3 كيلو)', description: 'تمر صفوي فاخر — عبوة 3 كيلو.', price: 150, seed_key: 'dates', available: false, sort_order: 6, cat_name: 'تمور' },
      { name: 'توت طويل', description: 'توت كيلو ب 100 درهم فاخر الطعم عسل.', price: 100, seed_key: 'mulberry', available: false, sort_order: 7, cat_name: 'فواكه' },
      { name: 'صبار كيلو', description: 'صبار طازج كيلو الطعم سكر.', price: 100, seed_key: 'cactus', available: false, sort_order: 8, cat_name: 'فواكه' },
      { name: 'فقع علبة 400 جرام', description: 'فقع درجة أولى — وزن 400 جرام.', price: 150, seed_key: 'truffle', available: true, sort_order: 9, cat_name: 'فواكه' },
      { name: 'لوز الحبان البحريني', description: 'لوز الحبان البحريني الفاخر.', price: 200, seed_key: 'almonds', available: true, sort_order: 10, cat_name: 'مكسرات' }
    ];

    for (const p of products) {
      const categoryId = catMap[p.cat_name];
      if (!categoryId) {
        console.error(`❌ التصنيف "${p.cat_name}" غير موجود للمنتج ${p.name}`);
        continue;
      }
      await client.query(
        `INSERT INTO products (id, name, description, price, image_url, seed_key, available, category_id, sort_order, min_qty)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         ON CONFLICT (id) DO NOTHING`,
        [crypto.randomUUID(), p.name, p.description, p.price, null, p.seed_key, p.available, categoryId, p.sort_order, 1]
      );
    }

    await client.query('COMMIT');
    console.log('🎉 تم إعداد قاعدة البيانات بنجاح (الجداول + البيانات الأولية).');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ فشل إعداد قاعدة البيانات:');
    console.error(err);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

setupDatabase();

