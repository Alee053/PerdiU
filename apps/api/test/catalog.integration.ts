import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { test } from 'node:test'
import { createApplication } from '../src/app.js'
import { assertLocalDatabase } from '../src/config.js'
import { createPool, migrate, seed } from '../src/database.js'
import { PostgresReportRepository } from '../src/reports/postgres-repository.js'

test('catálogo HTTP y repositorio conservan datos reales tras reiniciar, sin información privada', async () => {
  assert.equal(process.env.PERDIU_TEST_CONTAINER, '1', 'Ejecuta pnpm test:integration para usar PostgreSQL aislado.')
  const databaseUrl = process.env.TEST_DATABASE_URL
  assert.ok(databaseUrl, 'Falta configuración de PostgreSQL de pruebas.')
  assertLocalDatabase(databaseUrl)
  const pool = createPool(databaseUrl)
  let app: Awaited<ReturnType<typeof createApplication>> | undefined
  try {
    await migrate(pool)
    await migrate(pool)
    assert.deepEqual(await new PostgresReportRepository(pool).list(), [])
    await seed(pool)
    await seed(pool)
    const records = await new PostgresReportRepository(pool).list()
    assert.deepEqual(records.map(({ id }) => id), [
      '20000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000002',
    ])
    await pool.query('UPDATE reports SET created_at = $1 WHERE id = $2', ['2026-01-01T12:00:00Z', records[0]!.id])
    await seed(pool)

    const start = async () => {
      app = await createApplication(databaseUrl)
      await app.listen(0, '127.0.0.1')
      return `${await app.getUrl()}/reports`
    }
    let endpoint = await start()
    const response = await fetch(endpoint)
    assert.equal(response.status, 200)
    const catalog = await response.json()
    assert.deepEqual(catalog.map((report: { id: string }) => report.id), [records[1]!.id, records[0]!.id])
    assert.deepEqual(Object.keys(catalog[0]).sort(), ['author', 'category', 'city', 'createdAt', 'description', 'id', 'imageUrls', 'incidentDate', 'state', 'title', 'type', 'zone'])
    assert.deepEqual(Object.keys(catalog[1].author).sort(), ['displayName', 'id'])
    assert.deepEqual(catalog[1].imageUrls, ['/images/object.svg'])
    assert.ok(!/phone|email|token|storageKey|storage_key|59170000001|fictional@example\.invalid|fixture-private-storage-key/.test(JSON.stringify(catalog)))
    await app!.close()
    app = undefined
    endpoint = await start()
    assert.deepEqual(await (await fetch(endpoint)).json(), catalog)

    await pool.query('ALTER TABLE reports RENAME TO unavailable_reports')
    try {
      const failed = await fetch(endpoint)
      assert.equal(failed.status, 503)
      assert.equal((await failed.json()).message, 'No se pudo cargar el catálogo. Intenta nuevamente.')
    } finally {
      await pool.query('ALTER TABLE unavailable_reports RENAME TO reports')
    }
    await pool.query('UPDATE reports SET state = $1', ['resolved'])
    assert.deepEqual(await (await fetch(endpoint)).json(), [])
    await pool.query('UPDATE reports SET state = $1 WHERE id = ANY($2::uuid[])', ['active', records.map(({ id }) => id)])
    console.log('PostgreSQL: migración/seed repetibles, activos, orden, privacidad, vacío, error y reinicio verificados.')
  } finally {
    await app?.close()
    await pool.end()
  }
})

test('el proceso falla con diagnóstico seguro ante configuración ausente o conexión inválida', async () => {
  for (const databaseUrl of ['', 'postgresql://perdiu:startup-secret-sentinel@127.0.0.1:1/perdiu_test']) {
    const result = await new Promise<{ code: number | null; output: string }>((resolve, reject) => {
      const child = spawn(process.execPath, ['dist/main.js'], { env: { ...process.env, DATABASE_URL: databaseUrl }, stdio: ['ignore', 'pipe', 'pipe'] })
      let output = ''
      child.stdout.on('data', (chunk) => { output += chunk })
      child.stderr.on('data', (chunk) => { output += chunk })
      child.on('error', reject)
      child.on('exit', (code) => resolve({ code, output }))
    })
    assert.equal(result.code, 1)
    assert.ok(!result.output.includes('startup-secret-sentinel'))
    assert.ok(!result.output.includes('postgresql://'))
    assert.match(result.output, /DATABASE_URL|No se pudo iniciar la API/)
  }
})
