import { Pool } from 'pg';
import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';

// Simple Postgres pool helper. Exports a query function and a pool getter.
let pool: Pool | null = null;

function getPool(): Pool {
  if (pool) return pool;
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL is not set. Set it to your Postgres connection string.');
  }
  pool = new Pool({ connectionString });
  // Run migrations once after pool is created
  runMigrations().catch((err) => {
    console.error('Error running migrations:', err);
  });
  return pool;
}

export async function query(text: string, params?: any[]) {
  const p = getPool();
  const res = await p.query(text, params);
  return res;
}

export async function runMigrations() {
  const migrationsDir = join(process.cwd(), 'migrations');
  // ensure migrations table exists
  await query(`
    CREATE TABLE IF NOT EXISTS migrations (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `);

  let files: string[] = [];
  try {
    files = await readdir(migrationsDir);
  } catch (e) {
    // no migrations directory
    return;
  }

  files = files.filter((f) => f.endsWith('.sql')).sort();
  for (const file of files) {
    const name = file;
    const { rows } = await query('SELECT COUNT(*)::int as count FROM migrations WHERE name = $1', [name]);
    const applied = Number(rows[0]?.count ?? 0) > 0;
    if (applied) continue;
    const sql = await readFile(join(migrationsDir, file), 'utf8');
    const client = await getPool().connect();
    try {
      await client.query('BEGIN');
      await client.query(sql);
      await client.query('INSERT INTO migrations (name) VALUES ($1)', [name]);
      await client.query('COMMIT');
      console.log('Applied migration', name);
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }
}

export { getPool };
