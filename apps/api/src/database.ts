import { readFile } from 'node:fs/promises'
import { Pool } from 'pg'

export function createPool(databaseUrl: string) {
  const pool = new Pool({ connectionString: databaseUrl, connectionTimeoutMillis: 5000, statement_timeout: 10000 })
  pool.on('error', () => console.error('PostgreSQL no está disponible; se cerró una conexión inactiva.'))
  return pool
}

export async function migrate(pool: Pool) {
  const sql = await readFile(new URL('../sql/001_catalog.sql', import.meta.url), 'utf8')
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    await client.query('SELECT pg_advisory_xact_lock(hashtext($1))', ['perdiu_migrations'])
    await client.query('CREATE TABLE IF NOT EXISTS schema_migrations (version integer PRIMARY KEY, applied_at timestamptz NOT NULL DEFAULT now())')
    const applied = await client.query('SELECT version FROM schema_migrations WHERE version = $1', [1])
    if (!applied.rowCount) {
      await client.query(sql)
      await client.query('INSERT INTO schema_migrations (version) VALUES ($1)', [1])
    }
    await client.query('COMMIT')
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

export async function seed(pool: Pool) {
  const sql = await readFile(new URL('../sql/seed.sql', import.meta.url), 'utf8')
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    await client.query('SELECT pg_advisory_xact_lock(hashtext($1))', ['perdiu_seed'])
    await client.query(sql)
    await client.query('COMMIT')
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}
