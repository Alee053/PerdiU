import assert from 'node:assert/strict'
import { test } from 'node:test'
import type { ReportSummary } from '@perdiu/contracts'
import { CatalogPresenter } from '../src/catalog/presenter.js'
import { createReportsClient } from '../src/catalog/client.js'

const summary: ReportSummary = {
  id: '20000000-0000-0000-0000-000000000001', type: 'found', state: 'active', category: 'object',
  title: 'Mochila azul', description: 'Reporte de prueba.', city: 'La Paz', zone: 'Centro',
  incidentDate: '2026-10-10', createdAt: '2026-10-11T12:00:00.000Z',
  author: { id: 'owner-1', displayName: 'Santiago Demo' }, imageUrls: [],
}

test('el catálogo pasa de carga a datos públicos y conserva el identificador persistido', async () => {
  let resolve!: (reports: ReportSummary[]) => void
  const response = new Promise<ReportSummary[]>((done) => { resolve = done })
  const presenter = new CatalogPresenter({ list: async () => response })
  const loading = presenter.load()
  assert.equal(presenter.getSnapshot().status, 'loading')
  resolve([summary])
  await loading
  const state = presenter.getSnapshot()
  assert.equal(state.status, 'ready')
  assert.deepEqual(state.reports.map((report: { id: string; source: string; person: string; status: string }) => ({
    id: report.id, source: report.source, person: report.person, status: report.status,
  })), [{ id: summary.id, source: 'catalog', person: 'Santiago Demo', status: 'Encontrado' }])
  assert.ok(!/phone|position|ownerId/.test(JSON.stringify(state)))
})

test('un fallo muestra error sin fixtures y reintentar puede terminar en un catálogo vacío', async () => {
  let failed = true
  const presenter = new CatalogPresenter({ list: async () => {
    if (failed) throw new Error('private-network-sentinel')
    return []
  } })
  await presenter.load()
  assert.deepEqual(presenter.getSnapshot(), {
    status: 'error', reports: [], message: 'No se pudo cargar el catálogo. Intenta nuevamente.',
  })
  failed = false
  await presenter.load()
  assert.deepEqual(presenter.getSnapshot(), { status: 'ready', reports: [] })
})

test('una respuesta anterior no reemplaza el catálogo del último reintento', async () => {
  let resolveOld!: (reports: ReportSummary[]) => void
  const old = new Promise<ReportSummary[]>((done) => { resolveOld = done })
  let calls = 0
  const presenter = new CatalogPresenter({ list: async () => ++calls === 1 ? old : [summary] })
  const previous = presenter.load()
  await presenter.load()
  resolveOld([])
  await previous
  assert.equal(presenter.getSnapshot().reports.length, 1)
})

test('cancelar impide que una respuesta pendiente publique estado después de desmontar', async () => {
  let resolve!: (reports: ReportSummary[]) => void
  const response = new Promise<ReportSummary[]>((done) => { resolve = done })
  const presenter = new CatalogPresenter({ list: async () => response })
  const pending = presenter.load()
  presenter.cancel()
  resolve([summary])
  await pending
  assert.deepEqual(presenter.getSnapshot(), { status: 'loading', reports: [] })
})

test('el cliente HTTP valida el DTO y nunca conserva campos privados adicionales', async () => {
  const client = createReportsClient('/api', async () => new Response(JSON.stringify([
    { ...summary, phone: 'private-sentinel', author: { ...summary.author, email: 'private-sentinel' } },
  ])))
  assert.deepEqual(await client.list(new AbortController().signal), [summary])
})

test('el cliente HTTP rechaza respuestas erróneas, IDs numéricos, fechas y URLs inválidas', async () => {
  for (const data of [
    {}, [{ ...summary, id: 1 }], [{ ...summary, type: 'resolved' }],
    [{ ...summary, state: 'resolved' }], [{ ...summary, category: 'invalid' }],
    [{ ...summary, incidentDate: '2026-02-31' }], [{ ...summary, createdAt: 'ayer' }],
    [{ ...summary, imageUrls: ['javascript:alert(1)'] }],
  ]) {
    const client = createReportsClient('/api', async () => new Response(JSON.stringify(data)))
    await assert.rejects(client.list(new AbortController().signal), { message: 'La respuesta del catálogo no es válida.' })
  }
  const failed = createReportsClient('/api', async () => new Response('', { status: 503 }))
  await assert.rejects(failed.list(new AbortController().signal), { message: 'No se pudo consultar el catálogo.' })
})
