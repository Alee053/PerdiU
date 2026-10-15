import assert from 'node:assert/strict'
import { test } from 'node:test'
import { assertLocalDatabase, readConfig } from '../src/config.js'

test('la configuración ausente falla con diagnóstico seguro', () => {
  assert.throws(() => readConfig({}), { message: 'DATABASE_URL es obligatoria.' })
})

test('una URL inválida falla sin reproducir su contenido', () => {
  for (const databaseUrl of ['private-config-sentinel', 'https://example.invalid/db', 'postgresql://localhost']) {
    assert.throws(() => readConfig({ DATABASE_URL: databaseUrl }), { message: 'DATABASE_URL debe ser una URL PostgreSQL válida con usuario y base de datos.' })
  }
})

test('puerto inválido falla y una configuración válida conserva opciones explícitas', () => {
  const databaseUrl = 'postgresql://test-user@127.0.0.1:5433/perdiu_test'
  assert.throws(() => readConfig({ DATABASE_URL: databaseUrl, PORT: 'NaN' }), { message: 'PORT debe ser un entero entre 1 y 65535.' })
  assert.deepEqual(readConfig({ DATABASE_URL: databaseUrl, PORT: '3001' }), {
    databaseUrl, port: 3001, host: '127.0.0.1',
  })
})

test('las operaciones de BD rechazan parámetros que pueden sustituir el destino local', () => {
  assert.doesNotThrow(() => assertLocalDatabase('postgresql://test-user@127.0.0.1/perdiu_dev'))
  for (const url of [
    'postgresql://test-user@remote.example.invalid/perdiu_dev',
    'postgresql://test-user@127.0.0.1/shared',
    'postgresql://test-user@127.0.0.1/perdiu_dev?host=remote.example.invalid',
    'postgresql://test-user@127.0.0.1/perdiu_dev?database=shared',
  ]) assert.throws(() => assertLocalDatabase(url), { message: 'Esta operación requiere una base PerdiU local terminada en dev o test, fuera de producción.' })
})
