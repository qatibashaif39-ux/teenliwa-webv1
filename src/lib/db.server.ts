import { DatabaseSync } from "node:sqlite";
import { join } from "node:path";

let dbInstance: DatabaseSync | null = null;

export function getDb(): DatabaseSync {
  if (dbInstance) return dbInstance;

  const dbPath = join(process.cwd(), "data.db");
  const db = new DatabaseSync(dbPath);

  // Initialize tables
  db.exec(`
    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      price REAL NOT NULL DEFAULT 0.0,
      image_url TEXT,
      seed_key TEXT,
      available INTEGER NOT NULL DEFAULT 1,
      category_id TEXT REFERENCES categories(id) ON DELETE SET NULL,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      tracking TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      phone TEXT NOT NULL,
      address TEXT NOT NULL,
      items_json TEXT NOT NULL,
      total REAL NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      created_at INTEGER NOT NULL,
      cancelled_at INTEGER
    );
  `);

  // Check if seeding is needed
  const categoryCountPrep = db.prepare("SELECT COUNT(*) as count FROM categories");
  const categoryCountResult = categoryCountPrep.get() as { count: number };

  if (categoryCountResult.count === 0) {
    console.log("Seeding SQLite database...");
    
    // Seed categories
    const categoriesToSeed = [
      { id: crypto.randomUUID(), name: "تين", sort_order: 1 },
      { id: crypto.randomUUID(), name: "تمور", sort_order: 2 },
      { id: crypto.randomUUID(), name: "فواكه", sort_order: 3 },
      { id: crypto.randomUUID(), name: "مكسرات", sort_order: 4 }
    ];

    const insertCategory = db.prepare(
      "INSERT INTO categories (id, name, sort_order) VALUES (?, ?, ?)"
    );

    for (const cat of categoriesToSeed) {
      insertCategory.run(cat.id, cat.name, cat.sort_order);
    }

    // Map names to IDs for products
    const catMap: Record<string, string> = {};
    for (const cat of categoriesToSeed) {
      catMap[cat.name] = cat.id;
    }

    // Seed products
    const productsToSeed = [
      {
        id: crypto.randomUUID(),
        name: "تين أحمر طازج",
        description: "كيلو تين أحمر طبيعي 100% طازج ولذيذ. القص والتوصيل في نفس اليوم!",
        price: 100,
        seed_key: "red-fig",
        available: 1,
        category_id: catMap["تين"],
        sort_order: 1
      },
      {
        id: crypto.randomUUID(),
        name: "تين أصفر طازج",
        description: "كيلو تين أصفر طازج طبيعي كالعسل — القص والتوصيل في نفس اليوم!",
        price: 100,
        seed_key: "yellow-fig",
        available: 1,
        category_id: catMap["تين"],
        sort_order: 2
      },
      {
        id: crypto.randomUUID(),
        name: "تمر جلاكسي سكري",
        description: "تمر سكري الطعم عسل، عبوة فاخرة.",
        price: 150,
        seed_key: "dates",
        available: 1,
        category_id: catMap["تمور"],
        sort_order: 3
      },
      {
        id: crypto.randomUUID(),
        name: "تمر صقعي (3 كيلو)",
        description: "تمر صقعي فاخر — عبوة 3 كيلو.",
        price: 150,
        seed_key: "dates",
        available: 1,
        category_id: catMap["تمور"],
        sort_order: 4
      },
      {
        id: crypto.randomUUID(),
        name: "تمر شيشي (3 كيلو)",
        description: "تمر شيشي فاخر — عبوة 3 كيلو.",
        price: 150,
        seed_key: "dates",
        available: 1,
        category_id: catMap["تمور"],
        sort_order: 5
      },
      {
        id: crypto.randomUUID(),
        name: "تمر صفوي (3 كيلو)",
        description: "تمر صفوي فاخر — عبوة 3 كيلو.",
        price: 150,
        seed_key: "dates",
        available: 0,
        category_id: catMap["تمور"],
        sort_order: 6
      },
      {
        id: crypto.randomUUID(),
        name: "توت طويل",
        description: "توت كيلو ب 100 درهم فاخر الطعم عسل.",
        price: 100,
        seed_key: "mulberry",
        available: 0,
        category_id: catMap["فواكه"],
        sort_order: 7
      },
      {
        id: crypto.randomUUID(),
        name: "صبار كيلو",
        description: "صبار طازج كيلو الطعم سكر.",
        price: 100,
        seed_key: "cactus",
        available: 0,
        category_id: catMap["فواكه"],
        sort_order: 8
      },
      {
        id: crypto.randomUUID(),
        name: "فقع علبة 400 جرام",
        description: "فقع درجة أولى — وزن 400 جرام.",
        price: 150,
        seed_key: "truffle",
        available: 1,
        category_id: catMap["فواكه"],
        sort_order: 9
      },
      {
        id: crypto.randomUUID(),
        name: "لوز الحبان البحريني",
        description: "لوز الحبان البحريني الفاخر.",
        price: 200,
        seed_key: "almonds",
        available: 1,
        category_id: catMap["مكسرات"],
        sort_order: 10
      }
    ];

    const insertProduct = db.prepare(`
      INSERT INTO products (id, name, description, price, seed_key, available, category_id, sort_order)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const prod of productsToSeed) {
      insertProduct.run(
        prod.id,
        prod.name,
        prod.description,
        prod.price,
        prod.seed_key,
        prod.available,
        prod.category_id,
        prod.sort_order
      );
    }
    console.log("Database seeded successfully.");
  }

  dbInstance = db;
  return dbInstance;
}
