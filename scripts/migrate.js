#!/usr/bin/env node
import { readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import pg from 'pg';

const { Pool } = pg;
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('ERROR: DATABASE_URL environment variable is not set.');
  process.exit(1);
}

const pool = new Pool({ connectionString });

async function runMigrations() {
  const migrationsDir = join(process.cwd(), 'migrations');

  // ensure migrations table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS migrations (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `);

  let files = [];
  try {
    files = await readdir(migrationsDir);
  } catch (e) {
    console.log('No migrations directory found at', migrationsDir);
    return;
  }

  files = files.filter((f) => f.endsWith('.sql')).sort();

  for (const file of files) {
    const { rows } = await pool.query('SELECT COUNT(*)::int as count FROM migrations WHERE name = $1', [file]);
    const applied = Number(rows[0]?.count ?? 0) > 0;
    if (applied) {
      console.log('Skipping already applied:', file);
      continue;
    }

    const sql = await readFile(join(migrationsDir, file), 'utf8');
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query(sql);
      await client.query('INSERT INTO migrations (name) VALUES ($1)', [file]);
      await client.query('COMMIT');
      console.log('Applied migration:', file);
    } catch (err) {
      await client.query('ROLLBACK');
      console.error('Failed to apply migration', file, err);
      process.exit(1);
    } finally {
      client.release();
    }
  }

  console.log('Migrations complete.');
}

runMigrations()
  .catch((err) => {
    console.error('Migration process failed:', err);
    process.exit(1);
  })
  .finally(() => pool.end());
