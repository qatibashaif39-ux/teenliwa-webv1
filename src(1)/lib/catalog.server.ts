import { query } from "./db.server";
import { resolveProductImage } from "@/data/products";
import type { Category, ProductRow, ProductInput } from "./catalog";

export async function getCategories(): Promise<Category[]> {
  const res = await query('SELECT id, name, sort_order FROM categories ORDER BY sort_order ASC');
  return res.rows as Category[];
}

export async function getProducts(): Promise<ProductRow[]> {
  const sql = `
    SELECT p.id, p.name, p.description, p.price, p.image_url, p.seed_key, p.available, p.category_id, p.sort_order, p.min_qty, c.name as category_name
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    ORDER BY p.sort_order ASC
  `;
  const res = await query(sql);
  const rows = res.rows as any[];
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

export async function insertProduct(input: ProductInput): Promise<void> {
  const sql = `
    INSERT INTO products (id, name, description, price, image_url, seed_key, available, category_id, sort_order, min_qty)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
  `;
  await query(sql, [
    crypto.randomUUID(),
    input.name,
    input.description || '',
    input.price,
    input.image_url,
    null,
    input.available ? true : false,
    input.category_id,
    input.sort_order ?? 0,
    input.min_qty ?? 1,
  ]);
}

export async function editProduct(id: string, input: Partial<ProductInput>): Promise<void> {
  const fields: string[] = [];
  const vals: any[] = [];
  let idx = 1;
  for (const [key, val] of Object.entries(input)) {
    if (val === undefined) continue;
    fields.push(`${key} = $${idx}`);
    if (key === 'available') vals.push(val ? true : false);
    else vals.push(val);
    idx++;
  }
  if (fields.length > 0) {
    fields.push(`updated_at = now()`);
    const sql = `UPDATE products SET ${fields.join(', ')} WHERE id = $${idx}`;
    vals.push(id);
    await query(sql, vals);
  }
}

export async function removeProduct(id: string): Promise<void> {
  await query('DELETE FROM products WHERE id = $1', [id]);
}

export async function insertCategory(name: string, sort_order: number): Promise<void> {
  await query('INSERT INTO categories (id, name, sort_order) VALUES ($1, $2, $3)', [crypto.randomUUID(), name, sort_order]);
}

export async function editCategory(id: string, fields: { name?: string; sort_order?: number }): Promise<void> {
  const setParts: string[] = [];
  const vals: any[] = [];
  let idx = 1;
  for (const [key, val] of Object.entries(fields)) {
    if (val === undefined) continue;
    setParts.push(`${key} = $${idx}`);
    vals.push(val);
    idx++;
  }
  if (setParts.length > 0) {
    setParts.push('updated_at = now()');
    const sql = `UPDATE categories SET ${setParts.join(', ')} WHERE id = $${idx}`;
    vals.push(id);
    await query(sql, vals);
  }
}

export async function removeCategory(id: string): Promise<void> {
  await query('DELETE FROM categories WHERE id = $1', [id]);
}
