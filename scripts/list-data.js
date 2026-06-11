#!/usr/bin/env node
import pg from 'pg';
const { Pool } = pg;
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('ERROR: DATABASE_URL is not set.');
  process.exit(1);
}
const pool = new Pool({ connectionString });
(async () => {
  const client = await pool.connect();
  try {
    console.log('Listing categories:');
    const c = await client.query('SELECT id, name, sort_order FROM categories ORDER BY sort_order');
    console.table(c.rows);

    console.log('\nListing products:');
    const p = await client.query('SELECT id, name, price, available, category_id FROM products ORDER BY sort_order');
    console.table(p.rows);
  } catch (err) {
    console.error('Query failed:', err.message || err);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
})();
