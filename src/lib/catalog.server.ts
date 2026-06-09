import { getDb } from "./db.server";
import { resolveProductImage } from "@/data/products";
import type { Category, ProductRow, ProductInput } from "./catalog";

export function getCategories(): Category[] {
  const db = getDb();
  const prep = db.prepare("SELECT id, name, sort_order FROM categories ORDER BY sort_order ASC");
  return prep.all() as unknown as Category[];
}

export function getProducts(): ProductRow[] {
  const db = getDb();
  const prep = db.prepare(`
    SELECT p.id, p.name, p.description, p.price, p.image_url, p.seed_key, p.available, p.category_id, p.sort_order, p.min_qty, c.name as category_name
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    ORDER BY p.sort_order ASC
  `);
  const rows = prep.all() as any[];
  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    description: row.description || "",
    price: Number(row.price),
    image_url: row.image_url,
    seed_key: row.seed_key,
    available: Boolean(row.available),
    category_id: row.category_id,
    sort_order: row.sort_order,
    category: row.category_name ?? "",
    image: resolveProductImage({ image_url: row.image_url, seed_key: row.seed_key }),
    min_qty: Number(row.min_qty ?? 1),
  }));
}

export function insertProduct(input: ProductInput): void {
  const db = getDb();
  const prep = db.prepare(`
    INSERT INTO products (id, name, description, price, image_url, seed_key, available, category_id, sort_order, min_qty)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  prep.run(
    crypto.randomUUID(),
    input.name,
    input.description || "",
    input.price,
    input.image_url,
    null,
    input.available ? 1 : 0,
    input.category_id,
    input.sort_order ?? 0,
    input.min_qty ?? 1
  );
}

export function editProduct(id: string, input: Partial<ProductInput>): void {
  const db = getDb();
  const fields: string[] = [];
  const vals: any[] = [];
  
  for (const [key, val] of Object.entries(input)) {
    if (val === undefined) continue;
    fields.push(`${key} = ?`);
    if (key === "available") {
      vals.push(val ? 1 : 0);
    } else {
      vals.push(val);
    }
  }
  
  if (fields.length > 0) {
    vals.push(id);
    const query = `UPDATE products SET ${fields.join(", ")}, updated_at = (datetime('now')) WHERE id = ?`;
    db.prepare(query).run(...vals);
  }
}

export function removeProduct(id: string): void {
  const db = getDb();
  db.prepare("DELETE FROM products WHERE id = ?").run(id);
}

export function insertCategory(name: string, sort_order: number): void {
  const db = getDb();
  db.prepare("INSERT INTO categories (id, name, sort_order) VALUES (?, ?, ?)").run(
    crypto.randomUUID(),
    name,
    sort_order
  );
}

export function editCategory(id: string, fields: { name?: string; sort_order?: number }): void {
  const db = getDb();
  const setParts: string[] = [];
  const vals: any[] = [];
  
  for (const [key, val] of Object.entries(fields)) {
    if (val === undefined) continue;
    setParts.push(`${key} = ?`);
    vals.push(val);
  }
  
  if (setParts.length > 0) {
    vals.push(id);
    const query = `UPDATE categories SET ${setParts.join(", ")}, updated_at = (datetime('now')) WHERE id = ?`;
    db.prepare(query).run(...vals);
  }
}

export function removeCategory(id: string): void {
  const db = getDb();
  db.prepare("DELETE FROM categories WHERE id = ?").run(id);
}
