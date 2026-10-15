import { assertLocalDatabase, ConfigurationError, loadEnvironment, readConfig } from '../src/config.js'
import { createPool, migrate, seed } from '../src/database.js'

try {
  loadEnvironment()
  const { databaseUrl } = readConfig(process.env)
  assertLocalDatabase(databaseUrl)
  const command = process.argv[2]
  if (command !== 'migrate' && command !== 'seed') throw new ConfigurationError('Usa migrate o seed.')
  const pool = createPool(databaseUrl)
  try {
    await (command === 'migrate' ? migrate(pool) : seed(pool))
    console.log(command === 'migrate' ? 'Migración aplicada.' : 'Seed ficticio aplicado.')
  } finally {
    await pool.end()
  }
} catch (error) {
  console.error(error instanceof ConfigurationError ? error.message : 'No se pudo preparar la base local. Revisa PostgreSQL y aplica primero la migración.')
  process.exitCode = 1
}
